/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

import ts from 'typescript';
import path from 'path';

import { componentCollection } from './validate_ui_syntax';
import { processComponentClass } from './process_component_class';
import processImport from './process_import';
import {
  PAGE_ENTRY_FUNCTION_NAME,
  COMPONENT_CONSTRUCTOR_UNDEFINED,
  BUILD_ON,
  COMPONENT_BUILD_FUNCTION,
  COMPONENT_BUILDER_DECORATOR,
  COMPONENT_EXTEND_DECORATOR,
  RESOURCE,
  RESOURCE_TYPE,
  WORKER_OBJECT,
  RESOURCE_NAME_ID,
  RESOURCE_NAME_TYPE,
  RESOURCE_NAME_PARAMS,
  RESOURCE_RAWFILE
} from './pre_define';
import {
  componentInfo,
  LogInfo,
  LogType,
  hasDecorator,
  FileLog
} from './utils';
import {
  getName,
  isAttributeNode,
  processComponentBlock,
  bindComponentAttr,
  appComponentCollection
} from './process_component_build';
import {
  BUILDIN_CONTAINER_COMPONENT,
  CUSTOM_BUILDER_METHOD,
  EXTEND_ATTRIBUTE,
  JS_BIND_COMPONENTS
} from './component_map';
import { resources } from '../main';

export const transformLog: FileLog = new FileLog();

export function processUISyntax(program: ts.Program, ut = false): Function {
  return (context: ts.TransformationContext) => {
    let pagesDir: string;
    return (node: ts.SourceFile) => {
      pagesDir = path.resolve(path.dirname(node.fileName));
      if (process.env.compiler === BUILD_ON) {
        if (!ut && (path.basename(node.fileName) === 'app.ets.ts' || !/\.ets\.ts$/.test(node.fileName))) {
          return node;
        }
        collectComponents(node);
        transformLog.sourceFile = node;
        validateSourceFileNode(node);
        node = createEntryNode(node, context);
        node = ts.visitEachChild(node, processAllNodes, context);
        return node;
      } else {
        return node;
      }
    };
    function processAllNodes(node: ts.Node): ts.Node {
      if (ts.isImportDeclaration(node) || ts.isImportEqualsDeclaration(node)) {
        processImport(node, pagesDir, transformLog.errors);
      } else if (ts.isClassDeclaration(node) && node.name &&
        componentCollection.customComponents.has(node.name.getText())) {
        componentCollection.currentClassName = node.name.getText();
        node = processComponentClass(node, context, transformLog.errors, program);
        componentCollection.currentClassName = null;
      } else if (ts.isFunctionDeclaration(node)) {
        if (hasDecorator(node, COMPONENT_EXTEND_DECORATOR)) {
          node = processExtend(node, transformLog.errors);
        } else if (hasDecorator(node, COMPONENT_BUILDER_DECORATOR) && node.name && node.body &&
          ts.isBlock(node.body)) {
          CUSTOM_BUILDER_METHOD.add(node.name.getText());
          node = ts.factory.updateFunctionDeclaration(node, undefined, node.modifiers,
            node.asteriskToken, node.name, node.typeParameters, node.parameters, node.type,
            processComponentBlock(node.body, false, transformLog.errors));
        }
      } else if (isResource(node)) {
        node = processResourceData(node as ts.CallExpression);
      } else if (isWorker(node)) {
        node = processWorker(node as ts.NewExpression);
      }
      return ts.visitEachChild(node, processAllNodes, context);
    }
    function validateSourceFileNode(node: ts.SourceFile): void {
      if (program) {
        node = ts.visitEachChild(node, validateAllNodes, context);
      }
    }
    function validateAllNodes(node: ts.Node): ts.Node {
      if (ts.isMethodDeclaration(node) && node.name &&
        node.name.getText() === COMPONENT_BUILD_FUNCTION && node.body && ts.isBlock(node.body)) {
        const typeChecker: ts.TypeChecker = program.getTypeChecker();
        validateBody(node.body, typeChecker);
        return node;
      }
      return ts.visitEachChild(node, validateAllNodes, context);
    }
  };
}

