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
import {
    getClassPropertyAnnotationNames,
    getClassPropertyName,
    isPrivateClassProperty,
    isProtectedClassProperty,
    isPublicClassProperty,
    PresetDecorators
} from '../utils';


class CheckPropertyModifiersRule extends AbstractUISyntaxRule {
    private static readonly noPublicDecorators: string[] = [
        PresetDecorators.STORAGE_PROP_REF,
        PresetDecorators.STORAGE_LINK,
        PresetDecorators.LOCAL_STORAGE_LINK,
    ];

    private static readonly noPrivateDecorators: string[] = [
        PresetDecorators.LINK,
        PresetDecorators.OBJECT_LINK,
    ];

    public setup(): Record<string, string> {
        return {
            invalidPublic: `The {{decoratorName}} decorated '{{propertyName}}' cannot be declared as public.`,
            invalidPrivate: `The {{decoratorName}} decorated '{{propertyName}}' cannot be declared as private.`,
            invalidProtected: `The member attributes of a struct can not be protected.`
        };
    }

    public parsed(node: arkts.StructDeclaration): void {
        if (!arkts.isStructDeclaration(node)) {
            return;
        }
        node.definition.body.forEach(member => {
            if (!arkts.isClassProperty(member)) {
                return;
            }
            if (arkts.isDefaultAccessModifierClassProperty(member)) {
                return;
            }
            const propertyName = getClassPropertyName(member);
            if (!propertyName) {
                return;
            }
            const propertyAnnotationNames = getClassPropertyAnnotationNames(member);
            propertyAnnotationNames.forEach((propertyAnnotationName) => {
                this.checkInvalidPublic(propertyAnnotationName, propertyName, member);
                this.checkInvalidPrivate(propertyAnnotationName, propertyName, member);
            });
            this.checkInvalidProtected(propertyName, member);
        });
    }

    private checkInvalidPublic(propertyAnnotationName: string, propertyName: string,
        member: arkts.ClassProperty
    ): void {
        if (!CheckPropertyModifiersRule.noPublicDecorators.includes(propertyAnnotationName) ||
            !isPublicClassProperty(member)) {
            return;
        }
        const errorNode = member.annotations.find(annotation =>
            annotation.expr && arkts.isIdentifier(annotation.expr) &&
            CheckPropertyModifiersRule.noPublicDecorators.includes(annotation.expr.name)
        );
        if (!errorNode) {
            return;
        }
        this.report({
            node: errorNode,
            message: this.messages.invalidPublic,
            data: {
                decoratorName: propertyAnnotationName,
                propertyName: propertyName,
            }
        });
    }

    private checkInvalidPrivate(propertyAnnotationName: string, propertyName: string,
        member: arkts.ClassProperty
    ): void {
        if (!CheckPropertyModifiersRule.noPrivateDecorators.includes(propertyAnnotationName) ||
            !isPrivateClassProperty(member)) {
            return;
        }
        const errorNode = member.annotations.find(annotation =>
            annotation.expr && arkts.isIdentifier(annotation.expr) &&
            CheckPropertyModifiersRule.noPrivateDecorators.includes(annotation.expr.name)
        );
        if (!errorNode) {
            return;
        }
        this.report({
            node: errorNode,
            message: this.messages.invalidPrivate,
            data: {
                decoratorName: propertyAnnotationName,
                propertyName: propertyName,
            },
        });
    }

    private checkInvalidProtected(propertyName: string, member: arkts.ClassProperty): void {
        if (!isProtectedClassProperty(member)) {
            return;
        }
        this.report({
            node: member,
            message: this.messages.invalidProtected,
            data: {
                propertyName: propertyName,
            }
        });
    }
}

export default CheckPropertyModifiersRule;