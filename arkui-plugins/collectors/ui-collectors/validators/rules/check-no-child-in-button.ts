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
import { createSuggestion, getPositionRangeFromNode } from '../../../../common/log-collector';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkNoChildInButton = performanceLog(
    _checkNoChildInButton,
    getPerfName([0, 0, 0, 0, 0], 'checkNoChildInButton')
);

const BUTTON: string = 'Button';

/**
 * 校验规则：用于验证使用Button组件时包含子组价的错误用法。
 * 1. 带有 label 参数的 Button 组件不能包含任何子节点(参数只校验StringLiteral类型)
 *
 * 校验等级：error
 */
function _checkNoChildInButton(this: BaseValidator<arkts.CallExpression, CallInfo>, node: arkts.CallExpression): void {
    const metadata = this.context ?? {};
    // If it's a custom component or the name isn't button, it returns
    if (metadata.structDeclInfo || !metadata.fromStructInfo || metadata.declName !== BUTTON) {
        return;
    }
    if (node.arguments.length < 2) {
        return;
    }
    // 带有 label 参数的 Button 组件不能包含任何子节点(参数只校验StringLiteral类型)
    if (arkts.isStringLiteral(node.arguments[0]) && arkts.isArrowFunctionExpression(node.arguments[1])) {
        this.report({
            node: node,
            level: LogType.ERROR,
            message: `The Button component with a label parameter can not have any child.`,
            suggestion: createSuggestion('', ...getPositionRangeFromNode(node.arguments[1]), `Remove child components`),
        });
    }
}
