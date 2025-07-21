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
import { getClassPropertyAnnotationNames, PresetDecorators, getAnnotationUsage } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

// Helper functions for rules
const hasisComponentV2 = (node: arkts.StructDeclaration): boolean => !!getAnnotationUsage(node,
  PresetDecorators.COMPONENT_V2);

const hasComponent = (node: arkts.StructDeclaration): boolean => !!getAnnotationUsage(node,
  PresetDecorators.COMPONENT_V1);
function checkMultipleBuiltInDecorators(context: UISyntaxRuleContext, member: arkts.ClassProperty,
  propertyDecorators: string[]): void {
  const builtInDecorators = [PresetDecorators.LOCAL, PresetDecorators.PARAM, PresetDecorators.EVENT];
  const appliedBuiltInDecorators = propertyDecorators.filter(d => builtInDecorators.includes(d));
  if (appliedBuiltInDecorators.length > 1) {
    member.annotations?.forEach(annotation => {
      const annotationsName = annotation.expr?.dumpSrc();
      reportMultipleBuiltInDecoratorsError(context, annotation, annotationsName, builtInDecorators);
    });
  }
};

function reportMultipleBuiltInDecoratorsError(context: UISyntaxRuleContext, annotation: arkts.AstNode,
  annotationsName: string | undefined, builtInDecorators: string[]): void {
  if (annotationsName && builtInDecorators.includes(annotationsName)) {
    context.report({
      node: annotation,
      message: rule.messages.multipleBuiltInDecorators,
      fix: (annotation) => {
        const startPosition = arkts.getStartPosition(annotation);
        const endPosition = arkts.getEndPosition(annotation);
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      },
    });
  }
}

function checkDecoratorOnlyInisComponentV2(context: UISyntaxRuleContext, member: arkts.ClassProperty,
  node: arkts.StructDeclaration, hasisComponentV2: boolean, hasComponent: boolean): void {
  const builtInDecorators = [PresetDecorators.LOCAL, PresetDecorators.PARAM, PresetDecorators.EVENT];
  member.annotations?.forEach(annotation => {
    const annotationsName = annotation.expr?.dumpSrc();
    if (annotationsName && builtInDecorators.includes(annotationsName) && !hasisComponentV2 && !hasComponent) {
      reportDecoratorOnlyInisComponentV2Error(context, annotation, annotationsName, node);
    }
  });
};

function reportDecoratorOnlyInisComponentV2Error(context: UISyntaxRuleContext, annotation: arkts.AnnotationUsage,
  annotationsName: string, node: arkts.StructDeclaration): void {
  context.report({
    node: annotation,
    message: rule.messages.decoratorOnlyInisComponentV2,
    data: { annotationsName },
    fix: (annotation) => {
      const startPosition = arkts.getStartPosition(node);
      return {
        range: [startPosition, startPosition],
        code: `@${PresetDecorators.COMPONENT_V2}\n`,
      };
    },
  });
}

function checkParamRequiresRequire(context: UISyntaxRuleContext, member: arkts.ClassProperty,
  propertyDecorators: string[]): void {
  if (propertyDecorators.includes(PresetDecorators.PARAM) && !member.value &&
    !propertyDecorators.includes(PresetDecorators.REQUIRE) && member.key) {
    const memberKey = member.key;
    context.report({
      node: memberKey,
      message: rule.messages.paramRequiresRequire,
      fix: (memberKey) => {
        const startPosition = arkts.getStartPosition(memberKey);
        return {
          range: [startPosition, startPosition],
          code: `@${PresetDecorators.REQUIRE} `,
        };
      },
    });
  }
};

function checkRequireOnlyWithParam(context: UISyntaxRuleContext, member: arkts.ClassProperty,
  propertyDecorators: string[]): void {
  const requireDecorator = member.annotations?.find(annotation =>
    annotation.expr && annotation.expr.dumpSrc() === PresetDecorators.REQUIRE
  );
  if (requireDecorator && !propertyDecorators.includes(PresetDecorators.PARAM)) {
    context.report({
      node: requireDecorator,
      message: rule.messages.requireOnlyWithParam,
      fix: (requireDecorator) => {
        const startPosition = arkts.getStartPosition(requireDecorator);
        const endPosition = arkts.getEndPosition(requireDecorator);
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      },
    });
  }
};

function validateClassPropertyDecorators(context: UISyntaxRuleContext, node: arkts.StructDeclaration): void {
  const isComponentV2 = hasisComponentV2(node);
  const isComponent = hasComponent(node);
  node.definition.body.forEach(member => {
    if (!arkts.isClassProperty(member)) {
      return;
    }
    const propertyDecorators = getClassPropertyAnnotationNames(member);

    // Rule 1: Multiple built-in decorators
    checkMultipleBuiltInDecorators(context, member, propertyDecorators);

    // Rule 2: Built-in decorators only allowed in @isComponentV2
    checkDecoratorOnlyInisComponentV2(context, member, node, isComponentV2, isComponent);

    // Rule 3: @Param without default value must be combined with @Require
    checkParamRequiresRequire(context, member, propertyDecorators);

    // Rule 4: @Require must be used together with @Param
    checkRequireOnlyWithParam(context, member, propertyDecorators);
  });
}

const rule: UISyntaxRule = {
  name: 'iscomponentV2-state-usage-validation',
  messages: {
    multipleBuiltInDecorators: `The member property or method cannot be decorated by multiple built-in decorators.`,
    decoratorOnlyInisComponentV2: `The '@{{annotationsName}}' decorator can only be used in a 'struct' decorated with '@isComponentV2'.`,
    paramRequiresRequire: `When a variable decorated with @Param is not assigned a default value, it must also be decorated with @Require.`,
    requireOnlyWithParam: `In a struct decorated with @isComponentV2, @Require can only be used with @Param. `
  },

  setup(context) {
    return {
      parsed: (node): void => {

        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        validateClassPropertyDecorators(context, node);
      },
    };
  },
};

export default rule;