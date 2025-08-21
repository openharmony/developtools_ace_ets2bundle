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
    buildReturnTypeInfo,
    castParameters,
    findReturnTypeFromTypeAnnotation,
    isMemoETSParameterExpression,
    isMemoParametersDeclaration,
    isUnmemoizedInFunctionParams,
    MemoInfo,
    ParamInfo,
    PositionalIdTracker,
    ReturnTypeInfo,
    RuntimeNames,
} from './utils';
import { ReturnTransformer } from './return-transformer';

export interface ParameterTransformerOptions extends VisitorOptions {
    positionalIdTracker: PositionalIdTracker;
}

interface RewriteMemoInfo extends MemoInfo {
    rewritePeer: number;
}

export class ParameterTransformer extends AbstractVisitor {
    private rewriteIdentifiers?: Map<number, () => arkts.MemberExpression | arkts.Identifier>;
    private rewriteCalls?: Map<number, (passArgs: arkts.Expression[]) => arkts.CallExpression>;
    private rewriteMemoInfos?: Map<number, RewriteMemoInfo>;
    private rewriteThis?: boolean;
    private skipNode?: arkts.VariableDeclaration;
    private visited: Set<number>;

    private positionalIdTracker: PositionalIdTracker;

    constructor(options: ParameterTransformerOptions) {
        super(options);
        this.positionalIdTracker = options.positionalIdTracker;
        this.visited = new Set();
    }

    reset(): void {
        super.reset();
        this.rewriteIdentifiers = undefined;
        this.rewriteCalls = undefined;
        this.rewriteMemoInfos = undefined;
        this.skipNode = undefined;
        this.visited.clear();
    }

    withThis(flag: boolean): ParameterTransformer {
        this.rewriteThis = flag;
        return this;
    }

    withParameters(parameters: ParamInfo[]): ParameterTransformer {
        this.rewriteCalls = new Map(
            parameters
                .filter(
                    (it) =>
                        it.param.type && (arkts.isETSFunctionType(it.param.type) || arkts.isETSUnionType(it.param.type))
                )
                .map((it) => {
                    return [
                        it.param.identifier.name.startsWith(RuntimeNames.GENSYM)
                            ? it.ident.originalPeer
                            : it.param.originalPeer,
                        (passArgs: arkts.Expression[]): arkts.CallExpression => {
                            return factory.createMemoParameterAccessCall(it.ident.name, passArgs);
                        },
                    ];
                })
        );
        this.rewriteIdentifiers = new Map(
            parameters.map((it) => {
                return [
                    it.param.identifier.name.startsWith(RuntimeNames.GENSYM)
                        ? it.ident.originalPeer
                        : it.param.originalPeer,
                    (): arkts.MemberExpression => {
                        return factory.createMemoParameterAccess(it.ident.name);
                    },
                ];
            })
        );
        this.rewriteMemoInfos = new Map(
            parameters.map((it) => {
                return [
                    it.param.identifier.name.startsWith(RuntimeNames.GENSYM)
                        ? it.ident.originalPeer
                        : it.param.originalPeer,
                    {
                        name: it.param.identifier.name,
                        rewritePeer: it.param.identifier.originalPeer,
                        isMemo: isMemoETSParameterExpression(it.param),
                    },
                ];
            })
        );
        return this;
    }

    skip(memoParametersDeclaration?: arkts.VariableDeclaration): ParameterTransformer {
        this.skipNode = memoParametersDeclaration;
        return this;
    }

    track(node: arkts.AstNode | undefined): void {
        if (!!node?.peer) {
            this.visited.add(node.peer);
        }
    }

    isTracked(node: arkts.AstNode | undefined): boolean {
        return !!node?.peer && this.visited.has(node.peer);
    }

    private updateArrowFunctionFromVariableDeclareInit(
        initializer: arkts.ArrowFunctionExpression,
        returnType: arkts.TypeNode | undefined
    ): arkts.ArrowFunctionExpression {
        const scriptFunction = initializer.scriptFunction;
        if (!scriptFunction.body || !arkts.isBlockStatement(scriptFunction.body)) {
            return initializer;
        }
        if (isUnmemoizedInFunctionParams(scriptFunction.params)) {
            return initializer;
        }
        const returnTypeInfo: ReturnTypeInfo = buildReturnTypeInfo(
            returnType ?? scriptFunction.returnTypeAnnotation,
            true
        );
        const [body, parameterIdentifiers, memoParametersDeclaration, syntheticReturnStatement] =
            factory.updateFunctionBody(
                scriptFunction.body,
                castParameters(scriptFunction.params),
                returnTypeInfo,
                this.positionalIdTracker.id()
            );
        const paramaterTransformer = new ParameterTransformer({
            positionalIdTracker: this.positionalIdTracker,
        });
        const returnTransformer = new ReturnTransformer();
        const afterParameterTransformer = paramaterTransformer
            .withParameters(parameterIdentifiers)
            .skip(memoParametersDeclaration)
            .visitor(body);
        const afterReturnTransformer = returnTransformer
            .skip(syntheticReturnStatement)
            .registerReturnTypeInfo(returnTypeInfo)
            .visitor(afterParameterTransformer);
        const updateScriptFunction = factory.updateScriptFunctionWithMemoParameters(
            scriptFunction,
            afterReturnTransformer,
            returnTypeInfo.node
        );
        paramaterTransformer.reset();
        returnTransformer.reset();
        this.track(updateScriptFunction.body);
        return arkts.factory.updateArrowFunction(initializer, updateScriptFunction);
    }

