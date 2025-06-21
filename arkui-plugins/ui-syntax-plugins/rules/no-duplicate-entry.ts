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
import { getAnnotationUsage, MAX_ENTRY_DECORATOR_COUNT, PresetDecorators } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function checkDuplicateEntry(
  node: arkts.AstNode,
  context: UISyntaxRuleContext,
  entryDecoratorUsages: arkts.AnnotationUsage[],
  entryData: { count: number }
): void {
  if (!arkts.isStructDeclaration(node)) {
    return;
  }
  const entryDecoratorUsage = getAnnotationUsage(
    node,
    PresetDecorators.ENTRY,
  );
  if (entryDecoratorUsage) {
    entryDecoratorUsages.push(entryDecoratorUsage);
  }
  // If more than one entry decorator is recorded, an error is reported
  if (entryDecoratorUsages.length <= MAX_ENTRY_DECORATOR_COUNT) {
    return;
  }
  if (entryData.count === MAX_ENTRY_DECORATOR_COUNT) {
    const entryDocoratorUsage = entryDecoratorUsages.at(0)!;
    context.report({
      node: entryDocoratorUsage,
      message: rule.messages.duplicateEntry,
      fix: () => {
        return {
          range: [entryDocoratorUsage.startPosition, entryDocoratorUsage.endPosition],
          code: '',
        };
      }
    });
  }
  const entryDocoratorUsage = entryDecoratorUsages.at(entryData.count)!;
  context.report({
    node: entryDocoratorUsage,
    message: rule.messages.duplicateEntry,
    fix: () => {
      return {
        range: [entryDocoratorUsage.startPosition, entryDocoratorUsage.endPosition],
        code: '',
      };
    }
  });
  entryData.count++;
}

const rule: UISyntaxRule = {
  name: 'no-duplicate-entry',
  messages: {
    duplicateEntry: `A page can't contain more then one '@Entry' decorator.`,
  },
  setup(context) {
    let entryDecoratorUsages: arkts.AnnotationUsage[] = [];
    let entryData = { count: 1 };
    return {
      parsed: (node): void => {
        checkDuplicateEntry(node, context, entryDecoratorUsages, entryData);
      },
    };
  },
};

export default rule;