/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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
import { getAnnotationUsage, PresetDecorators, getClassAnnotationUsage } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class MonitorDecoratorCheckRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            monitorUsedAlone:
                `The member property or method can not be decorated by multiple built-in annotations.`,
            monitorUsedInObservedV2Class:
                `The '@Monitor' can decorate only member method within a 'class' decorated with @ObservedV2.`,
            monitorUsedInComponentV2Struct:
                `The '@Monitor' annotation can only be used in a 'struct' decorated with '@ComponentV2'.`,
            monitorDecorateMethod:
                `@Monitor can only decorate method.`
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (!arkts.isClassDeclaration(node) && !arkts.isStructDeclaration(node)) {
            return;
        }

        const monitorDecorator = this.checkMonitorUsage(node);
        if (monitorDecorator && arkts.isClassDeclaration(node)) {
            this.checkMonitorInClass(node, monitorDecorator);
        }

        if (monitorDecorator && arkts.isStructDeclaration(node)) {
            this.checkMonitorInStruct(node, monitorDecorator);
        }
        this.checkDecorateMethod(node);
    }


    private checkMonitorInClass(
        node: arkts.ClassDeclaration,
        monitorDecorator: arkts.AnnotationUsage | undefined,
    ): void {
        if (!monitorDecorator) {
            return;
        }
        const isObservedV2 = this.checkDecorator(node, PresetDecorators.OBSERVED_V2);
        const observedV1Decorator = getClassAnnotationUsage(node, PresetDecorators.OBSERVED_V1);

        if (!isObservedV2 && !observedV1Decorator) {
            this.report({
                node: monitorDecorator,
                message: this.messages.monitorUsedInObservedV2Class,
                fix: () => {
                    return {
                        range: [node.startPosition, node.startPosition],
                        code: `@${PresetDecorators.OBSERVED_V2}\n`
                    };
                }
            });
            return;
        }
        if (!isObservedV2 && observedV1Decorator) {
            this.report({
                node: monitorDecorator,
                message: this.messages.monitorUsedInObservedV2Class,
                fix: () => {
                    let startPosition = observedV1Decorator.startPosition;
                    startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                    return {
                        range: [startPosition, observedV1Decorator.endPosition],
                        code: `@${PresetDecorators.OBSERVED_V2}`
                    };
                }
            });
        }
    }

    private checkMonitorInStruct(
        node: arkts.StructDeclaration,
        monitorDecorator: arkts.AnnotationUsage | undefined,
    ): void {
        if (!monitorDecorator) {
            return;
        }
        const componentV1Decorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);
        const isComponentV2 = this.checkDecorator(node, PresetDecorators.COMPONENT_V2);
        if (!isComponentV2 && !componentV1Decorator) {
            this.report({
                node: monitorDecorator,
                message: this.messages.monitorUsedInComponentV2Struct,
                fix: () => ({
                    range: [node.startPosition, node.startPosition],
                    code: `@${PresetDecorators.COMPONENT_V2}\n`
                })
            });
            return;
        }

        if (!isComponentV2 && componentV1Decorator) {
            this.report({
                node: monitorDecorator,
                message: this.messages.monitorUsedInComponentV2Struct,
                fix: () => {
                    let startPosition = componentV1Decorator.startPosition;
                    startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                    return {
                        range: [startPosition, componentV1Decorator.endPosition],
                        code: `@${PresetDecorators.COMPONENT_V2}`
                    };
                }
            });
        }
    }

    private checkDecorator(node: arkts.ClassDeclaration | arkts.StructDeclaration, decoratorName: string): boolean {
        return node.definition?.annotations?.some(
            annotation => annotation.expr && arkts.isIdentifier(annotation.expr) &&
                annotation.expr?.name === decoratorName
        ) ?? false;
    }

    private checkMonitorUsage(
        node: arkts.ClassDeclaration | arkts.StructDeclaration
    ): arkts.AnnotationUsage | undefined {
        let monitorUsage: arkts.AnnotationUsage | undefined;

        for (const body of node.definition?.body ?? []) {
            if (!arkts.isMethodDefinition(body)) {
                continue;
            }
            const currentMonitor = this.getLocalMonitorUsed(body);

            if (currentMonitor) {
                monitorUsage = currentMonitor;
                this.checkConflictingDecorators(body, currentMonitor);
                break;
            }
        }
        return monitorUsage;
    }

    private getLocalMonitorUsed(body: arkts.MethodDefinition): arkts.AnnotationUsage | undefined {
        const localMonitorUsed = body.scriptFunction.annotations?.find(
            annotation => annotation.expr && arkts.isIdentifier(annotation.expr) &&
                annotation.expr.name === PresetDecorators.MONITOR
        );
        return localMonitorUsed;
    }

    private checkConflictingDecorators(body: arkts.MethodDefinition, localMonitorUsed: arkts.AnnotationUsage): boolean {
        const conflictingDecorators = body.scriptFunction.annotations?.filter(
            annotation => annotation.expr && arkts.isIdentifier(annotation.expr) &&
                annotation.expr.name !== PresetDecorators.MONITOR
        );
        if (conflictingDecorators?.length > 0) {
            this.reportConflictingDecorators(localMonitorUsed, conflictingDecorators);
            return true;
        }
        return false;
    }

    private reportConflictingDecorators(localMonitorUsed: arkts.AstNode, conflictingDecorators: arkts.AnnotationUsage[]): void {
        this.report({
            node: localMonitorUsed,
            message: this.messages.monitorUsedAlone,
            fix: () => {
                const startPositions = conflictingDecorators.map(annotation =>
                    annotation.startPosition);
                const endPositions = conflictingDecorators.map(annotation => annotation.endPosition);
                let startPosition = startPositions[0];
                startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                const endPosition = endPositions[endPositions.length - 1];
                return {
                    range: [startPosition, endPosition],
                    code: ''
                };
            }
        });
    }

    private checkDecorateMethod(node: arkts.ClassDeclaration | arkts.StructDeclaration): void {
        // Check if @Monitor is used on a property (which is not allowed)
        node.definition?.body.forEach((body) => {
            if (!arkts.isClassProperty(body)) {
                return;
            }

            const monitorDecorator = body.annotations?.find(
                (annotation) =>
                    annotation.expr &&
                    arkts.isIdentifier(annotation.expr) &&
                    annotation.expr.name === PresetDecorators.MONITOR
            );

            if (monitorDecorator === undefined) {
                return;
            }
            this.report({
                node: monitorDecorator,
                message: this.messages.monitorDecorateMethod,
                fix: () => {
                    let startPosition = monitorDecorator.startPosition;
                    startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                    const endPosition = monitorDecorator.endPosition;
                    return {
                        range: [startPosition, endPosition],
                        code: '',
                    };
                },
            });
        });
    }
}

export default MonitorDecoratorCheckRule;