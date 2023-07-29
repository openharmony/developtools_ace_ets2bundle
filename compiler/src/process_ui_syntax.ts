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

import {
  PAGE_ENTRY_FUNCTION_NAME,
  PREVIEW_COMPONENT_FUNCTION_NAME,
  STORE_PREVIEW_COMPONENTS,
  GET_PREVIEW_FLAG_FUNCTION_NAME,
  COMPONENT_CONSTRUCTOR_UNDEFINED,
  BUILD_ON,
  COMPONENT_BUILDER_DECORATOR,
  COMPONENT_CONCURRENT_DECORATOR,
  COMPONENT_EXTEND_DECORATOR,
  COMPONENT_STYLES_DECORATOR,
  RESOURCE,
  RESOURCE_TYPE,
  WORKER_OBJECT,
  RESOURCE_NAME_ID,
  RESOURCE_NAME_TYPE,
  RESOURCE_NAME_PARAMS,
  RESOURCE_RAWFILE,
  RESOURCE_NAME_BUNDLE,
  RESOURCE_NAME_MODULE,
  ATTRIBUTE_ANIMATETO,
  GLOBAL_CONTEXT,
  CHECK_COMPONENT_EXTEND_DECORATOR,
  INSTANCE,
  SET_CONTROLLER_CTR_TYPE,
  SET_CONTROLLER_METHOD,
  JS_DIALOG,
  CUSTOM_DIALOG_CONTROLLER_BUILDER,
  ESMODULE,
  ARK,
  EXTNAME_ETS,
  GENERATE_ID,
  _GENERATE_ID,
  VIEWSTACKPROCESSOR,
  STARTGETACCESSRECORDINGFOR,
  ALLOCATENEWELMETIDFORNEXTCOMPONENT,
  STOPGETACCESSRECORDING,
  CARD_ENTRY_FUNCTION_NAME,
  CARD_LOG_TYPE_COMPONENTS,
  CARD_LOG_TYPE_DECORATORS,
  CARD_LOG_TYPE_IMPORT,
  COMPONENT_ANIMATABLE_EXTEND_DECORATOR,
  CHECK_EXTEND_DECORATORS,
  ELMTID,
  ROUTENAME_NODE,
  STORAGE_NODE,
  STORAGE,
  REGISTER_NAMED_ROUTE,
  ROUTE_NAME,
  PAGE_PATH,
  ISINITIALRENDER,
  CREATE_ANIMATABLE_PROPERTY,
  COMPONENT_CREATE_FUNCTION,
  COMPONENT_POP_FUNCTION,
  UPDATE_ANIMATABLE_PROPERTY,
  VIEW_STACK_PROCESSOR,
  GET_AND_PUSH_FRAME_NODE,
  COMPONENT_CONSTRUCTOR_PARENT,
  FINISH_UPDATE_FUNC,
} from './pre_define';
import {
  componentInfo,
  LogInfo,
  LogType,
  hasDecorator,
  FileLog,
  getPossibleBuilderTypeParameter,
  storedFileInfo,
  ExtendResult,
} from './utils';
import { writeFileSyncByNode } from './process_module_files';
import {
  componentCollection,
  localStorageLinkCollection,
  localStoragePropCollection,
} from './validate_ui_syntax';
import {
  processComponentClass,
  createParentParameter,
  processBuildMember
} from './process_component_class';
import processImport from './process_import';
import {
  processComponentBlock,
  bindComponentAttr,
  getName,
  createViewStackProcessorStatement,
  createFunction
} from './process_component_build';
import {
  BUILDIN_STYLE_NAMES,
  CUSTOM_BUILDER_METHOD,
  EXTEND_ATTRIBUTE,
  INNER_STYLE_FUNCTION,
  GLOBAL_STYLE_FUNCTION,
  INTERFACE_NODE_SET,
  ID_ATTRS
} from './component_map';
import {
  resources,
  projectConfig,
  partialUpdateConfig
} from '../main';
import { createCustomComponentNewExpression, createViewCreate } from './process_component_member';
import { ModuleSourceFile } from './fast_build/ark_compiler/module/module_source_file';

export const transformLog: FileLog = new FileLog();
export let contextGlobal: ts.TransformationContext;
export let resourceFileName: string = '';
export const builderTypeParameter: {params: string[]} = {params: []};

export let hasTsNoCheckOrTsIgnoreFiles: string[] = [];

