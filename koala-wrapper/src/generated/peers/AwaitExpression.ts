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
export class AwaitExpression extends Expression {
     constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_AWAIT_EXPRESSION)
        super(pointer)
        
    }
    static createAwaitExpression(argument?: Expression): AwaitExpression {
        return new AwaitExpression(global.generatedEs2panda._CreateAwaitExpression(global.context, passNode(argument)))
    }
    static updateAwaitExpression(original?: AwaitExpression, argument?: Expression): AwaitExpression {
        return new AwaitExpression(global.generatedEs2panda._UpdateAwaitExpression(global.context, passNode(original), passNode(argument)))
    }
    get argument(): Expression | undefined {
        return unpackNode(global.generatedEs2panda._AwaitExpressionArgumentConst(global.context, this.peer))
    }
}
export function isAwaitExpression(node: AstNode): node is AwaitExpression {
    return node instanceof AwaitExpression
}
if (!nodeByType.has(Es2pandaAstNodeType.AST_NODE_TYPE_AWAIT_EXPRESSION)) {
    nodeByType.set(Es2pandaAstNodeType.AST_NODE_TYPE_AWAIT_EXPRESSION, AwaitExpression)
}
