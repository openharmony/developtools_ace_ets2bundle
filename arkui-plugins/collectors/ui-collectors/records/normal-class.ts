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
import { NormalClassAnnotationInfo, NormalClassAnnotationRecord, NormalClassAnnotations } from './annotations';
import { AnnotationRecord } from './annotations/base';
import { BaseRecord, RecordOptions } from './base';
import { RecordCache } from './cache';
import { BuiltInNames } from '../../../common/predefines';
import { AstNodePointer } from '../../../common/safe-types';

export type NormalClassInfo = AnnotationRecord<NormalClassAnnotations, NormalClassAnnotationInfo> & {
    /**
     * class defintion node's pointer.
     */
    definitionPtr?: AstNodePointer;

    /**
     * class name.
     */
    name?: string;

    /**
     * whether this class is declared.
     */
    isDecl?: boolean;

    /**
     * whether this class is ETSGLOBAL class.
     */
    isETSGlobal?: boolean;

    /**
     * whether this class has `@Track` property.
     */
    hasTrackProperty?: boolean;
};

export class NormalClassRecord extends BaseRecord<arkts.ClassDeclaration, NormalClassInfo> {
    private _annotationRecord: NormalClassAnnotationRecord;

    protected definitionPtr?: AstNodePointer;
    protected name?: string;
    protected isDecl?: boolean;
    protected isETSGlobal?: boolean;
    protected hasTrackProperty?: boolean;

    constructor(options: RecordOptions) {
        super(options);
        this._annotationRecord = new NormalClassAnnotationRecord(options);
    }

    setHasTrackProperty(hasTrackProperty: boolean): this {
        this.hasTrackProperty = hasTrackProperty ?? undefined;
        this.isChanged = true;
        return this;
    }

    collectFromNode(node: arkts.ClassDeclaration): void {
        const definition: arkts.ClassDefinition | undefined = node.definition;
        if (!definition || !definition?.ident?.name) {
            return;
        }
        this.name = definition.ident.name;
        this.definitionPtr = definition.peer;
        this.isETSGlobal = this.name === BuiltInNames.ETS_GLOBAL_CLASS;
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
            ...(this.isETSGlobal && { isETSGlobal: this.isETSGlobal }),
            ...(this.definitionPtr && { definitionPtr: this.definitionPtr }),
            ...(this.hasTrackProperty && { hasTrackProperty: this.hasTrackProperty }),
            ...(annotationRecord && { ...annotationRecord }),
        };
        this.info = currInfo;
    }

    toJSON(): NormalClassInfo {
        this.refresh();
        return {
            ...(this.info?.name && { name: this.info.name }),
            ...(this.info?.isDecl && { isDecl: this.info.isDecl }),
            ...(this.info?.isETSGlobal && { isETSGlobal: this.info.isETSGlobal }),
            ...(this.info?.hasTrackProperty && { hasTrackProperty: this.info.hasTrackProperty }),
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
        };
    }
}
