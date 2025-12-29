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
import { getIdentifierName, BUILD_NAME, findDecorator, PresetDecorators, getClassPropertyName } from '../utils';

class NoVariablesChangeInBuildRule extends AbstractUISyntaxRule {
    private currentStructnode: arkts.StructDeclaration | undefined = undefined;

    public setup(): Record<string, string> {
        return {
            noVariablesChangeInBuild: `State variables cannot be modified during the build process.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        this.currentStructnode = arkts.isStructDeclaration(node) ? node : this.currentStructnode;
        this.handleCallExpressionArguments(node);
        this.handleTemplateLiterals(node);
        this.performVariableChangeChecks(node);
    }

    private handleCallExpressionArguments(node: arkts.AstNode): void {
        if (arkts.isCallExpression(node) && node.arguments && node.arguments.length > 0) {
            node.arguments.forEach((element) => {
                this.checkVariableChangeInGlobalBuilder(element);
            });
        }
    }

    private handleTemplateLiterals(node: arkts.AstNode): void {
        if (arkts.isCallExpression(node) && node.expression && arkts.isIdentifier(node.expression)) {
            node.arguments.forEach((member) => {
                if (arkts.nodeType(member) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TEMPLATE_LITERAL) {
                    return;
                }
                member.getChildren().forEach((item) => {
                    this.checkVariableChangeInGlobalBuilder(item);
                })
            });
        }
    }

    private performVariableChangeChecks(node: arkts.AstNode): void {
        if (arkts.isCallExpression(node) && node.arguments &&
            node.arguments.length && node.arguments.length !== 0) {
            node.arguments.forEach((element) => {
                this.checkVariableChange(element);
            });
        }
        if (!(arkts.isCallExpression(node) && node.expression && arkts.isIdentifier(node.expression)) ||
            this.isInStructBuilder(node)) {
            return;
        }
        node.arguments.forEach((member) => {
            if (arkts.nodeType(member) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TEMPLATE_LITERAL) {
                return;
            }
            member.getChildren().forEach((item) => {
                this.checkVariableChange(item);
            })
        });
    }

    private checkVariableChangeInGlobalBuilder(element: arkts.AstNode): void {
        const propertyName = this.getVariablePropertyName(element);
        const builderFunction = this.getBuilderFunctionName(element);
        if (builderFunction && this.checkIsVariableInGlobalBuilder(builderFunction, propertyName)) {
            this.report({
                node: element,
                message: this.messages.noVariablesChangeInBuild,
            });
        }
    }

    private isInStructBuilder(node: arkts.AstNode): boolean {
        while (!(arkts.isMethodDefinition(node) && getIdentifierName(node.name) === BUILD_NAME) ||
            !(arkts.isFunctionDeclaration(node) && findDecorator(node, PresetDecorators.BUILDER))) {
            if (!node.parent || arkts.isStructDeclaration(node) || arkts.isClassDeclaration(node)) {
                return false;
            }
            node = node.parent;
        }
        while (!arkts.isStructDeclaration(node)) {
            if (!node.parent) {
                return false;
            }
            node = node.parent;
        }
        return true;
    }

    private getBuilderFunctionName(node: arkts.AstNode): arkts.FunctionDeclaration | undefined {
        while (!(arkts.isFunctionDeclaration(node) && findDecorator(node, PresetDecorators.BUILDER))) {
            if (!node.parent || arkts.isStructDeclaration(node) || arkts.isClassDeclaration(node)) {
                return undefined;
            }
            node = node.parent;
        }
        return node;
    }

    private checkIsVariableInGlobalBuilder(node: arkts.AstNode, propertyName: string | undefined): boolean {
        if (!arkts.isFunctionDeclaration(node) || !findDecorator(node, PresetDecorators.BUILDER)) {
            return false;
        }
        if (!node.body || !arkts.isBlockStatement(node.body)) {
            return false;
        }
        for (const element of node.body.statements) {
            if (!arkts.isVariableDeclaration(element)) {
                continue;
            }
            for (const item of element.declarators) {
                if(this.findMutableVariable(item, propertyName)) {
                    return true;
                }
            }
        }
        return false;
    }

    private findMutableVariable(item: arkts.AstNode, propertyName: string | undefined): boolean {
        if (!arkts.isVariableDeclarator(item) ||
            !arkts.isIdentifier(item.name)) {
            return false;
        }
        const identifierName = getIdentifierName(item.name);
        const typeAnnotation = item.name.typeAnnotation;
        if (!typeAnnotation || !arkts.isETSTypeReference(typeAnnotation)) {
            return false;
        }
        const part = typeAnnotation.part;
        if (
            !part ||
            !arkts.isETSTypeReferencePart(part) ||
            !part.name ||
            !arkts.isIdentifier(part.name)
        ) {
            return false;
        }
        const typeName = getIdentifierName(part.name);
        const targetVariableType = 'MutableVariable';
        if (targetVariableType === typeName && propertyName === identifierName) {
            return true;
        }
        return false;
    }

    private getVariablePropertyName(item: arkts.AstNode): string | undefined {
        if (!arkts.isAssignmentExpression(item) &&
            arkts.nodeType(item) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_UPDATE_EXPRESSION) {
            return undefined;
        }
        const propertyNode = item.left ? item.left : item.argument;
        if (!propertyNode || !arkts.isMemberExpression(propertyNode)) {
            return undefined;
        }
        if (arkts.isIdentifier(propertyNode.object)) {
            return getIdentifierName(propertyNode.object);
        } else if (arkts.isIdentifier(propertyNode.property)) {
            return getIdentifierName(propertyNode.property);
        }
        return undefined;
    }

    private checkVariableChange(item: arkts.AstNode): void {
        if (!arkts.isAssignmentExpression(item) &&
            arkts.nodeType(item) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_UPDATE_EXPRESSION) {
            return;
        }
        const propertyNode = item.left ? item.left : item.argument;
        if (!propertyNode || !arkts.isMemberExpression(propertyNode) ||
            !propertyNode.property || !arkts.isIdentifier(propertyNode.property)) {
            return;
        }
        const propertyName = getIdentifierName(propertyNode.property);
        if (!this.currentStructnode) {
            return;
        }
        this.currentStructnode.definition.body.forEach((expr) => {
            if (!arkts.isClassProperty(expr)) {
                return;
            }
            const classPropertyName = getClassPropertyName(expr);
            if (!classPropertyName || classPropertyName !== propertyName || !expr.annotations.length) {
                return;
            }
            this.report({
                node: item,
                message: this.messages.noVariablesChangeInBuild,
            })
        })
    }
};

export default NoVariablesChangeInBuildRule;