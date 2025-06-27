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
import {
    ArrowFunctionExpressionRecordInfo,
    CallExpressionRecordInfo,
    CallInfo,
    ClassDeclarationRecordInfo,
    ClassPropertyRecordInfo,
    CustomComponentInfo,
    CustomComponentInterfaceInfo,
    CustomComponentInterfacePropertyInfo,
    ETSNewClassInstanceExpressionRecordInfo,
    ETSParameterExpressionRecordInfo,
    FunctionInfo,
    MethodDefinitionRecordInfo,
    NormalClassInfo,
    NormalClassMethodInfo,
    NormalClassPropertyInfo,
    NormalInterfaceInfo,
    NormalInterfacePropertyInfo,
    ParameterInfo,
    PropertyRecordInfo,
    RecordInfo,
    StructMethodInfo,
    StructPropertyInfo,
    TSInterfaceDeclarationRecordInfo,
} from '../collectors/ui-collectors/records';
import {
    checkIsAnimatableExtendMethodFromInfo,
    checkIsBuilderFromInfo,
    checkIsBuilderLambdaFromInfo,
    checkIsBuilderLambdaMethodDeclFromInfo,
    checkIsCallFromLegacyBuilderFromInfo,
    checkIsCommonMethodInterfaceFromInfo,
    checkIsComponentAttributeInterfaceFromInfo,
    checkIsComputedMethodFromInfo,
    checkIsCustomComponentClassFromInfo,
    checkIsCustomComponentDeclaredClassFromInfo,
    checkIsCustomComponentFromInfo,
    checkIsCustomDialogControllerBuilderOptionsFromInfo,
    checkIsDialogControllerNewInstanceFromInfo,
    checkIsETSGlobalClassFromInfo,
    checkIsFunctionMethodDeclFromInfo,
    checkIsGlobalFunctionFromInfo,
    checkIsInteropComponentCallFromInfo,
    checkIsMonitorMethodFromInfo,
    checkIsNormalClassHasTrackProperty,
    checkIsNormalClassMethodFromInfo,
    checkIsNormalClassPropertyFromInfo,
    checkIsNormalInterfacePropertyFromInfo,
    checkIsObservedClassFromInfo,
    checkIsObservedImplementsMethod,
    checkIsObservedV2ImplementsMethod,
    checkIsResourceFromInfo,
    checkIsStructInterfacePropertyFromInfo,
    checkIsStructMethodFromInfo,
    checkIsStructPropertyFromInfo,
    getGetterSetterTypeFromInfo,
} from '../collectors/ui-collectors/utils';
import { coerceToAstNode } from '../collectors/ui-collectors/validators/utils';
import { getPerfName } from '../common/debug';
import { ARKUI_BUILDER_SOURCE_NAME, ARKUI_INTEROP_SOURCE_NAME, EntryWrapperNames, NodeCacheNames } from '../common/predefines';
import { ImportCollector } from '../common/import-collector';
import { factory as UIFactory } from './ui-factory';
import { CacheFactory as StructCacheFactory } from './struct-translators/cache-factory';
import { factory as StructFactory } from './struct-translators/factory';
import { CacheFactory as PropertyCacheFactory } from './property-translators/cache-factory';
import { factory as PropertyFactory } from './property-translators/factory';
import { CacheFactory as BuilderLambdaCacheFactory } from './builder-lambda-translators/cache-factory';
import { factory as BuilderLambdaFactory } from './builder-lambda-translators/factory';
import { BuilderFactory } from './builder-lambda-translators/builder-factory';
import { CacheFactory as EntryCacheFactory } from './entry-translators/cache-factory';
import { factory as EntryFactory } from './entry-translators/factory';
import {
    InterfacePropertyCachedTranslator,
    PropertyCachedTranslator,
} from './property-translators/base';
import { StructType } from './struct-translators/utils';
import {
    classifyObservedClassPropertyFromInfo,
    classifyPropertyFromInfo,
    classifyPropertyInInterfaceFromInfo,
} from './property-translators';
import { PropertyRewriteCache } from './property-translators/cache/propertyRewriteCache';
import { ConditionScopeFactory } from './condition-scope-translators/condition-scope-factory';
import { generateBuilderCompatible, insertCompatibleImport } from './interop/builder-interop';
import { insertInteropComponentImports } from './interop/utils';
import { generateArkUICompatible } from './interop/interop';

