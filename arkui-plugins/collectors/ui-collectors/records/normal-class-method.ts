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
import { BaseRecord, RecordOptions } from './base';
import { NormalClassInfo, NormalClassRecord } from './normal-class';
import { AnnotationRecord } from './annotations/base';
import {
    NormalClassMethodAnnotationInfo,
    NormalClassMethodAnnotationRecord,
    NormalClassMethodAnnotations,
} from './annotations';
import { NormalClassPropertyInfo, NormalClassPropertyRecord } from './normal-class-property';

export type NormalClassMethodInfo = AnnotationRecord<NormalClassMethodAnnotations, NormalClassMethodAnnotationInfo> & {
    classInfo?: NormalClassInfo;
    inheritPorpertyInfo?: NormalClassPropertyInfo;
    name?: string;
    modifiers?: arkts.Es2pandaModifierFlags;
    kind?: arkts.Es2pandaMethodDefinitionKind;
    isDecl?: boolean;
};

export interface NormalClassMethodRecordOptions extends RecordOptions {
    classRecord?: NormalClassRecord;
}

export class NormalClassMethodRecord extends BaseRecord<arkts.MethodDefinition, NormalClassMethodInfo> {
    private _annotationRecord: NormalClassMethodAnnotationRecord;
    private _classRecord?: NormalClassRecord;
    private _inheritPropertyRecord?: NormalClassPropertyRecord;

    protected name?: string;
    protected modifiers?: arkts.Es2pandaModifierFlags;
    protected kind?: arkts.Es2pandaMethodDefinitionKind;
    protected isDecl?: boolean;

    constructor(options: NormalClassMethodRecordOptions) {
        super(options);
        this._classRecord = options.classRecord;
        this._annotationRecord = new NormalClassMethodAnnotationRecord(options);
    }

    withInheritPropertyRecord(propertyRecord: NormalClassPropertyRecord): this {
        this._inheritPropertyRecord = propertyRecord;
        return this;
    }

    collectFromNode(node: arkts.MethodDefinition): void {
        this.name = node.name.name;
        this.modifiers = node.modifiers;
        this.kind = node.kind;
        this.isDecl = arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
        for (const anno of node.scriptFunction.annotations) {
            this._annotationRecord.collect(anno);
        }
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        const annotationRecord = this._annotationRecord.toRecord();
        const classRecord = this._classRecord?.toRecord();
        const inheritPorpertyInfo = this._inheritPropertyRecord?.toRecord();
        currInfo = {
            ...currInfo,
            ...(this.name && { name: this.name }),
            ...(this.modifiers && { modifiers: this.modifiers }),
            ...(this.kind && { kind: this.kind }),
            ...(this.isDecl && { isDecl: this.isDecl }),
            ...(annotationRecord && { ...annotationRecord }),
            ...(classRecord && { classInfo: classRecord }),
            ...(inheritPorpertyInfo && { inheritPorpertyInfo }),
        };
        this.info = currInfo;
    }

    toJSON(): NormalClassMethodInfo {
        this.refresh();
        const classInfo = this._classRecord?.toJSON();
        const inheritPorpertyInfo = this._inheritPropertyRecord?.toJSON();
        return {
            ...(this.info?.name && { name: this.info.name }),
            ...(this.info?.modifiers && { modifiers: this.info.modifiers }),
            ...(this.info?.kind && { kind: this.info.kind }),
            ...(this.info?.isDecl && { isDecl: this.info.isDecl }),
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
            ...(classInfo && { classInfo }),
            ...(inheritPorpertyInfo && { inheritPorpertyInfo }),
        };
    }
}
