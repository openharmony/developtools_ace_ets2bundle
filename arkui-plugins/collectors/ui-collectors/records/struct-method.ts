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
import { StructMethodAnnotationInfo, StructMethodAnnotationRecord, StructMethodAnnotations } from './annotations';
import { AnnotationRecord } from './annotations/base';
import { BaseRecord, RecordOptions } from './base';
import { CustomComponentRecord, CustomComponentInfo } from './struct';
import { CustomComponentNames } from '../../../common/predefines';
import { RecordCache } from './cache';

export type StructMethodInfo = AnnotationRecord<StructMethodAnnotations, StructMethodAnnotationInfo> & {
    structInfo?: CustomComponentInfo;
    name?: string;
    modifiers?: arkts.Es2pandaModifierFlags;
    kind?: arkts.Es2pandaMethodDefinitionKind;
    isDecl?: boolean;
    isCtor?: boolean;
};

export interface StructMethodRecordOptions extends RecordOptions {
    structRecord?: CustomComponentRecord;
}

export class StructMethodRecord extends BaseRecord<arkts.MethodDefinition, StructMethodInfo> {
    private _annotationRecord: StructMethodAnnotationRecord;
    private _structRecord?: CustomComponentRecord;

    protected name?: string;
    protected modifiers?: arkts.Es2pandaModifierFlags;
    protected kind?: arkts.Es2pandaMethodDefinitionKind;
    protected isDecl?: boolean;
    protected isCtor?: boolean;

    constructor(options: StructMethodRecordOptions) {
        super(options);
        this._structRecord = options.structRecord;
        this._annotationRecord = new StructMethodAnnotationRecord(options);
    }

    collectFromNode(node: arkts.MethodDefinition): void {
        this.name = node.id?.name;
        this.modifiers = node.modifiers;
        this.kind = node.kind;
        this.isDecl = arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
        this.isCtor = this.name === CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI;
        for (const anno of node.function.annotations) {
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
            ...(this.kind && { kind: this.kind }),
            ...(this.isDecl && { isDecl: this.isDecl }),
            ...(this.isCtor && { isCtor: this.isCtor }),
            ...(annotationRecord && { ...annotationRecord }),
            ...(structRecord && { structInfo: structRecord }),
        };
        this.info = currInfo;
    }

    toJSON(): StructMethodInfo {
        this.refresh();
        const structInfo = this._structRecord?.toJSON();
        return {
            ...(this.info?.name && { name: this.info.name }),
            ...(this.info?.modifiers && { modifiers: this.info.modifiers }),
            ...(this.info?.kind && { kind: this.info.kind }),
            ...(this.info?.isDecl && { isDecl: this.info.isDecl }),
            ...(this.info?.isCtor && { isCtor: this.info.isCtor }),
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
            ...(structInfo && { structInfo }),
        };
    }
}
