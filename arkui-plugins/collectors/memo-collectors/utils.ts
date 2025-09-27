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
import { annotation, forEachArgWithParam, isDecoratorAnnotation } from '../../common/arkts-utils';
import { ImportCollector } from '../../common/import-collector';
import { DecoratorNames, GenSymPrefix, MEMO_IMPORT_SOURCE_NAME } from '../../common/predefines';
import { MemoFunctionCollector } from './function-collector';

export enum MemoNames {
    MEMO = 'memo',
    MEMO_SKIP = 'memo_skip',
    MEMO_SKIP_UI = 'MemoSkip',
    MEMO_INTRINSIC = 'memo_intrinsic',
    MEMO_ENTRY = 'memo_entry',
}

export type MemoAstNode =
    | arkts.ScriptFunction
    | arkts.ETSParameterExpression
    | arkts.ClassProperty
    | arkts.TSTypeAliasDeclaration
    | arkts.ETSFunctionType
    | arkts.ArrowFunctionExpression
    | arkts.ETSUnionType
    | arkts.VariableDeclaration;

interface MemoableAnnotationInfo {
    hasMemo?: boolean;
    hasMemoSkip?: boolean;
    hasMemoIntrinsic?: boolean;
    hasMemoEntry?: boolean;
    hasBuilder?: boolean;
    hasBuilderParam?: boolean;
}

export type MemoableInfo = MemoableAnnotationInfo & {
    hasProperType?: boolean;
    isWithinTypeParams?: boolean;
};

export function isMemoAnnotation(node: arkts.AnnotationUsage, memoName: MemoNames | MemoNames[]): boolean {
    const expr = node.expr;
    if (expr === undefined || !arkts.isIdentifier(expr)) {
        return false;
    }
    const name = expr.name;
    if (Array.isArray(memoName)) {
        return memoName.includes(name as MemoNames);
    }
    return memoName === name;
}

export function hasMemoAnnotation<T extends MemoAstNode>(node: T): boolean {
    return node.annotations.some((it) => isMemoAnnotation(it, MemoNames.MEMO));
}

function insertMemoAnnotationImport(memoName: MemoNames): void {
    collectMemoAnnotationSource(memoName);
    collectMemoAnnotationImport(memoName);
}

function isScriptFunctionFromInterfaceGetterSetter(node: arkts.ScriptFunction): boolean {
    let parent = node.parent;
    if (!parent || !arkts.isMethodDefinition(parent)) {
        return false;
    }
    const isGetterSetter = parent.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET
        || parent.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET;
    if (!isGetterSetter) {
        return false;
    }
    while (!!parent && arkts.isMethodDefinition(parent)) {
        parent = parent.parent;
    }
    return !!parent && arkts.isTSInterfaceBody(parent);
}

function addMemoAnnotationInScriptFunction(
    node: arkts.ScriptFunction,
    memoName: MemoNames = MemoNames.MEMO,
    skipNames: MemoNames[] = [MemoNames.MEMO_SKIP, MemoNames.MEMO_SKIP_UI]
): arkts.ScriptFunction {
    const newAnnotations: arkts.AnnotationUsage[] = [
        ...node.annotations.filter((it) => !isMemoAnnotation(it, memoName)),
        annotation(memoName),
    ];
    const newNode = node.setAnnotations(newAnnotations);
    if (!isScriptFunctionFromInterfaceGetterSetter(node)) {
        collectMemoAstNode(newNode, memoName, skipNames);
    } else {
        collectMemoAstNode(newNode.parent!, memoName, skipNames);
    }
    return newNode;
}

function addMemoAnnotationInUnionType(
    node: arkts.ETSUnionType,
    memoName: MemoNames = MemoNames.MEMO,
    skipNames: MemoNames[] = [MemoNames.MEMO_SKIP, MemoNames.MEMO_SKIP_UI]
): arkts.ETSUnionType {
    return arkts.factory.updateUnionType(
        node,
        node.types.map((type) => {
            if (arkts.isETSFunctionType(type)) {
                return addMemoAnnotation(type, memoName, skipNames);
            }
            return type;
        })
    );
}

function collectMemoAstNode(
    node: arkts.AstNode, 
    memoName: MemoNames = MemoNames.MEMO,
    skipNames: MemoNames[] = [MemoNames.MEMO_SKIP, MemoNames.MEMO_SKIP_UI]
): void {
    if (!skipNames.includes(memoName)) {
        arkts.NodeCache.getInstance().collect(node);
    }
}

export function addMemoAnnotation<T extends MemoAstNode>(
    node: T,
    memoName: MemoNames = MemoNames.MEMO,
    skipNames: MemoNames[] = [MemoNames.MEMO_SKIP, MemoNames.MEMO_SKIP_UI]
): T {
    insertMemoAnnotationImport(memoName);
    if (arkts.isScriptFunction(node)) {
        return addMemoAnnotationInScriptFunction(node, memoName, skipNames) as T;
    }
    if (arkts.isETSUnionType(node)) {
        return addMemoAnnotationInUnionType(node, memoName, skipNames) as T;
    }
    const newAnnotations: arkts.AnnotationUsage[] = [
        ...node.annotations.filter((it) => !isMemoAnnotation(it, memoName)),
        annotation(memoName),
    ];
    if (arkts.isEtsParameterExpression(node)) {
        node.annotations = newAnnotations;
        collectMemoAstNode(node, memoName, skipNames);
        return node;
    }
    const newNode = node.setAnnotations(newAnnotations) as T;
    collectMemoAstNode(node, memoName, skipNames);
    return newNode;
}

