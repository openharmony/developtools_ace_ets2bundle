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
import { CallDeclInfo, CallDeclRecord } from './call-declaration';
import { CustomComponentInfo, CustomComponentRecord } from './struct';
import { RecordBuilder } from './record-builder';
import {
    checkIsCallNameFromBindable,
    checkIsCallNameFromResource,
    checkIsStructFromNode,
    findRootCallee,
    findRootCallObject,
    getStructFromCall,
} from '../utils';
import { AstNodePointer } from '../../../common/safe-types';
import { ARKUI_IMPORT_PREFIX_NAMES, Dollars } from '../../../common/predefines';
import { matchPrefix } from '../../../common/arkts-utils';
import { DeclarationCollector } from '../../../common/declaration-collector';
import {
    CustomComponentInterfacePropertyInfo,
    CustomComponentInterfacePropertyRecord,
} from './struct-interface-property';

export type CallInfo = CallDeclInfo & {
    /**
     * this call node pointer
     */
    ptr?: AstNodePointer;

    /**
     * this call name (i.e. callee must be an Identifier), e.g calls like `a[0]()` has no call name
     */
    callName?: string;

    /**
     * a list of call infos start from the root call to this call in a chain (root call exclusive)
     */
    chainingCallInfos?: CallInfo[];

    /**
     * whether this call is from current class's method or property
     */
    isThis?: boolean;

    /**
     * whether this call has trailing lambda argument
     */
    isTrailingCall?: boolean;

    /**
     * whether this call is `$$()` bindable call
     */
    isBindableCall?: Dollars.DOLLAR_DOLLAR;

    /**
     * whether this call is `$r()` or `$rawfile()` resource call
     */
    isResourceCall?: Dollars.DOLLAR_RESOURCE | Dollars.DOLLAR_RAWFILE;

    /**
     * call information from this call's root (e.g. `A.b().c()` has root call `b()`), call is root call if not exist
     */
    rootCallInfo?: CallInfo;

    /**
     * struct information from this call's object, call is not a struct call if not exist
     */
    structDeclInfo?: CustomComponentInfo;

    /**
     * struct call's options argument information, call is not a struct call or no options argument if not exist
     */
    structPropertyInfos?: [AstNodePointer, CustomComponentInterfacePropertyInfo | undefined][];

    /**
     * struct information which contains this call, call is not in a struct if not exist
     */
    fromStructInfo?: CustomComponentInfo;
};

export class CallRecord extends BaseRecord<arkts.CallExpression, CallInfo> {
    private _declRecord: CallDeclRecord;
    private _structDeclRecord?: CustomComponentRecord;
    private _fromStructRecord?: CustomComponentRecord;
    private _structPropertyRecords?: [AstNodePointer, CustomComponentInterfacePropertyRecord][];

    protected callName?: string;
    protected ptr?: AstNodePointer;
    protected isThis?: boolean;
    protected isTrailingCall?: boolean;
    protected isBindableCall?: Dollars.DOLLAR_DOLLAR;
    protected isResourceCall?: Dollars.DOLLAR_RESOURCE | Dollars.DOLLAR_RAWFILE;
    protected declInfo?: CallDeclInfo;
    protected structDeclInfo?: CustomComponentInfo;
    protected fromStructInfo?: CustomComponentInfo;

    private _rootCallObject?: arkts.Identifier | undefined;
    private _rootCallee?: arkts.Identifier | undefined;
    private _rootCallInfo?: CallInfo;
    private _chainingCallInfos?: CallInfo[];

    constructor(options: RecordOptions) {
        super(options);
        this._declRecord = new CallDeclRecord(options);
    }

    get callPtr(): AstNodePointer | undefined {
        return this.ptr;
    }

    protected get rootCallInfo(): CallInfo | undefined {
        return this._rootCallInfo;
    }

    protected set rootCallInfo(rootCallInfo: CallInfo | undefined) {
        if (this._rootCallInfo?.ptr !== rootCallInfo?.ptr) {
            this._rootCallInfo = rootCallInfo;
            this.isChanged = true;
        }
    }

