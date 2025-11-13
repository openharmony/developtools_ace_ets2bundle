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
    unpackString
} from "../../reexport-for-generated"

import { Literal } from "./Literal"
export class StringLiteral extends Literal {
    constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_STRING_LITERAL)
        super(pointer)
        
    }
    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_STRING_LITERAL;
    }
    static createStringLiteral(): StringLiteral {
        return new StringLiteral(global.generatedEs2panda._CreateStringLiteral(global.context))
    }
    static updateStringLiteral(original?: StringLiteral): StringLiteral {
        return new StringLiteral(global.generatedEs2panda._UpdateStringLiteral(global.context, passNode(original)))
    }
    static create1StringLiteral(str: string): StringLiteral {
        return new StringLiteral(global.generatedEs2panda._CreateStringLiteral1(global.context, str))
    }
    static update1StringLiteral(original: StringLiteral | undefined, str: string): StringLiteral {
        return new StringLiteral(global.generatedEs2panda._UpdateStringLiteral1(global.context, passNode(original), str))
    }
    get str(): string {
        return unpackString(global.generatedEs2panda._StringLiteralStrConst(global.context, this.peer))
    }
}
export function isStringLiteral(node: AstNode): node is StringLiteral {
    return node instanceof StringLiteral
}
if (!nodeByType.has(Es2pandaAstNodeType.AST_NODE_TYPE_STRING_LITERAL)) {
    nodeByType.set(Es2pandaAstNodeType.AST_NODE_TYPE_STRING_LITERAL, StringLiteral)
}
