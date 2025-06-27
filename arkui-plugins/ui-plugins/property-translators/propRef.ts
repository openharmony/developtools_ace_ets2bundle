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
import { CustomComponentNames } from '../utils';
import {
    generateToRecord,
    createGetter,
    createSetter2,
    generateGetOrSetCall,
    generateThisBacking,
    collectStateManagementTypeImport,
    hasDecorator,
    findCachedMemoMetadata,
    checkIsNameStartWithBackingField,
} from './utils';
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

export class PropRefTranslator extends PropertyTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.PROP_REF_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_PROP_REF;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = true;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    constructor(options: PropertyTranslatorOptions) {
        super(options);
        this.hasWatch = hasDecorator(this.property, DecoratorNames.WATCH);
    }
}

export class PropRefCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.PROP_REF_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_PROP_REF;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = true;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
        this.hasWatch = this.propertyInfo.annotationInfo?.hasWatch;
    }
}

export class PropRefInterfaceTranslator<T extends InterfacePropertyTypes> extends InterfacePropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.PROP_REF;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.name) && hasDecorator(node, DecoratorNames.PROP_REF);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.PROP_REF);
        }
        return false;
    }
}

export class PropRefCachedInterfaceTranslator<
    T extends InterfacePropertyTypes,
> extends InterfacePropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.PROP_REF;

    /**
     * @deprecated
     */
    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInterfacePropertyInfo
    ): node is InterfacePropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasPropRef;
    }
}