    protected get chainingCallInfos(): CallInfo[] | undefined {
        return this._chainingCallInfos;
    }

    protected set chainingCallInfos(chainingCallInfos: CallInfo[] | undefined) {
        this._chainingCallInfos = chainingCallInfos;
        this.isChanged = true;
    }

    protected get isStructCall(): boolean {
        return !!this._structDeclRecord?.isCollected || !!this.rootCallInfo?.structDeclInfo || !!this.structDeclInfo;
    }

    private checkIsThisFromCallee(callee: arkts.Identifier | undefined): boolean {
        if (!callee) {
            return false;
        }
        if (!callee.parent || !arkts.isMemberExpression(callee.parent)) {
            return false;
        }
        return callee.parent.object && arkts.isThisExpression(callee.parent.object);
    }

    private collectFromDecl(decl: arkts.AstNode | undefined): void {
        if (!decl) {
            return;
        }
        this._declRecord.collect(decl);
    }

    private collectStructDeclInfo(structNode: arkts.ClassDefinition | undefined): void {
        const struct = structNode?.parent;
        if (!struct || !arkts.isClassDeclaration(struct) || !checkIsStructFromNode(struct)) {
            return;
        }
        const _record = RecordBuilder.build(CustomComponentRecord, struct, this.getOptions());
        this._structDeclRecord = _record;
        if (!this._structDeclRecord.isCollected) {
            this._structDeclRecord.collect(struct);
        }
    }

    private collectStructPropertyInfoFromStructCall(call: arkts.CallExpression): void {
        if (!this.isStructCall || !!this._structPropertyRecords) {
            return;
        }
        const optionsArg = call.arguments.at(1); // Options is the second argument of a custom component call.
        if (!optionsArg || !arkts.isObjectExpression(optionsArg)) {
            return;
        }
        const records: [AstNodePointer, CustomComponentInterfacePropertyRecord][] = [];
        (optionsArg.properties as arkts.Property[]).forEach((prop) => {
            let decl: arkts.AstNode | undefined;
            if (
                !prop.key ||
                !prop.value ||
                !(decl = arkts.getPeerPropertyDecl(prop.peer)) ||
                !arkts.isMethodDefinition(decl)
            ) {
                return;
            }
            const structInterfacePropRecord = RecordBuilder.build(
                CustomComponentInterfacePropertyRecord,
                decl,
                this.getOptions()
            );
            if (!structInterfacePropRecord.isCollected) {
                structInterfacePropRecord.collect(decl);
            }
            records.push([prop.peer, structInterfacePropRecord]);
        });
        if (Object.keys(records).length > 0) {
            this._structPropertyRecords = records;
        }
    }

    private collectFromStructInfo(structNode: arkts.ClassDefinition | undefined): void {
        const struct = structNode?.parent;
        if (!struct || !arkts.isClassDeclaration(struct) || !checkIsStructFromNode(struct)) {
            return;
        }
        const _record = RecordBuilder.build(CustomComponentRecord, struct, this.getOptions());
        this._fromStructRecord = _record;
        if (!this._fromStructRecord.isCollected) {
            this._fromStructRecord.collect(struct);
        }
    }

    private findStructDeclInfo(): void {
        if (!!this.rootCallInfo?.structDeclInfo) {
            this.structDeclInfo = this.rootCallInfo.structDeclInfo;
        } else if (!this.structDeclInfo) {
            const structNode = getStructFromCall(this._rootCallObject, this._rootCallee);
            this.collectStructDeclInfo(structNode);
        }
    }

    private findFromStructInfo(): void {
        if (!!this.rootCallInfo?.fromStructInfo) {
            this.fromStructInfo = this.rootCallInfo.fromStructInfo;
        } else if (!this.fromStructInfo) {
            const structNode = this._rootCallee?.findOuterParent<arkts.ClassDefinition>(
                arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_DEFINITION
            );
            this.collectFromStructInfo(structNode);
        }
    }

