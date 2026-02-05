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
import {
    getAnnotationUsage,
    PresetDecorators,
    getClassAnnotationUsage,
    getClassPropertyName,
    getClassPropertyAnnotationNames,
    TypeFlags,
    addImportFixes
} from '../utils';
import { AbstractUISyntaxRule, FixSuggestion } from './ui-syntax-rule';

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

type PathValidationResult = {
    valid: boolean;
    isPropertyNotExists?: boolean;
};

type ProcessArrayIndexReturn =
    | { shouldReturn: true; result: PathValidationResult }
    | { shouldReturn: false; newType: string; newIndex: number };

type ProcessPropertyAccessReturn =
    | { shouldReturn: true; result: PathValidationResult }
    | { shouldReturn: false; newType: string; newPropertyNode: arkts.ClassProperty | undefined };

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
    Map = 'Map',
    Set = 'Set',
    Date = 'Date'
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
            this.reportAddObservedV2ForMonitor(node, monitorDecorator);
            return;
        }
        if (!isObservedV2 && observedV1Decorator) {
            this.reportChangeToObservedV2ForMonitor(observedV1Decorator, monitorDecorator);
        }
    }

    private reportAddObservedV2ForMonitor(
        node: arkts.ClassDeclaration,
        monitorDecorator: arkts.AnnotationUsage
    ): void {
        const fixes: FixSuggestion[] = [];
        const fixTitle = 'Add @ObservedV2 annotation';

        fixes.push({
            title: fixTitle,
            range: [node.startPosition, node.startPosition],
            code: `@${PresetDecorators.OBSERVED_V2}\n`,
        });

        addImportFixes(node, fixes, this.context, [PresetDecorators.OBSERVED_V2], fixTitle);

        this.report({
            node: monitorDecorator,
            message: this.messages.monitorUsedInObservedV2Class,
            fix: () => fixes,
        });
    }

    private reportChangeToObservedV2ForMonitor(
        observedV1Decorator: arkts.AnnotationUsage,
        monitorDecorator: arkts.AnnotationUsage
    ): void {
        const fixes: FixSuggestion[] = [];
        const fixTitle = 'Change @Observed to @ObservedV2';

        fixes.push({
            title: fixTitle,
            range: [observedV1Decorator.startPosition, observedV1Decorator.endPosition],
            code: `${PresetDecorators.OBSERVED_V2}`,
        });

        addImportFixes(observedV1Decorator, fixes, this.context, [PresetDecorators.OBSERVED_V2], fixTitle);

        this.report({
            node: monitorDecorator,
            message: this.messages.monitorUsedInObservedV2Class,
            fix: () => fixes,
        });
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
            this.reportAddComponentV2ForMonitor(node, monitorDecorator);
            return;
        }

        if (!isComponentV2 && componentV1Decorator) {
            this.reportChangeToComponentV2ForMonitor(componentV1Decorator, monitorDecorator);
        }
    }

    private reportAddComponentV2ForMonitor(
        node: arkts.StructDeclaration,
        monitorDecorator: arkts.AnnotationUsage
    ): void {
        const fixes: FixSuggestion[] = [];
        const fixTitle = 'Add @ComponentV2 annotation';

        fixes.push({
            title: fixTitle,
            range: [node.startPosition, node.startPosition],
            code: `@${PresetDecorators.COMPONENT_V2}\n`,
        });

        addImportFixes(node, fixes, this.context, [PresetDecorators.COMPONENT_V2], fixTitle);

        this.report({
            node: monitorDecorator,
            message: this.messages.monitorUsedInComponentV2Struct,
            fix: () => fixes,
        });
    }

    private reportChangeToComponentV2ForMonitor(
        componentV1Decorator: arkts.AnnotationUsage,
        monitorDecorator: arkts.AnnotationUsage
    ): void {
        const fixes: FixSuggestion[] = [];
        const fixTitle = 'Change @Component to @ComponentV2';

        fixes.push({
            title: fixTitle,
            range: [componentV1Decorator.startPosition, componentV1Decorator.endPosition],
            code: `${PresetDecorators.COMPONENT_V2}`,
        });

        addImportFixes(componentV1Decorator, fixes, this.context, [PresetDecorators.COMPONENT_V2], fixTitle);

        this.report({
            node: monitorDecorator,
            message: this.messages.monitorUsedInComponentV2Struct,
            fix: () => fixes,
        });
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
        const isGetMethod = this.isGetMethod(node, firstSegment);
        const firstSegmentIsStateVariable = this.isFirstSegmentStateVariable(firstSegment, isGetMethod, context);
        const property = this.getPropertyInDeclByName(node, firstSegment);
        if (property) {
            const arrayValid = this.checkMonitorArrayIsValid(monitorDecorator, property, memberSegments, firstSegmentIsStateVariable);
            if (this.isOnlyLengthAccess(memberSegments)) {
                return;
            }
            if (!arrayValid) {
                return;
            }
        }
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
                context,
                firstSegmentIsStateVariable
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
            this.handleNestedPath(monitorDecorator, firstSegment, memberSegments, firstSegmentTypeName, isGetMethod, context);
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
        firstSegmentIsStateVariable?: boolean
    ): boolean {
        const dimMap: Map<string, Set<number>> = this.getDimMapByProperty(property);
        const { typeName, dimension } = this.getMaxArrayDimension(dimMap);

        if (this.isLengthAccess(memberSegments)) {
            if (memberSegments.length > 1) {
                this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
                return false;
            }
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
            return false;
        }

        if (dimension === 0 || memberSegments.length === 0) {
            return true;
        }

        if (!this.isArrayIndex(memberSegments[0])) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
            return false;
        } else {
            this.checkMonitorArrayElementIsValid(
                monitorDecorator,
                memberSegments,
                dimMap,
                dimension,
                firstSegmentIsStateVariable
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
            this.processUnionTypeForDimMap(typeAnnotation, addDim);
        } else if (this.isArrayType(typeAnnotation)) {
            this.processArrayTypeForDimMap(typeAnnotation, addDim);
        }
        return dimMap;
    }

    private processUnionTypeForDimMap(unionType: arkts.ETSUnionType, addDim: (typeName: string, dim: number) => void): void {
        unionType.types.forEach((type) => {
            if (!this.isArrayType(type)) {
                return;
            }
            const { typeName, dimension, elementType } = this.getArrayDimensionByType(type);
            this.addTypesToDimMap(elementType, typeName, dimension, addDim);
        });
    }

    private processArrayTypeForDimMap(arrayType: arkts.TypeNode, addDim: (typeName: string, dim: number) => void): void {
        const { typeName, dimension, elementType } = this.getArrayDimensionByType(arrayType);
        this.addTypesToDimMap(elementType, typeName, dimension, addDim);
    }

    private addTypesToDimMap(
        elementType: arkts.TypeNode | undefined,
        typeName: string | undefined,
        dimension: number,
        addDim: (typeName: string, dim: number) => void
    ): void {
        if (elementType && arkts.isETSUnionType(elementType)) {
            this.addUnionElementTypesToDimMap(elementType, dimension, addDim);
            return;
        }
        if (typeName && dimension > 0) {
            addDim(typeName, dimension);
        }
    }

    private addUnionElementTypesToDimMap(unionType: arkts.ETSUnionType, dimension: number, addDim: (typeName: string, dim: number) => void): void {
        for (const memberType of unionType.types) {
            if (!arkts.isETSTypeReference(memberType)) {
                continue;
            }
            const memberTypeName = memberType.part?.name;
            if (memberTypeName && arkts.isIdentifier(memberTypeName)) {
                addDim(memberTypeName.name, dimension);
            }
        }
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

    private checkMonitorArrayElementIsValid(
        monitorDecorator: arkts.AnnotationUsage,
        memberSegments: string[],
        dimMap: Map<string, Set<number>>,
        maxDim: number,
        firstSegmentIsStateVariable?: boolean
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

        const typesWithProperty: string[] = [];
        for (const typeName of equalDimTypes) {
            if (this.memberSegmentsTypeName(typeName, newSegments)) {
                typesWithProperty.push(typeName);
            }
        }

        if (typesWithProperty.length === 0) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
            return;
        }

        const validTypes: string[] = [];
        let hasPropertyExists = true;
        for (const typeName of typesWithProperty) {
            const result = this.checkNestedPathStateVariables(
                typeName,
                newSegments,
                undefined
            );
            if (result.valid) {
                validTypes.push(typeName);
            } else if (result.isPropertyNotExists) {
                hasPropertyExists = false;
            }
        }

        if (validTypes.length === typesWithProperty.length && validTypes.length > 0) {
            if (firstSegmentIsStateVariable !== undefined && !firstSegmentIsStateVariable) {
                this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
                return;
            }
            const firstValidType = validTypes[0];
            const hasOtherDimension = Array.from(dimMap.values()).some(dimSet =>
                Array.from(dimSet).some(d => d !== nestDepth)
            );
            if (hasOtherDimension && this.checkOtherTypePossible(dimMap, firstValidType, nestDepth)) {
                this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
                return;
            }
            return;
        }

        if (validTypes.length < typesWithProperty.length) {
            const level = hasPropertyExists ? 'warn' : 'error';
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level });
            return;
        }
    }

    private checkOtherTypePossible(dimMap: Map<string, Set<number>>, typeName: string, dim: number): boolean {
        for (const [name, dimSet] of dimMap) {
            for (const d of dimSet) {
                if (typeName !== name && dim !== d) {
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

    private getArrayDimensionByType(typeNode: arkts.TypeNode): { typeName: string; dimension: number; elementType?: arkts.TypeNode } {
        let dimension = 0;
        let curNode: arkts.TypeNode = typeNode;
        while (this.isArrayType(curNode)) {
            dimension++;
            const elementType = this.getArrayElementType(curNode);
            if (!elementType) {
                break;
            }
            curNode = elementType;
            if (arkts.isETSUnionType(curNode)) {
                break;
            }
        }
        let typeName = '';
        if (arkts.isETSTypeReference(curNode)) {
            const typeNameNode = curNode.part?.name;
            if (typeNameNode && arkts.isIdentifier(typeNameNode)) {
                typeName = typeNameNode.name;
            }
        }
        return { typeName, dimension, elementType: curNode };
    }

    private getNestDepth(memberSegments: string[]): number {
        let nestDepth = 0;
        for (const segment of memberSegments) {
            if (this.isArrayIndex(segment)) {
                nestDepth++;
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
        const allProperties = this.findPropertiesInNode(node, propertyName);
        if (allProperties && allProperties.length > 0) {
            const unionArrayProperty = this.findUnionArrayProperty(allProperties);
            if (unionArrayProperty) {
                return unionArrayProperty;
            }
            return allProperties[0];
        }

        return this.findPropertyInParentClass(node, propertyName);
    }

    private findPropertiesInNode(
        node: arkts.ClassDeclaration | arkts.StructDeclaration,
        propertyName: string
    ): arkts.ClassProperty[] | undefined {
        return node.definition?.body?.filter(member =>
            arkts.isClassProperty(member) &&
            member.key &&
            arkts.isIdentifier(member.key) &&
            member.key.name === propertyName
        ) as arkts.ClassProperty[] | undefined;
    }

    private findUnionArrayProperty(allProperties: arkts.ClassProperty[]): arkts.ClassProperty | undefined {
        for (const prop of allProperties) {
            if (prop.typeAnnotation && this.isArrayType(prop.typeAnnotation)) {
                const elementType = this.getArrayElementType(prop.typeAnnotation);
                if (elementType && arkts.isETSUnionType(elementType)) {
                    return prop;
                }
            }
        }
        return undefined;
    }

    private findPropertyInParentClass(
        node: arkts.ClassDeclaration | arkts.StructDeclaration,
        propertyName: string
    ): arkts.ClassProperty | undefined {
        if (!node.definition?.super || !arkts.isETSTypeReference(node.definition.super)) {
            return undefined;
        }
        const superClassPart = node.definition.super.part;
        if (!superClassPart || !arkts.isETSTypeReferencePart(superClassPart)) {
            return undefined;
        }
        const superClassName = superClassPart.name;
        if (!superClassName || !arkts.isIdentifier(superClassName)) {
            return undefined;
        }
        const parentClassName = superClassName.name;
        const parentNode = this.collectNode.get(parentClassName);
        if (parentNode && arkts.isClassDeclaration(parentNode)) {
            return this.getPropertyInDeclByName(parentNode, propertyName);
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
        return typeNode ? this.getPropTypeName(typeNode, element) : undefined;
    }
    private handleNestedPathArray(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegmentTypeName: string,
        firstMemberSegment: string,
        remainingSegments: string[],
        context: MonitorPathValidationContext,
        firstSegmentIsStateVariable: boolean
    ): boolean {
        const typeNode = this.collectNode.get(firstSegmentTypeName);
        if (!typeNode || (!arkts.isClassDeclaration(typeNode) && !arkts.isStructDeclaration(typeNode))) {
            return false;
        }

        const arrayProperty = this.getPropertyInDeclByName(typeNode, firstMemberSegment);
        if (!arrayProperty) {
            return false;
        }

        if (arrayProperty.typeAnnotation && arkts.isETSUnionType(arrayProperty.typeAnnotation)) {
            return false;
        }

        const arrayValid = this.checkMonitorArrayIsValid(monitorDecorator, arrayProperty, remainingSegments, firstSegmentIsStateVariable);
        if (remainingSegments.length === 1 && remainingSegments[0] === 'length') {
            return true;
        }

        const result = !arrayValid;
        return result;
    }

    private handleNestedPathUnionType(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegmentTypeName: string,
        firstMemberSegment: string,
        remainingSegments: string[],
        context: MonitorPathValidationContext,
        firstSegmentIsStateVariable: boolean
    ): void {
        const typeNode = this.collectNode.get(firstSegmentTypeName);
        if (!typeNode || (!arkts.isClassDeclaration(typeNode) && !arkts.isStructDeclaration(typeNode))) {
            return;
        }

        const firstMemberIsGetMethod = this.isGetMethod(typeNode, firstMemberSegment);
        const newContext = this.createMonitorPathValidationContext(typeNode, context);
        this.validateUnionTypePath(
            monitorDecorator,
            firstMemberSegment,
            remainingSegments,
            typeNode,
            firstMemberIsGetMethod,
            newContext,
            firstSegmentIsStateVariable
        );
    }

    private createMonitorPathValidationContext(
        typeNode: arkts.ClassDeclaration | arkts.StructDeclaration,
        context: MonitorPathValidationContext
    ): MonitorPathValidationContext {
        const isClass = arkts.isClassDeclaration(typeNode);
        return {
            type: isClass ? CONTEXT_TYPE_CLASS : CONTEXT_TYPE_STRUCT,
            node: typeNode,
            hasProperty: (name: string): boolean => {
                return isClass ? this.hasClassProperty(typeNode, name) : false;
            },
            hasStateVariable: (name: string, isGetMethod: boolean): boolean => {
                if (isClass) {
                    return isGetMethod
                        ? this.hasGetMethodWithDecorator(typeNode, name, PresetDecorators.COMPUTED)
                        : this.hasClassProperty(typeNode, name, PresetDecorators.TRACE);
                }
                if (arkts.isStructDeclaration(typeNode)) {
                    return isGetMethod
                        ? this.hasGetMethodWithDecoratorInStruct(typeNode, name, PresetDecorators.COMPUTED)
                        : this.hasClassPropertyWithRequiredDecorators(typeNode, name, STRUCT_REQUIRED_DECORATORS);
                }
                return false;
            },
            variableMap: context.variableMap,
            requiredDecorators: context.requiredDecorators,
            hasRequiredDecorator: context.hasRequiredDecorator
        };
    }
    private handleNestedPath(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegment: string,
        memberSegments: string[],
        firstSegmentTypeName: string,
        isGetMethod: boolean,
        context: MonitorPathValidationContext
    ): void {
        if (memberSegments.length === 0) {
            return;
        }
        const firstSegmentIsStateVariable = this.isFirstSegmentStateVariable(firstSegment, isGetMethod, context);
        const firstMemberSegment = memberSegments[0];
        const remainingSegments = memberSegments.slice(1);

        const handleArrayResult = this.handleNestedPathArray(
            monitorDecorator,
            firstSegmentTypeName,
            firstMemberSegment,
            remainingSegments,
            context,
            firstSegmentIsStateVariable
        );
        if (handleArrayResult) {
            return;
        }

        const memberSegmentsTypeNameResult = this.memberSegmentsTypeName(firstSegmentTypeName, memberSegments);
        if (!memberSegmentsTypeNameResult) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
            return;
        }

        const firstMemberTypeName = this.getPropTypeNameFromTypeName(firstSegmentTypeName, firstMemberSegment);
        if (firstMemberTypeName === TypeFlags.Union) {
            this.handleNestedPathUnionType(monitorDecorator, firstSegmentTypeName, firstMemberSegment, remainingSegments, context, firstSegmentIsStateVariable);
            return;
        }

        const checkResult = this.checkNestedPathStateVariables(
            firstSegmentTypeName,
            memberSegments,
            firstSegmentIsStateVariable
        );
        if (!checkResult.valid) {
            const level = checkResult.isPropertyNotExists ? 'error' : 'warn';
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level });
        }
    }

    private isArrayType(typeNode: arkts.TypeNode): boolean {
        if (arkts.isTSArrayType(typeNode)) {
            return true;
        }
        if (arkts.isETSTypeReference(typeNode)) {
            const typeName = typeNode.part?.name;
            if (typeName && arkts.isIdentifier(typeName) && typeName.name === ArrayTypes.Array) {
                return true;
            }
        }
        return false;
    }

    private isLengthAccess(memberSegments: string[]): boolean {
        return memberSegments.length > 0 && memberSegments[0] === 'length';
    }

    private isOnlyLengthAccess(memberSegments: string[]): boolean {
        return memberSegments.length === 1 && memberSegments[0] === 'length';
    }

    private getArrayElementType(typeNode: arkts.TypeNode): arkts.TypeNode | null {
        if (arkts.isTSArrayType(typeNode)) {
            return typeNode.elementType || null;
        }
        if (arkts.isETSTypeReference(typeNode)) {
            const typeName = typeNode.part?.name;
            if (typeName && arkts.isIdentifier(typeName) && typeName.name === ArrayTypes.Array) {
                const typeParams = typeNode.part?.typeParams;
                if (typeParams && typeParams.params && typeParams.params.length > 0) {
                    return typeParams.params[0];
                }
            }
        }
        return null;
    }

    private getArrayElementTypeAndDimension(arrayType: arkts.TypeNode, memberSegments: string[]): { elementType: arkts.TypeNode; pathIndex: number } {
        let currentType: arkts.TypeNode = arrayType;
        let pathIndex = 0;
        while (this.isArrayType(currentType) && pathIndex < memberSegments.length && this.isArrayIndex(memberSegments[pathIndex])) {
            const elementType = this.getArrayElementType(currentType);
            if (!elementType) {
                break;
            }
            currentType = elementType;
            pathIndex++;
        }
        return { elementType: currentType, pathIndex };
    }

    private validateUnionTypePath(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegment: string,
        memberSegments: string[],
        node: arkts.ClassDeclaration | arkts.StructDeclaration,
        isGetMethod: boolean,
        context: MonitorPathValidationContext,
        firstSegmentIsStateVariable: boolean
    ): void {
        if (memberSegments.length === 0) {
            this.checkAndReportFirstSegmentStateVariable(monitorDecorator, firstSegment, isGetMethod, context);
            return;
        }

        const property = this.getPropertyInDeclByName(node, firstSegment);
        if (property?.typeAnnotation && arkts.isETSUnionType(property.typeAnnotation)) {
            this.validateUnionTypeProperty(monitorDecorator, firstSegment, memberSegments, isGetMethod, context, property, firstSegmentIsStateVariable);
            return;
        }

        this.validateNonUnionTypeProperty(monitorDecorator, firstSegment, memberSegments, node, isGetMethod, context, firstSegmentIsStateVariable);
    }

    private checkAndReportFirstSegmentStateVariable(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegment: string,
        isGetMethod: boolean,
        context: MonitorPathValidationContext
    ): void {
        const isStateVariable = this.isFirstSegmentStateVariable(firstSegment, isGetMethod, context);
        if (!isStateVariable) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
        }
    }

    private isFirstSegmentStateVariable(firstSegment: string, isGetMethod: boolean, context: MonitorPathValidationContext): boolean {
        if (isGetMethod) {
            return context.type === CONTEXT_TYPE_CLASS
                ? this.hasGetMethodWithDecorator(context.node as arkts.ClassDeclaration, firstSegment, PresetDecorators.COMPUTED)
                : this.hasGetMethodWithDecoratorInStruct(context.node as arkts.StructDeclaration, firstSegment, PresetDecorators.COMPUTED);
        }
        return context.type === CONTEXT_TYPE_CLASS
            ? this.hasClassProperty(context.node as arkts.ClassDeclaration, firstSegment, PresetDecorators.TRACE)
            : (context.hasRequiredDecorator ?? false);
    }

    private validateUnionTypeProperty(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegment: string,
        memberSegments: string[],
        isGetMethod: boolean,
        context: MonitorPathValidationContext,
        property: arkts.ClassProperty,
        firstSegmentIsStateVariable: boolean
    ): void {
        const unionType = property.typeAnnotation as arkts.ETSUnionType;
        this.checkAndReportFirstSegmentStateVariable(monitorDecorator, firstSegment, isGetMethod, context);

        const membersWithProperty = this.collectMembersWithProperty(unionType, memberSegments);
        if (this.shouldUseArrayValidation(unionType, membersWithProperty, memberSegments)) {
            this.checkMonitorArrayIsValid(monitorDecorator, property, memberSegments, firstSegmentIsStateVariable);
            return;
        }

        const filteredMembers = membersWithProperty.filter(m => m !== ArrayTypes.Array);
        if (filteredMembers.length === 0) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
            return;
        }

        const allStateVariables = this.checkAllMembersStateVariables(filteredMembers, unionType, memberSegments);
        if (!allStateVariables || !firstSegmentIsStateVariable) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid, level: 'warn' });
        }
    }

    private collectMembersWithProperty(unionType: arkts.ETSUnionType, memberSegments: string[]): string[] {
        const membersWithProperty: string[] = [];
        for (const memberType of unionType.types) {
            if (arkts.isETSTypeReference(memberType)) {
                this.addClassTypeMember(memberType, memberSegments, membersWithProperty);
            } else if (this.isArrayType(memberType)) {
                this.addArrayTypeMember(memberType, memberSegments, membersWithProperty);
            }
        }
        return membersWithProperty;
    }

    private addClassTypeMember(memberType: arkts.ETSTypeReference, memberSegments: string[], membersWithProperty: string[]): void {
        const typeName = memberType.part?.name;
        if (!typeName || !arkts.isIdentifier(typeName)) {
            return;
        }
        const typeNameStr = typeName.name;
        const nodeInCollect = this.collectNode.get(typeNameStr);
        if (nodeInCollect && this.memberSegmentsTypeName(typeNameStr, memberSegments)) {
            membersWithProperty.push(typeNameStr);
        }
    }

    private addArrayTypeMember(memberType: arkts.TypeNode, memberSegments: string[], membersWithProperty: string[]): void {
        const isLengthAccess = this.isOnlyLengthAccess(memberSegments);
        if (isLengthAccess) {
            membersWithProperty.push(ArrayTypes.Array);
            return;
        }

        const firstSegmentIsIndex = memberSegments.length > 0 && this.isArrayIndex(memberSegments[0]);
        if (!firstSegmentIsIndex) {
            return;
        }

        const { elementType, pathIndex } = this.getArrayElementTypeAndDimension(memberType, memberSegments);
        const remainingSegments = memberSegments.slice(pathIndex);
        this.addArrayElementTypeMember(elementType, remainingSegments, membersWithProperty);
    }

    private addArrayElementTypeMember(elementType: arkts.TypeNode, remainingSegments: string[], membersWithProperty: string[]): void {
        if (arkts.isETSTypeReference(elementType)) {
            const typeName = elementType.part?.name;
            if (!typeName || !arkts.isIdentifier(typeName)) {
                return;
            }
            const elementTypeName = typeName.name;
            if (this.collectNode.get(elementTypeName)) {
                const hasRemainingPath = remainingSegments.length === 0 || this.memberSegmentsTypeName(elementTypeName, remainingSegments);
                if (hasRemainingPath) {
                    membersWithProperty.push(elementTypeName);
                }
            }
        } else if (this.isArrayType(elementType) && remainingSegments.length === 0) {
            membersWithProperty.push(ArrayTypes.Array);
        }
    }

    private shouldUseArrayValidation(unionType: arkts.ETSUnionType, membersWithProperty: string[], memberSegments: string[]): boolean {
        const hasArrayType = unionType.types.some(memberType => this.isArrayType(memberType));
        if (!hasArrayType) {
            return false;
        }

        const hasArrayMatch = membersWithProperty.includes(ArrayTypes.Array);
        const allFromArrayTypes = membersWithProperty.length > 0 && this.areAllMembersFromArrayTypes(membersWithProperty, unionType, memberSegments);
        const isLengthAccess = this.isOnlyLengthAccess(memberSegments);
        const isArrayIndexAccess = memberSegments.length > 0 && this.isArrayIndex(memberSegments[0]);

        return (hasArrayMatch || allFromArrayTypes) && (isArrayIndexAccess || isLengthAccess);
    }

    private areAllMembersFromArrayTypes(membersWithProperty: string[], unionType: arkts.ETSUnionType, memberSegments: string[]): boolean {
        return membersWithProperty.every(validMember => {
            if (validMember === ArrayTypes.Array) {
                return true;
            }
            return this.isMemberFromArrayType(validMember, unionType, memberSegments);
        });
    }

    private isMemberFromArrayType(validMember: string, unionType: arkts.ETSUnionType, memberSegments: string[]): boolean {
        for (const memberType of unionType.types) {
            if (!this.isArrayType(memberType)) {
                continue;
            }
            const { elementType } = this.getArrayElementTypeAndDimension(memberType, memberSegments);
            if (arkts.isETSTypeReference(elementType)) {
                const typeName = elementType.part?.name;
                if (typeName && arkts.isIdentifier(typeName) && typeName.name === validMember) {
                    return true;
                }
            }
        }
        return false;
    }

    private checkAllMembersStateVariables(filteredMembers: string[], unionType: arkts.ETSUnionType, memberSegments: string[]): boolean {
        return filteredMembers.every(validMember => {
            const memberNode = this.collectNode.get(validMember);
            if (!memberNode || (!arkts.isClassDeclaration(memberNode) && !arkts.isStructDeclaration(memberNode))) {
                return false;
            }
            const actualSegments = this.getActualSegmentsForMember(validMember, unionType, memberSegments);
            return this.checkNestedPathStateVariables(validMember, actualSegments, undefined).valid;
        });
    }

    private getActualSegmentsForMember(validMember: string, unionType: arkts.ETSUnionType, memberSegments: string[]): string[] {
        for (const memberType of unionType.types) {
            if (arkts.isETSTypeReference(memberType)) {
                const segments = this.getSegmentsForETSTypeReference(memberType, validMember, memberSegments);
                if (segments !== null) {
                    return segments;
                }
            } else if (this.isArrayType(memberType)) {
                const segments = this.getSegmentsForArrayType(memberType, validMember, memberSegments);
                if (segments !== null) {
                    return segments;
                }
            }
        }
        return memberSegments;
    }

    private getSegmentsForETSTypeReference(memberType: arkts.ETSTypeReference, validMember: string, memberSegments: string[]): string[] | null {
        const typeName = memberType.part?.name;
        if (typeName && arkts.isIdentifier(typeName) && typeName.name === validMember) {
            return memberSegments;
        }
        return null;
    }

    private getSegmentsForArrayType(memberType: arkts.TypeNode, validMember: string, memberSegments: string[]): string[] | null {
        const { elementType, pathIndex } = this.getArrayElementTypeAndDimension(memberType, memberSegments);
        if (!arkts.isETSTypeReference(elementType)) {
            return null;
        }
        const typeName = elementType.part?.name;
        if (typeName && arkts.isIdentifier(typeName) && typeName.name === validMember) {
            return memberSegments.slice(pathIndex);
        }
        return null;
    }

    private validateNonUnionTypeProperty(
        monitorDecorator: arkts.AnnotationUsage,
        firstSegment: string,
        memberSegments: string[],
        node: arkts.ClassDeclaration | arkts.StructDeclaration,
        isGetMethod: boolean,
        context: MonitorPathValidationContext,
        firstSegmentIsStateVariable: boolean
    ): void {
        this.checkAndReportFirstSegmentStateVariable(monitorDecorator, firstSegment, isGetMethod, context);

        const unionMemberNames = this.getUnionTypeMemberNamesFromNode(node, firstSegment);
        const validMembers = this.getValidUnionMembers(unionMemberNames);
        if (validMembers.length === 0) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
            return;
        }

        const membersWithProperty = validMembers.filter(member => this.memberSegmentsTypeName(member, memberSegments));
        if (membersWithProperty.length === 0) {
            this.report({ node: monitorDecorator, message: this.messages.monitorTargetInvalid });
            return;
        }

        const allStateVariables = membersWithProperty.every(validMember => {
            const memberNode = this.collectNode.get(validMember);
            if (!memberNode || (!arkts.isClassDeclaration(memberNode) && !arkts.isStructDeclaration(memberNode))) {
                return false;
            }
            return this.checkNestedPathStateVariables(validMember, memberSegments, firstSegmentIsStateVariable).valid;
        });

        if (!allStateVariables || !firstSegmentIsStateVariable) {
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
            const result = this.checkGetMethodStateVariable(monitorDecorator, firstSegment, context);
            return result;
        }
        const result = this.checkPropertyStateVariable(monitorDecorator, firstSegment, context);
        return result;
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
            ? this.hasClassProperty(
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
                        return this.hasClassProperty(node, name, PresetDecorators.TRACE);
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
                : this.hasClassProperty(typeNode as arkts.ClassDeclaration, segment, PresetDecorators.TRACE);
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
        segments: string[],
        firstSegmentIsStateVariable?: boolean
    ): PathValidationResult {
        let currentType = startType;
        let previousPropertyNode: arkts.ClassProperty | undefined = undefined;

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            if (this.isArrayIndex(segment)) {
                const arrayResult = this.processArrayIndexInPath(currentType, previousPropertyNode, segments, i);
                if (arrayResult.shouldReturn) {
                    return arrayResult.result;
                }
                currentType = arrayResult.newType;
                i = arrayResult.newIndex;
                previousPropertyNode = undefined;
                continue;
            }

            const propertyResult = this.processPropertyAccessInPath(segment, currentType);
            if (propertyResult.shouldReturn) {
                return propertyResult.result;
            }
            currentType = propertyResult.newType;
            previousPropertyNode = propertyResult.newPropertyNode;
        }

        if (firstSegmentIsStateVariable !== undefined && !firstSegmentIsStateVariable) {
            return { valid: false, isPropertyNotExists: false };
        }

        return { valid: true };
    }

    private processArrayIndexInPath(
        currentType: string,
        previousPropertyNode: arkts.ClassProperty | undefined,
        segments: string[],
        currentIndex: number
    ): ProcessArrayIndexReturn {
        if (!previousPropertyNode) {
            const typeNode = this.collectNode.get(currentType);
            const isArray = typeNode && arkts.isTypeNode(typeNode) && this.isArrayType(typeNode);
            if (!isArray && currentType.toLowerCase() !== TypeFlags.Array) {
                return { shouldReturn: true, result: { valid: false, isPropertyNotExists: true } };
            }
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: false } };
        }

        const arrayTypeAnnotation = previousPropertyNode.typeAnnotation;
        if (!arrayTypeAnnotation || !arkts.isTypeNode(arrayTypeAnnotation) || !this.isArrayType(arrayTypeAnnotation)) {
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: false } };
        }

        const remainingSegments = segments.slice(currentIndex);
        const { elementType, pathIndex } = this.getArrayElementTypeAndDimension(arrayTypeAnnotation, remainingSegments);
        if (!elementType) {
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: false } };
        }

        const elementTypeName = this.extractElementTypeNameFromArray(elementType);
        if (!elementTypeName) {
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: false } };
        }

        const newIndex = currentIndex + pathIndex;
        if (newIndex >= segments.length) {
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: false } };
        }

        return { shouldReturn: false, newType: elementTypeName, newIndex: newIndex - 1 };
    }

    private extractElementTypeNameFromArray(elementType: arkts.TypeNode): string | undefined {
        let elementTypeName = this.getTypeFromPropertyAnnotation(elementType);
        if (elementTypeName === TypeFlags.Array && arkts.isTypeNode(elementType) && this.isArrayType(elementType)) {
            const arrayDimInfo = this.getArrayDimensionByType(elementType);
            elementTypeName = arrayDimInfo.typeName || TypeFlags.Array;
        }
        if (!elementTypeName && arkts.isETSTypeReference(elementType)) {
            const partName = elementType.part?.name;
            elementTypeName = partName && arkts.isIdentifier(partName) ? partName.name : undefined;
        }
        return elementTypeName;
    }

    private processPropertyAccessInPath(
        segment: string,
        currentType: string
    ): ProcessPropertyAccessReturn {
        const typeNode = this.collectNode.get(currentType);
        if (!typeNode) {
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: false } };
        }

        const isClassNode = arkts.isClassDeclaration(typeNode);
        const isStructNode = arkts.isStructDeclaration(typeNode);
        const isGetMethod = (isClassNode || isStructNode) ? this.isGetMethod(typeNode, segment) : false;
        const nextType = this.getPropTypeName(typeNode, segment);

        if (isGetMethod && !nextType) {
            return { shouldReturn: true, result: { valid: true } };
        }

        if (!nextType && !isGetMethod) {
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: true } };
        }

        const isStateVariable = this.checkSegmentStateVariable(typeNode, segment, isGetMethod, isClassNode, isStructNode);
        if (!isStateVariable) {
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: false } };
        }

        if (!nextType || nextType === 'unknown') {
            return { shouldReturn: true, result: { valid: true } };
        }

        const newPropertyNode = (isClassNode || isStructNode) ? this.getPropertyInDeclByName(typeNode, segment) : undefined;
        return { shouldReturn: false, newType: nextType, newPropertyNode };
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
            annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === decoratorName
        );
    }

    private checkMonitorInComponentV2(node: arkts.StructDeclaration): void {
        if (!this.checkDecorator(node, PresetDecorators.COMPONENT_V2)) {
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
            const variableName = getClassPropertyName(member);
            if (variableName) {
                variableMap.set(variableName, getClassPropertyAnnotationNames(member) || []);
            }
        } else if (arkts.isMethodDefinition(member) && member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
            const methodId = member.scriptFunction?.id;
            if (methodId && arkts.isIdentifier(methodId) && methodId.name) {
                const methodDecorators = member.scriptFunction.annotations
                    ?.map(e => e.expr && arkts.isIdentifier(e.expr) && e.expr.name ? e.expr.name : '')
                    .filter(name => name) || [];
                variableMap.set(methodId.name, methodDecorators);
            }
        }
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
        if (!node.object || !node.property || !arkts.isIdentifier(node.object) || !arkts.isIdentifier(node.property)) {
            return undefined;
        }
        return this.enumMemberValues.get(`${node.object.name}.${node.property.name}`);
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
        return body.find((e: arkts.AstNode) =>
            arkts.isClassProperty(e) && this.isPropertyNameMatch(e, element)
        ) as arkts.ClassProperty | undefined;
    }

    private findMemberInClass(body: readonly arkts.AstNode[], element: string): arkts.ClassProperty | arkts.MethodDefinition | undefined {
        return body.find((e: arkts.AstNode) =>
            this.isMatchingProperty(e, element) || this.isMatchingGetMethod(e, element)
        ) as arkts.ClassProperty | arkts.MethodDefinition | undefined;
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
        return method.scriptFunction?.returnTypeAnnotation
            ? this.getTypeFromPropertyAnnotation(method.scriptFunction.returnTypeAnnotation)
            : undefined;
    }

    private getTypeFromProperty(prop: arkts.ClassProperty, node: arkts.AstNode, element: string): string | undefined {
        if (!arkts.isClassProperty(prop) || !prop.typeAnnotation) {
            return this.findPropTypeInParentClass(node, element);
        }

        const typeName = this.getTypeFromPropertyAnnotation(prop.typeAnnotation);
        if (typeName) {
            return typeName;
        }

        return 'unknown';
    }

    private getTypeFromPropertyAnnotation(typeAnnotation: arkts.AstNode | undefined): string | undefined {
        if (!typeAnnotation) {
            return undefined;
        }

        if (arkts.isETSTypeReference(typeAnnotation)) {
            const partName = typeAnnotation.part?.name;
            return partName && arkts.isIdentifier(partName) ? partName.name : undefined;
        }

        if (arkts.isETSUnionType(typeAnnotation)) {
            return TypeFlags.Union;
        }

        if (arkts.isTypeNode(typeAnnotation) && this.isArrayType(typeAnnotation)) {
            return TypeFlags.Array;
        }

        if (arkts.isETSPrimitiveType(typeAnnotation)) {
            return 'unknown';
        }

        return undefined;
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
            } else if (this.isArrayType(memberType)) {
                const { typeName } = this.getArrayDimensionByType(memberType);
                if (typeName) {
                    memberTypes.push(typeName);
                }
            }
        }

        return memberTypes;
    }

    private getUnionTypeMemberNamesFromNode(node: arkts.AstNode, propertyName: string): string[] {
        const body = (arkts.isClassDeclaration(node) || arkts.isStructDeclaration(node))
            ? node.definition?.body
            : undefined;

        if (body) {
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
        }

        if (arkts.isClassDeclaration(node)) {
            const parentNode = this.getParentClass(node);
            if (parentNode) {
                return this.getUnionTypeMemberNamesFromNode(parentNode, propertyName);
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
            return !!(member.key && arkts.isIdentifier(member.key) && member.key.name === propertyName);
        }
        if (arkts.isMethodDefinition(member)) {
            return !!(member.name && arkts.isIdentifier(member.name) && member.name.name === propertyName);
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
        if (!arkts.isClassDeclaration(node)) {
            return undefined;
        }
        const parentNode = this.getParentClass(node);
        return parentNode ? this.getPropTypeName(parentNode, element) : undefined;
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
        const validMembers = unionMemberNames.filter(name => this.collectNode.get(name) !== undefined);
        if (validMembers.length === 0) {
            return false;
        }
        return remainingPath.length === 0 || validMembers.some((member: string) => this.memberSegmentsTypeName(member, remainingPath));
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
            const result = this.processPathSegment(currentFather, variableArray, i);
            if (result.shouldReturn) {
                return result.returnValue;
            }
            if (result.shouldContinue) {
                currentFather = result.newFather;
                i = result.newIndex;
                continue;
            }
            currentFather = result.newFather;
        }
        return true;
    }

    private processPathSegment(currentFather: string, variableArray: string[], i: number): {
        shouldReturn: boolean;
        returnValue: boolean;
        shouldContinue: boolean;
        newFather: string;
        newIndex: number;
    } {
        const element = variableArray[i];
        const remainingPath = variableArray.slice(i + 1);

        const sizeCheck = this.checkMapSetSize(currentFather, element, remainingPath);
        if (sizeCheck !== null) {
            return this.createReturnResult(true, sizeCheck, false, currentFather, i);
        }

        const node = this.collectNode.get(currentFather);
        if (!node) {
            if (currentFather.toLowerCase() === TypeFlags.Array && this.isArrayIndex(element)) {
                const result = this.handleArrayTypeFather(variableArray, i, currentFather);
                return result;
            }
            const result = this.handleMapSetSizeWhenNodeMissing(currentFather, element, variableArray, i);
            return this.createReturnResult(true, result, false, currentFather, i);
        }

        const arrayIndexResult = this.checkArrayIndexAccess(node, element, variableArray, i);
        if (arrayIndexResult !== null) {
            return arrayIndexResult;
        }

        const unionLengthResult = this.checkUnionTypeLengthAccess(node, element, variableArray, i);
        if (unionLengthResult !== null) {
            return this.createReturnResult(true, unionLengthResult, false, currentFather, i);
        }

        const unionMemberNames = this.getUnionTypeMemberNamesFromNode(node, element);
        if (unionMemberNames.length > 0) {
            const result = this.handleUnionTypeInPath(unionMemberNames, variableArray, i);
            return this.createReturnResult(true, result, false, currentFather, i);
        }

        const propExists = this.propertyExistInType(node, element);
        if (!propExists) {
            return this.createReturnResult(true, false, false, currentFather, i);
        }

        const getMethodResult = this.handleGetMethodCheck(node, element);
        if (getMethodResult !== null) {
            return this.createReturnResult(true, getMethodResult, false, currentFather, i);
        }

        const newFather = this.getPropTypeName(node, element) || element;
        return this.handleNewFatherType(newFather, node, element, variableArray, i);
    }

    private createReturnResult(
        shouldReturn: boolean,
        returnValue: boolean,
        shouldContinue: boolean,
        newFather: string,
        newIndex: number
    ): {
        shouldReturn: boolean;
        returnValue: boolean;
        shouldContinue: boolean;
        newFather: string;
        newIndex: number;
    } {
        return { shouldReturn, returnValue, shouldContinue, newFather, newIndex };
    }

    private checkArrayIndexAccess(
        node: arkts.AstNode,
        element: string,
        variableArray: string[],
        i: number
    ): {
        shouldReturn: boolean;
        returnValue: boolean;
        shouldContinue: boolean;
        newFather: string;
        newIndex: number;
    } | null {
        const nextElement = variableArray[i + 1];
        if (!nextElement || !this.isArrayIndex(nextElement)) {
            return null;
        }
        const unionArrayResult = this.handleUnionTypeWithArrayIndex(node, element, variableArray, i);
        if (unionArrayResult !== null) {
            return this.createReturnResult(true, unionArrayResult, false, variableArray[i], i);
        }
        return null;
    }

    private checkUnionTypeLengthAccess(node: arkts.AstNode, element: string, variableArray: string[], i: number): boolean | null {
        if (!arkts.isClassDeclaration(node) && !arkts.isStructDeclaration(node)) {
            return null;
        }
        const property = this.getPropertyInDeclByName(node, element);
        if (!property?.typeAnnotation || !arkts.isETSUnionType(property.typeAnnotation)) {
            return null;
        }
        const unionType = property.typeAnnotation as arkts.ETSUnionType;
        const nextElement = variableArray[i + 1];
        if (nextElement === 'length' && unionType.types.some(memberType => this.isArrayType(memberType))) {
            return true;
        }
        return null;
    }

    private handleGetMethodCheck(node: arkts.AstNode, element: string): boolean | null {
        const isGetMethod = (arkts.isClassDeclaration(node) || arkts.isStructDeclaration(node))
            ? this.isGetMethod(node, element)
            : false;
        const nextType = this.getPropTypeName(node, element);
        if (isGetMethod && !nextType) {
            return true;
        }
        return null;
    }

    private handleNewFatherType(
        newFather: string,
        node: arkts.AstNode,
        element: string,
        variableArray: string[],
        i: number
    ): {
        shouldReturn: boolean;
        returnValue: boolean;
        shouldContinue: boolean;
        newFather: string;
        newIndex: number;
    } {
        if (newFather === TypeFlags.Union) {
            return this.handleUnionTypeFather(node, element, variableArray, i, newFather);
        }

        if (this.isMapOrSetType(newFather) && i < variableArray.length - 1) {
            return this.handleMapSetTypeFather(newFather, variableArray, i);
        }

        if (newFather.toLowerCase() === TypeFlags.Array) {
            return this.handleArrayTypeFather(variableArray, i, newFather);
        }

        return { shouldReturn: false, returnValue: false, shouldContinue: false, newFather: newFather, newIndex: i };
    }

    private handleUnionTypeFather(
        node: arkts.AstNode,
        element: string,
        variableArray: string[],
        i: number,
        newFather: string
    ): {
        shouldReturn: boolean;
        returnValue: boolean;
        shouldContinue: boolean;
        newFather: string;
        newIndex: number;
    } {
        const propUnionMembers = this.getUnionTypeMemberNamesFromNode(node, element);
        const result = this.handleUnionTypeInPath(propUnionMembers, variableArray, i);
        return { shouldReturn: true, returnValue: result, shouldContinue: false, newFather: newFather, newIndex: i };
    }

    private handleMapSetTypeFather(
        newFather: string,
        variableArray: string[],
        i: number
    ): {
        shouldReturn: boolean;
        returnValue: boolean;
        shouldContinue: boolean;
        newFather: string;
        newIndex: number;
    } {
        const nextElement = variableArray[i + 1];
        const result = nextElement === 'size' && i + 1 < variableArray.length - 1 ? false : true;
        return { shouldReturn: true, returnValue: result, shouldContinue: false, newFather: newFather, newIndex: i };
    }

    private handleArrayTypeFather(
        variableArray: string[],
        i: number,
        newFather: string
    ): {
        shouldReturn: boolean;
        returnValue: boolean;
        shouldContinue: boolean;
        newFather: string;
        newIndex: number;
    } {
        const arrayIndexResult = this.handleArrayTypeWithIndex(variableArray, i);
        if (arrayIndexResult !== null) {
            const result = {
                shouldReturn: arrayIndexResult.shouldReturn,
                returnValue: arrayIndexResult.returnValue,
                shouldContinue: !arrayIndexResult.shouldReturn,
                newFather: arrayIndexResult.newFather,
                newIndex: arrayIndexResult.newIndex
            };
            return result;
        }
        return { shouldReturn: true, returnValue: true, shouldContinue: false, newFather: newFather, newIndex: i };
    }

    private isMapOrSetType(typeName: string): boolean {
        return this.isMapType(typeName) || this.isSetType(typeName);
    }

    private handleUnionTypeWithArrayIndex(
        node: arkts.AstNode,
        element: string,
        variableArray: string[],
        currentIndex: number
    ): boolean | null {
        if (!arkts.isClassDeclaration(node) && !arkts.isStructDeclaration(node)) {
            return null;
        }
        const property = this.getPropertyInDeclByName(node, element);
        if (!property || !property.typeAnnotation || !arkts.isETSUnionType(property.typeAnnotation)) {
            return null;
        }
        const unionType = property.typeAnnotation as arkts.ETSUnionType;
        const remainingPath = variableArray.slice(currentIndex + 1);
        return this.processUnionTypeArrayMembers(unionType, remainingPath);
    }

    private processUnionTypeArrayMembers(unionType: arkts.ETSUnionType, remainingPath: string[]): boolean | null {
        for (const memberType of unionType.types) {
            if (!this.isArrayType(memberType)) {
                continue;
            }
            const { elementType, pathIndex } = this.getArrayElementTypeAndDimension(memberType, remainingPath);
            const finalRemainingPath = remainingPath.slice(pathIndex);
            const result = this.processArrayElementType(elementType, finalRemainingPath);
            if (result !== null) {
                return result;
            }
        }
        return null;
    }

    private processArrayElementType(elementType: arkts.TypeNode, finalRemainingPath: string[]): boolean | null {
        if (arkts.isETSTypeReference(elementType)) {
            return this.processETSTypeReferenceElement(elementType, finalRemainingPath);
        }
        if (this.isArrayType(elementType)) {
            if (finalRemainingPath.length === 0) {
                return true;
            }
        }
        return null;
    }

    private processETSTypeReferenceElement(elementType: arkts.ETSTypeReference, finalRemainingPath: string[]): boolean | null {
        const typeName = elementType.part?.name;
        if (!typeName || !arkts.isIdentifier(typeName)) {
            return null;
        }
        const elementTypeName = typeName.name;
        if (!this.collectNode.get(elementTypeName)) {
            return null;
        }
        if (finalRemainingPath.length === 0) {
            return true;
        }
        if (this.memberSegmentsTypeName(elementTypeName, finalRemainingPath)) {
            return true;
        }
        return null;
    }

    private handleArrayTypeWithIndex(
        variableArray: string[],
        currentIndex: number
    ): {
        newIndex: number;
        newFather: string;
        shouldReturn: boolean;
        returnValue: boolean;
    } | null {
        if (currentIndex >= variableArray.length - 1) {
            return null;
        }
        const nextElement = variableArray[currentIndex + 1];
        if (!this.isArrayIndex(nextElement)) {
            return null;
        }
        const newIndex = currentIndex + 1;
        if (newIndex >= variableArray.length) {
            return { newIndex, newFather: TypeFlags.Array, shouldReturn: true, returnValue: true };
        }
        return { newIndex, newFather: TypeFlags.Array, shouldReturn: false, returnValue: false };
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