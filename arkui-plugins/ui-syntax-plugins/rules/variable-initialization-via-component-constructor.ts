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

import { FileManager } from '../../common/file-manager';
import { LANGUAGE_VERSION } from '../../common/predefines';

import {
    getIdentifierName,
    getAnnotationName,
    getClassPropertyAnnotationNames,
    PresetDecorators,
    $_INVOKE, COMPONENT_BUILDER
} from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

interface PropertyInitInfo {
    hasRequire: boolean;
    hasBuilderParam: boolean;
    hasTrailingClosure: boolean;
    shouldInitViaComponentConstructor: boolean;
    cannotInitViaComponentConstructor: boolean;
    annotationName: string;
}

class VariableInitializationViaComponentConstructorRule extends AbstractUISyntaxRule {
    private mustInitMap: Map<string, Map<string, arkts.ClassProperty>> = new Map();
    private cannotInitMap: Map<string, Map<string, string>> = new Map();

    private static readonly mustInitInConstructorDecorators: string[][] = [
        [PresetDecorators.REQUIRE],
        [PresetDecorators.REQUIRE, PresetDecorators.STATE],
        [PresetDecorators.REQUIRE, PresetDecorators.PROVIDE],
        [PresetDecorators.REQUIRE, PresetDecorators.PROP_REF],
        [PresetDecorators.REQUIRE, PresetDecorators.BUILDER_PARAM],
        [PresetDecorators.REQUIRE, PresetDecorators.PARAM]
    ];

    private static readonly shouldInitViaComponentConstructor: string[] = [
        PresetDecorators.LINK,
        PresetDecorators.OBJECT_LINK
    ];

    private static readonly disallowInitViaComponentConstructor: string[] = [
        PresetDecorators.CONSUME,
        PresetDecorators.STORAGE_LINK,
        PresetDecorators.STORAGE_PROP_REF,
        PresetDecorators.LOCAL_STORAGE_LINK,
        PresetDecorators.LOCAL_STORAGE_PROP_REF
    ];

    public setup(): Record<string, string> {
        return {
            shouldInitializeViaComponentConstructor: `The property '{{varName}}' must be initialized through the component constructor.`,
            requireVariableInitializationViaComponentConstructor: `'@Require' decorated '{{varName}}' must be initialized through the component constructor.`,
            disallowVariableInitializationViaComponentConstructor: `The '{{decoratorName}}' property '{{varName}}' in the custom component '{{customComponentName}}' cannot be initialized here (forbidden to specify).`,
        };
    }

    public beforeTransform(): void {
        this.mustInitMap = new Map();
        this.cannotInitMap = new Map();
    }

    public parsed(node: arkts.AstNode): void {
        this.initMap(node);
        this.checkMustInitialize(node);
        this.checkCannotInitialize(node);
    }

