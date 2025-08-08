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

const v1Decorators: string[] = [
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

const v2Decorators: string[] = [
    PresetDecorators.PARAM,
    PresetDecorators.ONCE,
    PresetDecorators.EVENT,
    PresetDecorators.PROVIDER,
    PresetDecorators.CONSUMER,
    PresetDecorators.MONITOR,
    PresetDecorators.REQUIRE,
];

class StructPropertyDecoratorRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            invalidStaticUsage: `The static variable of struct cannot be used together with built-in annotations.`
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (arkts.isETSStructDeclaration(node)) {
            const hasComponentV1 = hasAnnotation(node.definition.annotations, PresetDecorators.COMPONENT_V1);
            const hasComponentV2 = hasAnnotation(node.definition.annotations, PresetDecorators.COMPONENT_V2);
            this.checkInvalidStaticPropertyDecorations(node, hasComponentV1, hasComponentV2);
            if (hasComponentV2) {
                this.checkInvalidStaticMethodDecorations(node);
            }
        }
        if (arkts.isClassDeclaration(node)) {
            this.checkInvalidStaticMethodDecorations(node);
        }
    }

    private hasPropertyDecorator(
        member: arkts.ClassProperty,
        decorators: string[]
    ): boolean {
        const annotationName = getClassPropertyAnnotationNames(member);
        return decorators.some(decorator =>
            annotationName.includes(decorator)
        );
    }

    private checkInvalidStaticPropertyDecorations(
        node: arkts.ETSStructDeclaration,
        hasComponentV1: boolean,
        hasComponentV2: boolean
    ): void {
        node.definition.body.forEach((member) => {
            // Errors are reported when the node type is static ClassProperty,
            if (!arkts.isClassProperty(member) || !member.key || !member.isStatic) {
                return;
            }
            if (hasComponentV1 && this.hasPropertyDecorator(member, v1Decorators) ||
                hasComponentV2 && this.hasPropertyDecorator(member, v2Decorators)) {
                const propertyNameNode = member.key;
                this.report({
                    node: propertyNameNode,
                    message: this.messages.invalidStaticUsage
                });
            }
        });
    }

    private checkInvalidStaticMethodDecorations(node: arkts.ClassDeclaration | arkts.ETSStructDeclaration): void {
        node.definition?.body.forEach((member) => {
            // Errors are reported when the node type is static Method,
            if (!arkts.isMethodDefinition(member) || !member.id || !member.isStatic) {
                return;
            }
            const hasMonitor = member.function!.annotations.some(annotation => {
                if (!annotation.expr || !arkts.isIdentifier(annotation.expr)) {
                    return false;
                }
                return annotation.expr.name === PresetDecorators.MONITOR;
            });
            if (!hasMonitor) {
                return;
            }
            const propertyNameNode = member.id;
            this.report({
                node: propertyNameNode,
                message: this.messages.invalidStaticUsage
            });
        });
    }
}

export default StructPropertyDecoratorRule;