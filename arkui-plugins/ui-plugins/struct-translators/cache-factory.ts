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
    CallInfo,
    CustomComponentInfo as CustomComponentRecordInfo,
    FunctionInfo,
    NormalClassAnnotationInfo,
    NormalClassInfo,
    NormalInterfaceInfo,
    NormalInterfacePropertyInfo,
    StructMethodInfo,
} from '../../collectors/ui-collectors/records';
import {
    AnimationNames,
    ARKUI_BUILDER_SOURCE_NAME,
    CustomComponentNames,
    Dollars,
    NodeCacheNames,
    RESOURCE_TYPE,
    StateManagementTypes,
} from '../../common/predefines';
import { collect } from '../../common/arkts-utils';
import { MetaDataCollector } from '../../common/metadata-collector';
import { addMemoAnnotation } from '../../collectors/memo-collectors/utils';
import { InnerComponentInfoCache } from '../builder-lambda-translators/cache/innerComponentInfoCache';
import { PropertyRewriteCache } from '../property-translators/cache/propertyRewriteCache';
import { ComputedCache } from '../property-translators/cache/computedCache';
import { MonitorCache } from '../property-translators/cache/monitorCache';
import { PropertyCache } from '../property-translators/cache/propertyCache';
import { CustomDialogControllerPropertyCache } from '../property-translators/cache/customDialogControllerPropertyCache';
import { collectStateManagementTypeImport } from '../property-translators/utils';
import {
    CustomDialogNames,
    getCustomComponentOptionsName,
    getTypeNameFromTypeParameter,
    getTypeParamsFromClassDecl,
    isKnownMethodDefinition,
} from '../utils';
import { ConditionScopeFactory } from '../condition-scope-translators/condition-scope-factory';
import { CacheFactory as BuilderLambdaCacheFactory } from '../builder-lambda-translators/cache-factory';
import { factory as BuilderLambdaFactory } from '../builder-lambda-translators/factory';
import { CacheFactory as PropertyCacheFactory } from '../property-translators/cache-factory';
import { factory as PropertyFactory } from '../property-translators/factory';
import { factory as UIFactory } from '../ui-factory';
import { factory as StructFactory } from './factory';
import { getResourceParams, StructType } from './utils';
import {
    BuilderParamClassPropertyValueCache,
    CustomDialogControllerCache,
    PropertyFactoryCallTypeCache,
} from '../memo-collect-cache';

interface RewritedStructMethodInfo {
    hasInitializeStruct?: boolean;
    hasUpdateStruct?: boolean;
    hasToRecord?: boolean;
}

export function collectRewritedStructMethodInfo(
    node: arkts.AstNode,
    info?: RewritedStructMethodInfo
): RewritedStructMethodInfo {
    const currInfo = info ?? {};
    if (!arkts.isMethodDefinition(node)) {
        return currInfo;
    }
    const methodName = node.name.name;
    const hasInitializeStruct = methodName === CustomComponentNames.COMPONENT_INITIALIZE_STRUCT;
    const hasUpdateStruct = methodName === CustomComponentNames.COMPONENT_UPDATE_STRUCT;
    const hasToRecord = methodName === CustomComponentNames.COMPONENT_TO_RECORD;
    return {
        ...(!currInfo.hasInitializeStruct && { hasInitializeStruct }),
        ...(!currInfo.hasUpdateStruct && { hasUpdateStruct }),
        ...(!currInfo.hasToRecord && { hasToRecord }),
    };
}

