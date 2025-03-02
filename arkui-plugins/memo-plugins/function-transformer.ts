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
import { factory } from "./memo-factory"
import { AbstractVisitor } from "../common/abstract-visitor"
import {
    PositionalIdTracker,
    RuntimeNames,
    hasMemoAnnotation,
    hasMemoIntrinsicAnnotation,
    isMemoAnnotation,
} from "./utils"
import { ParameterTransformer } from "./parameter-transformer"
import { ReturnTransformer } from "./return-transformer"

function updateFunctionBody(
    node: arkts.BlockStatement,
    parameters: arkts.ETSParameterExpression[],
    returnTypeAnnotation: arkts.AstNode | undefined,
    hash: arkts.NumberLiteral | arkts.StringLiteral,
    updateStatementFunc?: (statement: arkts.AstNode) => arkts.AstNode
): [
    arkts.BlockStatement,
    arkts.VariableDeclaration | undefined,
    arkts.ReturnStatement | undefined,
] {
    const scopeDeclaration = factory.createScopeDeclaration(returnTypeAnnotation, hash, parameters.length)
    const memoParameters = parameters.map((name, id) => { return factory.createMemoParameterDeclarator(id, name.identifier.name) })
    const memoParametersDeclaration = memoParameters.length
        ? [
            arkts.factory.createVariableDeclaration(
                0,
                arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_CONST,
                memoParameters,
            )
        ]
        : []
    const syntheticReturnStatement = factory.createSyntheticReturnStatement()
    const unchangedCheck = factory.createIfStatementWithSyntheticReturnStatement(syntheticReturnStatement)
    if (node.statements.length && node.statements[node.statements.length - 1] instanceof arkts.ReturnStatement) {
        return [
            arkts.factory.updateBlock(
                node,
                [
                    scopeDeclaration,
                    ...memoParametersDeclaration,
                    unchangedCheck,
                    ...node.statements,
                ]
            ),
            memoParametersDeclaration.length ? memoParametersDeclaration[0] : undefined,
            syntheticReturnStatement,
        ]
    } else {
        return [
            arkts.factory.updateBlock(
                node,
                [
                    scopeDeclaration,
                    ...memoParametersDeclaration,
                    unchangedCheck,
                    ...(updateStatementFunc ? node.statements.map(updateStatementFunc) : node.statements),
                    arkts.factory.createReturnStatement(),
                ]
            ),
            memoParametersDeclaration.length ? memoParametersDeclaration[0] : undefined,
            syntheticReturnStatement,
        ]
    }
}

// TODO: A workaround to unmemoize complex types with @memo
function findFunctionType(param: arkts.ETSParameterExpression): arkts.ETSFunctionType | undefined {
    const paramType: arkts.AstNode | undefined = param.type;
    if (!paramType) return undefined;

    if (arkts.isUnionType(paramType)) {
        const functionType: arkts.ETSFunctionType | undefined = 
            paramType.types.find(arkts.isFunctionType);
        return functionType;
    }
    if (arkts.isFunctionType(paramType)) {
        return paramType
    }
    return undefined;
}

