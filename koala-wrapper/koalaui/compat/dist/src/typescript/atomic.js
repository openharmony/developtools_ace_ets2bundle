"use strict";
/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomicRef = void 0;
/**
 * A reference that may be updated atomically.
 */
class AtomicRef {
    /**
     * Creates a new reference object with the given initial value.
     * @param value - the new value
     */
    constructor(value) {
        this.value = value;
    }
    /**
     * Atomically sets the reference value to the given value and returns the previous one.
     * @param value - the new value
     * @returns the previous value
     */
    getAndSet(value) {
        const result = this.value;
        this.value = value;
        return result;
    }
}
exports.AtomicRef = AtomicRef;
//# sourceMappingURL=atomic.js.map