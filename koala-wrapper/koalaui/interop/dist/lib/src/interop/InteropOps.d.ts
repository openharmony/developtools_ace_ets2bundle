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
export type CallbackType = (args: Uint8Array, length: int32) => int32;
export declare function wrapCallback(callback: CallbackType, autoDisposable?: boolean): int32;
export declare function wrapSystemCallback(id: number, callback: CallbackType): int32;
export declare function disposeCallback(id: int32): void;
export declare function callCallback(id: int32, args: Uint8Array, length: int32): int32;
//# sourceMappingURL=InteropOps.d.ts.map