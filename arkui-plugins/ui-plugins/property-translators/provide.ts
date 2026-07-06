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
    generateToRecord,
    createSetter2,
    generateThisBacking,
    generateGetOrSetCall,
    getValueInProvideAnnotation,
    ProvideOptions,
    hasDecorator,
    findCachedMemoMetadata,
    checkIsNameStartWithBackingField,
} from './utils';
import {
    BasePropertyTranslator,
    InnerClassPropertyCachedTranslator,
    InnerClassPropertyTranslator,
    InnerClassPropertyTypes,
    PropertyCachedTranslator,
    PropertyCachedTranslatorOptions,
    PropertyTranslator,
    PropertyTranslatorOptions,
} from './base';
import { factory } from './factory';
import { PropertyCache } from './cache/propertyCache';
import { CustomComponentInnerClassPropertyInfo } from '../../collectors/ui-collectors/records';
import { PropertyValueCache } from '../memo-collect-cache';
import { AstNodeCacheValueMetadata } from '../../common/node-cache';

function initializeStructWithProvideProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: AstNodeCacheValueMetadata
): arkts.Statement | undefined {
    if (!this.stateManagementType || !this.makeType) {
        return undefined;
    }
    const options: undefined | ProvideOptions = getValueInProvideAnnotation(this.property);
    const alias = options?.alias ?? arkts.factory.createStringLiteral(originalName);
    const allowOverride = options?.allowOverride ?? arkts.factory.createBooleanLiteral(false);
    const initializePropertyValue = this.property.value;
    const initializePropertyType = this.propertyType?.clone();
    const args: arkts.Expression[] = [
        arkts.factory.createStringLiteral(originalName),
        alias,
        factory.generateInitializeValue(
            initializePropertyValue, 
            initializePropertyType, 
            originalName, 
            this.initializeOptions,
            this.isMemoCached,
            metadata
        ),
        allowOverride,
    ];
    if (this.initializeOptions?.isWatched) {
        factory.addWatchFunc(args, this.property);
    }
    const stateMgmtCallDefaultType = this.propertyType?.clone();
    const stateMgmtCallType = factory.createStateManagementFactoryGenericType(
        initializePropertyValue, 
        stateMgmtCallDefaultType,
        this.initializeOptions
    );
    const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
        generateThisBacking(newName),
        factory.generateStateMgmtFactoryCall(this.makeType, stateMgmtCallType, args, true, metadata),
        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
    );
    if (this.isMemoShouldUpdate) {
        if (!!initializePropertyValue) {
            PropertyValueCache.getInstance().collect({ value: initializePropertyValue });
        }
        if (!!initializePropertyType) {
            PropertyValueCache.getInstance().collect({ value: initializePropertyType });
        }
        if (!!stateMgmtCallDefaultType) {
            PropertyValueCache.getInstance().collect({ value: stateMgmtCallDefaultType });
        }
    }
    return arkts.factory.createExpressionStatement(assign);
}

/**
 * @deprecated
 */
export class ProvideTranslator extends PropertyTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.PROVIDE_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_PROVIDE;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    constructor(options: PropertyTranslatorOptions) {
        super(options);
        const isWatched = hasDecorator(this.property, DecoratorNames.WATCH);
        const isRequired = hasDecorator(this.property, DecoratorNames.REQUIRE);
        this.initializeOptions = {
            isWatched,
            isRequired,
            shouldCheckNonNull: true
        };
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithProvideProperty.bind(this)(newName, originalName, metadata);
    }
}

export class ProvideCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.PROVIDE_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_PROVIDE;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;
    protected hasResetOnReuse: boolean = true;

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
        const isWatched = this.propertyInfo.annotationInfo?.hasWatch;
        const isRequired = this.propertyInfo.annotationInfo?.hasRequire;
        this.initializeOptions = {
            isWatched,
            isRequired,
            shouldCheckNonNull: true
        };
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithProvideProperty.bind(this)(newName, originalName, metadata);
    }

    resetOnReuse(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.ExpressionStatement {
        const propertyValue = this.property.value?.clone();
        const propertyType = this.propertyType?.clone();
        const arg = factory.generateInitializeValue(propertyValue, propertyType, originalName);
        if (this.isMemoShouldUpdate) {
            if (!!propertyValue) {
                const isFunctionValue = arkts.isArrowFunctionExpression(propertyValue);
                PropertyValueCache.getInstance().collect({ value: propertyValue, shouldCache: this.isMemoCached && isFunctionValue, metadata });
            }
            if (!!propertyType) {
                PropertyValueCache.getInstance().collect({ value: propertyType, shouldCache: this.isMemoCached, metadata });
            }
        }
        return factory.createResetOnReuseStmt(newName, arg);
    }
}

/**
 * @deprecated
 */
export class ProvideInnerClassTranslator<T extends InnerClassPropertyTypes> extends InnerClassPropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.PROVIDE;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InnerClassPropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.id) && hasDecorator(node, DecoratorNames.PROVIDE);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.PROVIDE);
        }
        return false;
    }
}

export class ProvideCachedInnerClassTranslator<
    T extends InnerClassPropertyTypes,
> extends InnerClassPropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.PROVIDE;

    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInnerClassPropertyInfo
    ): node is InnerClassPropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasProvide;
    }
}