export function hasMemoableAnnotation<T extends MemoAstNode>(node: T): MemoableAnnotationInfo {
    let hasBuilder: boolean = false;
    let hasBuilderParam: boolean = false;
    let hasMemo: boolean = false;
    let hasMemoSkip: boolean = false;
    let hasMemoIntrinsic: boolean = false;
    let hasMemoEntry: boolean = false;
    node.annotations.forEach((it) => {
        hasBuilder ||= isDecoratorAnnotation(it, DecoratorNames.BUILDER);
        hasBuilderParam ||= isDecoratorAnnotation(it, DecoratorNames.BUILDER_PARAM);
        hasMemo ||= isMemoAnnotation(it, MemoNames.MEMO);
        hasMemoSkip ||= isMemoAnnotation(it, MemoNames.MEMO_SKIP);
        hasMemoIntrinsic ||= isMemoAnnotation(it, MemoNames.MEMO_INTRINSIC);
        hasMemoEntry ||= isMemoAnnotation(it, MemoNames.MEMO_ENTRY);
    });
    return {
        ...(hasMemo ? { hasMemo } : {}),
        ...(hasMemoSkip ? { hasMemoSkip } : {}),
        ...(hasMemoIntrinsic ? { hasMemoIntrinsic } : {}),
        ...(hasMemoEntry ? { hasMemoEntry } : {}),
        ...(hasBuilder ? { hasBuilder } : {}),
        ...(hasBuilderParam ? { hasBuilderParam } : {}),
    };
}

export function collectMemoAnnotationImport(memoName: MemoNames = MemoNames.MEMO): void {
    ImportCollector.getInstance().collectImport(memoName);
}

export function collectMemoAnnotationSource(memoName: MemoNames = MemoNames.MEMO): void {
    ImportCollector.getInstance().collectSource(memoName, MEMO_IMPORT_SOURCE_NAME);
}

export function collectMemoableInfoInUnionType(node: arkts.AstNode, info?: MemoableInfo): MemoableInfo {
    let currInfo = info ?? {};
    if (arkts.NodeCache.getInstance().has(node)) {
        return { ...currInfo, hasMemo: true, hasProperType: true };
    }
    if (!arkts.isETSUnionType(node)) {
        return currInfo;
    }
    node.types.forEach((t) => {
        currInfo = {
            ...currInfo,
            ...collectMemoableInfoInTypeReference(t),
            ...collectMemoableInfoInFunctionType(t),
            ...collectMemoableInfoInUnionType(t),
        };
    });
    currInfo = { ...currInfo, ...hasMemoableAnnotation(node) };
    return currInfo;
}

function collectMemoableInfoInTypeReferencePart(node: arkts.ETSTypeReferencePart): MemoableInfo {
    let currInfo: MemoableInfo = {};
    if (!node.typeParams) {
        return currInfo;
    }
    node.typeParams.params.forEach((t) => {
        currInfo = {
            ...currInfo,
            ...collectMemoableInfoInUnionType(t),
            ...collectMemoableInfoInFunctionType(t),
        };
        if (arkts.isETSTypeReference(t) && !!t.part && !!arkts.isETSTypeReferencePart(t.part)) {
            currInfo = {
                ...currInfo,
                ...collectMemoableInfoInTypeReferencePart(t.part),
            };
        }
    });
    if (checkIsMemoFromMemoableInfo(currInfo)) {
        return { isWithinTypeParams: true };
    }
    return { isWithinTypeParams: currInfo.isWithinTypeParams };
}

export function collectMemoableInfoInTypeReference(node: arkts.AstNode, info?: MemoableInfo): MemoableInfo {
    let currInfo = info ?? {};
    if (arkts.NodeCache.getInstance().has(node)) {
        const metadata = arkts.NodeCache.getInstance().get(node)?.metadata;
        return { ...currInfo, ...metadata };
    }
    if (!arkts.isETSTypeReference(node) || !node.part || !arkts.isETSTypeReferencePart(node.part)) {
        return currInfo;
    }
    currInfo = {
        ...currInfo,
        ...collectMemoableInfoInTypeReferencePart(node.part),
    };
    const expr = node.part.name;
    let decl: arkts.AstNode | undefined;
    if (!expr || !(decl = arkts.getDecl(expr))) {
        return currInfo;
    }
    return {
        ...currInfo,
        ...collectMemoableInfoInTypeAlias(decl),
    };
}

export function collectMemoableInfoInFunctionType(node: arkts.AstNode, info?: MemoableInfo): MemoableInfo {
    let currInfo = info ?? {};
    if (arkts.NodeCache.getInstance().has(node)) {
        return { ...currInfo, hasMemo: true, hasProperType: true };
    }
    if (!arkts.isETSFunctionType(node)) {
        return currInfo;
    }
    currInfo.hasProperType = true;
    currInfo = { ...currInfo, ...hasMemoableAnnotation(node) };
    return currInfo;
}

