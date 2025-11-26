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
const UNION_TYPE_NUM_LIMIT = 2;

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
        if (arkts.isClassProperty(property)) {
            return checkPropertyIsCustomDialogController(property);
        }
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

function checkPropertyIsCustomDialogController(property: arkts.ClassProperty): boolean {
    const typeAnnotation = property.typeAnnotation;
    if (!typeAnnotation) {
        return false;
    }
    if (arkts.isETSTypeReference(typeAnnotation)) {
        return checkETSTypeReference(typeAnnotation);
    }
    if (arkts.isETSUnionType(typeAnnotation)) {
        return checkETSUnionType(typeAnnotation);
    }
    return false;
}

function checkETSTypeReference(type: arkts.ETSTypeReference): boolean {
    return !!(
        type.part &&
        type.part.name &&
        arkts.isIdentifier(type.part.name) &&
        type.part.name.name === CUSTOM_DIALOG_CONTROLLER
    );
}

function checkETSUnionType(type: arkts.ETSUnionType): boolean {
    if (type.types.length !== UNION_TYPE_NUM_LIMIT) {
        return false;
    }

    let hasCustomDialog: boolean = false;
    let hasUndefined: boolean = false;
    for (const nodeType of type.types) {
        if (arkts.isETSTypeReference(nodeType) && checkETSTypeReference(nodeType)) {
            hasCustomDialog = true;
        }
        if (arkts.isETSUndefinedType(nodeType)) {
            hasUndefined = true;
        }
    }
    return hasCustomDialog && hasUndefined;
}
