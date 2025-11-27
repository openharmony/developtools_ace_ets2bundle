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
    checkIsGlobalFunctionFromInfo,
    checkIsNormalClassMethodFromInfo,
    checkIsNormalClassPropertyFromInfo,
    checkIsStructMethodFromInfo,
    checkIsStructPropertyFromInfo,
} from '../../../../collectors/ui-collectors/utils';
import { getAnnotationUsagesByName } from '../utils';
import { checkIsCustomComponentFromInfo } from '../../../../collectors/ui-collectors/utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkValidateDecoratorTarget = performanceLog(
    _checkValidateDecoratorTarget,
    getPerfName([0, 0, 0, 0, 0], 'checkValidateDecoratorTarget')
);

// Can only be used with decorators for struct
const structOnlyAnnotations = [
    StructDecoratorNames.REUSABLE,
    StructDecoratorNames.REUSABLE_V2,
    StructDecoratorNames.COMPONENT,
    StructDecoratorNames.COMPONENT_V2,
    StructDecoratorNames.ENTRY,
    StructDecoratorNames.PREVIEW,
    StructDecoratorNames.CUSTOMDIALOG,
];

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
    if (checkIsCustomComponentFromInfo(metadata)) {
        checkInvalidAnnotationInStruct.bind(this)(node);
    } else {
        checkInvalidAnnotationInClass.bind(this)(node);
    }
}

function checkInvalidAnnotationInStructProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // Error if structOnlyAnnotations exist in the StructProperty
    structOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidStructAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
}

function checkInvalidAnnotationInClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, NormalClassPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // Error if structOnlyAnnotations or propertyOnlyAnnotations exist in the ClassProperty
    structOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidStructAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
    propertyOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidPropertyAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
}

function checkInvalidAnnotationInStructMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, StructMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // Error if structOnlyAnnotations or propertyOnlyAnnotations exist in the StructMethod
    structOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidStructAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
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
    // Error if structOnlyAnnotations or propertyOnlyAnnotations exist in the Function
    structOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidStructAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
    propertyOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidPropertyAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
}

function checkInvalidAnnotationInClassMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, NormalClassMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // Error if structOnlyAnnotations or propertyOnlyAnnotations exist in the ClassMethod
    structOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidStructAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
    propertyOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidPropertyAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
}

function checkInvalidAnnotationInInterface<T extends arkts.AstNode = arkts.TSInterfaceDeclaration>(
    this: BaseValidator<T, NormalInterfaceInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (!arkts.isTSInterfaceDeclaration(node)) {
        return;
    }
    // Error if structOnlyAnnotations or propertyOnlyAnnotations exist in the Interface
    const invalidStructAnnotation = getAnnotationUsagesByName(node.annotations, structOnlyAnnotations);
    invalidStructAnnotation.forEach((annotationUsage) => {
        if (!annotationUsage || !annotationUsage.expr || !arkts.isIdentifier(annotationUsage.expr)) {
            return;
        }
        reportInvalidStructAnnotation.bind(this)(annotationUsage, annotationUsage.expr.name);
    });
    const invalidPropertyAnnotation = getAnnotationUsagesByName(node.annotations, propertyOnlyAnnotations);
    invalidPropertyAnnotation.forEach((annotationUsage) => {
        if (!annotationUsage || !annotationUsage.expr || !arkts.isIdentifier(annotationUsage.expr)) {
            return;
        }
        reportInvalidPropertyAnnotation.bind(this)(annotationUsage, annotationUsage.expr.name);
    });
}

function checkInvalidAnnotationInGlobalProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, GLobalPropertyInfo>,
    node: T
): void {
    // Error if structOnlyAnnotations or propertyOnlyAnnotations exist in the GlobalProperty
    const metadata = this.context ?? {};
    structOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidStructAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
    propertyOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidPropertyAnnotation.bind(this)(annotationUsage, annotation);
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
    // Error if structOnlyAnnotations or propertyOnlyAnnotations exist in the Class
    structOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidStructAnnotation.bind(this)(annotationUsage, annotation);
        }
    });
    propertyOnlyAnnotations.forEach((annotation) => {
        if (metadata.ignoredAnnotations?.[annotation]) {
            const annotationUsage = metadata.ignoredAnnotations?.[annotation]!;
            reportInvalidPropertyAnnotation.bind(this)(annotationUsage, annotation);
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
        message: `'@${annotationName}' can not decorate the method.`,
    });
}
