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
export class ChainExpression extends Expression {
    constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_CHAIN_EXPRESSION)
        super(pointer)
        
    }
    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_CHAIN_EXPRESSION;
    }
    static createChainExpression(expression?: Expression): ChainExpression {
        return new ChainExpression(global.generatedEs2panda._CreateChainExpression(global.context, passNode(expression)))
    }
    static updateChainExpression(original?: ChainExpression, expression?: Expression): ChainExpression {
        return new ChainExpression(global.generatedEs2panda._UpdateChainExpression(global.context, passNode(original), passNode(expression)))
    }
    get getExpression(): Expression | undefined {
        return unpackNode(global.generatedEs2panda._ChainExpressionGetExpressionConst(global.context, this.peer))
    }
}
export function isChainExpression(node: AstNode): node is ChainExpression {
    return node instanceof ChainExpression
}
if (!nodeByType.has(Es2pandaAstNodeType.AST_NODE_TYPE_CHAIN_EXPRESSION)) {
    nodeByType.set(Es2pandaAstNodeType.AST_NODE_TYPE_CHAIN_EXPRESSION, ChainExpression)
}
