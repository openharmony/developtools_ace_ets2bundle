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
import { CustomComponentInnerClassPropertyInfo } from '../../collectors/ui-collectors/records';
import {
    createGetter,
    createSetter2,
    generateThisBacking,
    generateGetOrSetCall,
    getValueInAnnotation,
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
import { PropertyValueCache } from '../memo-collect-cache';
import { AstNodeCacheValueMetadata, NodeCacheFactory } from '../../common/node-cache';

function initializeStructWithConsumerProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: AstNodeCacheValueMetadata
): arkts.Statement | undefined {
    if (!this.stateManagementType || !this.makeType) {
        return undefined;
    }
    const defaultValue = this.property.value;
    if (!defaultValue) {
        return undefined;
    }
    const args: arkts.Expression[] = [
        arkts.factory.createStringLiteral(originalName),
        arkts.factory.createStringLiteral(
            getValueInAnnotation(this.property, DecoratorNames.CONSUMER) ?? originalName
        ),
        defaultValue,
    ];
    const stateMgmtCallDefaultType = this.propertyType?.clone();
    const stateMgmtCallType = factory.createStateManagementFactoryGenericType(
        defaultValue, 
        stateMgmtCallDefaultType,
        this.initializeOptions
    );
    const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
        generateThisBacking(newName),
        factory.generateStateMgmtFactoryCall(this.makeType, stateMgmtCallType, args, true, metadata),
        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
    );
    if (this.isMemoShouldUpdate) {
        if (!!defaultValue) {
            PropertyValueCache.getInstance().collect({ value: defaultValue });
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
export class ConsumerTranslator extends PropertyTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.CONSUMER_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_CONSUMER;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = false;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;
    protected hasResetOnReuse: boolean = true;

    constructor(options: PropertyTranslatorOptions) {
        super(options);
        this.initializeOptions = {
            shouldCheckNonNull: false
        };
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithConsumerProperty.bind(this)(newName, originalName, metadata);
    }
}

export class ConsumerCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.CONSUMER_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_CONSUMER;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = false;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;
    protected hasResetOnReuse: boolean = true;

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
        this.initializeOptions = {
            shouldCheckNonNull: false
        };
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithConsumerProperty.bind(this)(newName, originalName, metadata);
    }
}

/**
 * @deprecated
 */
export class ConsumerInnerClassTranslator<T extends InnerClassPropertyTypes> extends InnerClassPropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.CONSUMER;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InnerClassPropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.id) && hasDecorator(node, DecoratorNames.CONSUMER);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.CONSUMER);
        }
        return false;
    }
}

export class ConsumerCachedInnerClassTranslator<
    T extends InnerClassPropertyTypes,
> extends InnerClassPropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.CONSUMER;

    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInnerClassPropertyInfo
    ): node is InnerClassPropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasConsumer;
    }
}
