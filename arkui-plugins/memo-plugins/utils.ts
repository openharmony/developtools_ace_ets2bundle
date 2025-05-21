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
import { getCommonPath } from '../path';
const common = require(getCommonPath());
const UniqueId = common.UniqueId;

export enum RuntimeNames {
    __CONTEXT = '__context',
    __ID = '__id',
    ANNOTATION = 'memo',
    ANNOTATION_ENTRY = 'memo_entry',
    ANNOTATION_INTRINSIC = 'memo_intrinsic',
    ANNOTATION_STABLE = 'memo_stable',
    COMPUTE = 'compute',
    CONTEXT = '__memo_context',
    CONTEXT_TYPE = '__memo_context_type',
    CONTEXT_TYPE_DEFAULT_IMPORT = '@ohos.arkui.StateManagement.runtime',
    GENSYM = 'gensym%%_',
    ID = '__memo_id',
    ID_TYPE = '__memo_id_type',
    INTERNAL_PARAMETER_STATE = 'param',
    INTERNAL_SCOPE = 'scope',
    INTERNAL_VALUE = 'cached',
    INTERNAL_VALUE_NEW = 'recache',
    INTERNAL_VALUE_OK = 'unchanged',
    PARAMETER = '__memo_parameter',
    SCOPE = '__memo_scope',
    THIS = 'this',
    VALUE = 'value',
    EQUAL_T = '=t'
}

export interface ReturnTypeInfo {
    node: arkts.TypeNode | undefined;
    isMemo?: boolean;
    isVoid?: boolean;
    isStableThis?: boolean;
}

export interface ParamInfo {
    ident: arkts.Identifier;
    param: arkts.ETSParameterExpression;
}

export interface MemoInfo {
    name?: string;
    isMemo: boolean;
}

function baseName(path: string): string {
    return path.replace(/^.*\/(.*)$/, '$1');
}

export class PositionalIdTracker {
    // Global for the whole program.
    static callCount: number = 0;

    // Set `stable` to true if you want to have more predictable values.
    // For example for tests.
    // Don't use it in production!
    constructor(public filename: string, public stableForTests: boolean = false) {
        if (stableForTests) PositionalIdTracker.callCount = 0;
    }

    sha1Id(callName: string, fileName: string): string {
        const uniqId = new UniqueId();
        uniqId.addString('memo call uniqid');
        uniqId.addString(fileName);
        uniqId.addString(callName);
        uniqId.addI32(PositionalIdTracker.callCount++);
        return uniqId.compute().substring(0, 7);
    }

    stringId(callName: string, fileName: string): string {
        return `${PositionalIdTracker.callCount++}_${callName}_id_DIRNAME/${fileName}`;
    }

    id(callName: string = ''): arkts.NumberLiteral | arkts.StringLiteral {
        const fileName = this.stableForTests ? baseName(this.filename) : this.filename;

        const positionId = this.stableForTests ? this.stringId(callName, fileName) : this.sha1Id(callName, fileName);

        return this.stableForTests
            ? arkts.factory.createStringLiteral(positionId)
            : arkts.factory.createNumericLiteral(parseInt(positionId, 16));
    }
}

export function isMemoAnnotation(node: arkts.AnnotationUsage, memoName: RuntimeNames): boolean {
    return node.expr !== undefined && arkts.isIdentifier(node.expr) && node.expr.name === memoName;
}

export type MemoAstNode =
    | arkts.ScriptFunction
    | arkts.ETSParameterExpression
    | arkts.ClassProperty
    | arkts.TSTypeAliasDeclaration
    | arkts.ETSFunctionType
    | arkts.ArrowFunctionExpression
    | arkts.ETSTypeReference
    | arkts.VariableDeclaration;

export function hasMemoAnnotation<T extends MemoAstNode>(node: T): boolean {
    return node.annotations.some((it) => isMemoAnnotation(it, RuntimeNames.ANNOTATION));
}

export function hasMemoIntrinsicAnnotation<T extends MemoAstNode>(node: T): boolean {
    return node.annotations.some((it) => isMemoAnnotation(it, RuntimeNames.ANNOTATION_INTRINSIC));
}

export function hasMemoEntryAnnotation<T extends MemoAstNode>(node: T): boolean {
    return node.annotations.some((it) => isMemoAnnotation(it, RuntimeNames.ANNOTATION_ENTRY));
}

