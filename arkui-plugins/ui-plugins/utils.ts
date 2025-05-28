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
import { annotation, matchPrefix } from '../common/arkts-utils';
import { ARKUI_IMPORT_PREFIX_NAMES, MEMO_IMPORT_SOURCE_NAME, StructDecoratorNames } from '../common/predefines';
import { DeclarationCollector } from '../common/declaration-collector';
import { ImportCollector } from '../common/import-collector';

export enum CustomComponentNames {
    COMPONENT_BUILD_ORI = 'build',
    COMPONENT_CONSTRUCTOR_ORI = 'constructor',
    COMPONENT_CLASS_NAME = 'CustomComponent',
    COMPONENT_INTERFACE_PREFIX = '__Options_',
    COMPONENT_INITIALIZE_STRUCT = '__initializeStruct',
    COMPONENT_UPDATE_STRUCT = '__updateStruct',
    COMPONENT_BUILD = '_build',
    COMPONENT_INITIALIZERS_NAME = 'initializers',
    BUILDCOMPATIBLENODE = '_buildCompatibleNode',
    OPTIONS = 'options',
}

export enum BuilderLambdaNames {
    ANNOTATION_NAME = 'ComponentBuilder',
    ORIGIN_METHOD_NAME = '$_instantiate',
    TRANSFORM_METHOD_NAME = '_instantiateImpl',
    STYLE_PARAM_NAME = 'style',
    STYLE_ARROW_PARAM_NAME = 'instance',
    CONTENT_PARAM_NAME = 'content',
    ANIMATION_NAME = 'animation',
    ANIMATION_START = 'animationStart',
    ANIMATION_STOP = 'animationStop',
}

export enum MemoNames {
    MEMO = 'memo',
}

// IMPORT
export function findImportSourceByName(importName: string): string {
    const source = DeclarationCollector.getInstance().findExternalSourceFromName(importName);
    if (!source) {
        throw new Error(`cannot find import source by name: "${importName}".`);
    }
    return source;
}

export function findImportSourceByNode(declNode: arkts.AstNode): string {
    const source = DeclarationCollector.getInstance().findExternalSourceFromNode(declNode);
    if (!source) {
        throw new Error(`cannot find import source by peer.`);
    }
    return source;
}

export function findLocalImport(
    node: arkts.ETSImportDeclaration,
    sourceName: string,
    importedName: string
): arkts.Identifier | undefined {
    const isFromSource = !!node.source && node.source.str === sourceName;
    if (!isFromSource) return undefined;

    const importSpecifier = node.specifiers.find(
        (spec) => arkts.isImportSpecifier(spec) && !!spec.imported && spec.imported.name === importedName
    ) as arkts.ImportSpecifier | undefined;
    return importSpecifier?.local ?? importSpecifier?.imported;
}

// AST NODE
export function isStatic(node: arkts.AstNode): boolean {
    return node.isStatic;
}

/**
 * Determine whether the type node includes null or undefined type.
 *
 * @param type type node
 */
export function hasNullOrUndefinedType(type: arkts.TypeNode): boolean {
    let res: boolean = false;
    if (arkts.isETSUnionType(type)) {
        type.types.forEach((item: arkts.TypeNode) => {
            res = res || hasNullOrUndefinedType(item);
        });
    }
    if (arkts.isETSUndefinedType(type) || arkts.isETSNullType(type)) {
        res = true;
    }
    return res;
}

// TYPE PARAMETER
export function getTypeParamsFromClassDecl(node: arkts.ClassDeclaration | undefined): readonly arkts.TSTypeParameter[] {
    return node?.definition?.typeParams?.params ?? [];
}

export function getTypeNameFromTypeParameter(node: arkts.TSTypeParameter | undefined): string | undefined {
    return node?.name?.name;
}

// GETTER
export function getGettersFromClassDecl(definition: arkts.ClassDefinition): arkts.MethodDefinition[] {
    return definition.body.filter(
        (member) =>
            arkts.isMethodDefinition(member) &&
            arkts.hasModifierFlag(member, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_GETTER)
    ) as arkts.MethodDefinition[];
}

// ANNOTATION
export function hasPropertyInAnnotation(annotation: arkts.AnnotationUsage, propertyName: string): boolean {
    return !!annotation.properties.find(
        (annoProp: arkts.AstNode) =>
            arkts.isClassProperty(annoProp) &&
            annoProp.key &&
            arkts.isIdentifier(annoProp.key) &&
            annoProp.key.name === propertyName
    );
}

// CUSTOM COMPONENT
export type CustomComponentInfo = {
    name: string;
    isDecl: boolean;
    annotations: CustomComponentAnontations;
};

export type CustomComponentAnontations = {
    component?: arkts.AnnotationUsage;
    entry?: arkts.AnnotationUsage;
    reusable?: arkts.AnnotationUsage;
};

export function isCustomComponentAnnotation(
    anno: arkts.AnnotationUsage,
    decoratorName: StructDecoratorNames,
    ignoreDecl?: boolean
): boolean {
    if (!(!!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === decoratorName)) {
        return false;
    }
    if (!ignoreDecl) {
        const decl = arkts.getDecl(anno.expr);
        if (!decl) {
            return false;
        }
        const moduleName: string = arkts.getProgramFromAstNode(decl).moduleName;
        if (!moduleName || !matchPrefix(ARKUI_IMPORT_PREFIX_NAMES, moduleName)) {
            return false;
        }
        DeclarationCollector.getInstance().collect(decl);
    }
    return true;
}

