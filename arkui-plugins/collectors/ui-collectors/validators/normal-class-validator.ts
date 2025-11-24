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
import { NormalClassInfo } from '../records';
import {
    checkObservedHeritageCompatible,
    checkObservedObservedV2,
    checkObservedV2TraceUsageValidation,
    checkValidateDecoratorTarget,
    checkComponentV2StateUsage,
    checkConsumerProviderDecorator,
} from './rules';

export class NormalClassValidator extends BaseValidator<arkts.ClassDeclaration, NormalClassInfo> {
    reportIfViolated(node: arkts.ClassDeclaration): void {
        const metadata = this.context ?? {};
        if (!!metadata.isETSGlobal) {
            reportInETSGlobalClass.bind(this)(node, metadata);
            return;
        }
        reportInNormalClass.bind(this)(node, metadata);
    }
}

/**
 * 只处理ETSGLOBAL ClassDeclaration
 */
function reportInETSGlobalClass(
    this: NormalClassValidator,
    node: arkts.ClassDeclaration,
    metadata: NormalClassInfo
): void {
}

/**
 * 只处理用户定义的 ClassDeclaration
 */
function reportInNormalClass(
    this: NormalClassValidator,
    node: arkts.ClassDeclaration,
    metadata: NormalClassInfo
): void {
    checkObservedObservedV2.bind(this)(node);
    checkObservedV2TraceUsageValidation.bind(this)(node);
    checkObservedHeritageCompatible.bind(this)(node);
    checkValidateDecoratorTarget.bind(this)(node);
    checkComponentV2StateUsage.bind(this)(node);
    checkConsumerProviderDecorator.bind(this)(node);
}
