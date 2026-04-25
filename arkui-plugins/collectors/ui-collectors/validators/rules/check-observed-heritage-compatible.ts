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
import { NormalClassInfo } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { getAnnotationUsageByName } from '../utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkObservedHeritageCompatible = performanceLog(
    _checkObservedHeritageCompatible,
    getPerfName([0, 0, 0, 0, 0], 'checkObservedHeritageCompatible')
);

/**
 * 校验规则：用于验证类继承过程中的`@Observed`和`@ObservedV2`装饰器混用。
 * 1. 当前类是由`@ObservedV2`装饰的，它不能继承`@Observed`装饰的类。
 * 2. 当前类是由`@Observed`装饰的，它不能继承`@ObservedV2`装饰的类。
 *
 * 校验等级：error
 */
function _checkObservedHeritageCompatible(
    this: BaseValidator<arkts.ClassDeclaration, NormalClassInfo>,
    node: arkts.ClassDeclaration
): void {
    const metadata = this.context ?? {};
    const hasObserved = !!metadata.annotationInfo?.hasObserved;
    const hasObservedV2 = !!metadata.annotationInfo?.hasObservedV2;
    const hasObservedInSuper = hasTargetAnnotationInSuperClass(node, DecoratorNames.OBSERVED);
    const hasObservedV2InSuper = hasTargetAnnotationInSuperClass(node, DecoratorNames.OBSERVED_V2);
    if (hasObserved && hasObservedV2) {
        return;
    }
    if (hasObserved && hasObservedV2InSuper) {
        const annotation = metadata.annotations?.[DecoratorNames.OBSERVED]!;
        this.report({
            node: annotation,
            level: LogType.ERROR,
            message: `A class decorated by '@Observed' cannot inherit from a class decorated by '@ObservedV2'.`,
        });
    }
    if (hasObservedV2 && hasObservedInSuper) {
        const annotation = metadata.annotations?.[DecoratorNames.OBSERVED_V2]!;
        this.report({
            node: annotation,
            level: LogType.ERROR,
            message: `A class decorated by '@ObservedV2' cannot inherit from a class decorated by '@Observed'.`,
        });
    }
}

function hasTargetAnnotationInSuperClass(node: arkts.ClassDeclaration, annotationName: string): boolean {
    if (!node.definition || !node.definition.super) {
        return false;
    }
    if (arkts.isETSTypeReference(node.definition.super)) {
        if (!node.definition.super.part || !arkts.isETSTypeReferencePart(node.definition?.super.part)) {
            return false;
        }
        if (!node.definition.super.part.name || !arkts.isIdentifier(node.definition.super.part.name)) {
            return false;
        }
        const superClassDefinition = arkts.getPeerIdentifierDecl(node.definition.super.part.name.peer);
        if (!superClassDefinition || !arkts.isClassDefinition(superClassDefinition)) {
            return false;
        }
        return !!getAnnotationUsageByName(superClassDefinition.annotations, annotationName);
    }
    return false;
}
