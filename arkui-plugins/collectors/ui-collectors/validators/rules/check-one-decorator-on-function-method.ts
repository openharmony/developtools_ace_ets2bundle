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
import { FunctionInfo } from '../../records';
import { DecoratorNames, LogType, StructDecoratorNames } from '../../../../common/predefines';
import { createSuggestion, getPositionRangeFromAnnotation } from '../../../../common/log-collector';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkOneDecoratorOnFunctionMethod = performanceLog(
    _checkOneDecoratorOnFunctionMethod,
    getPerfName([0, 0, 0, 0, 0], 'checkOneDecoratorOnFunctionMethod')
);

const PARAM_THIS_NAME = '=t';

const REMOVE_ANNOTATION = `Remove the annotation`;

const UI_DECORATORS: Set<string> = new Set<string>([
    ...Object.values(DecoratorNames),
    ...Object.values(StructDecoratorNames),
]);

function _checkOneDecoratorOnFunctionMethod(
    this: BaseValidator<arkts.MethodDefinition, FunctionInfo>,
    node: arkts.MethodDefinition
): void {
    const metadata = this.context ?? {};
    const annotations = node.function?.annotations;
    if (!annotations || annotations.length === 0) {
        return;
    }
    if (metadata.annotationInfo?.hasAnimatableExtend && hasThisParameter(node.function!)) {
        return;
    }
    const hasInvalidUIDecorator = annotations.some((annotation) => {
        const decoratorName = getAnnotationName(annotation);
        if (decoratorName === DecoratorNames.BUILDER) {
            return false;
        }
        return UI_DECORATORS.has(decoratorName);
    });
    if (!hasInvalidUIDecorator) {
        return;
    }
    reportInvalidDecorators.bind(this)(annotations);
}

function getAnnotationName(annotation: arkts.AnnotationUsage): string {
    if (annotation.expr && arkts.isIdentifier(annotation.expr)) {
        return annotation.expr.name;
    }
    return '';
}

function reportInvalidDecorators(
    this: BaseValidator<arkts.MethodDefinition, FunctionInfo>,
    annotations: readonly arkts.AnnotationUsage[]
): void {
    for (const annotation of annotations) {
        const decoratorName = getAnnotationName(annotation);
        if (!UI_DECORATORS.has(decoratorName)) {
            continue;
        }
        if (decoratorName === DecoratorNames.BUILDER) {
            this.report({
                node: annotation,
                level: LogType.ERROR,
                message: `A function can only be decorated by the 'Builder'.`,
            });
        } else {
            this.report({
                node: annotation,
                level: LogType.ERROR,
                message: `A function can only be decorated by the 'Builder'.`,
                suggestions: [createSuggestion('', ...getPositionRangeFromAnnotation(annotation), REMOVE_ANNOTATION)],
            });
        }
    }
}

function hasThisParameter(member: arkts.ScriptFunction): boolean {
    return member.params.some((param) => {
        return (
            arkts.isETSParameterExpression(param) &&
            arkts.isIdentifier(param.ident) &&
            param.ident!.name === PARAM_THIS_NAME
        );
    });
}