    public checked(node: arkts.StructDeclaration): void {
        this.checkVariableInitializationViaConstructor(node);
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

    private isComponentBuilder(node: arkts.MemberExpression): boolean {
        const property = node.property;
        if (!arkts.isIdentifier(property)) {
            return false;
        }
        const propertyName: string = property.name;
        if (propertyName !== $_INVOKE) {
            return false;
        }
        const symbol: arkts.AstNode | undefined = arkts.getDecl(property);
        if (!symbol || !arkts.isMethodDefinition(symbol)) {
            return false;
        }
        return symbol.scriptFunction.annotations.some(annotation => {
            return annotation.expr && arkts.isIdentifier(annotation.expr) &&
                annotation.expr.name === COMPONENT_BUILDER;
        }) || this.isDynStruct(symbol);
    }

    isDynStruct(symbol: arkts.AstNode): boolean {
        const fileManager: FileManager = FileManager.getInstance();
        const path: string = arkts.getProgramFromAstNode(symbol)?.absName;
        const version: string = LANGUAGE_VERSION.ARKTS_1_1;
        return fileManager.getLanguageVersionByFilePath(path) === version;
    }

    private checkVariableInitializationViaConstructor(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node) || !node.expression) {
            return;
        }
        if (!arkts.isIdentifier(node.expression) && !arkts.isMemberExpression(node.expression)) {
            return;
        }
        let structName: string = '';
        let structDecl: arkts.AstNode | undefined = undefined;
        if (arkts.isMemberExpression(node.expression)) {
            if (!this.isComponentBuilder(node.expression) ||
                !arkts.isIdentifier(node.expression.object)) {
                return;
            }
            structName = node.expression.object.name;
            structDecl = arkts.getDecl(node.expression.object);
        } else {
            structName = getIdentifierName(node.expression);
            structDecl = arkts.getDecl(node.expression);
        }
        if (!structDecl) {
            return;
        }
        const props: string[] = this.getChildKeyNameArray(node);
        const hasTrailingClosure: boolean = node.isTrailingCall;
        structDecl?.getChildren?.().forEach(member => {
            if (!arkts.isClassProperty(member) || !member.key || !arkts.isIdentifier(member.key)) {
                return;
            }
            const propertyName: string = member.key.name;
            if (member.annotations.length === 0 || propertyName === '') {
                return;
            }
            const propertyInitInfo: PropertyInitInfo = this.getStructPropertyInfo(member, hasTrailingClosure);
            const messageId: string | undefined = this.getMessageId(propertyInitInfo, propertyName, props);
            if (!messageId) {
                return;
            }
            this.report({
                node: node,
                message: messageId,
                data: {
                    decoratorName: `@${propertyInitInfo.annotationName}`,
                    varName: propertyName,
                    customComponentName: structName,
                },
            });
        });
    }

    private getStructPropertyInfo(member: arkts.ClassProperty, hasTrailingClosure: boolean): PropertyInitInfo {
        let hasRequire: boolean = false;
        let hasBuilderParam: boolean = false;
        let shouldInitializeViaComponentConstructor: boolean = false;
        let cannotInitViaComponentConstructor: boolean = false;
        let annotationName: string = '';
        const annotationArray: string[] = getClassPropertyAnnotationNames(member);
        annotationArray.forEach(annotation => {
            if (annotation === PresetDecorators.REQUIRE) {
                hasRequire = true;
            }
            if (annotation === PresetDecorators.BUILDER_PARAM) {
                hasBuilderParam = true;
            }
            if (VariableInitializationViaComponentConstructorRule.disallowInitViaComponentConstructor.includes(annotation)) {
                cannotInitViaComponentConstructor = true;
                annotationName = annotation;
            }
            if (VariableInitializationViaComponentConstructorRule.shouldInitViaComponentConstructor.includes(annotation)) {
                shouldInitializeViaComponentConstructor = true;
            }
        });
        return {
            hasRequire: hasRequire,
            hasBuilderParam: hasBuilderParam,
            hasTrailingClosure: hasTrailingClosure,
            shouldInitViaComponentConstructor: shouldInitializeViaComponentConstructor,
            cannotInitViaComponentConstructor: cannotInitViaComponentConstructor,
            annotationName: annotationName
        };
    }

    private getMessageId(info: PropertyInitInfo, propertyName: string, props: string[]): string | undefined {
        let messageId: string | undefined = undefined;
        let hasProp: boolean = props.some(tempProp => tempProp === propertyName);
        if (info.hasRequire && !hasProp && !(info.hasTrailingClosure && info.hasBuilderParam)) {
            messageId = this.messages.requireVariableInitializationViaComponentConstructor;
        }
        if (info.shouldInitViaComponentConstructor && !hasProp) {
            messageId = this.messages.shouldInitializeViaComponentConstructor;
        }
        if (info.cannotInitViaComponentConstructor && hasProp) {
            messageId = this.messages.disallowVariableInitializationViaComponentConstructor;
        }
        return messageId;
    }

    // Define a function to add property data to the property map
    private addPropToMustInit(
        propertyMap: Map<string, Map<string, arkts.ClassProperty>>,
        structName: string,
        propertyName: string,
        property: arkts.ClassProperty
    ): void {
        if (!propertyMap.has(structName)) {
            propertyMap.set(structName, new Map());
        }
        const structProperties = propertyMap.get(structName);
        if (structProperties) {
            structProperties.set(propertyName, property);
        }
    }

    private addPropToCannotInit(
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
        if (
            !arkts.isClassProperty(item) ||
            !item.key ||
            !arkts.isIdentifier(item.key) ||
            item.annotations.length === 0
        ) {
            return;
        }
        const propertyName: string = item.key.name;
        if (propertyName === '') {
            return;
        }
        const annotationArray: string[] = getClassPropertyAnnotationNames(item);
        // If the member variable is decorated, it is added to the corresponding map
        VariableInitializationViaComponentConstructorRule.mustInitInConstructorDecorators.forEach(arr => {
            if (arr.every(annotation => annotationArray.includes(annotation))) {
                this.addPropToMustInit(this.mustInitMap, structName, propertyName, item);
            }
        });
        VariableInitializationViaComponentConstructorRule.disallowInitViaComponentConstructor.forEach(annotation => {
            if (annotationArray.includes(annotation)) {
                this.addPropToCannotInit(this.cannotInitMap, structName, propertyName, annotation);
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
        const mustInitProperty: Map<string, arkts.ClassProperty> = this.mustInitMap.get(structName)!;
        const childKeyNameArray: string[] = this.getChildKeyNameArray(node);
        const hasTrailingClosure = !!node.trailingBlock;
        // If an attribute that must be initialized is not initialized, an error is reported
        mustInitProperty.forEach((value, key) => {
            const hasBuilderParam = value.annotations.some((annotation) => {
                return getAnnotationName(annotation) === PresetDecorators.BUILDER_PARAM;
            });
            if (hasTrailingClosure && hasBuilderParam) {
                return;
            }
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