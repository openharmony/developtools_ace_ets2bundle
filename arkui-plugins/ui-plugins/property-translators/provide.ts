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

import { backingField, expectName, flatVisitMethodWithOverloads } from '../../common/arkts-utils';
import { DecoratorNames, GetSetTypes, StateManagementTypes } from '../../common/predefines';
import { CustomComponentNames } from '../utils';
import {
    createGetter,
    generateToRecord,
    createSetter2,
    generateThisBacking,
    generateGetOrSetCall,
    getValueInProvideAnnotation,
    ProvideOptions,
    hasDecorator,
    findCachedMemoMetadata,
} from './utils';
import { InterfacePropertyTranslator, InterfacePropertyTypes, PropertyTranslator } from './base';
import { GetterSetter, InitializerConstructor } from './types';
import { factory } from './factory';
import { PropertyCache } from './cache/propertyCache';

export class ProvideTranslator extends PropertyTranslator implements InitializerConstructor, GetterSetter {
    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);
        this.cacheTranslatedInitializer(newName, originalName);
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const initializeStruct: arkts.AstNode = this.generateInitializeStruct(originalName, newName);
        initializeStruct.range = this.property.range;
        PropertyCache.getInstance().collectInitializeStruct(this.structInfo.name, [initializeStruct]);
        if (!!this.structInfo.annotations?.reusable) {
            const toRecord = generateToRecord(newName, originalName);
            PropertyCache.getInstance().collectToRecord(this.structInfo.name, [toRecord]);
        }
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field: arkts.ClassProperty = factory.createOptionalClassProperty(
            newName,
            this.property,
            StateManagementTypes.PROVIDE_DECORATED,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE
        );
        const thisValue: arkts.Expression = generateThisBacking(newName, false, true);
        const thisGet: arkts.CallExpression = generateGetOrSetCall(thisValue, GetSetTypes.GET);
        const thisSet: arkts.ExpressionStatement = arkts.factory.createExpressionStatement(
            generateGetOrSetCall(thisValue, GetSetTypes.SET)
        );
        const getter: arkts.MethodDefinition = this.translateGetter(originalName, this.propertyType, thisGet);
        const setter: arkts.MethodDefinition = this.translateSetter(originalName, this.propertyType, thisSet);
        field.range = this.property.range;
        if (this.isMemoCached) {
            const metadata = findCachedMemoMetadata(this.property, false);
            arkts.NodeCache.getInstance().collect(field, { ...metadata, isWithinTypeParams: true });
            arkts.NodeCache.getInstance().collect(getter, metadata);
            arkts.NodeCache.getInstance().collect(setter, metadata);
        }
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

    generateInitializeStruct(originalName: string, newName: string): arkts.AstNode {
        const options: undefined | ProvideOptions = getValueInProvideAnnotation(this.property);
        const alias: string = options?.alias ?? originalName;
        const allowOverride: boolean = options?.allowOverride ?? false;
        const args: arkts.Expression[] = [
            arkts.factory.create1StringLiteral(originalName),
            arkts.factory.create1StringLiteral(alias),
            factory.generateInitializeValue(this.property, this.propertyType, originalName),
            arkts.factory.createBooleanLiteral(allowOverride),
        ];
        factory.judgeIfAddWatchFunc(args, this.property);
        const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
            generateThisBacking(newName),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            factory.generateStateMgmtFactoryCall(
                StateManagementTypes.MAKE_PROVIDE,
                this.propertyType?.clone(),
                args,
                true,
                this.isMemoCached ? findCachedMemoMetadata(this.property, true) : undefined
            )
        );
        return arkts.factory.createExpressionStatement(assign);
    }
}

export class ProvideInterfaceTranslator<T extends InterfacePropertyTypes> extends InterfacePropertyTranslator<T> {
    translateProperty(): T {
        if (arkts.isMethodDefinition(this.property)) {
            this.modified = true;
            return flatVisitMethodWithOverloads(this.property, this.updateStateMethodInInterface) as T;
        } else if (arkts.isClassProperty(this.property)) {
            this.modified = true;
            return this.updateStatePropertyInInterface(this.property) as T;
        }
        return this.property;
    }

    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        if (arkts.isMethodDefinition(node) && hasDecorator(node, DecoratorNames.PROVIDE)) {
            return true;
        } else if (arkts.isClassProperty(node) && hasDecorator(node, DecoratorNames.PROVIDE)) {
            return true;
        }
        return false;
    }

    /**
     * Wrap getter's return type and setter's param type (expecting an union type with `T` and `undefined`)
     * to `ProvideDecoratedVariable<T> | undefined`.
     *
     * @param method expecting getter with `@Provide` and a setter with `@Provide` in the overloads.
     */
    private updateStateMethodInInterface(method: arkts.MethodDefinition): arkts.MethodDefinition {
        const metadata = findCachedMemoMetadata(method);
        return factory.wrapStateManagementTypeToMethodInInterface(method, DecoratorNames.PROVIDE, metadata);
    }

    /**
     * Wrap to the type of the property (expecting an union type with `T` and `undefined`)
     * to `ProvideDecoratedVariable<T> | undefined`.
     *
     * @param property expecting property with `@Provide`.
     */
    private updateStatePropertyInInterface(property: arkts.ClassProperty): arkts.ClassProperty {
        return factory.wrapStateManagementTypeToPropertyInInterface(property, DecoratorNames.PROVIDE);
    }
}