export function hasMemoStableAnnotation(node: arkts.ClassDefinition): boolean {
    return node.annotations.some(
        (it) => it.expr !== undefined && arkts.isIdentifier(it.expr) && it.expr.name === RuntimeNames.ANNOTATION_STABLE
    );
}

export function removeMemoAnnotation<T extends MemoAstNode>(node: T): T {
    const newAnnotations: arkts.AnnotationUsage[] = node.annotations.filter(
        (it) =>
            !isMemoAnnotation(it, RuntimeNames.ANNOTATION) &&
            !isMemoAnnotation(it, RuntimeNames.ANNOTATION_INTRINSIC) &&
            !isMemoAnnotation(it, RuntimeNames.ANNOTATION_ENTRY) &&
            !isMemoAnnotation(it, RuntimeNames.ANNOTATION_STABLE)
    );
    if (arkts.isEtsParameterExpression(node)) {
        node.annotations = newAnnotations;
        return node;
    }
    return node.setAnnotations(newAnnotations) as T;
}

/**
 * TODO:
 * @deprecated
 */
export function isSyntheticReturnStatement(node: arkts.AstNode): boolean {
    return isIfStatementWithSyntheticReturn(node) || isSimpleSyntheticReturn(node) || isSyntheticReturnInBlock(node);
}

function isIfStatementWithSyntheticReturn(node: arkts.AstNode): boolean {
    return (
        arkts.isIfStatement(node) &&
        !!node.test &&
        arkts.isMemberExpression(node.test) &&
        arkts.isIdentifier(node.test.object) &&
        node.test.object.name === RuntimeNames.SCOPE &&
        arkts.isIdentifier(node.test.property) &&
        node.test.property.name === RuntimeNames.INTERNAL_VALUE_OK &&
        (arkts.isBlockStatement(node.consequent) || arkts.isReturnStatement(node.consequent))
    );
}

function isSimpleSyntheticReturn(node: arkts.AstNode): boolean {
    return (
        arkts.isReturnStatement(node) &&
        !!node.argument &&
        arkts.isMemberExpression(node.argument) &&
        arkts.isIdentifier(node.argument.object) &&
        node.argument.object.name === RuntimeNames.SCOPE &&
        arkts.isIdentifier(node.argument.property) &&
        node.argument.property.name === RuntimeNames.INTERNAL_VALUE
    );
}

function isSyntheticReturnInBlock(node: arkts.AstNode): boolean {
    if (!arkts.isBlockStatement(node) || node.statements.length !== 2) {
        return false;
    }
    if (!arkts.isReturnStatement(node.statements[1])) {
        return false;
    }
    const isReturnThis: boolean = !!node.statements[1].argument && arkts.isThisExpression(node.statements[1].argument);
    const isReturnVoid: boolean = node.statements[1].argument === undefined;

    return (
        arkts.isMemberExpression(node.statements[0]) &&
        arkts.isIdentifier(node.statements[0].object) &&
        node.statements[0].object.name === RuntimeNames.SCOPE &&
        arkts.isIdentifier(node.statements[0].property) &&
        node.statements[0].property.name === RuntimeNames.INTERNAL_VALUE &&
        (isReturnThis || isReturnVoid)
    );
}

/**
 * TODO:
 * @deprecated
 */
export function isMemoParametersDeclaration(node: arkts.AstNode): boolean {
    return (
        arkts.isVariableDeclaration(node) &&
        node.declarators.every((it) => it.name.name.startsWith(RuntimeNames.PARAMETER))
    );
}

/**
 * TODO: change this to TypeNodeGetType to check void type
 */
export function isVoidType(typeNode: arkts.TypeNode | undefined): boolean {
    return typeNode?.dumpSrc() === 'void';
}

/**
 * es2panda API is weird here
 *
 * @deprecated
 */
export function castParameters(params: readonly arkts.Expression[]): arkts.ETSParameterExpression[] {
    return params as arkts.ETSParameterExpression[];
}

/**
 * es2panda API is weird here
 *
 * @deprecated
 */
export function castFunctionExpression(value: arkts.Expression | undefined): arkts.FunctionExpression {
    return value as unknown as arkts.FunctionExpression;
}

/**
 * es2panda API is weird here
 *
 * @deprecated
 */
