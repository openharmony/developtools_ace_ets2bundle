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
    CustomComponentNames,
    CustomDialogNames,
    getCustomComponentOptionsName,
    getGettersFromClassDecl,
    getTypeNameFromTypeParameter,
    getTypeParamsFromClassDecl,
    isCustomComponentInterface,
    isCustomDialogControllerOptions,
    isKnownMethodDefinition,
} from '../utils';
import { factory as UIFactory } from '../ui-factory';
import { factory as PropertyFactory } from '../property-translators/factory';
import { factory as BuilderLambdaFactory } from '../builder-lambda-translators/factory';
import { backingField, collect, filterDefined } from '../../common/arkts-utils';
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
    isForEachCall,
    getCustomDialogController,
    isInvalidDialogControllerOptions,
    findBuilderIndexInControllerOptions,
    ObservedAnnoInfo,
    getNoTransformationMembersInClass,
} from './utils';
import {
    collectStateManagementTypeImport,
    generateThisBacking,
    hasDecorator,
    PropertyCache,
} from '../property-translators/utils';
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
} from '../../common/predefines';
import { ObservedTranslator } from '../property-translators/index';
import { addMemoAnnotation } from '../../collectors/memo-collectors/utils';
import { generateArkUICompatible, isArkUICompatible } from '../interop/interop';
import { GenSymGenerator } from '../../common/gensym-generator';
import { MethodTranslator } from 'ui-plugins/property-translators/base';

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
        let modifiers: arkts.Es2pandaModifierFlags =
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        if (!scope.isDecl) {
            body = arkts.factory.createBlock(PropertyCache.getInstance().getInitializeBody(scope.name));
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

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            updateKey,
            scriptFunction,
            modifiers,
            false
        );
    }

    static transformControllerInterfaceType(node: arkts.TSInterfaceDeclaration): arkts.TSInterfaceDeclaration {
        if (!node.body || node.body.body.length <= 0 || !arkts.isMethodDefinition(node.body.body[0])) {
            return node;
        }
        const updatedBody = arkts.factory.updateInterfaceBody(node.body, [
            this.updateBuilderType(node.body.body[0]),
            ...node.body.body.slice(1),
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
        if (!node.body) {
            return node;
        }
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
        return collect(...collections, ...propertyMembers);
    }

    /**
     * transform non-property members in custom-component class.
     */
    static transformNonPropertyMembersInClass(member: arkts.AstNode, isDecl?: boolean): arkts.AstNode {
        if (arkts.isMethodDefinition(member)) {
            PropertyFactory.addMemoToBuilderClassMethod(member);
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

        const propertyTranslators: (PropertyTranslator | MethodTranslator)[] = filterDefined(
            definition.body.map((it) => classifyStructMembers(it, scope))
        );
        const translatedMembers: arkts.AstNode[] = this.tranformPropertyMembers(
            propertyTranslators,
            classOptionsName ?? getCustomComponentOptionsName(className),
            scope
        );
        if (hasDecorator(node.definition, DecoratorNames.CUSTOM_DIALOG)) {
            const dialogControllerProperty: arkts.ClassProperty | undefined = definition.body.find(
                (item: arkts.AstNode) => arkts.isClassProperty(item) && getCustomDialogController(item).length > 0
            ) as arkts.ClassProperty | undefined;
            if (!!dialogControllerProperty) {
                translatedMembers.push(
                    this.createCustomDialogMethod(getCustomDialogController(dialogControllerProperty))
                );
            }
        }
        const updateMembers: arkts.AstNode[] = definition.body
            .filter(
                (member) =>
                    !arkts.isClassProperty(member) &&
                    !(arkts.isMethodDefinition(member) && hasDecorator(member, DecoratorNames.COMPUTED))
            )
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

    static createCustomDialogMethod(controller: string): arkts.MethodDefinition {
        const param: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(
                CustomDialogNames.CONTROLLER,
                UIFactory.createTypeReferenceFromString(CustomDialogNames.CUSTOM_DIALOG_CONTROLLER)
            ),
            undefined
        );
        const block = arkts.factory.createBlock(
            controller.length !== 0
                ? [
                      arkts.factory.createExpressionStatement(
                          arkts.factory.createAssignmentExpression(
                              generateThisBacking(backingField(controller)),
                              arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                              arkts.factory.createIdentifier(CustomDialogNames.CONTROLLER)
                          )
                      ),
                  ]
                : []
        );
        const script = arkts.factory.createScriptFunction(
            block,
            arkts.FunctionSignature.createFunctionSignature(
                undefined,
                [param],
                arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
        );

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            arkts.factory.createIdentifier(CustomDialogNames.SET_DIALOG_CONTROLLER_METHOD),
            script,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );
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
        if (isCustomDialogControllerOptions(node, externalSourceName)) {
            return factory.transformControllerInterfaceType(node);
        }
        if (isCustomComponentInterface(node)) {
            return factory.tranformCustomComponentInterfaceMembers(node);
        }
        return factory.tranformInterfaceBuildMember(node);
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
        let newStatements: arkts.AstNode[] = [];
        if (externalSourceName === ARKUI_BUILDER_SOURCE_NAME) {
            newStatements.push(...BuilderLambdaFactory.addConditionBuilderDecls());
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
                [...updatedBody, ...newStatements],
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
        const translators: (ObservedTranslator | MethodTranslator)[] = filterDefined(
            definition.body.map((it) => classifyInObservedClass(it, classScopeInfo))
        );
        const metaProperty: arkts.ClassProperty[] = ObservedAnno.classHasTrack
            ? []
            : [PropertyFactory.createMetaInObservedClass()];
        const propertyMembers = translators.map((translator) => translator.translateMember());
        const restMembers: arkts.AstNode[] = getNoTransformationMembersInClass(definition, ObservedAnno);
        const returnNodes = [
            ...[...watchMembers, ...v1RenderIdMembers, conditionalAddRef],
            ...(ObservedAnno.isObserved ? metaProperty : []),
            ...collect(...propertyMembers),
            ...restMembers,
            ...classScopeInfo.getters,
        ];
        return ObservedAnno.isObservedV2
            ? returnNodes.concat(this.transformObservedV2Constuctor(definition, classScopeInfo.className))
            : returnNodes;
    }

    static transformObservedV2Constuctor(definition: arkts.ClassDefinition, className: string): arkts.MethodDefinition {
        const addConstructorNodes: arkts.AstNode[] = PropertyCache.getInstance().getConstructorBody(className);
        let originConstructorMethod: arkts.MethodDefinition | undefined = definition.body.find(
            (it) =>
                arkts.isMethodDefinition(it) &&
                isKnownMethodDefinition(it, CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI)
        ) as arkts.MethodDefinition | undefined;
        if (!originConstructorMethod) {
            return UIFactory.createMethodDefinition({
                key: arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI),
                function: {
                    key: arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI),
                    body: arkts.factory.createBlock(addConstructorNodes),
                    flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_CONSTRUCTOR,
                    modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONSTRUCTOR,
                },
                kind: arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONSTRUCTOR,
            });
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
        const referenceType = UIFactory.createComplexTypeFromStringAndTypeParameter('Array', [
            argTypeParam.type.clone(),
        ]);
        const newArrowArg: arkts.ArrowFunctionExpression = arkts.factory.createArrowFunction(
            UIFactory.createScriptFunction({
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
        const script = UIFactory.updateScriptFunction(node.scriptFunction, {
            params: [
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier(
                        paramFirst.identifier.name,
                        UIFactory.createLambdaFunctionType([], paramFirst.type)
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
        if (isArkUICompatible(node)) {
            return generateArkUICompatible(node as arkts.CallExpression);
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
                                this.transformCustomDialogComponentCall(value, gensymName)
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
        if (value.arguments.length >= 2 && arkts.isArrowFunctionExpression(value.arguments[1])) {
            const originScript: arkts.ScriptFunction = value.arguments[1].scriptFunction;
            const newScript: arkts.ScriptFunction = UIFactory.updateScriptFunction(originScript, {
                body: this.generateInstanceSetController(originScript.body, gensymName),
            });
            return arkts.factory.updateCallExpression(value, value.expression, value.typeArguments, [
                value.arguments[0],
                arkts.factory.updateArrowFunction(value.arguments[1], newScript),
                ...value.arguments.slice(2),
            ]);
        }
        return value;
    }

    static generateInstanceSetController(
        body: arkts.AstNode | undefined,
        gensymName: string
    ): arkts.AstNode | undefined {
        if (
            !!body &&
            arkts.isBlockStatement(body) &&
            body.statements.length > 0 &&
            arkts.isReturnStatement(body.statements[0])
        ) {
            const instanceIdent: arkts.Identifier = arkts.factory.createIdentifier(
                BuilderLambdaNames.STYLE_ARROW_PARAM_NAME
            );
            return arkts.factory.updateBlock(body, [
                arkts.factory.createVariableDeclaration(
                    arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONST,
                    arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_CONST,
                    [
                        arkts.factory.createVariableDeclarator(
                            arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_CONST,
                            instanceIdent,
                            body.statements[0].argument?.clone()
                        ),
                    ]
                ),
                this.genertateControllerSetCall(instanceIdent, gensymName),
                arkts.factory.createReturnStatement(instanceIdent.clone()),
            ]);
        }
        return body;
    }

    static genertateControllerSetCall(instanceIdent: arkts.Identifier, gensymName: string): arkts.AstNode {
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
                        arkts.factory.createIdentifier(gensymName),
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
}
