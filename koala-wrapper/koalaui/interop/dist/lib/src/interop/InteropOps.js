"use strict";
/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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
exports.callCallback = exports.disposeCallback = exports.wrapSystemCallback = exports.wrapCallback = void 0;
class CallbackRecord {
    constructor(callback, autoDisposable) {
        this.callback = callback;
        this.autoDisposable = autoDisposable;
    }
}
class CallbackRegistry {
    constructor() {
        this.callbacks = new Map();
        this.id = 1024;
        this.callbacks.set(0, new CallbackRecord((args, length) => {
            console.log(`Callback 0 called with args = ${args} and length = ${length}`);
            throw new Error(`Null callback called`);
        }, false));
    }
    wrap(callback, autoDisposable) {
        const id = this.id++;
        this.callbacks.set(id, new CallbackRecord(callback, autoDisposable));
        return id;
    }
    wrapSystem(id, callback, autoDisposable) {
        this.callbacks.set(id, new CallbackRecord(callback, autoDisposable));
        return id;
    }
    call(id, args, length) {
        const record = this.callbacks.get(id);
        if (!record) {
            console.log(`Callback ${id} is not known`);
            // throw new Error(`Disposed or unwrapped callback called (id = ${id})`)
            return 0; // todo
        }
        if (record.autoDisposable) {
            this.dispose(id);
        }
        return record.callback(args, length);
    }
    dispose(id) {
        this.callbacks.delete(id);
    }
}
CallbackRegistry.INSTANCE = new CallbackRegistry();
function wrapCallback(callback, autoDisposable = true) {
    return CallbackRegistry.INSTANCE.wrap(callback, autoDisposable);
}
exports.wrapCallback = wrapCallback;
function wrapSystemCallback(id, callback) {
    return CallbackRegistry.INSTANCE.wrapSystem(id, callback, false);
}
exports.wrapSystemCallback = wrapSystemCallback;
function disposeCallback(id) {
    CallbackRegistry.INSTANCE.dispose(id);
}
exports.disposeCallback = disposeCallback;
function callCallback(id, args, length) {
    return CallbackRegistry.INSTANCE.call(id, args, length);
}
exports.callCallback = callCallback;
//# sourceMappingURL=InteropOps.js.map