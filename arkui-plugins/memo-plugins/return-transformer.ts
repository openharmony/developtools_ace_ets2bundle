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
import { AbstractVisitor } from '../common/abstract-visitor';
import { isSyntheticReturnStatement, ReturnTypeInfo } from './utils';

export class ReturnTransformer extends AbstractVisitor {
    private skipNode?: arkts.ReturnStatement | arkts.BlockStatement;
    private stableThis: boolean = false;
    private returnTypeInfo: ReturnTypeInfo | undefined;

    reset() {
        super.reset();
        this.skipNode = undefined;
        this.stableThis = false;
        this.returnTypeInfo = undefined;
    }

    skip(syntheticReturnStatement?: arkts.ReturnStatement | arkts.BlockStatement): ReturnTransformer {
        this.skipNode = syntheticReturnStatement;
        return this;
    }

    rewriteThis(stableThis: boolean): ReturnTransformer {
        this.stableThis = stableThis;
        return this;
    }

    registerReturnTypeInfo(returnTypeInfo: ReturnTypeInfo): ReturnTransformer {
        this.returnTypeInfo = returnTypeInfo;
        return this;
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        // TODO: temporary checking skip nodes by comparison with expected skip nodes
        // Should be fixed when update procedure implemented properly
        if (/* beforeChildren === this.skipNode */ isSyntheticReturnStatement(beforeChildren)) {
            return beforeChildren;
        }
        if (arkts.isScriptFunction(beforeChildren)) {
            return beforeChildren;
        }
        const node = this.visitEachChild(beforeChildren);
        if (arkts.isReturnStatement(node)) {
            if (this.stableThis && node.argument && arkts.isThisExpression(node.argument)) {
                return factory.createReturnThis();
            }
            if (node.argument === undefined) {
                return arkts.factory.createBlock([
                    arkts.factory.createExpressionStatement(factory.createRecacheCall()),
                    node,
                ]);
            }

            let argument = node.argument;
            if (
                !!this.returnTypeInfo?.node &&
                this.returnTypeInfo.isMemo &&
                arkts.isArrowFunctionExpression(argument)
            ) {
                argument = arkts.factory.updateArrowFunction(
                    argument,
                    factory.updateScriptFunctionWithMemoParameters(argument.scriptFunction)
                );
            }

            return arkts.factory.updateReturnStatement(node, factory.createRecacheCall(argument));
        }
        return node;
    }
}