export class RewriteFactory {
    /**
     * @internal
     */
    static rewriteCustomComponentDecl(
        node: arkts.ClassDeclaration,
        metadata: CustomComponentInfo
    ): arkts.ClassDeclaration {
        arkts.Performance.getInstance().createDetailedEvent(
            getPerfName([1, 1, 8, 2, 1], 'custom component class checked CUSTOM_COMPONENT_DECL')
        );
        const res = StructCacheFactory.tranformClassMembersFromInfo(node, metadata, StructType.CUSTOM_COMPONENT_DECL);
        arkts.Performance.getInstance().stopDetailedEvent(
            getPerfName([1, 1, 8, 2, 1], 'custom component class checked CUSTOM_COMPONENT_DECL')
        );
        return res;
    }

    /**
     * @internal
     */
    static rewriteStruct(node: arkts.ClassDeclaration, metadata: CustomComponentInfo): arkts.ClassDeclaration {
        arkts.Performance.getInstance().createDetailedEvent(
            getPerfName([1, 1, 8, 1, 1], 'custom component class checked STRUCT')
        );
        const res = StructCacheFactory.tranformClassMembersFromInfo(node, metadata, StructType.STRUCT);
        arkts.Performance.getInstance().stopDetailedEvent(
            getPerfName([1, 1, 8, 1, 1], 'custom component class checked STRUCT')
        );
        return res;
    }

