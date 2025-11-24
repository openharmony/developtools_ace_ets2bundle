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
import { getCurrentFilePath } from '../utils';
import { LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';
import { MetaDataCollector } from '../../../../common/metadata-collector';

export const checkMainPagesEntry = performanceLog(
    _checkMainPagesEntry,
    getPerfName([0, 0, 0, 0, 0], 'checkMainPagesEntry')
);

export function resetMainPagesEntry(this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>): void {
    Array.from(declaredStructMap.values()).forEach((structInfo) => {
        if (!structInfo.hasEntry) {
            this.report({
                node: structInfo.firstStruct,
                level: LogType.ERROR,
                message: `A page configured in 'main_pages.json or build-profile.json5' must have one and only one '@Entry' annotation.`,
            });
        }
    });
    declaredStructMap.clear();
}

interface MainPageStructInfo {
    hasEntry?: boolean;
    firstStruct: arkts.ClassDeclaration;
}

const declaredStructMap: Map<string, MainPageStructInfo> = new Map<string, MainPageStructInfo>();

/**
 * 校验规则：在`main pages`中配置的页面，必须有且只有一个`@Entry`装饰器。
 *
 * 校验等级：error
 */
function _checkMainPagesEntry(
    this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>,
    node: arkts.ClassDeclaration
): void {
    const metadata = this.context ?? {};
    const currentFilePath = getCurrentFilePath(node);
    const mainPages = MetaDataCollector.getInstance().mainPageNames;
    if (!currentFilePath || !mainPages || !mainPages.includes(currentFilePath)) {
        return;
    }
    const structInfo = declaredStructMap.get(currentFilePath);
    if (!!structInfo && !!structInfo.hasEntry) {
        return;
    }
    declaredStructMap.set(currentFilePath, {
        hasEntry: metadata.annotationInfo?.hasEntry,
        firstStruct: structInfo?.firstStruct ?? node,
    });
}
