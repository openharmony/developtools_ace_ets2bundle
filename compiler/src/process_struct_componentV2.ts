/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

import {
  LogInfo,
  LogType,
  addLog
} from './utils';
import {
  COMPONENT_CONSTRUCTOR_PARENT,
  COMPONENT_CONSTRUCTOR_PARAMS,
  COMPONENT_CONSTRUCTOR_LOCALSTORAGE_PU,
  ELMTID,
  COMPONENT_PARAMS_LAMBDA_FUNCTION,
  CUSTOM_COMPONENT_EXTRAINFO,
  COMPONENT_CONSTRUCTOR_UNDEFINED
} from './pre_define';
import constantDefine from './constant_define';
import createAstNodeUtils from './create_ast_node_utils';
import {
  updateHeritageClauses,
  processComponentMethod,
  BuildCount,
  addRerenderFunc,
  validateBuildMethodCount,
  getEntryNameFunction
} from './process_component_class';
import { judgeBuilderParamAssignedByBuilder } from './process_component_member';
import {
  componentCollection,
  builderParamObjectCollection
} from './validate_ui_syntax';

export class ParamDecoratorInfo {
  initializer: ts.Expression;
  hasRequire: boolean = false;
}

export class StructInfo {
  isComponentV1: boolean = false;
  isComponentV2: boolean = false;
  isCustomDialog: boolean = false;
  isReusable: boolean = false;
  structName: string = '';
  updatePropsDecoratorsV1: string[] = [];
  paramDecoratorMap: Map<string, ParamDecoratorInfo> = new Map();
  eventDecoratorSet: Set<string> = new Set();
  localDecoratorSet: Set<string> = new Set();
  providerDecoratorSet: Set<string> = new Set();
  consumerDecoratorSet: Set<string> = new Set();
  builderParamDecoratorSet: Set<string> = new Set();
  regularSet: Set<string> = new Set();
}

const structMapInEts: Map<string, StructInfo> = new Map();

function getOrCreateStructInfo(key: string): StructInfo {
  let structInfo: StructInfo = structMapInEts.get(key);
  if (!structInfo) {
    structInfo = new StructInfo();
    structInfo.structName = key;
    structMapInEts.set(key, structInfo);
  }
  return structInfo;
}

/**
 * import * as a from './common'
 * a.struct()
 */
function getAliasStructInfo(node: ts.CallExpression): StructInfo {
  let aliasStructInfo: StructInfo;
  if (node.expression && structMapInEts.has(node.expression.getText())) {
    aliasStructInfo = structMapInEts.get(node.expression.getText());
  }
  return aliasStructInfo;
}

function processStructComponentV2(node: ts.StructDeclaration, log: LogInfo[],
  context: ts.TransformationContext): ts.ClassDeclaration {
  return ts.factory.createClassDeclaration(ts.getModifiers(node), node.name,
    node.typeParameters, updateHeritageClauses(node, log, true),
    processStructMembersV2(node, context, log));
}

function processStructMembersV2(node: ts.StructDeclaration, context: ts.TransformationContext,
  log: LogInfo[]): ts.ClassElement[] {
  const structName: string = node.name.getText();
  const newMembers: ts.ClassElement[] = [];
  const buildCount: BuildCount = { count: 0 };
  const structInfo: StructInfo = getOrCreateStructInfo(structName);
  const addStatementsInConstructor: ts.Statement[] = [];
  const paramStatementsInStateVarsMethod: ts.Statement[] = [];
  traverseStructInfo(structInfo, addStatementsInConstructor, paramStatementsInStateVarsMethod);
  node.members.forEach((member: ts.ClassElement) => {
    if (ts.isConstructorDeclaration(member)) {
      processStructConstructorV2(node.members, newMembers, addStatementsInConstructor);
      return;
    } else if (ts.isPropertyDeclaration(member)) {
      newMembers.push(processComponentProperty(member, structInfo, log));
      return;
    } else if (ts.isMethodDeclaration(member) && member.name) {
      const newMethodNode: ts.MethodDeclaration = processComponentMethod(member, context, log, buildCount);
      if (newMethodNode) {
        newMembers.push(newMethodNode);
      }
      return;
    }
    newMembers.push(member);
  });
  validateBuildMethodCount(buildCount, node.name, log);
  updateStateVarsMethodNode(paramStatementsInStateVarsMethod, newMembers);
  newMembers.push(addRerenderFunc([]));
  if (componentCollection.entryComponent === structName) {
    newMembers.push(getEntryNameFunction(componentCollection.entryComponent));
  }
  return newMembers;
}

