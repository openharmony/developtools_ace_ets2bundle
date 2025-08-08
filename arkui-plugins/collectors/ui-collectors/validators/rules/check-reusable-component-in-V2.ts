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

export const checkReusableComponentInV2 = performanceLog(
    _checkReusableComponentInV2,
    getPerfName([0, 0, 0, 0, 0], 'checkReusableComponentInV2')
);

/**
 * 校验规则：用于验证使用 @ComponentV2 装饰的自定义组件中使用 @Reusable 装饰组件的可重用性
 * 1. @ComponentV2 装饰的自定义组件中不推荐使用 @Reusable 组件
 *
 * 校验等级：warn
 */
function _checkReusableComponentInV2(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    struct: arkts.ClassDefinition
): void {
    const metadata = this.context ?? {};
    // 如果非自定义组件调用，直接返回
    if (!metadata.structDeclInfo || !metadata.fromStructInfo) {
        return;
    }
    const fromComponentV2 = !!metadata.fromStructInfo?.annotationInfo?.hasComponentV2;
    const fromReusableV2: boolean = !!metadata.fromStructInfo?.annotationInfo?.hasReusableV2;
    const isReusableCall = !!metadata.structDeclInfo?.annotationInfo?.hasReusable;

    // @ComponentV2 装饰的自定义组件中不推荐使用 @Reusable 组件。（同时被@ReusableV2修饰时，由check-nested-reuse-component规则进行报错）
    if (!fromComponentV2 || !isReusableCall || fromReusableV2) {
        return;
    }
    const callExpression = arkts.unpackNonNullableNode<arkts.CallExpression>(metadata.ptr!);
    this.report({
        node: callExpression,
        level: LogType.WARN,
        message: `When a custom component is decorated with @ComponentV2 and contains a child component decorated with @Reusable, the child component will not create.`,
    });
}
