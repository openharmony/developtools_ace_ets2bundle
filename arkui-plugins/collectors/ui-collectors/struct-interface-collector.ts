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
    CustomComponentInterfacePropertyInfo,
    CustomComponentInterfacePropertyRecord,
    CustomComponentInterfaceRecord,
} from './records';
import { NodeCacheNames } from '../../common/predefines';
import { NodeCacheFactory } from '../../common/node-cache';

export interface StructInterfaceCollectorOptions extends VisitorOptions {
    interfaceRecord: CustomComponentInterfaceRecord;
    shouldIgnoreDecl?: boolean;
}

export class StructInterfaceCollector extends AbstractVisitor {
    private _interfaceRecord: CustomComponentInterfaceRecord;
    public shouldIgnoreDecl: boolean;

    constructor(options: StructInterfaceCollectorOptions) {
        super(options);
        this._interfaceRecord = options.interfaceRecord;
        this.shouldIgnoreDecl = options.shouldIgnoreDecl ?? false;
    }

    private canCollectMethodFromInfo(info: CustomComponentInterfacePropertyInfo): boolean {
        if (!!info.annotationInfo && Object.keys(info.annotationInfo).length > 0) {
            return true;
        }
        return false;
    }

    private collectMethod(node: arkts.MethodDefinition): void {
        const methodRecord = new CustomComponentInterfacePropertyRecord({
            interfaceRecord: this._interfaceRecord,
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

    visitor(node: arkts.TSInterfaceDeclaration): arkts.TSInterfaceDeclaration {
        node.body?.body.forEach((st) => {
            if (arkts.isMethodDefinition(st)) {
                this.collectMethod(st);
            }
        });
        return node;
    }
}
