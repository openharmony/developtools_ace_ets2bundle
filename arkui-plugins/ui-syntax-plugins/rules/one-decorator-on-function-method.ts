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

const allowedDecorators = PresetDecorators.BUILDER;
const PARAM_THIS_NAME = '=t';
const DECORATOR_LIMIT = 1;

class OneDecoratorOnFunctionMethodRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            invalidDecorator: `A function can only be decorated by the 'Builder'.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        // If the node is not an ETS script, it is returned directly
        if (!arkts.isETSModule(node)) {
            return;
        }
        this.validateFunctionDecorator(node);
    }

    private validateFunctionDecorator(node: arkts.ETSModule): void {
        node.statements.forEach((statement) => {
            // If the node is not a function declaration, it is returned
            if (!arkts.isFunctionDeclaration(statement)) {
                return;
            }
            const annotations = statement.annotations;
            // If there is no annotation, go straight back
            if (!annotations) {
                return;
            }
            // @AnimatableExtend decorators can only be used with functions with this parameter.
            const animatableExtendDecorator = this.findDecorator(annotations, PresetDecorators.ANIMATABLE_EXTEND);
            if (arkts.isScriptFunction(statement.function!) && animatableExtendDecorator) {
                const member = statement.function!;
                if (this.hasThisParameter(member)) {
                    return;
                }
            }
            // Check that each annotation is in the list of allowed decorators
            this.validateAllowedDecorators(annotations, this.otherDecoratorFilter(annotations));
        });
    }

    private findDecorator(annotations: readonly arkts.AnnotationUsage[], decorator: string): arkts.AnnotationUsage | undefined {
        return annotations?.find(annotation =>
            annotation.expr && arkts.isIdentifier(annotation.expr) &&
            annotation.expr.name === decorator
        );
    }

    private otherDecoratorFilter(annotations: readonly arkts.AnnotationUsage[]): arkts.AnnotationUsage | undefined {
        return annotations?.find(annotation =>
            annotation.expr && arkts.isIdentifier(annotation.expr) &&
            annotation.expr.name !== PresetDecorators.BUILDER
        );
    }

    private hasThisParameter(member: arkts.ScriptFunction): boolean {
        return member.params.some((param) => {
            return arkts.isETSParameterExpression(param) &&
                arkts.isIdentifier(param.ident) &&
                param.ident.name === PARAM_THIS_NAME;
        });
    }

    private validateAllowedDecorators(
        annotations: readonly arkts.AnnotationUsage[],
        otherDecorator: arkts.AnnotationUsage | undefined,
    ): void {
        annotations.forEach((annotation) => {
            const decoratorName = getAnnotationName(annotation);
            // rule1: misuse of decorator, only '@Builder'  decorator allowed on global functions
            if (allowedDecorators !== decoratorName ||
                (allowedDecorators === decoratorName && decoratorName.length > DECORATOR_LIMIT)) {
                this.reportInvalidDecorator(annotation, otherDecorator);
            }
        });
    }

    private reportInvalidDecorator(
        annotation: arkts.AnnotationUsage,
        otherDecorator: arkts.AnnotationUsage | undefined,
    ): void {
        if (!otherDecorator) {
            return;
        }
        this.report({
            node: annotation,
            message: this.messages.invalidDecorator,
            fix: () => {
                let startPosition = otherDecorator.startPosition;
                startPosition = arkts.createSourcePosition(startPosition.getIndex() - 1, startPosition.getLine());
                const endPosition = otherDecorator.endPosition;
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