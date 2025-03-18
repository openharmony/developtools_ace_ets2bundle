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

import * as arkts from "@koalaui/libarkts"
import { isAnnotation } from "../common/arkts-utils";

export enum CustomComponentNames {
    COMPONENT_BUILD_ORI = 'build',
    COMPONENT_CONSTRUCTOR_ORI = 'constructor',
    COMPONENT_DEFAULT_IMPORT = '@ohos.arkui.component.customComponent',
    COMPONENT_CLASS_NAME = 'CustomComponent',
    COMPONENT_INTERFACE_PREFIX = '__Options_',
    COMPONENT_INITIALIZE_STRUCT = '__initializeStruct',
    COMPONENT_UPDATE_STRUCT = '__updateStruct',
    COMPONENT_BUILD = '_build',
    REUSABLE_COMPONENT_REBIND_STATE = '__rebindStates',
    COMPONENT_INITIALIZERS_NAME = 'initializers'
}

export enum BuilderLambdaNames {
    ANNOTATION_NAME = 'ComponentBuilder',
    ORIGIN_METHOD_NAME = '$_instantiate',
    TRANSFORM_METHOD_NAME = '_instantiateImpl',
    STYLE_PARAM_NAME = 'style',
    STYLE_ARROW_PARAM_NAME = 'instance',
    CONTENT_PARAM_NAME = 'content',
}

export function hasModifierFlag(node: arkts.AstNode, flag: arkts.Es2pandaModifierFlags): boolean {
    if (!node) return false;

    return (node.modifiers & flag) === flag;
}

export function createCustomComponentInitializerOptions(className: string, isDecl?: boolean): arkts.Identifier {
    return arkts.factory.createIdentifier(
        'initializers',
        arkts.factory.createUnionType([
            createInitializerOptions(className, isDecl),
            arkts.factory.createETSUndefinedType()
        ])
    )
}

// TODO: currently, we forcely assume initializerOptions is named in pattern __Options_xxx
export function createInitializerOptions(className: string, isDecl?: boolean): arkts.TypeNode {    
    return arkts.factory.createTypeReference(
        arkts.factory.createTypeReferencePart(
            arkts.factory.createIdentifier(
                isDecl 
                    ? 'T_Options' // TODO: change T_Options
                    : `${CustomComponentNames.COMPONENT_INTERFACE_PREFIX}${className}`
            )
        )
    );
}

// TODO: currently, we forcely assume initializerOptions is named in pattern __Options_xxx
export function getCustomComponentNameFromInitializerOptions(name: string): string | undefined {
    const prefix: string = CustomComponentNames.COMPONENT_INTERFACE_PREFIX;
    if (name.startsWith(prefix)) {
        return name.substring(prefix.length);
    }
}

export function getCustomComponentOptionsName(className: string): string {
    return `${CustomComponentNames.COMPONENT_INTERFACE_PREFIX}${className}`
}

export function isStatic(node: arkts.AstNode): boolean {
    return node.isStatic;
}

export function isBuilderLambdaAnnotation(node: arkts.AnnotationUsage): boolean {
    return isAnnotation(node, BuilderLambdaNames.ANNOTATION_NAME);
}

export function hasBuilderLambdaAnnotation(
    node: arkts.ScriptFunction | arkts.ETSParameterExpression
): boolean {
    return node.annotations.some(isBuilderLambdaAnnotation);
}

export function findBuilderLambdaAnnotation(
    node: arkts.ScriptFunction | arkts.ETSParameterExpression
): arkts.AnnotationUsage | undefined {
    return node.annotations.find(isBuilderLambdaAnnotation);
}

export function isBuilderLambdaMethod(node: arkts.MethodDefinition): boolean {
    if (!node || !arkts.isMethodDefinition(node)) return false;

    const result = hasBuilderLambdaAnnotation(node.scriptFunction);
    if (result) return true;
    if(node.overloads.length > 0) {
        return node.overloads.some(isBuilderLambdaMethod);
    }
    return false;
}

export function findBuilderLambdaInMethod(node: arkts.MethodDefinition): arkts.AnnotationUsage | undefined {
    if (!node || !arkts.isMethodDefinition(node)) return undefined;

    const result = findBuilderLambdaAnnotation(node.scriptFunction);
    if (!!result) return result;
    node.overloads.forEach((overload) => {
        const anno: arkts.AnnotationUsage | undefined = findBuilderLambdaInMethod(overload);
        if (!!anno) return anno;
    });
    return undefined;
}

export function isBuilderLambdaFunction(node: arkts.FunctionExpression): boolean {
    return hasBuilderLambdaAnnotation(node.scriptFunction);
}

export function findBuilderLambdaInFunction(node: arkts.FunctionExpression): arkts.AnnotationUsage | undefined {
    return findBuilderLambdaAnnotation(node.scriptFunction);
}

export function isBuilderLambdaCall(node: arkts.CallExpression | arkts.Identifier): boolean {
    const expr = arkts.isIdentifier(node) ? node : node.expression;
    const decl = arkts.getDecl(expr);

    if (!decl) return false;

    if (arkts.isMethodDefinition(decl)) {
        return isBuilderLambdaMethod(decl);
    }
    if (arkts.isFunctionExpression(decl)) {
        return isBuilderLambdaFunction(decl);
    }
    return false;
}

export function findBuilderLambdaInCall(node: arkts.CallExpression | arkts.Identifier): arkts.AnnotationUsage | undefined {
    const decl = findBuilderLambdaDecl(node);
    if (!decl) return undefined;

    if (arkts.isMethodDefinition(decl)) {
        return findBuilderLambdaInMethod(decl);
    }
    if (arkts.isFunctionExpression(decl)) {
        return findBuilderLambdaInFunction(decl);
    }
    return undefined;
}

export function findBuilderLambdaDecl(node: arkts.CallExpression | arkts.Identifier): arkts.AstNode | undefined {
    const expr = arkts.isIdentifier(node) ? node : node.expression;
    const decl = arkts.getDecl(expr);

    if (!decl) return undefined;

    return decl;
}

export function getTypeParamsFromClassDecl(node: arkts.ClassDeclaration | undefined): readonly arkts.TypeParameter[] {
    return node?.definition?.typeParams?.params ?? [];
}

export function getTypeNameFromTypeParameter(node: arkts.TypeParameter | undefined): string | undefined {
    return node?.name?.name;
}

export function createOptionalClassProperty(
    name: string,
    property: arkts.ClassProperty,
    stageManagementIdent: string,
    modifiers: arkts.Es2pandaModifierFlags
): arkts.ClassProperty {
    return arkts.factory.createClassProperty(
        arkts.factory.createIdentifier(name).setOptional(true),
        undefined,
        stageManagementIdent.length ? createStageManagementType(stageManagementIdent, property) : 
        property.typeAnnotation,
        modifiers,
        false
    );
}

export function createStageManagementType (stageManagementIdent: string, property: arkts.ClassProperty): arkts.ETSTypeReference {
    return arkts.factory.createTypeReference(
        arkts.factory.createTypeReferencePart(
            arkts.factory.createIdentifier(stageManagementIdent),
            arkts.factory.createTSTypeParameterInstantiation(
                [
                    arkts.factory.createTypeReference(
                        arkts.factory.createTypeReferencePart(
                            arkts.factory.createIdentifier(property.typeAnnotation ? 
                                property.typeAnnotation.dumpSrc() : 'undefined')
                        )
                    )
                ]
            )
        )
    );
}