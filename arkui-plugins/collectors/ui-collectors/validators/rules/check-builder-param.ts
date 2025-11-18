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
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkBuilderParam = performanceLog(_checkBuilderParam, getPerfName([0, 0, 0, 0, 0], 'checkBuilderParam'));

/**
 * 校验规则：自定义组件尾随闭包调用的场景，struct 声明中有且只能有1个BuilderParam
 *
 * 校验等级：error
 */
function _checkBuilderParam(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    call: arkts.CallExpression,
    struct: arkts.ClassDefinition
): void {
    const metadata = this.context ?? {};
    if (!metadata.isTrailingCall) {
        return;
    }

    // 从struct 中获取被@BuilderParam 修饰的属性个数
    const properties: Array<{ property: arkts.ClassProperty; argc: number }> = [];
    for (const member of struct.body) {
        if (isAnnotatedProperty(member, DecoratorNames.BUILDER_PARAM)) {
            properties.push({
                property: member,
                argc: getBuilderParamTypeArgc(member),
            });
        }
    }

    // 如果@BuilderParam个数不是1个或者@BuilderParam修饰的函数类型有参数，那么就报错
    if (properties.length !== 1 || (properties.length === 1 && properties[0].argc > 0)) {
        const structName = struct.ident!.name;
        this.report({
            node: call, // Class Declaration has correct position information
            level: LogType.ERROR,
            message: `In the trailing lambda case, '${structName}' must have one and only one property decorated with @BuilderParam, and its @BuilderParam expects no parameter.`,
        });
    }
}

function getBuilderParamTypeArgc(property: arkts.ClassProperty): number {
    if (!property.typeAnnotation || !arkts.isETSFunctionType(property.typeAnnotation)) {
        return -1;
    }
    return property.typeAnnotation.params.length;
}
