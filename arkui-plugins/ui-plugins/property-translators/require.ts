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
import { DecoratorNames, NodeCacheNames, StateManagementTypes } from '../../common/predefines';
import {
    createGetter,
    generateToRecord,
    generateThisBacking,
    createSetter2,
    isCustomDialogController,
    findCachedMemoMetadata,
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
import { factory } from './factory';
import { PropertyCache } from './cache/propertyCache';
import { factory as UIFactory } from '../ui-factory';
// import { CustomComponentNames, hasNullOrUndefinedType, optionsHasField } from '../utils';
import { CustomComponentInnerClassPropertyInfo } from '../../collectors/ui-collectors/records';
import { RegularPropertyCachedTranslator, RegularPropertyTranslator } from './regularProperty';

/**
 * @deprecated
 */
export class RequireTranslator extends RegularPropertyTranslator {
    protected shouldWrapPropertyType: boolean = false;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    constructor(options: PropertyTranslatorOptions) {
        super(options);
        this.initializeOptions = {
            isRequired: true,
            shouldCheckNonNull: false
        }
    }
}

export class RequireCachedTranslator extends RegularPropertyCachedTranslator {
    protected shouldWrapPropertyType: boolean = false;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = true;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = true;

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
        this.initializeOptions = {
            isRequired: true,
            shouldCheckNonNull: false
        }
        this.initializeOptions.canDefinitelyBeNonNull = checkIsPropertyCanBeNonNull(
            this.property,
            this.initializeOptions
        );
    }
}
