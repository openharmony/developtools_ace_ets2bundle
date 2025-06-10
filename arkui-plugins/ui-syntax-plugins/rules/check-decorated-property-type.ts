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
  forbiddenUseStateType,
  getAnnotationUsage, getClassPropertyAnnotationNames, getClassPropertyName,
  getClassPropertyType, PresetDecorators
} from '../utils';

const forbiddenUseStateTypeForDecorators: string[] = [
  PresetDecorators.STATE,
  PresetDecorators.PROP,
  PresetDecorators.LINK,
  PresetDecorators.PROVIDE,
  PresetDecorators.CONSUME,
  PresetDecorators.OBJECT_LINK,
  PresetDecorators.BUILDER_PARAM,
  PresetDecorators.STORAGE_PROP,
  PresetDecorators.STORAGE_LINK,
  PresetDecorators.LOCAL_STORAGE_PROP,
  PresetDecorators.LOCAL_STORAGE_LINK,
];

function checkDecoratedPropertyType(
  member: arkts.AstNode,
  context: UISyntaxRuleContext,
  annoList: string[],
  typeList: string[]
): void {
  if (!arkts.isClassProperty(member)) {
    return;
  }
  const propertyName: string = getClassPropertyName(member);
  const propertyType: string = getClassPropertyType(member);
  const propertyAnnotationNames: string[] = getClassPropertyAnnotationNames(member);
  const decoratorName: string | undefined =
    propertyAnnotationNames.find((annotation) => annoList.includes(annotation));
  const isType: boolean = typeList.includes(propertyType);
  if (!member.key) {
    return;
  }
  const errorNode = member.key;
  if (decoratorName && isType) {
    context.report({
      node: errorNode,
      message: rule.messages.invalidDecoratedPropertyType,
      data: { decoratorName, propertyName, propertyType },
    });
  }
}

const rule: UISyntaxRule = {
  name: 'check-decorated-property-type',
  messages: {
    invalidDecoratedPropertyType: `The '@{{decoratorName}}' property '{{propertyName}}' cannot be a '{{propertyType}}' object.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        if (!node.definition) {
          return;
        }
        const componentDecorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);
        if (!componentDecorator) {
          return;
        }
        node.definition.body.forEach(member => {
          checkDecoratedPropertyType(member, context, forbiddenUseStateTypeForDecorators, forbiddenUseStateType);
        });
      },
    };
  },
};

export default rule;