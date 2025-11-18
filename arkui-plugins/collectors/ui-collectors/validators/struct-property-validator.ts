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
import { BaseValidator } from './base';
import { StructPropertyInfo } from '../records';
import {
    checkComponentComponentV2MixUse,
    checkComponentV2StateUsage,
    checkComputedDecorator,
    checkConsumerProviderDecorator,
    checkEntryLocalStorage,
    checkDecoratedPropertyType,
    checkOldNewDecoratorMixUse,
    checkOnceDecorator,
    checkStructVariableInitialization,
    checkPropertyType,
    checkStructPropertyDecorator,
    checkPropertyModifiers,
    checkRequireDecoratorRegular,
    checkTrackDecorator,
    checkObservedV2TraceUsageValidation,
    checkNoPropLinkObjectlinkInEntry,
    checkMonitorDecorator,
    checkValidateDecoratorTarget,
    checkWatchDecoratorRegular,
    checkStructPropertyOptional,
} from './rules';

export class StructPropertyValidator extends BaseValidator<arkts.ClassProperty, StructPropertyInfo> {
    reportIfViolated(node: arkts.ClassProperty): void {
        const metadata = this.context ?? {};
        if (!metadata.structInfo?.definitionPtr) {
            return;
        }

        checkComponentComponentV2MixUse.bind(this)(node);
        checkComponentV2StateUsage.bind(this)(node);
        checkConsumerProviderDecorator.bind(this)(node);
        checkEntryLocalStorage.bind(this)(node);
        checkDecoratedPropertyType.bind(this)(node);
        checkOldNewDecoratorMixUse.bind(this)(node);
        checkOnceDecorator.bind(this)(node);
        checkStructVariableInitialization.bind(this)(node);
        checkPropertyType.bind(this)(node);
        checkStructPropertyDecorator.bind(this)(node);
        checkPropertyModifiers.bind(this)(node);
        checkRequireDecoratorRegular.bind(this)(node);
        checkTrackDecorator.bind(this)(node);
        checkObservedV2TraceUsageValidation.bind(this)(node);
        checkNoPropLinkObjectlinkInEntry.bind(this)(node);
        checkMonitorDecorator.bind(this)(node);
        checkValidateDecoratorTarget.bind(this)(node);
        checkWatchDecoratorRegular.bind(this)(node);
        checkStructPropertyOptional.bind(this)(node);

        const struct = arkts.classByPeer<arkts.ClassDefinition>(metadata.structInfo.definitionPtr);
        checkComputedDecorator.bind(this)(node, struct);
    }
}
