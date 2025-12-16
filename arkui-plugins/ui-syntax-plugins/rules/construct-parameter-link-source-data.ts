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
import { AbstractUISyntaxRule } from './ui-syntax-rule';
import {
    MAX_LINK_SOURCE_DATA_NESTING_LEVEL,
    getClassPropertyAnnotationNames,
    getClassPropertyName,
    getIdentifierName,
    PresetDecorators,
    BUILD_NAME,
    getAnnotationUsage
} from '../utils';

class ConstructParameterLinkSourceDataRule extends AbstractUISyntaxRule {
    // Record all @Link attributes, Map<structName, linkPropertyNames[]>
    private linkPropertyMap: Map<string, Array<string>> = new Map();

    public setup(): Record<string, string> {
        return {
            linkSourceData: `The type of the parent component's state variable initializing the '@Link' variable '{{propertyName}}' must match the '@Link' variable's declared type.`,
        };
    }

    public beforeTransform(): void {
        this.linkPropertyMap = new Map();
    }

    public parsed(node: arkts.AstNode): void {
        this.initLinkPropertyMap(node);
        this.checkLinkPropertySourceData(node);
    }

    private addLinkProperty(structName: string, linkPropertyName: string): void {
        if (!this.linkPropertyMap.has(structName)) {
            this.linkPropertyMap.set(structName, new Array());
        }
        const structLinkProperties = this.linkPropertyMap.get(structName);
        if (!structLinkProperties) {
            return;
        }
        structLinkProperties.push(linkPropertyName);
    }

    private initLinkPropertyMap(node: arkts.AstNode): void {
        // Check if the current node is the root node
        if (!arkts.isEtsScript(node) || node.isNamespace) {
            return;
        }
        node.statements.forEach((member) => {
            if (!arkts.isStructDeclaration(member) || !member.definition || !member.definition.ident ||
                !arkts.isIdentifier(member.definition.ident)) {
                return;
            }
            const structName: string = getIdentifierName(member.definition.ident);
            if (structName === '') {
                return;
            }
            member.definition.body?.forEach((item) => {
                if (!arkts.isClassProperty(item)) {
                    return;
                }
                const classPropertyAnnotations = getClassPropertyAnnotationNames(item);
                const classPropertyName = getClassPropertyName(item);
                // Record @Link decorated properties
                if (!classPropertyName || !classPropertyAnnotations.includes(PresetDecorators.LINK)) {
                    return;
                }
                this.addLinkProperty(structName, classPropertyName);
            });
        });
    }

    private checkLinkPropertySourceData(node: arkts.AstNode): void {
        // Validates only within the build method of StructV1 components.
        if (!arkts.isCallExpression(node) || !arkts.isIdentifier(node.expression) ||
            !this.isInStructV1BuildMethod(node)) {
            return;
        }
        const componentName = node.expression.name;
        // Only assignments to properties decorated with Link trigger rule checks
        if (!this.linkPropertyMap.has(componentName)) {
            return;
        }
        const linkPropertyNames = this.linkPropertyMap.get(componentName);
        if (!linkPropertyNames || linkPropertyNames.length === 0) {
            return;
        }
        node.arguments.forEach((member) => {
            if (!arkts.isObjectExpression(member)) {
                return;
            }
            member.properties.forEach((property) => {
                if (!arkts.isProperty(property) || !property.key || !property.value) {
                    return;
                }
                const propertyName: string = getIdentifierName(property.key);
                if (!linkPropertyNames.includes(propertyName) || !this.isInitFromMismatchSourceData(property)) {
                    return;
                }
                // Error: Source Data mismatch when assigning to a @Link decorated variable.
                this.report({
                    node: property,
                    message: this.messages.linkSourceData,
                    data: {
                        propertyName: propertyName,
                    },
                });
            });
        });
    }

    private isInStructV1BuildMethod(node: arkts.AstNode): boolean {
        while (!(arkts.isMethodDefinition(node) && getIdentifierName(node.name) === BUILD_NAME)) {
            if (!node.parent || arkts.isStructDeclaration(node) || arkts.isClassDeclaration(node)) {
                return false;
            }
            node = node.parent;
        }
        while (!arkts.isStructDeclaration(node)) {
            if (!node.parent) {
                return false;
            }
            node = node.parent;
        }
        return !!getAnnotationUsage(node, PresetDecorators.COMPONENT_V1) ||
            !!getAnnotationUsage(node, PresetDecorators.CUSTOM_DIALOG);
    }

    private isInitFromMismatchSourceData(node: arkts.Property): boolean {
        if (!node.value) {
            return false;
        }
        let curNode: arkts.AstNode = node.value;
        let nestingLevel = 0;
        while (curNode) {
            if (arkts.isMemberExpression(curNode)) {
                curNode = curNode.object;
                nestingLevel++;
            } else if (arkts.isTSNonNullExpression(curNode) && curNode.expr) {
                curNode = curNode.expr;
            } else if (arkts.isChainExpression(curNode) && curNode.getExpression) {
                curNode = curNode.getExpression;
            } else {
                break;
            }
        }
        return nestingLevel >= MAX_LINK_SOURCE_DATA_NESTING_LEVEL && curNode && arkts.isThisExpression(curNode);
    }
}

export default ConstructParameterLinkSourceDataRule;