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
import { AbstractVisitor, VisitorOptions } from "../common/abstract-visitor"
import {
    PositionalIdTracker,
    hasMemoAnnotation,
    hasMemoIntrinsicAnnotation,
    hasMemoStableAnnotation,
    isVoidType
} from "./utils"
import { ParameterTransformer } from "./parameter-transformer"
import { ReturnTransformer } from "./return-transformer"

function mayAddLastReturn(node: arkts.BlockStatement): boolean {
    return node.statements.length > 0 &&
        !arkts.isReturnStatement(node.statements[node.statements.length - 1]) &&
        !arkts.isThrowStatement(node.statements[node.statements.length - 1])
}

function updateFunctionBody(
    node: arkts.BlockStatement,
    parameters: arkts.ETSParameterExpression[],
    returnTypeAnnotation: arkts.TypeNode | undefined,
    stableThis: boolean,
    hash: arkts.NumberLiteral | arkts.StringLiteral
): [
    arkts.BlockStatement,
    arkts.VariableDeclaration | undefined,
    arkts.ReturnStatement | arkts.BlockStatement | undefined,
] {
    let returnTypeAnno = stableThis
        ? arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID)
        : returnTypeAnnotation;
    const scopeDeclaration = factory.createScopeDeclaration(
        returnTypeAnno,
        hash, parameters.length
    )
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
    const syntheticReturnStatement = factory.createSyntheticReturnStatement(stableThis)
    const isVoidValue = isVoidType(returnTypeAnno)
    const unchangedCheck = factory.createIfStatementWithSyntheticReturnStatement(syntheticReturnStatement, isVoidValue)
    if (node) {
        return [
            arkts.factory.updateBlock(
                node,
                [
                    scopeDeclaration,
                    ...memoParametersDeclaration,
                    unchangedCheck,
                    ...node.statements,
                    ...(mayAddLastReturn(node) ? [arkts.factory.createReturnStatement()] : []),
                ]
            ),
            memoParametersDeclaration.length ? memoParametersDeclaration[0] : undefined,
            syntheticReturnStatement,
        ]
    } else {
        return [
            node,
            memoParametersDeclaration.length ? memoParametersDeclaration[0] : undefined,
            syntheticReturnStatement,
        ]
    }
}

type ScopeInfo = {
    name?: string,
    isMemo: boolean
}

export interface FunctionTransformerOptions extends VisitorOptions {
    positionalIdTracker: PositionalIdTracker;
    parameterTransformer: ParameterTransformer;
    returnTransformer: ReturnTransformer;
}

export class FunctionTransformer extends AbstractVisitor {
    private positionalIdTracker: PositionalIdTracker;
    private parameterTransformer: ParameterTransformer;
    private returnTransformer: ReturnTransformer;

    constructor(options: FunctionTransformerOptions) {
        super(options)
        this.positionalIdTracker = options.positionalIdTracker
        this.parameterTransformer = options.parameterTransformer
        this.returnTransformer = options.returnTransformer
    }

    private scopes: ScopeInfo[] = []
    private stable: number = 0

    enter(node: arkts.AstNode) {
        if (arkts.isMethodDefinition(node)) {
            const name = node.name.name
            const isMemo = hasMemoAnnotation(node.scriptFunction) || hasMemoIntrinsicAnnotation(node.scriptFunction)
            this.scopes.push({ name , isMemo })
        }
        if (arkts.isClassDefinition(node)) {
            if (hasMemoStableAnnotation(node)) {
                this.stable++
            }
        }
        return this
    }

    exit(node: arkts.AstNode) {
        if (arkts.isMethodDefinition(node)) {
            this.scopes.pop()
        }
        if (arkts.isClassDefinition(node)) {
            if (hasMemoStableAnnotation(node)) {
                this.stable--
            }
        }
        return this
    }

    enterAnonymousScope(node: arkts.ScriptFunction) {
        const name = undefined
        const isMemo = hasMemoAnnotation(node) || hasMemoIntrinsicAnnotation(node)
        this.scopes.push({ name, isMemo })
        return this
    }

    exitAnonymousScope() {
        this.scopes.pop()
        return this
    }

    checkMemoCall(decl: arkts.MethodDefinition) {
        if (this.scopes[this.scopes.length - 1].isMemo == false) {
            if (this.scopes[this.scopes.length - 1].name) {
                console.error(`Attempt to call @memo-method ${decl.name.name} from non-@memo-method ${this.scopes[this.scopes.length - 1].name}`)
                throw "Invalid @memo usage"
            } else {
                console.error(`Attempt to call @memo-method ${decl.name.name} from anonymous non-@memo-method`)
                throw "Invalid @memo usage"
            }
        }
        return this
    }

