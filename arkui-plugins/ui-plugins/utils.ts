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
import { annotation } from '../common/arkts-utils';
import { DecoratorNames } from './property-translators/utils';

export enum CustomComponentNames {
    ENTRY_ANNOTATION_NAME = 'Entry',
    COMPONENT_ANNOTATION_NAME = 'Component',
    RESUABLE_ANNOTATION_NAME = 'Reusable',
    COMPONENT_BUILD_ORI = 'build',
    COMPONENT_CONSTRUCTOR_ORI = 'constructor',
    COMPONENT_DEFAULT_IMPORT = 'arkui.component.customComponent',
    COMPONENT_CLASS_NAME = 'CustomComponent',
    COMPONENT_INTERFACE_PREFIX = '__Options_',
    COMPONENT_INITIALIZE_STRUCT = '__initializeStruct',
    COMPONENT_UPDATE_STRUCT = '__updateStruct',
    COMPONENT_BUILD = '_build',
    REUSABLE_COMPONENT_REBIND_STATE = '__rebindStates',
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

export enum Dollars {
    DOLLAR_RESOURCE = '$r',
    DOLLAR_RAWFILE = '$rawfile',
    DOLLAR_DOLLAR = '$$',
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

// TODO: currently, we forcely assume initializerOptions is named in pattern __Options_xxx
export function getCustomComponentNameFromInitializerOptions(name: string): string | undefined {
    const prefix: string = CustomComponentNames.COMPONENT_INTERFACE_PREFIX;
    if (name.startsWith(prefix)) {
        return name.substring(prefix.length);
    }
}

export function getCustomComponentOptionsName(className: string): string {
    return `${CustomComponentNames.COMPONENT_INTERFACE_PREFIX}${className}`;
}

export function isStatic(node: arkts.AstNode): boolean {
    return node.isStatic;
}

export function getTypeParamsFromClassDecl(node: arkts.ClassDeclaration | undefined): readonly arkts.TSTypeParameter[] {
    return node?.definition?.typeParams?.params ?? [];
}

export function getTypeNameFromTypeParameter(node: arkts.TSTypeParameter | undefined): string | undefined {
    return node?.name?.name;
}

export function createOptionalClassProperty(
    name: string,
    property: arkts.ClassProperty,
    stageManagementIdent: string,
    modifiers: arkts.Es2pandaModifierFlags,
    needMemo: boolean = false
): arkts.ClassProperty {
    const newType: arkts.TypeNode | undefined = property.typeAnnotation?.clone();
    if (needMemo) {
        newType?.setAnnotations([annotation('memo')]);
    }
    const newProperty = arkts.factory.createClassProperty(
        arkts.factory.createIdentifier(name),
        undefined,
        stageManagementIdent.length ? createStageManagementType(stageManagementIdent, property) : newType,
        modifiers,
        false
    );
    return arkts.classPropertySetOptional(newProperty, true);
}

export function createStageManagementType(
    stageManagementIdent: string,
    property: arkts.ClassProperty
): arkts.ETSTypeReference {
    return arkts.factory.createTypeReference(
        arkts.factory.createTypeReferencePart(
            arkts.factory.createIdentifier(stageManagementIdent),
            arkts.factory.createTSTypeParameterInstantiation([
                property.typeAnnotation ? property.typeAnnotation.clone() : arkts.factory.createETSUndefinedType(),
            ])
        )
    );
}

export function getGettersFromClassDecl(definition: arkts.ClassDefinition): arkts.MethodDefinition[] {
    return definition.body.filter(
        (member) =>
            arkts.isMethodDefinition(member) &&
            arkts.hasModifierFlag(member, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_GETTER)
    ) as arkts.MethodDefinition[];
}

export type MemoAstNode =
    | arkts.ScriptFunction
    | arkts.ETSParameterExpression
    | arkts.ClassProperty
    | arkts.TSTypeAliasDeclaration
    | arkts.ETSFunctionType
    | arkts.ArrowFunctionExpression
    | arkts.ETSUnionType;

export function isMemoAnnotation(node: arkts.AnnotationUsage, memoName: string): boolean {
    if (!(node.expr !== undefined && arkts.isIdentifier(node.expr) && node.expr.name === memoName)) {
        return false;
    }
    return true;
}

export function addMemoAnnotation<T extends MemoAstNode>(node: T, memoName: string = 'memo'): T {
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
    if (arkts.isEtsParameterExpression(node)) {
        node.annotations = newAnnotations;
        return node;
    }
    return node.setAnnotations(newAnnotations) as T;
}

export function hasPropertyInAnnotation(annotation: arkts.AnnotationUsage, propertyName: string): boolean {
    return !!annotation.properties.find(
        (annoProp: arkts.AstNode) =>
            arkts.isClassProperty(annoProp) &&
            annoProp.key &&
            arkts.isIdentifier(annoProp.key) &&
            annoProp.key.name === propertyName
    );
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