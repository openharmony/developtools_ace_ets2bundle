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
import { checkIsCallFromInnerComponentOrExtendFromInfo, checkIsValidChainingDataSource } from '../utils';
import { CallInfo } from '../../records';
import { ChainingCallDataSource } from '../../chaining-call-data-source';
import { LogType } from '../../../../common/predefines';
import { createSuggestion, getPositionRangeFromNode } from '../../../../common/log-collector';
import { getPerfName, performanceLog } from '../../../../common/debug';
import { MetaDataCollector } from '../../../../common/metadata-collector';
import { ConsistentResourceMap } from '../../../../common/plugin-context';

export const checkUIConsistent = performanceLog(_checkUIConsistent, getPerfName([0, 0, 0, 0, 0], 'checkUIConsistent'));

// The attributes of the VP unit must be used
const checkVpProperties = ['padding'];
// The property of VP/PX units must be used
const checkVpAndPxProperties = ['borderWidth', 'borderRadius', 'outlineWidth', 'outlineRadius'];
// The types of colors allowed
const colorUnionTypes = ['Color', 'Resource', 'string'];
// Resource color type tags
const resourceColorType = 'ResourceColor';

/**
 * 校验规则：用于保持用户体验的一致性
 * 1. 使用consistentResourceInfo中的资源名称，替换`checkVpAndPxProperties`列表属性下以Vp或Px为单位的属性值
 * 2. 使用consistentResourceInfo中的资源名称，替换`checkVpProperties`列表属性下以Vp为单位的属性值
 * 3. 使用consistentResourceInfo中的资源名称，替换`color`属性下的`"#ffffffff"`格式的颜色值
 *
 * 校验等级：warn
 */
function _checkUIConsistent(this: BaseValidator<arkts.CallExpression, CallInfo>, node: arkts.CallExpression): void {
    const metadata = this.context ?? {};
    // Check whether it is from inner components or from `@AnimatableExtend`
    if (!checkIsCallFromInnerComponentOrExtendFromInfo(metadata)) {
        return;
    }
    // Check whether it has chaining calls
    if (!metadata.chainingCallInfos || metadata.chainingCallInfos.length === 0) {
        return;
    }
    // Check whether chaining data is collected correctly
    const chainingDataSource = ChainingCallDataSource.getInstance();
    if (!checkIsValidChainingDataSource(chainingDataSource, metadata)) {
        return;
    }
    const consistentResourceMap = MetaDataCollector.getInstance().consistentResourceMap;
    for (let idx = 0; idx < chainingDataSource.chainingCalls.length; idx++) {
        const chainCall = chainingDataSource.chainingCalls.at(idx);
        const chainingCallInfo = chainingDataSource.chainingCallInfos.at(idx);
        if (!chainCall || !chainingCallInfo) {
            return;
        }
        const callName = chainingCallInfo.callName!;
        // Specific Attributes: Check the VP units
        if (checkVpProperties.includes(callName)) {
            checkVpUnit.bind(this)(chainCall, consistentResourceMap);
        }
        // Specific attributes: Check the VP and PX units
        if (checkVpAndPxProperties.includes(callName)) {
            checkVpAndPxUnit.bind(this)(chainCall, consistentResourceMap);
        }
        // Check the color parameter formatting
        if (isColorProperty(callName)) {
            checkColorParams.bind(this)(chainCall, consistentResourceMap);
        }
    }
}

