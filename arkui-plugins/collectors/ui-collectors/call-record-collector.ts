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
import { CallInfo, CallRecord } from './records';
import { UICollectMetadata } from './shared-types';
import { checkIsCallFromLegacyBuilderFromInfo, checkIsCustomComponentFromInfo, checkIsInteropComponentCallFromInfo, findRootCallee, findRootCallObject } from './utils';
import { CallValidator, ValidatorBuilder } from './validators';
import { NodeCacheNames } from '../../common/predefines';
import { AstNodePointer } from '../../common/safe-types';

export interface CallRecordInfo {
    call: arkts.CallExpression;
    callRecord: CallRecord;
}

export class CallRecordCollector {
    private static instance: CallRecordCollector;
    private _metadata: UICollectMetadata;
    private _prevCallInfo?: CallRecordInfo;
    private _chainingCallData: ChainingCallDataSource;
    private _inChainCalls: Set<AstNodePointer>;

    public externalSourceName: string | undefined;

    private constructor(metadata: UICollectMetadata) {
        this._metadata = metadata;
        this._inChainCalls = new Set();
        this._chainingCallData = new ChainingCallDataSource();
    }

    static getInstance(metadata: UICollectMetadata): CallRecordCollector {
        if (!this.instance) {
            this.instance = new CallRecordCollector(metadata);
        }
        return this.instance;
    }

    get lastCallInfo(): CallRecordInfo | undefined {
        return this._prevCallInfo;
    }

    get chainingCallData(): ChainingCallDataSource {
        return this._chainingCallData;
    }

    private canCollectLegacyCallFromInfo(info: CallInfo): boolean {
        const rootCallInfo = info;
        if (checkIsCallFromLegacyBuilderFromInfo(rootCallInfo)) {
            return true;
        }
        if (checkIsInteropComponentCallFromInfo(rootCallInfo)) {
            return true;
        }
        return false;
    }

    private canCollectCallFromInfo(info: CallInfo): boolean {
        const rootCallInfo = info;
        if (!!rootCallInfo.isDeclFromLegacy) {
            return this.canCollectLegacyCallFromInfo(rootCallInfo);
        }
        if (!!rootCallInfo.annotationInfo?.hasComponentBuilder || !!rootCallInfo.annotationInfo?.hasBuilder) {
            return true;
        }
        if (!!rootCallInfo.isResourceCall || !!rootCallInfo.isBindableCall) {
            return true;
        }
        if (!!rootCallInfo.structDeclInfo && checkIsCustomComponentFromInfo(rootCallInfo.structDeclInfo)) {
            return true;
        }
        return false;
    }

    withExternalSourceName(externalSourceName: string | undefined): this {
        this.externalSourceName = externalSourceName;
        return this;
    }

    reset(): void {
        this._prevCallInfo = undefined;
        this._chainingCallData.reset();
        this._inChainCalls.clear();
    }

    collect(call: arkts.CallExpression, isFromChainCall?: boolean): void {
        if (arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).has(call)) {
            return;
        }
        if (this._inChainCalls.has(call.peer)) {
            this._inChainCalls.delete(call.peer);
            return;
        }
        if (!!isFromChainCall) {
            this._inChainCalls.add(call.peer);
        }
        const callRecord = new CallRecord(this._metadata);
        // collect external information from current call.
        const rootCallObject = findRootCallObject(call.expression);
        const rootCallee = findRootCallee(call.expression);
        callRecord.withRootCallObject(rootCallObject).withRootCallee(rootCallee);
        if (this._chainingCallData.isWithInChain()) {
            callRecord.withRootCallInfo(this._chainingCallData.rootCallInfo!.callRecord.toRecord()!);
            callRecord.withChainingCallInfos(this._chainingCallData.chainingCallInfos);
        }
        // collect internal information from current call.
        callRecord.collect(call);
        const callInfo = callRecord.toRecord();
        if (!callInfo) {
            return;
        }
        this._prevCallInfo = { call, callRecord };
        this._chainingCallData.setRootCallInfo({ call, callRecord }).addChainingCallInfo(callRecord.toChainJSON());
        if (this.canCollectCallFromInfo(callInfo)) {
            collectCallAndAllParentCalls.bind(this)(call, callRecord);
        } else {
            ValidatorBuilder.build(CallValidator).checkIsViolated(call, callInfo);
        }
        if (!isFromChainCall) {
            this._chainingCallData.reset();
        }
    }
}

