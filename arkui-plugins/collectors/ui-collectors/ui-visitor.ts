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
import { findAndCollectUINodeInPostOrder, findAndCollectUINodeInPreOrder } from './factory';
import { CollectFactory as UIFactory } from './factory';
import { UICollectMetadata } from './shared-types';
import { CallRecordCollector } from './call-record-collector';
import { ValidatorBuilder } from './validators';
import { AbstractVisitor, VisitorOptions } from '../../common/abstract-visitor';
import { LogCollector } from '../../common/log-collector';
import { isETSGlobalClass, isNamespace, matchPrefix } from '../../common/arkts-utils';
import { LINTER_EXCLUDE_EXTERNAL_SOURCE_PREFIXES } from '../../common/predefines';
import { MetaDataCollector } from '../../common/metadata-collector';
import { RecordBuilder } from './records';
import { isExportWithinScope, NamespaceCollector } from '../namespace-collector';

export interface UIVisitorOptions extends VisitorOptions {
    shouldIgnoreDecl?: boolean;
    shouldCheckUISyntax?: boolean;
    shouldHandleInsightIntent?: boolean;
}

export class UIVisitor extends AbstractVisitor {
    private _shouldHandleInsightIntent: boolean;
    private _shouldIgnoreDecl?: boolean;
    private _shouldCheckUISyntax?: boolean;

    constructor(options?: UIVisitorOptions) {
        super(options);
        this._shouldIgnoreDecl = options?.shouldIgnoreDecl;
        this._shouldCheckUISyntax = options?.shouldCheckUISyntax;
        this._shouldHandleInsightIntent = 
            options?.shouldHandleInsightIntent ?? MetaDataCollector.getInstance().shouldHandleInsightIntent;
    }

    get shouldIgnoreDecl(): boolean {
        return this._shouldIgnoreDecl ?? false;
    }

    get shouldCheckUISyntax(): boolean {
        if (this.isDeclaration) {
            return false;
        }
        return this._shouldCheckUISyntax ?? false;
    }

    get shouldHandleInsightIntent(): boolean {
        return this._shouldHandleInsightIntent;
    }

    init(): void {
        super.init();
        ValidatorBuilder.shouldSkip =
            !!this.shouldCheckUISyntax && !!this.externalSourceName
                ? matchPrefix(LINTER_EXCLUDE_EXTERNAL_SOURCE_PREFIXES, this.externalSourceName)
                : true;
        MetaDataCollector.getInstance().setExternalSourceName(this.externalSourceName);
    }

    reset(): void {
        super.reset();
        CallRecordCollector.getInstance(this.getMetadata()).reset();
        RecordBuilder.reset();
        if (this.shouldCheckUISyntax) {
            ValidatorBuilder.reset();
            LogCollector.getInstance().emitLogInfo();
            LogCollector.getInstance().reset();
        }
    }

    getMetadata(): UICollectMetadata {
        return {
            isDeclaration: this.isDeclaration,
            isExternal: this.isExternal,
            externalSourceName: this.externalSourceName,
            program: this.program,
            shouldIgnoreDecl: this.shouldIgnoreDecl,
            shouldHandleInsightIntent: this.shouldHandleInsightIntent
        };
    }

    private preOrderMethodVisitor(node: arkts.MethodDefinition): arkts.MethodDefinition {
        if (arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE)) {
            return node;
        }
        node.overloads.forEach((method) => {
            this.preOrderMethodVisitor(method);
        });
        node.function.params.forEach((param) => {
            if (arkts.isETSParameterExpression(param)) {
                UIFactory.findAndCollectParameter(param, this.getMetadata());
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
            findAndCollectUINodeInPreOrder(node, this.getMetadata());
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
                            findAndCollectUINodeInPostOrder(it, this.getMetadata());
                        }
                    });
                }
            } else if (arkts.isTSInterfaceDeclaration(st)) {
                if (isExportWithinScope(this.program, st)) {
                    st.body?.body.forEach((it) => {
                        if (arkts.isMethodDefinition(it)) {
                            this.preOrderMethodVisitor(it);
                        } else {
                            findAndCollectUINodeInPostOrder(it, this.getMetadata());
                        }
                    });
                }
            } else {
                findAndCollectUINodeInPostOrder(st, this.getMetadata());
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
        return this.visitETSModule(node);
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        findAndCollectUINodeInPreOrder(node, this.getMetadata());
        const newNode = this.visitEachChild(node);
        findAndCollectUINodeInPostOrder(newNode, this.getMetadata());
        return newNode;
    }
}