export function collectMemoableInfoInTypeAlias(node: arkts.AstNode, info?: MemoableInfo): MemoableInfo {
    let currInfo = info ?? {};
    if (arkts.NodeCache.getInstance().has(node)) {
        return { ...currInfo, hasMemo: true, hasProperType: true };
    }
    if (!arkts.isTSTypeAliasDeclaration(node)) {
        return currInfo;
    }
    currInfo = {
        ...currInfo,
        ...hasMemoableAnnotation(node),
    };
    if (!!node.typeAnnotation) {
        return {
            ...currInfo,
            ...collectMemoableInfoInType(node.typeAnnotation),
        };
    }
    return currInfo;
}

export function collectMemoableInfoInParameter(node: arkts.AstNode, info?: MemoableInfo): MemoableInfo {
    let currInfo = info ?? {};
    if (arkts.NodeCache.getInstance().has(node)) {
        const metadata = arkts.NodeCache.getInstance().get(node)?.metadata;
        return { ...currInfo, hasMemo: true, hasProperType: true, ...metadata };
    }
    if (!arkts.isEtsParameterExpression(node)) {
        return currInfo;
    }
    currInfo = {
        ...currInfo,
        ...hasMemoableAnnotation(node),
    };
    if (!!node.type) {
        currInfo = {
            ...currInfo,
            ...collectMemoableInfoInType(node.type),
        };
    }
    if (!!node.initializer) {
        currInfo = {
            ...currInfo,
            ...collectMemoableInfoInArrowFunction(node.initializer),
        };
    }
    if (!!currInfo.isWithinTypeParams) {
        const forbidTypeRewrite = !checkIsMemoFromMemoableInfo(currInfo);
        arkts.NodeCache.getInstance().collect(node, { forbidTypeRewrite, isWithinTypeParams: true });
    }
    return currInfo;
}

export function collectMemoableInfoInVariableDeclarator(node: arkts.AstNode, info?: MemoableInfo): MemoableInfo {
    let currInfo = info ?? {};
    if (arkts.NodeCache.getInstance().has(node)) {
        return { ...currInfo, hasMemo: true, hasProperType: true };
    }
    if (!arkts.isVariableDeclarator(node)) {
        return currInfo;
    }
    if (!!node.name.typeAnnotation) {
        currInfo = {
            ...currInfo,
            ...collectMemoableInfoInType(node.name.typeAnnotation),
        };
    }
    if (!!node.initializer && arkts.isArrowFunctionExpression(node.initializer)) {
        currInfo = {
            ...currInfo,
            ...collectMemoableInfoInArrowFunction(node.initializer),
        };
    }
    if (!!node.parent && arkts.isVariableDeclaration(node.parent)) {
        currInfo = {
            ...currInfo,
            ...hasMemoableAnnotation(node.parent),
        };
    }
    const decl = arkts.getDecl(node.name);
    if (!decl) {
        return currInfo;
    }
    if (arkts.isMethodDefinition(decl)) {
        currInfo = {
            ...currInfo,
            ...collectMemoableInfoInScriptFunction(decl.scriptFunction),
        };
    } else if (arkts.isClassProperty(decl)) {
        currInfo = {
            ...currInfo,
            ...collectMemoableInfoInClassProperty(decl),
        };
    }
    return currInfo;
}

export function collectMemoableInfoInProperty(node: arkts.AstNode, info?: MemoableInfo): MemoableInfo {
    let currInfo = info ?? {};
    if (arkts.NodeCache.getInstance().has(node)) {
        const property = node as arkts.Property;
        const hasProperType = !!property.value && arkts.isArrowFunctionExpression(property.value);
        return { ...currInfo, hasMemo: true, hasProperType };
    }
    if (!arkts.isProperty(node) || !node.key || !arkts.isIdentifier(node.key)) {
        return currInfo;
    }
    const decl = arkts.getDecl(node.key);
    if (!decl) {
        return currInfo;
    }
    if (arkts.isMethodDefinition(decl)) {
        const newInfo = collectMemoableInfoInMethod(decl);
        currInfo = { ...currInfo, ...newInfo };
    } else if (arkts.isClassProperty(decl)) {
        const newInfo = collectMemoableInfoInClassProperty(decl);
        currInfo = { ...currInfo, ...newInfo };
    }
    currInfo.hasProperType = false;
    if (!!node.value && arkts.isArrowFunctionExpression(node.value)) {
        currInfo.hasProperType = true;
        currInfo = {
            ...currInfo,
            ...collectMemoableInfoInScriptFunction(node.value.scriptFunction),
        };
    }
    return currInfo;
}

export function collectMemoableInfoInClassProperty(node: arkts.AstNode, info?: MemoableInfo): MemoableInfo {
    let currInfo = info ?? {};
    if (arkts.NodeCache.getInstance().has(node)) {
        return { ...currInfo, hasMemo: true, hasProperType: true };
    }
    if (!arkts.isClassProperty(node)) {
        return currInfo;
    }
    currInfo = { ...currInfo, ...hasMemoableAnnotation(node) };
    if (!!node.typeAnnotation) {
        currInfo = {
            ...currInfo,
            ...collectMemoableInfoInType(node.typeAnnotation),
        };
    }
    if (!!node.value) {
        currInfo = {
            ...currInfo,
            ...collectMemoableInfoInArrowFunction(node.value),
        };
    }
    return currInfo;
}

