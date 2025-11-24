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
import { StructPropertyInfo } from '../../records';
import { LogType, DecoratorNames } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkStructPropertyOptional = performanceLog(
    _checkStructPropertyOptional,
    getPerfName([0, 0, 0, 0, 0], 'checkStructPropertyOptional')
);

function _checkStructPropertyOptional(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    node: arkts.ClassProperty
): void {
    const metadata = this.context ?? {};
    const hasLink = !!metadata.annotationInfo?.hasLink;
    const hasPropRef = !!metadata.annotationInfo?.hasPropRef;
    const hasObjectLink = !!metadata.annotationInfo?.hasObjectLink;
    if (!hasPropRef && !hasLink && !hasObjectLink) {
        return;
    }

    const modifiers = metadata.modifiers;
    if (!modifiers) {
        return;
    }

    const isOptional = isClassPropertyOptional(modifiers);
    if (!isOptional) {
        return;
    }

    const propertyName = metadata.name;
    const propertyKey = node.key;
    if (!propertyKey || !propertyName) {
        return;
    }
    const propertyValue = node.value;
    if (!propertyValue && hasPropRef) {
        reportWarn.bind(this)(propertyKey, DecoratorNames.PROP_REF, propertyName);
    }
    if (hasLink) {
        reportWarn.bind(this)(propertyKey, DecoratorNames.LINK, propertyName);
    }
    if (hasObjectLink) {
        reportWarn.bind(this)(propertyKey, DecoratorNames.OBJECT_LINK, propertyName);
    }
}

function isClassPropertyOptional(modifiers: arkts.Es2pandaModifierFlags): boolean {
    const flag = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL;
    return (modifiers & flag) === flag;
}

function reportWarn(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    node: arkts.Expression,
    decoratorName: String,
    propertyName: String
): void {
    this.report({
        node: node,
        level: LogType.WARN,
        message: `The '${decoratorName}' property '${propertyName}' cannot be an optional parameter.`,
    });
}