export function castArrowFunctionExpression(value: arkts.Expression | undefined): arkts.ArrowFunctionExpression {
    return value as unknown as arkts.ArrowFunctionExpression;
}

/**
 * es2panda API is weird here
 *
 * @deprecated
 */
export function castIdentifier(value: arkts.AstNode | undefined): arkts.Identifier {
    return value as unknown as arkts.Identifier;
}

/**
 * es2panda API is weird here
 *
 * @deprecated
 */
export function castOverloadsToMethods(overloads: arkts.AstNode[]): readonly arkts.MethodDefinition[] {
    return overloads as unknown as readonly arkts.MethodDefinition[];
}

export function isStandaloneArrowFunction(node: arkts.AstNode): node is arkts.ArrowFunctionExpression {
    if (!arkts.isArrowFunctionExpression(node)) return false;

    // handling anonymous arrow function call
    if (arkts.isCallExpression(node.parent) && node.parent.expression.peer === node.peer) return true;

    return (
        !arkts.isVariableDeclarator(node.parent) &&
        !arkts.isClassProperty(node.parent) &&
        !(arkts.isCallExpression(node.parent) && node.parent.expression)
    );
}

export function isFunctionProperty(node: arkts.AstNode): node is arkts.Property {
    return (
        arkts.isProperty(node) &&
        !!node.key &&
        arkts.isIdentifier(node.key) &&
        !!node.value &&
        arkts.isArrowFunctionExpression(node.value)
    );
}

export function isThisAttributeAssignment(node: arkts.AstNode): node is arkts.AssignmentExpression {
    if (!arkts.isAssignmentExpression(node)) {
        return false;
    }
    if (!node.left || !node.right) {
        return false;
    }
    const isAssignOperator = node.operatorType === arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION;
    const isThisAttribute =
        arkts.isMemberExpression(node.left) &&
        arkts.isThisExpression(node.left.object) &&
        arkts.isIdentifier(node.left.property);
    return isAssignOperator && isThisAttribute;
}

export function findThisAttribute(node: arkts.AstNode): arkts.Identifier | undefined {
    if (!arkts.isMemberExpression(node) || !arkts.isIdentifier(node.property)) {
        return undefined;
    }
    return node.property;
}

export function isMemoThisAttribute(node: arkts.Identifier, value: arkts.ArrowFunctionExpression): boolean {
    let isMemo: boolean = isMemoArrowFunction(value);
    if (isMemo) {
        return true;
    }
    const decl: arkts.AstNode | undefined = getDeclResolveAlias(node);
    if (!decl) {
        return false;
    }
    if (arkts.isClassProperty(decl)) {
        isMemo ||= isMemoClassProperty(decl);
    } else if (arkts.isMethodDefinition(decl)) {
        isMemo ||= isMemoDeclaredMethod(decl);
    }
    return isMemo;
}

export function isMemoClassProperty(node: arkts.ClassProperty): boolean {
    let isMemo = findMemoFromTypeAnnotation(node.typeAnnotation);
    if (node.value) {
        isMemo ||=
            arkts.isArrowFunctionExpression(node.value) &&
            (hasMemoAnnotation(node.value) || hasMemoIntrinsicAnnotation(node.value));
    }
    isMemo ||= hasMemoAnnotation(node) || hasMemoIntrinsicAnnotation(node);
    return isMemo;
}

export function isMemoMethodDefinition(node: arkts.MethodDefinition): boolean {
    return (
        hasMemoAnnotation(node.scriptFunction) ||
        hasMemoIntrinsicAnnotation(node.scriptFunction) ||
        hasMemoEntryAnnotation(node.scriptFunction)
    );
}

export function isMemoArrowFunction(node: arkts.ArrowFunctionExpression): boolean {
    return hasMemoAnnotation(node) || hasMemoIntrinsicAnnotation(node);
}

export function isMemoTSTypeAliasDeclaration(node: arkts.TSTypeAliasDeclaration): boolean {
    let isMemo = findMemoFromTypeAnnotation(node.typeAnnotation);
    isMemo ||= hasMemoAnnotation(node) || hasMemoIntrinsicAnnotation(node);
    return isMemo;
}

