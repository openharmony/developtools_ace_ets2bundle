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
import { isAnnotation } from '../../common/arkts-utils';
import { BuilderLambdaNames } from '../utils';

export type BuilderLambdaDeclInfo = {
    isFunctionCall: boolean; // isFunctionCall means it is from $_instantiate.
    params: readonly arkts.Expression[];
    returnType: arkts.TypeNode | undefined;
};

export type BuilderLambdaAstNode = arkts.ScriptFunction | arkts.ETSParameterExpression | arkts.FunctionDeclaration;

/**
 * Used in finding "XXX" in BuilderLambda("XXX")
 * @deprecated
 */
export function builderLambdaArgumentName(annotation: arkts.AnnotationUsage): string | undefined {
    if (!isBuilderLambdaAnnotation(annotation)) {
        return undefined;
    }

    const property = annotation.properties.at(0);
    if (!property || !arkts.isClassProperty(property)) {
        return undefined;
    }
    if (!property.value || !arkts.isStringLiteral(property.value)) {
        return undefined;
    }

    return property.value.str;
}

/**
 * Determine whether it is a custom component.
 *
 * @param node class declaration node
 */
export function isBuilderLambda(node: arkts.AstNode, isExternal?: boolean): boolean {
    const builderLambdaCall: arkts.AstNode | undefined = getDeclForBuilderLambda(node);
    return !!builderLambdaCall;
}

/**
 * replace $_instantiate with _instantiateImpl.
 *
 * @param name origin name
 */
export function replaceBuilderLambdaDeclMethodName(name: string | undefined): string | undefined {
    if (!!name && name === BuilderLambdaNames.ORIGIN_METHOD_NAME) {
        return BuilderLambdaNames.TRANSFORM_METHOD_NAME;
    }
    return undefined;
}

export function isBuilderLambdaMethodDecl(node: arkts.AstNode, isExternal?: boolean): boolean {
    const builderLambdaMethodDecl: arkts.AstNode | undefined = getDeclForBuilderLambdaMethodDecl(node);
    return !!builderLambdaMethodDecl;
}

