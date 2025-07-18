/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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
import { InteroperAbilityNames } from '../common/predefines';
import { annotation, backingField, isAnnotation } from '../common/arkts-utils';
import { getPropertyESValue, getWrapValue, setPropertyESValue } from './interop';


export function processNormal(keyName: string, value: arkts.AstNode): arkts.Statement[] {
    const result: arkts.Statement[] = [];
    const setProperty = setPropertyESValue(
        InteroperAbilityNames.PARAM,
        keyName,
        getWrapValue(value)
    );
    result.push(setProperty);
    return result;
}

export function createVariableLet(varName: string, expression: arkts.AstNode): arkts.VariableDeclaration {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [arkts.factory.createVariableDeclarator(
            arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
            arkts.factory.createIdentifier(varName),
            expression
        )]
    );
}
export function setValueCallback(name: string, type: arkts.TypeNode, block: arkts.BlockStatement): arkts.AstNode {
    return createVariableLet(name,
        arkts.factory.createArrowFunction(
            arkts.factory.createScriptFunction(
                block,
                arkts.factory.createFunctionSignature(
                    undefined,
                    [
                        arkts.factory.createParameterDeclaration(
                            arkts.factory.createIdentifier('value', type),
                            undefined,
                        ),
                    ],
                    undefined,
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            )
        )
    );
}

function createProxyBlock(varName: string): arkts.BlockStatement {
    return arkts.factory.createBlock(
        [
            arkts.factory.createExpressionStatement(
                arkts.factory.createAssignmentExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createThisExpression(),
                        arkts.factory.createIdentifier(varName),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                    arkts.factory.createIdentifier('value')
                )
            )
        ]
    );
}

export function setCallbackForProxy(varName: string, type: arkts.TypeNode): arkts.Statement[] {
    const createCallback = setValueCallback(addStatePrefix(varName, 'SetSource'), type, createProxyBlock(varName));
    const createProxyState = createVariableLet(addStatePrefix(varName, 'ProxyState'),
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier('createState'),
                arkts.factory.createIdentifier('invoke'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                getWrapValue(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createThisExpression(),
                        arkts.factory.createIdentifier(varName),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    )
                ),
                getWrapValue(arkts.factory.createIdentifier(addStatePrefix(varName, 'SetSource')))
            ]
        )
    );
    const setProxy = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createTSNonNullExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createThisExpression(),
                        arkts.factory.createIdentifier(backingField(varName)),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    )
                ),
                arkts.factory.createIdentifier('setProxy'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [arkts.factory.createIdentifier(addStatePrefix(varName, 'ProxyState'))],
        )
    );
    return [createCallback, createProxyState, setProxy];
}

function createSourceBlock(varName: string): arkts.BlockStatement {
    return arkts.factory.createBlock(
        [
            arkts.factory.createExpressionStatement(
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(addStatePrefix(varName, 'ProxyState')),
                        arkts.factory.createIdentifier('invokeMethod'),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    [
                        arkts.factory.createStringLiteral('set'),
                        getWrapValue(
                            arkts.factory.createIdentifier('value')
                        )
                    ]
                )
            )
        ]
    );
}

function createNotifyBlock(varName: string): arkts.BlockStatement {
    return arkts.factory.createBlock(
        [
            arkts.factory.createExpressionStatement(
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(addStatePrefix(varName, 'ProxyState')),
                        arkts.factory.createIdentifier('invokeMethod'),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    [
                        arkts.factory.createStringLiteral('notifyPropertyHasChangedPU')
                    ]
                )
            )
        ]
    );
}

function setNotifyForSource(varName: string): arkts.Statement[] {
    const block = createNotifyBlock(varName);
    const createCallback = createVariableLet(addStatePrefix(varName, 'NotifyCallback'),
        arkts.factory.createArrowFunction(
            arkts.factory.createScriptFunction(
                block,
                arkts.factory.createFunctionSignature(
                    undefined,
                    [
                        arkts.factory.createParameterDeclaration(
                            arkts.factory.createIdentifier('propertyName',
                                arkts.factory.createTypeReference(
                                    arkts.factory.createTypeReferencePart(
                                        arkts.factory.createIdentifier('string')
                                    )
                                )
                            ),
                            undefined,
                        ),
                    ],
                    undefined,
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            )
        )
    );
    const setCallback = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createTSNonNullExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createThisExpression(),
                        arkts.factory.createIdentifier(backingField(varName)),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    )
                ),
                arkts.factory.createIdentifier('setNotifyCallback'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [arkts.factory.createIdentifier(addStatePrefix(varName, 'NotifyCallback'))],
        )
    );
    return [createCallback, setCallback];
}

export function setCallbackForSource(varName: string, type: arkts.TypeNode): arkts.Statement[] {
    const createCallback = setValueCallback(addStatePrefix(varName, 'SetProxy'), type, createSourceBlock(varName));
    const setFunc = arkts.factory.createExpressionStatement(
        arkts.factory.createAssignmentExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createTSNonNullExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createThisExpression(),
                        arkts.factory.createIdentifier(backingField(varName)),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    )
                ),
                arkts.factory.createIdentifier('setProxyValue'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            arkts.factory.createIdentifier(addStatePrefix(varName, 'SetProxy'))
        )
    );
    const setNotify = setNotifyForSource(varName);
    return [createCallback, setFunc, ...setNotify];
}

export function processLink(keyName: string, value: arkts.AstNode, type: arkts.TypeNode, proxySet: Set<string>): arkts.Statement[] {
    const varName = ((value as arkts.MemberExpression).property as arkts.Identifier).name;
    const result: arkts.Statement[] = [];
    if (!proxySet.has(varName)) {
        proxySet.add(varName);
        const setProxy = setCallbackForProxy(varName, type);
        result.push(...setProxy);
        const setSource = setCallbackForSource(varName, type);
        result.push(...setSource);
    }
    const setParam = setPropertyESValue(
        'param',
        keyName,
        arkts.factory.createIdentifier(addStatePrefix(varName, 'ProxyState'))
    );
    result.push(setParam);
    return result;
}

export function hasLink(decorators: string[]): boolean {
    return decorators.some(decorator => decorator === 'Link');
}

function addStatePrefix(stateVarName: string, name: string): string {
    return `${stateVarName}_${name}`;
}