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
import { createSuggestion, getPositionRangeFromAnnotation } from '../../../../common/log-collector';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkNoDuplicatePreview = performanceLog(
    _checkNoDuplicatePreview,
    getPerfName([0, 0, 0, 0, 0], 'checkNoDuplicatePreview')
);

export function resetNoDuplicatePreview(this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>): void {
    if (previewAnnotations.length > MAX_PREVIEW_DECORATOR_COUNT) {
        previewAnnotations.forEach((annotation) => {
            this.report({
                node: annotation,
                level: LogType.ERROR,
                message: `A page can contain at most 10 '@Preview' annotations.`,
                suggestion: createSuggestion(
                    ``,
                    ...getPositionRangeFromAnnotation(annotation),
                    `Remove the duplicate 'Preview' annotation`
                ),
            });
        });
    }
    previewAnnotations = [];
}

const MAX_PREVIEW_DECORATOR_COUNT = 10;

let previewAnnotations: arkts.AnnotationUsage[] = [];

/**
 * 校验规则：一个ArkTS文件最多可以包含10个`@Preview`装饰器。
 *
 * 校验等级：error
 */
function _checkNoDuplicatePreview(
    this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>,
    node: arkts.ClassDeclaration
): void {
    const metadata = this.context ?? {};
    if (!metadata.annotationInfo?.hasPreview) {
        return;
    }
    previewAnnotations.push(metadata.annotations?.Preview!);
}
