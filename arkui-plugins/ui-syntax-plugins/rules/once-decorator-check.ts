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
import { getAnnotationUsage, getClassPropertyAnnotationNames, PresetDecorators, findDecorator } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class OnceDecoratorCheckRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            invalidUsage: `The '@Once' annotation can only be used in a 'struct' decorated with '@ComponentV2'.`,
            invalidMemberDecorate: `'@Once' can only decorate member property.`,
            invalidDecorator: `When a variable decorated with '@Once', it must also be decorated with '@Param'.`,
            invalidNOtInStruct: `'@Once' annotation can only be used with 'struct'.`
        };
    }

    public parsed(node: arkts.AstNode): void {
        let onceDecorator: arkts.AnnotationUsage | undefined;

        this.validateOnlyInStruct(node);
        this.validateOnlyOnProperty(node);

        if (arkts.isStructDeclaration(node)) {
            // Check if the struct is decorated with @ComponentV2
            const componentV2DecoratorUsage = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
            const componentDecoratorUsage = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);
            this.validateDecorator(node, onceDecorator, componentV2DecoratorUsage, componentDecoratorUsage);
        }
    }

    private validateOnlyInStruct(node: arkts.AstNode): void {
        if (arkts.isClassDeclaration(node)) {
            node.definition?.body.forEach(member => {
                if (arkts.isClassProperty(member)) {
                    this.validateOnceDecoratorUsage(member, this.messages.invalidNOtInStruct);

                }
                if (arkts.isMethodDefinition(member)) {
                    this.validateOnceDecoratorUsage(member.scriptFunction, this.messages.invalidNOtInStruct);
                }
            });
            return;
        }
        // function/ variable/ interface/ type alias declaration
        if (arkts.isFunctionDeclaration(node) ||
            arkts.isVariableDeclaration(node) ||
            arkts.isTSInterfaceDeclaration(node) ||
            arkts.isTSTypeAliasDeclaration(node)
        ) {
            this.validateOnceDecoratorUsage(node, this.messages.invalidNOtInStruct);
            return;
        }
    }

    private validateOnceDecoratorUsage(
        node: arkts.ClassProperty | arkts.VariableDeclaration | arkts.FunctionDeclaration |
            arkts.ScriptFunction | arkts.TSInterfaceDeclaration | arkts.TSTypeAliasDeclaration,
        message: string,
    ): void {
        const decorator = findDecorator(node, PresetDecorators.ONCE);
        if (!decorator) {
            return;
        }

        this.report({
            node: decorator,
            message: message,
            fix: (decorator) => {
                let startPosition = decorator.startPosition;
                startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                const endPosition = decorator.endPosition;
                return {
                    range: [startPosition, endPosition],
                    code: '',
                };
            }
        });
    }

    private validateOnlyOnProperty(node: arkts.AstNode): void {
        if (arkts.isFunctionDeclaration(node) || arkts.isScriptFunction(node) || arkts.isVariableDeclaration(node) ||
            arkts.isTSInterfaceDeclaration(node) || arkts.isTSTypeAliasDeclaration(node)
        ) {
            this.validateOnceDecoratorUsage(node, this.messages.invalidMemberDecorate);
        }
    }

    private validateDecorator(
        node: arkts.StructDeclaration,
        onceDecorator: arkts.AnnotationUsage | undefined,
        componentV2DecoratorUsage: arkts.AnnotationUsage | undefined,
        componentDecoratorUsage: arkts.AnnotationUsage | undefined,
    ): void {
        node.definition?.body.forEach(body => {
            // Check if @Once is used on a property and if @Param is used with
            if (arkts.isClassProperty(body)) {
                this.validatePropertyAnnotations(body, onceDecorator);
                // If @Once is used but not in a @ComponentV2 struct, report an error
                this.invalidComponentUsage(node, body, onceDecorator, componentV2DecoratorUsage, componentDecoratorUsage);
            }
        });
    }

    private validatePropertyAnnotations(
        body: arkts.ClassProperty,
        onceDecorator: arkts.AnnotationUsage | undefined
    ): void {
        const propertyAnnotations = getClassPropertyAnnotationNames(body);
        onceDecorator = findDecorator(body, PresetDecorators.ONCE);
        if (onceDecorator) {
            const isParamUsed = propertyAnnotations.includes(PresetDecorators.PARAM);
            // If @Once is found, check if @Param is also used
            if (!isParamUsed) {
                this.reportMissingParamWithOnce(onceDecorator);
            } else {
                // If both @Once and @Param are used, check for other
                // incompatible decorators
                const otherDecorators = body.annotations?.find(annotation =>
                    annotation.expr && arkts.isIdentifier(annotation.expr) &&
                    annotation.expr.name !== PresetDecorators.ONCE &&
                    annotation.expr.name !== PresetDecorators.PARAM
                );
                this.reportInvalidDecoratorsWithOnceAndParam(otherDecorators);
            }
        }
    }

    private invalidComponentUsage(
        node: arkts.StructDeclaration,
        body: arkts.ClassProperty,
        onceDecorator: arkts.AnnotationUsage | undefined,
        componentV2DecoratorUsage: arkts.AnnotationUsage | undefined,
        componentDecoratorUsage: arkts.AnnotationUsage | undefined,
    ): void {
        onceDecorator = findDecorator(body, PresetDecorators.ONCE);
        if (onceDecorator && !componentV2DecoratorUsage) {
            this.reportInvalidOnceUsage(onceDecorator, node, componentDecoratorUsage);
        }
    }

    private reportMissingParamWithOnce(onceDecorator: arkts.AnnotationUsage | undefined): void {
        if (!onceDecorator) {
            return;
        }
        this.report({
            node: onceDecorator,
            message: this.messages.invalidDecorator,
            fix: (onceDecorator) => {
                const startPosition = onceDecorator.endPosition;
                const endPosition = onceDecorator.endPosition;
                return {
                    range: [startPosition, endPosition],
                    code: `@${PresetDecorators.PARAM}`
                };
            }
        });
    }

    private reportInvalidDecoratorsWithOnceAndParam(otherDecorators: arkts.AnnotationUsage | undefined): void {
        if (!otherDecorators) {
            return;
        }
        this.report({
            node: otherDecorators,
            message: this.messages.invalidDecorator,
            fix: (otherDecorators) => {
                const startPosition = otherDecorators.startPosition;
                const endPosition = otherDecorators.endPosition;
                return {
                    range: [startPosition, endPosition],
                    code: ''
                };
            }
        });
    }

    private reportInvalidOnceUsage(
        onceDecorator: arkts.AnnotationUsage | undefined,
        node: arkts.StructDeclaration,
        componentDecoratorUsage: arkts.AnnotationUsage | undefined,
    ): void {
        if (!onceDecorator) {
            return;
        }
        this.report({
            node: onceDecorator,
            message: this.messages.invalidUsage,
            fix: () => {
                if (componentDecoratorUsage) {
                    let startPosition = componentDecoratorUsage.startPosition;
                    startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                    const endPosition = componentDecoratorUsage.endPosition;
                    return {
                        range: [startPosition, endPosition],
                        code: `@${PresetDecorators.COMPONENT_V2}`
                    };
                } else {
                    const startPosition = node.startPosition;
                    const endPosition = node.startPosition;
                    return {
                        range: [startPosition, endPosition],
                        code: `@${PresetDecorators.COMPONENT_V2}\n`
                    };
                }
            }
        });
    }
}

export default OnceDecoratorCheckRule;