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
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { createSuggestion, getPositionRangeFromAnnotation } from '../../../../common/log-collector';
import {
    checkIsNormalClassMethodFromInfo,
    checkIsNormalClassPropertyFromInfo,
    checkIsStructMethodFromInfo,
    checkIsStructPropertyFromInfo,
} from '../../../../collectors/ui-collectors/utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkOnceDecorator = performanceLog(
    _checkOnceDecorator,
    getPerfName([0, 0, 0, 0, 0], 'checkOnceDecorator')
);

const INVALID_MEMBER_DECORATE = `'@Once' can only decorate member property.`;
const INVALID_WITHOUT_PARAM = `When a variable decorated with '@Once', it must also be decorated with '@Param'.`;
const INVALID_NOT_IN_STRUCT = `The '@Once' annotation can only be used with 'struct'.`;

const REMOVE_ANNOTATION = `Remove the annotation`;
const ADD_PARAM_ANNOTATION = `Add @Param annotation`;

/**
 * 校验规则：用于验证`@Once` 装饰器时需要遵循的具体约束和条件
 * 1.`@Once` 装饰器用在使用了 `@ComponentV2` 装饰的 `struct` 中(已由check-old-new-decorator-mix-use校验)
 * 2.`@Once` 只能装饰成员属性
 * 3.使用 `@Once` 必须同时使用 `@Param`
 * 4.`@Once` 只能在 `struct` 中使用
 *
 * 校验等级：error
 */
function _checkOnceDecorator(this: BaseValidator<arkts.AstNode, Object>, node: arkts.AstNode): void {
    const nodeType = arkts.nodeType(node);
    if (checkByType.has(nodeType)) {
        checkByType.get(nodeType)!.bind(this)(node);
    }
}

const checkByType = new Map<arkts.Es2pandaAstNodeType, IntrinsicValidatorFunction | ExtendedValidatorFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, checkOnceInMethod],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, checkOnceInProperty],
]);

function checkOnceInMethod<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo | NormalClassPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsStructMethodFromInfo(metadata)) {
        checkOnceInStructMethod.bind(this)(node);
    }
    if (checkIsNormalClassMethodFromInfo(metadata)) {
        checkOnceInClassMethod.bind(this)(node);
    }
}

function checkOnceInStructMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, StructMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (!metadata.ignoredAnnotationInfo?.hasOnce) {
        return;
    }
    const onceAnnotation = metadata.ignoredAnnotations?.[DecoratorNames.ONCE];
    if (!onceAnnotation) {
        return;
    }
    // 使用 `@Once` 必须同时使用 `@Param`
    if (!metadata.ignoredAnnotationInfo?.hasParam) {
        reportOnceWithoutParam.bind(this)(onceAnnotation);
    } else {
        // `@Once` 只能装饰成员属性
        reportErrorWithDeleteFix.bind(this)(onceAnnotation, INVALID_MEMBER_DECORATE);
    }
}

function checkOnceInClassMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, NormalClassMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (!metadata.ignoredAnnotationInfo?.hasOnce) {
        return;
    }
    const onceAnnotation = metadata.ignoredAnnotations?.[DecoratorNames.ONCE];
    if (!onceAnnotation) {
        return;
    }
    // 使用 `@Once` 必须同时使用 `@Param`
    if (!metadata.ignoredAnnotationInfo?.hasParam) {
        reportOnceWithoutParam.bind(this)(onceAnnotation);
    } else {
        // `@Once` 只能在 `struct` 中使用
        reportErrorWithDeleteFix.bind(this)(onceAnnotation, INVALID_NOT_IN_STRUCT);
    }
}

function checkOnceInProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo | NormalClassPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsStructPropertyFromInfo(metadata)) {
        checkOnceInStructProperty.bind(this)(node);
    }
    if (checkIsNormalClassPropertyFromInfo(metadata)) {
        checkOnceInClassProperty.bind(this)(node);
    }
}

function checkOnceInStructProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (!metadata.annotationInfo?.hasOnce) {
        return;
    }
    const onceAnnotation = metadata.annotations?.[DecoratorNames.ONCE];
    if (!onceAnnotation) {
        return;
    }
    // 使用 `@Once` 必须同时使用 `@Param`
    if (!metadata.annotationInfo?.hasParam) {
        reportOnceWithoutParam.bind(this)(onceAnnotation);
    }
}

function checkOnceInClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, NormalClassPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (!metadata.ignoredAnnotationInfo?.hasOnce) {
        return;
    }
    const onceAnnotation = metadata.ignoredAnnotations?.[DecoratorNames.ONCE];
    if (!onceAnnotation) {
        return;
    }
    // 使用 `@Once` 必须同时使用 `@Param`
    if (!metadata.ignoredAnnotationInfo?.hasParam) {
        reportOnceWithoutParam.bind(this)(onceAnnotation);
    } else {
        // `@Once` 只能在 `struct` 中使用
        reportErrorWithDeleteFix.bind(this)(onceAnnotation, INVALID_NOT_IN_STRUCT);
    }
}

function reportOnceWithoutParam<T extends arkts.AstNode>(
    this: BaseValidator<T, StructMethodInfo>,
    onceAnnotation: arkts.AnnotationUsage
): void {
    const endPosition = onceAnnotation.endPosition;
    this.report({
        node: onceAnnotation,
        message: INVALID_WITHOUT_PARAM,
        level: LogType.ERROR,
        suggestion: createSuggestion(` @${DecoratorNames.PARAM}`, endPosition, endPosition, ADD_PARAM_ANNOTATION),
    });
}

function reportErrorWithDeleteFix<T extends arkts.AstNode>(
    this: BaseValidator<T, StructMethodInfo>,
    onceAnnotation: arkts.AnnotationUsage,
    message: string
): void {
    this.report({
        node: onceAnnotation,
        message: message,
        level: LogType.ERROR,
        suggestion: createSuggestion('', ...getPositionRangeFromAnnotation(onceAnnotation), REMOVE_ANNOTATION),
    });
}
