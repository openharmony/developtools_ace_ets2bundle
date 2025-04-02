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
exports.KBuffer = void 0;
// todo can be removed if passing ArrayBuffer type through interop is possible
class KBuffer {
    get buffer() {
        return this._buffer;
    }
    get length() {
        return this._buffer.length;
    }
    constructor(length) {
        this._buffer = new Uint8Array(length);
    }
    set(index, value) {
        this._buffer[index] = value;
    }
    get(index) {
        return this._buffer[index];
    }
}
exports.KBuffer = KBuffer;
//# sourceMappingURL=buffer.js.map