    private findResourceCall(decl: arkts.AstNode, declInfo: CallDeclInfo): void {
        const name = declInfo.declName;
        const moduleName = declInfo.moduleName;
        if (!this.shouldIgnoreDecl && (!moduleName || !matchPrefix(ARKUI_IMPORT_PREFIX_NAMES, moduleName))) {
            return;
        }
        if (!name || !checkIsCallNameFromResource(name)) {
            return;
        }
        this.isResourceCall = name;
        DeclarationCollector.getInstance().collect(decl);
    }

    private findBinableCall(decl: arkts.AstNode, declInfo: CallDeclInfo): void {
        const name = declInfo.declName;
        const moduleName = declInfo.moduleName;
        if (!this.shouldIgnoreDecl && (!moduleName || !matchPrefix(ARKUI_IMPORT_PREFIX_NAMES, moduleName))) {
            return;
        }
        if (!name || !checkIsCallNameFromBindable(name)) {
            return;
        }
        this.isBindableCall = name;
        DeclarationCollector.getInstance().collect(decl);
    }

    private findIsSpecialCall(decl?: arkts.AstNode): void {
        const declInfo = this._declRecord.toRecord();
        if (!decl || !declInfo || !declInfo.declName) {
            return;
        }
        this.findBinableCall(decl, declInfo);
        this.findResourceCall(decl, declInfo);
    }

    withRootCallee(rootCallee: arkts.Identifier | undefined): this {
        this._rootCallee = rootCallee;
        this.findStructDeclInfo();
        this.findFromStructInfo();
        return this;
    }

    withRootCallObject(rootCallObject: arkts.Identifier | undefined): this {
        this._rootCallObject = rootCallObject;
        this.findStructDeclInfo();
        return this;
    }

    withRootCallInfo(rootCallInfo: CallInfo): this {
        this.rootCallInfo = rootCallInfo;
        this.findStructDeclInfo();
        this.findFromStructInfo();
        return this;
    }

    withChainingCallInfos(chainingCallInfos: CallInfo[]): this {
        this.chainingCallInfos = chainingCallInfos;
        return this;
    }

    collectFromNode(node: arkts.CallExpression): void {
        this.ptr = node.peer;

        const callee = node.expression;
        this._rootCallObject = this._rootCallObject ?? findRootCallObject(callee);
        this._rootCallee = this._rootCallee ?? findRootCallee(callee);
        this.callName = this._rootCallee?.name;
        this.isThis = this.checkIsThisFromCallee(this._rootCallee);
        this.isTrailingCall = node.isTrailingCall;
        this.findStructDeclInfo();
        this.findFromStructInfo();
        this.collectStructPropertyInfoFromStructCall(node);

        if (!!this._rootCallee) {
            const decl = arkts.getPeerIdentifierDecl(this._rootCallee.peer);
            this.collectFromDecl(decl);
            this.findIsSpecialCall(decl);
        }
    }

    toPropertyRecords(): [AstNodePointer, CustomComponentInterfacePropertyInfo | undefined][] | undefined {
        if (!this._structPropertyRecords) {
            return undefined;
        }
        const records: [AstNodePointer, CustomComponentInterfacePropertyInfo | undefined][] = [];
        this._structPropertyRecords.forEach((record) => {
            records.push([record[0], record[1].toRecord()]);
        });
        return records;
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        const declRecord = this._declRecord.toRecord();
        const structDeclInfo = this.structDeclInfo ?? this._structDeclRecord?.toRecord();
        const fromStructInfo = this.fromStructInfo ?? this._fromStructRecord?.toRecord();
        const structPropertyInfos = this.toPropertyRecords();
        currInfo = {
            ...currInfo,
            ...(this.ptr && { ptr: this.ptr }),
            ...(this.callName && { callName: this.callName }),
            ...(this.chainingCallInfos && { chainingCallInfos: this.chainingCallInfos }),
            ...(this.isThis && { isThis: this.isThis }),
            ...(this.isTrailingCall && { isTrailingCall: this.isTrailingCall }),
            ...(this.isBindableCall && { isBindableCall: this.isBindableCall }),
            ...(this.isResourceCall && { isResourceCall: this.isResourceCall }),
            ...(declRecord && { ...declRecord }),
            ...(this.rootCallInfo && { rootCallInfo: this.rootCallInfo }),
            ...(structDeclInfo && { structDeclInfo }),
            ...(fromStructInfo && { fromStructInfo }),
            ...(structPropertyInfos && { structPropertyInfos }),
        };
        this.info = currInfo;
    }

