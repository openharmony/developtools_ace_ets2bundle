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
import { StructMethodInfo } from '../../records';
import { LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';
import { MetaDataCollector } from '../../../../common/metadata-collector';
import { UIComponents } from '../../../../common/plugin-context';

export const checkBuildRootNode = performanceLog(
    _checkBuildRootNode,
    getPerfName([0, 0, 0, 0, 0], 'checkBuildRootNode')
);

const BUILD_NAME = 'build';
const BUILD_COUNT_LIMIT: number = 1;
const INVALID_ENTRY_BUILD_ROOT = `In an '@Entry' decorated component, the 'build' function can have only one root node, which must be a container component.`;
const INVALID_BUILD_ROOT = `The 'build' function can have only one root node.`;

/**
 * 校验规则：用于验证组件中 `build()` 方法的结构是否符合规范。
 * 1. 组件的 `build()` 方法必须只包含一个根节点。
 * 2. 如果组件被 `@Entry` 装饰器修饰：
 *      - `build()` 方法中必须只有一个根节点；
 *      - 该根节点必须是一个容器组件（如：`Column`, `Row`, `Stack`, `Scroll` 等）。
 * 3. `build()`内使用`console.log()`或`hilog.info()`，打印日志的方法不被计算为根节点。
 *
 * 校验等级：error
 */
function _checkBuildRootNode(
    this: BaseValidator<arkts.MethodDefinition, StructMethodInfo>,
    node: arkts.MethodDefinition
): void {
    const metadata = this.context ?? {};
    const hasEntryInStruct = !!metadata.structInfo?.annotationInfo?.hasEntry;

    if (metadata.name !== BUILD_NAME) {
        return;
    }
    const blockStatement = node.function.body;
    const buildNode = node.function.id;
    if (!blockStatement || !arkts.isBlockStatement(blockStatement) || !buildNode) {
        return;
    }
    const statements = blockStatement.statements;
    const rootNodeNames: string[] = [];
    const componentsInfo = MetaDataCollector.getInstance().componentsInfo;
    recordRootNode.bind(this)(statements, rootNodeNames, componentsInfo);
    if (rootNodeNames.length > BUILD_COUNT_LIMIT) {
        this.report({
            node: node,
            level: LogType.ERROR,
            message: hasEntryInStruct ? INVALID_ENTRY_BUILD_ROOT : INVALID_BUILD_ROOT,
        });
    } else if (rootNodeNames.length === BUILD_COUNT_LIMIT && hasEntryInStruct) {
        validateContainerInBuild.bind(this)(buildNode, rootNodeNames, componentsInfo);
    }
}

function recordRootNode(
    this: BaseValidator<arkts.MethodDefinition, StructMethodInfo>,
    statements: readonly arkts.Statement[],
    rootNodeNames: string[],
    componentsInfo?: UIComponents
): void {
    statements.forEach((statement) => {
        if (!arkts.isExpressionStatement(statement)) {
            return;
        }
        if (!statement.expression) {
            return;
        }
        const componentName = getComponentName(statement.expression);
        if (!componentName) {
            return;
        }
        const isBuiltInComponent =
            componentsInfo?.atomicComponents.includes(componentName) ||
            componentsInfo?.containerComponents.includes(componentName);
        if (isBuiltInComponent) {
            rootNodeNames.push(componentName);
        }
    });
}

function validateContainerInBuild(
    this: BaseValidator<arkts.MethodDefinition, StructMethodInfo>,
    buildNode: arkts.Identifier,
    rootNodeNames: string[],
    componentsInfo?: UIComponents
): void {
    const componentName = rootNodeNames[0];
    let isContainer = componentsInfo?.containerComponents.includes(componentName);
    if (!isContainer) {
        this.report({
            node: buildNode,
            level: LogType.ERROR,
            message: INVALID_ENTRY_BUILD_ROOT,
        });
    }
}

function getComponentName(node: arkts.AstNode): string | undefined {
    let children = node.getChildren();
    let componentName: string | undefined;

    while (true) {
        if (!children || children.length === 0) {
            return undefined;
        }

        const firstChild = children[0];
        if (arkts.isIdentifier(firstChild)) {
            componentName = firstChild.name;
            return componentName;
        }

        if (!arkts.isMemberExpression(firstChild) && !arkts.isCallExpression(firstChild)) {
            return undefined;
        }
        children = firstChild.getChildren();
    }
}
