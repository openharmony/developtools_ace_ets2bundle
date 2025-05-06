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

import ts, { CatchClause, Declaration, Expression, TypeChecker, VariableDeclarationList } from 'typescript';
import { intentEntryInfoChecker, IntentLinkInfoChecker, ParamChecker } from './intentType';
import {
  DECORATOR_STATEMENT_ERROR,
  DISALLOWED_PARAM_ERROR,
  DYNAMIC_PARAM_ERROR,
  ENTRYPATH_ERROR,
  INCORRECT_PARAM_TYPE_ERROR,
  IntentLogger,
  INTERNAL_ERROR,
  REQUIRED_PARAM_DISMISS_ERROR,
  SCHEMA_VALIDATE_REQUIRED_ERROR,
  UNSUPPORTED_PARSE_ERROR,
  SCHEMA_VALIDATE_TYPE_ERROR,
  SCHEMA_VALIDATE_ANY_OF_ERROR,
  SCHEMA_VALIDATE_ONE_OF_ERROR,
  SCHEMA_ROOT_TYPE_MISMATCH_ERROR,
  INVALID_BASE_CLASS_ERROR,
  PARAM_CIRCULAR_REFERENCE_ERROR
} from './intentLogger';
import path from 'path';
import { getNormalizedOhmUrlByFilepath } from '../ark_utils';
import { projectConfig, globalModulePaths } from '../../main';
import fs from 'fs';
import { ProjectCollections } from 'arkguard';
import { COMPONENT_USER_INTENTS_DECORATOR, COMPONENT_USER_INTENTS_DECORATOR_ENTRY } from '../pre_define';
import { hasDecorator } from '../utils';

type StaticValue = string | number | boolean | null | undefined | StaticValue[] | { [key: string]: StaticValue };

class ParseIntent {
  constructor() {
    this.intentData = [];
    this.currentFilePath = '';
    this.heritageClassSet = new Set<string>();
    this.heritageClassSet.add('IntentEntity_sdk');
  }

  checker: ts.TypeChecker;
  intentData: any[];
  currentFilePath: string;
  heritageClassSet: Set<string>;

  detectInsightIntent(node: ts.ClassDeclaration, metaInfo: object, filePath: string): ts.Node {
    if (hasDecorator(node, COMPONENT_USER_INTENTS_DECORATOR) || hasDecorator(node, COMPONENT_USER_INTENTS_DECORATOR_ENTRY
    )) {
      const checker: TypeChecker = metaInfo.tsProgram.getTypeChecker();
      this.handleIntent(node, checker, filePath, metaInfo);
      node = this.removeDecorator(node, [COMPONENT_USER_INTENTS_DECORATOR, COMPONENT_USER_INTENTS_DECORATOR_ENTRY]);
      return node;
    }
    return node;
  }

  handleIntent(node: ts.ClassDeclaration, checker: ts.TypeChecker, filepath: string, metaInfo: Object = {}): void {
    this.checker = checker;
    this.currentFilePath = filepath;
    if (!filepath.endsWith('.ets')) {
      throw Error(`${ENTRYPATH_ERROR.toString()}, invalidDecoratorPath: ${this.currentFilePath}`);
    }
    const pkgParams: object = {
      pkgName: metaInfo.pkgName,
      pkgPath: metaInfo.pkgPath
    };
    node.modifiers.forEach(decorator => {
      const expr: ts.Expression = decorator.expression;
      if (!expr || !ts.isCallExpression(expr)) {
        return;
      }
      const symbol: ts.Symbol = checker.getTypeAtLocation(decorator.expression.expression)?.getSymbol();
      const declarations: ts.Declaration[] | undefined = symbol?.getDeclarations();
      if (!declarations || declarations.length === 0) {
        return;
      }
      const decoratorSourceFile: string = declarations[0].getSourceFile().fileName;
      const isGlobalPath: boolean = globalModulePaths?.some(path => decoratorSourceFile.startsWith(path));
      if (!isGlobalPath) {
        return;
      }
      const Logger: IntentLogger = IntentLogger.getInstance();
      const recordName: string = getNormalizedOhmUrlByFilepath(filepath, projectConfig, Logger, pkgParams, null);
      const intentObj: object = {
        'decoratorFile': `@normalized:${recordName}`,
        'decoratorClass': node.name.text
      };
      const originalDecorator: string = decorator.getText().replace(/\(.*\)$/, '').trim();
      if (originalDecorator === COMPONENT_USER_INTENTS_DECORATOR) {
        this.handleLinkDecorator(intentObj, node, decorator);
      } else if (originalDecorator === COMPONENT_USER_INTENTS_DECORATOR_ENTRY) {
        this.handleEntryDecorator(intentObj, node, decorator, pkgParams);
      }
    });
  }

