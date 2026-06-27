/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { BaseValidator } from '../base';
import type { ExtendedValidatorFunction, IntrinsicValidatorFunction } from '../safe-types';
import { 
    CustomComponentInfo, 
    CustomComponentRecord, 
    NormalClassInfo, 
    NormalClassMethodInfo, 
    NormalClassMethodRecord, 
    NormalClassPropertyInfo, 
    NormalClassPropertyRecord, 
    NormalClassRecord, 
    RecordBuilder, 
    StructMethodInfo, 
    StructMethodRecord, 
    StructPropertyInfo, 
    StructPropertyRecord 
} from '../../records';
import { APIVersions, DecoratorNames, LogType, StructDecoratorNames } from '../../../../common/predefines';
import {
    createSuggestion,
    getPositionRangeFromAnnotation,
    getPositionRangeFromNode,
} from '../../../../common/log-collector';
import {
    checkIsNormalClassMethodFromInfo,
    checkIsStructFromNode,
    checkIsStructMethodFromInfo,
} from '../../../../collectors/ui-collectors/utils';
import { getPerfName, performanceLog } from '../../../../common/debug';
import { findPathArrayFromMonitorAnnoProperty } from '../../../../common/annotation-utils';
import { coerceToAstNode } from '../utils';
import { 
    ArrayIndexSegmentHandler, 
    PropertyPathResult, 
    PropertyPathSegmentResult, 
    PropertyPathTreeBuilder, 
    resolvePropertyPath 
} from '../../../../common/path-resolvers';

export const checkSyncMonitorDecorator = performanceLog(
    _checkSyncMonitorDecorator,
    getPerfName([0, 0, 0, 0, 0], 'checkSyncMonitorDecorator')
);

/**
 * 校验规则：用于验证`@SyncMonitor` 装饰器约束条件
 * 1. `@SyncMonitor`不能与其他内置装饰器一起使用
 * 2. `@SyncMonitor`装饰器只能在被`@ComponentV2`装饰的`struct`中使用
 * 3. `@SyncMonitor`装饰器只能用来装饰方法
 * 4. `@SyncMonitor`装饰器只能用于被`@ObservedV2`装饰的类中的成员方法上
 * 5. `@SyncMonitor`装饰器支持通配符场景下通配符写法必须合法
 *
 * 校验等级：error
 */
function _checkSyncMonitorDecorator(this: BaseValidator<arkts.AstNode, Object>, node: arkts.AstNode): void {
    const nodeType = arkts.nodeType(node);
    if (checkByType.has(nodeType)) {
        checkByType.get(nodeType)!.bind(this)(node);
    }
}

const checkByType = new Map<arkts.Es2pandaAstNodeType, IntrinsicValidatorFunction | ExtendedValidatorFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, checkSyncMonitorDecoratorInMethodDefinition],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, checkSyncMonitorDecoratorInClassProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_DECLARATION, checkSyncMonitorValidPathStrings]
]);

function checkSyncMonitorValidPathStrings<T extends arkts.AstNode = arkts.ClassDeclaration>(
    this: BaseValidator<T, NormalClassInfo |  CustomComponentInfo>,
    node: T
): void {
    const _node = coerceToAstNode<arkts.ClassDeclaration>(node);
    const definition = _node.definition;
    if (!definition) {
        return;
    }
    const allPathStringArrPairs = MonitorPathStringCache.getInstance().getAllPathStringPairs();
    for (const pair of allPathStringArrPairs) {
        const pathStringPairs: [arkts.AstNode, string][] = pair[1];

        pathStringPairs.forEach((pathStringPair) => {
            const propertyValue: arkts.AstNode = pathStringPair[0];
            const pathString: string = pathStringPair[1];
            if (pathString.includes('*') && isWildcardPathInvalid(pathString)) {
                this.report({
                    node: propertyValue,
                    message: `In wildcard-based monitoring scenarios with '@SyncMonitor', the .* pattern must be placed at the end of the string.`,
                    level: LogType.ERROR,
                });
                return;
            }
            const result = resolvePropertyPath(definition, pathString, { enableWildcard: true });
            if (!result.fullyResolved && MonitorPathValidationCache.getInstance().getLogType(propertyValue) !== LogType.ERROR) {
                MonitorPathValidationCache.getInstance().collect(propertyValue, LogType.ERROR);
                this.report({
                    node: propertyValue,
                    message: `'@SyncMonitor' cannot observe non-existent variables or non-state variables, except in wildcard-based monitoring scenarios.`,
                    level: LogType.ERROR,
                });
            } else {
                const resolvedPaths = result.getAllResultPaths();
                resolvedPaths.forEach((path, i) => {
                    checkSyncMonitorObservableVariableInPath.bind(this)(propertyValue, path, result);
                })
            }
        });
    }

    MonitorPathStringCache.getInstance().clear();
    MonitorPathValidationCache.getInstance().clear();
}

