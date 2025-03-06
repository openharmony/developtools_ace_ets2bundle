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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerNativeModuleLibraryName = exports.loadNativeLibrary = exports.loadNativeModuleLibrary = exports.DeserializerBase = exports.isInstanceOf = exports.isResource = exports.unsafeCast = exports.runtimeType = exports.Tags = exports.RuntimeType = exports.SerializerBase = exports.loadInteropNativeModule = exports.InteropNativeModule = exports.withUint32Array = exports.withUint16Array = exports.withUint8Array = exports.withInt32Array = exports.withInt16Array = exports.withInt8Array = exports.withFloat64Array = exports.withFloat32Array = exports.wasmHeap = exports.withIntArray = exports.withByteArray = exports.withFloatArray = exports.toPtrArray = exports.fromPtrArray = exports.withPtrArray = exports.withStringArray = exports.withString = exports.encodeToData = exports.decodeToString = exports.bitsToPtr = exports.ptrToBits = exports.Wrapper = exports.ptrEqual = exports.nullptr = exports.isNullPtr = exports.getPtr = exports.nullable = exports.NativeThunk = exports.Finalizable = exports.Access = exports.setCallbackRegistry = exports.registerCallback = void 0;
const arrays_1 = require("#common/wrappers/arrays");
Object.defineProperty(exports, "withFloat32Array", { enumerable: true, get: function () { return arrays_1.withFloat32Array; } });
Object.defineProperty(exports, "withFloat64Array", { enumerable: true, get: function () { return arrays_1.withFloat64Array; } });
Object.defineProperty(exports, "withInt16Array", { enumerable: true, get: function () { return arrays_1.withInt16Array; } });
Object.defineProperty(exports, "withInt32Array", { enumerable: true, get: function () { return arrays_1.withInt32Array; } });
Object.defineProperty(exports, "withInt8Array", { enumerable: true, get: function () { return arrays_1.withInt8Array; } });
Object.defineProperty(exports, "withUint16Array", { enumerable: true, get: function () { return arrays_1.withUint16Array; } });
Object.defineProperty(exports, "withUint32Array", { enumerable: true, get: function () { return arrays_1.withUint32Array; } });
Object.defineProperty(exports, "withUint8Array", { enumerable: true, get: function () { return arrays_1.withUint8Array; } });
var Callback_1 = require("#common/wrappers/Callback");
Object.defineProperty(exports, "registerCallback", { enumerable: true, get: function () { return Callback_1.registerCallback; } });
Object.defineProperty(exports, "setCallbackRegistry", { enumerable: true, get: function () { return Callback_1.setCallbackRegistry; } });
var arrays_2 = require("./arrays");
Object.defineProperty(exports, "Access", { enumerable: true, get: function () { return arrays_2.Access; } });
var Finalizable_1 = require("./Finalizable");
Object.defineProperty(exports, "Finalizable", { enumerable: true, get: function () { return Finalizable_1.Finalizable; } });
Object.defineProperty(exports, "NativeThunk", { enumerable: true, get: function () { return Finalizable_1.NativeThunk; } });
var nullable_1 = require("./nullable");
Object.defineProperty(exports, "nullable", { enumerable: true, get: function () { return nullable_1.nullable; } });
var Wrapper_1 = require("./Wrapper");
Object.defineProperty(exports, "getPtr", { enumerable: true, get: function () { return Wrapper_1.getPtr; } });
Object.defineProperty(exports, "isNullPtr", { enumerable: true, get: function () { return Wrapper_1.isNullPtr; } });
Object.defineProperty(exports, "nullptr", { enumerable: true, get: function () { return Wrapper_1.nullptr; } });
Object.defineProperty(exports, "ptrEqual", { enumerable: true, get: function () { return Wrapper_1.ptrEqual; } });
Object.defineProperty(exports, "Wrapper", { enumerable: true, get: function () { return Wrapper_1.Wrapper; } });
Object.defineProperty(exports, "ptrToBits", { enumerable: true, get: function () { return Wrapper_1.ptrToBits; } });
Object.defineProperty(exports, "bitsToPtr", { enumerable: true, get: function () { return Wrapper_1.bitsToPtr; } });
var arrays_3 = require("#common/wrappers/arrays");
Object.defineProperty(exports, "decodeToString", { enumerable: true, get: function () { return arrays_3.decodeToString; } });
Object.defineProperty(exports, "encodeToData", { enumerable: true, get: function () { return arrays_3.encodeToData; } });
Object.defineProperty(exports, "withString", { enumerable: true, get: function () { return arrays_3.withString; } });
Object.defineProperty(exports, "withStringArray", { enumerable: true, get: function () { return arrays_3.withStringArray; } });
Object.defineProperty(exports, "withPtrArray", { enumerable: true, get: function () { return arrays_3.withPtrArray; } });
Object.defineProperty(exports, "fromPtrArray", { enumerable: true, get: function () { return arrays_3.fromPtrArray; } });
Object.defineProperty(exports, "toPtrArray", { enumerable: true, get: function () { return arrays_3.toPtrArray; } });
exports.withFloatArray = arrays_1.withFloat32Array;
exports.withByteArray = arrays_1.withUint8Array;
exports.withIntArray = arrays_1.withInt32Array;
exports.wasmHeap = arrays_1.wasmHeap;
__exportStar(require("./Platform"), exports);
__exportStar(require("./InteropTypes"), exports);
__exportStar(require("./InteropOps"), exports);
__exportStar(require("./NativeString"), exports);
__exportStar(require("./buffer"), exports);
__exportStar(require("../arkts/ResourceManager"), exports);
__exportStar(require("./NativeBuffer"), exports);
var InteropNativeModule_1 = require("./InteropNativeModule");
Object.defineProperty(exports, "InteropNativeModule", { enumerable: true, get: function () { return InteropNativeModule_1.InteropNativeModule; } });
Object.defineProperty(exports, "loadInteropNativeModule", { enumerable: true, get: function () { return InteropNativeModule_1.loadInteropNativeModule; } });
var SerializerBase_1 = require("./SerializerBase");
Object.defineProperty(exports, "SerializerBase", { enumerable: true, get: function () { return SerializerBase_1.SerializerBase; } });
Object.defineProperty(exports, "RuntimeType", { enumerable: true, get: function () { return SerializerBase_1.RuntimeType; } });
Object.defineProperty(exports, "Tags", { enumerable: true, get: function () { return SerializerBase_1.Tags; } });
Object.defineProperty(exports, "runtimeType", { enumerable: true, get: function () { return SerializerBase_1.runtimeType; } });
Object.defineProperty(exports, "unsafeCast", { enumerable: true, get: function () { return SerializerBase_1.unsafeCast; } });
Object.defineProperty(exports, "isResource", { enumerable: true, get: function () { return SerializerBase_1.isResource; } });
Object.defineProperty(exports, "isInstanceOf", { enumerable: true, get: function () { return SerializerBase_1.isInstanceOf; } });
var DeserializerBase_1 = require("./DeserializerBase");
Object.defineProperty(exports, "DeserializerBase", { enumerable: true, get: function () { return DeserializerBase_1.DeserializerBase; } });
var loadLibraries_1 = require("./loadLibraries");
Object.defineProperty(exports, "loadNativeModuleLibrary", { enumerable: true, get: function () { return loadLibraries_1.loadNativeModuleLibrary; } });
Object.defineProperty(exports, "loadNativeLibrary", { enumerable: true, get: function () { return loadLibraries_1.loadNativeLibrary; } });
Object.defineProperty(exports, "registerNativeModuleLibraryName", { enumerable: true, get: function () { return loadLibraries_1.registerNativeModuleLibraryName; } });
__exportStar(require("./MaterializedBase"), exports);
//# sourceMappingURL=index.js.map