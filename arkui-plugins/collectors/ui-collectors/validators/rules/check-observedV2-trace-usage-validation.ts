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
import {
    CustomComponentInfo,
    FunctionInfo,
    GLobalPropertyInfo,
    NormalClassInfo,
    NormalClassMethodInfo,
    NormalClassPropertyInfo,
    NormalInterfaceInfo,
    StructMethodInfo,
    StructPropertyInfo,
} from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import {
    createSuggestion,
    getPositionRangeFromAnnotation,
    getPositionRangeFromNode,
} from '../../../../common/log-collector';
import {
    checkIsGlobalFunctionFromInfo,
    checkIsNormalClassMethodFromInfo,
    checkIsNormalClassPropertyFromInfo,
    checkIsStructMethodFromInfo,
    checkIsStructPropertyFromInfo,
} from '../../../../collectors/ui-collectors/utils';
import { getAnnotationUsageByName } from '../utils';
import { checkIsCustomComponentFromInfo } from '../../../../collectors/ui-collectors/utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkObservedV2TraceUsageValidation = performanceLog(
    _checkObservedV2TraceUsageValidation,
    getPerfName([0, 0, 0, 0, 0], 'checkObservedV2TraceUsageValidation')
);

const OBSERVED_V2_DECORATOR_ERROR = `The '@ObservedV2' annotation can only be used in 'class'.`;
const TRACE_DECORATOR_ERROR = `The '@Trace' annotation can only be used in 'class'.`;
const TRACE_MEMBER_VARIABLE_ERROR = `The '@Trace' annotation can only decorate member 'variables' within a 'class' decorated with '@ObservedV2'.`;

const REMOVE_OBSERVED_V2 = `Remove the @ObservedV2 annotation`;
const REMOVE_TRACE = `Remove the @Trace annotation`;
const ADD_OBSERVED_V2 = `Add @ObservedV2 annotation`;
const CHANGE_OBSERVED = `Change @Observed to @ObservedV2`;

/**
 * 校验规则：用于验证`@ObservedV2`、`@Trace`装饰器时需要遵循的具体约束和条件
 * 1. `@ObservedV2` 装饰器只能作用在 `class` 上，不能用于function、interface、struct、property(struct/class/global)、method(struct/class)上。
 * 2. `@Trace` 装饰器必须定义在一个 `class` 内部，不能用于function、interface、struct、property(struct/global)、method(struct)上。
 * 3. `@Trace` 只能用于被 `@ObservedV2` 装饰的类中的成员变量。
 *
 * 校验等级：error
 */
function _checkObservedV2TraceUsageValidation(this: BaseValidator<arkts.AstNode, Object>, node: arkts.AstNode): void {
    const nodeType = arkts.nodeType(node);
    if (checkByType.has(nodeType)) {
        checkByType.get(nodeType)!.bind(this)(node);
    }
}

const checkByType = new Map<arkts.Es2pandaAstNodeType, IntrinsicValidatorFunction | ExtendedValidatorFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, checkRuleInClassProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, checkRuleInMethodDefinition],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_INTERFACE_DECLARATION, checkInvalidObservedV2AndTraceInInterface],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_DECLARATION, checkRuleInClassDeclaration],
]);

function checkRuleInClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo | NormalClassPropertyInfo | GLobalPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsStructPropertyFromInfo(metadata)) {
        checkInvalidObservedV2AndTraceInStructProperty.bind(this)(node);
    } else if (checkIsNormalClassPropertyFromInfo(metadata)) {
        checkInvalidObservedV2AndTraceInClassProperty.bind(this)(node);
    } else {
        checkInvalidObservedV2AndTraceInGlobalProperty.bind(this)(node);
    }
}

function checkRuleInMethodDefinition<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo | NormalClassPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsStructMethodFromInfo(metadata)) {
        checkInvalidObservedV2AndTraceInStructMethod.bind(this)(node);
    }
    if (checkIsNormalClassMethodFromInfo(metadata)) {
        checkInvalidObservedV2AndTraceInClassMethod.bind(this)(node);
    }
    if (checkIsGlobalFunctionFromInfo(metadata)) {
        checkInvalidObservedV2AndTraceInFunction.bind(this)(node);
    }
}

function checkRuleInClassDeclaration<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, CustomComponentInfo | NormalClassInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsCustomComponentFromInfo(metadata)) {
        checkInvalidObservedV2AndTraceInStruct.bind(this)(node);
    } else {
        checkInvalidTraceInClass.bind(this)(node);
    }
}

