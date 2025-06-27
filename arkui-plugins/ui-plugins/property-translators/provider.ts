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
    getValueInAnnotation,
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
import { PropertyCache } from './cache/propertyCache';
import { CustomComponentInterfacePropertyInfo } from '../../collectors/ui-collectors/records';

function initializeStructWithProviderProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: arkts.AstNodeCacheValueMetadata
): arkts.Statement | undefined {
    if (!this.stateManagementType || !this.makeType) {
        return undefined;
    }
    const args: arkts.Expression[] = [
        arkts.factory.create1StringLiteral(originalName),
        arkts.factory.create1StringLiteral(
            getValueInAnnotation(this.property, DecoratorNames.PROVIDER) ?? originalName
        ),
        this.property.value!,
    ];
    const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
        generateThisBacking(newName),
        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
        factory.generateStateMgmtFactoryCall(this.makeType, this.propertyType?.clone(), args, true, metadata)
    );
    return arkts.factory.createExpressionStatement(assign);
}

export class ProviderTranslator extends PropertyTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.PROVIDER_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_PROVIDER;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = false;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    constructor(options: PropertyTranslatorOptions) {
        super(options);
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithProviderProperty.bind(this)(newName, originalName, metadata);
    }
}

export class ProviderCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.PROVIDER_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_PROVIDER;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = false;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithProviderProperty.bind(this)(newName, originalName, metadata);
    }
}

export class ProviderInterfaceTranslator<T extends InterfacePropertyTypes> extends InterfacePropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.PROVIDER;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.name) && hasDecorator(node, DecoratorNames.PROVIDER);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.PROVIDER);
        }
        return false;
    }
}

export class ProviderCachedInterfaceTranslator<
    T extends InterfacePropertyTypes,
> extends InterfacePropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.PROVIDER;

    /**
     * @deprecated
     */
    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInterfacePropertyInfo
    ): node is InterfacePropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasProvider;
    }
}
