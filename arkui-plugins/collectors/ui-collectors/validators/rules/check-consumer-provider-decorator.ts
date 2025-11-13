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
import { coerceToAstNode } from '../utils';
import type { ExtendedValidatorFunction, IntrinsicValidatorFunction } from '../safe-types';
import {
    CallInfo,
    CustomComponentInterfacePropertyInfo,
    CustomComponentInterfacePropertyRecord,
    NormalClassPropertyInfo,
    RecordBuilder,
    StructMethodInfo,
    StructPropertyInfo,
} from '../../records';
import { checkIsNameStartWithBackingField } from '../../utils';
import { DecoratorNames, LogType, StateManagementTypes } from '../../../../common/predefines';
import { createSuggestion, getPositionRangeFromNode } from '../../../../common/log-collector';

/**
 * 校验规则：
 *  1. `@Provider`/`@Consumer`只能用来修饰类成员属性（不能修饰方法、参数等）；
 *  2. 结构体成员变量不能被多个内置装饰器修饰；
 *  3. `@Provider`/`@Consumer`装饰器只能用于`struct`类型，而不能用于类（`class`）或其他类型；
 *  4. 自定义组件中的`@Provider`/`@Consumer`装饰的属性不能在父组件初始化（禁止指定初始值）。
 *
 * 校验等级：error
 */
export function checkConsumerProviderDecorator(
    this: BaseValidator<arkts.AstNode, Object>,
    node: arkts.AstNode,
    other?: arkts.AstNode
): void {
    const nodeType = arkts.nodeType(node);
    if (checkByType.has(nodeType)) {
        checkByType.get(nodeType)!.bind(this)(node, other);
    }
}

function checkConsumerProviderDecoratorInStructMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, StructMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // `@Provider`/`@Consumer`只能用来修饰类成员属性（不能修饰方法、参数等）；
    if (metadata.ignoredAnnotationInfo?.hasConsumer) {
        const annotation = metadata.ignoredAnnotations?.[DecoratorNames.CONSUMER]!;
        this.report({
            node: annotation,
            message: `'@${DecoratorNames.CONSUMER}' can only decorate member property.`,
            level: LogType.ERROR,
            suggestion: createSuggestion('', ...getPositionRangeFromNode(annotation)),
        });
    }
    if (metadata.ignoredAnnotationInfo?.hasProvider) {
        const annotation = metadata.ignoredAnnotations?.[DecoratorNames.PROVIDER]!;
        this.report({
            node: annotation,
            message: `'@${DecoratorNames.PROVIDER}' can only decorate member property.`,
            level: LogType.ERROR,
            suggestion: createSuggestion('', ...getPositionRangeFromNode(annotation)),
        });
    }
}

function checkConsumerProviderDecoratorInProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, PropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    //`@Provider`/`@Consumer`装饰器只能用于`struct`类型，而不能用于类（`class`）或其他类型；
    if (!!metadata.classInfo && metadata.ignoredAnnotationInfo?.hasConsumer) {
        const annotation = metadata.ignoredAnnotations?.[DecoratorNames.CONSUMER]!;
        this.report({
            node: annotation,
            message: `The '@${DecoratorNames.CONSUMER}' annotation can only be used with 'struct'.`,
            level: LogType.ERROR,
            suggestion: createSuggestion('', ...getPositionRangeFromNode(annotation)),
        });
    }
    if (!!metadata.classInfo && metadata.ignoredAnnotationInfo?.hasProvider) {
        const annotation = metadata.ignoredAnnotations?.[DecoratorNames.PROVIDER]!;
        this.report({
            node: annotation,
            message: `The '@${DecoratorNames.PROVIDER}' annotation can only be used with 'struct'.`,
            level: LogType.ERROR,
            suggestion: createSuggestion('', ...getPositionRangeFromNode(annotation)),
        });
    }
    // 结构体成员变量不能被多个内置装饰器修饰；
    let foundOther: arkts.AnnotationUsage | undefined;
    if (
        metadata.annotationInfo?.hasConsumer &&
        !!(foundOther = findOtherDecoratorFromInfo(metadata, DecoratorNames.CONSUMER))
    ) {
        this.report({
            node: foundOther,
            message: `The struct member variable can not be decorated by multiple built-in annotations.`,
            level: LogType.ERROR,
            suggestion: createSuggestion('', ...getPositionRangeFromNode(foundOther)),
        });
    }
    if (
        metadata.annotationInfo?.hasProvider &&
        !!(foundOther = findOtherDecoratorFromInfo(metadata, DecoratorNames.PROVIDER))
    ) {
        this.report({
            node: foundOther,
            message: `The struct member variable can not be decorated by multiple built-in annotations.`,
            level: LogType.ERROR,
            suggestion: createSuggestion('', ...getPositionRangeFromNode(foundOther)),
        });
    }
}