  handleLinkDecorator(intentObj: object, node: ts.Node, decorator: ts.Decorator): void {
    const expr: ts.Expression = decorator.expression;
    if (ts.isCallExpression(expr)) {
      const args: ts.NodeArray<ts.Expression> = expr.arguments;
      this.analyzeDecoratorArgs(args, intentObj, IntentLinkInfoChecker);
      Object.assign(intentObj, {
        'bundleName': projectConfig.bundleName,
        'moduleName': projectConfig.moduleName,
        'decoratorType': COMPONENT_USER_INTENTS_DECORATOR
      });
      this.createObfuscation(node);
      this.intentData.push(intentObj);
    } else {
      throw Error(`${DECORATOR_STATEMENT_ERROR.toString()}, invalidDecoratorPath: ${this.currentFilePath}`);
    }
  }

  handleEntryDecorator(intentObj: object, node: ts.Node, decorator: ts.Decorator, pkgParams: object): void {
    const expr: ts.Expression = decorator.expression;
    if (ts.isCallExpression(expr)) {
      const args: ts.NodeArray<ts.Expression> = expr.arguments;
      Object.assign(intentObj, {
        'bundleName': projectConfig.bundleName,
        'moduleName': projectConfig.moduleName,
        'decoratorType': COMPONENT_USER_INTENTS_DECORATOR_ENTRY
      });
      this.analyzeDecoratorArgs(args, intentObj, intentEntryInfoChecker);
      const properties: Record<string, string> = this.parseClassNode(node);
      this.schemaValidateSync(properties, intentObj);
      this.analyzeBaseClass(node, pkgParams, intentObj);
      this.createObfuscation(node);
      this.intentData.push(intentObj);
    } else {
      throw Error(`${DECORATOR_STATEMENT_ERROR.toString()}, invalidDecoratorPath: ${this.currentFilePath}`);
    }
  }

  analyzeBaseClass(node: ts.ClassDeclaration, pkgParams: object, intentObj: object): void {
    const interfaces: ts.ExpressionWithTypeArguments[] = [];
    node.heritageClauses?.forEach(clause => {
      if (clause.token === ts.SyntaxKind.ImplementsKeyword || clause.token === ts.SyntaxKind.ExtendsKeyword) {
        interfaces.push(...clause.types);
      }
    });
    if (interfaces.length > 0) {
      const parentNode: ts.ExpressionWithTypeArguments = interfaces[0];
      if (parentNode) {
        this.analyzeClassHeritage(parentNode, node, pkgParams, intentObj);
      }
    }
  }

