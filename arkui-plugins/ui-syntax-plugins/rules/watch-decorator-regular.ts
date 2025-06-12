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
import { getClassPropertyAnnotationNames, getClassPropertyName, PresetDecorators } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

const PROPERTY_ANNOTATION_NUM: number = 2;

function validateWatchDecorator(node: arkts.StructDeclaration, context: UISyntaxRuleContext): void {
  node.definition.body.forEach(member => {
    if (!arkts.isClassProperty(member)) {
      return;
    }
    const hasWatchDecorator = member.annotations?.find(annotation =>
      annotation.expr && arkts.isIdentifier(annotation.expr) &&
      annotation.expr.name === PresetDecorators.WATCH
    );
    const propertyAnnotationNames = getClassPropertyAnnotationNames(member);
    const propertyName = getClassPropertyName(member);
    // Determine if there are any decorations other than @watch decorations
    // rule1: The @Watch decorator must be used with other decorators
    if (hasWatchDecorator && propertyAnnotationNames.length < PROPERTY_ANNOTATION_NUM) {
      context.report({
        node: hasWatchDecorator,
        message: rule.messages.invalidWatch,
        data: {
          propertyName: propertyName
        }
      });
    }
  });
}

const rule: UISyntaxRule = {
  name: 'watch-decorator-regular',
  messages: {
    invalidWatch: `Regular variable '{{propertyName}}' can not be decorated with '@Watch'.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        validateWatchDecorator(node, context);
      },
    };
  },
};

export default rule;
