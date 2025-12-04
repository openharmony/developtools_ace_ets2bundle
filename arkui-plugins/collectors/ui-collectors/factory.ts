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
    checkIsCustomComponentDeclaredClassFromInfo,
    checkIsCustomComponentFromInfo,
    checkIsETSGlobalClassFromInfo,
    checkIsCommonMethodInterfaceFromInfo,
    checkCanCollectNormalClassFromInfo,
    checkIsComponentAttributeInterfaceFromInfo,
    checkIsDialogControllerNewInstanceFromInfo,
} from './utils';
import {
    ArrowFunctionRecord,
    CustomComponentInterfaceRecord,
    CustomComponentRecord,
    NewClassInstanceRecord,
    NormalClassRecord,
    NormalInterfaceRecord,
    ParameterRecord,
    PropertyRecord,
    RecordCache,
} from './records';
import { StructCollector } from './struct-collector';
import { GlobalClassCollector } from './global-class-collector';
import { NormalClassCollector } from './normal-class-collector';
import { StructInterfaceCollector } from './struct-interface-collector';
import { NormalInterfaceCollector } from './normal-interface-collector';
import { CallRecordCollector } from './call-record-collector';
import { UICollectMetadata } from './shared-types';
import { NormalClassValidator, NormalInterfaceValidator, StructValidator, ValidatorBuilder } from './validators';
import { ARKUI_IMPORT_PREFIX_NAMES, NodeCacheNames } from '../../common/predefines';
import { matchPrefix } from '../../common/arkts-utils';
import { getPerfName } from '../../common/debug';
import { NodeCacheFactory } from '../../common/node-cache';

export function findAndCollectUINodeInPreOrder(node: arkts.AstNode, metadata?: UICollectMetadata): void {
    const type = arkts.nodeType(node);
    collectUINodeByTypeInPreOrder(type, node, metadata);
}

export function collectUINodeByTypeInPreOrder(
    type: arkts.Es2pandaAstNodeType,
    node: arkts.AstNode,
    metadata?: UICollectMetadata
): void {
    if (preOrderCollectByType.has(type)) {
        const func = preOrderCollectByType.get(type)!;
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([0, 1, 1], func.name));
        func(node, metadata);
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([0, 1, 1], func.name));
    }
}

export function findAndCollectUINodeInPostOrder(node: arkts.AstNode, metadata?: UICollectMetadata): void {
    const type = arkts.nodeType(node);
    collectUINodeByTypeInPostOrder(type, node, metadata);
}

export function collectUINodeByTypeInPostOrder(
    type: arkts.Es2pandaAstNodeType,
    node: arkts.AstNode,
    metadata?: UICollectMetadata
): void {
    if (postOrderCollectByType.has(type)) {
        const func = postOrderCollectByType.get(type)!;
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([0, 1, 2], func.name));
        func(node, metadata);
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([0, 1, 2], func.name));
    }
}

