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

export class ConditionBreakCache {
    private _shouldBreak: boolean;
    private _shouldReturn: boolean;
    private _shouldContinue: boolean;
    private static instance: ConditionBreakCache | null = null;

    private constructor() {
        this._shouldBreak = false;
        this._shouldReturn = false;
        this._shouldContinue = false;
    }

    static getInstance(): ConditionBreakCache {
        if (!this.instance) {
            this.instance = new ConditionBreakCache();
        }
        return this.instance;
    }

    get shouldBreak(): boolean {
        return this._shouldBreak;
    }

    get shouldReturn(): boolean {
        return this._shouldReturn;
    }

    get shouldContinue(): boolean {
        return this._shouldContinue;
    }

    collectBreak(): void {
        if (this._shouldBreak) {
            return;
        }
        this._shouldBreak = true;
    }

    collectReturn(): void {
        if (this._shouldReturn) {
            return;
        }
        this._shouldReturn = true;
    }

    collectContinue(): void {
        if (this._shouldContinue) {
            return;
        }
        this._shouldContinue = true;
    }

    collect(st: arkts.AstNode): boolean {
        if (arkts.isBreakStatement(st)) {
            this.collectBreak();
            return true;
        }
        if (arkts.isReturnStatement(st)) {
            this.collectReturn();
            return true;
        }
        if (arkts.isContinueStatement(st)) {
            this.collectContinue();
            return true;
        }
        return false;
    }

    reset(): void {
        this._shouldBreak = false;
        this._shouldReturn = false;
        this._shouldContinue = false;
    }
}