export function collectMemoableInfoInArrowFunction(node: arkts.AstNode, info?: MemoableInfo): MemoableInfo {
    let currInfo = info ?? {};
    if (arkts.NodeCache.getInstance().has(node)) {
        return { ...currInfo, hasMemo: true, hasProperType: true };
    }
    if (!arkts.isArrowFunctionExpression(node)) {
        return currInfo;
    }
    currInfo.hasProperType = true;
    currInfo = { ...currInfo, ...hasMemoableAnnotation(node) };
    if (!!node.scriptFunction) {
        currInfo = {
            ...currInfo,
            ...collectMemoableInfoInScriptFunction(node.scriptFunction),
        };
    }
    if (!!node.parent && arkts.isAssignmentExpression(node.parent) && !!node.parent.left) {
        const expr = arkts.isMemberExpression(node.parent.left) ? node.parent.left.property : node.parent.left;
        const decl = arkts.getDecl(expr);
        if (!decl) {
            return currInfo;
        }
        if (arkts.isClassProperty(decl)) {
            currInfo = {
                ...currInfo,
                ...collectMemoableInfoInClassProperty(decl),
            };
        }
    }
    return currInfo;
}

export function collectMemoableInfoInScriptFunction(node: arkts.AstNode, info?: MemoableInfo): MemoableInfo {
    let currInfo = info ?? {};
    if (arkts.NodeCache.getInstance().has(node)) {
        return { ...currInfo, hasMemo: true, hasProperType: true };
    }
    if (!arkts.isScriptFunction(node)) {
        return currInfo;
    }
    currInfo.hasProperType = true;
    currInfo = { ...currInfo, ...hasMemoableAnnotation(node) };
    return currInfo;
}

export function collectMemoableInfoInMethod(node: arkts.MethodDefinition): MemoableInfo {
    const hasReceiver = node.scriptFunction.hasReceiver;
    const isSetter = node.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET;
    const isGetter = node.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET;
    let info: MemoableInfo = {};
    if (isSetter && node.scriptFunction.params.length > 0) {
        if (hasReceiver && node.scriptFunction.params.length === 2) {
            info = collectMemoableInfoInParameter(node.scriptFunction.params.at(1)!);
        } else {
            info = collectMemoableInfoInParameter(node.scriptFunction.params.at(0)!);
        }
    } else if (isGetter) {
        info = collectMemoableInfoInFunctionReturnType(node.scriptFunction);
    }
    return collectMemoableInfoInScriptFunction(node.scriptFunction, info);
}

export function collectMemoableInfoInType(node: arkts.AstNode, info?: MemoableInfo): MemoableInfo {
    let currInfo = info ?? {};
    return {
        ...currInfo,
        ...collectMemoableInfoInFunctionType(node),
        ...collectMemoableInfoInUnionType(node),
        ...collectMemoableInfoInTypeReference(node),
    };
}

export function collectMemoableInfoInFunctionReturnType(node: arkts.ScriptFunction): MemoableInfo {
    if (!!node.returnTypeAnnotation) {
        let memoableInfo: MemoableInfo;
        if (arkts.NodeCache.getInstance().has(node.returnTypeAnnotation)) {
            memoableInfo = { hasMemo: true, hasProperType: true };
        } else {
            memoableInfo = collectMemoableInfoInType(node.returnTypeAnnotation);
        }
        if ((memoableInfo.hasMemo || memoableInfo.hasBuilder) && memoableInfo.hasProperType) {
            arkts.NodeCache.getInstance().collect(node.returnTypeAnnotation);
        }
        return memoableInfo;
    }
    return {};
}

export function collectScriptFunctionReturnTypeFromInfo(node: arkts.ScriptFunction, info: MemoableInfo): void {
    const returnType = node.returnTypeAnnotation;
    if (!returnType || arkts.NodeCache.getInstance().has(returnType)) {
        return;
    }
    const isMemoReturnType = checkIsMemoFromMemoableInfo(info);
    const isWithinTypeParams = info.isWithinTypeParams;
    if (isMemoReturnType || isWithinTypeParams) {
        const forbidTypeRewrite = !isMemoReturnType;
        arkts.NodeCache.getInstance().collect(returnType, { forbidTypeRewrite, isWithinTypeParams });
    }
}

