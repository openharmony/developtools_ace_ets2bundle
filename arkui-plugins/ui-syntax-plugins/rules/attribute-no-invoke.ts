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
import { getCallee, isBuildInComponent } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';


class AttributeNoInvokeRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            cannotInitializePrivateVariables: `'{{componentNode}}' does not meet UI component syntax.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (arkts.isExpressionStatement(node) && !arkts.isIdentifier(node.expression)) {
            this.attributeNoInvoke(node);
        }
    }

    private attributeNoInvoke(node: arkts.AstNode): void {
        const childNode = node.getChildren();
        if (!Array.isArray(childNode) || childNode.length < 1) {
            return;
        }
        // Determine if the last chained property is an identifier
        if (!arkts.isMemberExpression(childNode[0]) || !arkts.isIdentifier(childNode[0].property)) {
            return;
        }
        if (!arkts.isCallExpression(childNode[0].object)) {
            return;
        }
        const callee = getCallee(childNode[0].object);

        // Determine whether it is a built-in component
        if (callee && isBuildInComponent(this.context, callee.name)) {
            this.report({
                node,
                message: this.messages.cannotInitializePrivateVariables,
                data: {
                    componentNode: node.dumpSrc(),
                },
            });
        }
    }
};

export default AttributeNoInvokeRule;