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

import { ForOfStatement, Statement, Expression } from '../../generated';
import { isSameNativeObject } from '../peers/ArktsObject';
import { AstNode } from '../peers/AstNode';
import {
    attachModifiers,
    attachParent,
    refreshNodeCache,
    updateThenAttach,
} from '../utilities/private';

export function updateForOfStatement(
    original: ForOfStatement,
    left: AstNode | undefined,
    right: Expression | undefined,
    body: Statement | undefined,
    isAwait: boolean
): ForOfStatement {
    if (
        isSameNativeObject(left, original.left) &&
        isSameNativeObject(right, original.right) &&
        isSameNativeObject(body, original.body)
    ) {
        return original;
    }

    const updateNode = updateThenAttach(
        ForOfStatement.updateForOfStatement,
        attachModifiers,
        attachParent,
        refreshNodeCache
    );
    return updateNode(original, left, right, body, isAwait);
}
