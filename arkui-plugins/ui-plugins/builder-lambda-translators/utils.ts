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
import { isAnnotation, matchPrefix } from '../../common/arkts-utils';
import { BuilderLambdaNames, isCustomComponentAnnotation } from '../utils';
import { DeclarationCollector } from '../../common/declaration-collector';
import { ARKUI_IMPORT_PREFIX_NAMES, BindableDecl, Dollars, StructDecoratorNames } from '../../common/predefines';
import { ImportCollector } from '../../common/import-collector';

export type BuilderLambdaDeclInfo = {
    isFunctionCall: boolean; // isFunctionCall means it is from $_instantiate.
    params: readonly arkts.Expression[];
    returnType: arkts.TypeNode | undefined;
    moduleName: string;
};

export type BuilderLambdaAstNode = arkts.ScriptFunction | arkts.ETSParameterExpression | arkts.FunctionDeclaration;

export type InstanceCallInfo = {
    isReceiver: boolean;
    call: arkts.CallExpression;
};

export type BuilderLambdaArgInfo = {
    isFunctionCall: boolean;
};

export type BuilderLambdaReusableArgInfo = {
    isReusable?: boolean;
    reuseId?: string;
};

export type BuilderLambdaSecondLastArgInfo = BuilderLambdaArgInfo &
    BuilderLambdaReusableArgInfo;

export function buildSecondLastArgInfo(
    type: arkts.Identifier | undefined,
    isFunctionCall: boolean
): BuilderLambdaSecondLastArgInfo {
    let isReusable: boolean | undefined;
    let reuseId: string | undefined;
    if (!isFunctionCall && !!type) {
        const customComponentDecl = arkts.getDecl(type);
        isReusable =
            !!customComponentDecl &&
            arkts.isClassDefinition(customComponentDecl) &&
            customComponentDecl.annotations.some((anno) =>
                isCustomComponentAnnotation(anno, StructDecoratorNames.RESUABLE)
            );
        reuseId = isReusable ? type.name : undefined;
    }
    return { isFunctionCall, isReusable, reuseId };
}

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

export function isBuilderLambda(node: arkts.AstNode): boolean {
    const builderLambdaCall: arkts.AstNode | undefined = getDeclForBuilderLambda(node);
    if (!builderLambdaCall) {
        return arkts.isCallExpression(node) && node.arguments.length > 0 && isBuilderLambda(node.arguments[0]);
    }
    return !!builderLambdaCall;
}

/**
 * Determine whether it is a function with receiver method definition.
 *
 * @param node method definition node
 */
export function isFunctionWithReceiver(node: arkts.MethodDefinition): boolean {
    if (node.scriptFunction && arkts.isScriptFunction(node.scriptFunction)) {
        return node.scriptFunction.hasReceiver;
    }
    return false;
}

/**
 * Determine whether it is a function with receiver call.
 *
 * @param node identifier node
 */
export function isFunctionWithReceiverCall(node: arkts.Identifier): boolean {
    const decl: arkts.AstNode | undefined = arkts.getDecl(node);
    if (decl && arkts.isMethodDefinition(decl)) {
        return isFunctionWithReceiver(decl);
    }
    return false;
}

/**
 * Determine whether it is a style chained call.
 *
 * @param node call expression node
 */
export function isStyleChainedCall(node: arkts.CallExpression): boolean {
    return (
        arkts.isMemberExpression(node.expression) &&
        arkts.isIdentifier(node.expression.property) &&
        arkts.isCallExpression(node.expression.object)
    );
}

/**
 * Determine whether it is a style function with receiver call.
 *
 * @param node call expression node
 */
