/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';
import { getIdentifierName, getAnnotationUsage, PresetDecorators } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

const BUILD_NAME: string = 'build';
const BUILD_ROOT_NUM: number = 1;
const STATEMENT_LENGTH: number = 1;

function isBuildOneRoot(
  entryDecoratorUsage: arkts.AnnotationUsage | undefined,
  statements: readonly arkts.Statement[],
  buildNode: arkts.Identifier | undefined,
  context: UISyntaxRuleContext): void {
  if (statements.length > STATEMENT_LENGTH && buildNode) {
    context.report({
      node: buildNode,
      message: entryDecoratorUsage ? rule.messages.invalidBuildRoot : rule.messages.invalidBuildRootNode
    });
  }
}

function reportvalidBuildRoot(
  entryDecoratorUsage: arkts.AnnotationUsage | undefined,
  isContainer: boolean,
  buildNode: arkts.Identifier | undefined,
  context: UISyntaxRuleContext
): void {
  if (entryDecoratorUsage && !isContainer && buildNode) {
    context.report({
      node: buildNode,
      message: rule.messages.invalidBuildRoot,
    });
  }
}

function checkBuildRootNode(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  const loadedContainerComponents = context.componentsInfo.containerComponents;
  if (!arkts.isStructDeclaration(node)) {
    return;
  }
  const entryDecoratorUsage = getAnnotationUsage(node, PresetDecorators.ENTRY);
  node.definition.body.forEach(member => {
    if (!arkts.isMethodDefinition(member) || getIdentifierName(member.name) !== BUILD_NAME) {
      return;
    }
    const blockStatement = member.scriptFunction.body;
    if (!blockStatement || !arkts.isBlockStatement(blockStatement)) {
      return;
    }
    const buildNode = member.scriptFunction.id;
    const statements = blockStatement.statements;
    if (buildNode) {
      // rule1: The 'build' method cannot have more than one root node.
      isBuildOneRoot(entryDecoratorUsage, statements, buildNode, context);
    }
    if (statements.length !== BUILD_ROOT_NUM) {
      return;
    }
    const expressionStatement = statements[0];
    if (!arkts.isExpressionStatement(expressionStatement)) {
      return;
    }
    const callExpression = expressionStatement.expression;
    if (!arkts.isCallExpression(callExpression)) {
      return;
    }
    let componentName: string = '';
    if (arkts.isMemberExpression(callExpression.expression) &&
      arkts.isCallExpression(callExpression.expression.object) &&
      arkts.isIdentifier(callExpression.expression.object.expression)) {
      componentName = getIdentifierName(callExpression.expression.object.expression);
    } else if (arkts.isIdentifier(callExpression.expression)) {
      componentName = getIdentifierName(callExpression.expression);
    }
    let isContainer: boolean = false;
    if (!loadedContainerComponents) {
      return;
    }
    isContainer = componentName
      ? loadedContainerComponents.includes(componentName)
      : false;
    // rule2: its 'build' function can have only one root node, which must be a container component.
    reportvalidBuildRoot(entryDecoratorUsage, isContainer, buildNode, context);
  });
}

const rule: UISyntaxRule = {
  name: 'build-root-node',
  messages: {
    invalidBuildRoot: `In an '@Entry' decorated component, the 'build' function can have only one root node, which must be a container component.`,
    invalidBuildRootNode: `The 'build' function can have only one root node.`
  },
  setup(context) {
    return {
      parsed: (node): void => {
        checkBuildRootNode(node, context);
      },
    };
  },
};

export default rule;
