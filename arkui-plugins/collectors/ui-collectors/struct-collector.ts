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
import {
    CustomComponentRecord,
    StructMethodInfo,
    StructMethodRecord,
    StructPropertyInfo,
    StructPropertyRecord,
} from './records';
import { AbstractVisitor, VisitorOptions } from '../../common/abstract-visitor';
import { BuilderLambdaNames, CustomComponentNames, NodeCacheNames } from '../../common/predefines';
import { AstNodePointer } from '../../common/safe-types';
import { StructMethodValidator, StructPropertyValidator, ValidatorBuilder } from './validators';
import { checkIsCustomComponentFromInfo } from './utils';
import { NodeCacheFactory } from '../../common/node-cache';

export interface StructCollectorOptions extends VisitorOptions {
    structRecord: CustomComponentRecord;
    shouldIgnoreDecl?: boolean;
}

export class StructCollector extends AbstractVisitor {
    private _structRecord: CustomComponentRecord;
    private _disableCollectProperty: boolean = false;
    private _shouldCollectProperty: boolean = true;
    // private _properties: Record<AstNodePointer, StructPropertyInfo> = {};
    // private _methods: Record<AstNodePointer, StructMethodInfo> = {};

    public shouldIgnoreDecl: boolean;

    constructor(options: StructCollectorOptions) {
        super(options);
        this._structRecord = options.structRecord;
        this.shouldIgnoreDecl = options.shouldIgnoreDecl ?? false;
    }

    private get shouldCollectProperty(): boolean {
        if (this._disableCollectProperty) {
            return false;
        }
        return this._shouldCollectProperty;
    }

    private set shouldCollectProperty(newValue: boolean) {
        if (this._disableCollectProperty) {
            return;
        }
        this._shouldCollectProperty = newValue;
    }

    private canCollectMethodFromInfo(info: StructMethodInfo): boolean {
        if (!!info.structInfo && checkIsCustomComponentFromInfo(info.structInfo) && info.isCtor) {
            return true;
        }
        if (info.isDecl && info.name === BuilderLambdaNames.ORIGIN_METHOD_NAME) {
            return true;
        }
        if (info.name === CustomComponentNames.COMPONENT_BUILD_ORI) {
            return true;
        }
        if (!!info.annotationInfo && Object.keys(info.annotationInfo).length > 0) {
            return true;
        }
        return false;
    }

    private collectProperty(node: arkts.ClassProperty): void {
        const propertyRecord = new StructPropertyRecord({
            structRecord: this._structRecord,
            shouldIgnoreDecl: this.shouldIgnoreDecl,
        });
        propertyRecord.collect(node);

        const propertyInfo = propertyRecord.toRecord();
        if (!propertyInfo) {
            return;
        }
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).collect(node, propertyRecord.toJSON());
        ValidatorBuilder.build(StructPropertyValidator).checkIsViolated(node, propertyInfo);
    }

    private collectMethod(node: arkts.MethodDefinition): void {
        const methodRecord = new StructMethodRecord({
            structRecord: this._structRecord,
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
        ValidatorBuilder.build(StructMethodValidator).checkIsViolated(node, methodInfo);
    }

    disableCollectProperty(): this {
        this._disableCollectProperty = true;
        return this;
    }

    enableCollectProperty(): this {
        this._disableCollectProperty = false;
        return this;
    }

    reset(): void {
        this._shouldCollectProperty = true;
        this._disableCollectProperty = false;
        // this._properties = {};
        // this._methods = {};
    }

    visitor(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
        node.definition?.body.forEach((st) => {
            if (arkts.isClassProperty(st) && this.shouldCollectProperty) {
                this.collectProperty(st);
            } else if (arkts.isMethodDefinition(st)) {
                this.collectMethod(st);
            }
        });
        return node;
    }
}
