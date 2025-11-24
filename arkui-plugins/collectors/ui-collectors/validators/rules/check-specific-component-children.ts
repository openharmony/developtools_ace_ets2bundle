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
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkSpecificComponentChildren = performanceLog(
    _checkSpecificComponentChildren,
    getPerfName([0, 0, 0, 0, 0], 'checkSpecificComponentChildren')
);

const TOGGLE: string = 'Toggle';
const TOGGLE_TYPE: string = 'ToggleType';
const TYPE: string = 'type';
const SINGLE_CHILD_COMPONENT: number = 1;
const ToggleType = {
    CHECKBOX: 'Checkbox',
    BUTTON: 'Button',
};

/**
 * 校验规则：用于验证特定类型组件的子组件情况
 * 1. Toggle组件类型为`Checkbox`时，不可包含子组件
 * 2. Toggle组件类型为`Button`时，最多允许包含一个子组件
 *
 * 校验等级：error
 */
function _checkSpecificComponentChildren(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.CallExpression
): void {
    const metadata = this.context ?? {};
    // If it's a custom component or the name isn't toggle, it returns
    if (metadata.structDeclInfo || !metadata.fromStructInfo || metadata.declName !== TOGGLE) {
        return;
    }
    const toggleType = getToggleType(node);
    if (toggleType === '') {
        return;
    }
    node.arguments.forEach((arg) => {
        if (
            !arkts.isArrowFunctionExpression(arg) ||
            !arg.scriptFunction.body ||
            !arkts.isBlockStatement(arg.scriptFunction.body)
        ) {
            return;
        }
        // Toggle组件类型为`Checkbox`时，不可包含子组件
        if (toggleType === ToggleType.CHECKBOX && arg.scriptFunction.body.statements.length > 0) {
            this.report({
                node: node,
                level: LogType.ERROR,
                message: `When the component '${TOGGLE}' set '${TYPE}' as '${toggleType}', it can't have any child.`,
            });
        }
        // Toggle组件类型为`Button`时，最多允许包含一个子组件
        if (toggleType === ToggleType.BUTTON && arg.scriptFunction.body.statements.length > SINGLE_CHILD_COMPONENT) {
            this.report({
                node: node,
                level: LogType.ERROR,
                message: `When the component '${TOGGLE}' set '${TYPE}' as '${toggleType}', it can only have a single child component.`,
            });
        }
    });
}

function getToggleType(node: arkts.CallExpression): string {
    let toggleType = '';
    node.arguments.some((member) => {
        if (!arkts.isObjectExpression(member) || !member.properties) {
            return false;
        }
        return member.properties.some((property) => {
            if (!arkts.isProperty(property) || !property.value) {
                return false;
            }
            // If the property name is not 'toggle type'
            if (
                !arkts.isMemberExpression(property.value) ||
                !property.value.object ||
                !arkts.isIdentifier(property.value.object) ||
                property.value.object.name !== TOGGLE_TYPE
            ) {
                return false;
            }
            if (!property.value.property || !arkts.isIdentifier(property.value.property)) {
                return false;
            }
            toggleType = property.value.property.name;
            return true;
        });
    });
    return toggleType;
}
