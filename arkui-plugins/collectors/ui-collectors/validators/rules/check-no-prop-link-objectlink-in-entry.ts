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
import { createSuggestion, getPositionRangeFromAnnotation } from '../../../../common/log-collector';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkNoPropLinkObjectlinkInEntry = performanceLog(
    _checkNoPropLinkObjectlinkInEntry,
    getPerfName([0, 0, 0, 0, 0], 'checkNoPropLinkObjectlinkInEntry')
);

const invalidDecorators = [DecoratorNames.PROP_REF, DecoratorNames.LINK, DecoratorNames.OBJECT_LINK];

/**
 * 校验规则：用于检验`@Entry` 组件属性的装饰器，防止某些特定的装饰器在入口组件中使用。
 * 1. `@PropRef`、`@Link`和`@ObjectLink`装饰器不能在`@Entry`中使用
 *
 * 校验等级：warn
 */
function _checkNoPropLinkObjectlinkInEntry(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    node: arkts.ClassProperty
): void {
    const metadata = this.context ?? {};
    if (!metadata.structInfo || !metadata.structInfo.annotationInfo?.hasEntry) {
        return;
    }
    // `@PropRef`、`@Link`和`@ObjectLink`装饰器不能在`@Entry`中使用
    invalidDecorators.forEach((decoratorName) => {
        const invalidAnnotationNode = metadata.annotations?.[decoratorName];
        if (!invalidAnnotationNode) {
            return;
        }
        const componentName = metadata.structInfo?.name;
        const propertyName = metadata.name;
        this.report({
            node: invalidAnnotationNode,
            level: LogType.WARN,
            message: `The '@Entry' component '${componentName}' cannot have the '@${decoratorName}' property '${propertyName}'.`,
            suggestion: createSuggestion(
                ``,
                ...getPositionRangeFromAnnotation(invalidAnnotationNode),
                `Remove the annotation`
            ),
        });
    });
}
