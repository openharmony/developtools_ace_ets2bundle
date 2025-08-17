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
import { ConditionScopeVisitor } from './condition-scope-visitor';
import { findClassInstanceFromCallArgument } from './utils';
import { factory as BuilderLambdaFactory } from './factory';
import { factory as UIFactory } from '../ui-factory';
import { addMemoAnnotation, MemoNames } from '../../collectors/memo-collectors/utils';
import { coerceToAstNode } from '../../common/arkts-utils';

export class BuilderFactory {
    /**
     * rewrite `@Builder` function body with `ConditionScopeVisitor`.
     *
     * @internal
     */
    static rewriteBuilderScriptFunction<T extends arkts.AstNode = arkts.ScriptFunction>(node: T): arkts.ScriptFunction {
        const _node = coerceToAstNode<arkts.ScriptFunction>(node);
        let params = (_node.params as arkts.ETSParameterExpression[]).map((p) =>
            addMemoAnnotation(p, MemoNames.MEMO_SKIP_UI)
        );
        let funcBody: arkts.AstNode | undefined = _node.body;
        if (!funcBody || !arkts.isBlockStatement(funcBody)) {
            return _node;
        }
        const conditionScopeVisitor = ConditionScopeVisitor.getInstance();
        funcBody = arkts.factory.updateBlock(
            funcBody,
            funcBody.statements.map((st) => conditionScopeVisitor.visitor(st))
        );
        return UIFactory.updateScriptFunction(_node, { params, body: funcBody });
    }

    /**
     * rewrite `@Builder` method.
     */
    static rewriteBuilderMethod<T extends arkts.AstNode = arkts.MethodDefinition>(node: T): arkts.MethodDefinition {
        const _node = coerceToAstNode<arkts.MethodDefinition>(node);
        const newFunc = BuilderFactory.rewriteBuilderScriptFunction(_node.scriptFunction);
        return arkts.factory.updateMethodDefinition(_node, _node.kind, _node.name, newFunc, _node.modifiers, false);
    }

    /**
     * rewrite `@Builder` class property with arrow function value.
     */
    static rewirteBuilderClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(node: T): arkts.ClassProperty {
        const _node = coerceToAstNode<arkts.ClassProperty>(node);
        const value = _node.value;
        if (!value || !arkts.isArrowFunctionExpression(value)) {
            return _node;
        }
        const newValue = BuilderFactory.rewriteBuilderArrowFunction(value);
        return arkts.factory.updateClassProperty(
            _node,
            _node.key,
            newValue,
            _node.typeAnnotation,
            _node.modifiers,
            false
        );
    }

    /**
     * rewrite `@Builder` property with arrow function value.
     */
    static rewriteBuilderProperty<T extends arkts.AstNode = arkts.Property>(node: T): arkts.Property {
        const _node = coerceToAstNode<arkts.Property>(node);
        const value = _node.value;
        if (!value || !arkts.isArrowFunctionExpression(value)) {
            return _node;
        }
        const newValue = BuilderFactory.rewriteBuilderArrowFunction(value);
        return arkts.factory.updateProperty(_node, _node.key, newValue);
    }

    /**
     * rewrite `@Builder` arrow function.
     */
    static rewriteBuilderArrowFunction<T extends arkts.AstNode = arkts.ArrowFunctionExpression>(
        node: T
    ): arkts.ArrowFunctionExpression {
        const _node = coerceToAstNode<arkts.ArrowFunctionExpression>(node);
        const newFunc = BuilderFactory.rewriteBuilderScriptFunction(_node.scriptFunction);
        return arkts.factory.updateArrowFunction(_node, newFunc);
    }

    /**
     * rewrite `@Builder` parameter with arrow function value.
     */
    static rewriteBuilderParameter<T extends arkts.AstNode = arkts.ETSParameterExpression>(
        node: T
    ): arkts.ETSParameterExpression {
        const _node = coerceToAstNode<arkts.ETSParameterExpression>(node);
        const initializer = _node.initializer;
        if (!initializer || !arkts.isArrowFunctionExpression(initializer)) {
            return _node;
        }
        const newInitializer = BuilderFactory.rewriteBuilderArrowFunction(initializer);
        return arkts.factory.updateParameterDeclaration(_node, _node.identifier, newInitializer);
    }

    /**
     * rewrite `@Builder` call.
     */
    static rewriteBuilderCall<T extends arkts.AstNode = arkts.CallExpression>(node: T): arkts.CallExpression {
        const _node = coerceToAstNode<arkts.CallExpression>(node);
        const args = _node.arguments;
        if (args.length !== 1) {
            return _node;
        }
        const arg = args.at(0)!;
        if (!arkts.isTSAsExpression(arg) && !arkts.isObjectExpression(arg)) {
            return _node;
        }
        const decl = findClassInstanceFromCallArgument(arg);
        if (!decl) {
            return _node;
        }
        const isFromClass = arkts.isClassDefinition(decl);
        const typeRef = BuilderLambdaFactory.createTypeRefInBuilderParameterProxyCall(arg, decl);
        let newArgument: arkts.AstNode;
        if (arkts.isTSAsExpression(arg)) {
            const objectExpr = arg.expr as arkts.ObjectExpression;
            newArgument = arkts.factory.updateTSAsExpression(
                arg,
                BuilderLambdaFactory.createBuilderParameterProxyCall(objectExpr, typeRef, isFromClass),
                arg.typeAnnotation,
                arg.isConst
            );
        } else {
            newArgument = BuilderLambdaFactory.createBuilderParameterProxyCall(arg, typeRef, isFromClass);
        }
        return arkts.factory.updateCallExpression(_node, _node.expression, _node.typeArguments, [newArgument]);
    }
}

export type BuilderRewriteFn<T extends arkts.AstNode = arkts.AstNode> = (node: T) => T;

export const builderRewriteByType = new Map<arkts.Es2pandaAstNodeType, BuilderRewriteFn<arkts.AstNode>>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, BuilderFactory.rewriteBuilderMethod],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, BuilderFactory.rewirteBuilderClassProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_PROPERTY, BuilderFactory.rewriteBuilderProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ARROW_FUNCTION_EXPRESSION, BuilderFactory.rewriteBuilderArrowFunction],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_PARAMETER_EXPRESSION, BuilderFactory.rewriteBuilderParameter],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION, BuilderFactory.rewriteBuilderCall],
]);
