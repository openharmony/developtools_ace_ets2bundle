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
import {
    getIdentifierName,
    isAtomicComponent,
    isBuildInComponent,
    isSingleChildComponent,
    listToString,
    SINGLE_CHILD_COMPONENT
} from '../utils';
import { AbstractUISyntaxRule, UISyntaxRuleLevel } from './ui-syntax-rule';

const renderingConrtrolComponents: Set<string> = new Set<string>([
    'ForEach',
    'LazyForEach',
    'Repeat'
]);

class NestedRelationshipRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            noChildComponent: `The component '{{componentName}}' can't have any child.`,
            singleChildComponent: `The '{{componentName}}' component can have only one child component.`,
            delegateChildrenComponentChildren: `The '{{childComponentName}}' component cannot be a child component of the {{componentName}} component.`,
            delegateChildrenComponentParent: `The component '{{parentComponentName}}' can only have the child component '{{childComponentList}}'.`,
            delegateParentComponent: `The '{{componentName}}' component can only be nested in the '{{parentComponentList}}' parent component.`,
        };
    }
    public parsed(node: arkts.StructDeclaration): void {
        this.checkValidParentComponent(node);
        this.checkValidChildComponent(node);
        this.checkSingleChildComponent(node);
        this.checkNoChildComponent(node);
    }

    private checkValidParentComponent(node: arkts.AstNode): void {
        // Check if the node is an identifier and if there are any restrictions on the parent component
        if (!arkts.isIdentifier(node) || !this.context.componentsInfo) {
            return;
        }
        const componentName: string = getIdentifierName(node);
        if (
            !this.context.componentsInfo.validParentComponent.has(componentName) ||
            !node.parent ||
            !node.parent.parent
        ) {
            return;
        }
        let curNode = node.parent.parent;
        let foundRenderingComponent: boolean = false;
        while (
            !arkts.isCallExpression(curNode) ||
            !arkts.isIdentifier(curNode.expression) ||
            !isBuildInComponent(this.context, curNode.expression.name)
        ) {
            if (!curNode.parent) {
                return;
            }
            if (
                arkts.isCallExpression(curNode) &&
                arkts.isIdentifier(curNode.expression) &&
                renderingConrtrolComponents.has(curNode.expression.name)
            ) {
                foundRenderingComponent = true;
            }
            curNode = curNode.parent;
        }
        const parentComponentName = curNode.expression.name;
        if (this.context.componentsInfo.validParentComponent.get(componentName)!.includes(parentComponentName)) {
            return;
        }

        const parentComponentListArray: string[] = this.context.componentsInfo.validParentComponent.get(componentName)!;
        if (foundRenderingComponent) {
            this.reportDelegateParentComponent(node, 'warn', componentName, parentComponentListArray);
        } else {
            this.reportDelegateParentComponent(node, 'error', componentName, parentComponentListArray);
        }
    }

    private reportDelegateParentComponent(
        parentNode: arkts.Identifier,
        level: UISyntaxRuleLevel,
        componentName: string,
        parentComponentList: string[]
    ): void {
        this.report({
            node: parentNode,
            level: level,
            message: this.messages.delegateParentComponent,
            data: {
                componentName: componentName,
                parentComponentList: listToString(parentComponentList),
            },
        });
    }

    private checkValidChildComponent(node: arkts.AstNode): void {
        // Check whether the node is an identifier and whether there are restrictions on subcomponents
        if (!arkts.isIdentifier(node) || !this.context.componentsInfo) {
            return;
        }
        const componentName: string = getIdentifierName(node);
        if (!this.context.componentsInfo.validChildComponent.has(componentName) || !node.parent ||
            !arkts.isCallExpression(node.parent) || !arkts.isIdentifier(node.parent.expression)) {
            return;
        }
        let parentNode = node.parent;
        const childComponentListArray = this.context.componentsInfo.validChildComponent.get(componentName);
        if (!childComponentListArray) {
            return;
        }
        let reportFlag: boolean = false;
        // If the BlockStatement contains a child component that should not exist under the component, an error will be reported
        parentNode.getChildren().forEach(member => {
            if (!arkts.isBlockStatement(member)) {
                return;
            }
            member.statements.forEach(statement => {
                const childComponentNode = this.findChildComponentNode(statement);
                if (!childComponentNode) {
                    return;
                }
                const childComponentName = getIdentifierName(childComponentNode);
                if (childComponentListArray.includes(childComponentName) ||
                    !isBuildInComponent(this.context, childComponentName)) {
                    return;
                }
                reportFlag = true;
                this.reportDelegateChildrenComponentChildren(childComponentNode, childComponentName, componentName);
            });
        });
        if (!reportFlag) {
            return;
        }
        this.report({
            node: node,
            message: this.messages.delegateChildrenComponentParent,
            data: {
                parentComponentName: componentName,
                childComponentList: listToString(childComponentListArray),
            },
        });
    }

    private findChildComponentNode(stmt: arkts.AstNode): arkts.Identifier | undefined {
        if (
            !arkts.isExpressionStatement(stmt) ||
            !stmt.expression ||
            !arkts.isCallExpression(stmt.expression) ||
            !stmt.expression.expression
        ) {
            return undefined;
        }
        if (arkts.isIdentifier(stmt.expression.expression)) {
            return stmt.expression.expression;
        }
        if (
            arkts.isMemberExpression(stmt.expression.expression) &&
            arkts.isCallExpression(stmt.expression.expression.object) &&
            arkts.isIdentifier(stmt.expression.expression.object.expression)
        ) {
            return stmt.expression.expression.object.expression;
        }
        return undefined;
    }

    private reportDelegateChildrenComponentChildren(
        parentNode: arkts.Identifier,
        childComponentName: string,
        componentName: string
    ): void {
        this.report({
            node: parentNode,
            message: this.messages.delegateChildrenComponentChildren,
            data: {
                childComponentName: childComponentName,
                componentName: componentName,
            },
        });
    }

    private checkSingleChildComponent(node: arkts.AstNode): void {
        // Check whether the current node is an identifier and a single subcomponent container
        if (!arkts.isIdentifier(node)) {
            return;
        }
        const componentName: string = getIdentifierName(node);
        if (!isSingleChildComponent(this.context, componentName) || !node.parent) {
            return;
        }
        const parentNode = node.parent;
        if (!arkts.isCallExpression(parentNode)) {
            return;
        }
        // If there is more than one subcomponent in the BlockStatement, an error is reported
        parentNode.getChildren().forEach(member => {
            if (!arkts.isBlockStatement(member)) {
                return;
            }
            if (member.statements.length > SINGLE_CHILD_COMPONENT) {
                this.report({
                    node: node,
                    message: this.messages.singleChildComponent,
                    data: { componentName: componentName }
                });
            }
        });
    }

    private checkNoChildComponent(node: arkts.AstNode): void {
        // Check whether the current node is an identifier and an atomic component
        if (!arkts.isIdentifier(node)) {
            return;
        }
        const componentName: string = getIdentifierName(node);
        if (!isAtomicComponent(this.context, componentName) || !node.parent) {
            return;
        }
        let parentNode = node.parent;
        if (!arkts.isCallExpression(parentNode)) {
            return;
        }
        // If there are child components in arguments, an error will be reported
        parentNode.getChildren().forEach(member => {
            if (!arkts.isBlockStatement(member)) {
                return;
            }
            if (member.statements.length > 0) {
                this.report({
                    node: node,
                    message: this.messages.noChildComponent,
                    data: { componentName: componentName }
                });
            }
        });
    }
}

export default NestedRelationshipRule;