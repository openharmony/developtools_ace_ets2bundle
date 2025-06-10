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
import { getPropertyESValue } from './utils';
import { createVariableLet, setStateProxy } from './initstatevar';
import { ESValueMethodNames, InteroperAbilityNames, InteropProvideNames } from './predefines';


function findProvide(): arkts.Statement {
    return createVariableLet(
        InteropProvideNames.STATICPROVIDE,
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier(InteropProvideNames.FINDPROVIDE),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            [
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(
                        arkts.factory.createIdentifier('Object')
                    )
                )
            ],
            [
                arkts.factory.createIdentifier(InteropProvideNames.PROVIDEDPROPNAME)
            ]
        )
    );
}

function setProvideProxy(): arkts.Statement[] {
    return setStateProxy(
        () => arkts.factory.createTSNonNullExpression(
            arkts.factory.createIdentifier(InteropProvideNames.STATICPROVIDE)
        )
    );
}

function getProvideProxy(): arkts.Statement {
    return createVariableLet(
        'proxy',
        arkts.factory.createCallExpression(
            arkts.factory.createIdentifier(InteroperAbilityNames.GETPROXY),
            undefined,
            [
                arkts.factory.createTSNonNullExpression(
                    arkts.factory.createIdentifier(InteropProvideNames.STATICPROVIDE)
                )
            ]
        )
    );
}

function returnProvide(): arkts.Statement {
    return arkts.factory.createReturnStatement(
        arkts.factory.createTSAsExpression(
            arkts.factory.createTSNonNullExpression(
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createTSAsExpression(
                            arkts.factory.createIdentifier('proxy'),
                            arkts.factory.createTypeReference(
                                arkts.factory.createTypeReferencePart(
                                    arkts.factory.createIdentifier(ESValueMethodNames.ESVALUE)
                                )
                            ),
                            false
                        ),
                        arkts.factory.createIdentifier(ESValueMethodNames.UNWRAP),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    undefined
                )
            ),
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier('Object')
                )
            ),
            false
        )
    );
}

function createProvideBlock(): arkts.BlockStatement {
    const provide = findProvide();
    const setProxy = setProvideProxy();
    const getProxy = getProvideProxy();
    const returnStatement = returnProvide();
    return arkts.factory.createBlock([provide, ...setProxy, getProxy, returnStatement]);
}

function findProvideCallback(): arkts.Statement {
    const block = createProvideBlock();
    const callback = createVariableLet(
        InteropProvideNames.FINDPROVIDECALLBACK,
        arkts.factory.createArrowFunction(
            arkts.factory.createScriptFunction(
                block,
                arkts.factory.createFunctionSignature(
                    undefined,
                    [
                        arkts.factory.createParameterDeclaration(
                            arkts.factory.createIdentifier(InteropProvideNames.PROVIDEDPROPNAME,
                                arkts.factory.createTypeReference(
                                    arkts.factory.createTypeReferencePart(
                                        arkts.factory.createIdentifier('string')
                                    )
                                )
                            ),
                            undefined,
                        ),
                    ],
                    arkts.factory.createTypeReference(
                        arkts.factory.createTypeReferencePart(
                            arkts.factory.createIdentifier('Object')
                        )
                    ),
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            )
        )
    );
    return callback;
}

export function createProvideInterop(): arkts.Statement[] {
    const viewPUFunc = getPropertyESValue(
        InteropProvideNames.SETVIEWPUFINDPROVIDE,
        InteroperAbilityNames.GLOBAL,
        InteropProvideNames.SETVIEWPUFINDPROVIDE
    );
    const componentFunc = getPropertyESValue(
        InteropProvideNames.SETFINDPROVIDE,
        InteroperAbilityNames.GLOBAL,
        InteropProvideNames.SETFINDPROVIDE
    );
    const callback = findProvideCallback();
    const invokeFunc = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(InteropProvideNames.SETVIEWPUFINDPROVIDE),
                arkts.factory.createIdentifier(ESValueMethodNames.INVOKE),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                arkts.factory.createIdentifier(InteropProvideNames.FINDPROVIDECALLBACK)
            ]
        )
    );
    return [viewPUFunc, componentFunc, callback, invokeFunc];
}


export function setAndResetFindProvide(): arkts.Statement[] {
    const setComponent = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(InteropProvideNames.SETFINDPROVIDE),
                arkts.factory.createIdentifier(ESValueMethodNames.INVOKE),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                arkts.factory.createIdentifier(InteroperAbilityNames.COMPONENT),
                arkts.factory.createIdentifier(InteropProvideNames.FINDPROVIDECALLBACK)
            ]
        )
    );
    const resetViewPU = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(InteroperAbilityNames.STRUCTOBJECT),
                arkts.factory.createIdentifier(ESValueMethodNames.INVOKEMETHOD),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                arkts.factory.createStringLiteral('resetFindInterop')
            ]
        )
    );
    return [setComponent, resetViewPU];
}