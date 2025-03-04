"use strict";
/*
 * Copyright (c) 2022-2023 Huawei Device Co., Ltd.
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
exports.bitsToPtr = exports.ptrToBits = exports.isSamePtr = exports.ptrToString = exports.isNullPtr = exports.nullptr = void 0;
exports.nullptr = BigInt(0);
function isNullPtr(value) {
    return value === exports.nullptr;
}
exports.isNullPtr = isNullPtr;
function ptrToString(ptr) {
    return `0x${ptr.toString(16).padStart(8, "0")}`;
}
exports.ptrToString = ptrToString;
function isSamePtr(a, b) {
    return (a === b);
}
exports.isSamePtr = isSamePtr;
// TODO rethink me
function ptrToBits(ptr) {
    let result = new Uint32Array(2);
    let ptrBigInt = ptr;
    result[0] = Number(ptrBigInt & BigInt(0xFFFFFFFF));
    result[1] = Number((ptrBigInt >> BigInt(32)) & BigInt(0xFFFFFFFF));
    return result;
}
exports.ptrToBits = ptrToBits;
function bitsToPtr(array, offset) {
    let ptrBigInt = BigInt(array[offset + 1]) & BigInt(0xFFFFFFFF);
    ptrBigInt = (ptrBigInt << BigInt(32)) | (BigInt(array[offset]) & BigInt(0xFFFFFFFF));
    return ptrBigInt;
}
exports.bitsToPtr = bitsToPtr;
//# sourceMappingURL=Wrapper.js.map