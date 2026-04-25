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
import { ParameterAnnotationInfo, ParameterAnnotationRecord, ParameterAnnotations } from './annotations';
import { AnnotationRecord } from './annotations/base';
import { BaseRecord, RecordOptions } from './base';

export type ParameterInfo = AnnotationRecord<ParameterAnnotations, ParameterAnnotationInfo> & {};

export class ParameterRecord extends BaseRecord<arkts.ETSParameterExpression, ParameterInfo> {
    private _annotationRecord?: ParameterAnnotationRecord;

    constructor(options: RecordOptions) {
        super(options);
        this._annotationRecord = new ParameterAnnotationRecord(options);
    }

    collectFromNode(node: arkts.ETSParameterExpression): void {
        for (const anno of node.annotations) {
            this._annotationRecord?.collect(anno);
        }
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        const annotationRecord = this._annotationRecord?.toRecord();
        currInfo = {
            ...currInfo,
            ...(annotationRecord && { ...annotationRecord }),
        };
        this.info = currInfo;
    }

    toJSON(): ParameterInfo {
        this.refresh();
        return {
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
        };
    }
}
