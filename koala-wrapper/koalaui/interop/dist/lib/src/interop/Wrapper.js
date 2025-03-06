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
exports.ptrEqual = exports.getPtr = exports.Wrapper = exports.ptrToString = exports.isSamePtr = exports.bitsToPtr = exports.ptrToBits = exports.nullptr = exports.isNullPtr = void 0;
const Wrapper_1 = require("#common/wrappers/Wrapper");
const common_1 = require("@koalaui/common");
var Wrapper_2 = require("#common/wrappers/Wrapper");
Object.defineProperty(exports, "isNullPtr", { enumerable: true, get: function () { return Wrapper_2.isNullPtr; } });
Object.defineProperty(exports, "nullptr", { enumerable: true, get: function () { return Wrapper_2.nullptr; } });
Object.defineProperty(exports, "ptrToBits", { enumerable: true, get: function () { return Wrapper_2.ptrToBits; } });
Object.defineProperty(exports, "bitsToPtr", { enumerable: true, get: function () { return Wrapper_2.bitsToPtr; } });
Object.defineProperty(exports, "isSamePtr", { enumerable: true, get: function () { return Wrapper_2.isSamePtr; } });
Object.defineProperty(exports, "ptrToString", { enumerable: true, get: function () { return Wrapper_2.ptrToString; } });
/**
 * An object holding reference to the native pointer.
 */
class Wrapper {
    constructor(ptr) {
        if (ptr == null)
            throw new Error(`Init <${(0, common_1.className)(this)}> with null native peer`);
        this.ptr = ptr;
    }
    toString() {
        return `[native object <${(0, common_1.className)(this)}> at ${(0, Wrapper_1.ptrToString)(this.ptr)}]`;
    }
}
exports.Wrapper = Wrapper;
function getPtr(value) {
    var _a;
    return (_a = value === null || value === void 0 ? void 0 : value.ptr) !== null && _a !== void 0 ? _a : Wrapper_1.nullptr;
}
exports.getPtr = getPtr;
function ptrEqual(a, b) {
    if (a === b)
        return true;
    if (a == undefined || b == undefined)
        return false;
    return (0, Wrapper_1.isSamePtr)(a.ptr, b.ptr);
}
exports.ptrEqual = ptrEqual;
//# sourceMappingURL=Wrapper.js.map