function traverseStructInfo(structInfo: StructInfo,
  addStatementsInConstructor: ts.Statement[], paramStatementsInStateVarsMethod: ts.Statement[]): void {
  for (const param of structInfo.paramDecoratorMap) {
    addStatementsInConstructor.push(createInitParam(param[0], param[1].initializer));
    paramStatementsInStateVarsMethod.push(updateParamNode(param[0]));
  }
}

function processComponentProperty(member: ts.PropertyDeclaration, structInfo: StructInfo,
  log: LogInfo[]): ts.PropertyDeclaration {
  const propName: string = member.name.getText();
  if (structInfo.paramDecoratorMap.has(propName)) {
    processParamProperty(member);
    return member;
  }
  if (structInfo.builderParamDecoratorSet.has(propName)) {
    processBuilderParamProperty(member, log, propName);
    return member;
  }
  let initFromParams: boolean = false;
  if (structInfo.eventDecoratorSet.has(propName) || structInfo.regularSet.has(propName)) {
    initFromParams = true;
  }
  setInitValue(member, propName, initFromParams);
  return member;
}

function processParamProperty(member: ts.PropertyDeclaration): void {
  // @ts-ignore
  member.initializer = undefined;
  // @ts-ignore
  let newModifiers: ts.Node[] = member.modifiers;
  if (newModifiers) {
    newModifiers = newModifiers.filter((item: ts.Node) => {
      if (ts.isDecorator(item) && ts.isIdentifier(item.expression) &&
        item.expression.escapedText.toString() === constantDefine.REQUIRE) {
        return false;
      }
      return true;
    });
  }
  // @ts-ignore
  member.modifiers = newModifiers;
}

function processBuilderParamProperty(member: ts.PropertyDeclaration, log: LogInfo[], propName: string): void {
  if (judgeBuilderParamAssignedByBuilder(member)) {
    log.push({
      type: LogType.ERROR,
      message: 'BuilderParam property can only initialized by Builder function.',
      pos: member.getStart()
    });
  }
  // @ts-ignore
  member.modifiers = ts.getModifiers(member);
  setInitValue(member, propName, true);
}

function setInitValue(member: ts.PropertyDeclaration, propName: string, initFromParams: boolean) {
  let initNode: ts.Expression = member.initializer ||
    ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED);
  if (initFromParams) {
    initNode = createInitNode(propName, initNode);
  }
  // @ts-ignore
  member.initializer = initNode;
}

function createInitNode(propName: string, defaultValue: ts.Expression): ts.Expression {
  return ts.factory.createConditionalExpression(
    ts.factory.createBinaryExpression(
      ts.factory.createStringLiteral(propName),
      ts.factory.createToken(ts.SyntaxKind.InKeyword),
      ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_PARAMS)
    ),
    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_PARAMS),
      ts.factory.createIdentifier(propName)
    ),
    ts.factory.createToken(ts.SyntaxKind.ColonToken),
    defaultValue
  );
}

function parseComponentProperty(node: ts.StructDeclaration, structInfo: StructInfo, log: LogInfo[],
  sourceFileNode: ts.SourceFile): void {
  node.members.forEach((member: ts.ClassElement) => {
    if (ts.isPropertyDeclaration(member)) {
      const decorators: readonly ts.Decorator[] = ts.getAllDecorators(member);
      parsePropertyDecorator(member, decorators, structInfo, log, sourceFileNode);
    }
  });
}

class PropertyDecorator {
  hasParam: boolean = false;
  hasRequire: boolean = false;
  hasOnce: boolean = false;
  hasEvent: boolean = false;
}

const decoratorsFunc: Record<string, Function> = {
  'Param': parseParamDecorator,
  'Event': parseEventDecorator,
  'Require': parseRequireDecorator,
  'Once': parseOnceDecorator,
  'Local': parseLocalDecorator,
  'BuilderParam': parseBuilderParamDecorator,
  'Provider': parseProviderDecorator,
  'Consumer': parseConsumerDecorator
};

function parsePropertyDecorator(member: ts.PropertyDeclaration, decorators: readonly ts.Decorator[],
  structInfo: StructInfo, log: LogInfo[], sourceFileNode: ts.SourceFile): void {
  const propertyDecorator: PropertyDecorator = new PropertyDecorator();
  let isRegular: boolean = true;
  for (let i = 0; i < decorators.length; i++) {
    const originalName: string = decorators[i].getText().replace(/\([^\(\)]*\)/, '');
    const name: string = originalName.replace('@', '').trim();
    if (decoratorsFunc[name]) {
      decoratorsFunc[name](propertyDecorator, member, structInfo);
    }
    if (constantDefine.COMPONENT_MEMBER_DECORATOR_V2.includes(originalName)) {
      isRegular = false;
    }
  }
  if (isRegular) {
    structInfo.regularSet.add(member.name.getText());
  }
  checkPropertyDecorator(propertyDecorator, member, log, sourceFileNode);
}

