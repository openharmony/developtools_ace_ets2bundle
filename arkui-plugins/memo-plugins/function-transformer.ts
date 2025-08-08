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
    MemoInfo,
    PositionalIdTracker,
    ReturnTypeInfo,
    buildReturnTypeInfo,
    castArrowFunctionExpression,
    castIdentifier,
    castParameters,
    findMemoFromTypeAnnotation,
    findThisAttribute,
    getDeclResolveAlias,
    hasMemoAnnotation,
    hasMemoEntryAnnotation,
    hasMemoIntrinsicAnnotation,
    hasMemoStableAnnotation,
    isDeclaredMethodWithMemoParams,
    isFunctionProperty,
    isMemoArrowFunction,
    isMemoClassProperty,
    isMemoDeclaredClassProperty,
    isMemoDeclaredIdentifier,
    isMemoDeclaredMethod,
    isMemoETSParameterExpression,
    isMemoMethodDefinition,
    isMemoProperty,
    isMemoTSTypeAliasDeclaration,
    isMemoThisAttribute,
    isMemoVariableDeclarator,
    isStandaloneArrowFunction,
    isThisAttributeAssignment,
    removeMemoAnnotation,
    parametrizedNodeHasReceiver,
    isScriptFunctionFromInterfaceGetterSetter,
    isScriptFunctionFromGetter,
    isScriptFunctionFromSetter
} from './utils';
import { ParameterTransformer } from './parameter-transformer';
import { ReturnTransformer } from './return-transformer';
import { SignatureTransformer } from './signature-transformer';
import { moveToFront } from '../common/arkts-utils';
import { InternalsTransformer } from './internal-transformer';
import {
    CachedMetadata,
    rewriteByType,
    prepareRewriteScriptFunctionParameters,
    prepareRewriteScriptFunctionReturnType
} from './memo-cache-factory';
import { NodeCacheNames } from '../common/predefines';
import { NodeCacheFactory } from '../common/node-cache';

interface ScopeInfo extends MemoInfo {
    regardAsSameScope?: boolean;
}

export interface FunctionTransformerOptions extends VisitorOptions {
    positionalIdTracker: PositionalIdTracker;
    parameterTransformer: ParameterTransformer;
    returnTransformer: ReturnTransformer;
    signatureTransformer: SignatureTransformer;
    internalsTransformer?: InternalsTransformer;
    useCache?: boolean;
}

export class FunctionTransformer extends AbstractVisitor {
    private readonly positionalIdTracker: PositionalIdTracker;
    private readonly parameterTransformer: ParameterTransformer;
    private readonly returnTransformer: ReturnTransformer;
    private readonly signatureTransformer: SignatureTransformer;
    private readonly internalsTransformer?: InternalsTransformer;
    private readonly useCache: boolean;

    /* Tracking whether should import `__memo_context_type` and `__memo_id_type` */
    private modified = false;

    constructor(options: FunctionTransformerOptions) {
        super(options);
        this.positionalIdTracker = options.positionalIdTracker;
        this.parameterTransformer = options.parameterTransformer;
        this.returnTransformer = options.returnTransformer;
        this.signatureTransformer = options.signatureTransformer;
        this.internalsTransformer = options.internalsTransformer;
        this.useCache = !!options.useCache;
    }

    private scopes: ScopeInfo[] = [];
    private stable: number = 0;

    reset() {
        super.reset();
        this.scopes = [];
        this.stable = 0;
        this.modified = false;
        this.parameterTransformer.reset();
        this.returnTransformer.reset();
        this.signatureTransformer.reset();
    }

    private enterMethod(node: arkts.MethodDefinition): void {
        const name = node.id!.name;
        const isMemo = isMemoMethodDefinition(node);
        this.scopes.push({ name, isMemo });
    }

    private enterClassPropety(node: arkts.ClassProperty): void {
        const name = castIdentifier(node.key).name;
        const isMemo = isMemoClassProperty(node);
        this.scopes.push({ name, isMemo });
    }

