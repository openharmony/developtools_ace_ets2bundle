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
import { CallInfo, RecordBuilder, StructPropertyInfo, StructPropertyRecord } from '../../records';
import { StructDecoratorNames, DecoratorNames, LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkVariableInitializationPassing = performanceLog(
    _checkVariableInitializationPassing,
    getPerfName([0, 0, 0, 0, 0], 'checkVariableInitializationPassing')
);

const notAllowInitDecorators: string[] = [
    DecoratorNames.STORAGE_LINK,
    DecoratorNames.STORAGE_PROP_REF,
    DecoratorNames.CONSUME,
    DecoratorNames.LOCAL_STORAGE_LINK,
    DecoratorNames.LOCAL_STORAGE_PROP_REF,
];

/**
 * 校验规则：用于验证使用组件构造函数实现的参数初始化。
 * 1. `@Require`修饰的属性在组件构造时，必须赋值。
 * 2. `@Link`、`@ObjectLink`修饰的属性在组件构造时，必须赋值。
 * 3. 特定装饰器修饰的属性在组件构造时，禁止赋值。
 * 4. interop模式下，禁止`@Component`与`@ComponentV2`组件互相嵌套。
 *
 * 校验等级：error
 */
function _checkVariableInitializationPassing(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.CallExpression,
    struct: arkts.ClassDefinition
): void {
    const metadata = this.context ?? {};
    reportComponentV1V2MixUse.bind(this)(metadata, node);
    if (!metadata.structDeclInfo || !metadata.fromStructInfo?.name) {
        return;
    }
    const structName = metadata.structDeclInfo?.name ?? struct.ident?.name ?? '';
    if (!structName) {
        return;
    }
    const hasTrailingClosure = !!metadata.isTrailingCall;
    const { requireInitProperty, mustInitProperty } = collectMustInitProperties(struct);
    removeInitializedProperties(metadata, requireInitProperty, mustInitProperty);
    reportCannotInitProperties.bind(this)(metadata, structName);
    reportMissingInitProperties.bind(this)(node, requireInitProperty, mustInitProperty, hasTrailingClosure);
}

function collectMustInitProperties(
    struct: arkts.ClassDefinition
): { requireInitProperty: string[]; mustInitProperty: string[] } {
    const requireInitProperty: string[] = [];
    const mustInitProperty: string[] = [];
    struct.body.forEach((item) => {
        if (!arkts.isClassProperty(item)) {
            return;
        }
        const structPropertyRecord = RecordBuilder.build(StructPropertyRecord, item, { shouldIgnoreDecl: false });
        if (!structPropertyRecord.isCollected) {
            structPropertyRecord.collect(item);
        }
        const propertyInfo = structPropertyRecord.toRecord();
        if (!propertyInfo || !propertyInfo.name) {
            return;
        }
        if (checkPropertyMustInitFromInfo(propertyInfo)) {
            mustInitProperty.push(propertyInfo.name);
        } else if (checkPropertyRequireInitFromInfo(propertyInfo)) {
            requireInitProperty.push(propertyInfo.name);
        }
    });
    return { requireInitProperty, mustInitProperty };
}

function removeInitializedProperties(
    metadata: CallInfo,
    requireInitProperty: string[],
    mustInitProperty: string[]
): void {
    metadata.structPropertyInfos?.forEach(([, propertyInfo]) => {
        if (!propertyInfo?.name) {
            return;
        }
        const mustIdx = requireInitProperty.indexOf(propertyInfo.name);
        if (mustIdx !== -1) {
            requireInitProperty.splice(mustIdx, 1);
        }
        const shouldIdx = mustInitProperty.indexOf(propertyInfo.name);
        if (shouldIdx !== -1) {
            mustInitProperty.splice(shouldIdx, 1);
        }
    });
}

function reportCannotInitProperties(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    metadata: CallInfo,
    structName: string
): void {
    metadata.structPropertyInfos?.forEach(([propertyPtr, propertyInfo]) => {
        if (!propertyPtr || !propertyInfo?.name) {
            return;
        }
        const cannotInitAnnotation = notAllowInitDecorators.find((annotation) => {
            return propertyInfo.annotationInfo?.[`has${annotation}`];
        });
        if (!cannotInitAnnotation) {
            return;
        }
        const property = arkts.classByPeer<arkts.ClassProperty>(propertyPtr);
        this.report({
            node: property,
            level: LogType.ERROR,
            message: `The '@${cannotInitAnnotation}' property '${propertyInfo.name}' in the custom component '${structName}' cannot be initialized here (forbidden to specify).`,
        });
    });
}

function reportMissingInitProperties(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.CallExpression,
    requireInitProperty: string[],
    mustInitProperty: string[],
    hasTrailingClosure: boolean
): void {
    if (!hasTrailingClosure) {
        requireInitProperty.forEach((propertyName) => {
            this.report({
                node: node,
                level: LogType.ERROR,
                message: `'@Require' decorated '${propertyName}' must be initialized through the component constructor.`,
            });
        });
    }
    mustInitProperty.forEach((propertyName) => {
        this.report({
            node: node,
            level: LogType.ERROR,
            message: `The property '${propertyName}' must be initialized through the component constructor.`,
        });
    });
}

function checkPropertyRequireInitFromInfo(metadata: StructPropertyInfo | undefined): boolean {
    if (!metadata?.annotationInfo?.hasRequire) {
        return false;
    }
    const anno = metadata.annotationInfo;
    return Object.keys(anno).length === 1 ||
        !!anno.hasState || !!anno.hasProvide || !!anno.hasPropRef ||
        !!anno.hasBuilderParam || !!anno.hasParam;
}

function checkPropertyMustInitFromInfo(metadata: StructPropertyInfo | undefined): boolean {
    return !!metadata?.annotationInfo?.hasLink || !!metadata?.annotationInfo?.hasObjectLink;
}

function reportComponentV1V2MixUse(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    metadata: CallInfo,
    node: arkts.CallExpression
): void {
    if (!metadata.isDeclFromLegacy) {
        return;
    }
    const parentAnnotation = metadata.fromStructInfo?.annotationInfo;
    if (!parentAnnotation) {
        return;
    }
    const isParentV2 = !!parentAnnotation.hasComponentV2;
    const parentName = metadata.fromStructInfo?.name ?? '';
    let childStructDecl: arkts.AstNode | undefined;
    if (node.expression && arkts.isMemberExpression(node.expression) &&
        node.expression.object && arkts.isIdentifier(node.expression.object)) {
        childStructDecl = arkts.getPeerIdentifierDecl(node.expression.object.peer);
    }
    if (!childStructDecl || !arkts.isClassDefinition(childStructDecl)) {
        return;
    }
    const isChildV2 = childStructDecl.annotations?.some(
        (anno: arkts.AnnotationUsage) => anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === StructDecoratorNames.COMPONENT_V2
    );
    let childName: string | undefined;
    if (arkts.isMemberExpression(node.expression) && arkts.isIdentifier(node.expression.object)) {
        childName = node.expression.object.name;
    }
    const parentDecorator = isParentV2 ? StructDecoratorNames.COMPONENT_V2 : StructDecoratorNames.COMPONENT;
    const childDecorator = isChildV2 ? StructDecoratorNames.COMPONENT_V2 : StructDecoratorNames.COMPONENT;
    if (isParentV2 === isChildV2) {
        return;
    }
    this.report({
        node: node,
        level: LogType.ERROR,
        message: `The @${childDecorator} '${childName}' cannot be used in the @${parentDecorator} '${parentName}' when interop.`,
    });
}
