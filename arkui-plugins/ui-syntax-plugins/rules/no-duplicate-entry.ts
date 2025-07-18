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
import { getAnnotationUsage, PresetDecorators } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

const MAX_ENTRY_DECORATOR_COUNT = 1;
function checkDuplicateEntry(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    return;
  }
  let entryDecoratorUsages: arkts.AnnotationUsage[] = [];
  node.getChildren().forEach((child) => {
    if (!arkts.isStructDeclaration(child)) {
      return;
    }
    const entryDecoratorUsage = getAnnotationUsage(
      child,
      PresetDecorators.ENTRY,
    );
    if (entryDecoratorUsage) {
      entryDecoratorUsages.push(entryDecoratorUsage);
    }
  });
  // If more than one entry decorator is recorded, an error is reported
  if (entryDecoratorUsages.length <= MAX_ENTRY_DECORATOR_COUNT) {
    return;
  }
  entryDecoratorUsages.forEach((entryDocoratorUsage) => {
    context.report({
      node: entryDocoratorUsage,
      message: rule.messages.duplicateEntry,
      fix: (entryDocoratorUsage) => {
        const startPosition = arkts.getStartPosition(entryDocoratorUsage);
        const endPosition = arkts.getEndPosition(entryDocoratorUsage);
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      }
    });
  });
}

const rule: UISyntaxRule = {
  name: 'no-duplicate-entry',
  messages: {
    duplicateEntry: `An ArkTS file can contain only one '@Entry' decorator.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        checkDuplicateEntry(node, context);
      },
    };
  },
};

export default rule;