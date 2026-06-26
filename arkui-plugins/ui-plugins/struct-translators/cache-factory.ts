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
    StructAnnotationInfo,
    StructMethodInfo,
} from '../../collectors/ui-collectors/records';
import {
    AnimationNames,
    APIComparison,
    APIVersions,
    ARKUI_BUILDER_SOURCE_NAME,
    BuilderLambdaNames,
    CustomComponentNames,
    CustomDialogNames,
    DecoratorNames,
    Dollars,
    INNER_COMPONENT_NON_SKIP_DECL_NAMES,
    GlobalReusePoolNames,
    NodeCacheNames,
    ObservedNames,
    RESOURCE_TYPE,
    ReusableOptions,
    StateManagementTypes,
    StructDecoratorNames,
} from '../../common/predefines';
import { collect, withAPIVersion, expectName } from '../../common/arkts-utils';
import { MetaDataCollector } from '../../common/metadata-collector';
import { isSdkVersionAtLeast } from '../builder-lambda-translators/utils';
import { addMemoAnnotation, MemoNames } from '../../collectors/memo-collectors/utils';
import { getCustomComponentNameFromAnnotationInfo } from '../../collectors/ui-collectors/utils';
import { InnerComponentInfoCache } from '../builder-lambda-translators/cache/innerComponentInfoCache';
import { PropertyRewriteCache } from '../property-translators/cache/propertyRewriteCache';
import { ComputedCache } from '../property-translators/cache/computedCache';
import { MonitorCache } from '../property-translators/cache/monitorCache';
import { SyncMonitorCache } from '../property-translators/cache/syncMonitorCache';
import { PropertyCache } from '../property-translators/cache/propertyCache';
import { ComponentLifecycleCache } from '../property-translators/cache/componentLifecycleCache';
import { ActiveInactiveCache } from '../property-translators/cache/activeInactiveCache';
import { CustomDialogControllerPropertyCache } from '../property-translators/cache/customDialogControllerPropertyCache';
import { collectStateManagementTypeImport, findDecoratorByName, generateThisBacking, hasDecorator } from '../property-translators/utils';
import { ResourceSourceCache } from '../insight-intent/resource-source-cache';
import {
    getCustomComponentOptionsName,
    getTypeNameFromTypeParameter,
    getTypeParamsFromClassDecl,
    getValueInObjectAnnotation,
    isKnownMethodDefinition,
} from '../utils';
import { CacheFactory as BuilderLambdaCacheFactory } from '../builder-lambda-translators/cache-factory';
import { BindableFactory } from '../builder-lambda-translators/bindable-factory';
import { factory as BuilderLambdaFactory } from '../builder-lambda-translators/factory';
import { CacheFactory as PropertyCacheFactory } from '../property-translators/cache-factory';
import { factory as PropertyFactory } from '../property-translators/factory';
import { factory as UIFactory } from '../ui-factory';
import { factory as StructFactory } from './factory';
import {
    checkIsDeclFromNormalClassInfo,
    checkIsDeclFromStructInfo,
    FromStructInfo,
    getResourceParams,
    processFromStructInfo,
    StructAnnotationPropertyFields,
    StructType
} from './utils';
import {
    BuilderParamClassPropertyValueCache,
    CustomDialogControllerCache,
    PropertyFactoryCallTypeCache,
} from '../memo-collect-cache';
import { NodeCacheFactory } from '../../common/node-cache';

const OBSERVED_ANY_PROP_MIN_VERSION = 26;

interface RewritedStructMethodInfo {
    hasInitializeStruct?: boolean;
    hasUpdateStruct?: boolean;
    hasToRecord?: boolean;
    hasResetStateVarsOnReuse?: boolean;
}

export function collectRewritedStructMethodInfo(
    node: arkts.AstNode,
    info?: RewritedStructMethodInfo
): RewritedStructMethodInfo {
    const currInfo = info ?? {};
    if (!arkts.isMethodDefinition(node)) {
        return currInfo;
    }
    const methodName = node.id!.name;
    const hasInitializeStruct = methodName === CustomComponentNames.COMPONENT_INITIALIZE_STRUCT;
    const hasUpdateStruct = methodName === CustomComponentNames.COMPONENT_UPDATE_STRUCT;
    const hasToRecord = methodName === CustomComponentNames.COMPONENT_TO_RECORD;
    const hasResetStateVarsOnReuse = methodName === CustomComponentNames.RESET_STATE_VARS_ON_REUSE;
    return {
        ...(!currInfo.hasInitializeStruct && { hasInitializeStruct }),
        ...(!currInfo.hasUpdateStruct && { hasUpdateStruct }),
        ...(!currInfo.hasToRecord && { hasToRecord }),
        ...(!currInfo.hasResetStateVarsOnReuse && { hasResetStateVarsOnReuse }),
    };
}

