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
import { coerceToAstNode } from '../utils';
import type { IntrinsicValidatorFunction } from '../safe-types';
import { CallInfo, StructPropertyInfo, CustomComponentInterfacePropertyInfo } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

const ENV_TYPE_ARG_MAP: Map<string, string> = new Map([
    ['WindowSizeLayoutBreakpointInfo', 'SystemProperties.BREAK_POINT'],
    ['UIEnvWindowAvoidAreaInfoVP', 'SystemProperties.WINDOW_AVOID_AREA'],
    ['UIEnvWindowAvoidAreaInfoPX', 'SystemProperties.WINDOW_AVOID_AREA_PX'],
    ['SizeInVP', 'SystemProperties.WINDOW_SIZE'],
    ['Size', 'SystemProperties.WINDOW_SIZE_PX'],
]);

const ENV_TYPE_KEYS = [...ENV_TYPE_ARG_MAP.values()];

export const checkEnvDecorator = performanceLog(
    _checkEnvDecorator,
    getPerfName([0, 0, 0, 0, 0], 'checkEnvDecorator')
);

/**
 * 校验规则：
 *  1. `@Env`装饰的属性类型必须是指定的类型或其子类；
 *  2. `@Env`装饰器的参数必须与属性类型匹配；
 *  3. 在`@Component`结构体中，`@Env`变量只能初始化常规（无装饰器）属性；
 *  4. 在`@ComponentV2`结构体中，`@Env`变量只能初始化`@Param`装饰的属性。
 *
 * 校验等级：error
 */
function _checkEnvDecorator(this: BaseValidator<arkts.AstNode, Object>, node: arkts.AstNode): void {
    const nodeType = arkts.nodeType(node);
    if (checkByType.has(nodeType)) {
        checkByType.get(nodeType)!.bind(this)(node);
    }
}

function checkEnvVariableType<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    const _node = coerceToAstNode<arkts.ClassProperty>(node);
    const envDecorator = metadata.annotations?.[DecoratorNames.ENV];
    if (!envDecorator) {
        return;
    }
    const propType = _node.typeAnnotation;
    if (!propType) {
        reportEnvInvalidType.bind(this)(_node);
        return;
    }
    if (!arkts.isETSTypeReference(propType)) {
        return;
    }
    const envTypeName: { currentTypeName: string } = { currentTypeName: '' };
    if (!isEnvVariableTypeValid(propType, envTypeName)) {
        reportEnvInvalidType.bind(this)(_node);
        return;
    }
    const expectedKey = ENV_TYPE_ARG_MAP.get(envTypeName.currentTypeName);
    if (!expectedKey) {
        return;
    }
    const envKey = extractEnvKey(envDecorator);
    if (!envKey || !ENV_TYPE_KEYS.includes(envKey)) {
        return;
    }
    if (ENV_TYPE_ARG_MAP.get(envTypeName.currentTypeName) !== envKey) {
        this.report({
            node: _node,
            level: LogType.ERROR,
            message: `Invalid parameter. State variables decorated with '@Env' of '${envTypeName.currentTypeName}' can only accept ${expectedKey}.`,
        });
    }
}

function checkEnvInitInStructCall<T extends arkts.AstNode = arkts.CallExpression>(
    this: BaseValidator<T, CallInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (!metadata.structDeclInfo?.name) {
        return;
    }
    const hasComponent = !!metadata.structDeclInfo.annotationInfo?.hasComponent;
    const hasComponentV2 = !!metadata.structDeclInfo.annotationInfo?.hasComponentV2;
    if (!hasComponent && !hasComponentV2) {
        return;
    }
    const propertyInfos = metadata.structPropertyInfos ?? [];
    for (const [propPtr, propertyInfo] of propertyInfos) {
        checkEnvInitForProperty.bind(this)(propPtr, propertyInfo, hasComponent, hasComponentV2);
    }
}

function checkEnvInitForProperty<T extends arkts.AstNode = arkts.CallExpression>(
    this: BaseValidator<T, CallInfo>,
    propPtr: arkts.AstNode,
    propertyInfo: CustomComponentInterfacePropertyInfo | undefined,
    hasComponent: boolean,
    hasComponentV2: boolean
): void {
    const prop = arkts.classByPeer<arkts.Property>(propPtr);
    if (!prop?.value) {
        return;
    }
    const valueDecl = arkts.getDecl(prop.value);
    if (!valueDecl || !arkts.isClassProperty(valueDecl) || !findEnvDecorator(valueDecl)) {
        return;
    }
    if (hasComponent && hasAnyStateDecorator(propertyInfo)) {
        this.report({
            node: prop,
            level: LogType.ERROR,
            message: `Within structs decorated with '@Component', '@Env' can only initialize regular(non-decorated) variables.`,
        });
    }
    if (hasComponentV2 && !propertyInfo?.annotationInfo?.hasParam) {
        this.report({
            node: prop,
            level: LogType.ERROR,
            message: `Within structs decorated with '@ComponentV2', '@Env' can only initialize variables decorated with '@Param'.`,
        });
    }
}

