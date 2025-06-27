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
import { CallDeclAnnotationInfo, CallDeclAnnotationRecord, CallDeclAnnotations } from './annotations';
import { AnnotationRecord } from './annotations/base';
import { BaseRecord, RecordOptions } from './base';
import { BuiltInNames, LANGUAGE_VERSION } from '../../../common/predefines';
import { FileManager } from '../../../common/file-manager';

export type CallDeclInfo = AnnotationRecord<CallDeclAnnotations, CallDeclAnnotationInfo> & {
    /**
     * declaration node's name.
     */
    declName?: string;

    /**
     * declaration node's modifier flags.
     */
    modifiers?: arkts.Es2pandaModifierFlags;

    /**
     * the module name where the declaration node is from.
     */
    moduleName?: string;

    /**
     * whether the call has function with receiver.
     */
    hasReceiver?: boolean;

    /**
     * whether the declaration node is a class property.
     */
    isDeclFromClassProperty?: boolean;

    /**
     * whether the declaration node is a class method.
     */
    isDeclFromMethod?: boolean;

    /**
     * whether declaration node is a global function.
     */
    isDeclFromFunction?: boolean;

    /**
     * whether declaration node is from legacy application.
     */
    isDeclFromLegacy?: boolean;
};

export class CallDeclRecord extends BaseRecord<arkts.AstNode, CallDeclInfo> {
    private _annotationRecord: CallDeclAnnotationRecord;

    protected declName?: string;
    protected modifiers?: arkts.Es2pandaModifierFlags;
    protected moduleName?: string;
    protected hasReceiver?: boolean;
    protected isDeclFromClassProperty?: boolean;
    protected isDeclFromMethod?: boolean;
    protected isDeclFromFunction?: boolean;
    protected isDeclFromLegacy?: boolean;

    constructor(options: RecordOptions) {
        super(options);
        this._annotationRecord = new CallDeclAnnotationRecord(options);
    }

    private collectAnnotations(annotations: readonly arkts.AnnotationUsage[], isFromLegacy?: boolean): void {
        if (!!isFromLegacy) {
            this._annotationRecord.shouldIgnoreDecl = true;
        }
        for (const anno of annotations) {
            this._annotationRecord.collect(anno);
        }
    }

    private collectFromClassProperty(node: arkts.ClassProperty): void {
        if (!node.key || !arkts.isIdentifier(node.key)) {
            return;
        }
        this.collectAnnotations(node.annotations);
        this.declName = node.key.name;
        this.modifiers = node.modifiers;
        this.isDeclFromClassProperty = true;
    }

    private collectFromMethod(node: arkts.MethodDefinition, isFromLegacy?: boolean): void {
        this.collectAnnotations(node.scriptFunction.annotations, isFromLegacy);
        this.declName = node.name.name;
        this.modifiers = node.modifiers;
        this.hasReceiver = node.scriptFunction.hasReceiver;
        if (
            !!node.parent &&
            arkts.isMethodDefinition(node.parent) &&
            node.parent.name.name === BuiltInNames.ETS_GLOBAL_CLASS
        ) {
            this.isDeclFromFunction = true;
        } else {
            this.isDeclFromMethod = true;
        }
    }

    private collectFromLegacy(sourceProgram: arkts.Program | undefined): void {
        const path = sourceProgram?.absName;
        if (!path) {
            return;
        }
        const fileManager = FileManager.getInstance();
        this.isDeclFromLegacy = fileManager.getLanguageVersionByFilePath(path) === LANGUAGE_VERSION.ARKTS_1_1;
    }

    protected collectFromNode(node: arkts.AstNode): void {
        const sourceProgram = arkts.getProgramFromAstNode(node);
        this.moduleName = sourceProgram?.moduleName;
        if (arkts.isClassProperty(node)) {
            this.collectFromClassProperty(node);
        } else if (arkts.isMethodDefinition(node)) {
            this.collectFromLegacy(sourceProgram);
            this.collectFromMethod(node, this.isDeclFromLegacy);
        }
    }

    protected refreshOnce(): void {
        let currInfo = this.info ?? {};
        const annotationRecord = this._annotationRecord.toRecord();
        currInfo = {
            ...currInfo,
            ...(this.declName && { declName: this.declName }),
            ...(this.modifiers && { modifiers: this.modifiers }),
            ...(this.hasReceiver && { hasReceiver: this.hasReceiver }),
            ...(this.moduleName && { moduleName: this.moduleName }),
            ...(this.isDeclFromClassProperty && { isDeclFromClassProperty: this.isDeclFromClassProperty }),
            ...(this.isDeclFromMethod && { isDeclFromMethod: this.isDeclFromMethod }),
            ...(this.isDeclFromFunction && { isDeclFromFunction: this.isDeclFromFunction }),
            ...(this.isDeclFromLegacy && { isDeclFromLegacy: this.isDeclFromLegacy }),
            ...(annotationRecord && { ...annotationRecord }),
        };
        this.info = currInfo;
    }

    toJSON(): CallDeclInfo {
        this.refresh();
        return {
            ...(this.info?.declName && { declName: this.info.declName }),
            ...(this.info?.modifiers && { modifiers: this.info.modifiers }),
            ...(this.info?.hasReceiver && { hasReceiver: this.info.hasReceiver }),
            ...(this.info?.moduleName && { moduleName: this.info.moduleName }),
            ...(this.info?.isDeclFromClassProperty && { isDeclFromClassProperty: this.info.isDeclFromClassProperty }),
            ...(this.info?.isDeclFromMethod && { isDeclFromMethod: this.info.isDeclFromMethod }),
            ...(this.info?.isDeclFromFunction && { isDeclFromFunction: this.info.isDeclFromFunction }),
            ...(this.info?.isDeclFromLegacy && { isDeclFromLegacy: this.info.isDeclFromLegacy }),
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
        };
    }
}