function checkConsumerProviderDecoratorInStructCall<T extends arkts.AstNode = arkts.CallExpression>(
    this: BaseValidator<T, CallInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (!metadata.structDeclInfo?.name) {
        return;
    }
    const structName = metadata.structDeclInfo.name;
    const propertyInfos = metadata.structPropertyInfos ?? [];
    // 自定义组件中的`@Provider`/`@Consumer`装饰的属性不能在父组件初始化（禁止指定初始值）
    for (const propInfo of propertyInfos) {
        const propPtr = propInfo[0];
        const propertyInfo = propInfo[1];
        if (!propertyInfo?.name || propertyInfo.name.startsWith(StateManagementTypes.BACKING)) {
            return;
        }
        const decoratorInfo = findConsumerOrProviderFromInterfacePropertyInfo(propertyInfo);
        if (!!decoratorInfo) {
            const prop = arkts.classByPeer<arkts.Property>(propPtr);
            this.report({
                node: prop,
                message: getForbiddenInitializationMessage(decoratorInfo.name, propertyInfo.name, structName),
                level: LogType.ERROR,
                suggestion: createSuggestion('', ...getPositionRangeFromNode(node)),
            });
        }
    }
}

const checkByType = new Map<arkts.Es2pandaAstNodeType, IntrinsicValidatorFunction | ExtendedValidatorFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, checkConsumerProviderDecoratorInStructMethod],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, checkConsumerProviderDecoratorInProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION, checkConsumerProviderDecoratorInStructCall],
]);

type PropertyInfo = StructPropertyInfo & NormalClassPropertyInfo;

interface DecoratorInfo {
    name: string;
    annotation: arkts.AnnotationUsage;
}

function findOtherDecoratorFromInfo(info: StructPropertyInfo, except: string): arkts.AnnotationUsage | undefined {
    let foundName: string | undefined;
    foundName = Object.keys(info.annotations ?? {}).find((name) => name !== except);
    if (!!foundName) {
        return info.annotations?.[foundName]!;
    }
    foundName = Object.keys(info.ignoredAnnotations ?? {}).find((name) => name !== except);
    return foundName ? info.ignoredAnnotations?.[foundName] : undefined;
}

function findConsumerOrProviderFromInterfacePropertyInfo(
    propertyInfo: CustomComponentInterfacePropertyInfo
): DecoratorInfo | undefined {
    if (propertyInfo?.annotationInfo?.hasConsumer) {
        const annotation = propertyInfo.annotations?.[DecoratorNames.CONSUMER]!;
        return { name: DecoratorNames.CONSUMER, annotation };
    }
    if (propertyInfo?.annotationInfo?.hasProvider) {
        const annotation = propertyInfo.annotations?.[DecoratorNames.PROVIDER]!;
        return { name: DecoratorNames.PROVIDER, annotation };
    }
    return undefined;
}

function findConsumerOrProviderFromInterfaceProperty(property: arkts.MethodDefinition): DecoratorInfo | undefined {
    const structInterfacePropRecord = RecordBuilder.build(CustomComponentInterfacePropertyRecord, property, {
        shouldIgnoreDecl: false,
    });
    if (!structInterfacePropRecord.isCollected) {
        structInterfacePropRecord.collect(property);
    }
    const propertyInfo = structInterfacePropRecord.toRecord();
    if (propertyInfo?.annotationInfo?.hasConsumer) {
        const annotation = propertyInfo.annotations?.[DecoratorNames.CONSUMER]!;
        return { name: DecoratorNames.CONSUMER, annotation };
    }
    if (propertyInfo?.annotationInfo?.hasProvider) {
        const annotation = propertyInfo.annotations?.[DecoratorNames.PROVIDER]!;
        return { name: DecoratorNames.PROVIDER, annotation };
    }
    return undefined;
}

function getForbiddenInitializationMessage(decorator: string, key: string, component: string): string {
    return `The '@${decorator}' property '${key}' in the custom component '${component}' cannot be initialized here (forbidden to specify).`;
}
