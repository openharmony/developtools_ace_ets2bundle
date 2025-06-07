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
  PresetDecorators,
  SINGLE_CHILD_COMPONENT,
  TOGGLE_TYPE,
  ToggleType,
  TYPE
} from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function getToggleType(node: arkts.CallExpression): string {
  let toggleType = '';
  node.arguments.forEach((member) => {
    if (!arkts.isObjectExpression(member) || !member.properties) {
      return;
    }
    member.properties.forEach((property) => {
      if (!arkts.isProperty(property) || !property.value) {
        return;
      }
      // If the property name is not 'toggle type'
      if (!arkts.isMemberExpression(property.value) || !property.value.object ||
        !arkts.isIdentifier(property.value.object) || property.value.object.name !== TOGGLE_TYPE) {
        return;
      }
      if (!property.value.property || !arkts.isIdentifier(property.value.property)) {
        return;
      }
      toggleType = property.value.property.name;
    });
  });
  return toggleType;
}

function checkSingleChildComponent(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  // Check whether the current node is an identifier and toggle component
  if (!arkts.isIdentifier(node)) {
    return;
  }
  const componentName: string = getIdentifierName(node);
  if (componentName !== PresetDecorators.TOGGLE || !node.parent) {
    return;
  }
  const parentNode = node.parent;
  if (!arkts.isCallExpression(parentNode)) {
    return;
  }
  const toggleTypeValue = getToggleType(parentNode);
  // If there is more than one subcomponent in the BlockStatement, an error is reported
  parentNode.getChildren().forEach(member => {
    if (!arkts.isBlockStatement(member)) {
      return;
    }
    // If the toggle component type is checkbox and has child components, an error is reported
    if (toggleTypeValue === ToggleType.CHECKBOX && member.statements.length > 0) {
      context.report({
        node: node,
        message: rule.messages.toggleTypeCheckboxWithNoChild,
        data: {
          componentName: componentName,
          toggleTypeKey: TYPE,
          toggleTypeValue: toggleTypeValue
        }
      });
    }
    // If the toggle component type is button and there is more than one child component, an error is reported
    if (toggleTypeValue === ToggleType.BUTTON && member.statements.length > SINGLE_CHILD_COMPONENT) {
      context.report({
        node: node,
        message: rule.messages.toggleTypeButtonWithsingleChild,
        data: {
          componentName: componentName,
          toggleTypeKey: TYPE,
          toggleTypeValue: toggleTypeValue
        }
      });
    }
  });
}


const rule: UISyntaxRule = {
  name: 'specific-component-children',
  messages: {
    toggleTypeCheckboxWithNoChild: `When the component '{{componentName}}' set '{{toggleTypeKey}}' as '{{toggleTypeValue}}', it can't have any child.`,
    toggleTypeButtonWithsingleChild: `When the component '{{componentName}}' set '{{toggleTypeKey}}' as '{{toggleTypeValue}}', it can only have a single child component.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        checkSingleChildComponent(node, context);
      },
    };
  },
};

export default rule;