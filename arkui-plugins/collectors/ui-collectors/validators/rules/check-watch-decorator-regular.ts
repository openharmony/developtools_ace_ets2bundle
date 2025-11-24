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
import { StructPropertyInfo } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkWatchDecoratorRegular = performanceLog(
    _checkWatchDecoratorRegular,
    getPerfName([0, 0, 0, 0, 0], 'checkWatchDecoratorRegular')
);

/**
 * 校验规则：用于验证`@Watch` 装饰器时需要遵循的具体约束和条件
 * 1. 不能单独使用 `@Watch` 装饰器,需要和其他装饰器配合使用。
 *
 * 校验等级：error
 */
function _checkWatchDecoratorRegular(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    node: arkts.ClassProperty
): void {
    const metadata = this.context ?? {};
    const hasWatch = metadata.annotationInfo?.hasWatch;
    const annotationCount = node.annotations.length;

    // 不能单独使用 `@Watch` 装饰器,需要和其他装饰器配合使用
    if (hasWatch && annotationCount === 1) {
        const watchDecorator = metadata.annotations?.[DecoratorNames.WATCH]!;
        this.report({
            node: watchDecorator,
            level: LogType.ERROR,
            message: `Regular variable '${metadata.name}' can not be decorated with '@Watch'.`,
        });
    }
}
