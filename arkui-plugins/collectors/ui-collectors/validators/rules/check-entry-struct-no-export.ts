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

export const checkEntryStructNoExport = performanceLog(
    _checkEntryStructNoExport,
    getPerfName([0, 0, 0, 0, 0], 'checkEntryStructNoExport')
);

function _checkEntryStructNoExport(
    this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>,
    node: arkts.ClassDeclaration
): void {
    const metadata = this.context ?? {};
    const entryDecoratorUsage = metadata.annotations?.Entry;
    if (!entryDecoratorUsage) {
        return;
    }

    const isExport = node.isExport;
    const isDefaultExport = node.isDefaultExport;
    if (isExport || isDefaultExport) {
        this.report({
            node: entryDecoratorUsage,
            level: LogType.WARN,
            message: `It's not a recommended way to export struct with '@Entry' annotation, which may cause ACE Engine error in component preview mode.`,
        });
    }
}
