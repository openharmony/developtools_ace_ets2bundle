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
import { PresetDecorators, getAnnotationUsage, ReuseConstants } from '../utils';

class ReuseAttributeCheckRule extends AbstractUISyntaxRule {
    private reusableV2ComponentV2Struct: string[] = [];

    public setup(): Record<string, string> {
        return {
            invalidReuseUsage: `The reuse attribute is only applicable to custom components decorated with both @ComponentV2 and @ReusableV2.`,
            invalidReuseIdUsage: `The reuseId attribute is not applicable to custom components decorated with both @ComponentV2 and @ReusableV2.`,
        };
    }

    public beforeTransform(): void {
        this.reusableV2ComponentV2Struct = [];
    }

    public parsed(node: arkts.AstNode): void {
        // Check whether the type is "Program"
        if (arkts.nodeType(node) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
            this.findStructsWithReusableAndComponentV2(node);
        }
        if (arkts.isMemberExpression(node)) {
            this.validateReuseOrReuseIdUsage(node);
        }
    }

    private findStructsWithReusableAndComponentV2(node: arkts.AstNode): void {
        //Go through all the children of Program
        for (const childNode of node.getChildren()) {
            // Check whether the type is struct
            if (!arkts.isETSStructDeclaration(childNode)) {
                continue;
            }
            // Check that the current component has @ComponentV2 and @ReusableV2 decorators
            const reusableV2Decorator = getAnnotationUsage(childNode, PresetDecorators.REUSABLE_V2);
            const componentV2Decorator = getAnnotationUsage(childNode, PresetDecorators.COMPONENT_V2);
            if (reusableV2Decorator && componentV2Decorator) {
                const struceName = childNode.definition?.ident?.name ?? '';
                this.reusableV2ComponentV2Struct.push(struceName);
            }
        }
    }

    private validateReuseOrReuseIdUsage(
        node: arkts.MemberExpression
    ): void {
        const structNode = node.object;
        // Gets the reuse or reuseId attribute
        const decoratedNode = node.property;
        if (arkts.isCallExpression(structNode)) {
            const nodeExpression = structNode.callee;
            if (arkts.isIdentifier(nodeExpression) && arkts.isIdentifier(decoratedNode)) {
                if (decoratedNode.name === ReuseConstants.REUSE &&
                    !this.reusableV2ComponentV2Struct.includes(nodeExpression.name)) {
                    this.reportInvalidReuseUsage(node, decoratedNode);
                }
                else if (decoratedNode.name === ReuseConstants.REUSE_ID &&
                    this.reusableV2ComponentV2Struct.includes(nodeExpression.name)) {
                    this.reportInvalidReuseIdUsage(node, decoratedNode);
                }
            }
        }
    }

    private reportInvalidReuseUsage(
        node: arkts.AstNode,
        structNode: arkts.AstNode,
    ): void {
        this.report({
            node: node,
            message: this.messages.invalidReuseUsage,
            fix: () => {
                const startPosition = structNode.startPosition;
                const endPosition = structNode.endPosition;
                return {
                    title: 'Change reuse to reuseId',
                    range: [startPosition, endPosition],
                    code: ReuseConstants.REUSE_ID,
                };
            },
        });
    }

    private reportInvalidReuseIdUsage(
        node: arkts.AstNode,
        structNode: arkts.AstNode,
    ): void {
        this.report({
            node: node,
            message: this.messages.invalidReuseIdUsage,
            fix: () => {
                const startPosition = structNode.startPosition;
                const endPosition = structNode.endPosition;
                return {
                    title: 'Change reuseId to reuse',
                    range: [startPosition, endPosition],
                    code: ReuseConstants.REUSE,
                };
            },
        });
    }
};

export default ReuseAttributeCheckRule;