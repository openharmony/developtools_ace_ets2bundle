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
import { ARKUICOMPATIBLE, ESOBJECT, INITEMPTYOBJECT, NUMBER, SETPROPERTYBYNAME } from '../common/predefines';

export function createEmptyESObject(node: arkts.Identifier): arkts.VariableDeclaration {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                node,
                arkts.factory.createExpressionStatement(
                    arkts.factory.createCallExpression(
                        arkts.factory.createMemberExpression(
                            arkts.factory.createIdentifier(ESOBJECT),
                            arkts.factory.createIdentifier(INITEMPTYOBJECT),
                            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                            false,
                            false
                        ),
                        undefined,
                        undefined
                    )
                )
            )
        ]
    );
}

export function setPropertyESObject(node: arkts.Identifier, key: arkts.StringLiteral, value: arkts.AstNode): arkts.ExpressionStatement {
    return arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(ESOBJECT),
                arkts.factory.createIdentifier(SETPROPERTYBYNAME),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                node,
                key,
                value
            ]
        )
    );
}

function initialArgs(node: arkts.Identifier, args?: arkts.ObjectExpression): arkts.Statement[] {
    if (!args) {
        return [];
    }
    const result: arkts.Statement[] = [];

    for (const property of args.properties) {
        const key = property.key;
        const value = property.value;
        //TODO: ident type of value
        const key_result = arkts.factory.createStringLiteral(key?.name);
        const value_result = value.value;
        const setProperty = setPropertyESObject(node, key_result, value);
        result.push(setProperty);
    }
    return result;
}

function createLegacyStruct(name: string, param: arkts.Expression[]): arkts.Statement {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier('component'),
                arkts.factory.createTSAsExpression(
                    arkts.factory.createETSNewClassInstanceExpression(
                        arkts.factory.createTypeReference(
                            arkts.factory.createTypeReferencePart(
                                arkts.factory.createIdentifier(name)
                            )
                        ),
                        param
                    ),
                    arkts.factory.createTypeReference(
                        arkts.factory.createTypeReferencePart(
                            arkts.factory.createIdentifier(ESOBJECT)
                        )
                    ),
                    false
                )
            )
        ]
    );
}

function paramsLambdaDeclaration(args?: arkts.ObjectExpression): arkts.Statement[] {
    const result = [];
    result.push(
        arkts.factory.createVariableDeclaration(
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
            [
                arkts.factory.createVariableDeclarator(
                    arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                    arkts.factory.createIdentifier('paramLambda'),
                    arkts.factory.createArrowFunction(
                        arkts.factory.createScriptFunction(
                            arkts.factory.createBlock([arkts.factory.createReturnStatement(
                                args ? args : arkts.ObjectExpression.createObjectExpression(
                                    arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
                                    [],
                                    false
                                )
                            )]),
                            arkts.factory.createFunctionSignature(
                                undefined,
                                [],
                                undefined,
                                false
                            ),
                            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
                        )
                    )
                ),

            ]
        )
    );
    return result;
}

function createWrapperBlock(name: string, path: string, args?: arkts.ObjectExpression): arkts.BlockStatement {
    const param = arkts.factory.createIdentifier('param');
    const extraInfo = arkts.factory.createIdentifier('extraInfo');
    const component = arkts.factory.createIdentifier('component');
    const parent = arkts.factory.createIdentifier('parent');
    const elmtId = arkts.factory.createIdentifier('elmtId');
    const lambda = arkts.factory.createArrowFunction(
        arkts.factory.createScriptFunction(
            arkts.factory.createBlock([]),
            arkts.factory.createFunctionSignature(
                undefined,
                [],
                undefined,
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        )
    );
    const initialArgsStatement = initialArgs(param, args);
    return arkts.factory.createBlock(
        [
        ]
    );
}

function createInitializer(name: string, number: arkts.ETSTypeReference, esobject: arkts.ETSTypeReference, 
    path: string, args?: arkts.ObjectExpression): arkts.ArrowFunctionExpression {
    const block = createWrapperBlock(name, path, args);
    return arkts.factory.createArrowFunction(
        arkts.factory.createScriptFunction(
            block,
            arkts.factory.createFunctionSignature(
                undefined,
                [
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier('elmtId', number),
                        undefined,
                    ),
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier('instance', esobject),
                        undefined,
                    ),
                ],
                undefined,
                false,
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        )
    );
}

function createUpdater(number: arkts.ETSTypeReference, esobject: arkts.ETSTypeReference): arkts.ArrowFunctionExpression {
    return arkts.factory.createArrowFunction(
        arkts.factory.createScriptFunction(
            arkts.factory.createBlock(
                [

                ]
            ),
            arkts.factory.createFunctionSignature(
                undefined,
                [
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier('elmtId', number),
                        undefined,
                    ),
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier('instance', esobject),
                        undefined,
                    ),
                ],
                undefined,
                false,
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        )
    );
}

export function processStructCall(node: arkts.CallExpression, path: string, args?: arkts.ObjectExpression): arkts.CallExpression {
    const number = arkts.factory.createTypeReference(
        arkts.factory.createTypeReferencePart(
            arkts.factory.createIdentifier(NUMBER)
        )
    );
    const esobject = arkts.factory.createTypeReference(
        arkts.factory.createTypeReferencePart(
            arkts.factory.createIdentifier(ESOBJECT)
        )
    );
    const initializer = createInitializer(node.expression.name, number, esobject, path, args);
    const updater = createUpdater(number, esobject);
    return arkts.factory.createCallExpression(
        arkts.factory.createIdentifier(ARKUICOMPATIBLE),
        undefined,
        [
            initializer,
            updater,
        ]
    );
}