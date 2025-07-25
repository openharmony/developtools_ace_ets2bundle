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
import { ClassDefinition } from "./ClassDefinition"
export class ClassExpression extends Expression {
     constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_EXPRESSION)
        super(pointer)
        
    }
    static createClassExpression(def?: ClassDefinition): ClassExpression {
        return new ClassExpression(global.generatedEs2panda._CreateClassExpression(global.context, passNode(def)))
    }
    static updateClassExpression(original?: ClassExpression, def?: ClassDefinition): ClassExpression {
        return new ClassExpression(global.generatedEs2panda._UpdateClassExpression(global.context, passNode(original), passNode(def)))
    }
    get definition(): ClassDefinition | undefined {
        return unpackNode(global.generatedEs2panda._ClassExpressionDefinitionConst(global.context, this.peer))
    }
}
export function isClassExpression(node: AstNode): node is ClassExpression {
    return node instanceof ClassExpression
}
if (!nodeByType.has(Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_EXPRESSION)) {
    nodeByType.set(Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_EXPRESSION, ClassExpression)
}
