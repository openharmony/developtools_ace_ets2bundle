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
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { createSuggestion } from '../../../../common/log-collector';
import { getAnnotationUsageByName } from '../utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkWatchDecoratorFunction = performanceLog(
    _checkWatchDecoratorFunction,
    getPerfName([0, 0, 0, 0, 0], 'checkWatchDecoratorFunction')
);

/**
 * 校验规则：用于验证`@Watch` 装饰器的参数时需要遵循的具体约束和条件
 * 1. `@Watch` 必须指向已存在的方法名，即`@Watch` 装饰的参数必须是自定义组件中某个函数的回调方法
 * 2. `@Watch` 参数必须是字符串，不能是其它类型。(已有Type Error拦截，本规则不做校验)
 *
 * 校验等级：error
 */
function _checkWatchDecoratorFunction(
    this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>,
    node: arkts.ClassDeclaration
): void {
    const metadata = this.context ?? {};
    if (!node.definition) {
        return;
    }
    // Get all struct method names
    const methodNames = getMethodNames(node.definition);
    node.definition.body.forEach((member) => {
        if (!arkts.isClassProperty(member)) {
            return;
        }
        const annotations = member.annotations;
        if (!annotations) {
            return;
        }
        const watchDecorator = getAnnotationUsageByName(annotations, DecoratorNames.WATCH);
        // Determine whether it contains @watch decorators
        validateWatchDecorator.bind(this)(member, methodNames, watchDecorator);
    });
}

// Gets the names of all methods in the struct
function getMethodNames(definition: arkts.ClassDefinition): string[] {
    const methodNames: string[] = [];
    definition.body.forEach((member) => {
        if (arkts.isMethodDefinition(member) && arkts.isIdentifier(member.name)) {
            const methodName = member.name.name;
            if (methodName !== '') {
                methodNames.push(methodName);
            }
        }
    });
    return methodNames;
}

function validateWatchDecorator(
    this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>,
    member: arkts.ClassProperty,
    methodNames: string[],
    watchDecorator: arkts.AnnotationUsage | undefined
): void {
    member.annotations.forEach((annotation) => {
        if (!annotation.expr || !arkts.isIdentifier(annotation.expr) || annotation.expr.name !== DecoratorNames.WATCH) {
            return;
        }
        annotation.properties.forEach((element) => {
            if (!arkts.isClassProperty(element)) {
                return;
            }
            if (!element.value) {
                return;
            }
            if (!arkts.isStringLiteral(element.value)) {
                return;
            }
            const parameterName = element.value.str;
            if (!watchDecorator || !parameterName || methodNames.includes(parameterName)) {
                return;
            }
            // `@Watch` 必须指向已存在的方法名，即`@Watch` 装饰的参数必须是自定义组件中某个函数的回调方法
            this.report({
                node: watchDecorator,
                level: LogType.ERROR,
                message: `'@watch' cannot be used with '${parameterName}'. Apply it only to parameters that correspond to existing methods.`,
                suggestion: createSuggestion(
                    `\n${parameterName}(){\n}`,
                    member.endPosition,
                    member.endPosition,
                    `Add a watch function to the custom component`
                ),
            });
        });
    });
}
