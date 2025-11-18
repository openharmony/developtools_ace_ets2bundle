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
import { matchPrefix } from '../common/arkts-utils';
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

export interface CollectorOptions extends VisitorOptions {
    shouldIgnoreDecl?: boolean;
    shouldCollectUI?: boolean;
    shouldCollectMemo?: boolean;
    shouldCheckUISyntax?: boolean;
}

export class Collector extends AbstractVisitor {
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
        if (!this._shouldCheckUISyntax) {
            return false;
        }
        return this.shouldCollectUI;
    }

    init(): void {
        super.init();
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
        }
        if (this.shouldCheckUISyntax) {
            ValidatorBuilder.reset();
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([0, 0, 2], 'LogCollector.emitLogInfo'));
            LogCollector.getInstance().emitLogInfo();
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([0, 0, 2], 'LogCollector.emitLogInfo'));
            LogCollector.getInstance().reset();
        }
        if (this.shouldCollectMemo) {
            arkts.Performance.getInstance().createDetailedEvent(
                getPerfName([0, 0, 3], 'ImportCollector.insertCurrentImports')
            );
            ImportCollector.getInstance().insertCurrentImports(this.program);
            ImportCollector.getInstance().clearImports();
            arkts.Performance.getInstance().stopDetailedEvent(
                getPerfName([0, 0, 3], 'ImportCollector.insertCurrentImports')
            );
        }
    }

    private getMetadata(): UICollectMetadata {
        return {
            isExternal: this.isExternal,
            externalSourceName: this.externalSourceName,
            program: this.program,
            shouldIgnoreDecl: this.shouldIgnoreDecl,
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
            collectMemoableNodeByTypeInPostOrder(nodeType, node);
        }
        return node;
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        this.preOrderVisitor(node);
        const newNode = this.visitEachChild(node);
        this.postOrderVisitor(newNode);
        return newNode;
    }
}
