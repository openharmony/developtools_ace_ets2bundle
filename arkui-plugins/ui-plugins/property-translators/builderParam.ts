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
import { DecoratorNames } from '../../common/predefines';
import { createGetter, createSetter, generateThisBacking, hasDecorator, removeDecorator, PropertyCache } from './utils';
import { InterfacePropertyTranslator, InterfacePropertyTypes, PropertyTranslator } from './base';
import { GetterSetter, InitializerConstructor } from './types';
import { factory } from './factory';
import { addMemoAnnotation, findCanAddMemoFromTypeAnnotation } from '../../collectors/memo-collectors/utils';

export class BuilderParamTranslator extends PropertyTranslator implements InitializerConstructor, GetterSetter {
    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);
        this.cacheTranslatedInitializer(newName, originalName);
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const mutableThis: arkts.Expression = generateThisBacking(newName);
        const initializeStruct: arkts.AstNode = this.generateInitializeStruct(mutableThis, originalName);
        PropertyCache.getInstance().collectInitializeStruct(this.structInfo.name, [initializeStruct]);
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const propertyType = this.property.typeAnnotation;
        if (!!propertyType && (arkts.isETSFunctionType(propertyType) || arkts.isETSUnionType(propertyType))) {
            addMemoAnnotation(propertyType);
        }
        const field: arkts.ClassProperty = factory.createOptionalClassProperty(
            newName,
            this.property,
            undefined,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            true
        );
        arkts.NodeCache.getInstance().collect(field);
        const thisSetValue: arkts.Expression = generateThisBacking(newName, false, false);
        const getter: arkts.MethodDefinition = this.translateGetter(
            originalName,
            propertyType?.clone(),
            arkts.hasModifierFlag(this.property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL)
                ? generateThisBacking(newName, false, false)
                : generateThisBacking(newName, false, true)
        );
        arkts.NodeCache.getInstance().collect(getter);
        const setter: arkts.MethodDefinition = this.translateSetter(originalName, propertyType?.clone(), thisSetValue);
        arkts.NodeCache.getInstance().collect(setter);

        return [field, getter, setter];
    }

    translateGetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        returnValue: arkts.Expression
    ): arkts.MethodDefinition {
        return createGetter(originalName, typeAnnotation, returnValue, true);
    }

    translateSetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        left: arkts.Expression
    ): arkts.MethodDefinition {
        const right: arkts.Identifier = arkts.factory.createIdentifier('value');
        return createSetter(originalName, typeAnnotation, left, right, true);
    }

    generateInitializeStruct(mutableThis: arkts.Expression, originalName: string): arkts.AstNode {
        const value = this.property.value;
        if (!!value && arkts.isArrowFunctionExpression(value)) {
            arkts.NodeCache.getInstance().collect(value);
        }
        return arkts.factory.createAssignmentExpression(
            mutableThis,
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            arkts.factory.createBinaryExpression(
                arkts.factory.createBinaryExpression(
                    factory.createBlockStatementForOptionalExpression(
                        arkts.factory.createIdentifier('initializers'),
                        originalName
                    ),
                    arkts.factory.createIdentifier('content'),
                    arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
                ),
                value ?? arkts.factory.createUndefinedLiteral(),
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
            )
        );
    }
}

export class BuilderParamInterfaceTranslator<T extends InterfacePropertyTypes> extends InterfacePropertyTranslator<T> {
    translateProperty(): T {
        if (arkts.isMethodDefinition(this.property)) {
            this.modified = true;
            return this.updateBuilderParamMethodInInterface(this.property) as T;
        } else if (arkts.isClassProperty(this.property)) {
            this.modified = true;
            return this.updateBuilderParamPropertyInInterface(this.property) as T;
        }
        return this.property;
    }

    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        if (arkts.isMethodDefinition(node) && hasDecorator(node, DecoratorNames.BUILDER_PARAM)) {
            return true;
        } else if (arkts.isClassProperty(node) && hasDecorator(node, DecoratorNames.BUILDER_PARAM)) {
            return true;
        }
        return false;
    }

    /**
     * Add `@memo` to getter's return type and setter's param type (expecting a function type or a function type within a union type).
     *
     * @param method expecting getter with `@BuilderParam` and a setter with `@BuilderParam` in the overloads.
     */
    private updateBuilderParamMethodInInterface(method: arkts.MethodDefinition): arkts.MethodDefinition {
        if (method.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
            const type: arkts.TypeNode | undefined = method.scriptFunction.returnTypeAnnotation;
            if (!!type && (arkts.isETSFunctionType(type) || arkts.isETSUnionType(type))) {
                addMemoAnnotation(type);
            }
            const newOverLoads = method.overloads.map((overload) => {
                if (arkts.isMethodDefinition(overload)) {
                    return this.updateBuilderParamMethodInInterface(overload);
                }
                return overload;
            });
            method.setOverloads(newOverLoads);
            removeDecorator(method, DecoratorNames.BUILDER_PARAM);
            arkts.NodeCache.getInstance().collect(method, { isGetter: true });
        } else if (method.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET) {
            const param = method.scriptFunction.params.at(0)! as arkts.ETSParameterExpression;
            const type = param.type;
            if (!!type && (arkts.isETSFunctionType(type) || arkts.isETSUnionType(type))) {
                addMemoAnnotation(type);
            }
            removeDecorator(method, DecoratorNames.BUILDER_PARAM);
            arkts.NodeCache.getInstance().collect(method, { isSetter: true });
        }
        return method;
    }

    /**
     * Add `@memo` to the type of the property (expecting a function type or a function type within a union type).
     *
     * @param property expecting property with `@BuilderParam`.
     */
    private updateBuilderParamPropertyInInterface(property: arkts.ClassProperty): arkts.ClassProperty {
        const type: arkts.TypeNode | undefined = property.typeAnnotation;
        if (findCanAddMemoFromTypeAnnotation(type)) {
            addMemoAnnotation(type);
        }
        removeDecorator(property, DecoratorNames.BUILDER_PARAM);
        return property;
    }
}
