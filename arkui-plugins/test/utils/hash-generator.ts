/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { randomBytes } from 'crypto';
import { getCommonPath } from '../../path';
const common = require(getCommonPath());
const UniqueId = common.UniqueId;

export class HashGenerator {
    static instance: HashGenerator;

    private constructor() {}

    static getInstance(): HashGenerator {
        if (!this.instance) {
            this.instance = new HashGenerator();
        }

        return this.instance;
    }

    dynamicSha1Id(id: string, length: number = 7): string {
        const uniqId = new UniqueId();
        uniqId.addString('hashId');
        uniqId.addString(id);
        uniqId.addString(randomBytes(length).toString('hex'));
        return uniqId.compute().substring(0, length);
    }

    staticSha1Id(id: string, length: number = 7): string {
        const uniqId = new UniqueId();
        uniqId.addString('hashId');
        uniqId.addString(id);
        return uniqId.compute().substring(0, length);
    }
}