export class CacheFactory {
    /**
     * create `__initializeStruct` method.
     */
    static createInitializeStruct(
        optionsTypeName: string,
        metadata: CustomComponentRecordInfo
    ): arkts.MethodDefinition {
        const updateKey: arkts.Identifier = arkts.factory.createIdentifier(
            CustomComponentNames.COMPONENT_INITIALIZE_STRUCT
        );

        let body: arkts.BlockStatement | undefined;
        let modifiers: arkts.Es2pandaModifierFlags =
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        if (!metadata.isDecl) {
            body = arkts.factory.createBlock([
                ...ComputedCache.getInstance().getCachedComputed(metadata.name!),
                ...PropertyCache.getInstance().getInitializeBody(metadata.name!),
                ...MonitorCache.getInstance().getCachedMonitors(metadata.name!),
            ]);
            modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        }
        const contentParam = UIFactory.createContentParameter();
        const scriptFunction: arkts.ScriptFunction = arkts.factory
            .createScriptFunction(
                body,
                arkts.FunctionSignature.createFunctionSignature(
                    undefined,
                    [UIFactory.createInitializersOptionsParameter(optionsTypeName), contentParam],
                    arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers
            )
            .setIdent(updateKey);
        const newMethod = arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            updateKey,
            scriptFunction,
            modifiers,
            false
        );
        CustomDialogControllerCache.getInstance().updateAll().reset();
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(contentParam);
        return newMethod;
    }

