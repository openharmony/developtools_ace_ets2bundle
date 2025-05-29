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
import { isBuiltInAttribute } from '../utils';

const rule: UISyntaxRule = {
  name: 'no-same-as-built-in-attribute',
  messages: {
    duplicateName: `The struct '{{structName}}' cannot have the same name as the built-in attribute '{{builtInName}}'.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        if (!node.definition) {
          return;
        }
        if (!arkts.isClassDefinition(node.definition)) {
          return;
        }
        const structIdent = node.definition.ident;
        const structName = node.definition.ident?.name ?? ' ';
        // If the struct name matches any built-in attribute, report an error
        if (structIdent && isBuiltInAttribute(context, structName)) {
          const builtInName = structName;
          context.report({
            node: structIdent,
            message: rule.messages.duplicateName,
            data: { structName, builtInName }
          });
        }
      },
    };
  },
};

export default rule;