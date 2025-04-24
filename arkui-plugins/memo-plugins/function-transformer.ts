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
import { factory } from './memo-factory';
import { AbstractVisitor, VisitorOptions } from '../common/abstract-visitor';
import {
    PositionalIdTracker,
    castArrowFunctionExpression,
    castFunctionExpression,
    castOverloadsToMethods,
    castParameters,
    findMemoFromTypeAnnotation,
    hasMemoAnnotation,
    hasMemoIntrinsicAnnotation,
    hasMemoStableAnnotation,
    isMemoArrowFunction,
    isMemoClassProperty,
    isMemoMethodDefinition,
    isMemoTSTypeAliasDeclaration,
    isStandaloneArrowFunction,
    isVoidType,
    removeMemoAnnotation,
} from './utils';
import { ParameterTransformer } from './parameter-transformer';
import { ReturnTransformer } from './return-transformer';
import { SignatureTransformer } from './signature-transformer';

function mayAddLastReturn(node: arkts.BlockStatement): boolean {
    return (
        node.statements.length > 0 &&
        !arkts.isReturnStatement(node.statements[node.statements.length - 1]) &&
        !arkts.isThrowStatement(node.statements[node.statements.length - 1])
    );
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
    arkts.ReturnStatement | arkts.BlockStatement | undefined
] {
    let returnTypeAnno =
        !returnTypeAnnotation || stableThis
            ? arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID)
            : returnTypeAnnotation;
    const scopeDeclaration = factory.createScopeDeclaration(returnTypeAnno, hash, parameters.length);
    const memoParameters = parameters.map((name, id) => {
        return factory.createMemoParameterDeclarator(id, name.identifier.name);
    });
    const memoParametersDeclaration = memoParameters.length
        ? [
              arkts.factory.createVariableDeclaration(
                  0,
                  arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_CONST,
                  memoParameters
              ),
          ]
        : [];
    const syntheticReturnStatement = factory.createSyntheticReturnStatement(stableThis);
    const isVoidValue = isVoidType(returnTypeAnno);
    const unchangedCheck = factory.createIfStatementWithSyntheticReturnStatement(syntheticReturnStatement, isVoidValue);
    if (node) {
        return [
            arkts.factory.updateBlock(node, [
                scopeDeclaration,
                ...memoParametersDeclaration,
                unchangedCheck,
                ...node.statements,
                ...(mayAddLastReturn(node) ? [arkts.factory.createReturnStatement()] : []),
            ]),
            memoParametersDeclaration.length ? memoParametersDeclaration[0] : undefined,
            syntheticReturnStatement,
        ];
    } else {
        return [
            node,
            memoParametersDeclaration.length ? memoParametersDeclaration[0] : undefined,
            syntheticReturnStatement,
        ];
    }
}

function updateMemoTypeAnnotation(typeAnnotation: arkts.AstNode | undefined): arkts.TypeNode | undefined {
    if (!typeAnnotation) return undefined;
    if (!arkts.isTypeNode(typeAnnotation)) return undefined;

    if (typeAnnotation && arkts.isETSFunctionType(typeAnnotation)) {
        return factory.updateFunctionTypeWithMemoParameters(typeAnnotation);
    } else if (typeAnnotation && arkts.isETSUnionType(typeAnnotation)) {
        return arkts.factory.updateUnionType(
            typeAnnotation,
            typeAnnotation.types.map((it) => {
                if (arkts.isETSFunctionType(it)) {
                    return factory.updateFunctionTypeWithMemoParameters(it);
                }
                return it;
            })
        );
    }
    return typeAnnotation;
}

type ScopeInfo = {
    name?: string;
    isMemo: boolean;
};

export interface FunctionTransformerOptions extends VisitorOptions {
    positionalIdTracker: PositionalIdTracker;
    parameterTransformer: ParameterTransformer;
    returnTransformer: ReturnTransformer;
    signatureTransformer: SignatureTransformer;
}

export class FunctionTransformer extends AbstractVisitor {
    private readonly positionalIdTracker: PositionalIdTracker;
    private readonly parameterTransformer: ParameterTransformer;
    private readonly returnTransformer: ReturnTransformer;
    private readonly signatureTransformer: SignatureTransformer;

