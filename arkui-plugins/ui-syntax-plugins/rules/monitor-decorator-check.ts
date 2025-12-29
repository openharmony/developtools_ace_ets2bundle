/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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
import { getAnnotationUsage, PresetDecorators, getClassAnnotationUsage, getClassPropertyName, getClassPropertyAnnotationNames, TypeFlags } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

interface MonitorPathValidationContext {
    type: string;
    node: arkts.ClassDeclaration | arkts.StructDeclaration;
    hasProperty?: (name: string) => boolean;
    hasStateVariable?: (name: string, isGetMethod: boolean) => boolean;
    variableMap?: Map<string, string[]>;
    requiredDecorators?: string[];
    hasRequiredDecorator?: boolean;
}

interface HandleMapSetTypeParams {
    monitorDecorator: arkts.AnnotationUsage;
    firstSegment: string;
    firstSegmentTypeName: string | undefined;
    memberSegments: string[];
    isGetMethod: boolean;
    context: MonitorPathValidationContext;
}

interface ArrayDimension {
    typeName: string,
    dimension: number
}

const CONTEXT_TYPE_CLASS = 'class';
const CONTEXT_TYPE_STRUCT = 'struct';

const STRUCT_REQUIRED_DECORATORS = [
    PresetDecorators.LOCAL,
    PresetDecorators.PARAM,
    PresetDecorators.PROVIDER,
    PresetDecorators.CONSUMER,
    PresetDecorators.COMPUTED
];

enum ArrayTypes {
  Array = 'Array',
  Map   = 'Map',
  Set   = 'Set',
  Date  = 'Date'
}

class MonitorDecoratorCheckRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            monitorUsedAlone:
                `The member property or method can not be decorated by multiple built-in annotations.`,
            monitorUsedInObservedV2Class:
                `The '@Monitor' can decorate only member method within a 'class' decorated with @ObservedV2.`,
            monitorUsedInComponentV2Struct:
                `The '@Monitor' annotation can only be used in a 'struct' decorated with '@ComponentV2'.`,
            monitorDecorateMethod:
                `@Monitor can only decorate method.`,
            monitorTargetInvalid:
                `The Monitor decorator needs to monitor the state variables that exist.`
        };
    }

    public parsed(node: arkts.AstNode): void {
        this.initList(node);
        if (!arkts.isClassDeclaration(node) && !arkts.isStructDeclaration(node)) {
            return;
        }

        const monitorDecorator = this.checkMonitorUsage(node);
        if (monitorDecorator && arkts.isClassDeclaration(node)) {
            this.checkMonitorInClass(node, monitorDecorator);
            this.checkMonitorInObservedV2Trace(node);
        }

        if (monitorDecorator && arkts.isStructDeclaration(node)) {
            this.checkMonitorInStruct(node, monitorDecorator);
            this.checkMonitorInComponentV2(node);
        }
        this.checkDecorateMethod(node);
    }

    private collectNode: Map<string, arkts.AstNode> = new Map();
    private enumMemberValues: Map<string, string> = new Map();
    private initList(node: arkts.AstNode): void {
        if (!arkts.isEtsScript(node) || node.isNamespace) {
            return;
        }
        node.statements.forEach((member) => {
            this.collectClassDeclaration(member);
            this.collectInterfaceDeclaration(member);
            this.collectEnumDeclaration(member);
        });
    }

    private collectClassDeclaration(member: arkts.AstNode): void {
        if (!arkts.isClassDeclaration(member)) {
            return;
        }
        if (member.definition && member.definition.ident?.name) {
            this.collectNode.set(member.definition.ident.name, member);
        }
    }

    private collectInterfaceDeclaration(member: arkts.AstNode): void {
        if (arkts.isTSInterfaceDeclaration(member) && member.id?.name) {
            this.collectNode.set(member.id.name, member);
        }
    }

    private collectEnumDeclaration(member: arkts.AstNode): void {
        if (arkts.nodeType(member) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_ENUM_DECLARATION) {
            return;
        }

        const enumDecl = member as arkts.TSEnumDeclaration;
        const enumName = this.getEnumName(enumDecl);
        if (!enumName || !enumDecl.members || enumDecl.members.length === 0) {
            return;
        }

        enumDecl.members.forEach((enumMember: arkts.AstNode) => {
            this.collectEnumMember(enumName, enumMember);
        });
    }

    private getEnumName(enumDecl: arkts.TSEnumDeclaration): string | undefined {
        if (!enumDecl.key || !arkts.isIdentifier(enumDecl.key)) {
            return undefined;
        }
        return enumDecl.key.name;
    }

    private collectEnumMember(enumNameStr: string, enumMember: arkts.AstNode): void {
        if (!arkts.isTSEnumMember(enumMember)) {
            return;
        }
        const memberNameStr = this.getEnumMemberName(enumMember);
        if (!memberNameStr || !enumMember.init) {
            return;
        }
        if (!arkts.isStringLiteral(enumMember.init)) {
            return;
        }
        const enumValue = enumMember.init.str;
        const key = `${enumNameStr}.${memberNameStr}`;
        this.enumMemberValues.set(key, enumValue);
    }

    private getEnumMemberName(enumMember: arkts.TSEnumMember): string | undefined {
        if (!enumMember.key || !arkts.isIdentifier(enumMember.key)) {
            return undefined;
        }
        return enumMember.key.name;
    }

    private checkMonitorInClass(
        node: arkts.ClassDeclaration,
        monitorDecorator: arkts.AnnotationUsage | undefined,
    ): void {
        if (!monitorDecorator) {
            return;
        }
        const isObservedV2 = this.checkDecorator(node, PresetDecorators.OBSERVED_V2);
        const observedV1Decorator = getClassAnnotationUsage(node, PresetDecorators.OBSERVED_V1);

        if (!isObservedV2 && !observedV1Decorator) {
            this.report({
                node: monitorDecorator,
                message: this.messages.monitorUsedInObservedV2Class,
                fix: () => {
                    return {
                        title: 'Add @ObservedV2 annotation',
                        range: [node.startPosition, node.startPosition],
                        code: `@${PresetDecorators.OBSERVED_V2}\n`
                    };
                }
            });
            return;
        }
        if (!isObservedV2 && observedV1Decorator) {
            this.report({
                node: monitorDecorator,
                message: this.messages.monitorUsedInObservedV2Class,
                fix: () => {
                    return {
                        title: 'Change @Observed to @ObservedV2',
                        range: [observedV1Decorator.startPosition, observedV1Decorator.endPosition],
                        code: `${PresetDecorators.OBSERVED_V2}`
                    };
                }
            });
        }
    }

    private checkMonitorInStruct(
        node: arkts.StructDeclaration,
        monitorDecorator: arkts.AnnotationUsage | undefined,
    ): void {
        if (!monitorDecorator) {
            return;
        }
        const componentV1Decorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);
        const isComponentV2 = this.checkDecorator(node, PresetDecorators.COMPONENT_V2);
        if (!isComponentV2 && !componentV1Decorator) {
            this.report({
                node: monitorDecorator,
                message: this.messages.monitorUsedInComponentV2Struct,
                fix: () => ({
                    title: 'Add @ComponentV2 annotation',
                    range: [node.startPosition, node.startPosition],
                    code: `@${PresetDecorators.COMPONENT_V2}\n`
                })
            });
            return;
        }

        if (!isComponentV2 && componentV1Decorator) {
            this.report({
                node: monitorDecorator,
                message: this.messages.monitorUsedInComponentV2Struct,
                fix: () => {
                    return {
                        title: 'Change @Component to @ComponentV2',
                        range: [componentV1Decorator.startPosition, componentV1Decorator.endPosition],
                        code: `${PresetDecorators.COMPONENT_V2}`
                    };
                }
            });
        }
    }

    private checkMonitorInObservedV2Trace(node: arkts.ClassDeclaration): void {
        const isObservedV2 = this.checkDecorator(node, PresetDecorators.OBSERVED_V2);
        if (!isObservedV2) {
            return;
        }
        node.definition?.body.forEach((body) => {
            if (!arkts.isMethodDefinition(body)) {
                return;
            }
            const monitorDecorator = this.getLocalMonitorUsed(body);
            const monitorPaths = this.getValueInMonitorAnnotation(monitorDecorator);
            if (!monitorDecorator || !monitorPaths) {
                return;
            }
            this.validateMonitorPathsInObservedV2Trace(monitorDecorator, monitorPaths, node);
        })
    }

    private validateMonitorPath(
        monitorDecorator: arkts.AnnotationUsage,
        path: string,
        context: MonitorPathValidationContext
    ): void {
        const segments = path.split('.').filter(s => s.trim());
        if (segments.length === 0) {
            return;
        }

        const firstSegment = segments[0];
        const memberSegments = segments.slice(1);
        const node = context.node;

        if (!this.checkFirstSegmentExists(context, firstSegment)) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
            return;
        }

        const property = this.getPropertyInDeclByName(node, firstSegment);
        if (property && !this.checkMonitorArrayIsValid(monitorDecorator, property, memberSegments, context)) {
            return;
        }

        const isGetMethod = this.isGetMethod(node, firstSegment);
        const firstSegmentTypeName = this.firstSegmentTypeName(firstSegment, node);

        if (isGetMethod && !firstSegmentTypeName) {
            return;
        }

        if (firstSegmentTypeName === TypeFlags.Union) {
            this.validateUnionTypePath(
                monitorDecorator,
                firstSegment,
                memberSegments,
                node,
                isGetMethod,
                context
            );
            return;
        }

        if (this.handleMapSetType({
            monitorDecorator,
            firstSegment,
            firstSegmentTypeName,
            memberSegments,
            isGetMethod,
            context
        })) {
            return;
        }

        if (memberSegments.length > 0 && firstSegmentTypeName) {
            this.handleNestedPath(monitorDecorator, firstSegment, memberSegments, firstSegmentTypeName, isGetMethod, node, context);
        } else {
            if (!this.checkFirstSegmentStateVariable(monitorDecorator, firstSegment, isGetMethod, context)) {
                return;
            }
        }
    }

    private checkMonitorArrayIsValid(
        monitorDecorator: arkts.AnnotationUsage,
        property: arkts.ClassProperty,
        memberSegments: string[],
        context: MonitorPathValidationContext
    ): boolean {
        const dimMap: Map<string, Set<number>> = this.getDimMapByProperty(property);
        const { typeName, dimension } = this.getMaxArrayDimension(dimMap);
        if (dimension === 0 || memberSegments.length === 0) {
            return true;
        }
        if (memberSegments.length === 1 && memberSegments[0] === 'length') {
            this.checkPropHasTargetDecorator(monitorDecorator, property, context);
            return false;
        }
        if (!this.isArrayIndex(memberSegments[0])) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
            return false;
        } else {
            this.checkMonitorArrayElementIsValid(
                monitorDecorator,
                property,
                memberSegments,
                dimMap,
                dimension,
                context
            );
            return false;
        }
    }

    private getDimMapByProperty(property: arkts.ClassProperty): Map<string, Set<number>> {
        const dimMap: Map<string, Set<number>> = new Map<string, Set<number>>();
        const typeAnnotation = property.typeAnnotation;
        if (!typeAnnotation) {
            return dimMap;
        }

        const addDim = (typeName: string, dim: number): void => {
            const set = dimMap.get(typeName) ?? new Set<number>();
            set.add(dim);
            dimMap.set(typeName, set);
        };

        if (arkts.isETSUnionType(typeAnnotation)) {
            const types = typeAnnotation.types;
            types.forEach((type) => {
                const { typeName, dimension } = this.getArrayDimensionByType(type);
                addDim(typeName, dimension);
            });
        } else if (arkts.isTSArrayType(typeAnnotation)) {
            const { typeName, dimension }= this.getArrayDimensionByType(typeAnnotation);
            addDim(typeName, dimension);
        }
        return dimMap;
    }

    private getMaxArrayDimension(dimMap: Map<string, Set<number>>): ArrayDimension {
        let typeName = '';
        let dimension = 0;
        for (const [name, dimSet] of dimMap) {
            for (const dim of dimSet) {
                if (dim > dimension) {
                    dimension = dim;
                    typeName = name;
                }
            }
        }
        return { typeName, dimension };
    }

    private checkPropHasTargetDecorator(
        monitorDecorator: arkts.AnnotationUsage,
        property: arkts.ClassProperty,
        context: MonitorPathValidationContext
    ): void {
        const hasDecoratorInClass = getClassPropertyAnnotationNames(property).includes(PresetDecorators.TRACE);
        const hasDecoratorInStruct = context.hasRequiredDecorator ?? false;
        if ((context.type === CONTEXT_TYPE_CLASS && !hasDecoratorInClass) ||
            (context.type === CONTEXT_TYPE_STRUCT && !hasDecoratorInStruct)) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
            return;
        }
        return;
    }

    private checkMonitorArrayElementIsValid(
        monitorDecorator: arkts.AnnotationUsage,
        property: arkts.ClassProperty,
        memberSegments: string[],
        dimMap: Map<string, Set<number>>,
        maxDim: number,
        context: MonitorPathValidationContext
    ): void {
        const nestDepth = this.getNestDepth(memberSegments);
        if (maxDim < nestDepth) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
            return;
        }
        if ((maxDim >= nestDepth) && memberSegments.length === nestDepth) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
            return;
        }

        const newSegments = memberSegments.slice(nestDepth);
        const equalDimTypes: Set<string> = this.getEqualDimTypes(dimMap, nestDepth);
        let memberExist = false;
        let currentType = '';
        for (const typeName of equalDimTypes) {
            if (this.memberSegmentsTypeName(typeName, newSegments)) {
                memberExist = true;
                currentType = typeName;
            }
        }
        if (!memberExist) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
            return;
        }
        if (this.checkOtherTypePossible(dimMap, currentType, nestDepth)) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
            return;
        };
        if (!this.checkNestedPathStateVariables(currentType, newSegments)) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
            return;
        }
        this.checkPropHasTargetDecorator(monitorDecorator, property, context)
    }

    private checkOtherTypePossible(dimMap: Map<string, Set<number>>, typeName: string, dim: number): boolean {
        for (const [name, dimSet] of dimMap) {
            for (const d of dimSet) {
                if (!(typeName === name && dim === d)) {
                    return true;
                }
            }
        }
        return false;
    }

    private getEqualDimTypes(dimMap: Map<string, Set<number>>, nestDepth: number): Set<string> {
        let equalDimTypes: Set<string> = new Set<string>();
        for (const [name, dimSet] of dimMap) {
            for (const dim of dimSet) {
                if (dim === nestDepth) {
                    equalDimTypes.add(name);
                }
            }
        }
        return equalDimTypes;
    }

    private getArrayDimensionByType(typeNode: arkts.TypeNode): ArrayDimension {
        let dimension = 0;
        let curNode: arkts.TypeNode = typeNode;
        while (arkts.isTSArrayType(curNode)) {
            dimension ++;
            if (!curNode.elementType) {
                break;
            }
            curNode = curNode.elementType;
        }
        let typeName = '';
        if (
            arkts.isETSTypeReference(curNode) &&
            curNode.part &&
            arkts.isETSTypeReferencePart(curNode.part) &&
            curNode.part.name &&
            arkts.isIdentifier(curNode.part.name)
        ) {
            typeName = curNode.part.name.name;
        }
        return {typeName, dimension};
    }

    private getNestDepth(memberSegments: string[]): number {
        let nestDepth = 0;
        for (const segment of memberSegments) {
            if (this.isArrayIndex(segment)) {
                nestDepth ++;
            } else {
                break;
            }
        }
        return nestDepth;
    }

    private isArrayIndex(str: string): boolean {
        return /^[0-9]+$/.test(str) && !/^0\d/.test(str) && Number.isSafeInteger(Number(str));
    }

    private getPropertyInDeclByName(
        node: arkts.ClassDeclaration | arkts.StructDeclaration,
        propertyName: string
    ): arkts.ClassProperty | undefined {
        const property = node.definition?.body?.find(member =>
            arkts.isClassProperty(member) &&
            member.key &&
            arkts.isIdentifier(member.key) &&
            member.key.name === propertyName
        );
        if (property) {
            return property as arkts.ClassProperty;
        }

        if (node.definition?.super && arkts.isETSTypeReference(node.definition.super)) {
            const superClassPart = node.definition.super.part;
            if (superClassPart && arkts.isETSTypeReferencePart(superClassPart) &&
                superClassPart.name && arkts.isIdentifier(superClassPart.name)) {
                const parentClassName = superClassPart.name.name;
                const parentNode = this.collectNode.get(parentClassName);
                if (parentNode && arkts.isClassDeclaration(parentNode)) {
                    return this.getPropertyInDeclByName(parentNode, propertyName);
                }
            }
        }

        return undefined;
    }

    private checkFirstSegmentExists(context: MonitorPathValidationContext, firstSegment: string): boolean {
        if (context.type === CONTEXT_TYPE_CLASS) {
            return !!(context.hasProperty && context.hasProperty(firstSegment));
        }
        return !!(context.variableMap && context.variableMap.get(firstSegment) !== undefined);
    }

    private handleMapSetType(params: HandleMapSetTypeParams): boolean {
        const { monitorDecorator, firstSegment, firstSegmentTypeName, memberSegments, isGetMethod, context } = params;
        if (!firstSegmentTypeName) {
            return false;
        }

        const isMapOrSet = this.isMapType(firstSegmentTypeName) || this.isSetType(firstSegmentTypeName);
        if (!isMapOrSet) {
            return false;
        }

        if (memberSegments.length > 0) {
            return this.handleMapSetTypeWithMembers(monitorDecorator, firstSegment, memberSegments, isGetMethod, context);
        }

        return this.handleMapSetTypeWithoutMembers(monitorDecorator, firstSegment, isGetMethod, context);
    }

    private handleMapSetTypeWithMembers(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegment: string,
        memberSegments: string[],
        isGetMethod: boolean,
        context: MonitorPathValidationContext
    ): boolean {
        const isSizeProperty = memberSegments.length === 1 && memberSegments[0] === 'size';
        if (isSizeProperty) {
            this.handleSizeProperty(monitorDecorator, firstSegment, isGetMethod, context);
            return true;
        }

        if (memberSegments.length > 1 && memberSegments[0] === 'size') {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
            return true;
        }

        return true;
    }

    private handleSizeProperty(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegment: string,
        isGetMethod: boolean,
        context: MonitorPathValidationContext
    ): void {
        if (context.type === CONTEXT_TYPE_CLASS) {
            if (this.checkFirstSegmentStateVariable(monitorDecorator, firstSegment, isGetMethod, context)) {
                this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
            }
        } else {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
        }
    }

    private handleMapSetTypeWithoutMembers(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegment: string,
        isGetMethod: boolean,
        context: MonitorPathValidationContext
    ): boolean {
        if (context.type === CONTEXT_TYPE_CLASS) {
            if (!this.checkFirstSegmentStateVariable(monitorDecorator, firstSegment, isGetMethod, context)) {
                return true;
            }
        } else {
            if (!context.hasRequiredDecorator) {
                this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
            }
        }
        return true;
    }

    private getPropTypeNameFromTypeName(typeName: string, element: string): string | undefined {
        const typeNode = this.collectNode.get(typeName);
        if (!typeNode) {
            return undefined;
        }
        return this.getPropTypeName(typeNode, element);
    }

    private handleNestedPath(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegment: string,
        memberSegments: string[],
        firstSegmentTypeName: string,
        isGetMethod: boolean,
        node: arkts.ClassDeclaration | arkts.StructDeclaration,
        context: MonitorPathValidationContext
    ): void {
        const memberExist = this.memberSegmentsTypeName(firstSegmentTypeName, memberSegments);
        if (!memberExist) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
            return;
        }

        if (!this.checkFirstSegmentStateVariable(monitorDecorator, firstSegment, isGetMethod, context)) {
            return;
        }
        if (memberSegments.length > 0) {
            const firstMemberSegment = memberSegments[0];
            const firstMemberTypeName = this.getPropTypeNameFromTypeName(firstSegmentTypeName, firstMemberSegment);

            if (firstMemberTypeName === TypeFlags.Union) {
                const remainingSegments = memberSegments.slice(1);
                const typeNode = this.collectNode.get(firstSegmentTypeName);
                if (typeNode && (arkts.isClassDeclaration(typeNode) || arkts.isStructDeclaration(typeNode))) {
                    const firstMemberIsGetMethod = this.isGetMethod(typeNode, firstMemberSegment);
                    this.validateUnionTypePath(
                        monitorDecorator,
                        firstMemberSegment,
                        remainingSegments,
                        typeNode,
                        firstMemberIsGetMethod,
                        context
                    );
                }
                return;
            }
        }

        const allStateVariables = this.checkNestedPathStateVariables(
            firstSegmentTypeName,
            memberSegments
        );
        if (!allStateVariables) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
        }
    }

    private validateUnionTypePath(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegment: string,
        memberSegments: string[],
        node: arkts.ClassDeclaration | arkts.StructDeclaration,
        isGetMethod: boolean,
        context: MonitorPathValidationContext
    ): void {
        if (!this.checkFirstSegmentStateVariable(monitorDecorator, firstSegment, isGetMethod, context)) {
            return;
        }

        if (memberSegments.length === 0) {
            return;
        }

        const unionMemberNames = this.getUnionTypeMemberNamesFromNode(node, firstSegment);
        const validMembers = this.getValidUnionMembers(unionMemberNames);

        if (validMembers.length === 0) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
            return;
        }

        const membersWithProperty = validMembers.filter(member =>
            this.memberSegmentsTypeName(member, memberSegments)
        );

        if (membersWithProperty.length === 0) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
            return;
        }

        const allStateVariables = membersWithProperty.every(validMember => {
            const memberNode = this.collectNode.get(validMember);
            if (!memberNode || (!arkts.isClassDeclaration(memberNode) && !arkts.isStructDeclaration(memberNode))) {
                return false;
            }
            return this.checkNestedPathStateVariables(validMember, memberSegments);
        });

        if (!allStateVariables) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
        }
    }

    private getValidUnionMembers(unionMemberNames: string[]): string[] {
        return unionMemberNames.filter(name => this.collectNode.get(name) !== undefined);
    }

    private checkFirstSegmentStateVariable(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegment: string,
        isGetMethod: boolean,
        context: MonitorPathValidationContext
    ): boolean {
        if (isGetMethod) {
            return this.checkGetMethodStateVariable(monitorDecorator, firstSegment, context);
        }
        return this.checkPropertyStateVariable(monitorDecorator, firstSegment, context);
    }

    private checkGetMethodStateVariable(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegment: string,
        context: MonitorPathValidationContext
    ): boolean {
        const isClass = context.type === CONTEXT_TYPE_CLASS;
        const hasComputed = isClass
            ? this.hasGetMethodWithDecorator(
                context.node as arkts.ClassDeclaration,
                firstSegment,
                PresetDecorators.COMPUTED
            )
            : this.hasGetMethodWithDecoratorInStruct(
                context.node as arkts.StructDeclaration,
                firstSegment,
                PresetDecorators.COMPUTED
            );

        return this.reportIfNotStateVariable(monitorDecorator, hasComputed);
    }

    private checkPropertyStateVariable(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegment: string,
        context: MonitorPathValidationContext
    ): boolean {
        const isStateVariable = context.type === CONTEXT_TYPE_CLASS
            ? this.hasClassPropertyWithDecorator(
                context.node as arkts.ClassDeclaration,
                firstSegment,
                PresetDecorators.TRACE
            )
            : (context.hasRequiredDecorator ?? false);

        return this.reportIfNotStateVariable(monitorDecorator, isStateVariable);
    }

    private reportIfNotStateVariable(monitorDecorator: arkts.AnnotationUsage, isStateVariable: boolean): boolean {
        if (!isStateVariable) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
            return false;
        }
        return true;
    }

    private validateMonitorPathsInObservedV2Trace(
        monitorDecorator: arkts.AnnotationUsage,
        monitorPaths: string[],
        node: arkts.ClassDeclaration
    ): void {
        monitorPaths.forEach(path => {
            this.validateMonitorPath(monitorDecorator, path, {
                type: CONTEXT_TYPE_CLASS,
                node,
                hasProperty: (name: string) => this.hasClassProperty(node, name),
                hasStateVariable: (name: string, isGetMethod: boolean) => {
                    if (isGetMethod) {
                        return this.hasGetMethodWithDecorator(node, name, PresetDecorators.COMPUTED);
                    } else {
                        return this.hasClassPropertyWithDecorator(node, name, PresetDecorators.TRACE);
                    }
                }
            });
        });
    }

    private validateMonitorPathsInComponentV2(
        monitorDecorator: arkts.AnnotationUsage,
        monitorPaths: string[],
        variableMap: Map<string, string[]>,
        requiredDecorators: string[],
        node: arkts.StructDeclaration
    ): void {
        monitorPaths.forEach(path => {
            const segments = path.split('.');
            if (segments.length === 0) {
                return;
            }
            const firstSegment = segments[0];
            const decorators = variableMap.get(firstSegment) || [];
            const hasRequiredDecorator = requiredDecorators.some(decorator => decorators.includes(decorator));

            this.validateMonitorPath(monitorDecorator, path, {
                type: CONTEXT_TYPE_STRUCT,
                node,
                variableMap,
                requiredDecorators,
                hasRequiredDecorator
            });
        });
    }

    private isGetMethod(node: arkts.ClassDeclaration | arkts.StructDeclaration, variableName: string): boolean {
        if (!node.definition?.body) {
            return false;
        }

        for (const member of node.definition.body) {
            if (arkts.isMethodDefinition(member) &&
                member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET &&
                member.name &&
                arkts.isIdentifier(member.name) &&
                member.name.name === variableName) {
                return true;
            }
        }

        if (arkts.isClassDeclaration(node)) {
            const parentNode = this.getParentClass(node);
            if (parentNode) {
                return this.isGetMethod(parentNode, variableName);
            }
        }

        return false;
    }

    private hasClassPropertyWithRequiredDecorators(
        node: arkts.StructDeclaration,
        propertyName: string,
        requiredDecorators: string[]
    ): boolean {
        if (!node.definition?.body) {
            return false;
        }

        for (const member of node.definition.body) {
            const hasDecorator = this.checkMemberHasRequiredDecorators(member, propertyName, requiredDecorators);
            if (hasDecorator !== undefined) {
                return hasDecorator;
            }
        }

        return false;
    }

    private checkMemberHasRequiredDecorators(
        member: arkts.AstNode,
        propertyName: string,
        requiredDecorators: string[]
    ): boolean | undefined {
        if (arkts.isClassProperty(member) && this.isPropertyNameMatch(member, propertyName)) {
            return this.checkPropertyHasRequiredDecorators(member, requiredDecorators);
        }

        if (this.isGetMethodMatch(member, propertyName) && arkts.isMethodDefinition(member)) {
            return this.checkGetMethodHasRequiredDecorators(member, requiredDecorators);
        }

        return undefined;
    }

    private checkPropertyHasRequiredDecorators(
        member: arkts.ClassProperty,
        requiredDecorators: string[]
    ): boolean {
        const decorators = getClassPropertyAnnotationNames(member) || [];
        return requiredDecorators.some(decorator => decorators.includes(decorator));
    }

    private checkGetMethodHasRequiredDecorators(
        member: arkts.MethodDefinition,
        requiredDecorators: string[]
    ): boolean {
        if (!member.scriptFunction?.annotations) {
            return false;
        }

        const methodDecorators = this.extractMethodDecorators(member.scriptFunction.annotations);
        return requiredDecorators.some(decorator => methodDecorators.includes(decorator));
    }

    private extractMethodDecorators(annotations: readonly arkts.AnnotationUsage[]): string[] {
        const decorators: string[] = [];
        annotations.forEach((annotation) => {
            if (annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name) {
                decorators.push(annotation.expr.name);
            }
        });
        return decorators;
    }

    private isGetMethodMatch(member: arkts.AstNode, propertyName: string): boolean {
        return arkts.isMethodDefinition(member) &&
            member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET &&
            this.isPropertyNameMatch(member, propertyName);
    }

    private checkSegmentStateVariable(
        typeNode: arkts.AstNode,
        segment: string,
        isGetMethod: boolean,
        isClassNode: boolean,
        isStructNode: boolean
    ): boolean {
        if (isClassNode) {
            return isGetMethod
                ? this.hasGetMethodWithDecorator(typeNode as arkts.ClassDeclaration, segment, PresetDecorators.COMPUTED)
                : this.hasClassPropertyWithDecorator(typeNode as arkts.ClassDeclaration, segment, PresetDecorators.TRACE);
        }

        if (isStructNode) {
            return isGetMethod
                ? this.hasGetMethodWithDecoratorInStruct(typeNode as arkts.StructDeclaration, segment, PresetDecorators.COMPUTED)
                : this.hasClassPropertyWithRequiredDecorators(typeNode as arkts.StructDeclaration, segment, STRUCT_REQUIRED_DECORATORS);
        }

        return false;
    }

    private checkNestedPathStateVariables(
        startType: string,
        segments: string[]
    ): boolean {
        let currentType = startType;

        for (const segment of segments) {
            const typeNode = this.collectNode.get(currentType);
            if (!typeNode) {
                return false;
            }

            const isClassNode = arkts.isClassDeclaration(typeNode);
            const isStructNode = arkts.isStructDeclaration(typeNode);

            const isGetMethod = (isClassNode || isStructNode)
                ? this.isGetMethod(typeNode, segment)
                : false;
            const nextType = this.getPropTypeName(typeNode, segment);
            if (isGetMethod && !nextType) {
                return true;
            }
            if (!this.checkSegmentStateVariable(typeNode, segment, isGetMethod, isClassNode, isStructNode)) {
                return false;
            }

            if (!nextType) {
                return true;
            }

            currentType = nextType;
        }

        return true;
    }

    private hasGetMethodWithDecorator(
        node: arkts.ClassDeclaration | arkts.StructDeclaration,
        methodName: string,
        decoratorName: string
    ): boolean {
        if (!node.definition?.body) {
            return false;
        }

        const method = node.definition.body.find(member =>
            arkts.isMethodDefinition(member) &&
            member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET &&
            this.isPropertyNameMatch(member, methodName)
        ) as arkts.MethodDefinition | undefined;

        if (method && method.scriptFunction?.annotations) {
            const hasDecorator = method.scriptFunction.annotations.some(annotation =>
                annotation.expr &&
                arkts.isIdentifier(annotation.expr) &&
                annotation.expr.name === decoratorName
            );
            if (hasDecorator) {
                return true;
            }
        }

        if (arkts.isClassDeclaration(node)) {
            const parentNode = this.getParentClass(node);
            if (parentNode) {
                return this.hasGetMethodWithDecorator(parentNode, methodName, decoratorName);
            }
        }

        return false;
    }

    private hasGetMethodWithDecoratorInStruct(node: arkts.StructDeclaration, methodName: string, decoratorName: string): boolean {
        return this.hasGetMethodWithDecorator(node, methodName, decoratorName);
    }

    private hasClassProperty(node: arkts.ClassDeclaration, propertyName: string, decoratorName?: string): boolean {
        if (node.definition?.body) {
            for (const member of node.definition.body) {
                const hasProperty = this.checkMemberHasProperty(member, propertyName, decoratorName);
                if (hasProperty !== undefined) {
                    return hasProperty;
                }
            }
        }

        const parentNode = this.getParentClass(node);
        return parentNode ? this.hasClassProperty(parentNode, propertyName, decoratorName) : false;
    }

    private checkMemberHasProperty(
        member: arkts.AstNode,
        propertyName: string,
        decoratorName?: string
    ): boolean | undefined {
        if (arkts.isClassProperty(member) && this.isPropertyNameMatch(member, propertyName)) {
            return this.checkPropertyHasDecorator(member, decoratorName);
        }

        if (this.isGetMethodMatch(member, propertyName) && arkts.isMethodDefinition(member)) {
            return this.checkGetMethodHasDecorator(member, decoratorName);
        }

        return undefined;
    }

    private checkPropertyHasDecorator(member: arkts.ClassProperty, decoratorName?: string): boolean {
        if (!decoratorName) {
            return true;
        }

        const decorators = getClassPropertyAnnotationNames(member) || [];
        return decorators.includes(decoratorName);
    }

    private checkGetMethodHasDecorator(member: arkts.MethodDefinition, decoratorName?: string): boolean {
        if (!decoratorName) {
            return true;
        }

        if (!member.scriptFunction?.annotations) {
            return false;
        }

        return member.scriptFunction.annotations.some(annotation =>
            annotation.expr &&
            arkts.isIdentifier(annotation.expr) &&
            annotation.expr.name === decoratorName
        );
    }

    private hasClassPropertyWithDecorator(node: arkts.ClassDeclaration, propertyName: string, decoratorName: string): boolean {
        return this.hasClassProperty(node, propertyName, decoratorName);
    }

    private checkMonitorInComponentV2(node: arkts.StructDeclaration): void {
        const isComponentV2 = this.checkDecorator(node, PresetDecorators.COMPONENT_V2);
        if (!isComponentV2) {
            return;
        }
        const variableMap = this.collectVariables(node);

        node.definition?.body.forEach((body) => {
            if (!arkts.isMethodDefinition(body)) {
                return;
            }
            const monitorDecorator = this.getLocalMonitorUsed(body);
            const monitorPaths = this.getValueInMonitorAnnotation(monitorDecorator);
            if (!monitorDecorator || !monitorPaths) {
                return;
            }
            this.validateMonitorPathsInComponentV2(monitorDecorator, monitorPaths, variableMap, STRUCT_REQUIRED_DECORATORS, node);
        })
    }

    private collectVariables(node: arkts.ClassDeclaration | arkts.StructDeclaration): Map<string, string[]> {
        const variableMap = new Map<string, string[]>();

        node.definition?.body.forEach(member => {
            this.processMemberForVariableCollection(member, variableMap);
        });

        return variableMap;
    }

    private processMemberForVariableCollection(
        member: arkts.AstNode,
        variableMap: Map<string, string[]>
    ): void {
        if (arkts.isClassProperty(member)) {
            this.processClassProperty(member, variableMap);
        } else if (arkts.isMethodDefinition(member) && member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
            this.processMethodDefinition(member, variableMap);
        }
    }

    private processClassProperty(member: arkts.ClassProperty, variableMap: Map<string, string[]>): void {
        const variableName = getClassPropertyName(member);
        if (!variableName) {
            return;
        }
        const decorators = getClassPropertyAnnotationNames(member) || [];
        variableMap.set(variableName, decorators);
    }

    private processMethodDefinition(member: arkts.MethodDefinition, variableMap: Map<string, string[]>): void {
        if (!member.scriptFunction || !member.scriptFunction.id || !member.scriptFunction.annotations) {
            return;
        }

        const methodId = member.scriptFunction.id;
        if (!arkts.isIdentifier(methodId) || !methodId.name) {
            return;
        }

        const methodName = methodId.name;
        const methodDecorators: string[] = [];

        member.scriptFunction.annotations.forEach((e) => {
            if (e.expr && arkts.isIdentifier(e.expr) && e.expr.name) {
                methodDecorators.push(e.expr.name);
            }
        });

        variableMap.set(methodName, methodDecorators);
    }

    private getValueInMonitorAnnotation(node: arkts.AnnotationUsage | undefined): string[] | undefined {
        if (!node || !node.expr || !arkts.isIdentifier(node.expr) || node.expr.name !== PresetDecorators.MONITOR || !node.properties) {
            return undefined;
        }

        const firstProp = node.properties[0];
        if (!arkts.isClassProperty(firstProp) || !firstProp.value || !arkts.isArrayExpression(firstProp.value)) {
            return undefined;
        }

        const monitorValues: string[] = [];

        for (const element of firstProp.value.elements) {
            if (arkts.isStringLiteral(element)) {
                monitorValues.push(element.str);
            }
            else if (arkts.isIdentifier(element)) {
                const varName = element.name;
                monitorValues.push(varName);
            }
            else if (arkts.isMemberExpression(element)) {
                const enumValue = this.getEnumMemberValue(element);
                if (enumValue) {
                    monitorValues.push(enumValue);
                }
            }
        }

        return monitorValues.length > 0 ? monitorValues : undefined;
    }

    private getEnumMemberValue(node: arkts.MemberExpression): string | undefined {
        if (!node.object || !node.property) {
            return undefined;
        }

        if (arkts.isIdentifier(node.object) && arkts.isIdentifier(node.property)) {
            const enumName = node.object.name;
            const memberName = node.property.name;
            const key = `${enumName}.${memberName}`;
            const value = this.enumMemberValues.get(key);
            return value;
        }

        return undefined;
    }

    private firstSegmentTypeName(variableName: string, node: arkts.StructDeclaration | arkts.ClassDeclaration): string | undefined {
        if (!(arkts.isStructDeclaration(node) || arkts.isClassDeclaration(node)) || !node.definition?.body) {
            return arkts.isClassDeclaration(node) ? this.findVariableTypeInParentClass(variableName, node) : undefined;
        }

        for (const e of node.definition.body) {
            const typeFromProperty = this.getTypeFromClassProperty(e, variableName);
            if (typeFromProperty !== undefined) {
                return typeFromProperty;
            }

            const typeFromGetMethod = this.getTypeFromGetMethod(e, variableName);
            if (typeFromGetMethod !== undefined) {
                return typeFromGetMethod;
            }
        }

        return arkts.isClassDeclaration(node) ? this.findVariableTypeInParentClass(variableName, node) : undefined;
    }

    private getTypeFromClassProperty(member: arkts.AstNode, variableName: string): string | undefined {
        if (!arkts.isClassProperty(member)) {
            return undefined;
        }

        if (!this.isPropertyNameMatch(member, variableName) || !member.typeAnnotation) {
            return undefined;
        }

        return this.getTypeFromPropertyAnnotation(member.typeAnnotation);
    }

    private getTypeFromGetMethod(member: arkts.AstNode, variableName: string): string | undefined {
        if (!arkts.isMethodDefinition(member) || member.kind !== arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
            return undefined;
        }

        if (!this.isPropertyNameMatch(member, variableName) || !member.scriptFunction?.returnTypeAnnotation) {
            return undefined;
        }

        return this.getTypeFromPropertyAnnotation(member.scriptFunction.returnTypeAnnotation);
    }

    private findVariableTypeInParentClass(variableName: string, node: arkts.ClassDeclaration): string | undefined {
        if (!node.definition?.super || !arkts.isETSTypeReference(node.definition.super)) {
            return undefined;
        }

        const superPart = node.definition.super.part;
        if (!superPart || !arkts.isETSTypeReferencePart(superPart) || !superPart.name || !arkts.isIdentifier(superPart.name)) {
            return undefined;
        }

        const parentName = superPart.name.name;
        const parentNode = this.collectNode.get(parentName);

        if (parentNode && arkts.isClassDeclaration(parentNode)) {
            return this.firstSegmentTypeName(variableName, parentNode);
        }

        return undefined;
    }

    private getPropTypeName(node: arkts.AstNode, element: string): string | undefined {
        if (arkts.isClassDeclaration(node)) {
            return this.getPropTypeNameFromClass(node, element);
        }

        if (arkts.isTSInterfaceDeclaration(node)) {
            return this.getPropTypeNameFromInterface(node, element);
        }

        return undefined;
    }

    private getPropTypeNameFromClass(node: arkts.ClassDeclaration, element: string): string | undefined {
        if (!node.definition?.body) {
            return this.findPropTypeInParentClass(node, element);
        }

        const found = this.findMemberInClass(node.definition.body, element);
        if (!found) {
            return this.findPropTypeInParentClass(node, element);
        }

        if (arkts.isMethodDefinition(found)) {
            return this.getReturnTypeFromMethod(found);
        }

        if (arkts.isClassProperty(found)) {
            return this.getTypeFromProperty(found, node, element);
        }

        return undefined;
    }

    private getPropTypeNameFromInterface(node: arkts.TSInterfaceDeclaration, element: string): string | undefined {
        if (!node.body || !arkts.isTSInterfaceBody(node.body) || !node.body.body) {
            return undefined;
        }

        const targetProp = this.findPropertyInInterface(node.body.body, element);
        return targetProp ? this.getTypeFromPropertyAnnotation(targetProp.typeAnnotation) : undefined;
    }

    private findPropertyInInterface(body: readonly arkts.AstNode[], element: string): arkts.ClassProperty | undefined {
        return body.find((e: arkts.AstNode) => {
            return arkts.isClassProperty(e) && this.isPropertyNameMatch(e, element);
        }) as arkts.ClassProperty | undefined;
    }

    private findMemberInClass(body: readonly arkts.AstNode[], element: string): arkts.ClassProperty | arkts.MethodDefinition | undefined {
        return body.find((e: arkts.AstNode) => {
            return this.isMatchingProperty(e, element) || this.isMatchingGetMethod(e, element);
        }) as arkts.ClassProperty | arkts.MethodDefinition | undefined;
    }

    private isMatchingProperty(member: arkts.AstNode, element: string): boolean {
        return arkts.isClassProperty(member) && this.isPropertyNameMatch(member, element);
    }

    private isMatchingGetMethod(member: arkts.AstNode, element: string): boolean {
        return arkts.isMethodDefinition(member) &&
            member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET &&
            this.isPropertyNameMatch(member, element);
    }

    private getReturnTypeFromMethod(method: arkts.MethodDefinition): string | undefined {
        if (!method.scriptFunction?.returnTypeAnnotation) {
            return undefined;
        }

        return this.getTypeFromPropertyAnnotation(method.scriptFunction.returnTypeAnnotation);
    }

    private getTypeFromProperty(prop: arkts.ClassProperty, node: arkts.AstNode, element: string): string | undefined {
        if (!arkts.isClassProperty(prop) || !prop.typeAnnotation) {
            return this.findPropTypeInParentClass(node, element);
        }

        return this.getTypeFromPropertyAnnotation(prop.typeAnnotation) || this.findPropTypeInParentClass(node, element);
    }

    private getTypeFromPropertyAnnotation(typeAnnotation: arkts.AstNode | undefined): string | undefined {
        if (!typeAnnotation) {
            return undefined;
        }

        if (arkts.isETSTypeReference(typeAnnotation)) {
            const partName = typeAnnotation.part?.name;
            return partName && arkts.isIdentifier(partName) ? partName.name : undefined;
        }

        return arkts.isETSUnionType(typeAnnotation) ? TypeFlags.Union : undefined;
    }

    private getUnionTypeMemberNames(typeAnnotation: arkts.AstNode | undefined): string[] {
        if (!typeAnnotation || !arkts.isETSUnionType(typeAnnotation)) {
            return [];
        }

        const unionType = typeAnnotation as arkts.ETSUnionType;
        const memberTypes: string[] = [];

        for (const memberType of unionType.types) {
            if (arkts.isETSTypeReference(memberType)) {
                const typeName = memberType.part?.name;
                if (typeName && arkts.isIdentifier(typeName)) {
                    memberTypes.push(typeName.name);
                }
            }
        }

        return memberTypes;
    }

    private getUnionTypeMemberNamesFromNode(node: arkts.AstNode, propertyName: string): string[] {
        const body = (arkts.isClassDeclaration(node) || arkts.isStructDeclaration(node))
            ? node.definition?.body
            : undefined;

        if (!body) {
            return [];
        }

        for (const member of body) {
            if (arkts.isClassProperty(member) && this.isPropertyNameMatch(member, propertyName)) {
                return this.getUnionTypeMemberNames(member.typeAnnotation);
            }

            if (arkts.isMethodDefinition(member) &&
                member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET &&
                this.isPropertyNameMatch(member, propertyName) &&
                member.scriptFunction) {
                return this.getUnionTypeMemberNames(member.scriptFunction.returnTypeAnnotation);
            }
        }

        return [];
    }

    private getParentClass(node: arkts.ClassDeclaration): arkts.ClassDeclaration | null {
        if (!node.definition?.super || !arkts.isETSTypeReference(node.definition.super)) {
            return null;
        }

        const superClassPart = node.definition.super.part;
        if (!superClassPart || !arkts.isETSTypeReferencePart(superClassPart) ||
            !superClassPart.name || !arkts.isIdentifier(superClassPart.name)) {
            return null;
        }

        const parentClassName = superClassPart.name.name;
        const parentNode = this.collectNode.get(parentClassName);
        return (parentNode && arkts.isClassDeclaration(parentNode)) ? parentNode : null;
    }

    private isPropertyNameMatch(
        member: arkts.ClassProperty | arkts.MethodDefinition,
        propertyName: string
    ): boolean {
        if (arkts.isClassProperty(member)) {
            return !!(member.key &&
                arkts.isIdentifier(member.key) &&
                member.key.name === propertyName);
        }

        if (arkts.isMethodDefinition(member)) {
            return !!(member.name &&
                arkts.isIdentifier(member.name) &&
                member.name.name === propertyName);
        }

        return false;
    }

    private checkMapSetSize(currentType: string, element: string, remainingPath: string[]): boolean | null {
        const isMapOrSet = this.isMapType(currentType) || this.isSetType(currentType);
        if (isMapOrSet && element === 'size') {
            return remainingPath.length === 0;
        }
        return null;
    }

    private isMapType(typeName: string): boolean {
        return typeName === ArrayTypes.Map;
    }

    private isSetType(typeName: string): boolean {
        return typeName === ArrayTypes.Set;
    }

    private findPropTypeInParentClass(node: arkts.AstNode, element: string): string | undefined {
        if (arkts.isClassDeclaration(node)) {
            const parentNode = this.getParentClass(node);
            if (parentNode) {
                return this.getPropTypeName(parentNode, element);
            }
        }

        return undefined;
    }

    private handleMapSetSizeWhenNodeMissing(
        currentFather: string,
        element: string,
        variableArray: string[],
        currentIndex: number
    ): boolean {
        const isMapOrSetSize = (this.isMapType(currentFather) || this.isSetType(currentFather)) && element === 'size';
        if (!isMapOrSetSize) {
            return false;
        }

        const remainingPath = variableArray.slice(currentIndex + 1);
        return remainingPath.length === 0;
    }

    private handleUnionTypeInPath(unionMemberNames: string[], variableArray: string[], currentIndex: number): boolean {
        const remainingPath = variableArray.slice(currentIndex + 1);
        const validMembers = this.getValidUnionMembers(unionMemberNames);

        if (validMembers.length === 0) {
            return false;
        }

        if (remainingPath.length > 0) {
            return validMembers.some(member => this.memberSegmentsTypeName(member, remainingPath));
        }

        return true;
    }

    private memberSegmentsTypeName(father: string, variableArray: string[]): boolean {
        if (father.toLowerCase() === TypeFlags.Array) {
            return true;
        }
        if (!father || !variableArray?.length) {
            return false;
        }

        let currentFather = father;

        for (let i = 0; i < variableArray.length; i++) {
            const element = variableArray[i];
            const remainingPath = variableArray.slice(i + 1);

            const sizeCheck = this.checkMapSetSize(currentFather, element, remainingPath);
            if (sizeCheck !== null) {
                return sizeCheck;
            }

            const node = this.collectNode.get(currentFather);
            if (!node) {
                return this.handleMapSetSizeWhenNodeMissing(currentFather, element, variableArray, i);
            }

            const unionMemberNames = this.getUnionTypeMemberNamesFromNode(node, element);
            if (unionMemberNames.length > 0) {
                return this.handleUnionTypeInPath(unionMemberNames, variableArray, i);
            }

            const propExists = this.propertyExistInType(node, element);

            if (!propExists) {
                return false;
            }
            const isGetMethod = (arkts.isClassDeclaration(node) || arkts.isStructDeclaration(node))
                ? this.isGetMethod(node, element)
                : false;
            const nextType = this.getPropTypeName(node, element);

            if (isGetMethod && !nextType) {
                return true;
            }

            currentFather = this.getPropTypeName(node, element) || element;

            if (currentFather === TypeFlags.Union) {
                const propUnionMembers = this.getUnionTypeMemberNamesFromNode(node, element);
                return this.handleUnionTypeInPath(propUnionMembers, variableArray, i);
            }

            if ((this.isMapType(currentFather) || this.isSetType(currentFather)) && i < variableArray.length - 1) {
                const nextElement = variableArray[i + 1];
                if (nextElement === 'size' && i + 1 < variableArray.length - 1) {
                    return false;
                }
                return true;
            }

            if (currentFather.toLowerCase() === TypeFlags.Array) {
                return true;
            }
        }

        return true;
    }

    private propertyExistInType(typeNode: arkts.AstNode, propertyName: string): boolean {
        if (arkts.isClassDeclaration(typeNode) || arkts.isStructDeclaration(typeNode)) {
            const found = this.findPropertyInClassOrStruct(typeNode, propertyName);
            if (found) {
                return true;
            }
        }

        if (arkts.isTSInterfaceDeclaration(typeNode)) {
            if (this.checkPropertyExistsInInterface(typeNode, propertyName)) {
                return true;
            }
        }

        return this.checkPropertyInParentClass(typeNode, propertyName);
    }

    private findPropertyInClassOrStruct(
        typeNode: arkts.ClassDeclaration | arkts.StructDeclaration,
        propertyName: string
    ): boolean {
        if (!typeNode.definition?.body) {
            return false;
        }

        for (const member of typeNode.definition.body) {
            if (this.isMatchingProperty(member, propertyName) || this.isMatchingGetMethod(member, propertyName)) {
                return true;
            }
        }

        return false;
    }

    private checkPropertyExistsInInterface(
        typeNode: arkts.TSInterfaceDeclaration,
        propertyName: string
    ): boolean {
        if (!typeNode.body || !arkts.isTSInterfaceBody(typeNode.body) || !typeNode.body.body) {
            return false;
        }

        return typeNode.body.body.some(member => this.isMatchingProperty(member, propertyName));
    }

    private checkPropertyInParentClass(typeNode: arkts.AstNode, propertyName: string): boolean {
        if (arkts.isClassDeclaration(typeNode)) {
            const parentNode = this.getParentClass(typeNode);
            if (parentNode) {
                return this.propertyExistInType(parentNode, propertyName);
            }
        }

        return false;
    }

    private checkDecorator(node: arkts.ClassDeclaration | arkts.StructDeclaration, decoratorName: string): boolean {
        return node.definition?.annotations?.some(
            annotation => annotation.expr && arkts.isIdentifier(annotation.expr) &&
                annotation.expr?.name === decoratorName
        ) ?? false;
    }

    private checkMonitorUsage(
        node: arkts.ClassDeclaration | arkts.StructDeclaration
    ): arkts.AnnotationUsage | undefined {
        let monitorUsage: arkts.AnnotationUsage | undefined;

        for (const body of node.definition?.body ?? []) {
            if (!arkts.isMethodDefinition(body)) {
                continue;
            }
            const currentMonitor = this.getLocalMonitorUsed(body);

            if (currentMonitor) {
                monitorUsage = currentMonitor;
                this.checkConflictingDecorators(body, currentMonitor);
                break;
            }
        }
        return monitorUsage;
    }

    private getLocalMonitorUsed(body: arkts.MethodDefinition): arkts.AnnotationUsage | undefined {
        const localMonitorUsed = body.scriptFunction.annotations?.find(
            annotation => annotation.expr && arkts.isIdentifier(annotation.expr) &&
                annotation.expr.name === PresetDecorators.MONITOR
        );
        return localMonitorUsed;
    }

    private checkConflictingDecorators(body: arkts.MethodDefinition, localMonitorUsed: arkts.AnnotationUsage): boolean {
        const conflictingDecorators = body.scriptFunction.annotations?.filter(
            annotation => annotation.expr && arkts.isIdentifier(annotation.expr) &&
                annotation.expr.name !== PresetDecorators.MONITOR
        );
        if (conflictingDecorators?.length > 0) {
            this.reportConflictingDecorators(localMonitorUsed, conflictingDecorators);
            return true;
        }
        return false;
    }

    private reportConflictingDecorators(localMonitorUsed: arkts.AstNode, conflictingDecorators: arkts.AnnotationUsage[]): void {
        this.report({
            node: localMonitorUsed,
            message: this.messages.monitorUsedAlone,
            fix: () => {
                const startPositions = conflictingDecorators.map(annotation =>
                    annotation.startPosition);
                const endPositions = conflictingDecorators.map(annotation => annotation.endPosition);
                let startPosition = startPositions[0];
                startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                const endPosition = endPositions[endPositions.length - 1];
                return {
                    title: 'Remove the annotation',
                    range: [startPosition, endPosition],
                    code: ''
                };
            }
        });
    }

    private checkDecorateMethod(node: arkts.ClassDeclaration | arkts.StructDeclaration): void {
        // Check if @Monitor is used on a property (which is not allowed)
        node.definition?.body.forEach((body) => {
            if (!arkts.isClassProperty(body)) {
                return;
            }

            const monitorDecorator = body.annotations?.find(
                (annotation) =>
                    annotation.expr &&
                    arkts.isIdentifier(annotation.expr) &&
                    annotation.expr.name === PresetDecorators.MONITOR
            );

            if (monitorDecorator === undefined) {
                return;
            }
            this.report({
                node: monitorDecorator,
                message: this.messages.monitorDecorateMethod,
                fix: () => {
                    let startPosition = monitorDecorator.startPosition;
                    startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                    const endPosition = monitorDecorator.endPosition;
                    return {
                        title: 'Remove the @Monitor annotation',
                        range: [startPosition, endPosition],
                        code: '',
                    };
                },
            });
        });
    }
}

export default MonitorDecoratorCheckRule;