  analyzeClassHeritage(
    parentNode: ts.ExpressionWithTypeArguments, node: ts.ClassDeclaration, pkgParams: object, intentObj: object
  ): void {
    const parentSymbol: ts.Symbol = this.checker.getTypeAtLocation(parentNode).getSymbol();
    const parentClassName: string = parentSymbol.getName();
    const parentFilePath: string = parentSymbol.getDeclarations()?.[0].getSourceFile().fileName;
    const logger: IntentLogger = IntentLogger.getInstance();
    const parentRecordName: string = getNormalizedOhmUrlByFilepath(parentFilePath, projectConfig, logger, pkgParams, null);
    const baseClassName: string = this.checker.getTypeAtLocation(node).getSymbol().getName();
    const baseFilePath: string = node.getSourceFile().fileName;
    const baseRecordName: string = getNormalizedOhmUrlByFilepath(baseFilePath, projectConfig, logger, pkgParams, null);
    const isGlobalPath: boolean = globalModulePaths?.some(path => parentFilePath.startsWith(path));
    const recordPath: string = isGlobalPath ? `sdk` : `@normalized:${parentRecordName}`;
    if (isGlobalPath) {
      if (parentClassName !== 'IntentEntity') {
        throw Error(`${INVALID_BASE_CLASS_ERROR.toString()}, invalidDecoratorPath: ${this.currentFilePath}`);
      }
    }
    this.heritageClassSet.add(baseClassName + '_' + `@normalized:${baseRecordName}`);
    this.collectClassInheritanceInfo(parentNode, intentObj, parentClassName, recordPath);
  }

  collectClassInheritanceInfo(
    parentNode: ts.ExpressionWithTypeArguments, intentObj: object, parentClassName: string, recordPath: string
  ): void {
    const ClassInheritanceInfo: object = {
      'parentClassName': parentClassName,
      'definitionFilePath': recordPath,
      'generics': []
    };
    if (parentNode.typeArguments?.length > 0) {
      parentNode.typeArguments.forEach((arg): void => {
        this.getInheritanceInfoByTypeNode(arg, ClassInheritanceInfo);
      });
    }
    Object.assign(intentObj, {
      'ClassInheritanceInfo': ClassInheritanceInfo
    });
  }

  getInheritanceInfoByTypeNode(arg: ts.TypeNode, ClassInheritanceInfo: object): void {
    const generic = {};
    const genericType: ts.Type = this.checker.getTypeAtLocation(arg);
    let genericName: string;
    let genericSource: string | undefined;
    const genericSymbol: ts.Symbol | undefined = genericType.getSymbol();
    if (genericSymbol) {
      genericName = genericSymbol.getName();
      genericSource = genericSymbol.declarations?.[0]?.getSourceFile().fileName;
    } else {
      genericName = this.checker.typeToString(genericType);
      const parentTypeNode: ts.Node = arg.parent;
      if (ts.isTypeReferenceNode(parentTypeNode)) {
        const contextualType: ts.Type = this.checker.getContextualType(parentTypeNode);
        const symbol: ts.Type = contextualType?.getSymbol();
        genericSource = symbol?.declarations?.[0]?.getSourceFile().fileName;
      }
      if (!genericSource && this.isPrimitiveType(genericType)) {
        genericSource = 'lib.es5.d.ts';
      }
    }
    Object.assign(generic,
      {
        'typeName': genericName,
        'definitionFilePath': genericSource
      });
    ClassInheritanceInfo.generics.push(generic);
  }

  isPrimitiveType(type: ts.Type): boolean {
    return (
      (type.flags & ts.TypeFlags.StringLike) ||
      (type.flags & ts.TypeFlags.NumberLike) ||
      (type.flags & ts.TypeFlags.BooleanLike)
    ) !== 0;
  }

  parseClassNode(node: ts.ClassDeclaration): Record<string, string> {
    const type: ts.Type = this.checker.getTypeAtLocation(node);
    const mergedObject: Record<string, string> = {};
    this.checker.getPropertiesOfType(type)
      .filter(prop => {
        const declarations: Declaration[] | undefined = prop.getDeclarations();
        return declarations?.some(decl =>
          ts.isPropertyDeclaration(decl)
        );
      }).forEach(prop => {
        const objItem: Record<string, string> = this.processProperty(prop);
        Object.assign(mergedObject, objItem);
      });
    return mergedObject;
  }

