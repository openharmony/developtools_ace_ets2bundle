/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import ts, { CatchClause, Declaration, Expression, VariableDeclarationList } from 'typescript';
import { ParamChecker, IntentLinkInfoChecker } from './intentType';
import { COMPONENT_USER_INTENTS_DECORATOR } from '../pre_define';
import {
  ENTRYPATH_ERROR,
  IntentLogger,
  DECORATOR_STATEMENT_ERROR,
  DISALLOWED_PARAM_ERROR,
  DYNAMIC_PARAM_ERROR,
  REQUIRED_PARAM_DISMISS_ERROR,
  INCORRECT_PARAM_TYPE_ERROR, 
  UNSUPPORTED_PARSE_ERROR
} from './intentLogger';
import path from 'path';
import { getNormalizedOhmUrlByFilepath } from '../ark_utils';
import { projectConfig } from '../../main';
import { ProjectCollections } from 'arkguard';
import fs from 'fs';

type StaticValue = string | number | boolean | null | undefined | StaticValue[] | { [key: string]: StaticValue };

class ParseIntent {
  constructor() {
    this.intentData = [];
    this.currentFilePath = '';
  }

  checker: ts.TypeChecker;
  intentData: any[];
  currentFilePath: string;

  handleIntent(node: ts.ClassDeclaration, checker: ts.TypeChecker, filepath: string, metaInfo: Object = {}): void {
    this.checker = checker;
    this.currentFilePath = filepath;
    if (!filepath.endsWith('.ets')) {
      throw Error(`${ENTRYPATH_ERROR.toString()}, invalidDecoratorPath:${this.currentFilePath}`);
    }
    const pkgParams: object = {
      pkgName: metaInfo.pkgName,
      pkgPath: metaInfo.pkgPath
    };
    const Logger: IntentLogger = IntentLogger.getInstance();
    const recordName: string = getNormalizedOhmUrlByFilepath(filepath, projectConfig, Logger, pkgParams, null);
    node.modifiers.forEach(decorator => {
      const originalDecortor: string = decorator.getText().replace(/\(.*\)$/, '').trim();
      if (originalDecortor === '@InsightIntentLinkDecorator') {
        const expr: ts.Expression = decorator.expression;
        if (ts.isCallExpression(expr)) {
          const args: ts.NodeArray<ts.Expression> = expr.arguments;
          const intentObj: object = {
            'decoratorFile': `@normalized:${recordName}`,
            'decoratorType': 'InsightIntentLinkDecorator',
            'decoratorClass': node.name.text
          };
          this.analyzeDecoratorArgs(args, intentObj, IntentLinkInfoChecker);
          this.createObfuscation(node);
        } else {
          throw Error(`${DECORATOR_STATEMENT_ERROR.toString()}, invalidDecoratorPath:${this.currentFilePath}`);
        }
      }
    });
  }

  removeDecorator(node: ts.ClassDeclaration): ts.ClassDeclaration {
    const filteredModifiers: boolean = node.modifiers.filter(decorator => {
      const originalDecortor: string = decorator.getText().replace(/\(.*\)$/, '').trim();
      return originalDecortor !== COMPONENT_USER_INTENTS_DECORATOR;
    });
    return ts.factory.updateClassDeclaration(
      node,
      filteredModifiers,
      node.name,
      node.typeParameters,
      node.heritageClauses,
      node.members
    );
  }

  isSymbolConstant(symbol: ts.Symbol): boolean {
    const declaration: Declaration = symbol.valueDeclaration;

    if (!this.isConstVariable(declaration)) {
      return false;
    }
    const varDecl: ts.VariableDeclaration = declaration as ts.VariableDeclaration;
    const initializer: Expression = varDecl.initializer;
    return initializer ? this.isConstantExpression(initializer) : false;
  }

  isConstVariable(node: ts.Node | undefined): node is ts.VariableDeclaration {
    if (!node || !ts.isVariableDeclaration(node)) {
      return false;
    }

    const varList: VariableDeclarationList | CatchClause = node.parent;
    return ts.isVariableDeclarationList(varList) &&
      (varList.flags & ts.NodeFlags.Const) !== 0;
  }

  isConstantExpression(node: ts.Node): boolean {
    let flag: boolean = true;
    if (ts.isLiteralExpression(node) || node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword) {
      flag = true;
    }

    if (ts.isIdentifier(node)) {
      const symbol: Symbol | undefined = this.checker.getSymbolAtLocation(node);
      flag = symbol ? this.isSymbolConstant(symbol) : false;
    }

    if (ts.isArrayLiteralExpression(node)) {
      flag = node.elements.every(element => this.isConstantExpression(element));
    }

    if (ts.isObjectLiteralExpression(node)) {
      flag = node.properties.every(property => {
        if (ts.isPropertyAssignment(property)) {
          const nameIsConst: boolean = !ts.isComputedPropertyName(property.name);
          return nameIsConst && this.isConstantExpression(property.initializer);
        }

        return false;
      });
    }

    if (ts.isCallExpression(node) && node.expression.getText() === '$r') {
      flag = node.arguments.every(node => {
        return ts.isStringLiteral(node);
      });
    }
    if (!flag) {
      throw Error(`${DYNAMIC_PARAM_ERROR}, invalidDecoratorPath:${this.currentFilePath}`);
    }
    return flag;
  }

