/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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
import { getAnnotationUsage, getClassPropertyAnnotationNames, PresetDecorators } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function findDecorator(member: arkts.ClassProperty, decorator: string): arkts.AnnotationUsage | undefined {
  return member.annotations?.find(annotation =>
    annotation.expr &&
    annotation.expr.dumpSrc() === decorator
  );
}

// Check that the property decorator complies with the rules
function validatePropertyAnnotations(
  body: arkts.ClassProperty,
  context: UISyntaxRuleContext,
  hasOnceDecorator: arkts.AnnotationUsage | undefined
): void {
  const propertyAnnotations = getClassPropertyAnnotationNames(body);
  hasOnceDecorator = findDecorator(body, PresetDecorators.ONCE);
  if (hasOnceDecorator) {
    const isParamUsed = propertyAnnotations.includes(PresetDecorators.PARAM);
    // If @Once is found, check if @Param is also used
    if (!isParamUsed) {
      reportMissingParamWithOnce(hasOnceDecorator, context);
    } else {
      // If both @Once and @Param are used, check for other
      // incompatible decorators
      const otherDecorators = body.annotations?.find(annotation =>
        annotation.expr &&
        annotation.expr.dumpSrc() !== PresetDecorators.ONCE &&
        annotation.expr.dumpSrc() !== PresetDecorators.PARAM
      );
      reportInvalidDecoratorsWithOnceAndParam(otherDecorators, context);
    }
  }
}

function reportMissingParamWithOnce(
  hasOnceDecorator: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  if (!hasOnceDecorator) {
    return;
  }
  context.report({
    node: hasOnceDecorator,
    message: rule.messages.invalidDecorator,
    fix: (hasOnceDecorator) => {
      const startPosition = arkts.getEndPosition(hasOnceDecorator);
      const endPosition = arkts.getEndPosition(hasOnceDecorator);
      return {
        range: [startPosition, endPosition],
        code: `@${PresetDecorators.PARAM}`
      };
    }
  });
}

function reportInvalidDecoratorsWithOnceAndParam(
  otherDecorators: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  if (!otherDecorators) {
    return;
  }
  context.report({
    node: otherDecorators,
    message: rule.messages.invalidDecorator,
    fix: (otherDecorators) => {
      const startPosition = arkts.getStartPosition(otherDecorators);
      const endPosition = arkts.getEndPosition(otherDecorators);
      return {
        range: [startPosition, endPosition],
        code: ''
      };
    }
  });
}

// Check if the method is @Once decorated (not allowed)
function validateMethodAnnotations(body: arkts.MethodDefinition, context: UISyntaxRuleContext): void {
  const methodAnnotations = body.scriptFunction.annotations?.find(annotation =>
    annotation.expr &&
    annotation.expr.dumpSrc() === PresetDecorators.ONCE
  );
  if (methodAnnotations) {
    context.report({
      node: methodAnnotations,
      message: rule.messages.invalidMemberDecorate,
      fix: (methodAnnotations) => {
        const startPosition = arkts.getStartPosition(methodAnnotations);
        const endPosition = arkts.getEndPosition(methodAnnotations);
        return {
          range: [startPosition, endPosition],
          code: ''
        };
      }
    });
  }
}

function invalidComponentUsage(
  body: arkts.ClassProperty,
  hasOnceDecorator: arkts.AnnotationUsage | undefined,
  componentV2DocoratorUsage: arkts.AnnotationUsage | undefined,
  componentDocoratorUsage: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  hasOnceDecorator = findDecorator(body, PresetDecorators.ONCE);
  if (hasOnceDecorator && !componentV2DocoratorUsage && componentDocoratorUsage) {
    context.report({
      node: hasOnceDecorator,
      message: rule.messages.invalidUsage,
      fix: (hasOnceDecorator) => {
        const startPosition = arkts.getStartPosition(componentDocoratorUsage);
        const endPosition = arkts.getEndPosition(componentDocoratorUsage);
        return {
          range: [startPosition, endPosition],
          code: `@${PresetDecorators.COMPONENT_V2}`
        };
      }
    });
  }
}

function validateDecorater(
  node: arkts.StructDeclaration,
  hasOnceDecorator: arkts.AnnotationUsage | undefined,
  componentV2DocoratorUsage: arkts.AnnotationUsage | undefined,
  componentDocoratorUsage: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext,
): void {
  node.definition?.body.forEach(body => {
    // Check if @Once is used on a property and if @Param is used with
    if (arkts.isClassProperty(body)) {
      validatePropertyAnnotations(body, context, hasOnceDecorator);
      // If @Once is used but not in a @ComponentV2 struct, report an error
      invalidComponentUsage(body, hasOnceDecorator, componentV2DocoratorUsage, componentDocoratorUsage, context);
    }
    if (!arkts.isMethodDefinition(body)) {
      return;
    }
    // Check if @Once is used on a method (which is not allowed)
    validateMethodAnnotations(body, context);
  });
}

const rule: UISyntaxRule = {
  name: 'once-decorator-check',
  messages: {
    invalidUsage: `@Once can only decorate member properties in a @ComponentV2 struct.`,
    invalidMemberDecorate: `@Once can only decorate member properties.`,
    invalidDecorator: `@Once must be only used with @Param. `
  },
  setup(context) {
    return {
      parsed: (node): void => {
        // Check if the node is a struct declaration
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        let hasOnceDecorator: arkts.AnnotationUsage | undefined;
        // Check if the struct is decorated with @ComponentV2
        const componentV2DocoratorUsage = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
        const componentDocoratorUsage = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);
        validateDecorater(node, hasOnceDecorator, componentV2DocoratorUsage, componentDocoratorUsage, context);
      },
    };
  },
};

export default rule;