export function collectGensymDeclarator(declarator: arkts.VariableDeclarator, info: MemoableInfo): void {
    if (!info.hasMemo && !info.hasBuilder) {
        return;
    }
    arkts.NodeCache.getInstance().collect(declarator);
    const initializer = declarator.initializer;
    if (!initializer || !arkts.isConditionalExpression(initializer)) {
        return;
    }
    const alternate = initializer.alternate;
    if (!alternate) {
        return;
    }
    let arrowFunc: arkts.ArrowFunctionExpression | undefined;
    if (arkts.isTSAsExpression(alternate) && !!alternate.expr && arkts.isArrowFunctionExpression(alternate.expr)) {
        arrowFunc = alternate.expr;
    } else if (arkts.isArrowFunctionExpression(alternate)) {
        arrowFunc = alternate;
    }
    if (!!arrowFunc) {
        const func = arrowFunc.scriptFunction;
        const returnMemoableInfo = collectMemoableInfoInFunctionReturnType(func);
        collectScriptFunctionReturnTypeFromInfo(func, returnMemoableInfo);
        const [paramMemoableInfoMap, gensymCount] = collectMemoableInfoMapInFunctionParams(func);
        const body = func.body;
        if (!!body && arkts.isBlockStatement(body)) {
            collectMemoScriptFunctionBody(body, returnMemoableInfo, paramMemoableInfoMap, gensymCount);
        }
    }
}

export function collectMemoableInfoMapInFunctionParams(
    node: arkts.ScriptFunction,
    shouldCollectParameter: boolean = true,
    shouldEnforceMemoSkip: boolean = false
): [Map<arkts.AstNode['peer'], MemoableInfo>, number] {
    const hasReceiver = node.hasReceiver;
    const paramMap: Map<arkts.AstNode['peer'], MemoableInfo> = new Map();
    let gensymCount: number = 0;
    node.params.slice(hasReceiver ? 1 : 0).forEach((p) => {
        const info = collectMemoableInfoInFunctionParam(
            node,
            p,
            gensymCount,
            shouldCollectParameter,
            shouldEnforceMemoSkip
        );
        gensymCount = info.gensymCount;
        info.peers.forEach((peer) => paramMap.set(peer, info.memoableInfo));
    });
    return [paramMap, gensymCount];
}

interface FunctionParamCollectInfo {
    peers: arkts.AstNode['peer'][];
    gensymCount: number;
    memoableInfo: MemoableInfo;
}

function collectMemoableInfoInFunctionParam(
    node: arkts.ScriptFunction,
    param: arkts.Expression,
    gensymCount: number,
    shouldCollectParameter: boolean = true,
    shouldEnforceMemoSkip: boolean = false
): FunctionParamCollectInfo {
    const peers: arkts.AstNode['peer'][] = [];
    let memoableInfo: MemoableInfo;
    const _param = param as arkts.ETSParameterExpression;
    if (arkts.NodeCache.getInstance().has(_param)) {
        const metadata = arkts.NodeCache.getInstance().get(_param)!.metadata ?? {};
        const { hasMemoSkip } = metadata;
        memoableInfo = { hasMemo: true, hasMemoSkip, hasProperType: true };
    } else {
        memoableInfo = collectMemoableInfoInParameter(_param);
    }
    if (shouldEnforceMemoSkip) {
        memoableInfo.hasMemoSkip = true;
    }
    if (_param.identifier.name.startsWith(GenSymPrefix.INTRINSIC) && !!node.body && arkts.isBlockStatement(node.body)) {
        const declaration = node.body.statements.at(gensymCount);
        if (!!declaration && arkts.isVariableDeclaration(declaration) && declaration.declarators.length > 0) {
            const declarator = declaration.declarators[0];
            collectGensymDeclarator(declarator, memoableInfo);
            if (!memoableInfo.hasMemoSkip && shouldCollectParameter) {
                peers.push(declarator.name.peer);
            }
            gensymCount++;
        }
    }
    if (checkIsMemoFromMemoableInfo(memoableInfo)) {
        arkts.NodeCache.getInstance().collect(_param, { hasMemoSkip: memoableInfo.hasMemoSkip });
    }
    if (!memoableInfo.hasMemoSkip && shouldCollectParameter) {
        peers.push(_param.identifier.peer);
    }
    return { peers, memoableInfo, gensymCount };
}

/**
 * Collect `@memo` annotated `arkts.TypeNode` node. And find whether it can be `@memo` annotated.
 *
 * @param node `arkts.TypeNode` node.
 * @returns true if it is not `@memo` annotated but can add `@memo` to it.
 */
export function findCanAddMemoFromTypeAnnotation(
    typeAnnotation: arkts.AstNode | undefined
): typeAnnotation is arkts.ETSFunctionType {
    if (!typeAnnotation) {
        return false;
    }
    const memoableInfo = collectMemoableInfoInType(typeAnnotation);
    if (!!memoableInfo.hasMemo && !!memoableInfo.hasProperType) {
        arkts.NodeCache.getInstance().collect(typeAnnotation);
    }
    return !!memoableInfo.hasBuilder && !memoableInfo.hasMemo && !!memoableInfo.hasProperType;
}

/**
 * Collect `@memo` annotated `arkts.Property` node. And find whether it can be `@memo` annotated.
 *
 * @param node `arkts.Property` node.
 * @returns true if it is not `@memo` annotated but can add `@memo` to it.
 */
export function findCanAddMemoFromProperty(property: arkts.AstNode): property is arkts.Property {
    const memoableInfo = collectMemoableInfoInProperty(property);
    if (!!memoableInfo.hasMemo && !!memoableInfo.hasProperType) {
        arkts.NodeCache.getInstance().collect(property);
    }
    const hasBuilder = !!memoableInfo.hasBuilder || !!memoableInfo.hasBuilderParam;
    return hasBuilder && !memoableInfo.hasMemo && !!memoableInfo.hasProperType;
}

