/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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
import { getIdentifierName, PresetDecorators, BUILD_NAME, findDecorator } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class BuilderParamDecoratorCheckRule extends AbstractUISyntaxRule {
    private structNameWithMultiplyBuilderParam: string[] = [];

    public setup(): Record<string, string> {
        return {
            onlyOneBuilderParamProperty: `In the trailing lambda case, '{{structName}}' must have one and only one property decorated with @BuilderParam, and its @BuilderParam expects no parameter.`,
        };
    }

    public beforeTransform(): void {
        this.structNameWithMultiplyBuilderParam = [];
    }

    public parsed(node: arkts.AstNode): void {
        this.getStructNameWithMultiplyBuilderParam(node);
        this.checkComponentInitialize(node);
    }

    private getStructNameWithMultiplyBuilderParam(
        node: arkts.AstNode,
    ): void {
        if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
            return;
        }
        node.getChildren().forEach((member) => {
            if (!arkts.isStructDeclaration(member) || !member.definition.ident) {
                return;
            }
            let count: number = 0;
            let structName: string = member.definition.ident.name ?? '';
            member.definition.body.forEach((item) => {
                if (!arkts.isClassProperty(item) || !item.key) {
                    return;
                }
                const builderParam = findDecorator(item, PresetDecorators.BUILDER_PARAM);

                if (builderParam) {
                    count++;
                }
            });
            if (count > 1) {
                this.structNameWithMultiplyBuilderParam.push(structName);
            }
        });
    }

    private isInBuild(node: arkts.AstNode): boolean {
        if (!node.parent) {
            return false;
        }
        let structNode = node.parent;
        while (!arkts.isMethodDefinition(structNode) || getIdentifierName(structNode.name) !== BUILD_NAME) {
            if (!structNode.parent) {
                return false;
            }
            structNode = structNode.parent;
        }
        return arkts.isMethodDefinition(structNode) && getIdentifierName(structNode.name) === BUILD_NAME;
    }

    private hasBlockStatement(node: arkts.AstNode): boolean {
        if (!node.parent) {
            return false;
        }
        let parentNode = node.parent;
        const siblings = parentNode.getChildren();
        if (!Array.isArray(siblings) || siblings.length < 2) {
            return false;
        }
        if (arkts.isStringLiteral(siblings[1]) && arkts.isBlockStatement(siblings[2])) {
            return true;
        }
        if (arkts.isBlockStatement(siblings[1])) {
            return true;
        }
        return false;
    }

    private checkComponentInitialize(
        node: arkts.AstNode,
    ): void {
        if (!node.parent) {
            return;
        }
        let parentNode: arkts.AstNode = node.parent;
        if (!arkts.isCallExpression(parentNode)) {
            return;
        }
        if (!arkts.isIdentifier(node) || !this.structNameWithMultiplyBuilderParam.includes(getIdentifierName(node))) {
            return;
        }
        if (!this.hasBlockStatement(node)) {
            return;
        }
        let structName: string = getIdentifierName(node);
        let structNode = node.parent;
        while (!arkts.isStructDeclaration(structNode)) {
            if (!structNode.parent) {
                return;
            }
            structNode = structNode.parent;
        }
        if (!this.isInBuild(node)) {
            return;
        }
        this.report({
            node: node,
            message: this.messages.onlyOneBuilderParamProperty,
            data: { structName },
        });
    }
}

export default BuilderParamDecoratorCheckRule;
