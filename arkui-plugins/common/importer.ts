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

import * as arkts from "@koalaui/libarkts"
import { AbstractVisitor, VisitorOptions } from "./abstract-visitor";

export class Importer extends AbstractVisitor {
    private importStatements: arkts.ETSImportDeclaration[];

    constructor(options?: VisitorOptions) {
        super(options);
        this.importStatements = [];
    }

    collectImportStatement(importStatement: arkts.ETSImportDeclaration): void {
        this.importStatements.push(importStatement)
    }

    updateImportDeclaration(importStatement: arkts.ETSImportDeclaration): void {
        const importKind = importStatement.isTypeKind
            ? arkts.Es2pandaImportKinds.IMPORT_KINDS_TYPE
            : arkts.Es2pandaImportKinds.IMPORT_KINDS_VALUE
        const importDecl: arkts.ETSImportDeclaration = arkts.factory.createImportDeclaration(
            arkts.ImportSource.createImportSource(
                importStatement.source,
                importStatement.resolvedSource,
                importStatement.hasDecl
            ),
            importStatement.specifiers,
            importKind
        )
        // Insert this import at the top of the script's statements.
        importDecl.insert();
        return;
    }

    refreshImportStatements(script: arkts.EtsScript): arkts.EtsScript {
        const newScript = arkts.factory.updateEtsScript(
            script,
            script.statements.filter((st) => {
                if (arkts.isETSImportDeclaration(st)) {
                    this.updateImportDeclaration(st)
                }
                return st
            })
        )
        return newScript;
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        const newNode = this.visitEachChild(node);

        if (arkts.isEtsScript(newNode)) {
            return this.refreshImportStatements(newNode);
        }
        if (arkts.isETSImportDeclaration(newNode)) {
            this.collectImportStatement(newNode);
        }

        return node;
    }
}