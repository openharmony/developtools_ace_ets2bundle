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
import type { IntrinsicValidatorFunction, ModifiedValidatorFunction } from '../safe-types';
import {
    CallInfo,
    CustomComponentInterfacePropertyRecord,
    RecordBuilder,
    StructMethodInfo,
    StructPropertyInfo,
} from '../../records';
import { checkIsNameStartWithBackingField } from '../../utils';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { createSuggestion, getPositionRangeFromNode } from '../../../../common/log-collector';

/**
 * 校验规则：
 *  1. 确保成员属性或方法不能同时被多个内置装饰器（`@Local`, `@Param`, `@Event`）装饰；
 *  2. 当用`@Param`装饰的变量没有被分配默认值时，它也必须用`@Require`装饰；
 *  3. 在被`@ComponentV2`装饰的结构体中，`@Require`只能与`@Param`一起使用；
 *  4. 检查自定义组件中的`@Local`属性和无装饰器属性是否尝试在外部初始化；
 *  5. 确保`@Local`，`@Param`，`@Event`装饰器只能用于成员属性，而不能用于方法。
 *
 * 校验等级：error
 */
export function checkComponentV2StateUsage(this: BaseValidator<arkts.AstNode, Object>, node: arkts.AstNode): void {
    const nodeType = arkts.nodeType(node);
    if (checkByType.has(nodeType)) {
        checkByType.get(nodeType)!.bind(this)(node);
    }
}

function checkComponentV2StateUsageInClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo>,
    node: T
): void {
    const _node = coerceToAstNode<arkts.ClassProperty>(node);
    const metadata = this.context ?? {};
    if (!metadata.structInfo?.annotationInfo?.hasComponentV2) {
        return;
    }
    const decorators = findStructAttributeBuiltInDecoratorsFromInfo(metadata);
    // 成员属性不能同时被多个内置装饰器（`@Local`, `@Param`, `@Event`）装饰
    if (decorators.length > 1) {
        decorators.forEach((info) =>
            this.report({
                node: info.annotation,
                message: `The member property or method cannot be decorated by multiple built-in annotations.`,
                level: LogType.ERROR,
            })
        );
    }
    // 当用`@Param`装饰的变量没有被分配默认值时，它也必须用`@Require`装饰
    if (!_node.value && checkIsParamNotPairedWithRequireFromInfo(metadata)) {
        const position = node.startPosition;
        this.report({
            node,
            message: `When a variable decorated with '@Param' is not assigned a default value, it must also be decorated with '@Require'.`,
            level: LogType.ERROR,
            suggestion: createSuggestion(`@${DecoratorNames.REQUIRE}`, position, position),
        });
    }
    // 在被`@ComponentV2`装饰的结构体中，`@Require`只能与`@Param`一起使用
    if (checkIsRequireNotPariedWithParamOrBuilderParam(metadata)) {
        const requiredDecorator = metadata.annotations?.[DecoratorNames.REQUIRE]!;
        this.report({
            node: requiredDecorator,
            message: `In a struct decorated with '@ComponentV2', '@Require' can only be used with '@Param' or '@BuilderParam'.`,
            level: LogType.ERROR,
            suggestion: createSuggestion('', ...getPositionRangeFromNode(requiredDecorator)),
        });
    }
}

function checkComponentV2StateUsageInStructCall<T extends arkts.AstNode = arkts.CallExpression>(
    this: BaseValidator<T, CallInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (!metadata.structDeclInfo?.name) {
        return;
    }
    const structName = metadata.structDeclInfo.name;
    const propertyInfos = metadata.structPropertyInfos ?? [];
    // 检查自定义组件中的`@Local`属性和无装饰器属性是否尝试在外部初始化
    for (const propInfo of propertyInfos) {
        const propPtr = propInfo[0];
        const propertyInfo = propInfo[1];
        let reportDecoratorName: string | undefined;
        if (propertyInfo?.annotationInfo?.hasLocal) {
            reportDecoratorName = `@${DecoratorNames.LOCAL}`;
        } else if (!propertyInfo?.annotationInfo || Object.keys(propertyInfo.annotationInfo).length === 0) {
            reportDecoratorName = 'regular';
        }
        if (!!reportDecoratorName && !!propertyInfo?.name) {
            const prop = arkts.classByPeer<arkts.Property>(propPtr);
            this.report({
                node: prop,
                message: getLocalNeedNoInitReportMessage(reportDecoratorName, propertyInfo?.name, structName),
                level: LogType.ERROR,
                suggestion: createSuggestion('', ...getPositionRangeFromNode(prop)),
            });
        }
    }
}

function checkComponentV2StateUsageInStructMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, StructMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (!metadata.structInfo?.annotationInfo?.hasComponentV2) {
        return;
    }
    const decorators = findStructAttributeBuiltInDecoratorsFromInfo(metadata);
    // 确保`@Local`，`@Param`，`@Event`装饰器只能用于成员属性，而不能用于方法
    if (decorators.length > 0) {
        decorators.forEach((info) =>
            this.report({
                node: info.annotation,
                message: `'@${info.name}' can only decorate member property.`,
                level: LogType.ERROR,
                suggestion: createSuggestion('', ...getPositionRangeFromNode(info.annotation)),
            })
        );
    }
}

const checkByType = new Map<arkts.Es2pandaAstNodeType, IntrinsicValidatorFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, checkComponentV2StateUsageInClassProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION, checkComponentV2StateUsageInStructCall],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, checkComponentV2StateUsageInStructMethod],
]);

interface DecoratorInfo {
    name: string;
    annotation: arkts.AnnotationUsage;
}

const builtInDecorators: string[] = [DecoratorNames.LOCAL, DecoratorNames.PARAM, DecoratorNames.EVENT];

function getLocalNeedNoInitReportMessage(decorator: string, key: string, component: string): string {
    return `The '${decorator}' property '${key}' in the custom component '${component}' cannot be initialized here (forbidden to specify).`;
}

function findStructAttributeBuiltInDecoratorsFromInfo(info: StructPropertyInfo | StructMethodInfo): DecoratorInfo[] {
    if (!info.annotationInfo || !info.annotations) {
        return [];
    }
    return builtInDecorators
        .filter((name) => !!info.annotationInfo?.[`has${name}`])
        .map((name) => ({
            name,
            annotation: info.annotations?.[name]!,
        }));
}

function checkIsParamNotPairedWithRequireFromInfo(info: StructPropertyInfo): boolean {
    if (!info.annotationInfo) {
        return false;
    }
    return !!info.annotationInfo.hasParam && !info.annotationInfo.hasRequire;
}

function checkIsRequireNotPariedWithParamOrBuilderParam(info: StructPropertyInfo): boolean {
    if (!info.annotationInfo || !info.annotationInfo.hasRequire) {
        return false;
    }
    return !info.annotationInfo.hasParam && !info.annotationInfo.hasBuilderParam;
}