    private enterStandaloneArrowFunction(node: arkts.ArrowFunctionExpression): void {
        const name = undefined;
        const isMemo = isMemoArrowFunction(node);
        this.scopes.push({ name, isMemo });
    }

    private enterTSTypeAliasDeclaration(node: arkts.TSTypeAliasDeclaration): void {
        const name = castIdentifier(node.id).name;
        const isMemo = isMemoTSTypeAliasDeclaration(node);
        this.scopes.push({ name, isMemo });
    }

    private enterVariableDeclarator(node: arkts.VariableDeclarator): void {
        const name = (node.id as arkts.Identifier).name;
        const isMemo = isMemoVariableDeclarator(node);
        this.scopes.push({ name, isMemo, regardAsSameScope: !!node.init });
    }

    private enterTSAsExpression(node: arkts.TSAsExpression): void {
        const isMemo = findMemoFromTypeAnnotation(node.typeAnnotation);
        this.scopes.push({ isMemo });
    }

    private enterFunctionProperty(node: arkts.Property): void {
        const name = castIdentifier(node.key).name;
        const isMemo = isMemoProperty(node, castArrowFunctionExpression(node.value));
        this.scopes.push({ name, isMemo });
    }

    private enterThisAttributeAssignment(node: arkts.AssignmentExpression): void {
        const thisAttribute = findThisAttribute(node.left!)!;
        const name = thisAttribute.name;
        const isMemo = isMemoThisAttribute(thisAttribute, castArrowFunctionExpression(node.right));
        this.scopes.push({ name, isMemo });
    }

