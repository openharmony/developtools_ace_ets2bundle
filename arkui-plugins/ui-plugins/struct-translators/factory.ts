/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';
import {
    BuilderLambdaNames,
    addMemoAnnotation,
    CustomComponentNames,
    getCustomComponentOptionsName,
    getGettersFromClassDecl,
    getTypeNameFromTypeParameter,
    getTypeParamsFromClassDecl,
    isCustomComponentInterface,
    MemoNames,
} from '../utils';
import { factory as uiFactory } from '../ui-factory';
import { factory as propertyFactory } from '../property-translators/factory';
import { collect, filterDefined, annotation } from '../../common/arkts-utils';
import {
    classifyObservedTrack,
    classifyProperty,
    classifyPropertyInInterface,
    ClassScopeInfo,
    InterfacePropertyTranslator,
    PropertyTranslator,
} from '../property-translators';
import { CustomComponentScopeInfo, isEtsGlobalClass, isKnownMethodDefinition } from './utils';
import { collectStateManagementTypeImport, hasDecorator, PropertyCache } from '../property-translators/utils';
import { ProjectConfig } from '../../common/plugin-context';
import { DeclarationCollector } from '../../common/declaration-collector';
import { ImportCollector } from '../../common/import-collector';
import {
    ARKUI_COMPONENT_COMMON_SOURCE_NAME,
    DecoratorNames,
    Dollars,
    StateManagementTypes,
} from '../../common/predefines';
import { ObservedTrackTranslator } from '../property-translators/observedTrack';

export class factory {
    /*
     * update class `constructor` to private.
     */
    static setStructConstructorToPrivate(member: arkts.MethodDefinition): arkts.MethodDefinition {
        member.modifiers &= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        member.modifiers &= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PROTECTED;
        member.modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE;
        return member;
    }

    /*
     * create _build method.
     */
    static transformBuildMethodWithOriginBuild(
        method: arkts.MethodDefinition,
        typeName: string,
        optionsName: string,
        isDecl?: boolean
    ): arkts.MethodDefinition {
        const updateKey: arkts.Identifier = arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_BUILD);

        const scriptFunction: arkts.ScriptFunction = method.scriptFunction;
        const updateScriptFunction = arkts.factory.createScriptFunction(
            scriptFunction.body,
            arkts.FunctionSignature.createFunctionSignature(
                scriptFunction.typeParams,
                [
                    uiFactory.createStyleParameter(typeName),
                    uiFactory.createContentParameter(),
                    uiFactory.createInitializersOptionsParameter(optionsName),
                ],
                arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false
            ),
            scriptFunction.flags,
            scriptFunction.modifiers
        );
        addMemoAnnotation(updateScriptFunction);

