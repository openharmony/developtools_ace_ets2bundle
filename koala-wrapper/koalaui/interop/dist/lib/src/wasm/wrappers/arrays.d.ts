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

import { KPointer } from "../../interop/InteropTypes";
import { Wrapper } from "../../interop/Wrapper";
import { Access, Exec, ExecWithLength } from "../../interop/arrays";
export declare function decodeToString(array: Uint8Array): string;
export declare function encodeToData(string: string): Uint8Array;
export declare function withString<R>(data: string | undefined, exec: Exec<number, R>): R;
export declare function withStringArray<R>(strings: Array<string> | undefined, exec: Exec<number, R>): R;
export declare function withPtrArray<R>(data: Uint32Array, access: Access, exec: ExecWithLength<number, R>): R;
export declare function toPtrArray<T extends Wrapper>(data: Array<T | undefined> | undefined): Uint32Array;
export declare function fromPtrArray<T extends Wrapper>(array: Uint32Array, factory: (ptr: KPointer) => T): Array<T | undefined>;
export declare function withUint8Array<T>(data: Uint8Array | undefined, access: Access, exec: ExecWithLength<number, T>): T;
export declare function withInt8Array<T>(data: Int8Array | undefined, access: Access, exec: ExecWithLength<number, T>): T;
export declare function withUint16Array<T>(data: Uint16Array | undefined, access: Access, exec: ExecWithLength<number, T>): T;
export declare function withInt16Array<T>(data: Int16Array | undefined, access: Access, exec: ExecWithLength<number, T>): T;
export declare function withUint32Array<T>(data: Uint32Array | undefined, access: Access, exec: ExecWithLength<number, T>): T;
export declare function withInt32Array<T>(data: Int32Array | undefined, access: Access, exec: ExecWithLength<number, T>): T;
export declare function withFloat32Array<T>(data: Float32Array | undefined, access: Access, exec: ExecWithLength<number, T>): T;
export declare function withFloat64Array<T>(data: Float64Array | undefined, access: Access, exec: ExecWithLength<number, T>): T;
export declare function wasmHeap(): ArrayBuffer;
//# sourceMappingURL=arrays.d.ts.map