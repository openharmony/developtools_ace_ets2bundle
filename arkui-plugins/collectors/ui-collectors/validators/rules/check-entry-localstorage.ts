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
import { EntryParamNames, LogType, StructDecoratorNames } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkEntryLocalStorage = performanceLog(
    _checkEntryLocalStorage,
    getPerfName([0, 0, 0, 0, 0], 'checkEntryLocalStorage')
);

/**
 * 校验规则：`struct`结构体中使用了`@LocalStorageLink`来绑定属性，需要在`@Entry`装饰器中传入storage参数
 *
 * 校验等级：warn
 */
function _checkEntryLocalStorage(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    classProperty: arkts.ClassProperty
): void {
    const metadata = this.context ?? {};
    if (!metadata.annotationInfo?.hasLocalStorageLink || !metadata.structInfo?.annotationInfo?.hasEntry) {
        return;
    }
    const entryAnnotation = metadata.structInfo?.annotations?.[StructDecoratorNames.ENTRY]!;
    // `struct`结构体中使用了`@LocalStorageLink`来绑定属性，需要在`@Entry`装饰器中传入storage参数
    if (!findStorageParamFromEntryAnnotation(entryAnnotation)) {
        this.report({
            node: entryAnnotation,
            level: LogType.WARN,
            message: `'@Entry' should have a parameter, like '@Entry ({ storage: "__get_local_storage__" })'.`,
        });
    }
}

function findStorageParamFromEntryAnnotation(node: arkts.AnnotationUsage): boolean {
    return node.properties.some((prop) => {
        return (
            arkts.isClassProperty(prop) &&
            prop.key &&
            arkts.isIdentifier(prop.key) &&
            prop.key.name === EntryParamNames.ENTRY_STORAGE &&
            prop.value &&
            arkts.isStringLiteral(prop.value) &&
            prop.value.str.length > 0
        );
    });
}
