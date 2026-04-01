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
import { CustomComponentRecord, CustomComponentInfo } from './struct';
import { RecordCache } from './cache';

export type StructPropertyInfo = AnnotationRecord<StructPropertyAnnotations, StructPropertyAnnotationInfo> & {
    structInfo?: CustomComponentInfo;
    name?: string;
    modifiers?: arkts.Es2pandaModifierFlags;
};

export interface StructPropertyRecordOptions extends RecordOptions {
    structRecord?: CustomComponentRecord;
}

export class StructPropertyRecord extends BaseRecord<arkts.ClassProperty, StructPropertyInfo> {
    private _annotationRecord: StructPropertyAnnotationRecord;
    private _structRecord?: CustomComponentRecord;

    protected name?: string;
    protected modifiers?: arkts.Es2pandaModifierFlags;

    constructor(options: StructPropertyRecordOptions) {
        super(options);
        this._structRecord = options.structRecord;
        this._annotationRecord = new StructPropertyAnnotationRecord(options);
    }

    collectFromNode(node: arkts.ClassProperty): void {
        const key: arkts.Expression | undefined = node.key;
        if (!key || !arkts.isIdentifier(key)) {
            return;
        }
        this.name = key.name;
        this.modifiers = node.modifiers;
        for (const anno of node.annotations) {
            this._annotationRecord.collect(anno);
        }
        RecordCache.getInstance().set(node.peer, this);
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        const annotationRecord = this._annotationRecord.toRecord();
        const structRecord = this._structRecord?.toRecord();
        currInfo = {
            ...currInfo,
            ...(this.name && { name: this.name }),
            ...(this.modifiers && { modifiers: this.modifiers }),
            ...(annotationRecord && { ...annotationRecord }),
            ...(structRecord && { structInfo: structRecord }),
        };
        this.info = currInfo;
    }

    toJSON(): StructPropertyInfo {
        this.refresh();
        const structInfo = this._structRecord?.toJSON();
        return {
            ...(this.info?.name && { name: this.info.name }),
            ...(this.info?.modifiers && { modifiers: this.info.modifiers }),
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
            ...(structInfo && { structInfo }),
        };
    }
}
