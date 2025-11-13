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
import { isAnnotatedProperty } from '../utils';
import { CallInfo } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { createSuggestion, getPositionRangeFromNode } from '../../../../common/log-collector';

/**
 * 校验规则：
 *  1. 原子组件不可包含子组件；
 *  2. 单子组件最多允许包含一个组件；
 *  3. 特定组件的父组件必须是限定组件；
 *  4. 特定组件的子组件必须是限定组件。
 *
 * 校验等级：error
 */
export function checkNestedRelationship(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    struct: arkts.ClassDefinition
): void {
    const metadata = this.context ?? {};
    const fromComponentV2: boolean = !!metadata.fromStructInfo?.annotationInfo?.hasComponentV2;
    const isComponentCall: boolean = !!metadata.structDeclInfo?.annotationInfo?.hasComponent;
    if (!(fromComponentV2 && isComponentCall)) {
        return;
    }

    // 只要当前struct 中有被"@Link" 修饰的属性就报错
    for (const member of struct.body) {
        if (isAnnotatedProperty(member, DecoratorNames.LINK)) {
            const declaration = struct.parent!; // Class Declaration has correct position information
            this.report({
                node: declaration,
                level: LogType.ERROR,
                message: `A V2 component cannot be used with any member property annotated by '@Link' in a V1 component.`,
                suggestion: createSuggestion('', ...getPositionRangeFromNode(declaration)),
            });
        }
    }
}
