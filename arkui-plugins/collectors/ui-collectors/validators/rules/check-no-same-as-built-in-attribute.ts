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
import { CustomComponentInfo } from '../../records';
import { LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';
import { MetaDataCollector } from '../../../../common/metadata-collector';

export const checkNoSameAsBuiltInAttribute = performanceLog(
    _checkNoSameAsBuiltInAttribute,
    getPerfName([0, 0, 0, 0, 0], 'checkNoSameAsBuiltInAttribute')
);

/**
 * 校验规则：用于验证当前自定义的Struct名称是否与内置属性名称相同。
 * 1. 自定义组件Struct的名称不能与内置属性的名称相同。
 *
 * 校验等级：error
 */
function _checkNoSameAsBuiltInAttribute(
    this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>,
    struct: arkts.ClassDeclaration
): void {
    const metadata = this.context ?? {};
    const componentsInfo = MetaDataCollector.getInstance().componentsInfo;
    if (!componentsInfo || !metadata.name || !struct.definition?.ident) {
        return;
    }
    const structName = metadata.name;
    // 自定义组件Struct的名称不能与内置属性的名称相同
    if (componentsInfo.builtInAttributes.includes(structName)) {
        this.report({
            node: struct.definition.ident,
            level: LogType.ERROR,
            message: `The struct '${structName}' cannot have the same name as the built-in attribute '${structName}'.`,
        });
    }
}