/**
 * Collect `@memo` annotated `arkts.ClassProperty` node. And find whether it can be `@memo` annotated.
 *
 * @param node `arkts.ClassProperty` node.
 * @returns true if it is not `@memo` annotated but can add `@memo` to it.
 */
export function findCanAddMemoFromClassProperty(property: arkts.AstNode): property is arkts.ClassProperty {
    const memoableInfo = collectMemoableInfoInClassProperty(property);
    if (!!memoableInfo.hasMemo && !!memoableInfo.hasProperType) {
        arkts.NodeCache.getInstance().collect(property);
    }
    const hasBuilderType = !!memoableInfo.hasBuilder || !!memoableInfo.hasBuilderParam;
    if (!!memoableInfo.isWithinTypeParams) {
        arkts.NodeCache.getInstance().collect(property, { isWithinTypeParams: true });
    }
    return hasBuilderType && !memoableInfo.hasMemo && !!memoableInfo.hasProperType && !memoableInfo.isWithinTypeParams;
}

/**
 * Collect `@memo` annotated `arkts.ETSParameterExpression` node. And find whether it can be `@memo` annotated.
 *
 * @param node `arkts.ETSParameterExpression` node.
 * @returns true if it is not `@memo` annotated but can add `@memo` to it.
 */
export function findCanAddMemoFromParameter(param: arkts.AstNode | undefined): param is arkts.ETSParameterExpression {
    if (!param) {
        return false;
    }
    const memoableInfo = collectMemoableInfoInParameter(param);
    if (!!memoableInfo.hasMemo && !!memoableInfo.hasProperType) {
        arkts.NodeCache.getInstance().collect(param, { hasMemoSkip: memoableInfo.hasMemoSkip });
    }
    return !!memoableInfo.hasBuilder && !memoableInfo.hasMemo && !!memoableInfo.hasProperType;
}

/**
 * Collect `@memo` annotated `arkts.ArrowFunctionExpression` node. And find whether it can be `@memo` annotated.
 *
 * @param node `arkts.ArrowFunctionExpression` node.
 * @returns true if it is not `@memo` annotated but can add `@memo` to it.
 */
export function findCanAddMemoFromArrowFunction(node: arkts.AstNode): node is arkts.ArrowFunctionExpression {
    if (!arkts.isArrowFunctionExpression(node)) {
        return false;
    }
    const memoableInfo = collectMemoableInfoInArrowFunction(node);
    const { hasMemoEntry, hasMemoIntrinsic } = memoableInfo;
    const func = node.scriptFunction;
    const returnMemoableInfo = collectMemoableInfoInFunctionReturnType(func);
    collectScriptFunctionReturnTypeFromInfo(func, returnMemoableInfo);
    const [paramMemoableInfoMap, gensymCount] = collectMemoableInfoMapInFunctionParams(
        func,
        !hasMemoEntry && !hasMemoIntrinsic
    );
    const isMemo = checkIsMemoFromMemoableInfo(memoableInfo);
    if (isMemo && !arkts.NodeCache.getInstance().has(node)) {
        arkts.NodeCache.getInstance().collect(node, { hasMemoEntry, hasMemoIntrinsic });
        const body = func.body;
        if (!!body && arkts.isBlockStatement(body)) {
            const disableCollectReturn = hasMemoEntry || hasMemoIntrinsic;
            collectMemoScriptFunctionBody(
                body,
                returnMemoableInfo,
                paramMemoableInfoMap,
                gensymCount,
                disableCollectReturn
            );
        }
    }
    return !!memoableInfo.hasBuilder && !memoableInfo.hasMemo && !!memoableInfo.hasProperType;
}

/**
 * Collect `@memo` annotated `arkts.TSTypeAliasDeclaration` node. And find whether it can be `@memo` annotated.
 *
 * @param node `arkts.TSTypeAliasDeclaration` node.
 * @returns true if it is not `@memo` annotated but can add `@memo` to it.
 */
export function findCanAddMemoFromTypeAlias(node: arkts.AstNode): node is arkts.TSTypeAliasDeclaration {
    const memoableInfo = collectMemoableInfoInTypeAlias(node);
    if (!!memoableInfo.hasMemo && !!memoableInfo.hasProperType) {
        arkts.NodeCache.getInstance().collect(node);
    }
    return !!memoableInfo.hasBuilder && !memoableInfo.hasMemo && !!memoableInfo.hasProperType;
}

/**
 * Collect `@memo` annotated `arkts.MethodDefinition` node. And find whether it can be `@memo` annotated.
 *
 * @param node `arkts.MethodDefinition` node.
 * @returns true if it is not `@memo` annotated but can add `@memo` to it.
 */
