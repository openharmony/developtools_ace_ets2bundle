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
import { NormalClassRecord, RecordBuilder, StructPropertyInfo } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { TypeFlags, getAnnotationUsageByName } from '../utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkPropertyType = performanceLog(_checkPropertyType, getPerfName([0, 0, 0, 0, 0], 'checkPropertyType'));

const propertyPropDecorator: string[] = [DecoratorNames.PROP_REF, DecoratorNames.STORAGE_PROP_REF];

const SimpleTypesUnSupported = [
    TypeFlags.Boolean,
    TypeFlags.String,
    TypeFlags.Number,
    TypeFlags.Enum,
    TypeFlags.BigInt,
];

const ARRAY_TYPES = ['Array', 'Map', 'Set', 'Date'];

const PropErrorType = ['Any'];

/**
 * 校验规则：用于检验特定装饰器的类型。
 * 1. @ObjectLink 不能用于简单类型和被observeV2装饰的类。仅应用于由 @Observed 装饰或通过 makeV1Observed 初始化的类;
 * 2. @PropRef 或 @StoragePropRef装饰的属性必须是字符串、数字、布尔值、枚举或对象类型;
 * 3. @BuilderParam 属性只能由 @Builder 函数或 @Builder 方法本地初始化;
 *
 * 校验等级：error
 */
function _checkPropertyType(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    node: arkts.ClassProperty
): void {
    const metadata = this.context ?? {};
    if (!metadata.structInfo || !node.key || !arkts.isIdentifier(node.key) || !metadata.name || !node.typeAnnotation) {
        return;
    }
    const propertyName = metadata.name;
    const propertyType = node.typeAnnotation;
    const annotationIdentifier = node.key;
    // @ObjectLink 不能用于简单类型和被observeV2装饰的类。仅应用于由 @Observed 装饰或通过 makeV1Observed 初始化的类
    if (metadata.annotationInfo?.hasObjectLink && propertyType) {
        validateObjectLinkPropertyType.bind(this)(propertyType, annotationIdentifier);
    }
    // @PropRef 或 @StoragePropRef装饰的属性必须是字符串、数字、布尔值、枚举或对象类型
    propertyPropDecorator.forEach((annotation) => {
        if (!metadata.annotations?.[annotation]) {
            return;
        }
        if (
            (arkts.isETSUnionType(propertyType) && !areAllUnionMembersNotAnyAndBigint(propertyType)) ||
            (!arkts.isETSUnionType(propertyType) && typeNodeIsAnyAndBigint(propertyType))
        ) {
            this.report({
                node: annotationIdentifier,
                level: LogType.ERROR,
                message: `The '@${annotation}' decorated attribute '${propertyName}' must be of the string, number, boolean, enum or object type.`,
            });
        }
    });

    // @BuilderParam 属性只能由 @Builder 函数或 @Builder 方法本地初始化
    if (!metadata.annotationInfo?.hasBuilderParam || !node.value) {
        return;
    }
    let methodIdentifier: arkts.Identifier | undefined = undefined;
    if (arkts.isIdentifier(node.value)) {
        methodIdentifier = node.value;
    } else if (arkts.isMemberExpression(node.value) && arkts.isIdentifier(node.value.property)) {
        methodIdentifier = node.value.property;
    }
    const isMethodWithBuilder = methodIdentifier ? isMethodOrFunctionWithBuilderDecorator(methodIdentifier) : undefined;
    if (!methodIdentifier || isMethodWithBuilder === false) {
        this.report({
            node: node.key,
            level: LogType.ERROR,
            message: `'@BuilderParam' property can only be initialized by '@Builder' function or '@Builder' method in struct.`,
        });
    }
}

