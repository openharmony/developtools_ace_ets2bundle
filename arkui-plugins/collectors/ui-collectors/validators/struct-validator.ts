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
import { CustomComponentInfo } from '../records';
import {
    checkComponentV2Mix,
    checkCustomDialogMissingController,
    checkEntryStructNoExport,
    checkMainPagesEntry,
    checkNoDuplicatePreview,
    checkNoSameAsBuiltInAttribute,
    checkObservedV2TraceUsageValidation,
    checkReusableV2Decorator,
    checkValidateDecoratorTarget,
    checkWatchDecoratorFunction,
    resetMainPagesEntry,
    resetNoDuplicatePreview,
    checkValidateBuildInStruct
} from './rules';

export class StructValidator extends BaseValidator<arkts.ClassDeclaration, CustomComponentInfo> {
    reset(): void {
        super.reset();
        resetMainPagesEntry.bind(this)();
        resetNoDuplicatePreview.bind(this)();
    }

    reportIfViolated(node: arkts.ClassDeclaration): void {
        checkReusableV2Decorator.bind(this)(node);
        checkObservedV2TraceUsageValidation.bind(this)(node);
        checkComponentV2Mix.bind(this)(node);
        checkCustomDialogMissingController.bind(this)(node);
        checkNoSameAsBuiltInAttribute.bind(this)(node);
        checkValidateDecoratorTarget.bind(this)(node);
        checkWatchDecoratorFunction.bind(this)(node);
        checkEntryStructNoExport.bind(this)(node);
        checkMainPagesEntry.bind(this)(node);
        checkNoDuplicatePreview.bind(this)(node);
        checkValidateBuildInStruct.bind(this)(node);
    }
}
