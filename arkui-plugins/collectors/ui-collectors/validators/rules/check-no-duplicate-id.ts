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
import { CallInfo } from '../../records';
import { findRootCallee } from '../../utils';
import { ChainingCallDataSource } from '../../chaining-call-data-source';
import { LogType } from '../../../../common/predefines';
import {
    checkIsCallFromInnerComponentOrExtendFromInfo,
    checkIsValidChainingDataSource,
    getCurrentFilePath,
} from '../utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkNoDuplicateId = performanceLog(
    _checkNoDuplicateId,
    getPerfName([0, 0, 0, 0, 0], 'checkNoDuplicateId')
);

export function resetNoDuplicateId(): void {
    usedIds.clear();
}

interface IdInfo {
    value: string;
    node: arkts.AstNode;
}

const ID_NAME: string = 'id';

const usedIds: Map<string, IdInfo> = new Map<string, IdInfo>();

/**
 * 校验规则：用于验证组件的唯一标识符（ID）
 * 1. 组件的唯一标识符（ID）不可重复
 *
 * 校验等级：error
 */
function _checkNoDuplicateId(this: BaseValidator<arkts.CallExpression, CallInfo>, node: arkts.CallExpression): void {
    const metadata = this.context ?? {};
    // Check whether it is from inner components or from `@AnimatableExtend`
    if (!checkIsCallFromInnerComponentOrExtendFromInfo(metadata)) {
        return;
    }
    // Check whether it has chaining calls
    if (!metadata.chainingCallInfos || metadata.chainingCallInfos.length === 0) {
        return;
    }
    // Check whether chaining data is collected correctly
    const chainingDataSource = ChainingCallDataSource.getInstance();
    if (!checkIsValidChainingDataSource(chainingDataSource, metadata)) {
        return;
    }
    for (let idx = 0; idx < chainingDataSource.chainingCalls.length; idx++) {
        const chainCall = chainingDataSource.chainingCalls.at(idx);
        const chainingCallInfo = chainingDataSource.chainingCallInfos.at(idx);
        if (!chainCall || !chainingCallInfo) {
            break;
        }
        const callName = chainingCallInfo.callName!;
        if (callName !== ID_NAME) {
            continue;
        }
        const strArg = chainCall.arguments.find(arkts.isStringLiteral);
        const value = strArg?.str;
        if (!value) {
            continue;
        }
        // 组件的唯一标识符（ID）不可重复
        const rootCallee = findRootCallee(chainCall.expression)!;
        const cacheIdInfo = usedIds.get(value);
        if (!!cacheIdInfo && cacheIdInfo.node.peer !== rootCallee.peer) {
            reportDuplicatedId.bind(this)(rootCallee, value);
        } else {
            usedIds.set(value, { value, node: rootCallee });
        }
    }
}

function reportDuplicatedId(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    callee: arkts.AstNode,
    id: string
): void {
    const path = getCurrentFilePath(callee);
    if (!path) {
        return;
    }
    const line = callee.startPosition.line() + 1;
    const column = callee.startPosition.col();
    this.report({
        node: callee,
        level: LogType.WARN,
        message: `The current component id "${id}" is duplicate with ${path}:${line}:${column}.`,
    });
}
