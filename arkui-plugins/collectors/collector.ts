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
import { AbstractVisitor, VisitorOptions } from '../common/abstract-visitor';
import { isETSGlobalClass, isNamespace, matchPrefix } from '../common/arkts-utils';
import { getPerfName } from '../common/debug';
import { LINTER_EXCLUDE_EXTERNAL_SOURCE_PREFIXES } from '../common/predefines';
import { LogCollector } from '../common/log-collector';
import { ImportCollector } from '../common/import-collector';
import { MetaDataCollector } from '../common/metadata-collector';
import { ValidatorBuilder } from './ui-collectors/validators';
import { CallRecordCollector } from './ui-collectors/call-record-collector';
import { UICollectMetadata } from './ui-collectors/shared-types';
import { collectUINodeByTypeInPostOrder, collectUINodeByTypeInPreOrder } from './ui-collectors/factory';
import { collectMemoableNodeByTypeInPostOrder } from './memo-collectors/factory';
import { RecordBuilder } from './ui-collectors/records';
import { factory as MemoFactory } from './memo-collectors/factory';
import { CollectFactory as UIFactory } from './ui-collectors/factory';
import { isExportWithinScope, NamespaceCollector } from './namespace-collector';

export interface CollectorOptions extends VisitorOptions {
    shouldIgnoreDecl?: boolean;
    shouldCollectUI?: boolean;
    shouldCollectMemo?: boolean;
    shouldCheckUISyntax?: boolean;
    shouldHandleInsightIntent?: boolean;
}

export class Collector extends AbstractVisitor {
    private _shouldHandleInsightIntent: boolean;
    private _shouldIgnoreDecl?: boolean;
    private _shouldCollectUI?: boolean;
    private _shouldCollectMemo?: boolean;
    private _shouldCheckUISyntax?: boolean;

    constructor(options?: CollectorOptions) {
        super(options);
        this._shouldIgnoreDecl = options?.shouldIgnoreDecl;
        this._shouldCollectUI = options?.shouldCollectUI;
        this._shouldCollectMemo = options?.shouldCollectMemo;
        this._shouldCheckUISyntax = options?.shouldCheckUISyntax;
        this._shouldHandleInsightIntent = 
            options?.shouldHandleInsightIntent ?? MetaDataCollector.getInstance().shouldHandleInsightIntent;
    }

    get shouldHandleInsightIntent(): boolean {
        return this._shouldHandleInsightIntent;
    }

    get shouldIgnoreDecl(): boolean {
        return this._shouldIgnoreDecl ?? false;
    }

    get shouldCollectUI(): boolean {
        return this._shouldCollectUI ?? false;
    }

    get shouldCollectMemo(): boolean {
        return this._shouldCollectMemo ?? false;
    }

    get shouldCheckUISyntax(): boolean {
        if (!this._shouldCheckUISyntax || this.isDeclaration) {
            return false;
        }
        return this.shouldCollectUI;
    }

