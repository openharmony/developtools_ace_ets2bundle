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
import { CustomComponentInfo } from '../../records';
import { LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkReusableV2Decorator = performanceLog(
    _checkReusableV2Decorator,
    getPerfName([0, 0, 0, 0, 0], 'checkReusableV2Decorator')
);

/**
 * 校验规则：用于验证`@ReusableV2` 装饰器时需要遵循的具体约束和条件
 * 1. `@Reusable` 和 `@ReusableV2` 装饰器不能同时使用。
 * 2. `@ReusableV2` 只能用于使用了 `@ComponentV2` 的自定义组件。
 *
 * 校验等级：error
 */
function _checkReusableV2Decorator(
    this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>,
    struct: arkts.ClassDeclaration
): void {
    const metadata = this.context ?? {};
    const hasComponentV2 = !!metadata.annotationInfo?.hasComponentV2;
    const hasReusable = !!metadata.annotationInfo?.hasReusable;
    const hasReusableV2 = !!metadata.annotationInfo?.hasReusableV2;
    // `@Reusable` 和 `@ReusableV2` 装饰器不能同时使用。
    if (hasReusable && hasReusableV2) {
        this.report({
            node: struct,
            level: LogType.ERROR,
            message: `The '@Reusable' and '@ReusableV2' annotations cannot be applied simultaneously.`,
        });
    }
    // `@ReusableV2` 只能用于使用了 `@ComponentV2` 的自定义组件。
    if (hasReusableV2 && !hasComponentV2) {
        this.report({
            node: struct,
            level: LogType.ERROR,
            message: `@ReusableV2 is only applicable to custom components decorated by @ComponentV2.`,
        });
    }
}