export function findCanAddMemoFromMethod(node: arkts.AstNode): node is arkts.MethodDefinition {
    if (!arkts.isMethodDefinition(node)) {
        return false;
    }
    const memoableInfo = collectMemoableInfoInMethod(node);
    const { hasMemoEntry, hasMemoIntrinsic } = memoableInfo;
    const func = node.scriptFunction;
    const returnMemoableInfo = collectMemoableInfoInFunctionReturnType(func);
    collectScriptFunctionReturnTypeFromInfo(func, returnMemoableInfo);
    const shouldEnforceMemoSkip = !!memoableInfo.hasBuilder;
    const [paramMemoableInfoMap, gensymCount] = collectMemoableInfoMapInFunctionParams(
        func,
        !hasMemoEntry && !hasMemoIntrinsic,
        shouldEnforceMemoSkip
    );
    // const isFromInterfaceGetterSetter = node.
    const isMemo = checkIsMemoFromMemoableInfo(memoableInfo);
    if (isMemo && !arkts.NodeCache.getInstance().has(node)) {
        const metadata = collectMetadataInMethod(node);
        arkts.NodeCache.getInstance().collect(node, {
            ...metadata,
            hasMemoEntry,
            hasMemoIntrinsic,
        });
        const body = func.body;
        if (!!body && arkts.isBlockStatement(body)) {
            const disableCollectReturn = hasMemoEntry || hasMemoIntrinsic;
            collectMemoScriptFunctionBody(
                body,
                returnMemoableInfo,
                paramMemoableInfoMap,
                gensymCount,
                disableCollectReturn
            );
        }
    }
    return !!memoableInfo.hasBuilder && !memoableInfo.hasMemo && !!memoableInfo.hasProperType;
}

/**
 * Collect `@memo` annotated `arkts.TSTypeParameterInstantiation` node from corresponding call's typeParams.
 *
 * @param node `arkts.TSTypeParameterInstantiation` node.
 */
export function collectMemoFromTSTypeParameterInstantiation(node: arkts.TSTypeParameterInstantiation): void {
    node.params.forEach((t) => {
        const typeInfo = collectMemoableInfoInType(t);
        if (checkIsMemoFromMemoableInfo(typeInfo)) {
            arkts.NodeCache.getInstance().collect(t);
        }
    });
}

/**
 * Collect `@memo` annotated `arkts.ETSNewClassInstanceExpression` node from corresponding new class type reference.
 *
 * @param node `arkts.ETSNewClassInstanceExpression` node.
 */
export function collectMemoFromNewClass(node: arkts.ETSNewClassInstanceExpression): void {
    const typeRef = node.getTypeRef;
    if (!typeRef || !arkts.isETSTypeReference(typeRef)) {
        return;
    }
    const typeInfo = collectMemoableInfoInTypeReference(typeRef);
    if (typeInfo.isWithinTypeParams) {
        arkts.NodeCache.getInstance().collect(typeRef, { isWithinTypeParams: true });
    }
}

/**
 * Collect `@memo` annotated `arkts.CallExpression` node from corresponding declared method,
 * as well as collect each `@memo` annotated argument from corresponding declared method parameter.
 *
 * @param node `arkts.CallExpression` node.
 */
export function collectMemoFromCallExpression(node: arkts.CallExpression): boolean {
    if (arkts.NodeCache.getInstance().has(node)) {
        return false;
    }
    const typeParams = node.typeParams;
    if (!!typeParams) {
        collectMemoFromTSTypeParameterInstantiation(typeParams);
    }
    const expr = findIdentifierFromCallee(node.expression);
    const decl = (expr && getDeclResolveAlias(expr)) ?? node.expression;
    if (!decl) {
        return false;
    }
    let isCollected: boolean = false;
    if (arkts.NodeCache.getInstance().has(decl)) {
        arkts.NodeCache.getInstance().collect(node);
        isCollected = true;
    }
    if (arkts.isMethodDefinition(decl)) {
        isCollected = collectCallWithDeclaredMethod(node, decl);
    } else if (arkts.isClassProperty(decl)) {
        isCollected = collectCallWithDeclaredClassProperty(node, decl);
    }
    if (isCollected && arkts.isTSAsExpression(node.expression) && node.expression.typeAnnotation) {
        arkts.NodeCache.getInstance().collect(node.expression.typeAnnotation);
    }
    return isCollected;
}

export function collectCallWithDeclaredClassProperty(node: arkts.CallExpression, decl: arkts.ClassProperty): boolean {
    if (arkts.NodeCache.getInstance().has(decl)) {
        arkts.NodeCache.getInstance().collect(node);
        return true;
    }
    const memoableInfo = collectMemoableInfoInClassProperty(decl);
    if (checkIsMemoFromMemoableInfo(memoableInfo, false) || memoableInfo.hasBuilder || memoableInfo.hasBuilderParam) {
        arkts.NodeCache.getInstance().collect(node);
        return true;
    }
    return false;
}

