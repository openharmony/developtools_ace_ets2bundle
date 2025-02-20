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
import { AbstractVisitor } from "./AbstractVisitor"
import { createContextParameter, createIdParameter, createContextArgument, createIdArgument, RuntimeNames, PositionalIdTracker } from "./utils"

function isMemoAnnotation(anno: arkts.AnnotationUsage): boolean {
    return !!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === RuntimeNames.ANNOTATION;
}

function hasMemoAnnotation(node: arkts.ScriptFunction) {
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

function updateFunctionBody(node: arkts.BlockStatement | undefined, hash: arkts.NumberLiteral | arkts.StringLiteral): arkts.BlockStatement | undefined {
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
                    arkts.factory.createTSTypeParameterInstantiation(
                        [
                            arkts.factory.createTypeReferenceFromId(
                                arkts.factory.createIdentifier("void")
                            )
                        ]
                    ),
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
        arkts.factory.createReturnStatement(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(RuntimeNames.SCOPE),
                arkts.factory.createIdentifier(RuntimeNames.INTERNAL_VALUE),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_NONE,
                false,
                false
            )
        )
    )
    const recache = arkts.factory.createReturnStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(RuntimeNames.SCOPE),
                arkts.factory.createIdentifier(RuntimeNames.INTERNAL_VALUE_NEW),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            []
        )
    )
    return arkts.factory.updateBlock(
        node,
        [
            scopeDeclaraion,
            unchangedCheck,
            ...node.statements,
            recache
        ]
    )
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
        [...createHiddenParameters(), ...scriptFunction.parameters.map(removeMemoAnnotationInParam)],
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

export class FunctionTransformer extends AbstractVisitor {
    constructor(private positionalIdTracker: PositionalIdTracker) {
        super()
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        const node = this.visitEachChild(beforeChildren);

        if (arkts.isMethodDefinition(node) && hasMemoAnnotation(node.scriptFunction)) {
            return transformMemoMethod(node, this.positionalIdTracker);
        }
        if (node instanceof arkts.CallExpression) {
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