function checkPropertyDecorator(propertyDecorator: PropertyDecorator,
  member: ts.PropertyDeclaration, log: LogInfo[], sourceFileNode: ts.SourceFile): void {
  if (log && sourceFileNode) {
    checkParamDecorator(propertyDecorator, member, log, sourceFileNode);
  }
}

function parseParamDecorator(propertyDecorator: PropertyDecorator, member: ts.PropertyDeclaration,
  structInfo: StructInfo): void {
  propertyDecorator.hasParam = true;
  let paramDecoratorInfo: ParamDecoratorInfo = structInfo.paramDecoratorMap.get(member.name.getText());
  if (!paramDecoratorInfo) {
    paramDecoratorInfo = new ParamDecoratorInfo();
  }
  paramDecoratorInfo.initializer = member.initializer;
  structInfo.paramDecoratorMap.set(member.name.getText(), paramDecoratorInfo);
}

function parseEventDecorator(propertyDecorator: PropertyDecorator, member: ts.PropertyDeclaration,
  structInfo: StructInfo): void {
  propertyDecorator.hasEvent = true;
  structInfo.eventDecoratorSet.add(member.name.getText());
}

function parseRequireDecorator(propertyDecorator: PropertyDecorator, member: ts.PropertyDeclaration,
  structInfo: StructInfo): void {
  propertyDecorator.hasRequire = true;
  let paramDecoratorInfo: ParamDecoratorInfo = structInfo.paramDecoratorMap.get(member.name.getText());
  if (!paramDecoratorInfo) {
    paramDecoratorInfo = new ParamDecoratorInfo();
  }
  paramDecoratorInfo.hasRequire = true;
  structInfo.paramDecoratorMap.set(member.name.getText(), paramDecoratorInfo);
}

function parseOnceDecorator(propertyDecorator: PropertyDecorator): void {
  propertyDecorator.hasOnce = true;
}

function parseLocalDecorator(propertyDecorator: PropertyDecorator, member: ts.PropertyDeclaration,
  structInfo: StructInfo): void {
  structInfo.localDecoratorSet.add(member.name.getText());
}

function parseProviderDecorator(propertyDecorator: PropertyDecorator, member: ts.PropertyDeclaration,
  structInfo: StructInfo): void {
  structInfo.providerDecoratorSet.add(member.name.getText());
}

function parseConsumerDecorator(propertyDecorator: PropertyDecorator, member: ts.PropertyDeclaration,
  structInfo: StructInfo): void {
  structInfo.consumerDecoratorSet.add(member.name.getText());
}

function parseBuilderParamDecorator(propertyDecorator: PropertyDecorator, member: ts.PropertyDeclaration,
  structInfo: StructInfo): void {
  let builderParamSet: Set<string> = builderParamObjectCollection.get(structInfo.structName);
  if (!builderParamSet) {
    builderParamSet = new Set();
  }
  builderParamSet.add(member.name.getText());
  builderParamObjectCollection.set(structInfo.structName, builderParamSet);
  structInfo.builderParamDecoratorSet.add(member.name.getText());
}

function checkParamDecorator(propertyDecorator: PropertyDecorator, member: ts.PropertyDeclaration, log: LogInfo[],
  sourceFileNode: ts.SourceFile): void {
  if (propertyDecorator.hasParam && !member.initializer && !propertyDecorator.hasRequire) {
    const message: string = 'When a variable decorated with @Param is not assigned a default value, ' +
      'it must also be decorated with @Require.';
    addLog(LogType.ERROR, message, member.getStart(), log, sourceFileNode);
  }
  if (propertyDecorator.hasOnce && !propertyDecorator.hasParam) {
    const message: string = 'When a variable decorated with @Once, it must also be decorated with @Param.';
    addLog(LogType.ERROR, message, member.getStart(), log, sourceFileNode);
  }
  if (propertyDecorator.hasRequire && !propertyDecorator.hasParam) {
    const message: string = 'In a struct decorated with @ComponentV2, @Require can only be used with @Param.';
    addLog(LogType.ERROR, message, member.getStart(), log, sourceFileNode);
  }
}

