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
import { ESValueMethodNames, InteroperAbilityNames } from './predefines';


/**
 * 
 * @param result 
 * @returns let result = ESValue.instantiateEmptyObject()
 */
export function createEmptyESValue(result: string): arkts.VariableDeclaration {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(result),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(ESValueMethodNames.ESVALUE),
                        arkts.factory.createIdentifier(ESValueMethodNames.INITEMPTYOBJECT),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    undefined
                )
            )
        ]
    );
}

/**
 * 
 * @param value 
 * @returns ESValue.wrap(value)
 */
export function getWrapValue(value: arkts.AstNode): arkts.AstNode {
    return arkts.factory.createCallExpression(
        arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier(ESValueMethodNames.ESVALUE),
            arkts.factory.createIdentifier(ESValueMethodNames.WRAP),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        undefined,
        [value]
    );
}

/**
 * 
 * @param object 
 * @param key 
 * @param value 
 * @returns object.setProperty(key, value)
 */
export function setPropertyESValue(object: string, key: string, value: arkts.AstNode): arkts.ExpressionStatement {
    return arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(object),
                arkts.factory.createIdentifier(ESValueMethodNames.SETPROPERTY),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                arkts.factory.createStringLiteral(key),
                value
            ]
        )
    );
}

/**
 * 
 * @param result 
 * @param obj 
 * @param key 
 * @returns let result = object.getProperty(key)
 */
export function getPropertyESValue(result: string, obj: string, key: string): arkts.VariableDeclaration {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(result),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(obj),
                        arkts.factory.createIdentifier(ESValueMethodNames.GETPROPERTY),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    [arkts.factory.create1StringLiteral(key)]
                )
            )
        ]
    );
}

/**
 * 
 * @param stateVar 
 * @param block 
 * @returns if (getCompatibleState(stateVar) === undefined) { block }
 */
export function ifStateHasProxy(stateVar: () => arkts.Expression, block: arkts.BlockStatement): arkts.Statement {
    return arkts.factory.createIfStatement(
        arkts.factory.createBinaryExpression(
            arkts.factory.createCallExpression(
                arkts.factory.createIdentifier(InteroperAbilityNames.GETPROXY),
                undefined,
                [
                    stateVar()
                ]
            ),
            arkts.factory.createUndefinedLiteral(),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_STRICT_EQUAL
        ),
        block
    );
}

/**
 * Generates a state proxy variable name by appending "_State_Proxy" suffix.
 * @param {string} stateVarName - Original state variable name to be proxied.
 * @returns {string} Proxied variable name in the format: "{stateVarName}_State_Proxy".
 */
export function stateProxy(stateVarName: string): string {
    return `${stateVarName}_State_Proxy`;
}

