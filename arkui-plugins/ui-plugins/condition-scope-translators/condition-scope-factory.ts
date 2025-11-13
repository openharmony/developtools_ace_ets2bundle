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
import { addMemoAnnotation, MemoNames } from '../../collectors/memo-collectors/utils';
import { ARKUI_BUILDER_SOURCE_NAME, ConditionNames, NodeCacheNames } from '../../common/predefines';
import { annotation, coerceToAstNode } from '../../common/arkts-utils';
import { ImportCollector } from '../../common/import-collector';
import { BuilderLambdaConditionBranchInfo, checkIsWithInIfConditionScope } from '../builder-lambda-translators/utils';
import { ConditionBreakCache } from './cache/conditionBreakCache';
import { factory as UIFactory } from '../ui-factory';
import { ConditionScopeInfoCache } from '../memo-collect-cache';
import { ConditionScopeCacheVisitor } from './condition-scope-visitor';

export class ConditionScopeFactory {
    /**
     * update trailing lambda contents in a builder lambda call.
     */
    static updateConditionScopeContentBodyInBuilderLambda(
        statement: arkts.Statement,
        hasBuilder?: boolean
    ): arkts.Statement {
        if (arkts.isCallExpression(statement)) {
            return statement;
        }
        if (arkts.isIfStatement(statement)) {
            const newStatement = this.updateIfElseContentBodyInBuilderLambda(statement, hasBuilder);
            return newStatement;
        }
        if (arkts.isSwitchStatement(statement)) {
            return this.updateSwitchCaseContentBodyInBuilderLambda(statement, hasBuilder);
        }
        if (arkts.isBlockStatement(statement)) {
            const newStatements = statement.statements.map((st) =>
                this.updateConditionScopeContentBodyInBuilderLambda(st, hasBuilder)
            );
            statement.setStatements(newStatements);
            return statement;
        }
        if (arkts.isBreakStatement(statement) && statement.parent && arkts.isBlockStatement(statement.parent)) {
            ConditionBreakCache.getInstance().collectBreak();
            return arkts.factory.createReturnStatement();
        }
        return statement;
    }

    /**
     * update if-else in a builder lambda call's arguments.
     */
    static updateIfElseContentBodyInBuilderLambda(statement: arkts.AstNode, shouldWrap?: boolean): arkts.AstNode {
        if (arkts.isIfStatement(statement)) {
            const alternate = !!statement.alternate
                ? this.updateIfElseContentBodyInBuilderLambda(statement.alternate, shouldWrap)
                : statement.alternate;
            const consequence = !!statement.consequent
                ? this.updateIfElseContentBodyInBuilderLambda(statement.consequent, shouldWrap)
                : statement.consequent;
            statement.setConsequent(consequence);
            statement.setAlternate(alternate);
            return !shouldWrap || checkIsWithInIfConditionScope(statement)
                ? statement
                : this.wrapConditionToBlock([statement], ConditionNames.CONDITION_SCOPE);
        }
        if (arkts.isBlockStatement(statement)) {
            let { statements, breakIndex } = this.updateConditionBranchInScope(statement.statements, shouldWrap);
            if (!!shouldWrap && checkIsWithInIfConditionScope(statement)) {
                const beforeBreak = this.wrapConditionToBlock(
                    breakIndex > 0 ? statements.slice(0, breakIndex) : statements,
                    ConditionNames.CONDITION_BRANCH
                );
                // beforeBreak.parent = statement;
                const afterBreak = breakIndex > 0 ? statements.slice(breakIndex) : [];
                statements = [beforeBreak, ...afterBreak];
            }
            statement.setStatements(statements);
            return statement;
        }
        return statement;
    }

    /**
     * wrap `ConditionScope` or `ConditionBranch` builder function to the block statements.
     */
    static wrapConditionToBlock(statements: readonly arkts.AstNode[], condition: ConditionNames): arkts.AstNode {
        const contentArg = arkts.factory.createArrowFunction(
            UIFactory.createScriptFunction({
                body: arkts.factory.createBlock(statements),
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            })
        );
        contentArg.setAnnotations([annotation(MemoNames.MEMO_UI)]);
        const newCall = arkts.factory.createCallExpression(arkts.factory.createIdentifier(condition), undefined, [
            contentArg,
        ]);
        const newStatement = arkts.factory.createExpressionStatement(newCall);
        ConditionScopeInfoCache.getInstance().collect({ arg: contentArg, call: newCall });
        ImportCollector.getInstance().collectSource(condition, ARKUI_BUILDER_SOURCE_NAME);
        ImportCollector.getInstance().collectImport(condition);
        return newStatement;
    }

    /**
     * update ConditionBranch in an if-else or swith-case body.
     * @internal
     */
    static updateConditionBranchInScope(
        statements: readonly arkts.Statement[],
        shouldWrap?: boolean
    ): BuilderLambdaConditionBranchInfo {
        let breakIndex = statements.length;
        const newStatements = statements.map((st, index) => {
            if (ConditionBreakCache.getInstance().collect(st)) {
                breakIndex = index;
            }
            return this.updateConditionScopeContentBodyInBuilderLambda(st, shouldWrap);
        });
        return { statements: newStatements, breakIndex };
    }

