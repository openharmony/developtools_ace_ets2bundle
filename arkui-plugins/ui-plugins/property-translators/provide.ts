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
import { AstNodeCacheValueMetadata, NodeCacheFactory } from '../../common/node-cache';
import { CustomComponentInterfacePropertyInfo } from '../../collectors/ui-collectors/records/struct-interface-property';

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
    const alias: string = options?.alias ?? originalName;
    const allowOverride: boolean = options?.allowOverride ?? false;
    const args: arkts.Expression[] = [
        arkts.factory.createStringLiteral(originalName),
        arkts.factory.createStringLiteral(alias),
        factory.generateInitializeValue(this.property, this.propertyType, originalName),
        arkts.factory.createBooleanLiteral(allowOverride),
    ];
    if (this.hasWatch) {
        factory.addWatchFunc(args, this.property);
    }
    const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
        generateThisBacking(newName),
        factory.generateStateMgmtFactoryCall(this.makeType, this.propertyType?.clone(), args, true, metadata),
        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
    );
    return arkts.factory.createExpressionStatement(assign);
}

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
        this.hasWatch = hasDecorator(this.property, DecoratorNames.WATCH);
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

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
        this.hasWatch = this.propertyInfo.annotationInfo?.hasWatch;
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithProvideProperty.bind(this)(newName, originalName, metadata);
    }
}

export class ProvideInterfaceTranslator<T extends InterfacePropertyTypes> extends InterfacePropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.PROVIDE;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.id) && hasDecorator(node, DecoratorNames.PROVIDE);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.PROVIDE);
        }
        return false;
    }
}

export class ProvideCachedInterfaceTranslator<
    T extends InterfacePropertyTypes,
> extends InterfacePropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.PROVIDE;

    /**
     * @deprecated
     */
    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInterfacePropertyInfo
    ): node is InterfacePropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasProvide;
    }
}
