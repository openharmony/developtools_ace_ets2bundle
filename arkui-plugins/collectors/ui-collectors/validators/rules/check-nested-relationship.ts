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
import { BaseValidator } from '../base';
import { isBuiltInDeclaration } from '../utils';
import { CallInfo } from '../../records';
import { LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';
import { MetaDataCollector } from '../../../../common/metadata-collector';

export const checkNestedRelationship = performanceLog(
    _checkNestedRelationship,
    getPerfName([0, 0, 0, 0, 0], 'checkNestedRelationship')
);

const SINGLE_CHILD_COMPONENT = 1;

const renderingControlComponents: Set<string> = new Set<string>(['ForEach', 'LazyForEach', 'Repeat']);

/**
 * 校验规则：
 *  1. 原子组件不可包含子组件；
 *  2. 单子组件最多允许包含一个组件；
 *  3. 特定组件的父组件必须是限定组件；
 *  4. 特定组件的子组件必须是限定组件。
 *
 * 校验等级：error
 */
function _checkNestedRelationship(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.CallExpression
): void {
    const metadata = this.context ?? {};
    if (!metadata.annotationInfo?.hasComponentBuilder || !!metadata.structDeclInfo) {
        return;
    }
    const componentsInfo = MetaDataCollector.getInstance().componentsInfo;
    if (!componentsInfo || !metadata.declName || !arkts.isIdentifier(node.callee)) {
        return;
    }

    // Check if there are any restrictions on the node parent component
    if (componentsInfo.validParentComponent.has(metadata.declName)) {
        const parentComponentNames = componentsInfo.validParentComponent.get(metadata.declName)!;
        checkValidParentComponent.bind(this)(node.callee, metadata.declName, parentComponentNames);
    }
    // Check if the node's sub components have limitations
    if (componentsInfo.validChildComponent.has(metadata.declName)) {
        const childComponentNames = componentsInfo.validChildComponent.get(metadata.declName)!;
        checkValidChildComponent.bind(this)(node.callee, metadata.declName, childComponentNames);
    }
    // Check whether the current node is a single subComponent container
    if (componentsInfo.singleChildComponents.includes(metadata.declName)) {
        checkSingleChildComponent.bind(this)(node.callee, metadata.declName);
    }
    // Check whether the current node is an atomic component
    if (componentsInfo.atomicComponents.includes(metadata.declName)) {
        checkNoChildComponent.bind(this)(node.callee, metadata.declName);
    }
}

function checkValidParentComponent(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    componentIdentifier: arkts.Identifier,
    componentName: string,
    parentComponentNames: string[]
): void {
    if (!componentIdentifier.parent || !componentIdentifier.parent.parent) {
        return;
    }
    let curNode = componentIdentifier.parent.parent;
    let foundRenderingComponent: boolean = false;
    while (
        !arkts.isCallExpression(curNode) ||
        !arkts.isIdentifier(curNode.callee) ||
        !isBuiltInComponent.bind(this)(curNode.callee)
    ) {
        if (!curNode.parent) {
            return;
        }
        if (
            arkts.isCallExpression(curNode) &&
            arkts.isIdentifier(curNode.callee) &&
            renderingControlComponents.has(curNode.callee.name)
        ) {
            foundRenderingComponent = true;
        }
        curNode = curNode.parent;
    }
    // If the parent component of the current component is not within the valid range, an error is reported
    const parentComponentName = curNode.callee.name;
    if (parentComponentNames.includes(parentComponentName)) {
        return;
    }

    if (foundRenderingComponent) {
        this.report({
            node: componentIdentifier,
            level: LogType.WARN,
            message: `The '${componentName}' component can only be nested in the '${listToString(
                parentComponentNames
            )}' parent component.`,
        });
    } else {
        this.report({
            node: componentIdentifier,
            level: LogType.ERROR,
            message: `The '${componentName}' component can only be nested in the '${listToString(
                parentComponentNames
            )}' parent component.`,
        });
    }
}

function checkValidChildComponent(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    componentIdentifier: arkts.Identifier,
    componentName: string,
    childComponentNames: string[]
): void {
    if (!componentIdentifier.parent || !componentIdentifier.parent.parent) {
        return;
    }
    let parentNode = componentIdentifier.parent;

    if (!arkts.isCallExpression(parentNode) || !arkts.isIdentifier(parentNode.callee)) {
        return;
    }
    let reportFlag: boolean = false;
    // If the BlockStatement contains a child component that should not exist under the component, an error will be reported
    parentNode.arguments.forEach((argument) => {
        if (
            !arkts.isArrowFunctionExpression(argument) ||
            !argument.function.body ||
            !arkts.isBlockStatement(argument.function.body)
        ) {
            return;
        }
        argument.function.body.statements.forEach((statement) => {
            const childComponentNode = findChildComponentNode(statement);
            if (!childComponentNode) {
                return;
            }
            const childComponentName = childComponentNode.name;
            if (
                childComponentNames.includes(childComponentName) ||
                !isBuiltInComponent.bind(this)(childComponentNode) ||
                renderingControlComponents.has(childComponentName)
            ) {
                return;
            }
            reportFlag = true;
            reportDelegateChildrenComponentChildren.bind(this)(childComponentNode, childComponentName, componentName);
        });
    });
    if (reportFlag) {
        this.report({
            node: componentIdentifier,
            level: LogType.ERROR,
            message: `The component '${componentName}' can only have the child component '${listToString(
                childComponentNames
            )}'.`,
        });
    }
}

function findChildComponentNode(stmt: arkts.AstNode): arkts.Identifier | undefined {
    if (
        !arkts.isExpressionStatement(stmt) ||
        !stmt.expression ||
        !arkts.isCallExpression(stmt.expression) ||
        !stmt.expression.callee
    ) {
        return undefined;
    }
    if (arkts.isIdentifier(stmt.expression.callee)) {
        return stmt.expression.callee;
    }
    if (
        arkts.isMemberExpression(stmt.expression.callee) &&
        arkts.isCallExpression(stmt.expression.callee.object) &&
        arkts.isIdentifier(stmt.expression.callee.object.callee)
    ) {
        return stmt.expression.callee.object.callee;
    }
    return undefined;
}

function reportDelegateChildrenComponentChildren(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    childComponentNode: arkts.Identifier,
    childComponentName: string,
    componentName: string
): void {
    this.report({
        node: childComponentNode,
        level: LogType.ERROR,
        message: `The '${childComponentName}' component cannot be a child component of the ${componentName} component.`,
    });
}

function checkSingleChildComponent(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    componentIdentifier: arkts.Identifier,
    componentName: string
): void {
    if (!componentIdentifier.parent) {
        return;
    }
    const parentNode = componentIdentifier.parent;
    if (!arkts.isCallExpression(parentNode)) {
        return;
    }
    // If there is more than one subComponent in the BlockStatement, an error is reported
    parentNode.arguments.forEach((argument) => {
        if (
            !arkts.isArrowFunctionExpression(argument) ||
            !argument.function.body ||
            !arkts.isBlockStatement(argument.function.body)
        ) {
            return;
        }
        if (argument.function.body.statements.length <= SINGLE_CHILD_COMPONENT) {
            return;
        }
        this.report({
            node: componentIdentifier,
            level: LogType.ERROR,
            message: `The '${componentName}' component can have only one child component.`,
        });
    });
}

function checkNoChildComponent(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    componentIdentifier: arkts.Identifier,
    componentName: string
): void {
    if (!componentIdentifier.parent) {
        return;
    }
    let parentNode = componentIdentifier.parent;
    if (!arkts.isCallExpression(parentNode)) {
        return;
    }
    // If there are child components in arguments, an error will be reported
    parentNode.arguments.forEach((argument) => {
        if (
            !arkts.isArrowFunctionExpression(argument) ||
            !argument.function.body ||
            !arkts.isBlockStatement(argument.function.body)
        ) {
            return;
        }
        if (argument.function.body.statements.length === 0) {
            return;
        }
        this.report({
            node: componentIdentifier,
            level: LogType.ERROR,
            message: `The component '${componentName}' can't have any child.`,
        });
    });
}

function isBuiltInComponent(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    componentIdentifier: arkts.Identifier
): boolean {
    const componentsInfo = MetaDataCollector.getInstance().componentsInfo;
    if (!componentsInfo) {
        return false;
    }
    if (!isBuiltInDeclaration(componentIdentifier)) {
        return false;
    }
    return (
        componentsInfo.containerComponents.includes(componentIdentifier.name) ||
        componentsInfo.atomicComponents.includes(componentIdentifier.name)
    );
}

function listToString(strList: string[]): string {
    return strList.length > 1 ? `${strList.join(',')}` : strList.join('');
}
