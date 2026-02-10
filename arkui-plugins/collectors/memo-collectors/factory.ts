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
import {
    addMemoAnnotation,
    collectMemoFromCallExpression,
    collectMemoFromNewClass,
    findCanAddMemoFromArrowFunction,
    findCanAddMemoFromClassProperty,
    findCanAddMemoFromMethod,
    findCanAddMemoFromParameter,
    findCanAddMemoFromProperty,
    findCanAddMemoFromTypeAlias,
} from './utils';
import { coerceToAstNode } from '../../common/arkts-utils';
import { isArrowFunctionAsValue } from './utils';

export type RewriteAfterFoundFn<T extends arkts.AstNode = arkts.AstNode> = (
    node: T,
    nodeType: arkts.Es2pandaAstNodeType
) => T;

export function findAndCollectMemoableNode(node: arkts.AstNode, rewriteFn?: RewriteAfterFoundFn): arkts.AstNode {
    const type = arkts.nodeType(node);
    if (collectByType.has(type)) {
        return collectByType.get(type)!(node, rewriteFn);
    }
    return node;
}

export class factory {
    /**
     * Find and collect possible `@memo` property with arrow function value.
     *
     * @param node `arkts.Property` node
     * @param rewriteFn function callback to rewrite node when it is `@memo` property
     * @returns `arkts.Property` node
     */
    static findAndCollectMemoableProperty<T extends arkts.AstNode = arkts.Property>(
        node: T,
        rewriteFn?: RewriteAfterFoundFn<T>
    ): T {
        const {canAddMemo, hasBuilder} = findCanAddMemoFromProperty(node);
        if (canAddMemo) {
            const value = (
                isArrowFunctionAsValue(node.value!) ? node.value.expr : node.value
            ) as arkts.ArrowFunctionExpression;
            addMemoAnnotation(value);
        }
        if ((canAddMemo || hasBuilder) && !!rewriteFn) {
            return rewriteFn(node, arkts.Es2pandaAstNodeType.AST_NODE_TYPE_PROPERTY);
        }
        return node;
    }