    /**
     * update switch-case in a builder lambda call's arguments.
     */
    static updateSwitchCaseContentBodyInBuilderLambda<T extends arkts.SwitchStatement | arkts.SwitchCaseStatement>(
        statement: T,
        shouldWrap?: boolean,
        stopAtBuilderLambda?: boolean
    ): T {
        if (arkts.isSwitchStatement(statement)) {
            const cases = statement.cases.map((c) =>
                this.updateSwitchCaseContentBodyInBuilderLambda(c, shouldWrap, stopAtBuilderLambda)
            );
            const newStatement = arkts.factory.updateSwitchStatement(statement, statement.discriminant, cases);
            return (!shouldWrap
                ? newStatement
                : this.wrapConditionToBlock([newStatement], ConditionNames.CONDITION_SCOPE)) as arkts.AstNode as T;
        }
        if (arkts.isSwitchCaseStatement(statement)) {
            let { statements, breakIndex } = this.updateConditionBranchInScope(statement.consequent, shouldWrap);
            if (shouldWrap && breakIndex > 0) {
                const hasBreak = breakIndex !== statements.length;
                const beforeBreak = this.wrapConditionToBlock(
                    statements.slice(0, breakIndex),
                    ConditionNames.CONDITION_BRANCH
                );
                const afterBreak = statements.slice(hasBreak ? breakIndex + 1 : breakIndex);
                const breakStatement = this.createBreakBetweenConditionStatements();
                statements = [beforeBreak, ...breakStatement, ...afterBreak];
            }
            ConditionBreakCache.getInstance().reset();
            return arkts.factory.updateSwitchCaseStatement(statement, statement.test, statements) as T;
        }
        return statement;
    }

    /**
     * create internal `break` or `return` from `ConditionBreakCache`.
     *
     * @internal
     */
    static createBreakBetweenConditionStatements(): arkts.AstNode[] {
        const cache = ConditionBreakCache.getInstance();
        if (cache.shouldBreak) {
            return [arkts.factory.createBreakStatement()];
        }
        if (cache.shouldReturn) {
            return [arkts.factory.createReturnStatement()];
        }
        return [];
    }

    /**
     * rewrite `@Builder` function body with `ConditionScopeCacheVisitor`.
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
        const conditionScopeVisitor = ConditionScopeCacheVisitor.getInstance();
        const newStatements = funcBody.statements.map((st) => {
            const newNode = conditionScopeVisitor.visitor(st);
            conditionScopeVisitor.reset();
            return newNode;
        });
        funcBody.setStatements(newStatements);
        _node.setParams(params);
        return _node;
    }

    /**
     * rewrite `@Builder` method.
     */
    static rewriteBuilderMethod<T extends arkts.AstNode = arkts.MethodDefinition>(node: T): arkts.MethodDefinition {
        const _node = coerceToAstNode<arkts.MethodDefinition>(node);
        const newFunc = this.rewriteBuilderScriptFunction(_node.scriptFunction);
        const newNode = arkts.factory.updateMethodDefinition(
            _node,
            _node.kind,
            _node.name,
            newFunc,
            _node.modifiers,
            false
        );
        ConditionScopeInfoCache.getInstance().updateAll().reset();
        return newNode;
    }

    /**
     * rewrite `@Builder` class property with arrow function value.
     */
    static rewriteBuilderClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(node: T): arkts.ClassProperty {
        const _node = coerceToAstNode<arkts.ClassProperty>(node);
        const value = _node.value;
        if (!value || !arkts.isArrowFunctionExpression(value)) {
            return _node;
        }
        const newValue = this.rewriteBuilderArrowFunction(value);
        const newNode = arkts.factory.updateClassProperty(
            _node,
            _node.key,
            newValue,
            _node.typeAnnotation,
            _node.modifiers,
            false
        );
        ConditionScopeInfoCache.getInstance().updateAll().reset();
        return newNode;
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
        const newValue = this.rewriteBuilderArrowFunction(value);
        _node.setValue(newValue);
        ConditionScopeInfoCache.getInstance().updateAll().reset();
        return _node;
    }

    /**
     * rewrite `@Builder` arrow function.
     */
    static rewriteBuilderArrowFunction<T extends arkts.AstNode = arkts.ArrowFunctionExpression>(
        node: T
    ): arkts.ArrowFunctionExpression {
        const _node = coerceToAstNode<arkts.ArrowFunctionExpression>(node);
        const newFunc = this.rewriteBuilderScriptFunction(_node.scriptFunction);
        const newNode = arkts.factory.updateArrowFunction(_node, newFunc);
        ConditionScopeInfoCache.getInstance().updateAll().reset();
        return newNode;
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
        const newInitializer = this.rewriteBuilderArrowFunction(initializer);
        _node.setInitializer(newInitializer);
        ConditionScopeInfoCache.getInstance().updateAll().reset();
        return _node;
    }
}
