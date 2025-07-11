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

const STATEMENT_LENGTH: number = 1;
const BUILD_COUNT_LIMIT: number = 1;

class BuildRootNodeRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            invalidEntryBuildRoot: `In an '@Entry' decorated component, the 'build' function can have only one root node, which must be a container component.`,
            invalidBuildRoot: `The 'build' function can have only one root node.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
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
            let buildCount = 0;
            // rule1: The 'build' method cannot have more than one root node.
            if (statements.length > STATEMENT_LENGTH) {
                if (!this.isBuildOneRoot(statements, buildCount)) {
                    this.report({
                        node: buildNode,
                        message: entryDecoratorUsage ? this.messages.invalidEntryBuildRoot : this.messages.invalidBuildRoot,
                    });
                }
            }
            // rule2: its 'build' function can have only one root node, which must be a container component.
            if (!statements.length || !entryDecoratorUsage) {
                return;
            }
            this.validateContainerInBuild(statements, buildNode);
        });
    }

    private isBuildOneRoot(
        statements: readonly arkts.Statement[],
        buildCount: number
    ): boolean {
        statements.forEach(statement => {
            if (!arkts.isExpressionStatement(statement)) {
                return;
            }
            if (!statement.expression) {
                return;
            }
            const componentName = this.getComponentName(statement.expression);
            if (componentName && componentName !== 'hilog') {
                buildCount++;
            }
        });
        return buildCount <= BUILD_COUNT_LIMIT;
    }

    private validateContainerInBuild(statements: readonly arkts.Statement[], buildNode: arkts.Identifier): void {
        const expressionStatement = statements[0];
        if (!arkts.isExpressionStatement(expressionStatement)) {
            return;
        }
        const callExpression = expressionStatement.expression;
        if (!arkts.isCallExpression(callExpression)) {
            return;
        }
        let componentName = this.getComponentName(callExpression);
        if (!componentName) {
            return;
        }
        let isContainer = this.isContainerComponent(componentName);
        if (!isContainer) {
            this.report({
                node: buildNode,
                message: this.messages.invalidEntryBuildRoot,
            });
        }
    }

    private isContainerComponent(componentName: string): boolean {
        const loadedContainerComponents = this.context.componentsInfo.containerComponents;
        if (!componentName || !loadedContainerComponents) {
            return false;
        }
        return loadedContainerComponents.includes(componentName);
    }

    private getComponentName(node: arkts.AstNode): string | undefined {
        let children = node.getChildren();
        let componentName: string | undefined;

        while (true) {
            if (!children || children.length === 0) {
                return undefined;
            }

            const firstChild = children[0];

            if (arkts.isIdentifier(firstChild)) {
                componentName = getIdentifierName(firstChild);
                return componentName;
            }

            if (!arkts.isMemberExpression(firstChild) && !arkts.isCallExpression(firstChild)) {
                return undefined;
            }

            children = firstChild.getChildren();
        }
    }
}


export default BuildRootNodeRule;
