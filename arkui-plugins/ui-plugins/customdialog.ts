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
import { factory } from './ui-factory';
import {
    CustomComponentNames,
    getCustomComponentOptionsName,
} from './utils';
import { stat } from 'fs';
import { createAndInsertImportDeclaration } from '../common/arkts-utils';

export function createCustomDialogMethod(controller: string): arkts.MethodDefinition {
    const param: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
        arkts.factory.createIdentifier(
            'controller',
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier(CustomComponentNames.CUSTOMDIALOG_CONTROLLER)
                )
            )
        ),
        undefined
    );

    const block = arkts.factory.createBlock(
        (controller.length !== 0) ? [
            arkts.factory.createExpressionStatement(
                arkts.factory.createAssignmentExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createThisExpression(),
                        arkts.factory.createIdentifier(controller),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                    arkts.factory.createIdentifier('controller')
                )
            )
        ] : []
    );

    const script = arkts.factory.createScriptFunction(
        block,
        arkts.FunctionSignature.createFunctionSignature(
            undefined,
            [param],
            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            false
        ),
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
    );

    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
        arkts.factory.createIdentifier(CustomComponentNames.SETDIALOGCONTROLLER_METHOD),
        script,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        false
    );
}

export function transformCallToArrow(value: arkts.CallExpression): arkts.ArrowFunctionExpression {
    const className = value.expression.name;
    const args = value.arguments;
    const as_value = arkts.factory.createExpressionStatement(
        arkts.factory.updateCallExpression(
            value,
            value.expression,
            value.typeArguments,
            args.length === 0 ? [] : [
                arkts.factory.createTSAsExpression(
                    args[0],
                    arkts.factory.createTypeReference(
                        arkts.factory.createTypeReferencePart(
                            arkts.factory.createIdentifier(getCustomComponentOptionsName(className))
                        )
                    ),
                    false
                )
            ]
        )
    );
    const newValue = arkts.factory.createArrowFunction(
        factory.createScriptFunction(
            {
                body: arkts.factory.createBlock([as_value]),
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            }
        )
    );
    return newValue;
}

export function transformController(newInstance: arkts.ETSNewClassInstanceExpression): arkts.ETSNewClassInstanceExpression {
    const arg = newInstance.getArguments[0];
    if (!arkts.isObjectExpression(arg)) {
        throw new Error('Error CustomDialogOptions');
    }
    const properties = arg.properties as arkts.Property[];
    const property = properties[0];
    const value = property?.value;
    if (!(value && arkts.isCallExpression(value) && arkts.isIdentifier(value.expression))) {
        return newInstance;
    }

    const memoArrow = transformCallToArrow(value);
    properties[0] = arkts.Property.updateProperty(
        property,
        property.key,
        memoArrow
    );
    const newObj = arkts.ObjectExpression.updateObjectExpression(
        arg,
        arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
        properties,
        false
    );
    const asOptions = arkts.factory.createTSAsExpression(
        newObj,
        arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier(CustomComponentNames.CUSTOMDIALOG_CONTROLLER_OPTIONS)
            )
        ),
        false
    );
    return arkts.factory.updateETSNewClassInstanceExpression(
        newInstance,
        newInstance.getTypeRef,
        [asOptions]
    );
}

function createVarExpression(key_name: string, isProperty: boolean): arkts.Expression {
    if (!isProperty) {
        return arkts.factory.createIdentifier(key_name + '_Temp');
    }
    return arkts.factory.createMemberExpression(
        arkts.factory.createThisExpression(),
        arkts.factory.createIdentifier(key_name),
        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
        false,
        false
    );
}

function createInvoke(key_name: string, isProperty: boolean): arkts.AstNode[] {
    const statements: arkts.AstNode[] = [];
    const varExpression = createVarExpression(key_name, isProperty);
    if (!isProperty) {
        const createVar = arkts.factory.createVariableDeclaration(
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
                arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_CONST,
                [
                    arkts.factory.createVariableDeclarator(
                        arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_CONST,
                        arkts.factory.createIdentifier((varExpression as arkts.Identifier).name),
                        arkts.factory.createIdentifier(key_name)
                    )
                ]
        );
        statements.push(createVar);
    }
    const invoke = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier('newInstance'),
                arkts.factory.createIdentifier(CustomComponentNames.SETDIALOGCONTROLLER_METHOD),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                arkts.factory.createTSAsExpression(
                    varExpression,
                    arkts.factory.createTypeReference(
                        arkts.factory.createTypeReferencePart(
                            arkts.factory.createIdentifier(CustomComponentNames.CUSTOMDIALOG_CONTROLLER)
                        )
                    ),
                    false
                )
            ]
        )
    );
    statements.push(invoke);
    return statements;
}

