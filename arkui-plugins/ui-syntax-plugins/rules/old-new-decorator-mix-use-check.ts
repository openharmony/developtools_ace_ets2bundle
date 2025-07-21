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
import { PresetDecorators, getAnnotationUsage } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function findPropertyDecorator(
  node: arkts.ClassProperty,
  decoratorName: string
): arkts.AnnotationUsage | undefined {
  const annotation = node.annotations?.find(annotation =>
    annotation.expr &&
    annotation.expr.dumpSrc() === decoratorName
  );
  return annotation;
}

function paramDecoratorError(
  context: UISyntaxRuleContext,
  hasParamDecorator: arkts.AnnotationUsage,
  hasComponentDecorator: arkts.AnnotationUsage
): void {
  context.report({
    node: hasParamDecorator,
    message: rule.messages.paramDecoratorError,
    fix: () => {
      const startPosition = arkts.getStartPosition(hasComponentDecorator);
      const endPosition = arkts.getEndPosition(hasComponentDecorator);
      return {
        range: [startPosition, endPosition],
        code: `@${PresetDecorators.COMPONENT_V2}`,
      };
    },
  });
}

function stateDecoratorError(
  context: UISyntaxRuleContext,
  hasStateDecorator: arkts.AnnotationUsage,
  hasComponentV2Decorator: arkts.AnnotationUsage
): void {
  context.report({
    node: hasStateDecorator,
    message: rule.messages.stateDecoratorError,
    fix: () => {
      const startPosition = arkts.getStartPosition(hasComponentV2Decorator);
      const endPosition = arkts.getEndPosition(hasComponentV2Decorator);
      return {
        range: [startPosition, endPosition],
        code: `@${PresetDecorators.COMPONENT_V1}`,
      };
    },
  });
}

function findDecoratorError(
  node: arkts.StructDeclaration,
  context: UISyntaxRuleContext
): void {
  const hasComponentV2Decorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
  const hasComponentDecorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);
  // Check where @Param and @State are used
  node.definition.body.forEach((property) => {
    if (arkts.isClassProperty(property)) {
      const hasParamDecorator = findPropertyDecorator(property, PresetDecorators.PARAM);
      const hasStateDecorator = findPropertyDecorator(property, PresetDecorators.STATE);
      // Check that @Param is in the correct location
      if (hasParamDecorator && !hasComponentV2Decorator && hasComponentDecorator) {
        paramDecoratorError(context, hasParamDecorator, hasComponentDecorator);
      }
      // Check that @State is in the correct location
      if (hasStateDecorator && !hasComponentDecorator && hasComponentV2Decorator) {
        stateDecoratorError(context, hasStateDecorator, hasComponentV2Decorator);
      }
    }
  });
}


const rule: UISyntaxRule = {
  name: 'old-new-decorator-mix-use-check',
  messages: {
    paramDecoratorError: `The '@Param' decorator can only be used in a 'struct' decorated with '@ComponentV2'.`,
    stateDecoratorError: `The '@State' decorator can only be used in a 'struct' decorated with '@Component'.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        findDecoratorError(node, context);
      },
    };
  },
};

export default rule;
