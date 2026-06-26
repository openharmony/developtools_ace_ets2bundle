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
import { DecoratorNames, LogType, StructDecoratorNames } from '../../../../common/predefines';
import {
    createSuggestion,
    getPositionRangeFromAnnotation,
} from '../../../../common/log-collector';
import {
    checkIsGlobalFunctionFromInfo,
    checkIsNormalClassMethodFromInfo,
    checkIsNormalClassPropertyFromInfo,
    checkIsStructMethodFromInfo,
    checkIsStructPropertyFromInfo,
} from '../../../../collectors/ui-collectors/utils';
import { checkIsCustomComponentFromInfo } from '../../../../collectors/ui-collectors/utils';
import { getAnnotationUsage } from '../utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkValidateDecoratorTarget = performanceLog(
    _checkValidateDecoratorTarget,
    getPerfName([0, 0, 0, 0, 0], 'checkValidateDecoratorTarget')
);

const ComponentDecorators = [
    StructDecoratorNames.ENTRY,
    StructDecoratorNames.PREVIEW,
    StructDecoratorNames.COMPONENT,
    StructDecoratorNames.COMPONENT_V2,
    StructDecoratorNames.CUSTOMDIALOG,
    StructDecoratorNames.RESUABLE,
    StructDecoratorNames.RESUABLE_V2,
];

const ComponentMemberDecorators = [
    DecoratorNames.STATE,
    DecoratorNames.PROP_REF,
    DecoratorNames.STORAGE_PROP_REF,
    DecoratorNames.LOCAL_STORAGE_PROP_REF,
    DecoratorNames.LINK,
    DecoratorNames.OBJECT_LINK,
    DecoratorNames.STORAGE_LINK,
    DecoratorNames.LOCAL_STORAGE_LINK,
    DecoratorNames.PROVIDE,
    DecoratorNames.CONSUME,
    DecoratorNames.WATCH,
    DecoratorNames.BUILDER_PARAM,
    DecoratorNames.REQUIRE,
    DecoratorNames.EVENT,
    DecoratorNames.CONSUMER,
    DecoratorNames.PROVIDER,
    DecoratorNames.ONCE,
    DecoratorNames.LOCAL,
    DecoratorNames.PARAM,
    DecoratorNames.ENV,
    DecoratorNames.CUSTOM_ENV,
];

const LifecycleDecorators = [
    DecoratorNames.COMPONENT_INIT,
    DecoratorNames.COMPONENT_APPEAR,
    DecoratorNames.COMPONENT_BUILT,
    DecoratorNames.COMPONENT_RECYCLE,
    DecoratorNames.COMPONENT_REUSE,
    DecoratorNames.COMPONENT_DISAPPEAR,
    DecoratorNames.COMPONENT_ACTIVE,
    DecoratorNames.COMPONENT_INACTIVE,
];

// Can only be used with decorators for struct
const structOnlyAnnotations: Set<string> = new Set([
    ...ComponentDecorators,
    ...ComponentMemberDecorators,
    ...LifecycleDecorators,
]);

// Can only be used with decorators for property
const propertyOnlyAnnotations = [
    DecoratorNames.STATE,
    DecoratorNames.PROP_REF,
    DecoratorNames.LINK,
    DecoratorNames.PROVIDE,
    DecoratorNames.CONSUME,
    DecoratorNames.STORAGE_LINK,
    DecoratorNames.STORAGE_PROP_REF,
    DecoratorNames.LOCAL_STORAGE_LINK,
    DecoratorNames.WATCH,
    DecoratorNames.REQUIRE,
    DecoratorNames.OBJECT_LINK,
];

/**
 * 校验规则：用于验证使用装饰器需遵循的具体约束和条件
 * 1. 组件装饰器只能作用于组件结构体。
 * 2. 属性装饰器只能作用于属性，不能用于方法等。
 *
 * 校验等级：error
 */
function _checkValidateDecoratorTarget(this: BaseValidator<arkts.AstNode, Object>, node: arkts.AstNode): void {
    const nodeType = arkts.nodeType(node);
    if (checkByType.has(nodeType)) {
        checkByType.get(nodeType)!.bind(this)(node);
    }
}

const checkByType = new Map<arkts.Es2pandaAstNodeType, IntrinsicValidatorFunction | ExtendedValidatorFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, checkRuleInClassProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, checkRuleInMethodDefinition],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_INTERFACE_DECLARATION, checkInvalidAnnotationInInterface],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_DECLARATION, checkRuleInClassDeclaration],
]);

function checkRuleInClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo | NormalClassPropertyInfo | GLobalPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsStructPropertyFromInfo(metadata)) {
        checkInvalidAnnotationInStructProperty.bind(this)(node);
    } else if (checkIsNormalClassPropertyFromInfo(metadata)) {
        checkInvalidAnnotationInClassProperty.bind(this)(node);
    } else {
        checkInvalidAnnotationInGlobalProperty.bind(this)(node);
    }
}

function checkRuleInMethodDefinition<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo | NormalClassPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsStructMethodFromInfo(metadata)) {
        checkInvalidAnnotationInStructMethod.bind(this)(node);
    }
    if (checkIsNormalClassMethodFromInfo(metadata)) {
        checkInvalidAnnotationInClassMethod.bind(this)(node);
    }
    if (checkIsGlobalFunctionFromInfo(metadata)) {
        checkInvalidAnnotationInFunction.bind(this)(node);
    }
}

function checkRuleInClassDeclaration<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, CustomComponentInfo | NormalClassInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsCustomComponentFromInfo(metadata) || isRawCustomComponent(node)) {
        checkInvalidAnnotationInStruct.bind(this)(node);
    } else {
        checkInvalidAnnotationInClass.bind(this)(node);
    }
}

