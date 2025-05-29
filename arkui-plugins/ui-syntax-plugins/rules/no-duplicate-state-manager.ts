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
import { getClassPropertyAnnotationNames, getIdentifierName, PresetDecorators, getAnnotationUsage } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

export const stateManagementDecorator = {
  STATE: PresetDecorators.STATE,
  PROP: PresetDecorators.PROP,
  LINK: PresetDecorators.LINK,
  PROVIDE: PresetDecorators.PROVIDER,
  CONSUME: PresetDecorators.CONSUME
};

const CLASS_PROPERTY_ANNOTATION_ONE: number = 1;
function duplicateState(
  node: arkts.StructDeclaration,
  context: UISyntaxRuleContext
): void {
  node.definition.body.forEach(body => {
    if (arkts.isClassProperty(body)) {
      // Get the list of decorators
      const propertyDecorators = getClassPropertyAnnotationNames(body);
      // Filter the decorators to get those related to state management
      const stateDecorators = propertyDecorators.filter(decorator =>
        Object.values(stateManagementDecorator).includes(decorator)
      );

      // Check if Require is included
      const propertyNameNode = body.key;
      let attributeName: string = '';
      if (propertyNameNode && arkts.isIdentifier(propertyNameNode)) {
        attributeName = getIdentifierName(propertyNameNode);
      }
      if (!propertyNameNode || !attributeName) {
        return;
      }
      if (stateDecorators.length > CLASS_PROPERTY_ANNOTATION_ONE) {
        context.report({
          node: propertyNameNode,
          message: rule.messages.duplicateState,
          data: { attributeName },
        });
      }
    }
  });
}

const rule: UISyntaxRule = {
  name: 'no-duplicate-state-manager',
  messages: {
    duplicateState: `This property '{{attributeName}}' cannot have mutilate state management decorators.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        const hasComponentV2 = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
        if (hasComponentV2) {
          return;
        }
        duplicateState(node, context);
      },
    };
  },
};

export default rule;
