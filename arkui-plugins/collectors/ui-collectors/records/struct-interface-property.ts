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
import { CustomComponentInnerClassInfo, CustomComponentInnerClassRecord } from './struct-interface';
import { RecordCache } from './cache';

export type CustomComponentInnerClassPropertyInfo = AnnotationRecord<
    StructPropertyAnnotations,
    StructPropertyAnnotationInfo
> & {
    innerClassInfo?: CustomComponentInnerClassInfo;
    name?: string;
    modifiers?: arkts.Es2pandaModifierFlags;
    // kind?: arkts.Es2pandaMethodDefinitionKind;
};

export interface CustomComponentInnerClassPropertyRecordOptions extends RecordOptions {
    innerClassRecord?: CustomComponentInnerClassRecord;
}

export class CustomComponentInnerClassPropertyRecord extends BaseRecord<
    arkts.ClassProperty,
    CustomComponentInnerClassPropertyInfo
> {
    private _annotationRecord: StructPropertyAnnotationRecord;
    private _innerClassRecord?: CustomComponentInnerClassRecord;

    protected name?: string;
    protected modifiers?: arkts.Es2pandaModifierFlags;
    // protected kind?: arkts.Es2pandaMethodDefinitionKind;

    constructor(options: CustomComponentInnerClassPropertyRecordOptions) {
        super(options);
        this._innerClassRecord = options.innerClassRecord;
        this._annotationRecord = new StructPropertyAnnotationRecord(options);
    }

    release(node: arkts.ClassProperty): void {
        RecordCache.getInstance().delete(node.peer);
    }

    collectFromNode(node: arkts.ClassProperty): void {
        const key = node.key;
        if (!key || !arkts.isIdentifier(key)) {
            return;
        }
        this.name = key.name;
        this.modifiers = node.modifierFlags;
        // this.kind = node.kind;
        for (const anno of node.annotations) {
            this._annotationRecord.collect(anno);
        }
        RecordCache.getInstance().set(node.peer, this);
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        const annotationRecord = this._annotationRecord.toRecord();
        const innerClassRecord = this._innerClassRecord?.toRecord();
        currInfo = {
            ...currInfo,
            ...(this.name && { name: this.name }),
            ...(this.modifiers && { modifiers: this.modifiers }),
            // ...(this.kind && { kind: this.kind }),
            ...(annotationRecord && { ...annotationRecord }),
            ...(innerClassRecord && { innerClassInfo: innerClassRecord }),
        };
        this.info = currInfo;
    }

    toJSON(): CustomComponentInnerClassPropertyInfo {
        this.refresh();
        const innerClassInfo = this._innerClassRecord?.toJSON();
        return {
            ...(this.info?.name && { name: this.info.name }),
            ...(this.info?.modifiers && { modifiers: this.info.modifiers }),
            // ...(this.info?.kind && { kind: this.info.kind }),
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
            ...(innerClassInfo && { innerClassInfo }),
        };
    }
}
