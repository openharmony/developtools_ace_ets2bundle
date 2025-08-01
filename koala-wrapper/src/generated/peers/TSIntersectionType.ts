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
import { Expression } from "./Expression"
export class TSIntersectionType extends TypeNode {
     constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_TS_INTERSECTION_TYPE)
        super(pointer)
        
    }
    static createTSIntersectionType(types: readonly Expression[]): TSIntersectionType {
        return new TSIntersectionType(global.generatedEs2panda._CreateTSIntersectionType(global.context, passNodeArray(types), types.length))
    }
    static updateTSIntersectionType(original: TSIntersectionType | undefined, types: readonly Expression[]): TSIntersectionType {
        return new TSIntersectionType(global.generatedEs2panda._UpdateTSIntersectionType(global.context, passNode(original), passNodeArray(types), types.length))
    }
    get types(): readonly Expression[] {
        return unpackNodeArray(global.generatedEs2panda._TSIntersectionTypeTypesConst(global.context, this.peer))
    }
}
export function isTSIntersectionType(node: AstNode): node is TSIntersectionType {
    return node instanceof TSIntersectionType
}
if (!nodeByType.has(Es2pandaAstNodeType.AST_NODE_TYPE_TS_INTERSECTION_TYPE)) {
    nodeByType.set(Es2pandaAstNodeType.AST_NODE_TYPE_TS_INTERSECTION_TYPE, TSIntersectionType)
}
