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

function reportConflictingDecorators(
  reusableDocoratorUsage: arkts.AnnotationUsage | undefined,
  structNode: arkts.Identifier | undefined,
  context: UISyntaxRuleContext
): void {
  if (!structNode || !reusableDocoratorUsage) {
    return;
  }
  context.report({
    node: structNode,
    message: rule.messages.conflictingDecorators,
  });
}

function reportInvalidDecoratorUsage(
  node: arkts.StructDeclaration,
  structNode: arkts.Identifier | undefined,
  context: UISyntaxRuleContext
): void {
  if (!structNode || !node) {
    return;
  }
  context.report({
    node: structNode,
    message: rule.messages.invalidDecoratorUsage,
  });
}

const rule: UISyntaxRule = {
  name: 'reusableV2-decorator-check',
  messages: {
    conflictingDecorators: `The '@Reusable' and '@ReusableV2' decorators cannot be applied simultaneously.`,
    invalidDecoratorUsage: `@ReusableV2 is only applicable to custom components decorated by @ComponentV2.`,
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
        if (!arkts.isClassDefinition(node.definition)) {
          return;
        }
        const structNode = node.definition.ident;
        // Check whether the decoration exists, and mark true if it does
        const reusableDocoratorUsage = getAnnotationUsage(node, PresetDecorators.REUSABLE_V1);
        const reusableV2DocoratorUsage = getAnnotationUsage(node, PresetDecorators.REUSABLE_V2);
        const componnetV2DocoratorUsage = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
        // Check whether @Reusable and @ReusableV2 exist at the same time
        if (reusableV2DocoratorUsage && reusableDocoratorUsage && structNode) {
          reportConflictingDecorators(reusableDocoratorUsage, structNode, context);
        }
        // Check if @ReusableV2 is applied to a class decorated by @ComponentV2
        if (reusableV2DocoratorUsage && !componnetV2DocoratorUsage && structNode) {
          reportInvalidDecoratorUsage(node, structNode, context);
        }
      },
    };
  },
};

export default rule;