  processProperty(prop: ts.Symbol): Record<string, string> {
    const propType: ts.Type = this.checker.getTypeOfSymbol(prop);
    const {category} = this.getTypeCategory(propType);
    const obj: Record<string, string> = {};
    const propName: string = prop.getName();
    if (category === 'object') {
      obj[propName] = 'object';
    } else if (category === 'array') {
      obj[propName] = 'array';
    } else {
      obj[propName] = this.checker.typeToString(propType);
    }
    return obj;
  }

  getTypeCategory(type: ts.Type): { category: 'array' | 'object'; } {
    const flags: ts.TypeFlags = type.getFlags();

    const isPrimitive: boolean = !!(flags & ts.TypeFlags.StringLike) ||
      !!(flags & ts.TypeFlags.NumberLike) ||
      !!(flags & ts.TypeFlags.BooleanLike) ||
      !!(flags & ts.TypeFlags.Null) ||
      !!(flags & ts.TypeFlags.Undefined);

    let isArray: boolean;
    const symbol: ts.Symbol | undefined = type.getSymbol();
    if (symbol) {
      isArray = symbol.getName() === 'Array';
    } else {
      isArray = !!(flags & ts.TypeFlags.Object) &&
        !!(type as ts.ObjectType).objectFlags && ts.ObjectFlags.Reference &&
        ((type as ts.TypeReference).target.getSymbol()?.getName() === 'Array');
    }
    const isObject: boolean = !isPrimitive &&
      !isArray &&
      !!(flags & ts.TypeFlags.Object);
    let category: 'array' | 'object';
    if (isArray) {
      category = 'array';
    } else if (isObject) {
      category = 'object';
    }
    return {category};
  }

  removeDecorator(node: ts.ClassDeclaration, decoratorNames: string[]): ts.ClassDeclaration {
    const filteredModifiers: ts.ClassDeclaration = node.modifiers.filter(decorator => {
      const originalDecortor: string = decorator.getText().replace(/\(.*\)$/, '').trim();
      return !decoratorNames.includes(originalDecortor);
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
    return !!varList && ts.isVariableDeclarationList(varList) &&
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
      throw Error(`${DYNAMIC_PARAM_ERROR.toString()}, invalidDecoratorPath: ${this.currentFilePath}`);
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
        this.validateSelfParamFields(prop, nestedCheckers);
      }
    }
    const missingFields: (keyof T)[] = requiredFields.filter(f => !existingParams.has(f));
    if (missingFields.length > 0) {
      throw Error(`${REQUIRED_PARAM_DISMISS_ERROR.toString()}, cause params: ${missingFields.join(', ')}, invalidDecoratorPath: ${this.currentFilePath}`);
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
        throw Error(`${DISALLOWED_PARAM_ERROR}, cause undeclared param: '${paramName.toString()}', invalidDecoratorPath: ${this.currentFilePath}`);
      }
      const validator: Function = paramValidators[paramName];
      if (ts.isIdentifier(prop.initializer)) {
        const symbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(prop.initializer);
        const declaration: ts.Declaration = symbol?.valueDeclaration;
        if (validator && !validator(declaration.initializer)) {
          throw Error(`${INCORRECT_PARAM_TYPE_ERROR.toString()}, cause param: '${paramName.toString()}', invalidDecoratorPath: ${this.currentFilePath}`);
        }
      } else {
        if (validator && !validator(prop.initializer)) {
          throw Error(`${INCORRECT_PARAM_TYPE_ERROR.toString()}, cause param: '${paramName.toString()}', invalidDecoratorPath: ${this.currentFilePath}`);
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
    });
  }

