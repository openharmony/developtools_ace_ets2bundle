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

import { Thunk } from "#koalaui/compat";
export { Thunk } from "#koalaui/compat";
export declare function finalizerRegister(target: object, thunk: Thunk): void;
export declare function finalizerRegisterWithCleaner(target: object, cleaner: () => void): void;
export declare function finalizerUnregister(target: object): void;
//# sourceMappingURL=Finalization.d.ts.map