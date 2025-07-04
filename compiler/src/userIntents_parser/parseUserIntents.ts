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
import {
  IntentEntryInfo,
  intentEntryInfoChecker,
  IntentLinkInfo,
  IntentLinkInfoChecker,
  intentMethodInfoChecker,
  LinkIntentParamMapping,
  IntentPageInfoChecker,
  ParamChecker,
  IntentEntityInfoChecker,
  intentFormInfoChecker
} from './intentType';
import { IntentLogger } from './intentLogger';
import path from 'path';
import { getNormalizedOhmUrlByFilepath } from '../ark_utils';
import { globalModulePaths, projectConfig } from '../../main';
import fs from 'fs';
import json5 from 'json5';
import { ProjectCollections } from 'arkguard';
import {
  COMPONENT_USER_INTENTS_DECORATOR,
  COMPONENT_USER_INTENTS_DECORATOR_ENTITY,
  COMPONENT_USER_INTENTS_DECORATOR_ENTRY,
  COMPONENT_USER_INTENTS_DECORATOR_FUNCTION,
  COMPONENT_USER_INTENTS_DECORATOR_METHOD,
  COMPONENT_USER_INTENTS_DECORATOR_PAGE,
  COMPONENT_USER_INTENTS_DECORATOR_FORM
} from '../pre_define';
import { CompileEvent, createAndStartEvent, stopEvent } from '../performance';
import { LogInfo, LogType } from '../utils';

type StaticValue = string | number | boolean | null | undefined | StaticValue[] | { [key: string]: StaticValue };

interface methodParametersInfo {
  functionName: string;
  parameters: Record<string, string>,
  args: ts.NodeArray<ts.Expression>;
}

class ParseIntent {
  private checker: ts.TypeChecker;
  public intentData: object[];
  private currentFilePath: string;
  private heritageClassSet: Set<string>;
  private updatePageIntentObj: Map<string, object[]>;
  public isUpdateCompile: boolean = true;
  private isInitCache: boolean = false;
  private entityMap: Map<string, object>;
  private entityOwnerMap: Map<string, string[]>;
  private moduleJsonInfo: Map<string, object[]>;
  private EntityHeritageClassSet: Set<string>;
  private EntityExtendsMap: Map<string, string>;
  private transformLog: LogInfo[];
  private currentNode: ts.Node;

  constructor() {
    this.intentData = [];
    this.currentFilePath = '';
    this.heritageClassSet = new Set<string>();
    this.heritageClassSet.add('IntentEntity_sdk');
    this.heritageClassSet.add('InsightIntentEntryExecutor_sdk');
    this.updatePageIntentObj = new Map();
    this.entityMap = new Map();
    this.entityOwnerMap = new Map();
    this.moduleJsonInfo = new Map();
    this.EntityHeritageClassSet = new Set();
    this.EntityExtendsMap = new Map();
  }

  private hasDecorator(node: ts.Node, decorators: string[]): boolean {
    if (!node.modifiers) {
      return false;
    }
    return node.modifiers.some(decorator => {
      if (!ts.isDecorator(decorator)) {
        return false;
      }
      let decoratorName: string | undefined;
      if (ts.isCallExpression(decorator.expression)) {
        decoratorName = `@${decorator.expression.expression.getText()}`;
      }
      return decoratorName !== undefined && decorators.includes(decoratorName);
    });
  }

