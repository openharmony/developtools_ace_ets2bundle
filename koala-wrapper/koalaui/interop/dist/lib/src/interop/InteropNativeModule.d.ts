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
import { KPointer, KStringPtr, KUint8ArrayPtr } from "./InteropTypes";
export declare class InteropNativeModule {
    static _SetCallbackDispatcher(dispatcher: (id: int32, args: Uint8Array, length: int32) => int32): void;
    static _CleanCallbackDispatcher(): void;
    static _GetGroupedLog(index: int32): KPointer;
    static _StartGroupedLog(index: int32): void;
    static _StopGroupedLog(index: int32): void;
    static _AppendGroupedLog(index: int32, message: string): void;
    static _PrintGroupedLog(index: int32): void;
    static _GetStringFinalizer(): KPointer;
    static _InvokeFinalizer(ptr1: KPointer, ptr2: KPointer): void;
    static _GetPtrVectorElement(ptr1: KPointer, arg: int32): KPointer;
    static _StringLength(ptr1: KPointer): int32;
    static _StringData(ptr1: KPointer, arr: KUint8ArrayPtr, i: int32): void;
    static _StringMake(str1: KStringPtr): KPointer;
    static _GetPtrVectorSize(ptr1: KPointer): int32;
    static _ManagedStringWrite(str1: string, arr: Uint8Array, arg: int32): int32;
    static _NativeLog(str1: string): void;
    static _Utf8ToString(data: KUint8ArrayPtr, offset: int32, length: int32): string;
    static _StdStringToString(cstring: KPointer): string;
    static _CheckCallbackEvent(buffer: KUint8ArrayPtr, bufferLength: int32): int32;
    static _HoldCallbackResource(resourceId: int32): void;
    static _ReleaseCallbackResource(resourceId: int32): void;
    static _CallCallback(callbackKind: int32, args: Uint8Array, argsSize: int32): void;
    static _CallCallbackSync(callbackKind: int32, args: Uint8Array, argsSize: int32): void;
    static _CallCallbackResourceHolder(holder: KPointer, resourceId: int32): void;
    static _CallCallbackResourceReleaser(releaser: KPointer, resourceId: int32): void;
    static _MaterializeBuffer(data: KPointer, length: int32, resourceId: int32, hold: KPointer, release: KPointer): ArrayBuffer;
    static _GetNativeBufferPointer(data: ArrayBuffer): KPointer;
    static _LoadVirtualMachine(arg0: int32, arg1: string, arg2: string): int32;
    static _RunApplication(arg0: int32, arg1: int32): number;
    static _StartApplication(appUrl: string, appParams: string): KPointer;
    static _EmitEvent(eventType: int32, target: int32, arg0: int32, arg1: int32): void;
    static _CallForeignVM(foreignContext: KPointer, kind: int32, args: Uint8Array, argsSize: int32): int32;
}
export declare function loadInteropNativeModule(): void;
//# sourceMappingURL=InteropNativeModule.d.ts.map