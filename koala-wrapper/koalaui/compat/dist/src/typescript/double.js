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
exports.int32BitsFromFloat = exports.float32FromBits = exports.asString = exports.asFloat64 = void 0;
function asFloat64(value) {
    return Number(value);
}
exports.asFloat64 = asFloat64;
function asString(value) {
    return value === null || value === void 0 ? void 0 : value.toString();
}
exports.asString = asString;
function float32FromBits(value) {
    return value;
}
exports.float32FromBits = float32FromBits;
function int32BitsFromFloat(value) {
    return value;
}
exports.int32BitsFromFloat = int32BitsFromFloat;
//# sourceMappingURL=double.js.map