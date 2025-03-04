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
exports.UniqueId = exports.createSha1 = exports.SHA1Hash = exports.KoalaProfiler = exports.hashCodeFromString = exports.getDistancePx = exports.isFiniteNumber = exports.parseNumber = exports.modulo = exports.lerp = exports.clamp = exports.unsafeCast = exports.int8Array = exports.refEqual = exports.propDeepCopy = exports.isFunction = exports.observableProxyArray = exports.observableProxy = exports.ObservableHandler = exports.Observed = exports.functionOverValue = exports.lcClassName = exports.className = exports.CustomTextEncoder = exports.CustomTextDecoder = exports.AtomicRef = exports.Array_from_set = exports.int32BitsFromFloat = exports.float32FromBits = exports.asFloat64 = exports.asArray = void 0;
var compat_1 = require("@koalaui/compat");
Object.defineProperty(exports, "asArray", { enumerable: true, get: function () { return compat_1.asArray; } });
Object.defineProperty(exports, "asFloat64", { enumerable: true, get: function () { return compat_1.asFloat64; } });
Object.defineProperty(exports, "float32FromBits", { enumerable: true, get: function () { return compat_1.float32FromBits; } });
Object.defineProperty(exports, "int32BitsFromFloat", { enumerable: true, get: function () { return compat_1.int32BitsFromFloat; } });
Object.defineProperty(exports, "Array_from_set", { enumerable: true, get: function () { return compat_1.Array_from_set; } });
Object.defineProperty(exports, "AtomicRef", { enumerable: true, get: function () { return compat_1.AtomicRef; } });
Object.defineProperty(exports, "CustomTextDecoder", { enumerable: true, get: function () { return compat_1.CustomTextDecoder; } });
Object.defineProperty(exports, "CustomTextEncoder", { enumerable: true, get: function () { return compat_1.CustomTextEncoder; } });
Object.defineProperty(exports, "className", { enumerable: true, get: function () { return compat_1.className; } });
Object.defineProperty(exports, "lcClassName", { enumerable: true, get: function () { return compat_1.lcClassName; } });
Object.defineProperty(exports, "functionOverValue", { enumerable: true, get: function () { return compat_1.functionOverValue; } });
Object.defineProperty(exports, "Observed", { enumerable: true, get: function () { return compat_1.Observed; } });
Object.defineProperty(exports, "ObservableHandler", { enumerable: true, get: function () { return compat_1.ObservableHandler; } });
Object.defineProperty(exports, "observableProxy", { enumerable: true, get: function () { return compat_1.observableProxy; } });
Object.defineProperty(exports, "observableProxyArray", { enumerable: true, get: function () { return compat_1.observableProxyArray; } });
Object.defineProperty(exports, "isFunction", { enumerable: true, get: function () { return compat_1.isFunction; } });
Object.defineProperty(exports, "propDeepCopy", { enumerable: true, get: function () { return compat_1.propDeepCopy; } });
Object.defineProperty(exports, "refEqual", { enumerable: true, get: function () { return compat_1.refEqual; } });
Object.defineProperty(exports, "int8Array", { enumerable: true, get: function () { return compat_1.int8Array; } });
Object.defineProperty(exports, "unsafeCast", { enumerable: true, get: function () { return compat_1.unsafeCast; } });
var math_1 = require("./math");
Object.defineProperty(exports, "clamp", { enumerable: true, get: function () { return math_1.clamp; } });
Object.defineProperty(exports, "lerp", { enumerable: true, get: function () { return math_1.lerp; } });
Object.defineProperty(exports, "modulo", { enumerable: true, get: function () { return math_1.modulo; } });
Object.defineProperty(exports, "parseNumber", { enumerable: true, get: function () { return math_1.parseNumber; } });
Object.defineProperty(exports, "isFiniteNumber", { enumerable: true, get: function () { return math_1.isFiniteNumber; } });
Object.defineProperty(exports, "getDistancePx", { enumerable: true, get: function () { return math_1.getDistancePx; } });
var stringUtils_1 = require("./stringUtils");
Object.defineProperty(exports, "hashCodeFromString", { enumerable: true, get: function () { return stringUtils_1.hashCodeFromString; } });
var KoalaProfiler_1 = require("./KoalaProfiler");
Object.defineProperty(exports, "KoalaProfiler", { enumerable: true, get: function () { return KoalaProfiler_1.KoalaProfiler; } });
__exportStar(require("./PerfProbe"), exports);
__exportStar(require("./Errors"), exports);
__exportStar(require("./LifecycleEvent"), exports);
__exportStar(require("./Finalization"), exports);
__exportStar(require("./MarkableQueue"), exports);
__exportStar(require("./Matrix33"), exports);
__exportStar(require("./Matrix44"), exports);
__exportStar(require("./Point3"), exports);
__exportStar(require("./Point"), exports);
var sha1_1 = require("./sha1");
Object.defineProperty(exports, "SHA1Hash", { enumerable: true, get: function () { return sha1_1.SHA1Hash; } });
Object.defineProperty(exports, "createSha1", { enumerable: true, get: function () { return sha1_1.createSha1; } });
var uniqueId_1 = require("./uniqueId");
Object.defineProperty(exports, "UniqueId", { enumerable: true, get: function () { return uniqueId_1.UniqueId; } });
__exportStar(require("./koalaKey"), exports);
//# sourceMappingURL=index.js.map