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
import { getAnnotationUsage, getAnnotationUsageByName } from '../utils';
import { checkIsCustomComponentFromInfo } from '../../../../collectors/ui-collectors/utils';

import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkObservedV2TraceUsageValidation = performanceLog(
    _checkObservedV2TraceUsageValidation,
    getPerfName([0, 0, 0, 0, 0], 'checkObservedV2TraceUsageValidation')
);

/**
 * 校验规则：用于验证`@ObservedV2`、`@Trace`装饰器时需要遵循的具体约束和条件
 * 1. `@ObservedV2` 装饰器只能作用在 `class` 上，不能用于 function、variable、type alias、interface、struct、property、method 上。
 * 2. `@Trace` 装饰器必须定义在一个 `class` 内部，不能用于 function、variable、type alias、interface、struct、property(struct/global)、method 上。
 * 3. `@Trace` 装饰器只能用于装饰被 `@ObservedV2` 装饰的类中的成员变量，不能用于成员方法。
 * 4. `@Trace` 装饰的成员变量所在 class 必须有 `@ObservedV2`，仅有 `@Observed` 时提示改为 `@ObservedV2`，都没有时提示添加 `@ObservedV2`。
 * 5. 被 `@ObservedV2` 装饰的 class 必须至少包含一个 `@Trace` 成员变量。
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
        checkInvalidObservedV2AndTraceInNonClassScope.bind(this)(node);
    } else if (checkIsNormalClassPropertyFromInfo(metadata)) {
        checkInvalidObservedV2AndTraceInClassProperty.bind(this)(node);
    } else {
        checkInvalidObservedV2AndTraceInNonClassScope.bind(this)(node);
    }
}

function checkRuleInMethodDefinition<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo | NormalClassPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsStructMethodFromInfo(metadata)) {
        checkInvalidObservedV2AndTraceInNonClassScope.bind(this)(node);
    } else if (checkIsNormalClassMethodFromInfo(metadata)) {
        checkInvalidObservedV2AndTraceInClassMethod.bind(this)(node);
    } else if (checkIsGlobalFunctionFromInfo(metadata)) {
        checkInvalidObservedV2AndTraceInNonClassScope.bind(this)(node);
    }
}

function checkRuleInClassDeclaration<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, CustomComponentInfo | NormalClassInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    const isCustom = checkIsCustomComponentFromInfo(metadata);
    if (isCustom) {
        checkInvalidObservedV2AndTraceInNonClassScope.bind(this)(node);
    } else {
        checkInvalidTraceInClass.bind(this)(node);
    }
}

function reportObservedV2OnlyInClass<T extends arkts.AstNode = arkts.AstNode>(
    this: BaseValidator<T, StructPropertyInfo | GLobalPropertyInfo | NormalClassPropertyInfo | CustomComponentInfo | NormalClassInfo | NormalClassMethodInfo>,
    node: T
): void {
    const metadata = this.context;
    if (metadata?.ignoredAnnotationInfo?.hasObservedV2) {
        const observedV2Node = metadata.ignoredAnnotations?.[DecoratorNames.OBSERVED_V2];
        if (observedV2Node) {
            this.report({
                node: observedV2Node,
                level: LogType.ERROR,
                message: `The '@ObservedV2' annotation can only be used in 'class'.`,
                suggestions: [createSuggestion(``, ...getPositionRangeFromAnnotation(observedV2Node), `Remove the @ObservedV2 annotation`)],
            });
        }
    }
}

function checkInvalidObservedV2AndTraceInNonClassScope<T extends arkts.AstNode = arkts.AstNode>(
    this: BaseValidator<T, StructPropertyInfo | GLobalPropertyInfo | NormalClassPropertyInfo | CustomComponentInfo | NormalClassInfo>,
    node: T
): void {
    reportObservedV2OnlyInClass.bind(this)(node);
    const metadata = this.context;
    if (metadata?.ignoredAnnotationInfo?.hasTrace) {
        const traceNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACE];
        if (traceNode) {
            this.report({
                node: traceNode,
                level: LogType.ERROR,
                message: `The '@Trace' annotation can only be used in 'class'.`,
                suggestions: [createSuggestion(``, ...getPositionRangeFromAnnotation(traceNode), `Remove the @Trace annotation`)],
            });
        }
    }
}

function checkInvalidObservedV2AndTraceInClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, NormalClassPropertyInfo>,
    node: T
): void {
    reportObservedV2OnlyInClass.bind(this)(node);
    const metadata = this.context;
    if (!metadata?.ignoredAnnotationInfo?.hasTrace || metadata?.classInfo?.annotationInfo?.hasObservedV2) {
        return;
    }
    const definitionPtr = metadata?.classInfo?.definitionPtr;
    if (definitionPtr) {
        const classDef = arkts.unpackNonNullableNode<arkts.ClassDefinition>(definitionPtr);
        if (getAnnotationUsage(classDef.annotations, DecoratorNames.OBSERVED_V2)) {
            return;
        }
    }
    const traceNode = metadata?.ignoredAnnotations?.[DecoratorNames.TRACE]!;
    if (!metadata?.classInfo?.annotationInfo?.hasObserved) {
        if (!definitionPtr) {
            return;
        }
        const classDeclarations = arkts.unpackNonNullableNode<arkts.ClassDefinition>(definitionPtr).parent;
        if (classDeclarations) {
            let startPosition = classDeclarations.startPosition;
            this.report({
                node: traceNode,
                level: LogType.ERROR,
                message: `The '@Trace' annotation can only be used within a 'class' decorated with 'ObservedV2'.`,
                suggestions: [createSuggestion(
                    `@${DecoratorNames.OBSERVED_V2}\n`,
                    startPosition,
                    startPosition,
                    `Add @ObservedV2 annotation`
                )],
            });
        }
        return;
    }
    const observedNode = metadata?.classInfo?.annotations?.[DecoratorNames.OBSERVED]!;
    this.report({
        node: traceNode,
        level: LogType.ERROR,
        message: `The '@Trace' annotation can only be used within a 'class' decorated with 'ObservedV2'.`,
        suggestions: [createSuggestion(
            `${DecoratorNames.OBSERVED_V2}`,
            ...getPositionRangeFromNode(observedNode),
            `Change @Observed to @ObservedV2`
        )],
    });
}

function checkInvalidObservedV2AndTraceInClassMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, NormalClassMethodInfo>,
    node: T
): void {
    reportObservedV2OnlyInClass.bind(this)(node);
    const metadata = this.context;
    if (metadata?.ignoredAnnotationInfo?.hasTrace) {
        const traceNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACE];
        if (traceNode) {
            this.report({
                node: traceNode,
                level: LogType.ERROR,
                message: `The '@Trace' annotation can only decorate member variables within a 'class' decorated with '@ObservedV2'.`,
                suggestions: [createSuggestion(``, ...getPositionRangeFromAnnotation(traceNode), `Remove the @Trace annotation`)],
            });
        }
    }
}

function checkInvalidObservedV2AndTraceInInterface<T extends arkts.AstNode = arkts.TSInterfaceDeclaration>(
    this: BaseValidator<T, NormalInterfaceInfo>,
    node: T
): void {
    if (!arkts.isTSInterfaceDeclaration(node)) {
        return;
    }
    const observedV2Node = getAnnotationUsageByName(node.annotations, DecoratorNames.OBSERVED_V2);
    if (observedV2Node) {
        this.report({
            node: observedV2Node,
            level: LogType.ERROR,
            message: `The '@ObservedV2' annotation can only be used in 'class'.`,
            suggestions: [createSuggestion(``, ...getPositionRangeFromAnnotation(observedV2Node), `Remove the @ObservedV2 annotation`)],
        });
    }
    const traceNode = getAnnotationUsageByName(node.annotations, DecoratorNames.TRACE);
    if (traceNode) {
        this.report({
            node: traceNode,
            level: LogType.ERROR,
            message: `The '@Trace' annotation can only be used in 'class'.`,
            suggestions: [createSuggestion(``, ...getPositionRangeFromAnnotation(traceNode), `Remove the @Trace annotation`)],
        });
    }
}

function checkInvalidTraceInClass<T extends arkts.AstNode = arkts.ClassDefinition>(
    this: BaseValidator<T, NormalClassInfo>,
    node: T
): void {
    const metadata = this.context;
    if (metadata?.ignoredAnnotationInfo?.hasTrace) {
        const traceNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACE];
        if (traceNode) {
            this.report({
                node: traceNode,
                level: LogType.ERROR,
                message: `The '@Trace' annotation can only decorate member variables within a 'class' decorated with '@ObservedV2'.`,
                suggestions: [createSuggestion(``, ...getPositionRangeFromAnnotation(traceNode), `Remove the @Trace annotation`)],
            });
        }
    }
    if (metadata?.annotationInfo?.hasObservedV2) {
        checkObservedV2HasTraceProperty.bind(this)(node);
    }
}

function checkObservedV2HasTraceProperty<T extends arkts.AstNode = arkts.ClassDefinition>(
    this: BaseValidator<T, NormalClassInfo>,
    node: T
): void {
    if (!arkts.isClassDeclaration(node) || !node.definition) {
        return;
    }
    const hasTraceProperty = node.definition.body.some((member: arkts.AstNode): boolean => {
        if (!arkts.isClassProperty(member)) {
            return false;
        }
        return getAnnotationUsage(member.annotations, DecoratorNames.TRACE) !== undefined;
    });
    if (!hasTraceProperty) {
        this.report({
            node: node.definition,
            level: LogType.ERROR,
            message: `A 'class' decorated with '@ObservedV2' must contain at least one property decorated with '@Trace'.`,
        });
    }
}
