/*
 * Copyright (c) 2022-2026 Huawei Device Co., Ltd.
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
import { MemoFunctionKind, RuntimeNames } from "../common"

export function resolveType(node: arkts.TypeNode | undefined): arkts.ETSFunctionType[] {
    if (arkts.isETSFunctionType(node)) {
        return [node]
    }
    if (arkts.isETSUndefinedType(node)) {
        return []
    }
    if (arkts.isETSUnionType(node)) {
        return node.types.flatMap(it => resolveType(it))
    }
    if (arkts.isETSTypeReference(node)) {
        const typeAnnotation = arkts.jumpFromETSTypeReferenceToTSTypeAliasDeclarationTypeAnnotation(node) as arkts.TypeNode
        if (typeAnnotation) {
            return resolveType(typeAnnotation)
        }
    }
    return []
}

/**
 * Provides support for both types of annotations
 */
export function castAnnotation(name: string): string {
    if (name.startsWith("Memo")) {
        name = name.toLowerCase()
        if (name == "memo") {
            return name
        }
        return `${name.substring(0, 4)}_${name.substring(4)}`
    }
    return name
}

export function hasMemoStableAnnotation(node: arkts.ClassDefinition) {
    return node.annotations.some((it) => {
        const expr = it.expr
        return arkts.isIdentifier(expr) && castAnnotation(expr.name) === RuntimeNames.ANNOTATION_STABLE
    })
}

export function hasWrapAnnotation(node: arkts.ETSParameterExpression) {
    return node.annotations.some((it) => {
        const expr = it.expr
        return arkts.isIdentifier(expr) && castAnnotation(expr.name) === RuntimeNames.ANNOTATION_WRAP
    })
}

export function hasBuilderAnnotation(node: arkts.ClassProperty | arkts.ScriptFunction | arkts.ETSTypeReference | arkts.TSTypeAliasDeclaration) {
    return node.annotations.some((it) => {
        const expr = it.expr
        if (!arkts.isIdentifier(expr)) return false;
        const annotation = castAnnotation(expr.name);
        // Improve: check if we should add corresponding annotations in ui plugin instead of checking for ComponentBuilder
        return annotation === RuntimeNames.BUILDER// || annotation === "ComponentBuilder"
    })
}

export function hasBuilderAnnotationOnParameter(node: arkts.ETSParameterExpression) {
    let type = node.typeAnnotation
    while (arkts.isETSTypeReference(type)) {
        if (hasBuilderAnnotation(type)) {
            return true;
        }
        if (!type.baseName) {
            break;
        }
        let decl = arkts.getDecl(type.baseName)
        if (arkts.isTSTypeAliasDeclaration(decl)) {
            if (hasBuilderAnnotation(decl)) {
                return true;
            }
            type = decl.typeAnnotation
        } else {
            // Improve: check for annotations deeper
            break;
        }
    }

    return false
}

export function readAnnotations(node: MemoAnnotatable): MemoFunctionKind {
    const mask = node.annotations.reduce((prev, it) => {
        const expr = it.expr
        if (arkts.isIdentifier(expr)) {
            switch (castAnnotation(expr.name)) {
                case RuntimeNames.ANNOTATION:
                case RuntimeNames.BUILDER:
                    return prev | MemoFunctionKind.MEMO
                case RuntimeNames.COMPONENT_BUILDER:
                    return prev | MemoFunctionKind.COMPONENT_BUILDER
                case RuntimeNames.ANNOTATION_INTRINSIC:
                    return prev | MemoFunctionKind.INTRINSIC
                case RuntimeNames.ANNOTATION_ENTRY:
                    return prev | MemoFunctionKind.ENTRY
                default:
                    return prev
            }
        }
        return prev
    }, 0)
    return maskToKind(mask)
}

export function maskToKind(mask: number): MemoFunctionKind {
    if (!(mask in MemoFunctionKind)) {
        console.error(`Conflicting @memo annotations are not allowed`)
        throw new Error(`Invalid @memo usage`)
    }
    return mask
}

/**
 * Type of node which can be returned by getDecl and correspond to node which can have memo annotation
 *
 * @see getDecl
 * @see getDeclResolveGensym
 * @see MemoAnnotatable
 */
export type Memoizable =
      arkts.MethodDefinition
    | arkts.ETSParameterExpression
    | arkts.Identifier
    | arkts.ClassProperty

/**
 * Type of expression node which can have functional memo annotation
 */
export type MemoAnnotatableExpression =
      arkts.ScriptFunction
    | arkts.ArrowFunctionExpression
    | arkts.ETSParameterExpression
    | arkts.VariableDeclaration
    | arkts.ClassProperty
    | arkts.TSTypeAliasDeclaration

/**
 * Type of type node which can have functonal memo annotation
 */
export type MemoAnnotatableType =
      arkts.ETSFunctionType
    | arkts.ETSUnionType

/**
 * Type of node which can have functional memo annotation
 */
export type MemoAnnotatable = MemoAnnotatableExpression | MemoAnnotatableType

export function isMemoizable(node: arkts.AstNode | undefined): node is Memoizable {
    return arkts.isMethodDefinition(node)
        || arkts.isETSParameterExpression(node)
        || arkts.isIdentifier(node)
        || arkts.isClassProperty(node)
}

export function isMemoAnnotatableExpression(node: arkts.AstNode | undefined): node is MemoAnnotatableExpression {
    return arkts.isScriptFunction(node)
        || arkts.isETSParameterExpression(node)
        || arkts.isArrowFunctionExpression(node)
        || arkts.isVariableDeclaration(node)
        || arkts.isClassProperty(node)
        || arkts.isTSTypeAliasDeclaration(node)
}

export function isMemoAnnotatableType(node: arkts.AstNode | undefined): node is MemoAnnotatableType {
    return arkts.isETSFunctionType(node) || arkts.isETSUnionType(node)
}

export function isMemoAnnotatable(node: arkts.AstNode | undefined): node is MemoAnnotatable {
    return isMemoAnnotatableExpression(node) || isMemoAnnotatableType(node)
}

export function getDeclResolveGensym(node: arkts.AstNode): arkts.AstNode | undefined {
    if (arkts.isTSNonNullExpression(node) || arkts.isTSAsExpression(node)) {
        return getDeclResolveGensym(node.expr!)
    }
    const decl = arkts.getDecl(node)
    if (arkts.isIdentifier(decl) && decl.name.startsWith(RuntimeNames.GENSYM)) {
        if (arkts.isVariableDeclarator(decl.parent)) {
            if (arkts.isIdentifier(decl.parent.init)) {
                return getDeclResolveGensym(decl.parent.init)
            }
            if (arkts.isMemberExpression(decl.parent.init)) {
                return getDeclResolveGensym(decl.parent.init.property!)
            }
        }
    }
    return decl
}