        const modifiers: arkts.Es2pandaModifierFlags = isDecl
            ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_ABSTRACT
            : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            updateKey,
            updateScriptFunction,
            modifiers,
            false
        );
    }

    /*
     * generate _r(<newArgs>) or _rawfile(<newArgs>).
     */
    static generateTransformedResource(
        resourceNode: arkts.CallExpression,
        key: arkts.Identifier,
        newArgs: arkts.AstNode[]
    ): arkts.CallExpression {
        const transformedKey: string =
            key.name === Dollars.DOLLAR_RESOURCE ? Dollars.TRANSFORM_DOLLAR_RESOURCE : Dollars.TRANSFORM_DOLLAR_RAWFILE;
        ImportCollector.getInstance().collectImport(transformedKey);
        return arkts.factory.updateCallExpression(
            resourceNode,
            arkts.factory.createIdentifier(transformedKey),
            resourceNode.typeArguments,
            newArgs
        );
    }

    /*
     * create __initializeStruct method.
     */
    static createInitializeStruct(optionsTypeName: string, scope: CustomComponentScopeInfo): arkts.MethodDefinition {
        const updateKey: arkts.Identifier = arkts.factory.createIdentifier(
            CustomComponentNames.COMPONENT_INITIALIZE_STRUCT
        );

        let body: arkts.BlockStatement | undefined;
        let modifiers: arkts.Es2pandaModifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_ABSTRACT;
        if (!scope.isDecl) {
            body = arkts.factory.createBlock(PropertyCache.getInstance().getInitializeBody(scope.name));
            modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        }
        const scriptFunction: arkts.ScriptFunction = arkts.factory
            .createScriptFunction(
                body,
                arkts.FunctionSignature.createFunctionSignature(
                    undefined,
                    [uiFactory.createInitializersOptionsParameter(optionsTypeName), uiFactory.createContentParameter()],
                    arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers
            )
            .setIdent(updateKey);

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            updateKey,
            scriptFunction,
            modifiers,
            false
        );
    }

    /*
     * create __updateStruct method.
     */
    static createUpdateStruct(optionsTypeName: string, scope: CustomComponentScopeInfo): arkts.MethodDefinition {
        const updateKey: arkts.Identifier = arkts.factory.createIdentifier(
            CustomComponentNames.COMPONENT_UPDATE_STRUCT
        );

        let body: arkts.BlockStatement | undefined;
        let modifiers: arkts.Es2pandaModifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_ABSTRACT;
        if (!scope.isDecl) {
            body = arkts.factory.createBlock(PropertyCache.getInstance().getUpdateBody(scope.name));
            modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        }

        const scriptFunction: arkts.ScriptFunction = arkts.factory
            .createScriptFunction(
                body,
                arkts.FunctionSignature.createFunctionSignature(
                    undefined,
                    [uiFactory.createInitializersOptionsParameter(optionsTypeName)],
                    arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers
            )
            .setIdent(updateKey);

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            updateKey,
            scriptFunction,
            modifiers,
            false
        );
    }

    /*
     * create __toRecord method when the component is decorated with @Reusable.
     */
    static createToRecord(optionsTypeName: string, scope: CustomComponentScopeInfo): arkts.MethodDefinition {
        const paramsCasted = factory.generateParamsCasted(optionsTypeName);
        const returnRecord = arkts.factory.createReturnStatement(
            arkts.ObjectExpression.createObjectExpression(
                arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
                PropertyCache.getInstance().getToRecordBody(scope.name),
                false
            )
        );
        const body: arkts.BlockStatement = arkts.factory.createBlock([paramsCasted, returnRecord]);

        const params = arkts.ETSParameterExpression.create(
            arkts.factory.createIdentifier('params', factory.generateTypeReferenceWithTypeName('Object')),
            undefined
        );

        const toRecordScriptFunction = arkts.factory.createScriptFunction(
            body,
            arkts.FunctionSignature.createFunctionSignature(undefined, [params], factory.generateTypeRecord(), false),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
        );

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
            arkts.factory.createIdentifier('__toRecord'),
            toRecordScriptFunction,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OVERRIDE,
            false
        );
    }

    /*
     * generate `const paramsCasted = (params as <optionsTypeName>)`.
     */
    static generateParamsCasted(optionsTypeName: string): arkts.VariableDeclaration {
        return arkts.factory.createVariableDeclaration(
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_CONST,
            [
                arkts.factory.createVariableDeclarator(
                    arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_CONST,
                    arkts.factory.createIdentifier('paramsCasted'),
                    arkts.TSAsExpression.createTSAsExpression(
                        arkts.factory.createIdentifier('params'),
                        factory.generateTypeReferenceWithTypeName(optionsTypeName),
                        false
                    )
                ),
            ]
        );
    }

    /*
     * generate Record<string, Object> type.
     */
    static generateTypeRecord(): arkts.ETSTypeReference {
        return arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier('Record'),
                arkts.factory.createTSTypeParameterInstantiation([
                    factory.generateTypeReferenceWithTypeName('string'),
                    factory.generateTypeReferenceWithTypeName('Object'),
                ])
            )
        );
    }

    /*
     * create type reference with type name, e.g. number.
     */
    static generateTypeReferenceWithTypeName(typeName: string): arkts.ETSTypeReference {
        return arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(typeName))
        );
    }

    /*
     * create type reference with type name, e.g. number.
     */
    static updateCustomComponentClass(
        definition: arkts.ClassDefinition,
        members: arkts.AstNode[]
    ): arkts.ClassDefinition {
        return arkts.factory.updateClassDefinition(
            definition,
            definition.ident,
            definition.typeParams,
            definition.superTypeParams,
            definition.implements,
            undefined,
            definition.super,
            members,
            definition.modifiers,
            arkts.classDefinitionFlags(definition)
        );
    }

    /*
     * add headers for animation in CommonMethod
     */
    static modifyExternalComponentCommon(node: arkts.TSInterfaceDeclaration): arkts.TSInterfaceDeclaration {
        const animationStart = factory.createAnimationMethod(BuilderLambdaNames.ANIMATION_START);
        const animationStop = factory.createAnimationMethod(BuilderLambdaNames.ANIMATION_STOP);
        const updatedBody = arkts.factory.updateInterfaceBody(node.body!, [
            animationStart,
            animationStop,
            ...node.body!.body,
        ]);
        return arkts.factory.updateInterfaceDeclaration(
            node,
            node.extends,
            node.id,
            node.typeParams,
            updatedBody,
            node.isStatic,
            node.isFromExternal
        );
    }

    /*
     * generate animationStart(...) and animationStop(...)
     */
    static createAnimationMethod(key: string): arkts.MethodDefinition {
        const aniparams: arkts.Expression[] = [
            arkts.factory.createParameterDeclaration(
                arkts.factory.createIdentifier(
                    'value',
                    arkts.factory.createUnionType([
                        arkts.factory.createTypeReference(
                            arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier('AnimateParam'))
                        ),
                        arkts.factory.createETSUndefinedType(),
                    ])
                ),
                undefined
            ),
        ];
        const aniFunc = arkts.factory.createScriptFunction(
            undefined,
            arkts.factory.createFunctionSignature(undefined, aniparams, arkts.TSThisType.createTSThisType(), false),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
        );
        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            arkts.factory.createIdentifier(key),
            aniFunc,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );
    }

    /**
     * transform property members in custom-component class.
     */
    static tranformPropertyMembers(
        propertyTranslators: PropertyTranslator[],
        optionsTypeName: string,
        scope: CustomComponentScopeInfo
    ): arkts.AstNode[] {
        const propertyMembers = propertyTranslators.map((translator) => translator.translateMember());
        const collections = [];
        if (!scope.hasInitializeStruct) {
            collections.push(this.createInitializeStruct(optionsTypeName, scope));
        }
        if (!scope.hasUpdateStruct) {
            collections.push(this.createUpdateStruct(optionsTypeName, scope));
        }
        if (!!scope.annotations?.reusable) {
            collections.push(this.createToRecord(optionsTypeName, scope));
        }
        return collect(...collections, ...propertyMembers);
    }

    /**
     * transform non-property members in custom-component class.
     */
    static transformNonPropertyMembersInClass(
        member: arkts.AstNode,
        classTypeName: string | undefined,
        classOptionsName: string | undefined,
        className: string,
        isDecl?: boolean
    ): arkts.AstNode {
        if (arkts.isMethodDefinition(member)) {
            propertyFactory.addMemoToBuilderClassMethod(member);
            if (isKnownMethodDefinition(member, CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI) && !isDecl) {
                return this.setStructConstructorToPrivate(member);
            } else if (isKnownMethodDefinition(member, CustomComponentNames.COMPONENT_BUILD_ORI)) {
                return this.transformBuildMethodWithOriginBuild(
                    member,
                    classTypeName ?? className,
                    classOptionsName ?? getCustomComponentOptionsName(className),
                    isDecl
                );
            }
            return member;
        }
        return member;
    }

    /**
     * transform members in custom-component class.
     */
    static tranformClassMembers(node: arkts.ClassDeclaration, scope: CustomComponentScopeInfo): arkts.ClassDeclaration {
        if (!node.definition) {
            return node;
        }
        let classTypeName: string | undefined;
        let classOptionsName: string | undefined;
        if (scope.isDecl) {
            const [classType, classOptions] = getTypeParamsFromClassDecl(node);
            classTypeName = getTypeNameFromTypeParameter(classType);
            classOptionsName = getTypeNameFromTypeParameter(classOptions);
        }
        const definition: arkts.ClassDefinition = node.definition;
        const className: string | undefined = node.definition.ident?.name;
        if (!className) {
            throw new Error('Non Empty className expected for Component');
        }

        const propertyTranslators: PropertyTranslator[] = filterDefined(
            definition.body.map((it) => classifyProperty(it, scope))
        );
        const translatedMembers: arkts.AstNode[] = this.tranformPropertyMembers(
            propertyTranslators,
            classOptionsName ?? getCustomComponentOptionsName(className),
            scope
        );
        const updateMembers: arkts.AstNode[] = definition.body
            .filter((member) => !arkts.isClassProperty(member))
            .map((member: arkts.AstNode) =>
                factory.transformNonPropertyMembersInClass(
                    member,
                    classTypeName,
                    classOptionsName,
                    className,
                    scope.isDecl
                )
            );

        const updateClassDef: arkts.ClassDefinition = this.updateCustomComponentClass(definition, [
            ...translatedMembers,
            ...updateMembers,
        ]);
        return arkts.factory.updateClassDeclaration(node, updateClassDef);
    }

    /**
     * transform `$r` and `$rawfile` function calls.
     */
    static transformResource(
        resourceNode: arkts.CallExpression,
        projectConfig: ProjectConfig | undefined
    ): arkts.CallExpression {
        if (!arkts.isIdentifier(resourceNode.expression)) {
            return resourceNode;
        }
        const newArgs: arkts.AstNode[] = [
            arkts.factory.create1StringLiteral(projectConfig?.bundleName ? projectConfig.bundleName : ''),
            arkts.factory.create1StringLiteral(projectConfig?.moduleName ? projectConfig.moduleName : ''),
            ...resourceNode.arguments,
        ];
        return this.generateTransformedResource(resourceNode, resourceNode.expression, newArgs);
    }

    /**
     * transform members in interface.
     */
    static tranformInterfaceMembers(
        node: arkts.TSInterfaceDeclaration,
        externalSourceName?: string
    ): arkts.TSInterfaceDeclaration {
        if (!node.id || !node.body) {
            return node;
        }
        if (externalSourceName === ARKUI_COMPONENT_COMMON_SOURCE_NAME && node.id.name === 'CommonMethod') {
            return factory.modifyExternalComponentCommon(node);
        }
        if (isCustomComponentInterface(node)) {
            return factory.tranformCustomComponentInterfaceMembers(node);
        }
        return node;
    }

    /**
     * transform members in custom-component related interface.
     */
    static tranformCustomComponentInterfaceMembers(node: arkts.TSInterfaceDeclaration): arkts.TSInterfaceDeclaration {
        const propertyTranslators: InterfacePropertyTranslator[] = filterDefined(
            node.body!.body.map((it) => classifyPropertyInInterface(it))
        );

        let shouldUpdate: boolean = false;
        const newBody = propertyTranslators.map((translator) => {
            const newProperty = translator.translateProperty();
            shouldUpdate ||= translator.modified;
            return newProperty;
        });

        if (shouldUpdate) {
            return arkts.factory.updateInterfaceDeclaration(
                node,
                node.extends,
                node.id,
                node.typeParams,
                arkts.factory.updateInterfaceBody(node.body!, newBody),
                node.isStatic,
                node.isFromExternal
            );
        }

        return node;
    }

    static transformNormalClass(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
        if (!node.definition) {
            return node;
        }
        if (isEtsGlobalClass(node)) {
            node.definition.body.forEach(
                (member: arkts.AstNode) =>
                    arkts.isMethodDefinition(member) && propertyFactory.addMemoToBuilderClassMethod(member)
            );
            return node;
        }
        const newClassDef = factory.updateObservedTrackClassDef(node.definition);
        return arkts.factory.updateClassDeclaration(node, newClassDef);
    }

    static transformTSTypeAlias(node: arkts.TSTypeAliasDeclaration): arkts.TSTypeAliasDeclaration {
        if (arkts.isETSFunctionType(node.typeAnnotation) && hasDecorator(node.typeAnnotation, DecoratorNames.BUILDER)) {
            node.typeAnnotation.setAnnotations([annotation(MemoNames.MEMO)]);
        } 
        return node;
    }

    static updateObservedTrackClassDef(node: arkts.ClassDefinition): arkts.ClassDefinition {
        const isObserved: boolean = hasDecorator(node, DecoratorNames.OBSERVED);
        const classHasTrack: boolean = node.body.some(
            (member) => arkts.isClassProperty(member) && hasDecorator(member, DecoratorNames.TRACK)
        );
        if (!isObserved && !classHasTrack) {
            return node;
        }
        const updateClassDef: arkts.ClassDefinition = arkts.factory.updateClassDefinition(
            node,
            node.ident,
            node.typeParams,
            node.superTypeParams,
            [
                ...node.implements,
                arkts.TSClassImplements.createTSClassImplements(
                    arkts.factory.createTypeReference(
                        arkts.factory.createTypeReferencePart(
                            arkts.factory.createIdentifier(StateManagementTypes.OBSERVED_OBJECT)
                        )
                    )
                ),
                arkts.TSClassImplements.createTSClassImplements(
                    arkts.factory.createTypeReference(
                        arkts.factory.createTypeReferencePart(
                            arkts.factory.createIdentifier(StateManagementTypes.SUBSCRIBED_WATCHES)
                        )
                    )
                ),
            ],
            undefined,
            node.super,
            factory.observedTrackPropertyMembers(classHasTrack, node, isObserved),
            node.modifiers,
            arkts.classDefinitionFlags(node)
        );
        collectStateManagementTypeImport(StateManagementTypes.OBSERVED_OBJECT);
        return updateClassDef;
    }

    static observedTrackPropertyMembers(
        classHasTrack: boolean,
        definition: arkts.ClassDefinition,
        isObserved: boolean
    ): arkts.AstNode[] {
        const watchMembers: arkts.AstNode[] = propertyFactory.createWatchMembers();
        const v1RenderIdMembers: arkts.AstNode[] = propertyFactory.createV1RenderIdMembers();
        const conditionalAddRef: arkts.MethodDefinition = propertyFactory.conditionalAddRef();
        const getters: arkts.MethodDefinition[] = getGettersFromClassDecl(definition);
        const classScopeInfo: ClassScopeInfo = {
            isObserved: isObserved,
            classHasTrack: classHasTrack,
            getters: getters,
        };
        const propertyTranslators: ObservedTrackTranslator[] = filterDefined(
            definition.body.map((it) => classifyObservedTrack(it, classScopeInfo))
        );
        const propertyMembers = propertyTranslators.map((translator) => translator.translateMember());
        const nonClassPropertyOrGetter: arkts.AstNode[] = definition.body.filter(
            (member) =>
                !arkts.isClassProperty(member) &&
                !(
                    arkts.isMethodDefinition(member) &&
                    arkts.hasModifierFlag(member, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_GETTER)
                )
        );
        return [
            ...[...watchMembers, ...v1RenderIdMembers, conditionalAddRef],
            ...(classHasTrack ? [] : [propertyFactory.createMetaInObservedClass()]),
            ...collect(...propertyMembers),
            ...nonClassPropertyOrGetter,
            ...classScopeInfo.getters,
        ];
    }
}
