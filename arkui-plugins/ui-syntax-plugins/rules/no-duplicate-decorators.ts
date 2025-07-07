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

// Decorators that cannot be repeated
const validDecorators = [
  PresetDecorators.ENTRY,
  PresetDecorators.COMPONENT_V1,
  PresetDecorators.COMPONENT_V2,
  PresetDecorators.REUSABLE_V1,
  PresetDecorators.PREVIEW,
  PresetDecorators.REUSABLE_V2,
  PresetDecorators.CUSTOM_DIALOG,
];

function checkForDuplicateDecorators(context: UISyntaxRuleContext, node: arkts.StructDeclaration): void {
  // Initialize a map to record decorators and their occurrences
  const decoratorCounts: Map<string, { count: number, annotations: arkts.AnnotationUsage[] }> = new Map();
  if (!node.definition || !node.definition.annotations) {
    return;
  }
  // Record all decorators and their counts
  node.definition.annotations.forEach((annotation) => {
    const decoratorName = getAnnotationName(annotation);
    if (!validDecorators.includes(decoratorName)) {
      return;
    }

    if (decoratorCounts.has(decoratorName)) {
      const decoratorInfo = decoratorCounts.get(decoratorName)!;
      decoratorInfo.count += 1;
      decoratorInfo.annotations.push(annotation);
    } else {
      decoratorCounts.set(decoratorName, { count: 1, annotations: [annotation] });
    }
  });

  // Process decorators with more than one occurrence
  decoratorCounts.forEach(({ count, annotations }, decoratorName) => {
    if (count <= 1) {
      return;
    }
    // Report errors for all occurrences except the last one
    for (let i = 0; i < annotations.length - 1; i++) {
      const prevAnnotation = annotations[i];
      reportDuplicateDecorator(context, prevAnnotation);
    }
    // For the last occurrence, report an error but do not provide a fix
    const lastAnnotation = annotations[annotations.length - 1];
    context.report({
      node: lastAnnotation,
      message: rule.messages.duplicateDecorator,
    });
  });
}

function reportDuplicateDecorator(context: UISyntaxRuleContext, annotation: arkts.AnnotationUsage): void {
  context.report({
    node: annotation,
    message: rule.messages.duplicateDecorator,
    fix: () => {
      const startPosition = arkts.getStartPosition(annotation);
      const endPosition = arkts.getEndPosition(annotation);
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

const rule: UISyntaxRule = {
  name: 'no-duplicate-decorators',
  messages: {
    duplicateDecorator: `Duplicate decorators for struct are not allowed.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        checkForDuplicateDecorators(context, node);
      },
    };
  },
};

export default rule;