function updateStyleBlock(key_name: string, dialogName: string, isProperty: boolean): arkts.BlockStatement {
    const invokeSetController = createInvoke(key_name, isProperty);
    return arkts.factory.createBlock(
        [
            arkts.factory.createVariableDeclaration(
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
                arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
                [
                    arkts.factory.createVariableDeclarator(
                        arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                        arkts.factory.createIdentifier('newInstance'),
                        arkts.factory.createETSNewClassInstanceExpression(
                            arkts.factory.createTypeReference(
                                arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(dialogName))
                            ),
                            []
                        )
                    )
                ]
            ),
            ...invokeSetController,
            arkts.factory.createReturnStatement(
                arkts.factory.createIdentifier('newInstance')
            )
        ]
    );
}

function updateStyle(style: arkts.ArrowFunctionExpression, key_name: string, dialogName: string, isProperty: boolean): arkts.ArrowFunctionExpression {
    const block = updateStyleBlock(key_name, dialogName, isProperty);
    return arkts.factory.updateArrowFunction(
        style,
        factory.createScriptFunction(
            {
                body: block,
                returnTypeAnnotation: arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(
                        arkts.factory.createIdentifier(dialogName)
                    )
                ),
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
            }
        )
    );
}

export function updateArrow(arrow: arkts.ArrowFunctionExpression, controller: string, isProperty: boolean): arkts.ArrowFunctionExpression {
    const scriptFunction = arrow.scriptFunction as arkts.ScriptFunction;
    const statement = scriptFunction.body!.statements[0] as arkts.ExpressionStatement;
    const call = statement.expression as arkts.CallExpression;
    const member = call.expression as arkts.MemberExpression;
    
    const dialogName = member.object.name;
    const styleArrow = call.arguments[1] as arkts.ArrowFunctionExpression;
    const newStyle = updateStyle(styleArrow, controller, dialogName, isProperty);
    const newScriptFunction = factory.createScriptFunction(
        {
            body: arkts.factory.createBlock([
                arkts.factory.createExpressionStatement(
                    arkts.factory.updateCallExpression(
                        call,
                        member,
                        call.typeArguments,
                        [
                            call.arguments[0],
                            newStyle,
                            ...call.arguments.slice(2)
                        ]
                    )
                )
            ]),
            flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
        }
    );
    const newArrow = arkts.factory.updateArrowFunction(
        arrow,
        newScriptFunction
    );
    return newArrow;
}

export function updateCtor(ctor: arkts.MethodDefinition): arkts.MethodDefinition {
    const script = ctor.scriptFunction;
    const newScriptFunction = arkts.factory.createScriptFunction(
        script.body,
        arkts.factory.createFunctionSignature(
            undefined,
            [
                ...script.params,
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier(
                        'component',
                        arkts.factory.createTypeReference(
                            arkts.factory.createTypeReferencePart(
                                arkts.factory.createIdentifier('ExtendableComponent')
                            )
                        )
                    ),
                    undefined
                )
            ],
            undefined,
            false
        ),
        script.flags,
        script.modifiers
    );
    const newCtor = arkts.factory.updateMethodDefinition(
        ctor,
        ctor.kind,
        arkts.factory.createIdentifier(ctor.name.name),
        newScriptFunction,
        ctor.modifiers,
        false
    );
    return newCtor;
}

export function updateBody(body: arkts.Statement[]): arkts.Statement[] {
    let result: arkts.Statement[] = [];
    for (const statement of body) {
        if (arkts.isMethodDefinition(statement) && statement.name.name === 'constructor') {
            const ctor = updateCtor(statement);
            result.push(ctor);
        } else {
            result.push(statement);
        }
    }
    return result;
}


