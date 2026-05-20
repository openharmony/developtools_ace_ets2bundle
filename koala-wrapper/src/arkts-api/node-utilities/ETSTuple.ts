/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

import { ETSTuple, TypeNode } from '../../generated';
import { isSameNativeObject } from '../peers/ArktsObject';
import {
    attachModifiers,
    attachParent,
    refreshNodeCache,
    updateThenAttach,
} from '../utilities/private';

export function updateETSTuple(original: ETSTuple, typeList: readonly TypeNode[]): ETSTuple {
    if (isSameNativeObject(typeList, original.getTupleTypeAnnotationsList)) {
        return original;
    }

    const update = updateThenAttach(
        ETSTuple.update2ETSTuple,
        attachModifiers,
        attachParent,
        refreshNodeCache
    );
    return update(original, typeList);
}
