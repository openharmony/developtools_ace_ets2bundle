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

import { Wrapper } from "./Wrapper";
import { Thunk } from "#koalaui/common";
import { pointer } from "./InteropTypes";
export declare class NativeThunk implements Thunk {
    finalizer: pointer;
    obj: pointer;
    name: string | undefined;
    constructor(obj: pointer, finalizer: pointer, name?: string);
    clean(): void;
    destroyNative(ptr: pointer, finalizer: pointer): void;
}
/**
 * Class with the custom finalizer, usually used to release a native peer.
 * Do not use directly, only via subclasses.
 */
export declare class Finalizable extends Wrapper {
    finalizer: pointer;
    cleaner?: NativeThunk;
    managed: boolean;
    constructor(ptr: pointer, finalizer: pointer, managed?: boolean);
    createHandle(): string | undefined;
    makeNativeThunk(ptr: pointer, finalizer: pointer, handle: string | undefined): NativeThunk;
    close(): void;
    release(): pointer;
    resetPeer(pointer: pointer): void;
    use<R>(body: (value: Finalizable) => R): R;
}
//# sourceMappingURL=Finalizable.d.ts.map