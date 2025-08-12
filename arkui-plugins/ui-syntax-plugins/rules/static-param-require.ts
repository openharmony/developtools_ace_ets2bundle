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
import { getClassPropertyName, hasAnnotation, PresetDecorators } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class StaticParamRequireRule extends AbstractUISyntaxRule {
    private staticPropertyMap: Map<string, string[]> = new Map();

    public setup(): Record<string, string> {
        return {
            cannotInitializePrivateVariables: `Static property '{{propertyName}}' can not be initialized through the component constructor.`,
        };
    }

    public beforeTransform(): void {
        this.staticPropertyMap = new Map();
    }

    public parsed(node: arkts.StructDeclaration): void {
        // Check if the current node is the root node
        if (arkts.nodeType(node) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
            node.getChildren().forEach((member) => {
                if (!arkts.isStructDeclaration(member) || !member.definition.ident || !member.definition.ident.name) {
                    return;
                }
                const hasComponentV1 = hasAnnotation(member.definition.annotations, PresetDecorators.COMPONENT_V1);
                const hasComponentV2 = hasAnnotation(member.definition.annotations, PresetDecorators.COMPONENT_V2);
                const structName: string = member.definition.ident.name;
                member.definition.body.forEach((item) => {
                    this.addStaticProperty(item, structName, hasComponentV1, hasComponentV2);
                });
            });
        }
        if (!arkts.isCallExpression(node) || !arkts.isIdentifier(node.expression)) {
            return;
        }
        const componentName = node.expression.name;
        // If the initialization is for a component with private properties
        if (!this.staticPropertyMap.has(componentName)) {
            return;
        }
        node.arguments.forEach((member) => {
            member.getChildren().forEach((property) => {
                if (!arkts.isProperty(property) || !property.key || !arkts.isIdentifier(property.key)) {
                    return;
                }
                const propertyName: string = property.key.name;
                if (this.staticPropertyMap.get(componentName)!.includes(propertyName)) {
                    this.report({
                        node: property,
                        message: this.messages.cannotInitializePrivateVariables,
                        data: {
                            propertyName: propertyName,
                        },
                    });
                }
            });
        });
    }

    private addStaticProperty(
        item: arkts.AstNode,
        structName: string,
        hasComponentV1: boolean,
        hasComponentV2: boolean
    ): void {
        if (!arkts.isClassProperty(item) || !item.isStatic) {
            return;
        }
        const propertyName = getClassPropertyName(item);
        if (!propertyName) {
            return;
        }
        // Static properties with decorators in componentV2 need to be checked
        if (hasComponentV2 && item.annotations.length > 0) {
            this.addElement(structName, propertyName);
        }
        // Static properties in componentV1 need to be verified
        if (hasComponentV1 && !hasComponentV2) {
            this.addElement(structName, propertyName);
        }
    }

    private addElement(structName: string, propertyName: string): void {
        // Check if structName already exists in privateMap
        if (this.staticPropertyMap.has(structName)) {
            // If it exists, retrieve the current string[] and append the new content
            this.staticPropertyMap.get(structName)!.push(propertyName);
        } else {
            // If it doesn't exist, create a new string[] and add the content
            this.staticPropertyMap.set(structName, [propertyName]);
        }
    }
}

export default StaticParamRequireRule;