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
exports.loadInteropNativeModule = exports.InteropNativeModule = void 0;
const loadLibraries_1 = require("./loadLibraries");
class InteropNativeModule {
    static _SetCallbackDispatcher(dispatcher) { throw "method not loaded"; }
    static _CleanCallbackDispatcher() { throw "method not loaded"; }
    static _GetGroupedLog(index) { throw "method not loaded"; }
    static _StartGroupedLog(index) { throw "method not loaded"; }
    static _StopGroupedLog(index) { throw "method not loaded"; }
    static _AppendGroupedLog(index, message) { throw "method not loaded"; }
    static _PrintGroupedLog(index) { throw "method not loaded"; }
    static _GetStringFinalizer() { throw "method not loaded"; }
    static _InvokeFinalizer(ptr1, ptr2) { throw "method not loaded"; }
    static _GetPtrVectorElement(ptr1, arg) { throw "method not loaded"; }
    static _StringLength(ptr1) { throw "method not loaded"; }
    static _StringData(ptr1, arr, i) { throw "method not loaded"; }
    static _StringMake(str1) { throw "method not loaded"; }
    static _GetPtrVectorSize(ptr1) { throw "method not loaded"; }
    static _ManagedStringWrite(str1, arr, arg) { throw "method not loaded"; }
    static _NativeLog(str1) { throw "method not loaded"; }
    static _Utf8ToString(data, offset, length) { throw "method not loaded"; }
    static _StdStringToString(cstring) { throw "method not loaded"; }
    static _CheckCallbackEvent(buffer, bufferLength) { throw "method not loaded"; }
    static _HoldCallbackResource(resourceId) { throw "method not loaded"; }
    static _ReleaseCallbackResource(resourceId) { throw "method not loaded"; }
    static _CallCallback(callbackKind, args, argsSize) { throw "method not loaded"; }
    static _CallCallbackSync(callbackKind, args, argsSize) { throw "method not loaded"; }
    static _CallCallbackResourceHolder(holder, resourceId) { throw "method not loaded"; }
    static _CallCallbackResourceReleaser(releaser, resourceId) { throw "method not loaded"; }
    static _MaterializeBuffer(data, length, resourceId, hold, release) { throw "method not loaded"; }
    static _GetNativeBufferPointer(data) { throw "method not loaded"; }
    static _LoadVirtualMachine(arg0, arg1, arg2) { throw "method not loaded"; }
    static _RunApplication(arg0, arg1) { throw "method not loaded"; }
    static _StartApplication(appUrl, appParams) { throw "method not loaded"; }
    static _EmitEvent(eventType, target, arg0, arg1) { throw "method not loaded"; }
    static _CallForeignVM(foreignContext, kind, args, argsSize) { throw "method not loaded"; }
}
exports.InteropNativeModule = InteropNativeModule;
function loadInteropNativeModule() {
    (0, loadLibraries_1.loadNativeModuleLibrary)("InteropNativeModule", InteropNativeModule);
}
exports.loadInteropNativeModule = loadInteropNativeModule;
//# sourceMappingURL=InteropNativeModule.js.map