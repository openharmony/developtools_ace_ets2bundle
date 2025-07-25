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

import { KInt } from '@koalaui/interop';
import { isSameNativeObject } from '../peers/ArktsObject';
import { AstNode } from '../peers/AstNode';
import { MethodDefinition } from '../types';
import { updateThenAttach } from '../utilities/private';
import { Es2pandaMethodDefinitionKind } from '../../generated/Es2pandaEnums';
import { ScriptFunction } from '../../generated';

export function updateMethodDefinition(
    original: MethodDefinition,
    kind: Es2pandaMethodDefinitionKind,
    key: AstNode,
    value: ScriptFunction,
    modifiers: KInt,
    isComputed: boolean
): MethodDefinition {
    if (
        isSameNativeObject(kind, original.kind) &&
        isSameNativeObject(key, original.name) &&
        isSameNativeObject(value, original.scriptFunction) &&
        isSameNativeObject(modifiers, original.modifiers)
        /* TODO: no getter for isComputed */
    ) {
        return original;
    }

    const update = updateThenAttach(MethodDefinition.update, (node: MethodDefinition, original: MethodDefinition) =>
        node.setOverloads(original.overloads)
    );
    return update(original, kind, key, value, modifiers, isComputed);
}
