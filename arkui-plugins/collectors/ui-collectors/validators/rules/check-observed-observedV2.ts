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
import { NormalClassInfo } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkObservedObservedV2 = performanceLog(
    _checkObservedObservedV2,
    getPerfName([0, 0, 0, 0, 0], 'checkObservedObservedV2')
);

/**
 * 校验规则：用于验证使用 `@Observed` 装饰器和`@ObserverdV2`装饰器混合使用的错误情况。
 * 1. 一个class不能同时使用`@Observed` 装饰器和`@ObserverdV2`装饰器装饰。
 *
 * 校验等级：error
 */
function _checkObservedObservedV2(
    this: BaseValidator<arkts.ClassDeclaration, NormalClassInfo>,
    node: arkts.ClassDeclaration
): void {
    const metadata = this.context ?? {};
    const hasObserved = !!metadata.annotationInfo?.hasObserved;
    const hasObservedV2 = !!metadata.annotationInfo?.hasObservedV2;
    // 一个class不能同时使用`@Observed` 装饰器和`@ObserverdV2`装饰器装饰
    if (hasObserved && hasObservedV2) {
        const firstObservedDecorator = node.definition?.annotations.find((annotation) => {
            if (annotation.expr && arkts.isIdentifier(annotation.expr)) {
                return (
                    annotation.expr.name === DecoratorNames.OBSERVED ||
                    annotation.expr.name === DecoratorNames.OBSERVED_V2
                );
            }
        });
        if (!firstObservedDecorator) {
            return;
        }
        this.report({
            node: firstObservedDecorator,
            level: LogType.ERROR,
            message: `A class can not be decorated by '@Observed' and '@ObservedV2' at the same time.`,
        });
    }
}
