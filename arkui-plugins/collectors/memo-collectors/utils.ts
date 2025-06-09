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
};

export function isMemoAnnotation(node: arkts.AnnotationUsage, memoName: MemoNames): boolean {
    return node.expr !== undefined && arkts.isIdentifier(node.expr) && node.expr.name === memoName;
}

export function hasMemoAnnotation<T extends MemoAstNode>(node: T): boolean {
    return node.annotations.some((it) => isMemoAnnotation(it, MemoNames.MEMO));
}

export function addMemoAnnotation<T extends MemoAstNode>(node: T, memoName: MemoNames = MemoNames.MEMO): T {
    collectMemoAnnotationSource(memoName);
    if (arkts.isETSUnionType(node)) {
        return arkts.factory.updateUnionType(
            node,
            node.types.map((type) => {
                if (arkts.isETSFunctionType(type)) {
                    return addMemoAnnotation(type, memoName);
                }
                return type;
            })
        ) as T;
    }
    const newAnnotations: arkts.AnnotationUsage[] = [
        ...node.annotations.filter((it) => !isMemoAnnotation(it, memoName)),
        annotation(memoName),
    ];
    collectMemoAnnotationImport(memoName);
    if (arkts.isEtsParameterExpression(node)) {
        node.annotations = newAnnotations;
        arkts.NodeCache.getInstance().collect(node);
        return node;
    }
    const newNode = node.setAnnotations(newAnnotations) as T;
    arkts.NodeCache.getInstance().collect(newNode);
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

export function collectMemoableInfoInTypeReference(node: arkts.AstNode, info?: MemoableInfo): MemoableInfo {
    let currInfo = info ?? {};
    if (arkts.NodeCache.getInstance().has(node)) {
        return { ...currInfo, hasMemo: true, hasProperType: true };
    }
    if (!arkts.isETSTypeReference(node) || !node.part || !arkts.isETSTypeReferencePart(node.part)) {
        return currInfo;
    }
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
        return { ...currInfo, hasMemo: true, hasProperType: true };
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
    if (!decl || !arkts.isMethodDefinition(decl)) {
        return currInfo;
    }
    const hasReceiver = decl.scriptFunction.hasReceiver;
    const isSetter = decl.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET;
    const isGetter = decl.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET;
    let newInfo: MemoableInfo = {};
    if (isSetter && decl.scriptFunction.params.length > 0) {
        if (hasReceiver && decl.scriptFunction.params.length === 2) {
            newInfo = collectMemoableInfoInParameter(decl.scriptFunction.params.at(1)!);
        } else {
            newInfo = collectMemoableInfoInParameter(decl.scriptFunction.params.at(0)!);
        }
    } else if (isGetter) {
        newInfo = collectMemoableInfoInFunctionReturnType(decl.scriptFunction);
    }
    currInfo = { ...currInfo, ...collectMemoableInfoInScriptFunction(decl.scriptFunction), ...newInfo };
    currInfo.hasProperType = false;
    if (!!node.value && arkts.isArrowFunctionExpression(node.value)) {
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
        const returnMemoableInfo = collectMemoableInfoInFunctionReturnType(arrowFunc.scriptFunction);
        const [paramMemoableInfoMap, gensymCount] = collectMemoableInfoMapInFunctionParams(arrowFunc.scriptFunction);
        if (!!arrowFunc.scriptFunction.body && arkts.isBlockStatement(arrowFunc.scriptFunction.body)) {
            collectMemoScriptFunctionBody(
                arrowFunc.scriptFunction.body,
                returnMemoableInfo,
                paramMemoableInfoMap,
                gensymCount
            );
        }
    }
}

export function collectMemoableInfoMapInFunctionParams(
    node: arkts.ScriptFunction,
    shouldCollectParameter: boolean = true
): [Map<arkts.AstNode['peer'], MemoableInfo>, number] {
    const hasReceiver = node.hasReceiver;
    const paramMap: Map<arkts.AstNode['peer'], MemoableInfo> = new Map();
    let gensymCount: number = 0;
    node.params.slice(hasReceiver ? 1 : 0).forEach((p) => {
        const info = collectMemoableInfoInFunctionParam(node, p, gensymCount, shouldCollectParameter);
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
    shouldCollectParameter: boolean = true
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
    return !!memoableInfo.hasBuilder && !memoableInfo.hasMemo && !!memoableInfo.hasProperType;
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
    return (
        (!!memoableInfo.hasBuilder || !!memoableInfo.hasBuilderParam) &&
        !memoableInfo.hasMemo &&
        !!memoableInfo.hasProperType
    );
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
    const returnMemoableInfo = collectMemoableInfoInFunctionReturnType(node.scriptFunction);
    const [paramMemoableInfoMap, gensymCount] = collectMemoableInfoMapInFunctionParams(
        node.scriptFunction,
        !hasMemoEntry && !hasMemoIntrinsic
    );
    const isMemoReturnType = checkIsMemoFromMemoableInfo(returnMemoableInfo);
    if (isMemoReturnType) {
        arkts.NodeCache.getInstance().collect(node.scriptFunction.returnTypeAnnotation!);
    }
    const isMemo = checkIsMemoFromMemoableInfo(memoableInfo);
    if (isMemo && !arkts.NodeCache.getInstance().has(node)) {
        arkts.NodeCache.getInstance().collect(node, { hasMemoEntry, hasMemoIntrinsic });
        if (!!node.scriptFunction.body && arkts.isBlockStatement(node.scriptFunction.body)) {
            const disableCollectReturn = hasMemoEntry || hasMemoIntrinsic;
            collectMemoScriptFunctionBody(
                node.scriptFunction.body,
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
    const returnMemoableInfo = collectMemoableInfoInFunctionReturnType(node.scriptFunction);
    const [paramMemoableInfoMap, gensymCount] = collectMemoableInfoMapInFunctionParams(
        node.scriptFunction,
        !hasMemoEntry && !hasMemoIntrinsic
    );
    const isMemo = checkIsMemoFromMemoableInfo(memoableInfo);
    const isMemoReturnType = checkIsMemoFromMemoableInfo(returnMemoableInfo);
    if (isMemoReturnType) {
        arkts.NodeCache.getInstance().collect(node.scriptFunction.returnTypeAnnotation!);
    }
    if (isMemo && !arkts.NodeCache.getInstance().has(node)) {
        const metadata = collectMetadataInMethod(node);
        arkts.NodeCache.getInstance().collect(node, {
            ...metadata,
            hasMemoEntry,
            hasMemoIntrinsic,
        });
        if (!!node.scriptFunction.body && arkts.isBlockStatement(node.scriptFunction.body)) {
            const disableCollectReturn = hasMemoEntry || hasMemoIntrinsic;
            collectMemoScriptFunctionBody(
                node.scriptFunction.body,
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
 * Collect `@memo` annotated `arkts.CallExpression` node from corresponding declared method,
 * as well as collect each `@memo` annotated argument from corresponding declared method parameter.
 *
 * @param node `arkts.CallExpression` node.
 */
export function collectMemoFromCallExpression(node: arkts.CallExpression): void {
    if (arkts.NodeCache.getInstance().has(node)) {
        return;
    }
    const expr = findIdentifierFromCallee(node.expression);
    const decl = (expr && getDeclResolveAlias(expr)) ?? node.expression;
    if (!decl) {
        return;
    }
    if (arkts.NodeCache.getInstance().has(decl)) {
        arkts.NodeCache.getInstance().collect(node);
    }
    if (arkts.isMethodDefinition(decl)) {
        collectCallWithDeclaredMethod(node, decl);
    }
}

export function collectCallWithDeclaredMethod(node: arkts.CallExpression, decl: arkts.MethodDefinition): void {
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
    } else {
        const memoableInfo = collectMemoableInfoInScriptFunction(decl.scriptFunction);
        if (checkIsMemoFromMemoableInfo(memoableInfo, true)) {
            const { hasMemoEntry, hasMemoIntrinsic } = memoableInfo;
            arkts.NodeCache.getInstance().collect(node, { hasReceiver, hasMemoEntry, hasMemoIntrinsic });
        }
    }
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
        const returnMemoableInfo = collectMemoableInfoInFunctionReturnType(arg.scriptFunction);
        const [paramMemoableInfoMap, gensymCount] = collectMemoableInfoMapInFunctionParams(arg.scriptFunction);
        if (!!arg.scriptFunction.body && arkts.isBlockStatement(arg.scriptFunction.body)) {
            collectMemoScriptFunctionBody(
                arg.scriptFunction.body,
                returnMemoableInfo,
                paramMemoableInfoMap,
                gensymCount
            );
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