function isHexColor(color: string): boolean {
    return /^(#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8}))|(0x[0-9A-F]*)$/i.test(color);
}

function isValidPx(size: string): boolean {
    return /^\d+(\.\d+)?px$/.test(size);
}

function isValidVp(size: string): boolean {
    return /^\d+(\.\d+)?vp$/.test(size);
}

function convertToDecimalPx(size: string): string {
    // Remove meaningless 0, eg: '12.00px'
    const formatSize = `${parseFloat(size)}${size.endsWith('px') ? 'px' : 'vp'}`;
    // Regular expressions match numbers and units (e.g. px)
    const regex = /^(\d+)(px|vp)$/;
    const match = regex.exec(formatSize);

    if (match) {
        // Get the numerical part and the unit part
        const numberPart = match[1];
        const unitPart = match[2];

        // Add a decimal point and a zero if there is no decimal point after the original number
        const decimalSize = `${parseFloat(numberPart).toFixed(1)}${unitPart}`;

        return decimalSize;
    } else {
        // If there is no match, the original string is returned
        return size;
    }
}

function isColorProperty(propertyName: string): boolean {
    // If the attribute name contains  'ResourceColor', 'Color', 'Resource', 'string', it is mabe a color property
    return propertyName.includes(resourceColorType) || colorUnionTypes.some((str) => propertyName.includes(str));
}

function checkVpUnit(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.CallExpression,
    resourceMap?: ConsistentResourceMap
): void {
    if (!resourceMap) {
        return;
    }
    // Gets the attribute value text and verifies the formatting
    const sizeParams = node.arguments.filter((argNode) => arkts.isStringLiteral(argNode) && isValidVp(argNode.str));
    sizeParams.forEach((argNode) => {
        const validVPStr = (argNode as arkts.StringLiteral).str;
        const resources = resourceMap.get(validVPStr) ?? resourceMap.get(convertToDecimalPx(validVPStr));

        // If consistent resource information doesn't exist, it won't be fixed
        if (!resources || resources.length < 1) {
            return;
        }
        const systemResource = `$r('sys.float.${resources[0].resourceName}')`;
        this.report({
            node: argNode,
            level: LogType.WARN,
            message: `It is recommended that you use layered parameters for polymorphism development and resolution adaptation.`,
            suggestion: createSuggestion(
                systemResource,
                ...getPositionRangeFromNode(argNode),
                `change ${validVPStr} to ${systemResource}`
            ),
        });
    });
}

function checkVpAndPxUnit(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.CallExpression,
    resourceMap?: ConsistentResourceMap
): void {
    if (!resourceMap) {
        return;
    }
    // Gets the attribute value text and verifies the formatting
    const sizeParams = node.arguments.filter(
        (argNode) => arkts.isStringLiteral(argNode) && (isValidVp(argNode.str) || isValidPx(argNode.str))
    );
    sizeParams.forEach((argNode) => {
        const validVPOrPxStr = (argNode as arkts.StringLiteral).str;
        const resources = resourceMap.get(validVPOrPxStr) ?? resourceMap.get(convertToDecimalPx(validVPOrPxStr));

        // If consistent resource information doesn't exist, it won't be fixed
        if (!resources || resources.length < 1) {
            return;
        }
        const systemResource = `$r('sys.float.${resources[0].resourceName}')`;
        this.report({
            node: argNode,
            level: LogType.WARN,
            message: `It is recommended that you use layered parameters for polymorphism development and resolution adaptation.`,
            suggestion: createSuggestion(
                systemResource,
                ...getPositionRangeFromNode(argNode),
                `change ${validVPOrPxStr} to ${systemResource}`
            ),
        });
    });
}

function checkColorParams(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.CallExpression,
    resourceMap?: ConsistentResourceMap
): void {
    if (!resourceMap) {
        return;
    }
    // Gets the attribute value text and verifies the formatting
    const colorParams = node.arguments.filter((argNode) => arkts.isStringLiteral(argNode) && isHexColor(argNode.str));
    colorParams.forEach((argNode) => {
        const validColorStr = (argNode as arkts.StringLiteral).str;
        const resources = resourceMap.get(validColorStr) ?? resourceMap.get(validColorStr.toUpperCase());

        // If consistent resource information doesn't exist, it won't be fixed
        if (!resources || resources.length < 1) {
            return;
        }
        const systemResource = `$r('sys.color.${resources[0].resourceName}')`;
        this.report({
            node: argNode,
            level: LogType.WARN,
            message: `It is recommended that you use layered parameters for easier color mode switching and theme color changing.`,
            suggestion: createSuggestion(
                systemResource,
                ...getPositionRangeFromNode(argNode),
                `change ${validColorStr} to ${systemResource}`
            ),
        });
    });
}
