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
import { AstNodeCacheValueMetadata } from '../../common/node-cache';

function initializeStructWithConsumeProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: AstNodeCacheValueMetadata
): arkts.Statement | undefined {
    if (!this.stateManagementType || !this.makeType) {
        return undefined;
    }
    const args: arkts.Expression[] = [
        arkts.factory.createStringLiteral(originalName),
        arkts.factory.createStringLiteral(getValueInAnnotation(this.property, DecoratorNames.CONSUME) ?? originalName),
    ];
    if (this.initializeOptions?.isWatched) {
        factory.addWatchFunc(args, this.property);
    }
    const defaultValue = this.property.value;
    if (!!defaultValue) {
        if (args.length === 2) {
            args.push(arkts.factory.createUndefinedLiteral());
        }
        args.push(arkts.factory.createObjectExpression(
            [arkts.factory.createProperty(
                arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
                arkts.factory.createIdentifier('defaultValue'),
                defaultValue,
                false,
                false
            )]
        ));
        if (this.isMemoShouldUpdate) {
            PropertyValueCache.getInstance().collect({ value: defaultValue });
        }
    }
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
    if (this.isMemoShouldUpdate && !!stateMgmtCallDefaultType) {
        PropertyValueCache.getInstance().collect({ value: stateMgmtCallDefaultType });
    }
    return arkts.factory.createExpressionStatement(assign);
}

function updateStateMethodInInnerClass<T extends InnerClassPropertyTypes>(
    this: InnerClassPropertyTranslator<T>,
    method: arkts.MethodDefinition
): arkts.MethodDefinition {
    const metadata = findCachedMemoMetadata(method);
    return factory.wrapStateManagementTypeToMethodInInnerClass(method, DecoratorNames.CONSUME, metadata);
}

function updateStatePropertyInInnerClass<T extends InnerClassPropertyTypes>(
    this: InnerClassPropertyTranslator<T>,
    property: arkts.ClassProperty
): arkts.ClassProperty {
    return factory.wrapStateManagementTypeToPropertyInInnerClass(property, DecoratorNames.CONSUME);
}

/**
 * @deprecated
 */
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
    protected hasResetOnReuse: boolean = true;

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
        const isWatched = this.propertyInfo.annotationInfo?.hasWatch;
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
        return initializeStructWithConsumeProperty.bind(this)(newName, originalName, metadata);
    }

    resetOnReuse(newName: string, originalName: string): arkts.ExpressionStatement {
        const alias: string = getValueInAnnotation(this.property, DecoratorNames.CONSUME) ?? originalName;
        const args: arkts.Expression[] = [arkts.factory.createStringLiteral(alias)];
        if (this.initializeOptions?.isWatched) {
            const watchStr: string | undefined = getValueInAnnotation(this.property, DecoratorNames.WATCH);
            if (watchStr) {
                args.push(factory.createWatchCallback(watchStr));
            }
        }
        const defaultValue = this.property.value?.clone();
        if (!!defaultValue) {
            if (args.length === 1) {
                args.push(arkts.factory.createUndefinedLiteral());
            }
            args.push(arkts.ObjectExpression.createObjectExpression(
                arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
                [arkts.factory.createProperty(
                    arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
                    arkts.factory.createIdentifier('defaultValue'),
                    defaultValue,
                    false,
                    false
                )],
                true
            ));
        }
        if (this.isMemoShouldUpdate) {
            if (!!defaultValue) {
                const isFunctionValue = arkts.isArrowFunctionExpression(defaultValue);
                PropertyValueCache.getInstance().collect({ value: defaultValue, shouldCache: this.isMemoCached && isFunctionValue });
            }
        }
        return factory.createResetOnReuseStmtWithArgs(newName, args);
    }
}

/**
 * @deprecated
 */
export class ConsumeInnerClassTranslator<T extends InnerClassPropertyTypes> extends InnerClassPropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.CONSUME;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InnerClassPropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.id) && hasDecorator(node, DecoratorNames.CONSUME);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.CONSUME);
        }
        return false;
    }
}

export class ConsumeCachedInnerClassTranslator<
    T extends InnerClassPropertyTypes,
> extends InnerClassPropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.CONSUME;

    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInnerClassPropertyInfo
    ): node is InnerClassPropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasConsume;
    }
}

