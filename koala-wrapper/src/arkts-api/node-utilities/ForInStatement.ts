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

import { ForInStatement, Statement, Expression } from '../../generated';
import { isSameNativeObject } from '../peers/ArktsObject';
import { AstNode } from '../peers/AstNode';
import { attachModifiers, updateThenAttach } from '../utilities/private';

export function updateForInStatement(
    original: ForInStatement,
    left?: AstNode,
    right?: Expression,
    body?: Statement
): ForInStatement {
    if (
        isSameNativeObject(left, original.left) &&
        isSameNativeObject(right, original.right) &&
        isSameNativeObject(body, original.body)
    ) {
        return original;
    }

    const updateNode = updateThenAttach(ForInStatement.updateForInStatement, attachModifiers);
    return updateNode(original, left, right, body);
}
