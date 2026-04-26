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
    InsightIntentClassAnnotationInfo, 
    InsightIntentClassAnnotationRecord, 
    InsightIntentClassAnnotations
} from './annotations';
import { AnnotationRecord } from './annotations/base';
import { BaseRecord, RecordOptions } from './base';

export type InsightIntentClassInfo = AnnotationRecord<InsightIntentClassAnnotations, InsightIntentClassAnnotationInfo> & {
    /**
     * class name.
     */
    name?: string;

    /**
     * whether this class is declared.
     */
    isDecl?: boolean;
};

export class InsightIntentClassRecord extends BaseRecord<arkts.ClassDeclaration, InsightIntentClassInfo> {
    private _annotationRecord: InsightIntentClassAnnotationRecord;

    protected name?: string;
    protected isDecl?: boolean;

    constructor(options: RecordOptions) {
        super(options);
        this._annotationRecord = new InsightIntentClassAnnotationRecord(options);
    }

    collectFromNode(node: arkts.ClassDeclaration): void {
        const definition: arkts.ClassDefinition | undefined = node.definition;
        if (!definition || !definition?.ident?.name) {
            return;
        }
        this.name = definition.ident.name;
        this.isDecl = arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
        for (const anno of definition.annotations) {
            this._annotationRecord.collect(anno);
        }
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        const annotationRecord = this._annotationRecord.toRecord();
        currInfo = {
            ...currInfo,
            ...(this.name && { name: this.name }),
            ...(this.isDecl && { isDecl: this.isDecl }),
            ...(annotationRecord && { ...annotationRecord }),
        };
        this.info = currInfo;
    }

    toJSON(): InsightIntentClassInfo {
        this.refresh();
        return {
            ...(this.info?.name && { name: this.info.name }),
            ...(this.info?.isDecl && { isDecl: this.info.isDecl }),
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
        };
    }
}