  public detectInsightIntent(
    node: ts.ClassDeclaration, metaInfo: object, filePath: string, eventOrEventFactory: CompileEvent | undefined, transformLog: LogInfo[]): ts.Node {
    this.initInsightIntent(node, metaInfo, transformLog, filePath);
    const eventParseIntentTime: CompileEvent | undefined = createAndStartEvent(eventOrEventFactory, 'parseIntentTime');
    const definedDecorators: string[] = [COMPONENT_USER_INTENTS_DECORATOR, COMPONENT_USER_INTENTS_DECORATOR_ENTRY,
      COMPONENT_USER_INTENTS_DECORATOR_FUNCTION, COMPONENT_USER_INTENTS_DECORATOR_PAGE, COMPONENT_USER_INTENTS_DECORATOR_ENTITY,
      COMPONENT_USER_INTENTS_DECORATOR_FORM];
    if (ts.isClassDeclaration(node) && !this.hasDecorator(node, [COMPONENT_USER_INTENTS_DECORATOR_FUNCTION])) {
      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && this.hasModifier(member, ts.SyntaxKind.StaticKeyword) &&
          this.hasDecorator(member, [COMPONENT_USER_INTENTS_DECORATOR_METHOD])) {
          const errorMessage: string = '@InsightIntentFunctionMethod must be declared under the @InsightIntentFunction decorator';
          this.transformLog.push({
            type: LogType.ERROR,
            message: errorMessage,
            pos: node.getStart(),
            code: '10105110',
            description: 'ArkTs InsightIntent Error'
          });
          return;
        }
      });
    }
    if (this.hasDecorator(node, definedDecorators)) {
      const checker: TypeChecker = metaInfo.checker;
      this.handleIntent(node, checker, filePath, metaInfo);
      node = this.removeDecorator(node, definedDecorators.concat(COMPONENT_USER_INTENTS_DECORATOR_METHOD));
    }
    stopEvent(eventParseIntentTime);
    return node;
  }

  private initInsightIntent(node: ts.ClassDeclaration, metaInfo: object, transformLog: LogInfo[], filePath: string): void {
    this.transformLog = transformLog;
    this.currentNode = node;
    if (!this.isInitCache) {
      if (projectConfig.cachePath) {
        const cacheSourceMapPath: string =
          path.join(projectConfig.cachePath, 'insight_compile_cache.json'); // The user's intents configuration file
        this.isUpdateCompile = fs.existsSync(cacheSourceMapPath);
        this.isInitCache = true;
      } else {
        this.isUpdateCompile = false;
      }
    }
    if (this.isUpdateCompile) {
      const pkgParams: object = {
        pkgName: metaInfo.pkgName,
        pkgPath: metaInfo.pkgPath
      };
      const Logger: IntentLogger = IntentLogger.getInstance();
      const recordName: string = getNormalizedOhmUrlByFilepath(filePath, projectConfig, Logger, pkgParams, null);
      if (!this.updatePageIntentObj.has(`@normalized:${recordName}`)) {
        this.updatePageIntentObj.set(`@normalized:${recordName}`, []);
      }
    }
  }

  private handleIntent(node: ts.ClassDeclaration, checker: ts.TypeChecker, filepath: string, metaInfo: Object = {}): void {
    this.checker = checker;
    this.currentFilePath = filepath;
    if (!filepath.endsWith('.ets')) {
      const errorMessage: string = 'IntentDecorator needs to be in the .ets file';
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101002',
        description: 'ArkTs InsightIntent Error'
      });
      return;
    }
    const pkgParams: object = {
      pkgName: metaInfo.pkgName,
      pkgPath: metaInfo.pkgPath
    };
    node.modifiers.forEach(decorator => {
      this.handleDecorator(node, decorator, filepath, pkgParams);
    });
  }

  private handleDecorator(node: ts.ClassDeclaration, decorator: ts.Decorator, filepath: string, pkgParams: object): void {
    const expr: ts.Expression = decorator.expression;
    if (!expr || !ts.isCallExpression(expr)) {
      return;
    }
    const argumentKind: ts.SyntaxKind | undefined = expr.arguments[0]?.kind;
    if (argumentKind && argumentKind === ts.SyntaxKind.NullKeyword || argumentKind && argumentKind === ts.SyntaxKind.UndefinedKeyword) {
      return;
    }
    const symbol: ts.Symbol = this.checker.getTypeAtLocation(decorator.expression.expression)?.getSymbol();
    const declarations: ts.Declaration[] | undefined = symbol?.getDeclarations();
    if (!declarations || declarations.length === 0) {
      return;
    }
    const decoratorSourceFile: string = declarations[0].getSourceFile().fileName;
    const isGlobalPathFlag: boolean = this.isGlobalPath(decoratorSourceFile);
    if (!isGlobalPathFlag) {
      return;
    }
    const Logger: IntentLogger = IntentLogger.getInstance();
    const recordName: string = getNormalizedOhmUrlByFilepath(filepath, projectConfig, Logger, pkgParams, null);
    const intentObj: object = {
      'decoratorFile': `@normalized:${recordName}`,
      'decoratorClass': node.name.text
    };
    const originalDecorator: string = '@' + decorator.expression.expression.getText();
    if (originalDecorator === COMPONENT_USER_INTENTS_DECORATOR) {
      this.handleLinkDecorator(intentObj, node, decorator);
    } else if (originalDecorator === COMPONENT_USER_INTENTS_DECORATOR_ENTRY) {
      this.handleEntryDecorator(intentObj, node, decorator, pkgParams);
    } else if (originalDecorator === COMPONENT_USER_INTENTS_DECORATOR_FUNCTION) {
      this.handleMethodDecorator(intentObj, node, decorator);
    } else if (originalDecorator === COMPONENT_USER_INTENTS_DECORATOR_PAGE) {
      this.handlePageDecorator(intentObj, node, decorator, pkgParams);
    } else if (originalDecorator === COMPONENT_USER_INTENTS_DECORATOR_ENTITY) {
      this.handleEntityDecorator(intentObj, node, decorator, pkgParams);
    } else if (originalDecorator === COMPONENT_USER_INTENTS_DECORATOR_FORM) {
      this.handleFormDecorator(intentObj, node, decorator, pkgParams);
    }
  }

  private handleFormDecorator(intentObj: object, node: ts.ClassDeclaration, decorator: ts.Decorator,
    pkgParams: object): void {
    const expr: ts.Expression = decorator.expression;
    if (ts.isCallExpression(expr)) {
      const args: ts.NodeArray<ts.Expression> = expr.arguments;
      Object.assign(intentObj, {
        'bundleName': projectConfig.bundleName,
        'moduleName': projectConfig.moduleName,
        'decoratorType': COMPONENT_USER_INTENTS_DECORATOR_FORM
      });
      this.analyzeDecoratorArgs(args, intentObj, intentFormInfoChecker);
      const properties: Record<string, string> = this.parseClassNode(node, intentObj.intentName);
      this.processFormInfo(node, this.currentFilePath, pkgParams, intentObj);
      this.schemaValidateSync(properties, intentObj.parameters);
      this.createObfuscation(node);
      if (this.isUpdateCompile) {
        this.updatePageIntentObj.get(intentObj.decoratorFile).push(intentObj);
      }
      this.intentData.push(intentObj);
    } else {
      const errorMessage: string = 'Decorator is not CallExpression';
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101003',
        description: 'ArkTs InsightIntent Error'
      });
      return;
    }
  }

  private handleEntityDecorator(intentObj: object, node: ts.ClassDeclaration, decorator: ts.Decorator,
    pkgParams: object): void {
    const entityClassName: string = this.checker.getTypeAtLocation(node).getSymbol().getName();
    const expr: ts.Expression = decorator.expression;
    if (ts.isCallExpression(expr)) {
      const args: ts.NodeArray<ts.Expression> = expr.arguments;
      Object.assign(intentObj, {
        'decoratorType': COMPONENT_USER_INTENTS_DECORATOR_ENTITY,
        'className': intentObj.decoratorClass
      });
      delete intentObj.decoratorClass;
      this.analyzeDecoratorArgs(args, intentObj, IntentEntityInfoChecker);
      const properties: Record<string, string> = this.parseClassNode(node, undefined);
      const entityId: string = this.getEntityId(node);
      Object.assign(properties, {
        'entityId': entityId
      });
      Object.assign(intentObj, {
        'entityId': entityId
      });
      this.schemaValidateSync(properties, intentObj.parameters);
      this.analyzeBaseClass(node, pkgParams, intentObj, COMPONENT_USER_INTENTS_DECORATOR_ENTITY);
      this.createObfuscation(node);
      if (this.entityMap.has(entityClassName)) {
        const errorMessage: string = 'class can be decorated with at most one @InsightIntentEntity';
        this.transformLog.push({
          type: LogType.ERROR,
          message: errorMessage,
          pos: this.currentNode.getStart(),
          code: '10101004',
          description: 'ArkTs InsightIntent Error'
        });
        return;
      } else {
        this.entityMap.set(entityClassName, intentObj);
      }
    } else {
      const errorMessage: string = '10101003 ArkTs InsightIntent Error\n' +
        'Decorator is not CallExpression';
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101003'
      });
      return;
    }
  }

  private handlePageDecorator(intentObj: object, node: ts.ClassDeclaration, decorator: ts.Decorator,
    pkgParams: object): void {
    const expr: ts.Expression = decorator.expression;
    if (ts.isClassDeclaration(node)) {
      const errorMessage: string = `@InsightIntentPage must be decorated on struct` +
        `, className: ${node.name.getText()}`;
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101003',
        description: 'ArkTs InsightIntent Error'
      });
      return;
    }
    if (ts.isCallExpression(expr)) {
      const args: ts.NodeArray<ts.Expression> = expr.arguments;
      Object.assign(intentObj, {
        'bundleName': projectConfig.bundleName,
        'moduleName': projectConfig.moduleName,
        'decoratorType': COMPONENT_USER_INTENTS_DECORATOR_PAGE
      });
      this.analyzeDecoratorArgs(args, intentObj, IntentPageInfoChecker);
      this.validatePagePath(intentObj, pkgParams);
      this.createObfuscation(node);
      if (this.isUpdateCompile) {
        this.updatePageIntentObj.get(intentObj.decoratorFile).push(intentObj);
      }
      this.intentData.push(intentObj);
    } else {
      const errorMessage: string = 'Decorator is not CallExpression';
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101003',
        description: 'ArkTs InsightIntent Error'
      });
      return;
    }
  }

  private handleMethodDecorator(intentObj: object, node: ts.ClassDeclaration, decorator: ts.Decorator): void {
    const expr: ts.Expression = decorator.expression;
    if (ts.isCallExpression(expr)) {
      Object.assign(intentObj, {
        'bundleName': projectConfig.bundleName,
        'moduleName': projectConfig.moduleName,
        'decoratorType': COMPONENT_USER_INTENTS_DECORATOR_METHOD
      });

      interface methodParametersInfo {
        functionName: string,
        parameters: Record<string, string>,
        args: ts.NodeArray<ts.Expression>,
      }

      const methodParameters: methodParametersInfo[] =
        this.parseClassMethods(node, COMPONENT_USER_INTENTS_DECORATOR_METHOD);
      methodParameters.forEach(methodDecorator => {
        const functionName: string = methodDecorator.functionName;
        const methodArgs: ts.NodeArray<ts.Expression> = methodDecorator.args;
        const properties: Record<string, string> = methodDecorator.parameters;
        const functionParamList: Array<string> = Object.keys(properties);
        const methodObj: object =
          Object.assign({}, intentObj, { functionName, 'functionParamList': functionParamList });
        this.analyzeDecoratorArgs(methodArgs, methodObj, intentMethodInfoChecker);
        if (this.isUpdateCompile) {
          this.updatePageIntentObj.get(methodObj.decoratorFile).push(methodObj);
        }
        this.intentData.push(methodObj);
      });
      this.createObfuscation(node);
    } else {
      const errorMessage: string = 'Decorator is not CallExpression';
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101003',
        description: 'ArkTs InsightIntent Error'
      });
      return;
    }
  }

  private handleLinkDecorator(intentObj: object, node: ts.ClassDeclaration, decorator: ts.Decorator): void {
    const expr: ts.Expression = decorator.expression;
    if (ts.isCallExpression(expr)) {
      const args: ts.NodeArray<ts.Expression> = expr.arguments;
      this.analyzeDecoratorArgs<IntentLinkInfo>(args, intentObj, IntentLinkInfoChecker);
      Object.assign(intentObj, {
        'bundleName': projectConfig.bundleName,
        'moduleName': projectConfig.moduleName,
        'decoratorType': COMPONENT_USER_INTENTS_DECORATOR
      });
      this.createObfuscation(node);
      if (this.isUpdateCompile) {
        this.updatePageIntentObj.get(intentObj.decoratorFile).push(intentObj);
      }
      this.intentData.push(intentObj);
    } else {
      const errorMessage: string = 'Decorator is not CallExpression';
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101003',
        description: 'ArkTs InsightIntent Error'
      });
      return;
    }
  }

  private handleEntryDecorator(intentObj: object, node: ts.ClassDeclaration, decorator: ts.Decorator,
    pkgParams: object): void {
    const expr: ts.Expression = decorator.expression;
    if (ts.isCallExpression(expr)) {
      const args: ts.NodeArray<ts.Expression> = expr.arguments;
      Object.assign(intentObj, {
        'bundleName': projectConfig.bundleName,
        'moduleName': projectConfig.moduleName,
        'decoratorType': COMPONENT_USER_INTENTS_DECORATOR_ENTRY
      });
      this.analyzeDecoratorArgs<IntentEntryInfo>(args, intentObj, intentEntryInfoChecker);
      const properties: Record<string, string> = this.parseClassNode(node, intentObj.intentName);
      this.schemaValidateSync(properties, intentObj.parameters);
      this.analyzeBaseClass(node, pkgParams, intentObj, COMPONENT_USER_INTENTS_DECORATOR_ENTRY);
      this.createObfuscation(node);
      this.processExecuteModeParam(intentObj);
      if (this.isUpdateCompile) {
        this.updatePageIntentObj.get(intentObj.decoratorFile).push(intentObj);
      }
      this.intentData.push(intentObj);
    } else {
      const errorMessage: string = 'Decorator is not CallExpression';
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101003',
        description: 'ArkTs InsightIntent Error'
      });
      return;
    }
  }

  private processFormInfo(node: ts.ClassDeclaration, formClassPath: string, pkgParams: object,
    intentObj: object): void {
    if (this.moduleJsonInfo.size === 0 && pkgParams.pkgPath) {
      this.readModuleJsonInfo(pkgParams);
    }
    const extensionAbilities: object[] = this.moduleJsonInfo.get('extensionAbilities');
    const bindFormInfo: object = extensionAbilities.find(extensionInfo => {
      const formSrcEntryPath: string = path.join(pkgParams.pkgPath, 'src', 'main', extensionInfo.srcEntry);
      return formSrcEntryPath === formClassPath && extensionInfo.type === 'form';
    });
    this.verifyFormName(bindFormInfo, intentObj);
    const isExported: boolean = node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
    const isDefault: boolean = node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.DefaultKeyword);
    if (!(bindFormInfo && isExported && isDefault)) {
      const errorMessage: string = '@InsightIntentForm must be decorated on a formExtensionAbility';
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101006',
        description: 'ArkTs InsightIntent Error'
      });
      return;
    }
  }

  private verifyFormName(bindFormInfo: object, intentObj: object): void {
    if (!bindFormInfo) {
      return;
    }
    let formNameFound: boolean = false;
    intentObj.abilityName = bindFormInfo.name;
    bindFormInfo.metadata?.forEach(metaData => {
      const formConfigName = `${metaData.resource.split(':').pop()}.json`;
      const formConfigPath = path.join(projectConfig.aceProfilePath, formConfigName);
      if (!fs.existsSync(formConfigPath)) {
        return;
      }
      const formData = fs.readFileSync(formConfigPath, 'utf8');
      const formConfigs = JSON.parse(formData).forms;
      if (formConfigs?.some(form => form.name === intentObj.formName)) {
        formNameFound = true;
      }
    });
    if (!formNameFound) {
      const errorMessage: string = '@InsightIntentForm param formName must match the card name. ' +
        `Provided name: ${intentObj.formName}`;
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101006',
        description: 'ArkTs InsightIntent Error'
      });
      return;
    }
  }

  private readModuleJsonInfo(pkgParams: object): void {
    const moduleJsonPath: string = path.join(pkgParams.pkgPath, 'src', 'main', 'module.json5');
    if (fs.existsSync(moduleJsonPath)) {
      const jsonStr: string = fs.readFileSync(moduleJsonPath, 'utf8');
      const obj: object = json5.parse(jsonStr);
      if (obj.module?.abilities) {
        this.moduleJsonInfo.set('abilities', obj.module.abilities);
      }
      if (obj.module?.extensionAbilities) {
        this.moduleJsonInfo.set('extensionAbilities', obj.module.extensionAbilities);
      }
    } else {
      const errorMessage: string = ` module.json5 not found, expect moduleJsonPath: ${moduleJsonPath}`;
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101007',
        description: 'ArkTs InsightIntent Error'
      });
      return;
    }
  }

  private validatePagePath(intentObj: object, pkgParams: object): void {
    if (pkgParams.pkgPath) {
      const normalPagePath: string = path.join(pkgParams.pkgPath, 'src', 'main', intentObj.pagePath + '.ets');
      if (!fs.existsSync(normalPagePath)) {
        const errorMessage: string = `@InsightIntentPage pagePath incorrect,` +
          `${normalPagePath} does not exist, invalidDecoratorPath: ${this.currentFilePath}`;
        this.transformLog.push({
          type: LogType.ERROR,
          message: errorMessage,
          pos: this.currentNode.getStart(),
          code: '10101008',
          description: 'ArkTs InsightIntent Error'
        });
        return;
      } else {
        const Logger: IntentLogger = IntentLogger.getInstance();
        intentObj.pagePath =
          '@normalized:' + getNormalizedOhmUrlByFilepath(normalPagePath, projectConfig, Logger, pkgParams, null);
      }
    }
  }

  private isGlobalPath(parentFilePath: string): boolean {
    return globalModulePaths?.some(globalPath => {
      const normalizedParent: string = path.normalize(parentFilePath).replace(/\\/g, '/');
      const normalizedGlobalPath: string = path.normalize(globalPath).replace(/\\/g, '/');
      return normalizedParent.startsWith(normalizedGlobalPath);
    });
  }

  private analyzeBaseClass(node: ts.ClassDeclaration, pkgParams: object, intentObj: object,
    decoratorFlag: string): void {
    const interfaces: ts.ExpressionWithTypeArguments[] = [];
    if (decoratorFlag === COMPONENT_USER_INTENTS_DECORATOR_ENTRY) {
      node.heritageClauses?.forEach(clause => {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
          interfaces.push(...clause.types);
        }
      });
      this.processEntryBaseClass(interfaces, intentObj, pkgParams);
    } else if (decoratorFlag === COMPONENT_USER_INTENTS_DECORATOR_ENTITY) {
      node.heritageClauses?.forEach(clause => {
        if (clause.token === ts.SyntaxKind.ImplementsKeyword || clause.token === ts.SyntaxKind.ExtendsKeyword) {
          interfaces.push(...clause.types);
        }
      });
      if (interfaces.length > 0) {
        const parentNode: ts.ExpressionWithTypeArguments = interfaces[0];
        this.analyzeClassHeritage(parentNode, node, pkgParams, intentObj);
      } else {
        const errorMessage: string =
          `decorated with @InsightIntentEntity must be ultimately inherited to insightIntent.IntentEntity`;
        this.transformLog.push({
          type: LogType.ERROR,
          message: errorMessage,
          pos: this.currentNode.getStart(),
          code: '10101009',
          description: 'ArkTs InsightIntent Error'
        });
        return;
      }
    }
  }

  private processEntryBaseClass(interfaces: ts.ExpressionWithTypeArguments[], intentObj: object,
    pkgParams: object): void {
    if (interfaces.length > 0) {
      const parentNode: ts.ExpressionWithTypeArguments = interfaces[0];
      const parentClassName: string = parentNode.expression.getText();
      const parentNodeSymbol: ts.Symbol = this.checker.getTypeAtLocation(parentNode).getSymbol();
      const parentFilePath: string = parentNodeSymbol.getDeclarations()?.[0].getSourceFile().fileName;
      const isGlobalPathFlag: boolean = this.isGlobalPath(parentFilePath);
      if (!(isGlobalPathFlag && parentClassName === 'InsightIntentEntryExecutor')) {
        const errorMessage: string =
          `decorated with @InsightIntentEntry must be inherited to InsightIntentEntryExecutor`;
        this.transformLog.push({
          type: LogType.ERROR,
          message: errorMessage,
          pos: this.currentNode.getStart(),
          code: '10101010',
          description: 'ArkTs InsightIntent Error'
        });
        return;
      }
      const logger: IntentLogger = IntentLogger.getInstance();
      const parentRecordName: string =
        getNormalizedOhmUrlByFilepath(parentFilePath, projectConfig, logger, pkgParams, null);
      const recordPath: string = isGlobalPathFlag ? `sdk` : `@normalized:${parentRecordName}`;
      this.collectClassInheritanceInfo(parentNode, intentObj, parentClassName, recordPath);
    } else {
      const errorMessage: string = `decorated with @InsightIntentEntry must be inherited to InsightIntentEntryExecutor`;
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101010',
        description: 'ArkTs InsightIntent Error'
      });
      return;
    }
  }

  private hasModifier(node: ts.Node, modifier: ts.SyntaxKind): boolean {
    return (node.modifiers || []).some(m => m.kind === modifier);
  }

  private parseClassMethods(classNode: ts.ClassDeclaration, decoratorType: string): methodParametersInfo[] {
    const methodsArr: methodParametersInfo[] = [];
    for (const member of classNode.members) {
      if (!ts.isMethodDeclaration(member) || !this.hasModifier(member, ts.SyntaxKind.StaticKeyword)) {
        continue;
      }
      const decorator: ts.ModifierLike = member.modifiers?.find(modifier => {
        if (!ts.isDecorator(modifier)) {
          return false;
        }
        let decoratorName: string | undefined;
        if (ts.isCallExpression(modifier.expression)) {
          decoratorName = `@${modifier.expression.expression.getText()}`;
        }
        return decoratorName === decoratorType;
      });
      if (decorator && ts.isCallExpression(decorator.expression)) {
        let parameters: Record<string, string> = {};
        member.parameters.forEach(param => {
          const paramName: string = param.name.getText();
          parameters[paramName] = this.checker.typeToString(
            this.checker.getTypeAtLocation(param),
            param,
            ts.TypeFormatFlags.NoTruncation
          );
        });
        const obj: methodParametersInfo = {
          functionName: member.name.getText(),
          parameters: parameters,
          args: decorator.expression.arguments
        };
        methodsArr.push(obj);
      }
    }
    return methodsArr;
  }

  private analyzeClassHeritage(
    parentNode: ts.ExpressionWithTypeArguments, node: ts.ClassDeclaration, pkgParams: object, intentObj: object
  ): void {
    const parentSymbol: ts.Symbol = this.checker.getTypeAtLocation(parentNode).getSymbol();
    let parentClassName: string;
    node.heritageClauses.forEach(clause => {
      if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
        parentClassName = parentNode.expression.getText();
      } else if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
        parentClassName = parentSymbol.getName();
      }
    });
    intentObj.parentClassName = parentClassName;
    const parentFilePath: string = parentSymbol.getDeclarations()?.[0].getSourceFile().fileName;
    const logger: IntentLogger = IntentLogger.getInstance();
    const baseClassName: string = this.checker.getTypeAtLocation(node).getSymbol().getName();
    const baseFilePath: string = node.getSourceFile().fileName;
    const baseRecordName: string = getNormalizedOhmUrlByFilepath(baseFilePath, projectConfig, logger, pkgParams, null);
    const isGlobalPathFlag: boolean = this.isGlobalPath(parentFilePath);
    const parentRecordName: string =
      getNormalizedOhmUrlByFilepath(parentFilePath, projectConfig, logger, pkgParams, null);
    if (isGlobalPathFlag) {
      if (parentClassName !== 'IntentEntity') {
        const errorMessage: string =
          `decorated with @InsightIntentEntity must be ultimately inherited to insightIntent.IntentEntity`;
        this.transformLog.push({
          type: LogType.ERROR,
          message: errorMessage,
          pos: this.currentNode.getStart(),
          code: '10101009',
          description: 'ArkTs InsightIntent Error'
        });
        return;
      }
      this.EntityHeritageClassSet.add(parentClassName + '_' + `sdk`);
    } else {
      this.EntityHeritageClassSet.add(parentClassName + '_' + `@normalized:${parentRecordName}`);
      this.EntityExtendsMap.set(baseClassName, parentClassName);
    }
    this.heritageClassSet.add(baseClassName + '_' + `@normalized:${baseRecordName}`);
  }

  private collectClassInheritanceInfo(
    parentNode: ts.ExpressionWithTypeArguments, intentObj: object, parentClassName: string, recordPath: string
  ): void {
    const ClassInheritanceInfo: object = {
      'parentClassName': parentClassName,
      'definitionFilePath': recordPath,
      'generics': []
    };
    if (parentNode.typeArguments?.length > 0) {
      parentNode.typeArguments.forEach((arg): void => {
        this.getInheritanceInfoByTypeNode(arg, ClassInheritanceInfo, intentObj);
      });
    }
    Object.assign(intentObj, {
      'ClassInheritanceInfo': ClassInheritanceInfo
    });
  }

  private getInheritanceInfoByTypeNode(arg: ts.TypeNode, ClassInheritanceInfo: object, intentObj: object): void {
    const generic = {};
    const genericType: ts.Type = this.checker.getTypeAtLocation(arg);
    let genericName: string;
    let genericSource: string | undefined;
    let recordGenericSource: string;
    const genericSymbol: ts.Symbol | undefined = genericType.getSymbol();
    if (genericSymbol) {
      genericName = genericSymbol.getName();
      genericSource = genericSymbol.declarations?.[0]?.getSourceFile().fileName;
      recordGenericSource = path.relative(projectConfig.moduleName, genericSource).replace(/\\/g, '/');
    } else {
      genericName = this.checker.typeToString(genericType);
      const parentTypeNode: ts.Node = arg.parent;
      if (ts.isTypeReferenceNode(parentTypeNode)) {
        const contextualType: ts.Type = this.checker.getContextualType(parentTypeNode);
        const symbol: ts.Type = contextualType?.getSymbol();
        genericSource = symbol?.declarations?.[0]?.getSourceFile().fileName;
      }
      if (!genericSource && this.isPrimitiveType(genericType)) {
        recordGenericSource = 'lib.es5.d.ts';
      }
    }
    Object.assign(generic,
      {
        'typeName': genericName,
        'definitionFilePath': recordGenericSource
      });
    if (this.entityOwnerMap.has(intentObj.intentName)) {
      const entityNames: string[] = this.entityOwnerMap.get(intentObj.intentName);
      entityNames.push(genericName);
      this.entityOwnerMap.set(intentObj.intentName, entityNames);
    } else {
      this.entityOwnerMap.set(intentObj.intentName, [genericName]);
    }
    ClassInheritanceInfo.generics.push(generic);
  }

  private isPrimitiveType(type: ts.Type): boolean {
    return (
      (type.flags & ts.TypeFlags.StringLike) ||
        (type.flags & ts.TypeFlags.NumberLike) ||
        (type.flags & ts.TypeFlags.BooleanLike)
    ) !== 0;
  }

  private parseClassNode(node: ts.ClassDeclaration, intentName: string): Record<string, string> {
    const mergedObject: Record<string, string> = {};
    const type: ts.Type = this.checker.getTypeAtLocation(node);
    const propertiesOfType: ts.Symbol[] = this.checker.getPropertiesOfType(type);
    propertiesOfType.forEach((prop) => {
      const objItem: Record<string, string> = this.processProperty(prop, intentName);
      Object.assign(mergedObject, objItem);
    });
    return mergedObject;
  }

  private getEntityId(node: ts.ClassDeclaration): string {
    let entityId: string;
    const type: ts.Type = this.checker.getTypeAtLocation(node);
    const propertiesOfType: ts.Symbol[] = this.checker.getPropertiesOfType(type);
    propertiesOfType.forEach((prop) => {
      if (prop.getName() === 'entityId') {
        const declaration: ts.Declaration = prop.getDeclarations()?.[0];
        if (declaration) {
          const initializer = ts.isIdentifier(declaration.initializer) ?
            this.checker.getSymbolAtLocation(declaration.initializer)?.valueDeclaration?.initializer :
          declaration.initializer;
          entityId = initializer.text;
        }
      }
    });
    return entityId;
  }

  private processProperty(prop: ts.Symbol, intentName: string): Record<string, string> {
    const propType: ts.Type = this.checker.getTypeOfSymbol(prop);
    const { category } = this.getTypeCategory(propType);
    const obj: Record<string, string> = {};
    const propName: string = prop.getName();
    if (category === 'object') {
      if (this.isEntity(propType, intentName)) {
        obj[propName] = 'object';
      }
    } else if (category === 'array') {
      if (this.isEntity(propType, intentName)) {
        obj[propName] = 'array';
      }
    } else {
      obj[propName] = this.checker.typeToString(propType);
    }
    return obj;
  }

  private isEntity(propType: ts.Type, intentName: string): boolean {
    let propDeclaration: ts.Declaration;
    let elementType: ts.Type | undefined;
    const typeSymbol: ts.Symbol = propType.getSymbol();
    const propertyClassName: string = typeSymbol.getName();
    if (this.isArrayType(propType)) {
      elementType = (propType as ts.TypeReference).typeArguments?.[0];
      propDeclaration = elementType.getSymbol()?.getDeclarations()[0];
    } else {
      propDeclaration = typeSymbol.getDeclarations()?.[0];
    }
    if (!propDeclaration) {
      return false;
    }
    return propDeclaration.modifiers?.some(decorator => {
      if (!ts.isDecorator(decorator)) {
        return false;
      }
      let decoratorName: string | undefined;
      if (ts.isCallExpression(decorator.expression)) {
        decoratorName = `@${decorator.expression.expression.getText()}`;
      }
      if (decoratorName === '@InsightIntentEntity') {
        const typeSymbol: ts.Symbol = propType.getSymbol();
        const propertyClassName: string = typeSymbol.getName();
        if (this.entityOwnerMap.has(intentName)) {
          const entityNames: string[] = this.entityOwnerMap.get(intentName);
          entityNames.push(propertyClassName);
          this.entityOwnerMap.set(intentName, entityNames);
        } else {
          this.entityOwnerMap.set(intentName, [propertyClassName]);
        }
        return true;
      }
      return false;
    });
  }

  private getTypeCategory(type: ts.Type): { category: 'array' | 'object'; } {
    const flags: ts.TypeFlags = type.getFlags();
    const valueDeclaration: ts.Declaration | undefined = type.getSymbol()?.valueDeclaration;
    const isEnum: boolean = valueDeclaration ? ts.isEnumDeclaration(valueDeclaration) : false;

    const isPrimitive: boolean = !!(flags & ts.TypeFlags.StringLike) ||
      !!(flags & ts.TypeFlags.NumberLike) ||
      !!(flags & ts.TypeFlags.BooleanLike) ||
      !!(flags & ts.TypeFlags.Null) ||
      !!(flags & ts.TypeFlags.Undefined);

    const isArray: boolean = this.isArrayType(type);
    const isObject: boolean = !isPrimitive &&
      !isArray &&
      (!!(flags & ts.TypeFlags.Object) || isEnum);
    let category: 'array' | 'object';
    if (isArray) {
      category = 'array';
    } else if (isObject) {
      category = 'object';
    }
    return { category };
  }

  private isArrayType(type: ts.Type): boolean {
    let isArray: boolean;
    const symbol: ts.Symbol | undefined = type.getSymbol();
    const flags: ts.TypeFlags = type.getFlags();
    if (symbol) {
      isArray = symbol.getName() === 'Array';
    } else {
      isArray = !!(flags & ts.TypeFlags.Object) &&
        !!(type as ts.ObjectType).objectFlags && ts.ObjectFlags.Reference &&
        ((type as ts.TypeReference).target.getSymbol()?.getName() === 'Array');
    }
    return isArray;
  }

  private removeDecorator(node: ts.ClassDeclaration, decoratorNames: string[]): ts.ClassDeclaration {
    const filteredModifiers: ts.ModifierLike[] = node.modifiers.filter(decorator => {
      if (!ts.isDecorator(decorator)) {
        return true;
      }
      let decoratorName: string | undefined;
      if (ts.isCallExpression(decorator.expression)) {
        decoratorName = `@${decorator.expression.expression.getText()}`;
      }
      return !decoratorNames.includes(decoratorName);
    });
    const updatedMembers: ts.ClassElement[] = node.members.map(member => {
      return this.reduceMembers(member);
    });
    return ts.factory.updateClassDeclaration(
      node,
      filteredModifiers,
      node.name,
      node.typeParameters,
      node.heritageClauses,
      ts.factory.createNodeArray(updatedMembers)
    );
  }

  private reduceMembers(member: ts.ClassElement): ts.ClassElement {
    if (ts.isMethodDeclaration(member) && this.hasModifier(member, ts.SyntaxKind.StaticKeyword)) {
      const memberModifiers: ts.ModifierLike[] = (member.modifiers ?? []).filter(decorator => {
        if (!ts.isDecorator(decorator)) {
          return true;
        }
        let decoratorName: string | undefined;
        if (ts.isCallExpression(decorator.expression)) {
          decoratorName = `@${decorator.expression.expression.getText()}`;
        }
        return decoratorName !== COMPONENT_USER_INTENTS_DECORATOR_METHOD;
      });
      if (memberModifiers.length !== (member.modifiers?.length ?? 0)) {
        return ts.factory.updateMethodDeclaration(
          member,
          memberModifiers,
          member.asteriskToken,
          member.name,
          member.questionToken,
          member.typeParameters,
          member.parameters,
          member.type,
          member.body!
        );
      }
    }
    return member;
  }

  private isSymbolConstant(symbol: ts.Symbol): boolean {
    const declaration: Declaration = symbol.valueDeclaration;

    if (!this.isConstVariable(declaration)) {
      return false;
    }
    const varDecl: ts.VariableDeclaration = declaration as ts.VariableDeclaration;
    const initializer: Expression = varDecl.initializer;
    return initializer ? this.isConstantExpression(initializer) : false;
  }

  private isConstVariable(node: ts.Node | undefined): node is ts.VariableDeclaration {
    if (!node || !ts.isVariableDeclaration(node)) {
      return false;
    }

    const varList: VariableDeclarationList | CatchClause = node.parent;
    return !!varList && ts.isVariableDeclarationList(varList) &&
      (varList.flags & ts.NodeFlags.Const) !== 0;
  }

  private isConstantExpression(node: ts.Node): boolean {
    let flag: boolean = true;
    if (ts.isLiteralExpression(node) || node.kind === ts.SyntaxKind.TrueKeyword ||
      node.kind === ts.SyntaxKind.FalseKeyword) {
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
      const errorMessage: string = `Dynamic variable cannot be resolved`;
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101011',
        description: 'ArkTs InsightIntent Error'
      });
      return false;
    }
    return flag;
  }

  private validateRequiredIntentLinkInfo<T>(
    node: ts.ObjectLiteralExpression,
    paramCheckFields: ParamChecker<T>
  ): void {
    const existingParams: Set<keyof T> = new Set<keyof T>();
    const requiredFields: (keyof T)[] = paramCheckFields.requiredFields;
    const nestedCheckers: Map<string, ParamChecker<LinkIntentParamMapping>> = paramCheckFields.nestedCheckers;
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
      const errorMessage: string = `Decorator args missing required param, cause params: ${missingFields.join(', ')}`;
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101012',
        description: 'ArkTs InsightIntent Error'
      });
      return;
    }
  }

  private validateSelfParamFields(prop: ts.Node,
    nestedCheckers: Map<string, ParamChecker<LinkIntentParamMapping>>): void {
    const checker: ParamChecker<LinkIntentParamMapping> = nestedCheckers.get(prop.name.text);
    if (ts.isArrayLiteralExpression(prop.initializer)) {
      prop.initializer.elements.every(elem => {
        if (ts.isIdentifier(elem)) {
          const symbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(elem);
          const declaration: ts.Declaration = symbol?.valueDeclaration;
          this.validateRequiredIntentLinkInfo<LinkIntentParamMapping>(declaration.initializer, checker);
        } else {
          this.validateRequiredIntentLinkInfo<LinkIntentParamMapping>(elem, checker);
        }
      });
    } else if (ts.isIdentifier(prop)) {
      const symbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(prop);
      const declaration: ts.Declaration = symbol?.valueDeclaration;
      this.validateRequiredIntentLinkInfo<LinkIntentParamMapping>(declaration.initializer, checker);
    } else {
      this.validateRequiredIntentLinkInfo<LinkIntentParamMapping>(prop, checker);
    }
  }

  private validateFields<T>(
    prop: ts.Node, allowedFields: Set<keyof T>, paramValidators: Record<keyof T, (v: ts.Expression) => boolean>
  ): void {
    const paramName: keyof T = prop.name.text;
    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
      if (!allowedFields.has(paramName)) {
        const errorMessage: string =
          `Decorator args missing required param, cause undeclared param: ${paramName.toString()}`;
        this.transformLog.push({
          type: LogType.ERROR,
          message: errorMessage,
          pos: this.currentNode.getStart(),
          code: '10101012',
          description: 'ArkTs InsightIntent Error'
        });
        return;
      }
      const validator: Function = paramValidators[paramName];
      if (ts.isIdentifier(prop.initializer)) {
        const symbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(prop.initializer);
        const declaration: ts.Declaration = symbol?.valueDeclaration;
        if (validator && !validator(declaration?.initializer)) {
          const errorMessage: string = `Param parsing occurs error param type, cause param: ${paramName.toString()}`;
          this.transformLog.push({
            type: LogType.ERROR,
            message: errorMessage,
            pos: this.currentNode.getStart(),
            code: '10101013',
            description: 'ArkTs InsightIntent Error'
          });
          return;
        }
      } else {
        if (validator && !validator(prop.initializer)) {
          const errorMessage: string = `Param parsing occurs error param type, cause param: ${paramName.toString()}`;
          this.transformLog.push({
            type: LogType.ERROR,
            message: errorMessage,
            pos: this.currentNode.getStart(),
            code: '10101013',
            description: 'ArkTs InsightIntent Error'
          });
          return;
        }
      }
    }
  }

  private analyzeDecoratorArgs<T>(args: ts.NodeArray<ts.Expression>, intentObj: object,
    paramChecker: ParamChecker<T>): void {
    args.forEach(arg => {
      if (ts.isIdentifier(arg)) {
        const symbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(arg);
        const declaration: ts.Declaration = symbol?.valueDeclaration;
        this.validateRequiredIntentLinkInfo<T>(declaration.initializer, paramChecker);
      } else {
        this.validateRequiredIntentLinkInfo<T>(arg, paramChecker);
      }
      const res: StaticValue = this.parseStaticObject(arg);
      Object.assign(intentObj, res);
      this.collectSchemaInfo(intentObj);
    });
  }

  private createObfuscation(classNode: ts.Node): void {
    ProjectCollections.projectWhiteListManager?.fileWhiteListInfo.fileKeepInfo.arkUIKeepInfo.globalNames.add(classNode.name.text);
    const isExported: boolean = classNode.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
    if (isExported) {
      ProjectCollections.projectWhiteListManager?.fileWhiteListInfo.fileKeepInfo.arkUIKeepInfo.propertyNames.add(classNode.name.text);
    }
    classNode.members.forEach(member => {
      if (ts.isPropertyDeclaration(member) && member.name || ts.isFunctionDeclaration(member) ||
      ts.isMethodDeclaration(member) ||
      ts.isGetAccessor(member) || ts.isSetAccessor(member)) {
        const propName: string = member.name.getText();
        ProjectCollections.projectWhiteListManager?.fileWhiteListInfo.fileKeepInfo.arkUIKeepInfo.propertyNames.add(propName);
      }
    });
  }

  private parseStaticObject(node: ts.Node, visited: Set<ts.Node> = new Set()): StaticValue | undefined {
    if (visited.has(node)) {
      const errorMessage: string = `Circular reference detected in param`;
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101023',
        description: 'ArkTs InsightIntent Error'
      });
      return undefined;
    }
    visited.add(node);
    const literalValue: StaticValue | undefined = this.parseLiteralValue(node);
    if (literalValue !== undefined) {
      return literalValue;
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
    if (ts.isPropertyAccessExpression(node)) {
      return this.processEnumElement(node);
    }
    const errorMessage: string = `Unsupported parameter type cannot be parsed, cause param: ${node.text}`;
    this.transformLog.push({
      type: LogType.ERROR,
      message: errorMessage,
      pos: this.currentNode.getStart(),
      code: '10101014',
      description: 'ArkTs InsightIntent Error'
    });
    return undefined;
  }

  private parseLiteralValue(node: ts.Node): StaticValue | undefined {
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
    return undefined;
  }

  private processEnumElement(node: ts.PropertyAccessExpression): string {
    const enumValue: string = node?.getText().split('.').pop();
    const executeModeEnum: Map<string, string> = new Map();
    executeModeEnum.set('UI_ABILITY_FOREGROUND', '0');
    executeModeEnum.set('UI_ABILITY_BACKGROUND', '1');
    executeModeEnum.set('UI_EXTENSION_ABILITY', '2');
    executeModeEnum.set('SERVICE_EXTENSION_ABILITY', '3');
    const paramCategoryEnum: Map<string, string> = new Map();
    paramCategoryEnum.set('LINK', 'link');
    paramCategoryEnum.set('WANT', 'want');
    if (executeModeEnum.has(enumValue)) {
      return executeModeEnum.get(enumValue);
    } else if (paramCategoryEnum.has(enumValue)) {
      return paramCategoryEnum.get(enumValue);
    } else {
      const errorMessage: string = `Unsupported parameter type cannot be parsed, cause param: ${node.text}`;
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101014',
        description: 'ArkTs InsightIntent Error'
      });
      return '';
    }
  }

  private processObjectElements(elements: ts.ObjectLiteralExpression): { [key: string]: StaticValue } {
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

  private processArrayElements(elements: readonly ts.Node[]): StaticValue[] {
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

  private parsePropertyKey(node: ts.PropertyName): string | undefined {
    if (ts.isLiteralExpression(node)) {
      return node.text;
    }

    if (ts.isIdentifier(node)) {
      return node.text;
    }
    return undefined;
  }

  private processExecuteModeParam(intentObj: object): void {
    if (intentObj.executeMode) {
      intentObj.executeMode.forEach((item: string, index: number) => {
        if (item === '0') {
          intentObj.executeMode[index] = 'foreground';
        }
        if (item === '1') {
          intentObj.executeMode[index] = 'background';
        }
        if (item === '2') {
          intentObj.executeMode[index] = 'uiextension';
        }
        if (item === '3') {
          intentObj.executeMode[index] = 'serviceextension';
        }
      });
    }
  }

  private collectSchemaInfo(intentObj: object): void {
    if (intentObj.schema) {
      const schemaPath: string = path.join(
        __dirname, '../../insight_intents/schema',
        `${intentObj.schema}_${intentObj.intentVersion}.json`
      );
      if (fs.existsSync(schemaPath)) {
        const schemaContent: string = fs.readFileSync(schemaPath, 'utf-8');
        const schemaObj: object = JSON.parse(schemaContent);
        intentObj.parameters = schemaObj.parameters;
        intentObj.llmDescription = schemaObj.llmDescription;
        intentObj.keywords = schemaObj.keywords;
        intentObj.intentName = schemaObj.intentName;
        intentObj.result = schemaObj.result;
        intentObj.example = schemaObj.example;
      }
    }
  }

  private verifyInheritanceChain(): void {
    this.EntityHeritageClassSet.forEach(entityClassInfo => {
      if (!this.heritageClassSet.has(entityClassInfo)) {
        const errorMessage: string =
          `decorated with @InsightIntentEntity must be ultimately inherited to insightIntent.IntentEntity`;
        this.transformLog.push({
          type: LogType.ERROR,
          message: errorMessage,
          pos: this.currentNode.getStart(),
          code: '10101009',
          description: 'ArkTs InsightIntent Error'
        });
        return;
      }
    });
  }

  private schemaValidationRequiredRule(schemaData: Record<string, string>, schemaObj: object): void {
    const reqData: Map<string, boolean> = new Map();
    schemaObj.required.forEach(key => reqData.set(key, true));
    if (schemaObj.properties) {
      const paramsSchema: object = schemaObj.properties;
      const keyArr: string[] = Object.keys(paramsSchema);
      keyArr.forEach(key => {
        if (!schemaData[key] && reqData.get(key)) {
          const errorMessage: string = `Schema verification required parameter does not exist`;
          this.transformLog.push({
            type: LogType.ERROR,
            message: errorMessage,
            pos: this.currentNode.getStart(),
            code: '10101016',
            description: 'ArkTs InsightIntent Error'
          });
          return;
        }
      });
    }
  }

  private schemaPropertiesValidation(schemaData: Record<string, string>, schemaObj: object): void {
    if (schemaObj.properties) {
      Object.entries(schemaObj.properties).forEach(([key, value]) => {
        if (schemaData[key] && value.type !== schemaData[key]) {
          const errorMessage: string = `Schema verification parameter type error`;
          this.transformLog.push({
            type: LogType.ERROR,
            message: errorMessage,
            pos: this.currentNode.getStart(),
            code: '10101017',
            description: 'ArkTs InsightIntent Error'
          });
          return;
        }
      });
    }
  }

  private schemaValidateRules(schemaData: Record<string, string>, schemaObj: object): void {
    const schemaKeys: string[] = Object.keys(schemaData);
    if (schemaObj.oneOf) {
      let count: number = 0;
      const requiredOne: string[][] = schemaObj.oneOf.map(item => item.required);
      requiredOne.forEach(val => {
        const isContain: boolean = val.every((item): boolean => {
          return schemaKeys.includes(item);
        });
        if (isContain) {
          count++;
        }
      });
      if (count !== 1) {
        const errorMessage: string = `Not meeting the one of schema verification rules`;
        this.transformLog.push({
          type: LogType.ERROR,
          message: errorMessage,
          pos: this.currentNode.getStart(),
          code: '10101024',
          description: 'ArkTs InsightIntent Error'
        });
        return;
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
        const errorMessage: string = `Not meeting the any of schema verification rules`;
        this.transformLog.push({
          type: LogType.ERROR,
          message: errorMessage,
          pos: this.currentNode.getStart(),
          code: '10101018',
          description: 'ArkTs InsightIntent Error'
        });
        return;
      }
    }
  }

  private schemaValidateSync(schemaData: Record<string, string>, schemaObj: object): void {
    if (!schemaObj) {
      return;
    }
    if (schemaObj.additionalProperties === false) {
      this.schemaAdditionalPropertiesValidation(schemaData, schemaObj.properties);
    }
    if (schemaObj.items && schemaObj.items.type === 'array') {
      this.schemaValidateSync(schemaData, schemaObj.items.items);
    }
    if (schemaObj.type !== 'object') {
      const errorMessage: string = `Schema root type must be object`;
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101019',
        description: 'ArkTs InsightIntent Error'
      });
      return;
    }
    if (schemaObj.properties) {
      const items: string[] = Object.keys(schemaObj.properties);
      if (items.length === 1 && items[0].type === 'array') {
        this.schemaValidateSync(schemaData, items[0].items);
      } else {
        this.schemaPropertiesValidation(schemaData, schemaObj);
      }
    }
    if (schemaObj.required) {
      this.schemaValidationRequiredRule(schemaData, schemaObj);
    }
    this.schemaValidateRules(schemaData, schemaObj);
  }

  private schemaAdditionalPropertiesValidation(schemaData, schemaProps): void {
    for (const key of Object.keys(schemaData)) {
      if (!schemaProps[key]) {
        const errorMessage: string = `Schema does not allow more parameters`;
        this.transformLog.push({
          type: LogType.ERROR,
          message: errorMessage,
          pos: this.currentNode.getStart(),
          code: '10101025',
          description: 'ArkTs InsightIntent Error'
        });
        return;
      }
    }
  }

  private processEntityOwnerMap(): void {
    for (const [intentName, entityClassNames] of this.entityOwnerMap.entries()) {
      const expandedClassNames = new Set<string>(entityClassNames);
      entityClassNames.forEach(className => {
        this.visitEntityHeritage(className, expandedClassNames);
      });
      if (expandedClassNames.size > entityClassNames.length) {
        this.entityOwnerMap.set(intentName, Array.from(expandedClassNames));
      }
    }
  }

  private visitEntityHeritage(className: string, expandedClassNames: Set<string>): void {
    const parentClassName: string = this.EntityExtendsMap.get(className);
    if (parentClassName && !expandedClassNames.has(parentClassName)) {
      expandedClassNames.add(parentClassName);
      this.visitEntityHeritage(parentClassName, expandedClassNames);
    }
  }

  private matchEntities(): void {
    if (this.entityMap.size === 0) {
      return;
    }
    this.processEntityOwnerMap();
    const intentNameMappingMap = new Map();
    this.intentData.forEach(data => {
      intentNameMappingMap.set(data.intentName, data);
    });
    for (const [intentName, entityIds] of this.entityOwnerMap.entries()) {
      const targetIntent: object = intentNameMappingMap.get(intentName);
      if (!targetIntent) {
        continue;
      }
      const matchedEntities: object[] = [];
      entityIds.forEach(id => {
        if (this.entityMap.has(id)) {
          matchedEntities.push(this.entityMap.get(id));
        }
      });
      if (matchedEntities.length !== 0) {
        targetIntent.entities = matchedEntities;
      }
    }
  }

  // This method writes the parsed data to a file.
  public writeUserIntentJsonFile(harIntentDataObj: object): void {
    const cachePath: string =
      path.join(projectConfig.cachePath, 'insight_compile_cache.json'); // Compiled cache file
    if (!(fs.existsSync(cachePath) || this.intentData.length > 0 || Object.keys(harIntentDataObj).length !== 0)) {
      return;
    }
    this.verifyInheritanceChain();
    const mergedData: object = this.processIntentData(harIntentDataObj);
    const cacheSourceMapPath: string =
      path.join(projectConfig.aceProfilePath, 'insight_intent.json'); // The user's intents configuration file
    try {
      if (this.intentData.length > 0) {
        fs.writeFileSync(cacheSourceMapPath, JSON.stringify(mergedData, null, 2), 'utf-8');
        fs.writeFileSync(cachePath, JSON.stringify({ 'extractInsightIntents': this.intentData }, null, 2), 'utf-8');
      } else if (fs.existsSync(cacheSourceMapPath)) {
        fs.unlinkSync(cacheSourceMapPath);
      }
      const normalizedPath: string = path.normalize(projectConfig.aceProfilePath);
      const fullPath: string = path.join(normalizedPath, '../../../module.json');
      if (fs.existsSync(fullPath)) {
        const rawData: string = fs.readFileSync(fullPath, 'utf8');
        const jsonData: object = JSON.parse(rawData);
        if (jsonData?.module) {
          jsonData.module.hasInsightIntent = this.intentData.length > 0 ? true : undefined;
        }
        const updatedJson: string = JSON.stringify(jsonData, null, 2);
        fs.writeFileSync(fullPath, updatedJson, 'utf8');
      }
    } catch (e) {
      const errorMessage: string = `Internal error writeFile error`;
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101020',
        description: 'ArkTs InsightIntent Error'
      });
      return;
    }
  }

  private processIntentData(harIntentDataObj: object): object {
    this.matchEntities();
    if (!projectConfig.aceProfilePath) {
      const errorMessage: string = `Internal error aceProfilePath not found`;
      this.transformLog.push({
        type: LogType.ERROR,
        message: errorMessage,
        pos: this.currentNode.getStart(),
        code: '10101020',
        description: 'ArkTs InsightIntent Error'
      });
      return null;
    }
    const cacheSourceMapPath: string =
      path.join(projectConfig.aceProfilePath, 'insight_intent.json'); // The user's intents configuration file
    const cachePath: string = path.join(projectConfig.cachePath, 'insight_compile_cache.json'); // Compiled cache file
    if (!fs.existsSync(projectConfig.aceProfilePath)) {
      fs.mkdirSync(projectConfig.aceProfilePath, { recursive: true });
    }
    if (this.isUpdateCompile && fs.existsSync(cachePath)) {
      const cacheData: string = fs.readFileSync(cachePath, 'utf8');
      const cacheDataObj: object = JSON.parse(cacheData);
      const insightIntents: object[] = cacheDataObj.extractInsightIntents.filter(insightIntent => {
        return !this.updatePageIntentObj.has(insightIntent.decoratorFile);
      });
      this.updatePageIntentObj.forEach(insightIntent => {
        insightIntents.push(...insightIntent);
      });
      this.intentData = insightIntents;
    }
    let writeJsonData: object = {};
    if (fs.existsSync(cacheSourceMapPath)) {
      const originIntents: string = fs.readFileSync(cacheSourceMapPath, 'utf8');
      const jsonData: object = JSON.parse(originIntents);
      Object.assign(jsonData, {
        'extractInsightIntents': this.intentData
      });
      writeJsonData = jsonData;
    } else {
      Object.assign(writeJsonData, {
        'extractInsightIntents': this.intentData
      });
    }
    const mergedData: object = this.mergeHarData(writeJsonData, harIntentDataObj);
    this.validateIntentIntentName(writeJsonData);
    return mergedData;
  }

  private mergeHarData(writeJsonData: object, harIntentDataObj: object): object {
    let mergedData: object = {};
    if (writeJsonData) {
      mergedData = JSON.parse(JSON.stringify(writeJsonData));
    }
    Object.keys(harIntentDataObj || {})?.forEach(harName => {
      if (harIntentDataObj[harName].extractInsightIntents) {
        harIntentDataObj[harName].extractInsightIntents.forEach(intentObj => {
          intentObj.moduleName = projectConfig.moduleName;
          intentObj.bundleName = projectConfig.bundleName;
        });
        if (harIntentDataObj[harName].extractInsightIntents) {
          mergedData.extractInsightIntents?.push(...harIntentDataObj[harName].extractInsightIntents);
        }
      }
    });
    return mergedData;
  }

  // This method get the user's intents from the bytecode HAR package.
  public getHarData(): object {
    const harIntentDataObj: object = {};
    if (fs.existsSync(projectConfig.aceBuildJson)) {
      const loaderJson: string = fs.readFileSync(projectConfig.aceBuildJson, 'utf8');
      const { byteCodeHarInfo } = JSON.parse(loaderJson);
      Object.keys(byteCodeHarInfo || {})?.forEach((harName) => {
        const harAbcFilePath = byteCodeHarInfo[harName].abcPath as string;
        const harModulePath: string = harAbcFilePath.split('ets')[0];
        const harSourcePath: string = path.join(harModulePath, 'src', 'main', 'resources', 'base', 'profile');
        const intentDataSourcePath: string = path.join(harSourcePath, 'insight_intent.json');
        let harIntentData: object = {};
        if (fs.existsSync(intentDataSourcePath)) {
          harIntentData = JSON.parse(fs.readFileSync(intentDataSourcePath, 'utf8')) as object;
        }
        Object.assign(harIntentDataObj, {
          harName: harIntentData
        });
      });
    }
    return harIntentDataObj;
  }

  private validateIntentIntentName(writeJsonData: object): void {
    const duplicates = new Set<string>();
    writeJsonData.insightIntents?.forEach(insightIntent => {
      duplicates.add(insightIntent.intentName);
    });
    writeJsonData.extractInsightIntents.forEach(item => {
      if (duplicates.has(item.intentName)) {
        const errorMessage: string = `User intents has duplicate intentName param`;
        this.transformLog.push({
          type: LogType.ERROR,
          message: errorMessage,
          pos: this.currentNode.getStart(),
          code: '10101021',
          description: 'ArkTs InsightIntent Error'
        });
        return;
      } else if (item.intentName !== undefined) {
        duplicates.add(item.intentName);
      }
    });
  }

  public clear(): void {
    this.intentData = [];
    this.checker = null;
    this.currentFilePath = '';
    this.heritageClassSet = new Set<string>();
    this.heritageClassSet.add('IntentEntity_sdk');
    this.heritageClassSet.add('InsightIntentEntryExecutor_sdk');
    this.isInitCache = false;
    this.isUpdateCompile = true;
    this.updatePageIntentObj = new Map();
    this.entityMap = new Map();
    this.entityOwnerMap = new Map();
    this.moduleJsonInfo = new Map();
    this.EntityHeritageClassSet = new Set();
    this.EntityExtendsMap = new Map();
  }
}

export default new ParseIntent();
