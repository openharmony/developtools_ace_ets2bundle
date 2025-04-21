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
import { getCustomComponentOptionsName } from './utils';

export function createEmptyESObject(name: string): arkts.VariableDeclaration {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(name),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(InteroperAbilityNames.ESOBJECT),
                        arkts.factory.createIdentifier(InteroperAbilityNames.INITEMPTYOBJECT),
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

export function getWrapValue(value: arkts.AstNode): arkts.AstNode {
    let wrapMethod = InteroperAbilityNames.WRAP;
    if (value instanceof arkts.StringLiteral) {
        wrapMethod = InteroperAbilityNames.WRAPSTRING;
    } else if (value instanceof arkts.NumberLiteral) {
        wrapMethod = InteroperAbilityNames.WRAPINT;
    }

    return arkts.factory.createCallExpression(
        arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier(InteroperAbilityNames.ESOBJECT),
            arkts.factory.createIdentifier(wrapMethod),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        undefined,
        [value]
    );
}

export function setPropertyESObject(name: string, key: arkts.StringLiteral, value: arkts.AstNode): arkts.ExpressionStatement {
    return arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(name),
                arkts.factory.createIdentifier(InteroperAbilityNames.SETPROPERTY),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                key,
                getWrapValue(value)
            ]
        )
    );
}

export function getPropertyESObject(result: string, object: string, key: string): arkts.VariableDeclaration {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(result),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(object),
                        arkts.factory.createIdentifier(InteroperAbilityNames.GETPROPERTY),
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

function initialArgs(name: string, args?: arkts.ObjectExpression): arkts.Statement[] {
    if (!args) {
        return [];
    }
    const result: arkts.Statement[] = [];

    for (const property of args.properties) {
        if (!(property instanceof arkts.Property)) {
            continue;
        }
        const key = property.key;
        const value = property.value;
        const key_string = arkts.factory.createStringLiteral(key.name);
        const setProperty = setPropertyESObject(name, key_string, value);
        result.push(setProperty);
    }
    return result;
}

function getModule(moduleName: string): arkts.VariableDeclaration {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(InteroperAbilityNames.MODULE),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(InteroperAbilityNames.ESOBJECT),
                        arkts.factory.createIdentifier(InteroperAbilityNames.LOAD),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    [arkts.factory.create1StringLiteral(moduleName)]
                )
            )
        ]
    );
}

function instantiateComonent(params: arkts.AstNode[]): arkts.VariableDeclaration {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(InteroperAbilityNames.COMPONENT),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(InteroperAbilityNames.STRUCTOBJECT),
                        arkts.factory.createIdentifier(InteroperAbilityNames.INSTANTIATE),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    params
                )
            )
        ]
    );
}

function paramsLambdaDeclaration(name: string, args?: arkts.ObjectExpression): arkts.Statement[] {
    const result = [];
    result.push(
        arkts.factory.createVariableDeclaration(
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
            [
                arkts.factory.createVariableDeclarator(
                    arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                    arkts.factory.createIdentifier(InteroperAbilityNames.PARAMSLAMBDA),
                    arkts.factory.createArrowFunction(
                        arkts.factory.createScriptFunction(
                            arkts.factory.createBlock([arkts.factory.createReturnStatement(
                                args ? args : arkts.ObjectExpression.createObjectExpression(
                                    arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
                                    [],
                                    false
                                ),
                            )]),
                            arkts.factory.createFunctionSignature(
                                undefined,
                                [],
                                arkts.factory.createTypeReference(
                                    arkts.factory.createTypeReferencePart(
                                        arkts.factory.createIdentifier(getCustomComponentOptionsName(name))
                                    )
                                ),
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

function createInitReturn(componentName: string): arkts.ReturnStatement {
    return arkts.factory.createReturnStatement(
        arkts.ObjectExpression.createObjectExpression(
            arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
            [
                arkts.Property.createProperty(
                    arkts.factory.createIdentifier(InteroperAbilityNames.COMPONENT),
                    arkts.factory.createIdentifier(InteroperAbilityNames.COMPONENT)
                ),
                arkts.Property.createProperty(
                    arkts.factory.createIdentifier('name'),
                    arkts.factory.createStringLiteral(componentName)
                )
            ],
            false
        ),
    );
}

function createWrapperBlock(name: string, path: string, args?: arkts.ObjectExpression): arkts.BlockStatement {
    const index = path.indexOf('/');
    if (index === -1) {
        throw new Error('Error path of Legacy Component.');
    }
    const moduleName = path.substring(0, index);
    const blankLambda = arkts.factory.createArrowFunction(
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
    const initialArgsStatement = initialArgs(InteroperAbilityNames.PARAM, args);
    return arkts.factory.createBlock(
        [
            createEmptyESObject(InteroperAbilityNames.PARAM),
            ...initialArgsStatement,
            createEmptyESObject(InteroperAbilityNames.EXTRAINFO),
            setPropertyESObject(InteroperAbilityNames.EXTRAINFO, arkts.factory.create1StringLiteral('page'), arkts.factory.createStringLiteral(path)),
            getModule(moduleName),
            getPropertyESObject(InteroperAbilityNames.STRUCTOBJECT, InteroperAbilityNames.MODULE, name),
            instantiateComonent([
                arkts.factory.createIdentifier(InteroperAbilityNames.PARENT),
                arkts.factory.createIdentifier(InteroperAbilityNames.PARAM),
                arkts.factory.createUndefinedLiteral(), 
                arkts.factory.createIdentifier(InteroperAbilityNames.ELMTID), 
                blankLambda, 
                arkts.factory.createIdentifier(InteroperAbilityNames.EXTRAINFO)
            ]),
            ...paramsLambdaDeclaration(name, args),
            setPropertyESObject(
                InteroperAbilityNames.COMPONENT, 
                arkts.factory.create1StringLiteral('paramsGenerator_'), 
                arkts.factory.createIdentifier(InteroperAbilityNames.PARAMSLAMBDA)
            ),
            createInitReturn(name)
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
                        arkts.factory.createIdentifier(InteroperAbilityNames.ELMTID, number),
                        undefined,
                    ),
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.PARENT, esobject),
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
                        arkts.factory.createIdentifier(InteroperAbilityNames.ELMTID, number),
                        undefined,
                    ),
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.INSTANCE, esobject),
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
            arkts.factory.createIdentifier(InteroperAbilityNames.NUMBER)
        )
    );
    const esobject = arkts.factory.createTypeReference(
        arkts.factory.createTypeReferencePart(
            arkts.factory.createIdentifier(InteroperAbilityNames.ESOBJECT)
        )
    );
    const ident = node.expression;
    if (!(ident instanceof arkts.Identifier)) {
        throw new Error('Unexpected name of legacy component.');
    }
    const initializer = createInitializer(ident.name, number, esobject, path, args);
    const updater = createUpdater(number, esobject);
    return arkts.factory.createCallExpression(
        arkts.factory.createIdentifier(InteroperAbilityNames.ARKUICOMPATIBLE),
        undefined,
        [
            initializer,
            updater,
        ]
    );
}