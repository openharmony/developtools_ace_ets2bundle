"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensure = exports.assertion = void 0;
// "assert" is a reserved keyword in ArkTS :-(
function assertion(condition, message) {
    if (!condition)
        throw new Error(message);
}
exports.assertion = assertion;
// The unknonwn type support in ArkTS compiler is not ready yet.
// When it is ready move from
//    ensure(value, message)
// to
//    value ?? error(message)
// which is much more readable
function ensure(value, message) {
    if (value == undefined)
        throw new Error(message);
    return value;
}
exports.ensure = ensure;
//# sourceMappingURL=Errors.js.map