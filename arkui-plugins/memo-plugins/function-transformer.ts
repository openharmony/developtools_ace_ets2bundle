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

import * as arkts from "@koalaui/libarkts"
import { AbstractVisitor } from "../common/abstract-visitor"
import { 
    createContextParameter, 
    createIdParameter, 
    createContextArgument, 
    createIdArgument, 
    RuntimeNames, 
    PositionalIdTracker 
} from "./utils"

function isMemoAnnotation(anno: arkts.AnnotationUsage): boolean {
    return !!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === RuntimeNames.ANNOTATION;
}

function hasMemoAnnotation(node: arkts.ScriptFunction | arkts.ETSParameterExpression) {
    return node.annotations.some(isMemoAnnotation);
}

function removeMemoAnnotationInParam(param: arkts.ETSParameterExpression): arkts.ETSParameterExpression {
    param.annotations = param.annotations.filter((it) => !isMemoAnnotation(it));
    return param;
}

function createHiddenParameters(): arkts.ETSParameterExpression[] {
    return [createContextParameter(), createIdParameter()]
}

function createHiddenArguments(hash: arkts.NumberLiteral | arkts.StringLiteral): arkts.AstNode[] {
    return [createContextArgument(), createIdArgument(hash)]
}

function updateFunctionBody(
    node: arkts.BlockStatement | undefined, 
    hash: arkts.NumberLiteral | arkts.StringLiteral,
    updateStatementFunc?: (statement: arkts.AstNode) => arkts.AstNode
): arkts.BlockStatement | undefined {
    if (node === undefined)
        return node
    const scopeDeclaraion = arkts.factory.createVariableDeclaration(
        0,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_CONST,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_CONST,
                arkts.factory.createIdentifier(RuntimeNames.SCOPE),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(RuntimeNames.CONTEXT),
                        arkts.factory.createIdentifier(RuntimeNames.INTERNAL_SCOPE),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    [
                        arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID)
                    ],
                    [
                        createIdArgument(hash)
                    ]
                )
            )
        ]
    )
    const unchangedCheck = arkts.factory.createIfStatement(
        arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier(RuntimeNames.SCOPE),
            arkts.factory.createIdentifier(RuntimeNames.INTERNAL_VALUE_OK),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_NONE,
            false,
            false
        ),
        arkts.factory.createBlock(
            [
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier(RuntimeNames.SCOPE),
                    arkts.factory.createIdentifier(RuntimeNames.INTERNAL_VALUE),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_NONE,
                    false,
                    false
                ),
                arkts.factory.createReturnStatement()
            ]
        )

    )
    const recache = arkts.factory.createCallExpression(
        arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier(RuntimeNames.SCOPE),
            arkts.factory.createIdentifier(RuntimeNames.INTERNAL_VALUE_NEW),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        undefined,
        []
    );
    return arkts.factory.updateBlock(
        node,
        [
            scopeDeclaraion,
            unchangedCheck,
            ...(updateStatementFunc ? node.statements.map(updateStatementFunc) : node.statements),
            recache,
            arkts.factory.createReturnStatement()
        ]
    )
}

function transformMemoMethodParameter(parameter: arkts.ETSParameterExpression): arkts.ETSParameterExpression {
    if (hasMemoAnnotation(parameter)) {
        const name: arkts.Identifier = parameter.identifier;
        const typeAnnotation: arkts.AstNode = name.typeAnnotation!;

        let updateTypeAnnotation: arkts.AstNode | undefined;
        if (typeAnnotation instanceof arkts.ETSUnionType) {
            updateTypeAnnotation = arkts.factory.updateUnionType(
                typeAnnotation,
                typeAnnotation.types.map((type) => {
                    if (type instanceof arkts.ETSFunctionType) {
                        const stub = arkts.factory.createFunctionType(
                            arkts.FunctionSignature.create(
                                undefined,
                                [
                                    ...createHiddenParameters(),
                                    ...type.params
                                ],
                                type.returnType
                            ),
                            type.flags
                        )
                        return stub
                    }

                    return type;
                })
            )

            const updateName = arkts.factory.updateIdentifier(
                name,
                name.name,
                updateTypeAnnotation
            );

            return removeMemoAnnotationInParam(
                arkts.factory.updateParameterDeclaration(
                    parameter,
                    updateName,
                    undefined
                )
            )
        }

        return removeMemoAnnotationInParam(parameter);
    }

    return parameter;
}

function transformMemoMethod(method: arkts.MethodDefinition, positionalIdTracker: PositionalIdTracker): arkts.MethodDefinition {
    const key: arkts.Identifier = method.name;
    const scriptFunction: arkts.ScriptFunction = method.scriptFunction;

    const updateScriptFunction = arkts.factory.createScriptFunction(
        updateFunctionBody(scriptFunction.body, positionalIdTracker.id(key.name)),
        scriptFunction.scriptFunctionFlags,
        scriptFunction.modifiers,
        false,
        scriptFunction.ident,
        [...createHiddenParameters(), ...scriptFunction.parameters.map(transformMemoMethodParameter)],
        scriptFunction.typeParamsDecl,
        scriptFunction.returnTypeAnnotation
    );

    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
        key,
        arkts.factory.createFunctionExpression(updateScriptFunction),
        method.modifiers,
        false
    );
}

