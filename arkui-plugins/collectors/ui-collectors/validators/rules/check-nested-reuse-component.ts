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
function reportNestedReuseError(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    callExpression: arkts.CallExpression,
    message: string
): void {
    this.report({
        node: callExpression,
        level: LogType.ERROR,
        message,
        suggestions: [createSuggestion('', ...getPositionRangeFromNode(callExpression), `Remove the component`)],
    });
}

function _checkNestedReuseComponent(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    struct: arkts.ClassDefinition
): void {
    const metadata = this.context ?? {};
    if (!metadata.structDeclInfo || !metadata.fromStructInfo) {
        return;
    }
    const callExpression = arkts.classByPeer<arkts.CallExpression>(metadata.ptr);
    const { hasRepeat, hasTemplate } = checkHasRepeatOrTemplate(callExpression);
    validateNestedReuseRules.bind(this)(metadata, callExpression, hasRepeat, hasTemplate);
}

function validateNestedReuseRules(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    metadata: CallInfo,
    callExpression: arkts.CallExpression,
    hasRepeat: boolean,
    hasTemplate: boolean
): void {
    const fromAnnoInfo = metadata.fromStructInfo?.annotationInfo;
    const toAnnoInfo = metadata.structDeclInfo?.annotationInfo;
    const fromComponent: boolean = !!fromAnnoInfo?.hasComponent;
    const fromReusable: boolean = !!fromAnnoInfo?.hasReusable;
    const fromReusableV2: boolean = !!fromAnnoInfo?.hasReusableV2;
    const isReusableCall: boolean = !!toAnnoInfo?.hasReusable;
    const isReusableV2Call: boolean = !!toAnnoInfo?.hasReusableV2;

    if (fromComponent && !fromReusable && isReusableV2Call) {
        reportNestedReuseError.bind(this)(
            callExpression,
            `A custom component decorated with @Component cannot contain child components decorated with @ReusableV2.`
        );
    }
    if (fromReusable && isReusableV2Call) {
        reportNestedReuseError.bind(this)(
            callExpression,
            `A custom component decorated with @Reusable cannot contain child components decorated with @ReusableV2.`
        );
    }
    if (fromReusableV2 && isReusableCall) {
        reportNestedReuseError.bind(this)(
            callExpression,
            `A custom component decorated with @ReusableV2 cannot contain child components decorated with @Reusable.`
        );
    }
    if (hasRepeat && hasTemplate && isReusableV2Call) {
        reportNestedReuseError.bind(this)(
            callExpression,
            `The template attribute of the Repeat component cannot contain any custom component decorated with @ReusableV2.`
        );
    }
}

function isTemplateCall(expr: arkts.MemberExpression): boolean {
    return !!expr.property && arkts.isIdentifier(expr.property) && expr.property.name === TEMPLATE;
}

function isRepeatCall(expr: arkts.MemberExpression): boolean {
    const obj = expr.object;
    if (!obj || !arkts.isCallExpression(obj)) {
        return false;
    }
    const callee = obj.expression;
    return !!callee && arkts.isIdentifier(callee) && callee.name === REPEAT;
}

function findAncestorCallExpression(node: arkts.CallExpression): arkts.CallExpression | undefined {
    let prevCall: arkts.CallExpression = node;
    let currParent: arkts.AstNode | undefined = node.parent;
    while (!!currParent) {
        if (arkts.isCallExpression(currParent)) {
            if (!currParent.expression.findNodeInInnerChild(prevCall)) {
                break;
            }
            prevCall = currParent;
        }
        currParent = currParent.parent;
    }
    if (!currParent || !arkts.isCallExpression(currParent) || !arkts.isMemberExpression(currParent.expression)) {
        return undefined;
    }
    return currParent;
}

function checkHasRepeatOrTemplate(node: arkts.CallExpression): { hasRepeat: boolean; hasTemplate: boolean } {
    const ancestorCall = findAncestorCallExpression(node);
    if (!ancestorCall) {
        return { hasRepeat: false, hasTemplate: false };
    }
    const expr = ancestorCall.expression as arkts.MemberExpression;
    return {
        hasTemplate: isTemplateCall(expr),
        hasRepeat: isRepeatCall(expr),
    };
}
