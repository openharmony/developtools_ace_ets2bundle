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
    ANNOTATION_INTRINSIC = 'memo_intrinsic',
    ANNOTATION_STABLE = 'memo_stable',
    COMPUTE = 'compute',
    CONTEXT = '__memo_context',
    CONTEXT_TYPE = '__memo_context_type',
    CONTEXT_TYPE_DEFAULT_IMPORT = '@ohos.arkui.StateManagement.runtime',
    ID = '__memo_id',
    ID_TYPE = '__memo_id_type',
    INTERNAL_PARAMETER_STATE = 'param',
    INTERNAL_SCOPE = 'scope',
    INTERNAL_VALUE = 'cached',
    INTERNAL_VALUE_NEW = 'recache',
    INTERNAL_VALUE_OK = 'unchanged',
    PARAMETER = '__memo_parameter',
    SCOPE = '__memo_scope',
    VALUE = 'value',
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
    | arkts.ArrowFunctionExpression;

export function hasMemoAnnotation<T extends MemoAstNode>(node: T): boolean {
    return node.annotations.some((it) => isMemoAnnotation(it, RuntimeNames.ANNOTATION));
}

export function hasMemoIntrinsicAnnotation<T extends MemoAstNode>(node: T): boolean {
    return node.annotations.some((it) => isMemoAnnotation(it, RuntimeNames.ANNOTATION_INTRINSIC));
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
export function castOverloadsToMethods(overloads: arkts.AstNode[]): readonly arkts.MethodDefinition[] {
    return overloads as unknown as readonly arkts.MethodDefinition[];
}

export function isStandaloneArrowFunction(node: arkts.AstNode): node is arkts.ArrowFunctionExpression {
    if (!arkts.isArrowFunctionExpression(node)) return false;

    // handling anonymous arrow function call
    if (arkts.isCallExpression(node.parent) && node.parent.expression.peer === node.peer) return true;

    return !arkts.isClassProperty(node.parent) && !(arkts.isCallExpression(node.parent) && node.parent.expression);
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
    return hasMemoAnnotation(node.scriptFunction) || hasMemoIntrinsicAnnotation(node.scriptFunction);
}

export function isMemoArrowFunction(node: arkts.ArrowFunctionExpression): boolean {
    return hasMemoAnnotation(node) || hasMemoIntrinsicAnnotation(node);
}

export function isMemoTSTypeAliasDeclaration(node: arkts.TSTypeAliasDeclaration): boolean {
    let isMemo = findMemoFromTypeAnnotation(node.typeAnnotation);
    isMemo ||= hasMemoAnnotation(node) || hasMemoIntrinsicAnnotation(node);
    return isMemo;
}

export function findMemoFromTypeAnnotation(typeAnnotation: arkts.TypeNode | undefined): boolean {
    if (!typeAnnotation) {
        return false;
    }
    if (arkts.isETSFunctionType(typeAnnotation)) {
        return hasMemoAnnotation(typeAnnotation) || hasMemoIntrinsicAnnotation(typeAnnotation);
    } else if (arkts.isETSUnionType(typeAnnotation)) {
        return typeAnnotation.types.some(
            (type) => arkts.isETSFunctionType(type) && (hasMemoAnnotation(type) || hasMemoIntrinsicAnnotation(type))
        );
    }
    return false;
}
