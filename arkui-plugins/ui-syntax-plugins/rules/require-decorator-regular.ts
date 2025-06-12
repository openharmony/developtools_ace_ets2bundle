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
import { getClassPropertyAnnotationNames, PresetDecorators, isPrivateClassProperty, getClassPropertyName } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

const allowedDecorators = [
  PresetDecorators.STATE,
  PresetDecorators.PROVIDE,
  PresetDecorators.PROP,
  PresetDecorators.PARAM,
  PresetDecorators.BUILDER_PARAM
];

function getRequireDecorator(
  member: arkts.ClassProperty
): arkts.AnnotationUsage | undefined {
  return member.annotations?.find(annotation =>
    annotation.expr && arkts.isIdentifier(annotation.expr) &&
    annotation.expr.name === PresetDecorators.REQUIRE
  );
}

function findConflictingDecorator(
  member: arkts.ClassProperty,
  allowedDecorators: string[]
): arkts.AnnotationUsage | undefined {
  return member.annotations?.find(annotation =>
    annotation.expr && arkts.isIdentifier(annotation.expr) &&
    annotation.expr.name !== PresetDecorators.REQUIRE &&
    !allowedDecorators.includes(annotation.expr.name)
  );
}

function handlePrivateWithRequire(
  member: arkts.ClassProperty,
  context: UISyntaxRuleContext,
): void {
  const requireDecorator = getRequireDecorator(member);
  if (requireDecorator) {
    context.report({
      node: requireDecorator,
      message: rule.messages.invalidPrivateWithRequire,
      data: {
        propertyName: getClassPropertyName(member),
        decoratorName: PresetDecorators.REQUIRE,
      },
    });
  }
}

function checkRequireDecorator(node: arkts.StructDeclaration, context: UISyntaxRuleContext): void {
  node.definition.body.forEach(member => {
    if (!arkts.isClassProperty(member)) {
      return;
    }
    // Get the list of decorators applied to the class property
    const propertyDecorators = getClassPropertyAnnotationNames(member);
    if (!propertyDecorators.includes(PresetDecorators.REQUIRE)) {
      return;
    }
    if (isPrivateClassProperty(member)) {
      handlePrivateWithRequire(member, context);
    }
    // Filter the decorators to find any that are not allowed with @Require
    const otherDecorator = findConflictingDecorator(member, allowedDecorators);
    const requireDecorator = getRequireDecorator(member);
    if (otherDecorator && requireDecorator) {
      context.report({
        node: requireDecorator,
        message: rule.messages.invalidUsage,
      });
    }
  });
}

const rule: UISyntaxRule = {
  name: 'require-decorator-regular',
  messages: {
    invalidUsage: `The @Require decorator can only be used on a regular variable or a variable decorated by @State, @Provide, @Prop, @Param, or @BuilderParam.`,
    invalidPrivateWithRequire: `Property '{{propertyName}}' can not be decorated with both {{decoratorName}} and private.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        checkRequireDecorator(node, context);
      },
    };
  },
};

export default rule;