function transformStyleInMemoBuilderLambda(argument: arkts.AstNode): arkts.AstNode {
    if (!arkts.isArrowFunctionExpression(argument)) return argument;

    const scriptFunction: arkts.ScriptFunction = argument.scriptFunction;
    const updateScriptFunction = arkts.factory.createScriptFunction(
        scriptFunction.body,
        scriptFunction.scriptFunctionFlags,
        scriptFunction.modifiers,
        false,
        scriptFunction.ident,
        [...createHiddenParameters(), ...scriptFunction.parameters],
        scriptFunction.typeParamsDecl,
        scriptFunction.returnTypeAnnotation
    );
    return arkts.factory.updateArrowFunction(argument, updateScriptFunction);
}

function transformContentInMemoBuilderLambda(
    argument: arkts.AstNode, 
    positionalIdTracker: PositionalIdTracker,
    positionKey: string
): arkts.AstNode {
    if (!arkts.isArrowFunctionExpression(argument)) return argument;

    const updateChildrenInContent = (statement: arkts.AstNode): arkts.AstNode => {
        if (arkts.isCallExpression(statement) && isBuilderLambda(statement)) {
            return transformMemoBuilderLambda(statement, positionalIdTracker);
        }

        return statement;
    }

    const scriptFunction: arkts.ScriptFunction = argument.scriptFunction;
    const updateScriptFunction = arkts.factory.createScriptFunction(
        updateFunctionBody(scriptFunction.body, positionalIdTracker.id(positionKey), updateChildrenInContent),
        scriptFunction.scriptFunctionFlags,
        scriptFunction.modifiers,
        false,
        scriptFunction.ident,
        [...createHiddenParameters(), ...scriptFunction.parameters],
        scriptFunction.typeParamsDecl,
        scriptFunction.returnTypeAnnotation
    );

    const stub =  arkts.factory.updateArrowFunction(argument, updateScriptFunction);

    return stub;
}

function transformMemoBuilderLambda(lambda: arkts.CallExpression, positionalIdTracker: PositionalIdTracker): arkts.CallExpression {
    const exprName = lambda.expression.dumpSrc();

    let args = lambda.arguments.length > 2 
        ? [
            transformStyleInMemoBuilderLambda(lambda.arguments.at(0)!),
            ...lambda.arguments.slice(1, lambda.arguments.length - 1),
            transformContentInMemoBuilderLambda(
                lambda.arguments.at(lambda.arguments.length - 1)!,
                positionalIdTracker,
                exprName
            )
        ]
        : [
            transformStyleInMemoBuilderLambda(lambda.arguments.at(0)!),
            ...lambda.arguments.slice(1)
        ];

    return arkts.factory.updateCallExpression(
        lambda,
        lambda.expression,
        lambda.typeArguments,
        [
            ...createHiddenArguments(positionalIdTracker.id(exprName)), 
            ...args
        ]
    );
}

function isBuilderLambda(node: arkts.AstNode): boolean {
    const builderLambda: arkts.AstNode | undefined = _getDeclForBuilderLambda(node);
    return !!builderLambda;
}

// TODO: temporary solution for get declaration of a builder lambda
function _getDeclForBuilderLambda(node: arkts.AstNode): arkts.AstNode | undefined {
    if (!node || !arkts.isCallExpression(node)) return undefined;

    if (node.expression && arkts.isMemberExpression(node.expression)) {
        const _node: arkts.MemberExpression = node.expression;
        if (_node.property && arkts.isIdentifier(_node.property) && _node.property.name === "instantiateImpl") {
            return node;
        }
        if (_node.object && arkts.isCallExpression(_node.object)) {
            return _getDeclForBuilderLambda(_node.object);
        }
    }

    return undefined;
}

export class FunctionTransformer extends AbstractVisitor {
    constructor(private positionalIdTracker: PositionalIdTracker) {
        super()
    }

    visitEachChild(node: arkts.AstNode): arkts.AstNode {
        if (arkts.isCallExpression(node) && isBuilderLambda(node)) {
            return node;
        }

        return super.visitEachChild(node);
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        const node = this.visitEachChild(beforeChildren);

        if (arkts.isMethodDefinition(node) && hasMemoAnnotation(node.scriptFunction)) {
            const updateNode = transformMemoMethod(node, this.positionalIdTracker);
            return updateNode;
        }
        if (arkts.isCallExpression(node)) {
            if (isBuilderLambda(node)) {
                const updateNode = transformMemoBuilderLambda(node, this.positionalIdTracker);
                return updateNode;
            }
            const expr = node.expression
            const decl = arkts.getDecl(expr)
            if (decl instanceof arkts.MethodDefinition && hasMemoAnnotation(decl.scriptFunction)) {
                return arkts.factory.updateCallExpression(
                    node,
                    node.expression,
                    undefined,
                    [...createHiddenArguments(this.positionalIdTracker.id(decl.name.name)), ...node.arguments]
                )
            }
        }
        return node
    }
}