  validateRequiredIntentLinkInfo<T>(
    node: ts.ObjectLiteralExpression,
    paramCheckFields: ParamChecker<T>
  ): void {
    const existingParams: Set<keyof T> = new Set<keyof T>();
    const requiredFields: (keyof T)[] = paramCheckFields.requiredFields;
    const nestedCheckers: Map<string, ParamChecker<any>> = paramCheckFields.nestedCheckers;
    const allowedFields: Set<keyof T> = paramCheckFields.allowFields;
    const paramValidators: Record<keyof T, (v: ts.Expression) => boolean> = paramCheckFields.paramValidators;
    for (const prop of node.properties) {
      this.validateFields(prop, allowedFields, paramValidators);
      existingParams.add(prop.name.text);
      if (nestedCheckers && nestedCheckers.has(prop.name.text)) {
        this.validateSelfParamFields(node, nestedCheckers);
      }
    }
    const missingFields: (keyof T)[] = requiredFields.filter(f => !existingParams.has(f));
    if (missingFields.length > 0) {
      throw Error(`${REQUIRED_PARAM_DISMISS_ERROR.toString()}, cause: params: ${missingFields.join(', ')}, invalidDecoratorPath:${this.currentFilePath}`);
    }
  }

  validateSelfParamFields(prop: ts.Node, nestedCheckers: Map<string, ParamChecker<any>>): void {
    const checker: ParamChecker<any> = nestedCheckers.get(prop.name.text);
    if (ts.isArrayLiteralExpression(prop.initializer)) {
      prop.initializer.elements.every(elem => {
        if (ts.isIdentifier(elem)) {
          const symbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(elem);
          const declaration: ts.Declaration = symbol?.valueDeclaration;
          this.validateRequiredIntentLinkInfo<typeof checker>(declaration.initializer, checker);
        } else {
          this.validateRequiredIntentLinkInfo<typeof checker>(elem.initializer, checker);
        }
      });
    } else if (ts.isIdentifier(prop)) {
      const symbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(prop);
      const declaration: ts.Declaration = symbol?.valueDeclaration;
      this.validateRequiredIntentLinkInfo<typeof checker>(declaration.initializer, checker);
    } else {
      this.validateRequiredIntentLinkInfo<typeof checker>(prop.initializer, checker);
    }
  }

