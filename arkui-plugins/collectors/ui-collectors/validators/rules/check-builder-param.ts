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
 * 校验规则：自定义组件尾随闭包调用的场景：
 *  1. ARKTS_1_1：struct 声明中有且只能有1个 @BuilderParam，且无参数；
 *  2. 非 ARKTS_1_1：struct 声明中至少有1个 @BuilderParam，且最后一个 @BuilderParam 无参数；
 *  3. @BuilderParam 修饰的参数不能同时作为参数传递和尾随闭包使用。
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

    const builderParamProperties: Array<{ name: string; hasParams: boolean }> = [];
    for (const member of struct.body) {
        if (isAnnotatedProperty(member, DecoratorNames.BUILDER_PARAM)) {
            const name = member.key && arkts.isIdentifier(member.key) ? member.key.name : '';
            const hasParams = hasFunctionTypeParams(member.typeAnnotation);
            builderParamProperties.push({ name, hasParams });
        }
    }

    const structName = struct.ident!.name;

    if (builderParamProperties.length === 0) {
        this.report({
            node: call,
            level: LogType.ERROR,
            message: `In the trailing lambda case, '${structName}' must have at least one property decorated with @BuilderParam, and its last @BuilderParam expects no parameter.`,
        });
        return;
    }

    if (metadata.isDeclFromLegacy && builderParamProperties.length !== 1) {
        this.report({
            node: call,
            level: LogType.ERROR,
            message: `In the trailing lambda case, '${structName}' must have one and only one property decorated with @BuilderParam, and its @BuilderParam expects no parameter.`,
        });
        return;
    }

    const lastBuilderParam = builderParamProperties[builderParamProperties.length - 1];
    if (lastBuilderParam.hasParams) {
        this.report({
            node: call,
            level: LogType.ERROR,
            message: `@BuilderParam decorated parameter '${lastBuilderParam.name}' is used as a trailing closure so the function cannot have any parameters.`,
        });
    }

    checkBuilderParamArgsConflict.bind(this)(call, builderParamProperties, lastBuilderParam);
}

function checkBuilderParamArgsConflict(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    call: arkts.CallExpression,
    builderParamProperties: Array<{ name: string; hasParams: boolean }>,
    lastBuilderParam: { name: string; hasParams: boolean }
): void {
    const builderParamArgNames = extractBuilderParamArgNames(call, builderParamProperties);
    if (builderParamArgNames.length > 0 && builderParamArgNames.includes(lastBuilderParam.name)) {
        this.report({
            node: call,
            level: LogType.ERROR,
            message: `The @BuilderParam decorated parameter '${lastBuilderParam.name}' cannot be passed as both a parameter and a trailing closure simultaneously.`,
        });
    }
}

function extractBuilderParamArgNames(
    call: arkts.CallExpression,
    builderParamProperties: Array<{ name: string; hasParams: boolean }>
): string[] {
    const builderParamNames: string[] = [];
    const args = call.arguments;
    if (!args || args.length === 0) {
        return builderParamNames;
    }
    const firstArg = args[0];
    if (!arkts.isObjectExpression(firstArg) || !firstArg.properties) {
        return builderParamNames;
    }
    for (const prop of firstArg.properties) {
        if (!prop || !arkts.isProperty(prop) || !prop.key || !arkts.isIdentifier(prop.key)) {
            continue;
        }
        const paramName = prop.key.name;
        if (builderParamProperties.some(p => p.name === paramName)) {
            builderParamNames.push(paramName);
        }
    }
    return builderParamNames;
}

function hasFunctionTypeParams(typeAnnotation: arkts.TypeNode | undefined): boolean {
    if (!typeAnnotation || !arkts.isETSFunctionType(typeAnnotation)) {
        return false;
    }
    if (!typeAnnotation.params || typeAnnotation.params.length === 0) {
        return false;
    }
    for (const param of typeAnnotation.params) {
        if (param && typeof param === 'object' && 'optional' in param && !param.optional) {
            return true;
        }
    }
    return false;
}
