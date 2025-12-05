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
import { isAnnotatedProperty } from '../utils';
import { CallInfo } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { createSuggestion, getPositionRangeFromNode } from '../../../../common/log-collector';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkComponentComponentV2Init = performanceLog(
    _checkComponentComponentV2Init,
    getPerfName([0, 0, 0, 0, 0], 'checkComponentComponentV2Init')
);

/**
 * 校验规则：当V2组件使用V1组件时，V1组件中不允许存在被`@Link`装饰的属性
 *
 * 校验等级：error
 */
function _checkComponentComponentV2Init(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.CallExpression,
    struct: arkts.ClassDefinition
): void {
    const metadata = this.context ?? {};
    const fromComponentV2: boolean = !!metadata.fromStructInfo?.annotationInfo?.hasComponentV2;
    const isComponentCall: boolean = !!metadata.structDeclInfo?.annotationInfo?.hasComponent;
    if (!(fromComponentV2 && isComponentCall)) {
        return;
    }

    // 只要当前struct 中有被"@Link" 修饰的属性就报错
    for (const member of struct.body) {
        if (isAnnotatedProperty(member, DecoratorNames.LINK)) {
            const reportNode = node.parent && arkts.isExpressionStatement(node.parent) ? node.parent : node;
            this.report({
                node: reportNode,
                level: LogType.ERROR,
                message: `A V2 component cannot be used with any member property annotated by '@Link' in a V1 component.`,
                suggestion: createSuggestion(``, ...getPositionRangeFromNode(reportNode), `Remove the component`),
            });
        }
    }
}
