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
import { getAnnotationUsage, PresetDecorators, getClassAnnotationUsage, getClassPropertyName, getClassPropertyAnnotationNames, TypeFlags } from '../utils';
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
                `@Monitor can only decorate method.`,
            monitorTargetInvalid:
                `The Monitor decorator needs to monitor the state variables that exist.`
        };
    }

    public parsed(node: arkts.AstNode): void {
        this.initList(node);
        if (!arkts.isClassDeclaration(node) && !arkts.isStructDeclaration(node)) {
            return;
        }

        const monitorDecorator = this.checkMonitorUsage(node);
        if (monitorDecorator && arkts.isClassDeclaration(node)) {
            this.checkMonitorInClass(node, monitorDecorator);
            this.checkMonitorInObservedV2Trace(node);
        }

        if (monitorDecorator && arkts.isStructDeclaration(node)) {
            this.checkMonitorInStruct(node, monitorDecorator);
            this.checkMonitorInComponentV2(node);
        }
        this.checkDecorateMethod(node);
    }

    private collectNode: Map<string, arkts.AstNode> = new Map();

    private initList(node: arkts.AstNode): void {
        if (!arkts.isEtsScript(node) || node.isNamespace) {
            return;
        }
        node.statements.forEach((member) => {
            if (arkts.isClassDeclaration(member)) {
                if (member.definition && member.definition.ident?.name) {
                    this.collectNode.set(member.definition.ident.name, member)
                }
            }
            if (arkts.isTSInterfaceDeclaration(member) && member.id?.name) {
                this.collectNode.set(member.id.name, member)
            }

        });
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
                        title: 'Add @ObservedV2 annotation',
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
                    return {
                        title: 'Change @Observed to @ObservedV2',
                        range: [observedV1Decorator.startPosition, observedV1Decorator.endPosition],
                        code: `${PresetDecorators.OBSERVED_V2}`
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
                    title: 'Add @ComponentV2 annotation',
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
                    return {
                        title: 'Change @Component to @ComponentV2',
                        range: [componentV1Decorator.startPosition, componentV1Decorator.endPosition],
                        code: `${PresetDecorators.COMPONENT_V2}`
                    };
                }
            });
        }
    }

    private checkMonitorInObservedV2Trace(node: arkts.ClassDeclaration): void {
        const isObservedV2 = this.checkDecorator(node, PresetDecorators.OBSERVED_V2);
        if (!isObservedV2) {
            return;
        }
        const variableMap = this.collectVariables(node);
        node.definition?.body.forEach((body) => {
            if (!arkts.isMethodDefinition(body)) {
                return;
            }
            const monitorDecorator = this.getLocalMonitorUsed(body);
            const monitorPaths = this.getValueInMonitorAnnotation(monitorDecorator);
            if (!monitorDecorator || !monitorPaths) {
                return;
            }
            this.validateMonitorPathsInObservedV2Trace(monitorDecorator, monitorPaths, variableMap, node);
        })
    }

    private validateMonitorPathsInObservedV2Trace(
        monitorDecorator: arkts.AnnotationUsage,
        monitorPaths: string[],
        variableMap: Map<string, string[]>,
        node: arkts.ClassDeclaration
    ): void {
        monitorPaths.forEach(path => {
            const segments = path.split('.').filter(s => s.trim());
            if (segments.length === 0) {
                return;
            }
            const firstSegment = segments[0].replace(/\[\d+\]/g, '');
            const memberSegments = segments.slice(1).map(segment => segment.replace(/\[\d+\]/g, ''));
            if (!variableMap.has(firstSegment)) {
                this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
                return;
            }
            const decorators = variableMap.get(firstSegment) || [];
            const firstSegmentTypeName = this.firstSegmentTypeName(firstSegment, node);
            if (firstSegmentTypeName && memberSegments.length > 0) {
                const memberExist = this.memberSegmentsTypeName(firstSegmentTypeName, memberSegments);
                if (!memberExist) {
                    this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
                    return;
                }
            }
            if (!decorators.includes(PresetDecorators.TRACE)) {
                this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
                return;
            }
        });
    }

    private checkMonitorInComponentV2(node: arkts.StructDeclaration): void {
        const isComponentV2 = this.checkDecorator(node, PresetDecorators.COMPONENT_V2);
        if (!isComponentV2) {
            return;
        }
        const variableMap = this.collectVariables(node);
        const requiredDecorators = [
            PresetDecorators.LOCAL,
            PresetDecorators.PARAM,
            PresetDecorators.PROVIDER,
            PresetDecorators.CONSUMER,
            PresetDecorators.COMPUTED
        ];
        node.definition?.body.forEach((body) => {
            if (!arkts.isMethodDefinition(body)) {
                return;
            }
            const monitorDecorator = this.getLocalMonitorUsed(body);
            const monitorPaths = this.getValueInMonitorAnnotation(monitorDecorator);
            if (!monitorDecorator || !monitorPaths) {
                return;
            }
            this.validateMonitorPathsInComponentV2(monitorDecorator, monitorPaths, variableMap, requiredDecorators, node);
        })
    }

    private validateMonitorPathsInComponentV2(
        monitorDecorator: arkts.AnnotationUsage,
        monitorPaths: string[],
        variableMap: Map<string, string[]>,
        requiredDecorators: string[],
        node: arkts.StructDeclaration
    ): void {
        monitorPaths.forEach(path => {
            const segments = path.split('.').filter(s => s.trim());
            if (segments.length === 0) {
                return;
            }
            const firstSegment = segments[0].replace(/\[\d+\]/g, '');
            const memberSegments = segments.slice(1).map(segment => {
                return segment.replace(/\[\d+\]/g, '');
            });

            if (!variableMap.get(firstSegment)) {
                this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
                return;
            }
            const decorators = variableMap.get(firstSegment) || [];
            const hasRequiredDecorator = requiredDecorators.some(decorator => decorators.includes(decorator));
            const firstSegmentTypeName = this.firstSegmentTypeName(firstSegment, node);
            if (firstSegmentTypeName && memberSegments.length > 0) {
                const memberExist = this.memberSegmentsTypeName(firstSegmentTypeName, memberSegments);
                if (!memberExist) {
                    this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
                    return;
                }
            }
            if (!hasRequiredDecorator) {
                this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
                return;
            }
        });
    }

    private collectVariables(node: arkts.ClassDeclaration | arkts.StructDeclaration): Map<string, string[]> {
        const variableMap = new Map<string, string[]>();

        node.definition?.body.forEach(member => {
            this.processMemberForVariableCollection(member, variableMap);
        });

        return variableMap;
    }

    private processMemberForVariableCollection(
        member: arkts.AstNode,
        variableMap: Map<string, string[]>
    ): void {
        if (arkts.isClassProperty(member)) {
            this.processClassProperty(member, variableMap);
        } else if (arkts.isMethodDefinition(member)) {
            this.processMethodDefinition(member, variableMap);
        }
    }

    private processClassProperty(member: arkts.ClassProperty, variableMap: Map<string, string[]>): void {
        const variableName = getClassPropertyName(member);
        if (!variableName) {
            return;
        }
        const decorators = getClassPropertyAnnotationNames(member) || [];
        variableMap.set(variableName, decorators);
    }

    private processMethodDefinition(member: arkts.MethodDefinition, variableMap: Map<string, string[]>): void {
        if (!member.scriptFunction || !member.scriptFunction.id || !member.scriptFunction.annotations) {
            return;
        }

        const methodId = member.scriptFunction.id;
        if (!arkts.isIdentifier(methodId) || !methodId.name) {
            return;
        }

        const methodName = methodId.name;
        const methodDecorators: string[] = [];

        member.scriptFunction.annotations.forEach((e) => {
            if (e.expr && arkts.isIdentifier(e.expr) && e.expr.name) {
                methodDecorators.push(e.expr.name);
            }
        });

        variableMap.set(methodName, methodDecorators);
    }

    private getValueInMonitorAnnotation(node: arkts.AnnotationUsage | undefined): string[] | undefined {
        if (!node || !node.expr || !arkts.isIdentifier(node.expr) || node.expr.name !== PresetDecorators.MONITOR || !node.properties) {
            return undefined;
        }

        const firstProp = node.properties[0];
        if (!arkts.isClassProperty(firstProp) || !firstProp.value || !arkts.isArrayExpression(firstProp.value)) {
            return undefined;
        }

        const monitorValues = firstProp.value.elements
            .filter(arkts.isStringLiteral)
            .map(item => item.str);

        return monitorValues.length > 0 ? monitorValues : undefined;
    }

    private firstSegmentTypeName(variableName: string, node: arkts.StructDeclaration | arkts.ClassDeclaration): string | undefined {
        let variableType: string | undefined = undefined;
        if ((arkts.isStructDeclaration(node) || arkts.isClassDeclaration(node)) && node.definition?.body) {
            node.definition.body.forEach((e) => {
                const isClassProp = arkts.isClassProperty(e);
                const hasValidKey = isClassProp && e.key && arkts.isIdentifier(e.key) && e.key.name === variableName;
                const hasValidType = hasValidKey && e.typeAnnotation && arkts.isETSTypeReference(e.typeAnnotation);
                const partNode = hasValidType ? e.typeAnnotation.part?.name : undefined;

                if (partNode && arkts.isIdentifier(partNode)) {
                    variableType = partNode.name;
                }
            });
        }
        return variableType;
    }

    private getPropTypeName(node: arkts.AstNode, element: string): string | undefined {
        let targetProp: arkts.ClassProperty | undefined = undefined;

        if (arkts.isClassDeclaration(node) && node.definition?.body) {
            targetProp = node.definition.body.find((e: arkts.AstNode) => {
                if (arkts.isClassProperty(e)) {
                    const propName = e.key && arkts.isIdentifier(e.key) ? e.key.name : undefined;
                    return propName === element;
                }
                return false;
            }) as arkts.ClassProperty | undefined;
        } else if (arkts.isTSInterfaceDeclaration(node) && node.body && arkts.isTSInterfaceBody(node.body) && node.body.body) {
            targetProp = node.body.body.find((e: arkts.AstNode) => {
                if (arkts.isClassProperty(e)) {
                    const propName = e.key && arkts.isIdentifier(e.key) ? e.key.name : undefined;
                    return propName === element;
                }
                return false;
            }) as arkts.ClassProperty | undefined;
        }

        if (!targetProp) {
            return undefined;
        }
        if (!arkts.isClassProperty(targetProp) || !targetProp.typeAnnotation) {
            return undefined;
        }
        if (arkts.isETSTypeReference(targetProp.typeAnnotation)) {
            const partName = targetProp.typeAnnotation.part?.name;
            return partName && arkts.isIdentifier(partName) ? partName.name : undefined;
        }

        return undefined;
    }

    private memberSegmentsTypeName(father: string, variableArray: string[]): string | undefined {
        if (father.toLowerCase() === TypeFlags.Array) {
            return father;
        }
        if (!father || !variableArray?.length) {
            return undefined;
        }

        let currentFather = father;

        for (const element of variableArray) {
            const node = this.collectNode.get(currentFather);
            if (!node) {
                return undefined;
            }
            const newTypeName = this.getPropTypeName(node, element);

            if (!newTypeName) {
                return undefined;
            }

            currentFather = newTypeName;
            if (currentFather.toLowerCase() === TypeFlags.Array) {
                return currentFather
            }
        }

        return currentFather;
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
                    title: 'Remove the annotation',
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
                        title: 'Remove the @Monitor annotation',
                        range: [startPosition, endPosition],
                        code: '',
                    };
                },
            });
        });
    }
}

export default MonitorDecoratorCheckRule;