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
            if (!blockStatement || !arkts.isBlockStatement(blockStatement)) {
                return;
            }
            const buildNode = member.scriptFunction.id;
            if (!buildNode) {
                return;
            }
            const statements = blockStatement.statements;
            if (statements.length > STATEMENT_LENGTH) {
                // rule1: The 'build' method cannot have more than one root node.
                this.report({
                    node: buildNode,
                    message: entryDecoratorUsage ? this.messages.invalidEntryBuildRoot : this.messages.invalidBuildRoot,
                });
            }
            if (!statements.length || !entryDecoratorUsage) {
                return;
            }
            const expressionStatement = statements[0];
            if (!arkts.isExpressionStatement(expressionStatement)) {
                return;
            }
            const callExpression = expressionStatement.expression;
            if (!arkts.isCallExpression(callExpression)) {
                return;
            }
            let componentName: string = this.getComponentName(callExpression);
            let isContainer: boolean = this.isContainerComponent(componentName);
            // rule2: its 'build' function can have only one root node, which must be a container component.
            if (!isContainer) {
                this.report({
                    node: buildNode,
                    message: this.messages.invalidEntryBuildRoot,
                });
            }
        });
    }

    private isContainerComponent(componentName: string): boolean {
        const loadedContainerComponents = this.context.componentsInfo.containerComponents;
        if (!componentName || !loadedContainerComponents) {
            return false;
        }
        return loadedContainerComponents.includes(componentName);
    }

    private getComponentName(callExpression: arkts.CallExpression): string {
        if (
            arkts.isMemberExpression(callExpression.expression) &&
            arkts.isCallExpression(callExpression.expression.object) &&
            arkts.isIdentifier(callExpression.expression.object.expression)
        ) {
            return getIdentifierName(callExpression.expression.object.expression);
        } else if (arkts.isIdentifier(callExpression.expression)) {
            return getIdentifierName(callExpression.expression);
        }
        return '';
    }
}

export default BuildRootNodeRule;
