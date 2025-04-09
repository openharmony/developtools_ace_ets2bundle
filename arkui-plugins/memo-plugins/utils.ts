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
    constructor(
        public filename: string,
        public stableForTests: boolean = false
    ) {
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

export function isMemoAnnotation(node: arkts.AnnotationUsage, memoName: RuntimeNames) {
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

export function hasMemoStableAnnotation(node: arkts.ClassDefinition) {
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
export function isSyntheticReturnStatement(node: arkts.AstNode) {
    return (
        (arkts.isReturnStatement(node) &&
            node.argument &&
            arkts.isMemberExpression(node.argument) &&
            arkts.isIdentifier(node.argument.object) &&
            node.argument.object.name === RuntimeNames.SCOPE &&
            arkts.isIdentifier(node.argument.property) &&
            node.argument.property.name === RuntimeNames.INTERNAL_VALUE) ||
        arkts.isBlockStatement(node)
    );
}

/**
 * TODO:
 * @deprecated
 */
export function isMemoParametersDeclaration(node: arkts.AstNode) {
    return (
        arkts.isVariableDeclaration(node) &&
        node.declarators.every((it) => it.name.name.startsWith(RuntimeNames.PARAMETER))
    );
}

/**
 * TODO: change this to TypeNodeGetType to check void type
 */
export function isVoidType(typeNode: arkts.TypeNode | undefined) {
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

export function isStandaloneArrowFunction(node: arkts.AstNode): node is arkts.ArrowFunctionExpression {
    if (!arkts.isArrowFunctionExpression(node)) return false;

    // handling anonymous arrow function call
    if (arkts.isCallExpression(node.parent) && node.parent.expression.peer === node.peer) return true;

    return !arkts.isClassProperty(node.parent) && !(arkts.isCallExpression(node.parent) && node.parent.expression);
}
