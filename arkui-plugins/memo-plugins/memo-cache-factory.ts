/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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
import { factory } from './memo-factory';
import {
    filterMemoSkipParams,
    findLocalReturnTypeFromTypeAnnotation,
    findUnmemoizedScopeInFunctionBody,
    fixGensymParams,
    getFunctionParamsBeforeUnmemoized,
    hasMemoAnnotation,
    isVoidType,
    mayAddLastReturn,
    parametrizedNodeHasReceiver,
    ParamInfo,
    PositionalIdTracker,
} from './utils';
import { InternalsTransformer } from './internal-transformer';
import { GenSymPrefix } from '../common/predefines';
import { isArrowFunctionAsValue } from '../collectors/memo-collectors/utils';

export interface CachedMetadata extends arkts.AstNodeCacheValueMetadata {
    internalsTransformer?: InternalsTransformer;
}

export class RewriteFactory {
    static rewriteTsAsExpression(node: arkts.TSAsExpression, metadata?: CachedMetadata): arkts.TSAsExpression {
        const newExpr = !!node.expr && arkts.isArrowFunctionExpression(node.expr)
            ? RewriteFactory.rewriteArrowFunction(node.expr)
            : node.expr;
        return arkts.factory.updateTSAsExpression(
            node,
            newExpr,
            RewriteFactory.rewriteType(node.typeAnnotation, metadata),
            node.isConst
        );
    }

    static rewriteUnionType(node: arkts.ETSUnionType, metadata?: CachedMetadata): arkts.ETSUnionType {
        return arkts.factory.updateUnionType(
            node,
            node.types.map((nodeType) => {
                if (arkts.isETSFunctionType(nodeType)) {
                    return RewriteFactory.rewriteFunctionType(nodeType, metadata);
                }
                if (arkts.isETSUnionType(nodeType)) {
                    return RewriteFactory.rewriteUnionType(nodeType, metadata);
                }
                if (arkts.isETSTypeReference(nodeType)) {
                    return RewriteFactory.rewriteETSTypeReference(nodeType, metadata);
                }
                return nodeType;
            })
        );
    }

    static rewriteFunctionType(node: arkts.ETSFunctionType, metadata?: CachedMetadata): arkts.ETSFunctionType {
        const canRewriteType = !metadata?.forbidTypeRewrite;
        const isWithinTypeParams = !!metadata?.isWithinTypeParams && hasMemoAnnotation(node);
        if (!canRewriteType && !isWithinTypeParams) {
            return node;
        }
        const hasReceiver = metadata?.hasReceiver ?? parametrizedNodeHasReceiver(node);
        return factory.updateFunctionTypeWithMemoParameters(node, hasReceiver);
    }

    static rewriteETSTypeReference(node: arkts.ETSTypeReference, metadata?: CachedMetadata): arkts.ETSTypeReference {
        if (!metadata?.isWithinTypeParams) {
            return node;
        }
        const part = node.part;
        if (!part) {
            return node;
        }
        const typeParams = part.typeParams;
        if (!typeParams) {
            return node;
        }
        const newTypeParams = arkts.factory.updateTSTypeParameterInstantiation(
            typeParams,
            typeParams.params.map((t) => RewriteFactory.rewriteType(t, metadata)!)
        );
        return arkts.factory.updateTypeReference(
            node,
            arkts.factory.updateTypeReferencePart(part, part.name, newTypeParams, part.previous)
        );
    }

    /**
     * @internal
     */
    static rewriteType(node: arkts.TypeNode | undefined, metadata?: CachedMetadata): arkts.TypeNode | undefined {
        let newNodeType = node;
        if (!!newNodeType && arkts.isETSFunctionType(newNodeType)) {
            newNodeType = RewriteFactory.rewriteFunctionType(newNodeType, metadata);
        } else if (!!newNodeType && arkts.isETSUnionType(newNodeType)) {
            newNodeType = RewriteFactory.rewriteUnionType(newNodeType, metadata);
        } else if (!!newNodeType && arkts.isETSTypeReference(newNodeType)) {
            return RewriteFactory.rewriteETSTypeReference(newNodeType, metadata);
        }
        return newNodeType;
    }

    static rewriteTypeAlias(
        node: arkts.TSTypeAliasDeclaration,
        metadata?: CachedMetadata
    ): arkts.TSTypeAliasDeclaration {
        if (!node.typeAnnotation) {
            return node;
        }
        const newNodeType = RewriteFactory.rewriteType(node.typeAnnotation);
        return arkts.factory.updateTSTypeAliasDeclaration(node, node.id, node.typeParams, newNodeType);
    }

