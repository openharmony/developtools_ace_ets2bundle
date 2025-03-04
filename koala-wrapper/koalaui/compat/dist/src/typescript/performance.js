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
exports.numberToFixed = exports.timeNow = void 0;
/**
 * @returns the number of milliseconds elapsed since midnight,
 *          January 1, 1970 Universal Coordinated Time (UTC).
 */
function timeNow() {
    return performance.now();
}
exports.timeNow = timeNow;
/**
 * @param fractionDigits - number of digits after the decimal point [0 - 20]
 * @returns a string representing a number in fixed-point notation
 */
function numberToFixed(value, fractionDigits) {
    return value.toFixed(fractionDigits);
}
exports.numberToFixed = numberToFixed;
//# sourceMappingURL=performance.js.map