function isRawCustomComponent(node: arkts.AstNode): boolean {
    if (!arkts.isClassDeclaration(node) || !node.definition) {
        return false;
    }
    return isRawCustomComponentByDefinition(node.definition);
}

function isRawCustomComponentByDefinition(definition: arkts.ClassDefinition): boolean {
    const annotations = definition.annotations;
    return !!getAnnotationUsage(annotations, StructDecoratorNames.COMPONENT) ||
        !!getAnnotationUsage(annotations, StructDecoratorNames.COMPONENT_V2) ||
        !!getAnnotationUsage(annotations, StructDecoratorNames.CUSTOMDIALOG);
}

function checkInvalidAnnotationInStructProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo>,
    node: T
): void {
}

function checkInvalidAnnotationInClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, NormalClassPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    const definitionPtr = metadata.classInfo?.definitionPtr;
    if (definitionPtr) {
        const classDef = arkts.unpackNonNullableNode<arkts.ClassDefinition>(definitionPtr);
        if (isRawCustomComponentByDefinition(classDef)) {
            return;
        }
    }
    structOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidStructAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
}

function checkInvalidAnnotationInStructMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, StructMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    propertyOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidPropertyAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
}

function checkInvalidAnnotationInFunction<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, FunctionInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    structOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidStructAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
    if (arkts.isMethodDefinition(node) && node.function?.body && arkts.isBlockStatement(node.function.body)) {
        checkVariableDeclarationsInBody.bind(this)(node.function.body);
    }
}

function checkVariableDeclarationsInBody<T extends arkts.AstNode>(
    this: BaseValidator<T, Object>,
    body: arkts.BlockStatement
): void {
    for (const stmt of body.statements) {
        if (arkts.isVariableDeclaration(stmt)) {
            validateAnnotationsSimple.bind(this)(stmt.annotations);
        }
    }
}

function validateAnnotationsSimple<T extends arkts.AstNode>(
    this: BaseValidator<T, Object>,
    annotations: readonly arkts.AnnotationUsage[]
): void {
    if (!annotations) {
        return;
    }
    for (const annotation of annotations) {
        if (!annotation.expr || !arkts.isIdentifier(annotation.expr)) {
            continue;
        }
        const name = annotation.expr.name;
        if (structOnlyAnnotations.has(name)) {
            reportInvalidStructAnnotation.bind(this)(annotation, name);
        }
    }
}

function checkInvalidAnnotationInClassMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, NormalClassMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    const definitionPtr = metadata.classInfo?.definitionPtr;
    if (definitionPtr) {
        const classDef = arkts.unpackNonNullableNode<arkts.ClassDefinition>(definitionPtr);
        if (isRawCustomComponentByDefinition(classDef)) {
            return;
        }
    }
    structOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidStructAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
    if (arkts.isMethodDefinition(node) && node.function?.body && arkts.isBlockStatement(node.function.body)) {
        checkVariableDeclarationsInBody.bind(this)(node.function.body);
    }
}

function checkInvalidAnnotationInInterface<T extends arkts.AstNode = arkts.TSInterfaceDeclaration>(
    this: BaseValidator<T, NormalInterfaceInfo>,
    node: T
): void {
    if (!arkts.isTSInterfaceDeclaration(node)) {
        return;
    }
    validateAnnotations.bind(this)(node.annotations);
    const body = node.body?.body;
    if (!body) {
        return;
    }
    for (const member of body) {
        if (arkts.isClassProperty(member)) {
            validateAnnotations.bind(this)(member.annotations);
        } else if (arkts.isMethodDefinition(member)) {
            if (member.function?.annotations) {
                validateAnnotations.bind(this)(member.function.annotations);
            }
        }
    }
}

function validateAnnotations<T extends arkts.AstNode>(
    this: BaseValidator<T, NormalInterfaceInfo>,
    annotations: readonly arkts.AnnotationUsage[]
): void {
    for (const annotation of annotations) {
        if (!annotation.expr || !arkts.isIdentifier(annotation.expr)) {
            continue;
        }
        const name = annotation.expr.name;
        if (structOnlyAnnotations.has(name)) {
            reportInvalidStructAnnotation.bind(this)(annotation, name);
        }
    }
}

function checkInvalidAnnotationInGlobalProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, GLobalPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    structOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidStructAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
}

function checkInvalidAnnotationInStruct<T extends arkts.AstNode = arkts.ClassDefinition>(
    this: BaseValidator<T, CustomComponentInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // Error if propertyOnlyAnnotations exist in the Struct
    propertyOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidPropertyAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
}

function checkInvalidAnnotationInClass<T extends arkts.AstNode = arkts.ClassDefinition>(
    this: BaseValidator<T, NormalClassInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    structOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidStructAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
}

// 组件装饰器只能作用于组件结构体。
function reportInvalidStructAnnotation<T extends arkts.AstNode>(
    this: BaseValidator<T, StructPropertyInfo>,
    errorNode: arkts.AnnotationUsage,
    annotationName: string
): void {
    this.report({
        node: errorNode,
        level: LogType.ERROR,
        message: `The '@${annotationName}' annotation can only be used with 'struct'.`,
        suggestions: [createSuggestion(
            ``,
            ...getPositionRangeFromAnnotation(errorNode),
            `Remove the annotation`
        )],
    });
}

// 属性装饰器只能作用于属性，不能用于方法等。
function reportInvalidPropertyAnnotation<T extends arkts.AstNode>(
    this: BaseValidator<T, StructPropertyInfo>,
    errorNode: arkts.AnnotationUsage,
    annotationName: string
): void {
    this.report({
        node: errorNode,
        level: LogType.ERROR,
        message: `'@${annotationName}' can only decorate member property.`,
    });
}
