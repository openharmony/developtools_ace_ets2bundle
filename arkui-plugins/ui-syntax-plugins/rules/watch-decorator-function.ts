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
import { getIdentifierName, isPrivateClassProperty, PresetDecorators, getClassPropertyName, findDecorator } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';



class WatchDecoratorFunctionRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            invalidWatch: `'@watch' cannot be used with '{{parameterName}}'. Apply it only to parameters that correspond to existing methods.`,
            stringOnly: `'@Watch' cannot be used with '{{parameterName}}'. Apply it only to 'string' parameters.`,
            IllegalFunction: `The V1 decorator '{{decorateNameProxy}}' cannot be applied to a Function-type variable '{{propertyName}}'`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (!arkts.isStructDeclaration(node)) {
            return;
        }
        const methodNames = this.getMethodNames(node);
        const privateNames = this.getPrivateNames(node);
        this.validateWatch(node, methodNames, privateNames);
        node.definition.body.forEach(member => {
            if (arkts.isClassProperty(member)) {
                this.reportIllegalFunctionError(member);
            }
        });
    }

    private getExpressionValue(parameters: arkts.Expression, privateNames: string[]): string {
        const type = arkts.nodeType(parameters);
        if (type === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_NUMBER_LITERAL) {
            return parameters.dumpSrc(); // Try extracting the string representation with dumpSrc
        } else if (type === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_BOOLEAN_LITERAL) {
            return parameters.dumpSrc();
        } else if (type === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_NULL_LITERAL) {
            return 'null';
        } else if (type === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_UNDEFINED_LITERAL) {
            return 'undefined';
        } else if (arkts.isMemberExpression(parameters)) {
            if (arkts.isIdentifier(parameters.property)) {
                if (privateNames.includes(parameters.property.name)) {
                    return parameters.property.name;
                }
            }
        }
        return parameters.dumpSrc(); // By default, an empty string is returned
    }

    // Gets the names of all methods in the struct
    private getMethodNames(node: arkts.StructDeclaration): string[] {
        const methodNames: string[] = [];
        node.definition.body.forEach((member) => {
            if (arkts.isMethodDefinition(member) && arkts.isIdentifier(member.name)) {
                const methodName = getIdentifierName(member.name);
                if (methodName) {
                    methodNames.push(methodName);
                }
            }
        });
        return methodNames;
    }

    private getPrivateNames(node: arkts.StructDeclaration): string[] {
        const privateNames: string[] = [];
        node.definition.body.forEach((member) => {
            if (arkts.isClassProperty(member) && isPrivateClassProperty(member)) {
                const privateName = getClassPropertyName(member);
                if (privateName) {
                    privateNames.push(privateName);
                }
            }
        });
        return privateNames;
    }

    private validateWatch(
        node: arkts.StructDeclaration,
        methodNames: string[],
        privateNames: string[]
    ): void {
        node.definition.body.forEach(member => {
            if (!arkts.isClassProperty(member)) {
                return;
            }
            const watchDecorator = findDecorator(member, PresetDecorators.WATCH);
            // Determine whether it contains @watch decorators
            this.validateWatchDecorator(member, methodNames, privateNames, watchDecorator);
        });
    }

    private validateWatchDecorator(
        member: arkts.ClassProperty,
        methodNames: string[],
        privateNames: string[],
        watchDecorator: arkts.AnnotationUsage | undefined
    ): void {
        member.annotations.forEach((annotation) => {
            this.validateWatchProperty(annotation, member, methodNames, privateNames, watchDecorator);
        });
    }

    private validateWatchProperty(
        annotation: arkts.AnnotationUsage,
        member: arkts.ClassProperty,
        methodNames: string[],
        privateNames: string[],
        watchDecorator: arkts.AnnotationUsage | undefined
    ): void {
        if (
            !annotation.expr ||
            !arkts.isIdentifier(annotation.expr) ||
            annotation.expr.name !== PresetDecorators.WATCH
        ) {
            return;
        }
        annotation.properties.forEach((element) => {
            if (!arkts.isClassProperty(element)) {
                return;
            }
            if (!element.value) {
                return;
            }
            if (!arkts.isStringLiteral(element.value)) {
                if (!watchDecorator) {
                    return;
                }
                this.reportStringOnly(element.value, privateNames, watchDecorator);
                return;
            }
            const parameterName = element.value.str;
            if (watchDecorator && parameterName && !methodNames.includes(parameterName)) {
                this.reportInvalidWatch(member, parameterName, watchDecorator);
            }
        });
    }

    // Invalid @Watch decorator bugs are reported
    private reportInvalidWatch(
        member: arkts.ClassProperty,
        parameterName: string,
        watchDecorator: arkts.AnnotationUsage
    ): void {
        this.report({
            node: watchDecorator,
            message: this.messages.invalidWatch,
            data: { parameterName },
            fix: () => {
                const startPosition = member.endPosition;
                const endPosition = member.endPosition;
                return {
                    title: 'Add a watch function to the custom component',
                    range: [startPosition, endPosition],
                    code: `\n${parameterName}(){\n}`,
                };
            },
        });
    }

    private reportStringOnly(
        parameters: arkts.Expression | undefined,
        privateNames: string[],
        watchDecorator: arkts.AnnotationUsage
    ): void {
        if (!parameters) {
            return;
        }
        this.report({
            node: watchDecorator,
            message: this.messages.stringOnly,
            level: 'warn',
            data: { parameterName: this.getExpressionValue(parameters, privateNames) },
            fix: () => {
                const startPosition = parameters.startPosition;
                const endPosition = parameters.endPosition;
                return {
                    title: 'Remove the parameters',
                    range: [startPosition, endPosition],
                    code: ``,
                };
            },
        });
    }
    private hasDecoratorWithFunctionType(
        member: arkts.ClassProperty,
        decorators: string[]
    ): boolean {
        const hasTargetDecorator = member.annotations.some((annotation: arkts.AnnotationUsage) => {
            return (
                annotation.expr &&
                arkts.isIdentifier(annotation.expr) &&
                decorators.includes(annotation.expr.name)
            );
        });

        if (!hasTargetDecorator) {
            return false;
        }
        if (member.typeAnnotation) {
            if (arkts.isETSFunctionType(member.typeAnnotation) ||
                this.isFunctionTypeReference(member.typeAnnotation)) {
                return true;
            }
            if (arkts.isETSUnionType(member.typeAnnotation)) {
                return this.isUnionOfTypeOnlyFunction(member.typeAnnotation);
            }
        }
        return false;
    }
    private isFunctionTypeReference(typeNode: arkts.TypeNode): boolean {
        if (arkts.isETSTypeReference(typeNode)) {
            const ref = typeNode as arkts.ETSTypeReference;
            if (ref.part && arkts.isETSTypeReferencePart(ref.part)) {
                const part = ref.part as arkts.ETSTypeReferencePart;
                if (part.name && arkts.isIdentifier(part.name)) {
                    return part.name.name === 'Function';
                }
            }
        }
        return false;
    }

    private isUnionOfTypeOnlyFunction(unionType: arkts.ETSUnionType): boolean {
        const types = unionType.types;
        for (const type of types) {
            if (arkts.isETSFunctionType(type)) {
                return true;
            }
        }
        return false;
    }

    private reportIllegalFunctionError(member: arkts.ClassProperty): void {
        const decorators = [PresetDecorators.STATE, PresetDecorators.PROP_REF,
        PresetDecorators.PROVIDE, PresetDecorators.LINK, PresetDecorators.CONSUME,
        PresetDecorators.STORAGE_LINK, PresetDecorators.LOCAL_STORAGE_LINK,
        PresetDecorators.STORAGE_PROP_REF, PresetDecorators.LOCAL_STORAGE_PROP_REF];
        if (member.key && arkts.isIdentifier(member.key)) {
            const propertyName = member.key.name.toString();
            const decorateNameProxy = decorators.find(decoratorName => {
                return findDecorator(member, decoratorName);
            })
            if (this.hasDecoratorWithFunctionType(member, decorators) && decorateNameProxy) {
                this.report({
                    node: member,
                    message: this.messages.IllegalFunction,
                    data: {
                        decorateNameProxy: decorateNameProxy,
                        propertyName: propertyName,
                    },
                });
            };
        };
    }
}

export default WatchDecoratorFunctionRule;