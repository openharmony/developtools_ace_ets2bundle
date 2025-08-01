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
import { Identifier } from "./Identifier"
export class ImportSpecifier extends Statement {
     constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_IMPORT_SPECIFIER)
        super(pointer)
        
    }
    static createImportSpecifier(imported?: Identifier, local?: Identifier): ImportSpecifier {
        return new ImportSpecifier(global.generatedEs2panda._CreateImportSpecifier(global.context, passNode(imported), passNode(local)))
    }
    static updateImportSpecifier(original?: ImportSpecifier, imported?: Identifier, local?: Identifier): ImportSpecifier {
        return new ImportSpecifier(global.generatedEs2panda._UpdateImportSpecifier(global.context, passNode(original), passNode(imported), passNode(local)))
    }
    get imported(): Identifier | undefined {
        return unpackNode(global.generatedEs2panda._ImportSpecifierImportedConst(global.context, this.peer))
    }
    get local(): Identifier | undefined {
        return unpackNode(global.generatedEs2panda._ImportSpecifierLocalConst(global.context, this.peer))
    }
}
export function isImportSpecifier(node: AstNode): node is ImportSpecifier {
    return node instanceof ImportSpecifier
}
if (!nodeByType.has(Es2pandaAstNodeType.AST_NODE_TYPE_IMPORT_SPECIFIER)) {
    nodeByType.set(Es2pandaAstNodeType.AST_NODE_TYPE_IMPORT_SPECIFIER, ImportSpecifier)
}