    enter(node: arkts.AstNode): this {
        if (arkts.isMethodDefinition(node)) {
            this.enterMethod(node);
        }
        if (arkts.isClassProperty(node) && !!node.key && arkts.isIdentifier(node.key)) {
            this.enterClassPropety(node);
        }
        if (isStandaloneArrowFunction(node)) {
            this.enterStandaloneArrowFunction(node);
        }
        if (arkts.isTSTypeAliasDeclaration(node) && !!node.id && !!node.typeAnnotation) {
            this.enterTSTypeAliasDeclaration(node);
        }
        if (arkts.isVariableDeclarator(node)) {
            this.enterVariableDeclarator(node);
        }
        if (arkts.isTSAsExpression(node) && !!node.expr && arkts.isArrowFunctionExpression(node.expr)) {
            this.enterTSAsExpression(node);
        }
        if (isFunctionProperty(node)) {
            this.enterFunctionProperty(node);
        }
        if (isThisAttributeAssignment(node) && !!node.right && arkts.isArrowFunctionExpression(node.right)) {
            this.enterThisAttributeAssignment(node);
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
        const scope = this.scopes[this.scopes.length - 1];
        if (scope?.regardAsSameScope === false && scope?.isMemo === false) {
            if (scope.name) {
                console.error(`Attempt to call @memo-method ${decl.id!.name} from non-@memo-method ${scope.name}`);
                throw 'Invalid @memo usage';
            } else {
                console.error(`Attempt to call @memo-method ${decl.id!.name} from anonymous non-@memo-method`);
                throw 'Invalid @memo usage';
            }
        }
        return this;
    }

    checkMemoCallInFunction() {
        const scope = this.scopes[this.scopes.length - 1];
        if (scope?.regardAsSameScope === false && scope?.isMemo === false) {
            console.error(`Attempt to call @memo-function`);
            throw 'Invalid @memo usage';
        }
        return this;
    }

    updateInternalsInScriptFunction(scriptFunction: arkts.ScriptFunction): arkts.ScriptFunction {
        if (!scriptFunction.body || !arkts.isBlockStatement(scriptFunction.body) || !this.internalsTransformer) {
            return scriptFunction;
        }
        const afterInternalsTransformer = this.internalsTransformer.visitor(
            scriptFunction.body
        ) as arkts.BlockStatement;
        return arkts.factory.updateScriptFunction(
            scriptFunction,
            afterInternalsTransformer,
            scriptFunction.typeParams,
            scriptFunction.params,
            scriptFunction.returnTypeAnnotation,
            scriptFunction.hasReceiver,
            scriptFunction.flags,
            scriptFunction.modifiers,
            scriptFunction.id ?? undefined,
            scriptFunction.annotations ?? undefined,
            scriptFunction.getSignaturePointer?.() ?? undefined,
            scriptFunction.getPreferredReturnTypePointer?.() ?? undefined
        );
    }    

    updateScriptFunctionFromInterfaceGetterSetter(node: arkts.ScriptFunction): arkts.ScriptFunction {
        const _isGetter = isScriptFunctionFromGetter(node);
        const _isSetter = isScriptFunctionFromSetter(node);
        const _hasReceiver = node.hasReceiver;
        const newParams = prepareRewriteScriptFunctionParameters(
            node,
            _isSetter,
            _isGetter,
            _hasReceiver
        );
        const newReturnType: arkts.TypeNode | undefined = prepareRewriteScriptFunctionReturnType(
            node,
            _isGetter,
            _hasReceiver
        );
        node.setParams(newParams);
        if (!!newReturnType) {
            node.setReturnTypeAnnotation(newReturnType);
        }
        return node;
    }

    updateScriptFunction(scriptFunction: arkts.ScriptFunction, name: string = ''): arkts.ScriptFunction {
        if (!scriptFunction.body || !arkts.isBlockStatement(scriptFunction.body)) {
            return scriptFunction;
        }
        if (this.parameterTransformer.isTracked(scriptFunction.body)) {
            return this.updateInternalsInScriptFunction(scriptFunction);
        }
        if (hasMemoIntrinsicAnnotation(scriptFunction) || hasMemoEntryAnnotation(scriptFunction)) {
            return this.updateInternalsInScriptFunction(scriptFunction);
        }
        if (isScriptFunctionFromInterfaceGetterSetter(scriptFunction)) {
            return this.updateScriptFunctionFromInterfaceGetterSetter(scriptFunction);
        }
        const returnType = scriptFunction.returnTypeAnnotation;
        const isStableThis = this.stable > 0 && returnType !== undefined && arkts.isTSThisType(returnType);
        const returnTypeInfo: ReturnTypeInfo = buildReturnTypeInfo(
            returnType,
            findMemoFromTypeAnnotation(returnType),
            isStableThis
        );
        const [body, parameterIdentifiers, memoParametersDeclaration, syntheticReturnStatement] =
            factory.updateFunctionBody(
                scriptFunction.body,
                castParameters(scriptFunction.params),
                returnTypeInfo,
                this.positionalIdTracker.id(name)
            );
        const afterParameterTransformer = this.parameterTransformer
            .withParameters(parameterIdentifiers)
            .skip(memoParametersDeclaration)
            .visitor(body);
        const afterReturnTransformer = this.returnTransformer
            .skip(syntheticReturnStatement)
            .registerReturnTypeInfo(returnTypeInfo)
            .rewriteThis(this.stable > 0)
            .visitor(afterParameterTransformer);
        const updateScriptFunction = factory.updateScriptFunctionWithMemoParameters(
            scriptFunction,
            afterReturnTransformer,
            returnTypeInfo.node
        );
        this.modified = true;
        this.parameterTransformer.track(updateScriptFunction.body);
        return this.updateInternalsInScriptFunction(updateScriptFunction);
    }

    private updateMethodDefinition(node: arkts.MethodDefinition): arkts.MethodDefinition {
        let updateMethod: arkts.MethodDefinition;
        const isMemo =
            hasMemoAnnotation(node.function!) ||
            hasMemoIntrinsicAnnotation(node.function!) ||
            hasMemoEntryAnnotation(node.function!);
        const value = node.value as arkts.FunctionExpression;
        if (isMemo && node.function!.body) {
            const hasIntrinsic = hasMemoIntrinsicAnnotation(node.function!);
            updateMethod = arkts.factory.updateMethodDefinition(
                node,
                node.kind,
                node.key,
                arkts.factory.updateFunctionExpression(value, value.id?.clone(),
                    this.signatureTransformer.visitor(
                        removeMemoAnnotation(this.updateScriptFunction(value.function!, node.id!.name)),
                        hasIntrinsic
                    )
                ),
                node.modifierFlags,
                false,
                node.overloads
            );
        } else {
            updateMethod = arkts.factory.updateMethodDefinition(
                node,
                node.kind,
                node.key,
                arkts.factory.updateFunctionExpression(value, value.id,
                    this.signatureTransformer.visitor(value.function!)
                ),
                node.modifierFlags,
                false,
                node.overloads
            );
        }
        this.modified ||= this.signatureTransformer.modified;
        return updateMethod;
    }

    private updateDeclaredMethodMemoCall(
        node: arkts.CallExpression,
        decl: arkts.MethodDefinition,
        ignoreSelf: boolean = false
    ): arkts.CallExpression {
        let updatedArguments: arkts.Expression[] = node.arguments.map((it, index) => {
            const param = decl.function!.params.at(index);
            if (!param || !arkts.isETSParameterExpression(param)) {
                return it;
            }
            if (isMemoETSParameterExpression(param) && arkts.isArrowFunctionExpression(it)) {
                this.enterAnonymousScope(it.function!);
                const res = this.updateScriptFunction(it.function!);
                this.exitAnonymousScope();
                this.modified = true;
                return arkts.factory.updateArrowFunctionExpression(it, res, it.annotations);
            }
            return it;
        });
        if (!ignoreSelf) {
            this.checkMemoCallInMethod(decl);
            updatedArguments = [
                ...factory.createHiddenArguments(this.positionalIdTracker.id(decl.id!.name)),
                ...updatedArguments,
            ];
        }
        const isMemo =
            hasMemoAnnotation(decl.function!) ||
            hasMemoIntrinsicAnnotation(decl.function!) ||
            hasMemoEntryAnnotation(decl.function!);
        if (parametrizedNodeHasReceiver(decl.function!) && isMemo) {
            updatedArguments = moveToFront(updatedArguments, 2);
        }
        this.modified = true;
        return arkts.factory.updateCallExpression(node, node.callee, updatedArguments, node.typeParams, node.isOptional, node.hasTrailingComma, node.trailingBlock);
    }

    private updateDeclaredCallWithName(node: arkts.CallExpression, name: string): arkts.CallExpression {
        this.modified = true;
        return factory.insertHiddenArgumentsToCall(node, this.positionalIdTracker.id(name));
    }

    private updateAnonymousCallWithMemoParams(node: arkts.CallExpression): arkts.CallExpression {
        let newExpression: arkts.Expression = node.callee!;
        if (isStandaloneArrowFunction(node.callee!)) {
            newExpression = arkts.factory.updateArrowFunctionExpression(
                node.callee,
                this.signatureTransformer.visitor(node.callee.function!),
                node.callee.annotations
            );
        }
        const that = this;
        const updatedArguments: arkts.Expression[] = node.arguments.map((it) => {
            if (arkts.isArrowFunctionExpression(it) && isMemoArrowFunction(it)) {
                that.enterAnonymousScope(it.function!);
                const res = that.updateScriptFunction(it.function!);
                that.exitAnonymousScope();
                that.modified = true;
                return arkts.factory.updateArrowFunctionExpression(it, res, it.annotations);
            }
            return it;
        });
        this.modified ||= this.signatureTransformer.modified;
        return arkts.factory.updateCallExpression(node, newExpression, updatedArguments, node.typeParams, node.isOptional, node.hasTrailingComma, node.trailingBlock    );
    }

    private updateAnonymousMemoCall(
        node: arkts.CallExpression,
        expression: arkts.ArrowFunctionExpression
    ): arkts.CallExpression {
        const scope = this.scopes[this.scopes.length - 1];
        const isValidScope = !!scope && scope.name === expression.function!.id?.name;
        if (!isValidScope) {
            return node;
        }
        this.exitAnonymousScope();
        if (!scope.isMemo) {
            return this.updateAnonymousCallWithMemoParams(node);
        }
        this.checkMemoCallInFunction();

        this.enterAnonymousScope(expression.function!);
        const res = this.updateScriptFunction(expression.function!, expression.function!.id?.name);
        this.exitAnonymousScope();

        const newNode = this.updateAnonymousCallWithMemoParams(node);
        this.modified = true;
        return arkts.factory.updateCallExpression(
            node,
            arkts.factory.updateArrowFunctionExpression(expression, res, expression.annotations),
            [...factory.createHiddenArguments(this.positionalIdTracker.id()), ...newNode.arguments],
            newNode.typeParams, node.isOptional, node.hasTrailingComma, node.trailingBlock
        );
    }

    private updateCallExpressionWithNoDecl(node: arkts.CallExpression): arkts.CallExpression {
        if (isStandaloneArrowFunction(node.callee!)) {
            return this.updateAnonymousMemoCall(node, node.callee);
        }
        return this.updateAnonymousCallWithMemoParams(node);
    }

    private updateCallExpression(node: arkts.CallExpression): arkts.CallExpression {
        const expr = node.callee!;
        const decl = getDeclResolveAlias(expr);
        if (!decl) {
            return this.updateCallExpressionWithNoDecl(node);
        }
        if (arkts.isMethodDefinition(decl) && isMemoDeclaredMethod(decl)) {
            return this.updateDeclaredMethodMemoCall(node, decl);
        }
        if (arkts.isMethodDefinition(decl) && isDeclaredMethodWithMemoParams(decl)) {
            return this.updateDeclaredMethodMemoCall(node, decl, true);
        }
        if (arkts.isIdentifier(decl) && isMemoDeclaredIdentifier(decl)) {
            return this.updateDeclaredCallWithName(node, decl.name);
        }
        if (
            arkts.isClassProperty(decl) &&
            isMemoDeclaredClassProperty(decl) &&
            !!decl.key &&
            arkts.isIdentifier(decl.key)
        ) {
            return this.updateDeclaredCallWithName(node, decl.key.name);
        }
        if (arkts.isETSParameterExpression(decl) && isMemoETSParameterExpression(decl)) {
            return this.updateDeclaredCallWithName(node, decl.ident!.name);
        }
        return this.updateCallExpressionWithNoDecl(node);
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
            this.enterAnonymousScope(node.value.function!);
            res = this.updateScriptFunction(node.value.function!, key.name);
            this.exitAnonymousScope();
        }

        let typeAnnotation: arkts.TypeNode | undefined;
        if (!!node.typeAnnotation && !(typeAnnotation = factory.updateMemoTypeAnnotation(node.typeAnnotation))) {
            console.error(`ETSFunctionType or ETSUnionType expected for @memo-property ${key.name}`);
            throw 'Invalid @memo usage';
        }

        this.modified = true;
        const nodeArrowFunction = castArrowFunctionExpression(node.value);
        return arkts.factory.updateClassProperty(
            node,
            node.key,
            res ? arkts.factory.updateArrowFunctionExpression(nodeArrowFunction, res, nodeArrowFunction.annotations) : undefined,
            typeAnnotation,
            node.modifiers,
            node.isComputed,
            node.annotations
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
            if (!!node.typeAnnotation) {
                const newNode = arkts.factory.updateTSTypeAliasDeclaration(
                    node,
                    node.id,
                    node.typeParams,
                    this.signatureTransformer.visitor(node.typeAnnotation),
                    node.annotations
                );
                this.modified ||= this.signatureTransformer.modified;
                return newNode;
            }
            return node;
        }

        let typeAnnotation: arkts.TypeNode | undefined;
        if (!(typeAnnotation = factory.updateMemoTypeAnnotation(node.typeAnnotation))) {
            console.error(`ETSFunctionType or ETSUnionType expected for @memo-type ${node.id!.name}`);
            throw 'Invalid @memo usage';
        }

        this.modified = true;
        return arkts.factory.updateTSTypeAliasDeclaration(node, node.id, node.typeParams, typeAnnotation, node.annotations);
    }