  validateFields<T>(
    prop: ts.Node, allowedFields: Set<keyof T>, paramValidators: Record<keyof T, (v: ts.Expression) => boolean>
  ): void {
    const paramName: keyof T = prop.name.text;
    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
      if (!allowedFields.has(paramName)) {
        throw Error(`${DISALLOWED_PARAM_ERROR}, cause: undeclared param: '${paramName.toString()}', invalidDecoratorPath:${this.currentFilePath}`);
      }
      const validator: Function = paramValidators[paramName];
      if (ts.isIdentifier(prop.initializer)) {
        const symbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(prop.initializer);
        const declaration: ts.Declaration = symbol?.valueDeclaration;
        if (validator && !validator(declaration.initializer)) {
          throw Error(`${INCORRECT_PARAM_TYPE_ERROR.toString()}, cause: param: '${paramName.toString()}', invalidDecoratorPath:${this.currentFilePath}`);
        }
      } else {
        if (validator && !validator(prop.initializer)) {
          throw Error(`${INCORRECT_PARAM_TYPE_ERROR.toString()}, cause: param: '${paramName.toString()}', invalidDecoratorPath:${this.currentFilePath}`);
        }
      }
    }
  }

  analyzeDecoratorArgs(args: ts.NodeArray<ts.Expression>, intentObj: object, paramChecker: ParamChecker<any>): void {
    args.forEach(arg => {
      if (ts.isIdentifier(arg)) {
        const symbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(arg);
        const declaration: ts.Declaration = symbol?.valueDeclaration;
        this.validateRequiredIntentLinkInfo(declaration.initializer, paramChecker);
      } else {
        this.validateRequiredIntentLinkInfo(arg, paramChecker);
      }
      const res: StaticValue = this.parseStaticObject(arg);
      Object.assign(intentObj, res);
      this.collectSchemaInfo(intentObj);
      this.intentData.push(intentObj);
    });
  }

  collectSchemaInfo(intentObj: object): void {
    if (intentObj.schema) {
      const schemaPath = path.join(
        __dirname + '\\schema',
        `${intentObj.schema}_${intentObj.intentVersion}.json`
      );
      if (fs.existsSync(schemaPath)) {
        if (intentObj.parameters) {
          throw Error(`${DISALLOWED_PARAM_ERROR.toString()}, the standard user intents does not allow passing the parameter 'parameter', invalidDecoratorPath:${this.currentFilePath}`);
        }
        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
        intentObj.parameters = JSON.parse(schemaContent);
      }
    }
  }

  parseStaticObject(node: ts.Node): StaticValue | undefined {
    if (ts.isStringLiteral(node)) {
      return node.text;
    }
    if (ts.isNumericLiteral(node)) {
      return parseFloat(node.text);
    }
    if (node.kind === ts.SyntaxKind.TrueKeyword) {
      return true;
    }
    if (node.kind === ts.SyntaxKind.FalseKeyword) {
      return false;
    }
    if (node.kind === ts.SyntaxKind.NullKeyword) {
      return null;
    }
    if (node.kind === ts.SyntaxKind.UndefinedKeyword) {
      return undefined;
    }

    if (ts.isIdentifier(node)) {
      const isStatic: boolean = this.isConstantExpression(node);
      if (isStatic) {
        const symbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(node);
        const declaration: ts.Declaration = symbol?.valueDeclaration;
        return this.parseStaticObject(declaration.initializer);
      }
    }

    if (ts.isArrayLiteralExpression(node)) {
      return this.processArrayElements(node.elements);
    }

    if (ts.isObjectLiteralExpression(node)) {
      return this.processObjectElements(node);
    }

    if (ts.isCallExpression(node) && node.expression.getText() === '$r') {
      const isStatic: boolean = this.isConstantExpression(node);
      if (!isStatic) {
        return undefined;
      }
      return node.getText();
    }
    throw Error(`${UNSUPPORTED_PARSE_ERROR.toString()}, param: '${node.text}', invalidDecoratorPath:${this.currentFilePath}`);
  }

  createObfuscation(classNode: ts.Node): void {
    ProjectCollections.projectWhiteListManager?.fileWhiteListInfo.fileKeepInfo.arkUIKeepInfo.globalNames.add(classNode.symbol.name);
    classNode.members.forEach(member => {
      if (ts.isPropertyDeclaration(member) && member.name) {
        const propName = member.name.getText();
        ProjectCollections.projectWhiteListManager?.fileWhiteListInfo.fileKeepInfo.arkUIKeepInfo.globalNames.add(propName);
      }
      if (ts.isFunctionDeclaration(member) || ts.isMethodDeclaration(member) ||
        ts.isGetAccessor(member) || ts.isSetAccessor(member)) {
        const methodName = member.name.getText();
        ProjectCollections.projectWhiteListManager?.fileWhiteListInfo.fileKeepInfo.arkUIKeepInfo.propertyNames.add(methodName);
      }
    });
  }
  processObjectElements(elements: ts.ObjectLiteralExpression): { [key: string]: StaticValue } {
    const obj: { [key: string]: StaticValue } = {};
    for (const prop of elements.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key: string = this.parsePropertyKey(prop.name);
        const value: StaticValue = this.parseStaticObject(prop.initializer);
        if (key !== undefined && value !== undefined) {
          obj[key] = value;
        }
      }

      if (ts.isSpreadAssignment(prop)) {
        const spreadObj: StaticValue = this.parseStaticObject(prop.expression);
        if (typeof spreadObj === 'object' && spreadObj !== null) {
          Object.assign(obj, spreadObj);
        }
      }
    }
    return obj;
  }

  processArrayElements(elements: readonly ts.Node[]): StaticValue[] {
    const parsedElements: StaticValue[] = [];

    elements.forEach((element) => {
      if (ts.isSpreadElement(element)) {
        const spreadValue: StaticValue = this.parseStaticObject(element.expression);
        if (Array.isArray(spreadValue)) {
          parsedElements.push(...spreadValue);
        }
      } else {
        const value: StaticValue = this.parseStaticObject(element);
        parsedElements.push(value);
      }
    });

    return parsedElements;
  }

  parsePropertyKey(node: ts.PropertyName): string | undefined {
    if (ts.isLiteralExpression(node)) {
      return node.text;
    }

    if (ts.isIdentifier(node)) {
      return node.text;
    }

    return undefined;
  }

  writeUserIntentJsonFile(): void {
    if (this.intentData.length > 0) {
      if (!projectConfig.aceModuleJsonPath) {
        return;
      }
      const cacheSourceMapPath: string = path.join(projectConfig.aceProfilePath, 'user_intents_library.json');
      if (!fs.existsSync(projectConfig.aceProfilePath)) {
        fs.mkdirSync(projectConfig.aceProfilePath, {recursive: true});
      }
      fs.writeFileSync(cacheSourceMapPath, JSON.stringify({'insightIntents': this.intentData}, null, 2), 'utf-8');
      const normalizedPath: string = path.normalize(projectConfig.aceModuleJsonPath);
      const fullPath: string = path.join(path.dirname(normalizedPath), 'module.json');
      if (fs.existsSync(fullPath)) {
        const rawData: string = fs.readFileSync(fullPath, 'utf8');
        const jsonData: any = JSON.parse(rawData);
        jsonData.hasIntent = true;
        const updatedJson: string = JSON.stringify(jsonData, null, 2);
        fs.writeFileSync(fullPath, updatedJson, 'utf8');
      }
    }
  }

  clear(): void {
    this.intentData = [];
    this.currentFilePath = '';
    IntentLinkInfoChecker.clean();
  }
}

export default new ParseIntent();
