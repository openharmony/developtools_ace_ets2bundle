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

import { Statement } from "./Statement"
export class EmptyStatement extends Statement {
     constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_EMPTY_STATEMENT)
        super(pointer)
        
    }
    static createEmptyStatement(): EmptyStatement {
        return new EmptyStatement(global.generatedEs2panda._CreateEmptyStatement(global.context))
    }
    static updateEmptyStatement(original?: EmptyStatement): EmptyStatement {
        return new EmptyStatement(global.generatedEs2panda._UpdateEmptyStatement(global.context, passNode(original)))
    }
}
export function isEmptyStatement(node: AstNode): node is EmptyStatement {
    return node instanceof EmptyStatement
}
if (!nodeByType.has(Es2pandaAstNodeType.AST_NODE_TYPE_EMPTY_STATEMENT)) {
    nodeByType.set(Es2pandaAstNodeType.AST_NODE_TYPE_EMPTY_STATEMENT, EmptyStatement)
}