export function processUISyntax(program: ts.Program, ut = false): Function {
  let entryNodeKey: ts.Expression;
  return (context: ts.TransformationContext) => {
    contextGlobal = context;
    let pagesDir: string;
    return (node: ts.SourceFile) => {
      const hasTsNoCheckOrTsIgnore = ts.hasTsNoCheckOrTsIgnoreFlag(node);
      pagesDir = path.resolve(path.dirname(node.fileName));
      resourceFileName = path.resolve(node.fileName);
      if (process.env.compiler === BUILD_ON || process.env.compileTool === 'rollup') {
        transformLog.sourceFile = node;
        preprocessIdAttrs(node.fileName);
        if (!ut && (process.env.compileMode !== 'moduleJson' &&
          path.resolve(node.fileName) === path.resolve(projectConfig.projectPath, 'app.ets') ||
          /\.ts$/.test(node.fileName))) {
          node = ts.visitEachChild(node, processResourceNode, context);
          if (projectConfig.compileMode === ESMODULE) {
            if (projectConfig.processTs === true) {
              const processedNode: ts.SourceFile = ts.getTypeExportImportAndConstEnumTransformer(context)(node);
              if (process.env.compileTool === 'rollup') {
                hasTsNoCheckOrTsIgnore ? hasTsNoCheckOrTsIgnoreFiles.push(path.normalize(processedNode.fileName)) :
                  ModuleSourceFile.newSourceFile(path.normalize(processedNode.fileName), processedNode);
              } else {
                writeFileSyncByNode(processedNode, projectConfig);
              }
            }
          }
          return node;
        }
        const id: number = ++componentInfo.id;
        node = ts.visitEachChild(node, processAllNodes, context);
        node = createEntryNode(node, context, entryNodeKey, id);
        GLOBAL_STYLE_FUNCTION.forEach((block, styleName) => {
          BUILDIN_STYLE_NAMES.delete(styleName);
        });
        GLOBAL_STYLE_FUNCTION.clear();
        const statements: ts.Statement[] = Array.from(node.statements);
        if (!partialUpdateConfig.partialUpdateMode) {
          generateId(statements, node);
        }
        INTERFACE_NODE_SET.forEach(item => {
          statements.unshift(item);
        });
        node = ts.factory.updateSourceFile(node, statements);
        INTERFACE_NODE_SET.clear();
        if (projectConfig.compileMode === ESMODULE && projectConfig.processTs === true) {
          const processedNode: ts.SourceFile = ts.getTypeExportImportAndConstEnumTransformer(context)(node);
          if (process.env.compileTool === 'rollup') {
            hasTsNoCheckOrTsIgnore ? hasTsNoCheckOrTsIgnoreFiles.push(path.normalize(processedNode.fileName)) :
              ModuleSourceFile.newSourceFile(path.normalize(processedNode.fileName), processedNode);
          } else {
            writeFileSyncByNode(processedNode, projectConfig);
          }
        }
        return node;
      } else {
        return node;
      }
    };

    function entryKeyNode(node: ts.Node): ts.Expression {
      if (node && node.decorators && node.decorators.length) {
        node.decorators.forEach(item => {
          if (item.expression && ts.isCallExpression(item.expression) && ts.isIdentifier(item.expression.expression) &&
            item.expression.expression.escapedText.toString() === 'Entry' && item.expression.arguments &&
            item.expression.arguments.length && ts.isIdentifier(item.expression.arguments[0])) {
            entryNodeKey = item.expression.arguments[0];
          }
        });
      }
      return entryNodeKey;
    }

    function processAllNodes(node: ts.Node): ts.Node {
      if (ts.isImportDeclaration(node) || ts.isImportEqualsDeclaration(node) ||
        ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        processImport(node, pagesDir, transformLog.errors);
      } else if (ts.isStructDeclaration(node)) {
        componentCollection.currentClassName = node.name.getText();
        componentCollection.entryComponent === componentCollection.currentClassName && entryKeyNode(node);
        node = processComponentClass(node, context, transformLog.errors, program);
        componentCollection.currentClassName = null;
        INNER_STYLE_FUNCTION.forEach((block, styleName) => {
          BUILDIN_STYLE_NAMES.delete(styleName);
        });
        INNER_STYLE_FUNCTION.clear();
      } else if (ts.isFunctionDeclaration(node)) {
        if (hasDecorator(node, COMPONENT_EXTEND_DECORATOR, null, transformLog.errors)) {
          node = processExtend(node, transformLog.errors, COMPONENT_EXTEND_DECORATOR);
        } else if (hasDecorator(node, COMPONENT_BUILDER_DECORATOR) && node.name && node.body &&
          ts.isBlock(node.body)) {
          CUSTOM_BUILDER_METHOD.add(node.name.getText());
          builderTypeParameter.params = getPossibleBuilderTypeParameter(node.parameters);
          let parameters: ts.NodeArray<ts.ParameterDeclaration> =
            ts.factory.createNodeArray(Array.from(node.parameters));
          parameters.push(createParentParameter());
          node = ts.factory.updateFunctionDeclaration(node, undefined, node.modifiers,
            node.asteriskToken, node.name, node.typeParameters, parameters, node.type,
            processComponentBlock(node.body, false, transformLog.errors, false, true,
              node.name.getText(), undefined, true));
          builderTypeParameter.params = [];
          node = processBuildMember(node, context, transformLog.errors, true);
        } else if (hasDecorator(node, COMPONENT_STYLES_DECORATOR)) {
          if (node.parameters.length === 0) {
            node = undefined;
          } else {
            transformLog.errors.push({
              type: LogType.ERROR,
              message: `@Styles can't have parameters.`,
              pos: node.getStart()
            });
          }
        } else if (hasDecorator(node, COMPONENT_CONCURRENT_DECORATOR)) {
          // ark compiler's feature
          node = processConcurrent(node);
        } else if (hasDecorator(node, COMPONENT_ANIMATABLE_EXTEND_DECORATOR, null, transformLog.errors)) {
          node = processExtend(node, transformLog.errors, COMPONENT_ANIMATABLE_EXTEND_DECORATOR);
        }
      } else if (isResource(node)) {
        node = processResourceData(node as ts.CallExpression);
      } else if (isWorker(node)) {
        node = processWorker(node as ts.NewExpression);
      } else if (isAnimateTo(node)) {
        node = processAnimateTo(node as ts.CallExpression);
      } else if (isCustomDialogController(node)) {
        node = createCustomDialogController(node.parent, node, transformLog.errors);
      }
      return ts.visitEachChild(node, processAllNodes, context);
    }
    function processResourceNode(node: ts.Node): ts.Node {
      if (isResource(node)) {
        node = processResourceData(node as ts.CallExpression);
      }
      return ts.visitEachChild(node, processResourceNode, context);
    }
  };
}

function generateId(statements: ts.Statement[], node: ts.SourceFile): void {
  statements.unshift(
    ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(_GENERATE_ID),
          undefined,
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
          ts.factory.createNumericLiteral('0')
        )],
        ts.NodeFlags.Let
      )
    ),
    ts.factory.createFunctionDeclaration(
      undefined,
      undefined,
      undefined,
      ts.factory.createIdentifier(GENERATE_ID),
      undefined,
      [],
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
      ts.factory.createBlock(
        [ts.factory.createReturnStatement(ts.factory.createBinaryExpression(
          ts.factory.createStringLiteral(path.basename(node.fileName, EXTNAME_ETS) + '_'),
          ts.factory.createToken(ts.SyntaxKind.PlusToken), ts.factory.createPrefixUnaryExpression(
            ts.SyntaxKind.PlusPlusToken,
            ts.factory.createIdentifier(_GENERATE_ID)
          )))],
        true
      )
    )
  );
}

function preprocessIdAttrs(fileName: string): void {
  for (const [id, idInfo] of ID_ATTRS) {
    if (fileName === idInfo.get('path')) {
      ID_ATTRS.delete(id);
    }
  }
}

function isCustomDialogController(node: ts.Expression) {
  const tempParent: ts.Node = node.parent;
  // @ts-ignore
  if (!node.parent && node.original) {
    // @ts-ignore
    node.parent = node.original.parent;
  }
  if (ts.isNewExpression(node) && node.expression && ts.isIdentifier(node.expression) &&
    node.expression.escapedText.toString() === SET_CONTROLLER_CTR_TYPE) {
    return true;
  } else {
    // @ts-ignore
    node.parent = tempParent;
    return false;
  }
}

function createCustomDialogController(parent: ts.Expression, node: ts.NewExpression,
  log: LogInfo[]): ts.NewExpression {
  if (node.arguments && node.arguments.length === 1 &&
    ts.isObjectLiteralExpression(node.arguments[0]) && node.arguments[0].properties) {
    const newproperties: ts.ObjectLiteralElementLike[] = node.arguments[0].properties.map((item) => {
      const componentName: string = isCustomDialogControllerPropertyAssignment(item, log);
      if (componentName !== null) {
        item = processCustomDialogControllerPropertyAssignment(parent,
          item as ts.PropertyAssignment, componentName);
      }
      return item;
    });
    return ts.factory.createNewExpression(node.expression, node.typeArguments,
      [ts.factory.createObjectLiteralExpression(newproperties, true), ts.factory.createThis()]);
  } else {
    return node;
  }
}

function isCustomDialogControllerPropertyAssignment(node: ts.ObjectLiteralElementLike,
  log: LogInfo[]): string {
  if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) &&
    node.name.getText() === CUSTOM_DIALOG_CONTROLLER_BUILDER) {
    if (node.initializer) {
      const componentName: string = getName(node.initializer);
      if (componentCollection.customDialogs.has(componentName)) {
        return componentName;
      }
    } else {
      validateCustomDialogControllerBuilderInit(node, log);
    }
  }
  return null;
}

function validateCustomDialogControllerBuilderInit(node: ts.ObjectLiteralElementLike,
  log: LogInfo[]): void {
  log.push({
    type: LogType.ERROR,
    message: 'The builder should be initialized with a @CustomDialog Component.',
    pos: node.getStart()
  });
}

function processCustomDialogControllerPropertyAssignment(parent: ts.Expression,
  node: ts.PropertyAssignment, componentName: string): ts.PropertyAssignment {
  if (ts.isCallExpression(node.initializer)) {
    return ts.factory.updatePropertyAssignment(node, node.name,
      processCustomDialogControllerBuilder(parent, node.initializer, componentName));
  }
}

