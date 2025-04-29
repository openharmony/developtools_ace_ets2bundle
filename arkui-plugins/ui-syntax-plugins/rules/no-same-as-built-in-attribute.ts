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
import { UISyntaxRule } from './ui-syntax-rule';

const rule: UISyntaxRule = {
  name: 'no-same-as-built-in-attribute',
  messages: {
    duplicateName: `The struct name '{{structName}}' should not have the same name as a built-in attribute.`,
  },
  setup(context) {
    const builtInAttributes = ['fontColor', 'width', 'height', 'size', 'border', 'backgroundColor', 'margin',
      'padding'];
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        const structName = node.definition.ident?.name ?? ' ';
        const structIdent = node.definition.ident;
        // If the struct name matches any built-in attribute, report an error
        if (builtInAttributes.includes(structName) && structIdent) {
          context.report({
            node: structIdent,
            message: rule.messages.duplicateName,
            data: { structName }
          });
        }
      },
    };
  },
};

export default rule;
