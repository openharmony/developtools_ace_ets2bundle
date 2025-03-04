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
exports.wasmHeap = exports.withFloat64Array = exports.withFloat32Array = exports.withInt32Array = exports.withUint32Array = exports.withInt16Array = exports.withUint16Array = exports.withInt8Array = exports.withUint8Array = exports.fromPtrArray = exports.toPtrArray = exports.withPtrArray = exports.withStringArray = exports.withString = exports.encodeToData = exports.decodeToString = void 0;
const common_1 = require("@koalaui/common");
const Wrapper_1 = require("./Wrapper");
const encoder = new common_1.CustomTextEncoder();
const decoder = new common_1.CustomTextDecoder();
function decodeToString(array) {
    return decoder.decode(array);
}
exports.decodeToString = decodeToString;
function encodeToData(string) {
    return encoder.encode(string, false);
}
exports.encodeToData = encodeToData;
function withString(data, exec) {
    return exec(data === undefined ? null : data);
}
exports.withString = withString;
function withStringArray(strings, exec) {
    if (strings === undefined || strings.length === 0) {
        return exec(null);
    }
    let array = encoder.encodeArray(strings);
    return exec(array);
}
exports.withStringArray = withStringArray;
function withArray(data, exec) {
    var _a;
    return exec(data !== null && data !== void 0 ? data : null, (_a = data === null || data === void 0 ? void 0 : data.length) !== null && _a !== void 0 ? _a : 0);
}
function withPtrArray(data, access, exec) {
    var _a;
    return exec(data !== null && data !== void 0 ? data : null, (_a = data === null || data === void 0 ? void 0 : data.length) !== null && _a !== void 0 ? _a : 0); // TODO rethink
}
exports.withPtrArray = withPtrArray;
function toPtrArray(data) {
    if (data == undefined || data.length === 0) {
        return new BigUint64Array(0);
    }
    const array = new BigUint64Array(data.length);
    for (let i = 0; i < data.length; i++) {
        let item = data[i];
        array[i] = item != undefined ? item.ptr : Wrapper_1.nullptr;
    }
    return array;
}
exports.toPtrArray = toPtrArray;
function fromPtrArray(array, factory) {
    if (array.length === 0) {
        return new Array(0);
    }
    const result = new Array(array.length);
    for (let i = 0; i < array.length; i++) {
        let ptr = array[i];
        if (ptr == Wrapper_1.nullptr) {
            result[i] = undefined;
        }
        else {
            result[i] = factory(ptr);
        }
    }
    return result;
}
exports.fromPtrArray = fromPtrArray;
function withUint8Array(data, access, exec) {
    return withArray(data, exec);
}
exports.withUint8Array = withUint8Array;
function withInt8Array(data, access, exec) {
    return withArray(data, exec);
}
exports.withInt8Array = withInt8Array;
function withUint16Array(data, access, exec) {
    return withArray(data, exec);
}
exports.withUint16Array = withUint16Array;
function withInt16Array(data, access, exec) {
    return withArray(data, exec);
}
exports.withInt16Array = withInt16Array;
function withUint32Array(data, access, exec) {
    return withArray(data, exec);
}
exports.withUint32Array = withUint32Array;
function withInt32Array(data, access, exec) {
    return withArray(data, exec);
}
exports.withInt32Array = withInt32Array;
function withFloat32Array(data, access, exec) {
    return withArray(data, exec);
}
exports.withFloat32Array = withFloat32Array;
function withFloat64Array(data, access, exec) {
    return withArray(data, exec);
}
exports.withFloat64Array = withFloat64Array;
function wasmHeap() {
    throw new Error("Unused");
}
exports.wasmHeap = wasmHeap;
//# sourceMappingURL=arrays.js.map