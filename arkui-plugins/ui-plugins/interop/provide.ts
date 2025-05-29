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


function findProvide(): arkts.Statement {
    return createVariableLet(
        'provide',
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier('findProvide'),
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
                arkts.factory.createIdentifier('providedPropName')
            ]
        )
    );
}

function setProvideProxy(): arkts.Statement[] {
    return setStateProxy(
        () => arkts.factory.createTSNonNullExpression(
            arkts.factory.createIdentifier('provide')
        )
    );
}

function getProvideProxy(): arkts.Statement {
    return createVariableLet(
        'proxy',
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createTSNonNullExpression(
                    arkts.factory.createIdentifier('provide')
                ),
                arkts.factory.createIdentifier('getProxy'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            undefined
        )
    );
}

function returnProvide(): arkts.Statement {
    return arkts.factory.createReturnStatement(
        arkts.factory.createTSNonNullExpression(
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createTSAsExpression(
                        arkts.factory.createIdentifier('proxy'),
                        arkts.factory.createTypeReference(
                            arkts.factory.createTypeReferencePart(
                                arkts.factory.createIdentifier('ESValue')
                            )
                        ),
                        false
                    ),
                    arkts.factory.createIdentifier('unwrap'),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                undefined
            )
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
        'findProvideInterop',
        arkts.factory.createArrowFunction(
            arkts.factory.createScriptFunction(
                block,
                arkts.factory.createFunctionSignature(
                    undefined,
                    [
                        arkts.factory.createParameterDeclaration(
                            arkts.factory.createIdentifier('providedPropName',
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
    const func = getPropertyESValue(
        'setFindProvideInterop',
        'global',
        'setFindProvideInterop'
    );
    const callback = findProvideCallback();
    const invokeFunc = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier('setFindProvideInterop'),
                arkts.factory.createIdentifier('invoke'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                arkts.factory.createIdentifier('findProvideInterop')
            ]
        )
    );
    return [func, callback, invokeFunc];
}


/**
 * 
 * @returns ViewPU.resetFindInterop()
 */
export function resetFindProvide(): arkts.Statement {
    return arkts.factory.createCallExpression(
        arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier('structObject'),
            arkts.factory.createIdentifier('invokeMethod'),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        undefined,
        [
            arkts.factory.createStringLiteral('resetFindProvide')
        ]
    );
}