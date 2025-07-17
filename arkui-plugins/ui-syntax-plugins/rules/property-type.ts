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
import { PresetDecorators, TypeFlags, getIdentifierName, findDecorator, hasAnnotation } from '../utils/index';

const v1DecoratorMustHasType = [
    PresetDecorators.STATE,
    PresetDecorators.PROP_REF,
    PresetDecorators.LINK,
    PresetDecorators.OBJECT_LINK,
    PresetDecorators.PROVIDE,
    PresetDecorators.CONSUME,
    PresetDecorators.STORAGE_PROP_REF,
    PresetDecorators.STORAGE_LINK,
    PresetDecorators.WATCH,
];

const v2DecoratorMustHasType = [
    PresetDecorators.LOCAL,
    PresetDecorators.PARAM,
    PresetDecorators.EVENT,
    PresetDecorators.PROVIDER,
    PresetDecorators.CONSUMER,
];

const propertyPropDecorator = [
    PresetDecorators.PROP_REF,
    PresetDecorators.STORAGE_PROP_REF,
];

const SimpleTypesUnSupported = [
    TypeFlags.Boolean,
    TypeFlags.String,
    TypeFlags.Number,
    TypeFlags.Enum,
    TypeFlags.BigInt,
];

const ARRAY_TYPES = ['Array', 'Map', 'Set', 'Date'];

const PropErrorType = ['Any', 'unknown'];

class PropertyTypeRule extends AbstractUISyntaxRule {
    private noObservedV2ClassNames: string[] = [];
    private observedV2ClassNames: string[] = [];
    private builderFunctionName: string[] = [];
    private currentStructBuilderMethodName: string[] = [];
    private structStaticMethodsMap: Map<string, Set<string>> = new Map();

    public setup(): Record<string, string> {
        return {
            propertyHasType: `The property '{{propertyName}}' must specify a type.`,
            propertyObjectLink: `'@ObjectLink' cannot be used with this type. Apply it only to classes decorated by '@Observed' or initialized using the return value of 'makeV1Observed'.`,
            propertyProp: `The '@{{decoratorName}}' decorated attribute '{{propertyName}}' must be of the string, number, boolean, enum or object type.`,
            propertyBuilderParam: `'@BuilderParam' property can only be initialized by '@Builder' function or '@Builder' method in struct.`,
        };
    }

    public beforeTransform(): void {
        this.noObservedV2ClassNames = [];
        this.observedV2ClassNames = [];
        this.builderFunctionName = [];
        this.currentStructBuilderMethodName = [];
        this.structStaticMethodsMap = new Map();
    }

    public parsed(node: arkts.AstNode): void {
        this.collectObservedV1AndV2ClassNameAndEnumName(node);
        this.validatePropertyTypeAndDecorators(node);
        this.getBuilderFunctionNameAndStaticMethods(node);
        this.getStructNameWithMultiplyBuilderParam(node);
    }

