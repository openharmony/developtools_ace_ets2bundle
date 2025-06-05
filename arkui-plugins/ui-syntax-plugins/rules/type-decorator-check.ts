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
import { getAnnotationName, PresetDecorators } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function findTypeDecorator(
  annotations: readonly arkts.AnnotationUsage[]
): arkts.AnnotationUsage | undefined {
  let typeDecorator = annotations?.find(annotation =>
    annotation.expr && arkts.isIdentifier(annotation.expr) &&
    annotation.expr.name === PresetDecorators.TYPE
  );
  return typeDecorator;
}

function getTypeDecorator(
  node: arkts.ClassDeclaration,
): arkts.AnnotationUsage | undefined {
  let typeDecorator: arkts.AnnotationUsage | undefined;
  node.definition?.body.forEach(member => {
    if (arkts.isClassProperty(member) && member.annotations) {
      typeDecorator = findTypeDecorator(member.annotations);
    }
  });
  return typeDecorator;
}

// rule1: @Type can only be used for class
function checkTypeInStruct(
  node: arkts.StructDeclaration,
  context: UISyntaxRuleContext,
): void {
  let typeDecorator: arkts.AnnotationUsage | undefined;
  node.definition.body.forEach(member => {
    if (arkts.isClassProperty(member) && member.annotations) {
      typeDecorator = findTypeDecorator(member.annotations);
      reportInvalidTypeUsageInStruct(typeDecorator, context);
    }
  });
}

function reportInvalidTypeUsageInStruct(
  typeDecorator: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  if (!typeDecorator) {
    return;
  }
  context.report({
    node: typeDecorator,
    message: rule.messages.invalidType,
    fix: (typeDecorator) => {
      const startPosition = typeDecorator.startPosition;
      const endPosition = typeDecorator.endPosition;
      return {
        range: [startPosition, endPosition],
        code: ''
      };
    }
  });
}

// rule2: Conflict between @Type and @Observed
function checkObservedAndTypeConflict(
  node: arkts.ClassDeclaration,
  context: UISyntaxRuleContext
): void {
  let typeDecorator: arkts.AnnotationUsage | undefined;
  node.definition?.annotations.forEach(member => {
    const annotation = getAnnotationName(member);
    typeDecorator = getTypeDecorator(node);
    if (annotation !== PresetDecorators.OBSERVED_V2) {
      reportObservedAndTypeDecoratorConflict(typeDecorator, context);
    }
  });
}

function reportObservedAndTypeDecoratorConflict(
  typeDecorator: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  if (!typeDecorator) {
    return;
  }
  context.report({
    node: typeDecorator,
    message: rule.messages.invalidDecoratorWith,
    fix: () => {
      const startPosition = typeDecorator.startPosition;
      const endPosition = typeDecorator.endPosition;
      return {
        range: [startPosition, endPosition],
        code: ''
      };
    }
  });
}

// rule3: @TypeCannot be used for function members
function validateScriptFunctionForTypeDecorator(
  node: arkts.ScriptFunction,
  context: UISyntaxRuleContext
): void {
  const typeDecorator = findTypeDecorator(node.annotations);
  reportInvalidTypeDecorator(typeDecorator, context);
}

function reportInvalidTypeDecorator(
  typeDecorator: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  if (!typeDecorator) {
    return;
  }
  context.report({
    node: typeDecorator,
    message: rule.messages.invalidTypeMember,
    fix: (typeDecorator) => {
      const startPosition = typeDecorator.startPosition;
      const endPosition = typeDecorator.endPosition;
      return {
        range: [startPosition, endPosition],
        code: ''
      };
    }
  });
}

const rule: UISyntaxRule = {
  name: 'type-decorator-check',
  messages: {
    invalidType: `The @Type decorator is not allowed here. It must be used in a class.`,
    invalidDecoratorWith: `The @Type decorator can not be used within a 'class' decorated with @Observed.`,
    invalidTypeMember: `The @Type decorator is not allowed here. It can only decorate properties of a class.`
  },
  setup(context) {
    return {
      parsed: (node): void => {
        // Check the decorator on the class
        if (arkts.isClassDeclaration(node)) {
          checkObservedAndTypeConflict(node, context);
        }
        if (arkts.isStructDeclaration(node)) {
          checkTypeInStruct(node, context);
        }
        if (arkts.isScriptFunction(node) && node.annotations) {
          validateScriptFunctionForTypeDecorator(node, context);
        }
      },
    };
  },
};
export default rule;
