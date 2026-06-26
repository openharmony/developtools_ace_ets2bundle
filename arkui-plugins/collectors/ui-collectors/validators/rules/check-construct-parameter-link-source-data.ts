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
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkConstructParameterLinkSourceData = performanceLog(
    _checkConstructParameterLinkSourceData,
    getPerfName([0, 0, 0, 0, 0], 'checkConstructParameterLinkSourceData')
);

const MAX_LINK_SOURCE_DATA_NESTING_LEVEL = 2;

const LINK_SOURCE_DATA_MISMATCH = (propertyName: string): string =>
    `The type of the parent component's state variable initializing the '@Link' variable '${propertyName}' must match the '@Link' variable's declared type.`;

function _checkConstructParameterLinkSourceData(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.CallExpression
): void {
    const metadata = this.context ?? {};
    if (!metadata.structDeclInfo || !metadata.fromStructInfo) {
        return;
    }
    const fromAnnoInfo = metadata.fromStructInfo.annotationInfo;
    if (!fromAnnoInfo?.hasComponent && !fromAnnoInfo?.hasCustomDialog) {
        return;
    }
    metadata.structPropertyInfos?.forEach(([propertyPtr, propertyInfo]) => {
        if (!propertyPtr || !propertyInfo) {
            return;
        }
        if (!propertyInfo.annotationInfo?.hasLink) {
            return;
        }
        const property = arkts.unpackNonNullableNode<arkts.Property>(propertyPtr);
        if (!property.key || !arkts.isIdentifier(property.key)) {
            return;
        }
        const propertyName = property.key.name;
        if (!propertyName || !isInitFromMismatchSourceData(property)) {
            return;
        }
        this.report({
            node: property,
            level: LogType.ERROR,
            message: LINK_SOURCE_DATA_MISMATCH(propertyName),
        });
    });
}

function isInitFromMismatchSourceData(node: arkts.Property): boolean {
    if (!node.value) {
        return false;
    }
    let curNode: arkts.AstNode = node.value;
    let nestingLevel = 0;
    while (curNode) {
        if (arkts.isMemberExpression(curNode)) {
            curNode = curNode.object!;
            nestingLevel++;
        } else if (arkts.isTSNonNullExpression(curNode) && curNode.expr) {
            curNode = curNode.expr;
        } else if (arkts.isChainExpression(curNode) && curNode.expression) {
            curNode = curNode.expression;
        } else {
            break;
        }
    }
    return nestingLevel >= MAX_LINK_SOURCE_DATA_NESTING_LEVEL && !!curNode && arkts.isThisExpression(curNode);
}
