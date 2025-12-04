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

import { backingField, coerceToAstNode, expectName, flatVisitMethodWithOverloads } from '../../common/arkts-utils';
import { DecoratorNames, NodeCacheNames } from '../../common/predefines';
import { createGetter, createSetter, generateThisBacking, hasDecorator, removeDecorator } from './utils';
import {
    BasePropertyTranslator,
    InterfacePropertyCachedTranslator,
    InterfacePropertyTranslator,
    InterfacePropertyTypes,
    PropertyCachedTranslator,
    PropertyTranslator,
} from './base';
import { factory } from './factory';
import { addMemoAnnotation, findCanAddMemoFromTypeAnnotation } from '../../collectors/memo-collectors/utils';
import { CustomComponentInterfacePropertyInfo } from '../../collectors/ui-collectors/records';
import { CacheFactory as BuilderLambdaCacheFactory } from '../builder-lambda-translators/cache-factory';
import { BuilderParamClassPropertyValueCache } from '../memo-collect-cache';
import { PropertyCache } from './cache/propertyCache';
import { AstNodeCacheValueMetadata, NodeCacheFactory } from '../../common/node-cache';

function initializeStructWithBuilderLambdaProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    rewriteFn?: <T extends arkts.AstNode>(node: T) => T
): arkts.Statement | undefined {
    const mutableThis: arkts.Expression = generateThisBacking(newName);
    let value = this.property.value ?? arkts.factory.createUndefinedLiteral();
    if (!!value && arkts.isArrowFunctionExpression(value)) {
        value = rewriteFn?.(value) ?? value;
        BuilderParamClassPropertyValueCache.getInstance().collect({ node: value });
    }
    return arkts.factory.createExpressionStatement(
        arkts.factory.createAssignmentExpression(
            mutableThis,
            arkts.factory.createBinaryExpression(
                arkts.factory.createBinaryExpression(
                    factory.createBlockStatementForOptionalExpression(
                        arkts.factory.createIdentifier('initializers'),
                        originalName
                    ),
                    arkts.factory.createIdentifier('content'),
                    arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
                ),
                value,
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
            ),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
        )
    );
}

function fieldWithBuilderLambdaProperty(
    this: BasePropertyTranslator,
    fieldFn: (name: string) => arkts.ClassProperty,
    newName: string
): arkts.ClassProperty {
    if (
        !!this.propertyType &&
        (arkts.isETSFunctionType(this.propertyType) || arkts.isETSUnionType(this.propertyType))
    ) {
        addMemoAnnotation(this.propertyType);
    }
    const field = fieldFn(newName);
    NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(field);
    return field;
}

function getterWithBuilderLambdaProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string
): arkts.MethodDefinition {
    const getter: arkts.MethodDefinition = createGetter(
        originalName,
        this.propertyType,
        arkts.hasModifierFlag(this.property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL)
            ? generateThisBacking(newName, false, false)
            : generateThisBacking(newName, false, true),
        true
    );
    NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(getter);
    return getter;
}

function setterWithBuilderLambdaProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string
): arkts.MethodDefinition {
    const thisSetValue: arkts.Expression = generateThisBacking(newName, false, false);
    const right: arkts.Identifier = arkts.factory.createIdentifier('value');
    const setter: arkts.MethodDefinition = createSetter(originalName, this.propertyType, thisSetValue, right, true);
    NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(setter);
    return setter;
}

function updateStateMethodInInterface<T extends InterfacePropertyTypes>(
    this: InterfacePropertyTranslator<T>,
    method: arkts.MethodDefinition
): arkts.MethodDefinition {
    if (!this.decorator) {
        throw new Error('interface property does not have any decorator.');
    }
    if (method.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
        const type: arkts.TypeNode | undefined = method.function.returnTypeAnnotation;
        if (!!type && (arkts.isETSFunctionType(type) || arkts.isETSUnionType(type))) {
            addMemoAnnotation(type);
        }
        removeDecorator(method, this.decorator);
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(method, { isGetter: true });
    } else if (method.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET) {
        const param = method.function.params[0] as arkts.ETSParameterExpression;
        const type = param.typeAnnotation;
        if (!!type && (arkts.isETSFunctionType(type) || arkts.isETSUnionType(type))) {
            addMemoAnnotation(type);
        }
        removeDecorator(method, this.decorator);
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(method, { isSetter: true });
    }
    return method;
}