function validateObjectLinkPropertyType(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    propertyType: arkts.TypeNode,
    annotationIdentifier: arkts.Identifier
): void {
    // @ObjectLink 不能用于简单类型和被observeV2装饰的类。仅应用于由 @Observed 装饰或通过 makeV1Observed 初始化的类
    if (
        arkts.isETSTypeReference(propertyType) &&
        propertyType.part &&
        propertyType.part.name &&
        arkts.isIdentifier(propertyType.part.name)
    ) {
        const propertyTypeName = propertyType.part.name.name;
        if (
            checkTypeClassWithObservedV2(propertyType.part.name) ||
            SimpleTypesUnSupported.includes(propertyTypeName) ||
            PropErrorType.includes(propertyTypeName)
        ) {
            this.report({
                node: annotationIdentifier,
                level: LogType.ERROR,
                message: `'@ObjectLink' cannot be used with this type. Apply it only to classes decorated by '@Observed' or initialized using the return value of 'makeV1Observed'.`,
            });
        }
    } else if (
        arkts.nodeType(propertyType) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_STRING_LITERAL_TYPE ||
        arkts.nodeType(propertyType) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_NULL_TYPE ||
        arkts.nodeType(propertyType) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ERROR_TYPE_NODE ||
        arkts.isETSPrimitiveType(propertyType) ||
        arkts.isETSUndefinedType(propertyType)
    ) {
        this.report({
            node: annotationIdentifier,
            level: LogType.ERROR,
            message: `'@ObjectLink' cannot be used with this type. Apply it only to classes decorated by '@Observed' or initialized using the return value of 'makeV1Observed'.`,
        });
    }
    if (arkts.isETSUnionType(propertyType)) {
        if (!areAllUnionMembersValid(propertyType)) {
            this.report({
                node: annotationIdentifier,
                level: LogType.ERROR,
                message: `'@ObjectLink' cannot be used with this type. Apply it only to classes decorated by '@Observed' or initialized using the return value of 'makeV1Observed'.`,
            });
        }
    }
}

function areAllUnionMembersNotAnyAndBigint(unionType: arkts.ETSUnionType): boolean {
    const members = unionType.types;
    for (const member of members) {
        if (
            typeNodeIsAnyAndBigint(member) === true ||
            arkts.nodeType(member) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ERROR_TYPE_NODE
        ) {
            return false;
        }
    }
    return true;
}

function typeNodeIsAnyAndBigint(member: arkts.TypeNode): boolean | undefined {
    if (arkts.isETSTypeReference(member) && member.part && member.part.name && arkts.isIdentifier(member.part.name)) {
        const propertyTypeName = member.part.name.name;
        if (propertyTypeName === PropErrorType[0] || propertyTypeName === TypeFlags.BigInt) {
            return true;
        }
    }
    return false;
}

function isMethodOrFunctionWithBuilderDecorator(node: arkts.Identifier): boolean {
    const methodDecl = arkts.getPeerIdentifierDecl(node.peer);
    if (
        methodDecl &&
        arkts.isMethodDefinition(methodDecl) &&
        getAnnotationUsageByName(methodDecl.scriptFunction.annotations, DecoratorNames.BUILDER)
    ) {
        return true;
    }
    return false;
}

function checkTypeClassWithObservedV2(classExpr: arkts.Identifier): boolean | undefined {
    let decl: arkts.AstNode | undefined;
    if (!!classExpr) {
        decl = arkts.getPeerIdentifierDecl(classExpr.peer);
    }
    if (!decl || !arkts.isClassDefinition(decl) || !decl.parent || !arkts.isClassDeclaration(decl.parent)) {
        return undefined;
    }
    const classRecord = RecordBuilder.build(NormalClassRecord, decl.parent, { shouldIgnoreDecl: false });
    if (!classRecord.isCollected) {
        classRecord.collect(decl.parent);
    }
    const classInfo = classRecord.toRecord();
    return !!classInfo?.annotationInfo?.hasObservedV2;
}

// null、undefined与有效类型联合为有效，其余情况只要存在无效类型则无效。
function areAllUnionMembersValid(unionType: arkts.ETSUnionType): boolean {
    const members = unionType.types;
    // At least one valid type All types must be allowed types and do not contain illegal combinations
    let isValidType = false;
    for (const member of members) {
        if (
            arkts.isETSTypeReference(member) &&
            member.part &&
            member.part.name &&
            arkts.isIdentifier(member.part.name)
        ) {
            const propertyTypeIdentifier = member.part.name;
            const propertyTypeName = member.part.name.name;
            // If it's a simple type or ObservedV2, reject the entire union type outright
            if (
                checkTypeClassWithObservedV2(propertyTypeIdentifier) ||
                SimpleTypesUnSupported.includes(propertyTypeName) ||
                PropErrorType.includes(propertyTypeName)
            ) {
                return false;
            }
            if (checkTypeClassWithObservedV2(propertyTypeIdentifier) || ARRAY_TYPES.includes(propertyTypeName)) {
                isValidType = true;
            }
        } else if (
            arkts.isETSPrimitiveType(member) ||
            arkts.nodeType(member) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_STRING_LITERAL_TYPE ||
            arkts.nodeType(member) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ERROR_TYPE_NODE
        ) {
            return false;
        } else if (
            arkts.nodeType(member) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_NULL_TYPE ||
            arkts.isETSUndefinedType(member)
        ) {
            continue;
        }
    }
    return isValidType;
}
