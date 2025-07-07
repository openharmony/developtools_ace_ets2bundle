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

const MAX_PREVIEW_DECORATOR_COUNT = 10;

function checkDuplicatePreview(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    return;
  }
  let previewDecoratorUsages: arkts.AnnotationUsage[] = [];
  node.getChildren().forEach((child) => {
    if (!arkts.isStructDeclaration(child)) {
      return;
    }
    const previewDecoratorUsage = getAnnotationUsage(
      child,
      PresetDecorators.PREVIEW,
    );
    if (previewDecoratorUsage) {
      previewDecoratorUsages.push(previewDecoratorUsage);
    }
  });
  // If the number of preview decorators is greater than 10, an error is reported
  if (previewDecoratorUsages.length <= MAX_PREVIEW_DECORATOR_COUNT) {
    return;
  }
  previewDecoratorUsages.forEach((previewDecoratorUsage) => {
    context.report({
      node: previewDecoratorUsage,
      message: rule.messages.duplicateEntry,
      fix: (previewDecoratorUsage) => {
        const startPosition = arkts.getStartPosition(previewDecoratorUsage);
        const endPosition = arkts.getEndPosition(previewDecoratorUsage);
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      }
    });
  });
}

const rule: UISyntaxRule = {
  name: 'no-duplicate-preview',
  messages: {
    duplicateEntry: `An ArkTS file con contain at most 10 '@Preview' decorators.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        checkDuplicatePreview(node, context);
      },
    };
  },
};

export default rule;