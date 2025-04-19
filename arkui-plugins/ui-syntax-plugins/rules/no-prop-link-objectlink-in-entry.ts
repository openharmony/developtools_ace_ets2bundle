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

function checkNoPropLinkOrObjectLinkInEntry(context: UISyntaxRuleContext, node: arkts.StructDeclaration): void {
  // Check if the struct has the @Entry decorator
  const isEntryComponent = !!getAnnotationUsage(node, PresetDecorators.ENTRY);
  if (!isEntryComponent) {
    return;
  }
  node.definition.body.forEach(body => {
    if (!arkts.isClassProperty(body)) {
      return;
    }
    const invalidDecorators = [PresetDecorators.PROP, PresetDecorators.LINK, PresetDecorators.OBJECT_LINK];
    // Check if any invalid decorators are applied to the class property
    body.annotations?.forEach(annotation => {
      reportInvalidDecorator(context, annotation, invalidDecorators);
    });
  });
}

function reportInvalidDecorator(context: UISyntaxRuleContext, annotation: arkts.AnnotationUsage,
  invalidDecorators: string[],): void {
  if (annotation.expr && invalidDecorators.includes(annotation.expr.dumpSrc())) {
    const decorator = annotation.expr.dumpSrc();
    context.report({
      node: annotation,
      message: rule.messages.invalidUsage,
      data: { decorator },
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

const rule: UISyntaxRule = {
  name: 'no-prop-link-objectlink-in-entry',
  messages: {
    invalidUsage: `@{{decorator}} decorator cannot be used for '@Entry' decorated components.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        checkNoPropLinkOrObjectLinkInEntry(context, node);
      },
    };
  },
};

export default rule;