function isWildcardPathInvalid(path: string): boolean {
    const segments = path.split('.');
    const wildcardCount = segments.filter((s) => s === '*').length;
    if (wildcardCount !== 1) {
        return true;
    }
    const lastSegment = segments[segments.length - 1];
    if (lastSegment !== '*') {
        return true;
    }
    if (segments.length < 2) {
        return true;
    }
    return false;
}

function checkSyncMonitorObservableVariableInPath<T extends arkts.AstNode = arkts.ClassDeclaration>(
    this: BaseValidator<T, NormalClassInfo | CustomComponentInfo>,
    propertyValue: arkts.AstNode,
    path: PropertyPathSegmentResult[],
    resolvedResult: PropertyPathResult
): void {
    for (const result of path) {
        if (isSegmentObservable(result)) {
            continue;
        }
        if (MonitorPathValidationCache.getInstance().getLogType(propertyValue) === undefined) {
            MonitorPathValidationCache.getInstance().collect(propertyValue, LogType.WARN);
            this.report({
                node: propertyValue,
                message: `'@SyncMonitor' cannot observe non-existent variables or non-state variables, except in wildcard-based monitoring scenarios.`,
                level: LogType.WARN,
            });
        }
        return;
    }
    const lastResult = path.at(path.length - 1);
    if (
        MonitorPathValidationCache.getInstance().getLogType(propertyValue) === undefined &&
        !!lastResult &&
        !isLastResultIsDefinitelyResolvedAsObservable(lastResult, resolvedResult.possiblyResolved)
    ) {
        MonitorPathValidationCache.getInstance().collect(propertyValue, LogType.WARN);
        this.report({
            node: propertyValue,
            message: `'@SyncMonitor' cannot observe non-existent variables or non-state variables, except in wildcard-based monitoring scenarios.`,
            level: LogType.WARN,
        });
    }
}

function isLastResultIsDefinitelyResolvedAsObservable(
    lastResult: PropertyPathSegmentResult, 
    isPossiblyResolved: boolean
): boolean {
    if (lastResult.type === null && isPossiblyResolved) {
        return false;
    }
    if (ArrayIndexSegmentHandler.isNumericSegment(lastResult.segment)) {
        return isArrayIndexSegmentObservable(lastResult);
    }
    return true;
}

function isArrayIndexSegmentObservable(result: PropertyPathSegmentResult): boolean {
    if (!result.type) {
        return false;
    }
    const defintion = PropertyPathTreeBuilder.getClassDefinitionFromType(result.type);
    if (!defintion || !arkts.isClassDefinition(defintion) || PropertyPathTreeBuilder.isPrimitiveWrapperClass(defintion)) {
        return false;
    }
    const classDecl = defintion.parent;
    if (!classDecl || !arkts.isClassDeclaration(classDecl)) {
        return false;
    }
    const classInfo = findClassInfo(classDecl, false);
    return !!classInfo?.annotationInfo?.hasObservedV2;
}

function isSegmentObservable(result: PropertyPathSegmentResult): boolean {
    if (result.type === null || result.resolver === null) {
        return true;
    }

    const resolver = result.resolver;
    const parentResolver = resolver?.classResolver;

    if (!hasValidResolverContext(resolver, parentResolver)) {
        return false;
    }

    const parentClassDeclaration = parentResolver!.parent as arkts.ClassDeclaration;
    const isWithinStruct = checkIsStructFromNode(parentClassDeclaration, true);
    const classInfo = findClassInfo(parentClassDeclaration, isWithinStruct);

    return isResolverObservable(resolver, classInfo, isWithinStruct, parentResolver!);
}

