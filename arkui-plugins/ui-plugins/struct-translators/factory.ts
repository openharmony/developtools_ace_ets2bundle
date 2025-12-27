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
    CustomComponentInfo,
    CustomComponentNames,
    CustomDialogNames,
    getCustomComponentOptionsName,
    getGettersFromClassDecl,
    getTypeNameFromTypeParameter,
    getTypeParamsFromClassDecl,
    getValueInObjectAnnotation,
    isCustomComponentInterface,
    isCustomDialogControllerOptions,
    isKnownMethodDefinition,
    isStatic,
} from '../utils';
import { factory as UIFactory } from '../ui-factory';
import { factory as PropertyFactory } from '../property-translators/factory';
import { factory as BuilderLambdaFactory } from '../builder-lambda-translators/factory';
import { BuilderFactory } from '../builder-lambda-translators/builder-factory';
import {
    annotation,
    backingField,
    collect,
    filterDefined,
    findLastPropertyElement,
    flatVisitMethodWithOverloads,
} from '../../common/arkts-utils';
import {
    classifyInObservedClass,
    classifyPropertyInInterface,
    classifyStructMembers,
    ClassScopeInfo,
    InterfacePropertyTranslator,
    PropertyTranslator,
} from '../property-translators';
import {
    CustomComponentScopeInfo,
    isEtsGlobalClass,
    ResourceInfo,
    checkRawfileResource,
    generateResourceModuleName,
    generateResourceBundleName,
    isDynamicName,
    preCheckResourceData,
    ResourceParameter,
    getResourceParams,
    isResourceNode,
    getCustomDialogController,
    isInvalidDialogControllerOptions,
    findBuilderIndexInControllerOptions,
    ObservedAnnoInfo,
    getNoTransformationMembersInClass,
    isComputedMethod,
    RouterInfo,
    getCustomComponentNameFromInfo,
} from './utils';
import { collectStateManagementTypeImport, generateThisBacking, hasDecorator } from '../property-translators/utils';
import { findComponentAttributeInInterface } from '../builder-lambda-translators/utils';
import { ProjectConfig } from '../../common/plugin-context';
import { ImportCollector } from '../../common/import-collector';
import {
    AnimationNames,
    ARKUI_COMPONENT_COMMON_SOURCE_NAME,
    DecoratorNames,
    Dollars,
    ModuleType,
    StateManagementTypes,
    RESOURCE_TYPE,
    ARKUI_BUILDER_SOURCE_NAME,
    TypeNames,
    NavigationNames,
    ArkTsDefaultNames,
    BuilderNames,
    EntryWrapperNames,
    CUSTOM_COMPONENT_IMPORT_SOURCE_NAME,
    UIClass,
    ARKUI_LOCAL_STORAGE_SOURCE_NAME,
    StructDecoratorNames,
} from '../../common/predefines';
import { ObservedTranslator } from '../property-translators/index';
import { addMemoAnnotation, MemoNames } from '../../collectors/memo-collectors/utils';
import { generateArkUICompatible } from '../interop/interop';
import { MetaDataCollector } from '../../common/metadata-collector';
import { ComponentAttributeCache } from '../builder-lambda-translators/cache/componentAttributeCache';
import { MethodTranslator } from '../property-translators/base';
import { MonitorCache } from '../property-translators/cache/monitorCache';
import { PropertyCache } from '../property-translators/cache/propertyCache';
import { ComputedCache } from '../property-translators/cache/computedCache';
import { isInteropComponent } from '../interop/utils';
import { GenSymGenerator } from '../../common/gensym-generator';

export class factory {
    /**
     * copy struct modifier flags to struct interface, with no default export but export flag.
     *
     * @param modifiers struct modifier flags
     * @returns struct interface modifier flags
     */
    static copyStructModifierFlagsToOptionsInterface(
        modifiers: arkts.Es2pandaModifierFlags
    ): arkts.Es2pandaModifierFlags {
        let _modifiers = modifiers;
        if (
            (modifiers & arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DEFAULT_EXPORT) ===
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DEFAULT_EXPORT
        ) {
            _modifiers ^= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DEFAULT_EXPORT;
        }
        return _modifiers | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT;
    }

    /**
     * update struct `constructor`.
     */
    static updateStructConstructor(member: arkts.AstNode, scopeInfo: CustomComponentInfo): arkts.AstNode {
        if (!arkts.isMethodDefinition(member)) {
            return member;
        }
        if (member.name.name !== CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI) {
            return member;
        }
        const isDecl = scopeInfo.isDecl;
        const isFromV2 = !!scopeInfo.annotations.componentV2;
        if (isFromV2) {
            return member;
        }
        const modifiers = isDecl
            ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC |
              arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE |
              arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONSTRUCTOR
            : member.modifiers | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PROTECTED;
        const body = isDecl
            ? undefined
            : arkts.factory.createBlock([
                  arkts.factory.createExpressionStatement(
                      arkts.factory.createCallExpression(arkts.factory.createSuperExpression(), undefined, [
                          arkts.factory.createIdentifier(BuilderLambdaNames.USE_SHARED_STORAGE_PARAM_NAME),
                          arkts.factory.createIdentifier(BuilderLambdaNames.STORAGE_PARAM_NAME),
                      ])
                  ),
              ]);
        return UIFactory.updateMethodDefinition(member, {
            modifiers: modifiers,
            function: {
                modifiers: modifiers,
                body,
                params: [this.createUseSharedStorageParamInInvoke(), this.createStorageParamInInvoke()],
            },
        });
    }

    /**
     * create __initializeStruct method.
     */
    static createInitializeStruct(optionsTypeName: string, scope: CustomComponentScopeInfo): arkts.MethodDefinition {
        const updateKey: arkts.Identifier = arkts.factory.createIdentifier(
            CustomComponentNames.COMPONENT_INITIALIZE_STRUCT
        );

        let body: arkts.BlockStatement | undefined;
        let modifiers: arkts.Es2pandaModifierFlags =
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        if (!scope.isDecl) {
            body = arkts.factory.createBlock([
                ...ComputedCache.getInstance().getCachedComputed(scope.name),
                ...PropertyCache.getInstance().getInitializeBody(scope.name),
                ...MonitorCache.getInstance().getCachedMonitors(scope.name),
            ]);
            modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        }
        const scriptFunction: arkts.ScriptFunction = arkts.factory
            .createScriptFunction(
                body,
                arkts.FunctionSignature.createFunctionSignature(
                    undefined,
                    [UIFactory.createInitializersOptionsParameter(optionsTypeName), UIFactory.createContentParameter()],
                    arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers
            )
            .setIdent(updateKey);
        const initializeMethod = arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            updateKey,
            scriptFunction,
            modifiers,
            false
        );
        if (!!scope.keyRange) {
            initializeMethod.range = scope.keyRange;
        }
        return initializeMethod;
    }