    constructor(options: FunctionTransformerOptions) {
        super(options);
        this.positionalIdTracker = options.positionalIdTracker;
        this.parameterTransformer = options.parameterTransformer;
        this.returnTransformer = options.returnTransformer;
        this.signatureTransformer = options.signatureTransformer;
    }

    private scopes: ScopeInfo[] = [];
    private stable: number = 0;

    reset() {
        super.reset();
        this.scopes = [];
        this.stable = 0;
        this.parameterTransformer.reset();
        this.returnTransformer.reset();
        this.signatureTransformer.reset();
    }

    enter(node: arkts.AstNode) {
        if (arkts.isMethodDefinition(node)) {
            const name = node.name.name;
            const isMemo = isMemoMethodDefinition(node);
            this.scopes.push({ name, isMemo });
        }
        if (arkts.isClassProperty(node) && !!node.key && arkts.isIdentifier(node.key)) {
            const name = node.key.name;
            const isMemo = isMemoClassProperty(node);
            this.scopes.push({ name, isMemo });
        }
        if (isStandaloneArrowFunction(node)) {
            const name = undefined;
            const isMemo = isMemoArrowFunction(node);
            this.scopes.push({ name, isMemo });
        }
        if (arkts.isTSTypeAliasDeclaration(node) && !!node.id && !!node.typeAnnotation) {
            const name = node.id.name;
            const isMemo = isMemoTSTypeAliasDeclaration(node);
            this.scopes.push({ name, isMemo });
        }
        if (arkts.isClassDefinition(node)) {
            if (hasMemoStableAnnotation(node)) {
                this.stable++;
            }
        }
        return this;
    }

    exit(node: arkts.AstNode) {
        if (arkts.isMethodDefinition(node)) {
            this.scopes.pop();
        }
        if (arkts.isClassDefinition(node)) {
            if (hasMemoStableAnnotation(node)) {
                this.stable--;
            }
        }
        return this;
    }

    enterAnonymousScope(node: arkts.ScriptFunction) {
        const name = undefined;
        const isMemo = hasMemoAnnotation(node) || hasMemoIntrinsicAnnotation(node);
        this.scopes.push({ name, isMemo });
        return this;
    }

    exitAnonymousScope() {
        this.scopes.pop();
        return this;
    }

    checkMemoCallInMethod(decl: arkts.MethodDefinition) {
        if (this.scopes[this.scopes.length - 1].isMemo == false) {
            if (this.scopes[this.scopes.length - 1].name) {
                console.error(
                    `Attempt to call @memo-method ${decl.name.name} from non-@memo-method ${
                        this.scopes[this.scopes.length - 1].name
                    }`
                );
                throw 'Invalid @memo usage';
            } else {
                console.error(`Attempt to call @memo-method ${decl.name.name} from anonymous non-@memo-method`);
                throw 'Invalid @memo usage';
            }
        }
        return this;
    }

    checkMemoCallInFunction() {
        if (this.scopes[this.scopes.length - 1]?.isMemo == false) {
            console.error(`Attempt to call @memo-function`);
            throw 'Invalid @memo usage';
        }
        return this;
    }

    updateScriptFunction(scriptFunction: arkts.ScriptFunction, name: string = ''): arkts.ScriptFunction {
        const isStableThis =
            this.stable > 0 &&
            scriptFunction.returnTypeAnnotation !== undefined &&
            arkts.isTSThisType(scriptFunction.returnTypeAnnotation);
        const [body, memoParametersDeclaration, syntheticReturnStatement] = updateFunctionBody(
            scriptFunction.body as arkts.BlockStatement,
            castParameters(scriptFunction.params),
            scriptFunction.returnTypeAnnotation,
            isStableThis,
            this.positionalIdTracker.id(name)
        );
        const afterParameterTransformer = this.parameterTransformer
            .withParameters(scriptFunction.params as arkts.ETSParameterExpression[])
            .skip(memoParametersDeclaration)
            .visitor(body);
        const afterReturnTransformer = this.returnTransformer
            .skip(syntheticReturnStatement)
            .rewriteThis(this.stable > 0)
            .visitor(afterParameterTransformer);
        const updateScriptFunction = arkts.factory.updateScriptFunction(
            scriptFunction,
            afterReturnTransformer,
            arkts.FunctionSignature.createFunctionSignature(
                scriptFunction.typeParams,
                [
                    ...factory.createHiddenParameters(),
                    ...scriptFunction.params, // we handle function params with signature-transformer
                ],
                scriptFunction.returnTypeAnnotation,
                scriptFunction.hasReceiver
            ),
            scriptFunction.flags,
            scriptFunction.modifiers
        );
        return updateScriptFunction;
    }

