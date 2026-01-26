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
import {
    PresetDecorators,
    getAnnotationUsage,
    findDecorator,
    getClassDeclarationAnnotation,
    getClassAnnotationUsage,
    addImportFixes
} from '../utils';
import { AbstractUISyntaxRule, FixSuggestion } from './ui-syntax-rule';

class ObservedV2TraceUsageValidationRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            observedV2DecoratorError: `The '@ObservedV2' annotation can only be used in 'class'.`,
            traceDecoratorError: `The '@Trace' annotation can only be used in 'class'.`,
            traceMemberVariableError: `The '@Trace' annotation can only decorate member variables within a 'class' decorated with '@ObservedV2'.`,
            //The repair logic is different, if there is v1, update to v2
            traceMustUsedWithObservedV2: `The '@Trace' annotation can only be used within a 'class' decorated with 'ObservedV2'.`,
            traceMustUsedWithObservedV2Update: `The '@Trace' annotation can only be used within a 'class' decorated with 'ObservedV2'.`,
            observedV2MissingTraceError: `A 'class' decorated with '@ObservedV2' must contain at least one property decorated with '@Trace'.`
        };
    }

    public parsed(node: arkts.AstNode): void {
        this.validateTraceDecoratorUsage(node);
    }

    private getObservedDecorator(node: arkts.ClassDeclaration): arkts.AnnotationUsage | undefined {
        if (!node.definition) {
            return undefined;
        }
        return getClassDeclarationAnnotation(node, PresetDecorators.OBSERVED_V1);
    }

    private reportObservedV2DecoratorError(observedV2Decorator: arkts.AnnotationUsage)
        : void {
        this.report({
            node: observedV2Decorator,
            message: this.messages.observedV2DecoratorError,
            fix: (observedV2Decorator) => {
                let startPosition = observedV2Decorator.startPosition;
                startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                let endPosition = observedV2Decorator.endPosition;
                return {
                    title: 'Remove the @ObservedV2 annotation',
                    range: [startPosition, endPosition],
                    code: '',
                };
            },
        });
    }

    private reportTraceMemberVariableError(traceDecorator: arkts.AnnotationUsage)
        : void {
        this.report({
            node: traceDecorator,
            message: this.messages.traceMemberVariableError,
            fix: (traceDecorator) => {
                let startPosition = traceDecorator.startPosition;
                startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                let endPosition = traceDecorator.endPosition;
                return {
                    title: 'Remove the @Trace annotation',
                    range: [startPosition, endPosition],
                    code: '',
                };
            },
        });
    }

    private tracePropertyRule(
        currentNode: arkts.AstNode,
        traceDecorator: arkts.AnnotationUsage): void {
        if (arkts.isStructDeclaration(currentNode)) {
            this.reportTraceDecoratorError(traceDecorator);
        } else if (arkts.isClassDeclaration(currentNode) && currentNode.definition) {
            const observedDecorator = this.getObservedDecorator(currentNode);
            const observedV2 = currentNode.definition.annotations.some(annotation =>
                annotation.expr &&
                arkts.isIdentifier(annotation.expr) &&
                annotation.expr.name === PresetDecorators.OBSERVED_V2
            );
            if (!observedV2 && !observedDecorator) {
                this.reportTraceMustUsedWithObservedV2(traceDecorator, currentNode);
            } else if (!observedV2 && observedDecorator) {
                this.reportTraceMustUsedWithObservedV2Update(traceDecorator, observedDecorator);
            }
        }
    }

    private reportTraceDecoratorError(traceDecorator: arkts.AnnotationUsage)
        : void {
        this.report({
            node: traceDecorator,
            message: this.messages.traceDecoratorError,
            fix: (traceDecorator) => {
                let startPosition = traceDecorator.startPosition;
                startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                let endPosition = traceDecorator.endPosition;
                return {
                    title: 'Remove the @Trace annotation',
                    range: [startPosition, endPosition],
                    code: '',
                };
            },
        });
    }

    private reportTraceMustUsedWithObservedV2(
        traceDecorator: arkts.AnnotationUsage,
        currentNode: arkts.ClassDeclaration
    ): void {
        const fixes: FixSuggestion[] = [];
        const fixTitle = 'Add @ObservedV2 annotation';

        fixes.push({
            title: fixTitle,
            range: [currentNode.startPosition, currentNode.startPosition],
            code: `@${PresetDecorators.OBSERVED_V2}\n`,
        });

        addImportFixes(currentNode, fixes, this.context, [PresetDecorators.OBSERVED_V2], fixTitle);

        this.report({
            node: traceDecorator,
            message: this.messages.traceMustUsedWithObservedV2,
            fix: () => fixes,
        });
    }

    private reportTraceMustUsedWithObservedV2Update(
        traceDecorator: arkts.AnnotationUsage,
        observedDecorator: arkts.AnnotationUsage
    ): void {
        const fixes: FixSuggestion[] = [];
        const fixTitle = 'Change @Observed to @ObservedV2';

        fixes.push({
            title: fixTitle,
            range: [observedDecorator.startPosition, observedDecorator.endPosition],
            code: `${PresetDecorators.OBSERVED_V2}`,
        });

        addImportFixes(observedDecorator, fixes, this.context, [PresetDecorators.OBSERVED_V2], fixTitle);

        this.report({
            node: traceDecorator,
            message: this.messages.traceMustUsedWithObservedV2Update,
            fix: () => fixes,
        });
    }

    private isInClassDeclaration(node: arkts.AstNode): boolean {
        while (!arkts.isClassDeclaration(node)) {
            if (!node.parent) {
                return false;
            }
            node = node.parent;
        }
        return true;
    }

    private checkAndReportObservedV2Decorator(
        node: arkts.FunctionDeclaration | arkts.VariableDeclaration | arkts.ScriptFunction |
            arkts.TSInterfaceDeclaration | arkts.TSTypeAliasDeclaration | arkts.ClassProperty): void {
        const observedV2Decorator = findDecorator(node, PresetDecorators.OBSERVED_V2);
        if (observedV2Decorator) {
            this.reportObservedV2DecoratorError(observedV2Decorator);
        }
    }

    private validateTraceDecoratorUsage(node: arkts.AstNode): void {
        let currentNode = node;
        if (arkts.isClassDeclaration(node)) {
            this.checkObservedV2HasTraceProperty(node);
        }
        if (arkts.isStructDeclaration(node)) {
            // Check whether the current custom component is decorated by the @ObservedV2 decorator
            const observedV2Decorator = getAnnotationUsage(node, PresetDecorators.OBSERVED_V2);
            const traceDecorator = getAnnotationUsage(node, PresetDecorators.TRACE);
            if (observedV2Decorator) {
                this.reportObservedV2DecoratorError(observedV2Decorator);
            }
            if (traceDecorator) {
                this.reportTraceDecoratorError(traceDecorator);
            }
        } else if (
            arkts.isFunctionDeclaration(node) ||
            arkts.isVariableDeclaration(node) ||
            arkts.isTSInterfaceDeclaration(node) ||
            arkts.isTSTypeAliasDeclaration(node)
        ) {
            this.checkAndReportObservedV2Decorator(node);
            const traceDecorator = findDecorator(node, PresetDecorators.TRACE);
            if (traceDecorator) {
                this.reportTraceDecoratorError(traceDecorator);
            }
        } else if (arkts.isClassProperty(node)) {
            this.checkTraceDecoratorUsageInClassProperty(node, currentNode);
            this.checkAndReportObservedV2Decorator(node);
        }
        if (arkts.isMethodDefinition(node) && this.isInClassDeclaration(currentNode)) {
            // Check that @Trace is in the correct location
            const traceDecorator = findDecorator(node.scriptFunction, PresetDecorators.TRACE);
            if (traceDecorator) {
                this.reportTraceMemberVariableError(traceDecorator);
            }
        } else if (arkts.isMethodDefinition(node) && !this.isInClassDeclaration(currentNode)) {
            const traceDecorator = findDecorator(node.scriptFunction, PresetDecorators.TRACE);
            if (traceDecorator) {
                this.reportTraceDecoratorError(traceDecorator);
            }
        }
    }

    private checkTraceDecoratorUsageInClassProperty(
        node: arkts.ClassProperty,
        currentNode: arkts.AstNode,): void {
        const traceDecorator = findDecorator(node, PresetDecorators.TRACE);
        if (traceDecorator) {
            // Iterate up the parent node to check whether it is a class or a custom component
            while (!arkts.isStructDeclaration(currentNode) && !arkts.isClassDeclaration(currentNode)) {
                if (!currentNode.parent) {
                    return;
                }
                currentNode = currentNode.parent;
            }
            // The '@Trace' decorator can only be used in 'class'
            this.tracePropertyRule(currentNode, traceDecorator);
        }
    }

    private checkObservedV2HasTraceProperty(classNode: arkts.ClassDeclaration): void {
        if (!classNode.definition) {
            return;
        }
        if (!getClassAnnotationUsage(classNode, PresetDecorators.OBSERVED_V2)){
            return;
        }
        const classDefinition = classNode.definition;
        const hasTraceProperty = classDefinition.body.some(member => {
            if (arkts.isClassProperty(member)) {
                return findDecorator(member, PresetDecorators.TRACE) !== undefined;
            }
            return false;
        });
        if (!hasTraceProperty) {
            this.report({
                node: classNode,
                message: this.messages.observedV2MissingTraceError
            });
        }
    }
};

export default ObservedV2TraceUsageValidationRule;
