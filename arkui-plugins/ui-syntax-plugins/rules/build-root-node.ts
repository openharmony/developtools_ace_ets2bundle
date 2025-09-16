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
import { getIdentifierName, getAnnotationUsage, PresetDecorators, BUILD_NAME } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

const BUILD_COUNT_LIMIT: number = 1;

class BuildRootNodeRule extends AbstractUISyntaxRule {
    private customComponentNames: string[] = [];

    public setup(): Record<string, string> {
        return {
            invalidEntryBuildRoot: `In an '@Entry' decorated component, the 'build' function can have only one root node, which must be a container component.`,
            invalidBuildRoot: `The 'build' function can have only one root node.`,
        };
    }

    public beforeTransform(): void {
        this.customComponentNames = [];
    }

    public parsed(node: arkts.AstNode): void {
        if (arkts.nodeType(node) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
            this.getCustomComponentNames(node);
        }

        if (!arkts.isStructDeclaration(node)) {
            return;
        }
        const entryDecoratorUsage = getAnnotationUsage(node, PresetDecorators.ENTRY);
        node.definition.body.forEach((member) => {
            if (!arkts.isMethodDefinition(member) || getIdentifierName(member.name) !== BUILD_NAME) {
                return;
            }
            const blockStatement = member.scriptFunction.body;
            const buildNode = member.scriptFunction.id;
            if (!blockStatement || !arkts.isBlockStatement(blockStatement) || !buildNode) {
                return;
            }
            const statements = blockStatement.statements;
            const componentNames = this.getComponentNames([...statements]);

            if (componentNames.length > BUILD_COUNT_LIMIT) {
                this.report({
                    node: buildNode,
                    message: entryDecoratorUsage ? this.messages.invalidEntryBuildRoot : this.messages.invalidBuildRoot,
                });
                return;
            }

            if (entryDecoratorUsage && componentNames.length === BUILD_COUNT_LIMIT) {
                const componentName = componentNames[0];
                if (!this.isContainerComponent((componentName))) {
                    this.report({
                        node: buildNode,
                        message: this.messages.invalidEntryBuildRoot
                    });
                }
            }
        });
    }

    private getCustomComponentNames(node: arkts.AstNode): void {
        if (!arkts.isEtsScript(node)) {
            return;
        }

        node.statements.forEach((statement) => {
            if (arkts.isStructDeclaration(statement)) {
                const customComponentName = statement.definition.ident?.name;
                if (customComponentName) {
                    this.customComponentNames.push(customComponentName);
                }
            }
        });
    }

    private getComponentNames(statements: arkts.Statement[]): string[] {
        const componentNames: string[] = [];
        statements.forEach((statement) => {
            if (!arkts.isExpressionStatement(statement)) {
                return;
            }

            const componentName = this.getComponentName(statement);
            if (componentName) {
                componentNames.push(componentName);
            } 
        });
        return componentNames;
    }

    private getComponentName(node: arkts.ExpressionStatement): string | undefined {
        let current: arkts.AstNode | undefined = node.expression;
        while (current) {
            if (arkts.isIdentifier(current) && this.isComponent(getIdentifierName(current))) {
                return getIdentifierName(current);
            }

            if (arkts.isCallExpression(current) || arkts.isMemberExpression(current)) {
                current = current.getChildren()?.[0];
            } else {
                break;
            }
        }
    }

    private isContainerComponent(componentName: string): boolean {
        const loadedContainerComponents = this.context.componentsInfo?.containerComponents ?? [];
        return loadedContainerComponents.includes(componentName);
    }

    private isComponent(componentName: string): boolean {
        const atomicComponents = this.context.componentsInfo?.atomicComponents ?? [];
        const containerComponents = this.context.componentsInfo?.containerComponents ?? [];
        const loadedComponents = atomicComponents.concat(containerComponents).concat(this.customComponentNames);
        return loadedComponents.includes(componentName);
    }
}

export default BuildRootNodeRule;