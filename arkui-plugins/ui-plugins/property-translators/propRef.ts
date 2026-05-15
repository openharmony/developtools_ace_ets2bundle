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
    generateToRecord,
    createGetter,
    createSetter2,
    generateGetOrSetCall,
    generateThisBacking,
    collectStateManagementTypeImport,
    hasDecorator,
    findCachedMemoMetadata,
    checkIsNameStartWithBackingField,
} from './utils';
import {
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
import { CustomComponentInnerClassPropertyInfo } from '../../collectors/ui-collectors/records';

/**
 * @deprecated
 */
export class PropRefTranslator extends PropertyTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.PROP_REF_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_PROP_REF;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = true;
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
            shouldCheckNonNull: !isRequired
        }
    }
}

export class PropRefCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.PROP_REF_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_PROP_REF;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = true;
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
            shouldCheckNonNull: !isRequired
        };
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
export class PropRefInnerClassTranslator<T extends InnerClassPropertyTypes> extends InnerClassPropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.PROP_REF;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InnerClassPropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.id) && hasDecorator(node, DecoratorNames.PROP_REF);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.PROP_REF);
        }
        return false;
    }
}

export class PropRefCachedInnerClassTranslator<
    T extends InnerClassPropertyTypes,
> extends InnerClassPropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.PROP_REF;

    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInnerClassPropertyInfo
    ): node is InnerClassPropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasPropRef;
    }
}
