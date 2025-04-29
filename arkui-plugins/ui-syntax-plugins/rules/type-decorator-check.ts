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
  let hasTypeDecorator = annotations?.find(annotation =>
    annotation.expr &&
    annotation.expr.dumpSrc() === PresetDecorators.TYPE
  );
  return hasTypeDecorator;
}

function hasDecoratorType(
  node: arkts.ClassDeclaration,
): arkts.AnnotationUsage | undefined {
  let hasTypeDecorator: arkts.AnnotationUsage | undefined;
  node.definition?.body.forEach(member => {
    if (arkts.isClassProperty(member) && member.annotations) {
      hasTypeDecorator = findTypeDecorator(member.annotations);
    }
  });
  return hasTypeDecorator;
}

// rule1: @Type can only be used for class
function checkTypeInStruct(
  node: arkts.StructDeclaration,
  context: UISyntaxRuleContext,
): void {
  let hasTypeDecorator: arkts.AnnotationUsage | undefined;
  node.definition?.body.forEach(member => {
    if (arkts.isClassProperty(member) && member.annotations) {
      hasTypeDecorator = findTypeDecorator(member.annotations);
      reportInvalidTypeUsageInStruct(hasTypeDecorator, context);
    }
  });
}

function reportInvalidTypeUsageInStruct(
  hasTypeDecorator: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  if (!hasTypeDecorator) {
    return;
  }
  context.report({
    node: hasTypeDecorator,
    message: rule.messages.invalidType,
    fix: (hasTypeDecorator) => {
      const startPosition = arkts.getStartPosition(hasTypeDecorator);
      const endPosition = arkts.getEndPosition(hasTypeDecorator);
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
  let hasTypeDecorator: arkts.AnnotationUsage | undefined;
  node.definition?.annotations.forEach(member => {
    const annotation = getAnnotationName(member);
    hasTypeDecorator = hasDecoratorType(node);
    if (annotation === PresetDecorators.OBSERVED_V1) {
      reportObservedAndTypeDecoratorConflict(hasTypeDecorator, context);
    }
  });
}

function reportObservedAndTypeDecoratorConflict(
  hasTypeDecorator: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  if (!hasTypeDecorator) {
    return;
  }
  context.report({
    node: hasTypeDecorator,
    message: rule.messages.invalidDecoratorWith,
    fix: () => {
      const startPosition = arkts.getStartPosition(hasTypeDecorator);
      const endPosition = arkts.getEndPosition(hasTypeDecorator);
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
  const hasTypeDecorator = findTypeDecorator(node.annotations);
  reportInvalidTypeDecorator(hasTypeDecorator, context);
}

function reportInvalidTypeDecorator(
  hasTypeDecorator: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  if (!hasTypeDecorator) {
    return;
  }
  context.report({
    node: hasTypeDecorator,
    message: rule.messages.invalidTypeMember,
    fix: (hasTypeDecorator) => {
      const startPosition = arkts.getStartPosition(hasTypeDecorator);
      const endPosition = arkts.getEndPosition(hasTypeDecorator);
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
    invalidType: `The @Type decorator can only be used in 'class'.`,
    invalidDecoratorWith: `The @Type decorator can not be used within a 'class' decorated with @Observed.`,
    invalidTypeMember: `The @Type can decorate only member variables in a 'class'.`
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