    private updateMethodDefinition(node: arkts.MethodDefinition): arkts.MethodDefinition {
        let updateMethod: arkts.MethodDefinition;
        const that = this;
        const updateOverloads = node.overloads?.map((overload) => that.visitor(overload)) ?? undefined;
        if (
            node.scriptFunction.body &&
            (hasMemoAnnotation(node.scriptFunction) || hasMemoIntrinsicAnnotation(node.scriptFunction))
        ) {
            updateMethod = arkts.factory.updateMethodDefinition(
                node,
                node.kind,
                node.name,
                arkts.factory.createFunctionExpression(
                    this.signatureTransformer.visitor(
                        removeMemoAnnotation(this.updateScriptFunction(node.scriptFunction, node.name.name))
                    )
                ),
                node.modifiers,
                false
            );
        } else {
            updateMethod = arkts.factory.updateMethodDefinition(
                node,
                node.kind,
                node.name,
                arkts.factory.createFunctionExpression(this.signatureTransformer.visitor(node.scriptFunction)),
                node.modifiers,
                false
            );
        }
        if (!!updateOverloads) {
            updateMethod.setOverloads(castOverloadsToMethods(updateOverloads));
        }
        return updateMethod;
    }

    private updateDeclaredMemoCall(node: arkts.CallExpression, decl: arkts.MethodDefinition): arkts.CallExpression {
        this.checkMemoCallInMethod(decl);
        const updatedArguments = node.arguments.map((it, index) => {
            const type = (decl.scriptFunction.params[index] as arkts.ETSParameterExpression)?.type;
            if (type && arkts.isETSFunctionType(type)) {
                if (
                    !hasMemoAnnotation(decl.scriptFunction.params[index] as arkts.ETSParameterExpression) &&
                    !hasMemoIntrinsicAnnotation(decl.scriptFunction.params[index] as arkts.ETSParameterExpression)
                ) {
                    return it; //factory.createComputeExpression(this.positionalIdTracker.id(decl.name.name), it)
                }
                if (arkts.isArrowFunctionExpression(it)) {
                    this.enterAnonymousScope(it.scriptFunction);
                    const res = this.updateScriptFunction(it.scriptFunction);
                    this.exitAnonymousScope();
                    return arkts.factory.updateArrowFunction(it, res);
                }
            }
            return it;
        });
        return arkts.factory.updateCallExpression(node, node.expression, undefined, [
            ...factory.createHiddenArguments(this.positionalIdTracker.id(decl.name.name)),
            ...updatedArguments,
        ]);
    }

    private updateAnonymousMemoCall(
        node: arkts.CallExpression,
        expression: arkts.ArrowFunctionExpression
    ): arkts.CallExpression {
        const scope = this.scopes[this.scopes.length - 1];
        const isValidScope = !!scope && scope.name === expression.scriptFunction.id?.name;
        if (!isValidScope) {
            return node;
        }
        this.exitAnonymousScope();
        if (!scope.isMemo) {
            return node;
        }
        this.checkMemoCallInFunction();

        this.enterAnonymousScope(expression.scriptFunction);
        const res = this.updateScriptFunction(expression.scriptFunction, expression.scriptFunction.id?.name);
        this.exitAnonymousScope();

        return arkts.factory.updateCallExpression(
            node,
            arkts.factory.updateArrowFunction(expression, res),
            node.typeArguments,
            [...factory.createHiddenArguments(this.positionalIdTracker.id()), ...node.arguments]
        );
    }