    private updateStandaloneArrowFunction(node: arkts.ArrowFunctionExpression): arkts.ArrowFunctionExpression {
        const scope = this.scopes[this.scopes.length - 1];
        const isValidScope = !!scope && scope.name === node.function!.id?.name;
        if (!isValidScope) {
            return node;
        }
        this.exitAnonymousScope();
        if (!scope.isMemo) {
            return arkts.factory.updateArrowFunctionExpression(node, this.signatureTransformer.visitor(node.function!), node.annotations);
        }

        this.enterAnonymousScope(node.function!);
        const res = this.updateScriptFunction(node.function!, node.function!.id?.name);
        this.exitAnonymousScope();

        this.modified = true;
        return arkts.factory.updateArrowFunctionExpression(node, this.signatureTransformer.visitor(res), node.annotations);
    }

    private updateVariableDeclarator(node: arkts.VariableDeclarator): arkts.VariableDeclarator {
        const scope = this.scopes[this.scopes.length - 1];
        const isValidScope = !!scope && scope.name === (node.id as arkts.Identifier).name;
        if (!isValidScope) {
            return node;
        }
        this.exitAnonymousScope();
        if (!scope.isMemo) {
            if (!!node.init && arkts.isArrowFunctionExpression(node.init)) {
                return arkts.factory.updateVariableDeclarator(
                    node,
                    node.flag,
                    node.id,
                    arkts.factory.updateArrowFunctionExpression(
                        node.init,
                        this.signatureTransformer.visitor(node.init.function!),
                        node.init.annotations
                    )
                );
            }
            return node;
        }

        let typeAnnotation: arkts.TypeNode | undefined;
        if (
            !!(node.id as arkts.Identifier).typeAnnotation &&
            !(typeAnnotation = factory.updateMemoTypeAnnotation((node.id as arkts.Identifier).typeAnnotation))
        ) {
            console.error(`ETSFunctionType or ETSUnionType expected for @memo-variable-type ${(node.id as arkts.Identifier).name}`);
            throw 'Invalid @memo usage';
        }

        let initializer: arkts.Expression | undefined = node.init;
        if (!!initializer && arkts.isArrowFunctionExpression(initializer)) {
            this.enterAnonymousScope(initializer.function!);
            const res = this.updateScriptFunction(initializer.function!, initializer.function!.id?.name);
            this.exitAnonymousScope();
            initializer = arkts.factory.updateArrowFunctionExpression(initializer, res, initializer.annotations);
        }

        this.modified = true;
        return arkts.factory.updateVariableDeclarator(
            node,
            node.flag,
            arkts.factory.updateIdentifier((node.id as arkts.Identifier), (node.id as arkts.Identifier).name, typeAnnotation),
            initializer
        );
    }