export function isStyleWithReceiverCall(node: arkts.CallExpression): boolean {
    return (
        arkts.isIdentifier(node.expression) &&
        isFunctionWithReceiverCall(node.expression) &&
        !!node.arguments.length &&
        arkts.isCallExpression(node.arguments[0])
    );
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

export function isBuilderLambdaMethodDecl(node: arkts.AstNode): boolean {
    const builderLambdaMethodDecl: arkts.AstNode | undefined = getDeclForBuilderLambdaMethodDecl(node);
    return !!builderLambdaMethodDecl;
}

export function getDeclForBuilderLambdaMethodDecl(node: arkts.AstNode): arkts.AstNode | undefined {
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

export function getDeclForBuilderLambda(node: arkts.AstNode): arkts.AstNode | undefined {
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
        if (isFunctionWithReceiver(decl)) {
            return (
                arkts.isCallExpression(node) &&
                node.arguments.length > 0 &&
                !!getDeclForBuilderLambda(node.arguments[0])
            );
        }
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
    const moduleName: string = arkts.getProgramFromAstNode(decl).moduleName;
    if (!moduleName) {
        return undefined;
    }
    DeclarationCollector.getInstance().collect(decl);
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
    const moduleName: string = arkts.getProgramFromAstNode(decl).moduleName;
    if (!moduleName) {
        return undefined;
    }
    if (arkts.isMethodDefinition(decl)) {
        const params = decl.scriptFunction.params.map((p) => p.clone());
        const returnType = decl.scriptFunction.returnTypeAnnotation?.clone();
        const isFunctionCall = isBuilderLambdaFunctionCall(decl);
        return { isFunctionCall, params, returnType, moduleName };
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

export function builderLambdaType(leaf: arkts.CallExpression): arkts.Identifier | undefined {
    if (!callIsGoodForBuilderLambda(leaf)) {
        return undefined;
    }
    const node = leaf.expression;
    let name: arkts.Identifier | undefined;
    if (arkts.isIdentifier(node)) {
        name = node;
    }
    if (arkts.isMemberExpression(node) && arkts.isIdentifier(node.object)) {
        name = node.object;
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

/**
 * Determine whether the node `<type>` is `<bindableDecl>` bindable property.
 *
 * @param type type node
 * @param bindableDecl bindable decalaration name
 */
export function hasBindableProperty(type: arkts.AstNode, bindableDecl: BindableDecl): boolean {
    let res: boolean = false;
    if (arkts.isETSUnionType(type)) {
        type.types.forEach((item: arkts.TypeNode) => {
            res = res || hasBindableProperty(item, bindableDecl);
        });
    }
    if (arkts.isETSTypeReference(type)) {
        res =
            res ||
            (!!type.part &&
                !!type.part.name &&
                arkts.isIdentifier(type.part.name) &&
                type.part.name.name === bindableDecl);
    }

    return res;
}

/**
 * Determine whether `<value>` is `$$()` call expression node.
 *
 * @param value expression node
 */
export function isDoubleDollarCall(
    value: arkts.Expression,
    ignoreDecl: boolean = false
): value is arkts.CallExpression {
    if (!arkts.isCallExpression(value)) {
        return false;
    }
    if (
        !(!!value.expression && arkts.isIdentifier(value.expression) && value.expression.name === Dollars.DOLLAR_DOLLAR)
    ) {
        return false;
    }
    if (!ignoreDecl) {
        const decl = arkts.getDecl(value.expression);
        if (!decl) {
            return false;
        }
        const moduleName: string = arkts.getProgramFromAstNode(decl).moduleName;
        if (!moduleName || !matchPrefix(ARKUI_IMPORT_PREFIX_NAMES, moduleName)) {
            return false;
        }
        DeclarationCollector.getInstance().collect(decl);
    }
    return true;
}

/**
 * get declaration type from `{xxx: <value>}` or `fun(<value>)`.
 *
 * @param value type node
 */
export function getDecalTypeFromValue(value: arkts.Expression): arkts.TypeNode {
    const decl: arkts.AstNode | undefined = arkts.getDecl(value);
    if (!decl || !arkts.isClassProperty(decl)) {
        throw new Error('cannot get declaration');
    }
    if (isArrayType(decl.typeAnnotation!)) {
        return getElementTypeFromArray(decl.typeAnnotation!)!;
    }
    return decl.typeAnnotation!;
}

/**
 * Determine whether `<type>` is array type, e.g. `xxx[]` or `Array<xxx>`.
 *
 * @param type type node
 */
export function isArrayType(type: arkts.TypeNode): boolean {
    return (
        arkts.isTSArrayType(type) ||
        (arkts.isETSTypeReference(type) &&
            !!type.part &&
            arkts.isETSTypeReferencePart(type.part) &&
            !!type.part.name &&
            arkts.isIdentifier(type.part.name) &&
            type.part.name.name === 'Array')
    );
}

/**
 * get element type from array type node `<arrayType>`.
 *
 * @param arrayType array type node
 */
export function getElementTypeFromArray(arrayType: arkts.TypeNode): arkts.TypeNode | undefined {
    if (arkts.isTSArrayType(arrayType)) {
        return arrayType.elementType?.clone();
    } else if (
        arkts.isETSTypeReference(arrayType) &&
        !!arrayType.part &&
        arkts.isETSTypeReferencePart(arrayType.part) &&
        !!arrayType.part.typeParams &&
        arrayType.part.typeParams.params.length
    ) {
        return arrayType.part.typeParams.params[0].clone();
    }
    return undefined;
}

export function collectComponentAttributeImport(type: arkts.TypeNode | undefined, moduleName: string): void {
    if (
        !type ||
        !arkts.isETSTypeReference(type) ||
        !type.part ||
        !type.part.name ||
        !arkts.isIdentifier(type.part.name)
    ) {
        return;
    }

    const regex: RegExp = /(?<source>\w+Attribute)(?:<.*>)?$/;
    const name: string = type.part.name.name;
    const match: RegExpExecArray | null = regex.exec(name);
    const attributeName: string | undefined = match?.groups?.source;
    if (!!attributeName) {
        ImportCollector.getInstance().collectSource(attributeName, moduleName);
        ImportCollector.getInstance().collectImport(attributeName);
    }
}
