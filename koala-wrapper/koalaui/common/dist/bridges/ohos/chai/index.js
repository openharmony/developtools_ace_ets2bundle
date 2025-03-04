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
exports.assert = void 0;
const hypium_1 = require("@ohos/hypium");
// todo: the 'message' arg is ignored
exports.assert = ((expression, message) => {
    (0, hypium_1.expect)(Boolean(expression)).assertTrue();
});
exports.assert.equal = (actual, expected, message) => {
    (0, hypium_1.expect)(actual).assertEqual(expected);
};
exports.assert.notEqual = (actual, expected, message) => {
    // todo: not accurate impl, because compared values are not printed
    (0, hypium_1.expect)(actual != expected).assertTrue();
};
exports.assert.strictEqual = (actual, expected, message) => {
    // todo: not accurate impl, because compared values are not printed
    (0, hypium_1.expect)(actual === expected).assertTrue();
};
exports.assert.notStrictEqual = (actual, expected, message) => {
    // todo: not accurate impl, because compared values are not printed
    (0, hypium_1.expect)(actual !== expected).assertTrue();
};
exports.assert.deepEqual = (actual, expected, message) => {
    // todo: implement
    (0, hypium_1.expect)(actual).assertEqual(actual /*expected*/);
};
exports.assert.notDeepEqual = (actual, expected, message) => {
    // todo: implement
    (0, hypium_1.expect)(actual).assertEqual(actual /*expected*/);
};
exports.assert.isTrue = (value, message) => {
    (0, hypium_1.expect)(value).assertTrue();
};
exports.assert.isFalse = (value, message) => {
    (0, hypium_1.expect)(value).assertFalse();
};
exports.assert.closeTo = (actual, expected, delta, message) => {
    // implementation of 'assertClose' does not fit:
    // expect(actual).assertClose(expected, delta)
    const diff = Math.abs(actual - expected);
    if (diff == delta)
        (0, hypium_1.expect)(diff).assertEqual(delta);
    else
        (0, hypium_1.expect)(diff).assertLess(delta);
};
exports.assert.fail = (message) => {
    (0, hypium_1.expect)().assertFail();
};
exports.assert.isNull = (value, message) => {
    (0, hypium_1.expect)(value).assertNull();
};
exports.assert.isNotNull = (value, message) => {
    (0, hypium_1.expect)(value ? null : value).assertNull();
};
exports.assert.instanceOf = (value, constructor, message) => {
    // todo: not accurate impl
    // expect(value).assertInstanceOf(constructor.name)
    (0, hypium_1.expect)(value instanceof constructor).assertTrue();
};
exports.assert.isAtLeast = (valueToCheck, valueToBeAtLeast, message) => {
    if (valueToCheck == valueToBeAtLeast)
        (0, hypium_1.expect)(valueToCheck).assertEqual(valueToBeAtLeast);
    else
        (0, hypium_1.expect)(valueToCheck).assertLarger(valueToBeAtLeast);
};
exports.assert.exists = (value, message) => {
    // todo: not accurate impl
    (0, hypium_1.expect)(value == null).assertFalse();
};
exports.assert.throw = (fn, message) => {
    let fnWrapper = () => {
        try {
            fn();
        }
        catch (e) {
            throw new Error("fn thrown exception");
        }
    };
    (0, hypium_1.expect)(fnWrapper).assertThrowError("fn thrown exception");
};
exports.assert.throws = (fn, message) => {
    exports.assert.throw(fn, message);
};
exports.assert.isAbove = (valueToCheck, valueToBeAbove, message) => {
    (0, hypium_1.expect)(valueToCheck).assertLarger(valueToBeAbove);
};
exports.assert.isBelow = (valueToCheck, valueToBeBelow, message) => {
    (0, hypium_1.expect)(valueToCheck).assertLess(valueToBeBelow);
};
exports.assert.match = (value, regexp, message) => {
    // todo: not accurate impl
    (0, hypium_1.expect)(regexp.test(value)).assertTrue();
};
exports.assert.isDefined = (value, message) => {
    // todo: not accurate impl
    (0, hypium_1.expect)(value === undefined).assertFalse();
};
exports.assert.isUndefined = (value, message) => {
    (0, hypium_1.expect)(value).assertUndefined();
};
exports.assert.isEmpty = (object, message) => {
    // todo: implement
    (0, hypium_1.expect)(object !== undefined).assertTrue();
};
exports.assert.isNotEmpty = (object, message) => {
    // todo: implement
    (0, hypium_1.expect)(object !== undefined).assertTrue();
};
//# sourceMappingURL=index.js.map