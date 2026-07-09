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
import { CustomComponentNames, DecoratorNames, GetSetTypes, NodeCacheNames, StateManagementTypes } from '../../common/predefines';
// import { CustomComponentNames } from '../utils';
import {
    checkIsNameStartWithBackingField,
    checkIsPropertyCanBeNonNull,
    createGetter,
    findCachedMemoMetadata,
    generateGetOrSetCall,
    generateThisBacking,
    generateToRecord,
    hasDecorator,
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

function initializeStructWithObjectLinkProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: AstNodeCacheValueMetadata
): arkts.Statement | undefined {
    if (!this.stateManagementType || !this.makeType || !this.propertyType) {
        return undefined;
    }
    const initializerPropertyType = this.propertyType.clone();
    const initializers = arkts.factory.createTSAsExpression(
        factory.createBlockStatementForOptionalExpression(
            arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
            originalName,
            { isNonNull: true }
        ),
        initializerPropertyType,
        false
    );
    const args: arkts.Expression[] = [arkts.factory.createStringLiteral(originalName), initializers];
    if (this.initializeOptions?.isWatched) {
        factory.addWatchFunc(args, this.property);
    }
    const stateMgmtCallDefaultType = this.propertyType?.clone();
    const stateMgmtCallType = factory.createStateManagementFactoryGenericType(
        this.property.value, 
        stateMgmtCallDefaultType,
        this.initializeOptions
    );
    if (this.isMemoShouldUpdate) {
        if (!!initializerPropertyType) {
            PropertyValueCache.getInstance().collect({ value: initializerPropertyType });
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
export class ObjectLinkTranslator extends PropertyTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.OBJECT_LINK_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_OBJECT_LINK;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = true;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = false;

    constructor(options: PropertyTranslatorOptions) {
        super(options);
        const isWatched = hasDecorator(this.property, DecoratorNames.WATCH);
        this.initializeOptions = {
            isWatched,
            shouldCheckNonNull: true
        };
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithObjectLinkProperty.bind(this)(newName, originalName, metadata);
    }
}

export class ObjectLinkCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.OBJECT_LINK_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_OBJECT_LINK;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = true;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = false;
    protected hasResetOnReuse: boolean = true;

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
        const isWatched = this.propertyInfo.annotationInfo?.hasWatch;
        this.initializeOptions = {
            isWatched,
            shouldCheckNonNull: true
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
        return initializeStructWithObjectLinkProperty.bind(this)(newName, originalName, metadata);
    }

    resetOnReuse(newName: string, originalName: string): arkts.ExpressionStatement {
        const propertyType = this.propertyType?.clone();
        const initializerAccess = factory.createNonNullOrOptionalMemberExpression(
            CustomComponentNames.COMPONENT_INITIALIZERS_NAME,
            originalName,
            false,
            true
        );
        const arg = propertyType
            ? arkts.factory.createTSAsExpression(initializerAccess, propertyType, false)
            : initializerAccess;
        return factory.createResetOnReuseStmt(newName, arg);
    }
}

/**
 * @deprecated
 */
export class ObjectLinkInnerClassTranslator<T extends InnerClassPropertyTypes> extends InnerClassPropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.OBJECT_LINK;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InnerClassPropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.id) && hasDecorator(node, DecoratorNames.OBJECT_LINK);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.OBJECT_LINK);
        }
        return false;
    }
}

export class ObjectLinkCachedInnerClassTranslator<
    T extends InnerClassPropertyTypes,
> extends InnerClassPropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.OBJECT_LINK;

    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInnerClassPropertyInfo
    ): node is InnerClassPropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasObjectLink;
    }
}
