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
import type { ExtendedValidatorFunction, IntrinsicValidatorFunction } from '../safe-types';
import { NormalClassMethodInfo, NormalClassPropertyInfo, StructMethodInfo, StructPropertyInfo } from '../../records';
import { DecoratorNames, LogType, StructDecoratorNames } from '../../../../common/predefines';
import {
    createSuggestion,
    getPositionRangeFromAnnotation,
    getPositionRangeFromNode,
} from '../../../../common/log-collector';
import {
    checkIsNormalClassMethodFromInfo,
    checkIsStructMethodFromInfo,
} from '../../../../collectors/ui-collectors/utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkMonitorDecorator = performanceLog(
    _checkMonitorDecorator,
    getPerfName([0, 0, 0, 0, 0], 'checkMonitorDecorator')
);

/**
 * 校验规则：用于验证`@Monitor` 装饰器约束条件
 * 1. `@Monitor`不能与其他内置装饰器一起使用
 * 2. `@Monitor`装饰器只能用于被`@ObservedV2`装饰的类中的成员方法上
 * 3. `@Monitor`装饰器只能在被`@ComponentV2`装饰的`struct`中使用
 * 4. `@Monitor`装饰器只能用来装饰方法
 *
 * 校验等级：error
 */
function _checkMonitorDecorator(this: BaseValidator<arkts.AstNode, Object>, node: arkts.AstNode): void {
    const nodeType = arkts.nodeType(node);
    if (checkByType.has(nodeType)) {
        checkByType.get(nodeType)!.bind(this)(node);
    }
}

const checkByType = new Map<arkts.Es2pandaAstNodeType, IntrinsicValidatorFunction | ExtendedValidatorFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, checkMonitorDecoratorInMethodDefinition],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, checkMonitorDecoratorInClassProperty],
]);

function checkMonitorDecoratorInMethodDefinition<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, NormalClassMethodInfo | StructMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    const monitorUsage = metadata.annotations?.Monitor;
    if (!monitorUsage) {
        return;
    }

    if (checkIsStructMethodFromInfo(metadata)) {
        checkMonitorInComponentV2Struct.bind(this)(monitorUsage);
    }
    if (checkIsNormalClassMethodFromInfo(metadata)) {
        checkMonitorInObservedV2Class.bind(this)(monitorUsage);
    }

    const annotationNumOfMethod = countAnnotationOfMethod(metadata);
    const otherAnnotation: arkts.AnnotationUsage | undefined = findOtherAnnotation(metadata);
    if (annotationNumOfMethod <= 1 || !otherAnnotation) {
        return;
    }

    this.report({
        node: monitorUsage,
        message: `The member property or method cannot be decorated by multiple built-in annotations.`,
        level: LogType.ERROR,
        suggestion: createSuggestion(``, ...getPositionRangeFromAnnotation(otherAnnotation), `Remove the annotation`),
    });
}

function checkMonitorInComponentV2Struct<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, StructMethodInfo>,
    monitorUsage: arkts.AnnotationUsage
): void {
    const metadata = this.context ?? {};
    if (metadata.structInfo?.annotationInfo?.hasComponentV2) {
        return;
    }

    const componentUsage = metadata.structInfo?.annotations?.Component;
    if (componentUsage) {
        this.report({
            node: monitorUsage,
            message: `The '@Monitor' annotation can only be used in a 'struct' decorated with '@ComponentV2'.`,
            level: LogType.ERROR,
            suggestion: createSuggestion(
                `${StructDecoratorNames.COMPONENT_V2}`,
                ...getPositionRangeFromNode(componentUsage),
                `Change @Component to @ComponentV2`
            ),
        });
    }
}

function checkMonitorInObservedV2Class<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, NormalClassMethodInfo>,
    monitorUsage: arkts.AnnotationUsage
): void {
    const metadata = this.context ?? {};
    if (metadata.classInfo?.annotationInfo?.hasObservedV2) {
        return;
    }

    const observedUsage = metadata.classInfo?.annotations?.Observed;
    if (observedUsage) {
        this.report({
            node: monitorUsage,
            message: `The '@Monitor' can decorate only member 'method' within a 'class' decorated with '@ObservedV2'.`,
            level: LogType.ERROR,
            suggestion: createSuggestion(
                `${DecoratorNames.OBSERVED_V2}`,
                ...getPositionRangeFromNode(observedUsage),
                `Change @Observed to @ObservedV2`
            ),
        });
    } else {
        const classDeclaration = arkts.unpackNonNullableNode(metadata.classInfo?.definitionPtr!);
        this.report({
            node: monitorUsage,
            level: LogType.ERROR,
            message: `The '@Monitor' can decorate only member method within a 'class' decorated with @ObservedV2.`,
            suggestion: createSuggestion(
                `@${DecoratorNames.OBSERVED_V2}\n`,
                classDeclaration.startPosition,
                classDeclaration.startPosition,
                `Add @ObservedV2 annotation`
            ),
        });
    }
}

function checkMonitorDecoratorInClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo | NormalClassPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    const monitorUsage = metadata.ignoredAnnotations?.Monitor;
    if (!monitorUsage) {
        return;
    }

    this.report({
        node: monitorUsage,
        message: `@Monitor can only decorate method.`,
        level: LogType.ERROR,
        suggestion: createSuggestion(
            ``,
            ...getPositionRangeFromAnnotation(monitorUsage),
            `Remove the @Monitor annotation`
        ),
    });
}

function countAnnotationOfMethod(metadata: NormalClassMethodInfo | StructMethodInfo): number {
    let count = 0;
    Object.values(DecoratorNames).forEach((key) => {
        if (metadata.annotationInfo?.[`has${key}`] || metadata.ignoredAnnotationInfo?.[`has${key}`]) {
            count++;
        }
    });
    return count;
}

function findOtherAnnotation(metadata: NormalClassMethodInfo | StructMethodInfo): arkts.AnnotationUsage | undefined {
    let otherAnnotation: arkts.AnnotationUsage | undefined = undefined;
    for (const key of Object.values(DecoratorNames)) {
        if (otherAnnotation) {
            break;
        }
        if (metadata.annotations?.[key]) {
            otherAnnotation = metadata.annotations?.[key];
        }
        if (metadata.ignoredAnnotations?.[key]) {
            otherAnnotation = metadata.ignoredAnnotations?.[key];
        }
    }
    return otherAnnotation;
}
