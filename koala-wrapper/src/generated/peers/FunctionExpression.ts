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
import { ScriptFunction } from "./ScriptFunction"
import { Identifier } from "./Identifier"
export class FunctionExpression extends Expression {
    constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_FUNCTION_EXPRESSION)
        super(pointer)
        
    }
    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_FUNCTION_EXPRESSION;
    }
    static createFunctionExpression(func?: ScriptFunction): FunctionExpression {
        return new FunctionExpression(global.generatedEs2panda._CreateFunctionExpression(global.context, passNode(func)))
    }
    static updateFunctionExpression(original?: FunctionExpression, func?: ScriptFunction): FunctionExpression {
        return new FunctionExpression(global.generatedEs2panda._UpdateFunctionExpression(global.context, passNode(original), passNode(func)))
    }
    static create1FunctionExpression(namedExpr?: Identifier, func?: ScriptFunction): FunctionExpression {
        return new FunctionExpression(global.generatedEs2panda._CreateFunctionExpression1(global.context, passNode(namedExpr), passNode(func)))
    }
    static update1FunctionExpression(original?: FunctionExpression, namedExpr?: Identifier, func?: ScriptFunction): FunctionExpression {
        return new FunctionExpression(global.generatedEs2panda._UpdateFunctionExpression1(global.context, passNode(original), passNode(namedExpr), passNode(func)))
    }
    get function(): ScriptFunction | undefined {
        return unpackNode(global.generatedEs2panda._FunctionExpressionFunctionConst(global.context, this.peer))
    }
    get isAnonymous(): boolean {
        return global.generatedEs2panda._FunctionExpressionIsAnonymousConst(global.context, this.peer)
    }
    get id(): Identifier | undefined {
        return unpackNode(global.generatedEs2panda._FunctionExpressionId(global.context, this.peer))
    }
}
export function isFunctionExpression(node: AstNode): node is FunctionExpression {
    return node instanceof FunctionExpression
}
if (!nodeByType.has(Es2pandaAstNodeType.AST_NODE_TYPE_FUNCTION_EXPRESSION)) {
    nodeByType.set(Es2pandaAstNodeType.AST_NODE_TYPE_FUNCTION_EXPRESSION, FunctionExpression)
}
