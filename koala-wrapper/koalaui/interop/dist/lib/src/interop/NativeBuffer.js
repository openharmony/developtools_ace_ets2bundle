"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeBuffer = void 0;
// stub wrapper for KInteropBuffer
class NativeBuffer extends ArrayBuffer {
    constructor(data, length, resourceId, hold, release) {
        super(length);
        this.data = 0;
        this.length = 0;
        this.resourceId = 0;
        this.hold = 0;
        this.release = 0;
        this.data = data;
        this.length = length;
        this.resourceId = resourceId;
        this.hold = hold;
        this.release = release;
    }
    static wrap(data, length, resourceId, hold, release) {
        return new NativeBuffer(data, length, resourceId, hold, release);
    }
}
exports.NativeBuffer = NativeBuffer;
//# sourceMappingURL=NativeBuffer.js.map