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
exports.wasmHeap = exports.withFloat64Array = exports.withFloat32Array = exports.withInt32Array = exports.withUint32Array = exports.withInt16Array = exports.withUint16Array = exports.withInt8Array = exports.withUint8Array = exports.fromPtrArray = exports.toPtrArray = exports.withPtrArray = exports.withStringArray = exports.withString = exports.encodeToData = exports.decodeToString = void 0;
const common_1 = require("@koalaui/common");
const arrays_1 = require("../../interop/arrays");
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
const nullptr = 0;
// with string as array of utf8 data headed by length
function withString(data, exec) {
    if (data === undefined)
        return exec(nullptr);
    let array = encoder.encode(data, true);
    return withUint8Array(array, arrays_1.Access.READ, exec);
}
exports.withString = withString;
function withStringArray(strings, exec) {
    if (strings === undefined || strings.length === 0) {
        return exec(nullptr);
    }
    let array = encoder.encodeArray(strings);
    return withUint8Array(array, arrays_1.Access.READ, exec);
}
exports.withStringArray = withStringArray;
function withArray(data, access, exec, bytesPerElement, ctor) {
    if (data === undefined || data.length === 0) {
        return exec(nullptr, 0);
    }
    let ptr = _malloc(data.length * bytesPerElement);
    let wasmArray = ctor(ptr, data.length);
    if ((0, arrays_1.isRead)(access)) {
        wasmArray.set(data);
    }
    let result = exec(ptr, data.length);
    if ((0, arrays_1.isWrite)(access)) {
        data.set(wasmArray);
    }
    _free(ptr);
    return result;
}
function withPtrArray(data, access, exec) {
    return withArray(data, access, exec, Uint32Array.BYTES_PER_ELEMENT, (ptr, length) => {
        return new Uint32Array(_heaps.HEAPU8().buffer, ptr, length);
    });
}
exports.withPtrArray = withPtrArray;
function toPtrArray(data) {
    var _a;
    if (data === undefined || data.length === 0) {
        return new Uint32Array(0);
    }
    const array = new Uint32Array(data.length);
    for (let i = 0; i < data.length; i++) {
        array[i] = (_a = data[i]) === null || _a === void 0 ? void 0 : _a.ptr;
    }
    return array;
}
exports.toPtrArray = toPtrArray;
function fromPtrArray(array, factory) {
    const result = new Array(array.length);
    for (let i = 0; i < array.length; i++) {
        let v = array[i];
        if (v == 0) {
            result[i] = undefined;
        }
        else {
            result[i] = factory(v);
        }
    }
    return result;
}
exports.fromPtrArray = fromPtrArray;
function withUint8Array(data, access, exec) {
    return withArray(data, access, exec, Uint8Array.BYTES_PER_ELEMENT, (ptr, length) => {
        return new Uint8Array(_heaps.HEAPU8().buffer, ptr, length);
    });
}
exports.withUint8Array = withUint8Array;
function withInt8Array(data, access, exec) {
    return withArray(data, access, exec, Int8Array.BYTES_PER_ELEMENT, (ptr, length) => {
        return new Int8Array(_heaps.HEAPU8().buffer, ptr, length);
    });
}
exports.withInt8Array = withInt8Array;
function withUint16Array(data, access, exec) {
    return withArray(data, access, exec, Uint16Array.BYTES_PER_ELEMENT, (ptr, length) => {
        return new Uint16Array(_heaps.HEAPU8().buffer, ptr, length);
    });
}
exports.withUint16Array = withUint16Array;
function withInt16Array(data, access, exec) {
    return withArray(data, access, exec, Int16Array.BYTES_PER_ELEMENT, (ptr, length) => {
        return new Int16Array(_heaps.HEAPU8().buffer, ptr, length);
    });
}
exports.withInt16Array = withInt16Array;
function withUint32Array(data, access, exec) {
    return withArray(data, access, exec, Uint32Array.BYTES_PER_ELEMENT, (ptr, length) => {
        return new Uint32Array(_heaps.HEAPU8().buffer, ptr, length);
    });
}
exports.withUint32Array = withUint32Array;
function withInt32Array(data, access, exec) {
    return withArray(data, access, exec, Int32Array.BYTES_PER_ELEMENT, (ptr, length) => {
        return new Int32Array(_heaps.HEAPU8().buffer, ptr, length);
    });
}
exports.withInt32Array = withInt32Array;
function withFloat32Array(data, access, exec) {
    return withArray(data, access, exec, Float32Array.BYTES_PER_ELEMENT, (ptr, length) => {
        return new Float32Array(_heaps.HEAPU8().buffer, ptr, length);
    });
}
exports.withFloat32Array = withFloat32Array;
function withFloat64Array(data, access, exec) {
    return withArray(data, access, exec, Float64Array.BYTES_PER_ELEMENT, (ptr, length) => {
        return new Float64Array(_heaps.HEAPU8().buffer, ptr, length);
    });
}
exports.withFloat64Array = withFloat64Array;
function wasmHeap() {
    return _heaps.HEAP32().buffer;
}
exports.wasmHeap = wasmHeap;
//# sourceMappingURL=arrays.js.map