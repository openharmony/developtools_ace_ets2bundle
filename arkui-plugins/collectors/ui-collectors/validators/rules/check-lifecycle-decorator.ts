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
    GLobalPropertyInfo,
    NormalClassInfo,
    NormalClassMethodInfo,
    NormalClassPropertyInfo,
    NormalInterfaceInfo,
    StructMethodInfo,
    StructPropertyInfo,
} from '../../records';
import { DecoratorNames, LogType, StructDecoratorNames } from '../../../../common/predefines';
import { createSuggestion, getPositionRangeFromAnnotation } from '../../../../common/log-collector';
import {
    checkIsCustomComponentFromInfo,
    checkIsGlobalFunctionFromInfo,
    checkIsNormalClassMethodFromInfo,
    checkIsNormalClassPropertyFromInfo,
    checkIsStructMethodFromInfo,
    checkIsStructPropertyFromInfo,
} from '../../../../collectors/ui-collectors/utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkLifecycleDecorator = performanceLog(
    _checkLifecycleDecorator,
    getPerfName([0, 0, 0, 0, 0], 'checkLifecycleDecorator')
);

const LIFECYCLE_WITHOUT_PARAMS: Set<string> = new Set([
    DecoratorNames.COMPONENT_INIT,
    DecoratorNames.COMPONENT_APPEAR,
    DecoratorNames.COMPONENT_BUILT,
    DecoratorNames.COMPONENT_RECYCLE,
    DecoratorNames.COMPONENT_DISAPPEAR,
]);

const LIFECYCLE_METHODS: Set<string> = new Set([
    'aboutToAppear',
    'onDidBuild',
    'aboutToRecycle',
    'aboutToReuse',
    'aboutToDisappear',
]);

const LIFECYCLE_DECORATORS: Set<string> = new Set([
    ...LIFECYCLE_WITHOUT_PARAMS,
    DecoratorNames.COMPONENT_REUSE,
    DecoratorNames.COMPONENT_ACTIVE,
    DecoratorNames.COMPONENT_INACTIVE,
]);

const OTHER_LIFECYCLE_DECORATORS: Set<string> = new Set([
    DecoratorNames.COMPONENT_INIT,
    DecoratorNames.COMPONENT_APPEAR,
    DecoratorNames.COMPONENT_BUILT,
    DecoratorNames.COMPONENT_DISAPPEAR,
    DecoratorNames.COMPONENT_REUSE,
    DecoratorNames.COMPONENT_RECYCLE,
]);

const REUSE_OBJECT_TYPE_NAME: string = 'ReuseObject';

function _checkLifecycleDecorator(this: BaseValidator<arkts.AstNode, Object>, node: arkts.AstNode): void {
    const nodeType = arkts.nodeType(node);
    if (checkByType.has(nodeType)) {
        checkByType.get(nodeType)!.bind(this)(node);
    }
}

const checkByType = new Map<arkts.Es2pandaAstNodeType, IntrinsicValidatorFunction | ExtendedValidatorFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, checkRuleInClassProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, checkRuleInMethodDefinition],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_INTERFACE_DECLARATION, checkLifecycleInInterface],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_DECLARATION, checkRuleInClassDeclaration],
]);

function checkRuleInClassProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, Object>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsStructPropertyFromInfo(metadata)) {
        checkLifecycleOnNonMethodNode.bind(this)(metadata as StructPropertyInfo);
    } else if (checkIsNormalClassPropertyFromInfo(metadata)) {
        checkLifecycleOnNonMethodNode.bind(this)(metadata as NormalClassPropertyInfo);
    } else {
        checkLifecycleOnNonMethodNode.bind(this)(metadata as GLobalPropertyInfo);
    }
}

function checkRuleInMethodDefinition<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, Object>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsStructMethodFromInfo(metadata) && arkts.isMethodDefinition(node)) {
        checkLifecycleOnStructMethod.bind(this)(node, metadata);
    } else if (checkIsNormalClassMethodFromInfo(metadata) && arkts.isMethodDefinition(node)) {
        checkLifecycleOnClassMethod.bind(this)(node, metadata as NormalClassMethodInfo);
    } else if (checkIsGlobalFunctionFromInfo(metadata)) {
        checkLifecycleOnNonMethodNode.bind(this)(metadata);
    }
}

