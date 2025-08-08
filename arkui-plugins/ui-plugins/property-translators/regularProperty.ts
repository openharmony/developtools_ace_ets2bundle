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

import { backingField, expectName } from '../../common/arkts-utils';
import { NodeCacheNames, StateManagementTypes } from '../../common/predefines';
import {
    createGetter,
    generateToRecord,
    generateThisBacking,
    createSetter2,
    isCustomDialogController,
    findCachedMemoMetadata,
} from './utils';
import {
    BasePropertyTranslator,
    InterfacePropertyCachedTranslator,
    InterfacePropertyTranslator,
    InterfacePropertyTypes,
    PropertyCachedTranslator,
    PropertyTranslator,
} from './base';
import { factory } from './factory';
import { PropertyCache } from './cache/propertyCache';
import { factory as UIFactory } from '../ui-factory';
import { CustomComponentNames, optionsHasField } from '../utils';
import { CustomComponentInterfacePropertyInfo } from '../../collectors/ui-collectors/records';
import { PropertyFactoryCallTypeCache } from '../memo-collect-cache';
import { AstNodeCacheValueMetadata, NodeCacheFactory } from '../../common/node-cache';

function initializeStructWithRegularProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string
): arkts.Statement {
    const value = this.property.value ?? arkts.factory.createUndefinedLiteral();
    const binaryItem = arkts.factory.createBinaryExpression(
        factory.createBlockStatementForOptionalExpression(
            arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
            originalName
        ),
        value ?? arkts.factory.createUndefinedLiteral(),
        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
    );
    const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
        generateThisBacking(newName),
        binaryItem,
        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
    );
    return arkts.factory.createExpressionStatement(assign);
}

function initializeStructWithCustomDialogControllerInit(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string
): arkts.Statement {
    const value = this.property.value ?? arkts.factory.createUndefinedLiteral();
    const thisValue: arkts.Expression = generateThisBacking(newName, false, false);
    return arkts.factory.createIfStatement(
        factory.createBlockStatementForOptionalExpression(
            arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
            optionsHasField(originalName)
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
    const thisValue: arkts.Expression = generateThisBacking(newName, false, false);
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
    const returnVale = arkts.factory.createTSAsExpression(thisValue, newType, false);
    if (this.isMemoCached) {
        PropertyFactoryCallTypeCache.getInstance().collect({ node: newType, metadata });
    }
    return returnVale;
}

export class RegularPropertyTranslator extends PropertyTranslator {
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        let initializeStruct: arkts.Statement | undefined;
        if (
            !!this.propertyType &&
            !!this.structInfo.annotations.customdialog &&
            isCustomDialogController(this.propertyType)
        ) {
            initializeStruct = initializeStructWithCustomDialogControllerInit.bind(this)(newName, originalName);
        } else {
            initializeStruct = initializeStructWithRegularProperty.bind(this)(newName, originalName);
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

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        let initializeStruct = initializeStructWithRegularProperty.bind(this)(newName, originalName);
        if (
            !!this.propertyType &&
            !!this.propertyInfo.structInfo?.annotationInfo?.hasCustomDialog &&
            isCustomDialogController(this.propertyType)
        ) {
            initializeStruct = initializeStructWithCustomDialogControllerInit.bind(this)(newName, originalName);
        } else {
            initializeStruct = initializeStructWithRegularProperty.bind(this)(newName, originalName);
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

export class RegularInterfaceTranslator<T extends InterfacePropertyTypes> extends InterfacePropertyTranslator<T> {
    translateProperty(): T {
        return this.property;
    }

    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        return true;
    }
}

export class RegularCachedInterfaceTranslator<
    T extends InterfacePropertyTypes,
> extends InterfacePropertyCachedTranslator<T> {
    translateProperty(): T {
        return this.property;
    }

    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInterfacePropertyInfo
    ): node is InterfacePropertyTypes {
        return true;
    }
}
