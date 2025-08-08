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

import { Es2pandaAstNodeType } from '../../generated/Es2pandaEnums';
import { throwError } from '../utils';
import { global } from './static/global';
import { KNativePointer } from '@koalaui/interop';
import { AstNode } from './peers/AstNode';
import { NodeCache } from './node-cache';

export const nodeByType = new Map<Es2pandaAstNodeType, (peer: KNativePointer) => AstNode>([]);

// TODO: These node types are "specially mapped" in the compiler, they don't have C++ classes
// See AST_NODE_REINTERPRET_MAPPING in the compiler source
// Do we need managed wrappers for them? Need to investigate.
export function nodeTypeFilter(type: Es2pandaAstNodeType): Es2pandaAstNodeType {
    switch (type) {
        case Es2pandaAstNodeType.AST_NODE_TYPE_REST_ELEMENT:
            return Es2pandaAstNodeType.AST_NODE_TYPE_SPREAD_ELEMENT;
        case Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_PATTERN:
            return Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION;
        case Es2pandaAstNodeType.AST_NODE_TYPE_ASSIGNMENT_PATTERN:
            return Es2pandaAstNodeType.AST_NODE_TYPE_ASSIGNMENT_EXPRESSION;
        case Es2pandaAstNodeType.AST_NODE_TYPE_ARRAY_PATTERN:
            return Es2pandaAstNodeType.AST_NODE_TYPE_ARRAY_EXPRESSION;
    }
    return type;
}

export function nodeFrom<T extends AstNode>(peer: KNativePointer, typeHint?: Es2pandaAstNodeType): T {
    const fromCache = NodeCache.get<T>(peer);
    if (fromCache) {
        return fromCache;
    }

    const type = nodeTypeFilter(typeHint ?? global.generatedEs2panda._AstNodeTypeConst(global.context, peer));
    const create = nodeByType.get(type) ?? throwError(`unknown node type: ${type}`);
    return create(peer) as T;
}
