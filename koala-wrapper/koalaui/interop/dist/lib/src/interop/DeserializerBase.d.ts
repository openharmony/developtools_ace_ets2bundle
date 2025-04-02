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

import { float32, int32, int64 } from "#koalaui/common";
import { CallbackResource } from "./SerializerBase";
import { pointer } from "./InteropTypes";
export declare class DeserializerBase {
    private position;
    private readonly buffer;
    private readonly length;
    private view;
    private static textDecoder;
    private static customDeserializers;
    static registerCustomDeserializer(deserializer: CustomDeserializer): void;
    constructor(buffer: ArrayBuffer, length: int32);
    static get<T extends DeserializerBase>(factory: (args: Uint8Array, length: int32) => T, args: Uint8Array, length: int32): T;
    asArray(position?: number, length?: number): Uint8Array;
    currentPosition(): int32;
    resetCurrentPosition(): void;
    private checkCapacity;
    readInt8(): int32;
    readInt32(): int32;
    readInt64(): int64;
    readPointer(): pointer;
    readFloat32(): float32;
    readBoolean(): boolean;
    readFunction(): any;
    readMaterialized(): object;
    readString(): string;
    readCustomObject(kind: string): any;
    readNumber(): number | undefined;
    readCallbackResource(): CallbackResource;
    static lengthUnitFromInt(unit: int32): string;
    readBuffer(): ArrayBuffer;
}
export declare abstract class CustomDeserializer {
    protected supported: Array<string>;
    protected constructor(supported: Array<string>);
    supports(kind: string): boolean;
    abstract deserialize(serializer: DeserializerBase, kind: string): any;
    next: CustomDeserializer | undefined;
}
//# sourceMappingURL=DeserializerBase.d.ts.map