function removeMemoAnnotationInParam(param: arkts.ETSParameterExpression): arkts.ETSParameterExpression {
    param.annotations = param.annotations.filter(
        (it) => !isMemoAnnotation(it, RuntimeNames.ANNOTATION) && !isMemoAnnotation(it, RuntimeNames.ANNOTATION_INTRINSIC)
    );
    return param;
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
        [...factory.createHiddenParameters(), ...scriptFunction.parameters],
        scriptFunction.typeParamsDecl,
        scriptFunction.returnTypeAnnotation
    );
    return arkts.factory.updateArrowFunction(argument, updateScriptFunction);
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
    constructor(
        private positionalIdTracker: PositionalIdTracker,
        private parameterTransformer: ParameterTransformer,
        private returnTransformer: ReturnTransformer
    ) {
        super()
    }

    visitEachChild(node: arkts.AstNode): arkts.AstNode {
        if (arkts.isCallExpression(node) && isBuilderLambda(node)) {
            return node;
        }

        return super.visitEachChild(node);
    }

    updateScriptFunction(
        scriptFunction: arkts.ScriptFunction,
        name: string = "",
        updateStatementFunc?: (statement: arkts.AstNode) => arkts.AstNode
    ): arkts.ScriptFunction {
        if (!scriptFunction.body) {
            return scriptFunction
        }
        const [body, memoParametersDeclaration, syntheticReturnStatement] = updateFunctionBody(
            scriptFunction.body,
            scriptFunction.parameters,
            scriptFunction.returnTypeAnnotation,
            this.positionalIdTracker.id(name),
            updateStatementFunc
        )
        const afterParameterTransformer = this.parameterTransformer
            .withParameters(scriptFunction.parameters)
            .skip(memoParametersDeclaration)
            .visitor(body)
        const afterReturnTransformer = this.returnTransformer
            .skip(syntheticReturnStatement)
            .visitor(afterParameterTransformer)
        const updatedParameters = scriptFunction.parameters.map((param) => {
            if (hasMemoAnnotation(param)) {
                const functionType = findFunctionType(param);
                if (!functionType) {
                    throw "ArrowFunctionExpression expected for @memo parameter of @memo function"
                }
                param.type = arkts.factory.createFunctionType(
                    arkts.factory.createFunctionSignature(
                        undefined,
                        [...factory.createHiddenParameters(), ...functionType.params],
                        functionType.returnType,
                    ),
                    arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                )
            }
            return removeMemoAnnotationInParam(param)
        })
        return arkts.factory.updateScriptFunction(
            scriptFunction,
            afterReturnTransformer,
            scriptFunction.scriptFunctionFlags,
            scriptFunction.modifiers,
            false,
            scriptFunction.ident,
            [...factory.createHiddenParameters(), ...updatedParameters.map(removeMemoAnnotationInParam)],
            scriptFunction.typeParamsDecl,
            scriptFunction.returnTypeAnnotation
        )
    }

    transformContentInMemoBuilderLambda(
        argument: arkts.AstNode, 
        positionalIdTracker: PositionalIdTracker,
        positionKey: string
    ): arkts.AstNode {
        if (!arkts.isArrowFunctionExpression(argument)) return argument;
    
        const updateChildrenInContent = (statement: arkts.AstNode): arkts.AstNode => {
            if (arkts.isCallExpression(statement) && isBuilderLambda(statement)) {
                return this.transformMemoBuilderLambda(statement, positionalIdTracker);
            }
    
            return statement;
        }
    
        const scriptFunction: arkts.ScriptFunction = argument.scriptFunction;
        const updateScriptFunction = this.updateScriptFunction(
            scriptFunction,
            positionKey,
            updateChildrenInContent
        );
    
        const stub =  arkts.factory.updateArrowFunction(argument, updateScriptFunction);
    
        return stub;
    }
    
    transformMemoBuilderLambda(
        lambda: arkts.CallExpression, 
        positionalIdTracker: PositionalIdTracker
    ): arkts.CallExpression {
        const exprName = lambda.expression.dumpSrc();
    
        let args = lambda.arguments.length > 2 
            ? [
                transformStyleInMemoBuilderLambda(lambda.arguments.at(0)!),
                ...lambda.arguments.slice(1, lambda.arguments.length - 1),
                this.transformContentInMemoBuilderLambda(
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
                ...factory.createHiddenArguments(positionalIdTracker.id(exprName)), 
                ...args
            ]
        );
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        // TODO: Remove (currently annotations are lost on visitor)
        // const methodDefinitionHasMemoAnnotation =
        //     beforeChildren instanceof arkts.MethodDefinition && hasMemoAnnotation(beforeChildren.scriptFunction)
        // const methodDefinitionHasMemoIntrinsicAnnotation =
        //     beforeChildren instanceof arkts.MethodDefinition && hasMemoIntrinsicAnnotation(beforeChildren.scriptFunction)

        const node = this.visitEachChild(beforeChildren)
        if (arkts.isMethodDefinition(node) && node.scriptFunction.body) {
            if (hasMemoAnnotation(node.scriptFunction) || hasMemoIntrinsicAnnotation(node.scriptFunction)) {
                return arkts.factory.updateMethodDefinition(
                    node,
                    arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
                    node.name,
                    arkts.factory.createFunctionExpression(
                        this.updateScriptFunction(node.scriptFunction, node.name.name),
                    ),
                    node.modifiers,
                    false
                )
            }
        }
        if (node instanceof arkts.CallExpression) {
            if (isBuilderLambda(node)) {
                const updateNode = this.transformMemoBuilderLambda(node, this.positionalIdTracker);
                return updateNode;
            }
            const expr = node.expression
            const decl = arkts.getDecl(expr)
            if (decl instanceof arkts.MethodDefinition && (hasMemoAnnotation(decl.scriptFunction) || hasMemoIntrinsicAnnotation(decl.scriptFunction))) {
                const updatedArguments = node.arguments.map((it, index) => {
                    const param = decl.scriptFunction.parameters[index];
                    const functionType = findFunctionType(param);
                    if (!!functionType) {
                        if (!hasMemoAnnotation(param) && !hasMemoIntrinsicAnnotation(param)) {
                            return factory.createComputeExpression(this.positionalIdTracker.id(decl.name.name), it)
                        }
                        if (!(it instanceof arkts.ArrowFunctionExpression)) {
                            throw "ArrowFunctionExpression expected for @memo argument of @memo function"
                        }
                        return this.updateScriptFunction(it.scriptFunction)
                    }
                    return it
                })
                return arkts.factory.updateCallExpression(
                    node,
                    node.expression,
                    undefined,
                    [...factory.createHiddenArguments(this.positionalIdTracker.id(decl.name.name)), ...updatedArguments]
                )
            }
        }
        return node
    }
}
