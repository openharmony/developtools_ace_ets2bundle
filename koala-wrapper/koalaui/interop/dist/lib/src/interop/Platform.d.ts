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

import { int32 } from "#koalaui/common";
import { Wrapper } from "./Wrapper";
import { KPointer } from "./InteropTypes";
export declare abstract class NativeStringBase extends Wrapper {
    constructor(ptr: KPointer);
    protected abstract bytesLength(): int32;
    protected abstract getData(data: Uint8Array): void;
    toString(): string;
    abstract close(): void;
}
export declare abstract class ArrayDecoder<T> {
    abstract getArraySize(blob: KPointer): int32;
    abstract disposeArray(blob: KPointer): void;
    abstract getArrayElement(blob: KPointer, index: int32): T;
    decode(blob: KPointer): Array<T>;
}
export interface CallbackRegistry {
    registerCallback(callback: any, obj: any): KPointer;
}
export interface PlatformDefinedData {
    nativeString(ptr: KPointer): NativeStringBase;
    nativeStringArrayDecoder(): ArrayDecoder<NativeStringBase>;
    callbackRegistry(): CallbackRegistry | undefined;
}
export declare function providePlatformDefinedData(platformDataParam: PlatformDefinedData): void;
export declare function withStringResult(ptr: KPointer): string | undefined;
export declare function withStringArrayResult(ptr: KPointer): Array<string>;
//# sourceMappingURL=Platform.d.ts.map