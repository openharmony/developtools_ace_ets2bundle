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
import { Expression } from "./Expression"
export class IfStatement extends Statement {
    constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_IF_STATEMENT)
        super(pointer)
        
    }
    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_IF_STATEMENT;
    }
    static createIfStatement(test?: Expression, consequent?: Statement, alternate?: Statement): IfStatement {
        return new IfStatement(global.generatedEs2panda._CreateIfStatement(global.context, passNode(test), passNode(consequent), passNode(alternate)))
    }
    static updateIfStatement(original?: IfStatement, test?: Expression, consequent?: Statement, alternate?: Statement): IfStatement {
        return new IfStatement(global.generatedEs2panda._UpdateIfStatement(global.context, passNode(original), passNode(test), passNode(consequent), passNode(alternate)))
    }
    get test(): Expression | undefined {
        return unpackNode(global.generatedEs2panda._IfStatementTestConst(global.context, this.peer))
    }
    /** @deprecated */
    setTest(test?: Expression): this {
        global.generatedEs2panda._IfStatementSetTest(global.context, this.peer, passNode(test))
        return this
    }
    get consequent(): Statement | undefined {
        return unpackNode(global.generatedEs2panda._IfStatementConsequentConst(global.context, this.peer))
    }
    /** @deprecated */
    setConsequent(consequent?: Statement): this {
        global.generatedEs2panda._IfStatementSetConsequent(global.context, this.peer, passNode(consequent))
        return this
    }
    get alternate(): Statement | undefined {
        return unpackNode(global.generatedEs2panda._IfStatementAlternateConst(global.context, this.peer))
    }
    /** @deprecated */
    setAlternate(alternate?: Statement): this {
        global.generatedEs2panda._IfStatementSetAlternate(global.context, this.peer, passNode(alternate))
        return this
    }
}
export function isIfStatement(node: AstNode): node is IfStatement {
    return node instanceof IfStatement
}
if (!nodeByType.has(Es2pandaAstNodeType.AST_NODE_TYPE_IF_STATEMENT)) {
    nodeByType.set(Es2pandaAstNodeType.AST_NODE_TYPE_IF_STATEMENT, IfStatement)
}
