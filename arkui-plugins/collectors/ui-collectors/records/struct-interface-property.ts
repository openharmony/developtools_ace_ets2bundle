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
import { StructPropertyAnnotationInfo, StructPropertyAnnotationRecord, StructPropertyAnnotations } from './annotations';
import { AnnotationRecord } from './annotations/base';
import { BaseRecord, RecordOptions } from './base';
import { CustomComponentInterfaceInfo, CustomComponentInterfaceRecord } from './struct-interface';
import { RecordCache } from './cache';

export type CustomComponentInterfacePropertyInfo = AnnotationRecord<
    StructPropertyAnnotations,
    StructPropertyAnnotationInfo
> & {
    interfaceInfo?: CustomComponentInterfaceInfo;
    name?: string;
    modifiers?: arkts.Es2pandaModifierFlags;
    kind?: arkts.Es2pandaMethodDefinitionKind;
};

export interface CustomComponentInterfacePropertyRecordOptions extends RecordOptions {
    interfaceRecord?: CustomComponentInterfaceRecord;
}

export class CustomComponentInterfacePropertyRecord extends BaseRecord<
    arkts.MethodDefinition,
    CustomComponentInterfacePropertyInfo
> {
    private _annotationRecord: StructPropertyAnnotationRecord;
    private _interfaceRecord?: CustomComponentInterfaceRecord;

    protected name?: string;
    protected modifiers?: arkts.Es2pandaModifierFlags;
    protected kind?: arkts.Es2pandaMethodDefinitionKind;

    constructor(options: CustomComponentInterfacePropertyRecordOptions) {
        super(options);
        this._interfaceRecord = options.interfaceRecord;
        this._annotationRecord = new StructPropertyAnnotationRecord(options);
    }

    collectFromNode(node: arkts.MethodDefinition): void {
        this.name = node.id?.name;
        this.modifiers = node.modifiers;
        this.kind = node.kind;
        for (const anno of node.function.annotations) {
            this._annotationRecord.collect(anno);
        }
        RecordCache.getInstance().set(node.peer, this);
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        const annotationRecord = this._annotationRecord.toRecord();
        const interfaceRecord = this._interfaceRecord?.toRecord();
        currInfo = {
            ...currInfo,
            ...(this.name && { name: this.name }),
            ...(this.modifiers && { modifiers: this.modifiers }),
            ...(this.kind && { kind: this.kind }),
            ...(annotationRecord && { ...annotationRecord }),
            ...(interfaceRecord && { interfaceInfo: interfaceRecord }),
        };
        this.info = currInfo;
    }

    toJSON(): CustomComponentInterfacePropertyInfo {
        this.refresh();
        const interfaceInfo = this._interfaceRecord?.toJSON();
        return {
            ...(this.info?.name && { name: this.info.name }),
            ...(this.info?.modifiers && { modifiers: this.info.modifiers }),
            ...(this.info?.kind && { kind: this.info.kind }),
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
            ...(interfaceInfo && { interfaceInfo }),
        };
    }
}
