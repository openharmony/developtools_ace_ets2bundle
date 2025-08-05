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

    private constructor() {
        super();
    }

    static getInstance(): ConditionScopeVisitor {
        if (!this.instance) {
            this.instance = new ConditionScopeVisitor();
        }
        return this.instance;
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        if (arkts.isIfStatement(node)) {
            return BuilderLambdaFactory.updateIfElseContentBodyInBuilderLambda(node, true, true);
        }
        if (arkts.isSwitchStatement(node)) {
            return BuilderLambdaFactory.updateSwitchCaseContentBodyInBuilderLambda(node, true, true);
        }
        if (arkts.isBlockStatement(node)) {
            const newStatements = node.statements.map((st) =>
                BuilderLambdaFactory.updateContentBodyInBuilderLambda(st, true, true)
            );
            return arkts.factory.updateBlock(node, newStatements);
        }
        return this.visitEachChild(node);
    }
}
