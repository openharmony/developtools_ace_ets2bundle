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
import { isPrivateClassProperty } from '../utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkConstructPrivateParameter = performanceLog(
    _checkConstructPrivateParameter,
    getPerfName([0, 0, 0, 0, 0], 'checkConstructPrivateParameter')
);

/**
 * 校验规则：用于校验通过组件构造函数初始化变量是否为私有访问权限。
 *
 * 校验等级：warn
 */
function _checkConstructPrivateParameter(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    struct: arkts.ClassDefinition
): void {
    const metadata = this.context ?? {};
    // If a non-custom component is called and is not in the custom component, it returns directly
    if (!metadata.structDeclInfo || !metadata.fromStructInfo) {
        return;
    }
    if (!struct || !struct.parent || !arkts.isClassDeclaration(struct.parent)) {
        return;
    }
    let privateClassProperty: string[] = [];
    struct.parent?.definition?.body.forEach((property) => {
        if (!arkts.isClassProperty(property) || !property.key || !arkts.isIdentifier(property.key)) {
            return;
        }

        const propertyName = property.key.name;
        if (propertyName === '') {
            return;
        }
        if (!isPrivateClassProperty(property)) {
            return;
        }
        privateClassProperty.push(propertyName);
    });
    metadata.structPropertyInfos?.forEach(([propertyPtr, propertyInfo]) => {
        // 用于校验通过组件构造函数初始化变量是否为私有访问权限
        if (!propertyPtr || !propertyInfo || !propertyInfo.name || !privateClassProperty.includes(propertyInfo.name)) {
            return;
        }
        const property = arkts.unpackNonNullableNode<arkts.Property>(propertyPtr);
        this.report({
            node: property,
            level: LogType.WARN,
            message: `Property '${propertyInfo?.name}' is private and can not be initialized through the component constructor.`,
        });
    });
}
