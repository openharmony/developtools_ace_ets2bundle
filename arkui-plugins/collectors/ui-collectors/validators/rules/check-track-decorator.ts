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
    FunctionInfo,
    GLobalPropertyInfo,
    NormalClassMethodInfo,
    NormalClassPropertyInfo,
    NormalInterfaceInfo,
    StructMethodInfo,
    StructPropertyInfo,
} from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { createSuggestion, getPositionRangeFromAnnotation } from '../../../../common/log-collector';
import {
    checkIsGlobalFunctionFromInfo,
    checkIsNormalClassMethodFromInfo,
    checkIsNormalClassPropertyFromInfo,
    checkIsStructMethodFromInfo,
    checkIsStructPropertyFromInfo,
} from '../../../../collectors/ui-collectors/utils';
import { getAnnotationUsageByName } from '../utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkTrackDecorator = performanceLog(
    _checkTrackDecorator,
    getPerfName([0, 0, 0, 0, 0], 'checkTrackDecorator')
);

const REMOVE_THE_ANNOTATION = `Remove the annotation`;

/**
 * 校验规则：用于验证`@track` 装饰器时需要遵循的具体约束和条件
 * 1.`@Track` 只能用于类的成员变量
 * 2.`@Track`不能用于被 `@ObservedV2` 装饰的类中
 *
 * 校验等级：error
 */
function _checkTrackDecorator(this: BaseValidator<arkts.AstNode, Object>, node: arkts.AstNode): void {
    const nodeType = arkts.nodeType(node);
    if (checkByType.has(nodeType)) {
        checkByType.get(nodeType)!.bind(this)(node);
    }
}

const checkByType = new Map<arkts.Es2pandaAstNodeType, IntrinsicValidatorFunction | ExtendedValidatorFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, checkTrackInClassProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, checkTrackInMethodDefinition],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_INTERFACE_DECLARATION, checkInvalidTrackInInterface],
]);

function checkTrackInClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo | NormalClassPropertyInfo | GLobalPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsStructPropertyFromInfo(metadata)) {
        checkInvalidTrackInStructProperty.bind(this)(node);
    } else if (checkIsNormalClassPropertyFromInfo(metadata)) {
        checkInvalidTrackInClassProperty.bind(this)(node);
    } else {
        checkInvalidTrackInGlobalProperty.bind(this)(node);
    }
}

function checkTrackInMethodDefinition<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo | NormalClassPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsStructMethodFromInfo(metadata)) {
        checkInvalidTrackInStructMethod.bind(this)(node);
    }
    if (checkIsNormalClassMethodFromInfo(metadata)) {
        checkInvalidTrackInClassMethod.bind(this)(node);
    }
    if (checkIsGlobalFunctionFromInfo(metadata)) {
        checkInvalidTrackInFunction.bind(this)(node);
    }
}

function checkInvalidTrackInStructProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // `@Track` 只能用于类的成员变量
    if (metadata.ignoredAnnotationInfo?.hasTrack) {
        const trackNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACK]!;
        reportTrackOnClassMemberOnlyError.bind(this)(trackNode);
    }
}

function checkInvalidTrackInClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, NormalClassPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // `@Track`不能用于被 `@ObservedV2` 装饰的类中
    if (metadata.annotationInfo?.hasTrack && metadata.classInfo?.annotationInfo?.hasObservedV2) {
        const trackNode = metadata.annotations?.[DecoratorNames.TRACK]!;
        this.report({
            node: trackNode,
            level: LogType.ERROR,
            message: `'@Track' cannot be used with classes decorated by '@ObservedV2'. Use the '@Trace' annotation instead.`,
            suggestion: createSuggestion(``, ...getPositionRangeFromAnnotation(trackNode), REMOVE_THE_ANNOTATION),
        });
    }
}

function checkInvalidTrackInStructMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, StructMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // `@Track` 只能用于类的成员变量
    if (metadata.ignoredAnnotationInfo?.hasTrack) {
        const trackNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACK]!;
        reportTrackOnClassMemberOnlyError.bind(this)(trackNode);
    }
}

function checkInvalidTrackInFunction<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, FunctionInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // `@Track` 只能用于类的成员变量
    if (metadata.ignoredAnnotationInfo?.hasTrack) {
        const trackNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACK]!;
        reportTrackOnClassMemberOnlyError.bind(this)(trackNode);
    }
}

function checkInvalidTrackInClassMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, NormalClassMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // `@Track` 只能用于类的成员变量
    if (metadata.ignoredAnnotationInfo?.hasTrack) {
        const trackNode = metadata.ignoredAnnotations?.[DecoratorNames.TRACK]!;
        reportTrackOnClassMemberOnlyError.bind(this)(trackNode);
    }
}

function checkInvalidTrackInInterface<T extends arkts.AstNode = arkts.TSInterfaceDeclaration>(
    this: BaseValidator<T, NormalInterfaceInfo>,
    node: T
): void {
    const metadata = this.context ?? {};

    if (!arkts.isTSInterfaceDeclaration(node)) {
        return;
    }
    // `@Track` 只能用于类的成员变量
    const trackNode = getAnnotationUsageByName(node.annotations, DecoratorNames.TRACK);
    if (trackNode) {
        reportTrackOnClassMemberOnlyError.bind(this)(trackNode);
    }
}

function checkInvalidTrackInGlobalProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, GLobalPropertyInfo>,
    node: T
): void {
    // `@Track` 只能用于类的成员变量
    const trackDecoratorUsage = arkts.isClassProperty(node)
        ? getAnnotationUsageByName(node.annotations, DecoratorNames.TRACK)
        : undefined;
    if (trackDecoratorUsage) {
        reportTrackOnClassMemberOnlyError.bind(this)(trackDecoratorUsage);
    }
}

function reportTrackOnClassMemberOnlyError<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo>,
    trackNode: arkts.AnnotationUsage
): void {
    this.report({
        node: trackNode,
        level: LogType.ERROR,
        message: `The '@Track' annotation can decorate only member variables of a class.`,
        suggestion: createSuggestion(``, ...getPositionRangeFromAnnotation(trackNode), REMOVE_THE_ANNOTATION),
    });
}
