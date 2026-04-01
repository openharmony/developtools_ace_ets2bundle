/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

import { Expression, SpreadElement } from '../../generated';
import { isSameNativeObject } from '../peers/ArktsObject';
import {
    attachModifiers,
    attachParent,
    refreshNodeCache,
    updateThenAttach,
} from '../utilities/private';
import { Es2pandaAstNodeType } from '../../Es2pandaEnums';
import { global } from '../static/global';

export function updateSpreadElement(
    original: SpreadElement,
    nodeType: Es2pandaAstNodeType,
    argument?: Expression
): SpreadElement {
    const originalNodeType = global.generatedEs2panda._AstNodeTypeConst(global.context, original.peer);
    if (isSameNativeObject(argument, original.argument) && isSameNativeObject(nodeType, originalNodeType)) {
        return original;
    }

    const update = updateThenAttach(SpreadElement.updateSpreadElement, attachModifiers, attachParent, refreshNodeCache);
    return update(original, nodeType, argument);
}
