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
import { NormalClassMethodInfo, StructMethodInfo, StructPropertyInfo } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { ExtendedValidatorFunction, IntrinsicValidatorFunction } from '../safe-types';
import { checkIsNormalClassMethodFromInfo, checkIsStructMethodFromInfo } from '../../utils';
import { getClassPropertyAnnotationNames } from '../utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkStructPropertyDecorator = performanceLog(
    _checkStructPropertyDecorator,
    getPerfName([0, 0, 0, 0, 0], 'checkStructPropertyDecorator')
);

const INVALID_STATIC_USAGE = `The static variable of struct cannot be used together with built-in annotations.`;

const v1Decorators: string[] = [
    DecoratorNames.BUILDER_PARAM,
    DecoratorNames.STATE,
    DecoratorNames.PROP_REF,
    DecoratorNames.LINK,
    DecoratorNames.OBJECT_LINK,
    DecoratorNames.STORAGE_PROP_REF,
    DecoratorNames.STORAGE_LINK,
    DecoratorNames.WATCH,
    DecoratorNames.LOCAL_STORAGE_LINK,
    DecoratorNames.REQUIRE,
];

const v2Decorators: string[] = [
    DecoratorNames.PARAM,
    DecoratorNames.ONCE,
    DecoratorNames.EVENT,
    DecoratorNames.PROVIDER,
    DecoratorNames.CONSUMER,
    DecoratorNames.MONITOR,
    DecoratorNames.REQUIRE,
];

/**
 * 校验规则：用于验证`struct` 结构体中的静态变量时需要遵循的具体约束和条件
 * 1. V1结构体（`struct`）中的静态变量不能与（V1）内置装饰器一起使用
 * 2. 结构体（`struct`）或类（`class`）中的静态变量或静态方法不能与（V2）内置装饰器一起使用
 *
 * 校验等级：error
 */
function _checkStructPropertyDecorator(this: BaseValidator<arkts.AstNode, Object>, node: arkts.AstNode): void {
    const nodeType = arkts.nodeType(node);
    if (checkByType.has(nodeType)) {
        checkByType.get(nodeType)!.bind(this)(node);
    }
}

const checkByType = new Map<arkts.Es2pandaAstNodeType, IntrinsicValidatorFunction | ExtendedValidatorFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, checkDecoratorInStructProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, checkDecoratorInMethodDefinition],
]);

function checkDecoratorInStructProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    const hasComponent = metadata.structInfo?.annotationInfo?.hasComponent;
    const hasComponentV2 = metadata.structInfo?.annotationInfo?.hasComponentV2;
    if (!node.isStatic || !arkts.isClassProperty(node)) {
        return;
    }
    // V1结构体（`struct`）中的静态变量不能与（V1）内置装饰器一起使用
    if (hasComponent && hasPropertyDecorator(node, v1Decorators) && node.key) {
        const propertyNameNode = node.key;
        this.report({
            node: propertyNameNode,
            level: LogType.ERROR,
            message: INVALID_STATIC_USAGE,
        });
    }
    // 结构体（`struct`）或类（`class`）中的静态变量或静态方法不能与（V2）内置装饰器一起使用
    if (hasComponentV2 && hasPropertyDecorator(node, v2Decorators) && node.key) {
        const propertyNameNode = node.key;
        this.report({
            node: propertyNameNode,
            level: LogType.ERROR,
            message: INVALID_STATIC_USAGE,
        });
    }
}

function checkDecoratorInMethodDefinition<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, StructMethodInfo | NormalClassMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsStructMethodFromInfo(metadata)) {
        checkDecoratorInStructMethod.bind(this)(node);
    }
    if (checkIsNormalClassMethodFromInfo(metadata)) {
        checkDecoratorInClassMethod.bind(this)(node);
    }
}

function checkDecoratorInStructMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, StructMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    const hasComponentV2 = metadata.structInfo?.annotationInfo?.hasComponentV2;
    if (!node.isStatic || !arkts.isMethodDefinition(node)) {
        return;
    }
    // 结构体（`struct`）或类（`class`）中的静态变量或静态方法不能与（V2）内置装饰器一起使用
    if (hasComponentV2 && metadata.annotationInfo?.hasMonitor && node.name) {
        const propertyNameNode = node.name;
        this.report({
            node: propertyNameNode,
            level: LogType.ERROR,
            message: INVALID_STATIC_USAGE,
        });
    }
}

function checkDecoratorInClassMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, NormalClassMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    const hasObservedV2 = metadata.classInfo?.annotationInfo?.hasObservedV2;
    if (!node.isStatic || !arkts.isMethodDefinition(node)) {
        return;
    }
    // 结构体（`struct`）或类（`class`）中的静态变量或静态方法不能与（V2）内置装饰器一起使用
    if (hasObservedV2 && metadata.annotationInfo?.hasMonitor && node.name) {
        const propertyNameNode = node.name;
        this.report({
            node: propertyNameNode,
            level: LogType.ERROR,
            message: INVALID_STATIC_USAGE,
        });
    }
}

function hasPropertyDecorator(node: arkts.ClassProperty, decorators: string[]): boolean {
    const annotationName = getClassPropertyAnnotationNames(node);
    return decorators.some((decorator) => annotationName.includes(decorator));
}