    static rewriteParameter(
        node: arkts.ETSParameterExpression,
        metadata?: CachedMetadata
    ): arkts.ETSParameterExpression {
        if (!node.type && !node.initializer) {
            return node;
        }
        node.type = RewriteFactory.rewriteType(node.type as arkts.TypeNode, metadata);
        return node;
    }

    static rewriteProperty(node: arkts.Property, metadata?: CachedMetadata): arkts.Property {
        const value: arkts.Expression | undefined = node.value;
        if (!value) {
            return node;
        }
        if (arkts.isArrowFunctionExpression(value)) {
            return arkts.factory.updateProperty(node, node.key, RewriteFactory.rewriteArrowFunction(value, metadata));
        }
        if (isArrowFunctionAsValue(value)) {
            return arkts.factory.updateProperty(node, node.key, RewriteFactory.rewriteTsAsExpression(value, metadata));
        }
        return node;
    }

    static rewriteClassProperty(node: arkts.ClassProperty, metadata?: CachedMetadata): arkts.ClassProperty {
        const newType = !!node.typeAnnotation ? RewriteFactory.rewriteType(node.typeAnnotation, metadata) : undefined;
        const newValue =
            !!node.value && arkts.isArrowFunctionExpression(node.value)
                ? RewriteFactory.rewriteArrowFunction(node.value, metadata)
                : node.value;
        return arkts.factory.updateClassProperty(node, node.key, newValue, newType, node.modifiers, node.isComputed);
    }

    static rewriteArrowFunction(
        node: arkts.ArrowFunctionExpression,
        metadata?: arkts.AstNodeCacheValueMetadata,
        expectReturn?: arkts.TypeNode
    ): arkts.ArrowFunctionExpression {
        return arkts.factory.updateArrowFunction(
            node,
            RewriteFactory.rewriteScriptFunction(node.scriptFunction, metadata, expectReturn)
        );
    }

