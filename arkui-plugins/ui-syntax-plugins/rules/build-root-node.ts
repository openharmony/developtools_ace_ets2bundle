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

function isBuildOneRoot(statements: readonly arkts.Statement[], buildNode: arkts.Identifier,
  context: UISyntaxRuleContext): void {
  if (statements.length > STATEMENT_LENGTH && buildNode) {
    context.report({
      node: buildNode,
      message: rule.messages.invalidBuildRootCount,
    });
  }
}

function checkBuildRootNode(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  const loadedContainerComponents = context.containerComponents;
  if (!arkts.isStructDeclaration(node)) {
    return;
  }
  const entryDecoratorUsage = getAnnotationUsage(node, PresetDecorators.ENTRY);
  node.definition.body.forEach(member => {
    // Determine the number of root node
    if (!arkts.isMethodDefinition(member) || getIdentifierName(member.name) !== BUILD_NAME) {
      return;
    }
    const blockStatement = member.scriptFunction.body;
    if (!blockStatement || !arkts.isBlockStatement(blockStatement)) {
      return;
    }
    const buildNode = member.scriptFunction.id;
    const statements = blockStatement.statements;
    // rule1: The 'build' method cannot have more than one root node.
    if (buildNode) {
      isBuildOneRoot(statements, buildNode, context);
    }
    if (statements.length !== BUILD_ROOT_NUM) {
      return;
    }
    // Determine whether it is a container component
    const expressionStatement = statements[0];
    if (!arkts.isExpressionStatement(expressionStatement)) {
      return;
    }
    const callExpression = expressionStatement.expression;
    if (!arkts.isCallExpression(callExpression)) {
      return;
    }
    const componentName = callExpression.expression.dumpSrc();
    let isContainer: boolean = false;
    loadedContainerComponents?.forEach(container => {
      if (componentName.includes(container)) {
        isContainer = true;
      }
    });
    // rule2: If the component is decorated by '@Entry', 
    // its 'build' function can have only one root node, which must be a container component.
    if (entryDecoratorUsage && !isContainer && buildNode) {
      context.report({
        node: buildNode,
        message: rule.messages.invalidBuildRoot,
      });
    }
  });
}

const rule: UISyntaxRule = {
  name: 'build-root-node',
  messages: {
    invalidBuildRootCount: `The 'build' method cannot have more than one root node.`,
    invalidBuildRoot: `If the component is decorated by '@Entry', its 'build' function can have only one root node, which must be a container component.`
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
