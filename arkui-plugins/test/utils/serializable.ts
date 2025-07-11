/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { isBitInt } from './safe-types';

function serializable<T extends Object>(object: T, ignoreKeys?: string[]): T {
    const jsonStr = JSON.stringify(object, (key, value) => {
        if (isBitInt(value)) {
            return undefined;
        }
        if (ignoreKeys?.includes(key)) {
            return undefined;
        }
        return value;
    });
    return JSON.parse(jsonStr);
}

type JSONObject = { [key: string]: any };

function concatObject<T extends JSONObject>(obj1: T | undefined, obj2: T | undefined): T {
    const _obj1: JSONObject = obj1 ?? {};
    const _obj2: JSONObject = obj2 ?? {};
    const result: JSONObject = { ..._obj1 };

    Object.keys(_obj2).forEach((key) => {
        if (result.hasOwnProperty(key)) {
            if (
                typeof _obj2[key] === 'object' &&
                typeof result[key] === 'object' &&
                _obj2[key] !== null &&
                result[key] !== null
            ) {
                result[key] = concatObject(result[key], _obj2[key]);
            } else {
                result[key] = _obj2[key];
            }
        } else {
            result[key] = _obj2[key];
        }
    });

    return result as T;
}

export { serializable, concatObject };
