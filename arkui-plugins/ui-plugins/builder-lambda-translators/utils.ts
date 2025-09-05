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
import { BuilderLambdaNames, expectNameInTypeReference, isCustomComponentAnnotation } from '../utils';
import { DeclarationCollector } from '../../common/declaration-collector';
import {
    ARKUI_FOREACH_SOURCE_NAME,
    ARKUI_IMPORT_PREFIX_NAMES,
    Dollars,
    InnerComponentAttributes,
    InnerComponentNames,
    StructDecoratorNames,
} from '../../common/predefines';
import { ImportCollector } from '../../common/import-collector';
import { hasMemoAnnotation } from '../../collectors/memo-collectors/utils';
import { AstNodePointer } from '../../common/safe-types';
import { ComponentAttributeCache } from './cache/componentAttributeCache';
import { MetaDataCollector } from '../../common/metadata-collector';

export type BuilderLambdaDeclInfo = {
    name: string;
    isFunctionCall: boolean; // isFunctionCall means it is from $_instantiate.
    params: readonly arkts.Expression[];
    returnType: arkts.TypeNode | undefined;
    moduleName: string;
    hasReceiver?: boolean;
    isFromCommonMethod?: boolean;
};

export type BuilderLambdaStyleBodyInfo = {
    lambdaBody: arkts.Identifier | arkts.CallExpression | undefined;
    initCallPtr: AstNodePointer | undefined;
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

export type BuilderLambdaSecondLastArgInfo = BuilderLambdaArgInfo & BuilderLambdaReusableArgInfo;

export type BuilderLambdaConditionBranchInfo = {
    statements: readonly arkts.Statement[];
    breakIndex: number;
};

export type BuilderLambdaChainingCallArgInfo = {
    arg: arkts.Expression;
    hasBuilder?: boolean;
};

export type OptionsPropertyInfo = {
    isBuilderParam: boolean;
    isLinkIntrinsic: boolean;
};

/**
 * Determine whether the node is ForEach method declaration or call expression.
 *
 * @param node method definition node.
 * @param sourceName external source name.
 */
export function isForEach(name: string | undefined, sourceName?: string): boolean {
    const externalSourceName = sourceName ?? MetaDataCollector.getInstance().externalSourceName;
    return name === InnerComponentNames.FOR_EACH && externalSourceName === ARKUI_FOREACH_SOURCE_NAME;
}

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

export function isBuilderLambda(node: arkts.AstNode, nodeDecl?: arkts.AstNode | undefined): boolean {
    const builderLambdaCall: arkts.AstNode | undefined = getDeclForBuilderLambda(node, nodeDecl);
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

export function getDeclForBuilderLambda(
    node: arkts.AstNode,
    nodeDecl?: arkts.AstNode | undefined
): arkts.AstNode | undefined {
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

    if (isBuilderLambdaCall(node, nodeDecl)) {
        return node;
    }
    return undefined;
}

export function isBuilderLambdaCall(
    node: arkts.CallExpression | arkts.Identifier,
    nodeDecl?: arkts.AstNode | undefined
): boolean {
    let decl = nodeDecl;
    if (decl === undefined) {
        const expr = arkts.isIdentifier(node) ? node : node.expression;
        decl = arkts.getDecl(expr);
    }

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
    if (arkts.isFunctionExpression(decl) && !!decl.function) {
        return hasBuilderLambdaAnnotation(decl.function);
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
    if (arkts.isFunctionExpression(decl) && !!decl.function) {
        return findBuilderLambdaAnnotation(decl.function);
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
    if (!arkts.isMethodDefinition(decl)) {
        return undefined;
    }
    const func = decl.scriptFunction;
    const nameNode = decl.name;
    const originType = func.returnTypeAnnotation;
    const params = func.params.map((p) => p.clone());
    const isFunctionCall = isBuilderLambdaFunctionCall(nameNode);
    const hasReceiver = func.hasReceiver;
    const isFromCommonMethod = isFunctionCall && findComponentAttributeFromCommonMethod(originType);
    const returnType = originType?.clone();
    const name = nameNode.name;
    return { name, isFunctionCall, params, returnType, moduleName, hasReceiver, isFromCommonMethod };
}

export function findComponentAttributeFromCommonMethod(attrType: arkts.TypeNode | undefined): boolean {
    const nameNode = expectNameInTypeReference(attrType);
    if (!nameNode) {
        return false;
    }
    const decl = arkts.getDecl(nameNode);
    return findCommonMethodInterfaceInExtends(decl);
}

export function findCommonMethodInterfaceInExtends(interfaceNode: arkts.AstNode | undefined): boolean {
    if (!interfaceNode || !arkts.isTSInterfaceDeclaration(interfaceNode)) {
        return false;
    }
    const nameNode = interfaceNode.id;
    if (!nameNode) {
        return false;
    }
    const extendNodes = interfaceNode.extends;
    if (extendNodes.length === 0) {
        return nameNode.name === InnerComponentAttributes.COMMON_METHOD;
    }
    return extendNodes.some((node) => {
        const name = expectNameInTypeReference(node.expr);
        const decl = !!name ? arkts.getDecl(name) : undefined;
        return findCommonMethodInterfaceInExtends(decl);
    });
}

export function isBuilderLambdaFunctionCall(nameNode: arkts.Identifier | undefined): boolean {
    if (!nameNode) {
        return false;
    }
    const name = nameNode.name;
    return name !== BuilderLambdaNames.ORIGIN_METHOD_NAME && name !== BuilderLambdaNames.TRANSFORM_METHOD_NAME;
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
        return getTransformedComponentName(node.expression.name);
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
 * get declaration type from function call argument `fun(<arg>)`.
 *
 * @param arg first argument in call expression.
 */
export function getArgumentType(arg: arkts.Expression): arkts.TypeNode {
    const isArrayElement = arkts.isMemberExpression(arg) && !!arg.property && arkts.isNumberLiteral(arg.property);
    const decl: arkts.AstNode | undefined = arkts.getDecl(arg);
    if (!decl || !arkts.isClassProperty(decl)) {
        throw new Error('cannot get declaration');
    }
    if (isArrayElement) {
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

export function checkIsWithInIfConditionScope(statement: arkts.AstNode): boolean {
    if (!statement.parent) {
        return false;
    }
    if (arkts.isIfStatement(statement.parent)) {
        return arkts.isBlockStatement(statement) || arkts.isIfStatement(statement);
    }
    return false;
}

function findClassInstanceFromType(
    typeAnnotation: arkts.TypeNode | undefined
): arkts.TSInterfaceDeclaration | arkts.ClassDefinition | undefined {
    if (!typeAnnotation || !arkts.isETSTypeReference(typeAnnotation)) {
        return undefined;
    }
    const part = typeAnnotation.part;
    if (!part) {
        return undefined;
    }
    const ident = part.name;
    if (!ident || !arkts.isIdentifier(ident)) {
        return undefined;
    }
    const decl = arkts.getDecl(ident);
    if (!decl) {
        return undefined;
    }
    if (!arkts.isTSInterfaceDeclaration(decl) && !arkts.isClassDefinition(decl)) {
        return undefined;
    }
    return decl;
}

function findClassInstanceFromObject(
    objectExpr: arkts.ObjectExpression
): arkts.TSInterfaceDeclaration | arkts.ClassDefinition | undefined {
    const decl = arkts.getPeerObjectDecl(objectExpr.peer);
    if (!decl) {
        return undefined;
    }
    if (!arkts.isTSInterfaceDeclaration(decl) && !arkts.isClassDefinition(decl)) {
        return undefined;
    }
    return decl;
}

export function findClassInstanceFromCallArgument(
    arg: arkts.TSAsExpression | arkts.ObjectExpression
): arkts.TSInterfaceDeclaration | arkts.ClassDefinition | undefined {
    if (arkts.isTSAsExpression(arg)) {
        const expr = arg.expr;
        if (!expr || !arkts.isObjectExpression(expr)) {
            return undefined;
        }
        const typeAnnotation = arg.typeAnnotation;
        return findClassInstanceFromType(typeAnnotation);
    }
    if (arkts.isObjectExpression(arg)) {
        return findClassInstanceFromObject(arg);
    }
    return undefined;
}

export function flatObjectExpressionToEntries(
    object: arkts.ObjectExpression
): [arkts.Identifier, arkts.Expression | undefined][] {
    const entries: [arkts.Identifier, arkts.Expression | undefined][] = [];
    (object.properties as arkts.Property[]).forEach((p) => {
        const key = p.key;
        if (!key || !arkts.isIdentifier(key)) {
            return;
        }
        entries.push([key, p.value]);
    });
    return entries;
}

/**
 * check whether the last parameter is trailing lambda in components.
 */
export function checkIsTrailingLambdaInLastParam(params: readonly arkts.Expression[]): boolean {
    if (params.length === 0) {
        return false;
    }
    const lastParam = params.at(params.length - 1)! as arkts.ETSParameterExpression;
    return hasMemoAnnotation(lastParam) && lastParam.identifier.name === BuilderLambdaNames.COMPONENT_PARAM_ORI;
}

/**
 * remove any parameters except possible last trailing lambda parameter in components.
 */
export function filterParamsExpectTrailingLambda(params: readonly arkts.Expression[]): readonly arkts.Expression[] {
    if (checkIsTrailingLambdaInLastParam(params)) {
        return [params.at(params.length - 1)!];
    }
    return [];
}

/**
 * check whether interface is `XXXAttribute` that implies the component's attribute interface.
 */
export function isComponentAttributeInterface(node: arkts.AstNode): node is arkts.TSInterfaceDeclaration {
    if (!ComponentAttributeCache.getInstance().isCollected()) {
        return false;
    }
    if (!arkts.isTSInterfaceDeclaration(node) || !node.id) {
        return false;
    }
    return ComponentAttributeCache.getInstance().attributeName === node.id.name;
}

/**
 * get set method name for components.
 */
export function getDeclaredSetAttribtueMethodName(componentName: string): string {
    return `set${componentName}Options`;
}

/**
 * get after-transformed component name
 */
export function getTransformedComponentName(componentName: string): string {
    return `${componentName}Impl`;
}
