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
import { DecoratorNames, NodeCacheNames, StateManagementTypes } from '../../common/predefines';
import { hasDecorator, findCachedMemoMetadata, checkIsNameStartWithBackingField } from './utils';
import {
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

export class StateTranslator extends PropertyTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.STATE_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_STATE;
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
}

export class StateCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.STATE_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_STATE;
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
}

export class StateInterfaceTranslator<T extends InterfacePropertyTypes> extends InterfacePropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.STATE;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.id) && hasDecorator(node, DecoratorNames.STATE);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.STATE);
        }
        return false;
    }
}

export class StateCachedInterfaceTranslator<
    T extends InterfacePropertyTypes,
> extends InterfacePropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.STATE;

    /**
     * @deprecated
     */
    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInterfacePropertyInfo
    ): node is InterfacePropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasState;
    }
}