function collectComponents(node: ts.SourceFile): void {
  // @ts-ignore
  if (node.identifiers && node.identifiers.size) {
    // @ts-ignore
    for (let key of node.identifiers.keys()) {
      if (JS_BIND_COMPONENTS.has(key)) {
        appComponentCollection.add(key);
      }
    }
  }
}

function isResource(node: ts.Node): boolean {
  return ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
    (node.expression.escapedText.toString() === RESOURCE ||
    node.expression.escapedText.toString() === RESOURCE_RAWFILE) && node.arguments.length > 0;
}

function processResourceData(node: ts.CallExpression): ts.Node {
  if (ts.isStringLiteral(node.arguments[0])) {
    if (node.expression.getText() === RESOURCE_RAWFILE) {
      return createResourceParam(0, RESOURCE_TYPE.rawfile, [node.arguments[0]]);
    } else {
      // @ts-ignore
      const resourceData: string[] = node.arguments[0].text.trim().split('.');
      if (validateResourceData(resourceData, resources, node.arguments[0].getStart())) {
        const resourceType: number = RESOURCE_TYPE[resourceData[1]];
        const resourceValue: number = resources[resourceData[0]][resourceData[1]][resourceData[2]];
        return createResourceParam(resourceValue, resourceType,
          Array.from(node.arguments).slice(1));
      }
    }
  }
  return node;
}

function createResourceParam(resourceValue: number, resourceType: number,argsArr: ts.Expression[]):
  ts.ObjectLiteralExpression {
  const resourceParams: ts.ObjectLiteralExpression = ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment(
        ts.factory.createStringLiteral(RESOURCE_NAME_ID),
        ts.factory.createNumericLiteral(resourceValue)
      ),
      ts.factory.createPropertyAssignment(
        ts.factory.createStringLiteral(RESOURCE_NAME_TYPE),
        ts.factory.createNumericLiteral(resourceType)
      ),
      ts.factory.createPropertyAssignment(
        ts.factory.createIdentifier(RESOURCE_NAME_PARAMS),
        ts.factory.createArrayLiteralExpression(
          argsArr,
          false
        )
      )
    ],
    false
  );
  return resourceParams;
}

function validateResourceData(resourceData: string[], resources: object, pos: number): boolean {
  if (resourceData.length !== 3) {
    transformLog.errors.push({
      type: LogType.ERROR,
      message: 'The input parameter is not supported.',
      pos: pos
    });
  } else if (!resources[resourceData[0]]) {
    transformLog.errors.push({
      type: LogType.ERROR,
      message: `The value of '${resourceData[0]}' is invalid.`,
      pos: pos
    });
  } else if (!resources[resourceData[0]][resourceData[1]]) {
    transformLog.errors.push({
      type: LogType.ERROR,
      message: `Value '${resourceData[1]}' does not exist on type 'typeof ${resourceData[0]}'.`,
      pos: pos
    });
  } else if (!resources[resourceData[0]][resourceData[1]][resourceData[2]]) {
    transformLog.errors.push({
      type: LogType.ERROR,
      message: `Value '${resourceData[2]}' does not exist on type 'typeof ${resourceData[1]}'.`,
      pos: pos
    });
  } else {
    return true;
  }
  return false;
}

function isWorker(node: ts.Node): boolean {
  return ts.isNewExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.name) &&
    node.expression.name.escapedText.toString() === WORKER_OBJECT;
}

