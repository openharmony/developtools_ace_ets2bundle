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
import { CallRecordInfo } from './shared-types';
import { CallInfo } from './records';

export class ChainingCallDataSource {
    rootCallInfo: CallRecordInfo | undefined;
    chainingCallInfos: CallInfo[] = [];
    chainingCalls: arkts.CallExpression[] = [];
    private static instance: ChainingCallDataSource;

    private constructor() {
        this.rootCallInfo = undefined;
        this.chainingCallInfos = [];
        this.chainingCalls = [];
    }

    static getInstance(): ChainingCallDataSource {
        if (!this.instance) {
            this.instance = new ChainingCallDataSource();
        }
        return this.instance;
    }

    isWithInChain(): boolean {
        return !!this.rootCallInfo && !!this.chainingCallInfos && this.chainingCallInfos.length > 0;
    }

    setRootCallInfo(rootCallInfo: CallRecordInfo): this {
        if (!this.rootCallInfo) {
            this.rootCallInfo = rootCallInfo;
        }
        return this;
    }

    addChainingCallInfo(call: arkts.CallExpression, chainingCallInfo: CallInfo): this {
        this.chainingCallInfos.push(chainingCallInfo);
        this.chainingCalls.push(call);
        return this;
    }

    reset(): void {
        this.rootCallInfo = undefined;
        this.chainingCallInfos = [];
        this.chainingCalls = [];
    }
}
