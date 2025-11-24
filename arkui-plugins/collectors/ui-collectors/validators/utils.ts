/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
import { getAnnotationName, isDeclFromArkUI } from '../utils';
import { BuiltInNames } from '../../../common/predefines';
import { ChainingCallDataSource } from '../chaining-call-data-source';
import { CallInfo } from '../records';

export const TypeFlags = {
    Boolean: 'boolean',
    String: 'string',
    Number: 'number',
    Enum: 'enum',
    Null: 'null',
    Undefined: 'undefined',
    Object: 'object',
    Array: 'array',
    Function: 'function',
    Symbol: 'symbol',
    BigInt: 'bigint',
    Unknown: 'unknown',
    Any: 'any',
    Never: 'never',
    Void: 'void',
    This: 'this',
    TypeParameter: 'typeParameter',
    Literal: 'literal',
    Union: 'union',
};

export function isAnnotatedProperty(
    node: arkts.AstNode,
    annotationName: string,
    ignoreDecl: boolean = false
): node is arkts.ClassProperty {
    if (!arkts.isClassProperty(node)) {
        return false;
    }
    return !!getAnnotationByName(node.annotations, annotationName, ignoreDecl);
}

export function getAnnotationByName(
    annotations: readonly arkts.AnnotationUsage[],
    name: string,
    ignoreDecl: boolean = false
): arkts.AnnotationUsage | undefined {
    return annotations.find((annotation: arkts.AnnotationUsage): boolean => {
        return getAnnotationName(annotation, ignoreDecl) === name;
    });
}

export function coerceToAstNode<T extends arkts.AstNode>(node: arkts.AstNode): T {
    return node as T;
}

export function isPublicClassProperty(property: arkts.ClassProperty): boolean {
    return arkts.hasModifierFlag(property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC);
}

export function isPrivateClassProperty(property: arkts.ClassProperty): boolean {
    return arkts.hasModifierFlag(property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE);
}

export function isProtectedClassProperty(property: arkts.ClassProperty): boolean {
    return arkts.hasModifierFlag(property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PROTECTED);
}

export function isClassDeclaration(node: arkts.AstNode): node is arkts.ClassDeclaration {
    return (
        arkts.isClassDeclaration(node) && !!node.definition && !arkts.classDefinitionIsFromStructConst(node.definition)
    );
}

export function isInEtsGlobalClassDeclaration(node: arkts.AstNode): boolean {
    while (node) {
        if (isClassDeclaration(node)) {
            if (node.definition?.ident?.name === BuiltInNames.ETS_GLOBAL_CLASS) {
                return true;
            } else {
                return false;
            }
        }
        if (!node.parent) {
            return false;
        }
        node = node.parent;
    }
    return false;
}

//Global method
export function isFunctionDeclaration(node: arkts.AstNode): node is arkts.MethodDefinition {
    if (!arkts.isMethodDefinition(node) || !node.isStatic || !node.scriptFunction.id) {
        return false;
    }
    const methodName = node.scriptFunction.id.name;
    return (
        methodName !== BuiltInNames.GLOBAL_INIT_METHOD &&
        methodName !== BuiltInNames.GLOBAL_MAIN_METHOD &&
        isInEtsGlobalClassDeclaration(node)
    );
}

//Global variables
export function isVariableDeclaration(node: arkts.AstNode): node is arkts.ClassProperty {
    return arkts.isClassProperty(node) && isInEtsGlobalClassDeclaration(node);
}

export function getAnnotationUsagesByName(
    annotations: readonly arkts.AnnotationUsage[],
    annotationNames: string[]
): Array<arkts.AnnotationUsage | undefined> {
    return annotationNames.map((annotationName) => getAnnotationUsageByName(annotations, annotationName));
}

export function getAnnotationUsageByName(
    annotations: readonly arkts.AnnotationUsage[],
    annotationName: string
): arkts.AnnotationUsage | undefined {
    return annotations.find((annotation: arkts.AnnotationUsage): boolean => {
        if (!annotation.expr || !arkts.isIdentifier(annotation.expr) || annotation.expr.name !== annotationName) {
            return false;
        }
        const annotationDeclaration = arkts.getPeerIdentifierDecl(annotation.expr.peer);
        if (!annotationDeclaration || !isDeclFromArkUI(annotationDeclaration)) {
            return false;
        }
        return true;
    });
}

export function getAnnotationUsage(
    annotations: readonly arkts.AnnotationUsage[],
    annotationName: string
): arkts.AnnotationUsage | undefined {
    return annotations.find(
        (annotation) =>
            annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === annotationName
    );
}

export function getIdentifierName(node: arkts.AstNode): string {
    if (!arkts.isIdentifier(node)) {
        return '';
    }
    return node.name;
}

export function getClassPropertyAnnotationNames(property: arkts.ClassProperty): string[] {
    return property.annotations
        .map((annotation) => getAnnotationName(annotation))
        .filter((item): item is string => item !== undefined);
}

export function isBuiltInDeclaration(node: arkts.Identifier): boolean {
    const declaration = arkts.getPeerIdentifierDecl(node.peer);
    if (!declaration || !isDeclFromArkUI(declaration)) {
        return false;
    }
    return true;
}

export function getCurrentFilePath(node: arkts.AstNode): string | undefined {
    const program = arkts.getProgramFromAstNode(node);
    return program?.absName;
}

export function checkIsValidChainingDataSource(dataSource: ChainingCallDataSource, thisCallInfo: CallInfo): boolean {
    if (!thisCallInfo.rootCallInfo?.ptr || !dataSource.rootCallInfo?.callRecord.callPtr) {
        return false;
    }
    if (thisCallInfo.rootCallInfo.ptr !== dataSource.rootCallInfo.callRecord.callPtr) {
        return false;
    }
    if (!thisCallInfo.chainingCallInfos || !dataSource.chainingCallInfos) {
        return false;
    }
    return thisCallInfo.chainingCallInfos.length === dataSource.chainingCallInfos.length;
}

export function checkIsCallFromInnerComponentOrExtendFromInfo(metadata: CallInfo): boolean {
    const rootCallInfo = metadata.rootCallInfo;
    if (!rootCallInfo) {
        return false;
    }
    if (!!rootCallInfo.annotationInfo?.hasComponentBuilder) {
        return !metadata.rootCallInfo?.structDeclInfo;
    }
    if (!!rootCallInfo.annotationInfo?.hasAnimatableExtend) {
        return true;
    }
    if (!!rootCallInfo.annotationInfo?.hasBuilder) {
        return true;
    }
    return false;
}