    private collectObservedV1AndV2ClassNameAndEnumName(
        node: arkts.AstNode,
    ): void {
        // Check if it's of type "Program".  
        if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
            return;
        }
        // Traverse all child nodes of the Program
        for (const child of node.getChildren()) {
            // Check if it is of the ClassDeclaration type
            if (arkts.isClassDeclaration(child) && child.definition) {
                // Get a list of annotators
                const annotations = child.definition.annotations;

                // Check for @ObservedV2 decorators
                const observedV2Decorator = hasAnnotation(annotations, PresetDecorators.OBSERVED_V2);

                if (!observedV2Decorator && child.definition && child.definition.ident) {
                    // If there is a @Observed decorator, record the class name
                    const className = child.definition.ident.name;
                    this.noObservedV2ClassNames.push(className);
                }
                if (observedV2Decorator && child.definition && child.definition.ident) {
                    // If there is a @ObservedV2 decorator, record the class name
                    const v2ClassName = child.definition.ident.name;
                    this.observedV2ClassNames.push(v2ClassName);
                }
            }
        }
    }

    private areAllUnionMembersValid(unionType: arkts.ETSUnionType): boolean {
        const members = unionType.types;
        // At least one valid type All types must be allowed types and do not contain illegal combinations
        let isValidType = false;
        for (const member of members) {
            if (arkts.isETSTypeReference(member) &&
                member.part &&
                member.part.name &&
                arkts.isIdentifier(member.part.name)) {
                const propertyTypeName = member.part.name.name;
                // If it's a simple type or ObservedV2, reject the entire union type outright
                if (this.observedV2ClassNames.includes(propertyTypeName) ||
                    SimpleTypesUnSupported.includes(propertyTypeName) ||
                    PropErrorType.includes(propertyTypeName)) {
                    return false;
                }
                if (this.noObservedV2ClassNames.includes(propertyTypeName) || ARRAY_TYPES.includes(propertyTypeName)) {
                    isValidType = true;
                }
            } else if (arkts.isETSPrimitiveType(member) ||
                arkts.nodeType(member) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_STRING_LITERAL_TYPE ||
                arkts.nodeType(member) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ERROR_TYPE_NODE) {
                return false;
            } else if (arkts.nodeType(member) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_NULL_TYPE ||
                arkts.isETSUndefinedType(member)) {
                continue;
            }
        }
        return isValidType;
    }

    private areAllUnionMembersNotAnyAndBigint(unionType: arkts.ETSUnionType): boolean {
        const members = unionType.types;
        for (const member of members) {
            if (arkts.isETSTypeReference(member) &&
                member.part &&
                member.part.name &&
                arkts.isIdentifier(member.part.name)) {
                const propertyTypeName = member.part.name.name;
                if (propertyTypeName === PropErrorType[0] || propertyTypeName === TypeFlags.BigInt) {
                    return false;
                }
            } else if (arkts.nodeType(member) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ERROR_TYPE_NODE) {
                return false;
            }
        }
        return true;
    }

    private validatePropertyTypeAndDecorators(
        node: arkts.AstNode
    ): void {
        //Check whether the current node is a property
        if (!arkts.isClassProperty(node) || !node.key || !arkts.isIdentifier(node.key)) {
            return;
        }
        const propertyName = node.key.name;
        // Gets the type of property
        const propertyType = node.typeAnnotation;
        const mustHasTypeDecorator = node.annotations.some(annotation =>
            annotation.expr && arkts.isIdentifier(annotation.expr) &&
            (v1DecoratorMustHasType.includes(annotation.expr.name) ||
                v2DecoratorMustHasType.includes(annotation.expr.name))
        );
        const nodeKey = node.key;
        // Check if there is a type declaration
        if (!propertyType && nodeKey && mustHasTypeDecorator) {
            this.report({
                node: nodeKey,
                message: this.messages.propertyHasType,
                data: {
                    propertyName,
                },
            });
        }
        if (propertyType &&
            arkts.nodeType(propertyType) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ERROR_TYPE_NODE &&
            nodeKey &&
            mustHasTypeDecorator) {
            this.report({
                node: nodeKey,
                message: this.messages.propertyHasType,
                data: {
                    propertyName,
                },
            });
        }
        const objectLinkDecorator = findDecorator(node, PresetDecorators.OBJECT_LINK);
        // Determine whether the property has @Objectlink
        if (objectLinkDecorator && propertyType) {
            this.validateObjectLinkPropertyType(propertyType, nodeKey);
        }
        this.processPropertyAnnotations(node, propertyType, propertyName, nodeKey);
    }

    private validateObjectLinkPropertyType(
        propertyType: arkts.TypeNode,
        nodeKey: arkts.Identifier
    ): void {
        if (arkts.isETSTypeReference(propertyType) &&
            propertyType.part &&
            propertyType.part.name &&
            arkts.isIdentifier(propertyType.part.name)) {
            const propertyTypeName = propertyType.part.name.name;
            if (this.observedV2ClassNames.includes(propertyTypeName) ||
                SimpleTypesUnSupported.includes(propertyTypeName) ||
                PropErrorType.includes(propertyTypeName)) {
                this.report({
                    node: nodeKey,
                    message: this.messages.propertyObjectLink,
                });
            }
        } else if (arkts.nodeType(propertyType) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_STRING_LITERAL_TYPE ||
            arkts.nodeType(propertyType) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_NULL_TYPE ||
            arkts.nodeType(propertyType) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ERROR_TYPE_NODE ||
            arkts.isETSPrimitiveType(propertyType) ||
            arkts.isETSUndefinedType(propertyType)
        ) {
            this.report({
                node: nodeKey,
                message: this.messages.propertyObjectLink,
            });
        }
        if (arkts.isETSUnionType(propertyType)) {
            if (!this.areAllUnionMembersValid(propertyType)) {
                this.report({
                    node: nodeKey,
                    message: this.messages.propertyObjectLink,
                });
            }
        }
    }

    private processPropertyAnnotations(
        node: arkts.ClassProperty,
        propertyType: arkts.TypeNode | undefined,
        propertyName: string,
        nodeKey: arkts.Identifier,
    ): void {
        // Iterate through all annotations
        node.annotations?.forEach(annotation => {
            if (!propertyType || !annotation.expr || !arkts.isIdentifier(annotation.expr)) {
                return;
            }
            const decoratorName = annotation.expr.name;
            if (!arkts.isETSUnionType(propertyType)) {
                this.reportIfInvalidPropType(propertyType, decoratorName, propertyName, nodeKey);
            } else if (arkts.isETSUnionType(propertyType)) {
                this.reportIfInvalidUnionPropType(propertyType, decoratorName, propertyName, nodeKey);
            }
        });
    }

    private reportIfInvalidPropType(
        propertyType: arkts.TypeNode,
        decoratorName: string,
        propertyName: string,
        nodeKey: arkts.Identifier,
    ): void {
        if (arkts.isETSTypeReference(propertyType) &&
            propertyType.part &&
            propertyType.part.name &&
            arkts.isIdentifier(propertyType.part.name)) {
            const propertyTypeName = propertyType.part.name.name;
            if ((propertyPropDecorator.includes(decoratorName)) && nodeKey) {
                // Check if the @Prop property is of any or bigint
                if (propertyTypeName === PropErrorType[0] ||
                    propertyTypeName === TypeFlags.BigInt
                ) {
                    this.report({
                        node: nodeKey,
                        message: this.messages.propertyProp,
                        data: {
                            decoratorName,
                            propertyName,
                        },
                    });
                }
            }
        }
    }

    private reportIfInvalidUnionPropType(
        propertyType: arkts.ETSUnionType,
        decoratorName: string,
        propertyName: string,
        nodeKey: arkts.Identifier,
    ): void {
        if (!this.areAllUnionMembersNotAnyAndBigint(propertyType) && propertyPropDecorator.includes(decoratorName)) {
            this.report({
                node: nodeKey,
                message: this.messages.propertyProp,
                data: {
                    decoratorName,
                    propertyName,
                },
            });
        }
    }

    private getStructNameWithMultiplyBuilderParam(
        node: arkts.AstNode,
    ): void {
        if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
            return;
        }
        node.getChildren().forEach((member) => {
            // Only the situation within the component is judged
            if (!arkts.isStructDeclaration(member) || !member.definition.ident) {
                return;
            }
            this.getCurrentStructBuilderMethodName(member);
            member.definition?.body?.forEach((item) => {
                this.checkBuilderParamInitialization(item);
            });
            this.currentStructBuilderMethodName.length = 0;
        });
    }

    private checkBuilderParamInitialization(
        item: arkts.AstNode
    ): void {
        if (!arkts.isClassProperty(item) || !item.key) {
            return;
        }
        const builderParamDecorator = findDecorator(item, PresetDecorators.BUILDER_PARAM);
        if (item.value && !arkts.isMemberExpression(item.value) && !arkts.isIdentifier(item.value) &&
            builderParamDecorator) {
            this.reportInvalidBuilderParamInitialized(item.key);
        } else if (item.value && arkts.isMemberExpression(item.value) && builderParamDecorator) {
            this.checkValidMemberExpressionUsage(item.value, item.key);
        } else if (item.value && arkts.isIdentifier(item.value) && item.typeAnnotation && builderParamDecorator) {
            if (arkts.isETSFunctionType(item.typeAnnotation) &&
                !this.builderFunctionName.includes(item.value.name)) {
                this.reportInvalidBuilderParamInitialized(item.key);
            }
        }
    }

    private checkValidMemberExpressionUsage(
        itemValue: arkts.MemberExpression,
        itemKey: arkts.Expression
    ): void {
        if (!arkts.isThisExpression(itemValue.object) && !arkts.isIdentifier(itemValue.object)) {
            this.reportInvalidBuilderParamInitialized(itemKey);
        } else if (arkts.isThisExpression(itemValue.object) &&
            arkts.isIdentifier(itemValue.property) &&
            !this.currentStructBuilderMethodName.includes(itemValue.property.name)) {
            this.reportInvalidBuilderParamInitialized(itemKey);
        } else if (arkts.isIdentifier(itemValue.object) && arkts.isIdentifier(itemValue.property)) {
            const structName = getIdentifierName(itemValue.object);
            const staticMethodsName = getIdentifierName(itemValue.property);
            const methods = this.structStaticMethodsMap.get(structName);
            if (methods && !methods.has(staticMethodsName)) {
                this.reportInvalidBuilderParamInitialized(itemKey);
            }
        }
    }

    private reportInvalidBuilderParamInitialized(node: arkts.AstNode): void {
        this.report({
            node: node,
            message: this.messages.propertyBuilderParam,
        });
    }

    private getBuilderFunctionNameAndStaticMethods(
        node: arkts.AstNode
    ): void {
        if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
            return;
        }
        node.getChildren().forEach((member) => {
            if (arkts.isFunctionDeclaration(member) && member.scriptFunction.id?.name) {
                const hasBuilderDecorator = findDecorator(member, PresetDecorators.BUILDER);
                if (hasBuilderDecorator) {
                    this.builderFunctionName.push(member.scriptFunction.id?.name);
                }
            }
            if (arkts.isStructDeclaration(member) && member.definition.ident) {
                let structName = member.definition.ident.name;
                this.structStaticMethodsMap.set(structName, new Set());
                member.definition.body.forEach((item) => {
                    this.collectBuilderStaticMethodFromStruct(item, structName);
                });
            }
        });
    }

    private collectBuilderStaticMethodFromStruct(
        item: arkts.AstNode,
        structName: string
    ): void {
        if (!arkts.isMethodDefinition(item) || !item.scriptFunction.id || !item.isStatic) {
            return;
        }
        const hasBuilderDecorator = findDecorator(item.scriptFunction, PresetDecorators.BUILDER);
        // judgment static method
        if (hasBuilderDecorator && arkts.isIdentifier(item.scriptFunction.id) && item.isStatic) {
            const methodName = item.scriptFunction.id.name;
            this.structStaticMethodsMap.get(structName)?.add(methodName);
        }
    }

    private getCurrentStructBuilderMethodName(
        node: arkts.StructDeclaration
    ): void {
        node.definition?.body?.forEach((item) => {
            if (!arkts.isMethodDefinition(item) || !item.scriptFunction.id) {
                return;
            }
            const builderDecorator = findDecorator(item.scriptFunction, PresetDecorators.BUILDER);
            // judgment static method
            if (builderDecorator && arkts.isIdentifier(item.scriptFunction.id) && !item.isStatic) {
                this.currentStructBuilderMethodName.push(item.scriptFunction.id.name);
            }
        });
    }
}

export default PropertyTypeRule;