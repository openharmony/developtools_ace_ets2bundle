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
import { CustomComponentNames, optionsHasField } from '../utils';
import {
    generateToRecord,
    createGetter,
    createSetter2,
    generateThisBacking,
    generateGetOrSetCall,
    collectStateManagementTypeImport,
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
import { CustomComponentInterfacePropertyInfo } from '../../collectors/ui-collectors/records';
import { AstNodeCacheValueMetadata, NodeCacheFactory } from '../../common/node-cache';

function initializeStructWithLinkProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: AstNodeCacheValueMetadata
): arkts.Statement | undefined {
    if (!this.stateManagementType || !this.makeType) {
        return undefined;
    }
    const test = factory.createBlockStatementForOptionalExpression(
        arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
        optionsHasField(originalName)
    );
    const args: arkts.Expression[] = [
        arkts.factory.createStringLiteral(originalName),
        arkts.factory.createTSNonNullExpression(
            factory.createNonNullOrOptionalMemberExpression(
                CustomComponentNames.COMPONENT_INITIALIZERS_NAME,
                newName,
                false,
                true
            )
        ),
    ];
    if (this.hasWatch) {
        factory.addWatchFunc(args, this.property);
    }
    collectStateManagementTypeImport(this.stateManagementType);
    collectStateManagementTypeImport(StateManagementTypes.LINK_SOURCE_TYPE);
    const consequent = arkts.BlockStatement.createBlockStatement([
        arkts.factory.createExpressionStatement(
            arkts.factory.createAssignmentExpression(
                generateThisBacking(newName, false, false),
                factory.generateStateMgmtFactoryCall(this.makeType, this.propertyType?.clone(), args, true, metadata),
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
            )
        ),
    ]);
    return arkts.factory.createIfStatement(test, consequent);
}

export class LinkTranslator extends PropertyTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.LINK_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_LINK;
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
        return initializeStructWithLinkProperty.bind(this)(newName, originalName, metadata);
    }
}

export class LinkCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.LINK_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_LINK;
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
        return initializeStructWithLinkProperty.bind(this)(newName, originalName, metadata);
    }
}

export class LinkInterfaceTranslator<T extends InterfacePropertyTypes> extends InterfacePropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.LINK;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.id) && hasDecorator(node, DecoratorNames.LINK);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.LINK);
        }
        return false;
    }
}

export class LinkCachedInterfaceTranslator<
    T extends InterfacePropertyTypes,
> extends InterfacePropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.LINK;

    /**
     * @deprecated
     */
    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInterfacePropertyInfo
    ): node is InterfacePropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasLink;
    }
}