    /**
     * @internal
     */
    static rewriteScriptFunctionBody(
        node: arkts.ScriptFunction,
        body: arkts.BlockStatement,
        positionalIdTracker: PositionalIdTracker,
        callName?: string,
        hasReceiver?: boolean,
        expectReturn?: arkts.TypeNode
    ): arkts.BlockStatement {
        const _hasReceiver = hasReceiver ?? node.hasReceiver;
        const _callName = callName ?? node.id?.name;
        const parameters = getFunctionParamsBeforeUnmemoized(node.params, _hasReceiver);
        const declaredParams: ParamInfo[] = parameters.map((p) => {
            const param = p as arkts.ETSParameterExpression;
            return { ident: param.identifier, param };
        });
        const _gensymCount = fixGensymParams(declaredParams, body);
        if (findUnmemoizedScopeInFunctionBody(body, _gensymCount)) {
            return body;
        }
        const filteredParams = filterMemoSkipParams(declaredParams);
        const returnType =
            node.returnTypeAnnotation ??
            expectReturn ??
            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID);
        const _isVoidReturn = isVoidType(returnType);
        const _returnType = _isVoidReturn ? arkts.factory.createETSUndefinedType() : returnType;
        const scopeDeclaration = factory.createScopeDeclaration(
            _returnType,
            positionalIdTracker.id(_callName),
            filteredParams.length
        );
        const memoParametersDeclaration = filteredParams.length
            ? factory.createMemoParameterDeclaration(filteredParams.map((p) => p.ident.name))
            : undefined;
        const syntheticReturnStatement = factory.createSyntheticReturnStatement(false);
        const unchangedCheck = factory.createIfStatementWithSyntheticReturnStatement(
            syntheticReturnStatement,
            _isVoidReturn
        );
        const lastReturn = mayAddLastReturn(body)
            ? factory.createWrappedReturnStatement(factory.createRecacheCall(), _isVoidReturn)
            : undefined;
        return arkts.factory.updateBlock(body, [
            ...body.statements.slice(0, _gensymCount),
            scopeDeclaration,
            ...(!!memoParametersDeclaration ? [memoParametersDeclaration] : []),
            unchangedCheck,
            ...body.statements.slice(_gensymCount),
            ...(!!lastReturn ? [lastReturn] : []),
        ]);
    }

    static rewriteScriptFunction(
        node: arkts.ScriptFunction,
        metadata?: CachedMetadata,
        expectReturn?: arkts.TypeNode
    ): arkts.ScriptFunction {
        const _callName = metadata?.callName;
        const _hasReceiver = metadata?.hasReceiver ?? node.hasReceiver;
        const _isSetter = !!metadata?.isSetter;
        const _isGetter = !!metadata?.isGetter;
        const _hasMemoEntry = !!metadata?.hasMemoEntry;
        const _hasMemoIntrinsic = !!metadata?.hasMemoIntrinsic;
        const _internalsTransformer = metadata?.internalsTransformer;
        const _isWithinTypeParams = metadata?.isWithinTypeParams;
        const _isDecl = arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
        const newParams: readonly arkts.Expression[] = prepareRewriteScriptFunctionParameters(
            node,
            _isSetter,
            _isGetter,
            _hasReceiver,
            _isWithinTypeParams
        );
        const newReturnType: arkts.TypeNode | undefined = prepareRewriteScriptFunctionReturnType(
            node,
            _isGetter,
            _hasReceiver,
            _isWithinTypeParams
        );
        const newBody: arkts.AstNode | undefined = prepareRewriteScriptFunctionBody(
            node,
            expectReturn,
            _internalsTransformer,
            _isDecl,
            _hasMemoEntry,
            _hasMemoIntrinsic,
            _callName,
            _hasReceiver,
            _isGetter,
            _isSetter
        );
        node.setParams(newParams);
        if (!!newReturnType) {
            node.setReturnTypeAnnotation(newReturnType);
        }
        if (!!newBody) {
            node.setBody(newBody);
        }
        return node;
    }

    static rewriteMethodDefinition(node: arkts.MethodDefinition, metadata?: CachedMetadata): arkts.MethodDefinition {
        const isSetter = node.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET;
        const isGetter = node.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET;
        const newNode = arkts.factory.updateMethodDefinition(
            node,
            node.kind,
            node.name,
            RewriteFactory.rewriteScriptFunction(node.scriptFunction, {
                callName: node.name.name,
                ...metadata,
                isSetter,
                isGetter,
            }),
            node.modifiers,
            false
        );
        if (node.overloads.length > 0) {
            newNode.setOverloads(node.overloads.map((o) => RewriteFactory.rewriteMethodDefinition(o, metadata)));
        }
        return newNode;
    }

    static rewriteCallExpression(node: arkts.CallExpression, metadata?: CachedMetadata): arkts.CallExpression {
        const _hasMemoEntry = !!metadata?.hasMemoEntry;
        if (_hasMemoEntry) {
            return node;
        }
        const _hasReceiver = metadata?.hasReceiver;
        let _callName: string | undefined = metadata?.callName;
        if (!!_callName && arkts.isIdentifier(node.expression)) {
            _callName = node.expression.name;
        } else if (
            !!_callName &&
            arkts.isMemberExpression(node.expression) &&
            arkts.isIdentifier(node.expression.property)
        ) {
            _callName = node.expression.property.name;
        }
        return factory.insertHiddenArgumentsToCall(
            node,
            PositionalIdTracker.getInstance(arkts.getFileName()).id(_callName),
            _hasReceiver
        );
    }

    static rewriteIdentifier(
        node: arkts.Identifier,
        metadata?: CachedMetadata
    ): arkts.Identifier | arkts.MemberExpression {
        if (!node.name.startsWith(GenSymPrefix.INTRINSIC) && !node.name.startsWith(GenSymPrefix.UI)) {
            return factory.createMemoParameterAccess(node.name);
        }
        return node;
    }

    static rewriteReturnStatement(
        node: arkts.ReturnStatement,
        metadata?: CachedMetadata
    ): arkts.ReturnStatement | arkts.BlockStatement {
        return factory.createWrappedReturnStatement(factory.createRecacheCall(node.argument), !node.argument);
    }

    static rewriteVariableDeclarator(
        node: arkts.VariableDeclarator,
        metadata?: CachedMetadata
    ): arkts.VariableDeclarator {
        const expectReturnType = findLocalReturnTypeFromTypeAnnotation(node.name.typeAnnotation);
        const variableType = RewriteFactory.rewriteType(node.name.typeAnnotation);
        let initializer = node.initializer;
        if (!!initializer && arkts.isConditionalExpression(initializer) && !!initializer.alternate) {
            let alternate = initializer.alternate;
            if (arkts.isTSAsExpression(alternate)) {
                alternate = arkts.factory.updateTSAsExpression(
                    alternate,
                    !!alternate.expr && arkts.isArrowFunctionExpression(alternate.expr)
                        ? RewriteFactory.rewriteArrowFunction(alternate.expr, metadata, expectReturnType)
                        : alternate.expr,
                    RewriteFactory.rewriteType(alternate.typeAnnotation),
                    alternate.isConst
                );
            } else if (arkts.isArrowFunctionExpression(alternate)) {
                alternate = RewriteFactory.rewriteArrowFunction(alternate, metadata, expectReturnType);
            }
            initializer = arkts.factory.updateConditionalExpression(
                initializer,
                initializer.test,
                initializer.consequent,
                alternate
            );
        } else if (!!initializer && arkts.isArrowFunctionExpression(initializer)) {
            initializer = RewriteFactory.rewriteArrowFunction(initializer, metadata, expectReturnType);
        }
        return arkts.factory.updateVariableDeclarator(
            node,
            node.flag,
            arkts.factory.updateIdentifier(node.name, node.name.name, variableType),
            initializer
        );
    }
}

