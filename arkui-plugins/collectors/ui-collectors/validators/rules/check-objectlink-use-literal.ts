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
import { LogType, DecoratorNames } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

const OBJECT_LINK = DecoratorNames.OBJECT_LINK;
const ARRAY = 'Array';
const FROM = 'from';
const GET = 'get';

export const checkObjectLinkUseLiteral = performanceLog(
    _checkObjectLinkUseLiteral,
    getPerfName([0, 0, 0, 0, 0], 'checkObjectLinkUseLiteral')
);

type ReportLevel = 'error' | 'warn' | 'none';

function _checkObjectLinkUseLiteral(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.CallExpression
): void {
    const metadata = this.context ?? {};
    const structDef = resolveStructDef(metadata);
    if (!structDef) {
        return;
    }
    const objectLinkPropNames = collectObjectLinkPropertyNames(structDef);
    if (objectLinkPropNames.size === 0) {
        return;
    }
    // For chained calls (e.g. Child({...}).height(...)), use the root component call to get the actual arguments.
    const rootCallPtr = metadata.rootCallInfo?.ptr;
    const componentCall = rootCallPtr
        ? arkts.unpackNonNullableNode<arkts.CallExpression>(rootCallPtr)
        : node;
    if (!componentCall.arguments) {
        return;
    }
    for (const arg of componentCall.arguments) {
        if (!arkts.isObjectExpression(arg)) {
            continue;
        }
        for (const property of arg.properties) {
            if (!arkts.isProperty(property) || !property.key || !property.value) {
                continue;
            }
            if (!arkts.isIdentifier(property.key)) {
                continue;
            }
            if (!objectLinkPropNames.has(property.key.name)) {
                continue;
            }
            const level = traceValue(property.value, metadata);
            if (level === 'none') {
                continue;
            }
            this.report({
                node: property,
                message: `The '@Observed' class object must be instantiated with the 'new' keyword; initialization with an object literal is not allowed.`,
                level: level === 'error' ? LogType.ERROR : LogType.WARN,
            });
        }
    }
}

function resolveStructDef(metadata: CallInfo): arkts.ClassDefinition | undefined {
    const structDeclInfo = metadata.rootCallInfo?.structDeclInfo ?? metadata.structDeclInfo;
    if (!structDeclInfo?.definitionPtr) {
        return undefined;
    }
    const def = arkts.unpackNonNullableNode<arkts.ClassDefinition>(structDeclInfo.definitionPtr);
    return def;
}

function collectObjectLinkPropertyNames(def: arkts.ClassDefinition): Set<string> {
    const names = new Set<string>();
    for (const member of def.body) {
        if (!arkts.isClassProperty(member)) {
            continue;
        }
        const hasObjectLink = member.annotations.some(
            (anno) => anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === OBJECT_LINK
        );
        if (hasObjectLink && member.key && arkts.isIdentifier(member.key)) {
            names.add(member.key.name);
        }
    }
    return names;
}

function traceValue(node: arkts.AstNode | undefined, metadata: CallInfo): ReportLevel {
    if (!node) {
        return 'none';
    }
    node = unwrap(node);
    if (arkts.isObjectExpression(node)) {
        return 'error';
    }
    if (arkts.isETSNewClassInstanceExpression(node)) {
        return 'none';
    }
    if (arkts.isIdentifier(node)) {
        return traceIdentifier(node, metadata);
    }
    if (arkts.isCallExpression(node) && node.callee) {
        return traceCall(node, metadata);
    }
    if (arkts.isMemberExpression(node)) {
        return traceMember(node, metadata);
    }
    return 'none';
}

function traceIdentifier(id: arkts.Identifier, metadata: CallInfo): ReportLevel {
    const decl = arkts.getPeerIdentifierDecl(id.peer);
    if (!decl) {
        return 'warn';
    }
    if (arkts.isVariableDeclarator(decl) && decl.init) {
        return traceValue(decl.init, metadata);
    }
    if (arkts.isClassProperty(decl) && decl.value) {
        return traceValue(decl.value, metadata);
    }
    return 'warn';
}

function traceCall(call: arkts.CallExpression, metadata: CallInfo): ReportLevel {
    const callee = unwrap(call.callee);
    if (arkts.isMemberExpression(callee)) {
        if (isArrayFrom(callee) || isGetter(callee)) {
            return 'warn';
        }
    }
    const funcDecl = resolveCalleeToFunction(call, callee, metadata);
    if (funcDecl) {
        const retVal = getFunctionReturnValue(funcDecl);
        if (retVal) {
            return traceValue(retVal, metadata);
        }
    }
    return 'none';
}

