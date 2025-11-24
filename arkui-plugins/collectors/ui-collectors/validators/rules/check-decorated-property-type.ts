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
import { isDeclFromArkUI } from '../../utils';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';
import { expectNameInTypeReference } from '../../../../common/arkts-utils';

export const checkDecoratedPropertyType = performanceLog(
    _checkDecoratedPropertyType,
    getPerfName([0, 0, 0, 0, 0], 'checkDecoratedPropertyType')
);

const forbiddenUseStateTypeForDecorators: string[] = [
    DecoratorNames.STATE,
    DecoratorNames.PROP_REF,
    DecoratorNames.LINK,
    DecoratorNames.PROVIDE,
    DecoratorNames.CONSUME,
    DecoratorNames.OBJECT_LINK,
    DecoratorNames.BUILDER_PARAM,
    DecoratorNames.STORAGE_PROP_REF,
    DecoratorNames.STORAGE_LINK,
    DecoratorNames.LOCAL_STORAGE_LINK,
];

const forbiddenUseStateType: string[] = [
    'Scroller',
    'SwiperScroller',
    'VideoController',
    'WebController',
    'CustomDialogController',
    'SwiperController',
    'TabsController',
    'CalendarController',
    'AbilityController',
    'XComponentController',
    'CanvasRenderingContext2D',
    'CanvasGradient',
    'ImageBitmap',
    'ImageData',
    'Path2D',
    'RenderingContextSettings',
    'OffscreenCanvasRenderingContext2D',
    'PatternLockController',
    'TextAreaController',
    'TextInputController',
    'TextTimerController',
    'SearchController',
    'RichEditorController',
];

/**
 * 校验规则：用于检查装饰器与属性类型的组合是否有效
 * 1. forbiddenUseStateTypeForDecorators中的装饰器不允许与forbiddenUseStateType中的属性类型组合使用
 *
 * 校验等级：error
 */
function _checkDecoratedPropertyType(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    classProperty: arkts.ClassProperty
): void {
    const metadata = this.context ?? {};
    if (!metadata.structInfo) {
        return;
    }
    const forbiddenUseAnnotation = forbiddenUseStateTypeForDecorators.find((annotationName) => {
        return !!metadata.annotations?.[annotationName];
    });
    if (!forbiddenUseAnnotation) {
        return;
    }
    const forbiddenUseType = findForbiddenDeclNameFromType(classProperty.typeAnnotation);
    if (!forbiddenUseType) {
        return;
    }
    // forbiddenUseStateTypeForDecorators中的装饰器不允许与forbiddenUseStateType中的属性类型组合使用
    this.report({
        node: classProperty,
        level: LogType.ERROR,
        message: `The '@${forbiddenUseAnnotation}' property '${metadata.name}' cannot be a '${forbiddenUseType}' object.`,
    });
}

function findForbiddenDeclNameFromType(node: arkts.TypeNode | undefined): string | undefined {
    if (!node) {
        return undefined;
    }
    if (arkts.isETSUnionType(node)) {
        for (const type of node.types) {
            const targetName = findForbiddenDeclNameFromType(type);
            if (!targetName) {
                return targetName;
            }
        }
        return undefined;
    }
    if (arkts.isETSTypeReference(node)) {
        const nameNode = expectNameInTypeReference(node);
        if (!nameNode) {
            return undefined;
        }
        const decl = arkts.getPeerIdentifierDecl(nameNode.peer);
        if (!decl || !isDeclFromArkUI(decl)) {
            return undefined;
        }
        let name: string | undefined;
        if (arkts.isClassDefinition(decl)) {
            name = decl.ident?.name;
        } else if (arkts.isTSInterfaceDeclaration(decl)) {
            name = decl.id?.name;
        }
        if (!name) {
            return undefined;
        }
        return forbiddenUseStateType.find((n) => n === name);
    }
    return undefined;
}
