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

import {
    global,
    passNode,
    passNodeArray,
    unpackNonNullableNode,
    unpackNode,
    unpackNodeArray,
    assertValidPeer,
    AstNode,
    Es2pandaAstNodeType,
    KNativePointer,
    nodeByType,
    ArktsObject,
    unpackString
} from "../../reexport-for-generated"

import { TypeNode } from "./TypeNode"
export class TSBigintKeyword extends TypeNode {
     constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_TS_BIGINT_KEYWORD)
        super(pointer)
        
    }
    static createTSBigintKeyword(): TSBigintKeyword {
        return new TSBigintKeyword(global.generatedEs2panda._CreateTSBigintKeyword(global.context))
    }
    static updateTSBigintKeyword(original?: TSBigintKeyword): TSBigintKeyword {
        return new TSBigintKeyword(global.generatedEs2panda._UpdateTSBigintKeyword(global.context, passNode(original)))
    }
}
export function isTSBigintKeyword(node: AstNode): node is TSBigintKeyword {
    return node instanceof TSBigintKeyword
}
if (!nodeByType.has(Es2pandaAstNodeType.AST_NODE_TYPE_TS_BIGINT_KEYWORD)) {
    nodeByType.set(Es2pandaAstNodeType.AST_NODE_TYPE_TS_BIGINT_KEYWORD, TSBigintKeyword)
}
