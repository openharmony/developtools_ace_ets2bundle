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
import { LogType } from '../../../../common/predefines';
import { FunctionInfo, StructMethodInfo } from '../../records';
import { checkIsStructMethodFromInfo } from '../../utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

const BUILD_NAME = 'build';
const REMEMBER_VARIABLE = 'rememberVariable';
const VALUE = 'value';
const TYPE_UNION = 'union';
const TYPE_ARRAY = 'Array';
const TYPE_UNKNOWN = 'unknown';

const MESSAGE = `State variables cannot be modified during the build process.`;

export const checkNoVariablesChangeInBuild = performanceLog(
    _checkNoVariablesChangeInBuild,
    getPerfName([0, 0, 0, 0, 0], 'checkNoVariablesChangeInBuild')
);

/**
 * 校验规则：build() 方法和 @Builder 方法/函数内不能修改变量。
 * 1. this.xxx 赋值/自增：有状态装饰器 → error，无装饰器 → warn
 * 2. this.xxx.yyy.zzz 赋值：沿类型链解析，全路径状态变量 → error，否则 → warn
 * 3. rememberVariable 变量 .value 修改 → warn
 * 4. 箭头函数内的修改不报错
 */
function _checkNoVariablesChangeInBuild(
    this: BaseValidator<arkts.MethodDefinition, StructMethodInfo | FunctionInfo>,
    node: arkts.MethodDefinition
): void {
    const metadata = this.context ?? {};
    if (checkIsStructMethodFromInfo(metadata) && metadata.structInfo?.definitionPtr) {
        checkInStructMethod.bind(this)(node);
    } else {
        checkInGlobalFunction.bind(this)(node);
    }
}

// ===== SECTION: Entry handlers =====

function checkInStructMethod(
    this: BaseValidator<arkts.MethodDefinition, StructMethodInfo>,
    node: arkts.MethodDefinition
): void {
    const metadata = this.context ?? {};
    const isBuildMethod = metadata.name === BUILD_NAME;
    const isBuilderMethod = !!metadata.annotationInfo?.hasBuilder;
    if (!isBuildMethod && !isBuilderMethod) {
        return;
    }

    const structDef = arkts.unpackNonNullableNode<arkts.ClassDefinition>(metadata.structInfo!.definitionPtr!);
    const body = node.function?.body;
    if (!body || !arkts.isBlockStatement(body)) {
        return;
    }

    const rememberVars = collectRememberVariables(body);
    const reported = new Set<arkts.AstNode>();
    traverseBody.bind(this)(body, structDef, rememberVars, reported);
}

function checkInGlobalFunction(
    this: BaseValidator<arkts.MethodDefinition, FunctionInfo>,
    node: arkts.MethodDefinition
): void {
    const metadata = this.context ?? {};
    if (!metadata.annotationInfo?.hasBuilder) {
        return;
    }

    const body = node.function?.body;
    if (!body || !arkts.isBlockStatement(body)) {
        return;
    }

    const rememberVars = collectRememberVariables(body);
    const reported = new Set<arkts.AstNode>();
    traverseBody.bind(this)(body, undefined, rememberVars, reported);
}

// ===== SECTION: Body traversal =====

function traverseBody(
    this: BaseValidator<arkts.MethodDefinition, StructMethodInfo | FunctionInfo>,
    node: arkts.AstNode,
    structDef: arkts.ClassDefinition | undefined,
    rememberVars: Map<string, string[]>,
    reported: Set<arkts.AstNode>
): void {
    for (const child of node.getChildren()) {
        if (arkts.isAssignmentExpression(child) || arkts.isUpdateExpression(child)) {
            if (!reported.has(child) && !isInEventHandlerCallback(child)) {
                validateModification.bind(this)(child, structDef, rememberVars, reported);
            }
        }
        traverseBody.bind(this)(child, structDef, rememberVars, reported);
    }
}

// ===== SECTION: Modification validation =====