const checkByType = new Map<arkts.Es2pandaAstNodeType, IntrinsicValidatorFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, checkEnvVariableType],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION, checkEnvInitInStructCall],
]);

function reportEnvInvalidType(
    this: BaseValidator<arkts.AstNode, Object>,
    node: arkts.ClassProperty
): void {
    this.report({
        node,
        level: LogType.ERROR,
        message: `The '@Env' annotation can only decorate 'WindowSizeLayoutBreakpointInfo', 'SizeInVP', 'Size', ` +
            `'UIEnvWindowAvoidAreaInfoVP', 'UIEnvWindowAvoidAreaInfoPX' classes and their child classes.`,
    });
}

function findEnvDecorator(node: arkts.ClassProperty): arkts.AnnotationUsage | undefined {
    return node.annotations?.find(annotation =>
        annotation.expr && arkts.isIdentifier(annotation.expr) &&
        annotation.expr.name === DecoratorNames.ENV
    );
}

function hasAnyStateDecorator(info: CustomComponentInterfacePropertyInfo | undefined): boolean {
    if (!info?.annotationInfo) {
        return false;
    }
    const annoInfo = info.annotationInfo;
    return [
        annoInfo.hasState, annoInfo.hasStorageLink, annoInfo.hasLink, annoInfo.hasProvide,
        annoInfo.hasConsume, annoInfo.hasObjectLink, annoInfo.hasWatch, annoInfo.hasBuilderParam,
        annoInfo.hasLocalStorageLink, annoInfo.hasPropRef, annoInfo.hasStoragePropRef,
        annoInfo.hasLocalStoragePropRef, annoInfo.hasLocal, annoInfo.hasOnce, annoInfo.hasParam,
        annoInfo.hasEvent, annoInfo.hasRequire, annoInfo.hasConsumer, annoInfo.hasProvider
    ].some(Boolean);
}

function isEnvVariableTypeValid(
    propType: arkts.ETSTypeReference,
    envTypeName: { currentTypeName: string }
): boolean {
    if (!propType.part || !propType.part.name) {
        return false;
    }
    let typeDecl: arkts.AstNode | undefined;
    if (arkts.isIdentifier(propType.part.name)) {
        typeDecl = arkts.getDecl(propType.part.name);
    } else if (arkts.isTSQualifiedName(propType.part.name) && propType.part.name.right) {
        typeDecl = arkts.getDecl(propType.part.name.right);
    }
    if (!typeDecl) {
        return false;
    }
    if (arkts.isTSInterfaceDeclaration(typeDecl)) {
        const typeName = typeDecl.id?.name;
        if (!!typeName && ENV_TYPE_ARG_MAP.has(typeName)) {
            envTypeName.currentTypeName = typeName;
            return true;
        }
        return false;
    }
    if (arkts.isClassDefinition(typeDecl)) {
        const typeName = typeDecl.ident?.name;
        if (!!typeName && ENV_TYPE_ARG_MAP.has(typeName)) {
            envTypeName.currentTypeName = typeName;
            return true;
        }
        let isValidImplements = false;
        if (!!typeDecl.implements) {
            isValidImplements = typeDecl.implements.some((typeImplement) =>
                typeImplement.expr &&
                arkts.isETSTypeReference(typeImplement.expr) &&
                isEnvVariableTypeValid(typeImplement.expr, envTypeName)
            );
        }
        if (!isValidImplements && !!typeDecl.super && arkts.isETSTypeReference(typeDecl.super)) {
            return isEnvVariableTypeValid(typeDecl.super, envTypeName);
        }
        return isValidImplements;
    }
    return false;
}

function extractEnvKey(decorator: arkts.AnnotationUsage): string | undefined {
    if (decorator.properties.length !== 1 || !arkts.isClassProperty(decorator.properties[0])) {
        return undefined;
    }
    const value = decorator.properties[0].value;
    return value?.dumpSrc();
}
