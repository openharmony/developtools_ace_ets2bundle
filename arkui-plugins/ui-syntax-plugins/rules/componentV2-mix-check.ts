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
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class ComponentV2MixCheckRule extends AbstractUISyntaxRule {
  public setup(): Record<string, string> {
    return {
      conflictWithComponentV2: `The struct '{{structName}}' can not be decorated with '@ComponentV2' and '@Component', '@Reusable', '@CustomDialog' at the same time.`,
    };
  }

  public parsed(node: arkts.AstNode): void {
    if (!arkts.isStructDeclaration(node)) {
      return;
    }
    const definition = node.definition;
    if (!definition) {
      return;
    }
    const structNameNode = definition.ident;
    if (!structNameNode) {
      return;
    }
    const structName = structNameNode.name ?? '';
    // Check if the struct has the '@ComponentV2' annotation
    const componentV2Decorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
    if (!componentV2Decorator) {
      return;
    }

    // Check for conflicting decorators
    const componentDecorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);
    const reusableDecorator = getAnnotationUsage(node, PresetDecorators.REUSABLE_V1);
    const customDialogDecorator = getAnnotationUsage(node, PresetDecorators.CUSTOM_DIALOG);

    if (componentDecorator || reusableDecorator || customDialogDecorator) {
      this.report({
        node: structNameNode,
        message: this.messages.conflictWithComponentV2,
        data: { structName },
      });
    }
  }
}

export default ComponentV2MixCheckRule;