function processCustomDialogControllerBuilder(parent: ts.Expression,
  node: ts.CallExpression, componentName: string): ts.ArrowFunction {
  const newExp: ts.Expression = createCustomComponentNewExpression(node, componentName, false, false, true);
  const jsDialog: ts.Identifier = ts.factory.createIdentifier(JS_DIALOG);
  return createCustomComponentBuilderArrowFunction(parent, jsDialog, newExp);
}

function createCustomComponentBuilderArrowFunction(parent: ts.Expression,
  jsDialog: ts.Identifier, newExp: ts.Expression): ts.ArrowFunction {
  let mountNodde: ts.PropertyAccessExpression;
  if (ts.isBinaryExpression(parent)) {
    mountNodde = parent.left;
  } else if (ts.isVariableDeclaration(parent) || ts.isPropertyDeclaration(parent)) {
    mountNodde = ts.factory.createPropertyAccessExpression(ts.factory.createThis(),
      parent.name as ts.Identifier);
  }
  return ts.factory.createArrowFunction(
    undefined,
    undefined,
    [],
    undefined,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    ts.factory.createBlock(
      [
        ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [ts.factory.createVariableDeclaration(jsDialog, undefined, undefined, newExp)],
            ts.NodeFlags.Let
          )
        ),
        ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              jsDialog,
              ts.factory.createIdentifier(SET_CONTROLLER_METHOD)
            ),
            undefined,
            [mountNodde]
          )
        ),
        ts.factory.createExpressionStatement(createViewCreate(jsDialog))
      ],
      true
    )
  );
}

export function isResource(node: ts.Node): boolean {
  return ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
    (node.expression.escapedText.toString() === RESOURCE ||
    node.expression.escapedText.toString() === RESOURCE_RAWFILE) && node.arguments.length > 0;
}

export function isAnimateTo(node: ts.Node): boolean {
  return ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
    node.expression.escapedText.toString() === ATTRIBUTE_ANIMATETO;
}

export function processResourceData(node: ts.CallExpression,
  previewLog: {isAcceleratePreview: boolean, log: LogInfo[]} = {isAcceleratePreview: false, log: []}): ts.Node {
  if (ts.isStringLiteral(node.arguments[0])) {
    if (node.expression.getText() === RESOURCE_RAWFILE) {
      return createResourceParam(0, RESOURCE_TYPE.rawfile, [node.arguments[0]]);
    } else {
      return getResourceDataNode(node, previewLog);
    }
  }
  return node;
}

function getResourceDataNode(node: ts.CallExpression,
  previewLog: {isAcceleratePreview: boolean, log: LogInfo[]}): ts.Node {
  const resourceData: string[] = (node.arguments[0] as ts.StringLiteral).text.trim().split('.');
  if (preCheckResourceData(resourceData, resources, node.arguments[0].getStart(), previewLog)) {
    const resourceType: number = RESOURCE_TYPE[resourceData[1]];
    if (resourceType === undefined) {
      transformLog.errors.push({
        type: LogType.ERROR,
        message: `The resource type ${resourceData[1]} is not supported.`,
        pos: node.getStart()
      });
      return node;
    }
    const resourceValue: number = resources[resourceData[0]][resourceData[1]][resourceData[2]];
    return createResourceParam(resourceValue, resourceType,
      projectConfig.compileHar ? Array.from(node.arguments) : Array.from(node.arguments).slice(1));
  }
  return node;
}

function createResourceParam(resourceValue: number, resourceType: number, argsArr: ts.Expression[]):
  ts.ObjectLiteralExpression {
  if (projectConfig.compileHar) {
    projectConfig.bundleName = '';
    projectConfig.moduleName = '';
    resourceValue = -1;
  }

  const propertyArray: Array<ts.PropertyAssignment> = [
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
      ts.factory.createArrayLiteralExpression(argsArr, false)
    )
  ];

  if (projectConfig.bundleName || projectConfig.bundleName === '') {
    propertyArray.push(ts.factory.createPropertyAssignment(
      ts.factory.createStringLiteral(RESOURCE_NAME_BUNDLE),
      ts.factory.createStringLiteral(projectConfig.bundleName)
    ));
  }

  if (projectConfig.moduleName || projectConfig.moduleName === '') {
    propertyArray.push(ts.factory.createPropertyAssignment(
      ts.factory.createStringLiteral(RESOURCE_NAME_MODULE),
      ts.factory.createStringLiteral(projectConfig.moduleName)
    ));
  }

  const resourceParams: ts.ObjectLiteralExpression = ts.factory.createObjectLiteralExpression(
    propertyArray, false);
  return resourceParams;
}

function preCheckResourceData(resourceData: string[], resources: object, pos: number,
  previewLog: {isAcceleratePreview: boolean, log: LogInfo[]}): boolean {
  if (previewLog.isAcceleratePreview) {
    return validateResourceData(resourceData, resources, pos, previewLog.log);
  } else {
    return validateResourceData(resourceData, resources, pos, transformLog.errors);
  }
}