export function getDeclForBuilderLambdaMethodDecl(
    node: arkts.AstNode,
    isExternal?: boolean
): arkts.AstNode | undefined {
    if (!node || !arkts.isMethodDefinition(node)) {
        return undefined;
    }

    const isBuilderLambda: boolean = !!node.name && isBuilderLambdaCall(node.name);
    const isMethodDecl: boolean =
        !!node.scriptFunction &&
        arkts.hasModifierFlag(node.scriptFunction, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
    if (isBuilderLambda && isMethodDecl) {
        return node;
    }
    return undefined;
}

export function getDeclForBuilderLambda(node: arkts.AstNode, isExternal?: boolean): arkts.AstNode | undefined {
    if (!node || !arkts.isCallExpression(node)) {
        return undefined;
    }

    let currNode: arkts.AstNode = node;
    while (
        !!currNode &&
        arkts.isCallExpression(currNode) &&
        !!currNode.expression &&
        arkts.isMemberExpression(currNode.expression)
    ) {
        const _node: arkts.MemberExpression = currNode.expression;

        if (!!_node.property && arkts.isIdentifier(_node.property) && isBuilderLambdaCall(_node.property)) {
            return node;
        }

        if (!!_node.object && arkts.isCallExpression(_node.object) && isBuilderLambdaCall(_node.object)) {
            return node;
        }

        currNode = _node.object;
    }

    if (isBuilderLambdaCall(node)) {
        return node;
    }
    return undefined;
}

export function isBuilderLambdaCall(node: arkts.CallExpression | arkts.Identifier): boolean {
    const expr = arkts.isIdentifier(node) ? node : node.expression;
    const decl = arkts.getDecl(expr);

    if (!decl) {
        return false;
    }

    if (arkts.isMethodDefinition(decl)) {
        return isBuilderLambdaMethod(decl);
    }
    if (arkts.isFunctionExpression(decl)) {
        return hasBuilderLambdaAnnotation(decl.scriptFunction);
    }
    return false;
}

export function isBuilderLambdaMethod(node: arkts.MethodDefinition): boolean {
    if (!node || !arkts.isMethodDefinition(node)) {
        return false;
    }

    const result = hasBuilderLambdaAnnotation(node.scriptFunction);
    if (result) {
        return true;
    }
    if (node.overloads.length > 0) {
        return node.overloads.some(isBuilderLambdaMethod);
    }
    return false;
}

export function hasBuilderLambdaAnnotation(node: BuilderLambdaAstNode): boolean {
    return node.annotations.some(isBuilderLambdaAnnotation);
}

export function isBuilderLambdaAnnotation(node: arkts.AnnotationUsage): boolean {
    return isAnnotation(node, BuilderLambdaNames.ANNOTATION_NAME);
}

export function findBuilderLambdaAnnotation(
    node: arkts.ScriptFunction | arkts.ETSParameterExpression
): arkts.AnnotationUsage | undefined {
    return node.annotations.find(isBuilderLambdaAnnotation);
}

export function findBuilderLambdaInMethod(node: arkts.MethodDefinition): arkts.AnnotationUsage | undefined {
    if (!node || !arkts.isMethodDefinition(node)) {
        return undefined;
    }
    const result = findBuilderLambdaAnnotation(node.scriptFunction);
    if (!!result) {
        return result;
    }
    node.overloads.forEach((overload) => {
        const anno: arkts.AnnotationUsage | undefined = findBuilderLambdaInMethod(overload);
        if (!!anno) {
            return anno;
        }
    });
    return undefined;
}

export function findBuilderLambdaInCall(
    node: arkts.CallExpression | arkts.Identifier
): arkts.AnnotationUsage | undefined {
    const decl = findBuilderLambdaDecl(node);
    if (!decl) {
        return undefined;
    }

    if (arkts.isMethodDefinition(decl)) {
        return findBuilderLambdaInMethod(decl);
    }
    if (arkts.isFunctionExpression(decl)) {
        return findBuilderLambdaAnnotation(decl.scriptFunction);
    }
    return undefined;
}

export function findBuilderLambdaDecl(node: arkts.CallExpression | arkts.Identifier): arkts.AstNode | undefined {
    const expr = arkts.isIdentifier(node) ? node : node.expression;
    const decl = arkts.getDecl(expr);
    if (!decl) {
        return undefined;
    }
    return decl;
}

/**
 * check whether `<prop>` is the passing parameter.
 *
 * @param name origin name
 */
export function isParameterPassing(prop: arkts.Property): boolean | undefined {
    return (
        prop.key &&
        prop.value &&
        arkts.isIdentifier(prop.key) &&
        arkts.isMemberExpression(prop.value) &&
        arkts.isThisExpression(prop.value.object) &&
        arkts.isIdentifier(prop.value.property)
    );
}

export function findBuilderLambdaDeclInfo(decl: arkts.AstNode | undefined): BuilderLambdaDeclInfo | undefined {
    if (!decl) {
        return undefined;
    }

    if (arkts.isMethodDefinition(decl)) {
        const params = decl.scriptFunction.params.map((p) => p.clone());
        const returnType = decl.scriptFunction.returnTypeAnnotation?.clone();
        const isFunctionCall = isBuilderLambdaFunctionCall(decl);
        return { isFunctionCall, params, returnType };
    }

    return undefined;
}

export function isBuilderLambdaFunctionCall(decl: arkts.AstNode | undefined): boolean {
    if (!decl) {
        return false;
    }
    if (arkts.isMethodDefinition(decl)) {
        return (
            decl.name.name !== BuilderLambdaNames.ORIGIN_METHOD_NAME &&
            decl.name.name !== BuilderLambdaNames.TRANSFORM_METHOD_NAME
        );
    }
    return false;
}

export function callIsGoodForBuilderLambda(leaf: arkts.CallExpression): boolean {
    const node = leaf.expression;
    return arkts.isIdentifier(node) || arkts.isMemberExpression(node);
}

export function isSafeType(type: arkts.TypeNode | undefined): boolean {
    if (!type) {
        return false;
    }
    // type can be generic (not safe) if includes any type params in a type reference.
    if (arkts.isETSTypeReference(type) && !!type.part && !!type.part.typeParams) {
        return false;
    }
    return true;
}

export function builderLambdaMethodDeclType(method: arkts.MethodDefinition): arkts.TypeNode | undefined {
    if (!method || !method.scriptFunction) {
        return undefined;
    }
    return method.scriptFunction.returnTypeAnnotation;
}

export function builderLambdaTypeName(leaf: arkts.CallExpression): string | undefined {
    if (!callIsGoodForBuilderLambda(leaf)) {
        return undefined;
    }
    const node = leaf.expression;
    let name: string | undefined;
    if (arkts.isIdentifier(node)) {
        name = node.name;
    }
    if (arkts.isMemberExpression(node) && arkts.isIdentifier(node.object)) {
        name = node.object.name;
    }
    return name;
}

export function builderLambdaFunctionName(node: arkts.CallExpression): string | undefined {
    const annotation = findBuilderLambdaInCall(node);
    if (!annotation) {
        return undefined;
    }
    if (arkts.isIdentifier(node.expression)) {
        return node.expression.name;
    }
    if (
        arkts.isMemberExpression(node.expression) &&
        arkts.isIdentifier(node.expression.property) &&
        node.expression.property.name === BuilderLambdaNames.ORIGIN_METHOD_NAME
    ) {
        return BuilderLambdaNames.TRANSFORM_METHOD_NAME;
    }
    return undefined;
}