function processWorker(node: ts.NewExpression): ts.Node {
  if (node.arguments.length && ts.isStringLiteral(node.arguments[0])) {
    const args: ts.Expression[] = Array.from(node.arguments);
    // @ts-ignore
    const workerPath: string = node.arguments[0].text;
    const stringNode: ts.StringLiteral = ts.factory.createStringLiteral(
      workerPath.replace(/\.ts$/, '.js'));
    args.splice(0, 1, stringNode);
    return ts.factory.updateNewExpression(node, node.expression, node.typeArguments, args);
  }
  return node;
}

function processExtend(node: ts.FunctionDeclaration, log: LogInfo[]): ts.FunctionDeclaration {
  const componentName: string = isExtendFunction(node);
  if (componentName) {
    const statementArray: ts.Statement[] = [];
    bindComponentAttr(node.body.statements[0] as ts.ExpressionStatement,
      ts.factory.createIdentifier(componentName), statementArray, log);
    return ts.factory.updateFunctionDeclaration(node, undefined, node.modifiers, node.asteriskToken,
      node.name, node.typeParameters, node.parameters, node.type,
      ts.factory.updateBlock(node.body, statementArray));
  }
}

function isExtendFunction(node: ts.FunctionDeclaration): string {
  if (ts.isBlock(node.body) && node.body.statements && node.body.statements.length === 1 &&
  ts.isExpressionStatement(node.body.statements[0]) &&
  // @ts-ignore
  ts.isCallExpression(node.body.statements[0].expression) && ts.isIdentifier(node.name)) {
    const nameArray: string[] = node.name.getText().split('__');
    if (nameArray.length === 3 && !nameArray[0] && EXTEND_ATTRIBUTE.has(nameArray[1])) {
      const attributeArray: string[] =
        [...EXTEND_ATTRIBUTE.get(nameArray[1])].map(item => item.attribute);
      if (attributeArray.includes(nameArray[2])) {
        return nameArray[1];
      }
    }
  }
}

function createEntryNode(node: ts.SourceFile, context: ts.TransformationContext): ts.SourceFile {
  if (componentCollection.entryComponent && !componentCollection.previewComponent) {
    const entryNode: ts.ExpressionStatement =
      createEntryFunction(componentCollection.entryComponent, context);
    return context.factory.updateSourceFile(node, [...node.statements, entryNode]);
  } else if (componentCollection.entryComponent && componentCollection.previewComponent) {
    const entryNode: ts.ExpressionStatement =
      createEntryFunction(componentCollection.previewComponent, context);
    return context.factory.updateSourceFile(node, [...node.statements, entryNode]);
  } else {
    return node;
  }
}

function validateBody(node: ts.Block, typeChecker: ts.TypeChecker): void {
  if (node.statements.length) {
    node.statements.forEach((item, index, arr) => {
      if (ts.isBlock(item)) {
        validateBody(item, typeChecker);
      }
      if (index + 2 < arr.length && ts.isExpressionStatement(item) &&
        isAttributeBlockNode(item, arr as ts.Statement[], index) &&
        ts.isCallExpression(item.expression) && ts.isIdentifier(item.expression.expression)) {
        const componentName: string = item.expression.expression.getText();
        const type: ts.Type = typeChecker.getTypeAtLocation(item.expression);
        let temp: any = arr[index + 2];
        let name: string;
        while (temp) {
          if (ts.isCallExpression(temp)) {
            if (ts.isPropertyAccessExpression(temp.expression)) {
              const pos: number = temp.expression.name.getStart();
              name = temp.expression.name.getText();
              validateSymbol(isPropertyExist(typeChecker, pos, type, name, componentName),
                temp.arguments, pos, typeChecker);
            } else if (ts.isIdentifier(temp.expression)) {
              const pos: number = temp.expression.getStart();
              name = temp.expression.getText();
              validateSymbol(isPropertyExist(typeChecker, pos, type, name, componentName),
                temp.arguments, pos, typeChecker);
              break;
            }
          }
          temp = temp.expression;
        }
      }
    });
  }
}