function validateResourceData(resourceData: string[], resources: object, pos: number, log: LogInfo[]): boolean {
  if (resourceData.length !== 3) {
    log.push({
      type: LogType.ERROR,
      message: 'The input parameter is not supported.',
      pos: pos
    });
  } else {
    if (process.env.compileTool === 'rollup' && process.env.compileMode === 'moduleJson') {
      storedFileInfo.collectResourceInFile(resourceData[1] + '_' + resourceData[2], path.resolve(resourceFileName));
    }
    if (!resources[resourceData[0]]) {
      log.push({
        type: LogType.ERROR,
        message: `Unknown resource source '${resourceData[0]}'.`,
        pos: pos
      });
    } else if (!resources[resourceData[0]][resourceData[1]]) {
      log.push({
        type: LogType.ERROR,
        message: `Unknown resource type '${resourceData[1]}'.`,
        pos: pos
      });
    } else if (!resources[resourceData[0]][resourceData[1]][resourceData[2]]) {
      log.push({
        type: LogType.ERROR,
        message: `Unknown resource name '${resourceData[2]}'.`,
        pos: pos
      });
    } else {
      return true;
    }
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

export function processAnimateTo(node: ts.CallExpression): ts.CallExpression {
  return ts.factory.updateCallExpression(node, ts.factory.createPropertyAccessExpression(
    ts.factory.createIdentifier(GLOBAL_CONTEXT), ts.factory.createIdentifier(ATTRIBUTE_ANIMATETO)),
  node.typeArguments, node.arguments);
}

function processExtend(node: ts.FunctionDeclaration, log: LogInfo[],
  decoratorName: string): ts.FunctionDeclaration {
  const componentName: string = isExtendFunction(node, { decoratorName: '', componentName: '' }, true);
  if (componentName && node.body && node.body.statements.length) {
    const statementArray: ts.Statement[] = [];
    let bodynode: ts.Block;
    if (decoratorName === COMPONENT_EXTEND_DECORATOR) {
      const attrSet: ts.CallExpression = node.body.statements[0].expression;
      if (isOriginalExtend(node.body)) {
        const changeCompName: ts.ExpressionStatement = ts.factory.createExpressionStatement(processExtendBody(attrSet));
        bindComponentAttr(changeCompName as ts.ExpressionStatement,
          ts.factory.createIdentifier(componentName), statementArray, log);
      } else {
        bodynode = ts.visitEachChild(node.body, traverseExtendExpression, contextGlobal);
      }
      let extendFunctionName: string;
      if (node.name.getText().startsWith('__' + componentName + '__')) {
        extendFunctionName = node.name.getText();
      } else {
        extendFunctionName = '__' + componentName + '__' + node.name.getText();
        collectExtend(EXTEND_ATTRIBUTE, componentName, node.name.escapedText.toString());
      }
      return ts.factory.updateFunctionDeclaration(node, undefined, node.modifiers, node.asteriskToken,
        ts.factory.createIdentifier(extendFunctionName), node.typeParameters,
        node.parameters, ts.factory.createToken(ts.SyntaxKind.VoidKeyword), isOriginalExtend(node.body) ?
          ts.factory.updateBlock(node.body, statementArray) : bodynode);
    }
    if (decoratorName === COMPONENT_ANIMATABLE_EXTEND_DECORATOR) {
      bindComponentAttr(node.body.statements[0],
        ts.factory.createIdentifier(componentName), statementArray, log);
      return ts.factory.updateFunctionDeclaration(node, undefined, node.modifiers, node.asteriskToken,
        node.name, node.typeParameters,
        [...node.parameters, ...createAnimatableParameterNode()], ts.factory.createToken(ts.SyntaxKind.VoidKeyword),
        ts.factory.updateBlock(node.body, createAnimatableBody(componentName, node.name,
          node.parameters, statementArray)));
    }
  }
  function traverseExtendExpression(node: ts.Node): ts.Node {
    if (ts.isExpressionStatement(node) && isDollarNode(node, componentName)) {
      const changeCompName: ts.ExpressionStatement =
        ts.factory.createExpressionStatement(processExtendBody(node.expression, componentName));
      const statementArray: ts.Statement[] = [];
      bindComponentAttr(changeCompName, ts.factory.createIdentifier(componentName), statementArray, []);
      return ts.factory.createBlock(statementArray, true);
    }
    return ts.visitEachChild(node, traverseExtendExpression, contextGlobal);
  }
}

function createAnimatableParameterNode(): ts.ParameterDeclaration[] {
  return [
    ts.factory.createParameterDeclaration(
      undefined, undefined, undefined, ts.factory.createIdentifier(ELMTID)),
    ts.factory.createParameterDeclaration(
      undefined, undefined, undefined, ts.factory.createIdentifier(ISINITIALRENDER)),
    ts.factory.createParameterDeclaration(
      undefined, undefined, undefined, ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_PARENT))
  ];
}

function createAnimatableBody(componentName: string, funcName: ts.Identifier,
  parameters: ts.NodeArray<ts.ParameterDeclaration>, attrArray: ts.Statement[]): ts.Statement[] {
  const paramNode: ts.Identifier[] = [];
  parameters.forEach((item: ts.ParameterDeclaration) => {
    if (item.name && ts.isIdentifier(item.name)) {
      paramNode.push(item.name);
    }
  });
  return [
    ts.factory.createIfStatement(
      ts.factory.createIdentifier(ISINITIALRENDER),
      ts.factory.createBlock([
        createAnimatableProperty(componentName, funcName, parameters, paramNode, attrArray),
        ...attrArray
      ], true),
      ts.factory.createBlock([
        ts.factory.createExpressionStatement(ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(componentName),
            ts.factory.createIdentifier(UPDATE_ANIMATABLE_PROPERTY)
          ), undefined,
          [ ts.factory.createStringLiteral(funcName.escapedText.toString()), ...paramNode ]
        ))
      ])
    )
  ];
}

function createAnimatableProperty(componentName: string, funcName: ts.Identifier,
  parameters: ts.NodeArray<ts.ParameterDeclaration>,
  paramNode: ts.Identifier[], attrArray: ts.Statement[]) {
  const componentIdentifier: ts.Identifier = ts.factory.createIdentifier(componentName);
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(
      componentIdentifier,
      ts.factory.createIdentifier(CREATE_ANIMATABLE_PROPERTY)),
    undefined, [
      ts.factory.createStringLiteral(funcName.escapedText.toString()),
      ...paramNode,
      ts.factory.createArrowFunction(undefined, undefined, parameters, undefined,
        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.factory.createBlock([
          createViewStackProcessorStatement(STARTGETACCESSRECORDINGFOR, ELMTID),
          createAnimatableFrameNode(componentName),
          ...attrArray,
          createViewStackProcessorStatement(STOPGETACCESSRECORDING),
          createAnimatableUpdateFunc()
        ], true))
    ]
    )
  );
}

function createAnimatableFrameNode(componentName: string): ts.ExpressionStatement {
  return ts.factory.createExpressionStatement(ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier(VIEW_STACK_PROCESSOR),
      ts.factory.createIdentifier(GET_AND_PUSH_FRAME_NODE),
    ), undefined,
    [
      ts.factory.createStringLiteral(componentName),
      ts.factory.createIdentifier(ELMTID)
    ]
  ));
}

function createAnimatableUpdateFunc(): ts.ExpressionStatement {
  return ts.factory.createExpressionStatement(ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_PARENT),
      ts.factory.createIdentifier(FINISH_UPDATE_FUNC),
    ), undefined, [ts.factory.createIdentifier(ELMTID)]
  ));
}

function processConcurrent(node: ts.FunctionDeclaration): ts.FunctionDeclaration {
  if (node.body) {
    const statementArray: ts.Statement[]
      = [ts.factory.createExpressionStatement(ts.factory.createStringLiteral('use concurrent')),
        ...node.body.statements];
    return ts.factory.updateFunctionDeclaration(node, undefined, node.modifiers, node.asteriskToken, node.name,
      node.typeParameters, node.parameters, node.type, ts.factory.updateBlock(node.body, statementArray));
  }
  return node;
}

export function isOriginalExtend(node: ts.Block): boolean {
  let innerNode: ts.Node = node.statements[0];
  if (node.statements.length === 1 && ts.isExpressionStatement(innerNode)) {
    while (innerNode.expression) {
      innerNode = innerNode.expression;
    }
    if (ts.isIdentifier(innerNode) && innerNode.pos && innerNode.end && innerNode.pos === innerNode.end &&
      innerNode.escapedText.toString().match(/Instance$/)) {
      return true;
    }
  }
  return false;
}

function isDollarNode(node: ts.ExpressionStatement, componentName: string): boolean {
  let innerNode: ts.Node = node;
  while (innerNode.expression) {
    innerNode = innerNode.expression;
  }
  let changedIdentifier: string = '$';
  if (process.env.compileTool === 'rollup' && storedFileInfo.reUseProgram) {
    changedIdentifier = `${componentName}Instance`;
  }
  if (ts.isIdentifier(innerNode) && innerNode.getText() === changedIdentifier) {
    return true;
  } else {
    return false;
  }
}

function processExtendBody(node: ts.Node, componentName?: string): ts.Expression {
  switch (node.kind) {
    case ts.SyntaxKind.CallExpression:
      return ts.factory.createCallExpression(processExtendBody(node.expression, componentName),
        undefined, node.arguments);
    case ts.SyntaxKind.PropertyAccessExpression:
      return ts.factory.createPropertyAccessExpression(
        processExtendBody(node.expression, componentName), node.name);
    case ts.SyntaxKind.Identifier:
      if (!componentName) {
        return ts.factory.createIdentifier(node.escapedText.toString().replace(INSTANCE, ''));
      } else {
        return ts.factory.createIdentifier(componentName);
      }
  }
}

