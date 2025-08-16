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
import { getClassPropertyAnnotationNames, hasAnnotation, PresetDecorators } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

const decorators: string[] = [
    PresetDecorators.BUILDER_PARAM,
    PresetDecorators.STATE,
    PresetDecorators.PROP_REF,
    PresetDecorators.LINK,
    PresetDecorators.OBJECT_LINK,
    PresetDecorators.STORAGE_PROP_REF,
    PresetDecorators.STORAGE_LINK,
    PresetDecorators.WATCH,
    PresetDecorators.LOCAL_STORAGE_LINK,
    PresetDecorators.REQUIRE,
];

class StructPropertyDecoratorRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            invalidStaticUsage: `The static variable of struct cannot be used together with built-in annotations.`
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (!arkts.isStructDeclaration(node)) {
            return;
        }
        const hasComponentV1 = hasAnnotation(node.definition.annotations, PresetDecorators.COMPONENT_V1);
        this.checkInvalidStaticPropertyDecorations(node, hasComponentV1);
    }

    private hasPropertyDecorator(
        member: arkts.ClassProperty,
    ): boolean {
        const annotationName = getClassPropertyAnnotationNames(member);
        return decorators.some(decorator =>
            annotationName.includes(decorator)
        );
    }

    private checkInvalidStaticPropertyDecorations(node: arkts.StructDeclaration, hasComponentV1: boolean): void {
        node.definition.body.forEach((member) => {
            // Errors are reported when the node type is static ClassProperty,
            if (!arkts.isClassProperty(member) || !member.key) {
                return;
            }
            if (!hasComponentV1 || !member.isStatic || !this.hasPropertyDecorator(member)) {
                return;
            }
            const propertyNameNode = member.key;
            this.report({
                node: propertyNameNode,
                message: this.messages.invalidStaticUsage
            });
        });
    }
}

export default StructPropertyDecoratorRule;