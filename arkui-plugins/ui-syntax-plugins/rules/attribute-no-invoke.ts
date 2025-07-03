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
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class AttributeNoInvokeRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            cannotInitializePrivateVariables: `'{{componentNode}}' does not meet UI component syntax.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (arkts.isExpressionStatement(node) && !arkts.isIdentifier(node.expression) && this.chainJudgment(node)) {
            this.attributeNoInvoke(node);
        }
    }

    private attributeNoInvoke(node: arkts.AstNode): void {
        const childNode = node.getChildren();
        if (!Array.isArray(childNode) || childNode.length < 1) {
            return;
        }
        if (arkts.isMemberExpression(childNode[0]) && arkts.isIdentifier(childNode[0].property)) {
            this.report({
                node,
                message: this.messages.cannotInitializePrivateVariables,
                data: {
                    componentNode: node.dumpSrc(),
                },
            });
        }
    }

    private chainJudgment(node: arkts.AstNode): boolean {
        let children = node.getChildren();
        while (true) {
            if (!children || children.length === 0) {
                return false;
            }
            const firstChild = children[0];
            if (arkts.isIdentifier(firstChild)) {
                break;
            }
            if (!arkts.isMemberExpression(firstChild) && !arkts.isCallExpression(firstChild)) {
                return false;
            }
            children = firstChild.getChildren();
        }
        return true;
    }
};

export default AttributeNoInvokeRule;