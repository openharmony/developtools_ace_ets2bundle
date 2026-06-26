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
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkStructVariableInitialization = performanceLog(
    _checkStructVariableInitialization,
    getPerfName([0, 0, 0, 0, 0], 'checkStructVariableInitialization')
);

/**
 * 校验规则：用于验证装饰器修饰变量时需要遵循的本地初始化约束。
 * 1.`@Link`、和 `@ObjectLink` 修饰的变量不能在本地初始化。
 * 2.`@State`、`@StorageLink`、`@StoragePropRef`、`@LocalStorageLink` 和 `@Provide` 修饰的变量必须在本地初始化。
 * 3.`@State` 和 `@Provide` 与 `@Require` 配合使用时，允许不初始化。
 *
 * 校验等级：error
 */
function _checkStructVariableInitialization(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    classProperty: arkts.ClassProperty
): void {
    const metadata = this.context ?? {};
    if (!metadata.structInfo || !metadata.annotations || !metadata.annotationInfo) {
        return;
    }

    const hasValue = !!classProperty.value;
    const hasRequire = !!metadata.annotationInfo.hasRequire;

    const cannotInitDecorators = [DecoratorNames.LINK, DecoratorNames.OBJECT_LINK];
    for (const decoratorName of cannotInitDecorators) {
        const annotation = metadata.annotations[decoratorName];
        if (annotation && hasValue) {
            this.report({
                node: annotation,
                level: LogType.ERROR,
                message: `The '@${decoratorName}' property cannot be specified a default value.`,
            });
        }
    }

    const requireCanReleaseMandatoryDecorators = [DecoratorNames.STATE, DecoratorNames.PROVIDE];
    const mustInitializeDecorators = [
        DecoratorNames.STATE,
        DecoratorNames.STORAGE_LINK,
        DecoratorNames.STORAGE_PROP_REF,
        DecoratorNames.LOCAL_STORAGE_LINK,
        DecoratorNames.PROVIDE,
    ];
    for (const decoratorName of mustInitializeDecorators) {
        const annotation = metadata.annotations[decoratorName];
        if (!annotation) {
            continue;
        }
        if (hasRequire && requireCanReleaseMandatoryDecorators.includes(decoratorName)) {
            continue;
        }
        if (!hasValue) {
            this.report({
                node: annotation,
                level: LogType.ERROR,
                message: `The '@${decoratorName}' property must be specified a default value.`,
            });
        }
    }
}