function checkRuleInClassDeclaration<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, Object>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (checkIsCustomComponentFromInfo(metadata)) {
        checkLifecycleOnNonMethodNode.bind(this)(metadata as CustomComponentInfo);
    } else {
        checkLifecycleOnNonMethodNode.bind(this)(metadata as NormalClassInfo);
    }
}

function checkLifecycleInInterface<T extends arkts.AstNode = arkts.TSInterfaceDeclaration>(
    this: BaseValidator<T, Object>,
    node: T
): void {
    if (!arkts.isTSInterfaceDeclaration(node)) {
        return;
    }
    checkLifecycleInAnnotationList.bind(this)(node.annotations);
    const interfaceBody = node.body;
    const members: readonly arkts.AstNode[] = interfaceBody?.body ?? [];
    for (const member of members) {
        if (arkts.isClassProperty(member)) {
            checkLifecycleInAnnotationList.bind(this)(member.annotations);
        } else if (arkts.isMethodDefinition(member) && member.function?.annotations) {
            checkLifecycleInAnnotationList.bind(this)(member.function.annotations);
        }
    }
}

function checkLifecycleInAnnotationList<T extends arkts.AstNode = arkts.AstNode>(
    this: BaseValidator<T, Object>,
    annotations: readonly arkts.AnnotationUsage[]
): void {
    if (!annotations) {
        return;
    }
    for (const annotation of annotations) {
        if (!annotation.expr || !arkts.isIdentifier(annotation.expr)) {
            continue;
        }
        const name: string = annotation.expr.name;
        if (LIFECYCLE_DECORATORS.has(name)) {
            this.report({
                node: annotation,
                level: LogType.ERROR,
                message: `'@${name}' can only decorate methods.`,
            });
        }
    }
}

function checkLifecycleOnNonMethodNode<T extends arkts.AstNode = arkts.AstNode>(
    this: BaseValidator<T, Object>,
    metadata: CustomComponentInfo | NormalClassInfo | StructPropertyInfo | NormalClassPropertyInfo | GLobalPropertyInfo | NormalClassMethodInfo
): void {
    for (const decoratorName of LIFECYCLE_DECORATORS) {
        const annoNode = metadata.ignoredAnnotations?.[decoratorName];
        if (annoNode) {
            this.report({
                node: annoNode,
                level: LogType.ERROR,
                message: `'@${decoratorName}' can only decorate methods.`,
            });
        }
    }
}

function checkLifecycleOnStructMethod(
    this: BaseValidator<arkts.AstNode, Object>,
    node: arkts.MethodDefinition,
    metadata: StructMethodInfo
): void {
    const methodName = metadata.name;
    const methodHasParams = node.function.params.length > 0;

    if (methodName && LIFECYCLE_METHODS.has(methodName)) {
        checkLifecycleOnBuiltinMethod.bind(this)(node, metadata, methodName);
        return;
    }

    if (methodHasParams) {
        checkLifecycleParams.bind(this)(node, metadata);
    }

    checkComponentReuseRules.bind(this)(node, metadata);

    checkActiveInactiveConstraints.bind(this)(node, metadata);
}

function checkLifecycleOnClassMethod(
    this: BaseValidator<arkts.AstNode, Object>,
    node: arkts.MethodDefinition,
    metadata: NormalClassMethodInfo
): void {
    checkLifecycleOnNonMethodNode.bind(this)(metadata);
}

function checkLifecycleOnBuiltinMethod(
    this: BaseValidator<arkts.AstNode, Object>,
    node: arkts.MethodDefinition,
    metadata: StructMethodInfo,
    methodName: string
): void {
    for (const decoratorName of LIFECYCLE_WITHOUT_PARAMS) {
        const annoNode = metadata.annotations?.[decoratorName];
        if (annoNode) {
            this.report({
                node: annoNode,
                level: LogType.ERROR,
                message: `'@${decoratorName}' cannot decorate '${methodName}'.`,
            });
        }
    }
    const reuseNode = metadata.annotations?.[DecoratorNames.COMPONENT_REUSE];
    if (reuseNode) {
        this.report({
            node: reuseNode,
            level: LogType.ERROR,
            message: `'@ComponentReuse' cannot decorate '${methodName}'.`,
        });
    }
}

