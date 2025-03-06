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
exports.UniqueId = void 0;
const sha1_1 = require("./sha1");
class UniqueId {
    constructor() {
        this.sha = (0, sha1_1.createSha1)();
    }
    addString(data) {
        this.sha.updateString(data);
        return this;
    }
    addI32(data) {
        this.sha.updateInt32(data);
        return this;
    }
    addF32Array(data) {
        this.sha.update(data);
        return this;
    }
    addI32Array(data) {
        this.sha.update(data);
        return this;
    }
    addU32Array(data) {
        this.sha.update(data);
        return this;
    }
    addU8Array(data) {
        this.sha.update(data);
        return this;
    }
    addPtr(data) {
        if (data instanceof Uint32Array) {
            return this.addU32Array(data);
        }
        return this.addI32(data);
    }
    compute() {
        return this.sha.digest("hex");
    }
}
exports.UniqueId = UniqueId;
//# sourceMappingURL=uniqueId.js.map