function validateSymbol(type: ts.Symbol, args: ts.NodeArray<ts.Expression>,
  argPos: number, typeChecker: ts.TypeChecker): void {
  // @ts-ignore
  if (type && type.valueDeclaration.parameters) {
    // @ts-ignore
    const parameters: ts.ParameterDeclaration[] = type.valueDeclaration.parameters;
    const maxLength: number = parameters.length;
    const minLength: number = getMinLength(parameters);
    if (args.length < minLength || args.length > maxLength) {
      let message:string;
      if (maxLength !== minLength) {
        message = `TS2554: Expected ${minLength}-${maxLength} arguments, but got ${args.length}.`;
      } else {
        message = `TS2554: Expected ${maxLength} arguments, but got ${args.length}.`;
      }
      transformLog.errors.push({
        type: LogType.ERROR,
        message: message,
        pos: argPos
      });
    } else {
      for (let i = 0; i < parameters.length; i++) {
        validatePropertyType(parameters[i], args[i], typeChecker);
      }
    }
  }
}

function getMinLength(parameters: ts.ParameterDeclaration[]): number {
  let length: number = parameters.length;
  parameters.forEach((item: ts.ParameterDeclaration) => {
    if (item.questionToken !== undefined) {
      length--;
    }
  });
  return length;
}

function isPropertyExist(typeChecker: ts.TypeChecker, pos: number, type: ts.Type,
  propertyName: string, componentName: string): ts.Symbol {
  const symbol: ts.Symbol = typeChecker.getPropertyOfType(type, propertyName);
  if (symbol) {
    return symbol;
  } else {
    transformLog.errors.push({
      type: LogType.ERROR,
      message: `TS2339: Property '${propertyName}' does not exist on type '${componentName}'.`,
      pos: pos
    });
  }
  return null;
}

function validatePropertyType(param: ts.ParameterDeclaration, arg: ts.Expression,
  typeChecker: ts.TypeChecker): void {
  const argLocalType: ts.Type = typeChecker.getTypeAtLocation(arg);
  const paramLocalType: ts.Type = typeChecker.getTypeAtLocation(param.type);
  const argType: ts.Type = typeChecker.getBaseTypeOfLiteralType(typeChecker.getTypeAtLocation(arg));
  // @ts-ignore
  const intrinsicName: string = argType.intrinsicName;
  const argTypeName: string = intrinsicName || typeChecker.typeToString(argLocalType);
  // @ts-ignore
  if (!typeChecker.isTypeAssignableTo(argLocalType, paramLocalType)) {
    generateArgumentLog(arg, argTypeName, typeChecker.typeToString(paramLocalType));
  }
}

function generateArgumentLog(arg: ts.Expression, argTypeName: string, paramTypeName: string): void {
  transformLog.errors.push({
    type: LogType.ERROR,
    message: `TS2345: Argument of type '${argTypeName}' is not assignable to parameter of type '${paramTypeName}'.`,
    pos: arg.getStart()
  });
}

function isAttributeBlockNode(node: ts.ExpressionStatement, arr: ts.Statement[], index: number): boolean {
  const attributeNode: ts.Node = arr[index + 2];
  return BUILDIN_CONTAINER_COMPONENT.has(getName(node)) && ts.isBlock(arr[index + 1])
    && ts.isExpressionStatement(attributeNode) && isAttributeNode(attributeNode);
}

function createEntryFunction(name: string, context: ts.TransformationContext)
  : ts.ExpressionStatement {
  return context.factory.createExpressionStatement(context.factory.createCallExpression(
    context.factory.createIdentifier(PAGE_ENTRY_FUNCTION_NAME), undefined,
    [context.factory.createNewExpression(context.factory.createIdentifier(name), undefined,
      [context.factory.createStringLiteral((++componentInfo.id).toString()),
        context.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED),
        context.factory.createObjectLiteralExpression([], false)])]));
}

export function resetLog(): void {
  transformLog.errors = [];
}