function hasValidResolverContext(
    resolver: arkts.ClassPropertyResolver | arkts.MethodDefinitionResolver,
    parentResolver: arkts.ClassDefinitionResolver | null
): boolean {
    return !!resolver && !!parentResolver && !!parentResolver.parent && arkts.isClassDeclaration(parentResolver.parent);
}

function isResolverObservable(
    resolver: arkts.ClassPropertyResolver | arkts.MethodDefinitionResolver,
    classInfo: CustomComponentInfo | NormalClassInfo | undefined,
    isWithinStruct: boolean,
    parentResolver: arkts.ClassDefinitionResolver
): boolean {
    if (arkts.isClassProperty(resolver)) {
        const propertyInfo = findPropertyInfo(resolver, isWithinStruct);
        return checkIsCurrentPropertyObservable(classInfo, propertyInfo, parentResolver, resolver);
    }

    if (arkts.isMethodDefinition(resolver)) {
        const methodInfo = findMethodInfo(resolver, isWithinStruct);
        return checkIsCurrentGetterMethodObservable(classInfo, methodInfo);
    }

    return false;
}

function checkIsCurrentGetterMethodObservable(
    classInfo: CustomComponentInfo | NormalClassInfo | undefined, 
    methodInfo: StructMethodInfo | NormalClassMethodInfo | undefined
): boolean {
    if (!classInfo || !methodInfo) {
        return false;
    }
    return methodInfo.kind === arkts.Es2pandaMethodDefinitionKind .METHOD_DEFINITION_KIND_GET &&
        !!methodInfo.annotationInfo?.hasComputed;
}

function checkIsCurrentPropertyObservable(
    classInfo: CustomComponentInfo | NormalClassInfo | undefined, 
    propertyInfo: StructPropertyInfo | NormalClassPropertyInfo | undefined, 
    classDef: arkts.ClassDefinition,
    property: arkts.ClassProperty
): boolean {
    if (!classInfo || !propertyInfo) {
        return false;
    }
    if (classInfo.annotationInfo?.hasComponentV2 || classInfo.annotationInfo?.hasObservedV2) {
        return !!propertyInfo?.annotationInfo && Object.keys(propertyInfo.annotationInfo).length > 0;
    }
    return false;
}

function checkSyncMonitorDecoratorInMethodDefinition<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, NormalClassMethodInfo | StructMethodInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    const monitorUsage = metadata.annotations?.SyncMonitor;
    if (!monitorUsage) {
        return;
    }
    const firstProperty = monitorUsage.properties.at(0);
    const pathStringPairs: [arkts.AstNode, string][] | undefined = firstProperty 
        ? findPathArrayFromMonitorAnnoProperty(firstProperty) 
        : undefined;
    if (!pathStringPairs) {
        return;
    }

    let isUsedInValidContext: boolean = true;
    if (checkIsStructMethodFromInfo(metadata)) {
        isUsedInValidContext &&= checkSyncMonitorInComponentV2Struct.bind(this)(monitorUsage);
    }
    if (checkIsNormalClassMethodFromInfo(metadata)) {
        isUsedInValidContext &&= checkSyncMonitorInObservedV2Class.bind(this)(monitorUsage);
    }
    if (isUsedInValidContext) {
        MonitorPathStringCache.getInstance().collect(monitorUsage, pathStringPairs);
    }

    const annotationNumOfMethod = countAnnotationOfMethod(metadata);
    const otherAnnotation: arkts.AnnotationUsage | undefined = findOtherAnnotation(metadata);
    if (annotationNumOfMethod <= 1 || !otherAnnotation) {
        return;
    }

    this.report({
        node: monitorUsage,
        message: `The member property or method cannot be decorated by multiple built-in annotations.`,
        level: LogType.ERROR,
        suggestions: [createSuggestion(``, ...getPositionRangeFromAnnotation(otherAnnotation), `Remove the annotation`)],
    });
}

