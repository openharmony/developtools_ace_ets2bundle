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
import { UISyntaxRule } from './ui-syntax-rule';

const rule: UISyntaxRule = {
  name: 'componentV2-mix-check',
  messages: {
    conflictWithComponentV2: `The struct '{{structName}}' can not be decorated with '@ComponentV2' and '@Component', '@Reusable', '@CustomDialog' at the same time.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        const structName = node.definition.ident?.name ?? '';
        const structNameNode = node.definition.ident;
        if (!structNameNode) {
          return;
        }
        // Check if the struct has the '@ComponentV2' annotation
        const hasComponentV2 = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
        if (!hasComponentV2) {
          return;
        }
        // Check for the presence of conflicting decorators: '@Component', '@Reusable', '@CustomDialog'
        const hasComponent = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);
        const hasReusable = getAnnotationUsage(node, PresetDecorators.REUSABLE_V1);
        const hasCustomDialog = getAnnotationUsage(node, PresetDecorators.CUSTOM_DIALOG);
        if (hasComponent || hasReusable || hasCustomDialog) {
          context.report({
            node: structNameNode,
            message: rule.messages.conflictWithComponentV2,
            data: { structName },
          });
        }
      },
    };
  },
};

export default rule;
