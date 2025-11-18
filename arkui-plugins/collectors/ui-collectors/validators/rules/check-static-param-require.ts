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
import { CallInfo } from '../../records';
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
    // If a non-custom component is called and is not in the custom component, it returns directly
    if (!metadata.structDeclInfo || !metadata.fromStructInfo) {
        return;
    }
    const hasComponentV1 = metadata.structDeclInfo.annotationInfo?.hasComponent;
    const hasComponentV2 = metadata.structDeclInfo.annotationInfo?.hasComponentV2;
    if (!struct || !struct.parent || !arkts.isClassDeclaration(struct.parent)) {
        return;
    }
    let staticClassProperty: string[] = [];
    struct.parent?.definition?.body.forEach((property) => {
        if (!arkts.isClassProperty(property) || !property.key || !arkts.isIdentifier(property.key)) {
            return;
        }
        const propertyName = property.key.name;
        if (propertyName === '' || !property.isStatic) {
            return;
        }
        // Static properties in componentV1 or static properties with decorators in componentV2 need to be verified
        if (hasComponentV1 || (hasComponentV2 && property.annotations.length > 0)) {
            staticClassProperty.push(propertyName);
        }
    });
    metadata.structPropertyInfos?.forEach(([propertyPtr, propertyInfo]) => {
        if (!propertyPtr || !propertyInfo || !propertyInfo.name || !staticClassProperty.includes(propertyInfo.name)) {
            return;
        }
        // 向V1组件的`static`变量或V2组件带装饰器的`static`变量传参时，告警。
        const property = arkts.classByPeer<arkts.Property>(propertyPtr);
        this.report({
            node: property,
            level: LogType.WARN,
            message: `Static property '${propertyInfo.name}' can not be initialized through the component constructor.`,
        });
    });
}
