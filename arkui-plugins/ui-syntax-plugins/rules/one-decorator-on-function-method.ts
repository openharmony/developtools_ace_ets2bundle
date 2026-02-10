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
import { getAnnotationName, PresetDecorators } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

const PARAM_THIS_NAME = '=t';
const UIDecorators: string[] = [
    ...Object.values(PresetDecorators)
];

class OneDecoratorOnFunctionMethodRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            invalidDecorator: `A function can only be decorated by the 'Builder'.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (!arkts.isFunctionDeclaration(node)) {
            return;
        }
        this.validateFunctionDecorator(node);
    }

    private validateFunctionDecorator(node: arkts.FunctionDeclaration): void {
        const annotations = node.annotations;
        // If there is no annotation, go straight back
        if (!annotations) {
            return;
        }
        // @AnimatableExtend decorators can only be used with functions with this parameter.
        const animatableExtendDecorator = this.findDecorator(annotations, PresetDecorators.ANIMATABLE_EXTEND);
        if (arkts.isScriptFunction(node.scriptFunction) && animatableExtendDecorator) {
            const member = node.scriptFunction;
            if (this.hasThisParameter(member)) {
                return;
            }
        }
        // Check that each annotation is in the list of allowed decorators
        this.validateAllowedDecorators(annotations);
    }

    private findDecorator(annotations: arkts.AnnotationUsage[], decorator: string): arkts.AnnotationUsage | undefined {
        return annotations?.find(annotation =>
            annotation.expr && arkts.isIdentifier(annotation.expr) &&
            annotation.expr.name === decorator
        );
    }

    private hasThisParameter(member: arkts.ScriptFunction): boolean {
        return member.params.some((param) => {
            return arkts.isEtsParameterExpression(param) &&
                arkts.isIdentifier(param.identifier) &&
                param.identifier.name === PARAM_THIS_NAME;
        });
    }

    private validateAllowedDecorators(
        annotations: arkts.AnnotationUsage[],
    ): void {
        const hasInvalidUIDecorator = annotations.some((annotation) => {
            const decoratorName = getAnnotationName(annotation);
            if (decoratorName === PresetDecorators.BUILDER) {
                return false;
            }
            return UIDecorators.includes(decoratorName);
        });

        if (!hasInvalidUIDecorator) {
            return;
        }

        const invalidDecorator = annotations.find(annotation => {
            const decoratorName = getAnnotationName(annotation);
            return decoratorName !== PresetDecorators.BUILDER && UIDecorators.includes(decoratorName);
        });

        if (invalidDecorator) {
            this.reportInvalidDecorators(annotations);
        }
    }

    private reportInvalidDecorators(annotations: arkts.AnnotationUsage[]): void {
        annotations.forEach((annotation) => {
            const decoratorName = getAnnotationName(annotation);
            if (!UIDecorators.includes(decoratorName)) {
                return;
            }

            if (decoratorName === PresetDecorators.BUILDER) {
                this.reportError(annotation);
                return;
            }
            this.reportErrorWithFix(annotation);
        });
    }

    private reportError(annotation: arkts.AnnotationUsage): void {
        this.report({
            node: annotation,
            message: this.messages.invalidDecorator
        });
    }

    private reportErrorWithFix(annotation: arkts.AnnotationUsage): void {
        this.report({
            node: annotation,
            message: this.messages.invalidDecorator,
            fix: () => {
                let startPosition = annotation.startPosition;
                startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                const endPosition = annotation.endPosition;
                return {
                    title: 'Remove the annotation',
                    range: [startPosition, endPosition],
                    code: ``
                };
            }
        });
    }
}

export default OneDecoratorOnFunctionMethodRule;