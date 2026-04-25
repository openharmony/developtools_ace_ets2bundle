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
import { NormalClassRecord, RecordBuilder, StructPropertyInfo } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';

/**
 * 校验规则：禁止在`@Component`中使用`@ObservedV2`装饰的类
 * 
 * 校验等级：error
 */
export function checkComponentV2MixUse(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    classProperty: arkts.ClassProperty
): void {
    const metadata = this.context ?? {};
    if (!metadata.structInfo?.annotationInfo?.hasComponent) {
        return;
    }

    const v1Decorators = findStructPropertyV1DecoratorsFromInfo(metadata);
    if (v1Decorators.length === 0) {
        return;
    }
    let decl: arkts.AstNode | undefined;
    let expr: arkts.Identifier | undefined;
    expr = findTypeRefIdentFromType(classProperty.typeAnnotation);
    if (!expr && checkIsNewClass(classProperty.value)) {
        expr = findTypeRefIdentFromType(classProperty.value.getTypeRef);
    }
    if (!!expr) {
        decl = arkts.getPeerIdentifierDecl(expr.peer);
    }
    if (!decl || !checkIsClassDef(decl) || !checkIsClassDecl(decl.parent)) {
        return;
    }
    const classRecord = RecordBuilder.build(NormalClassRecord, decl.parent, { shouldIgnoreDecl: false });
    if (!classRecord.isCollected) {
        classRecord.collect(decl.parent);
    }
    const classInfo = classRecord.toRecord();
    if (!classInfo?.annotationInfo?.hasObservedV2) {
        return;
    }
    v1Decorators.forEach((info) =>
        this.report({
            node: info.annotation,
            message: `The type of the ${info.name} property cannot be a class decorated with '@ObservedV2'.`,
            level: LogType.ERROR,
        })
    );
}

interface DecoratorInfo {
    name: string;
    annotation: arkts.AnnotationUsage;
}

const v1ComponentDecorators: string[] = [
    DecoratorNames.STATE,
    DecoratorNames.PROP_REF,
    DecoratorNames.LINK,
    DecoratorNames.PROVIDE,
    DecoratorNames.CONSUME,
    DecoratorNames.STORAGE_LINK,
    DecoratorNames.STORAGE_PROP_REF,
    DecoratorNames.LOCAL_STORAGE_LINK,
];

function findStructPropertyV1DecoratorsFromInfo(info: StructPropertyInfo): DecoratorInfo[] {
    if (!info.annotationInfo || !info.annotations) {
        return [];
    }
    return v1ComponentDecorators
        .filter((name) => !!info.annotationInfo?.[`has${name}`])
        .map((name) => ({
            name,
            annotation: info.annotations?.[name]!,
        }));
}

function checkIsClassDef(node: arkts.AstNode | undefined): node is arkts.ClassDefinition {
    return !!node && arkts.isClassDefinition(node);
}

function checkIsClassDecl(node: arkts.AstNode | undefined): node is arkts.ClassDeclaration {
    return !!node && arkts.isClassDeclaration(node);
}

function checkIsTypeRef(node: arkts.AstNode | undefined): node is arkts.ETSTypeReference {
    return !!node && arkts.isETSTypeReference(node);
}

function checkIsTypeRefPart(node: arkts.AstNode | undefined): node is arkts.ETSTypeReferencePart {
    return !!node && arkts.isETSTypeReferencePart(node);
}

function checkIsIdentifier(node: arkts.AstNode | undefined): node is arkts.Identifier {
    return !!node && arkts.isIdentifier(node);
}

function checkIsUnionType(node: arkts.AstNode | undefined): node is arkts.ETSUnionType {
    return !!node && arkts.isETSUnionType(node);
}

function checkIsNewClass(node: arkts.AstNode | undefined): node is arkts.ETSNewClassInstanceExpression {
    return !!node && arkts.isETSNewClassInstanceExpression(node);
}

function findTypeRefIdentFromType(node: arkts.AstNode | undefined): arkts.Identifier | undefined {
    if (checkIsIdentifier(node)) {
        return node;
    }
    if (checkIsTypeRef(node) && checkIsTypeRefPart(node.part) && checkIsIdentifier(node.part.name)) {
        return node.part.name;
    }
    if (checkIsUnionType(node)) {
        return node.types.map(findTypeRefIdentFromType).find((t) => !!t);
    }
    return undefined;
}
