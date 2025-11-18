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
import { LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';
import { checkIsBuilderLambdaFromInfo } from '../../utils';

export const checkAttributeNoInvoke = performanceLog(
    _checkAttributeNoInvoke,
    getPerfName([0, 0, 0, 0, 0], 'checkAttributeNoInvoke')
);

/**
 * 校验规则：用于验证组件是否符合UI 组件语法要求
 * 1. 组件属性括号不能遗漏（只检验链式属性中最后一个属性的括号）
 *
 * 校验等级：error
 */
function _checkAttributeNoInvoke(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.CallExpression
): void {
    const metadata = this.context ?? {};
    metadata.rootCallInfo?.annotationInfo?.hasComponentBuilder;
    if (!checkIsBuilderLambdaFromInfo(metadata)) {
        return;
    }

    const parent = node.parent;
    if (!parent || !arkts.isMemberExpression(parent)) {
        return;
    }

    const grandParent = parent.parent;
    // 组件属性括号不能遗漏（只检验链式属性中最后一个属性的括号）
    if (!!grandParent && arkts.isExpressionStatement(grandParent)) {
        this.report({
            node: parent,
            level: LogType.ERROR,
            message: `'${parent.dumpSrc()}' does not meet UI component syntax.`,
        });
    }
}