export function collectExtend(collectionSet: Map<string, Set<string>>, component: string, attribute: string): void {
  if (collectionSet.has(component)) {
    collectionSet.get(component).add(attribute);
  } else {
    collectionSet.set(component, new Set([attribute]));
  }
}

export function isExtendFunction(node: ts.FunctionDeclaration, extendResult: ExtendResult,
  checkArguments: boolean = false): string {
  if (node.decorators && node.decorators.length) {
    for (let i = 0, len = node.decorators.length; i < len; i++) {
      if (ts.isCallExpression(node.decorators[i].expression)) {
        parseExtendNode(node.decorators[i].expression as ts.CallExpression, extendResult, checkArguments);
        if (CHECK_EXTEND_DECORATORS.includes(extendResult.decoratorName) && extendResult.componentName) {
          return extendResult.componentName;
        }
      }
    }
  }
  return null;
}

function parseExtendNode(node: ts.CallExpression, extendResult: ExtendResult, checkArguments: boolean): void {
  if (ts.isIdentifier(node.expression)) {
    extendResult.decoratorName = node.expression.escapedText.toString();
    if (checkArguments && CHECK_EXTEND_DECORATORS.includes(extendResult.decoratorName) &&
      node.arguments && node.arguments.length !== 1) {
      transformLog.errors.push({
        type: LogType.ERROR,
        message: `@${extendResult.decoratorName} should have one and only one parameter`,
        pos: node.getStart()
      });
    }
  }
  if (node.arguments.length && ts.isIdentifier(node.arguments[0])) {
    extendResult.componentName = node.arguments[0].escapedText.toString();
  }
}

function createEntryNode(node: ts.SourceFile, context: ts.TransformationContext,
  entryNodeKey: ts.Expression, id: number): ts.SourceFile {
  let cardRelativePath: string;
  if (projectConfig && projectConfig.cardObj) {
    cardRelativePath = projectConfig.cardObj[resourceFileName];
  }
  if (componentCollection.previewComponent.length === 0 || !projectConfig.isPreview) {
    if (componentCollection.entryComponent) {
      if (!partialUpdateConfig.partialUpdateMode) {
        const entryNode: ts.ExpressionStatement =
          createEntryFunction(componentCollection.entryComponent, context,
            cardRelativePath, entryNodeKey, id) as ts.ExpressionStatement;
        return context.factory.updateSourceFile(node, [...node.statements, entryNode]);
      } else {
        const entryNodes: ts.ExpressionStatement[] =
          createEntryFunction(componentCollection.entryComponent, context,
            cardRelativePath, entryNodeKey, id) as ts.ExpressionStatement[];
        return entryNodes ?
          context.factory.updateSourceFile(node, [...node.statements, ...entryNodes]) :
          context.factory.updateSourceFile(node, [...node.statements]);
      }
    } else {
      return node;
    }
  } else {
    const statementsArray: ts.Statement =
      createPreviewComponentFunction(componentCollection.entryComponent, context, cardRelativePath, entryNodeKey, id);
    return context.factory.updateSourceFile(node, [...node.statements, statementsArray]);
  }
}

function createEntryFunction(name: string, context: ts.TransformationContext, cardRelativePath: string,
  entryNodeKey: ts.Expression, id: number): ts.ExpressionStatement | (ts.ExpressionStatement | ts.Block | ts.IfStatement)[] {
  const newArray: ts.Expression[] = [
    context.factory.createStringLiteral(id.toString()),
    context.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED),
    context.factory.createObjectLiteralExpression([], false)
  ];
  const [localStorageName, entryOptionNode]: [string, ts.Expression] = addStorageParam(name);
  if (localStorageName && entryNodeKey) {
    newArray.push(entryNodeKey);
  }
  const newExpressionParams: any[] = [
    context.factory.createNewExpression(
      context.factory.createIdentifier(name), undefined, newArray)];
  addCardStringliteral(newExpressionParams, context, cardRelativePath);
  if (!partialUpdateConfig.partialUpdateMode) {
    const newExpressionStatement: ts.ExpressionStatement =
      context.factory.createExpressionStatement(context.factory.createCallExpression(
        context.factory.createIdentifier(cardRelativePath ? CARD_ENTRY_FUNCTION_NAME :
          PAGE_ENTRY_FUNCTION_NAME), undefined, newExpressionParams));
    return newExpressionStatement;
  } else {
    if (cardRelativePath) {
      if (entryOptionNode && ts.isObjectLiteralExpression(entryOptionNode)) {
        transformLog.errors.push({
          type: LogType.ERROR,
          message: `@Entry doesn't support {} parameter in card`,
          pos: componentCollection.entryComponentPos
        });
      }
      return [
        createStartGetAccessRecording(context),
        createLoadDocument(context, name, cardRelativePath, localStorageName, entryNodeKey),
        createStopGetAccessRecording(context)
      ];
    } else {
      return createLoadPageConditionalJudgMent(context, name, cardRelativePath, localStorageName, entryOptionNode);
    }
  }
}

function createLoadPageConditionalJudgMent(context: ts.TransformationContext, name: string,
  cardRelativePath: string, localStorageName: string, entryOptionNode: ts.Expression,
  argsArr: ts.Expression[] = undefined, isComponentPreview: boolean = false)
  : (ts.ExpressionStatement | ts.Block | ts.IfStatement)[] {
  let isObject: boolean = false;
  let routeNameNode: ts.Expression;
  let storageNode: ts.Expression;
  if (!entryOptionNode) {
    const originArray: ts.ExpressionStatement[] = [
      createStartGetAccessRecording(context),
      createLoadDocument(context, name, cardRelativePath, localStorageName, entryOptionNode),
      createStopGetAccessRecording(context)
    ];
    return originArray;
  }
  if (ts.isObjectLiteralExpression(entryOptionNode)) {
    isObject = true;
    if (entryOptionNode.properties) {
      entryOptionNode.properties.forEach((property) => {
        if (ts.isPropertyAssignment(property) && property.name && ts.isIdentifier(property.name)) {
          if (property.name.escapedText.toString() === ROUTE_NAME) {
            routeNameNode = property.initializer;
          } else if (property.name.escapedText.toString() === STORAGE) {
            storageNode = property.initializer;
          }
        }
      });
    }
  } else {
    isObject = false;
  }
  if (isObject) {
    if (routeNameNode && !storageNode) {
      return isComponentPreview ? [
        ...assignRouteNameAndStorage(routeNameNode, storageNode, true, false),
        ...createLoadDocumentWithRoute(context, name, cardRelativePath, isObject, entryOptionNode,
          routeNameNode, storageNode, true, false, false, argsArr)
      ] : [ts.factory.createBlock([
        ...assignRouteNameAndStorage(routeNameNode, storageNode, true, false),
        ...createLoadDocumentWithRoute(context, name, cardRelativePath, isObject, entryOptionNode,
          routeNameNode, storageNode, true, false, false, argsArr)
      ])];
    } else if (!routeNameNode && !storageNode) {
      return isComponentPreview ? [
        ...assignRouteNameAndStorage(routeNameNode, storageNode, false, false),
        ...createLoadDocumentWithRoute(context, name, cardRelativePath, isObject, entryOptionNode,
          routeNameNode, storageNode, false, false, true, argsArr)
      ] : [ts.factory.createBlock([
        ...assignRouteNameAndStorage(routeNameNode, storageNode, false, false),
        ...createLoadDocumentWithRoute(context, name, cardRelativePath, isObject, entryOptionNode,
          routeNameNode, storageNode, false, false, true, argsArr)
      ])];
    } else if (!routeNameNode && storageNode) {
      return isComponentPreview ? [
        ...assignRouteNameAndStorage(routeNameNode, storageNode, false, true),
        ...createLoadDocumentWithRoute(context, name, cardRelativePath, isObject, entryOptionNode,
          routeNameNode, storageNode, false, true, true, argsArr)
      ] : [ts.factory.createBlock([
        ...assignRouteNameAndStorage(routeNameNode, storageNode, false, true),
        ...createLoadDocumentWithRoute(context, name, cardRelativePath, isObject, entryOptionNode,
          routeNameNode, storageNode, false, true, true, argsArr)
      ])];
    } else {
      return isComponentPreview ? [
        ...assignRouteNameAndStorage(routeNameNode, storageNode, true, true),
        judgeRouteNameAndStorage(context, name, cardRelativePath, isObject, entryOptionNode, routeNameNode,
          storageNode, argsArr)
      ] : [ts.factory.createBlock([
        ...assignRouteNameAndStorage(routeNameNode, storageNode, true, true),
        judgeRouteNameAndStorage(context, name, cardRelativePath, isObject, entryOptionNode, routeNameNode,
          storageNode, argsArr)
      ])];
    }
  } else {
    return [
      judgeRouteNameAndStorage(context, name, cardRelativePath, isObject, entryOptionNode, routeNameNode,
        storageNode, argsArr)];
  }
}