    /**
     * @internal
     */
    static rewriteCustomComponentClass(
        node: arkts.ClassDeclaration,
        metadata: CustomComponentInfo
    ): arkts.ClassDeclaration {
        if (checkIsCustomComponentFromInfo(metadata)) {
            // Struct
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 8, 1], 'rewriteStruct'));
            const res = RewriteFactory.rewriteStruct(node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 8, 1], 'rewriteStruct'));
            return res;
        }
        if (checkIsCustomComponentDeclaredClassFromInfo(metadata)) {
            // CustomComponent/CustomComponentV2/CustomDialog
            arkts.Performance.getInstance().createDetailedEvent(
                getPerfName([1, 1, 8, 2], 'rewriteCustomComponentDecl')
            );
            const res = RewriteFactory.rewriteCustomComponentDecl(node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 8, 2], 'rewriteCustomComponentDecl'));
            return res;
        }
        return node;
    }

    /**
     * @internal
     */
    static rewriteETSGlobalClass(node: arkts.ClassDeclaration, metadata: NormalClassInfo): arkts.ClassDeclaration {
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 9, 1, 1], 'EtsGlobalClass'));
        const res = StructCacheFactory.transformETSGlobalClassFromInfo(node, metadata);
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 9, 1, 1], 'EtsGlobalClass'));
        return res;
    }

    /**
     * @internal
     */
    static rewriteObservedClass(node: arkts.ClassDeclaration, metadata: NormalClassInfo): arkts.ClassDeclaration {
        return StructCacheFactory.transformObservedClassFromInfo(node, metadata);
    }

    /**
     * @internal
     */
    static rewriteNormalClass(node: arkts.ClassDeclaration, metadata: NormalClassInfo): arkts.ClassDeclaration {
        if (checkIsETSGlobalClassFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 9, 1], 'rewriteETSGlobalClass'));
            const res = RewriteFactory.rewriteETSGlobalClass(node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 9, 1], 'rewriteETSGlobalClass'));
            return res;
        }
        if (checkIsObservedClassFromInfo(metadata) || checkIsNormalClassHasTrackProperty(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 9, 2], 'rewriteObservedClass'));
            const res = RewriteFactory.rewriteObservedClass(node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 9, 2], 'rewriteObservedClass'));
            return res;
        }
        return node;
    }

    /**
     * @internal
     */
    static rewriteStructProperty(node: arkts.ClassProperty, metadata: StructPropertyInfo): arkts.ClassProperty {
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 1, 1], 'classifyPropertyFromInfo'));
        const propertyTranslator: PropertyCachedTranslator | undefined = classifyPropertyFromInfo(node, metadata);
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 1, 1], 'classifyPropertyFromInfo'));
        if (!propertyTranslator) {
            return node;
        }
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 1, 2], 'rewriteMember'));
        const newNodes: arkts.AstNode[] = propertyTranslator.translateMember();
        PropertyRewriteCache.getInstance().collectRewriteNodes(node.peer, newNodes);
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 1, 2], 'rewriteMember'));
        return node;
    }

    /**
     * @internal
     */
    static rewriteNormalClassProperty(
        node: arkts.ClassProperty,
        metadata: NormalClassPropertyInfo
    ): arkts.ClassProperty {
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 1, 1], 'classifyPropertyFromInfo'));
        const propertyTranslator = classifyObservedClassPropertyFromInfo(node, metadata);
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 1, 1], 'classifyPropertyFromInfo'));
        if (!propertyTranslator) {
            return node;
        }
        const newNodes: arkts.AstNode[] = propertyTranslator.translateMember();
        PropertyRewriteCache.getInstance().collectRewriteNodes(node.peer, newNodes);
        return node;
    }

    /**
     * @internal
     */
    static rewriteStructMethod(node: arkts.MethodDefinition, metadata: StructMethodInfo): arkts.MethodDefinition {
        // rewrite `$_instantiate` in CustomComponent/CustomComponentV2/CustomDialog decl class
        if (checkIsBuilderLambdaMethodDeclFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(
                getPerfName([1, 1, 3, 1], '@ComponentBuilder Method $_instantiate')
            );
            const res = BuilderLambdaCacheFactory.transformBuilderLambdaMethodDeclFromInfo(node, metadata, true);
            arkts.Performance.getInstance().stopDetailedEvent(
                getPerfName([1, 1, 3, 1], '@ComponentBuilder Method $_instantiate')
            );
            return res;
        }
        if (checkIsComputedMethodFromInfo(metadata)) {
            return PropertyCacheFactory.rewriteComputedMethodFromInfo(node, metadata);
        }
        if (checkIsMonitorMethodFromInfo(metadata)) {
            return PropertyCacheFactory.rewriteMonitorMethodFromInfo(node, metadata);
        }
        return StructCacheFactory.transformNonPropertyMembersInClassFromInfo(node, metadata);
    }

    /**
     * @internal
     */
    static rewriteStructInterfaceProperty(
        node: arkts.MethodDefinition,
        metadata: CustomComponentInterfacePropertyInfo
    ): arkts.MethodDefinition {
        arkts.Performance.getInstance().createDetailedEvent(
            getPerfName([1, 1, 6, 1], 'classifyPropertyInInterfaceFromInfo')
        );
        const interfacePropertyTranslator: InterfacePropertyCachedTranslator<arkts.MethodDefinition> | undefined =
            classifyPropertyInInterfaceFromInfo(node, metadata);
        arkts.Performance.getInstance().stopDetailedEvent(
            getPerfName([1, 1, 6, 1], 'classifyPropertyInInterfaceFromInfo')
        );
        if (!interfacePropertyTranslator) {
            return node;
        }
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 6, 2], 'translateProperty'));
        const res = interfacePropertyTranslator.translateProperty();
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 6, 2], 'translateProperty'));
        return res;
    }

    /**
     * @internal
     */
    static rewriteNormalClassMethod(
        node: arkts.MethodDefinition,
        metadata: NormalClassMethodInfo
    ): arkts.MethodDefinition {
        if (!metadata.classInfo) {
            return node;
        }
        // Entry
        if (metadata.classInfo?.name === EntryWrapperNames.WRAPPER_CLASS_NAME) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 5, 1], 'EntryWrapperClass'));
            EntryCacheFactory.addMemoToEntryWrapperClassMethodFromInfo(node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 5, 1], 'EntryWrapperClass'));
            return node;
        }
        if (checkIsComputedMethodFromInfo(metadata)) {
            return PropertyCacheFactory.rewriteComputedMethodFromInfo(node, metadata);
        }
        if (checkIsMonitorMethodFromInfo(metadata)) {
            return PropertyCacheFactory.rewriteMonitorMethodFromInfo(node, metadata);
        }
        if (checkIsObservedImplementsMethod(metadata)) {
            const getSetTypes = getGetterSetterTypeFromInfo(metadata);
            const res = PropertyCacheFactory.transformObservedImplementsMethodFromInfo(node, metadata, getSetTypes);
            return res;
        }
        if (checkIsObservedV2ImplementsMethod(metadata)) {
            const getSetTypes = getGetterSetterTypeFromInfo(metadata);
            const res = PropertyCacheFactory.transformObservedV2ImplementsMethodFromInfo(node, metadata, getSetTypes);
            return res;
        }
        return node;
    }

    /**
     * @internal
     */
    static rewriteNormalInterfaceProperty(
        node: arkts.MethodDefinition,
        metadata: NormalInterfacePropertyInfo
    ): arkts.MethodDefinition {
        if (checkIsCustomDialogControllerBuilderOptionsFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 5, 1], 'updateBuilderType'));
            const res = StructCacheFactory.updateBuilderType(node);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 5, 1], 'updateBuilderType'));
            return res;
        }
        return node;
    }

    /**
     * @internal
     */
    static rewriteGlobalFunction(node: arkts.MethodDefinition, metadata: FunctionInfo): arkts.MethodDefinition {
        // rewrite `@ComponentBuilder` declared method.
        if (checkIsBuilderLambdaMethodDeclFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(
                getPerfName([1, 1, 4, 1], '@ComponentBuilder Method Inner Component')
            );
            const res = BuilderLambdaCacheFactory.transformBuilderLambdaMethodDeclFromInfo(node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(
                getPerfName([1, 1, 4, 1], '@ComponentBuilder Method Inner Component')
            );
            return res;
        }
        if (checkIsAnimatableExtendMethodFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(
                getPerfName([1, 1, 4, 2], '@AnimatableExtend Global Function')
            );
            const res = StructCacheFactory.transformAnimatableExtendMethod(node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(
                getPerfName([1, 1, 4, 2], '@AnimatableExtend Global Function')
            );
            return res;
        }
        return node;
    }

    static rewriteClassDeclaration<T extends arkts.AstNode = arkts.ClassDeclaration>(
        node: T,
        metadata: ClassDeclarationRecordInfo
    ): arkts.ClassDeclaration {
        const _node = coerceToAstNode<arkts.ClassDeclaration>(node);
        if (checkIsCustomComponentClassFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 8], 'rewriteCustomComponentClass'));
            const res = RewriteFactory.rewriteCustomComponentClass(_node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 8], 'rewriteCustomComponentClass'));
            return res;
        }
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 9], 'rewriteNormalClass'));
        const res = RewriteFactory.rewriteNormalClass(_node, metadata);
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 9], 'rewriteNormalClass'));
        return res;
    }

    static rewriteMethodDefinition<T extends arkts.AstNode = arkts.MethodDefinition>(
        node: T,
        metadata: MethodDefinitionRecordInfo
    ): arkts.MethodDefinition {
        let _node = coerceToAstNode<arkts.MethodDefinition>(node);
        if (checkIsStructMethodFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 3], 'rewriteStructMethod'));
            _node = RewriteFactory.rewriteStructMethod(_node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 3], 'rewriteStructMethod'));
        } else if (checkIsGlobalFunctionFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 4], 'rewriteGlobalFunction'));
            _node = RewriteFactory.rewriteGlobalFunction(_node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 4], 'rewriteGlobalFunction'));
        } else if (checkIsNormalClassMethodFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 5], 'rewriteNormalClassMethod'));
            _node = RewriteFactory.rewriteNormalClassMethod(_node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 5], 'rewriteNormalClassMethod'));
        } else if (checkIsStructInterfacePropertyFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(
                getPerfName([1, 1, 6], 'rewriteStructInterfaceProperty')
            );
            _node = RewriteFactory.rewriteStructInterfaceProperty(_node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 6], 'rewriteStructInterfaceProperty'));
        } else if (checkIsNormalInterfacePropertyFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(
                getPerfName([1, 1, 7], 'rewriteNormalInterfaceProperty')
            );
            _node = RewriteFactory.rewriteNormalInterfaceProperty(_node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 7], 'rewriteNormalInterfaceProperty'));
        }
        if (checkIsBuilderFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 3], 'rewriteBuilderMethod'));
            const res = ConditionScopeFactory.rewriteBuilderMethod(_node);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 3], 'rewriteBuilderMethod'));
            return res;
        }
        return _node;
    }

    static rewriteClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
        node: T,
        metadata: ClassPropertyRecordInfo
    ): arkts.ClassProperty {
        let _node = coerceToAstNode<arkts.ClassProperty>(node);
        if (checkIsStructPropertyFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 1], 'rewriteStructProperty'));
            _node = RewriteFactory.rewriteStructProperty(_node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 1], 'rewriteStructProperty'));
        }
        if (checkIsNormalClassPropertyFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 2], 'rewriteNormalClassProperty'));
            _node = RewriteFactory.rewriteNormalClassProperty(_node, metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 2], 'rewriteNormalClassProperty'));
        }
        if (checkIsBuilderFromInfo(metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 3], 'rewriteBuilderClassProperty'));
            const res = ConditionScopeFactory.rewriteBuilderClassProperty(_node);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 3], 'rewriteBuilderClassProperty'));
            return res;
        }
        return _node;
    }

    static rewriteCallExpression<T extends arkts.AstNode = arkts.CallExpression>(
        node: T,
        metadata: RecordInfo
    ): arkts.CallExpression {
        const _node = coerceToAstNode<arkts.CallExpression>(node);
        const _metadata = metadata as CallInfo;
        if (checkIsCallFromLegacyBuilderFromInfo(_metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 0], 'Legacy Builder call'));
            insertCompatibleImport();
            const res = generateBuilderCompatible(_node, _metadata.callName!);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 0], 'Legacy Builder call'));
            return res;
        }
        if (checkIsInteropComponentCallFromInfo(_metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 1], 'Legacy Struct call'));
            insertInteropComponentImports();
            const res = generateArkUICompatible(_node, !!_metadata.isDeclFromFunction);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 1], 'Legacy Struct call'));
            return res;
        }
        if (checkIsBuilderLambdaFromInfo(_metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 2], '@ComponentBuilder call'));
            const res = BuilderLambdaCacheFactory.transformBuilderLambdaFromInfo(_node, _metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 2], '@ComponentBuilder call'));
            return res;
        }
        if (checkIsResourceFromInfo(_metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 3], '$r and $rawfile'));
            const res = StructCacheFactory.transformResourceFromInfo(_node, _metadata);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 3], '$r and $rawfile'));
            return res;
        }
        if (checkIsBuilderFromInfo(_metadata)) {
            arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 4], 'Builder call'));
            const res = BuilderFactory.rewriteBuilderCall(_node);
            arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 4], 'Builder call'));
            return res;
        }
        return _node;
    }

    static rewriteETSParameterExpression<T extends arkts.AstNode = arkts.ETSParameterExpression>(
        node: T,
        metadata: RecordInfo
    ): arkts.ETSParameterExpression {
        const _node = coerceToAstNode<arkts.ETSParameterExpression>(node);
        const _metadata = metadata as ETSParameterExpressionRecordInfo;
        if (checkIsBuilderFromInfo(_metadata)) {
            return ConditionScopeFactory.rewriteBuilderParameter(_node);
        }
        return _node;
    }

    static rewriteArrowFunctionExpression<T extends arkts.AstNode = arkts.ArrowFunctionExpression>(
        node: T,
        metadata: RecordInfo
    ): arkts.ArrowFunctionExpression {
        const _node = coerceToAstNode<arkts.ArrowFunctionExpression>(node);
        const _metadata = metadata as ArrowFunctionExpressionRecordInfo;
        if (checkIsBuilderFromInfo(_metadata)) {
            return ConditionScopeFactory.rewriteBuilderArrowFunction(_node);
        }
        return _node;
    }

    static rewriteProperty<T extends arkts.AstNode = arkts.Property>(node: T, metadata: RecordInfo): arkts.Property {
        const _node = coerceToAstNode<arkts.Property>(node);
        const _metadata = metadata as PropertyRecordInfo;
        if (checkIsBuilderFromInfo(_metadata)) {
            return ConditionScopeFactory.rewriteBuilderProperty(_node);
        }
        return _node;
    }

    static rewriteInterface<T extends arkts.AstNode = arkts.TSInterfaceDeclaration>(
        node: T,
        metadata: TSInterfaceDeclarationRecordInfo
    ): arkts.TSInterfaceDeclaration {
        const _node = coerceToAstNode<arkts.TSInterfaceDeclaration>(node);
        if (checkIsCommonMethodInterfaceFromInfo(metadata)) {
            return StructFactory.modifyExternalComponentCommon(_node);
        }
        if (checkIsComponentAttributeInterfaceFromInfo(metadata)) {
            return StructCacheFactory.extendInnerComponentAttributeInterface(_node, metadata);
        }
        return _node;
    }

    static rewriteETSNewClassInstanceExpression<T extends arkts.AstNode = arkts.ETSNewClassInstanceExpression>(
        node: T,
        metadata: RecordInfo
    ): arkts.ETSNewClassInstanceExpression {
        const _node = coerceToAstNode<arkts.ETSNewClassInstanceExpression>(node);
        const _metadata = metadata as ETSNewClassInstanceExpressionRecordInfo;
        if (checkIsDialogControllerNewInstanceFromInfo(_metadata)) {
            return StructFactory.transformCustomDialogController(_node) as arkts.ETSNewClassInstanceExpression;
        }
        return _node;
    }
}

type RewriteFunction = <T extends arkts.AstNode = arkts.AstNode>(node: T, metadata: RecordInfo) => arkts.AstNode;

export const rewriteByType = new Map<arkts.Es2pandaAstNodeType, RewriteFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_DECLARATION, RewriteFactory.rewriteClassDeclaration],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, RewriteFactory.rewriteClassProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, RewriteFactory.rewriteMethodDefinition],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION, RewriteFactory.rewriteCallExpression],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_PARAMETER_EXPRESSION, RewriteFactory.rewriteETSParameterExpression],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ARROW_FUNCTION_EXPRESSION, RewriteFactory.rewriteArrowFunctionExpression],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_PROPERTY, RewriteFactory.rewriteProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_INTERFACE_DECLARATION, RewriteFactory.rewriteInterface],
    [
        arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_NEW_CLASS_INSTANCE_EXPRESSION,
        RewriteFactory.rewriteETSNewClassInstanceExpression,
    ],
]);
