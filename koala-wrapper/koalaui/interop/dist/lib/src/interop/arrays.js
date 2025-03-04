"use strict";
/*
 * Copyright (c) 2022-2024 Huawei Device Co., Ltd.
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
exports.isWrite = exports.isRead = exports.Access = void 0;
var Access;
(function (Access) {
    Access[Access["READ"] = 1] = "READ";
    Access[Access["WRITE"] = 2] = "WRITE";
    Access[Access["READWRITE"] = 3] = "READWRITE";
})(Access = exports.Access || (exports.Access = {}));
function isRead(access) {
    return access & Access.READ;
}
exports.isRead = isRead;
function isWrite(access) {
    return access & Access.WRITE;
}
exports.isWrite = isWrite;
//# sourceMappingURL=arrays.js.map