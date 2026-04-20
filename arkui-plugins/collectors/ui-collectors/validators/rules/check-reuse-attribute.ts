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
import { CallInfo } from '../../records';
import { LogType } from '../../../../common/predefines';
import { createSuggestion, getPositionRangeFromNode } from '../../../../common/log-collector';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkReuseAttribute = performanceLog(
    _checkReuseAttribute,
    getPerfName([0, 0, 0, 0, 0], 'checkReuseAttribute')
);

const ReuseConstants = {
    REUSE: 'reuse',
    REUSE_ID: 'reuseId',
};

const INVALID_REUSE_USAGE = `The reuse attribute is only applicable to custom components decorated with both @ComponentV2 and @ReusableV2.`;
const INVALID_REUSE_ID_USAGE = `The reuseId attribute is not applicable to custom components decorated with both @ComponentV2 and @ReusableV2.`;

const CHANGE_REUSE_TO_REUSE_ID = `Change reuse to reuseId`;
const CHANGE_REUSE_ID_TO_REUSE = `Change reuseId to reuse`;

/**
 * 校验规则：用于验证`reuse` 和`reuseId`属性时需要遵循的具体约束和条件
 * 1. `reuse` 属性只能用于同时使用了 `@ComponentV2` 和 `@ReusableV2` 装饰器的自定义组件。
 * 2. `reuseId` 属性不能用于同时使用了 `@ComponentV2` 和 `@ReusableV2` 装饰器的自定义组件。
 *
 * 校验等级：error
 */
function _checkReuseAttribute(this: BaseValidator<arkts.CallExpression, CallInfo>, node: arkts.CallExpression): void {
    const metadata = this.context ?? {};
    if (!metadata.structDeclInfo || !metadata.fromStructInfo) {
        return;
    }
    const decoratedNode = extractReusePropertyNode(node);
    if (!decoratedNode) {
        return;
    }
    const structDefinition = arkts.classByPeer<arkts.ClassDefinition>(metadata.structDeclInfo.definitionPtr);
    if (!structDefinition || !structDefinition.parent || !arkts.isClassDeclaration(structDefinition.parent)) {
        return;
    }
    checkReuseAttributeRule.bind(this)(metadata, node, decoratedNode);
}

function extractReusePropertyNode(node: arkts.CallExpression): arkts.Identifier | undefined {
    if (
        !arkts.isMemberExpression(node.expression) ||
        !node.expression.property ||
        !arkts.isCallExpression(node.expression.object)
    ) {
        return undefined;
    }
    const property = node.expression.property;
    return arkts.isIdentifier(property) ? property : undefined;
}

function checkReuseAttributeRule(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    metadata: CallInfo,
    node: arkts.CallExpression,
    decoratedNode: arkts.Identifier
): void {
    const annoInfo = metadata.structDeclInfo?.annotationInfo;
    const hasComponentV2AndReusableV2 = !!annoInfo?.hasComponentV2 && !!annoInfo.hasReusableV2;
    if (decoratedNode.name === ReuseConstants.REUSE && !hasComponentV2AndReusableV2) {
        reportInvalidReuseUsage.bind(this)(node, decoratedNode);
    }
    if (decoratedNode.name === ReuseConstants.REUSE_ID && hasComponentV2AndReusableV2) {
        reportInvalidReuseIdUsage.bind(this)(node, decoratedNode);
    }
}

function reportInvalidReuseUsage(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.AstNode,
    decoratedNode: arkts.AstNode
): void {
    this.report({
        node: node,
        level: LogType.ERROR,
        message: INVALID_REUSE_USAGE,
        suggestions: [createSuggestion(
            ReuseConstants.REUSE_ID,
            ...getPositionRangeFromNode(decoratedNode),
            CHANGE_REUSE_TO_REUSE_ID
        )],
    });
}

function reportInvalidReuseIdUsage(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.AstNode,
    decoratedNode: arkts.AstNode
): void {
    this.report({
        node: node,
        level: LogType.ERROR,
        message: INVALID_REUSE_ID_USAGE,
        suggestions: [createSuggestion(
            ReuseConstants.REUSE,
            ...getPositionRangeFromNode(decoratedNode),
            CHANGE_REUSE_ID_TO_REUSE
        )],
    });
}