    private updateVariableDeclareInit<T extends arkts.AstNode>(
        initializer: T | undefined,
        returnType: arkts.TypeNode | undefined
    ): T | undefined {
        if (!initializer) {
            return undefined;
        }
        if (arkts.isConditionalExpression(initializer)) {
            return arkts.factory.updateConditionalExpression(
                initializer,
                initializer.test,
                this.updateVariableDeclareInit(initializer.consequent, returnType),
                this.updateVariableDeclareInit(initializer.alternate, returnType)
            ) as unknown as T;
        }
        if (arkts.isTSAsExpression(initializer)) {
            return arkts.factory.updateTSAsExpression(
                initializer,
                this.updateVariableDeclareInit(initializer.expr, returnType),
                factory.updateMemoTypeAnnotation(initializer.typeAnnotation),
                initializer.isConst
            ) as unknown as T;
        }
        if (arkts.isArrowFunctionExpression(initializer)) {
            return this.updateArrowFunctionFromVariableDeclareInit(initializer, returnType) as unknown as T;
        }
        return initializer;
    }

    private updateParamReDeclare(node: arkts.VariableDeclarator, memoInfo: RewriteMemoInfo): arkts.VariableDeclarator {
        const shouldUpdate: boolean = node.name.name !== memoInfo.name && memoInfo.isMemo;
        if (!shouldUpdate) {
            return node;
        }
        const decl = arkts.getPeerDecl(memoInfo.rewritePeer);
        if (!decl || !arkts.isEtsParameterExpression(decl)) {
            return node;
        }

        let typeAnnotation: arkts.TypeNode | undefined;
        if (
            !!node.name.typeAnnotation &&
            !(typeAnnotation = factory.updateMemoTypeAnnotation(node.name.typeAnnotation))
        ) {
            console.error(`ETSFunctionType or ETSUnionType expected for @memo-variable-type ${node.name.name}`);
            throw 'Invalid @memo usage';
        }

        const returnType = findReturnTypeFromTypeAnnotation(decl.type);
        return arkts.factory.updateVariableDeclarator(
            node,
            node.flag,
            arkts.factory.updateIdentifier(node.name, node.name.name, typeAnnotation),
            this.updateVariableDeclareInit(node.initializer, returnType)
        );
    }

    private updateVariableReDeclarationFromParam(node: arkts.VariableDeclaration): arkts.VariableDeclaration {
        return arkts.factory.updateVariableDeclaration(
            node,
            node.modifiers,
            node.declarationKind,
            node.declarators.map((declarator) => {
                if (this.rewriteMemoInfos?.has(declarator.name.originalPeer)) {
                    const memoInfo = this.rewriteMemoInfos.get(declarator.name.originalPeer)!;
                    return this.updateParamReDeclare(declarator, memoInfo);
                }
                if (!!declarator.initializer && arkts.isIdentifier(declarator.initializer)) {
                    const decl = arkts.getPeerDecl(declarator.initializer.originalPeer);
                    if (decl && this.rewriteIdentifiers?.has(decl.peer)) {
                        return arkts.factory.updateVariableDeclarator(
                            declarator,
                            declarator.flag,
                            declarator.name,
                            this.rewriteIdentifiers.get(decl.peer)!()
                        );
                    }
                }
                return declarator;
            })
        );
    }

    private updateCallReDeclare(
        node: arkts.CallExpression,
        oriName: arkts.Identifier,
        memoInfo: RewriteMemoInfo
    ): arkts.CallExpression {
        const shouldUpdate: boolean = oriName.name !== memoInfo.name && memoInfo.isMemo;
        if (!shouldUpdate) {
            return node;
        }
        return factory.insertHiddenArgumentsToCall(node, this.positionalIdTracker.id(oriName.name));
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        // TODO: temporary checking skip nodes by comparison with expected skip nodes
        // Should be fixed when update procedure implemented properly
        if (/* beforeChildren === this.skipNode */ isMemoParametersDeclaration(beforeChildren)) {
            return beforeChildren;
        }
        if (arkts.isVariableDeclaration(beforeChildren)) {
            return this.updateVariableReDeclarationFromParam(beforeChildren);
        }
        if (arkts.isCallExpression(beforeChildren) && arkts.isIdentifier(beforeChildren.expression)) {
            const decl = arkts.getPeerDecl(beforeChildren.expression.originalPeer);
            if (decl && this.rewriteCalls?.has(decl.peer)) {
                const updateCall = this.rewriteCalls.get(decl.peer)!(
                    beforeChildren.arguments.map((it) => this.visitor(it) as arkts.Expression)
                );
                if (this.rewriteMemoInfos?.has(decl.peer)) {
                    const memoInfo = this.rewriteMemoInfos.get(decl.peer)!;
                    return this.updateCallReDeclare(updateCall, beforeChildren.expression, memoInfo);
                }
                return updateCall;
            }
        }
        const node = this.visitEachChild(beforeChildren);
        if (arkts.isIdentifier(node)) {
            const decl = arkts.getPeerDecl(node.originalPeer);
            if (decl && this.rewriteIdentifiers?.has(decl.peer)) {
                return this.rewriteIdentifiers.get(decl.peer)!();
            }
        }
        if (arkts.isThisExpression(node) && this.rewriteThis) {
            return factory.createMemoParameterAccess(RuntimeNames.THIS);
        }
        return node;
    }
}