function checkLifecycleParams(
    this: BaseValidator<arkts.AstNode, Object>,
    node: arkts.MethodDefinition,
    metadata: StructMethodInfo
): void {
    for (const decoratorName of LIFECYCLE_WITHOUT_PARAMS) {
        const annoNode = metadata.annotations?.[decoratorName];
        if (annoNode) {
            this.report({
                node: annoNode,
                level: LogType.ERROR,
                message: `Methods decorated with '@${decoratorName}' cannot have input parameters.`,
            });
        }
    }
}

function checkComponentReuseRules(
    this: BaseValidator<arkts.AstNode, Object>,
    node: arkts.MethodDefinition,
    metadata: StructMethodInfo
): void {
    const componentReuseNode = metadata.annotations?.[DecoratorNames.COMPONENT_REUSE];
    if (!componentReuseNode) {
        return;
    }

    const structAnnotationInfo = metadata.structInfo?.annotationInfo;
    const isComponentV1: boolean = !!structAnnotationInfo?.hasComponent;
    const isComponentV2: boolean = !!structAnnotationInfo?.hasComponentV2;

    if (isComponentV2) {
        if (node.function.params.length > 0) {
            this.report({
                node: componentReuseNode,
                level: LogType.ERROR,
                message: `Methods decorated with '@ComponentReuse' in '@ComponentV2' cannot have input parameters`,
            });
        }
        return;
    }

    if (!isComponentV1) {
        return;
    }

    if (node.function.params.length === 0) {
        return;
    }

    if (node.function.params.length === 1 && isReuseObjectParameter(node.function.params[0])) {
        return;
    }

    this.report({
        node: componentReuseNode,
        level: LogType.ERROR,
        message: `In the struct decorated with '@Component', the '@ComponentReuse' decorated function can have either no parameters or a single parameter of the 'ReuseObject' type.`,
    });
}

function isReuseObjectParameter(param: arkts.Expression): boolean {
    if (!arkts.isETSParameterExpression(param)) {
        return false;
    }
    return getTypeName(param.typeAnnotation) === REUSE_OBJECT_TYPE_NAME;
}

function getTypeName(typeNode: arkts.TypeNode | undefined): string | undefined {
    if (!typeNode) {
        return undefined;
    }
    if (!arkts.isETSTypeReference(typeNode)) {
        return undefined;
    }
    const typeRef = typeNode as arkts.ETSTypeReference;
    if (typeRef.part && arkts.isETSTypeReferencePart(typeRef.part)) {
        const part = typeRef.part as arkts.ETSTypeReferencePart;
        if (part.name && arkts.isIdentifier(part.name)) {
            return part.name.name;
        }
    }
    return undefined;
}

function checkActiveInactiveConstraints(
    this: BaseValidator<arkts.AstNode, Object>,
    node: arkts.MethodDefinition,
    metadata: StructMethodInfo
): void {
    const hasActive = metadata.annotationInfo?.hasComponentActive;
    const hasInactive = metadata.annotationInfo?.hasComponentInactive;

    if (!hasActive && !hasInactive) {
        return;
    }

    if (hasActive && hasInactive) {
        const annotation = metadata.annotations?.[DecoratorNames.COMPONENT_ACTIVE]!;
        this.report({
            node: annotation,
            level: LogType.ERROR,
            message: `'@ComponentActive' and '@ComponentInactive' cannot decorate the same method.`,
        });
    }

    if (arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC)) {
        const decoratorName = hasActive ? DecoratorNames.COMPONENT_ACTIVE : DecoratorNames.COMPONENT_INACTIVE;
        const annotation = metadata.annotations?.[decoratorName]!;
        this.report({
            node: annotation,
            level: LogType.ERROR,
            message: `Methods decorated with '@${decoratorName}' cannot be static.`,
        });
    }

    for (const annotation of node.function.annotations) {
        if (!annotation.expr || !arkts.isIdentifier(annotation.expr)) {
            continue;
        }
        const otherName = annotation.expr.name;
        if (!otherName || !OTHER_LIFECYCLE_DECORATORS.has(otherName)) {
            continue;
        }
        const activeInactiveName = hasActive ? DecoratorNames.COMPONENT_ACTIVE : DecoratorNames.COMPONENT_INACTIVE;
        const activeInactiveAnnotation = metadata.annotations?.[activeInactiveName]!;
        this.report({
            node: activeInactiveAnnotation,
            level: LogType.ERROR,
            message: `'@${activeInactiveName}' cannot be used with '@${otherName}' on the same method.`,
        });
    }
}