    updateScriptFunction(
        scriptFunction: arkts.ScriptFunction,
        name: string = "",
    ): arkts.ScriptFunction {
        const isStableThis = this.stable > 0 && scriptFunction.returnTypeAnnotation !== undefined && arkts.isTSThisType(scriptFunction.returnTypeAnnotation)
        const [body, memoParametersDeclaration, syntheticReturnStatement] = updateFunctionBody(
            scriptFunction.body as arkts.BlockStatement,
            scriptFunction.params as arkts.ETSParameterExpression[],
            scriptFunction.returnTypeAnnotation,
            isStableThis,
            this.positionalIdTracker.id(name),
        )
        const afterParameterTransformer = this.parameterTransformer
            .withParameters(scriptFunction.params as arkts.ETSParameterExpression[])
            .skip(memoParametersDeclaration)
            .visitor(body)
        const afterReturnTransformer = this.returnTransformer
            .skip(syntheticReturnStatement)
            .rewriteThis(this.stable > 0)
            .visitor(afterParameterTransformer)
        const updatedParameters = scriptFunction.params.map((param) => {
            if (arkts.isEtsParameterExpression(param) && hasMemoAnnotation(param)) {
                if (param.type && arkts.isETSFunctionType(param.type)) {
                    param.type = factory.updateFunctionTypeWithMemoParameters(param.type)
                } else if (param.type && arkts.isETSUnionType(param.type)) {
                    param.type = arkts.factory.updateUnionType(
                        param.type,
                        param.type.types.map((it) => {
                            if (arkts.isETSFunctionType(it)) {
                                return factory.updateFunctionTypeWithMemoParameters(it)
                            }
                            return it
                        })
                    )
                } else {
                    if (name) {
                        console.error(`ETSFunctionType or ETSUnionType expected for @memo-parameter ${param.identifier.name} of @memo-method ${name}`)
                        throw "Invalid @memo usage"
                    } else {
                        console.error(`ETSFunctionType or ETSUnionType expected for @memo-parameter ${param.identifier.name} of anonymous @memo-method`)
                        throw "Invalid @memo usage"
                    }
                }
            }
            return param
        })
        const updateScriptFunction = arkts.factory.updateScriptFunction(
            scriptFunction,
            afterReturnTransformer,
            arkts.FunctionSignature.createFunctionSignature(
                scriptFunction.typeParams,
                [
                    ...factory.createHiddenParameters(),
                    ...updatedParameters
                ],
                scriptFunction.returnTypeAnnotation,
                scriptFunction.hasReceiver
            ),
            scriptFunction.flags,
            scriptFunction.modifiers
        )
        if (!!scriptFunction.id) {
            updateScriptFunction.setIdent(scriptFunction.id);
        }
        return updateScriptFunction;
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        this.enter(beforeChildren)
        const node = this.visitEachChild(beforeChildren)
        this.exit(beforeChildren)
        // if (arkts.isMethodDefinition(node) && node.scriptFunction.body) {
        if (arkts.isMethodDefinition(node)) {
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
                ).setOverloads(node.overloads)
            }
        }
        if (arkts.isCallExpression(node)) {
            const expr = node.expression
            const decl = arkts.getDecl(expr)
            if (decl && arkts.isMethodDefinition(decl) && (hasMemoAnnotation(decl.scriptFunction) || hasMemoIntrinsicAnnotation(decl.scriptFunction))) {
                this.checkMemoCall(decl)
                const updatedArguments = node.arguments.map((it, index) => {
                    const type = (decl.scriptFunction.params[index] as arkts.ETSParameterExpression)?.type
                    if (type && arkts.isETSFunctionType(type)) {
                        if (
                            !hasMemoAnnotation(decl.scriptFunction.params[index] as arkts.ETSParameterExpression) 
                            && !hasMemoIntrinsicAnnotation(decl.scriptFunction.params[index] as arkts.ETSParameterExpression)
                        ) {
                            return factory.createComputeExpression(this.positionalIdTracker.id(decl.name.name), it)
                        }
                        if (arkts.isArrowFunctionExpression(it)) {
                            this.enterAnonymousScope(it.scriptFunction)
                            const res = this.updateScriptFunction(it.scriptFunction)
                            this.exitAnonymousScope()
                            return arkts.factory.updateArrowFunction(it, res)
                        }
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