function validateModification(
    this: BaseValidator<arkts.MethodDefinition, StructMethodInfo | FunctionInfo>,
    node: arkts.AstNode,
    structDef: arkts.ClassDefinition | undefined,
    rememberVars: Map<string, string[]>,
    reported: Set<arkts.AstNode>
): void {
    const left = getLeftSide(node);
    if (!left) {
        return;
    }

    const reportedFlag = { value: false };

    validateDirectModification.bind(this)(left, node, reportedFlag);

    if (!reportedFlag.value) {
        validateNestedModification.bind(this)(left, node, structDef, reportedFlag);
    }

    if (!reportedFlag.value) {
        validateRememberModification.bind(this)(left, node, rememberVars, reportedFlag);
    }

    if (reportedFlag.value) {
        reported.add(node);
    }
}

function validateDirectModification(
    this: BaseValidator<arkts.MethodDefinition, StructMethodInfo | FunctionInfo>,
    left: arkts.AstNode,
    errorNode: arkts.AstNode,
    reported: { value: boolean }
): void {
    if (!arkts.isMemberExpression(left) || !arkts.isThisExpression(left.object) || !arkts.isIdentifier(left.property)) {
        return;
    }
    reported.value = true;
    const decl = arkts.getPeerIdentifierDecl(left.property.peer);
    const annotations = decl ? getNodeAnnotationNames(decl) : [];
    this.report({
        node: errorNode,
        level: annotations.length > 0 ? LogType.ERROR : LogType.WARN,
        message: MESSAGE,
    });
}

function validateNestedModification(
    this: BaseValidator<arkts.MethodDefinition, StructMethodInfo | FunctionInfo>,
    left: arkts.AstNode,
    errorNode: arkts.AstNode,
    structDef: arkts.ClassDefinition | undefined,
    reported: { value: boolean }
): void {
    if (!arkts.isMemberExpression(left) || !structDef) {
        return;
    }
    const propertyNames = extractPropertyNames(left);
    if (propertyNames.length === 0) {
        return;
    }

    const firstProp = findPropertyInStruct(structDef, propertyNames[0]);
    const firstAnnotations = firstProp ? getNodeAnnotationNames(firstProp) : [];
    const nestState = firstProp ? checkRemainState(propertyNames.slice(1), firstProp.typeAnnotation) : false;

    reported.value = true;
    this.report({
        node: errorNode,
        level: firstAnnotations.length > 0 && nestState ? LogType.ERROR : LogType.WARN,
        message: MESSAGE,
    });
}

function validateRememberModification(
    this: BaseValidator<arkts.MethodDefinition, StructMethodInfo | FunctionInfo>,
    left: arkts.AstNode,
    errorNode: arkts.AstNode,
    rememberVars: Map<string, string[]>,
    reported: { value: boolean }
): void {
    const propertyNames = extractPropertyNames(left);
    if (propertyNames.length < 2 || !rememberVars.has(propertyNames[0]) || propertyNames[1] !== VALUE) {
        return;
    }
    reported.value = true;
    this.report({
        node: errorNode,
        level: LogType.WARN,
        message: MESSAGE,
    });
}

// ===== SECTION: Checked-stage semantic resolution (getPeerIdentifierDecl) =====

function resolveTypeToClass(typeAnnotation: arkts.AstNode | undefined): arkts.AstNode | undefined {
    if (!typeAnnotation || !arkts.isETSTypeReference(typeAnnotation)) {
        return undefined;
    }
    const nameId = typeAnnotation.part?.name;
    if (!nameId || !arkts.isIdentifier(nameId)) {
        return undefined;
    }
    const decl = arkts.getPeerIdentifierDecl(nameId.peer);
    if (!decl) {
        return undefined;
    }
    if (arkts.isClassDeclaration(decl) || arkts.isETSStructDeclaration(decl)) {
        return decl;
    }
    if (arkts.isClassDefinition(decl)) {
        return decl.parent && (arkts.isClassDeclaration(decl.parent) || arkts.isETSStructDeclaration(decl.parent))
            ? decl.parent
            : decl;
    }
    return undefined;
}

// ===== SECTION: Nested type resolution =====