function traceMember(memberExpr: arkts.MemberExpression, metadata: CallInfo): ReportLevel {
    if (memberExpr.property && arkts.isNumberLiteral(memberExpr.property)) {
        return 'warn';
    }
    if (!memberExpr.property || !arkts.isIdentifier(memberExpr.property)) {
        return 'none';
    }
    const propName = memberExpr.property.name;
    const objNode = unwrap(memberExpr.object);

    if (arkts.isThisExpression(objNode)) {
        const fromStructDef = resolveFromStructDef(metadata);
        if (!fromStructDef) {
            return 'warn';
        }
        const prop = findPropertyInStruct(fromStructDef, propName);
        if (!prop) {
            return 'warn';
        }
        if (!prop.value) {
            return 'none';
        }
        const propValue = unwrap(prop.value);
        if (arkts.isObjectExpression(propValue)) {
            return 'none';
        }
        if (arkts.isETSNewClassInstanceExpression(propValue)) {
            return 'none';
        }
        return traceValue(prop.value, metadata);
    }
    const objValue = resolveValue(objNode, metadata);
    if (!objValue) {
        return objNode && arkts.isIdentifier(objNode) ? 'warn' : 'none';
    }

    const propValue = accessProperty(objValue, propName, metadata);
    if (!propValue) {
        return 'none';
    }
    return traceValue(propValue, metadata);
}

function resolveValue(node: arkts.AstNode | undefined, metadata: CallInfo): arkts.AstNode | undefined {
    if (!node) {
        return undefined;
    }
    node = unwrap(node);
    if (arkts.isObjectExpression(node) || arkts.isETSNewClassInstanceExpression(node)) {
        return node;
    }
    if (arkts.isIdentifier(node)) {
        const decl = arkts.getPeerIdentifierDecl(node.peer);
        if (!decl) {
            return undefined;
        }
        if (arkts.isVariableDeclarator(decl) && decl.init) {
            return resolveValue(decl.init, metadata);
        }
        if (arkts.isClassProperty(decl) && decl.value) {
            return resolveValue(decl.value, metadata);
        }
        return undefined;
    }
    if (arkts.isMemberExpression(node)) {
        if (!node.property || !arkts.isIdentifier(node.property)) {
            return undefined;
        }
        const objNode = unwrap(node.object);
        let objValue: arkts.AstNode | undefined;
        if (arkts.isThisExpression(objNode)) {
            const fromStructDef = resolveFromStructDef(metadata);
            if (!fromStructDef) {
                return undefined;
            }
            const prop = findPropertyInStruct(fromStructDef, node.property.name);
            if (!prop?.value) {
                return undefined;
            }
            return resolveValue(prop.value, metadata);
        }
        objValue = resolveValue(objNode, metadata);
        if (!objValue) {
            return undefined;
        }
        const propValue = accessProperty(objValue, node.property.name, metadata);
        if (!propValue) {
            return undefined;
        }
        return resolveValue(propValue, metadata);
    }
    if (arkts.isCallExpression(node) && node.callee) {
        const callee = unwrap(node.callee);
        const funcDecl = resolveCalleeToFunction(node, callee, metadata);
        if (funcDecl) {
            const retVal = getFunctionReturnValue(funcDecl);
            if (retVal) {
                return resolveValue(retVal, metadata);
            }
        }
    }
    return undefined;
}

function accessProperty(obj: arkts.AstNode, propName: string, metadata: CallInfo): arkts.AstNode | undefined {
    if (arkts.isObjectExpression(obj)) {
        const prop = findPropertyInObject(obj, propName);
        return prop?.value;
    }
    if (arkts.isETSNewClassInstanceExpression(obj)) {
        const classDef = resolveClassDefFromNewExpression(obj);
        if (classDef) {
            const prop = findPropertyInStruct(classDef, propName);
            return prop?.value;
        }
    }
    return undefined;
}

