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

export class Debugger {
    private static instance: Debugger | null = null;
    private phasesDebug: boolean;
    private constructor() {
        this.phasesDebug = false;
    }

    public static getInstance(): Debugger {
        if (!this.instance) {
            this.instance = new Debugger();
        }
        return this.instance;
    }

    enablePhasesDebug(phasesDebug: boolean = false): void {
        this.phasesDebug = phasesDebug;
    }

    phasesDebugLog(tag: string): void {
        if (!this.phasesDebug) {
            return;
        }
        console.log(tag);
    }
}