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
import { getPropertyESValue, getWrapValue } from './utils';
import { ESValueMethodNames, InteroperAbilityNames, InteropProvideNames } from './predefines';

export function createProvideInterop(): arkts.Statement[] {
    const createState = getPropertyESValue(InteroperAbilityNames.CREATESTATE, InteroperAbilityNames.GLOBAL, InteroperAbilityNames.CREATESTATE);
    const setCallbackFunc = getPropertyESValue(
        InteropProvideNames.SETFINDPROVIDE,
        InteroperAbilityNames.GLOBAL,
        InteropProvideNames.SETFINDPROVIDE
    );
    const viewPUResetFunc = getPropertyESValue(
        'resetViewPUFindProvideInterop',
        InteroperAbilityNames.GLOBAL,
        'resetViewPUFindProvideInterop'
    );
    const invokeFunc = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createIdentifier(InteroperAbilityNames.BINDPROVIDEINTEROP),
            undefined,
            [
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier(InteroperAbilityNames.CREATESTATE),
                arkts.factory.createIdentifier(InteropProvideNames.SETFINDPROVIDE)
            ]
        )
    );
    return [createState, setCallbackFunc, viewPUResetFunc, invokeFunc];
}


export function setAndResetFindProvide(): arkts.Statement[] {
    const setComponent = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createIdentifier(InteroperAbilityNames.BINDPROVIDEINTEROP),
            undefined,
            [
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier(InteroperAbilityNames.CREATESTATE),
                arkts.factory.createIdentifier(InteropProvideNames.SETFINDPROVIDE),
                arkts.factory.createIdentifier(InteroperAbilityNames.COMPONENT),
            ]
        )
    );

    const resetViewPU = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier('resetViewPUFindProvideInterop'),
                arkts.factory.createIdentifier(ESValueMethodNames.INVOKE),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            undefined
        )
    );
    return [setComponent, resetViewPU];
}