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
    generateToRecord,
    createGetter,
    createSetter2,
    generateThisBacking,
    generateGetOrSetCall,
    collectStateManagementTypeImport,
    hasDecorator,
    PropertyCache,
} from './utils';
import { factory } from './factory';

function getStoragePropValueStr(node: arkts.AstNode): string | undefined {
    if (!arkts.isClassProperty(node) || !node.value) return undefined;

    return arkts.isStringLiteral(node.value) ? node.value.str : undefined;
}

function getStoragePropAnnotationValue(anno: arkts.AnnotationUsage): string | undefined {
    const isStoragePropAnnotation: boolean =
        !!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === DecoratorNames.STORAGE_PROP;

    if (isStoragePropAnnotation && anno.properties.length === 1) {
        return getStoragePropValueStr(anno.properties.at(0)!);
    }
    return undefined;
}

function getStoragePropValueInAnnotation(node: arkts.ClassProperty): string | undefined {
    const annotations: readonly arkts.AnnotationUsage[] = node.annotations;

    for (let i = 0; i < annotations.length; i++) {
        const anno: arkts.AnnotationUsage = annotations[i];
        const str: string | undefined = getStoragePropAnnotationValue(anno);
        if (!!str) {
            return str;
        }
    }
    return undefined;
}

export class StoragePropTranslator extends PropertyTranslator implements InitializerConstructor, GetterSetter {
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

    generateInitializeStruct(newName: string, originalName: string): arkts.AstNode {
        const storagePropValueStr: string | undefined = getStoragePropValueInAnnotation(this.property);
        if (!storagePropValueStr) {
            throw new Error('StorageProp required only one value!!');
        }

        const args: arkts.Expression[] = [
            arkts.factory.createStringLiteral(storagePropValueStr),
            arkts.factory.create1StringLiteral(originalName),
            this.property.value ?? arkts.factory.createUndefinedLiteral(),
        ];
        factory.judgeIfAddWatchFunc(args, this.property);
        collectStateManagementTypeImport(StateManagementTypes.STORAGE_PROP_DECORATED);
        const newClass = arkts.factory.createETSNewClassInstanceExpression(
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier(StateManagementTypes.STORAGE_PROP_DECORATED),
                    arkts.factory.createTSTypeParameterInstantiation(
                        this.property.typeAnnotation ? [this.property.typeAnnotation] : []
                    )
                )
            ),
            args
        );

        return arkts.factory.createAssignmentExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier(newName),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            newClass
        );
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field = factory.createOptionalClassProperty(
            newName,
            this.property,
            StateManagementTypes.STORAGE_PROP_DECORATED,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE
        );
        const thisValue: arkts.Expression = generateThisBacking(newName, false, true);
        const thisGet: arkts.CallExpression = generateGetOrSetCall(thisValue, 'get');
        const thisSet: arkts.ExpressionStatement = arkts.factory.createExpressionStatement(
            generateGetOrSetCall(thisValue, 'set')
        );
        const getter: arkts.MethodDefinition = this.translateGetter(
            originalName,
            this.property.typeAnnotation,
            thisGet
        );
        const setter: arkts.MethodDefinition = this.translateSetter(
            originalName,
            this.property.typeAnnotation,
            thisSet
        );
        return [field, getter, setter];
    }

    translateGetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        returnValue: arkts.Expression
    ): arkts.MethodDefinition {
        return createGetter(originalName, typeAnnotation, returnValue);
    }

    translateSetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        statement: arkts.AstNode
    ): arkts.MethodDefinition {
        return createSetter2(originalName, typeAnnotation, statement);
    }
}

export class StoragePropInterfaceTranslator<T extends InterfacePropertyTypes> extends InterfacePropertyTranslator<T> {
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
        if (arkts.isMethodDefinition(node) && hasDecorator(node, DecoratorNames.STORAGE_PROP)) {
            return true;
        } else if (arkts.isClassProperty(node) && hasDecorator(node, DecoratorNames.STORAGE_PROP)) {
            return true;
        }
        return false;
    }

    /**
     * Wrap getter's return type and setter's param type (expecting an union type with `T` and `undefined`)
     * to `StoragePropDecoratedVariable<T> | undefined`.
     *
     * @param method expecting getter with `@StorageProp` and a setter with `@StorageProp` in the overloads.
     */
    private updateStateMethodInInterface(method: arkts.MethodDefinition): arkts.MethodDefinition {
        return factory.wrapStateManagementTypeToMethodInInterface(method, DecoratorNames.STORAGE_PROP);
    }

    /**
     * Wrap to the type of the property (expecting an union type with `T` and `undefined`)
     * to `StoragePropDecoratedVariable<T> | undefined`.
     *
     * @param property expecting property with `@StorageProp`.
     */
    private updateStatePropertyInInterface(property: arkts.ClassProperty): arkts.ClassProperty {
        return factory.wrapStateManagementTypeToPropertyInInterface(property, DecoratorNames.STORAGE_PROP);
    }
}