  createObfuscation(classNode: ts.Node): void {
    ProjectCollections.projectWhiteListManager?.fileWhiteListInfo.fileKeepInfo.arkUIKeepInfo.globalNames.add(classNode.symbol.name);
    const isExported: boolean = classNode.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
    if (isExported) {
      ProjectCollections.projectWhiteListManager?.fileWhiteListInfo.fileKeepInfo.arkUIKeepInfo.propertyNames.add(classNode.symbol.name);
    }
    classNode.members.forEach(member => {
      if (ts.isPropertyDeclaration(member) && member.name || ts.isFunctionDeclaration(member) || ts.isMethodDeclaration(member) ||
        ts.isGetAccessor(member) || ts.isSetAccessor(member)) {
        const propName: string = member.name.getText();
        ProjectCollections.projectWhiteListManager?.fileWhiteListInfo.fileKeepInfo.arkUIKeepInfo.propertyNames.add(propName);
      }
    });
  }

  parseStaticObject(node: ts.Node, visited: Set<ts.Node> = new Set()): StaticValue | undefined {
    if (visited.has(node)) {
      throw Error(`${PARAM_CIRCULAR_REFERENCE_ERROR.toString()}, invalidDecoratorPath: ${this.currentFilePath}`);
    }
    visited.add(node);
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
        return this.parseStaticObject(declaration.initializer, visited);
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

    throw Error(`${UNSUPPORTED_PARSE_ERROR.toString()}, cause param: '${node.text}', invalidDecoratorPath: ${this.currentFilePath}`);
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

  collectSchemaInfo(intentObj: object): void {
    if (intentObj.schema) {
      const schemaPath: string = path.join(
        __dirname, 'schema',
        `${intentObj.schema}_${intentObj.intentVersion}.json`
      );
      if (fs.existsSync(schemaPath)) {
        if (intentObj.parameters) {
          throw Error(`${DISALLOWED_PARAM_ERROR.toString()}` +
            `, the standard user intents  does not allow passing the parameter 'parameter', invalidDecoratorPath: ${this.currentFilePath}`);
        }
        if (intentObj.keywords) {
          throw Error(`${DISALLOWED_PARAM_ERROR.toString()}` +
          `, the standard user intents  does not allow passing the parameter 'keywords', invalidDecoratorPath: ${this.currentFilePath}`);
        }
        if (intentObj.llmDescription) {
          throw Error(`${DISALLOWED_PARAM_ERROR.toString()}` +
          `, the standard user intents  does not allow passing the parameter 'llmDescription', invalidDecoratorPath: ${this.currentFilePath}`);
        }
        const schemaContent: string = fs.readFileSync(schemaPath, 'utf-8');
        const schemaObj: object = JSON.parse(schemaContent);
        intentObj.parameters = schemaObj.params;
        if (schemaObj.llmDescription) {
          intentObj.llmDescription = schemaObj.llmDescription;
        }
        if (schemaObj.keywords) {
          intentObj.keywords = schemaObj.keywords;
        }
      }
    }
  }

  verifyInheritanceChain(): void {
    this.intentData.forEach((element): void => {
      if (element.ClassInheritanceInfo) {
        const parentClassName: string = element.ClassInheritanceInfo.parentClassName;
        const definitionFilePath: string = element.ClassInheritanceInfo.definitionFilePath;
        const verifiedString: string = parentClassName + '_' + definitionFilePath;
        if (!this.heritageClassSet.has(verifiedString)) {
          throw Error(`${INVALID_BASE_CLASS_ERROR.toString()}
          , Subclass must inherit from a class decorated with @InsightIntentEntry, invalidDecoratorPath: ${this.currentFilePath}\``);
        }
      }
    });
  }

  schemaValidationRequiredRule(schemaData: Record<string, string>, schemaObj: object): void {
    const reqData: Map<string, boolean> = new Map();
    schemaObj.required.forEach(key => reqData.set(key, true));
    if (schemaObj.properties) {
      const paramsSchema: object = schemaObj.properties;
      const keyArr: string[] = Object.keys(paramsSchema);
      keyArr.forEach(key => {
        if (!schemaData[key] && reqData.get(key)) {
          throw Error(`${SCHEMA_VALIDATE_REQUIRED_ERROR.toString()}, invalidDecoratorPath: ${this.currentFilePath}`);
        }
      });
    }
  }

  schemaPropertiesValidation(schemaData: Record<string, string>, schemaObj: object): void {
    if (schemaObj.properties) {
      Object.entries(schemaObj.properties).forEach(([key, value]) => {
        if (schemaData[key] && value.type !== schemaData[key]) {
          throw Error(`${SCHEMA_VALIDATE_TYPE_ERROR.toString()}, invalidDecoratorPath: ${this.currentFilePath}`);
        }
      });
    }
  }

  private schemaValidateRules(schemaData: Record<string, string>, schemaObj: object): void {
    const requiredOne: string[][] = schemaObj.oneOf.map(item => item.required);
    const schemaKeys: string[] = Object.keys(schemaData);
    if (schemaObj.oneOf) {
      let count: number = 0;
      requiredOne.forEach(val => {
        const isContain: boolean = val.every((item): boolean => {
          return schemaKeys.includes(item);
        });
        if (isContain) {
          count++;
        }
      });
      if (count !== 1) {
        throw Error(`${SCHEMA_VALIDATE_ONE_OF_ERROR.toString()} , invalidDecoratorPath: ${this.currentFilePath}`);
      }
    }
    if (schemaObj.anyOf) {
      let count: number = 0;
      const requiredAny: string[][] = schemaObj.anyOf.map(item => item.required);
      requiredAny.forEach(val => {
        const isContain: boolean = val.every((item): boolean => {
          return schemaKeys.includes(item);
        });
        if (isContain) {
          count++;
        }
      });
      if (count === 0) {
        throw Error(`${SCHEMA_VALIDATE_ANY_OF_ERROR.toString()} , invalidDecoratorPath: ${this.currentFilePath}`);
      }
    }
  }

  schemaValidateSync(schemaData: Record<string, string>, intentObj: object): void {
    const schemaObj: object = intentObj.parameters;
    if (!schemaObj) {
      return;
    }
    if (schemaObj.type !== 'object') {
      throw Error(`${SCHEMA_ROOT_TYPE_MISMATCH_ERROR.toString()}, invalidDecoratorPath: ${this.currentFilePath}`);
    }
    if (schemaObj.properties) {
      this.schemaPropertiesValidation(schemaData, schemaObj);
    }
    if (schemaObj.required) {
      this.schemaValidationRequiredRule(schemaData, schemaObj);
    }
    this.schemaValidateRules(schemaData, schemaObj);
  }

  writeUserIntentJsonFile(): void {
    if (!projectConfig.aceProfilePath) {
      throw Error(`${INTERNAL_ERROR.toString()}, aceProfilePath not found, invalidDecoratorPath: ${this.currentFilePath}`);
    }
    const cacheSourceMapPath: string = path.join(projectConfig.aceProfilePath, 'extract_insight_intent.json');
    if (!fs.existsSync(projectConfig.aceProfilePath)) {
      fs.mkdirSync(projectConfig.aceProfilePath, {recursive: true});
    }
    fs.writeFileSync(cacheSourceMapPath, JSON.stringify({'insightIntents': this.intentData}, null, 2), 'utf-8');
    const normalizedPath: string = path.normalize(projectConfig.aceProfilePath);
    const fullPath: string = path.join(normalizedPath, '../../../module.json');
    if (fs.existsSync(fullPath)) {
      const rawData: string = fs.readFileSync(fullPath, 'utf8');
      const jsonData: any = JSON.parse(rawData);
      if (jsonData?.module) {
        jsonData.module.hasInsightIntent = true;
      }
      const updatedJson: string = JSON.stringify(jsonData, null, 2);
      fs.writeFileSync(fullPath, updatedJson, 'utf8');
    }
  }

  clear(): void {
    this.intentData = [];
    this.checker = null;
    this.currentFilePath = '';
    IntentLinkInfoChecker.clean();
    intentEntryInfoChecker.clean();
    this.heritageClassSet = new Set<string>();
  }
}

export default new ParseIntent();
