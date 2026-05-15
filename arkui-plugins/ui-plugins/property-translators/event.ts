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
import { DecoratorNames, NodeCacheNames, StateManagementTypes } from '../../common/predefines';
import {
    createGetter,
    generateToRecord,
    generateThisBacking,
    createSetter2,
    isCustomDialogController,
    findCachedMemoMetadata,
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
import { factory as UIFactory } from '../ui-factory';
// import { CustomComponentNames, optionsHasField } from '../utils';
import { CustomComponentInnerClassPropertyInfo } from '../../collectors/ui-collectors/records';
import {
    RegularCachedInnerClassTranslator,
    RegularInnerClassTranslator,
    RegularPropertyCachedTranslator,
    RegularPropertyTranslator,
} from './regularProperty';
import { PropertyValueCache } from '../memo-collect-cache';

function resetOnReuseWithEventTranslator(
    this: BasePropertyTranslator,
    newName: string, 
    originalName: string,
    metadata?: arkts.AstNodeCacheValueMetadata
): arkts.ExpressionStatement {
    const propertyValue = this.property.value?.clone();
    const propertyType = this.propertyType?.clone();
    const resetStateVars = arkts.factory.createAssignmentExpression(
        arkts.factory.createMemberExpression(
            arkts.factory.createThisExpression(),
            arkts.factory.createIdentifier(originalName),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        factory.generateInitializeValue(propertyValue, propertyType, originalName),
        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
    );
    if (this.isMemoShouldUpdate) {
        if (!!propertyValue) {
            const isFunctionValue = arkts.isArrowFunctionExpression(propertyValue);
            PropertyValueCache.getInstance().collect({ value: propertyValue, shouldCache: this.isMemoCached && isFunctionValue, metadata });
        }
        if (!!propertyType) {
            PropertyValueCache.getInstance().collect({ value: propertyType });
        }
    }
    return arkts.factory.createExpressionStatement(resetStateVars);
}

/**
 * @deprecated
 */
export class EventTranslator extends RegularPropertyTranslator {
    protected shouldWrapPropertyType: boolean = false;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;
    protected hasResetOnReuse: boolean = true;

    constructor(options: PropertyTranslatorOptions) {
        super(options);
        this.initializeOptions = {
            shouldCheckNonNull: true
        };
    }

    resetOnReuse(newName: string, originalName: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.ExpressionStatement {
        return resetOnReuseWithEventTranslator.bind(this)(newName, originalName, metadata);
    }
}

export class EventCachedTranslator extends RegularPropertyCachedTranslator {
    protected shouldWrapPropertyType: boolean = false;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;
    protected hasResetOnReuse: boolean = true;

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
        this.initializeOptions = {
            shouldCheckNonNull: true
        };
    }

    resetOnReuse(newName: string, originalName: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.ExpressionStatement {
        return resetOnReuseWithEventTranslator.bind(this)(newName, originalName, metadata);
    }
}

/**
 * @deprecated
 */
export class EventInnerClassTranslator<T extends InnerClassPropertyTypes> extends RegularInnerClassTranslator<T> {}

export class EventCachedInnerClassTranslator<
    T extends InnerClassPropertyTypes,
> extends RegularCachedInnerClassTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.EVENT;

    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInnerClassPropertyInfo
    ): node is InnerClassPropertyTypes {
        return !!metadata?.annotationInfo?.hasEvent;
    }
}