function processStructConstructorV2(members: ts.NodeArray<ts.ClassElement>, newMembers: ts.ClassElement[],
  paramStatements: ts.Statement[]): void {
  const constructorIndex: number = members.findIndex((item: ts.ClassElement) => {
    return ts.isConstructorDeclaration(item);
  });
  if (constructorIndex !== -1) {
    const constructorNode: ts.ConstructorDeclaration = members[constructorIndex] as ts.ConstructorDeclaration;
    newMembers.splice(constructorIndex, 0, ts.factory.updateConstructorDeclaration(constructorNode, ts.getModifiers(constructorNode),
      createConstructorParams(), updateConstructorBody(constructorNode.body, paramStatements)));
  }
}

function createConstructorParams(): ts.ParameterDeclaration[] {
  const paramNames: string[] = [COMPONENT_CONSTRUCTOR_PARENT, COMPONENT_CONSTRUCTOR_PARAMS,
    COMPONENT_CONSTRUCTOR_LOCALSTORAGE_PU, ELMTID, COMPONENT_PARAMS_LAMBDA_FUNCTION,
    CUSTOM_COMPONENT_EXTRAINFO];
  return paramNames.map((name: string) => {
    return createAstNodeUtils.createParameterDeclaration(name);
  });
}

function updateConstructorBody(node: ts.Block, paramStatements: ts.Statement[]): ts.Block {
  const body: ts.Statement[] = [createSuperV2()];
  if (node.statements) {
    body.push(...node.statements);
  }
  body.push(...paramStatements, createAstNodeUtils.createFinalizeConstruction());
  return ts.factory.createBlock(body, true);
}

function createSuperV2(): ts.Statement {
  const paramNames: string[] = [COMPONENT_CONSTRUCTOR_PARENT, ELMTID, CUSTOM_COMPONENT_EXTRAINFO];
  return ts.factory.createExpressionStatement(ts.factory.createCallExpression(
    ts.factory.createSuper(), undefined, paramNames.map((name: string) => {
      return ts.factory.createIdentifier(name);
    })));
}

function createInitParam(propName: string, initializer: ts.Expression): ts.ExpressionStatement {
  return ts.factory.createExpressionStatement(ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(ts.factory.createThis(),
      ts.factory.createIdentifier(constantDefine.INIT_PARAM)),
    undefined,
    [
      ts.factory.createStringLiteral(propName),
      ts.factory.createConditionalExpression(ts.factory.createParenthesizedExpression(
        ts.factory.createBinaryExpression(ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_PARAMS),
          ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
          createParamBinaryNode(propName)
        )),
      ts.factory.createToken(ts.SyntaxKind.QuestionToken),
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_PARAMS), ts.factory.createIdentifier(propName)
      ),
      ts.factory.createToken(ts.SyntaxKind.ColonToken),
      initializer || ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED)
      )
    ]));
}

function updateParamNode(propName: string): ts.IfStatement {
  return ts.factory.createIfStatement(createParamBinaryNode(propName),
    ts.factory.createBlock([
      ts.factory.createExpressionStatement(ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(ts.factory.createThis(),
          ts.factory.createIdentifier(constantDefine.UPDATE_PARAM)),
        undefined,
        [
          ts.factory.createStringLiteral(propName),
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_PARAMS), ts.factory.createIdentifier(propName)
          )
        ]))], true));
}

function createParamBinaryNode(propName: string): ts.BinaryExpression {
  return ts.factory.createBinaryExpression(
    ts.factory.createStringLiteral(propName),
    ts.factory.createToken(ts.SyntaxKind.InKeyword),
    ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_PARAMS)
  );
}

function updateStateVarsMethodNode(paramStatements: ts.Statement[], newMembers: ts.ClassElement[]): void {
  if (paramStatements.length) {
    newMembers.push(ts.factory.createMethodDeclaration([ts.factory.createToken(ts.SyntaxKind.PublicKeyword)],
      undefined, ts.factory.createIdentifier(constantDefine.UPDATE_STATE_VARS), undefined, undefined,
      [createAstNodeUtils.createParameterDeclaration(COMPONENT_CONSTRUCTOR_PARAMS)], undefined,
      ts.factory.createBlock([emptyJudgeForParamsNode(), ...paramStatements], true)));
  }
}

function emptyJudgeForParamsNode(): ts.IfStatement {
  return ts.factory.createIfStatement(ts.factory.createBinaryExpression(
    ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_PARAMS),
    ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
    ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_UNDEFINED)
  ), ts.factory.createBlock([ts.factory.createReturnStatement(undefined)], true), undefined);
}

function resetStructMapInEts(): void {
  structMapInEts.clear();
}

export default {
  getOrCreateStructInfo: getOrCreateStructInfo,
  processStructComponentV2: processStructComponentV2,
  parseComponentProperty: parseComponentProperty,
  resetStructMapInEts: resetStructMapInEts,
  getAliasStructInfo: getAliasStructInfo
};
