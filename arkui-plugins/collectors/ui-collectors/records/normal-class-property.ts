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
    NormalClassPropertyAnnotationInfo,
    NormalClassPropertyAnnotationRecord,
    NormalClassPropertyAnnotations,
} from './annotations';
import { AnnotationRecord } from './annotations/base';
import { BaseRecord, RecordOptions } from './base';
import { NormalClassInfo, NormalClassRecord } from './normal-class';

export type NormalClassPropertyInfo = AnnotationRecord<
    NormalClassPropertyAnnotations,
    NormalClassPropertyAnnotationInfo
> & {
    classInfo?: NormalClassInfo;
    name?: string;
    modifiers?: arkts.Es2pandaModifierFlags;
};

export interface NormalClassPropertyRecordOptions extends RecordOptions {
    classRecord: NormalClassRecord;
}

export class NormalClassPropertyRecord extends BaseRecord<arkts.ClassProperty, NormalClassPropertyInfo> {
    private _annotationRecord: NormalClassPropertyAnnotationRecord;
    private _classRecord: NormalClassRecord;

    protected name?: string;
    protected modifiers?: arkts.Es2pandaModifierFlags;

    constructor(options: NormalClassPropertyRecordOptions) {
        super(options);
        this._classRecord = options.classRecord;
        this._annotationRecord = new NormalClassPropertyAnnotationRecord(options);
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
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        const annotationRecord = this._annotationRecord.toRecord();
        const classRecord = this._classRecord.toRecord();
        currInfo = {
            ...currInfo,
            ...(this.name && { name: this.name }),
            ...(this.modifiers && { modifiers: this.modifiers }),
            ...(annotationRecord && { ...annotationRecord }),
            ...(classRecord && { classInfo: classRecord }),
        };
        this.info = currInfo;
    }

    toJSON(): NormalClassPropertyInfo {
        this.refresh();
        const classInfo = this._classRecord.toJSON();
        return {
            ...(this.info?.name && { name: this.info.name }),
            ...(this.info?.modifiers && { modifiers: this.info.modifiers }),
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
            ...(classInfo && { classInfo }),
        };
    }
}
