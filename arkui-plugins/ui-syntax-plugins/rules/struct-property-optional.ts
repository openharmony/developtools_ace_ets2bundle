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
import { PresetDecorators } from '../utils/index';

// @Prop needs to consider whether there is an initialization value
const requireDecorators = [
  PresetDecorators.LINK,
  PresetDecorators.OBJECT_LINK,
];

function hasPropOrRequireDecorator(context: UISyntaxRuleContext, node: arkts.ClassProperty, propertyName: string): void {
  node.annotations?.forEach(annotation => {
    if (annotation.expr && arkts.isIdentifier(annotation.expr)) {
      const decoratorName = annotation.expr?.name;
      const nodeKey = node.key;
      const nodeValue = node.value;
      // Check whether the prop decorator has an initial value, and no alarm will be generated if there is an initial value
      if (decoratorName === PresetDecorators.PROP && nodeKey && !nodeValue) {
        context.report({
          node: nodeKey,
          message: rule.messages.propertyOptional,
          data: {
            decoratorName,
            propertyName,
          },
        });
      } else if (requireDecorators.includes(decoratorName) && nodeKey) {
        context.report({
          node: nodeKey,
          message: rule.messages.propertyOptional,
          data: {
            decoratorName,
            propertyName,
          },
        });
      }
    }
  });
}

function isClassPropertyOptional(node: arkts.ClassProperty): boolean {
  const OPTIONAL_MASK = 1 << 7;
  if ((node.modifiers & OPTIONAL_MASK) !== 0) {
    return true;
  } else {
    return false;
  }
}

const rule: UISyntaxRule = {
  name: 'struct-property-optional',
  messages: {
    propertyOptional: `The '{{decoratorName}}' property '{{propertyName}}' cannot be an optional parameter.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        // Check if it's a class property
        if (!arkts.isClassProperty(node)) {
          return;
        }
        if (!node.key || !arkts.isIdentifier(node.key)) {
          return;
        }
        const keyname = node.key.name;
        // If the property is optional, check the decorator further
        if (!isClassPropertyOptional(node)) {
          return;
        }
        hasPropOrRequireDecorator(context, node, keyname);
      },
    };
  },
};

export default rule;