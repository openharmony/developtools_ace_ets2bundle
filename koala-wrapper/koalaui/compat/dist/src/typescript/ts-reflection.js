"use strict";
/*
 * Copyright (c) 2022-2024 Huawei Device Co., Ltd.
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
exports.isNotPrimitive = exports.refEqual = exports.functionOverValue = exports.isFunction = exports.className = void 0;
function className(object) {
    var _a;
    return (_a = object === null || object === void 0 ? void 0 : object.constructor.name) !== null && _a !== void 0 ? _a : "<null>";
}
exports.className = className;
function isFunction(object) {
    return typeof object === 'function';
}
exports.isFunction = isFunction;
// TODO: this is to match arkts counterpart
function functionOverValue(value) {
    return typeof value === 'function';
}
exports.functionOverValue = functionOverValue;
function refEqual(a, b) {
    return a === b;
}
exports.refEqual = refEqual;
function isNotPrimitive(value) {
    return true;
}
exports.isNotPrimitive = isNotPrimitive;
//# sourceMappingURL=ts-reflection.js.map