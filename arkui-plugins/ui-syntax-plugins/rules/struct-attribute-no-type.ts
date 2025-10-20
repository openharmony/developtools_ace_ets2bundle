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

import { AbstractUISyntaxRule } from './ui-syntax-rule';

class StructAttributeNoTypeRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            structAttributeNoType: `Struct property '{{propertyName}}' has no type.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        // Check if the current node is a schema declaration
        if (!arkts.isStructDeclaration(node)) {
            return;
        }

        node.definition.body.filter(arkts.isClassProperty).forEach((property) => {
            const name = property.key;
            if (!!name && arkts.isIdentifier(name) && !property.typeAnnotation) {
                this.report({
                    node: property,
                    message: this.messages.structAttributeNoType,
                    data: {
                        propertyName: name.name,
                    },
                });
            }
        });
    }
};

export default StructAttributeNoTypeRule;