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
import { UICollectMetadata } from './shared-types';
import { CallRecordCollector } from './call-record-collector';
import { ValidatorBuilder } from './validators';
import { AbstractVisitor, VisitorOptions } from '../../common/abstract-visitor';
import { LogCollector } from '../../common/log-collector';
import { matchPrefix } from '../../common/arkts-utils';
import { LINTER_EXCLUDE_EXTERNAL_SOURCE_PREFIXES } from '../../common/predefines';
import { MetaDataCollector } from '../../common/metadata-collector';

export interface UIVisitorOptions extends VisitorOptions {
    shouldIgnoreDecl?: boolean;
    shouldCheckUISyntax?: boolean;
}

export class UIVisitor extends AbstractVisitor {
    private _shouldIgnoreDecl?: boolean;
    private _shouldCheckUISyntax?: boolean;

    constructor(options?: UIVisitorOptions) {
        super(options);
        this._shouldIgnoreDecl = options?.shouldIgnoreDecl;
        this._shouldCheckUISyntax = options?.shouldCheckUISyntax;
    }

    get shouldIgnoreDecl(): boolean {
        return this._shouldIgnoreDecl ?? false;
    }

    get shouldCheckUISyntax(): boolean {
        return this._shouldCheckUISyntax ?? false;
    }

    init(): void {
        super.init();
        ValidatorBuilder.shouldSkip = !!this.shouldCheckUISyntax && !!this.externalSourceName
            ? matchPrefix(LINTER_EXCLUDE_EXTERNAL_SOURCE_PREFIXES, this.externalSourceName)
            : true;
        MetaDataCollector.getInstance().setExternalSourceName(this.externalSourceName);
    }

    reset(): void {
        super.reset();
        CallRecordCollector.getInstance(this.getMetadata()).reset();
        if (this.shouldCheckUISyntax) {
            LogCollector.getInstance().emitLogInfo();
            LogCollector.getInstance().reset();
            ValidatorBuilder.reset();
        }
    }

    getMetadata(): UICollectMetadata {
        return {
            isExternal: this.isExternal,
            externalSourceName: this.externalSourceName,
            program: this.program,
            shouldIgnoreDecl: this.shouldIgnoreDecl,
        }
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        findAndCollectUINodeInPreOrder(node, this.getMetadata());
        const newNode = this.visitEachChild(node);
        findAndCollectUINodeInPostOrder(newNode, this.getMetadata());
        return newNode;
    }
}
