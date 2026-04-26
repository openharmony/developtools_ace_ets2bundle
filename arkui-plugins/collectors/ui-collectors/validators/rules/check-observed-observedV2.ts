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
import type { IntrinsicValidatorFunction } from '../safe-types';
import { NormalClassInfo, NormalClassRecord, RecordBuilder, StructPropertyInfo } from '../../records';
import { DecoratorNames, LANGUAGE_VERSION, LogType } from '../../../../common/predefines';
import { FileManager } from '../../../../common/file-manager';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkObservedObservedV2 = performanceLog(
    _checkObservedObservedV2,
    getPerfName([0, 0, 0, 0, 0], 'checkObservedObservedV2')
);

/**
 * 校验规则：用于验证使用 `@Observed` 装饰器和`@ObservedV2`装饰器混合使用的错误情况。
 * 1. 一个class不能同时使用`@Observed` 装饰器和`@ObservedV2`装饰器装饰。
 * 2. 在 `@Component` 结构体中，属性类型不能是被 `@ObservedV2` 装饰的类；
 * 3. 在 `@ComponentV2` 结构体中，属性类型不能是被 `@Observed` 装饰的类。
 *
 * 校验等级：error
 */
function _checkObservedObservedV2(this: BaseValidator<arkts.AstNode, Object>, node: arkts.AstNode): void {
    const nodeType = arkts.nodeType(node);
    if (checkByType.has(nodeType)) {
        checkByType.get(nodeType)!.bind(this)(node);
    }
}

function checkObservedObservedV2InClassDeclaration<T extends arkts.AstNode = arkts.ClassDeclaration>(
    this: BaseValidator<T, NormalClassInfo>,
    node: T
): void {
    const _node = coerceToAstNode<arkts.ClassDeclaration>(node);
    const metadata = this.context ?? {};
    const hasObserved = !!metadata.annotationInfo?.hasObserved;
    const hasObservedV2 = !!metadata.annotationInfo?.hasObservedV2;
    // 一个class不能同时使用`@Observed` 装饰器和`@ObserverdV2`装饰器装饰
    if (hasObserved && hasObservedV2) {
        const firstObservedDecorator = _node.definition?.annotations.find((annotation: arkts.AnnotationUsage) => {
            if (annotation.expr && arkts.isIdentifier(annotation.expr)) {
                return (
                    annotation.expr.name === DecoratorNames.OBSERVED ||
                    annotation.expr.name === DecoratorNames.OBSERVED_V2
                );
            }
            return false;
        });
        if (!firstObservedDecorator) {
            return;
        }
        this.report({
            node: firstObservedDecorator,
            level: LogType.ERROR,
            message: `A class can not be decorated by '@Observed' and '@ObservedV2' at the same time.`,
        });
    }
}

function checkObservedV1V2InteropInStructProperty<T extends arkts.AstNode = arkts.ClassProperty>(
    this: BaseValidator<T, StructPropertyInfo>,
    node: T
): void {
    const metadata = this.context ?? {};
    if (!metadata.structInfo) {
        return;
    }
    const hasComponent = !!metadata.structInfo.annotationInfo?.hasComponent;
    const hasComponentV2 = !!metadata.structInfo.annotationInfo?.hasComponentV2;
    if (!hasComponent && !hasComponentV2) {
        return;
    }
    if (!arkts.isClassProperty(node) || !node.typeAnnotation) {
        return;
    }
    const propertyDecoratorStr = getPropertyDecoratorString(metadata);
    if (hasComponent && hasObservedAnnotatedType(node.typeAnnotation, DecoratorNames.OBSERVED_V2)) {
        this.report({
            node,
            level: LogType.ERROR,
            message: `The type of the '${propertyDecoratorStr}' property cannot be a class decorated with '@ObservedV2' when interop.`,
        });
    }
    if (hasComponentV2 && hasObservedAnnotatedType(node.typeAnnotation, DecoratorNames.OBSERVED)) {
        this.report({
            node,
            level: LogType.ERROR,
            message: `The type of the '${propertyDecoratorStr}' property cannot be a class decorated with '@Observed' when interop.`,
        });
    }
}

const checkByType = new Map<arkts.Es2pandaAstNodeType, IntrinsicValidatorFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_DECLARATION, checkObservedObservedV2InClassDeclaration],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, checkObservedV1V2InteropInStructProperty],
]);

function getPropertyDecoratorString(info: StructPropertyInfo): string {
    if (!info.annotations) {
        return 'regular';
    }
    const names = Object.keys(info.annotations).map((name) => `@${name}`);
    return names.length > 0 ? names.join(', ') : 'regular';
}

function hasObservedAnnotatedType(
    typeNode: arkts.AstNode | undefined,
    targetDecorator: string
): boolean {
    if (!typeNode) {
        return false;
    }
    if (arkts.isETSTypeReference(typeNode) && typeNode.part && arkts.isETSTypeReferencePart(typeNode.part)) {
        if (checkTypeDeclHasObserved(typeNode.part.name, targetDecorator)) {
            return true;
        }
        const typeParams = typeNode.part.typeParams;
        if (typeParams && arkts.isTSTypeParameterInstantiation(typeParams) && typeParams.params) {
            return Array.from(typeParams.params).some((param) =>
                hasObservedAnnotatedType(param, targetDecorator)
            );
        }
    } else if (arkts.isETSUnionType(typeNode)) {
        return Array.from(typeNode.types).some((subType) => hasObservedAnnotatedType(subType, targetDecorator));
    }
    return false;
}

function checkTypeDeclHasObserved(
    typeNameNode: arkts.AstNode | undefined,
    targetDecorator: string
): boolean {
    if (!typeNameNode || !arkts.isIdentifier(typeNameNode)) {
        return false;
    }
    const decl = arkts.getPeerIdentifierDecl(typeNameNode.peer);
    if (!decl || !arkts.isClassDefinition(decl) || !decl.parent || !arkts.isClassDeclaration(decl.parent)) {
        return false;
    }
    const classRecord = RecordBuilder.build(NormalClassRecord, decl.parent, { shouldIgnoreDecl: true });
    if (!classRecord.isCollected) {
        classRecord.collect(decl.parent);
    }
    const classInfo = classRecord.toRecord();
    const program = arkts.getProgramFromAstNode(decl);
    const isFrom1_1 = program !== undefined
        ? FileManager.getInstance().getLanguageVersionByFilePath(program.absName) === LANGUAGE_VERSION.ARKTS_1_1
        : undefined;
    if (!isFrom1_1) {
        return false;
    }
    if (targetDecorator === DecoratorNames.OBSERVED_V2) {
        return !!classInfo?.annotationInfo?.hasObservedV2;
    }
    return !!classInfo?.annotationInfo?.hasObserved;
}