function checkRemainState(
    propertyPath: string[],
    currentTypeAnnotation: arkts.AstNode | undefined
): boolean {
    if (!propertyPath || propertyPath.length === 0) {
        return true;
    }
    if (!currentTypeAnnotation) {
        return false;
    }

    const typeName = getTypeNameFromAnnotation(currentTypeAnnotation);

    if (typeName === TYPE_UNION && arkts.isETSUnionType(currentTypeAnnotation)) {
        return handleUnionType(currentTypeAnnotation, propertyPath);
    }
    if (typeName === TYPE_ARRAY) {
        const elementType = getArrayElementType(currentTypeAnnotation as arkts.TypeNode);
        return elementType ? checkRemainState(propertyPath, elementType) : propertyPath.length === 0;
    }
    if (!isValidTypeName(typeName)) {
        return false;
    }

    const classNode = resolveTypeToClass(currentTypeAnnotation);
    if (!classNode) {
        return false;
    }
    const result = checkClassMembers(classNode, propertyPath[0], propertyPath.slice(1));
    return result !== null ? result : checkSuperClass(classNode, propertyPath);
}

function handleUnionType(unionType: arkts.ETSUnionType, remainingPath: string[]): boolean {
    const memberTypes: arkts.AstNode[] = [];
    for (const memberType of unionType.types) {
        if (!arkts.isETSTypeReference(memberType)) {
            continue;
        }
        const classNode = resolveTypeToClass(memberType);
        if (!classNode) {
            continue;
        }
        if (remainingPath.length === 0 || hasPropertyInType(classNode, remainingPath[0], remainingPath.slice(1))) {
            memberTypes.push(memberType);
        }
    }
    return memberTypes.length > 0 && memberTypes.every((t) => checkRemainState(remainingPath, t));
}

function checkClassMembers(
    classNode: arkts.AstNode,
    firstPropertyName: string,
    remainingPath: string[]
): boolean | null {
    const body = getClassBody(classNode);
    if (!body) {
        return null;
    }
    for (const member of body) {
        if (!isMatchingMember(member, firstPropertyName)) {
            continue;
        }
        if (getNodeAnnotationNames(member).length === 0) {
            return false;
        }
        if (arkts.isClassProperty(member)) {
            return checkRemainState(remainingPath, member.typeAnnotation);
        }
        return remainingPath.length === 0;
    }
    return null;
}

function checkSuperClass(classNode: arkts.AstNode, propertyPath: string[]): boolean {
    let superRef: arkts.AstNode | undefined;
    if (arkts.isClassDeclaration(classNode)) {
        superRef = classNode.definition?.super;
    } else if (arkts.isClassDefinition(classNode)) {
        superRef = classNode.super;
    }
    if (!superRef || !arkts.isETSTypeReference(superRef)) {
        return false;
    }
    return checkRemainState(propertyPath, superRef);
}

function hasPropertyInType(typeNode: arkts.AstNode, propertyName: string, remainingPath: string[]): boolean {
    const body = getClassBody(typeNode);
    if (!body) {
        return false;
    }
    for (const member of body) {
        if (!arkts.isClassProperty(member) || !isMatchingMember(member, propertyName)) {
            continue;
        }
        if (remainingPath.length === 0) {
            return true;
        }
        return isValidTypeName(getTypeNameFromAnnotation(member.typeAnnotation));
    }
    return false;
}

// ===== SECTION: Remember variable collection =====

function collectRememberVariables(block: arkts.BlockStatement): Map<string, string[]> {
    const result = new Map<string, string[]>();
    for (const stmt of block.statements) {
        if (!arkts.isVariableDeclaration(stmt)) {
            continue;
        }
        for (const declarator of stmt.declarators) {
            if (!arkts.isVariableDeclarator(declarator) || !arkts.isIdentifier(declarator.id)) {
                continue;
            }
            if (isRememberVariableInit(declarator.init)) {
                result.set(declarator.id.name, ['MutableVariable']);
            }
        }
    }
    return result;
}

function isRememberVariableInit(init: arkts.AstNode | undefined): boolean {
    return !!(
        init &&
        arkts.isCallExpression(init) &&
        arkts.isIdentifier(init.callee) &&
        init.callee.name === REMEMBER_VARIABLE
    );
}

// ===== SECTION: Utility functions =====

function isInEventHandlerCallback(node: arkts.AstNode): boolean {
    type AstNodeWithParent = arkts.AstNode & { parent?: arkts.AstNode };
    let arrowCount = 0;
    let current: AstNodeWithParent | undefined = node as AstNodeWithParent;
    while (current) {
        if (arkts.isArrowFunctionExpression(current)) {
            arrowCount++;
        }
        current = current.parent;
    }
    return arrowCount >= 1;
}

