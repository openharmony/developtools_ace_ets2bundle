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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCallbackRegistry = exports.registerCallback = void 0;
class CallbackInfo {
    constructor(callback, obj = null) {
        this.cb = callback;
        this.recv = obj;
    }
}
const GLOBAL_SCOPE = new (_a = class CallbackScope {
        constructor() {
            this.nextId = 1;
            this.callbackMap = new Map();
            this.callbackMap.set(CallbackScope.CB_NULL_ID, CallbackScope.CB_NULL);
        }
        addCallback(cb, obj) {
            var _a;
            let id = this.nextId++;
            (_a = this.callbackMap) === null || _a === void 0 ? void 0 : _a.set(id, new CallbackInfo(cb, obj));
            return id;
        }
        getCallback(id) {
            var _a;
            return ((_a = this.callbackMap) === null || _a === void 0 ? void 0 : _a.get(id)) || CallbackScope.CB_UNDEFINED;
        }
        deleteCallback(id) {
            var _a;
            if (id > CallbackScope.CB_NULL_ID) {
                (_a = this.callbackMap) === null || _a === void 0 ? void 0 : _a.delete(id);
            }
        }
        release() {
            this.callbackMap = null;
        }
    },
    _a.CB_NULL = new CallbackInfo(() => { throw new Error("attempted to call a callback at NULL"); }, null),
    _a.CB_UNDEFINED = new CallbackInfo(() => { throw new Error("attempted to call an uninitialized callback"); }, null),
    _a.CB_NULL_ID = 0,
    _a);
function callCallback(callbackId) {
    let CallbackInfo = GLOBAL_SCOPE.getCallback(callbackId);
    try {
        let cb = CallbackInfo.cb;
        if (CallbackInfo.recv !== null) {
            cb = cb.bind(CallbackInfo.recv);
        }
        return cb();
    }
    catch (e) {
        console.error(e);
    }
}
function registerCallback(callback, obj = null) {
    return GLOBAL_SCOPE.addCallback(callback, obj);
}
exports.registerCallback = registerCallback;
function releaseCallback(callbackId) {
    return GLOBAL_SCOPE.deleteCallback(callbackId);
}
globalThis.callCallback = callCallback;
globalThis.releaseCallback = releaseCallback;
function setCallbackRegistry(_ignoredRegistry) {
    // On WASM we don't need registry in current implementation.
}
exports.setCallbackRegistry = setCallbackRegistry;
//# sourceMappingURL=Callback.js.map