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
import { NormalClassMethodInfo, StructMethodInfo } from '../../collectors/ui-collectors/records';
import { addMemoAnnotation } from '../../collectors/memo-collectors/utils';
import { DecoratorNames, GetSetTypes, ObservedNames, StateManagementTypes } from '../../common/predefines';
import { backingField } from '../../common/arkts-utils';
import { factory as UIFactory } from '../ui-factory';
import { generateThisBacking, removeDecorator } from './utils';
import { factory } from './factory';
import {
    getterBodyWithObservedTrackProperty,
    IObservedTrackTranslator,
    setterIfEqualsNewValueWithObservedTrackProperty,
} from './observedTrack';
import {
    getterBodyWithObservedV2TraceProperty,
    IObservedV2TraceTranslator,
    setterIfEqualsNewValueWithObservedV2TraceProperty,
} from './observedV2Trace';
import { MonitorCacheTranslator } from './monitor';
import { PropertyRewriteCache } from './cache/propertyRewriteCache';
import { ComputedCacheTranslator } from './computed';

export class CacheFactory {
    /**
     * add `@memo` to the `@Builder` methods in class.
     */
    static addMemoToBuilderClassMethodFromInfo(
        method: arkts.MethodDefinition,
        metadata: StructMethodInfo
    ): arkts.MethodDefinition {
        if (metadata.annotationInfo?.hasBuilder) {
            removeDecorator(method, DecoratorNames.BUILDER);
            addMemoAnnotation(method.function);
        }
        return method;
    }

    static transformObservedImplementsMethodFromInfo(
        node: arkts.MethodDefinition,
        metadata: NormalClassMethodInfo,
        getterSetterType?: GetSetTypes
    ): arkts.MethodDefinition {
        if (!metadata.name || !getterSetterType) {
            return node;
        }
        const rewriteOptions: IObservedTrackTranslator = {
            traceDecorator: DecoratorNames.TRACK,
            isTracked: !!metadata.inheritPorpertyInfo?.annotationInfo?.hasTrack,
        };
        if (getterSetterType === GetSetTypes.GET) {
            return this.createTrackGet(node, metadata, rewriteOptions);
        }
        if (getterSetterType === GetSetTypes.SET) {
            return this.createTrackSet(node, metadata, rewriteOptions);
        }
        return node;
    }

    static createTrackGet(
        node: arkts.MethodDefinition,
        metadata: NormalClassMethodInfo,
        rewriteOptions: IObservedTrackTranslator
    ): arkts.MethodDefinition {
        const originalName: string = metadata.name!;
        const newName: string = backingField(originalName);
        const body = getterBodyWithObservedTrackProperty.bind(rewriteOptions)(originalName, newName);
        node.function.setBody(body);
        return node;
    }

    static createTrackSet(
        node: arkts.MethodDefinition,
        metadata: NormalClassMethodInfo,
        rewriteOptions: IObservedTrackTranslator
    ): arkts.MethodDefinition {
        const originalName: string = metadata.name!;
        const newName: string = backingField(originalName);
        const scriptFunction = node.function;
        const params = scriptFunction.params;
        if (params.length <= 0 || !arkts.isETSParameterExpression(params.at(0)!)) {
            return node;
        }
        const originParam: arkts.ETSParameterExpression = params.at(0)! as arkts.ETSParameterExpression;
        const type = originParam.typeAnnotation;
        if (!type || !arkts.isTypeNode(type)) {
            return node;
        }
        const ifEqualsNewValue = setterIfEqualsNewValueWithObservedTrackProperty.bind(rewriteOptions)(
            originalName,
            newName
        );
        const body = arkts.factory.createBlockStatement([ifEqualsNewValue]);
        const param = arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier(ObservedNames.NEW_VALUE, type),
            false,
            undefined
        );
        scriptFunction.setParams([param]).setBody(body);
        return node;
    }

    static transformObservedV2ImplementsMethodFromInfo(
        node: arkts.MethodDefinition,
        metadata: NormalClassMethodInfo,
        getterSetterType?: GetSetTypes
    ): arkts.MethodDefinition {
        if (!metadata.name || !metadata.classInfo?.name || !getterSetterType) {
            return node;
        }
        if (node.isStatic) {
            return node;
        }
        const rewriteOptions: IObservedV2TraceTranslator = {
            className: metadata.classInfo.name,
            traceDecorator: DecoratorNames.TRACE,
            isTraced: !!metadata.inheritPorpertyInfo?.annotationInfo?.hasTrace,
        };
        if (getterSetterType === GetSetTypes.GET) {
            return this.createTraceGet(node, metadata, rewriteOptions);
        }
        if (getterSetterType === GetSetTypes.SET) {
            return this.createTraceSet(node, metadata, rewriteOptions);
        }
        return node;
    }

    static createTraceGet(
        node: arkts.MethodDefinition,
        metadata: NormalClassMethodInfo,
        rewriteOptions: IObservedV2TraceTranslator
    ): arkts.MethodDefinition {
        const originalName: string = metadata.name!;
        const newName: string = backingField(originalName);
        const body = getterBodyWithObservedV2TraceProperty.bind(rewriteOptions)(originalName, newName);
        node.function.setBody(body);
        return node;
    }

    static createTraceSet(
        node: arkts.MethodDefinition,
        metadata: NormalClassMethodInfo,
        rewriteOptions: IObservedV2TraceTranslator
    ): arkts.MethodDefinition {
        const originalName: string = metadata.name!;
        const newName: string = backingField(originalName);
        const scriptFunction = node.function;
        const params = scriptFunction.params;
        if (params.length <= 0 || !arkts.isETSParameterExpression(params.at(0)!)) {
            return node;
        }
        const originParam: arkts.ETSParameterExpression = params.at(0)! as arkts.ETSParameterExpression;
        const type = originParam.typeAnnotation;
        if (!type || !arkts.isTypeNode(type)) {
            return node;
        }
        const ifEqualsNewValue = setterIfEqualsNewValueWithObservedV2TraceProperty.bind(rewriteOptions)(
            originalName,
            newName
        );
        const body = arkts.factory.createBlockStatement([ifEqualsNewValue]);
        const param = arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier(ObservedNames.NEW_VALUE, type),
            false,
            undefined
        );
        scriptFunction.setParams([param]).setBody(body);
        return node;
    }

    static rewriteMonitorMethodFromInfo(
        method: arkts.MethodDefinition,
        metadata: StructMethodInfo | NormalClassMethodInfo
    ): arkts.MethodDefinition {
        const monitorTranslator = new MonitorCacheTranslator({ method, methodInfo: metadata });
        const newNodes: arkts.AstNode[] = monitorTranslator.translateMember();
        PropertyRewriteCache.getInstance().collectRewriteNodes(method.peer, newNodes);
        return method;
    }

    static rewriteComputedMethodFromInfo(
        method: arkts.MethodDefinition,
        metadata: StructMethodInfo | NormalClassMethodInfo
    ): arkts.MethodDefinition {
        const computedTranslator = new ComputedCacheTranslator({ method, methodInfo: metadata });
        const newNodes: arkts.AstNode[] = computedTranslator.translateMember();
        PropertyRewriteCache.getInstance().collectRewriteNodes(method.peer, newNodes);
        return method;
    }
}