    private updateCallExpression(node: arkts.CallExpression): arkts.CallExpression {
        const expr = node.expression;
        const decl = arkts.getDecl(expr);
        if (!decl || !arkts.isMethodDefinition(decl)) {
            return node;
        }
        if (
            (decl.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET &&
                findMemoFromTypeAnnotation(decl.scriptFunction.returnTypeAnnotation)) ||
            hasMemoAnnotation(decl.scriptFunction) ||
            hasMemoIntrinsicAnnotation(decl.scriptFunction)
        ) {
            return this.updateDeclaredMemoCall(node, decl);
        }
        if (isStandaloneArrowFunction(node.expression)) {
            return this.updateAnonymousMemoCall(node, node.expression);
        }
        return node;
    }

    private updateClassProperty(node: arkts.ClassProperty, key: arkts.Identifier): arkts.ClassProperty {
        const scope = this.scopes[this.scopes.length - 1];
        const isValidScope = !!scope && scope.name === key.name;
        if (!isValidScope) {
            return node;
        }
        this.exitAnonymousScope();
        if (!scope.isMemo) {
            return node;
        }

        let res: arkts.ScriptFunction | undefined;
        if (!!node.value && arkts.isArrowFunctionExpression(node.value)) {
            this.enterAnonymousScope(node.value.scriptFunction);
            res = this.updateScriptFunction(node.value.scriptFunction, key.name);
            this.exitAnonymousScope();
        }

        let typeAnnotation: arkts.TypeNode | undefined;
        if (!!node.typeAnnotation && !(typeAnnotation = updateMemoTypeAnnotation(node.typeAnnotation))) {
            console.error(`ETSFunctionType or ETSUnionType expected for @memo-property ${key.name}`);
            throw 'Invalid @memo usage';
        }

        return arkts.factory.updateClassProperty(
            node,
            node.key,
            res ? arkts.factory.updateArrowFunction(castArrowFunctionExpression(node.value), res) : undefined,
            typeAnnotation,
            node.modifiers,
            node.isComputed
        );
    }

    private updateTSTypeAliasDeclaration(node: arkts.TSTypeAliasDeclaration): arkts.TSTypeAliasDeclaration {
        const scope = this.scopes[this.scopes.length - 1];
        const isValidScope = !!scope && scope.name === node.id?.name;
        if (!isValidScope) {
            return node;
        }
        this.exitAnonymousScope();
        if (!scope.isMemo) {
            return node;
        }

        let typeAnnotation: arkts.TypeNode | undefined;
        if (!(typeAnnotation = updateMemoTypeAnnotation(node.typeAnnotation))) {
            console.error(`ETSFunctionType or ETSUnionType expected for @memo-type ${node.id!.name}`);
            throw 'Invalid @memo usage';
        }

        return arkts.factory.updateTSTypeAliasDeclaration(node, node.id, node.typeParams, typeAnnotation);
    }

    private updateStandaloneArrowFunction(node: arkts.ArrowFunctionExpression): arkts.ArrowFunctionExpression {
        const scope = this.scopes[this.scopes.length - 1];
        const isValidScope = !!scope && scope.name === node.scriptFunction.id?.name;
        if (!isValidScope) {
            return node;
        }
        this.exitAnonymousScope();
        if (!scope.isMemo) {
            return node;
        }

        this.enterAnonymousScope(node.scriptFunction);
        const res = this.updateScriptFunction(node.scriptFunction, node.scriptFunction.id?.name);
        this.exitAnonymousScope();

        return arkts.factory.updateArrowFunction(node, res);
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        this.enter(beforeChildren);
        const node = this.visitEachChild(beforeChildren);
        this.exit(beforeChildren);
        if (arkts.isMethodDefinition(node)) {
            return this.updateMethodDefinition(node);
        }
        if (arkts.isCallExpression(node)) {
            return this.updateCallExpression(node);
        }
        if (arkts.isClassProperty(node) && !!node.key && arkts.isIdentifier(node.key)) {
            return this.updateClassProperty(node, node.key);
        }
        if (arkts.isTSTypeAliasDeclaration(node)) {
            return this.updateTSTypeAliasDeclaration(node);
        }
        if (isStandaloneArrowFunction(node)) {
            return this.updateStandaloneArrowFunction(node);
        }
        return node;
    }
}