export function isMemoETSParameterExpression(param: arkts.ETSParameterExpression): boolean {
    const type = param.identifier.typeAnnotation;
    if (!type) {
        return false;
    }
    let isMemo: boolean = hasMemoAnnotation(param) || hasMemoIntrinsicAnnotation(param);
    isMemo ||= findMemoFromTypeAnnotation(type);
    let decl: arkts.AstNode | undefined;
    if (
        arkts.isETSTypeReference(type) &&
        !!type.part &&
        !!type.part.name &&
        !!(decl = getDeclResolveAlias(type.part.name))
    ) {
        if (arkts.isTSTypeAliasDeclaration(decl)) {
            isMemo ||= hasMemoAnnotation(decl) || hasMemoIntrinsicAnnotation(decl);
            isMemo ||= findMemoFromTypeAnnotation(decl.typeAnnotation);
            return isMemo;
        }
    }
    return isMemo;
}

export function isMemoVariableDeclaration(node: arkts.VariableDeclaration): boolean {
    return hasMemoAnnotation(node) || hasMemoIntrinsicAnnotation(node);
}

export function isMemoVariableDeclarator(node: arkts.VariableDeclarator): boolean {
    let isMemo: boolean = false;
    if (!!node.name.typeAnnotation) {
        isMemo ||= findMemoFromTypeAnnotation(node.name.typeAnnotation);
    }
    if (!!node.initializer && arkts.isArrowFunctionExpression(node.initializer)) {
        isMemo ||= isMemoArrowFunction(node.initializer);
    }
    if (arkts.isVariableDeclaration(node.parent)) {
        isMemo ||= isMemoVariableDeclaration(node.parent);
    }
    return isMemo;
}

export function isMemoProperty(node: arkts.Property, value: arkts.ArrowFunctionExpression): boolean {
    let isMemo: boolean = isMemoArrowFunction(value);
    if (isMemo) {
        return true;
    }
    let decl: arkts.AstNode | undefined;
    if (!node.key || !(decl = getDeclResolveAlias(node.key))) {
        return false;
    }
    if (arkts.isMethodDefinition(decl)) {
        isMemo ||= isMemoDeclaredMethod(decl);
    }
    return isMemo;
}

export function isMemoDeclaredMethod(decl: arkts.MethodDefinition): boolean {
    if (
        decl.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET &&
        findMemoFromTypeAnnotation(decl.scriptFunction.returnTypeAnnotation)
    ) {
        return true;
    }
    return isMemoMethodDefinition(decl);
}

export function isDeclaredMethodWithMemoParams(decl: arkts.MethodDefinition): boolean {
    if (decl.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
        return false;
    }
    return decl.scriptFunction.params.some((param) => {
        return arkts.isEtsParameterExpression(param) && isMemoETSParameterExpression(param);
    });
}

export function isMemoDeclaredIdentifier(decl: arkts.Identifier): boolean {
    if (findMemoFromTypeAnnotation(decl.typeAnnotation)) {
        return true;
    }
    if (arkts.isVariableDeclarator(decl.parent)) {
        return isMemoVariableDeclarator(decl.parent);
    }
    return false;
}

export function isMemoDeclaredClassProperty(decl: arkts.ClassProperty): boolean {
    return isMemoClassProperty(decl);
}

export function findMemoFromTypeAnnotation(typeAnnotation: arkts.AstNode | undefined): boolean {
    if (!typeAnnotation) {
        return false;
    }
    if (arkts.isETSTypeReference(typeAnnotation) && !!typeAnnotation.part && !!typeAnnotation.part.name) {
        let decl: arkts.AstNode | undefined = arkts.getDecl(typeAnnotation.part.name);
        if (!!decl && arkts.isTSTypeAliasDeclaration(decl)) {
            return hasMemoAnnotation(decl) || hasMemoIntrinsicAnnotation(decl);
        }
    } else if (arkts.isETSFunctionType(typeAnnotation)) {
        return hasMemoAnnotation(typeAnnotation) || hasMemoIntrinsicAnnotation(typeAnnotation);
    } else if (arkts.isETSUnionType(typeAnnotation)) {
        return typeAnnotation.types.some(
            (type) => arkts.isETSFunctionType(type) && (hasMemoAnnotation(type) || hasMemoIntrinsicAnnotation(type))
        );
    }
    return false;
}

