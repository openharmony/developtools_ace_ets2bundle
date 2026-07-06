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

function resetOnReuseWithOnceProperty(
    this: BasePropertyTranslator,
    newName: string, 
    originalName: string,
    metadata?: arkts.AstNodeCacheValueMetadata
): arkts.ExpressionStatement {
    const propertyValue = this.property.value?.clone();
    const propertyType = this.propertyType?.clone();
    const arg = factory.generateInitializeValue(
        propertyValue, 
        propertyType, 
        originalName, 
        this.initializeOptions,
        this.isMemoCached,
        metadata
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
    return factory.createResetOnReuseStmt(newName, arg);
}

/**
 * @deprecated
 */
export class OnceTranslator extends PropertyTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.ONCE_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_PARAM_ONCE;
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
            shouldCheckNonNull: true
        };
    }

    resetOnReuse(
        newName: string, 
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.ExpressionStatement {
        return resetOnReuseWithOnceProperty.bind(this)(newName, originalName, metadata);
    }
}

export class OnceCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.ONCE_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_PARAM_ONCE;
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
            shouldCheckNonNull: true
        };
    }

    resetOnReuse(
        newName: string, 
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.ExpressionStatement {
        return resetOnReuseWithOnceProperty.bind(this)(newName, originalName, metadata);
    }
}

/**
 * @deprecated
 */
export class OnceInnerClassTranslator<T extends InnerClassPropertyTypes> extends InnerClassPropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.ONCE;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InnerClassPropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.id) && hasDecorator(node, DecoratorNames.ONCE);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.ONCE);
        }
        return false;
    }
}

export class OnceCachedInnerClassTranslator<
    T extends InnerClassPropertyTypes,
> extends InnerClassPropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.ONCE;

    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInnerClassPropertyInfo
    ): node is InnerClassPropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasOnce;
    }
}
