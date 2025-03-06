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

import { Access, Exec, ExecWithLength, PtrArray } from "../../interop/arrays";
import { Wrapper } from "../../interop/Wrapper";
import { KPointer, KStringArrayPtr } from "../../interop";
export declare function decodeToString(array: Uint8Array): string;
export declare function encodeToData(string: string): Uint8Array;
export declare function withString<R>(data: string | undefined, exec: Exec<string | null, R>): R;
export declare function withStringArray<R>(strings: Array<string> | undefined, exec: Exec<KStringArrayPtr, R>): R;
export declare function withPtrArray<R>(data: BigUint64Array, access: Access, exec: ExecWithLength<BigUint64Array | null, R>): R;
export declare function toPtrArray<T extends Wrapper>(data: Array<T | undefined> | undefined): BigUint64Array;
export declare function fromPtrArray<T extends Wrapper>(array: PtrArray, factory: (ptr: KPointer) => T): Array<T | undefined>;
export declare function withUint8Array<T>(data: Uint8Array | undefined, access: Access, exec: ExecWithLength<Uint8Array | null, T>): T;
export declare function withInt8Array<T>(data: Int8Array | undefined, access: Access, exec: ExecWithLength<Int8Array | null, T>): T;
export declare function withUint16Array<T>(data: Uint16Array | undefined, access: Access, exec: ExecWithLength<Uint16Array | null, T>): T;
export declare function withInt16Array<T>(data: Int16Array | undefined, access: Access, exec: ExecWithLength<Int16Array | null, T>): T;
export declare function withUint32Array<T>(data: Uint32Array | undefined, access: Access, exec: ExecWithLength<Uint32Array | null, T>): T;
export declare function withInt32Array<T>(data: Int32Array | undefined, access: Access, exec: ExecWithLength<Int32Array | null, T>): T;
export declare function withFloat32Array<T>(data: Float32Array | undefined, access: Access, exec: ExecWithLength<Float32Array | null, T>): T;
export declare function withFloat64Array<T>(data: Float64Array | undefined, access: Access, exec: ExecWithLength<Float64Array | null, T>): T;
export declare function wasmHeap(): ArrayBuffer;
//# sourceMappingURL=arrays.d.ts.map