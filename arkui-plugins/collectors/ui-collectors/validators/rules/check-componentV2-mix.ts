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

export const checkComponentV2Mix = performanceLog(
    _checkComponentV2Mix,
    getPerfName([0, 0, 0, 0, 0], 'checkComponentV2Mix')
);

/**
 * 校验规则：用于验证 `struct` 结构体中是否正确使用了`@ComponentV2`组件装饰器
 * 1. `struct` 被 `@ComponentV2` 修饰时，无法再用`@Component`、`@Reusable` 或 `@CustomDialog`修饰
 *
 * 校验等级：error
 */
function _checkComponentV2Mix(
    this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>,
    struct: arkts.ClassDeclaration
): void {
    const metadata = this.context ?? {};
    const hasComponentV2 = !!metadata.annotationInfo?.hasComponentV2;
    const hasComponent = !!metadata.annotationInfo?.hasComponent;
    const hasReusable = !!metadata.annotationInfo?.hasReusable;
    const hasCustomDialog = !!metadata.annotationInfo?.hasCustomDialog;
    // `struct` 被 `@ComponentV2` 修饰时，无法再用`@Component`、`@Reusable` 或 `@CustomDialog`修饰
    if (hasComponentV2 && (hasComponent || hasReusable || hasCustomDialog)) {
        if (!struct.definition || !struct.definition.ident) {
            return;
        }
        this.report({
            node: struct.definition.ident,
            level: LogType.ERROR,
            message: `The struct '${metadata.name}' can not be decorated with '@ComponentV2' and '@Component', '@Reusable', '@CustomDialog' at the same time.`,
        });
    }
}