export function collectCustomComponentScopeInfo(
    node: arkts.ClassDeclaration | arkts.StructDeclaration
): CustomComponentInfo | undefined {
    const definition: arkts.ClassDefinition | undefined = node.definition;
    if (!definition || !definition?.ident?.name) {
        return undefined;
    }
    const isStruct = arkts.isStructDeclaration(node);
    const isDecl: boolean = arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
    const isCustomComponentClassDecl = !isStruct && isDecl;
    const shouldIgnoreDecl = isStruct || isDecl;
    if (isCustomComponentClassDecl && definition.ident.name !== CustomComponentNames.COMPONENT_CLASS_NAME) {
        return undefined;
    }
    let annotations: CustomComponentAnontations = {};
    if (!isCustomComponentClassDecl) {
        let isCustomComponent: boolean = false;
        for (const anno of definition.annotations) {
            const isComponent = isCustomComponentAnnotation(anno, StructDecoratorNames.COMPONENT, shouldIgnoreDecl);
            const isEntry = isCustomComponentAnnotation(anno, StructDecoratorNames.ENTRY, shouldIgnoreDecl);
            const isReusable = isCustomComponentAnnotation(anno, StructDecoratorNames.RESUABLE, shouldIgnoreDecl);
            isCustomComponent ||= isComponent;
            annotations = {
                ...annotations,
                ...(isComponent && !annotations?.component && { component: anno }),
                ...(isEntry && !annotations?.entry && { entry: anno }),
                ...(isReusable && !annotations?.reusable && { reusable: anno }),
            };
        }
        if (!isCustomComponent) {
            return undefined;
        }
    }
    return {
        name: definition.ident.name,
        isDecl,
        annotations: annotations as CustomComponentAnontations,
    };
}

export function isComponentStruct(node: arkts.StructDeclaration, scopeInfo: CustomComponentInfo): boolean {
    return scopeInfo.name === node.definition.ident?.name;
}

/**
 * Determine whether it is a custom component.
 *
 * @param node class declaration node
 */
export function isCustomComponentClass(node: arkts.ClassDeclaration, scopeInfo: CustomComponentInfo): boolean {
    if (!node.definition?.ident?.name) {
        return false;
    }
    const name: string = node.definition.ident.name;
    if (scopeInfo.isDecl) {
        return name === CustomComponentNames.COMPONENT_CLASS_NAME;
    }
    return name === scopeInfo.name;
}

export function isCustomComponentInterface(node: arkts.TSInterfaceDeclaration): boolean {
    const checkPrefix = !!node.id?.name.startsWith(CustomComponentNames.COMPONENT_INTERFACE_PREFIX);
    const checkComponent = node.annotations.some((anno) =>
        isCustomComponentAnnotation(anno, StructDecoratorNames.COMPONENT)
    );
    return checkPrefix && checkComponent;
}

export function getCustomComponentOptionsName(className: string): string {
    return `${CustomComponentNames.COMPONENT_INTERFACE_PREFIX}${className}`;
}

// MEMO
export type MemoAstNode =
    | arkts.ScriptFunction
    | arkts.ETSParameterExpression
    | arkts.ClassProperty
    | arkts.TSTypeAliasDeclaration
    | arkts.ETSFunctionType
    | arkts.ArrowFunctionExpression
    | arkts.ETSUnionType;

export function hasMemoAnnotation<T extends MemoAstNode>(node: T): boolean {
    return node.annotations.some((it) => isMemoAnnotation(it, MemoNames.MEMO));
}

export function collectMemoAnnotationImport(memoName: MemoNames = MemoNames.MEMO): void {
    ImportCollector.getInstance().collectImport(memoName);
}

export function collectMemoAnnotationSource(memoName: MemoNames = MemoNames.MEMO): void {
    ImportCollector.getInstance().collectSource(memoName, MEMO_IMPORT_SOURCE_NAME);
}

export function findCanAddMemoFromTypeAnnotation(
    typeAnnotation: arkts.AstNode | undefined
): typeAnnotation is arkts.ETSFunctionType {
    if (!typeAnnotation) {
        return false;
    }
    if (arkts.isETSFunctionType(typeAnnotation)) {
        return true;
    } else if (arkts.isETSUnionType(typeAnnotation)) {
        return typeAnnotation.types.some((type) => arkts.isETSFunctionType(type));
    }
    return false;
}

export function findCanAddMemoFromParamExpression(
    param: arkts.AstNode | undefined
): param is arkts.ETSParameterExpression {
    if (!param) {
        return false;
    }
    if (!arkts.isEtsParameterExpression(param)) {
        return false;
    }
    const type = param.type;
    return findCanAddMemoFromTypeAnnotation(type);
}

export function isMemoAnnotation(node: arkts.AnnotationUsage, memoName: MemoNames): boolean {
    if (!(node.expr !== undefined && arkts.isIdentifier(node.expr) && node.expr.name === memoName)) {
        return false;
    }
    return true;
}

export function addMemoAnnotation<T extends MemoAstNode>(node: T, memoName: MemoNames = MemoNames.MEMO): T {
    collectMemoAnnotationSource(memoName);
    if (arkts.isETSUnionType(node)) {
        const functionType = node.types.find((type) => arkts.isETSFunctionType(type));
        if (!functionType) {
            return node;
        }
        addMemoAnnotation(functionType, memoName);
        return node;
    }
    const newAnnotations: arkts.AnnotationUsage[] = [
        ...node.annotations.filter((it) => !isMemoAnnotation(it, memoName)),
        annotation(memoName),
    ];
    collectMemoAnnotationImport(memoName);
    if (arkts.isEtsParameterExpression(node)) {
        node.annotations = newAnnotations;
        return node;
    }
    return node.setAnnotations(newAnnotations) as T;
}
