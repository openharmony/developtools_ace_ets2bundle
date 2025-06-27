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
import { CustomComponentInterfacePropertyInfo } from '../../collectors/ui-collectors/records';
import {
    generateToRecord,
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

function initializeStructWithConsumeProperty(
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
        arkts.factory.create1StringLiteral(getValueInAnnotation(this.property, DecoratorNames.CONSUME) ?? originalName),
    ];
    if (this.hasWatch) {
        factory.addWatchFunc(args, this.property);
    }
    const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
        generateThisBacking(newName),
        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
        factory.generateStateMgmtFactoryCall(this.makeType, this.propertyType?.clone(), args, true, metadata)
    );
    return arkts.factory.createExpressionStatement(assign);
}

function updateStateMethodInInterface<T extends InterfacePropertyTypes>(
    this: InterfacePropertyTranslator<T>,
    method: arkts.MethodDefinition
): arkts.MethodDefinition {
    const metadata = findCachedMemoMetadata(method);
    return factory.wrapStateManagementTypeToMethodInInterface(method, DecoratorNames.CONSUME, metadata);
}

function updateStatePropertyInInterface<T extends InterfacePropertyTypes>(
    this: InterfacePropertyTranslator<T>,
    property: arkts.ClassProperty
): arkts.ClassProperty {
    return factory.wrapStateManagementTypeToPropertyInInterface(property, DecoratorNames.CONSUME);
}

export class ConsumeTranslator extends PropertyTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.CONSUME_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_CONSUME;
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
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithConsumeProperty.bind(this)(newName, originalName, metadata);
    }
}

export class ConsumeCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.CONSUME_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_CONSUME;
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
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithConsumeProperty.bind(this)(newName, originalName, metadata);
    }
}

export class ConsumeInterfaceTranslator<T extends InterfacePropertyTypes> extends InterfacePropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.CONSUME;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.name) && hasDecorator(node, DecoratorNames.CONSUME);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.CONSUME);
        }
        return false;
    }
}

export class ConsumeCachedInterfaceTranslator<
    T extends InterfacePropertyTypes,
> extends InterfacePropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.CONSUME;

    /**
     * @deprecated
     */
    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInterfacePropertyInfo
    ): node is InterfacePropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasConsume;
    }
}
