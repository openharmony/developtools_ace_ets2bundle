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
import { CustomComponentAnnotationRecord, CustomComponentAnnotations, StructAnnotationInfo } from './annotations';
import { AnnotationRecord } from './annotations/base';
import { BaseRecord, RecordOptions } from './base';
import { RecordCache } from './cache';

export type CustomComponentInterfaceInfo = AnnotationRecord<CustomComponentAnnotations, StructAnnotationInfo> & {
    name?: string;
};

export class CustomComponentInterfaceRecord extends BaseRecord<arkts.TSInterfaceDeclaration, CustomComponentInterfaceInfo> {
    private _annotationRecord: CustomComponentAnnotationRecord;

    protected name?: string;

    constructor(options: RecordOptions) {
        super(options);
        this._annotationRecord = new CustomComponentAnnotationRecord(options);
    }

    collectFromNode(node: arkts.TSInterfaceDeclaration): void {
        const interfaceBody: arkts.TSInterfaceBody | undefined = node.body;
        if (!interfaceBody || !node.id?.name) {
            return;
        }
        this.name = node.id.name;
        for (const anno of node.annotations) {
            this._annotationRecord.collect(anno);
        }
        RecordCache.getInstance().set(node.peer, this);
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        const annotationRecord = this._annotationRecord.toRecord();
        currInfo = {
            ...currInfo,
            ...(this.name && { name: this.name }),
            ...(annotationRecord && { ...annotationRecord })
        }
        this.info = currInfo;
    }

    toJSON(): CustomComponentInterfaceInfo {
        this.refresh();
        return {
            ...(this.info?.name && { name: this.info.name }),
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
        }
    }
}
