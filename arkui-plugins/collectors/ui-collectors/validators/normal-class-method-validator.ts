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
import { NormalClassMethodInfo } from '../records';
import {
    checkStructPropertyDecorator,
    checkTrackDecorator,
    checkComponentV2StateUsage,
} from './rules';

export class NormalClassMethodValidator extends BaseValidator<arkts.MethodDefinition, NormalClassMethodInfo> {
    reportIfViolated(node: arkts.MethodDefinition): void {
        const metadata = this.context ?? {};
        if (!metadata.classInfo?.definitionPtr) {
            return;
        }

        checkTrackDecorator.bind(this)(node);
        checkStructPropertyDecorator.bind(this)(node);
        checkComponentV2StateUsage.bind(this)(node);
    }
}
