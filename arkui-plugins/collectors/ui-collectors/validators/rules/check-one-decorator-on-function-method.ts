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
import { FunctionInfo } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { createSuggestion, getPositionRangeFromAnnotation } from '../../../../common/log-collector';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkOneDecoratorOnFunctionMethod = performanceLog(
    _checkOneDecoratorOnFunctionMethod,
    getPerfName([0, 0, 0, 0, 0], 'checkOneDecoratorOnFunctionMethod')
);

const PARAM_THIS_NAME = '=t';

const REMOVE_ANNOTATION = `Remove the annotation`;

/**
 * 校验规则：用于验证只能装饰函数的装饰器
 * 1. 只有`@Builder`和`@AnimatableExtend`装饰器可以装饰函数
 * 2. `@AnimatableExtend` 装饰器只能用于带有 `this` 参数的函数
 *
 * 校验等级：error
 */
function _checkOneDecoratorOnFunctionMethod(
    this: BaseValidator<arkts.MethodDefinition, FunctionInfo>,
    node: arkts.MethodDefinition
): void {
    const metadata = this.context ?? {};
    let ignoredAnnotationCount = 0;
    //  只有`@Builder`和`@AnimatableExtend`装饰器可以装饰函数
    for (const key in metadata.ignoredAnnotations) {
        const annotationNode = metadata.ignoredAnnotations?.[key]!;
        this.report({
            node: annotationNode,
            level: LogType.ERROR,
            message: `A function can only be decorated by one of the '@AnimatableExtend' and '@Builder'.`,
            suggestion: createSuggestion('', ...getPositionRangeFromAnnotation(annotationNode), REMOVE_ANNOTATION),
        });
        ignoredAnnotationCount++;
    }
    //  只有`@Builder`和`@AnimatableExtend`装饰器可以装饰函数(同时装饰或有ignoredAnnotation时，Builder和AnimatableExtend自身也报错)
    if (
        (metadata.annotationInfo?.hasAnimatableExtend && metadata.annotationInfo?.hasBuilder) ||
        ignoredAnnotationCount > 0
    ) {
        for (const key in metadata.annotations) {
            const annotationNode = metadata.annotations?.[key]!;
            this.report({
                node: annotationNode,
                level: LogType.ERROR,
                message: `A function can only be decorated by one of the '@AnimatableExtend' and '@Builder'.`,
            });
        }
    }
    //  `@AnimatableExtend` 装饰器只能用于带有 `this` 参数的函数
    // if (metadata.annotationInfo?.hasAnimatableExtend && !hasThisParameter(node.funcExpr.scriptFunction)) {
    if (metadata.annotationInfo?.hasAnimatableExtend && !hasThisParameter(node.function)) {
        const annotationNode = metadata.annotations?.[DecoratorNames.ANIMATABLE_EXTEND]!;
        this.report({
            node: annotationNode,
            level: LogType.ERROR,
            message: `When a function is decorated with "@AnimatableExtend", the first parameter must be 'this'.`,
            suggestion: createSuggestion('', ...getPositionRangeFromAnnotation(annotationNode), REMOVE_ANNOTATION),
        });
    }
}

function hasThisParameter(member: arkts.ScriptFunction): boolean {
    return member.params.some((param) => {
        return (
            arkts.isETSParameterExpression(param) &&
            arkts.isIdentifier(param.ident) &&
            param.ident.name === PARAM_THIS_NAME
        );
    });
}