function checkSyncMonitorInComponentV2Struct<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, StructMethodInfo>,
    monitorUsage: arkts.AnnotationUsage
): boolean {
    const metadata = this.context ?? {};
    if (metadata.structInfo?.annotationInfo?.hasComponentV2) {
        return true;
    }

    const componentUsage = metadata.structInfo?.annotations?.Component;
    if (componentUsage) {
        this.report({
            node: monitorUsage,
            message: `The '@SyncMonitor' annotation can only be used in a 'struct' decorated with '@ComponentV2'.`,
            level: LogType.ERROR,
            suggestions: [createSuggestion(
                `${StructDecoratorNames.COMPONENT_V2}`,
                ...getPositionRangeFromNode(componentUsage),
                `Change @Component to @ComponentV2`
            )],
        });
        return false;
    }
    return true;
}

function checkSyncMonitorInObservedV2Class<T extends arkts.AstNode = arkts.MethodDefinition>(
    this: BaseValidator<T, NormalClassMethodInfo>,
    monitorUsage: arkts.AnnotationUsage
): boolean {
    const metadata = this.context ?? {};
    if (metadata.classInfo?.annotationInfo?.hasObservedV2) {
        return true;
    }

    const observedUsage = metadata.classInfo?.annotations?.Observed;
    if (observedUsage) {
        this.report({
            node: monitorUsage,
            message: `The '@SyncMonitor' can decorate only member method within a 'class' decorated with @ObservedV2.`,
            level: LogType.ERROR,
            suggestions: [createSuggestion(
                `${DecoratorNames.OBSERVED_V2}`,
                ...getPositionRangeFromNode(observedUsage),
                `Change @Observed to @ObservedV2`
            )],
        });
        return false;
    }
    const definitionPtr = metadata.classInfo?.definitionPtr;
    if (!definitionPtr) {
        return true;
    }
    const classDeclaration = arkts.unpackNonNullableNode(definitionPtr);
    this.report({
        node: monitorUsage,
        level: LogType.ERROR,
        message: `The '@SyncMonitor' can decorate only member method within a 'class' decorated with @ObservedV2.`,
        suggestions: [createSuggestion(
            `@${DecoratorNames.OBSERVED_V2}\n`,
            classDeclaration.startPosition,
            classDeclaration.startPosition,
            `Add @ObservedV2 annotation`
        )],
    });
    return false;
}

function checkSyncMonitorDecoratorInClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo | NormalClassPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    const monitorUsage = metadata.ignoredAnnotations?.SyncMonitor;
    if (!monitorUsage) {
        return;
    }

    this.report({
        node: monitorUsage,
        message: `@SyncMonitor can only decorate method.`,
        level: LogType.ERROR,
            suggestions: [createSuggestion(
                ``,
                ...getPositionRangeFromAnnotation(monitorUsage),
                `Remove the @SyncMonitor annotation`
            )],

    });
}

function countAnnotationOfMethod(metadata: NormalClassMethodInfo | StructMethodInfo): number {
    let count = 0;
    Object.values(DecoratorNames).forEach((key) => {
        if (metadata.annotationInfo?.[`has${key}`] || metadata.ignoredAnnotationInfo?.[`has${key}`]) {
            count++;
        }
    });
    return count;
}

function findOtherAnnotation(metadata: NormalClassMethodInfo | StructMethodInfo): arkts.AnnotationUsage | undefined {
    let otherAnnotation: arkts.AnnotationUsage | undefined = undefined;
    for (const key of Object.values(DecoratorNames)) {
        if (otherAnnotation) {
            break;
        }
        if (metadata.annotations?.[key]) {
            otherAnnotation = metadata.annotations?.[key];
        }
        if (metadata.ignoredAnnotations?.[key]) {
            otherAnnotation = metadata.ignoredAnnotations?.[key];
        }
    }
    return otherAnnotation;
}

