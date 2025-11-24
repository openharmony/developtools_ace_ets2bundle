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

export const checkCustomDialogMissingController = performanceLog(
    _checkCustomDialogMissingController,
    getPerfName([0, 0, 0, 0, 0], 'checkCustomDialogMissingController')
);

const CUSTOM_DIALOG_CONTROLLER = 'CustomDialogController';

/**
 * 校验规则：用于验证`@CustomDialog` 装饰器约束条件
 * 1. 使用 `@CustomDialog` 装饰器装饰的自定义组件必须包含一个类型为 `CustomDialogController` 的属性。
 *
 * 校验等级：error
 */
function _checkCustomDialogMissingController(
    this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>,
    struct: arkts.ClassDeclaration
): void {
    const metadata = this.context ?? {};
    const hasCustomDialog = !!metadata.annotationInfo?.hasCustomDialog;
    const hasCustomDialogControllerProperty = struct.definition?.body.some((property) => {
        // The joint type also report error, such as CustomDialogController | undefined
        return arkts.isClassProperty(property) && property.typeAnnotation?.dumpSrc() === CUSTOM_DIALOG_CONTROLLER;
    });

    // 使用 `@CustomDialog` 装饰器装饰的自定义组件必须包含一个类型为 `CustomDialogController` 的属性。
    if (hasCustomDialog && !hasCustomDialogControllerProperty) {
        if (!struct.definition || !struct.definition.ident) {
            return;
        }
        this.report({
            node: struct.definition.ident,
            level: LogType.ERROR,
            message: `The @CustomDialog decorated custom component must contain a property of the CustomDialogController type.`,
        });
    }
}
