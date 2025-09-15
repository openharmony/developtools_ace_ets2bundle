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
import { AbstractVisitor } from '../../common/abstract-visitor';
import { factory as BuilderLambdaFactory } from './factory';

/**
 * `ConditionScopeVisitor` is used to visit `@Builder` function body to wrap `ConditionScope`/`ConditionBranch`
 * to if-else or switch-case statements.
 *
 * @internal
 */
export class ConditionScopeVisitor extends AbstractVisitor {
    private static instance: ConditionScopeVisitor;
    private _enforceUpdateCondition: boolean = false;
    private _shouldUpdateCondition: boolean = true;

    private constructor() {
        super();
    }

    private get shouldUpdateCondition(): boolean {
        if (this._enforceUpdateCondition) {
            return true;
        }
        return this._shouldUpdateCondition;
    }

    private set shouldUpdateCondition(newValue: boolean) {
        if (this._enforceUpdateCondition) {
            this._shouldUpdateCondition = true;
            return;
        }
        this._shouldUpdateCondition = newValue;
    }

    static getInstance(): ConditionScopeVisitor {
        if (!this.instance) {
            this.instance = new ConditionScopeVisitor();
        }
        return this.instance;
    }

    private enter(node: arkts.AstNode): void {
        if (arkts.isVariableDeclarator(node) && arkts.NodeCache.getInstance().has(node)) {
            this._enforceUpdateCondition = true;
        }
    }

    reset(): void {
        this._enforceUpdateCondition = false;
        this._shouldUpdateCondition = true;
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        this.enter(node);
        if (arkts.isIfStatement(node) && this.shouldUpdateCondition) {
            return BuilderLambdaFactory.updateIfElseContentBodyInBuilderLambda(node, true, true);
        }
        if (arkts.isSwitchStatement(node) && this.shouldUpdateCondition) {
            return BuilderLambdaFactory.updateSwitchCaseContentBodyInBuilderLambda(node, true, true);
        }
        if (arkts.isBlockStatement(node) && this.shouldUpdateCondition) {
            const newStatements = node.statements.map((st) =>
                BuilderLambdaFactory.updateContentBodyInBuilderLambda(st, true, true)
            );
            return arkts.factory.updateBlock(node, newStatements);
        }
        if (
            arkts.isArrowFunctionExpression(node) &&
            !arkts.NodeCache.getInstance().has(node) &&
            !arkts.NodeCache.getInstance().has(node.scriptFunction)
        ) {
            this.shouldUpdateCondition = false;
            this._enforceUpdateCondition = false;
        }
        return this.visitEachChild(node);
    }
}
