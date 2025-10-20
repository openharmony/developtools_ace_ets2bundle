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
} from './utils';
import { ParameterTransformer } from './parameter-transformer';
import { ReturnTransformer } from './return-transformer';
import { SignatureTransformer } from './signature-transformer';
import { moveToFront } from '../common/arkts-utils';
import { InternalsTransformer } from './internal-transformer';
import { CachedMetadata, rewriteByType } from './memo-cache-factory';

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
        const name = node.name.name;
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
        const name = node.name.name;
        const isMemo = isMemoVariableDeclarator(node);
        this.scopes.push({ name, isMemo, regardAsSameScope: !!node.initializer });
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
                console.error(`Attempt to call @memo-method ${decl.name.name} from non-@memo-method ${scope.name}`);
                throw 'Invalid @memo usage';
            } else {
                console.error(`Attempt to call @memo-method ${decl.name.name} from anonymous non-@memo-method`);
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
            arkts.factory.createFunctionSignature(
                scriptFunction.typeParams,
                scriptFunction.params,
                scriptFunction.returnTypeAnnotation,
                scriptFunction.hasReceiver
            ),
            scriptFunction.flags,
            scriptFunction.modifiers
        );
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
            hasMemoAnnotation(node.scriptFunction) ||
            hasMemoIntrinsicAnnotation(node.scriptFunction) ||
            hasMemoEntryAnnotation(node.scriptFunction);
        if (isMemo && node.scriptFunction.body) {
            const hasIntrinsic = hasMemoIntrinsicAnnotation(node.scriptFunction);
            updateMethod = arkts.factory.updateMethodDefinition(
                node,
                node.kind,
                node.name,
                this.signatureTransformer.visitor(
                    removeMemoAnnotation(this.updateScriptFunction(node.scriptFunction, node.name.name)),
                    hasIntrinsic
                ),
                node.modifiers,
                false
            );
        } else {
            updateMethod = arkts.factory.updateMethodDefinition(
                node,
                node.kind,
                node.name,
                this.signatureTransformer.visitor(node.scriptFunction),
                node.modifiers,
                false
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
        let updatedArguments: arkts.AstNode[] = node.arguments.map((it, index) => {
            const param = decl.scriptFunction.params.at(index);
            if (!param || !arkts.isEtsParameterExpression(param)) {
                return it;
            }
            if (isMemoETSParameterExpression(param) && arkts.isArrowFunctionExpression(it)) {
                this.enterAnonymousScope(it.scriptFunction);
                const res = this.updateScriptFunction(it.scriptFunction);
                this.exitAnonymousScope();
                this.modified = true;
                return arkts.factory.updateArrowFunction(it, res);
            }
            return it;
        });
        if (!ignoreSelf) {
            this.checkMemoCallInMethod(decl);
            updatedArguments = [
                ...factory.createHiddenArguments(this.positionalIdTracker.id(decl.name.name)),
                ...updatedArguments,
            ];
        }
        const isMemo =
            hasMemoAnnotation(decl.scriptFunction) ||
            hasMemoIntrinsicAnnotation(decl.scriptFunction) ||
            hasMemoEntryAnnotation(decl.scriptFunction);
        if (parametrizedNodeHasReceiver(decl.scriptFunction) && isMemo) {
            updatedArguments = moveToFront(updatedArguments, 2);
        }
        this.modified = true;
        return arkts.factory.updateCallExpression(node, node.expression, node.typeArguments, updatedArguments);
    }

    private updateDeclaredCallWithName(node: arkts.CallExpression, name: string): arkts.CallExpression {
        this.modified = true;
        return factory.insertHiddenArgumentsToCall(node, this.positionalIdTracker.id(name));
    }

    private updateAnonymousCallWithMemoParams(node: arkts.CallExpression): arkts.CallExpression {
        let newExpression: arkts.AstNode = node.expression;
        if (isStandaloneArrowFunction(node.expression)) {
            newExpression = arkts.factory.updateArrowFunction(
                node.expression,
                this.signatureTransformer.visitor(node.expression.scriptFunction)
            );
        }
        const that = this;
        const updatedArguments: arkts.AstNode[] = node.arguments.map((it) => {
            if (arkts.isArrowFunctionExpression(it) && isMemoArrowFunction(it)) {
                that.enterAnonymousScope(it.scriptFunction);
                const res = that.updateScriptFunction(it.scriptFunction);
                that.exitAnonymousScope();
                that.modified = true;
                return arkts.factory.updateArrowFunction(it, res);
            }
            return it;
        });
        this.modified ||= this.signatureTransformer.modified;
        return arkts.factory.updateCallExpression(node, newExpression, node.typeArguments, updatedArguments);
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
            return this.updateAnonymousCallWithMemoParams(node);
        }
        this.checkMemoCallInFunction();

        this.enterAnonymousScope(expression.scriptFunction);
        const res = this.updateScriptFunction(expression.scriptFunction, expression.scriptFunction.id?.name);
        this.exitAnonymousScope();

        const newNode = this.updateAnonymousCallWithMemoParams(node);
        this.modified = true;
        return arkts.factory.updateCallExpression(
            node,
            arkts.factory.updateArrowFunction(expression, res),
            newNode.typeArguments,
            [...factory.createHiddenArguments(this.positionalIdTracker.id()), ...newNode.arguments]
        );
    }

    private updateCallExpressionWithNoDecl(node: arkts.CallExpression): arkts.CallExpression {
        if (isStandaloneArrowFunction(node.expression)) {
            return this.updateAnonymousMemoCall(node, node.expression);
        }
        return this.updateAnonymousCallWithMemoParams(node);
    }

    private updateCallExpression(node: arkts.CallExpression): arkts.CallExpression {
        const expr = node.expression;
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
        if (arkts.isEtsParameterExpression(decl) && isMemoETSParameterExpression(decl)) {
            return this.updateDeclaredCallWithName(node, decl.identifier.name);
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
            this.enterAnonymousScope(node.value.scriptFunction);
            res = this.updateScriptFunction(node.value.scriptFunction, key.name);
            this.exitAnonymousScope();
        }

        let typeAnnotation: arkts.TypeNode | undefined;
        if (!!node.typeAnnotation && !(typeAnnotation = factory.updateMemoTypeAnnotation(node.typeAnnotation))) {
            console.error(`ETSFunctionType or ETSUnionType expected for @memo-property ${key.name}`);
            throw 'Invalid @memo usage';
        }

        this.modified = true;
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
            if (!!node.typeAnnotation) {
                const newNode = arkts.factory.updateTSTypeAliasDeclaration(
                    node,
                    node.id,
                    node.typeParams,
                    this.signatureTransformer.visitor(node.typeAnnotation)
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
            return arkts.factory.updateArrowFunction(node, this.signatureTransformer.visitor(node.scriptFunction));
        }

        this.enterAnonymousScope(node.scriptFunction);
        const res = this.updateScriptFunction(node.scriptFunction, node.scriptFunction.id?.name);
        this.exitAnonymousScope();

        this.modified = true;
        return arkts.factory.updateArrowFunction(node, this.signatureTransformer.visitor(res));
    }

    private updateVariableDeclarator(node: arkts.VariableDeclarator): arkts.VariableDeclarator {
        const scope = this.scopes[this.scopes.length - 1];
        const isValidScope = !!scope && scope.name === node.name.name;
        if (!isValidScope) {
            return node;
        }
        this.exitAnonymousScope();
        if (!scope.isMemo) {
            if (!!node.initializer && arkts.isArrowFunctionExpression(node.initializer)) {
                return arkts.factory.updateVariableDeclarator(
                    node,
                    node.flag,
                    node.name,
                    arkts.factory.updateArrowFunction(
                        node.initializer,
                        this.signatureTransformer.visitor(node.initializer.scriptFunction)
                    )
                );
            }
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

        let initializer: arkts.AstNode | undefined = node.initializer;
        if (!!initializer && arkts.isArrowFunctionExpression(initializer)) {
            this.enterAnonymousScope(initializer.scriptFunction);
            const res = this.updateScriptFunction(initializer.scriptFunction, initializer.scriptFunction.id?.name);
            this.exitAnonymousScope();
            initializer = arkts.factory.updateArrowFunction(initializer, res);
        }

        this.modified = true;
        return arkts.factory.updateVariableDeclarator(
            node,
            node.flag,
            arkts.factory.updateIdentifier(node.name, node.name.name, typeAnnotation),
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

        this.enterAnonymousScope(expr.scriptFunction);
        const res = this.updateScriptFunction(expr.scriptFunction, expr.scriptFunction.id?.name);
        this.exitAnonymousScope();

        let typeAnnotation: arkts.TypeNode | undefined;
        if (!(typeAnnotation = factory.updateMemoTypeAnnotation(node.typeAnnotation))) {
            console.error(`ETSFunctionType or ETSUnionType expected for @memo-as-type`);
            throw 'Invalid @memo usage';
        }

        this.modified = true;
        return arkts.factory.updateTSAsExpression(
            node,
            arkts.factory.updateArrowFunction(expr, res),
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

        this.enterAnonymousScope(value.scriptFunction);
        const res = this.updateScriptFunction(value.scriptFunction, value.scriptFunction.id?.name);
        this.exitAnonymousScope();

        this.modified = true;
        return arkts.factory.updateProperty(node, key, arkts.factory.updateArrowFunction(value, res));
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

        this.enterAnonymousScope(right.scriptFunction);
        const res = this.updateScriptFunction(right.scriptFunction, right.scriptFunction.id?.name);
        this.exitAnonymousScope();

        this.modified = true;
        return arkts.factory.updateAssignmentExpression(
            node,
            node.left!,
            node.operatorType,
            arkts.factory.updateArrowFunction(right, res)
        );
    }

    private visitorWithCache(beforeChildren: arkts.AstNode): arkts.AstNode {
        const node = this.visitEachChild(beforeChildren);
        if (arkts.NodeCache.getInstance().has(node)) {
            const value = arkts.NodeCache.getInstance().get(node)!;
            if (rewriteByType.has(value.type)) {
                this.modified = true;
                const metadata: CachedMetadata = { ...value.metadata, internalsTransformer: this.internalsTransformer };
                return rewriteByType.get(value.type)!(node, metadata);
            }
        }
        if (arkts.isEtsScript(node) && this.modified) {
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
        if (arkts.isEtsScript(node) && this.modified) {
            factory.createContextTypesImportDeclaration(this.program);
        }
        return node;
    }
}