export function insertImportDeclaration(program: arkts.Program | undefined): void {
    if (!program) {
        throw Error('Failed to insert import: Transformer has no program');
    }
    const imported = arkts.factory.createIdentifier('ExtendableComponent');
    createAndInsertImportDeclaration(
        arkts.factory.createStringLiteral('./extendableComponent'),
        imported,
        imported,
        arkts.Es2pandaImportKinds.IMPORT_KINDS_VALUE,
        program
    );
}

export function transformDeclaration(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
    const definition = node.definition!;
    const newBody = updateBody(definition.body as arkts.Statement[]);
    const newDefinition = arkts.factory.updateClassDefinition(
        definition,
        definition?.ident,
        undefined,
        definition.superTypeParams,
        definition.implements,
        undefined,
        definition.super,
        newBody,
        definition.modifiers,
        arkts.classDefinitionFlags(definition)
    );
    const declaration = arkts.factory.updateClassDeclaration(
        node,
        newDefinition
    );
    return declaration;
}

export function updateNewClassInstanceExpression(node: arkts.ETSNewClassInstanceExpression, varName: string,
    isProperty: boolean): arkts.ETSNewClassInstanceExpression {
    const asExression = node.getArguments[0] as arkts.TSAsExpression;
    const arg = asExression.expr as arkts.ObjectExpression;
    if (!arkts.isObjectExpression(arg)) {
        throw new Error('Error CustomDialogOptions');
    }
    const properties = arg.properties as arkts.Property[];
    const builder = properties[0];
    const builder_value = builder.value as arkts.ArrowFunctionExpression;
    const newBuilderValue = updateArrow(builder_value, varName, isProperty);
    const newProperty = arkts.factory.updateProperty(
        builder,
        builder.key,
        newBuilderValue
    );
    const newObj = arkts.factory.updateObjectExpression(
        arg,
        arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
        [newProperty, ...properties.slice(1)],
        false
    );
    const newAsExpression = arkts.factory.updateTSAsExpression(
        asExression,
        newObj,
        asExression.typeAnnotation,
        asExression.isConst
    );
    const typeRef = node.getTypeRef as arkts.ETSTypeReference;
    const newNode = arkts.factory.updateETSNewClassInstanceExpression(
        node,
        typeRef,
        [newAsExpression, arkts.factory.createThisExpression()]
    );
    return newNode;
}

export function isNewCustomDialogController(node: arkts.AstNode | undefined): boolean {
    if (node && arkts.isETSNewClassInstanceExpression(node) &&
        node.getTypeRef?.part?.name.name === 'CustomDialogController') {
        return true;
    }
    return false;
}

function updateVar(node: arkts.VariableDeclarator): arkts.VariableDeclarator {
    if (node.flag !== arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET) {
        throw Error('Error VariableDeclarator CustomDialogController');
    }
    return arkts.factory.updateVariableDeclarator(
        node,
        node.flag,
        node.name,
        arkts.factory.createUndefinedLiteral()
    );
}

export function checkCustomDialogController(node: arkts.BlockStatement): arkts.BlockStatement {
    const statements = node.statements;
    const newStatements: arkts.AstNode[] = [];
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (arkts.isVariableDeclaration(statement) && statement.declarators.length > 0 &&
        isNewCustomDialogController(statement.declarators[0].initializer)) {
            const varDeclare = statement.declarators[0];
            const varName = varDeclare.name.name;
            const classInstance = varDeclare.initializer;
            const newClass = updateNewClassInstanceExpression(classInstance as arkts.ETSNewClassInstanceExpression, varName, false);
            const newVar = arkts.factory.updateVariableDeclaration(
                statement,
                0,
                statement.declarationKind,
                [updateVar(statement.declarators[0])]
            );
            newStatements.push(newVar);
            const initVar = arkts.factory.createAssignmentExpression(
                arkts.factory.createIdentifier(varName),
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                newClass
            );
            const initStatement = arkts.factory.createExpressionStatement(initVar);
            newStatements.push(initStatement);
        } else {
            newStatements.push(statement);
        }
    }
    return arkts.factory.updateBlock(
        node,
        newStatements
    );
    
}