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
import { BaseValidator } from '../base';
import { coerceToAstNode } from '../utils';
import type { ExtendedValidatorFunction, IntrinsicValidatorFunction } from '../safe-types';
import {
    CallInfo,
    NormalClassMethodAnnotationRecord,
    NormalClassMethodInfo,
    NormalClassPropertyInfo,
    RecordBuilder,
    StructMethodInfo,
    StructMethodRecord,
    StructPropertyInfo,
} from '../../records';
import { DecoratorNames, LogType, StructDecoratorNames } from '../../../../common/predefines';
import {
    createSuggestion,
    getPositionRangeFromAnnotation,
    getPositionRangeFromNode,
} from '../../../../common/log-collector';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkComputedDecorator = performanceLog(
    _checkComputedDecorator,
    getPerfName([0, 0, 0, 0, 0], 'checkComputedDecorator')
);

/**
 * 校验规则：
 *  1. `@Computed`装饰器只能用来装饰获取器（即`getter`方法）；
 *  2. `@Computed`装饰器在已经被`@ObservedV2`装饰器装饰的类`class`中的成员方法上使用；
 *  3. `@Computed`装饰器在已经被`@ComponentV2`装饰器修饰的结构体`struct`中使用
 *  4. `@Computed`装饰器修饰的属性不能与双向绑定语法一起使用；
 *  5. `@Computed`装饰器修饰的属性不能定义一个设置器（即`setter`方法）。
 *
 * 校验等级：error
 */
function _checkComputedDecorator(
    this: BaseValidator<arkts.AstNode, Object>,
    node: arkts.AstNode,
    other?: arkts.AstNode
): void {
    const nodeType = arkts.nodeType(node);
    if (checkByType.has(nodeType)) {
        checkByType.get(nodeType)!.bind(this)(node, other);
    }
}

function checkComputedDecoratorInMethod<
    T extends arkts.AstNode = arkts.MethodDefinition,
    U extends arkts.AstNode = arkts.ClassDefinition,
>(this: BaseValidator<T, MethodInfo>, node: T, classDecl?: U): void {
    const metadata = this.context ?? {};
    const method = coerceToAstNode<arkts.MethodDefinition>(node);
    const classDef = classDecl ? coerceToAstNode<arkts.ClassDefinition>(classDecl) : undefined;
    const setter = findSetterMethod(method, metadata);
    const getter = findGetterFromSetterMethod(setter, classDef);
    if (!!setter && !!getter && checkIsMethodHasComputed(getter)) {
        // `@Computed`装饰器修饰的属性不能定义一个设置器（即`setter`方法）
        this.report({
            node: setter,
            message: `A property decorated by '@Computed' cannot define a set method.`,
            level: LogType.ERROR,
            suggestion: createSuggestion('', ...getPositionRangeFromNode(setter), `Remove the set method`),
        });
    }
    if (!metadata.annotationInfo?.hasComputed) {
        return;
    }
    const computedAnnotation = metadata.annotations?.[DecoratorNames.COMPUTED]!;
    if (!checkIsGetterMethod(method, metadata)) {
        // `@Computed`装饰器只能用来装饰获取器（即`getter`方法）
        this.report({
            node: computedAnnotation,
            message: `@${DecoratorNames.COMPUTED} can only decorate 'GetAccessor'.`,
            level: LogType.ERROR,
            suggestion: createSuggestion(
                '',
                ...getPositionRangeFromAnnotation(computedAnnotation),
                `Remove the annotation`
            ),
        });
    } else if (!checkIsFromObervedV2InNormalClass(metadata) && !!classDef?.parent) {
        const observed = metadata.classInfo?.annotations?.[DecoratorNames.OBSERVED];
        const suggestion = observed
            ? createSuggestion(
                  `${DecoratorNames.OBSERVED_V2}`,
                  ...getPositionRangeFromNode(observed),
                  `Change @Observed to @ObservedV2`
              )
            : createSuggestion(
                  `@${DecoratorNames.OBSERVED_V2}\n`,
                  classDef.parent.startPosition,
                  classDef.parent.startPosition,
                  `Add @ObservedV2 decorator`
              );
        // `@Computed`装饰器在已经被`@ObservedV2`装饰器装饰的类`class`中的成员方法上使用
        this.report({
            node: computedAnnotation,
            message: `The '@Computed' can decorate only member method within a 'class' decorated with ObservedV2.`,
            level: LogType.ERROR,
            suggestion: suggestion,
        });
    } else if (
        !checkIsFromComponentV2InStruct(metadata) &&
        !!classDef?.parent &&
        metadata.structInfo?.annotationInfo?.hasComponent
    ) {
        const componentAnnotation = metadata.structInfo?.annotations?.[StructDecoratorNames.COMPONENT]!;
        // `@Computed`装饰器在已经被`@ComponentV2`装饰器修饰的结构体`struct`中使用
        this.report({
            node: computedAnnotation,
            message: `The '@Computed' annotation can only be used in a 'struct' decorated with ComponentV2.`,
            level: LogType.ERROR,
            suggestion: createSuggestion(
                `@${StructDecoratorNames.COMPONENT_V2}`,
                ...getPositionRangeFromNode(componentAnnotation),
                `Change @Component to @ComponentV2`
            ),
        });
    }
}

function checkComputedDecoratorInProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, PropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    // Since property cannot have `@Computed`, it is an ignored annotation.
    if (!metadata.ignoredAnnotationInfo?.hasComputed) {
        return;
    }
    const computedAnnotation = metadata.ignoredAnnotations?.[DecoratorNames.COMPUTED]!;
    // `@Computed`装饰器只能用来装饰获取器（即`getter`方法）
    this.report({
        node: computedAnnotation,
        message: `@${DecoratorNames.COMPUTED} can only decorate 'GetAccessor'.`,
        level: LogType.ERROR,
        suggestion: createSuggestion(
            '',
            ...getPositionRangeFromAnnotation(computedAnnotation),
            `Remove the annotation`
        ),
    });
}

function checkComputedDecoratorInStructCall<T extends arkts.AstNode = arkts.CallExpression>(
    this: BaseValidator<T, CallInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (!metadata.structDeclInfo?.name) {
        return;
    }
    const call = coerceToAstNode<arkts.CallExpression>(node);
    const optionsArg = call.arguments.at(1); // Options is the second argument of a custom component call.
    if (!optionsArg || !arkts.isObjectExpression(optionsArg)) {
        return;
    }
    // `@Computed`装饰器修饰的属性不能与双向绑定语法一起使用
    (optionsArg.properties as arkts.Property[]).forEach((prop) => {
        if (!prop.key || !prop.value || !arkts.isCallExpression(prop.value)) {
            return;
        }
        const computedArgs = findComputedArgInBindablePropertyValue(prop.value.arguments);
        computedArgs.forEach((node) => {
            this.report({
                node,
                message: `A property decorated by '@Computed' cannot be used with two-way bind syntax.`,
                level: LogType.ERROR,
            });
        });
    });
}

const checkByType = new Map<arkts.Es2pandaAstNodeType, IntrinsicValidatorFunction | ExtendedValidatorFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, checkComputedDecoratorInMethod],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, checkComputedDecoratorInProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION, checkComputedDecoratorInStructCall],
]);

type MethodInfo = StructMethodInfo & NormalClassMethodInfo;

type PropertyInfo = StructPropertyInfo & NormalClassPropertyInfo;

function findComputedArgInBindablePropertyValue(args: readonly arkts.Expression[]): readonly arkts.Expression[] {
    return args.filter((arg) => {
        if (!arkts.isMemberExpression(arg) || !arkts.isThisExpression(arg.object)) {
            return false;
        }
        const decl = arkts.getPeerIdentifierDecl(arg.property.peer);
        if (!decl || !arkts.isMethodDefinition(decl)) {
            return false;
        }
        const structMethodRecord = RecordBuilder.build(StructMethodRecord, decl, { shouldIgnoreDecl: false });
        if (!structMethodRecord.isCollected) {
            structMethodRecord.collect(decl);
        }
        const methodInfo = structMethodRecord.toRecord();
        return !!methodInfo?.annotationInfo?.hasComputed;
    });
}

function checkIsFromComponentV2InStruct(info: MethodInfo | PropertyInfo): boolean {
    if (!info.structInfo && !!info.classInfo) {
        return true; // Skip checking. This implies from normal class rather than from struct.
    }
    return !!info.structInfo?.annotationInfo?.hasComponentV2;
}

function checkIsFromObervedV2InNormalClass(info: MethodInfo | PropertyInfo): boolean {
    if (!info.classInfo && !!info.structInfo) {
        return true; // Skip checking. This implies from struct rather than from normal class.
    }
    return !!info.classInfo?.annotationInfo?.hasObservedV2;
}

function checkIsGetterMethod(node: arkts.MethodDefinition, info?: MethodInfo): boolean {
    if (info?.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
        return true;
    }
    let isGetter: boolean = node.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET;
    if (!isGetter) {
        isGetter = node.overloads.some((method) => checkIsGetterMethod(method));
    }
    return isGetter;
}

function findSetterMethod(node: arkts.MethodDefinition, info?: MethodInfo): arkts.MethodDefinition | undefined {
    if (info?.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET) {
        return node;
    }
    let isSetter: boolean = node.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET;
    if (isSetter) {
        return node;
    }
    return node.overloads.find((method) => findSetterMethod(method));
}

function findGetterFromSetterMethod(
    setter: arkts.MethodDefinition | undefined,
    classDecl: arkts.ClassDefinition | undefined
): arkts.MethodDefinition | undefined {
    if (!setter || !classDecl) {
        return undefined;
    }
    const getterInOverload = setter.overloads.find((method) => checkIsGetterMethod(method));
    if (!!getterInOverload) {
        return getterInOverload;
    }
    const name = setter.name.name;
    return classDecl.body.find(
        (st) => arkts.isMethodDefinition(st) && checkIsGetterMethod(st) && st.name.name === name
    ) as arkts.MethodDefinition | undefined;
}

function checkIsMethodHasComputed(node: arkts.MethodDefinition): boolean {
    const annotationRecord = new NormalClassMethodAnnotationRecord({ shouldIgnoreDecl: false });
    for (const annotation of node.scriptFunction.annotations) {
        annotationRecord.collect(annotation);
    }
    const annotationInfo = annotationRecord.toRecord();
    return !!annotationInfo?.annotationInfo?.hasComputed;
}
