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

import { Validator } from './base';
import { clearValidatorCache, getOrPut } from './cache';

export class ValidatorBuilder {
    static shouldSkip: boolean = false;

    static build(Validator: { name: string; new (): Validator }): Validator {
        return getOrPut(Validator.name, () => new Validator(), this.shouldSkip);
    }

    static reset(): void {
        this.shouldSkip = false;
        clearValidatorCache();
    }
}
