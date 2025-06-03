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
    annotation.expr && arkts.isIdentifier(annotation.expr) &&
    annotation.expr.name === decorator
  );
}

// Check that the property decorator complies with the rules
function validatePropertyAnnotations(
  body: arkts.ClassProperty,
  context: UISyntaxRuleContext,
  onceDecorator: arkts.AnnotationUsage | undefined
): void {
  const propertyAnnotations = getClassPropertyAnnotationNames(body);
  onceDecorator = findDecorator(body, PresetDecorators.ONCE);
  if (onceDecorator) {
    const isParamUsed = propertyAnnotations.includes(PresetDecorators.PARAM);
    // If @Once is found, check if @Param is also used
    if (!isParamUsed) {
      reportMissingParamWithOnce(onceDecorator, context);
    } else {
      // If both @Once and @Param are used, check for other
      // incompatible decorators
      const otherDecorators = body.annotations?.find(annotation =>
        annotation.expr && arkts.isIdentifier(annotation.expr) &&
        annotation.expr.name !== PresetDecorators.ONCE &&
        annotation.expr.name !== PresetDecorators.PARAM
      );
      reportInvalidDecoratorsWithOnceAndParam(otherDecorators, context);
    }
  }
}

function reportMissingParamWithOnce(
  onceDecorator: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  if (!onceDecorator) {
    return;
  }
  context.report({
    node: onceDecorator,
    message: rule.messages.invalidDecorator,
    fix: (onceDecorator) => {
      const startPosition = onceDecorator.endPosition;
      const endPosition = onceDecorator.endPosition;
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
      const startPosition = otherDecorators.startPosition;
      const endPosition = otherDecorators.endPosition;
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
    annotation.expr && arkts.isIdentifier(annotation.expr) &&
    annotation.expr.name === PresetDecorators.ONCE
  );
  if (methodAnnotations) {
    context.report({
      node: methodAnnotations,
      message: rule.messages.invalidMemberDecorate,
      fix: (methodAnnotations) => {
        const startPosition = methodAnnotations.startPosition;
        const endPosition = methodAnnotations.endPosition;
        return {
          range: [startPosition, endPosition],
          code: ''
        };
      }
    });
  }
}


function reportInvalidOnceUsage(
  onceDecorator: arkts.AnnotationUsage | undefined,
  node: arkts.StructDeclaration,
  componentDocoratorUsage: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext,
): void {
  if (!onceDecorator) {
    return;
  }
  context.report({
    node: onceDecorator,
    message: rule.messages.invalidUsage,
    fix: () => {
      if (componentDocoratorUsage) {
        const startPosition = componentDocoratorUsage.startPosition;
        const endPosition = componentDocoratorUsage.endPosition;
        return {
          range: [startPosition, endPosition],
          code: `@${PresetDecorators.COMPONENT_V2}`
        };
      } else {
        const startPosition = node.startPosition;
        const endPosition = node.startPosition;
        return {
          range: [startPosition, endPosition],
          code: `@${PresetDecorators.COMPONENT_V2}\n`
        };
      }
    }
  });
}

function invalidComponentUsage(
  node: arkts.StructDeclaration,
  body: arkts.ClassProperty,
  onceDecorator: arkts.AnnotationUsage | undefined,
  componentV2DocoratorUsage: arkts.AnnotationUsage | undefined,
  componentDocoratorUsage: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  onceDecorator = findDecorator(body, PresetDecorators.ONCE);
  if (onceDecorator && !componentV2DocoratorUsage) {
    reportInvalidOnceUsage(onceDecorator, node, componentDocoratorUsage, context);
  }
}

function validateDecorater(
  node: arkts.StructDeclaration,
  onceDecorator: arkts.AnnotationUsage | undefined,
  componentV2DocoratorUsage: arkts.AnnotationUsage | undefined,
  componentDocoratorUsage: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext,
): void {
  node.definition?.body.forEach(body => {
    // Check if @Once is used on a property and if @Param is used with
    if (arkts.isClassProperty(body)) {
      validatePropertyAnnotations(body, context, onceDecorator);
      // If @Once is used but not in a @ComponentV2 struct, report an error
      invalidComponentUsage(node, body, onceDecorator, componentV2DocoratorUsage, componentDocoratorUsage, context);
    }
    if (!arkts.isMethodDefinition(body)) {
      return;
    }
    // Check if @Once is used on a method (which is not allowed)
    validateMethodAnnotations(body, context);
  });
}

function checkClassForInvalidDecorator(
  node: arkts.ClassDeclaration,
  onceDecorator: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext,
): void {
  node.definition?.body.forEach(member => {
    if (!arkts.isClassProperty(member)) {
      return;
    }
    onceDecorator = findDecorator(member, PresetDecorators.ONCE);
    if (!onceDecorator) {
      return;
    }
    context.report({
      node: onceDecorator,
      message: rule.messages.invalidNOtInStruct,
      fix: (onceDecorator) => {
        const startPosition = onceDecorator.startPosition;
        const endPosition = onceDecorator.endPosition;
        return {
          range: [startPosition, endPosition],
          code: ``
        };
      }
    });
  });
}

const rule: UISyntaxRule = {
  name: 'once-decorator-check',
  messages: {
    invalidUsage: `The '@Once' decorator can only be used in a 'struct' decorated with '@ComponentV2'.`,
    invalidMemberDecorate: `@Once can only decorate member property.`,
    invalidDecorator: `When a variable decorated with '@Once', it must also be decorated with '@Param'.`,
    invalidNOtInStruct: `'@Once' decorator can only be used with 'struct'.`
  },
  setup(context) {
    return {
      parsed: (node): void => {
        let onceDecorator: arkts.AnnotationUsage | undefined;
        // Check if the node is a struct declaration
        if (arkts.isClassDeclaration(node)) {
          checkClassForInvalidDecorator(node, onceDecorator, context);
        }
        if (arkts.isStructDeclaration(node)) {
          // Check if the struct is decorated with @ComponentV2
          const componentV2DocoratorUsage = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
          const componentDocoratorUsage = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);
          validateDecorater(node, onceDecorator, componentV2DocoratorUsage, componentDocoratorUsage, context);
        }
      },
    };
  },
};

export default rule;
