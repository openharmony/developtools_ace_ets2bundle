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
import { LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkStructAttributeNoType = performanceLog(
    _checkStructAttributeNoType,
    getPerfName([0, 0, 0, 0, 0], 'checkStructAttributeNoType')
);

function _checkStructAttributeNoType(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    node: arkts.ClassProperty
): void {
    // Skip if the property has an explicit type annotation
    if (node.typeAnnotation) {
        return;
    }
    const metadata = this.context ?? {};
    const propertyName = metadata.name;
    const propertyKey = node.key;
    if (!propertyKey || !arkts.isIdentifier(propertyKey) || !propertyName) {
        return;
    }
    this.report({
        node: node,
        level: LogType.ERROR,
        message: `Struct property '${propertyName}' has no type.`,
    });
}