function judgeRouteNameAndStorage(context: ts.TransformationContext, name: string,
  cardRelativePath: string, isObject: boolean, entryOptionNode: ts.Expression, routeNameNode: ts.Expression,
  storageNode: ts.Expression, argsArr: ts.Expression[] = undefined): ts.IfStatement {
  return ts.factory.createIfStatement(
    isObject ? judgeRouteAndStorageForObject(true, true) :
      judgeRouteAndStorageForIdentifier(entryOptionNode as ts.Identifier, true, true),
    ts.factory.createBlock(
      [
        ...createLoadDocumentWithRoute(context, name, cardRelativePath, isObject, entryOptionNode,
          routeNameNode, storageNode, true, true, false, argsArr)
      ],
      true
    ),
    ts.factory.createIfStatement(
      isObject ? judgeRouteAndStorageForObject(true, false) :
        judgeRouteAndStorageForIdentifier(entryOptionNode as ts.Identifier, true, false),
      ts.factory.createBlock(
        [
          ...createLoadDocumentWithRoute(context, name, cardRelativePath, isObject, entryOptionNode,
            routeNameNode, storageNode, true, false, false, argsArr)
        ],
        true
      ),
      ts.factory.createIfStatement(
        isObject ? judgeRouteAndStorageForObject(false, true) :
          judgeRouteAndStorageForIdentifier(entryOptionNode as ts.Identifier, false, true),
        ts.factory.createBlock(
          [
            ...createLoadDocumentWithRoute(context, name, cardRelativePath, isObject, entryOptionNode,
              routeNameNode, storageNode, false, true, true, argsArr)
          ],
          true
        ),
        ts.factory.createBlock(
          [
            ...createLoadDocumentWithRoute(context, name, cardRelativePath, isObject, entryOptionNode,
              routeNameNode, storageNode, false, false, true, argsArr)
          ],
          true
        )
      )
    )
  );
}

function judgeRouteAndStorageForObject(hasRouteName: boolean, hasStorage: boolean): ts.BinaryExpression {
  return ts.factory.createBinaryExpression(
    ts.factory.createBinaryExpression(
      ts.factory.createIdentifier(ROUTENAME_NODE),
      ts.factory.createToken(hasRouteName ? ts.SyntaxKind.ExclamationEqualsToken : ts.SyntaxKind.EqualsEqualsToken),
      ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED)
    ),
    ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
    ts.factory.createBinaryExpression(
      ts.factory.createIdentifier(STORAGE_NODE),
      ts.factory.createToken(hasStorage ? ts.SyntaxKind.ExclamationEqualsToken : ts.SyntaxKind.EqualsEqualsToken),
      ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED)
    )
  );
}

function judgeRouteAndStorageForIdentifier(entryOptionNode: ts.Identifier, hasRouteName: boolean,
  hasStorage: boolean): ts.BinaryExpression {
  return ts.factory.createBinaryExpression(
    ts.factory.createBinaryExpression(
      entryOptionNode,
      ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
      ts.factory.createBinaryExpression(
        ts.factory.createPropertyAccessExpression(
          entryOptionNode,
          ts.factory.createIdentifier(ROUTE_NAME)
        ),
        ts.factory.createToken(hasRouteName ? ts.SyntaxKind.ExclamationEqualsToken : ts.SyntaxKind.EqualsEqualsToken),
        ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED)
      )
    ),
    ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
    ts.factory.createBinaryExpression(
      ts.factory.createPropertyAccessExpression(
        entryOptionNode,
        ts.factory.createIdentifier(STORAGE)
      ),
      ts.factory.createToken(hasStorage ? ts.SyntaxKind.ExclamationEqualsToken : ts.SyntaxKind.EqualsEqualsToken),
      ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED)
    )
  );
}

function assignRouteNameAndStorage(routeNameNode, storageNode, hasRouteName, hasStorage): ts.ExpressionStatement[] {
  const assignOperation: ts.VariableStatement[] = [];
  if (hasRouteName) {
    assignOperation.push(ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(ROUTENAME_NODE),
          undefined,
          undefined,
          routeNameNode
        )],
        ts.NodeFlags.Let
      )
    ));
  }
  if (hasStorage) {
    assignOperation.push(ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(STORAGE_NODE),
          undefined,
          undefined,
          storageNode
        )],
        ts.NodeFlags.Let
      )
    ));
  }
  return assignOperation;
}

