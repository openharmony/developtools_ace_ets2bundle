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
import { getIdentifierName } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function checkInvalidChildInText(node: arkts.AstNode, context: UISyntaxRuleContext, textChild: string[]): void {
  // Check if the current node is an identifier, and name is 'Text'
  if (!arkts.isIdentifier(node)) {
    return;
  }
  if (getIdentifierName(node) !== 'Text') {
    return;
  }
  if (!node.parent) {
    return;
  }
  const parentNode = node.parent;
  if (!arkts.isCallExpression(parentNode)) {
    return;
  }
  // If the BlockStatement contains a child component that should not exist under the text, an error will be reported
  parentNode.getChildren().forEach(member => {
    if (!arkts.isBlockStatement(member)) {
      return;
    }
    member.getChildren().forEach(sibling => {
      if (!arkts.isExpressionStatement(sibling) || !arkts.isCallExpression(sibling.expression)) {
        return;
      }
      const childComponentName = sibling.expression.expression.dumpSrc();
      if (!textChild.includes(childComponentName)) {
        context.report({
          node: node,
          message: rule.messages.invalidChildInText
        });
        return;
      }
    });
  });
}
function checkOneChildInButton(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  // Check if the current node is an identifier, and name is 'Button'
  if (!arkts.isIdentifier(node)) {
    return;
  }
  if (getIdentifierName(node) !== 'Button') {
    return;
  }
  if (!node.parent) {
    return;
  }
  const parentNode = node.parent;
  if (!arkts.isCallExpression(parentNode)) {
    return;
  }
  // If there is more than one subcomponent in the BlockStatement, an error is reported
  parentNode.getChildren().forEach(member => {
    if (!arkts.isBlockStatement(member)) {
      return;
    }
    if (member.statements.length > 1) {
      context.report({
        node: node,
        message: rule.messages.oneChildInButton
      });
    }
  });
}

function checkListItem(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  // Check if the current node is an identifier, and name is 'ListItem'
  if (!arkts.isIdentifier(node)) {
    return;
  }
  if (getIdentifierName(node) !== 'ListItem') {
    return;
  }
  if (!node.parent || !node.parent.parent) {
    return;
  }
  let curNode: arkts.AstNode = node.parent.parent;
  do {
    while (!arkts.isCallExpression(curNode)) {
      if (!curNode.parent) {
        return;
      }
      curNode = curNode.parent;
    }
    const parentName: string = curNode.expression.dumpSrc();
    if (parentName === 'List') { // If the parent component's name is 'List', exit directly
      break;
    } else if (parentName !== 'ForEach') { // If the parent component's name is not 'List' or 'ForEach', throw an error
      context.report({
        node: node,
        message: rule.messages.listItemCannotInOther,
        data: { parentName: parentName }
      });
      context.report({
        node: node,
        message: rule.messages.listItemMustInList
      });
      break;
    }
    // In the remaining case, the parent component is 'ForEach', continue traversing upwards for further checks
    if (!curNode.parent) {
      return;
    }
    curNode = curNode.parent;
  } while (true);
}

function checkSpan(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  // Check if the current node is an identifier, and name is 'Span'
  if (!arkts.isIdentifier(node)) {
    return;
  }
  if (getIdentifierName(node) !== 'Span') {
    return;
  }
  let parentNode = node.parent;
  if (!arkts.isCallExpression(parentNode)) {
    return;
  }
  // If there are subcomponents in the BlockStatement, an error is reported
  parentNode.getChildren().forEach(sibling => {
    if (!arkts.isBlockStatement(sibling)) {
      return;
    }
    if (sibling.statements.length > 0) {
      context.report({
        node: node,
        message: rule.messages.noChildInSpan
      });
    }
  });
  if (!node.parent || !node.parent.parent) {
    return;
  }
  parentNode = parentNode.parent;
  while (!arkts.isCallExpression(parentNode)) {
    parentNode = parentNode.parent;
  }
  const parentName: string = parentNode.expression.dumpSrc();
  // If the name of the parent component is not 'Text', an error is reported
  if (parentName !== 'Text' && parentName !== 'RichEditor' && parentName !== 'ContainerSpan') {
    context.report({
      node: node,
      message: rule.messages.spanMustInText
    });
  }
}
// The 'Text' component can have only the Span, ImageSpan, ContainerSpan and SymbolSpan child component. 

const rule: UISyntaxRule = {
  name: 'nested-relationship',
  messages: {
    invalidChildInText: `The 'Text' component can have only the Span, ImageSpan, ContainerSpan and SymbolSpan child component.`,
    oneChildInButton: `The 'Button' component can have only one child component.`,
    listItemMustInList: `The 'ListItem' component can only be nested in the List and ListItemGroup parent component.`,
    listItemCannotInOther: `The 'ListItem' component cannot be a child component of the '{{parentName}}' component.`,
    noChildInSpan: `No child component is allowed in the 'Span' component. `,
    spanMustInText: `The 'Span' component can only be nested in the Text, RichEditor and ContainerSpan parent component. `,
  },
  setup(context) {
    const textChild: string[] = ['Span', 'ImageSpan', 'ContainerSpan', 'SymbolSpan'];
    return {
      parsed: (node): void => {
        checkInvalidChildInText(node, context, textChild);
        checkOneChildInButton(node, context);
        checkListItem(node, context);
        checkSpan(node, context);
      },
    };
  },
};

export default rule;