    private updateTSAsExpression(
        node: arkts.TSAsExpression,
        expr: arkts.ArrowFunctionExpression
    ): arkts.TSAsExpression {
        const scope = this.scopes[this.scopes.length - 1];
        const isValidScope = !!scope;
        if (!isValidScope) {
            return node;
        }
        this.exitAnonymousScope();
        if (!scope.isMemo) {
            return node;
        }

        this.enterAnonymousScope(expr.function!);
        const res = this.updateScriptFunction(expr.function!, expr.function!.id?.name);
        this.exitAnonymousScope();

        let typeAnnotation: arkts.TypeNode | undefined;
        if (!(typeAnnotation = factory.updateMemoTypeAnnotation(node.typeAnnotation))) {
            console.error(`ETSFunctionType or ETSUnionType expected for @memo-as-type`);
            throw 'Invalid @memo usage';
        }

        this.modified = true;
        return arkts.factory.updateTSAsExpression(
            node,
            arkts.factory.updateArrowFunctionExpression(expr, res, expr.annotations),
            typeAnnotation,
            node.isConst
        );
    }

    private updateProperty(
        node: arkts.Property,
        key: arkts.Identifier,
        value: arkts.ArrowFunctionExpression
    ): arkts.Property {
        const scope = this.scopes[this.scopes.length - 1];
        const isValidScope = !!scope && scope.name === key.name;
        if (!isValidScope) {
            return node;
        }
        this.exitAnonymousScope();
        if (!scope.isMemo) {
            return node;
        }
        this.enterAnonymousScope(value.function!);
        const res = this.updateScriptFunction(value.function!, value.function!.id?.name);
        this.exitAnonymousScope();

        this.modified = true;
        return arkts.factory.updateProperty(
            node,
            node.kind,
            key,
            arkts.factory.updateArrowFunctionExpression(value, res, value.annotations),
            node.isMethod,
            node.isComputed
        );
    }    