export class CollectFactory {
    static findAndCollectClass(node: arkts.ClassDeclaration, metadata: UICollectMetadata): arkts.AstNode {
        const isFromArkUI: boolean =
            !!metadata.externalSourceName && matchPrefix(ARKUI_IMPORT_PREFIX_NAMES, metadata.externalSourceName);
        const structRecord = new CustomComponentRecord(metadata);
        structRecord.withIsFromArkUI(isFromArkUI).collect(node);

        let classInfo = structRecord.toRecord();
        if (!!classInfo && checkIsCustomComponentFromInfo(classInfo)) {
            ValidatorBuilder.build(StructValidator).checkIsViolated(node, classInfo);
            NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).collect(node, structRecord.toJSON());
            const structCollector = new StructCollector({ ...metadata, structRecord });
            structCollector.visitor(node);
            structCollector.reset();
            return node;
        }
        if (!!classInfo && checkIsCustomComponentDeclaredClassFromInfo(classInfo)) {
            NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).collect(node, structRecord.toJSON());
            const structCollector = new StructCollector({ ...metadata, structRecord });
            structCollector.disableCollectProperty().visitor(node);
            structCollector.reset();
            return node;
        }

        const classRecord = new NormalClassRecord(metadata);
        classRecord.collect(node);

        classInfo = classRecord.toRecord();
        if (!classInfo) {
            return node;
        }
        ValidatorBuilder.build(NormalClassValidator).checkIsViolated(node, classInfo);
        if (checkCanCollectNormalClassFromInfo(classInfo)) {
            NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).collect(node, classRecord.toJSON());
        }
        if (checkIsETSGlobalClassFromInfo(classInfo)) {
            const globalClassCollector = new GlobalClassCollector(metadata);
            globalClassCollector.visitor(node);
            if (globalClassCollector.shouldCollectGlobalClass) {
                NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).collect(node, classRecord.toJSON());
            }
            globalClassCollector.reset();
            return node;
        }
        const normalClassCollector = new NormalClassCollector({ ...metadata, classRecord });
        normalClassCollector.visitor(node);
        normalClassCollector.reset();
        return node;
    }

    static findAndCollectInterface(node: arkts.TSInterfaceDeclaration, metadata: UICollectMetadata): arkts.AstNode {
        const interfaceRecord = new CustomComponentInterfaceRecord(metadata);
        interfaceRecord.collect(node);

        let interfaceInfo = interfaceRecord.toRecord();
        if (!!interfaceInfo && checkIsCustomComponentFromInfo(interfaceInfo)) {
            const interfaceCollector = new StructInterfaceCollector({ ...metadata, interfaceRecord });
            interfaceCollector.visitor(node);
            interfaceCollector.reset();
            return node;
        }

        const normalInterfaceRecord = new NormalInterfaceRecord(metadata);
        normalInterfaceRecord.collect(node);

        interfaceInfo = normalInterfaceRecord.toRecord();
        ValidatorBuilder.build(NormalInterfaceValidator).checkIsViolated(node, interfaceInfo);
        if (checkIsComponentAttributeInterfaceFromInfo(interfaceInfo)) {
            NodeCacheFactory.getInstance()
                .getCache(NodeCacheNames.UI)
                .collect(node, normalInterfaceRecord.toJSON());
        } else if (
            !!metadata.externalSourceName &&
            matchPrefix(ARKUI_IMPORT_PREFIX_NAMES, metadata.externalSourceName) &&
            checkIsCommonMethodInterfaceFromInfo(interfaceInfo)
        ) {
            NodeCacheFactory.getInstance()
                .getCache(NodeCacheNames.UI)
                .collect(node, normalInterfaceRecord.toJSON());
        }

        const interfaceCollector = new NormalInterfaceCollector({
            ...metadata,
            interfaceRecord: normalInterfaceRecord,
        });
        interfaceCollector.visitor(node);
        interfaceCollector.reset();

        return node;
    }

    static findAndCollectCall(node: arkts.CallExpression, metadata: UICollectMetadata): arkts.AstNode {
        CallRecordCollector.getInstance(metadata).withExternalSourceName(metadata.externalSourceName).collect(node);
        return node;
    }

    static findAndCollectParameter(node: arkts.ETSParameterExpression, metadata: UICollectMetadata): arkts.AstNode {
        const parameterRecord = new ParameterRecord(metadata);
        parameterRecord.collect(node);
        const parameterInfo = parameterRecord.toRecord();
        if (parameterInfo?.annotationInfo?.hasBuilder) {
            NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).collect(node, parameterRecord.toJSON());
        }
        return node;
    }

    static findAndCollectArrowFunction(
        node: arkts.ArrowFunctionExpression,
        metadata: UICollectMetadata
    ): arkts.AstNode {
        const arrowFunctionRecord = new ArrowFunctionRecord(metadata);
        arrowFunctionRecord.collect(node);
        const arrowFunctionInfo = arrowFunctionRecord.toRecord();
        if (arrowFunctionInfo?.annotationInfo?.hasBuilder) {
            RecordCache.getInstance().set(node.peer, arrowFunctionRecord);
            NodeCacheFactory.getInstance()
                .getCache(NodeCacheNames.UI)
                .collect(node, arrowFunctionRecord.toJSON());
        }
        return node;
    }

    static findAndCollectProperty(node: arkts.Property, metadata: UICollectMetadata): arkts.AstNode {
        const propertyRecord = new PropertyRecord(metadata);
        propertyRecord.collect(node);
        const propertyInfo = propertyRecord.toRecord();
        if (propertyInfo?.annotationInfo?.hasBuilder) {
            NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).collect(node, propertyRecord.toJSON());
        }
        return node;
    }

    static findAndCollectNewClassInstance(
        node: arkts.ETSNewClassInstanceExpression,
        metadata: UICollectMetadata
    ): arkts.AstNode {
        const newClassInstanceRecord = new NewClassInstanceRecord(metadata);
        newClassInstanceRecord.collect(node);
        const newClassInstanceInfo = newClassInstanceRecord.toRecord();
        if (checkIsDialogControllerNewInstanceFromInfo(newClassInstanceInfo)) {
            NodeCacheFactory.getInstance()
                .getCache(NodeCacheNames.UI)
                .collect(node, newClassInstanceRecord.toJSON());
        }
        return node;
    }
}

const preOrderCollectByType = new Map<arkts.Es2pandaAstNodeType, (node: any, ...args: any[]) => arkts.AstNode>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_DECLARATION, CollectFactory.findAndCollectClass],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_INTERFACE_DECLARATION, CollectFactory.findAndCollectInterface],
]);

const postOrderCollectByType = new Map<arkts.Es2pandaAstNodeType, (node: any, ...args: any[]) => arkts.AstNode>([
    [
        arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_NEW_CLASS_INSTANCE_EXPRESSION,
        CollectFactory.findAndCollectNewClassInstance,
    ],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_PARAMETER_EXPRESSION, CollectFactory.findAndCollectParameter],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ARROW_FUNCTION_EXPRESSION, CollectFactory.findAndCollectArrowFunction],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_PROPERTY, CollectFactory.findAndCollectProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION, CollectFactory.findAndCollectCall],
]);
