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
            variableMixVerifyMessage: `The '{{parentPropAnnotations}}' property '{{parentPropName}}' cannot be assigned to the '{{childPropAnnotation}}' property '{{childPropName}}' when interop.`,
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
        this.checkVariableInitializationWithDecorator(node);
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

    private isDynStructForVerifyDecorator(node: arkts.MemberExpression): boolean {
        const symbol: arkts.AstNode | undefined = this.getProperty(node);
        if (!symbol || !arkts.isMethodDefinition(symbol)) {
            return false;
        }
        return this.isDynStruct(symbol);
    }

    private getProperty(node: arkts.MemberExpression): arkts.AstNode | undefined {
        const property = node.property;
        if (!arkts.isIdentifier(property)) {
            return undefined;
        }
        const propertyName: string = property.name;
        if (propertyName !== $_INVOKE) {
            return undefined;
        }
        const symbol: arkts.AstNode | undefined = arkts.getDecl(property);
        return symbol;
    }

    private checkVariableInitializationWithDecorator(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node) ||
            !node.expression ||
            !arkts.isMemberExpression(node.expression) ||
            !this.isDynStructForVerifyDecorator(node.expression) ||
            !node.arguments ||
            node.arguments.length === 0) {
            return;
        }
        let structDecl: arkts.AstNode | undefined = undefined;
        if (node.expression.object && arkts.isIdentifier(node.expression.object)) {
            structDecl = arkts.getDecl(node.expression.object);
        }
        if (!structDecl) {
            return;
        }
        const isComponentV2InDyn = structDecl.annotations.some((annotation) =>
            arkts.isIdentifier(annotation.expr) && annotation.expr.name === PresetDecorators.COMPONENT_V2
        );
        const propertiesMapInDyn: Map<string, string[]> = this.getChildPropertyMap(structDecl);
        if (propertiesMapInDyn.size <= 0) {
            return;
        }
        node.arguments.forEach((member: arkts.AstNode) => {
            if (!arkts.isObjectExpression(member)) {
                return;
            }
            member.properties.forEach((item: arkts.AstNode) => {
                this.handleCallExpression(node, item, isComponentV2InDyn, propertiesMapInDyn);
            });
        });
    }
    
    private getChildPropertyMap(structDecl: arkts.AstNode): Map<string, string[]> {
        const propertiesMapInDyn: Map<string, string[]> = new Map();
        structDecl.getChildren?.().forEach((member: arkts.AstNode) => {
            if (!arkts.isClassProperty(member) ||
                !member.key ||
                !arkts.isIdentifier(member.key) ||
                !member.key.name ||
                member.key.name === '') {
                return;
            }
            const childProName: string = member.key.name;
            if (childProName === '') {
                return;
            }
            const childPropAnnotationsArray: string[] = this.getPropAnnotationsArray(member);
            propertiesMapInDyn.set(childProName, childPropAnnotationsArray);
        });
        return propertiesMapInDyn;
    }

    private handleCallExpression(
        node: arkts.AstNode,
        item: arkts.AstNode, 
        isComponentV2InDyn: boolean,
        propertiesMapInDyn: Map<string, string[]>
    ): void {
        if (!arkts.isProperty(item) || !item.key || !arkts.isIdentifier(item.key) ||
            !item.key.name || item.key.name === '') {
            return;
        }
        const childPropName: string = item.key.name;
        const childPropAnnotation: string[] | undefined =
            this.getChildPropAnnotationFromMap(propertiesMapInDyn, childPropName);
        if (!childPropAnnotation || childPropAnnotation.length === 0) {
            return;
        }
        if (item.value && arkts.isMemberExpression(item.value) &&
            item.value.property && arkts.isIdentifier(item.value.property)) {
            const paramNode: arkts.AstNode | undefined = arkts.getDecl(item.value.property);
            if (!paramNode) {
                return;
            }
            const parentPropName: string = item.value.property.name;
            const parentPropAnnotations: string = this.getPropAnnotationsString(paramNode);
            const parentNodeOfParam: arkts.AstNode | undefined = paramNode.parent;
            if (!parentNodeOfParam || !parentNodeOfParam.annotations || parentNodeOfParam.annotations.length === 0) {
                return;
            }
            const isNeedReport: boolean =
                this.getIsReport(parentNodeOfParam, item, childPropAnnotation, isComponentV2InDyn);
            let childPropAnnotationString: string = '';
            childPropAnnotation.forEach((name: string) => {
                childPropAnnotationString += name;
            });
            if (parentPropAnnotations === '' || !isNeedReport || childPropAnnotationString === '') {
                return;
            }
            this.report({
                node: node,
                message: this.messages.variableMixVerifyMessage,
                data: {
                    parentPropAnnotations: parentPropAnnotations,
                    parentPropName: parentPropName,
                    childPropAnnotation: childPropAnnotationString,
                    childPropName: childPropName,
                }
            });
        }
    }

    private getChildPropAnnotationFromMap(
        propertiesMapInDyn: Map<string, string[]>,
        childPropName: string
    ): string[] | undefined {
        let childPropAnnotation: string[] | undefined = undefined;
        if (propertiesMapInDyn.has(childPropName)) {
            childPropAnnotation = propertiesMapInDyn.get(childPropName);
        }
        return childPropAnnotation;
    }

    private getPropAnnotationsString(node: arkts.AstNode): string {
        let propAnnotationsString: string = `${PresetDecorators.REGULAR}`;
        if (arkts.isClassProperty(node) && node.annotations && node.annotations.length > 0) {
            propAnnotationsString = '';
            node.annotations.forEach((annotation) => {
                if (annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name) {
                    propAnnotationsString += `@${annotation.expr.name}`;
                }
            })  
        }
        return propAnnotationsString;
    }

    private getPropAnnotationsArray(node: arkts.AstNode): string[] {
        let propAnnotationsArray: string[] = [];
        propAnnotationsArray.push(`${PresetDecorators.REGULAR}`);
        if (arkts.isClassProperty(node) && node.annotations && node.annotations.length > 0) {
            propAnnotationsArray = [];
            node.annotations.forEach((annotation) => {
                if (annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name) {
                    propAnnotationsArray.push(`@${annotation.expr.name}`);
                }
            })
        }
        return propAnnotationsArray;
    }

    private getIsReport(
        parentNodeOfParam: arkts.AstNode,
        item: arkts.Property,
        childPropAnnotation: string[],
        isComponentV2InDyn: boolean
    ): boolean {
        if (!item.value) {
            return false;
        }
        const isComponentV2 = parentNodeOfParam.annotations.some((annotation) =>
            arkts.isIdentifier(annotation.expr) && annotation.expr.name === PresetDecorators.COMPONENT_V2);
        const isThisExpression: boolean =
            arkts.isMemberExpression(item.value) && arkts.isThisExpression(item.value.object);
        let isNeedReport: boolean = false;
        if (isComponentV2) {
            const isBan: boolean =
                childPropAnnotation.some(item => item === `@${PresetDecorators.STATE}`) ||
                childPropAnnotation.some(item => item === `@${PresetDecorators.PROP}`) ||
                childPropAnnotation.some(item => item === `@${PresetDecorators.PROVIDE}`);
            isNeedReport = !isComponentV2InDyn && isBan && isThisExpression;
        } else {
            const isParam: boolean = childPropAnnotation.some(item => item === `@${PresetDecorators.PARAM}`);
            isNeedReport = isComponentV2InDyn && isParam && isThisExpression;
        }
        return isNeedReport;
    }
}

export default VariableInitializationViaComponentConstructorRule;