function getLeftSide(node: arkts.AstNode): arkts.AstNode | undefined {
    if (arkts.isAssignmentExpression(node)) {
        return node.left;
    }
    if (arkts.isUpdateExpression(node)) {
        return node.argument;
    }
    return undefined;
}

function extractPropertyNames(node: arkts.AstNode | undefined): string[] {
    if (!node) {
        return [];
    }
    if (arkts.isIdentifier(node) && node.name) {
        return [node.name];
    }
    if (arkts.isMemberExpression(node)) {
        return [...extractPropertyNames(node.object), ...extractPropertyNames(node.property)];
    }
    return [];
}

function findPropertyInStruct(structDef: arkts.ClassDefinition, memberName: string): arkts.ClassProperty | undefined {
    for (const member of structDef.body) {
        if (arkts.isClassProperty(member) && member.key && arkts.isIdentifier(member.key) && member.key.name === memberName) {
            return member;
        }
    }
    return undefined;
}

function getNodeAnnotationNames(node: arkts.AstNode): string[] {
    if (arkts.isClassProperty(node)) {
        return node.annotations
            .map((a) => (a.expr && arkts.isIdentifier(a.expr) ? a.expr.name : ''))
            .filter((n) => n);
    }
    if (arkts.isMethodDefinition(node)) {
        return (node.function?.annotations ?? [])
            .map((a) => (a.expr && arkts.isIdentifier(a.expr) ? a.expr.name : ''))
            .filter((n) => n);
    }
    return [];
}

function getTypeNameFromAnnotation(typeAnnotation: arkts.AstNode | undefined): string | undefined {
    if (!typeAnnotation) {
        return undefined;
    }
    if (arkts.isETSTypeReference(typeAnnotation)) {
        const partName = typeAnnotation.part?.name;
        return partName && arkts.isIdentifier(partName) ? partName.name : undefined;
    }
    if (arkts.isETSUnionType(typeAnnotation)) {
        return TYPE_UNION;
    }
    if (arkts.isTypeNode(typeAnnotation) && isArrayType(typeAnnotation as arkts.TypeNode)) {
        return TYPE_ARRAY;
    }
    if (arkts.isETSPrimitiveType(typeAnnotation)) {
        return TYPE_UNKNOWN;
    }
    return undefined;
}

function isArrayType(typeNode: arkts.TypeNode): boolean {
    if (arkts.isTSArrayType(typeNode)) {
        return true;
    }
    if (arkts.isETSTypeReference(typeNode)) {
        const typeName = typeNode.part?.name;
        return !!typeName && arkts.isIdentifier(typeName) && typeName.name === TYPE_ARRAY;
    }
    return false;
}

function getArrayElementType(typeNode: arkts.TypeNode): arkts.TypeNode | null {
    if (arkts.isTSArrayType(typeNode)) {
        return typeNode.elementType || null;
    }
    if (arkts.isETSTypeReference(typeNode)) {
        const typeName = typeNode.part?.name;
        if (typeName && arkts.isIdentifier(typeName) && typeName.name === TYPE_ARRAY) {
            const typeParams = typeNode.part?.typeParams;
            if (typeParams && typeParams.params && typeParams.params.length > 0) {
                return typeParams.params[0];
            }
        }
    }
    return null;
}

function isValidTypeName(typeName: string | undefined): boolean {
    return !!typeName && typeName !== TYPE_UNION && typeName !== TYPE_ARRAY && typeName !== TYPE_UNKNOWN;
}

function getClassBody(classNode: arkts.AstNode): readonly arkts.AstNode[] | undefined {
    if (arkts.isClassDeclaration(classNode) || arkts.isETSStructDeclaration(classNode)) {
        return classNode.definition?.body;
    }
    if (arkts.isClassDefinition(classNode)) {
        return classNode.body;
    }
    return undefined;
}

function isMatchingMember(member: arkts.AstNode, propertyName: string): boolean {
    if (arkts.isClassProperty(member)) {
        return !!(member.key && arkts.isIdentifier(member.key) && member.key.name === propertyName);
    }
    if (arkts.isMethodDefinition(member)) {
        return !!(member.id && arkts.isIdentifier(member.id) && member.id.name === propertyName);
    }
    return false;
}
