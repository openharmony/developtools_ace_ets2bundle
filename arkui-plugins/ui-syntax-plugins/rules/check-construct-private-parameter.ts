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
import { getClassPropertyName, isPrivateClassProperty } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class CheckConstructPrivateParameterRule extends AbstractUISyntaxRule {
    private privatePropertyMap: Map<string, string[]> = new Map();

    public setup(): Record<string, string> {
        return {
            cannotInitializePrivateVariables: `Property '{{propertyName}}' is private and can not be initialized through the component constructor.`,
        };
    }

    public beforeTransform(): void {
        this.privatePropertyMap = new Map();
    }

    public parsed(node: arkts.ETSStructDeclaration): void {
        // Check if the current node is the root node
        if (arkts.nodeType(node) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
            node.getChildren().forEach((member) => {
                if (!arkts.isETSStructDeclaration(member) || !member.definition?.ident || !member.definition.ident.name) {
                    return;
                }
                const structName: string = member.definition.ident.name;
                member.definition.body.forEach((item) => {
                    this.addProperty(item, structName);
                });
            });
        }
        if (!arkts.isCallExpression(node) || !arkts.isIdentifier(node.callee)) {
            return;
        }
        const componentName = node.callee?.name;
        // If the initialization is for a component with private properties
        if (!this.privatePropertyMap.has(componentName)) {
            return;
        }
        node.arguments.forEach((member) => {
            member.getChildren().forEach((property) => {
                if (!arkts.isProperty(property) || !property.key || !arkts.isIdentifier(property.key)) {
                    return;
                }
                const propertyName: string = property.key.name;
                if (this.privatePropertyMap.get(componentName)!.includes(propertyName)) {
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

    private addProperty(item: arkts.AstNode, structName: string): void {
        if (!arkts.isClassProperty(item) || !isPrivateClassProperty(item)) {
            return;
        }
        const propertyName = getClassPropertyName(item);
        if (!propertyName) {
            return;
        }
        // Check if structName already exists in privateMap
        if (this.privatePropertyMap.has(structName)) {
            // If it exists, retrieve the current string[] and append the new content
            this.privatePropertyMap.get(structName)!.push(propertyName);
        } else {
            // If it doesn't exist, create a new string[] and add the content
            this.privatePropertyMap.set(structName, [propertyName]);
        }
    }
}

export default CheckConstructPrivateParameterRule;