function createLoadDocumentWithRoute(context: ts.TransformationContext, name: string,
  cardRelativePath: string, isObject: boolean, entryOptionNode: ts.Expression,
  routeNameNode: ts.Node, storageNode: ts.Node, hasRouteName: boolean, hasStorage: boolean,
  shouldCreateAccsessRecording: boolean, argsArr: ts.Expression[]): ts.ExpressionStatement[] {
  const newArray: ts.Expression[] = [
    context.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED),
    context.factory.createObjectLiteralExpression([], false)
  ];
  if (entryOptionNode) {
    if (!isObject) {
      if (hasStorage) {
        newArray.push(ts.factory.createPropertyAccessExpression(
          entryOptionNode,
          ts.factory.createIdentifier(STORAGE)
        ));
      } else if (!hasRouteName) {
        newArray.push(entryOptionNode);
      }
    } else if (storageNode && hasStorage) {
      newArray.push(ts.factory.createIdentifier(STORAGE_NODE));
    }
  }
  const newExpressionParams: any[] = [
    context.factory.createNewExpression(
      context.factory.createIdentifier(name),
      undefined, newArray)];
  if (argsArr) {
    argsArr = [];
    componentCollection.previewComponent.forEach((componentName: string) => {
      const newExpression: ts.Expression = context.factory.createNewExpression(
        context.factory.createIdentifier(componentName),
        undefined,
        componentName === name ? newArray : newArray.slice(0, newArray.length - 1)
      );
      argsArr.push(context.factory.createStringLiteral(componentName), newExpression);
    });
  }
  if (hasRouteName) {
    return [
      shouldCreateAccsessRecording ? createStartGetAccessRecording(context) : undefined,
      context.factory.createExpressionStatement(context.factory.createCallExpression(
        context.factory.createIdentifier(REGISTER_NAMED_ROUTE),
        undefined,
        [
          context.factory.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            context.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            newExpressionParams[0]
          ),
          isObject ? ts.factory.createIdentifier(ROUTENAME_NODE) : context.factory.createPropertyAccessExpression(
            entryOptionNode,
            context.factory.createIdentifier(ROUTE_NAME)
          ),
          context.factory.createObjectLiteralExpression(
            [
              context.factory.createPropertyAssignment(
                context.factory.createIdentifier(RESOURCE_NAME_BUNDLE),
                context.factory.createStringLiteral(projectConfig.bundleName || '')
              ),
              context.factory.createPropertyAssignment(
                context.factory.createIdentifier(RESOURCE_NAME_MODULE),
                context.factory.createStringLiteral(projectConfig.moduleName || '')
              ),
              context.factory.createPropertyAssignment(
                context.factory.createIdentifier(PAGE_PATH),
                context.factory.createStringLiteral(
                  projectConfig.compileHar ? '' :
                    path.relative(projectConfig.projectPath || '', resourceFileName).replace(/\\/g, '/').replace(/\.ets$/, '')
                )
              )
            ],
            false
          )
        ]
      )),
      shouldCreateAccsessRecording ? createStopGetAccessRecording(context) : undefined];
  } else {
    return [
      shouldCreateAccsessRecording ? createStartGetAccessRecording(context) : undefined,
      context.factory.createExpressionStatement(
        context.factory.createCallExpression(
          context.factory.createIdentifier(cardRelativePath ? CARD_ENTRY_FUNCTION_NAME :
            PAGE_ENTRY_FUNCTION_NAME), undefined, newExpressionParams)),
      shouldCreateAccsessRecording ? createStopGetAccessRecording(context) : undefined];
  }
}

function createStartGetAccessRecording(context: ts.TransformationContext): ts.ExpressionStatement {
  return context.factory.createExpressionStatement(
    context.factory.createCallExpression(
      context.factory.createPropertyAccessExpression(
        context.factory.createIdentifier(VIEWSTACKPROCESSOR),
        context.factory.createIdentifier(STARTGETACCESSRECORDINGFOR)
      ),
      undefined,
      [context.factory.createCallExpression(
        context.factory.createPropertyAccessExpression(
          context.factory.createIdentifier(VIEWSTACKPROCESSOR),
          context.factory.createIdentifier(ALLOCATENEWELMETIDFORNEXTCOMPONENT)
        ),
        undefined,
        []
      )]
    )
  );
}

function createLoadDocument(context: ts.TransformationContext, name: string,
  cardRelativePath: string, localStorageName: string, entryNodeKey: ts.Expression): ts.ExpressionStatement {
  const newArray: ts.Expression[] = [
    context.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED),
    context.factory.createObjectLiteralExpression([], false)
  ];
  if (localStorageName && entryNodeKey) {
    newArray.push(entryNodeKey);
  }
  const newExpressionParams: any[] = [
    context.factory.createNewExpression(
      context.factory.createIdentifier(name),
      undefined, newArray)];
  addCardStringliteral(newExpressionParams, context, cardRelativePath);
  return context.factory.createExpressionStatement(
    context.factory.createCallExpression(
      context.factory.createIdentifier(cardRelativePath ? CARD_ENTRY_FUNCTION_NAME :
        PAGE_ENTRY_FUNCTION_NAME), undefined, newExpressionParams)
  );
}

function createStopGetAccessRecording(context: ts.TransformationContext): ts.ExpressionStatement {
  return context.factory.createExpressionStatement(
    context.factory.createCallExpression(
      context.factory.createPropertyAccessExpression(
        context.factory.createIdentifier(VIEWSTACKPROCESSOR),
        context.factory.createIdentifier(STOPGETACCESSRECORDING)
      ),
      undefined,
      []
    )
  );
}

function addStorageParam(name: string): [string, ts.Expression] {
  let localStorageName: string;
  let localStorageNode: ts.Identifier | ts.ObjectLiteralExpression;
  const localStorageNum: number = (localStorageLinkCollection.get(name) || new Set()).size +
    (localStoragePropCollection.get(name) || new Set()).size;
  if (componentCollection.entryComponent === name && componentCollection.localStorageNode) {
    localStorageNode = componentCollection.localStorageNode;
  }
  if (componentCollection.entryComponent === name && componentCollection.localStorageName) {
    localStorageName = componentCollection.localStorageName;
  } else if (componentCollection.entryComponent === name && !componentCollection.localStorageName &&
    !componentCollection.localStorageNode && localStorageNum) {
    transformLog.errors.push({
      type: LogType.WARN,
      message: `@Entry should have a parameter, like '@Entry (storage)'.`,
      pos: componentCollection.entryComponentPos
    });
  }
  return [localStorageName, localStorageNode];
}

function createPreviewComponentFunction(name: string, context: ts.TransformationContext,
  cardRelativePath: string, entryNodeKey: ts.Expression, id: number): ts.Statement {
  const newArray: ts.Expression[] = partialUpdateConfig.partialUpdateMode ?
    [
      context.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED),
      context.factory.createObjectLiteralExpression([], false)
    ] :
    [
      context.factory.createStringLiteral(id.toString()),
      context.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED),
      context.factory.createObjectLiteralExpression([], false)
    ];
  const [localStorageName, entryOptionNode]: [string, ts.Expression] = addStorageParam(name);
  if (entryOptionNode) {
    newArray.push(entryOptionNode);
  }
  const argsArr: ts.Expression[] = [];
  componentCollection.previewComponent.forEach(componentName => {
    const newExpression: ts.Expression = context.factory.createNewExpression(
      context.factory.createIdentifier(componentName),
      undefined,
      newArray
    );
    argsArr.push(context.factory.createStringLiteral(componentName));
    argsArr.push(newExpression);
  });
  const newExpressionParams: any[] = name ? [context.factory.createNewExpression(
    context.factory.createIdentifier(name), undefined, newArray)] : [];
  addCardStringliteral(newExpressionParams, context, cardRelativePath);
  const ifStatement: ts.Statement = context.factory.createIfStatement(
    context.factory.createCallExpression(
      context.factory.createIdentifier(GET_PREVIEW_FLAG_FUNCTION_NAME),
      undefined,
      []
    ),
    context.factory.createBlock(
      [...storePreviewComponents(name, entryOptionNode, argsArr),
        context.factory.createExpressionStatement(context.factory.createCallExpression(
          context.factory.createIdentifier(PREVIEW_COMPONENT_FUNCTION_NAME),
          undefined,
          []
        ))],
      true
    ),
    context.factory.createBlock(
      createPreviewElseBlock(name, context, cardRelativePath, localStorageName, entryOptionNode,
        newExpressionParams, argsArr),
      true
    )
  );
  return ifStatement;
}

