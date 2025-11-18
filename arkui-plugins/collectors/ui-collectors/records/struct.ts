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
import { checkIsCustomComponentDeclaredClassFromInfo, checkIsStructFromNode } from '../utils';
import { AstNodePointer } from '../../../common/safe-types';
import { RecordCache } from './cache';

export type CustomComponentInfo = AnnotationRecord<CustomComponentAnnotations, StructAnnotationInfo> & {
    /**
     * class defintion node's pointer.
     */
    definitionPtr?: AstNodePointer;

    /**
     * struct name, or declared `CustomComponent` etcs. name in header files.
     */
    name?: string;

    /**
     * whether struct or declared `CustomComponent` is from ArkUI SDK.
     */
    isFromArkUI?: boolean;

    /**
     * whether this struct or `CustomComponent` class is declared.
     */
    isDecl?: boolean;

    /**
     * whether this struct is from legacy application.
     */
    isLegacy?: boolean;
};

export class CustomComponentRecord extends BaseRecord<arkts.ClassDeclaration, CustomComponentInfo> {
    private _annotationRecord: CustomComponentAnnotationRecord;

    protected definitionPtr?: AstNodePointer;
    protected name?: string;
    protected isDecl?: boolean;
    protected isFromArkUI?: boolean;
    protected isLegacy?: boolean;

    constructor(options: RecordOptions) {
        super(options);
        this._annotationRecord = new CustomComponentAnnotationRecord(options);
    }

    withIsFromArkUI(isFromArkUI: boolean): this {
        this.isFromArkUI = isFromArkUI;
        return this;
    }

    collectFromNode(node: arkts.ClassDeclaration): void {
        const definition: arkts.ClassDefinition | undefined = node.definition;
        if (!definition) {
            return;
        }
        const name = definition.ident?.name;
        if (!name) {
            return;
        }
        const isDecl = arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
        const isLegacy = definition.lang === arkts.Es2pandaLanguage.JS;
        const isStruct = checkIsStructFromNode(node, !isLegacy);
        const isCustomComponentClass = checkIsCustomComponentDeclaredClassFromInfo({
            name,
            isDecl,
            isFromArkUI: this.isFromArkUI,
        });
        if (!isStruct && !isCustomComponentClass) {
            return;
        }
        this.name = name;
        this.isDecl = isDecl;
        if (isStruct) {
            for (const anno of definition.annotations) {
                this._annotationRecord.collect(anno);
            }
            this.definitionPtr = definition.peer;
            this.isLegacy = isLegacy;
            RecordCache.getInstance().set(node.peer, this);
        }
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        const annotationRecord = this._annotationRecord.toRecord();
        currInfo = {
            ...currInfo,
            ...(this.name && { name: this.name }),
            ...(this.isDecl && { isDecl: this.isDecl }),
            ...(this.isFromArkUI && { isFromArkUI: this.isFromArkUI }),
            ...(this.isLegacy && { isLegacy: this.isLegacy }),
            ...(this.definitionPtr && { definitionPtr: this.definitionPtr }),
            ...(annotationRecord && { ...annotationRecord }),
        };
        this.info = currInfo;
    }

    toJSON(): CustomComponentInfo {
        this.refresh();
        return {
            ...(this.info?.name && { name: this.info.name }),
            ...(this.info?.isDecl && { isDecl: this.info.isDecl }),
            ...(this.info?.isFromArkUI && { isFromArkUI: this.info.isFromArkUI }),
            ...(this.info?.isLegacy && { isLegacy: this.info.isLegacy }),
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
        };
    }
}