export function prepareRewriteScriptFunctionParameters(
    node: arkts.ScriptFunction,
    isSetter?: boolean,
    isGetter?: boolean,
    hasReceiver?: boolean,
    isWithinTypeParams?: boolean
): readonly arkts.Expression[] {
    let newParams: readonly arkts.Expression[] = node.params;
    if (!isSetter && !isGetter) {
        newParams = factory.createHiddenParameterIfNotAdded(node.params, node.hasReceiver);
    } else if (isSetter && node.params.length > 0) {
        const metadata = { isWithinTypeParams };
        if (hasReceiver && node.params.length === 2) {
            newParams = [
                node.params.at(0)!,
                RewriteFactory.rewriteParameter(node.params.at(1)! as arkts.ETSParameterExpression, metadata),
            ];
        } else {
            newParams = [RewriteFactory.rewriteParameter(node.params.at(0)! as arkts.ETSParameterExpression, metadata)];
        }
    }
    return newParams;
}

export function prepareRewriteScriptFunctionReturnType(
    node: arkts.ScriptFunction,
    isGetter?: boolean,
    hasReceiver?: boolean,
    isWithinTypeParams?: boolean
): arkts.TypeNode | undefined {
    let newReturnType: arkts.TypeNode | undefined = node.returnTypeAnnotation;
    if (!!node.returnTypeAnnotation && isGetter) {
        newReturnType = RewriteFactory.rewriteType(node.returnTypeAnnotation, { hasReceiver, isWithinTypeParams });
    }
    return newReturnType;
}

function prepareRewriteScriptFunctionBody(
    node: arkts.ScriptFunction,
    expectReturn?: arkts.TypeNode,
    internalsTransformer?: InternalsTransformer,
    isDecl?: boolean,
    hasMemoEntry?: boolean,
    hasMemoIntrinsic?: boolean,
    callName?: string,
    hasReceiver?: boolean,
    isGetter?: boolean,
    isSetter?: boolean
): arkts.AstNode | undefined {
    if (isGetter || isSetter || isDecl || !node.body || !arkts.isBlockStatement(node.body)) {
        return node.body;
    }

    let newBody: arkts.AstNode | undefined;
    const positionalIdTracker = PositionalIdTracker.getInstance(arkts.getFileName());
    newBody = internalsTransformer?.visitor(node.body) ?? node.body;
    if (!hasMemoEntry && !hasMemoIntrinsic) {
        newBody = RewriteFactory.rewriteScriptFunctionBody(
            node,
            newBody as arkts.BlockStatement,
            positionalIdTracker,
            callName,
            hasReceiver,
            expectReturn
        );
    }
    return newBody;
}

export const rewriteByType = new Map<arkts.Es2pandaAstNodeType, (node: any, ...args: any[]) => arkts.AstNode>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_UNION_TYPE, RewriteFactory.rewriteUnionType],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_FUNCTION_TYPE, RewriteFactory.rewriteFunctionType],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_TYPE_REFERENCE, RewriteFactory.rewriteETSTypeReference],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_TYPE_ALIAS_DECLARATION, RewriteFactory.rewriteTypeAlias],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_PARAMETER_EXPRESSION, RewriteFactory.rewriteParameter],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, RewriteFactory.rewriteClassProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ARROW_FUNCTION_EXPRESSION, RewriteFactory.rewriteArrowFunction],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_SCRIPT_FUNCTION, RewriteFactory.rewriteScriptFunction],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, RewriteFactory.rewriteMethodDefinition],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION, RewriteFactory.rewriteCallExpression],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_IDENTIFIER, RewriteFactory.rewriteIdentifier],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_RETURN_STATEMENT, RewriteFactory.rewriteReturnStatement],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_VARIABLE_DECLARATOR, RewriteFactory.rewriteVariableDeclarator],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_PROPERTY, RewriteFactory.rewriteProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_AS_EXPRESSION, RewriteFactory.rewriteTsAsExpression],
]);
