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
import {
    CustomComponentInnerClassPropertyInfo,
    CustomComponentInnerClassPropertyRecord,
    CustomComponentInnerClassRecord,
} from './records';
import { NodeCacheNames } from '../../common/predefines';
import { NodeCacheFactory } from '../../common/node-cache';

export interface StructInnerClassCollectorOptions extends VisitorOptions {
    innerClassRecord: CustomComponentInnerClassRecord;
    shouldIgnoreDecl?: boolean;
}

export class StructInnerClassCollector extends AbstractVisitor {
    private _innerClassRecord: CustomComponentInnerClassRecord;
    public shouldIgnoreDecl: boolean;

    constructor(options: StructInnerClassCollectorOptions) {
        super(options);
        this._innerClassRecord = options.innerClassRecord;
        this.shouldIgnoreDecl = options.shouldIgnoreDecl ?? false;
    }

    private canCollectMethodFromInfo(info: CustomComponentInnerClassPropertyInfo): boolean {
        if (!!info.annotationInfo && Object.keys(info.annotationInfo).length > 0) {
            return true;
        }
        return false;
    }

    private collectMethod(node: arkts.ClassProperty): void {
        const methodRecord = new CustomComponentInnerClassPropertyRecord({
            innerClassRecord: this._innerClassRecord,
            shouldIgnoreDecl: this.shouldIgnoreDecl,
        });
        methodRecord.collect(node);

        const methodInfo = methodRecord.toRecord();
        if (!methodInfo) {
            return;
        }
        if (this.canCollectMethodFromInfo(methodInfo)) {
            NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).collect(node, methodRecord.toJSON());
        }
    }

    visitor(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
        node.definition?.body.forEach((st) => {
            if (arkts.isClassProperty(st)) {
                this.collectMethod(st);
            }
        });
        return node;
    }
}
