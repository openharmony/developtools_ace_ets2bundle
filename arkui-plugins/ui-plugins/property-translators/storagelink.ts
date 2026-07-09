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

import { DecoratorNames, StateManagementTypes } from '../../common/predefines';
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
import {
    generateThisBacking,
    collectStateManagementTypeImport,
    hasDecorator,
    getValueInAnnotation,
    checkIsNameStartWithBackingField,
    checkIsPropertyCanBeNonNull,
} from './utils';
import { factory } from './factory';
import { PropertyCache } from './cache/propertyCache';
import { CustomComponentInnerClassPropertyInfo } from '../../collectors/ui-collectors/records';
import { PropertyValueCache } from '../memo-collect-cache';
import { AstNodeCacheValueMetadata } from '../../common/node-cache';

function initializeStructWithStorageLinkProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: AstNodeCacheValueMetadata
): arkts.Statement | undefined {
    if (!this.stateManagementType || !this.makeType) {
        return undefined;
    }
    const storageLinkValueStr: string | undefined = getValueInAnnotation(this.property, DecoratorNames.STORAGE_LINK);
    if (!storageLinkValueStr) {
        return undefined;
    }
    const defaultValue = this.property.value;
    const args: arkts.Expression[] = [
        arkts.factory.createStringLiteral(storageLinkValueStr),
        arkts.factory.createStringLiteral(originalName),
        defaultValue ?? arkts.factory.createUndefinedLiteral(),
    ];
    if (this.initializeOptions?.isWatched) {
        factory.addWatchFunc(args, this.property);
    }
    collectStateManagementTypeImport(this.stateManagementType);
    const stateMgmtCallDefaultType = this.propertyType?.clone();
    const stateMgmtCallType = factory.createStateManagementFactoryGenericType(
        defaultValue, 
        stateMgmtCallDefaultType,
        this.initializeOptions
    );
    if (this.isMemoShouldUpdate) {
        if (!!defaultValue) {
            PropertyValueCache.getInstance().collect({ value: defaultValue });
        }
        if (!!stateMgmtCallDefaultType) {
            PropertyValueCache.getInstance().collect({ value: stateMgmtCallDefaultType });
        }
    }
    return arkts.factory.createExpressionStatement(
        arkts.factory.createAssignmentExpression(
            generateThisBacking(newName),
            factory.generateStateMgmtFactoryCall(this.makeType, stateMgmtCallType, args, true, metadata),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
        )
    );
}

/**
 * @deprecated
 */
export class StorageLinkTranslator extends PropertyTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.STORAGE_LINK_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_STORAGE_LINK;
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
        this.initializeOptions = {
            isWatched,
            shouldCheckNonNull: false
        };
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithStorageLinkProperty.bind(this)(newName, originalName, metadata);
    }
}

export class StorageLinkCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.STORAGE_LINK_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_STORAGE_LINK;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
        const isWatched = this.propertyInfo.annotationInfo?.hasWatch;
        this.initializeOptions = {
            isWatched,
            shouldCheckNonNull: false
        };
        this.initializeOptions.canDefinitelyBeNonNull = checkIsPropertyCanBeNonNull(
            this.property,
            this.initializeOptions
        );
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithStorageLinkProperty.bind(this)(newName, originalName, metadata);
    }
}

/**
 * @deprecated
 */
export class StorageLinkInnerClassTranslator<T extends InnerClassPropertyTypes> extends InnerClassPropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.STORAGE_LINK;
    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InnerClassPropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.id) && hasDecorator(node, DecoratorNames.STORAGE_LINK);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.STORAGE_LINK);
        }
        return false;
    }
}

export class StorageLinkCachedInnerClassTranslator<
    T extends InnerClassPropertyTypes,
> extends InnerClassPropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.STORAGE_LINK;

    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInnerClassPropertyInfo
    ): node is InnerClassPropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasStorageLink;
    }
}
