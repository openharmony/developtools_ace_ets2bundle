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

import { PresetDecorators, getAnnotationName } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

// Lifecycle decorators can not have parameters
const LIFECYCLE_DECORATORS_WITHOUT_PARAMS: Set<string> = new Set([
    PresetDecorators.COMPONENTINIT,
    PresetDecorators.COMPONENTAPPEAR,
    PresetDecorators.COMPONENTBUILT,
    PresetDecorators.COMPONENTRECYCLE,
    PresetDecorators.COMPONENTDISAPPEAR,
    PresetDecorators.COMPONENTACTIVE,
    PresetDecorators.COMPONENTINACTIVE,
]);

const LIFECYCLE_METHODS: Set<string> = new Set([
    'aboutToAppear',
    'onDidBuild',
    'aboutToRecycle',
    'aboutToReuse',
    'aboutToDisappear',
]);

const LIFECYCLE_DECORATORS: Set<string> = new Set([
    ...LIFECYCLE_DECORATORS_WITHOUT_PARAMS,
    PresetDecorators.COMPONENTREUSE,
]);

const ACTIVE_INACTIVE_DECORATORS: Set<string> = new Set([
    PresetDecorators.COMPONENTACTIVE,
    PresetDecorators.COMPONENTINACTIVE,
]);

const OTHER_LIFECYCLE_DECORATORS: Set<string> = new Set([
    PresetDecorators.COMPONENTINIT,
    PresetDecorators.COMPONENTAPPEAR,
    PresetDecorators.COMPONENTBUILT,
    PresetDecorators.COMPONENTDISAPPEAR,
    PresetDecorators.COMPONENTREUSE,
    PresetDecorators.COMPONENTRECYCLE,
]);

// @ComponentReuse param type in @Component
const REUSE_OBJECT_TYPE_NAME: string = 'ReuseObject';

class LifecycleDecoratorCheckRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            lifecycleDecoratorInvalidParameter: `Methods decorated with '{{decoratorName}}' cannot have input parameters.`,
            componentReuseInComponentV2Parameter: `Methods decorated with '@ComponentReuse' in '@ComponentV2' cannot have input parameters`,
            componentReuseInComponentParameter: `In the struct decorated with '@Component', the '@ComponentReuse' decorated function can have either no parameters or a single parameter of the 'ReuseObject' type.`,
            lifecycleDecoratorInvalidMethod:`'{{decoratorName}}' cannot decorate '{{LifecycleMethod}}'.`,
            lifecycleDecoratorDecorateMethod:`'{{decoratorName}}' can only decorate methods.`,
            activeInactiveMutualExclusive: `'@ComponentActive' and '@ComponentInactive' cannot decorate the same method.`,
            activeInactiveCannotBeStatic: `Methods decorated with '{{decoratorName}}' cannot be static.`,
            activeInactiveConflictWithLifecycle: `'{{decoratorName}}' cannot be used with '{{conflictDecoratorName}}' on the same method.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (!arkts.isStructDeclaration(node)) {
            return;
        }
        this.checkLifecycleDecoratorDecorateMethod(node);
        this.checkLifecycleMethodParameters(node);
        this.checkActiveInactiveConstraints(node);
    }

    private checkLifecycleDecoratorDecorateMethod(structNode: arkts.StructDeclaration): void {
        if (!structNode.definition) {
            return;
        }

        // Lifecycle decorators can only decorate methods, not the struct itself.
        const structAnnotations = structNode.definition.annotations;
        for (const annotation of structAnnotations) {
            const decoratorName = getAnnotationName(annotation);
            if (!decoratorName || !LIFECYCLE_DECORATORS.has(decoratorName)) {
                continue;
            }
            this.reportLifecycleDecoratorDecorateMethod(annotation, decoratorName);
        }

        if (!structNode.definition.body) {
            return;
        }

        // Check lifecycle decorators are not used on member properties.
        for (const member of structNode.definition.body) {
            if (arkts.isMethodDefinition(member) || !arkts.isClassProperty(member)) {
                continue;
            }

            const annotations = member.annotations;
            if (!annotations || annotations.length === 0) {
                continue;
            }

            for (const annotation of annotations) {
                const decoratorName = getAnnotationName(annotation);
                if (!decoratorName || !LIFECYCLE_DECORATORS.has(decoratorName)) {
                    continue;
                }
                this.reportLifecycleDecoratorDecorateMethod(annotation, decoratorName);
            }
        }
    }

    private reportLifecycleDecoratorDecorateMethod(annotation: arkts.AnnotationUsage, decoratorName: string): void {
        this.report({
            node: annotation,
            message: this.messages.lifecycleDecoratorDecorateMethod,
            data: {
                decoratorName: `@${decoratorName}`,
            },
        });
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
                const decoratorName = getAnnotationName(annotation);
                if (!decoratorName) {
                    continue;
                }

                if (this.checkLifecycleDecoratorInvalidMethod(member, annotation, decoratorName)) {
                    continue;
                }

                if (LIFECYCLE_DECORATORS_WITHOUT_PARAMS.has(decoratorName) && methodHasParams) {
                    // @ComponentInit/@ComponentAppear/@ComponentBuilt
                    // @ComponentRecycle/@ComponentDisappearcan not have parameters
                    this.report({
                        node: annotation,
                        message: this.messages.lifecycleDecoratorInvalidParameter,
                        data: {
                            decoratorName: `@${decoratorName}`,
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

    private checkLifecycleDecoratorInvalidMethod(
        method: arkts.MethodDefinition,
        annotation: arkts.AnnotationUsage,
        decoratorName: string,
    ): boolean {
        if (!LIFECYCLE_DECORATORS_WITHOUT_PARAMS.has(decoratorName) && decoratorName !== PresetDecorators.COMPONENTREUSE) {
            return false;
        }
        const methodName = this.getMethodName(method);
        if (!methodName || !LIFECYCLE_METHODS.has(methodName)) {
            return false;
        }
        this.report({
            node: annotation,
            message: this.messages.lifecycleDecoratorInvalidMethod,
            data: {
                decoratorName: `@${decoratorName}`,
                LifecycleMethod: methodName,
            },
        });
        return true;
    }

    private getMethodName(method: arkts.MethodDefinition): string | undefined {
        if (!method.name || !arkts.isIdentifier(method.name)) {
            return undefined;
        }
        return method.name.name;
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
        // Get type name from type reference (only simple ReuseObject, not SomeNs.ReuseObject)
        if (!typeNode) {
            return undefined;
        }
        if (!arkts.isETSTypeReference(typeNode)) {
            return undefined;
        }
        const typeRef = typeNode as arkts.ETSTypeReference;
        
        // Check part and name exist and are correct types
        if (typeRef.part && arkts.isETSTypeReferencePart(typeRef.part)) {
            const part = typeRef.part as arkts.ETSTypeReferencePart;
            if (part.name && arkts.isIdentifier(part.name)) {
                return part.name.name;
            }
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
        return annotations.find((annotation) => getAnnotationName(annotation) === decoratorName);
    }

    private checkActiveInactiveConstraints(structNode: arkts.StructDeclaration): void {
        if (!structNode.definition || !structNode.definition.body) {
            return;
        }

        for (const member of structNode.definition.body) {
            if (!arkts.isMethodDefinition(member)) {
                continue;
            }

            const annotations = member.scriptFunction.annotations;
            if (!annotations || annotations.length === 0) {
                continue;
            }

            const hasActive = this.hasDecorator(annotations, PresetDecorators.COMPONENTACTIVE);
            const hasInactive = this.hasDecorator(annotations, PresetDecorators.COMPONENTINACTIVE);

            if (!hasActive && !hasInactive) {
                continue;
            }

            if (hasActive && hasInactive) {
                const annotation = this.findDecorator(annotations, PresetDecorators.COMPONENTACTIVE);
                this.report({
                    node: annotation!,
                    message: this.messages.activeInactiveMutualExclusive,
                });
            }

            if (member.isStatic) {
                const activeInactiveAnnotation = this.findDecorator(annotations, hasActive ? PresetDecorators.COMPONENTACTIVE : PresetDecorators.COMPONENTINACTIVE);
                this.report({
                    node: activeInactiveAnnotation!,
                    message: this.messages.activeInactiveCannotBeStatic,
                    data: {
                        decoratorName: hasActive ? '@ComponentActive' : '@ComponentInactive',
                    },
                });
            }

            for (const annotation of annotations) {
                const otherName = getAnnotationName(annotation);
                if (!otherName || !OTHER_LIFECYCLE_DECORATORS.has(otherName)) {
                    continue;
                }
                const activeInactiveAnnotation = this.findDecorator(annotations, hasActive ? PresetDecorators.COMPONENTACTIVE : PresetDecorators.COMPONENTINACTIVE);
                this.report({
                    node: activeInactiveAnnotation!,
                    message: this.messages.activeInactiveConflictWithLifecycle,
                    data: {
                        decoratorName: hasActive ? '@ComponentActive' : '@ComponentInactive',
                        conflictDecoratorName: `@${otherName}`,
                    },
                });
            }
        }
    }

}

export default LifecycleDecoratorCheckRule;