class ChainingCallDataSource {
    rootCallInfo: CallRecordInfo | undefined;
    chainingCallInfos: CallInfo[];

    constructor(rootCallInfo?: CallRecordInfo, chainingCallInfos?: CallInfo[]) {
        this.rootCallInfo = rootCallInfo;
        this.chainingCallInfos = chainingCallInfos ?? [];
    }

    isWithInChain(): boolean {
        return !!this.rootCallInfo && !!this.chainingCallInfos && this.chainingCallInfos.length > 0;
    }

    setRootCallInfo(rootCallInfo: CallRecordInfo): this {
        if (!this.rootCallInfo) {
            this.rootCallInfo = rootCallInfo;
        }
        return this;
    }

    addChainingCallInfo(chainingCallInfo: CallInfo): this {
        this.chainingCallInfos.push(chainingCallInfo);
        return this;
    }

    reset(): void {
        this.rootCallInfo = undefined;
        this.chainingCallInfos = [];
    }
}

function parametersBlockHasReceiver(params: readonly arkts.Expression[]): boolean {
    return params.length > 0 && arkts.isEtsParameterExpression(params[0]) && isThisParam(params[0]);
}

function isThisParam(node: arkts.Expression | undefined): boolean {
    if (node === undefined || !arkts.isEtsParameterExpression(node)) {
        return false;
    }
    return node.identifier?.isReceiver ?? false;
}

function parametrizedNodeHasReceiver(node: arkts.ScriptFunction | undefined): boolean {
    if (node === undefined) {
        return false;
    }
    return parametersBlockHasReceiver(node.params);
}

function checkParentHasChainInThisCall(thisCall: arkts.CallExpression, parent: arkts.CallExpression): boolean {
    const parentCallee = parent.expression;
    if (parentCallee.findNodeInInnerChild(thisCall)) {
        // this impiles the parent call has inner callee of this call.
        return true;
    }
    const args = parent.arguments;
    if (args.length === 0 || !args.at(0)) {
        return false;
    }
    const firstArg = args.at(0)!;
    if ((firstArg.peer === thisCall.peer) || firstArg.findNodeInInnerChild(thisCall)) {
        // whether the first argument has inner child of this call, impling possible function receiver call.
        const callee = findRootCallee(parent.expression);
        const decl = !!callee ? arkts.getPeerIdentifierDecl(callee.peer) : undefined;
        return !!decl && arkts.isMethodDefinition(decl) && parametrizedNodeHasReceiver(decl.scriptFunction);
    }
    return false;
}

function collectCallAndAllParentCalls(
    this: CallRecordCollector,
    call: arkts.CallExpression,
    callRecord: CallRecord
): void {
    const uiNodeCache = arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI);
    let prevCall: arkts.CallExpression = call;
    let currParent: arkts.AstNode | undefined = call.parent;
    while (!!currParent) {
        if (arkts.isCallExpression(currParent)) {
            if (!checkParentHasChainInThisCall(prevCall, currParent)) {
                break;
            }
            this.collect(currParent, true);
            prevCall = currParent;
        }
        currParent = currParent.parent;
    }
    const { call: lastCall, callRecord: lastCallRecord } = this.lastCallInfo ?? { call, callRecord };
    ValidatorBuilder.build(CallValidator).checkIsViolated(lastCall, lastCallRecord.toRecord());
    uiNodeCache.collect(lastCall, lastCallRecord.toJSON());
    this.chainingCallData.reset();
}
