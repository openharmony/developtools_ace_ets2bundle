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
import {
    createGetter,
    createSetter2,
    generateThisBacking,
    generateGetOrSetCall,
    hasDecorator,
    collectStateManagementTypeImport,
} from './utils';
import {
    InterfacePropertyTranslator,
    InterfacePropertyTypes,
    PropertyTranslator,
    PropertyTranslatorOptions,
} from './base';
import { GetterSetter, InitializerConstructor } from './types';
import { factory } from './factory';
import { factory as UIFactory } from '../ui-factory';
import { PropertyCache } from './cache/propertyCache';

export class LocalTranslator extends PropertyTranslator implements InitializerConstructor, GetterSetter {
    private isStatic: boolean;

    constructor(options: PropertyTranslatorOptions) {
        super(options);
        this.isStatic = this.property.isStatic;
    }

    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);
        this.cacheTranslatedInitializer(newName, originalName);
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        if (!this.isStatic) {
            const initializeStruct: arkts.AstNode = this.generateInitializeStruct(newName, originalName);
            initializeStruct.range = this.property.range;
            PropertyCache.getInstance().collectInitializeStruct(this.structInfo.name, [initializeStruct]);
        }
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field: arkts.ClassProperty = this.createPropertyField(newName, originalName);
        const thisValue: arkts.Expression = this.isStatic
            ? UIFactory.generateMemberExpression(arkts.factory.createIdentifier(this.structInfo.name), newName)
            : generateThisBacking(newName, false, true);
        const thisGet: arkts.CallExpression = generateGetOrSetCall(thisValue, GetSetTypes.GET);
        const thisSet: arkts.ExpressionStatement = arkts.factory.createExpressionStatement(
            generateGetOrSetCall(thisValue, GetSetTypes.SET)
        );
        const getter: arkts.MethodDefinition = this.translateGetter(originalName, this.propertyType, thisGet);
        const setter: arkts.MethodDefinition = this.translateSetter(originalName, this.propertyType, thisSet);
        field.range = this.property.range;
        return [field, getter, setter];
    }

    createPropertyField(newName: string, originalName: string): arkts.ClassProperty {
        return this.isStatic
            ? arkts.factory.createClassProperty(
                  arkts.factory.createIdentifier(newName),
                  this.generateInitializeValue(originalName),
                  factory.createStageManagementType(StateManagementTypes.LOCAL_DECORATED, this.propertyType),
                  arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC,
                  false
              )
            : factory.createOptionalClassProperty(
                  newName,
                  this.property,
                  StateManagementTypes.LOCAL_DECORATED,
                  arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE
              );
    }

    translateGetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        returnValue: arkts.Expression
    ): arkts.MethodDefinition {
        return createGetter(originalName, typeAnnotation, returnValue, false, this.isStatic);
    }

    translateSetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        statement: arkts.AstNode
    ): arkts.MethodDefinition {
        return createSetter2(originalName, typeAnnotation, statement, this.isStatic);
    }

    generateInitializeStruct(newName: string, originalName: string): arkts.AstNode {
        collectStateManagementTypeImport(StateManagementTypes.LOCAL_DECORATED);
        const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
            generateThisBacking(newName),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            this.generateInitializeValue(originalName)
        );
        return arkts.factory.createExpressionStatement(assign);
    }

    generateInitializeValue(originalName: string): arkts.Expression {
        const args: arkts.Expression[] = [
            arkts.factory.create1StringLiteral(originalName),
            this.property.value ?? arkts.factory.createUndefinedLiteral(),
        ];
        collectStateManagementTypeImport(StateManagementTypes.LOCAL_DECORATED);
        return factory.generateStateMgmtFactoryCall(
            this.isStatic ? StateManagementTypes.MAKE_STATIC_LOCAL : StateManagementTypes.MAKE_LOCAL,
            this.propertyType,
            args,
            this.isStatic ? false : true
        );
    }
}

export class LocalInterfaceTranslator<T extends InterfacePropertyTypes> extends InterfacePropertyTranslator<T> {
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
        if (arkts.isMethodDefinition(node) && hasDecorator(node, DecoratorNames.LOCAL)) {
            return true;
        } else if (arkts.isClassProperty(node) && hasDecorator(node, DecoratorNames.LOCAL)) {
            return true;
        }
        return false;
    }

    /**
     * Wrap getter's return type and setter's param type (expecting an union type with `T` and `undefined`)
     * to `ILocalDecoratedVariable<T> | undefined`.
     *
     * @param method expecting getter with `@Local` and a setter with `@Local` in the overloads.
     */
    private updateStateMethodInInterface(method: arkts.MethodDefinition): arkts.MethodDefinition {
        return factory.wrapStateManagementTypeToMethodInInterface(method, DecoratorNames.LOCAL);
    }

    /**
     * Wrap to the type of the property (expecting an union type with `T` and `undefined`)
     * to `ILocalDecoratedVariable<T> | undefined`.
     *
     * @param property expecting property with `@Local`.
     */
    private updateStatePropertyInInterface(property: arkts.ClassProperty): arkts.ClassProperty {
        return factory.wrapStateManagementTypeToPropertyInInterface(property, DecoratorNames.LOCAL);
    }
}
