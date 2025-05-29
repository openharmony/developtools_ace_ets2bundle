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
import {
  getIdentifierName,
  isAtomicComponent,
  isBuildInComponent,
  isSingleChildComponent,
  listToString,
  SINGLE_CHILD_COMPONENT
} from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function checkValidParentComponent(node: arkts.AstNode, context: UISyntaxRuleContext,): void {
  // Check if the node is an identifier and if there are any restrictions on the parent component
  if (!arkts.isIdentifier(node)) {
    return;
  }
  const componentName: string = getIdentifierName(node);
  if (!context.componentsInfo.validParentComponent.has(componentName) || !node.parent || !node.parent.parent) {
    return;
  }
  let curNode = node.parent.parent;
  while (!arkts.isCallExpression(curNode) || !arkts.isIdentifier(curNode.expression) ||
    !isBuildInComponent(context, curNode.expression.name)) {
    if (!curNode.parent) {
      return;
    }
    curNode = curNode.parent;
  }
  // If the parent component of the current component is not within the valid range, an error is reported
  const parentComponentName = curNode.expression.name;
  if (!context.componentsInfo.validParentComponent.get(componentName)!.includes(parentComponentName)) {
    context.report({
      node: node,
      message: rule.messages.delegateChildrenComponentChildren,
      data: {
        childComponentName: componentName,
        parentComponentName: parentComponentName,
      },
    });
    const parentComponentListArray: string[] = context.componentsInfo.validParentComponent.get(componentName)!;
    const parentComponentList: string = listToString(parentComponentListArray);
    context.report({
      node: node,
      message: rule.messages.delegateParentComponent,
      data: {
        componentName: componentName,
        parentComponentList: parentComponentList,
      },
    });
  }
}

function checkValidChildComponent(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  // Check whether the node is an identifier and whether there are restrictions on subcomponents
  if (!arkts.isIdentifier(node)) {
    return;
  }
  const parentComponentName: string = getIdentifierName(node);
  if (!context.componentsInfo.validChildComponent.has(parentComponentName) || !node.parent) {
    return;
  }
  let parentNode = node.parent;
  if (!arkts.isCallExpression(parentNode) || !arkts.isIdentifier(parentNode.expression)) {
    return;
  }
  // If the BlockStatement contains a child component that should not exist under the component, an error will be reported
  parentNode.getChildren().forEach(member => {
    if (!arkts.isBlockStatement(member)) {
      return;
    }
    member.statements.forEach(statement => {
      if (!arkts.isExpressionStatement(statement) || !statement.expression) {
        return;
      }
      if (!arkts.isCallExpression(statement.expression) || !statement.expression.expression ||
        !arkts.isIdentifier(statement.expression.expression)) {
        return;
      }
      const componentName = getIdentifierName(statement.expression.expression);
      const childComponentListArray: string[] = context.componentsInfo.validChildComponent.get(parentComponentName)!;
      if (!childComponentListArray.includes(componentName) && isBuildInComponent(context, componentName)) {
        const childComponentList: string = listToString(childComponentListArray);
        context.report({
          node: parentNode,
          message: rule.messages.delegateChildrenComponentParent,
          data: {
            parentComponentName: parentComponentName,
            childComponentList: childComponentList,
          },
        });
      }
    });
  });
}
function checkSingleChildComponent(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  // Check whether the current node is an identifier and a single subcomponent container
  if (!arkts.isIdentifier(node)) {
    return;
  }
  const componentName: string = getIdentifierName(node);
  if (!isSingleChildComponent(context, componentName) || !node.parent) {
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
    if (member.statements.length > SINGLE_CHILD_COMPONENT) {
      context.report({
        node: node,
        message: rule.messages.singleChildComponent,
        data: { componentName: componentName }
      });
    }
  });
}

function checkNoChildComponent(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  // Check whether the current node is an identifier and an atomic component
  if (!arkts.isIdentifier(node)) {
    return;
  }
  const componentName: string = getIdentifierName(node);
  if (!isAtomicComponent(context, componentName) || !node.parent) {
    return;
  }
  let parentNode = node.parent;
  if (!arkts.isCallExpression(parentNode)) {
    return;
  }
  // If there are child components in arguments, an error will be reported
  parentNode.getChildren().forEach(member => {
    if (!arkts.isBlockStatement(member)) {
      return;
    }
    if (member.statements.length > 0) {
      context.report({
        node: node,
        message: rule.messages.noChildComponent,
        data: { componentName: componentName }
      });
    }
  });
}

const rule: UISyntaxRule = {
  name: 'nested-relationship',
  messages: {
    noChildComponent: `No child component is allowed in the '{{componentName}}' component.`,
    singleChildComponent: `The '{{componentName}}' component can have only one child component.`,
    delegateChildrenComponentChildren: `The '{{childComponentName}}' component cannot be a child component of the '{{parentComponentName}}' component.`,
    delegateChildrenComponentParent: `The component '{{parentComponentName}}' can only have the child component {{childComponentList}}.`,
    delegateParentComponent: `The '{{componentName}}' component can only be nested in the {{parentComponentList}} parent component.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        checkValidParentComponent(node, context);
        checkValidChildComponent(node, context);
        checkSingleChildComponent(node, context);
        checkNoChildComponent(node, context);
      },
    };
  },
};

export default rule;