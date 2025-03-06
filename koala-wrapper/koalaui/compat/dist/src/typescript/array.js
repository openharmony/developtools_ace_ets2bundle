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
exports.int8Array = exports.Array_from_number = exports.Array_from_int32 = exports.Array_from_set = exports.asArray = void 0;
function asArray(value) {
    return value;
}
exports.asArray = asArray;
function Array_from_set(set) {
    return Array.from(set);
}
exports.Array_from_set = Array_from_set;
function Array_from_int32(data) {
    return Array.from(data);
}
exports.Array_from_int32 = Array_from_int32;
function Array_from_number(data) {
    return data;
}
exports.Array_from_number = Array_from_number;
function int8Array(size) {
    return [];
}
exports.int8Array = int8Array;
//# sourceMappingURL=array.js.map