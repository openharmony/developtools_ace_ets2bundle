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
    unpackString,
} from '../../reexport-for-generated';
import { ImportDeclaration } from './ImportDeclaration';
import { ImportSource } from './ImportSource';
import { Es2pandaImportKinds } from './../Es2pandaEnums';
import { StringLiteral } from './StringLiteral';

export class ETSImportDeclaration extends ImportDeclaration {
    constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_ETS_IMPORT_DECLARATION);
        super(pointer);
    }
    static createETSImportDeclaration(
        source: StringLiteral | undefined,
        specifiers: readonly AstNode[],
        importKind: Es2pandaImportKinds,
        program: ArktsObject
    ): ETSImportDeclaration {
        return new ETSImportDeclaration(
            global.es2panda._CreateETSImportDeclaration(
                global.context,
                passNode(source),
                passNodeArray(specifiers),
                specifiers.length,
                importKind,
                passNode(program)
            )
        );
    }
    static updateETSImportDeclaration(
        original: ETSImportDeclaration | undefined,
        source: StringLiteral | undefined,
        specifiers: readonly AstNode[],
        importKind: Es2pandaImportKinds
    ): ETSImportDeclaration {
        return new ETSImportDeclaration(
            global.generatedEs2panda._UpdateETSImportDeclaration(
                global.context,
                passNode(original),
                passNode(source),
                passNodeArray(specifiers),
                specifiers.length,
                importKind
            )
        );
    }
    get hasDecl(): boolean {
        return global.generatedEs2panda._ETSImportDeclarationHasDeclConst(global.context, this.peer);
    }
    get isPureDynamic(): boolean {
        return global.generatedEs2panda._ETSImportDeclarationIsPureDynamicConst(global.context, this.peer);
    }
    get assemblerName(): string {
        return unpackString(
            global.generatedEs2panda._ETSImportDeclarationAssemblerNameConst(global.context, this.peer)
        );
    }
    get resolvedSource(): string {
        return unpackString(global.generatedEs2panda._ETSImportDeclarationResolvedSourceConst(global.context, this.peer));
    }
}
export function isETSImportDeclaration(node: AstNode): node is ETSImportDeclaration {
    return node instanceof ETSImportDeclaration;
}
if (!nodeByType.has(Es2pandaAstNodeType.AST_NODE_TYPE_ETS_IMPORT_DECLARATION)) {
    nodeByType.set(Es2pandaAstNodeType.AST_NODE_TYPE_ETS_IMPORT_DECLARATION, ETSImportDeclaration);
}
