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

import * as arkts from '@koalaui/libarkts';
import { AbstractVisitor, VisitorOptions } from '../../common/abstract-visitor';
import { MetaDataCollector } from '../../common/metadata-collector';
import { isETSGlobalClass, isNamespace } from '../../common/arkts-utils';
import { findAndCollectMemoableNode } from './factory';
import { ImportCollector } from '../../common/import-collector';
import { factory as MemoFactory } from './factory';
import { isExportWithinScope, NamespaceCollector } from '../namespace-collector';

export class MemoVisitor extends AbstractVisitor {
    init(): void {
        MetaDataCollector.getInstance().setIsDeclaration(this.isDeclaration);
    }

    reset(): void {
        super.reset();
        ImportCollector.getInstance().reset();
    }
 	 
    getMetadata(): VisitorOptions {
        return {
            isDeclaration: this.isDeclaration,
            isExternal: this.isExternal,
            externalSourceName: this.externalSourceName,
            program: this.program
        };
    }

    private preOrderMethodVisitor(node: arkts.MethodDefinition): arkts.MethodDefinition {
        if (arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE)) {
            return node;
        }
        MemoFactory.findAndCollectMemoableMethod(node, undefined, this.getMetadata());
        node.overloads.forEach((method) => {
            this.preOrderMethodVisitor(method);
        });
        node.function.params.forEach((param) => {
            if (arkts.isETSParameterExpression(param)) {
                MemoFactory.findAndCollectMemoableParameter(param, undefined, this.getMetadata());
            }
        });
        return node;
    }

    private visitETSModule<T extends arkts.ETSModule | arkts.ClassDeclaration>(node: T): T {
        const isNamespaceAstNode = isNamespace(node);
        if (isNamespaceAstNode) {
            NamespaceCollector.getInstance().collect(this.program, node);
            if (!NamespaceCollector.getInstance().isExported) {
                NamespaceCollector.getInstance().reset();
                return node;
            }
        }
        const statements = arkts.isETSModule(node) ? node.statements : node.definition?.body;
        statements?.forEach((st) => {
            if (arkts.isClassDeclaration(st) && st.definition?.isEnumTransformed) {
                return;
            }
            if (arkts.isClassDeclaration(st) && isNamespace(st)) {
                this.visitETSModule(st);
            } else if (arkts.isClassDeclaration(st)) {
                const definition = st.definition;
                const isGlobalClass = isETSGlobalClass(definition);
                if (isGlobalClass || isExportWithinScope(this.program, st)) {
                    definition?.body.forEach((it) => {
                        if (arkts.isMethodDefinition(it)) {
                            this.preOrderMethodVisitor(it);
                        } else {
                            findAndCollectMemoableNode(it);
                        }
                    });
                }
            } else if (arkts.isTSInterfaceDeclaration(st)) {
                if (isExportWithinScope(this.program, st)) {
                    st.body?.body.forEach((it) => {
                        if (arkts.isMethodDefinition(it)) {
                            this.preOrderMethodVisitor(it);
                        } else {
                            findAndCollectMemoableNode(it);
                        }
                    });
                }
            } else if (arkts.isTSTypeAliasDeclaration(st)) {
                MemoFactory.findAndCollectMemoableTSTypeAliasDeclaration(st);
            } else {
                findAndCollectMemoableNode(st);
            }
        });
        if (isNamespaceAstNode) {
            NamespaceCollector.getInstance().reset();
        } else if (arkts.isETSModule(node) && ImportCollector.getInstance().importInfos.length > 0) {
            let imports = ImportCollector.getInstance().getImportStatements();
            ImportCollector.getInstance().clearImports();
            return arkts.factory.updateETSModule(node, [...imports, ...node.statements]) as T;
        }
        return node;
    }

    declarationVisitor(node: arkts.AstNode): arkts.AstNode {
        if (!arkts.isETSModule(node)) {
            return node;
        }
        return this.visitETSModule(node);
    }
 	 

    visitor(node: arkts.AstNode): arkts.AstNode {
        if (this.isDeclaration) {
            return this.declarationVisitor(node);
        }
        const newNode = this.visitEachChild(node);
        findAndCollectMemoableNode(newNode);
        if (arkts.isETSModule(node) && ImportCollector.getInstance().importInfos.length > 0) {
            let imports = ImportCollector.getInstance().getImportStatements();
            ImportCollector.getInstance().clearImports();
            return arkts.factory.updateETSModule(node, [...imports, ...node.statements]);
        }
        return newNode;
    }
}
