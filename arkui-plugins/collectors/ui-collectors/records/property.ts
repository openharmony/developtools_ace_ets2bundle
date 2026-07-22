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
import { FileManager } from '../../../common/file-manager';
import { LANGUAGE_VERSION } from '../../../common/predefines';

export type PropertyInfo = AnnotationRecord<ArrowFunctionAnnotations, ArrowFunctionAnnotationInfo> & {
    isDeclFromLegacy?: boolean;
};

export class PropertyRecord extends BaseRecord<arkts.Property, PropertyInfo> {
    private _annotationRecord?: ArrowFunctionAnnotationRecord;
    private _isDeclFromLegacy?: boolean;

    constructor(options: RecordOptions) {
        super(options);
        this._annotationRecord = new ArrowFunctionAnnotationRecord(options);
    }

    collectFromNode(node: arkts.Property): void {
        const value = node.value;
        if (!value) {
            return;
        }
        if (arkts.isArrowFunctionExpression(value)) {
            // If arrow function property value is already collected, then we don't need to collect property.
            if (RecordCache.getInstance().has(value.peer)) {
                return;
            }
            for (const anno of value.annotations) {
                this._annotationRecord?.collect(anno);
            }
        } else if (arkts.isIdentifier(value)) {
            this.collectFromIdentifierValue(value);
        } 
    }

    private collectFromIdentifierValue(value: arkts.Identifier): void {
        const decl = arkts.getDecl(value);
        if (!decl || !arkts.isMethodDefinition(decl)) {
            return;
        }
        const path = arkts.getProgramFromAstNode(decl)?.absoluteName;
        const fileManager = FileManager.getInstance();
        if (!path || fileManager.getLanguageVersionByFilePath(path) !== LANGUAGE_VERSION.ARKTS_1_1) {
            return;
        }
        const annotations = decl.function?.annotations;
        if (!annotations) {
            return;
        }
        for (const annotation of annotations) {
            const expr = annotation.expr;
            if (arkts.isIdentifier(expr)) {
                const name = expr.name;
                if (name === 'Builder' || name === 'Memo' || name === 'memo') {
                    this._isDeclFromLegacy = true;
                    this._annotationRecord?.collect(annotation);
                    break;
                }
            }
        }
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        const annotationRecord = this._annotationRecord?.toRecord();
        currInfo = {
            ...currInfo,
            ...(this._isDeclFromLegacy && { isDeclFromLegacy: this._isDeclFromLegacy }),
            ...(annotationRecord && { ...annotationRecord }),
        };
        this.info = currInfo;
    }

    toJSON(): PropertyInfo {
        this.refresh();
        return {
            ...(this.info?.isDeclFromLegacy && { isDeclFromLegacy: this.info.isDeclFromLegacy }),
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
        };
    }
}