export function findReturnTypeFromTypeAnnotation(
    typeAnnotation: arkts.AstNode | undefined
): arkts.TypeNode | undefined {
    if (!typeAnnotation) {
        return undefined;
    }
    if (arkts.isETSTypeReference(typeAnnotation) && !!typeAnnotation.part && !!typeAnnotation.part.name) {
        let decl: arkts.AstNode | undefined = arkts.getDecl(typeAnnotation.part.name);
        if (!!decl && arkts.isTSTypeAliasDeclaration(decl)) {
            return findReturnTypeFromTypeAnnotation(decl.typeAnnotation);
        }
        return undefined;
    }
    if (arkts.isETSFunctionType(typeAnnotation)) {
        return typeAnnotation.returnType;
    }
    if (arkts.isETSUnionType(typeAnnotation)) {
        return typeAnnotation.types.find((type) => arkts.isETSFunctionType(type))?.returnType;
    }
    return undefined;
}

export function getDeclResolveAlias(node: arkts.AstNode): arkts.AstNode | undefined {
    const decl = arkts.getDecl(node);
    if (!!decl && arkts.isIdentifier(decl) && arkts.isVariableDeclarator(decl.parent)) {
        if (!!decl.parent.initializer && arkts.isIdentifier(decl.parent.initializer)) {
            return getDeclResolveAlias(decl.parent.initializer);
        }
        if (!!decl.parent.initializer && arkts.isMemberExpression(decl.parent.initializer)) {
            return getDeclResolveAlias(decl.parent.initializer.property);
        }
    }
    return decl;
}

export function mayAddLastReturn(node: arkts.BlockStatement): boolean {
    return (
        node.statements.length === 0 ||
        (!arkts.isReturnStatement(node.statements[node.statements.length - 1]) &&
            !arkts.isThrowStatement(node.statements[node.statements.length - 1]))
    );
}

export function fixGensymParams(params: ParamInfo[], body: arkts.BlockStatement): number {
    let gensymParamsCount = 0;
    for (let i = 0; i < params.length; i++) {
        if (params[i].ident.name.startsWith(RuntimeNames.GENSYM)) {
            if (gensymParamsCount >= body.statements.length) {
                throw new Error(`Expected ${params[i].ident.name} replacement to original parameter`);
            }
            const declaration = body.statements[gensymParamsCount];
            if (!arkts.isVariableDeclaration(declaration)) {
                throw new Error(`Expected ${params[i].ident.name} replacement to original parameter`);
            }
            if (!arkts.isIdentifier(declaration.declarators[0].name)) {
                throw new Error(`Expected ${params[i].ident.name} replacement to original parameter`);
            }
            params[i].ident = declaration.declarators[0].name;
            gensymParamsCount++;
        }
    }
    return gensymParamsCount;
}

export function isUnmemoizedInFunction(params?: readonly arkts.Expression[]): boolean {
    const _params = params ?? [];
    const first = _params.at(0);
    const isContextAdded =
        !!first && arkts.isEtsParameterExpression(first) && first.identifier.name === RuntimeNames.CONTEXT;
    const second = _params.at(1);
    const isIdAdded = !!second && arkts.isEtsParameterExpression(second) && second.identifier.name === RuntimeNames.ID;
    return isContextAdded && isIdAdded;
}

export function buildReturnTypeInfo(
    returnType: arkts.TypeNode | undefined,
    isMemo?: boolean,
    isStableThis?: boolean
): ReturnTypeInfo {
    const newReturnType = !!returnType
        ? returnType.clone()
        : arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID);
    return {
        node: newReturnType,
        isMemo,
        isVoid: isVoidType(newReturnType),
        isStableThis,
    };
}

export function buildeParamInfos(parameters: readonly arkts.ETSParameterExpression[]): ParamInfo[] {
    return [
        ...parameters.map((it) => {
            return { ident: it.identifier, param: it };
        }),
    ];
}

export function parametersBlockHasReceiver(params: readonly arkts.Expression[]): boolean {
    return params.length > 0 && arkts.isEtsParameterExpression(params[0]) && isThisParam(params[0]);
}

export function parametrizedNodeHasReceiver(node: arkts.ScriptFunction | arkts.ETSFunctionType | undefined): boolean {
    if (node === undefined) {
        return false;
    }
    return parametersBlockHasReceiver(node.params);
}

function isThisParam(node: arkts.Expression | undefined): boolean {
    if (node === undefined || !arkts.isEtsParameterExpression(node)) {
        return false;
    }
    return node.identifier?.isReceiver ?? false;
}
