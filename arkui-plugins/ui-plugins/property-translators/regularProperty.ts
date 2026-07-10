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

import {
    createGetter,
    generateToRecord,
    generateThisBacking,
    createSetter2,
    isCustomDialogController,
    findCachedMemoMetadata,
    canCastTypeFromValue,
    checkIsPropertyCanBeNonNull,
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
import { backingField, expectName, flatVisitMethodWithOverloads } from '../../common/arkts-utils';
import { CustomComponentNames, NodeCacheNames, StateManagementTypes } from '../../common/predefines';
import { factory } from './factory';
import { PropertyCache } from './cache/propertyCache';
import { factory as UIFactory } from '../ui-factory';
import { optionsHasField } from '../utils';
import { CustomComponentInnerClassPropertyInfo } from '../../collectors/ui-collectors/records';
import { PropertyFactoryCallTypeCache, PropertyValueCache } from '../memo-collect-cache';
import { AstNodeCacheValueMetadata, NodeCacheFactory } from '../../common/node-cache';
import { GenSymGenerator } from '../../common/gensym-generator';

function initializeStructWithRegularProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: arkts.AstNodeCacheValueMetadata
): arkts.Statement {
    const propertyValue = this.property.value;
    const propertyType = this.property.typeAnnotation;
    let right: arkts.Expression;
    if (this.initializeOptions?.shouldCheckNonNull) {
        const id: string = GenSymGenerator.getInstance().id(originalName);
        const optionsType: arkts.TypeNode | undefined = propertyType?.clone();
        const optionsValue: arkts.Expression = factory.generateDefiniteInitializers(optionsType, originalName);
        const canCastType: boolean = canCastTypeFromValue(propertyValue);
        const defaultType: arkts.TypeNode | undefined = canCastType && !!propertyType ? propertyType.clone() : undefined;
        const defaultRawValue: arkts.Expression = !!propertyValue ? propertyValue : arkts.factory.createUndefinedLiteral();
        const defaultValue: arkts.Expression = !!defaultType
            ? arkts.factory.createTSAsExpression(defaultRawValue, defaultType, false)
            : defaultRawValue;
        if (this.isMemoCached) {
            if (!!optionsType) {
                PropertyValueCache.getInstance().collect({ value: optionsType, shouldCache: this.isMemoCached, metadata });
            }
            if (!!defaultType) {
                PropertyValueCache.getInstance().collect({ value: defaultType, shouldCache: this.isMemoCached, metadata });
            }
        }
        right = arkts.factory.createConditionalExpression(
            factory.createBlockStatementForOptionsHasMemberExpression(
                arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
                id,
                originalName
            ), 
            optionsValue, 
            defaultValue
        );
    } else if (this.initializeOptions?.isRequired || !propertyType) {
        right = factory.generateDefiniteInitializers(propertyType, originalName);
    } else {
        right = arkts.factory.createBinaryExpression(
            factory.createBlockStatementForOptionalExpression(
                arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
                originalName,
                { isNonNull: this.initializeOptions?.isRequired }
            ),
            propertyValue ?? arkts.factory.createUndefinedLiteral(),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
        )
    }
    const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
        generateThisBacking(newName),
        right,
        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
    );
    if (this.isMemoShouldUpdate) {
        if (!!propertyValue) {
            PropertyValueCache.getInstance().collect({ value: propertyValue });
        }
    }
    return arkts.factory.createExpressionStatement(assign);
}

function initializeStructWithCustomDialogControllerInit(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string
): arkts.Statement {
    const propertyValue = this.property.value;
    const value = propertyValue ?? arkts.factory.createUndefinedLiteral();
    const thisValue: arkts.Expression = generateThisBacking(newName, false, false);
    if (this.isMemoShouldUpdate) {
        if (!!propertyValue) {
            PropertyValueCache.getInstance().collect({ value: propertyValue });
        }
    }
    return arkts.factory.createIfStatement(
        factory.createBlockStatementForOptionalExpression(
            arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
            optionsHasField(originalName),
            { isNonNull: this.initializeOptions?.isRequired }
        ),
        arkts.factory.createBlockStatement([
            arkts.factory.createExpressionStatement(
                arkts.factory.createAssignmentExpression(
                    thisValue,
                    UIFactory.generateMemberExpression(
                        arkts.factory.createTSNonNullExpression(
                            arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME)
                        ),
                        originalName
                    ),
                    arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
                ),
            ),
        ]),
        arkts.factory.createBlockStatement([
            arkts.factory.createIfStatement(
                arkts.factory.createUnaryExpression(
                    thisValue,
                    arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_EXCLAMATION_MARK
                ),
                arkts.factory.createExpressionStatement(
                    arkts.factory.createAssignmentExpression(
                        thisValue,
                        value,
                        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
                    )
                )
            ),
        ])
    );
}

function getterWithRegularProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: AstNodeCacheValueMetadata
): arkts.MethodDefinition {
    let thisValue: arkts.Expression = generateThisBacking(newName, false, false);
    if (this.initializeOptions?.isRequired) {
        thisValue = arkts.factory.createTSNonNullExpression(thisValue);
    }
    const getter: arkts.MethodDefinition = createGetter(
        originalName,
        this.propertyType,
        getGetterReturnValue.bind(this)(thisValue, metadata),
        this.isMemoCached,
        false,
        metadata
    );
    if (this.isMemoCached) {
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(getter, metadata);
    }
    return getter;
}

function setterWithRegularProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: AstNodeCacheValueMetadata
): arkts.MethodDefinition {
    const thisValue: arkts.Expression = generateThisBacking(newName, false, false);
    const thisSet: arkts.ExpressionStatement = arkts.factory.createExpressionStatement(
        arkts.factory.createAssignmentExpression(
            thisValue,
            arkts.factory.createIdentifier('value'),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
        )
    );
    const setter: arkts.MethodDefinition = createSetter2(originalName, this.propertyType, thisSet);
    if (this.isMemoCached) {
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(setter, metadata);
    }
    return setter;
}

function getGetterReturnValue(
    this: BasePropertyTranslator,
    thisValue: arkts.Expression,
    metadata?: AstNodeCacheValueMetadata
): arkts.Expression {
    if (!this.propertyType) {
        return thisValue;
    }
    const newType = this.propertyType.clone();
    const returnValue = arkts.factory.createTSAsExpression(thisValue, newType, false);
    if (this.isMemoCached) {
        PropertyFactoryCallTypeCache.getInstance().collect({ node: newType, metadata });
    }
    return returnValue;
}

/**
 * @deprecated
 */
export class RegularPropertyTranslator extends PropertyTranslator {
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    constructor(options: PropertyTranslatorOptions) {
        super(options);
        this.initializeOptions = {
            shouldCheckNonNull: true
        }
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        let initializeStruct: arkts.Statement | undefined;
        if (
            !!this.propertyType &&
            !!this.structInfo.annotations.customDialog &&
            isCustomDialogController(this.propertyType)
        ) {
            initializeStruct = initializeStructWithCustomDialogControllerInit.bind(this)(newName, originalName);
        } else {
            initializeStruct = initializeStructWithRegularProperty.bind(this)(newName, originalName, metadata);
        }
        return initializeStruct;
    }

    getter(newName: string, originalName: string, metadata?: AstNodeCacheValueMetadata): arkts.MethodDefinition {
        return getterWithRegularProperty.bind(this)(newName, originalName, metadata);
    }

    setter(newName: string, originalName: string, metadata?: AstNodeCacheValueMetadata): arkts.MethodDefinition {
        return setterWithRegularProperty.bind(this)(newName, originalName, metadata);
    }
}

export class RegularPropertyCachedTranslator extends PropertyCachedTranslator {
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
        this.initializeOptions = {
            shouldCheckNonNull: !this.propertyInfo.structInfo?.annotationInfo?.hasComponentV2
        }
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
        let initializeStruct: arkts.Statement | undefined;
        if (
            !!this.propertyType &&
            !!this.propertyInfo.structInfo?.annotationInfo?.hasCustomDialog &&
            isCustomDialogController(this.propertyType)
        ) {
            initializeStruct = initializeStructWithCustomDialogControllerInit.bind(this)(newName, originalName);
        } else {
            initializeStruct = initializeStructWithRegularProperty.bind(this)(newName, originalName, metadata);
        }
        return initializeStruct;
    }

    getter(newName: string, originalName: string, metadata?: AstNodeCacheValueMetadata): arkts.MethodDefinition {
        return getterWithRegularProperty.bind(this)(newName, originalName, metadata);
    }

    setter(newName: string, originalName: string, metadata?: AstNodeCacheValueMetadata): arkts.MethodDefinition {
        return setterWithRegularProperty.bind(this)(newName, originalName, metadata);
    }
}

/**
 * @deprecated
 */
export class RegularInnerClassTranslator<T extends InnerClassPropertyTypes> extends InnerClassPropertyTranslator<T> {
    translateProperty(): T {
        return this.property;
    }

    static canBeTranslated(node: arkts.AstNode): node is InnerClassPropertyTypes {
        return true;
    }
}

export class RegularCachedInnerClassTranslator<
    T extends InnerClassPropertyTypes,
> extends InnerClassPropertyCachedTranslator<T> {
    translateProperty(): T {
        return this.property;
    }

    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInnerClassPropertyInfo
    ): node is InnerClassPropertyTypes {
        return true;
    }
}