function storePreviewComponents(name: string, entryOptionNode: ts.Expression, argsArr: ts.Expression[]):
  (ts.ExpressionStatement|ts.VariableStatement|ts.IfStatement)[] {
  let isObject: boolean = false;
  let storageNode: ts.Expression;
  if (!entryOptionNode) {
    return [ts.factory.createExpressionStatement(ts.factory.createCallExpression(
      ts.factory.createIdentifier(STORE_PREVIEW_COMPONENTS),
      undefined,
      [
        ts.factory.createNumericLiteral(componentCollection.previewComponent.length),
        ...argsArr
      ]
    ))];
  }
  if (ts.isObjectLiteralExpression(entryOptionNode)) {
    isObject = true;
    if (entryOptionNode.properties) {
      entryOptionNode.properties.forEach((property) => {
        if (ts.isPropertyAssignment(property) && property.name && ts.isIdentifier(property.name) &&
          property.name.escapedText.toString() === STORAGE) {
          storageNode = property.initializer;
        }
      });
    }
  } else {
    isObject = false;
  }
  const newArray: ts.Expression[] = [
    ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED),
    ts.factory.createObjectLiteralExpression([], false)
  ];
  const newArgsArr: ts.Expression[] = [];
  if (isObject) {
    return processObjectStorage(storageNode, newArray, name, newArgsArr);
  } else {
    return [ts.factory.createIfStatement(
      ts.factory.createBinaryExpression(
        entryOptionNode,
        ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
        ts.factory.createBinaryExpression(
          ts.factory.createPropertyAccessExpression(
            entryOptionNode,
            ts.factory.createIdentifier(STORAGE)
          ),
          ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
          ts.factory.createIdentifier('undefined')
        )
      ),
      ts.factory.createBlock(
        [returnStorePreview(entryOptionNode, true, name)],
        true
      ),
      ts.factory.createBlock(
        [returnStorePreview(entryOptionNode, false, name)],
        true
      )
    )];
  }
}

function processObjectStorage(storageNode: ts.Expression, newArray: ts.Expression[], name: string,
  newArgsArr: ts.Expression[]): (ts.ExpressionStatement|ts.VariableStatement)[] {
  if (storageNode) {
    newArray.push(ts.factory.createIdentifier(STORAGE_NODE));
    componentCollection.previewComponent.forEach(componentName => {
      const newExpression: ts.Expression = ts.factory.createNewExpression(
        ts.factory.createIdentifier(componentName),
        undefined,
        componentName === name ? newArray : newArray.slice(0, newArray.length - 1)
      );
      newArgsArr.push(ts.factory.createStringLiteral(componentName));
      newArgsArr.push(newExpression);
    });
    return [ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(STORAGE_NODE),
          undefined,
          undefined,
          storageNode
        )],
        ts.NodeFlags.Let
      )
    ), ts.factory.createExpressionStatement(ts.factory.createCallExpression(
      ts.factory.createIdentifier(STORE_PREVIEW_COMPONENTS),
      undefined,
      [
        ts.factory.createNumericLiteral(componentCollection.previewComponent.length),
        ...newArgsArr
      ]
    ))];
  } else {
    componentCollection.previewComponent.forEach(componentName => {
      const newExpression: ts.Expression = ts.factory.createNewExpression(
        ts.factory.createIdentifier(componentName),
        undefined,
        newArray
      );
      newArgsArr.push(ts.factory.createStringLiteral(componentName));
      newArgsArr.push(newExpression);
    });
    return [ts.factory.createExpressionStatement(ts.factory.createCallExpression(
      ts.factory.createIdentifier(STORE_PREVIEW_COMPONENTS),
      undefined,
      [
        ts.factory.createNumericLiteral(componentCollection.previewComponent.length),
        ...newArgsArr
      ]
    ))];
  }
}

function returnStorePreview(entryOptionNode: ts.Expression, hasStorage: boolean, name: string): ts.ExpressionStatement {
  const newArray: ts.Expression[] = [
    ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED),
    ts.factory.createObjectLiteralExpression([], false)
  ];
  const newArgsArr: ts.Expression[] = [];
  newArray.push(hasStorage ? ts.factory.createPropertyAccessExpression(
    entryOptionNode,
    ts.factory.createIdentifier(STORAGE)
  ) : entryOptionNode);
  componentCollection.previewComponent.forEach(componentName => {
    const newExpression: ts.Expression = ts.factory.createNewExpression(
      ts.factory.createIdentifier(componentName),
      undefined,
      componentName === name ? newArray : newArray.slice(0, newArray.length - 1)
    );
    newArgsArr.push(ts.factory.createStringLiteral(componentName));
    newArgsArr.push(newExpression);
  });
  return ts.factory.createExpressionStatement(ts.factory.createCallExpression(
    ts.factory.createIdentifier(STORE_PREVIEW_COMPONENTS),
    undefined,
    [
      ts.factory.createNumericLiteral(componentCollection.previewComponent.length),
      ...newArgsArr
    ]
  ));
}

function createPreviewElseBlock(name: string, context: ts.TransformationContext, cardRelativePath: string,
  localStorageName: string, entryOptionNode: ts.Expression, newExpressionParams: ts.Expression[],
  argsArr: ts.Expression[]): (ts.ExpressionStatement | ts.IfStatement | ts.Block)[] {
  if (name) {
    if (!partialUpdateConfig.partialUpdateMode) {
      return [context.factory.createExpressionStatement(context.factory.createCallExpression(
        context.factory.createIdentifier(STORE_PREVIEW_COMPONENTS),
        undefined,
        [
          context.factory.createNumericLiteral(componentCollection.previewComponent.length),
          ...argsArr
        ]
      )),
      context.factory.createExpressionStatement(context.factory.createCallExpression(
        context.factory.createIdentifier(cardRelativePath ? CARD_ENTRY_FUNCTION_NAME :
          PAGE_ENTRY_FUNCTION_NAME), undefined, newExpressionParams
      ))];
    } else {
      if (cardRelativePath) {
        if (entryOptionNode && ts.isObjectLiteralExpression(entryOptionNode)) {
          transformLog.errors.push({
            type: LogType.ERROR,
            message: `@Entry doesn't support {} parameter in card`,
            pos: componentCollection.entryComponentPos
          });
        }
        return [
          name ? createStartGetAccessRecording(context) : undefined,
          name ? context.factory.createExpressionStatement(context.factory.createCallExpression(
            context.factory.createIdentifier(cardRelativePath ? CARD_ENTRY_FUNCTION_NAME :
              PAGE_ENTRY_FUNCTION_NAME), undefined, newExpressionParams
          )) : undefined,
          name ? createStopGetAccessRecording(context) : undefined
        ];
      }
      return createLoadPageConditionalJudgMent(context, name, cardRelativePath, localStorageName,
        entryOptionNode, argsArr, true);
    }
  }
}

export function resetLog(): void {
  transformLog.errors = [];
}

function addCardStringliteral(newExpressionParams: any[], context: ts.TransformationContext,
  cardRelativePath: string): void {
  if (cardRelativePath) {
    newExpressionParams.push(context.factory.createStringLiteral(
      projectConfig.bundleName + '/' + projectConfig.moduleName + '/' +
      cardRelativePath));
  }
}

export function validatorCard(log: any[], type: number, pos: number,
  name: string = ''): void {
  if (projectConfig && projectConfig.cardObj && resourceFileName
    && projectConfig.cardObj[resourceFileName]) {
    const logInfo: object = {
      type: LogType.ERROR,
      message: '',
      pos: pos
    };
    switch (type) {
      case CARD_LOG_TYPE_COMPONENTS:
        logInfo.message = `Card page cannot use the component ${name}.`;
        break;
      case CARD_LOG_TYPE_DECORATORS:
        logInfo.message = `Card page cannot use ${name}`;
        break;
      case CARD_LOG_TYPE_IMPORT:
        logInfo.message = `Card page cannot use import.`;
        break;
    }
    log.push(logInfo);
  }
}
