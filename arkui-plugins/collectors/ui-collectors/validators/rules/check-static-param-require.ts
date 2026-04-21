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
import { CallInfo, CustomComponentInterfacePropertyInfo } from '../../records';
import { LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkStaticParamRequire = performanceLog(
    _checkStaticParamRequire,
    getPerfName([0, 0, 0, 0, 0], 'checkStaticParamRequire')
);

/**
 * 校验规则：用于校验通过组件构造函数初始化变量是否为静态变量。
 * 1. 向V1组件的`static`变量或V2组件带装饰器的`static`变量传参时，告警。
 *
 * 校验等级：warn
 */
function _checkStaticParamRequire(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    struct: arkts.ClassDefinition
): void {
    const metadata = this.context ?? {};
    if (!metadata.structDeclInfo || !metadata.fromStructInfo) {
        return;
    }
    const hasComponentV1 = metadata.structDeclInfo.annotationInfo?.hasComponent;
    const hasComponentV2 = metadata.structDeclInfo.annotationInfo?.hasComponentV2;
    if (!struct || !struct.parent || !arkts.isClassDeclaration(struct.parent)) {
        return;
    }
    const staticClassProperty = collectStaticProperties(struct.parent.definition?.body ?? [], hasComponentV1, hasComponentV2);
    reportStaticPropertyInit.bind(this)(metadata.structPropertyInfos ?? [], staticClassProperty);
}

function collectStaticProperties(
    body: readonly arkts.AstNode[],
    hasComponentV1: boolean | undefined,
    hasComponentV2: boolean | undefined
): string[] {
    const staticClassProperty: string[] = [];
    body.forEach((property) => {
        if (!arkts.isClassProperty(property) || !property.key || !arkts.isIdentifier(property.key)) {
            return;
        }
        const propertyName = property.key.name;
        if (propertyName === '' || !property.isStatic) {
            return;
        }
        if (hasComponentV1 || (hasComponentV2 && property.annotations.length > 0)) {
            staticClassProperty.push(propertyName);
        }
    });
    return staticClassProperty;
}

function reportStaticPropertyInit(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    propertyInfos: [arkts.AstNode, CustomComponentInterfacePropertyInfo][],
    staticClassProperty: string[]
): void {
    propertyInfos.forEach(([propertyPtr, propertyInfo]) => {
        if (!propertyPtr || !propertyInfo || !propertyInfo.name || !staticClassProperty.includes(propertyInfo.name)) {
            return;
        }
        const property = arkts.classByPeer<arkts.Property>(propertyPtr);
        this.report({
            node: property,
            level: LogType.WARN,
            message: `Static property '${propertyInfo.name}' can not be initialized through the component constructor.`,
        });
    });
}
