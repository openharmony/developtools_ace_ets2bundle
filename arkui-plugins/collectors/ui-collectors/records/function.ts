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
import { FunctionAnnotationInfo, FunctionAnnotationRecord, FunctionAnnotations } from './annotations';
import { AnnotationRecord } from './annotations/base';
import { BaseRecord, RecordOptions } from './base';
import { BuiltInNames } from '../../../common/predefines';
import { InnerComponentFunctionInfo, InnerComponentFunctionRecord } from './inner-component-function';

export type FunctionInfo = AnnotationRecord<FunctionAnnotations, FunctionAnnotationInfo> & {
    name?: string;
    modifiers?: arkts.Es2pandaModifierFlags;
    kind?: arkts.Es2pandaMethodDefinitionKind;
    isDecl?: boolean;
    isGlobalInit?: boolean;
    isGlobalMain?: boolean;
    innerComponentInfo?: InnerComponentFunctionInfo;
};

export class FunctionRecord extends BaseRecord<arkts.MethodDefinition, FunctionInfo> {
    private _annotationRecord?: FunctionAnnotationRecord;
    private _innerComponentRecord?: InnerComponentFunctionRecord;

    protected name?: string;
    protected modifiers?: arkts.Es2pandaModifierFlags;
    protected kind?: arkts.Es2pandaMethodDefinitionKind;
    protected isDecl?: boolean;
    protected isGlobalInit?: boolean;
    protected isGlobalMain?: boolean;

    constructor(options: RecordOptions) {
        super(options);
        this._annotationRecord = new FunctionAnnotationRecord(options);
        this._innerComponentRecord = new InnerComponentFunctionRecord(options);
    }

    collectFromNode(node: arkts.MethodDefinition): void {
        this.name = node.id?.name;
        this.modifiers = node.modifiers;
        this.kind = node.kind;
        this.isDecl = arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
        this.isGlobalInit = this.name === BuiltInNames.GLOBAL_INIT_METHOD;
        this.isGlobalMain = this.name === BuiltInNames.GLOBAL_MAIN_METHOD;
        for (const anno of node.function.annotations) {
            this._annotationRecord?.collect(anno);
        }
        if (!!this._annotationRecord?.annotationInfo?.hasComponentBuilder) {
            this._innerComponentRecord?.collect(node);
        }
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        const annotationRecord = this._annotationRecord?.toRecord();
        const innerComponentInfo = this._innerComponentRecord?.toRecord();
        currInfo = {
            ...currInfo,
            ...(this.name && { name: this.name }),
            ...(this.modifiers && { modifiers: this.modifiers }),
            ...(this.kind && { kind: this.kind }),
            ...(this.isDecl && { isDecl: this.isDecl }),
            ...(this.isGlobalInit && { isGlobalInit: this.isGlobalInit }),
            ...(this.isGlobalMain && { isGlobalMain: this.isGlobalMain }),
            ...(annotationRecord && { ...annotationRecord }),
            ...(innerComponentInfo && { innerComponentInfo }),
        };
        this.info = currInfo;
    }

    toJSON(): FunctionInfo {
        this.refresh();
        return {
            ...(this.info?.name && { name: this.info.name }),
            ...(this.info?.modifiers && { modifiers: this.info.modifiers }),
            ...(this.info?.kind && { kind: this.info.kind }),
            ...(this.info?.isDecl && { isDecl: this.info.isDecl }),
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
            ...(this.info?.innerComponentInfo && { innerComponentInfo: this.info.innerComponentInfo }),
        };
    }
}
