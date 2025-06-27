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
import { DecoratorNames, GetSetTypes, NodeCacheNames, StateManagementTypes } from '../../common/predefines';
import {
    createGetter,
    createSetter2,
    generateThisBacking,
    generateGetOrSetCall,
    hasDecorator,
    collectStateManagementTypeImport,
    findCachedMemoMetadata,
    checkIsNameStartWithBackingField,
} from './utils';
import {
    BasePropertyTranslator,
    InterfacePropertyCachedTranslator,
    InterfacePropertyTranslator,
    InterfacePropertyTypes,
    PropertyCachedTranslator,
    PropertyCachedTranslatorOptions,
    PropertyTranslator,
    PropertyTranslatorOptions,
} from './base';
import { factory } from './factory';
import { factory as UIFactory } from '../ui-factory';
import { PropertyCache } from './cache/propertyCache';
import { CustomComponentInterfacePropertyInfo } from '../../collectors/ui-collectors/records';

function factoryCallWithLocalProperty(
    this: BasePropertyTranslator,
    originalName: string,
    metadata?: arkts.AstNodeCacheValueMetadata,
    isStatic?: boolean
): arkts.CallExpression | undefined {
    if (!this.stateManagementType || !this.makeType) {
        return undefined;
    }
    const args: arkts.Expression[] = [
        arkts.factory.create1StringLiteral(originalName),
        this.property.value ?? arkts.factory.createUndefinedLiteral(),
    ];
    collectStateManagementTypeImport(this.stateManagementType);
    const factoryCall: arkts.CallExpression = factory.generateStateMgmtFactoryCall(
        this.makeType,
        this.propertyType?.clone(),
        args,
        !isStatic,
        metadata
    );
    return factoryCall;
}

function initializeStructWithLocalProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: arkts.AstNodeCacheValueMetadata
): arkts.Statement | undefined {
    const factoryCall = factoryCallWithLocalProperty.bind(this)(originalName, metadata);
    if (!factoryCall) {
        return undefined;
    }
    const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
        generateThisBacking(newName),
        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
        factoryCall
    );
    return arkts.factory.createExpressionStatement(assign);
}

function fieldWithStaticLocalProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: arkts.AstNodeCacheValueMetadata
): arkts.ClassProperty | undefined {
    if (!this.stateManagementType || !this.makeType) {
        return undefined;
    }
    const factoryCall = factoryCallWithLocalProperty.bind(this)(originalName, metadata, true);
    if (!factoryCall) {
        return undefined;
    }
    const field = arkts.factory.createClassProperty(
        arkts.factory.createIdentifier(newName),
        factoryCall,
        factory.createStageManagementType(this.stateManagementType, this.propertyType),
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC,
        false
    );
    if (this.isMemoCached) {
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(field, metadata);
    }
    return field;
}

function getterWithStaticLocalProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    structName: string,
    metadata?: arkts.AstNodeCacheValueMetadata
): arkts.MethodDefinition {
    const thisValue: arkts.Expression = UIFactory.generateMemberExpression(
        arkts.factory.createIdentifier(structName),
        newName
    );
    const thisGet: arkts.CallExpression = generateGetOrSetCall(thisValue, GetSetTypes.GET);
    const getter: arkts.MethodDefinition = createGetter(
        originalName,
        this.propertyType,
        thisGet,
        this.isMemoCached,
        true,
        metadata
    );
    if (this.isMemoCached) {
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(getter, metadata);
    }
    return getter;
}

function setterWithStaticLocalProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    structName: string,
    metadata?: arkts.AstNodeCacheValueMetadata
): arkts.MethodDefinition {
    const thisValue: arkts.Expression = UIFactory.generateMemberExpression(
        arkts.factory.createIdentifier(structName),
        newName
    );
    const thisSet: arkts.ExpressionStatement = arkts.factory.createExpressionStatement(
        generateGetOrSetCall(thisValue, GetSetTypes.SET)
    );
    const setter: arkts.MethodDefinition = createSetter2(originalName, this.propertyType, thisSet, true);
    if (this.isMemoCached) {
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(setter, metadata);
    }
    return setter;
}

export class LocalTranslator extends PropertyTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.LOCAL_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_LOCAL;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = false;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;
    protected isStatic?: boolean;

    constructor(options: PropertyTranslatorOptions) {
        super(options);
        this.isStatic = this.property.isStatic;
        if (this.isStatic) {
            this.hasInitializeStruct = false;
            this.makeType = StateManagementTypes.MAKE_STATIC_LOCAL;
        }
    }

    field(newName: string, originalName?: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.ClassProperty {
        if (this.isStatic && !!originalName) {
            const property = fieldWithStaticLocalProperty.bind(this)(newName, originalName, metadata);
            if (!!property) {
                return property;
            }
        }
        return super.field(newName, originalName, metadata);
    }

    getter(newName: string, originalName: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.MethodDefinition {
        if (this.isStatic) {
            return getterWithStaticLocalProperty.bind(this)(newName, originalName, this.structInfo.name, metadata);
        }
        return super.getter(newName, originalName, metadata);
    }

    setter(newName: string, originalName: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.MethodDefinition {
        if (this.isStatic) {
            return setterWithStaticLocalProperty.bind(this)(newName, originalName, this.structInfo.name, metadata);
        }
        return super.setter(newName, originalName, metadata);
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        if (this.isStatic) {
            return undefined;
        }
        return initializeStructWithLocalProperty.bind(this)(newName, originalName, metadata);
    }
}

export class LocalCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.LOCAL_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_LOCAL;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = false;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;
    protected isStatic?: boolean;

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
        this.isStatic = this.property.isStatic;
        if (this.isStatic) {
            this.hasInitializeStruct = false;
            this.makeType = StateManagementTypes.MAKE_STATIC_LOCAL;
        }
    }

    field(newName: string, originalName?: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.ClassProperty {
        if (this.isStatic && !!originalName) {
            const property = fieldWithStaticLocalProperty.bind(this)(newName, originalName, metadata);
            if (!!property) {
                return property;
            }
        }
        return super.field(newName, originalName, metadata);
    }

    getter(newName: string, originalName: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.MethodDefinition {
        if (this.isStatic) {
            const structName: string = this.propertyInfo.structInfo?.name!;
            return getterWithStaticLocalProperty.bind(this)(newName, originalName, structName, metadata);
        }
        return super.getter(newName, originalName, metadata);
    }

    setter(newName: string, originalName: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.MethodDefinition {
        if (this.isStatic) {
            const structName: string = this.propertyInfo.structInfo?.name!;
            return setterWithStaticLocalProperty.bind(this)(newName, originalName, structName, metadata);
        }
        return super.setter(newName, originalName, metadata);
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        if (this.isStatic) {
            return undefined;
        }
        return initializeStructWithLocalProperty.bind(this)(newName, originalName, metadata);
    }
}

export class LocalInterfaceTranslator<T extends InterfacePropertyTypes> extends InterfacePropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.LOCAL;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.name) && hasDecorator(node, DecoratorNames.LOCAL);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.LOCAL);
        }
        return false;
    }
}

export class LocalCachedInterfaceTranslator<
    T extends InterfacePropertyTypes,
> extends InterfacePropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.LOCAL;

    /**
     * @deprecated
     */
    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInterfacePropertyInfo
    ): node is InterfacePropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasLocal;
    }
}
