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

//Unsupported decorators
const unsupportedDecorators = [
  PresetDecorators.ENTRY,
  PresetDecorators.PREVIEW,
];

function checkForDuplicateStructDecorators(
  context: UISyntaxRuleContext,
  node: arkts.StructDeclaration
): void {
  // Initialize a map to record decorators and their occurrences
  const decoratorCounts: Map<string, { count: number, annotations: arkts.AnnotationUsage[] }> = new Map();
  if (!node.definition || !node.definition.annotations) {
    return;
  }
  // Record all decorators and their counts
  node.definition.annotations.forEach((annotation) => {
    const decoratorName = getAnnotationName(annotation);
    if (unsupportedDecorators.includes(decoratorName)) {
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
      reportStructDuplicateDecorator(context, prevAnnotation, decoratorName);
    }
    // For the last occurrence, report an error but do not provide a fix
    const lastAnnotation = annotations[annotations.length - 1];
    context.report({
      node: lastAnnotation,
      message: rule.messages.duplicateStructDecorators,
      data: { decoratorName },
    });
  });
}

function reportStructDuplicateDecorator(context: UISyntaxRuleContext, annotation: arkts.AnnotationUsage,
  decoratorName: string): void {
  context.report({
    node: annotation,
    message: rule.messages.duplicateStructDecorators,
    data: { decoratorName },
    fix: () => {
      const startPosition = annotation.startPosition;
      const endPosition = annotation.endPosition;
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

function checkForDuplicateFunctionDecorators(
  context: UISyntaxRuleContext,
  functionNode: arkts.FunctionDeclaration
): void {
  const annotations = functionNode.annotations;
  if (!annotations || annotations.length <= 1) {
    return;
  }
  const decoratorCounts: Map<string, { count: number; annotations: arkts.AnnotationUsage[] }> = new Map();
  for (const annotation of annotations) {
    const decoratorName = getAnnotationName(annotation);
    if (unsupportedDecorators.includes(decoratorName)) {
      continue;
    }
    if (decoratorCounts.has(decoratorName)) {
      const info = decoratorCounts.get(decoratorName)!;
      info.count += 1;
      info.annotations.push(annotation);
    } else {
      decoratorCounts.set(decoratorName, { count: 1, annotations: [annotation] });
    }
  }
  decoratorCounts.forEach(({ count, annotations }, decoratorName) => {
    if (count <= 1) {
      return;
    }

    // Keep the last one and delete the rest
    for (let i = 0; i < annotations.length - 1; i++) {
      reportFunctionDuplicateDecorator(context, annotations[i], decoratorName);
    }

    // The last one doesn't provide a fix
    const last = annotations[annotations.length - 1];
    context.report({
      node: last,
      message: rule.messages.duplicateFunctionDecorators,
      data: { decoratorName },
    });
  });
}

function reportFunctionDuplicateDecorator(context: UISyntaxRuleContext, annotation: arkts.AnnotationUsage,
  decoratorName: string): void {
  context.report({
    node: annotation,
    message: rule.messages.duplicateFunctionDecorators,
    data: { decoratorName },
    fix: () => {
      const startPosition = annotation.startPosition;
      const endPosition = annotation.endPosition;
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

function checkForDuplicateMethodDecorators(
  context: UISyntaxRuleContext,
  methodNode: arkts.MethodDefinition
): void {
  const annotations = methodNode.scriptFunction.annotations;
  if (!annotations || annotations.length <= 1) {
    return;
  }
  const decoratorCounts: Map<string, { count: number; annotations: arkts.AnnotationUsage[] }> = new Map();
  for (const annotation of annotations) {
    const decoratorName = getAnnotationName(annotation);
    if (unsupportedDecorators.includes(decoratorName)) {
      continue;
    }

    if (decoratorCounts.has(decoratorName)) {
      const info = decoratorCounts.get(decoratorName)!;
      info.count += 1;
      info.annotations.push(annotation);
    } else {
      decoratorCounts.set(decoratorName, { count: 1, annotations: [annotation] });
    }
  }
  decoratorCounts.forEach(({ count, annotations }, decoratorName) => {
    if (count <= 1) {
      return;
    }
    for (let i = 0; i < annotations.length - 1; i++) {
      reportMethodDuplicateDecorator(context, annotations[i], decoratorName);
    }
    const last = annotations[annotations.length - 1];
    context.report({
      node: last,
      message: rule.messages.duplicateMethodDecorators,
      data: { decoratorName },
    });
  });
}

function reportMethodDuplicateDecorator(context: UISyntaxRuleContext, annotation: arkts.AnnotationUsage,
  decoratorName: string): void {
  context.report({
    node: annotation,
    message: rule.messages.duplicateMethodDecorators,
    data: { decoratorName },
    fix: () => {
      const startPosition = annotation.startPosition;
      const endPosition = annotation.endPosition;
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
    duplicateFunctionDecorators: `Duplicate '{{decoratorName}}' decorators for function are not allowed.`,
    duplicateMethodDecorators: `Duplicate '{{decoratorName}}' decorators for method are not allowed.`,
    duplicateStructDecorators: `Duplicate '{{decoratorName}}' decorators for struct are not allowed.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (arkts.isStructDeclaration(node)) {
          checkForDuplicateStructDecorators(context, node);
        } else if (arkts.isFunctionDeclaration(node)) {
          checkForDuplicateFunctionDecorators(context, node);
        } else if (arkts.isMethodDefinition(node)) {
          checkForDuplicateMethodDecorators(context, node);
        }
      },
    };
  },
};

export default rule;