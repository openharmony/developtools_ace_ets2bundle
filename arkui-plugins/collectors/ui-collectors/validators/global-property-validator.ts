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
import { GLobalPropertyInfo } from '../records';
import { checkTrackDecorator, checkObservedV2TraceUsageValidation, checkValidateDecoratorTarget } from './rules';

export class GlobalPropertyValidator extends BaseValidator<arkts.ClassProperty, GLobalPropertyInfo> {
    reportIfViolated(node: arkts.ClassProperty): void {
        checkTrackDecorator.bind(this)(node);
        checkObservedV2TraceUsageValidation.bind(this)(node);
        checkValidateDecoratorTarget.bind(this)(node);
    }
}
