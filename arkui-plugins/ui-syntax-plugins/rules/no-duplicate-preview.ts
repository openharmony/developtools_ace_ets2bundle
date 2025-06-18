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
import { getAnnotationUsage, MAX_PREVIEW_DECORATOR_COUNT, PresetDecorators } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function reportError(context: UISyntaxRuleContext, errorNode: arkts.AnnotationUsage): void {
  context.report({
    node: errorNode,
    message: rule.messages.duplicateEntry,
    fix: () => {
      return {
        range: [errorNode.startPosition, errorNode.endPosition],
        code: '',
      };
    }
  });
}

function checkDuplicatePreview(
  node: arkts.AstNode,
  context: UISyntaxRuleContext,
  previewDecoratorUsages: arkts.AnnotationUsage[],
  previewData: { count: number },
): void {
  if (!arkts.isStructDeclaration(node)) {
    return;
  }
  const previewDecoratorUsage = getAnnotationUsage(
    node,
    PresetDecorators.PREVIEW,
  );
  if (previewDecoratorUsage) {
    previewDecoratorUsages.push(previewDecoratorUsage);
  }
  // If the number of preview decorators is less than 10, no error is reported
  if (previewDecoratorUsages.length <= MAX_PREVIEW_DECORATOR_COUNT) {
    return;
  }
  if (previewData.count === MAX_PREVIEW_DECORATOR_COUNT) {
    previewDecoratorUsages.forEach((previewDecoratorUsage) => {
      reportError(context, previewDecoratorUsage);
    });
  } else {
    reportError(context, previewDecoratorUsages.at(previewData.count)!);
  }
  previewData.count++;
}

const rule: UISyntaxRule = {
  name: 'no-duplicate-preview',
  messages: {
    duplicateEntry: `A page can contain at most 10 '@Preview' decorators.`,
  },
  setup(context) {
    let previewDecoratorUsages: arkts.AnnotationUsage[] = [];
    let previewData = { count: 10 };
    return {
      parsed: (node): void => {
        checkDuplicatePreview(node, context, previewDecoratorUsages, previewData);
      },
    };
  },
};

export default rule;