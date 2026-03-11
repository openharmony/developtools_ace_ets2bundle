/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

import { PresetDecorators } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

// Lifecycle decorators can not have parameters
const LIFECYCLE_DECORATORS_WITHOUT_PARAMS: Set<string> = new Set([
    PresetDecorators.COMPONENTINIT,
    PresetDecorators.COMPONENTAPPEAR,
    PresetDecorators.COMPONENTBUILT,
    PresetDecorators.COMPONENTRECYCLE,
    PresetDecorators.COMPONENTDISAPPEAR,
]);

// @ComponentReuse param type in @Component
const REUSE_OBJECT_TYPE_NAME: string = 'ReuseObject';

class LifecycleDecoratorCheckRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            lifecycleDecoratorInvalidParameter: `Methods decorated with '{{propertyName}}' cannot have input parameters.`,
            componentReuseInComponentV2Parameter: `Methods decorated with '@ComponentReuse' in '@ComponentV2' cannot have input parameters`,
            componentReuseInComponentParameter: `In a struct decorated with '@Component', the function decorated with '@ComponentReuse' has the following input parameter: params: ReuseObject.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (!arkts.isStructDeclaration(node)) {
            return;
        }
        // Struct only check is in validate-decorator-target.ts
        // Only check method params in struct here
        this.checkLifecycleMethodParameters(node);
    }

    private checkLifecycleMethodParameters(structNode: arkts.StructDeclaration): void {
        if (!structNode.definition || !structNode.definition.body) {
            return;
        }

        // Only check @Component/@ComponentV2 when @ComponentReuse is used
        let componentTypeChecked = false;
        let isComponentV1Struct = false;
        let isComponentV2Struct = false;

        for (const member of structNode.definition.body) {
            if (!arkts.isMethodDefinition(member)) {
                continue;
            }

            const annotations = member.scriptFunction.annotations;
            if (!annotations || annotations.length === 0) {
                continue;
            }

            // Check method decorators
            const methodHasParams = member.scriptFunction.params.length > 0;
            for (const annotation of annotations) {
                const decoratorName = this.getDecoratorName(annotation);
                if (!decoratorName) {
                    continue;
                }

                if (LIFECYCLE_DECORATORS_WITHOUT_PARAMS.has(decoratorName)) {
                    // @ComponentInit/@ComponentAppear/@ComponentBuilt
                    // @ComponentRecycle/@ComponentDisappearcan not have parameters
                    if (!methodHasParams) {
                        continue;
                    }
                    this.report({
                        node: annotation,
                        message: this.messages.lifecycleDecoratorInvalidParameter,
                        data: {
                            propertyName: `@${decoratorName}`,
                        },
                    });
                    continue;
                }

                if (decoratorName !== PresetDecorators.COMPONENTREUSE) {
                    continue;
                }

                if (!componentTypeChecked) {
                    // Get struct component type once
                    isComponentV1Struct = this.hasDecorator(structNode.definition.annotations, PresetDecorators.COMPONENT_V1);
                    isComponentV2Struct = this.hasDecorator(structNode.definition.annotations, PresetDecorators.COMPONENT_V2);
                    componentTypeChecked = true;
                }
                this.checkComponentReuseInComponentStructs(member, annotation, isComponentV1Struct, isComponentV2Struct);
            }
        }
    }

    private checkComponentReuseInComponentStructs(
        method: arkts.MethodDefinition,
        componentReuseDecorator: arkts.AnnotationUsage,
        isComponentV1Struct: boolean,
        isComponentV2Struct: boolean,
    ): void {
        const params = method.scriptFunction.params;
        if (isComponentV2Struct) {
            // @ComponentReuse in @ComponentV2 can not have parameters
            if (params.length > 0) {
                this.report({
                    node: componentReuseDecorator,
                    message: this.messages.componentReuseInComponentV2Parameter,
                });
            }
            return;
        }

        if (!isComponentV1Struct) {
            return;
        }

        if (params.length === 0) {
            return;
        }
        // @ComponentReuse in @Component can have 0 param or 1 param: ReuseObject
        if (params.length === 1 && this.isReuseObjectParameter(params[0])) {
            return;
        }

        this.report({
            node: componentReuseDecorator,
            message: this.messages.componentReuseInComponentParameter,
        });
    }

    private isReuseObjectParameter(param: arkts.Expression): boolean {
        if (!arkts.isEtsParameterExpression(param)) {
            return false;
        }
        const typeName = this.getTypeName(param.type);
        return typeName === REUSE_OBJECT_TYPE_NAME;
    }

    private getTypeName(typeNode: arkts.TypeNode | undefined): string | undefined {
        // Get type name from type reference (ReuseObject / xxx.ReuseObject)
        if (!typeNode) {
            return undefined;
        }
        if (!arkts.isETSTypeReference(typeNode)) {
            return undefined;
        }

        const typeName = typeNode.part?.name;
        if (!typeName) {
            return undefined;
        }
        if (arkts.isIdentifier(typeName)) {
            return typeName.name;
        }
        if (arkts.isTSQualifiedName(typeName) && typeName.right && arkts.isIdentifier(typeName.right)) {
            return typeName.right.name;
        }
        return undefined;
    }

    private hasDecorator(annotations: readonly arkts.AnnotationUsage[], decoratorName: string): boolean {
        return !!this.findDecorator(annotations, decoratorName);
    }

    private findDecorator(
        annotations: readonly arkts.AnnotationUsage[],
        decoratorName: string,
    ): arkts.AnnotationUsage | undefined {
        return annotations.find((annotation) => this.getDecoratorName(annotation) === decoratorName);
    }

    private getDecoratorName(annotation: arkts.AnnotationUsage): string | undefined {
        if (!annotation.expr) {
            return undefined;
        }

        if (arkts.isIdentifier(annotation.expr)) {
            return annotation.expr.name;
        }
        if (arkts.isCallExpression(annotation.expr)) {
            const callee = annotation.expr.expression;
            if (arkts.isIdentifier(callee)) {
                return callee.name;
            }
        }
        return undefined;
    }

}

export default LifecycleDecoratorCheckRule;
