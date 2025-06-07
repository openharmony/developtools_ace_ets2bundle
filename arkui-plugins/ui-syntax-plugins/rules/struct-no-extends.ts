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
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function checkExtendOrImplement(
  node: arkts.AstNode,
  context: UISyntaxRuleContext
): void {
  if (!arkts.isStructDeclaration(node) || !node.definition.ident) {
    return;
  }
  const hasSuperClass: boolean = node.definition.super !== undefined;
  const hasImplements: boolean = node.definition.implements.length > 0;
  // If there is an inheritance class or implementation interface, an error is reported
  if (hasSuperClass || hasImplements) {
    const errorNode = node.definition.ident;
    context.report({
      node: errorNode,
      message: rule.messages.structNoExtends,
    });
  }
}

const rule: UISyntaxRule = {
  name: 'struct-no-extends',
  messages: {
    structNoExtends: `Structs are not allowed to inherit from classes or implement interfaces.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        checkExtendOrImplement(node, context);
      },
    };
  },
};

export default rule;
