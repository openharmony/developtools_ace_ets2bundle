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

import { Literal } from "./Literal"
export class BooleanLiteral extends Literal {
    constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_BOOLEAN_LITERAL)
        super(pointer)
        
    }
    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_BOOLEAN_LITERAL;
    }
    static createBooleanLiteral(value: boolean): BooleanLiteral {
        return new BooleanLiteral(global.generatedEs2panda._CreateBooleanLiteral(global.context, value))
    }
    static updateBooleanLiteral(original: BooleanLiteral | undefined, value: boolean): BooleanLiteral {
        return new BooleanLiteral(global.generatedEs2panda._UpdateBooleanLiteral(global.context, passNode(original), value))
    }
    get value(): boolean {
        return global.generatedEs2panda._BooleanLiteralValueConst(global.context, this.peer)
    }
}
export function isBooleanLiteral(node: AstNode): node is BooleanLiteral {
    return node instanceof BooleanLiteral
}
if (!nodeByType.has(Es2pandaAstNodeType.AST_NODE_TYPE_BOOLEAN_LITERAL)) {
    nodeByType.set(Es2pandaAstNodeType.AST_NODE_TYPE_BOOLEAN_LITERAL, BooleanLiteral)
}
