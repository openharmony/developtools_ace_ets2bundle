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
export class ImportExpression extends Expression {
     constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, 40)
        super(pointer)
        console.warn("Warning: stub node ImportExpression")
    }
    static createImportExpression(source?: Expression): ImportExpression {
        return new ImportExpression(global.generatedEs2panda._CreateImportExpression(global.context, passNode(source)))
    }
    static updateImportExpression(original?: ImportExpression, source?: Expression): ImportExpression {
        return new ImportExpression(global.generatedEs2panda._UpdateImportExpression(global.context, passNode(original), passNode(source)))
    }
    get source(): Expression | undefined {
        return unpackNode(global.generatedEs2panda._ImportExpressionSourceConst(global.context, this.peer))
    }
}
export function isImportExpression(node: AstNode): node is ImportExpression {
    return node instanceof ImportExpression
}
if (!nodeByType.has(40)) {
    nodeByType.set(40, ImportExpression)
}