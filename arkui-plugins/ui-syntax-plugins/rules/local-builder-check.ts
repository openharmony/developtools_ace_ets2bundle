/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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
import { PresetDecorators } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function checkLocalBuilder(node: arkts.ClassDeclaration, context: UISyntaxRuleContext): void {
  node.definition?.body.forEach(body => {
    if (!arkts.isMethodDefinition(body)) {
      return;
    }
    const localBuilder = body.scriptFunction?.annotations?.find(
      annotation => annotation.expr &&
        annotation.expr.dumpSrc() === PresetDecorators.LOCAL_BUILDER);
    if (!localBuilder) {
      return;
    }
    context.report({
      node: localBuilder,
      message: rule.messages.invalidUsage,
      fix: (localBuilder) => {
        const startPosition = arkts.getStartPosition(localBuilder);
        const endPosition = arkts.getEndPosition(localBuilder);
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      },
    });
  });
}

const rule: UISyntaxRule = {
  name: 'local-builder-check',
  messages: {
    invalidUsage: `The '@LocalBuilder' decorator can only be used in 'struct'.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isClassDeclaration(node)) {
          return;
        }
        checkLocalBuilder(node, context);
      },
    };
  },
};

export default rule;
