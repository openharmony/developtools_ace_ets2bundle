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

class StructMissingDecoratorRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            missingComponentDecorator: `Decorator '@Component', '@ComponentV2', or '@CustomDialog' is missing for struct '{{structName}}'.`
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (!arkts.isStructDeclaration(node)) {
            return;
        }
        if (!node.definition) {
            return;
        }
        if (!arkts.isClassDefinition(node.definition)) {
            return;
        }
        // Check for the presence of specific decorators on the struct
        const structName = node.definition.ident?.name ?? '';
        const structNode = node.definition.ident;
        const hasComponent = this.hasDecorator(node, PresetDecorators.COMPONENT_V1);
        const hasComponentV2 = this.hasDecorator(node, PresetDecorators.COMPONENT_V2);
        const hasCustomDialog = this.hasDecorator(node, PresetDecorators.CUSTOM_DIALOG);

        // If no valid component decorators (@Component or @CustomDialog) are found
        if (!hasComponent && !hasComponentV2 && !hasCustomDialog && structNode) {
            this.report({
                node: structNode,
                message: this.messages.missingComponentDecorator,
                data: { structName },
            });
        }
    }

    private hasDecorator(node: arkts.StructDeclaration, decorator: string): boolean {
        return !!getAnnotationUsage(node, decorator);
    }
}

export default StructMissingDecoratorRule;