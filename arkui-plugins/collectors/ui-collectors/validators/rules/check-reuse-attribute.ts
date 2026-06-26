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
import { BaseValidator } from '../base';
import { CallInfo, CustomComponentInfo } from '../../records';
import { ChainingCallDataSource } from '../../chaining-call-data-source';
import { LogType } from '../../../../common/predefines';
import { createSuggestion, getPositionRangeFromNode } from '../../../../common/log-collector';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkReuseAttribute = performanceLog(
    _checkReuseAttribute,
    getPerfName([0, 0, 0, 0, 0], 'checkReuseAttribute')
);

const ReuseConstants = {
    REUSE: 'reuse',
    REUSE_ID: 'reuseId',
};

const INVALID_REUSE_USAGE = `The reuse attribute is only applicable to custom components decorated with both @ComponentV2 and @ReusableV2.`;
const INVALID_REUSE_ID_USAGE = `The reuseId attribute is not applicable to custom components decorated with both @ComponentV2 and @ReusableV2.`;

const CHANGE_REUSE_TO_REUSE_ID = `Change reuse to reuseId`;
const CHANGE_REUSE_ID_TO_REUSE = `Change reuseId to reuse`;

/**
 * 校验规则：用于验证`reuse` 和`reuseId`属性时需要遵循的具体约束和条件
 * 1. `reuse` 属性只能用于同时使用了 `@ComponentV2` 和 `@ReusableV2` 装饰器的自定义组件。
 * 2. `reuseId` 属性不能用于同时使用了 `@ComponentV2` 和 `@ReusableV2` 装饰器的自定义组件。
 *
 * 校验等级：error
 */
function _checkReuseAttribute(this: BaseValidator<arkts.CallExpression, CallInfo>, node: arkts.CallExpression): void {
    const metadata = this.context ?? {};
    const structDeclInfo = metadata.rootCallInfo?.structDeclInfo ?? metadata.structDeclInfo;
    const fromStructInfo = metadata.rootCallInfo?.fromStructInfo ?? metadata.fromStructInfo;
    if (!structDeclInfo || !fromStructInfo) {
        return;
    }
    const chains = metadata.chainingCallInfos ?? metadata.rootCallInfo?.chainingCallInfos;
    if (!chains) {
        return;
    }
    const chainingDataSource = ChainingCallDataSource.getInstance();
    let reuseChainIdx = -1;
    for (let idx = 0; idx < chains.length; idx++) {
        const callName = chains[idx]?.callName;
        if (callName === ReuseConstants.REUSE || callName === ReuseConstants.REUSE_ID) {
            reuseChainIdx = idx;
            break;
        }
    }
    if (reuseChainIdx < 0) {
        return;
    }
    const reuseChainCall = chainingDataSource.chainingCalls.at(reuseChainIdx);
    if (!reuseChainCall) {
        return;
    }
    const definitionPtr = structDeclInfo.definitionPtr;
    if (!definitionPtr) {
        return;
    }
    const structDefinition = arkts.unpackNonNullableNode<arkts.ClassDefinition>(definitionPtr);
    if (!structDefinition || !structDefinition.parent || !arkts.isClassDeclaration(structDefinition.parent)) {
        return;
    }
    const reusePropertyNameNode = getReusePropertyNameNode(reuseChainCall);
    checkReuseAttributeRule.bind(this)(structDeclInfo, node, chains[reuseChainIdx]!.callName!, reusePropertyNameNode);
}

function checkReuseAttributeRule(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    structDeclInfo: CustomComponentInfo,
    reuseCallNode: arkts.CallExpression,
    propertyName: string,
    reusePropertyNameNode: arkts.AstNode | undefined
): void {
    const annoInfo = structDeclInfo.annotationInfo;
    if (!annoInfo) {
        return;
    }
    const hasComponentV2AndReusableV2 = !!annoInfo?.hasComponentV2 && !!annoInfo.hasReusableV2;
    const targetNode = reusePropertyNameNode ?? reuseCallNode;
    if (propertyName === ReuseConstants.REUSE && !hasComponentV2AndReusableV2) {
        reportInvalidReuseUsage.bind(this)(reuseCallNode, targetNode);
    }
    if (propertyName === ReuseConstants.REUSE_ID && hasComponentV2AndReusableV2) {
        reportInvalidReuseIdUsage.bind(this)(reuseCallNode, targetNode);
    }
}

function getReusePropertyNameNode(reuseChainCall: arkts.CallExpression): arkts.AstNode | undefined {
    if (!arkts.isMemberExpression(reuseChainCall.callee)) {
        return undefined;
    }
    return reuseChainCall.callee.property;
}

function reportInvalidReuseUsage(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.AstNode,
    decoratedNode: arkts.AstNode
): void {
    this.report({
        node: node,
        level: LogType.ERROR,
        message: INVALID_REUSE_USAGE,
        suggestions: [createSuggestion(
            ReuseConstants.REUSE_ID,
            ...getPositionRangeFromNode(decoratedNode),
            CHANGE_REUSE_TO_REUSE_ID
        )],
    });
}

function reportInvalidReuseIdUsage(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.AstNode,
    decoratedNode: arkts.AstNode
): void {
    this.report({
        node: node,
        level: LogType.ERROR,
        message: INVALID_REUSE_ID_USAGE,
        suggestions: [createSuggestion(
            ReuseConstants.REUSE,
            ...getPositionRangeFromNode(decoratedNode),
            CHANGE_REUSE_ID_TO_REUSE
        )],
    });
}
