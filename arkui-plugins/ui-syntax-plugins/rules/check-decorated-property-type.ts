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
import {
  getAnnotationUsage, getClassPropertyAnnotationNames, getClassPropertyName,
  getClassPropertyType, PresetDecorators
} from '../utils';

function checkDecoratedPropertyType(
  member: arkts.AstNode,
  context: UISyntaxRuleContext,
  relationship: Record<string, string[]>
): void {
  if (!arkts.isClassProperty(member)) {
    return;
  }
  const propertyName = getClassPropertyName(member);
  const propertyType = getClassPropertyType(member);
  const propertyAnnotationNames = getClassPropertyAnnotationNames(member);
  Object.entries(relationship).forEach(([decoratorName, invalidPropertyTypes]) => {
    if (propertyAnnotationNames.some(annotationName => annotationName === decoratorName) &&
      invalidPropertyTypes
        .some(invalidPropertyType => invalidPropertyType === propertyType)) {
      if (!arkts.isClassProperty || member.key === undefined) {
        return;
      }
      const errorNode = member.key;
      context.report({
        node: errorNode,
        message: rule.messages.invalidDecoratedPropertyType,
        data: { decoratorName, propertyName, propertyType },
      });
    }
  });
}

const rule: UISyntaxRule = {
  name: 'check-decorated-property-type',
  messages: {
    invalidDecoratedPropertyType: `The {{decoratorName}} property '{{propertyName}}' cannot be a '{{propertyType}}' object.`,
  },
  setup(context) {
    const relationship: Record<string, string[]> = {
      [PresetDecorators.STATE]: ['CustomDialogController'],
    };
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        const componentDecorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);
        if (!componentDecorator) {
          return;
        }
        node.definition.body.forEach(member => {
          checkDecoratedPropertyType(member, context, relationship);
        });
      },
    };
  },
};

export default rule;