    /**
     * Find and collect possible `@memo` class property with arrow function value.
     *
     * @param node `arkts.ClassProperty` node
     * @param rewriteFn function callback to rewrite node when it is `@memo` class property
     * @returns `arkts.ClassProperty` node
     */
    static findAndCollectMemoableClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
        node: T,
        rewriteFn?: RewriteAfterFoundFn<T>
    ): T {
        const {canAddMemo, hasBuilder} = findCanAddMemoFromClassProperty(node);
        if (canAddMemo) {
            addMemoAnnotation(node);
        }
        if ((canAddMemo || hasBuilder) && !!rewriteFn) {
            return rewriteFn(node, arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY);
        }
        return node;
    }

    /**
     * Find and collect possible `@memo` type alias with function type.
     *
     * @param node `arkts.TSTypeAliasDeclaration` node
     * @param rewriteFn function callback to rewrite node when it is `@memo` type alias
     * @returns `arkts.TSTypeAliasDeclaration` node
     */
    static findAndCollectMemoableTypeAlias<T extends arkts.AstNode = arkts.TSTypeAliasDeclaration>(
        node: T,
        rewriteFn?: RewriteAfterFoundFn<T>
    ): T {
        const {canAddMemo, hasBuilder} = findCanAddMemoFromTypeAlias(node);
        if (canAddMemo) {
            addMemoAnnotation(node);
        }
        if ((canAddMemo || hasBuilder) && !!rewriteFn) {
            return rewriteFn(node, arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_TYPE_ALIAS_DECLARATION);
        }
        return node;
    }

    /**
     * Find and collect possible `@memo` parameter with function type.
     *
     * @param node `arkts.ETSParameterExpression` node
     * @param rewriteFn function callback to rewrite node when it is `@memo` parameter
     * @returns `arkts.ETSParameterExpression` node
     */
    static findAndCollectMemoableParameter<T extends arkts.AstNode = arkts.ETSParameterExpression>(
        node: T,
        rewriteFn?: RewriteAfterFoundFn<T>
    ): T {
        const {canAddMemo, hasBuilder} = findCanAddMemoFromParameter(node);
        if (canAddMemo) {
            addMemoAnnotation(node);
        }
        if ((canAddMemo || hasBuilder) && !!rewriteFn) {
            return rewriteFn(node, arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_PARAMETER_EXPRESSION);
        }
        return node;
    }

    /**
     * Find and collect possible `@memo` method.
     *
     * @param node `arkts.MethodDefinition` node
     * @param rewriteFn function callback to rewrite node when it is `@memo` method
     * @returns `arkts.MethodDefinition` node
     */
    static findAndCollectMemoableMethod<T extends arkts.AstNode = arkts.MethodDefinition>(
        node: T,
        rewriteFn?: RewriteAfterFoundFn<T>
    ): T {
        const {canAddMemo, hasBuilder} = findCanAddMemoFromMethod(node);
        if (canAddMemo) {
            addMemoAnnotation(node.scriptFunction);
        }
        if ((canAddMemo || hasBuilder) && !!rewriteFn) {
            return rewriteFn(node, arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION);
        }
        return node;
    }

    /**
     * Find and collect possible `@memo` arrow function.
     *
     * @param node `arkts.ArrowFunctionExpression` node
     * @param rewriteFn function callback to rewrite node when it is `@memo` arrow function
     * @returns `arkts.ArrowFunctionExpression` node
     */
    static findAndCollectMemoableArrowFunction<T extends arkts.AstNode = arkts.ArrowFunctionExpression>(
        node: T,
        rewriteFn?: RewriteAfterFoundFn<T>
    ): T {
        const {canAddMemo, hasBuilder} = findCanAddMemoFromArrowFunction(node);
        if (canAddMemo) {
            addMemoAnnotation(node.scriptFunction);
        }
        if ((canAddMemo || hasBuilder) && !!rewriteFn) {
            return rewriteFn(node, arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ARROW_FUNCTION_EXPRESSION);
        }
        return node;
    }

    /**
     * Find and collect possible `@memo` function call.
     *
     * @param node `arkts.CallExpression` node
     * @returns `arkts.CallExpression` node
     */
    static findAndCollectMemoableCallExpression<T extends arkts.AstNode = arkts.CallExpression>(
        node: T,
        rewriteFn?: RewriteAfterFoundFn<T>
    ): T {
        const _node = coerceToAstNode<arkts.CallExpression>(node);
        const found = collectMemoFromCallExpression(_node);
        if (found && !!rewriteFn) {
            return rewriteFn(node, arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION);
        }
        return node;
    }

    /**
     * Find and collect new class instance with possible `@memo` type parameters.
     *
     * @param node `arkts.ETSNewClassInstanceExpression` node
     * @returns `arkts.ETSNewClassInstanceExpression` node
     */
    static findAndCollectMemoableNewClass<T extends arkts.AstNode = arkts.ETSNewClassInstanceExpression>(
        node: T,
        rewriteFn?: RewriteAfterFoundFn<T>
    ): T {
        const _node = coerceToAstNode<arkts.ETSNewClassInstanceExpression>(node);
        collectMemoFromNewClass(_node);
        return node;
    }
}

type CollectFactoryFn = <T extends arkts.AstNode>(node: T, rewriteFn?: RewriteAfterFoundFn<T>) => T;

const collectByType = new Map<arkts.Es2pandaAstNodeType, CollectFactoryFn>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_PROPERTY, factory.findAndCollectMemoableProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, factory.findAndCollectMemoableClassProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_TYPE_ALIAS_DECLARATION, factory.findAndCollectMemoableTypeAlias],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_PARAMETER_EXPRESSION, factory.findAndCollectMemoableParameter],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, factory.findAndCollectMemoableMethod],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ARROW_FUNCTION_EXPRESSION, factory.findAndCollectMemoableArrowFunction],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION, factory.findAndCollectMemoableCallExpression],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_NEW_CLASS_INSTANCE_EXPRESSION, factory.findAndCollectMemoableNewClass],
]);