function updateStatePropertyInInterface<T extends InterfacePropertyTypes>(
    this: InterfacePropertyTranslator<T>,
    property: arkts.ClassProperty
): arkts.ClassProperty {
    if (!this.decorator) {
        throw new Error('interface property does not have any decorator.');
    }
    const type: arkts.TypeNode | undefined = property.typeAnnotation;
    if (findCanAddMemoFromTypeAnnotation(type)) {
        addMemoAnnotation(type);
    }
    removeDecorator(property, this.decorator);
    return property;
}

export class BuilderParamTranslator extends PropertyTranslator {
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = false;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithBuilderLambdaProperty.bind(this)(newName, originalName);
    }

    field(newName: string, originalName?: string, metadata?: AstNodeCacheValueMetadata): arkts.ClassProperty {
        return fieldWithBuilderLambdaProperty.bind(this)(super.field.bind(this), newName);
    }

    getter(newName: string, originalName: string, metadata?: AstNodeCacheValueMetadata): arkts.MethodDefinition {
        return getterWithBuilderLambdaProperty.bind(this)(newName, originalName);
    }

    setter(newName: string, originalName: string, metadata?: AstNodeCacheValueMetadata): arkts.MethodDefinition {
        return setterWithBuilderLambdaProperty.bind(this)(newName, originalName);
    }
}

export class BuilderParamCachedTranslator extends PropertyCachedTranslator {
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = false;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        const rewriteFn = <T extends arkts.AstNode>(node: T): T => {
            const _node = coerceToAstNode<arkts.ArrowFunctionExpression>(node);
            return BuilderLambdaCacheFactory.updateBuilderArrowFunction(_node) as arkts.AstNode as T;
        };
        return initializeStructWithBuilderLambdaProperty.bind(this)(newName, originalName, rewriteFn);
    }

    field(newName: string, originalName?: string, metadata?: AstNodeCacheValueMetadata): arkts.ClassProperty {
        return fieldWithBuilderLambdaProperty.bind(this)(super.field.bind(this), newName);
    }

    getter(newName: string, originalName: string, metadata?: AstNodeCacheValueMetadata): arkts.MethodDefinition {
        return getterWithBuilderLambdaProperty.bind(this)(newName, originalName);
    }

    setter(newName: string, originalName: string, metadata?: AstNodeCacheValueMetadata): arkts.MethodDefinition {
        return setterWithBuilderLambdaProperty.bind(this)(newName, originalName);
    }
}

export class BuilderParamInterfaceTranslator<T extends InterfacePropertyTypes> extends InterfacePropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.BUILDER_PARAM;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return hasDecorator(node, DecoratorNames.BUILDER_PARAM);
        } else if (arkts.isClassProperty(node)) {
            return hasDecorator(node, DecoratorNames.BUILDER_PARAM);
        }
        return false;
    }

    /**
     * Add `@memo` to getter's return type and setter's param type (expecting a function type or a function type within a union type).
     *
     * @param method expecting getter with `@BuilderParam` and a setter with `@BuilderParam` in the overloads.
     */
    updateStateMethodInInterface(method: arkts.MethodDefinition): arkts.MethodDefinition {
        return updateStateMethodInInterface.bind(this)(method);
    }

    /**
     * Add `@memo` to the type of the property (expecting a function type or a function type within a union type).
     *
     * @param property expecting property with `@BuilderParam`.
     */
    updateStatePropertyInInterface(property: arkts.ClassProperty): arkts.ClassProperty {
        return updateStatePropertyInInterface.bind(this)(property);
    }
}

export class BuilderParamCachedInterfaceTranslator<
    T extends InterfacePropertyTypes,
> extends InterfacePropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.BUILDER_PARAM;

    /**
     * @deprecated
     */
    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInterfacePropertyInfo
    ): node is InterfacePropertyTypes {
        return !!metadata?.annotationInfo?.hasBuilderParam;
    }

    /**
     * Add `@memo` to getter's return type and setter's param type (expecting a function type or a function type within a union type).
     *
     * @param method expecting getter with `@BuilderParam` and a setter with `@BuilderParam` in the overloads.
     */
    updateStateMethodInInterface(method: arkts.MethodDefinition): arkts.MethodDefinition {
        return updateStateMethodInInterface.bind(this)(method);
    }

    /**
     * Add `@memo` to the type of the property (expecting a function type or a function type within a union type).
     *
     * @param property expecting property with `@BuilderParam`.
     */
    updateStatePropertyInInterface(property: arkts.ClassProperty): arkts.ClassProperty {
        return updateStatePropertyInInterface.bind(this)(property);
    }
}
