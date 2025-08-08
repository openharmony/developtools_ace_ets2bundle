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
import { PresetDecorators, getAnnotationName, getAnnotationUsage, getIdentifierName } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class OldNewDecoratorMixUseCheckRule extends AbstractUISyntaxRule {
    private oldV1Decorators: string[] = [
        PresetDecorators.STATE,
        PresetDecorators.PROP_REF,
        PresetDecorators.LINK,
        PresetDecorators.PROVIDE,
        PresetDecorators.CONSUME,
        PresetDecorators.WATCH,
        PresetDecorators.STORAGE_LINK,
        PresetDecorators.STORAGE_PROP_REF,
        PresetDecorators.LOCAL_STORAGE_LINK,
        PresetDecorators.OBJECT_LINK,
    ];

    private newV2decorators: string[] = [
        PresetDecorators.LOCAL,
        PresetDecorators.PARAM,
        PresetDecorators.ONCE,
        PresetDecorators.EVENT,
        PresetDecorators.MONITOR,
        PresetDecorators.PROVIDER,
        PresetDecorators.CONSUMER,
        PresetDecorators.COMPUTED,
    ];

    private notAllowedInClass: string[] = [
        PresetDecorators.LOCAL,
        PresetDecorators.PARAM,
    ];

    public setup(): Record<string, string> {
        return {
            oldAndNewDecoratorsMixUse: `The '@{{decoratorName}}' annotation can only be used in a 'struct' decorated with '@{{component}}'.`,
        };
    }

    public parsed(node: arkts.ETSStructDeclaration | arkts.ClassDeclaration): void {
        if (arkts.isETSStructDeclaration(node)) {
            this.handleStructDeclaration(node);
        } else if (arkts.isClassDeclaration(node)) {
            this.handleClassDeclaration(node);
        }
    }

    private handleStructDeclaration(node: arkts.ETSStructDeclaration): void {
        // Gets the decorator version of a custom component
        const componentV2Decorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
        const componentDecorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);
        node.definition?.body.forEach((property) => {
            if (!arkts.isClassProperty(property)) {
                return;
            }
            const newDecorator = this.findPropertyDecorator(property, this.newV2decorators);
            const oldDecorator = this.findPropertyDecorator(property, this.oldV1Decorators);
            // Check that the new decorator is used for component v2
            if (newDecorator && !componentV2Decorator && componentDecorator) {
                this.reportErrorAndChangeDecorator(newDecorator, componentDecorator, PresetDecorators.COMPONENT_V2);
            }
            if (newDecorator && !componentDecorator && !componentV2Decorator) {
                this.reportErrorAndAddDecorator(node, newDecorator);
            }
            // Check that the old decorator is used for component v1
            if (oldDecorator && !componentDecorator && componentV2Decorator) {
                this.reportErrorAndChangeDecorator(oldDecorator, componentV2Decorator, PresetDecorators.COMPONENT_V1);
            }
        });
    }

    private handleClassDeclaration(node: arkts.ClassDeclaration): void {
        node.definition?.body.forEach((property) => {
            if (!arkts.isClassProperty(property)) {
                return;
            }
            const decorator = this.findPropertyDecorator(property, this.notAllowedInClass);
            if (decorator) {
                this.reportError(decorator, PresetDecorators.COMPONENT_V2);
            }
        });
    }

    private findPropertyDecorator(
        node: arkts.ClassProperty,
        decoratorList: string[]
    ): arkts.AnnotationUsage | undefined {
        return node.annotations?.find(annotation =>
            annotation.expr &&
            arkts.isIdentifier(annotation.expr) &&
            decoratorList.includes(getIdentifierName(annotation.expr))
        );
    }

    private reportErrorAndChangeDecorator(
        errorDecorator: arkts.AnnotationUsage,
        hasComponentV2Decorator: arkts.AnnotationUsage,
        structDecoratorName: string
    ): void {
        let propertyDecoratorName = getAnnotationName(errorDecorator);
        const curStructDecoratorName = structDecoratorName ===
            PresetDecorators.COMPONENT_V2 ? PresetDecorators.COMPONENT_V1 : PresetDecorators.COMPONENT_V2;
        this.report({
            node: errorDecorator,
            message: this.messages.oldAndNewDecoratorsMixUse,
            data: {
                decoratorName: propertyDecoratorName,
                component: structDecoratorName,
            },
            fix: () => {
                return {
                    title: `Change @${curStructDecoratorName} to @${structDecoratorName}`,
                    range: [hasComponentV2Decorator.startPosition, hasComponentV2Decorator.endPosition],
                    code: structDecoratorName,
                };
            },
        });
    }

    private reportErrorAndAddDecorator(
        structNode: arkts.ETSStructDeclaration,
        errorDecorator: arkts.AnnotationUsage,
    ): void {
        let propertyDecoratorName = getAnnotationName(errorDecorator);
        this.report({
            node: errorDecorator,
            message: this.messages.oldAndNewDecoratorsMixUse,
            data: {
                decoratorName: propertyDecoratorName,
                component: PresetDecorators.COMPONENT_V2,
            },
            fix: () => {
                return {
                    title: 'Add @ComponentV2 annotation',
                    range: [structNode.startPosition, structNode.startPosition],
                    code: `@${PresetDecorators.COMPONENT_V2}\n`,
                };
            },
        });
    }

    private reportError(errorDecorator: arkts.AnnotationUsage, componentName: string): void {
        const propertyDecoratorName = getAnnotationName(errorDecorator);
        this.report({
            node: errorDecorator,
            message: this.messages.oldAndNewDecoratorsMixUse,
            data: {
                decoratorName: propertyDecoratorName,
                component: componentName
            }
        });
    }
}

export default OldNewDecoratorMixUseCheckRule;