    private updateThisAttributeAssignment(
        node: arkts.AssignmentExpression,
        thisAttribute: arkts.Identifier,
        right: arkts.ArrowFunctionExpression
    ): arkts.AssignmentExpression {
        const scope = this.scopes[this.scopes.length - 1];
        const isValidScope = !!scope && scope.name === thisAttribute.name;
        if (!isValidScope) {
            return node;
        }
        this.exitAnonymousScope();
        if (!scope.isMemo) {
            return node;
        }

        this.enterAnonymousScope(right.function!);
        const res = this.updateScriptFunction(right.function!, right.function!.id?.name);
        this.exitAnonymousScope();

        this.modified = true;
        return arkts.factory.updateAssignmentExpression(
            node,
            node.left!,
            arkts.factory.updateArrowFunctionExpression(right, res, right.annotations),
            node.operatorType
        );
    }

    private visitorWithCache(beforeChildren: arkts.AstNode): arkts.AstNode {
        const _memoCache = NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO);
        if (!_memoCache.shouldUpdate(beforeChildren)) {
            return beforeChildren;
        }
        const node = this.visitEachChild(beforeChildren);
        if (_memoCache.has(node)) {
            const value = _memoCache.get(node)!;
            if (rewriteByType.has(value.type)) {
                this.modified = true;
                const metadata: CachedMetadata = { ...value.metadata, internalsTransformer: this.internalsTransformer };
                return rewriteByType.get(value.type)!(node, metadata);
            }
        }
        if (arkts.isETSModule(node) && this.modified) {
            factory.createContextTypesImportDeclaration(this.program);
        }
        return node;
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        if (this.useCache) {
            return this.visitorWithCache(beforeChildren);
        }
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
        if (arkts.isVariableDeclarator(node)) {
            return this.updateVariableDeclarator(node);
        }
        if (arkts.isTSAsExpression(node) && node.expr && arkts.isArrowFunctionExpression(node.expr)) {
            return this.updateTSAsExpression(node, node.expr);
        }
        if (isFunctionProperty(node)) {
            return this.updateProperty(node, castIdentifier(node.key), castArrowFunctionExpression(node.value));
        }
        if (isThisAttributeAssignment(node) && !!node.right && arkts.isArrowFunctionExpression(node.right)) {
            const thisAttribute = findThisAttribute(node.left!)!;
            return this.updateThisAttributeAssignment(node, thisAttribute, node.right);
        }
        if (arkts.isETSModule(node) && this.modified) {
            factory.createContextTypesImportDeclaration(this.program);
        }
        return node;
    }
}
