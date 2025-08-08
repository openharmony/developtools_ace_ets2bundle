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
import { ARKUI_BUILDER_SOURCE_NAME, NodeCacheNames } from '../../common/predefines';
import { FunctionInfo, FunctionRecord } from './records/function';
import { FunctionValidator, GlobalPropertyValidator, ValidatorBuilder } from './validators';
import { GLobalPropertyRecord } from './records';
import { NodeCacheFactory } from '../../common/node-cache';

export interface GlobalClassCollectorOptions extends VisitorOptions {
    shouldIgnoreDecl?: boolean;
}

export class GlobalClassCollector extends AbstractVisitor {
    public shouldIgnoreDecl: boolean;
    public shouldCollectGlobalClass?: boolean;

    constructor(options: GlobalClassCollectorOptions) {
        super(options);
        this.shouldIgnoreDecl = options.shouldIgnoreDecl ?? false;
    }

    private canCollectMethodFromInfo(info: FunctionInfo): boolean {
        if (!!info.annotationInfo && Object.keys(info.annotationInfo).length > 0) {
            return true;
        }
        if (!!info.innerComponentInfo?.attributeName) {
            return true;
        }
        return false;
    }

    private canCollectGlobalClassFromMethodInfo(info: FunctionInfo): boolean {
        if (!!info.innerComponentInfo?.attributeName) {
            return true;
        }
        return false;
    }

    private collectMethod(node: arkts.MethodDefinition): void {
        const methodRecord = new FunctionRecord({
            shouldIgnoreDecl: this.shouldIgnoreDecl,
        });
        methodRecord.collect(node);

        const methodInfo = methodRecord.toRecord();
        if (!methodInfo || methodInfo.isGlobalInit || methodInfo.isGlobalMain) {
            return;
        }
        ValidatorBuilder.build(FunctionValidator).checkIsViolated(node, methodInfo);
        if (this.canCollectMethodFromInfo(methodInfo)) {
            NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).collect(node, methodRecord.toJSON());
        }
        this.shouldCollectGlobalClass ||= this.canCollectGlobalClassFromMethodInfo(methodInfo);
    }

    private collectProperty(node: arkts.ClassProperty): void {
        const propertyRecord = new GLobalPropertyRecord({
            shouldIgnoreDecl: this.shouldIgnoreDecl,
        });
        propertyRecord.collect(node);

        const propertyInfo = propertyRecord.toRecord();
        if (!propertyInfo) {
            return;
        }
        ValidatorBuilder.build(GlobalPropertyValidator).checkIsViolated(node, propertyInfo);
    }

    visitor(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
        node.definition?.body.forEach((st) => {
            if (arkts.isMethodDefinition(st)) {
                this.collectMethod(st);
                st.overloads.forEach((method) => this.collectMethod(method));
            } else if (arkts.isClassProperty(st)) {
                this.collectProperty(st);
            }
        });
        if (!!this.externalSourceName && this.externalSourceName === ARKUI_BUILDER_SOURCE_NAME) {
            this.shouldCollectGlobalClass ||= true;
        }
        return node;
    }
}