    init(): void {
        super.init();
        MetaDataCollector.getInstance().setIsDeclaration(this.isDeclaration);
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([0, 0, 1], 'ValidatorBuilder.shouldSkip'));
        ValidatorBuilder.shouldSkip =
            !!this.shouldCheckUISyntax && !!this.externalSourceName
                ? matchPrefix(LINTER_EXCLUDE_EXTERNAL_SOURCE_PREFIXES, this.externalSourceName)
                : true;
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([0, 0, 1], 'ValidatorBuilder.shouldSkip'));
        MetaDataCollector.getInstance().setExternalSourceName(this.externalSourceName);
    }

    reset(): void {
        super.reset();
        if (this.shouldCollectUI) {
            CallRecordCollector.getInstance(this.getMetadata()).reset();
            RecordBuilder.reset();
        }
        if (this.shouldCheckUISyntax) {
            ValidatorBuilder.reset();
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([0, 0, 2], 'LogCollector.emitLogInfo'));
            LogCollector.getInstance().emitLogInfo();
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([0, 0, 2], 'LogCollector.emitLogInfo'));
            LogCollector.getInstance().reset();
        }
    }

    private getMetadata(): UICollectMetadata {
        return {
            isDeclaration: this.isDeclaration,
            isExternal: this.isExternal,
            externalSourceName: this.externalSourceName,
            program: this.program,
            shouldIgnoreDecl: this.shouldIgnoreDecl,
            shouldHandleInsightIntent: this.shouldHandleInsightIntent
        };
    }

    private preOrderVisitor(node: arkts.AstNode): arkts.AstNode {
        const nodeType = arkts.nodeType(node);
        if (this.shouldCollectUI) {
            collectUINodeByTypeInPreOrder(nodeType, node, this.getMetadata());
        }
        return node;
    }

    private postOrderVisitor(node: arkts.AstNode): arkts.AstNode {
        const nodeType = arkts.nodeType(node);
        if (this.shouldCollectUI) {
            collectUINodeByTypeInPostOrder(nodeType, node, this.getMetadata());
        }
        if (this.shouldCollectMemo) {
            collectMemoableNodeByTypeInPostOrder(nodeType, node, undefined, this.getMetadata());
        }
        return node;
    }

    private preOrderMethodVisitor(node: arkts.MethodDefinition): arkts.MethodDefinition {
        if (arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE)) {
            return node;
        }
        if (this.shouldCollectMemo) {
            MemoFactory.findAndCollectMemoableMethod(node, undefined, this.getMetadata());
        }
        node.overloads.forEach((method) => {
            this.preOrderMethodVisitor(method);
        });
        node.function.params.forEach((param) => {
            if (arkts.isETSParameterExpression(param)) {
                if (this.shouldCollectUI) {
                    UIFactory.findAndCollectParameter(param, this.getMetadata());
                }
                if (this.shouldCollectMemo) {
                    MemoFactory.findAndCollectMemoableParameter(param, undefined, this.getMetadata());
                }
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
            this.preOrderVisitor(st);
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
                            this.postOrderVisitor(it);
                        }
                    });
                }
            } else if (arkts.isTSInterfaceDeclaration(st)) {
                if (isExportWithinScope(this.program, st)) {
                    st.body?.body.forEach((it) => {
                        if (arkts.isMethodDefinition(it)) {
                            this.preOrderMethodVisitor(it);
                        } else {
                            this.postOrderVisitor(it);
                        }
                    });
                }
            } else if (arkts.isTSTypeAliasDeclaration(st)){
                if (this.shouldCollectMemo) {
                    MemoFactory.findAndCollectMemoableTSTypeAliasDeclaration(st);
                }
            } else {
                this.postOrderVisitor(st);
            }
        });
        if (isNamespaceAstNode) {
            NamespaceCollector.getInstance().reset();
        }
        return node;
    }

    declarationVisitor(node: arkts.AstNode): arkts.AstNode {
        if (!arkts.isETSModule(node)) {
            return node;
        }
        const newNode = this.visitETSModule(node);
        if (
            this.shouldCollectMemo && 
            ImportCollector.getInstance().importInfos.length > 0
        ) {
            let imports = ImportCollector.getInstance().getImportStatements();
            ImportCollector.getInstance().clearImports();
            return arkts.factory.updateETSModule(newNode, [...imports, ...newNode.statements]);
        }
        return newNode;
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        if (this.isDeclaration) {
            return this.declarationVisitor(node);
        }
        this.preOrderVisitor(node);
        let newNode = this.visitEachChild(node);

        if (arkts.isETSModule(newNode) && this.shouldCollectMemo && ImportCollector.getInstance().importInfos.length > 0) {
            let imports = ImportCollector.getInstance().getImportStatements();
            newNode = arkts.factory.updateETSModule(newNode, [...imports, ...newNode.statements]);
            ImportCollector.getInstance().clearImports();
        }
        this.postOrderVisitor(newNode);
        return newNode;
    }
}
