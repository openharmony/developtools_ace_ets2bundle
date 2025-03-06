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

import { float32, int32, int64 } from "@koalaui/common";
import { pointer, KPointer } from "./InteropTypes";
import { ResourceId } from "../arkts/ResourceManager";
/**
 * Value representing possible JS runtime object type.
 * Must be synced with "enum RuntimeType" in C++.
 */
export declare enum RuntimeType {
    UNEXPECTED = -1,
    NUMBER = 1,
    STRING = 2,
    OBJECT = 3,
    BOOLEAN = 4,
    UNDEFINED = 5,
    BIGINT = 6,
    FUNCTION = 7,
    SYMBOL = 8,
    MATERIALIZED = 9
}
/**
 * Value representing object type in serialized data.
 * Must be synced with "enum Tags" in C++.
 */
export declare enum Tags {
    UNDEFINED = 101,
    INT32 = 102,
    FLOAT32 = 103,
    STRING = 104,
    LENGTH = 105,
    RESOURCE = 106,
    OBJECT = 107
}
export declare function runtimeType(value: any): int32;
export declare function isResource(value: unknown): boolean;
export declare function isInstanceOf(className: string, value: object | undefined): boolean;
export declare function registerCallback(value: object | undefined): int32;
export declare function registerMaterialized(value: object | undefined): number;
export interface CallbackResource {
    resourceId: int32;
    hold: pointer;
    release: pointer;
}
export declare abstract class CustomSerializer {
    protected supported: Array<string>;
    constructor(supported: Array<string>);
    supports(kind: string): boolean;
    abstract serialize(serializer: SerializerBase, value: any, kind: string): void;
    next: CustomSerializer | undefined;
}
export declare class SerializerBase {
    private position;
    private buffer;
    private view;
    private static customSerializers;
    static registerCustomSerializer(serializer: CustomSerializer): void;
    constructor();
    release(): void;
    asArray(): Uint8Array;
    length(): int32;
    currentPosition(): int32;
    private checkCapacity;
    private heldResources;
    holdAndWriteCallback(callback: object, hold?: KPointer, release?: KPointer, call?: KPointer, callSync?: KPointer): ResourceId;
    holdAndWriteCallbackForPromiseVoid(hold?: KPointer, release?: KPointer, call?: KPointer, callSync?: number): [Promise<void>, ResourceId];
    holdAndWriteCallbackForPromise<T>(hold?: KPointer, release?: KPointer, call?: KPointer): [Promise<T>, ResourceId];
    writeCallbackResource(resource: CallbackResource): void;
    private releaseResources;
    writeCustomObject(kind: string, value: any): void;
    writeNumber(value: number | undefined): void;
    writeInt8(value: int32): void;
    writeInt32(value: int32): void;
    writeInt64(value: int64): void;
    writePointer(value: pointer): void;
    writeFloat32(value: float32): void;
    writeBoolean(value: boolean | undefined): void;
    writeFunction(value: object | undefined): void;
    writeString(value: string): void;
    writeBuffer(buffer: ArrayBuffer): void;
}
export declare function unsafeCast<T>(value: unknown): T;
//# sourceMappingURL=SerializerBase.d.ts.map