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
    CustomComponentNames,
    getCustomComponentOptionsName,
    getGettersFromClassDecl,
    getTypeNameFromTypeParameter,
    getTypeParamsFromClassDecl,
    isCustomComponentInterface,
    isKnownMethodDefinition
} from '../utils';
import { factory as uiFactory } from '../ui-factory';
import { factory as propertyFactory } from '../property-translators/factory';
import { collect, filterDefined } from '../../common/arkts-utils';
import {
    classifyObservedTrack,
    classifyProperty,
    classifyPropertyInInterface,
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
    isForEachCall,
} from './utils';
import { collectStateManagementTypeImport, hasDecorator, PropertyCache } from '../property-translators/utils';
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
} from '../../common/predefines';
import { ObservedTrackTranslator } from '../property-translators/observedTrack';
import { addMemoAnnotation } from '../../collectors/memo-collectors/utils';

export class factory {
    /**
     * update class `constructor` to private.
     */
    static setStructConstructorToPrivate(member: arkts.MethodDefinition): arkts.MethodDefinition {
        member.modifiers &= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        member.modifiers &= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PROTECTED;
        member.modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE;
        return member;
    }

    /**
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

    /**
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
     * add headers for animation & @AnimatableExtend in CommonMethod
     */
    static modifyExternalComponentCommon(node: arkts.TSInterfaceDeclaration): arkts.TSInterfaceDeclaration {
        const animationStart = factory.createAnimationMethod(AnimationNames.ANIMATION_START);
        const animationStop = factory.createAnimationMethod(AnimationNames.ANIMATION_STOP);
        const createOrSetAniProperty = factory.createOrSetAniProperty();
        const updatedBody = arkts.factory.updateInterfaceBody(node.body!, [
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
        const numberType = uiFactory.createTypeReferenceFromString('number');
        const AnimatableArithmeticType = arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier(AnimationNames.ANIMATABLE_ARITHMETIC),
                arkts.factory.createTSTypeParameterInstantiation([uiFactory.createTypeReferenceFromString('T')])
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
            arkts.factory.createIdentifier('functionName', uiFactory.createTypeReferenceFromString('string')),
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
            uiFactory.createScriptFunction({
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
    static transformNonPropertyMembersInClass(member: arkts.AstNode, isDecl?: boolean): arkts.AstNode {
        if (arkts.isMethodDefinition(member)) {
            propertyFactory.addMemoToBuilderClassMethod(member);
            if (isKnownMethodDefinition(member, CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI) && !isDecl) {
                return this.setStructConstructorToPrivate(member);
            }
            if (isKnownMethodDefinition(member, CustomComponentNames.COMPONENT_BUILD_ORI)) {
                addMemoAnnotation(member.scriptFunction);
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
        let classOptionsName: string | undefined;
        if (scope.isDecl) {
            const [_, classOptions] = getTypeParamsFromClassDecl(node);
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
            .map((member: arkts.AstNode) => factory.transformNonPropertyMembersInClass(member, scope.isDecl));

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
        if (externalSourceName === ARKUI_COMPONENT_COMMON_SOURCE_NAME && node.id.name === 'CommonMethod') {
            return factory.modifyExternalComponentCommon(node);
        }
        if (isCustomComponentInterface(node)) {
            return factory.tranformCustomComponentInterfaceMembers(node);
        }
        return factory.tranformInterfaceBuildMember(node);
    }

    static tranformInterfaceBuildMember(node: arkts.TSInterfaceDeclaration): arkts.TSInterfaceDeclaration {
        const newBody: arkts.AstNode[] = node.body!.body.map((it) => {
            if (arkts.isMethodDefinition(it)) {
                propertyFactory.addMemoToBuilderClassMethod(it);
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

    static transformNormalClass(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
        if (!node.definition) {
            return node;
        }
        if (isEtsGlobalClass(node)) {
            const updatedBody = node.definition.body.map((member: arkts.AstNode) => {
                arkts.isMethodDefinition(member) && propertyFactory.addMemoToBuilderClassMethod(member);
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
        const newClassDef = factory.updateObservedTrackClassDef(node.definition);
        return arkts.factory.updateClassDeclaration(node, newClassDef);
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
        const numberType = uiFactory.createTypeReferenceFromString('number');
        const AnimatableArithmeticType = arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier(AnimationNames.ANIMATABLE_ARITHMETIC),
                arkts.factory.createTSTypeParameterInstantiation([param.type as arkts.TypeNode])
            )
        );
        ImportCollector.getInstance().collectImport(AnimationNames.ANIMATABLE_ARITHMETIC);
        return arkts.factory.createArrowFunction(
            uiFactory.createScriptFunction({
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

    /*
     * add arrow function type to arguments of call expression.
     */
    static transformCallArguments(node: arkts.CallExpression): arkts.CallExpression {
        if (!arkts.isArrowFunctionExpression(node.arguments[1])) {
            return node;
        }
        const argTypeParam: arkts.Expression = node.arguments[1].scriptFunction.params[0];
        if (
            !arkts.isEtsParameterExpression(argTypeParam) ||
            !argTypeParam.type ||
            !arkts.isTypeNode(argTypeParam.type)
        ) {
            return node;
        }
        const referenceType = uiFactory.createComplexTypeFromStringAndTypeParameter('Array', [
            argTypeParam.type.clone(),
        ]);
        const newArrowArg: arkts.ArrowFunctionExpression = arkts.factory.createArrowFunction(
            uiFactory.createScriptFunction({
                body: arkts.factory.createBlock([arkts.factory.createReturnStatement(node.arguments[0])]),
                returnTypeAnnotation: referenceType,
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            })
        );
        return arkts.factory.updateCallExpression(node, node.expression, node.typeArguments, [
            newArrowArg,
            ...node.arguments.slice(1),
        ]);
    }

    static AddArrowTypeForParameter(node: arkts.MethodDefinition): arkts.MethodDefinition {
        if (node.scriptFunction.params.length < 2) {
            return node;
        }
        const paramFirst = node.scriptFunction.params[0];
        if (!arkts.isEtsParameterExpression(paramFirst) || !paramFirst.type || !arkts.isTypeNode(paramFirst.type)) {
            return node;
        }
        const script = uiFactory.updateScriptFunction(node.scriptFunction, {
            params: [
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier(
                        paramFirst.identifier.name,
                        uiFactory.createLambdaFunctionType([], paramFirst.type)
                    ),
                    undefined
                ),
                ...node.scriptFunction.params.slice(1),
            ],
        });
        return arkts.factory.updateMethodDefinition(node, node.kind, node.name, script, node.modifiers, false);
    }

    static transformCallExpression(
        node: arkts.CallExpression,
        projectConfig: ProjectConfig | undefined,
        resourceInfo: ResourceInfo
    ): arkts.CallExpression {
        if (arkts.isCallExpression(node) && isResourceNode(node)) {
            return this.transformResource(node, projectConfig, resourceInfo);
        }
        if (arkts.isCallExpression(node) && isForEachCall(node)) {
            return this.transformCallArguments(node);
        }
        return node;
    }
}