    toPropertyJSONs(): [AstNodePointer, CustomComponentInterfacePropertyInfo | undefined][] | undefined {
        if (!this._structPropertyRecords) {
            return undefined;
        }
        const records: [AstNodePointer, CustomComponentInterfacePropertyInfo | undefined][] = [];
        this._structPropertyRecords.forEach((record) => {
            records.push([-1, record[1].toJSON()]);
        });
        return records;
    }

    toRootCallJSON(): CallInfo | undefined {
        if (!this.info || !this.info.rootCallInfo) {
            return undefined;
        }
        const rootInfo = this.info.rootCallInfo;
        return {
            ...(rootInfo.callName && { callName: rootInfo.callName }),
            ...(rootInfo.isThis && { isThis: rootInfo.isThis }),
            ...(rootInfo.isTrailingCall && { isTrailingCall: rootInfo.isTrailingCall }),
            ...(rootInfo.isBindableCall && { isBindableCall: rootInfo.isBindableCall }),
            ...(rootInfo.isResourceCall && { isResourceCall: rootInfo.isResourceCall }),
            ...(rootInfo.declName && { declName: rootInfo.declName }),
            ...(rootInfo.modifiers && { modifiers: rootInfo.modifiers }),
            ...(rootInfo.moduleName && { moduleName: rootInfo.moduleName }),
            ...(rootInfo.isDeclFromClassProperty && { isDeclFromClassProperty: rootInfo.isDeclFromClassProperty }),
            ...(rootInfo.isDeclFromMethod && { isDeclFromMethod: rootInfo.isDeclFromMethod }),
            ...(rootInfo.isDeclFromFunction && { isDeclFromFunction: rootInfo.isDeclFromFunction }),
            ...(rootInfo.annotationInfo && { annotationInfo: rootInfo.annotationInfo }),
        };
    }

    toChainJSON(): CallInfo {
        this.refresh();
        const declInfo = this._declRecord.toJSON();
        return {
            ...(this.info?.callName && { callName: this.info.callName }),
            ...(this.info?.isTrailingCall && { isTrailingCall: this.info.isTrailingCall }),
            ...(declInfo && { ...declInfo }),
        };
    }

    toJSON(): CallInfo {
        this.refresh();
        const declInfo = this._declRecord.toJSON();
        const rootCallInfo = this.toRootCallJSON();
        const structDeclInfo = this._structDeclRecord?.toJSON();
        const fromStructInfo = this._fromStructRecord?.toJSON();
        const structPropertyInfos = this.toPropertyJSONs();
        return {
            ...(this.info?.callName && { callName: this.info.callName }),
            ...(this.info?.chainingCallInfos && { chainingCallInfos: this.info.chainingCallInfos }),
            ...(this.info?.isThis && { isThis: this.info.isThis }),
            ...(this.info?.isTrailingCall && { isTrailingCall: this.info.isTrailingCall }),
            ...(this.info?.isBindableCall && { isBindableCall: this.info.isBindableCall }),
            ...(this.info?.isResourceCall && { isResourceCall: this.info.isResourceCall }),
            ...(declInfo && { ...declInfo }),
            ...(rootCallInfo && { rootCallInfo }),
            ...(structDeclInfo && { structDeclInfo }),
            ...(fromStructInfo && { fromStructInfo }),
            ...(structPropertyInfos && { structPropertyInfos }),
        };
    }
}
