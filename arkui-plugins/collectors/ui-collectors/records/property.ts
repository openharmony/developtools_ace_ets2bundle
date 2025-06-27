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
import { ArrowFunctionAnnotationInfo, ArrowFunctionAnnotationRecord, ArrowFunctionAnnotations } from './annotations';
import { AnnotationRecord } from './annotations/base';
import { BaseRecord, RecordOptions } from './base';
import { RecordCache } from './cache';

export type PropertyInfo = AnnotationRecord<
    ArrowFunctionAnnotations,
    ArrowFunctionAnnotationInfo
> & {
};

export class PropertyRecord extends BaseRecord<arkts.Property, PropertyInfo> {
    private _annotationRecord?: ArrowFunctionAnnotationRecord;

    constructor(options: RecordOptions) {
        super(options);
        this._annotationRecord = new ArrowFunctionAnnotationRecord(options);
    }

    collectFromNode(node: arkts.Property): void {
        const value = node.value;
        if (!value || !arkts.isArrowFunctionExpression(value)) {
            return;
        }
        // If arrow function property value is already collected, then we don't need to collect property.
        if (RecordCache.getInstance().has(value.peer)) {
            return;
        }
        for (const anno of value.annotations) {
            this._annotationRecord?.collect(anno);
        }
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        const annotationRecord = this._annotationRecord?.toRecord();
        currInfo = {
            ...currInfo,
            ...(annotationRecord && { ...annotationRecord })
        };
        this.info = currInfo;
    }

    toJSON(): PropertyInfo {
        this.refresh();
        return {
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
        }
    }
}
