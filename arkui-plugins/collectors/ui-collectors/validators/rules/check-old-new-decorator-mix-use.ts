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
import { StructPropertyInfo, NormalClassPropertyInfo } from '../../records';
import { DecoratorNames, LogType, StructDecoratorNames } from '../../../../common/predefines';
import { createSuggestion, getPositionRangeFromNode } from '../../../../common/log-collector';
import { checkIsNormalClassPropertyFromInfo, checkIsStructPropertyFromInfo } from '../../utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkOldNewDecoratorMixUse = performanceLog(
    _checkOldNewDecoratorMixUse,
    getPerfName([0, 0, 0, 0, 0], 'checkOldNewDecoratorMixUse')
);

const oldV1Annotations: string[] = [
    DecoratorNames.STATE,
    DecoratorNames.PROP_REF,
    DecoratorNames.LINK,
    DecoratorNames.PROVIDE,
    DecoratorNames.CONSUME,
    DecoratorNames.WATCH,
    DecoratorNames.STORAGE_LINK,
    DecoratorNames.STORAGE_PROP_REF,
    DecoratorNames.LOCAL_STORAGE_LINK,
    DecoratorNames.OBJECT_LINK,
];

const newV2Annotations: string[] = [
    DecoratorNames.LOCAL,
    DecoratorNames.PARAM,
    DecoratorNames.ONCE,
    DecoratorNames.EVENT,
    DecoratorNames.MONITOR,
    DecoratorNames.PROVIDER,
    DecoratorNames.CONSUMER,
    DecoratorNames.COMPUTED,
];

const notAllowedInClass: string[] = [DecoratorNames.LOCAL, DecoratorNames.PARAM];

/**
 * 校验规则：用于检查新旧装饰器的使用情况
 * 注：`@Component`与`@ComponentV2`同时使用、或都不使用的情况下，报其他错误本规则不报错
 * 1. 旧装饰器只能用于`@Component`组件
 * 2. 新装饰器只能用于`@ComponentV2`组件
 *
 * 校验等级：error
 */
function _checkOldNewDecoratorMixUse(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo | NormalClassPropertyInfo>,
    classProperty: arkts.ClassProperty
): void {
    const metadata = this.context ?? {};
    if (checkIsStructPropertyFromInfo(metadata)) {
        checkOldNewDecoratorMixUseInStruct.bind(this)(classProperty);
    } else if (checkIsNormalClassPropertyFromInfo(metadata)) {
        checkOldNewDecoratorMixUseInClass.bind(this)(classProperty);
    }
}

function checkOldNewDecoratorMixUseInStruct(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    classProperty: arkts.ClassProperty
): void {
    const metadata = this.context ?? {};
    const fromComponent: boolean = !!metadata.structInfo?.annotationInfo?.hasComponent;
    const fromComponentV2: boolean = !!metadata.structInfo?.annotationInfo?.hasComponentV2;
    // 新装饰器只能用于`@ComponentV2`组件
    if (fromComponent && !fromComponentV2) {
        const componentAnnotations = metadata.structInfo?.annotations?.[StructDecoratorNames.COMPONENT]!;
        newV2Annotations.forEach((decoratorName) => {
            const annotation = metadata.annotations?.[decoratorName];
            if (!annotation) {
                return;
            }
            this.report({
                node: annotation,
                level: LogType.ERROR,
                message: `The '@${decoratorName}' annotation can only be used in a 'struct' decorated with '@ComponentV2'.`,
                suggestion: createSuggestion(
                    `${StructDecoratorNames.COMPONENT_V2}`,
                    ...getPositionRangeFromNode(componentAnnotations),
                    `Change @Component to @ComponentV2`
                ),
            });
        });
    }
    // 旧装饰器只能用于`@Component`组件
    if (fromComponentV2 && !fromComponent) {
        const componentV2Annotations = metadata.structInfo?.annotations?.[StructDecoratorNames.COMPONENT_V2]!;
        oldV1Annotations.forEach((decoratorName) => {
            const annotation = metadata.annotations?.[decoratorName];
            if (!annotation) {
                return;
            }
            this.report({
                node: annotation,
                level: LogType.ERROR,
                message: `The '@${decoratorName}' annotation can only be used in a 'struct' decorated with '@Component'.`,
                suggestion: createSuggestion(
                    `${StructDecoratorNames.COMPONENT}`,
                    ...getPositionRangeFromNode(componentV2Annotations),
                    `Change @ComponentV2 to @Component`
                ),
            });
        });
    }
}

function checkOldNewDecoratorMixUseInClass(
    this: BaseValidator<arkts.ClassProperty, NormalClassPropertyInfo>,
    classProperty: arkts.ClassProperty
): void {
    const metadata = this.context ?? {};
    notAllowedInClass.forEach((decoratorName) => {
        const annotation = metadata.ignoredAnnotations?.[decoratorName];
        if (!annotation) {
            return;
        }
        this.report({
            node: annotation,
            level: LogType.ERROR,
            message: `The '@${decoratorName}' annotation can only be used in a 'struct' decorated with '@ComponentV2'.`,
        });
    });
}
