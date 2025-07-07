/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';
import { getIdentifierName } from '../utils';

function isInsideStructAndBuild(node: arkts.AstNode): boolean {
  let parentNode = node.parent;
  let isInStruct = false;
  let isInBuild = false;
  while (arkts.nodeType(parentNode) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    if (arkts.isStructDeclaration(parentNode)) {
      isInStruct = true;
    }
    if (arkts.isScriptFunction(parentNode) && parentNode.id?.name === 'build') {
      isInBuild = true;
    }
    parentNode = parentNode.parent;
  }
  return isInStruct && isInBuild;
}

function reportNoChildInButtonError(parentNode: arkts.AstNode, context: UISyntaxRuleContext): void {
  const siblings = parentNode.getChildren();
  if (!Array.isArray(siblings) || siblings.length < 3) {
    return;
  }
  if (arkts.isStringLiteral(siblings[1]) && arkts.isBlockStatement(siblings[2])) {
    context.report({
      node: parentNode,
      message: rule.messages.noChildInButton,
      fix: (parentNode) => {
        const startPosition = arkts.getStartPosition(siblings[2]);
        const endPosition = arkts.getEndPosition(siblings[2]);
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      },
    });
  }
}

const rule: UISyntaxRule = {
  name: 'no-child-in-button',
  messages: {
    noChildInButton: `The Button component with a label parameter can not have any child.`,
  },
  setup(context: UISyntaxRuleContext) {
    return {
      parsed: (node): void => {
        // Check if the current node is an identifier
        if (!arkts.isIdentifier(node)) {
          return;
        }
        const componentName = getIdentifierName(node);
        // If the current node is 'Button'
        if (componentName !== 'Button') {
          return;
        }
        if (!isInsideStructAndBuild(node)) {
          return;
        }
        // Obtain the information of the parent node of the current node
        let parentNode = node.parent;
        if (!arkts.isCallExpression(parentNode)) {
          return;
        };
        // Gets and traverses all the children of the parent node
        reportNoChildInButtonError(parentNode, context);
      }
    };
  },
};

export default rule;