    static transformControllerInterfaceType(node: arkts.TSInterfaceDeclaration): arkts.TSInterfaceDeclaration {
        if (!node.body) {
            return node;
        }
        const nodeBody = node.body.body;
        const firstGetter = nodeBody.at(0);
        if (!firstGetter || !arkts.isMethodDefinition(firstGetter)) {
            return node;
        }
        const updatedBody = arkts.factory.updateInterfaceBody(node.body, [
            flatVisitMethodWithOverloads(firstGetter, this.updateBuilderType),
            ...nodeBody.slice(1),
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

    static updateBuilderType(builderNode: arkts.MethodDefinition): arkts.MethodDefinition {
        const newType: arkts.TypeNode | undefined = UIFactory.createTypeReferenceFromString(
            CustomDialogNames.CUSTOM_BUILDER
        );
        if (builderNode.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
            const newOverLoads = builderNode.overloads.map((overload) => {
                if (arkts.isMethodDefinition(overload)) {
                    return factory.updateBuilderType(overload);
                }
                return overload;
            });
            builderNode.setOverloads(newOverLoads);
            newOverLoads.forEach((it): void => {
                it.setBaseOverloadMethod(builderNode);
                it.parent = builderNode;
            });
            if (!!newType) {
                builderNode.scriptFunction.setReturnTypeAnnotation(newType);
            }
        } else if (builderNode.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET) {
            const param = builderNode.scriptFunction.params[0] as arkts.ETSParameterExpression;
            const newParam: arkts.Expression | undefined = arkts.factory.updateParameterDeclaration(
                param,
                arkts.factory.createIdentifier(param.identifier.name, newType),
                param.initializer
            );
            if (!!newParam) {
                return UIFactory.updateMethodDefinition(builderNode, { function: { params: [newParam] } });
            }
        }
        return builderNode;
    }

    /**
     * create __updateStruct method.
     */
    static createUpdateStruct(optionsTypeName: string, scope: CustomComponentScopeInfo): arkts.MethodDefinition {
        const updateKey: arkts.Identifier = arkts.factory.createIdentifier(
            CustomComponentNames.COMPONENT_UPDATE_STRUCT
        );

        let body: arkts.BlockStatement | undefined;
        let modifiers: arkts.Es2pandaModifierFlags =
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        if (!scope.isDecl) {
            body = arkts.factory.createBlock(PropertyCache.getInstance().getUpdateBody(scope.name));
            modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        }
        const scriptFunction: arkts.ScriptFunction = arkts.factory
            .createScriptFunction(
                body,
                arkts.FunctionSignature.createFunctionSignature(
                    undefined,
                    [UIFactory.createInitializersOptionsParameter(optionsTypeName)],
                    arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers
            )
            .setIdent(updateKey);
        const updateMethod = arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            updateKey,
            scriptFunction,
            modifiers,
            false
        );
        if (!!scope.keyRange) {
            updateMethod.range = scope.keyRange;
        }
        return updateMethod;
    }

    /**
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

    static createResetStateVars(optionsTypeName: string, scope: CustomComponentScopeInfo): arkts.MethodDefinition {
        const resetKey: arkts.Identifier = arkts.factory.createIdentifier(
            CustomComponentNames.RESET_STATE_VARS_ON_REUSE
        );
        let body: arkts.BlockStatement | undefined;
        let modifiers: arkts.Es2pandaModifierFlags =
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        if (!scope.isDecl) {
            body = arkts.factory.createBlock(PropertyCache.getInstance().getResetStateVars(scope.name));
            modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        }
        const params = UIFactory.createInitializersOptionsParameter(optionsTypeName)
        const scriptFunction = arkts.factory.createScriptFunction(
            body,
            arkts.FunctionSignature.createFunctionSignature(
                undefined,
                [params],
                arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            modifiers
        )
        .setIdent(resetKey);
        const resetMethod = arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            resetKey.clone(),
            scriptFunction,
            modifiers,
            false
        );
        return resetMethod;
    }

    /**
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

    /**
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

    /**
     * create type reference with type name, e.g. number.
     */
    static generateTypeReferenceWithTypeName(typeName: string): arkts.ETSTypeReference {
        return arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(typeName))
        );
    }

    /**
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

    /**
     * add following declared methods in `CommonMethod` interface:
     * - `animationStart` and `animationStop` for `Animation` component;
     * - `__createOrSetAnimatableProperty` for `@AnimatableExtend` function with receiver;
     * - `applyAttributesFinish` for component's style set options method.
     */
    static modifyExternalComponentCommon(node: arkts.TSInterfaceDeclaration): arkts.TSInterfaceDeclaration {
        if (!node.body) {
            return node;
        }
        const animationStart = factory.createAnimationMethod(AnimationNames.ANIMATION_START);
        const animationStop = factory.createAnimationMethod(AnimationNames.ANIMATION_STOP);
        const createOrSetAniProperty = factory.createOrSetAniProperty();
        const applyAttributesFinish = BuilderLambdaFactory.createDeclaredApplyAttributesFinish();
        const updatedBody = arkts.factory.updateInterfaceBody(node.body!, [
            applyAttributesFinish,
            animationStart,
            animationStop,
            createOrSetAniProperty,
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

    /**
     * helper to create value parameter for AnimatableExtend methods
     */
    static createAniExtendValueParam(): arkts.ETSParameterExpression {
        const numberType = UIFactory.createTypeReferenceFromString('number');
        const AnimatableArithmeticType = arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier(AnimationNames.ANIMATABLE_ARITHMETIC),
                arkts.factory.createTSTypeParameterInstantiation([UIFactory.createTypeReferenceFromString('T')])
            )
        );
        return arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(
                'value',
                arkts.factory.createUnionType([numberType, AnimatableArithmeticType])
            ),
            undefined
        );
    }

    /**
     * generate __createOrSetAnimatableProperty(...) for AnimatableExtend
     */
    static createOrSetAniProperty(): arkts.MethodDefinition {
        const funcNameParam: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier('functionName', UIFactory.createTypeReferenceFromString('string')),
            undefined
        );
        const cbParam = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(
                'callback',
                arkts.factory.createFunctionType(
                    arkts.factory.createFunctionSignature(
                        undefined,
                        [factory.createAniExtendValueParam()],
                        arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                        false
                    ),
                    arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
                )
            ),
            undefined
        );
        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            arkts.factory.createIdentifier(AnimationNames.CREATE_OR_SET_ANIMATABLEPROPERTY),
            UIFactory.createScriptFunction({
                typeParams: arkts.factory.createTypeParameterDeclaration(
                    [arkts.factory.createTypeParameter(arkts.factory.createIdentifier('T'))],
                    0
                ),
                params: [funcNameParam, factory.createAniExtendValueParam(), cbParam],
                returnTypeAnnotation: arkts.factory.createPrimitiveType(
                    arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID
                ),
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            }),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );
    }

    /**
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
        propertyTranslators: (PropertyTranslator | MethodTranslator)[],
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
        if (!!scope.annotations?.componentV2) {
            collections.push(this.createResetStateVars(optionsTypeName, scope));
        }
        return collect(...collections, ...propertyMembers);
    }

    /**
     * transform non-property members in custom-component class.
     */
    static transformNonPropertyMembersInClass(member: arkts.AstNode, isDecl?: boolean): arkts.AstNode {
        if (arkts.isMethodDefinition(member)) {
            PropertyFactory.addMemoToBuilderClassMethod(member);
            if (isKnownMethodDefinition(member, CustomComponentNames.COMPONENT_BUILD_ORI)) {
                addMemoAnnotation(member.scriptFunction);
                return BuilderFactory.rewriteBuilderMethod(member);
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
        const { name, isDecl, isCustomComponentClass, annotations } = scope;
        const definition: arkts.ClassDefinition = node.definition;
        const classIdent: arkts.Identifier | undefined = node.definition.ident;
        if (!classIdent) {
            throw new Error('Non Empty className expected for Component');
        }
        const className: string = classIdent.name;
        const body: readonly arkts.AstNode[] = definition.body;
        const propertyTranslators: (PropertyTranslator | MethodTranslator)[] = filterDefined(
            body.map((member) => classifyStructMembers(member, scope))
        );
        scope.keyRange = classIdent.range;
        const translatedMembers: arkts.AstNode[] = [];
        if (!isDecl || isCustomComponentClass) {
            const [_, classOptions] = getTypeParamsFromClassDecl(node);
            const classOptionsName = getTypeNameFromTypeParameter(classOptions);
            const rewritedProperties = this.tranformPropertyMembers(
                propertyTranslators,
                classOptionsName ?? getCustomComponentOptionsName(className),
                scope
            );
            translatedMembers.push(...rewritedProperties);
        }
        if (!isCustomComponentClass) {
            translatedMembers.push(factory.createInvokeImplMethod(className, scope));
        }
        const updateMembers: arkts.AstNode[] = body
            .filter((member) => !arkts.isClassProperty(member) && !isComputedMethod(member))
            .map((member: arkts.AstNode) => factory.transformNonPropertyMembersInClass(member, isDecl));
        const restMembers = (!isCustomComponentClass && isDecl) ? body : updateMembers;
        const updateClassDef: arkts.ClassDefinition = this.updateCustomComponentClass(
            definition,
            factory.addClassStaticBlock([...translatedMembers, ...restMembers], body)
        );
        if (
            !!annotations.customDialog ||
            (isCustomComponentClass && name === CustomComponentNames.BASE_CUSTOM_DIALOG_NAME)
        ) {
            updateClassDef.addProperties(factory.addControllerSetMethod(isDecl, body));
        }
        return arkts.factory.updateClassDeclaration(node, updateClassDef);
    }

    /**
     * Determine whether a class static block needs to be added.
     */
    static addClassStaticBlock(members: arkts.AstNode[], body: readonly arkts.AstNode[]): arkts.AstNode[] {
        const staticBlock = body.find((item: arkts.AstNode) => arkts.isClassStaticBlock(item));
        if (staticBlock) {
            return members;
        }
        const classHasStaticComputed = body.find((item: arkts.AstNode) => isComputedMethod(item) && isStatic(item));
        if (classHasStaticComputed) {
            members.push(UIFactory.createClassStaticBlock());
        }
        return members;
    }

    /**
     * add `__setDialogController__` method in `@CustomDialog` component.
     */
    static addControllerSetMethod(isDecl: boolean, body: readonly arkts.AstNode[]): arkts.MethodDefinition[] {
        if (isDecl) {
            return [this.createCustomDialogMethod(isDecl)];
        }
        const dialogControllerProperty: arkts.ClassProperty | undefined = findLastPropertyElement(
            body as arkts.AstNode[],
            (item: arkts.AstNode) => {
                return arkts.isClassProperty(item) && getCustomDialogController(item).length > 0;
            }
        ) as arkts.ClassProperty | undefined;
        if (!!dialogControllerProperty) {
            return [this.createCustomDialogMethod(isDecl, getCustomDialogController(dialogControllerProperty))];
        }
        return [];
    }

    /**
     * transform `$r` and `$rawfile` function calls.
     */
    static transformResource(
        resourceNode: arkts.CallExpression,
        projectConfig: ProjectConfig | undefined,
        resourceInfo: ResourceInfo
    ): arkts.CallExpression {
        if (!arkts.isIdentifier(resourceNode.expression) || !projectConfig) {
            return resourceNode;
        }
        const resourceKind: Dollars = resourceNode.expression.name as Dollars;
        if (arkts.isStringLiteral(resourceNode.arguments[0])) {
            return factory.processStringLiteralResourceNode(
                resourceNode,
                resourceInfo,
                projectConfig,
                resourceKind,
                resourceNode.arguments[0]
            );
        } else if (resourceNode.arguments && resourceNode.arguments.length) {
            return factory.generateTransformedResourceCall(
                resourceNode,
                getResourceParams(
                    -1,
                    resourceKind === Dollars.DOLLAR_RAWFILE ? RESOURCE_TYPE.rawfile : -1,
                    Array.from(resourceNode.arguments)
                ),
                '',
                false,
                projectConfig,
                resourceKind
            );
        }
        return resourceNode;
    }

    /*
     * Process string Literal type arguments for resource node.
     */
    static processStringLiteralResourceNode(
        resourceNode: arkts.CallExpression,
        resourceInfo: ResourceInfo,
        projectConfig: ProjectConfig,
        resourceKind: Dollars,
        literalArg: arkts.StringLiteral
    ): arkts.CallExpression {
        const resourceData: string[] = literalArg.str.trim().split('.');
        const fromOtherModule: boolean = !!resourceData.length && /^\[.*\]$/g.test(resourceData[0]);
        if (resourceKind === Dollars.DOLLAR_RAWFILE) {
            checkRawfileResource(resourceNode, literalArg, fromOtherModule, resourceInfo.rawfile);
            let resourceId: number = projectConfig.moduleType === ModuleType.HAR ? -1 : 0;
            let resourceModuleName: string = '';
            if (resourceData && resourceData[0] && fromOtherModule) {
                resourceId = -1;
                resourceModuleName = resourceData[0];
            }
            return factory.generateTransformedResourceCall(
                resourceNode,
                getResourceParams(resourceId, RESOURCE_TYPE.rawfile, [literalArg]),
                resourceModuleName,
                fromOtherModule,
                projectConfig,
                Dollars.DOLLAR_RAWFILE
            );
        } else {
            return factory.processStringLiteralDollarResourceNode(
                resourceNode,
                resourceInfo,
                projectConfig,
                resourceData,
                fromOtherModule
            );
        }
    }

    static createCustomDialogMethod(isDecl: boolean, controller?: string): arkts.MethodDefinition {
        let block: arkts.BlockStatement | undefined = undefined;
        if (!!controller) {
            block = arkts.factory.createBlock(this.createSetControllerElements(controller));
        }
        const param: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(
                CustomDialogNames.CONTROLLER,
                UIFactory.createTypeReferenceFromString(CustomDialogNames.CUSTOM_DIALOG_CONTROLLER)
            ),
            undefined
        );
        const modifiers = isDecl
            ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE
            : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        return UIFactory.createMethodDefinition({
            key: arkts.factory.createIdentifier(CustomDialogNames.SET_DIALOG_CONTROLLER_METHOD),
            kind: arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            function: {
                body: block,
                params: [param],
                returnTypeAnnotation: arkts.factory.createPrimitiveType(
                    arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID
                ),
                hasReceiver: false,
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers: modifiers,
            },
            modifiers: modifiers,
        });
    }

    /*
     * create assignment expression `this.__backing<controller> = controller`.
     */
    static createSetControllerElements(controller: string): arkts.AstNode[] {
        return controller.length !== 0
            ? [
                  arkts.factory.createExpressionStatement(
                      arkts.factory.createAssignmentExpression(
                          generateThisBacking(backingField(controller)),
                          arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                          arkts.factory.createIdentifier(CustomDialogNames.CONTROLLER)
                      )
                  ),
              ]
            : [];
    }

    /*
     * Process string Literal type arguments for $r node.
     */
    static processStringLiteralDollarResourceNode(
        resourceNode: arkts.CallExpression,
        resourceInfo: ResourceInfo,
        projectConfig: ProjectConfig,
        resourceData: string[],
        fromOtherModule: boolean
    ): arkts.CallExpression {
        if (
            preCheckResourceData(resourceNode, resourceData, resourceInfo.resourcesList, fromOtherModule, projectConfig)
        ) {
            const resourceId: number =
                projectConfig.moduleType === ModuleType.HAR ||
                fromOtherModule ||
                !resourceInfo.resourcesList[resourceData[0]]
                    ? -1
                    : resourceInfo.resourcesList[resourceData[0]].get(resourceData[1])![resourceData[2]];
            return factory.generateTransformedResourceCall(
                resourceNode,
                getResourceParams(
                    resourceId,
                    RESOURCE_TYPE[resourceData[1].trim()],
                    projectConfig.moduleType === ModuleType.HAR || fromOtherModule
                        ? Array.from(resourceNode.arguments)
                        : Array.from(resourceNode.arguments.slice(1))
                ),
                resourceData.length ? resourceData[0] : '',
                fromOtherModule,
                projectConfig,
                Dollars.DOLLAR_RESOURCE
            );
        }
        return resourceNode;
    }

    /*
     * generate tramsformed resource node, e.g. {id, type, params, bundleName, moduleName}.
     */
    static generateTransformedResourceCall(
        resourceNode: arkts.CallExpression,
        resourceParams: ResourceParameter,
        resourceModuleName: string,
        fromOtherModule: boolean,
        projectConfig: ProjectConfig,
        resourceKind: Dollars
    ): arkts.CallExpression {
        const transformedKey: string =
            resourceKind === Dollars.DOLLAR_RESOURCE
                ? Dollars.TRANSFORM_DOLLAR_RESOURCE
                : Dollars.TRANSFORM_DOLLAR_RAWFILE;
        ImportCollector.getInstance().collectImport(transformedKey);
        const isDynamicBundleOrModule: boolean = isDynamicName(projectConfig);
        const args: arkts.AstNode[] = [
            arkts.factory.createNumericLiteral(resourceParams.id),
            arkts.factory.createNumericLiteral(resourceParams.type),
            arkts.factory.createStringLiteral(generateResourceBundleName(projectConfig, isDynamicBundleOrModule)),
            arkts.factory.createStringLiteral(
                generateResourceModuleName(projectConfig, isDynamicBundleOrModule, resourceModuleName, fromOtherModule)
            ),
            ...resourceParams.params,
        ];
        return arkts.factory.updateCallExpression(
            resourceNode,
            arkts.factory.createIdentifier(transformedKey),
            undefined,
            args
        );
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
        const newNode = factory.tranformInterfaceBuildMember(node);
        if (externalSourceName === ARKUI_COMPONENT_COMMON_SOURCE_NAME && newNode.id!.name === 'CommonMethod') {
            return factory.modifyExternalComponentCommon(newNode);
        }
        if (isCustomDialogControllerOptions(node, externalSourceName)) {
            return factory.transformControllerInterfaceType(node);
        }
        if (isCustomComponentInterface(node)) {
            return factory.tranformCustomComponentInterfaceMembers(node);
        }
        let attributeName: string | undefined;
        if (
            ComponentAttributeCache.getInstance().isCollected() &&
            !!(attributeName = findComponentAttributeInInterface(node))
        ) {
            const componentName = attributeName.replace(/Attribute$/, '');
            if (!ComponentAttributeCache.getInstance().hasComponentName(componentName)) {
                return newNode;
            }
            return BuilderLambdaFactory.addDeclaredSetMethodsInAttributeInterface(newNode, componentName);
        }
        return newNode;
    }

    static tranformInterfaceBuildMember(node: arkts.TSInterfaceDeclaration): arkts.TSInterfaceDeclaration {
        const newBody: arkts.AstNode[] = node.body!.body.map((it) => {
            if (arkts.isMethodDefinition(it)) {
                PropertyFactory.addMemoToBuilderClassMethod(it);
            }
            return it;
        });
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

    static transformETSGlobalClass(node: arkts.ClassDeclaration, externalSourceName?: string): arkts.ClassDeclaration {
        if (!node.definition) {
            return node;
        }
        const updatedBody = node.definition.body.map((member: arkts.AstNode) => {
            arkts.isMethodDefinition(member) && PropertyFactory.addMemoToBuilderClassMethod(member);
            if (arkts.isMethodDefinition(member) && hasDecorator(member, DecoratorNames.ANIMATABLE_EXTEND)) {
                member = arkts.factory.updateMethodDefinition(
                    member,
                    member.kind,
                    member.name,
                    factory.transformAnimatableExtend(member.scriptFunction),
                    member.modifiers,
                    false
                );
            }
            return member;
        });
        if (ComponentAttributeCache.getInstance().isCollected()) {
            const attributeCache: ComponentAttributeCache = ComponentAttributeCache.getInstance();
            const names = attributeCache.getAllComponentNames();
            const methods = BuilderLambdaFactory.createAllUniqueDeclaredComponentFunctions(names);
            updatedBody.push(...methods);
        }
        return arkts.factory.updateClassDeclaration(
            node,
            arkts.factory.updateClassDefinition(
                node.definition,
                node.definition.ident,
                node.definition.typeParams,
                node.definition.superTypeParams,
                node.definition.implements,
                undefined,
                node.definition.super,
                updatedBody,
                node.definition.modifiers,
                arkts.classDefinitionFlags(node.definition)
            )
        );
    }

    static transformNormalClass(node: arkts.ClassDeclaration, externalSourceName?: string): arkts.ClassDeclaration {
        if (!node.definition) {
            return node;
        }
        if (isEtsGlobalClass(node)) {
            return this.transformETSGlobalClass(node, externalSourceName);
        }
        const newClassDef = factory.updateObservedTrackClassDef(node.definition);
        return arkts.factory.updateClassDeclaration(node, newClassDef);
    }

    /**
     * transform class definition with , `@ObservedV2` and `@Trace`, `@Observed` or `@Trace`.
     */
    static updateObservedTrackClassDef(node: arkts.ClassDefinition): arkts.ClassDefinition {
        const isObserved: boolean = hasDecorator(node, DecoratorNames.OBSERVED);
        const isObservedV2: boolean = hasDecorator(node, DecoratorNames.OBSERVED_V2);
        const classHasTrack: boolean = node.body.some(
            (member) => arkts.isClassProperty(member) && hasDecorator(member, DecoratorNames.TRACK)
        );
        const classHasTrace: boolean = node.body.some(
            (member) => arkts.isClassProperty(member) && hasDecorator(member, DecoratorNames.TRACE)
        );
        const className: string | undefined = node.ident?.name;
        if (!className || !(isObserved || classHasTrack || isObservedV2)) {
            return node;
        }
        const ObservedAnno: ObservedAnnoInfo = { isObserved, classHasTrack, isObservedV2, classHasTrace, className };
        const updateClassDef: arkts.ClassDefinition = arkts.factory.updateClassDefinition(
            node,
            node.ident,
            node.typeParams,
            node.superTypeParams,
            [
                ...node.implements,
                arkts.TSClassImplements.createTSClassImplements(
                    UIFactory.createTypeReferenceFromString(StateManagementTypes.OBSERVED_OBJECT)
                ),
                arkts.TSClassImplements.createTSClassImplements(
                    UIFactory.createTypeReferenceFromString(StateManagementTypes.SUBSCRIBED_WATCHES)
                ),
            ],
            undefined,
            node.super,
            factory.observedTrackPropertyMembers(node, ObservedAnno),
            node.modifiers,
            arkts.classDefinitionFlags(node)
        );
        collectStateManagementTypeImport(StateManagementTypes.OBSERVED_OBJECT);
        return updateClassDef;
    }

    static observedTrackPropertyMembers(
        definition: arkts.ClassDefinition,
        ObservedAnno: ObservedAnnoInfo
    ): arkts.AstNode[] {
        const watchMembers: arkts.AstNode[] = PropertyFactory.createWatchMembers();
        const v1RenderIdMembers: arkts.AstNode[] = PropertyFactory.createV1RenderIdMembers(ObservedAnno.isObservedV2);
        const conditionalAddRef: arkts.MethodDefinition = PropertyFactory.conditionalAddRef(ObservedAnno.isObservedV2);
        const getters: arkts.MethodDefinition[] = getGettersFromClassDecl(definition);
        const classScopeInfo: ClassScopeInfo = {
            isObserved: ObservedAnno.isObserved,
            classHasTrack: ObservedAnno.classHasTrack,
            isObservedV2: ObservedAnno.isObservedV2,
            classHasTrace: ObservedAnno.classHasTrace,
            className: ObservedAnno.className,
            getters: getters,
        };
        const body: readonly arkts.AstNode[] = definition.body;
        const translators: (ObservedTranslator | MethodTranslator)[] = filterDefined(
            body.map((it) => classifyInObservedClass(it, classScopeInfo))
        );
        const metaProperty: arkts.ClassProperty[] = ObservedAnno.classHasTrack
            ? []
            : [PropertyFactory.createMetaInObservedClass()];
        const propertyMembers = translators.map((translator) => translator.translateMember());
        const restMembers: arkts.AstNode[] = getNoTransformationMembersInClass(definition, ObservedAnno);
        const returnNodes = factory.addClassStaticBlock(
            [
                ...[...watchMembers, ...v1RenderIdMembers, conditionalAddRef],
                ...(ObservedAnno.isObserved ? metaProperty : []),
                ...collect(...propertyMembers),
                ...restMembers,
                ...classScopeInfo.getters,
            ],
            body
        );
        return ObservedAnno.isObservedV2
            ? returnNodes.concat(this.transformObservedV2Constuctor(definition, classScopeInfo.className))
            : returnNodes;
    }

    static transformObservedV2Constuctor(definition: arkts.ClassDefinition, className: string): arkts.MethodDefinition {
        const addConstructorNodes: arkts.AstNode[] = MonitorCache.getInstance().getCachedMonitors(className);
        let originConstructorMethod: arkts.MethodDefinition | undefined = definition.body.find(
            (it) =>
                arkts.isMethodDefinition(it) &&
                isKnownMethodDefinition(it, CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI)
        ) as arkts.MethodDefinition | undefined;
        const isDecl: boolean = arkts.hasModifierFlag(definition, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
        if (!originConstructorMethod) {
            return UIFactory.createMethodDefinition({
                key: arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI),
                function: {
                    key: arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI),
                    body: isDecl ? undefined : arkts.factory.createBlock(addConstructorNodes),
                    flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_CONSTRUCTOR,
                    modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONSTRUCTOR,
                },
                kind: arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONSTRUCTOR,
            });
        }
        if (isDecl) {
            return originConstructorMethod;
        }
        const originBody = originConstructorMethod.scriptFunction.body as arkts.BlockStatement | undefined;
        return UIFactory.updateMethodDefinition(originConstructorMethod, {
            function: {
                body: originBody
                    ? arkts.factory.updateBlock(originBody, [...originBody.statements, ...addConstructorNodes])
                    : arkts.factory.createBlock(addConstructorNodes),
            },
        });
    }

    /*
     * helper for transformAnimatableExtend to create callback argument in __createAnimatableProperty
     */
    static createAniExtendCbArg(
        param: arkts.ETSParameterExpression,
        originStatements: arkts.Statement[]
    ): arkts.ArrowFunctionExpression {
        const assignmentExpr = arkts.factory.createExpressionStatement(
            arkts.factory.createAssignmentExpression(
                param.identifier.clone(),
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                arkts.factory.createTSAsExpression(param.identifier.clone(), param.type as arkts.TypeNode, false)
            )
        );
        const numberType = UIFactory.createTypeReferenceFromString('number');
        const AnimatableArithmeticType = arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier(AnimationNames.ANIMATABLE_ARITHMETIC),
                arkts.factory.createTSTypeParameterInstantiation([param.type as arkts.TypeNode])
            )
        );
        ImportCollector.getInstance().collectImport(AnimationNames.ANIMATABLE_ARITHMETIC);
        return arkts.factory.createArrowFunction(
            UIFactory.createScriptFunction({
                body: arkts.factory.createBlock([assignmentExpr, ...originStatements]),
                params: [
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(
                            param.identifier.name,
                            arkts.factory.createUnionType([numberType, AnimatableArithmeticType])
                        ),
                        undefined
                    ),
                ],
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            })
        );
    }

    /*
     * transform @AnimatableExtend method
     */
    static transformAnimatableExtend(node: arkts.ScriptFunction): arkts.ScriptFunction {
        if (!arkts.isEtsParameterExpression(node.params[1]) || !node.body || !arkts.isBlockStatement(node.body)) {
            return node;
        }
        const funcName: arkts.StringLiteral = arkts.factory.createStringLiteral(node.id?.name!);
        const paramValue: arkts.ETSParameterExpression = node.params[1];
        const originStatements: arkts.Statement[] = [...node.body.statements];
        const createOrSetStatement = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createThisExpression(),
                    arkts.factory.createIdentifier(AnimationNames.CREATE_OR_SET_ANIMATABLEPROPERTY),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                [
                    funcName,
                    paramValue.identifier,
                    factory.createAniExtendCbArg(paramValue, originStatements.slice(0, -1)),
                ]
            )
        );
        return arkts.factory.updateScriptFunction(
            node,
            arkts.factory.createBlock([createOrSetStatement, originStatements[originStatements.length - 1]]),
            arkts.FunctionSignature.createFunctionSignature(
                node.typeParams,
                node.params,
                node.returnTypeAnnotation,
                node.hasReceiver
            ),
            node.flags,
            node.modifiers
        );
    }

    static transformCallExpression(
        node: arkts.CallExpression,
        projectConfig: ProjectConfig | undefined,
        resourceInfo: ResourceInfo,
        globalBuilder: boolean
    ): arkts.CallExpression {
        if (arkts.isCallExpression(node) && isResourceNode(node)) {
            return this.transformResource(node, projectConfig, resourceInfo);
        }
        if (isInteropComponent(node)) {
            return generateArkUICompatible(node as arkts.CallExpression, globalBuilder);
        }
        return node;
    }

    static transformCustomDialogController(
        node: arkts.ETSNewClassInstanceExpression
    ): arkts.ETSNewClassInstanceExpression | arkts.Expression {
        if (isInvalidDialogControllerOptions(node.getArguments)) {
            return node;
        }
        const optionArg = node.getArguments[0];
        const options: arkts.ObjectExpression = arkts.isObjectExpression(optionArg)
            ? optionArg
            : ((optionArg as arkts.TSAsExpression).expr as arkts.ObjectExpression);
        const properties = options.properties as arkts.Property[];
        const builderIndex: number = findBuilderIndexInControllerOptions(properties);
        if (builderIndex < 0 || !properties.at(builderIndex)!.value) {
            return node;
        }
        const builder: arkts.Property = properties.at(builderIndex)!;
        const gensymName: string = GenSymGenerator.getInstance().id();
        const newBuilderValue = this.createDialogBuilderArrow(builder.value!, gensymName);
        const newProperty = arkts.factory.updateProperty(builder, builder.key, newBuilderValue);
        const newObj = arkts.factory.updateObjectExpression(
            options,
            arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
            [
                ...(options.properties as arkts.Property[]).slice(0, builderIndex),
                newProperty,
                ...(options.properties as arkts.Property[]).slice(builderIndex + 1),
                this.createBaseComponent(),
            ],
            false
        );
        const newOptions = arkts.isTSAsExpression(optionArg)
            ? arkts.factory.updateTSAsExpression(optionArg, newObj, optionArg.typeAnnotation, optionArg.isConst)
            : newObj;
        const typeRef = node.getTypeRef as arkts.ETSTypeReference;
        const newNode = arkts.factory.updateETSNewClassInstanceExpression(node, typeRef, [newOptions]);
        return factory.createBlockStatementForOptionalExpression(newNode, gensymName);
    }

    static createDialogBuilderArrow(value: arkts.Expression, gensymName: string): arkts.Expression {
        if (
            arkts.isCallExpression(value) &&
            arkts.isMemberExpression(value.expression) &&
            arkts.isIdentifier(value.expression.property) &&
            value.expression.property.name === BuilderLambdaNames.TRANSFORM_METHOD_NAME
        ) {
            return addMemoAnnotation(
                arkts.factory.createArrowFunction(
                    UIFactory.createScriptFunction({
                        body: arkts.factory.createBlock([
                            arkts.factory.createExpressionStatement(
                                factory.transformCustomDialogComponentCall(value, gensymName)
                            ),
                        ]),
                        flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                        modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
                    })
                )
            );
        }
        if (arkts.isArrowFunctionExpression(value)) {
            return addMemoAnnotation(value);
        }
        return value;
    }

    static transformCustomDialogComponentCall(value: arkts.CallExpression, gensymName: string): arkts.CallExpression {
        if (value.arguments.length >= 3) {
            return arkts.factory.updateCallExpression(value, value.expression, value.typeArguments, [
                ...value.arguments.slice(0, 2),
                arkts.factory.createTSAsExpression(
                    arkts.factory.createIdentifier(gensymName),
                    UIFactory.createTypeReferenceFromString(CustomDialogNames.CUSTOM_DIALOG_CONTROLLER),
                    false
                ),
                ...value.arguments.slice(3),
            ]);
        }
        return value;
    }

    static genertateControllerSetCall(instanceIdent: arkts.Identifier, controllerName: string): arkts.AstNode {
        return arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    instanceIdent.clone(),
                    arkts.factory.createIdentifier(CustomDialogNames.SET_DIALOG_CONTROLLER_METHOD),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                [
                    arkts.factory.createTSAsExpression(
                        arkts.factory.createIdentifier(controllerName),
                        UIFactory.createTypeReferenceFromString(CustomDialogNames.CUSTOM_DIALOG_CONTROLLER),
                        false
                    ),
                ]
            )
        );
    }

    static createBaseComponent(): arkts.Property {
        return arkts.factory.createProperty(
            arkts.factory.createIdentifier(CustomDialogNames.BASE_COMPONENT),
            arkts.factory.createThisExpression()
        );
    }

    static generateLetVariableDecl(left: arkts.Identifier): arkts.VariableDeclaration {
        return arkts.factory.createVariableDeclaration(
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
            [
                arkts.factory.createVariableDeclarator(
                    arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                    left,
                    undefined
                ),
            ]
        );
    }

    static createBlockStatementForOptionalExpression(
        newNode: arkts.ETSNewClassInstanceExpression,
        gensymName: string
    ): arkts.Expression {
        const statements: arkts.Statement[] = [
            factory.generateLetVariableDecl(
                arkts.factory.createIdentifier(gensymName, UIFactory.createTypeReferenceFromString(TypeNames.ANY))
            ),
            arkts.factory.createExpressionStatement(
                arkts.factory.createAssignmentExpression(
                    arkts.factory.createIdentifier(gensymName),
                    arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                    newNode
                )
            ),
            arkts.factory.createExpressionStatement(
                arkts.factory.createTSAsExpression(
                    arkts.factory.createIdentifier(gensymName),
                    UIFactory.createTypeReferenceFromString(CustomDialogNames.CUSTOM_DIALOG_CONTROLLER),
                    false
                )
            ),
        ];
        return arkts.factory.createBlockExpression(statements);
    }

    static insertClassInEtsScript(node: arkts.EtsScript): arkts.EtsScript {
        const routerInfo: Map<string, RouterInfo[]> = MetaDataCollector.getInstance().routerInfo;
        const filePath: string | undefined = MetaDataCollector.getInstance().fileAbsName;
        if (!filePath || !routerInfo.has(filePath)) {
            return node;
        }
        let navigationBuilders: arkts.ExpressionStatement[] = [];
        routerInfo.get(filePath)!.forEach((info: RouterInfo) => {
            navigationBuilders.push(factory.createNavigationBuilderRegister(info));
        });
        let body: readonly arkts.AstNode[] = [
            arkts.factory.createClassProperty(
                arkts.factory.createIdentifier(NavigationNames.STATIC_BLOCK_TRIGGER_FIELD),
                arkts.factory.createBooleanLiteral(false),
                arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_BOOLEAN),
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC,
                false
            ),
            arkts.factory.createClassStaticBlock(
                arkts.factory.createFunctionExpression(
                    UIFactory.createScriptFunction({
                        key: arkts.factory.createIdentifier(ArkTsDefaultNames.DEFAULT_STATIC_BLOCK_NAME),
                        modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC,
                        flags:
                            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_STATIC_BLOCK |
                            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_EXPRESSION,
                        body: arkts.factory.createBlock(navigationBuilders),
                    })
                )
            ),
        ];
        const navigationClassNode = arkts.factory.createClassDeclaration(
            arkts.factory.createClassDefinition(
                arkts.factory.createIdentifier(NavigationNames.NAVIGATION_REGISTER_CLASS),
                undefined,
                undefined,
                [],
                undefined,
                undefined,
                body,
                arkts.Es2pandaClassDefinitionModifiers.CLASS_DEFINITION_MODIFIERS_CLASS_DECL,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
            )
        );
        return arkts.factory.updateEtsScript(node, [...node.statements, navigationClassNode]);
    }

    static createNavigationBuilderRegister(routerInfo: RouterInfo): arkts.ExpressionStatement {
        ImportCollector.getInstance().collectSource(BuilderNames.WRAP_BUILDER, ARKUI_BUILDER_SOURCE_NAME);
        ImportCollector.getInstance().collectImport(BuilderNames.WRAP_BUILDER);
        ImportCollector.getInstance().collectSource(
            EntryWrapperNames.ENTRY_POINT_CLASS_NAME,
            CUSTOM_COMPONENT_IMPORT_SOURCE_NAME
        );
        ImportCollector.getInstance().collectImport(EntryWrapperNames.ENTRY_POINT_CLASS_NAME);
        return arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                UIFactory.generateMemberExpression(
                    arkts.factory.createIdentifier(EntryWrapperNames.ENTRY_POINT_CLASS_NAME),
                    EntryWrapperNames.NAVIGATION_BUILDER_REGISTER
                ),
                undefined,
                [
                    arkts.factory.createStringLiteral(routerInfo.name),
                    arkts.factory.createCallExpression(
                        arkts.factory.createIdentifier(BuilderNames.WRAP_BUILDER),
                        undefined,
                        [arkts.factory.createIdentifier(routerInfo.buildFunction)]
                    ),
                ]
            )
        );
    }

    /**
     * create `initializers?: __Options_<structName>` in `$_invoke` static method.
     */
    static createInitializerParamInInvoke(structName: string): arkts.ETSParameterExpression {
        const optionType = UIFactory.createTypeReferenceFromString(getCustomComponentOptionsName(structName));
        return UIFactory.createParameterWithType(CustomComponentNames.COMPONENT_INITIALIZERS_NAME, optionType, true);
    }

    /**
     * create `storage?: LocalStorage` in `$_invoke` static method.
     */
    static createStorageParamInInvoke(): arkts.ETSParameterExpression {
        ImportCollector.getInstance().collectSource(UIClass.LOCAL_STORAGE, ARKUI_LOCAL_STORAGE_SOURCE_NAME);
        ImportCollector.getInstance().collectImport(UIClass.LOCAL_STORAGE);
        const localStorageType = UIFactory.createTypeReferenceFromString(UIClass.LOCAL_STORAGE);
        return UIFactory.createParameterWithType(BuilderLambdaNames.STORAGE_PARAM_NAME, localStorageType, true);
    }

    /**
     * create `useSharedStorage?: boolean` in `$_invoke` static method.
     */
    static createUseSharedStorageParamInInvoke(): arkts.ETSParameterExpression {
        const booleanType = arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_BOOLEAN);
        return UIFactory.createParameterWithType(BuilderLambdaNames.USE_SHARED_STORAGE_PARAM_NAME, booleanType, true);
    }

    /**
     * create `@Builder content?: () => void` in `$_invoke` static method.
     */
    static createContentParamInInvoke(): arkts.ETSParameterExpression {
        ImportCollector.getInstance().collectSource(DecoratorNames.BUILDER, ARKUI_BUILDER_SOURCE_NAME);
        ImportCollector.getInstance().collectImport(DecoratorNames.BUILDER);
        const builderAnno = annotation(DecoratorNames.BUILDER);
        const contentParam = UIFactory.createParameterWithType(
            BuilderLambdaNames.CONTENT_PARAM_NAME,
            UIFactory.createLambdaFunctionType(),
            true
        );
        contentParam.annotations = [builderAnno];
        return contentParam;
    }

    /**
     * create  `$_invoke` static method in struct
     */
    static createInvokeMethod(structName: string, isDecl: boolean): arkts.MethodDefinition {
        ImportCollector.getInstance().collectSource(BuilderLambdaNames.ANNOTATION_NAME, ARKUI_BUILDER_SOURCE_NAME);
        ImportCollector.getInstance().collectImport(BuilderLambdaNames.ANNOTATION_NAME);
        const componentBuilderAnno = annotation(BuilderLambdaNames.ANNOTATION_NAME);
        const initializerParam = this.createInitializerParamInInvoke(structName);
        const storageParam = this.createStorageParamInInvoke();
        const contentParam = this.createContentParamInInvoke();
        const methodBody = isDecl
            ? undefined
            : arkts.factory.createBlock([
                  arkts.factory.createThrowStatement(
                      arkts.factory.createETSNewClassInstanceExpression(
                          arkts.factory.createIdentifier(TypeNames.ERROR),
                          [arkts.factory.createStringLiteral('Declare interface')]
                      )
                  ),
              ]);
        let modifiers: arkts.Es2pandaModifierFlags = isDecl
            ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC |
              arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE |
              arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
            : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC;
        const returnType = UIFactory.createTypeReferenceFromString(structName);
        return UIFactory.createMethodDefinition({
            key: arkts.factory.createIdentifier(BuilderLambdaNames.ORIGIN_METHOD_NAME),
            kind: arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            function: {
                key: arkts.factory.createIdentifier(BuilderLambdaNames.ORIGIN_METHOD_NAME),
                body: methodBody,
                params: [initializerParam, storageParam, contentParam],
                returnTypeAnnotation: returnType,
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers: modifiers,
                annotations: [componentBuilderAnno],
            },
            modifiers: modifiers,
        });
    }

    /**
     * create `initializers: (() => __Options_<structName>} | undefined` in `_invokeImpl` static method.
     */
    static createInitializerParamInInvokeImpl(structName: string): arkts.ETSParameterExpression {
        const optionType = UIFactory.createTypeReferenceFromString(getCustomComponentOptionsName(structName));
        return arkts.factory.createParameterDeclaration(
            UIFactory.createIdentifierWithType(
                CustomComponentNames.COMPONENT_INITIALIZERS_NAME,
                UIFactory.createLambdaFunctionType(undefined, optionType),
                true
            ),
            undefined
        );
    }

    /**
     * create `storage: (() => LocalStorage) | undefined` in `_invokeImpl` static method.
     */
    static createStorageParamInInvokeImpl(): arkts.ETSParameterExpression {
        const localStorageType = UIFactory.createTypeReferenceFromString(UIClass.LOCAL_STORAGE);
        return arkts.factory.createParameterDeclaration(
            UIFactory.createIdentifierWithType(
                BuilderLambdaNames.STORAGE_PARAM_NAME,
                UIFactory.createLambdaFunctionType(undefined, localStorageType),
                true
            ),
            undefined
        );
    }

    /**
     * create `reuseId: string | undefined` for v1 and `reuseId: (() => string) | undefined` for v2 in `_invokeImpl` static method.
     */
    static createReuseIdParamInInvokeImpl(isComponent: boolean): arkts.ETSParameterExpression {
        const type = isComponent
            ? UIFactory.createTypeReferenceFromString(TypeNames.STRING)
            : arkts.factory.createFunctionType(
                  arkts.factory.createFunctionSignature(
                      undefined,
                      [],
                      UIFactory.createTypeReferenceFromString(TypeNames.STRING),
                      false
                  ),
                  arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
              );
        return arkts.factory.createParameterDeclaration(
            UIFactory.createIdentifierWithType(BuilderLambdaNames.REUSE_ID_PARAM_NAME, type, true),
            undefined
        );
    }

    /**
     * create `controller: CustomDialogController | undefined` in `_invokeImpl` static method.
     */
    static createControllerParamInInvokeImpl(): arkts.ETSParameterExpression {
        return arkts.factory.createParameterDeclaration(
            UIFactory.createIdentifierWithType(
                CustomDialogNames.CONTROLLER,
                UIFactory.createTypeReferenceFromString(CustomDialogNames.CUSTOM_DIALOG_CONTROLLER),
                true
            ),
            undefined
        );
    }

    /**
     * create `<customComponentName>._invokeImpl(() => new <structName>(storage), style, initializers, storage, reuseId, content);`
     */
    static createInvokeImplCall(structName: string, scopeInfo: CustomComponentScopeInfo): arkts.CallExpression {
        const customComponentName = getCustomComponentNameFromInfo(scopeInfo);
        const optionsName = getCustomComponentOptionsName(structName);
        const isFromCustomDialog = !!scopeInfo.annotations.customDialog;
        const isFromComponent = !!scopeInfo.annotations.component;
        const styleParams: arkts.Expression[] = [];
        const restIdents: arkts.Expression[] = [
            arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
            arkts.factory.createIdentifier(BuilderLambdaNames.CONTENT_PARAM_NAME),
        ];
        if (!isFromCustomDialog) {
            styleParams.push(arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_PARAM_NAME));
            restIdents.splice(1, 0, arkts.factory.createIdentifier(BuilderLambdaNames.REUSE_ID_PARAM_NAME));
        }
        let factoryParams: arkts.Expression[] = [];
        let useSharedStorage: arkts.Expression | undefined = undefined;
        if (!!scopeInfo.annotations.entry) {
            useSharedStorage = getValueInObjectAnnotation(
                scopeInfo.annotations.entry,
                StructDecoratorNames.ENTRY,
                BuilderLambdaNames.USE_SHARED_STORAGE_PARAM_NAME
            );
        }
        if (isFromCustomDialog || isFromComponent) {
            factoryParams.push(useSharedStorage ?? arkts.factory.createBooleanLiteral(false));
            factoryParams.push(
                UIFactory.createOptionalCall(
                    arkts.factory.createIdentifier(BuilderLambdaNames.STORAGE_PARAM_NAME),
                    undefined,
                    [],
                    true
                )
            );
        }
        const intrinsicCall = arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(customComponentName),
                arkts.factory.createIdentifier(BuilderLambdaNames.CUSTOM_COMPONENT_INVOKE_NAME),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            [UIFactory.createTypeReferenceFromString(structName), UIFactory.createTypeReferenceFromString(optionsName)],
            [
                ...styleParams,
                factory.createComponentFactoryParameter(structName, factoryParams, isFromCustomDialog),
                ...restIdents,
            ]
        );
        arkts.NodeCache.getInstance().collect(intrinsicCall);
        return intrinsicCall;
    }

    /**
     * create `(): <structName> => { return new <structName>(<factoryParams>) }`.
     */
    static createComponentFactoryParameter(
        structName: string,
        factoryParams: arkts.Expression[],
        isFromCustomDialog: boolean
    ): arkts.ArrowFunctionExpression {
        const newComponentInstance: arkts.ETSNewClassInstanceExpression =
            arkts.factory.createETSNewClassInstanceExpression(
                arkts.factory.createIdentifier(structName),
                factoryParams
            );
        let factoryBody: arkts.Statement[] = [arkts.factory.createReturnStatement(newComponentInstance)];
        if (isFromCustomDialog) {
            const instanceIdent: arkts.Identifier = arkts.factory.createIdentifier(
                BuilderLambdaNames.STYLE_ARROW_PARAM_NAME
            );
            factoryBody = [
                arkts.factory.createVariableDeclaration(
                    arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONST,
                    arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_CONST,
                    [
                        arkts.factory.createVariableDeclarator(
                            arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_CONST,
                            instanceIdent,
                            newComponentInstance
                        ),
                    ]
                ),
                arkts.factory.createIfStatement(
                    arkts.factory.createIdentifier(CustomDialogNames.CONTROLLER),
                    factory.genertateControllerSetCall(instanceIdent, CustomDialogNames.CONTROLLER)
                ),
                arkts.factory.createReturnStatement(instanceIdent.clone()),
            ];
        }
        return arkts.factory.createArrowFunction(
            UIFactory.createScriptFunction({
                body: arkts.factory.createBlock(factoryBody),
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                returnTypeAnnotation: UIFactory.createTypeReferenceFromString(structName),
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            })
        );
    }

    /**
     * create  `_invoke` static method in struct
     */
    static createInvokeImplMethod(structName: string, scopeInfo: CustomComponentScopeInfo) {
        const { isDecl, annotations } = scopeInfo;
        const params: arkts.Expression[] = [];
        const isCustomComponent = !!annotations.component || !!annotations.componentV2;
        const isCustomDialog = !!annotations.customDialog;
        if (isCustomComponent && !isCustomDialog) {
            const structType = UIFactory.createTypeReferenceFromString(structName);
            params.push(BuilderLambdaFactory.createStyleArgInBuilderLambdaDecl(structType));
        }
        params.push(this.createInitializerParamInInvokeImpl(structName));
        params.push(this.createStorageParamInInvokeImpl());
        if (isCustomDialog) {
            params.push(this.createControllerParamInInvokeImpl());
        } else if (isCustomComponent) {
            params.push(this.createReuseIdParamInInvokeImpl(!!annotations.component));
        }
        params.push(UIFactory.createContentParameter());
        const invokeCall = this.createInvokeImplCall(structName, scopeInfo);
        const methodBody = isDecl ? undefined : arkts.factory.createBlock([arkts.factory.createExpressionStatement(invokeCall)]);
        let modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC;
        if (isDecl) {
            modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
            modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        }
        const func = UIFactory.createScriptFunction({
            key: arkts.factory.createIdentifier(BuilderLambdaNames.TRANSFORM_METHOD_NAME),
            body: methodBody,
            params,
            returnTypeAnnotation: arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            modifiers,
        });
        addMemoAnnotation(func, MemoNames.MEMO_INTRINSIC_UI);
        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            arkts.factory.createIdentifier(BuilderLambdaNames.TRANSFORM_METHOD_NAME),
            func,
            modifiers,
            false
        );
    }
}
