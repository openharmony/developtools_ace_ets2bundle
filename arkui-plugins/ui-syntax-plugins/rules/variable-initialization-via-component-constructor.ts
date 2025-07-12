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
import { getIdentifierName, getClassPropertyAnnotationNames, PresetDecorators } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class VariableInitializationViaComponentConstructorRule extends AbstractUISyntaxRule {
    private mustInitMap: Map<string, Map<string, string>> = new Map();
    private cannotInitMap: Map<string, Map<string, string>> = new Map();

    private static readonly mustInitInConstructorDecorators: string[][] = [
        [PresetDecorators.REQUIRE],
        [PresetDecorators.REQUIRE, PresetDecorators.STATE],
        [PresetDecorators.REQUIRE, PresetDecorators.PROVIDE],
        [PresetDecorators.REQUIRE, PresetDecorators.PROP],
        [PresetDecorators.REQUIRE, PresetDecorators.BUILDER_PARAM],
        [PresetDecorators.REQUIRE, PresetDecorators.PARAM]
    ];

    private static readonly notAllowInitInConstructorDecorators: string[][] = [
        [PresetDecorators.STORAGE_LINK],
        [PresetDecorators.STORAGE_PROP],
        [PresetDecorators.CONSUME],
        [PresetDecorators.LOCAL_STORAGE_LINK],
        [PresetDecorators.LOCAL_STORAGE_PROP]
    ];

    public setup(): Record<string, string> {
        return {
            requireVariableInitializationViaComponentConstructor: `'@Require' decorated '{{varName}}' must be initialized through the component constructor.`,
            disallowVariableInitializationViaComponentConstructor: `The '{{decoratorName}}' property '{{varName}}' in the custom component '{{customComponentName}}' cannot be initialized here (forbidden to specify).`,
        };
    }

    public beforeTransform(): void {
        this.mustInitMap = new Map();
        this.cannotInitMap = new Map();
    }

    public parsed(node: arkts.StructDeclaration): void {
        this.initMap(node);
        this.checkMustInitialize(node);
        this.checkCannotInitialize(node);
    }

    // Define a function to add property data to the property map
    private addProperty(
        propertyMap: Map<string, Map<string, string>>,
        structName: string,
        propertyName: string,
        annotationName: string
    ): void {
        if (!propertyMap.has(structName)) {
            propertyMap.set(structName, new Map());
        }
        const structProperties = propertyMap.get(structName);
        if (structProperties) {
            structProperties.set(propertyName, annotationName);
        }
    }
    // categorizePropertyBasedOnAnnotations
    private checkPropertyByAnnotations(item: arkts.AstNode, structName: string): void {
        if (!arkts.isClassProperty(item) || !item.key || !arkts.isIdentifier(item.key)) {
            return;
        }
        const propertyName: string = item.key.name;
        if (item.annotations.length === 0 || propertyName === '') {
            return;
        }
        const annotationArray: string[] = getClassPropertyAnnotationNames(item);
        // If the member variable is decorated, it is added to the corresponding map
        VariableInitializationViaComponentConstructorRule.mustInitInConstructorDecorators.forEach(arr => {
            if (arr.every(annotation => annotationArray.includes(annotation))) {
                const annotationName: string = arr[0];
                this.addProperty(this.mustInitMap, structName, propertyName, annotationName);
            }
        });
        VariableInitializationViaComponentConstructorRule.notAllowInitInConstructorDecorators.forEach(arr => {
            if (arr.every(annotation => annotationArray.includes(annotation))) {
                const annotationName: string = arr[0];
                this.addProperty(this.cannotInitMap, structName, propertyName, annotationName);
            }
        });
    }

    private initMap(node: arkts.AstNode): void {
        if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
            return;
        }
        node.getChildren().forEach((member) => {
            if (!arkts.isStructDeclaration(member)) {
                return;
            }
            if (!member.definition || !member.definition.ident || !arkts.isIdentifier(member.definition.ident)) {
                return;
            }
            const structName: string = member.definition.ident.name;
            if (structName === '') {
                return;
            }
            member.definition?.body.forEach((item) => {
                this.checkPropertyByAnnotations(item, structName);
            });
        });
    }

    private getChildKeyNameArray(node: arkts.CallExpression): string[] {
        const childKeyNameArray: string[] = [];
        node.arguments.forEach((member) => {
            member.getChildren().forEach((property) => {
                if (!arkts.isProperty(property)) {
                    return;
                }
                if (!property.key || !arkts.isIdentifier(property.key)) {
                    return;
                }
                const childKeyName = property.key.name;
                if (childKeyName !== '') {
                    childKeyNameArray.push(childKeyName);
                }
            });
        });
        return childKeyNameArray;
    }

    private checkMustInitialize(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node) || !node.expression) {
            return;
        }
        if (!arkts.isIdentifier(node.expression)) {
            return;
        }
        const structName: string = getIdentifierName(node.expression);
        if (!this.mustInitMap.has(structName)) {
            return;
        }
        // Get all the properties of a record via StructName
        const mustInitProperty: Map<string, string> = this.mustInitMap.get(structName)!;
        const childKeyNameArray: string[] = this.getChildKeyNameArray(node);
        // If an attribute that must be initialized is not initialized, an error is reported
        mustInitProperty.forEach((value, key) => {
            if (!childKeyNameArray.includes(key)) {
                this.report({
                    node: node,
                    message: this.messages.requireVariableInitializationViaComponentConstructor,
                    data: {
                        varName: key,
                    },
                });
            }
        });
    }

    private checkCannotInitialize(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node) || !node.expression) {
            return;
        }
        if (!arkts.isIdentifier(node.expression)) {
            return;
        }
        const structName: string = getIdentifierName(node.expression);
        if (!this.cannotInitMap.has(structName)) {
            return;
        }
        // Get all the properties of a record via StructName
        const cannotInitName: Map<string, string> = this.cannotInitMap.get(structName)!;
        node.arguments.forEach((member) => {
            member.getChildren().forEach((property) => {
                if (!arkts.isProperty(property)) {
                    return;
                }
                if (!property.key || !arkts.isIdentifier(property.key)) {
                    return;
                }
                const propertyName = property.key.name;
                // If a property that cannot be initialized is initialized, an error is reported
                if (cannotInitName.has(propertyName)) {
                    const propertyType: string = cannotInitName.get(propertyName)!;
                    this.report({
                        node: property,
                        message: this.messages.disallowVariableInitializationViaComponentConstructor,
                        data: {
                            decoratorName: `@${propertyType}`,
                            varName: propertyName,
                            customComponentName: structName
                        },
                    });
                }
            });
        });
    }
}

export default VariableInitializationViaComponentConstructorRule;