function findClassInfo(
    classDecl: arkts.ClassDeclaration, 
    isWithinStruct: boolean
): CustomComponentInfo | NormalClassInfo | undefined {
    let classRecord: CustomComponentRecord | NormalClassRecord;
    if (isWithinStruct) {
        classRecord = RecordBuilder.build(CustomComponentRecord, classDecl, { shouldIgnoreDecl: false });
    } else {
        classRecord = RecordBuilder.build(NormalClassRecord, classDecl, { shouldIgnoreDecl: false });
    }
    if (!classRecord.isCollected) {
        classRecord.collect(classDecl);
    }
    return classRecord.toRecord();
}

function findPropertyInfo(
    property: arkts.ClassProperty,
    isWithinStruct: boolean
): StructPropertyInfo | NormalClassPropertyInfo | undefined {
    let propertyRecord: StructPropertyRecord | NormalClassPropertyRecord;
    if (isWithinStruct) {
        propertyRecord = RecordBuilder.build(StructPropertyRecord, property, { shouldIgnoreDecl: false });
    } else {
        propertyRecord = RecordBuilder.build(NormalClassPropertyRecord, property, { shouldIgnoreDecl: false });
    }
    if (!propertyRecord.isCollected) {
        propertyRecord.collect(property);
    }
    return propertyRecord.toRecord();
}

function findMethodInfo(
    method: arkts.MethodDefinition,
    isWithinStruct: boolean
): StructMethodInfo | NormalClassMethodInfo | undefined {
    let methodRecord: StructMethodRecord | NormalClassMethodRecord;
    if (isWithinStruct) {
        methodRecord = RecordBuilder.build(StructMethodRecord, method, { shouldIgnoreDecl: false });
    } else {
        methodRecord = RecordBuilder.build(NormalClassMethodRecord, method, { shouldIgnoreDecl: false });
    }
    if (!methodRecord.isCollected) {
        methodRecord.collect(method);
    }
    return methodRecord.toRecord();
}

class MonitorPathStringCache {
    private static _instance: MonitorPathStringCache | null = null;
    private _pathStringArrCache: Map<arkts.KNativePointer, [arkts.AstNode, string][]> = new Map();
    private _nodeCache: Map<arkts.KNativePointer, arkts.AnnotationUsage> = new Map();
    private _keySet: Set<arkts.KNativePointer> = new Set();

    public static getInstance(): MonitorPathStringCache {
        if (!MonitorPathStringCache._instance) {
            MonitorPathStringCache._instance = new MonitorPathStringCache();
        }
        return MonitorPathStringCache._instance;
    }

    clear(): void {
        this._pathStringArrCache.clear();
        this._nodeCache.clear();
        this._keySet.clear();
    }

    collect(node: arkts.AnnotationUsage, pathStringPairs: [arkts.AstNode, string][]): void {
        this._pathStringArrCache.set(node.peer, pathStringPairs);
        this._nodeCache.set(node.peer, node);
        this._keySet.add(node.peer);
    }

    getAllPathStringPairs(): [arkts.AnnotationUsage, [arkts.AstNode, string][]][] {
        const pairs: [arkts.AnnotationUsage, [arkts.AstNode, string][]][] = [];
        this._keySet.forEach((peer) => {
            const node = this._nodeCache.get(peer);
            const pathStringPairs = this._pathStringArrCache.get(peer);
            if (!node || !pathStringPairs) {
                return;
            }
            pairs.push([node, pathStringPairs]);
        });
        return pairs;
    }
}

class MonitorPathValidationCache {
    private static _instance: MonitorPathValidationCache | null = null;
    private _cache: Map<arkts.KNativePointer, LogType> = new Map();

    public static getInstance(): MonitorPathValidationCache {
        if (!MonitorPathValidationCache._instance) {
            MonitorPathValidationCache._instance = new MonitorPathValidationCache();
        }
        return MonitorPathValidationCache._instance;
    }

    clear(): void {
        this._cache.clear();
    }

    collect(node: arkts.AstNode, logType: LogType): void {
        this._cache.set(node.peer, logType);
    }

    getLogType(node: arkts.AstNode): LogType | undefined {
        return this._cache.get(node.peer);
    }
}