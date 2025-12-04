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
import { CallInfo } from '../../records';
import { isVariableDeclaration, isFunctionDeclaration } from '../utils';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkConstructParameter = performanceLog(
    _checkConstructParameter,
    getPerfName([0, 0, 0, 0, 0], 'checkConstructParameter')
);

// The decorator structure prohibits initializing the assignment list
const restrictedDecoratorInitializations: Map<string, string[]> = new Map([
    [DecoratorNames.REGULAR, [DecoratorNames.OBJECT_LINK, DecoratorNames.LINK]],
    [DecoratorNames.PROVIDE, [DecoratorNames.REGULAR]],
    [DecoratorNames.CONSUME, [DecoratorNames.REGULAR]],
    [DecoratorNames.STORAGE_PROP_REF, [DecoratorNames.REGULAR]],
    [DecoratorNames.VARIABLE, [DecoratorNames.LINK]],
    [DecoratorNames.LOCAL_STORAGE_LINK, [DecoratorNames.REGULAR]],
]);

/**
 * 校验规则：用于验证自定义组件初始化属性时使用的装饰器类型。
 * 1. 特定装饰器修饰属性在组件构造初始化赋值时报错
 * 2. 当`@Builder`函数被用于初始化非`@BuilderParam`属性时报错
 * 3. 当`@BuilderParam`属性被非`@Builder`函数或方法初始化时报错
 *
 * 校验等级：error
 */
function _checkConstructParameter(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.CallExpression
): void {
    const metadata = this.context ?? {};
    // If a non-custom component is called and is not in the custom component, it returns directly
    if (!metadata.structDeclInfo || !metadata.fromStructInfo) {
        return;
    }
    metadata.structPropertyInfos?.forEach(([propertyPtr, propertyInfo]) => {
        if (!propertyPtr || !propertyInfo) {
            return;
        }
        const property = arkts.unpackNonNullableNode<arkts.Property>(propertyPtr);
        const initializerProperty = property.key;
        const parameterProperty = property.value;

        // Subsequent validation is performed only if the parameterProperty is in this.xxx format or identifier
        if (!initializerProperty || !parameterProperty || !arkts.isIdentifier(initializerProperty)) {
            return;
        }
        const initializerName = initializerProperty.name;
        if (initializerName === '') {
            return;
        }
        const initializerAnnotations: string[] = [];
        for (const annotationKey in propertyInfo.annotations) {
            initializerAnnotations.push(annotationKey);
        }
        for (const annotationKey in propertyInfo.ignoredAnnotations) {
            initializerAnnotations.push(annotationKey);
        }
        if (initializerAnnotations.length === 0) {
            initializerAnnotations.push(DecoratorNames.REGULAR);
        }

        const { parameterAnnotations, parameterName } = getParameterAnnotationsAndName(parameterProperty);
        if (parameterAnnotations.length === 0 || parameterName === '') {
            return;
        }
        checkAndReportError.bind(this)(
            initializerAnnotations,
            parameterAnnotations,
            initializerName,
            parameterName,
            property
        );
    });
}

export function checkAndReportError(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    initializerAnnotations: string[],
    parameterAnnotations: string[],
    initializerName: string,
    parameterName: string,
    property: arkts.Property
): void {
    // 特定装饰器修饰属性在组件构造初始化赋值时报错
    parameterAnnotations.forEach((annotationName) => {
        if (!restrictedDecoratorInitializations.has(annotationName)) {
            return;
        }
        const cannotInitialize = restrictedDecoratorInitializations.get(annotationName)!;
        cannotInitialize.forEach((cannotInitializeAnnotationName) => {
            if (!initializerAnnotations.includes(cannotInitializeAnnotationName)) {
                return;
            }
            this.report({
                node: property,
                level: LogType.ERROR,
                message: `The '${annotationName}' property '${initializerName}' cannot be assigned to the '${cannotInitializeAnnotationName}' property '${parameterName}'.`,
            });
        });
    });
    // 当`@Builder`函数被用于初始化非`@BuilderParam`属性时报错
    if (
        parameterAnnotations.includes(DecoratorNames.BUILDER) &&
        !initializerAnnotations.includes(DecoratorNames.BUILDER_PARAM)
    ) {
        this.report({
            node: property,
            level: LogType.ERROR,
            message: `'@Builder' function '${initializerName}' can only initialize '@BuilderParam' attribute.`,
        });
    }
    // 当`@BuilderParam`属性被非`@Builder`函数或方法初始化时报错
    if (
        !parameterAnnotations.includes(DecoratorNames.BUILDER) &&
        initializerAnnotations.includes(DecoratorNames.BUILDER_PARAM)
    ) {
        this.report({
            node: property,
            level: LogType.WARN,
            message: `'@BuilderParam' attribute '${parameterName}' can only initialized by '@Builder' function or '@Builder' method in struct.`,
        });
    }
}

function getParameterAnnotationsAndName(parameterProperty: arkts.AstNode): {
    parameterAnnotations: string[];
    parameterName: string;
} {
    const isIdentifierParameter = arkts.isIdentifier(parameterProperty);
    const isThisParameter =
        arkts.isMemberExpression(parameterProperty) && arkts.isThisExpression(parameterProperty.object);
    let parameterAnnotations: string[] = [];
    let parameterName: string = '';
    if (isIdentifierParameter) {
        parameterName = parameterProperty.name;
        const parameterNode = arkts.getPeerIdentifierDecl(parameterProperty.peer);
        if (parameterNode && isVariableDeclaration(parameterNode)) {
            return { parameterAnnotations: [DecoratorNames.VARIABLE], parameterName: parameterName };
        }
        if (!parameterNode || !isFunctionDeclaration(parameterNode)) {
            return { parameterAnnotations: [], parameterName: '' };
        }
        const funcAnnotations = parameterNode.function.annotations;
        if (!funcAnnotations || funcAnnotations.length === 0) {
            return { parameterAnnotations: [DecoratorNames.REGULAR], parameterName: parameterName };
        }
        funcAnnotations.forEach((annotation) => {
            if (!annotation.expr || !arkts.isIdentifier(annotation.expr) || annotation.expr.name === '') {
                return;
            }
            parameterAnnotations.push(annotation.expr.name);
        });
    }
    if (isThisParameter) {
        const propertyDecl = arkts.getPeerIdentifierDecl(parameterProperty.property!.peer);
        if (!propertyDecl || !arkts.isClassProperty(propertyDecl) || !arkts.isIdentifier(parameterProperty.property)) {
            return { parameterAnnotations: [], parameterName: '' };
        }
        parameterName = parameterProperty.property.name;
        if (propertyDecl.annotations.length === 0) {
            return { parameterAnnotations: [DecoratorNames.REGULAR], parameterName: parameterName };
        }
        propertyDecl.annotations.forEach((annotation) => {
            if (!annotation.expr || !arkts.isIdentifier(annotation.expr) || annotation.expr.name === '') {
                return;
            }
            parameterAnnotations.push(annotation.expr.name);
        });
    }
    return { parameterAnnotations, parameterName };
}