function resolveCalleeToFunction(
    call: arkts.CallExpression,
    callee: arkts.AstNode,
    metadata: CallInfo
): arkts.AstNode | undefined {
    if (arkts.isIdentifier(callee)) {
        const decl = arkts.getPeerIdentifierDecl(callee.peer);
        if (decl && (arkts.isFunctionDeclaration(decl) || arkts.isMethodDefinition(decl))) {
            return decl;
        }
        return undefined;
    }
    if (arkts.isMemberExpression(callee) && callee.property && arkts.isIdentifier(callee.property)) {
        const methodName = callee.property.name;
        const obj = unwrap(callee.object);
        if (arkts.isThisExpression(obj)) {
            const fromStructDef = resolveFromStructDef(metadata);
            if (fromStructDef) {
                return findMethodInStruct(fromStructDef, methodName);
            }
        }
        if (arkts.isIdentifier(obj)) {
            const objDecl = arkts.getPeerIdentifierDecl(obj.peer);
            if (objDecl && arkts.isClassDeclaration(objDecl) && objDecl.definition) {
                return findMethodInStruct(objDecl.definition, methodName);
            }
        }
    }
    return undefined;
}

function resolveClassDefFromNewExpression(node: arkts.ETSNewClassInstanceExpression): arkts.ClassDefinition | undefined {
    if (!node.typeRef || !arkts.isETSTypeReference(node.typeRef)) {
        return undefined;
    }
    if (!node.typeRef.part || !arkts.isETSTypeReferencePart(node.typeRef.part)) {
        return undefined;
    }
    if (!node.typeRef.part.name || !arkts.isIdentifier(node.typeRef.part.name)) {
        return undefined;
    }
    const classDecl = arkts.getPeerIdentifierDecl(node.typeRef.part.name.peer);
    if (classDecl && arkts.isClassDeclaration(classDecl) && classDecl.definition) {
        return classDecl.definition;
    }
    return undefined;
}

function resolveFromStructDef(metadata: CallInfo): arkts.ClassDefinition | undefined {
    if (!metadata.fromStructInfo?.definitionPtr) {
        return undefined;
    }
    return arkts.unpackNonNullableNode<arkts.ClassDefinition>(metadata.fromStructInfo.definitionPtr);
}

function getFunctionReturnValue(funcDecl: arkts.AstNode): arkts.AstNode | undefined {
    if (!arkts.isFunctionDeclaration(funcDecl) && !arkts.isMethodDefinition(funcDecl)) {
        return undefined;
    }
    if (!funcDecl.function?.body || !arkts.isBlockStatement(funcDecl.function.body)) {
        return undefined;
    }
    let returnValue: arkts.AstNode | undefined;
    for (const stmt of funcDecl.function.body.statements) {
        if (arkts.isReturnStatement(stmt) && stmt.argument) {
            returnValue = stmt.argument;
        }
    }
    return returnValue;
}

function findPropertyInStruct(def: arkts.ClassDefinition, propName: string): arkts.ClassProperty | undefined {
    for (const member of def.body) {
        if (arkts.isClassProperty(member) && member.key && arkts.isIdentifier(member.key) && member.key.name === propName) {
            return member;
        }
    }
    return undefined;
}

function findMethodInStruct(def: arkts.ClassDefinition, methodName: string): arkts.MethodDefinition | undefined {
    for (const member of def.body) {
        if (arkts.isMethodDefinition(member) && member.id && arkts.isIdentifier(member.id) && member.id.name === methodName) {
            return member;
        }
    }
    return undefined;
}

function findPropertyInObject(obj: arkts.ObjectExpression, propName: string): arkts.Property | undefined {
    for (const prop of obj.properties) {
        if (arkts.isProperty(prop) && prop.key && arkts.isIdentifier(prop.key) && prop.key.name === propName) {
            return prop;
        }
    }
    return undefined;
}

function isArrayFrom(memberExpr: arkts.MemberExpression): boolean {
    return !!(
        memberExpr.object && arkts.isIdentifier(memberExpr.object) && memberExpr.object.name === ARRAY &&
        memberExpr.property && arkts.isIdentifier(memberExpr.property) && memberExpr.property.name === FROM
    );
}

function isGetter(memberExpr: arkts.MemberExpression): boolean {
    return !!(memberExpr.property && arkts.isIdentifier(memberExpr.property) && memberExpr.property.name === GET);
}

function unwrap(node: arkts.AstNode | undefined): arkts.AstNode {
    if (!node) {
        return node as unknown as arkts.AstNode;
    }
    if (arkts.isChainExpression(node) && node.expression) {
        return unwrap(node.expression);
    }
    if (arkts.isTSAsExpression(node) && node.expr) {
        return unwrap(node.expr);
    }
    if (arkts.isTSNonNullExpression(node) && node.expr) {
        return unwrap(node.expr);
    }
    return node;
}
