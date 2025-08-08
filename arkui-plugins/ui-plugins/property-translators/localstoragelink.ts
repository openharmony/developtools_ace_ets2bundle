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
    BasePropertyTranslator,
    InterfacePropertyCachedTranslator,
    InterfacePropertyTranslator,
    InterfacePropertyTypes,
    PropertyCachedTranslator,
    PropertyCachedTranslatorOptions,
    PropertyTranslator,
    PropertyTranslatorOptions,
} from './base';
import {
    generateToRecord,
    createGetter,
    createSetter2,
    generateThisBacking,
    generateGetOrSetCall,
    collectStateManagementTypeImport,
    hasDecorator,
    getValueInAnnotation,
    findCachedMemoMetadata,
    checkIsNameStartWithBackingField,
} from './utils';
import { factory } from './factory';
import { PropertyCache } from './cache/propertyCache';
import { CustomComponentInterfacePropertyInfo } from '../../collectors/ui-collectors/records';
import { AstNodeCacheValueMetadata, NodeCacheFactory } from '../../common/node-cache';

function initializeStructWithLocalStorageLinkProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: AstNodeCacheValueMetadata
): arkts.Statement | undefined {
    if (!this.stateManagementType || !this.makeType) {
        return undefined;
    }
    const localStorageLinkValueStr: string | undefined = getValueInAnnotation(
        this.property,
        DecoratorNames.LOCAL_STORAGE_LINK
    );
    if (!localStorageLinkValueStr) {
        return undefined;
    }
    const args: arkts.Expression[] = [
        arkts.factory.createStringLiteral(localStorageLinkValueStr),
        arkts.factory.createStringLiteral(originalName),
        this.property.value ?? arkts.factory.createUndefinedLiteral(),
    ];
    if (this.hasWatch) {
        factory.addWatchFunc(args, this.property);
    }
    collectStateManagementTypeImport(this.stateManagementType);
    return arkts.factory.createExpressionStatement(
        arkts.factory.createAssignmentExpression(
            generateThisBacking(newName),
            factory.generateStateMgmtFactoryCall(this.makeType, this.propertyType?.clone(), args, true, metadata),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
        )
    );
}

export class LocalStorageLinkTranslator extends PropertyTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.LOCAL_STORAGE_LINK_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_LOCAL_STORAGE_LINK;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    constructor(options: PropertyTranslatorOptions) {
        super(options);
        this.hasWatch = hasDecorator(this.property, DecoratorNames.WATCH);
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithLocalStorageLinkProperty.bind(this)(newName, originalName, metadata);
    }
}

export class LocalStorageLinkCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.LOCAL_STORAGE_LINK_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_LOCAL_STORAGE_LINK;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
        this.hasWatch = this.propertyInfo.annotationInfo?.hasWatch;
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithLocalStorageLinkProperty.bind(this)(newName, originalName, metadata);
    }
}

export class LocalStorageLinkInterfaceTranslator<
    T extends InterfacePropertyTypes,
> extends InterfacePropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.LOCAL_STORAGE_LINK;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.id) && hasDecorator(node, DecoratorNames.LOCAL_STORAGE_LINK);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.LOCAL_STORAGE_LINK);
        }
        return false;
    }
}

export class LocalStorageLinkCachedInterfaceTranslator<
    T extends InterfacePropertyTypes,
> extends InterfacePropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.LOCAL_STORAGE_LINK;

    /**
     * @deprecated
     */
    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInterfacePropertyInfo
    ): node is InterfacePropertyTypes {
        return (
            !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasLocalStorageLink
        );
    }
}
