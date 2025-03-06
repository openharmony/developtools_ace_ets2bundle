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
exports.propDeepCopy = void 0;
const observable_1 = require("./observable");
/*
    When decorating variables of complex types,
    @Prop makes a deep copy, during which all types,
    except primitive types, Map, Set, Date, and Array, will be lost.
 */
function propDeepCopy(sourceObject) {
    if (!sourceObject || typeof sourceObject !== 'object') {
        return sourceObject;
    }
    const copiedObjects = new Map();
    return recursiveDeepCopy(sourceObject);
    function recursiveDeepCopy(sourceObject) {
        if (!sourceObject || typeof sourceObject !== 'object') {
            return sourceObject;
        }
        const storedObject = copiedObjects.get(sourceObject);
        if (storedObject !== undefined) {
            return storedObject;
        }
        const copy = copyDeepTrackable(sourceObject);
        const objectToCopyFrom = (0, observable_1.getObservableTarget)(sourceObject);
        Object.keys(objectToCopyFrom)
            .forEach((key) => {
            const property = objectToCopyFrom[key];
            if (typeof property === "function") {
                Reflect.set(copy, key, property);
                copy[key] = copy[key].bind(copy);
                return;
            }
            Reflect.set(copy, key, recursiveDeepCopy(property));
        });
        return copy;
    }
    function copyDeepTrackable(sourceObject) {
        if (sourceObject instanceof Set) {
            const copy = new Set();
            Object.setPrototypeOf(copy, Object.getPrototypeOf(sourceObject));
            copiedObjects.set(sourceObject, copy);
            for (const setKey of sourceObject.keys()) {
                copy.add(recursiveDeepCopy(setKey));
            }
            return copy;
        }
        if (sourceObject instanceof Map) {
            const copy = new Map();
            Object.setPrototypeOf(copy, Object.getPrototypeOf(sourceObject));
            copiedObjects.set(sourceObject, copy);
            for (const mapKey of sourceObject.keys()) {
                copy.set(mapKey, recursiveDeepCopy(sourceObject.get(mapKey)));
            }
            return copy;
        }
        if (sourceObject instanceof Date) {
            const copy = new Date();
            copy.setTime(sourceObject.getTime());
            Object.setPrototypeOf(copy, Object.getPrototypeOf(sourceObject));
            copiedObjects.set(sourceObject, copy);
            return copy;
        }
        if (sourceObject instanceof Object) {
            const copy = Array.isArray(sourceObject) ? [] : {};
            Object.setPrototypeOf(copy, Object.getPrototypeOf(sourceObject));
            copiedObjects.set(sourceObject, copy);
            return copy;
        }
        return sourceObject;
    }
}
exports.propDeepCopy = propDeepCopy;
//# sourceMappingURL=prop-deep-copy.js.map