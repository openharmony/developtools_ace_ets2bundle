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
exports.withStringArrayResult = exports.withStringResult = exports.providePlatformDefinedData = exports.ArrayDecoder = exports.NativeStringBase = void 0;
const Wrapper_1 = require("./Wrapper");
const arrays_1 = require("#common/wrappers/arrays");
const Callback_1 = require("#common/wrappers/Callback");
class NativeStringBase extends Wrapper_1.Wrapper {
    constructor(ptr) {
        super(ptr);
    }
    toString() {
        let length = this.bytesLength();
        let data = new Uint8Array(length);
        this.getData(data);
        return (0, arrays_1.decodeToString)(data);
    }
}
exports.NativeStringBase = NativeStringBase;
class ArrayDecoder {
    decode(blob) {
        const size = this.getArraySize(blob);
        const result = new Array(size);
        for (let index = 0; index < size; index++) {
            result[index] = this.getArrayElement(blob, index);
        }
        this.disposeArray(blob);
        return result;
    }
}
exports.ArrayDecoder = ArrayDecoder;
let platformData = undefined;
function providePlatformDefinedData(platformDataParam) {
    platformData = platformDataParam;
    let registry = platformDataParam.callbackRegistry();
    if (registry)
        (0, Callback_1.setCallbackRegistry)(registry);
}
exports.providePlatformDefinedData = providePlatformDefinedData;
function withStringResult(ptr) {
    if ((0, Wrapper_1.isNullPtr)(ptr))
        return undefined;
    let managedString = platformData.nativeString(ptr);
    let result = managedString === null || managedString === void 0 ? void 0 : managedString.toString();
    managedString === null || managedString === void 0 ? void 0 : managedString.close();
    return result;
}
exports.withStringResult = withStringResult;
function withStringArrayResult(ptr) {
    if (ptr == Wrapper_1.nullptr)
        return new Array();
    let managedStringArray = platformData.nativeStringArrayDecoder().decode(ptr);
    return managedStringArray.map((nativeString) => nativeString.toString());
}
exports.withStringArrayResult = withStringArrayResult;
//# sourceMappingURL=Platform.js.map