function checkInvalidObservedV2AndTraceInStructProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // `@ObservedV2` 装饰器只能作用在 `class` 上，不能用于function、interface、struct、property(struct/class/global)、method(struct/class)上。
    if (metadata.ignoredAnnotationInfo?.hasObservedV2) {
        const observedV2Node = metadata.ignoredAnnotations?.[DecoratorNames.OBSERVED_V2]!;
        reportErrorWithRemoveAnnotationFix.bind(this)(observedV2Node, OBSERVED_V2_DECORATOR_ERROR, REMOVE_OBSERVED_V2);
    }
    // `@Trace` 装饰器必须定义在一个 `class` 内部，不能用于function、interface、struct、property(struct/global)、method(struct)上。
    if (metadata.ignoredAnnotationInfo?.hasTrace) {
        const traceNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACE]!;
        reportErrorWithRemoveAnnotationFix.bind(this)(traceNode, TRACE_DECORATOR_ERROR, REMOVE_TRACE);
    }
}

function checkInvalidObservedV2AndTraceInClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, NormalClassPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // `@ObservedV2` 装饰器只能作用在 `class` 上，不能用于function、interface、struct、property(struct/class/global)、method(struct/class)上。
    if (metadata.ignoredAnnotationInfo?.hasObservedV2) {
        const observedV2Node = metadata.ignoredAnnotations?.[DecoratorNames.OBSERVED_V2]!;
        reportErrorWithRemoveAnnotationFix.bind(this)(observedV2Node, OBSERVED_V2_DECORATOR_ERROR, REMOVE_OBSERVED_V2);
    }
    // `@Trace` 只能用于被 `@ObservedV2` 装饰的类中的成员变量。
    if (!metadata.ignoredAnnotationInfo?.hasTrace || metadata.classInfo?.annotationInfo?.hasObservedV2) {
        return;
    }
    const traceNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACE]!;
    if (!metadata.classInfo?.annotationInfo?.hasObserved) {
        const classDeclarations = arkts.unpackNonNullableNode<arkts.ClassDefinition>(metadata.classInfo?.definitionPtr!).parent;
        if (classDeclarations) {
            let startPosition = classDeclarations.startPosition;
            this.report({
                node: traceNode,
                level: LogType.ERROR,
                message: TRACE_MEMBER_VARIABLE_ERROR,
                suggestion: createSuggestion(
                    `@${DecoratorNames.OBSERVED_V2}\n`,
                    startPosition,
                    startPosition,
                    ADD_OBSERVED_V2
                ),
            });
        }
    }
    if (metadata.classInfo?.annotationInfo?.hasObserved) {
        const observedNode = metadata.classInfo.annotations?.[DecoratorNames.OBSERVED]!;
        this.report({
            node: traceNode,
            level: LogType.ERROR,
            message: TRACE_MEMBER_VARIABLE_ERROR,
            suggestion: createSuggestion(
                `${DecoratorNames.OBSERVED_V2}`,
                ...getPositionRangeFromNode(observedNode),
                CHANGE_OBSERVED
            ),
        });
    }
}

function checkInvalidObservedV2AndTraceInStructMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, StructMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // `@ObservedV2` 装饰器只能作用在 `class` 上，不能用于function、interface、struct、property(struct/class/global)、method(struct/class)上。
    if (metadata.ignoredAnnotationInfo?.hasObservedV2) {
        const observedV2Node = metadata.ignoredAnnotations?.[DecoratorNames.OBSERVED_V2]!;
        reportErrorWithRemoveAnnotationFix.bind(this)(observedV2Node, OBSERVED_V2_DECORATOR_ERROR, REMOVE_OBSERVED_V2);
    }
    // `@Trace` 装饰器必须定义在一个 `class` 内部，不能用于function、interface、struct、property(struct/global)、method(struct)上。
    if (metadata.ignoredAnnotationInfo?.hasTrace) {
        const traceNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACE]!;
        reportErrorWithRemoveAnnotationFix.bind(this)(traceNode, TRACE_DECORATOR_ERROR, REMOVE_TRACE);
    }
}

function checkInvalidObservedV2AndTraceInFunction<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, FunctionInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // `@ObservedV2` 装饰器只能作用在 `class` 上，不能用于function、interface、struct、property(struct/class/global)、method(struct/class)上。
    if (metadata.ignoredAnnotationInfo?.hasObservedV2) {
        const observedV2Node = metadata.ignoredAnnotations?.[DecoratorNames.OBSERVED_V2]!;
        reportErrorWithRemoveAnnotationFix.bind(this)(observedV2Node, OBSERVED_V2_DECORATOR_ERROR, REMOVE_OBSERVED_V2);
    }
    // `@Trace` 装饰器必须定义在一个 `class` 内部，不能用于function、interface、struct、property(struct/global)、method(struct)上。
    if (metadata.ignoredAnnotationInfo?.hasTrace) {
        const traceNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACE]!;
        reportErrorWithRemoveAnnotationFix.bind(this)(traceNode, TRACE_DECORATOR_ERROR, REMOVE_TRACE);
    }
}

