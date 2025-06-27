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
export class BigIntLiteral extends Literal {
    constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_BIGINT_LITERAL)
        super(pointer)
        
    }
    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_BIGINT_LITERAL;
    }
    static createBigIntLiteral(src: string): BigIntLiteral {
        return new BigIntLiteral(global.generatedEs2panda._CreateBigIntLiteral(global.context, src))
    }
    static updateBigIntLiteral(original: BigIntLiteral | undefined, src: string): BigIntLiteral {
        return new BigIntLiteral(global.generatedEs2panda._UpdateBigIntLiteral(global.context, passNode(original), src))
    }
    get str(): string {
        return unpackString(global.generatedEs2panda._BigIntLiteralStrConst(global.context, this.peer))
    }
}
export function isBigIntLiteral(node: AstNode): node is BigIntLiteral {
    return node instanceof BigIntLiteral
}
if (!nodeByType.has(Es2pandaAstNodeType.AST_NODE_TYPE_BIGINT_LITERAL)) {
    nodeByType.set(Es2pandaAstNodeType.AST_NODE_TYPE_BIGINT_LITERAL, BigIntLiteral)
}
