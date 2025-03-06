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

import { Expression } from "./Expression"
import { TypeNode } from "./TypeNode"
export class TSInterfaceHeritage extends Expression {
     constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, 132)
        super(pointer)
        console.warn("Warning: stub node TSInterfaceHeritage")
    }
    static createTSInterfaceHeritage(expr?: TypeNode): TSInterfaceHeritage {
        return new TSInterfaceHeritage(global.generatedEs2panda._CreateTSInterfaceHeritage(global.context, passNode(expr)))
    }
    static updateTSInterfaceHeritage(original?: TSInterfaceHeritage, expr?: TypeNode): TSInterfaceHeritage {
        return new TSInterfaceHeritage(global.generatedEs2panda._UpdateTSInterfaceHeritage(global.context, passNode(original), passNode(expr)))
    }
    get expr(): TypeNode | undefined {
        return unpackNode(global.generatedEs2panda._TSInterfaceHeritageExprConst(global.context, this.peer))
    }
}
export function isTSInterfaceHeritage(node: AstNode): node is TSInterfaceHeritage {
    return node instanceof TSInterfaceHeritage
}
if (!nodeByType.has(132)) {
    nodeByType.set(132, TSInterfaceHeritage)
}