function checkInvalidObservedV2AndTraceInClassMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, NormalClassMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // `@ObservedV2` 装饰器只能作用在 `class` 上，不能用于function、interface、struct、property(struct/class/global)、method(struct/class)上。
    if (metadata.ignoredAnnotationInfo?.hasObservedV2) {
        const observedV2Node = metadata.ignoredAnnotations?.[DecoratorNames.OBSERVED_V2]!;
        reportErrorWithRemoveAnnotationFix.bind(this)(observedV2Node, OBSERVED_V2_DECORATOR_ERROR, REMOVE_OBSERVED_V2);
    }
    // `@Trace` 只能用于被 `@ObservedV2` 装饰的类中的成员变量。
    if (metadata.ignoredAnnotationInfo?.hasTrace) {
        const traceNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACE]!;
        reportErrorWithRemoveAnnotationFix.bind(this)(traceNode, TRACE_MEMBER_VARIABLE_ERROR, REMOVE_TRACE);
    }
}

function checkInvalidObservedV2AndTraceInInterface<T extends arkts.AstNode = arkts.TSInterfaceDeclaration>(
    this: BaseValidator<T, NormalInterfaceInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (!arkts.isTSInterfaceDeclaration(node)) {
        return;
    }
    const observedV2Node = getAnnotationUsageByName(node.annotations, DecoratorNames.OBSERVED_V2);
    // `@ObservedV2` 装饰器只能作用在 `class` 上，不能用于function、interface、struct、property(struct/class/global)、method(struct/class)上。
    if (observedV2Node) {
        reportErrorWithRemoveAnnotationFix.bind(this)(observedV2Node, OBSERVED_V2_DECORATOR_ERROR, REMOVE_OBSERVED_V2);
    }
    const traceNode = getAnnotationUsageByName(node.annotations, DecoratorNames.TRACE);
    // `@Trace` 装饰器必须定义在一个 `class` 内部，不能用于function、interface、struct、property(struct/global)、method(struct)上。
    if (traceNode) {
        reportErrorWithRemoveAnnotationFix.bind(this)(traceNode, TRACE_DECORATOR_ERROR, REMOVE_TRACE);
    }
}

function checkInvalidObservedV2AndTraceInGlobalProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, GLobalPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // `@ObservedV2` 装饰器只能作用在 `class` 上，不能用于function、interface、struct、property(struct/class/global)、method(struct/class)上。
    if (metadata.ignoredAnnotationInfo?.hasObservedV2) {
        const observedV2Node = metadata.ignoredAnnotations?.[DecoratorNames.OBSERVED_V2]!;
        reportErrorWithRemoveAnnotationFix.bind(this)(observedV2Node, OBSERVED_V2_DECORATOR_ERROR, REMOVE_OBSERVED_V2);
    }
    // `@Trace` 装饰器必须定义在一个 `class` 内部，不能用于function、interface、struct、property(struct/global)、method(struct)上。
    if (metadata.ignoredAnnotationInfo?.hasTrace) {
        const traceNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACE]!;
        reportErrorWithRemoveAnnotationFix.bind(this)(traceNode, TRACE_DECORATOR_ERROR, REMOVE_TRACE);
    }
}

function checkInvalidObservedV2AndTraceInStruct<T extends arkts.AstNode = arkts.ClassDefinition>(
    this: BaseValidator<T, CustomComponentInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // `@ObservedV2` 装饰器只能作用在 `class` 上，不能用于function、interface、struct、property(struct/class/global)、method(struct/class)上。
    if (metadata.ignoredAnnotationInfo?.hasObservedV2) {
        const observedV2Node = metadata.ignoredAnnotations?.[DecoratorNames.OBSERVED_V2]!;
        reportErrorWithRemoveAnnotationFix.bind(this)(observedV2Node, OBSERVED_V2_DECORATOR_ERROR, REMOVE_OBSERVED_V2);
    }
    // `@Trace` 装饰器必须定义在一个 `class` 内部，不能用于function、interface、struct、property(struct/global)、method(struct)上。
    if (metadata.ignoredAnnotationInfo?.hasTrace) {
        const traceNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACE]!;
        reportErrorWithRemoveAnnotationFix.bind(this)(traceNode, TRACE_DECORATOR_ERROR, REMOVE_TRACE);
    }
}

function checkInvalidTraceInClass<T extends arkts.AstNode = arkts.ClassDefinition>(
    this: BaseValidator<T, NormalClassInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // `@Trace` 只能用于被 `@ObservedV2` 装饰的类中的成员变量。
    if (metadata.ignoredAnnotationInfo?.hasTrace) {
        const traceNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACE]!;
        reportErrorWithRemoveAnnotationFix.bind(this)(traceNode, TRACE_MEMBER_VARIABLE_ERROR, REMOVE_TRACE);
    }
}

function reportErrorWithRemoveAnnotationFix<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo>,
    errorNode: arkts.AnnotationUsage,
    message: string,
    fixTitle: string
): void {
    this.report({
        node: errorNode,
        level: LogType.ERROR,
        message: message,
        suggestion: createSuggestion(``, ...getPositionRangeFromAnnotation(errorNode), fixTitle),
    });
}
