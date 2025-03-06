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

import { int32 } from "@koalaui/common";
import { KPointer } from "../../interop/InteropTypes";
export declare const nullptr: number;
export declare function isNullPtr(value: KPointer): boolean;
export declare function ptrToString(ptr: KPointer): string;
export declare function isSamePtr(a: KPointer, b: KPointer): boolean;
export declare function ptrToBits(ptr: KPointer): Uint32Array;
export declare function bitsToPtr(array: Int32Array, offset: int32): KPointer;
//# sourceMappingURL=Wrapper.d.ts.map