    /**
     * create `__updateStruct` method.
     */
    static createUpdateStruct(optionsTypeName: string, metadata: CustomComponentRecordInfo): arkts.MethodDefinition {
        const updateKey: arkts.Identifier = arkts.factory.createIdentifier(
            CustomComponentNames.COMPONENT_UPDATE_STRUCT
        );

        let body: arkts.BlockStatement | undefined;
        let modifiers: arkts.Es2pandaModifierFlags =
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        if (!metadata.isDecl) {
            body = arkts.factory.createBlock(PropertyCache.getInstance().getUpdateBody(metadata.name!));
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
     * create `__toRecord` method when the component is decorated with @Reusable.
     */
    static createToRecord(optionsTypeName: string, metadata: CustomComponentRecordInfo): arkts.MethodDefinition {
        const paramsCasted = StructFactory.generateParamsCasted(optionsTypeName);
        const returnRecord = arkts.factory.createReturnStatement(
            arkts.ObjectExpression.createObjectExpression(
                arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
                PropertyCache.getInstance().getToRecordBody(metadata.name!),
                false
            )
        );
        const body: arkts.BlockStatement = arkts.factory.createBlock([paramsCasted, returnRecord]);

        const params = arkts.ETSParameterExpression.create(
            arkts.factory.createIdentifier('params', StructFactory.generateTypeReferenceWithTypeName('Object')),
            undefined
        );

        const toRecordScriptFunction = arkts.factory.createScriptFunction(
            body,
            arkts.FunctionSignature.createFunctionSignature(
                undefined,
                [params],
                StructFactory.generateTypeRecord(),
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
        );

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
            arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_TO_RECORD),
            toRecordScriptFunction,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OVERRIDE,
            false
        );
    }

    static collectStructPropertyRewriteStatements(
        optionsTypeName: string,
        metadata: CustomComponentRecordInfo,
        scope: RewritedStructMethodInfo
    ): arkts.AstNode[] {
        const collections = [];
        if (!scope.hasInitializeStruct) {
            collections.push(this.createInitializeStruct(optionsTypeName, metadata));
        }
        if (!scope.hasUpdateStruct) {
            collections.push(this.createUpdateStruct(optionsTypeName, metadata));
        }
        if (!scope.hasToRecord && !!metadata.annotationInfo?.hasReusable) {
            collections.push(this.createToRecord(optionsTypeName, metadata));
        }
        BuilderParamClassPropertyValueCache.getInstance().updateAll().reset();
        PropertyFactoryCallTypeCache.getInstance().updateAll().reset();
        return collections;
    }

    /**
     * transform all members in struct or custom-component declation class.
     *
     * @internal
     */
    static transformStructMembers(
        node: arkts.ClassDeclaration,
        definition: arkts.ClassDefinition,
        metadata: CustomComponentRecordInfo,
        structType: StructType
    ): void {
        if (!metadata.name) {
            return;
        }
        const body: readonly arkts.AstNode[] = definition.body;
        let scopeInfo: RewritedStructMethodInfo = {};
        let hasStaticBlock: boolean = false;
        const transformedBody = body.map((child: arkts.AstNode) => {
            scopeInfo = collectRewritedStructMethodInfo(child, scopeInfo);
            if (structType === StructType.CUSTOM_COMPONENT_DECL) {
                return [child];
            }
            hasStaticBlock = arkts.isClassStaticBlock(child);
            const nodes = PropertyRewriteCache.getInstance().getRewriteNodes(child.peer);
            if (nodes.length > 0) {
                return nodes;
            }
            return [child];
        });
        let optionsTypeName: string | undefined;
        if (structType === StructType.CUSTOM_COMPONENT_DECL) {
            const [_, classOptions] = getTypeParamsFromClassDecl(node);
            optionsTypeName = getTypeNameFromTypeParameter(classOptions);
        }
        const newStatements = this.collectStructPropertyRewriteStatements(
            optionsTypeName ?? getCustomComponentOptionsName(metadata.name),
            metadata,
            scopeInfo
        );
        const newStaticBlock = !metadata.isDecl && !hasStaticBlock ? [UIFactory.createClassStaticBlock()] : [];
        const returnNodes: arkts.AstNode[] = collect(newStatements, ...transformedBody, newStaticBlock);
        definition.setBody(returnNodes);
        if (structType === StructType.STRUCT) {
            PropertyRewriteCache.getInstance().reset();
        }
    }

    /**
     * add `__setDialogController__` to `@CustomDialog` struct when there is any `CustomDialogController` property.
     *
     * @internal
     */
    static addSetDialogControllerToStruct(
        definition: arkts.ClassDefinition,
        metadata: CustomComponentRecordInfo,
        structType: StructType
    ): void {
        if (!metadata.name) {
            return;
        }
        if (
            structType === StructType.CUSTOM_COMPONENT_DECL &&
            metadata.name === CustomComponentNames.BASE_CUSTOM_DIALOG_NAME
        ) {
            definition.addProperties([StructFactory.createCustomDialogMethod(!!metadata.isDecl)]);
        } else if (structType === StructType.STRUCT && !!metadata.annotationInfo?.hasCustomDialog) {
            const info = CustomDialogControllerPropertyCache.getInstance().getInfo(metadata.name!);
            if (!!info) {
                definition.addProperties([
                    StructFactory.createCustomDialogMethod(
                        !!metadata.isDecl,
                        info.propertyName,
                        info.controllerTypeName
                    ),
                ]);
            }
            CustomDialogControllerPropertyCache.getInstance().reset();
        }
    }

    /**
     * transform members in custom-component class.
     */
    static tranformClassMembersFromInfo(
        node: arkts.ClassDeclaration,
        metadata: CustomComponentRecordInfo,
        structType: StructType
    ): arkts.ClassDeclaration {
        const definition = node.definition;
        if (!definition || !metadata.name) {
            return node;
        }
        if (structType === StructType.STRUCT && !!metadata.isDecl) {
            return node;
        }
        this.transformStructMembers(node, definition, metadata, structType);
        this.addSetDialogControllerToStruct(definition, metadata, structType);
        return node;
    }

    static transformAnimatableExtendMethod(
        node: arkts.MethodDefinition,
        metadata: FunctionInfo
    ): arkts.MethodDefinition {
        const name: string | undefined = metadata.name;
        const func: arkts.ScriptFunction = node.scriptFunction;
        const params = func.params as arkts.ETSParameterExpression[];
        const body = func.body;
        if (!name || !params.at(1) || !body || !arkts.isBlockStatement(body)) {
            return node;
        }
        const funcName: arkts.StringLiteral = arkts.factory.createStringLiteral(name);
        const paramValue: arkts.ETSParameterExpression = params.at(1)!;
        const statements = [...body.statements];
        const lastStatement = statements.pop();
        if (!lastStatement) {
            return node;
        }
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
                [funcName, paramValue.identifier, StructFactory.createAniExtendCbArg(paramValue, statements)]
            )
        );
        const newBody = arkts.factory.createBlock([createOrSetStatement, lastStatement]);
        node.scriptFunction.setBody(newBody);
        return node;
    }

    static transformETSGlobalClassFromInfo(
        node: arkts.ClassDeclaration,
        metadata: NormalClassInfo
    ): arkts.ClassDeclaration {
        const definition = node.definition;
        if (!definition) {
            return node;
        }
        let newStatements: arkts.AstNode[] = [];
        if (InnerComponentInfoCache.getInstance().isCollected()) {
            const cache: InnerComponentInfoCache = InnerComponentInfoCache.getInstance();
            const names = cache.getAllComponentNames();
            const methods = BuilderLambdaCacheFactory.createAllUniqueDeclaredComponentFunctions(names, cache);
            newStatements.push(...methods);
        }
        if (MetaDataCollector.getInstance().externalSourceName === ARKUI_BUILDER_SOURCE_NAME) {
            newStatements.push(...BuilderLambdaFactory.addConditionBuilderDecls());
        }
        definition.setBody([...definition.body, ...newStatements]);
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(definition);
        return node;
    }

    static transformObservedClassFromInfo(
        node: arkts.ClassDeclaration,
        metadata: NormalClassInfo
    ): arkts.ClassDeclaration {
        const definition = node.definition;
        if (!definition || !metadata.name) {
            return node;
        }
        definition.setImplements([
            ...definition.implements,
            arkts.TSClassImplements.createTSClassImplements(
                UIFactory.createTypeReferenceFromString(StateManagementTypes.OBSERVED_OBJECT)
            ),
            arkts.TSClassImplements.createTSClassImplements(
                UIFactory.createTypeReferenceFromString(StateManagementTypes.SUBSCRIBED_WATCHES)
            ),
        ]);
        definition.setBody(this.createObservedMembers(definition, metadata));
        collectStateManagementTypeImport(StateManagementTypes.OBSERVED_OBJECT);
        return node;
    }

    static createObservedMembers(definition: arkts.ClassDefinition, metadata: NormalClassInfo): arkts.AstNode[] {
        const isDecl: boolean = arkts.hasModifierFlag(definition, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
        const className: string = metadata.name!;
        const classAnnoInfo: NormalClassAnnotationInfo | undefined = metadata.annotationInfo;
        const isObservedV2: boolean = !!classAnnoInfo?.hasObservedV2;
        const isObserved: boolean = !!classAnnoInfo?.hasObserved;
        const watchMembers: arkts.AstNode[] = PropertyFactory.createWatchMembers();
        const v1RenderIdMembers: arkts.AstNode[] = PropertyFactory.createV1RenderIdMembers(isObservedV2);
        const conditionalAddRef: arkts.MethodDefinition = PropertyFactory.conditionalAddRef(isObservedV2);
        const metaProperty: arkts.ClassProperty[] =
            isObserved && !metadata.hasTrackProperty ? [PropertyFactory.createMetaInObservedClass()] : [];
        let hasConstructorToRewrite: boolean = false;
        let hasStaticBlock: boolean = false;
        const propertyMembers: arkts.AstNode[][] = definition.body.map((child: arkts.AstNode) => {
            hasStaticBlock = arkts.isClassStaticBlock(child);
            if (
                isObservedV2 &&
                !isDecl &&
                arkts.isMethodDefinition(child) &&
                isKnownMethodDefinition(child, CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI)
            ) {
                hasConstructorToRewrite = true;
                return [this.rewriteObservedV2Constuctor(child, className)];
            }
            const nodes = PropertyRewriteCache.getInstance().getRewriteNodes(child.peer);
            if (nodes.length > 0) {
                return nodes;
            }
            return [child];
        });
        const newConstructor =
            isObservedV2 && !hasConstructorToRewrite ? [this.createNewObservedV2Constuctor(className, isDecl)] : [];
        const newStaticBlock = !hasStaticBlock ? [UIFactory.createClassStaticBlock()] : [];
        const returnNodes: arkts.AstNode[] = collect(
            watchMembers,
            v1RenderIdMembers,
            conditionalAddRef,
            metaProperty,
            ...propertyMembers,
            newConstructor,
            newStaticBlock
        );
        PropertyRewriteCache.getInstance().reset();
        return returnNodes;
    }

    static rewriteObservedV2Constuctor(ctor: arkts.MethodDefinition, className: string): arkts.MethodDefinition {
        const addConstructorNodes: arkts.AstNode[] = MonitorCache.getInstance().getCachedMonitors(className);
        const scriptFunc: arkts.ScriptFunction = ctor.scriptFunction;
        const originBody = scriptFunc.body as arkts.BlockStatement | undefined;
        if (!originBody) {
            scriptFunc.setBody(arkts.factory.createBlock(addConstructorNodes));
        } else {
            scriptFunc.setBody(
                arkts.factory.updateBlock(originBody, [...originBody.statements, ...addConstructorNodes])
            );
        }
        return ctor;
    }

    static createNewObservedV2Constuctor(className: string, isDecl: boolean): arkts.MethodDefinition {
        const addConstructorNodes: arkts.AstNode[] = MonitorCache.getInstance().getCachedMonitors(className);
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

    /**
     * transform non-property members in custom-component class.
     */
    static transformNonPropertyMembersInClassFromInfo(
        member: arkts.MethodDefinition,
        metadata: StructMethodInfo
    ): arkts.MethodDefinition {
        PropertyCacheFactory.addMemoToBuilderClassMethodFromInfo(member, metadata);
        if (metadata.name === CustomComponentNames.COMPONENT_BUILD_ORI) {
            addMemoAnnotation(member.scriptFunction);
            return ConditionScopeFactory.rewriteBuilderMethod(member);
        }
        return member;
    }

    static transformResourceFromInfo(resourceNode: arkts.CallExpression, metadata: CallInfo): arkts.CallExpression {
        const projectConfig = MetaDataCollector.getInstance().projectConfig;
        const resourceInfo = MetaDataCollector.getInstance().resourceInfo;
        const args: readonly arkts.Expression[] = resourceNode.arguments;
        if (!projectConfig || !resourceInfo || args.length <= 0) {
            return resourceNode;
        }
        const resourceKind: Dollars = metadata.isResourceCall!;
        const firstArg: arkts.Expression = args.at(0)!;
        if (arkts.isStringLiteral(firstArg)) {
            return StructFactory.processStringLiteralResourceNode(
                resourceNode,
                resourceInfo,
                projectConfig,
                resourceKind,
                firstArg
            );
        } else if (args && args.length) {
            return StructFactory.generateTransformedResourceCall(
                resourceNode,
                getResourceParams(
                    -1,
                    resourceKind === Dollars.DOLLAR_RAWFILE ? RESOURCE_TYPE.rawfile : -1,
                    Array.from(args)
                ),
                '',
                false,
                projectConfig,
                resourceKind
            );
        }
        return resourceNode;
    }

    static extendInnerComponentAttributeInterface(
        node: arkts.TSInterfaceDeclaration,
        metadata: NormalInterfaceInfo
    ): arkts.TSInterfaceDeclaration {
        if (!InnerComponentInfoCache.getInstance().isCollected() || !metadata.name) {
            return node;
        }
        const componentName = metadata.name.replace(/Attribute$/, '');
        if (!InnerComponentInfoCache.getInstance().hasComponentName(componentName)) {
            return node;
        }
        return BuilderLambdaCacheFactory.addDeclaredSetMethodsInAttributeInterface(node, componentName);
    }

    static updateBuilderType(builderNode: arkts.MethodDefinition): arkts.MethodDefinition {
        const newType: arkts.TypeNode | undefined = UIFactory.createTypeReferenceFromString(
            CustomDialogNames.CUSTOM_BUILDER
        );
        if (builderNode.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
            const newOverLoads = builderNode.overloads.map((overload) => {
                if (arkts.isMethodDefinition(overload)) {
                    return this.updateBuilderType(overload);
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

}
