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
    getClassPropertyAnnotationNames, PresetDecorators, getAnnotationUsage, getClassPropertyName, getIdentifierName
} from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

const builtInDecorators = [PresetDecorators.LOCAL, PresetDecorators.PARAM, PresetDecorators.EVENT];

class ComponentV2StateUsageValidationRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            multipleBuiltInDecorators: `The member property or method cannot be decorated by multiple built-in annotations.`,
            paramRequiresRequire: `When a variable decorated with '@Param' is not assigned a default value, it must also be decorated with '@Require'.`,
            requireOnlyWithParam: `In a struct decorated with '@ComponentV2', '@Require' can only be used with '@Param' or '@BuilderParam'.`,
            localNeedNoInit: `The '{{decoratorName}}' property '{{key}}' in the custom component '{{componentName}}' cannot be initialized here (forbidden to specify).`,
            useStateDecoratorsWithProperty: `'@{{annotationName}}' can only decorate member property.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (arkts.isClassDeclaration(node) && node.definition) {
            this.checkuseStateDecoratorsWithProperty(node.definition);
        }
        if (arkts.isFunctionDeclaration(node) ||
            arkts.isVariableDeclaration(node) ||
            arkts.isScriptFunction(node) ||
            arkts.isTSInterfaceDeclaration(node) ||
            arkts.isTSTypeAliasDeclaration(node)) {
            // Rule 5: Local, Param, Event decorators must be used with Property
            this.checkuseStateDecoratorsWithProperty(node);
        }
        if (!arkts.isStructDeclaration(node)) {
            return;
        }
        this.validateClassPropertyDecorators(node);
    }

    public checked(node: arkts.AstNode): void {
        this.checkPropertyInit(node);
    }

    private checkPropertyInit(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node) ||
            !arkts.isMemberExpression(node.expression) ||
            !arkts.isIdentifier(node.expression.object)) {
            return;
        }
        if (node.arguments.length === 0 || !arkts.isObjectExpression(node.arguments[0])) {
            return;
        }
        const structDecl = arkts.getDecl(node.expression.object);
        if (!structDecl || !arkts.isClassDefinition(structDecl)) {
            return;
        }
        if (!structDecl.annotations.some(annotation =>
            annotation.expr &&
            arkts.isIdentifier(annotation.expr) &&
            annotation.expr.name === PresetDecorators.COMPONENT_V2
        )) {
            return;
        }
        const forbidExternalInitProps: Map<string, string> = this.getForbidExternalInitProps(structDecl);
        const properties = node.arguments[0].properties;
        for (const property of properties) {
            if (!arkts.isProperty(property) || !property.key || !arkts.isIdentifier(property.key)) {
                continue;
            }
            const propertyName = property.key.name;
            const decoratorName = forbidExternalInitProps.get(propertyName);
            if (!decoratorName) {
                continue;
            }
            this.report({
                node: property,
                message: this.messages.localNeedNoInit,
                data: {
                    decoratorName: decoratorName,
                    key: propertyName,
                    componentName: node.expression.object.name,
                },
                fix: (property) => {
                    return {
                        title: 'Remove the property',
                        range: [property.startPosition, property.endPosition],
                        code: '',
                    };
                }
            });
        }
    }

    private getForbidExternalInitProps(decl: arkts.ClassDefinition): Map<string, string> {
        let forbidExternalInitProps: Map<string, string> = new Map<string, string>();
        decl.body.forEach((item) => {
            if (!arkts.isClassProperty(item) || !item.key || !arkts.isIdentifier(item.key)) {
                return;
            }
            if (item.annotations.length === 0) {
                forbidExternalInitProps.set(item.key.name, PresetDecorators.REGULAR);
            } else if (item.annotations.some(annotation =>
                annotation.expr &&
                arkts.isIdentifier(annotation.expr) &&
                annotation.expr.name === PresetDecorators.LOCAL
            )) {
                forbidExternalInitProps.set(item.key.name, '@' + PresetDecorators.LOCAL);
            }
        });
        return forbidExternalInitProps;
    }

    private hasComponentV2Annotation = (node: arkts.StructDeclaration): boolean => !!getAnnotationUsage(node,
        PresetDecorators.COMPONENT_V2);

    private checkMultipleBuiltInDecorators(member: arkts.ClassProperty,
        propertyDecorators: string[]): void {
        const appliedBuiltInDecorators = propertyDecorators.filter(d => builtInDecorators.includes(d));
        if (appliedBuiltInDecorators.length > 1) {
            member.annotations.forEach(annotation => {
                if (annotation.expr && arkts.isIdentifier(annotation.expr)) {
                    const annotationsName = annotation.expr.name;
                    this.reportMultipleBuiltInDecoratorsError(annotation, annotationsName, builtInDecorators);
                }
            });
        }
    };

    private reportMultipleBuiltInDecoratorsError(annotation: arkts.AstNode,
        annotationsName: string | undefined, builtInDecorators: string[]): void {
        if (annotationsName && builtInDecorators.includes(annotationsName)) {
            this.report({
                node: annotation,
                message: this.messages.multipleBuiltInDecorators,
            });
        }
    }

    private checkParamRequiresRequire(member: arkts.ClassProperty,
        propertyDecorators: string[]): void {
        if (propertyDecorators.includes(PresetDecorators.PARAM) && !member.value &&
            !propertyDecorators.includes(PresetDecorators.REQUIRE) && member.key) {
            const memberKey = member.key;
            this.report({
                node: memberKey,
                message: this.messages.paramRequiresRequire,
                fix: (memberKey) => {
                    const startPosition = memberKey.startPosition;
                    return {
                        title: 'Add @Require annotation',
                        range: [startPosition, startPosition],
                        code: `@${PresetDecorators.REQUIRE} `,
                    };
                },
            });
        }
    };

    private checkRequireOnlyWithParam(member: arkts.ClassProperty,
        propertyDecorators: string[], isComponentV2: boolean): void {
        const requireDecorator = member.annotations.find(annotation =>
            annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === PresetDecorators.REQUIRE
        );
        if (isComponentV2 &&
            requireDecorator &&
            !propertyDecorators.includes(PresetDecorators.PARAM) &&
            !propertyDecorators.includes(PresetDecorators.BUILDER_PARAM)) {
            this.report({
                node: requireDecorator,
                message: this.messages.requireOnlyWithParam,
                fix: (requireDecorator) => {
                    let startPosition = requireDecorator.startPosition;
                    startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                    let endPosition = requireDecorator.endPosition;
                    return {
                        title: 'Remove the @Require annotation',
                        range: [startPosition, endPosition],
                        code: '',
                    };
                },
            });
        }
    };

    private checkuseStateDecoratorsWithProperty(
        node: arkts.FunctionDeclaration |
            arkts.VariableDeclaration |
            arkts.ScriptFunction |
            arkts.TSInterfaceDeclaration |
            arkts.ClassDefinition |
            arkts.TSTypeAliasDeclaration): void {
        node.annotations.forEach(annotation => {
            if (annotation.expr && arkts.isIdentifier(annotation.expr) &&
                builtInDecorators.includes(annotation.expr.name)) {
                const annotationName = annotation.expr.name;
                this.reportInvalidDecoratorOnMethod(annotation, annotationName);
            }
        });
    }

    private reportInvalidDecoratorOnMethod(annotation: arkts.AnnotationUsage,
        annotationName: string): void {
        this.report({
            node: annotation,
            message: this.messages.useStateDecoratorsWithProperty,
            data: { annotationName },
            fix: (annotation) => {
                let startPosition = annotation.startPosition;
                startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                let endPosition = annotation.endPosition;
                return {
                    title: 'Remove the annotation',
                    range: [startPosition, endPosition],
                    code: '',
                };
            },
        });
    }

    private validateClassPropertyDecorators(node: arkts.StructDeclaration): void {
        this.checkuseStateDecoratorsWithProperty(node.definition);
        const isComponentV2 = this.hasComponentV2Annotation(node);
        node.definition.body.forEach(member => {
            if (!arkts.isClassProperty(member)) {
                return;
            }
            const propertyDecorators = getClassPropertyAnnotationNames(member);
            // Rule 1: Multiple built-in decorators
            this.checkMultipleBuiltInDecorators(member, propertyDecorators);

            // Rule 2: @Param without default value must be combined with @Require
            this.checkParamRequiresRequire(member, propertyDecorators);

            // Rule 3: @Require must be used together with @Param
            this.checkRequireOnlyWithParam(member, propertyDecorators, isComponentV2);
        });
    }
};

export default ComponentV2StateUsageValidationRule;