export function collectCallWithDeclaredMethod(node: arkts.CallExpression, decl: arkts.MethodDefinition): boolean {
    const hasReceiver = decl.scriptFunction.hasReceiver;
    const params = decl.scriptFunction.params;
    const args = node.arguments;
    const hasRestParameter = decl.scriptFunction.hasRestParameter;
    const isTrailingCall = node.isTrailingCall;
    const options = { hasRestParameter, isTrailingCall };
    forEachArgWithParam(args, params, collectCallArgsWithMethodParams, options);
    if (arkts.NodeCache.getInstance().has(decl)) {
        const { hasMemoEntry, hasMemoIntrinsic } = arkts.NodeCache.getInstance().get(decl)!.metadata ?? {};
        arkts.NodeCache.getInstance().collect(node, { hasReceiver, hasMemoEntry, hasMemoIntrinsic });
        return true;
    } else {
        const memoableInfo = collectMemoableInfoInScriptFunction(decl.scriptFunction);
        if (checkIsMemoFromMemoableInfo(memoableInfo, true)) {
            const { hasMemoEntry, hasMemoIntrinsic } = memoableInfo;
            arkts.NodeCache.getInstance().collect(node, { hasReceiver, hasMemoEntry, hasMemoIntrinsic });
            return true;
        }
    }
    return false;
}

export function collectCallArgsWithMethodParams(arg: arkts.Expression | undefined, param: arkts.Expression): void {
    if (!arg) {
        return;
    }
    let info: MemoableInfo;
    if (arkts.NodeCache.getInstance().has(param)) {
        info = { hasMemo: true, hasProperType: true };
    } else {
        info = collectMemoableInfoInParameter(param);
    }
    if (checkIsMemoFromMemoableInfo(info) && arkts.isArrowFunctionExpression(arg)) {
        arkts.NodeCache.getInstance().collect(arg);
        const func = arg.scriptFunction;
        const returnMemoableInfo = collectMemoableInfoInFunctionReturnType(func);
        collectScriptFunctionReturnTypeFromInfo(func, returnMemoableInfo);
        const [paramMemoableInfoMap, gensymCount] = collectMemoableInfoMapInFunctionParams(func);
        const body = func.body;
        if (!!body && arkts.isBlockStatement(body)) {
            collectMemoScriptFunctionBody(body, returnMemoableInfo, paramMemoableInfoMap, gensymCount);
        }
    }
}

export function findIdentifierFromCallee(callee: arkts.AstNode | undefined): arkts.Identifier | undefined {
    if (!callee) {
        return undefined;
    }
    if (arkts.isIdentifier(callee)) {
        return callee;
    }
    if (arkts.isMemberExpression(callee)) {
        return findIdentifierFromCallee(callee.property);
    }
    if (arkts.isTSAsExpression(callee)) {
        return findIdentifierFromCallee(callee.expr);
    }
    if (arkts.isTSNonNullExpression(callee)) {
        return findIdentifierFromCallee(callee.expr);
    }
    return undefined;
}

export function collectMemoScriptFunctionBody(
    body: arkts.BlockStatement,
    returnMemoableInfo: MemoableInfo,
    paramMemoableInfoMap: Map<arkts.AstNode['peer'], MemoableInfo>,
    gensymCount: number,
    disableCollectReturn?: boolean
): void {
    const collector = new MemoFunctionCollector();
    body.statements.forEach((st, index) => {
        if (index < gensymCount) {
            return;
        }
        if (disableCollectReturn) {
            collector.disableCollectReturn();
        }
        collector.registerReturnInfo(returnMemoableInfo).registerParamInfoMap(paramMemoableInfoMap).visitor(st);
        collector.reset();
    });
}

export function collectMetadataInMethod(node: arkts.MethodDefinition): arkts.AstNodeCacheValue['metadata'] {
    const callName = node.name.name;
    const hasReceiver = node.scriptFunction.hasReceiver;
    const isSetter = node.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET;
    const isGetter = node.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET;
    return { callName, hasReceiver, isSetter, isGetter };
}

export function checkIsMemoFromMemoableInfo(info: MemoableInfo, ignoreType: boolean = false): boolean {
    return (
        (!!info.hasMemo || !!info.hasMemoIntrinsic || !!info.hasMemoEntry || !!info.hasBuilder) &&
        (ignoreType || !!info.hasProperType)
    );
}

export function getDeclResolveAlias(node: arkts.AstNode): arkts.AstNode | undefined {
    const decl = arkts.getDecl(node);
    if (!!decl && !!decl.parent && arkts.isIdentifier(decl) && arkts.isVariableDeclarator(decl.parent)) {
        if (!!decl.parent.initializer && arkts.isIdentifier(decl.parent.initializer)) {
            return getDeclResolveAlias(decl.parent.initializer);
        }
        if (!!decl.parent.initializer && arkts.isMemberExpression(decl.parent.initializer)) {
            return getDeclResolveAlias(decl.parent.initializer.property);
        }
    }
    return decl;
}

export function parametersBlockHasReceiver(params: readonly arkts.Expression[]): boolean {
    return params.length > 0 && arkts.isEtsParameterExpression(params[0]) && isThisParam(params[0]);
}

export function parametrizedNodeHasReceiver(node: arkts.ScriptFunction | arkts.ETSFunctionType | undefined): boolean {
    if (node === undefined) {
        return false;
    }
    return parametersBlockHasReceiver(node.params);
}

function isThisParam(node: arkts.Expression | undefined): boolean {
    if (node === undefined || !arkts.isEtsParameterExpression(node)) {
        return false;
    }
    return node.identifier?.isReceiver ?? false;
}
