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

function attributeNoInvoke(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  const childNode = node.getChildren();
  if (!Array.isArray(childNode) || childNode.length < 1) {
    return;
  }
  if (arkts.isMemberExpression(childNode[0]) && arkts.isIdentifier(childNode[0].property)) {
    context.report({
      node,
      message: rule.messages.cannotInitializePrivateVariables,
      data: {
        componentNode: node.dumpSrc(),
      },
    });
  }
}

function chainJudgment(node: arkts.AstNode): boolean {
  let childNode = node.getChildren();
  while (true) {
    if (!childNode || childNode.length === 0) {
      return false;
    }
    const firstChild = childNode[0];
    if (arkts.isIdentifier(firstChild)) {
      break;
    }
    if (!arkts.isMemberExpression(firstChild) && !arkts.isCallExpression(firstChild)) {
      return false;
    }
    childNode = firstChild.getChildren();
  }
  return true;
}


const rule: UISyntaxRule = {
  name: 'attribute-no-invoke',
  messages: {
    cannotInitializePrivateVariables: `'{{componentNode}}' does not meet UI component syntax.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (arkts.isExpressionStatement(node) && !arkts.isIdentifier(node.expression) && chainJudgment(node)) {
          attributeNoInvoke(node, context);
        }
      },
    };
  },
};

export default rule;