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

export const checkNestedReuseComponent = performanceLog(
    _checkNestedReuseComponent,
    getPerfName([0, 0, 0, 0, 0], 'checkNestedReuseComponent')
);

const TEMPLATE: string = 'template';
const REPEAT: string = 'Repeat';

/**
 * 校验规则：用于验证可重用组件的嵌套用法。
 * 1. `@Component`组件不能包含`@ReusableV2`修饰的组件
 * 2. `@Reusable`组件不能包含`@ReusableV2`修饰的组件
 * 3. `@ReusableV2`组件不能包含`@Reusable`修饰的组件
 * 4. `Repeat`组件的`template`属性不能包含任何用`@ReusableV2装饰`的自定义组件。
 *
 * 校验等级：error
 */
function _checkNestedReuseComponent(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    struct: arkts.ClassDefinition
): void {
    const metadata = this.context ?? {};
    // If a non-custom component is called and is not in the custom component, it returns directly
    if (!metadata.structDeclInfo || !metadata.fromStructInfo) {
        return;
    }
    const fromComponent: boolean = !!metadata.fromStructInfo?.annotationInfo?.hasComponent;
    const fromReusable: boolean = !!metadata.fromStructInfo?.annotationInfo?.hasReusable;
    const fromReusableV2: boolean = !!metadata.fromStructInfo?.annotationInfo?.hasReusableV2;
    const isReusableCall: boolean = !!metadata.structDeclInfo?.annotationInfo?.hasReusable;
    const isReusableV2Call: boolean = !!metadata.structDeclInfo?.annotationInfo?.hasReusableV2;
    const callExpression = arkts.unpackNonNullableNode<arkts.CallExpression>(metadata.ptr!);
    const { hasRepeat, hasTemplate } = checkHasRepeatOrTemplate(callExpression);

    // `@Component`组件不能包含`@ReusableV2`修饰的组件。(如果有`@Reusable`,只报第二个错误)
    if (fromComponent && !fromReusable && isReusableV2Call) {
        this.report({
            node: callExpression,
            level: LogType.ERROR,
            message: `A custom component decorated with @Component cannot contain child components decorated with @ReusableV2.`,
            suggestion: createSuggestion('', ...getPositionRangeFromNode(callExpression), `Remove the component`),
        });
    }
    // `@Reusable`组件不能包含`@ReusableV2`修饰的组件
    if (fromReusable && isReusableV2Call) {
        this.report({
            node: callExpression,
            level: LogType.ERROR,
            message: `A custom component decorated with @Reusable cannot contain child components decorated with @ReusableV2.`,
            suggestion: createSuggestion('', ...getPositionRangeFromNode(callExpression), `Remove the component`),
        });
    }
    // `@ReusableV2`组件不能包含`@Reusable`修饰的组件
    if (fromReusableV2 && isReusableCall) {
        this.report({
            node: callExpression,
            level: LogType.ERROR,
            message: `A custom component decorated with @ReusableV2 cannot contain child components decorated with @Reusable.`,
            suggestion: createSuggestion('', ...getPositionRangeFromNode(callExpression), `Remove the component`),
        });
    }
    // `Repeat`组件的`template`属性不能包含任何用`@ReusableV2装饰`的自定义组件。
    if (hasRepeat && hasTemplate && isReusableV2Call) {
        this.report({
            node: callExpression,
            level: LogType.ERROR,
            message: `The template attribute of the Repeat component cannot contain any custom component decorated with @ReusableV2.`,
            suggestion: createSuggestion('', ...getPositionRangeFromNode(callExpression), `Remove the component`),
        });
    }
}

function checkHasRepeatOrTemplate(node: arkts.CallExpression): { hasRepeat: boolean; hasTemplate: boolean } {
    let hasRepeat: boolean = false;
    let hasTemplate: boolean = false;
    let prevCall: arkts.CallExpression = node;
    let currParent: arkts.AstNode | undefined = node.parent;
    while (!!currParent) {
        if (arkts.isCallExpression(currParent)) {
            if (!currParent.callee?.findNodeInInnerChild(prevCall)) {
                break;
            }
            prevCall = currParent;
        }
        currParent = currParent.parent;
    }
    if (!currParent || !arkts.isCallExpression(currParent) || !arkts.isMemberExpression(currParent.callee)) {
        return { hasRepeat, hasTemplate };
    }
    if (
        currParent.callee.property &&
        arkts.isIdentifier(currParent.callee.property) &&
        currParent.callee.property.name === TEMPLATE
    ) {
        hasTemplate = true;
    }
    if (
        currParent.callee.object &&
        arkts.isCallExpression(currParent.callee.object) &&
        currParent.callee.object.callee &&
        arkts.isIdentifier(currParent.callee.object.callee) &&
        currParent.callee.object.callee.name === REPEAT
    ) {
        hasRepeat = true;
    }
    return { hasRepeat, hasTemplate };
}
