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

import { backingField, expectName } from '../../common/arkts-utils';
import { DecoratorNames, StateManagementTypes } from '../../common/predefines';
import { InterfacePropertyTranslator, InterfacePropertyTypes, PropertyTranslator } from './base';
import { GetterSetter, InitializerConstructor } from './types';
import {
    collectStateManagementTypeImport,
    generateToRecord,
    hasDecorator,
    PropertyCache,
} from './utils';
import { factory } from './factory';

function getLocalStorageLinkValueStr(node: arkts.AstNode): string | undefined {
    if (!arkts.isClassProperty(node) || !node.value) return undefined;
    return arkts.isStringLiteral(node.value) ? node.value.str : undefined;
}

function getLocalStorageLinkAnnotationValue(anno: arkts.AnnotationUsage): string | undefined {
    const isStorageLinkAnnotation: boolean =
        !!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === DecoratorNames.LOCAL_STORAGE_LINK;

    if (isStorageLinkAnnotation && anno.properties.length === 1) {
        return getLocalStorageLinkValueStr(anno.properties.at(0)!);
    }
    return undefined;
}

function getLocalStorageLinkValueInAnnotation(node: arkts.ClassProperty): string | undefined {
    const annotations: readonly arkts.AnnotationUsage[] = node.annotations;

    for (let i = 0; i < annotations.length; i++) {
        const anno: arkts.AnnotationUsage = annotations[i];
        const str: string | undefined = getLocalStorageLinkAnnotationValue(anno);
        if (!!str) {
            return str;
        }
    }

    return undefined;
}

export class LocalStorageLinkTranslator extends PropertyTranslator implements InitializerConstructor, GetterSetter {
    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);

        this.cacheTranslatedInitializer(newName, originalName);
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const initializeStruct: arkts.AstNode = this.generateInitializeStruct(newName, originalName);
        PropertyCache.getInstance().collectInitializeStruct(this.structInfo.name, [initializeStruct]);
        if (!!this.structInfo.annotations?.reusable) {
            const toRecord = generateToRecord(newName, originalName);
            PropertyCache.getInstance().collectToRecord(this.structInfo.name, [toRecord]);
        }
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field = factory.createOptionalClassProperty(
            newName,
            this.property,
            StateManagementTypes.MUTABLE_STATE,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE
        );

        const member = arkts.factory.createTSNonNullExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier(newName),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            )
        );
        const thisValue: arkts.MemberExpression = arkts.factory.createMemberExpression(
            member,
            arkts.factory.createIdentifier('value'),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );

        const getter: arkts.MethodDefinition = this.translateGetter(
            originalName,
            this.property.typeAnnotation,
            thisValue
        );
        const setter: arkts.MethodDefinition = this.translateSetter(
            originalName,
            this.property.typeAnnotation,
            thisValue
        );
        return [field, getter, setter];
    }

    generateInitializeStruct(newName: string, originalName: string): arkts.AstNode {
        const localStorageLinkValueStr: string | undefined = getLocalStorageLinkValueInAnnotation(this.property);
        if (!localStorageLinkValueStr) {
            throw new Error('LocalStorageLink required only one value!!');
        }

        const call = arkts.factory.createCallExpression(
            arkts.factory.createIdentifier(StateManagementTypes.STORAGE_LINK_STATE),
            this.property.typeAnnotation ? [this.property.typeAnnotation] : [],
            [
                arkts.factory.createMemberExpression(
                    arkts.factory.createThisExpression(),
                    arkts.factory.createIdentifier('_entry_local_storage_'),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                arkts.factory.createStringLiteral(localStorageLinkValueStr),
                this.property.value ?? arkts.factory.createUndefinedLiteral(),
            ]
        );
        collectStateManagementTypeImport(StateManagementTypes.STORAGE_LINK_STATE);

        return arkts.factory.createAssignmentExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier(newName),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            call
        );
    }
}

export class LocalStorageLinkInterfaceTranslator<
    T extends InterfacePropertyTypes
> extends InterfacePropertyTranslator<T> {
    translateProperty(): T {
        if (arkts.isMethodDefinition(this.property)) {
            this.modified = true;
            return this.updateStateMethodInInterface(this.property) as T;
        } else if (arkts.isClassProperty(this.property)) {
            this.modified = true;
            return this.updateStatePropertyInInterface(this.property) as T;
        }
        return this.property;
    }

    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        if (arkts.isMethodDefinition(node) && hasDecorator(node, DecoratorNames.LOCAL_STORAGE_LINK)) {
            return true;
        } else if (arkts.isClassProperty(node) && hasDecorator(node, DecoratorNames.LOCAL_STORAGE_LINK)) {
            return true;
        }
        return false;
    }

    /**
     * Wrap getter's return type and setter's param type (expecting an union type with `T` and `undefined`)
     * to `MutableState<T> | undefined`.
     *
     * @param method expecting getter with `@LocalStorageLink` and a setter with `@LocalStorageLink` in the overloads.
     */
    private updateStateMethodInInterface(method: arkts.MethodDefinition): arkts.MethodDefinition {
        return factory.wrapStateManagementTypeToMethodInInterface(method, DecoratorNames.LOCAL_STORAGE_LINK);
    }

    /**
     * Wrap to the type of the property (expecting an union type with `T` and `undefined`)
     * to `MutableState<T> | undefined`.
     *
     * @param property expecting property with `@LocalStorageLink`.
     */
    private updateStatePropertyInInterface(property: arkts.ClassProperty): arkts.ClassProperty {
        return factory.wrapStateManagementTypeToPropertyInInterface(property, DecoratorNames.LOCAL_STORAGE_LINK);
    }
}