type GlobalReusePoolInfo = {
    reusePoolValue: arkts.Expression;
    poolAcceptsValue: arkts.Expression;
};

export class CacheFactory {
    /**
     * create `__initializeStruct` method.
     */
    static createInitializeStruct(
        optionsTypeName: string,
        metadata: CustomComponentRecordInfo,
        reusePoolInitStmt: arkts.ExpressionStatement | undefined
    ): arkts.MethodDefinition {
        const updateKey: arkts.Identifier = arkts.factory.createIdentifier(
            CustomComponentNames.COMPONENT_INITIALIZE_STRUCT
        );
        const isDecl = checkIsDeclFromStructInfo(metadata);
        let body: arkts.BlockStatement | undefined;
        let modifiers: arkts.Es2pandaModifierFlags =
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        if (!isDecl && !!metadata.name) {
            body = arkts.factory.createBlockStatement([
                ...(reusePoolInitStmt ? [reusePoolInitStmt] : []),
                ...ComputedCache.getInstance().getCachedComputed(metadata.name),
                ...PropertyCache.getInstance().getInitializeBody(metadata.name),
                ...MonitorCache.getInstance().getCachedMonitors(metadata.name),
                ...SyncMonitorCache.getInstance().getCachedSyncMonitors(metadata.name),
                ...ComponentLifecycleCache.getInstance().getCachedInitMethodCalls(metadata.name),
                ...ComponentLifecycleCache.getInstance().getCachedLifecycleObserverCalls(
                    metadata.name,
                    StructFactory.generateLifecycleObserverCall
                ),
                ...ActiveInactiveCache.getInstance().getCachedCallStatements(metadata.name),
            ]);
            if (PropertyCache.getInstance().shouldMemoUpdateInitializeStruct(metadata.name)) {
                NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).addNodeToUpdateByPeer(body.peer);
            }
            modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        }
        const contentParam = UIFactory.createContentParameter();
        const scriptFunction: arkts.ScriptFunction = arkts.factory
            .createScriptFunction(
                body,
                undefined,
                [UIFactory.createInitializersOptionsParameter(optionsTypeName), contentParam],
                arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false,
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers,
                updateKey,
                undefined
            );
        const newMethod = arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            updateKey,
            arkts.factory.createFunctionExpression(undefined, scriptFunction),
            modifiers,
            false
        );
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(contentParam);
        return newMethod;
    }

    /**
     * create `__updateStruct` method.
     */
    static createUpdateStruct(optionsTypeName: string, metadata: CustomComponentRecordInfo): arkts.MethodDefinition {
        const updateKey: arkts.Identifier = arkts.factory.createIdentifier(
            CustomComponentNames.COMPONENT_UPDATE_STRUCT
        );
        const isDecl = checkIsDeclFromStructInfo(metadata);
        let body: arkts.BlockStatement | undefined;
        let modifiers: arkts.Es2pandaModifierFlags =
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        if (!isDecl) {
            body = arkts.factory.createBlockStatement(PropertyCache.getInstance().getUpdateBody(metadata.name!));
            modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        }
        const scriptFunction: arkts.ScriptFunction = arkts.factory
            .createScriptFunction(
                body,
                undefined,
                [UIFactory.createInitializersOptionsParameter(optionsTypeName)],
                arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false,
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers,
                updateKey,
                undefined
            );

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            updateKey,
            arkts.factory.createFunctionExpression(undefined, scriptFunction),
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
        const body: arkts.BlockStatement = arkts.factory.createBlockStatement([paramsCasted, returnRecord]);

        const params = arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier('params', StructFactory.generateTypeReferenceWithTypeName('Object')),
            false,
            undefined
        );

        const toRecordScriptFunction = arkts.factory.createScriptFunction(
            body,
            undefined,
            [params],
            StructFactory.generateTypeRecord(),
            false,
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_TO_RECORD),
            undefined
        );

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
            arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_TO_RECORD),
            arkts.factory.createFunctionExpression(undefined, toRecordScriptFunction),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OVERRIDE,
            false
        );
    }

    /**
     * create `resetStateVarsOnReuse` method when the component is decorated with @ComponentV2.
     */
    static createResetStateVars(optionsTypeName: string, metadata: CustomComponentRecordInfo): arkts.MethodDefinition {
        const resetKey: arkts.Identifier = arkts.factory.createIdentifier(
            CustomComponentNames.RESET_STATE_VARS_ON_REUSE
        );
        const isDecl = checkIsDeclFromStructInfo(metadata);
        let body: arkts.BlockStatement | undefined;
        let modifiers: arkts.Es2pandaModifierFlags =
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        if (!isDecl && !!metadata.name) {
            body = arkts.factory.createBlockStatement(PropertyCache.getInstance().getResetStateVars(metadata.name));
            modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        }
        const params = UIFactory.createInitializersOptionsParameter(optionsTypeName)
        const scriptFunction = arkts.factory.createScriptFunction(
            body,
            undefined,
            [params],
            arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            false,
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            modifiers,
            resetKey,
            undefined
        )
        const functionExpression = arkts.factory.createFunctionExpression(resetKey.clone(), scriptFunction);
        const resetMethod = arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            resetKey.clone(),
            functionExpression,
            modifiers,
            false
        );
        if (!!body && PropertyCache.getInstance().shouldMemoUpdateResetOnReuse(metadata.name!)) {
            NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collectToUpdate(body);
        }
        return resetMethod;
    }

    static extractGlobalReusePoolInfoFromMetadata(
        definition: arkts.ClassDefinition | undefined,
        metadata: CustomComponentRecordInfo
    ): GlobalReusePoolInfo | undefined {
        if (!definition || !metadata.annotationInfo?.hasComponent && !metadata.annotationInfo?.hasComponentV2) {
            return undefined;
        }
        const anno = findDecoratorByName(definition, StructDecoratorNames.COMPONENT) ??
            findDecoratorByName(definition, StructDecoratorNames.COMPONENT_V2);
        if (!anno) {
            return undefined;
        }
        const annoName = (anno.expr && arkts.isIdentifier(anno.expr)) ? anno.expr.name : undefined;
        if (annoName === undefined) {
            return undefined;
        }
        const reusePoolValue = getValueInObjectAnnotation(anno, annoName, GlobalReusePoolNames.REUSE_POOL);
        const poolAcceptsValue = getValueInObjectAnnotation(anno, annoName, GlobalReusePoolNames.POOL_ACCEPTS);
        if (!reusePoolValue || !poolAcceptsValue) {
            return undefined;
        }
        if (
            arkts.isMemberExpression(reusePoolValue) &&
            arkts.isIdentifier(reusePoolValue.property) &&
            reusePoolValue.property.name === GlobalReusePoolNames.REUSE_POOL_OWNERSHIP_OFF
        ) {
            return undefined;
        }
        return { reusePoolValue, poolAcceptsValue };
    }

    static collectStructPropertyRewriteStatements(
        optionsTypeName: string,
        metadata: CustomComponentRecordInfo,
        scope: RewritedStructMethodInfo,
        globalReusePoolInfo? : GlobalReusePoolInfo | undefined
    ): arkts.AstNode[] {
        const collections = [];
        if (globalReusePoolInfo) {
            collections.push(StructFactory.createGlobalReusePoolBackingField());
        }
        if (!scope.hasInitializeStruct) {
            const reusePoolInitStmt = globalReusePoolInfo ? StructFactory.createGlobalReusePoolInitStatement(
                globalReusePoolInfo.reusePoolValue,
                globalReusePoolInfo.poolAcceptsValue
            ) : undefined;
            collections.push(this.createInitializeStruct(optionsTypeName, metadata, reusePoolInitStmt));
        }
        if (!scope.hasUpdateStruct) {
            collections.push(this.createUpdateStruct(optionsTypeName, metadata));
        }
        if (!scope.hasToRecord && !!metadata.annotationInfo?.hasReusable) {
            collections.push(this.createToRecord(optionsTypeName, metadata));
        }
        if (!scope.hasResetStateVarsOnReuse &&
            (!!metadata.annotationInfo?.hasComponentV2 || !!metadata.annotationInfo?.hasComponent)) {
            collections.push(this.createResetStateVars(optionsTypeName, metadata));
        }
        BuilderParamClassPropertyValueCache.getInstance().updateAll().reset();
        PropertyFactoryCallTypeCache.getInstance().updateAll().reset();
        PropertyCache.getInstance().reset();
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
            if (arkts.isMethodDefinition(child) &&
                child.id?.name === CustomComponentNames.RESOLVE_DECORATOR_SYMBOLS_METHOD &&
                arkts.hasModifierFlag(child, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC)) {
                return [];
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
        const isDecl: boolean = checkIsDeclFromStructInfo(metadata);
 	    const globalReusePoolInfo = structType === StructType.STRUCT && !isDecl && !!metadata.name
            ? this.extractGlobalReusePoolInfoFromMetadata(definition, metadata)
            : undefined;
        const newStatements = this.collectStructPropertyRewriteStatements(
            optionsTypeName ?? getCustomComponentOptionsName(metadata.name),
            metadata,
            scopeInfo,
            globalReusePoolInfo
        );
        if (structType === StructType.STRUCT) {
            const propertyFields = this.findStructAnnotationProperties(definition, metadata);
            const structInvokeMethod = this.createInvokeImplMethod(metadata.name, metadata, propertyFields);
            addMemoAnnotation(structInvokeMethod.function, MemoNames.MEMO_INTRINSIC_UI);
            newStatements.push(structInvokeMethod);
        }
        const newStaticBlock = !isDecl && !hasStaticBlock ? [UIFactory.createClassStaticBlock()] : [];
        const returnNodes: arkts.AstNode[] = collect(newStatements, ...transformedBody, newStaticBlock);
        definition.setBody(returnNodes);
        if (structType === StructType.STRUCT) {
            PropertyRewriteCache.getInstance().reset();
        }
    }

    /**
     * collect struct annotation properties' value
     */
    static findStructAnnotationProperties(
        definition: arkts.ClassDefinition, 
        metadata: CustomComponentRecordInfo
    ): StructAnnotationPropertyFields {
        const structPropertyFields: StructAnnotationPropertyFields = {};
        const fieldCollection: Map<string, Array<keyof StructAnnotationPropertyFields>> = new Map();

        if (!!metadata.annotationInfo?.hasEntry) {
            fieldCollection.set(StructDecoratorNames.ENTRY, [BuilderLambdaNames.USE_SHARED_STORAGE_PARAM_NAME]);
        }
        if (!!metadata.annotationInfo?.hasReusable) {
            fieldCollection.set(StructDecoratorNames.RESUABLE, [ReusableOptions.MEMORY_OPT_STRATEGY]);
        }
        if (!!metadata.annotationInfo?.hasReusableV2) {
            fieldCollection.set(StructDecoratorNames.RESUABLE_V2, [ReusableOptions.MEMORY_OPT_STRATEGY]);
        }
        definition.annotations.forEach((anno) => {
            const expr = anno.expr;
            if (!expr || !arkts.isIdentifier(expr)) {
                return;
            }
            const name = expr.name;
            if (fieldCollection.has(name)) {
                const collectedFields = fieldCollection.get(name)!;
                anno.properties.forEach((annoProp: arkts.AstNode) => {
                    if (!arkts.isClassProperty(annoProp)) {
                        return;
                    }
                    const key = annoProp.key;
                    if (!key || !arkts.isIdentifier(key)) {
                        return;
                    }
                    const keyName = key.name as keyof StructAnnotationPropertyFields;
                    if (collectedFields.includes(keyName)) {
                        structPropertyFields[keyName] = annoProp.value?.clone();
                    }
                });
            }
        });
        fieldCollection.clear();
        return structPropertyFields;
    }

    /**
     * create  `_invoke` static method in struct
     */
    static createInvokeImplMethod(
        structName: string, 
        metadata: CustomComponentRecordInfo, 
        propertyFields?: StructAnnotationPropertyFields
    ): arkts.MethodDefinition {
        const { annotationInfo } = metadata;
 	    const isDecl = checkIsDeclFromStructInfo(metadata);
        const params: arkts.Expression[] = [];
        const isCustomComponent = !!annotationInfo?.hasComponent || !!annotationInfo?.hasComponentV2;
        const isCustomDialog = !!annotationInfo?.hasCustomDialog;
        if (isCustomComponent && !isCustomDialog) {
            const structType = UIFactory.createTypeReferenceFromString(structName);
            params.push(BuilderLambdaFactory.createStyleArgInBuilderLambdaDecl(structType));
        }
        params.push(StructFactory.createInitializerParamInInvokeImpl(structName));
        params.push(StructFactory.createStorageParamInInvokeImpl());
        if (isCustomDialog) {
            params.push(StructFactory.createControllerParamInInvokeImpl());
        } else if (isCustomComponent) {
            params.push(StructFactory.createReuseIdParamInInvokeImpl(!!annotationInfo?.hasComponent));
        }
        params.push(UIFactory.createContentParameter());
        let methodBody: arkts.BlockStatement | undefined = undefined;
        if (!isDecl) {
            const invokeCall = this.createInvokeImplCall(structName, annotationInfo, propertyFields);
            if (invokeCall !== undefined) {
                methodBody = arkts.factory.createBlockStatement([arkts.factory.createExpressionStatement(invokeCall)]);
                NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(invokeCall);
            }
        }
        let modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC;
        if (isDecl) {
            modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
            modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        }
        const key: arkts.Identifier = arkts.factory.createIdentifier(BuilderLambdaNames.TRANSFORM_METHOD_NAME)
        const func = UIFactory.createScriptFunction({
            key,
            body: methodBody,
            params,
            returnTypeAnnotation: arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            modifiers,
        });
        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            key.clone(),
            arkts.factory.createFunctionExpression(key.clone(), func),
            modifiers,
            false
        );
    }

    /**
     * create `<customComponentName>._invokeImpl(() => new <structName>(storage), style, initializers, storage, reuseId, content, <options>);`
     */
    static createInvokeImplCall(
        structName: string, 
        annotationInfo: StructAnnotationInfo | undefined, 
        propertyFields?: StructAnnotationPropertyFields
    ): arkts.CallExpression | undefined {
        const customComponentName = getCustomComponentNameFromAnnotationInfo(annotationInfo);
        if (customComponentName === undefined) {
            return undefined;
        }
        const optionsName = getCustomComponentOptionsName(structName);
        const fromStructInfo = processFromStructInfo(annotationInfo);
        const styleParams: arkts.Expression[] = [];
        const restIdents: arkts.Expression[] = [
            arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
            arkts.factory.createIdentifier(BuilderLambdaNames.CONTENT_PARAM_NAME),
        ];
        if (!fromStructInfo.isFromCustomDialog) {
            styleParams.push(arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_PARAM_NAME));
            restIdents.splice(1, 0, arkts.factory.createIdentifier(BuilderLambdaNames.REUSE_ID_PARAM_NAME));
        }
        let factoryParams: arkts.Expression[] = [];
        if (fromStructInfo.isFromCustomDialog || fromStructInfo.isFromComponent) {
            factoryParams.push(propertyFields?.useSharedStorage ?? arkts.factory.createBooleanLiteral(false));
            factoryParams.push(
                UIFactory.createOptionalCall(
                    arkts.factory.createIdentifier(BuilderLambdaNames.STORAGE_PARAM_NAME),
                    undefined,
                    [],
                    true
                )
            );
        }
        const additionalArgs: arkts.Expression[] = [];
        const optionsArg = this.createInvokeImplCallOptionsArg(structName, fromStructInfo, propertyFields);
        if (optionsArg !== undefined) {
            additionalArgs.push(optionsArg);
        }
        const intrinsicCall = arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(customComponentName),
                arkts.factory.createIdentifier(BuilderLambdaNames.CUSTOM_COMPONENT_INVOKE_NAME),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            [
                ...styleParams,
                StructFactory.createComponentFactoryParameter(structName, factoryParams, fromStructInfo.isFromCustomDialog),
                ...restIdents,
                ...additionalArgs,
            ],
            arkts.factory.createTSTypeParameterInstantiation([
                UIFactory.createTypeReferenceFromString(structName),
                UIFactory.createTypeReferenceFromString(optionsName)
            ]),
            false,
            false
        );
        return intrinsicCall;
    }

    /**
     * create options argument for struct _invokeImpl call.
     * 
     * @internal
     */
    static createInvokeImplCallOptionsArg(
        structName: string, 
        fromStructInfo: FromStructInfo, 
        propertyFields?: StructAnnotationPropertyFields
    ): arkts.ObjectExpression | undefined {
        let optionsArg: arkts.ObjectExpression | undefined;

        if (fromStructInfo.isFromComponentV2) {
            const optionsBody: arkts.Property[] = [];
            optionsBody.push(this.addClassFromPropertyInInvokeImplCallOptions(structName));
            if (fromStructInfo.isFromReusable && !!propertyFields?.memoryOptimizationStrategy) {
                optionsBody.push(
                    this.addMemoryOptStrategyPropertyInInvokeImplCallOptions(propertyFields.memoryOptimizationStrategy)
                );
            }
            if (optionsBody.length > 0) {
                optionsArg = arkts.factory.createObjectExpression(optionsBody);
            }
        } else if (fromStructInfo.isFromComponent && isSdkVersionAtLeast(APIVersions.API_26)) {
            const optionsBody: arkts.Property[] = [];
            if (fromStructInfo.isFromReusable && !!propertyFields?.memoryOptimizationStrategy) {
                optionsBody.push(
                    this.addMemoryOptStrategyPropertyInInvokeImplCallOptions(propertyFields.memoryOptimizationStrategy)
                );
            }
            if (optionsBody.length > 0) {
                optionsArg = arkts.factory.createObjectExpression(optionsBody);
            }
        }
        return optionsArg;
    }

    /**
     * add `sClass: Class.from<structName>()` to struct _invokeImpl options argument.
     * 
     * @internal
     */
    static addClassFromPropertyInInvokeImplCallOptions(structName: string): arkts.Property {
        return arkts.factory.createProperty(
            arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
            arkts.factory.createIdentifier('sClass'),
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier('Class'),
                    arkts.factory.createIdentifier('from'),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                [],
                arkts.factory.createTSTypeParameterInstantiation([
                    UIFactory.createTypeReferenceFromString(structName)
                ]),
                false,
                false
            ),
            false,
            false
        );
    }

    /**
     * add `memoryOptimizationStrategy` property to struct _invokeImpl options argument.
     * 
     * @internal
     */
    static addMemoryOptStrategyPropertyInInvokeImplCallOptions(propertyValue: arkts.Expression): arkts.Property {
        return arkts.factory.createProperty(
            arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
            arkts.factory.createIdentifier(ReusableOptions.MEMORY_OPT_STRATEGY),
            propertyValue,
            false,
            false
        );
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
        const isDecl = checkIsDeclFromStructInfo(metadata);
        if (
            structType === StructType.CUSTOM_COMPONENT_DECL &&
            metadata.name === CustomComponentNames.BASE_CUSTOM_DIALOG_NAME
        ) {
            definition.addProperties([StructFactory.createCustomDialogMethod(!!isDecl)]);
        } else if (structType === StructType.STRUCT && !!metadata.annotationInfo?.hasCustomDialog) {
            const info = CustomDialogControllerPropertyCache.getInstance().getInfo(metadata.name!);
            if (!!info) {
                definition.addProperties([
                    StructFactory.createCustomDialogMethod(
                        !!isDecl,
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
        if (structType === StructType.STRUCT && checkIsDeclFromStructInfo(metadata)) {
            const structInvokeMethod = this.createInvokeImplMethod(metadata.name, metadata);
            addMemoAnnotation(structInvokeMethod.function, MemoNames.MEMO_INTRINSIC_UI);
            const newDefinitionStatements = [...definition.body, structInvokeMethod];
            definition.setBody(newDefinitionStatements);
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
        if (MetaDataCollector.getInstance().isDeclaration || metadata.isDecl) {
            return node;
        }
        const name: string | undefined = metadata.name;
        const func: arkts.ScriptFunction = node.function;
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
                [funcName, paramValue.ident!, StructFactory.createAniExtendCbArg(paramValue, statements)],
                undefined,
                false,
                false
            )
        );
        const newBody = arkts.factory.createBlockStatement([createOrSetStatement, lastStatement]);
        node.function.setBody(newBody);
        return node;
    }

    static transformETSGlobalClassFromInfo(
        node: arkts.ClassDeclaration,
        metadata: NormalClassInfo
    ): arkts.ClassDeclaration {
        withAPIVersion(
            { version: APIVersions.API_24, compare: APIComparison.LESS_THAN_OR_EQUAL },
            (sdkVersion: APIVersions) => {
                const definition = node.definition;
                if (!definition) {
                    return;
                }
                let newStatements: arkts.AstNode[] = [];
                if (InnerComponentInfoCache.getInstance().isCollected()) {
                    const cache: InnerComponentInfoCache = InnerComponentInfoCache.getInstance();
                    const names = cache.getAllComponentNames();
                    const methods = BuilderLambdaCacheFactory.createAllUniqueDeclaredComponentFunctions(names, cache);
                    newStatements.push(...methods);
                }
                definition.setBody([...definition.body, ...newStatements]);
                NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(definition);
            },
            { 
                ignoreCompare: 
                    InnerComponentInfoCache.getInstance().isCollected() && 
                    InnerComponentInfoCache.getInstance().getAllComponentNames().filter(
                        name => INNER_COMPONENT_NON_SKIP_DECL_NAMES.includes(name)
                    ).length > 0
            }
        );
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
        const classAnnoInfo: NormalClassAnnotationInfo | undefined = metadata.annotationInfo;
        const isObservedV2: boolean = !!classAnnoInfo?.hasObservedV2;
        const implementsArr: arkts.TSClassImplements[] = [
            ...definition.implements,
            arkts.TSClassImplements.createTSClassImplements(
                UIFactory.createTypeReferenceFromString(StateManagementTypes.OBSERVED_OBJECT)
            ),
            arkts.TSClassImplements.createTSClassImplements(
                UIFactory.createTypeReferenceFromString(StateManagementTypes.SUBSCRIBED_WATCHES)
            ),
        ];
        if (isObservedV2 && isSdkVersionAtLeast(OBSERVED_ANY_PROP_MIN_VERSION)) {
            implementsArr.push(arkts.TSClassImplements.createTSClassImplements(
                UIFactory.createTypeReferenceFromString(StateManagementTypes.OBSERVED_ANY_PROP)
            ));
            collectStateManagementTypeImport(StateManagementTypes.OBSERVED_ANY_PROP);
        }
        definition.setImplements(implementsArr);
        definition.setBody(this.createObservedMembers(definition, metadata));
        collectStateManagementTypeImport(StateManagementTypes.OBSERVED_OBJECT);
        collectStateManagementTypeImport(StateManagementTypes.SUBSCRIBED_WATCHES);
        return node;
    }

    static createObservedMembers(definition: arkts.ClassDefinition, metadata: NormalClassInfo): arkts.AstNode[] {
        const isDecl: boolean = checkIsDeclFromNormalClassInfo(metadata);
        const className: string = metadata.name!;
        const classAnnoInfo: NormalClassAnnotationInfo | undefined = metadata.annotationInfo;
        const isObservedV2: boolean = !!classAnnoInfo?.hasObservedV2;
        const isObserved: boolean = !!classAnnoInfo?.hasObserved;
        const watchMembers: arkts.AstNode[] = PropertyFactory.createWatchMembers(isDecl);
        const v1RenderIdMembers: arkts.AstNode[] = PropertyFactory.createV1RenderIdMembers(isObservedV2, isDecl);
        const conditionalAddRef: arkts.MethodDefinition | undefined = !isDecl 
            ? PropertyFactory.conditionalAddRef(isObservedV2)
            : undefined;
        const metaProperty: arkts.ClassProperty[] = !isDecl && isObserved && !metadata.hasTrackProperty 
            ? [PropertyFactory.createMetaInObservedClass()] 
            : [];
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
        const newConstructor = !isDecl && isObservedV2 && !hasConstructorToRewrite 
            ? [this.createNewObservedV2Constuctor(className, isDecl)] 
            : [];
        const newStaticBlock = !isDecl && !hasStaticBlock 
            ? [UIFactory.createClassStaticBlock()] 
            : [];
        const addRefAnyPropMethod = isObservedV2 && isSdkVersionAtLeast(OBSERVED_ANY_PROP_MIN_VERSION)
            ? [this.createAddRefAnyPropMethod(definition, isDecl)]
            : [];
        const returnNodes: arkts.AstNode[] = collect(
            watchMembers,
            v1RenderIdMembers,
            conditionalAddRef,
            metaProperty,
            ...propertyMembers,
            addRefAnyPropMethod,
            newConstructor,
            newStaticBlock
        );
        PropertyRewriteCache.getInstance().reset();
        return returnNodes;
    }

    static rewriteObservedV2Constuctor(ctor: arkts.MethodDefinition, className: string): arkts.MethodDefinition {
        const addConstructorNodes: arkts.Statement[] = [
            ...MonitorCache.getInstance().getCachedMonitors(className),
            ...SyncMonitorCache.getInstance().getCachedSyncMonitors(className),
        ] as arkts.Statement[];
        const scriptFunc: arkts.ScriptFunction = ctor.function;
        const originBody = scriptFunc.body as arkts.BlockStatement | undefined;
        if (!originBody) {
            scriptFunc.setBody(arkts.factory.createBlockStatement(addConstructorNodes));
        } else {
            scriptFunc.setBody(
                arkts.factory.updateBlockStatement(originBody, [...originBody.statements, ...addConstructorNodes])
            );
        }
        return ctor;
    }

    static createNewObservedV2Constuctor(className: string, isDecl: boolean): arkts.MethodDefinition {
        const addConstructorNodes: arkts.Statement[] = [
            ...MonitorCache.getInstance().getCachedMonitors(className),
            ...SyncMonitorCache.getInstance().getCachedSyncMonitors(className),
        ];
        return UIFactory.createMethodDefinition({
            key: arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI),
            function: {
                key: arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI),
                body: isDecl ? undefined : arkts.factory.createBlockStatement(addConstructorNodes),
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_CONSTRUCTOR,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONSTRUCTOR,
            },
            kind: arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
            modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONSTRUCTOR,
        });
    }

    static createAddRefAnyPropMethod(definition: arkts.ClassDefinition, isDecl: boolean): arkts.MethodDefinition {
        let body: arkts.BlockStatement | undefined;
        let modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        if (!isDecl) {
            const bodyStmts: arkts.Statement[] = [];
            const hasObservedV2Parent: boolean = CacheFactory.hasObservedV2InParentChain(definition);
            if (hasObservedV2Parent) {
                bodyStmts.push(
                    arkts.factory.createExpressionStatement(
                        arkts.factory.createCallExpression(
                            arkts.factory.createMemberExpression(
                                arkts.factory.createSuperExpression(),
                                arkts.factory.createIdentifier(ObservedNames.ADD_REF_ANY_PROP),
                                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                                false,
                                false
                            ),
                            [],
                            undefined,
                            false,
                            false
                        )
                    )
                );
            }
            const traceProperties: string[] = [];
            for (const member of definition.body) {
                if (arkts.isClassProperty(member) && hasDecorator(member, DecoratorNames.TRACE)) {
                    traceProperties.push(expectName(member.key));
                }
            }
            traceProperties.forEach((propName: string) => {
                const metaName: string = `${StateManagementTypes.META}_${propName}`;
                bodyStmts.push(
                    arkts.factory.createExpressionStatement(
                        arkts.factory.createCallExpression(
                            arkts.factory.createMemberExpression(
                                generateThisBacking(metaName),
                                arkts.factory.createIdentifier(ObservedNames.ADD_REF),
                                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                                false,
                                false
                            ),
                            [],
                            undefined,
                            false,
                            false
                        )
                    )
                );
            });
            body = arkts.factory.createBlockStatement(bodyStmts);
        } else {
            modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        }
        return UIFactory.createMethodDefinition({
            key: arkts.factory.createIdentifier(ObservedNames.ADD_REF_ANY_PROP),
            function: {
                key: arkts.factory.createIdentifier(ObservedNames.ADD_REF_ANY_PROP),
                body: body,
                returnTypeAnnotation: arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            },
            modifiers: modifiers,
        });
    }

    static hasObservedV2InParentChain(definition: arkts.ClassDefinition): boolean {
        const visited: Set<string> = new Set();
        let current: arkts.ClassDefinition = definition;
        while (true) {
            const parentDef: arkts.ClassDefinition | undefined = CacheFactory.getSuperClassDecl(current);
            if (!parentDef) {
                break;
            }
            const parentName: string | undefined = parentDef.ident?.name;
            if (!parentName || visited.has(parentName)) {
                break;
            }
            visited.add(parentName);
            if (hasDecorator(parentDef, DecoratorNames.OBSERVED_V2)) {
                return true;
            }
            current = parentDef;
        }
        return false;
    }

    static getSuperClassDecl(definition: arkts.ClassDefinition): arkts.ClassDefinition | undefined {
        const superNode = definition.super;
        if (!superNode || !arkts.isETSTypeReference(superNode)) {
            return undefined;
        }
        if (!superNode.part || !arkts.isETSTypeReferencePart(superNode.part)) {
            return undefined;
        }
        const superName = superNode.part.name;
        if (!superName || !arkts.isIdentifier(superName)) {
            return undefined;
        }
        const decl = arkts.getDecl(superName);
        if (!decl || !arkts.isClassDefinition(decl)) {
            return undefined;
        }
        return decl;
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
            addMemoAnnotation(member.function);
            // return ConditionScopeFactory.rewriteBuilderMethod(member);
        }
        return member;
    }

    static transformResourceFromInfo(resourceNode: arkts.CallExpression, metadata: CallInfo): arkts.CallExpression {
        const projectConfig = MetaDataCollector.getInstance().projectConfig;
        const resourceInfo = MetaDataCollector.getInstance().resourceInfo;
        const shouldHandleInsightIntent = MetaDataCollector.getInstance().shouldHandleInsightIntent;
        const args: readonly arkts.Expression[] = resourceNode.arguments;
        if (!projectConfig || !resourceInfo || args.length <= 0) {
            return resourceNode;
        }
        const resourceKind: Dollars = metadata.isResourceCall!;
        const firstArg: arkts.Expression = args.at(0)!;;
        if (arkts.isStringLiteral(firstArg)) {
            const resultNode = StructFactory.processStringLiteralResourceNode(
                resourceNode,
                resourceInfo,
                projectConfig,
                resourceKind,
                firstArg
            );
            if (shouldHandleInsightIntent && resultNode.peer !== resourceNode.peer) {
                const originalSource = `${resourceKind}('${firstArg.str}')`;
                ResourceSourceCache.getInstance().set(resultNode, originalSource);
            }
            return resultNode;
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
        let _node: arkts.TSInterfaceDeclaration = node;
        withAPIVersion(
            { version: APIVersions.API_24, compare: APIComparison.LESS_THAN_OR_EQUAL },
            (sdkVersion: APIVersions) => {
                if (!InnerComponentInfoCache.getInstance().isCollected() || !metadata.name) {
                    return;
                }
                const componentName = metadata.name.replace(/Attribute$/, '');
                if (!InnerComponentInfoCache.getInstance().hasComponentName(componentName)) {
                    return;
                }
                _node = BuilderLambdaCacheFactory.addDeclaredSetMethodsInAttributeInterface(node, componentName);
            },
            { ignoreCompare: InnerComponentInfoCache.getInstance().isCollected() }
        );
        return _node;
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
                builderNode.function.setReturnTypeAnnotation(newType);
            }
        } else if (builderNode.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET) {
            const param = builderNode.function.params[0] as arkts.ETSParameterExpression;
            const newParam: arkts.Expression | undefined = arkts.factory.updateETSParameterExpression(
                param,
                arkts.factory.createIdentifier(param.ident!.name, newType),
                param.isOptional,
                param.initializer,
                param.annotations
            );
            if (!!newParam) {
                return UIFactory.updateMethodDefinition(builderNode, { function: { params: [newParam] } });
            }
        }
        return builderNode;
    }

    static transformBindableCall(node: arkts.CallExpression, metadata: CallInfo): arkts.CallExpression {
        const args = node.arguments;
        if (!metadata.isBindableCall || args.length !== 1) {
            return node;
        }
        return BindableFactory.generateMakeBindableCall(args[0]);
    }
}
