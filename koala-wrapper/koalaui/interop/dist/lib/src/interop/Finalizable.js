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
exports.Finalizable = exports.NativeThunk = void 0;
const Wrapper_1 = require("./Wrapper");
const common_1 = require("@koalaui/common");
const InteropNativeModule_1 = require("./InteropNativeModule");
class NativeThunk {
    constructor(obj, finalizer, name) {
        this.finalizer = finalizer;
        this.obj = obj;
        this.name = name;
    }
    clean() {
        if (!(0, Wrapper_1.isNullPtr)(this.obj)) {
            this.destroyNative(this.obj, this.finalizer);
        }
        this.obj = Wrapper_1.nullptr;
    }
    destroyNative(ptr, finalizer) {
        InteropNativeModule_1.InteropNativeModule._InvokeFinalizer(ptr, finalizer);
    }
}
exports.NativeThunk = NativeThunk;
/**
 * Class with the custom finalizer, usually used to release a native peer.
 * Do not use directly, only via subclasses.
 */
class Finalizable extends Wrapper_1.Wrapper {
    constructor(ptr, finalizer, managed = true) {
        super(ptr);
        this.cleaner = undefined;
        this.finalizer = finalizer;
        this.managed = managed;
        const handle = this.createHandle();
        if (this.managed) {
            // TODO: reenable exception.
            if (this.ptr == Wrapper_1.nullptr)
                return; // throw new Error("Can't have nullptr ptr ${}")
            if (this.finalizer == Wrapper_1.nullptr)
                throw new Error("Managed finalizer is 0");
            const thunk = this.makeNativeThunk(ptr, finalizer, handle);
            (0, common_1.finalizerRegister)(this, thunk);
            this.cleaner = thunk;
        }
    }
    createHandle() {
        return undefined;
    }
    makeNativeThunk(ptr, finalizer, handle) {
        return new NativeThunk(ptr, finalizer, handle);
    }
    close() {
        if ((0, Wrapper_1.isNullPtr)(this.ptr)) {
            throw new Error(`Closing a closed object: ` + this.toString());
        }
        else if (this.cleaner == null) {
            throw new Error(`No thunk assigned to ` + this.toString());
        }
        else {
            (0, common_1.finalizerUnregister)(this);
            this.cleaner.clean();
            this.cleaner = undefined;
            this.ptr = Wrapper_1.nullptr;
        }
    }
    release() {
        (0, common_1.finalizerUnregister)(this);
        if (this.cleaner)
            this.cleaner.obj = Wrapper_1.nullptr;
        let result = this.ptr;
        this.ptr = Wrapper_1.nullptr;
        return result;
    }
    resetPeer(pointer) {
        if (this.managed)
            throw new Error("Can only reset peer for an unmanaged object");
        this.ptr = pointer;
    }
    use(body) {
        let result = body(this);
        this.close();
        return result;
    }
}
exports.Finalizable = Finalizable;
//# sourceMappingURL=Finalizable.js.map