/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { StructPropertyInfo } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { expectNameInTypeReference } from '../../../../common/arkts-utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkStructV1DecoratorFunction = performanceLog(
    _checkStructV1DecoratorFunction,
    getPerfName([0, 0, 0, 0, 0], 'checkStructV1DecoratorFunction')
);

const V1_DECORATORS: string[] = [
    DecoratorNames.STATE,
    DecoratorNames.PROP_REF,
    DecoratorNames.PROVIDE,
    DecoratorNames.LINK,
    DecoratorNames.CONSUME,
    DecoratorNames.STORAGE_LINK,
    DecoratorNames.LOCAL_STORAGE_LINK,
    DecoratorNames.STORAGE_PROP_REF,
    DecoratorNames.LOCAL_STORAGE_PROP_REF,
];

/**
 * 校验规则：用于验证V1装饰器（@State、@Link、@PropRef等）不能修饰 Function 类型的变量
 * 1. V1装饰器不能修饰函数类型变量（包括箭头函数类型、Function 类型引用、类型别名间接引用）
 *
 * 校验等级：error
 */
function _checkStructV1DecoratorFunction(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    node: arkts.ClassProperty
): void {
    const metadata = this.context ?? {};
    if (!metadata.structInfo) {
        return;
    }
    const decoratorName = V1_DECORATORS.find((name) => !!metadata.annotations?.[name]);
    if (!decoratorName) {
        return;
    }
    if (!node.typeAnnotation) {
        return;
    }
    const propertyName = metadata.name ?? '';
    if (isFunctionType(node.typeAnnotation, new Set<string>())) {
        this.report({
            node: node,
            level: LogType.ERROR,
            message: `The V1 decorator '@${decoratorName}' cannot be applied to a Function-type variable '${propertyName}'`,
        });
    }
}

function isFunctionType(typeNode: arkts.TypeNode, visited: Set<string>): boolean {
    if (arkts.isETSFunctionType(typeNode)) {
        return true;
    }
    if (isFunctionTypeReference(typeNode, visited)) {
        return true;
    }
    if (arkts.isETSUnionType(typeNode)) {
        return isUnionOfTypeOnlyFunction(typeNode, visited);
    }
    return false;
}

function isFunctionTypeReference(typeNode: arkts.TypeNode, visited: Set<string>): boolean {
    const nameNode = expectNameInTypeReference(typeNode);
    if (!nameNode) {
        return false;
    }
    const typeName = nameNode.name;
    if (typeName === 'Function') {
        return true;
    }
    const decl = arkts.getPeerIdentifierDecl(nameNode.peer);
    if (!decl || !arkts.isTSTypeAliasDeclaration(decl)) {
        return false;
    }
    if (visited.has(typeName)) {
        return false;
    }
    visited.add(typeName);
    return isFunctionType(decl.typeAnnotation, visited);
}

function isUnionOfTypeOnlyFunction(unionType: arkts.ETSUnionType, visited: Set<string>): boolean {
    const types = unionType.types;
    for (const type of types) {
        if (!isFunctionType(type, new Set(visited))) {
            return false;
        }
    }
    return types.length > 0;
}
