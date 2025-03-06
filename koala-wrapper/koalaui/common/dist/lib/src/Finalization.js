"use strict";
/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizerUnregister = exports.finalizerRegisterWithCleaner = exports.finalizerRegister = void 0;
const compat_1 = require("@koalaui/compat");
function finalizerRegister(target, thunk) {
    (0, compat_1.finalizerRegister)(target, thunk);
}
exports.finalizerRegister = finalizerRegister;
function finalizerRegisterWithCleaner(target, cleaner) {
    (0, compat_1.finalizerRegister)(target, new CleanerThunk(cleaner));
}
exports.finalizerRegisterWithCleaner = finalizerRegisterWithCleaner;
function finalizerUnregister(target) {
    (0, compat_1.finalizerUnregister)(target);
}
exports.finalizerUnregister = finalizerUnregister;
class CleanerThunk {
    constructor(cleaner) {
        this.cleaner = cleaner;
    }
    clean() {
        this.cleaner();
    }
}
//# sourceMappingURL=Finalization.js.map