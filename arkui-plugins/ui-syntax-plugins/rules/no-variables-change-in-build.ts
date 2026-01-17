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
    getIdentifierName,
    BUILD_NAME,
    getClassPropertyName,
    getClassPropertyAnnotationNames,
    TypeFlags
} from '../utils';

enum ArrayTypes {
    Array = 'Array',
    Map = 'Map',
    Set = 'Set',
    Date = 'Date'
}

class NoVariablesChangeInBuildRule extends AbstractUISyntaxRule {
    private inBuildMethod: boolean = false;
    private inBuilderMethod: boolean = false;
    private collectNode: Map<string, arkts.AstNode> = new Map();
    private builderVariableCollect: Map<string, string[]> = new Map();
    private variableCollect: Map<string, string[]> = new Map();
    private structNode: arkts.StructDeclaration | undefined;

    public setup(): Record<string, string> {
        return {
            noVariablesChangeInBuild: `State variables cannot be modified during the build process.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        this.initList(node);
        this.checkVarChangeInStructBuild(node);
        this.checkVarChangeOutsideStruct(node);
    }

    private checkVarChangeInStructBuild(node: arkts.AstNode): void {
        if (arkts.isStructDeclaration(node)) {
            this.variableCollect = this.collectVariables(node);
            this.structNode = node;
        }
        else if (arkts.isMethodDefinition(node) &&
            node.name &&
            getIdentifierName(node.name) === BUILD_NAME) {
            this.inBuildMethod = true;
        }
        else if (arkts.isMethodDefinition(node) && this.hasBuilderDecorator(node)) {
            this.inBuilderMethod = true;
            this.inBuildMethod = false;
            this.builderVariableCollect.clear();
        }
        else if (this.inBuilderMethod && arkts.isBlockStatement(node)) {
            this.collectBuilderVariables(node);
        }
        else if (this.inBuildMethod || this.inBuilderMethod) {
            this.checkBuildVariableModification(node, this.variableCollect);
        }
    }

    private checkVarChangeOutsideStruct(node: arkts.AstNode): void {
        if (arkts.isFunctionDeclaration(node)) {
            this.handleFunctionDeclaration(node);
        }
        if (arkts.isBlockStatement(node)) {
            this.checkBuilderBody(node, this.builderVariableCollect);
        }
    }

    private handleFunctionDeclaration(node: arkts.FunctionDeclaration): void {
        if (!this.isBuilderFunction(node)) {
            return;
        }
        this.builderVariableCollect.clear();
        if (!node.scriptFunction.body || !arkts.isBlockStatement(node.scriptFunction.body)) {
            return;
        }
        this.collectBuilderVariables(node.scriptFunction.body);
        this.checkBuilderBody(node.scriptFunction.body, this.builderVariableCollect);
    }

    private isBuilderFunction(node: arkts.FunctionDeclaration): boolean {
        return node.annotations.some(annotation => {
            return annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === 'Builder';
        });
    }

    private collectBuilderVariables(block: arkts.BlockStatement): void {
        for (const statement of block.statements) {
            if (!arkts.isVariableDeclaration(statement)) {
                continue;
            }
            this.processVariableDeclarations(statement);
        }
    }

    private processVariableDeclarations(statement: arkts.VariableDeclaration): void {
        for (const declarator of statement.declarators) {
            if (!arkts.isVariableDeclarator(declarator) || !arkts.isIdentifier(declarator.name)) {
                continue;
            }
            this.processVariableDeclarator(declarator);
        }
    }

    private processVariableDeclarator(declarator: arkts.VariableDeclarator): void {
        const varName = getIdentifierName(declarator.name);
        if (!this.isValidRememberVariable(declarator)) {
            return;
        }
        this.builderVariableCollect.set(varName, ['MutableVariable']);
    }

    private isValidRememberVariable(declarator: arkts.VariableDeclarator): boolean {
        return !!(
            declarator.initializer && 
            arkts.isCallExpression(declarator.initializer) && 
            arkts.isIdentifier(declarator.initializer.expression) &&
            getIdentifierName(declarator.initializer.expression) === 'rememberVariable'
        );
    }

    private checkBuilderBody(body: arkts.BlockStatement, variableCollect: Map<string, string[]>): void {
        for (const statement of body.statements) {
            this.checkStatementForModifications(statement, variableCollect);
        }
    }

    private checkStatementForModifications(statement: arkts.AstNode, variableCollect: Map<string, string[]>): void {
        if (arkts.isAssignmentExpression(statement) || arkts.isUpdateExpression(statement)) {
            this.checkBuilderVariableModification(statement, variableCollect);
        } else if (arkts.isExpressionStatement(statement) && statement.expression) {
            this.checkExpressionForModifications(statement.expression, variableCollect);
        } else if (arkts.isCallExpression(statement)) {
            this.checkCallExpressionForModifications(statement, variableCollect);
        }
    }

    private checkExpressionForModifications(expression: arkts.AstNode, variableCollect: Map<string, string[]>): void {
        if (arkts.isAssignmentExpression(expression) || arkts.isUpdateExpression(expression)) {
            this.checkBuilderVariableModification(expression, variableCollect);
        } else if (arkts.isTemplateLiteral(expression)) {
            const templateNode = expression;
            if (templateNode.expressions) {
                for (const expr of templateNode.expressions) {
                    this.checkExpressionForModifications(expr, variableCollect);
                }
            }
        } else if (arkts.isCallExpression(expression)) {
            this.checkCallExpressionForModifications(expression, variableCollect);
        }
    }

    private checkCallExpressionForModifications(callExpr: arkts.CallExpression, variableCollect: Map<string, string[]>): void {
        if (callExpr.arguments) {
            for (const arg of callExpr.arguments) {
                this.checkExpressionForModifications(arg, variableCollect);
            }
        }
        const expression = callExpr.expression;
        if (arkts.isMemberExpression(expression)) {
            if (expression.object) {
                this.checkExpressionForModifications(expression.object, variableCollect);
            }
        } else if (arkts.isCallExpression(expression)) {
            this.checkCallExpressionForModifications(expression, variableCollect);
        }
    }

    private checkBuilderVariableModification(node: arkts.AstNode, variableCollect: Map<string, string[]>): void {
        if (this.isInArrowFunction(node)) {
            return;
        }
        if (arkts.isAssignmentExpression(node)) {
            if (node.left) {
                this.validateBuilderStateModification(node.left, node, variableCollect);
            }
        } else if (arkts.isUpdateExpression(node)) {
            type UpdateExpressionNode = arkts.AstNode & { argument?: arkts.AstNode; operand?: arkts.AstNode };
            const updateNode = node as UpdateExpressionNode;
            const operand = updateNode.argument || updateNode.operand;
            if (operand) {
                this.validateBuilderStateModification(operand, node, variableCollect);
            }
        }
    }

    private validateBuilderStateModification(left: arkts.AstNode, errorNode: arkts.AstNode, variableCollect: Map<string, string[]>): void {
        const variableName = this.extractPropertyNames(left);
        const firstState = variableCollect.get(variableName[0])
        if (firstState && variableName[1] === 'value') {
            this.report({
                node: errorNode,
                message: this.messages.noVariablesChangeInBuild,
                level: 'warn'
            });
        }
    }

    private hasBuilderDecorator(methodNode: arkts.MethodDefinition): boolean {
        if (!methodNode.scriptFunction || !methodNode.scriptFunction.annotations) {
            return false;
        }
        for (const annotation of methodNode.scriptFunction.annotations) {
            if (annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === 'Builder') {
                return true;
            }
        }
        return false;
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

    private initList(node: arkts.AstNode): void {
        if (!arkts.isEtsScript(node) || node.isNamespace) {
            return;
        }
        node.statements.forEach((member) => {
            this.collectClassDeclaration(member);
            this.collectInterfaceDeclaration(member);
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

    private checkBuildVariableModification(node: arkts.AstNode, veriableCollect: Map<string, string[]>): void {
        const isArrowFunction = this.isInArrowFunction(node);
        if (isArrowFunction) {
            return;
        }
        if (arkts.isAssignmentExpression(node) || arkts.isUpdateExpression(node)) {
            const left = arkts.isAssignmentExpression(node) ? node.left : node.argument;
            if(left){
                this.validateStateModification(left, node, veriableCollect);
                this.validateNestPath(left, node, veriableCollect);
            }
            if (arkts.isUpdateExpression(node) && node.argument && arkts.isMemberExpression(node.argument)) {
                const builderVeriable = node.argument.object;
                if (builderVeriable && arkts.isIdentifier(builderVeriable)) {
                    const builderGlobal = getIdentifierName(builderVeriable);
                    this.validateMemberExpression(node, this.builderVariableCollect, builderGlobal)
                }
            }
        }
    }

    private validateNestPath(left: arkts.AstNode, errorNode: arkts.AstNode, variableCollect: Map<string, string[]>): void {
        if (arkts.isMemberExpression(left)) {
            const propertyNames: string[] = this.extractPropertyNames(left);
            const firstTypeName = this.firstSegmentTypeName(propertyNames[0], this.structNode);
            const firstNode = firstTypeName ? this.checkFirstStateNode(this.structNode, propertyNames[0]) : undefined;
            const firstState = variableCollect.get(propertyNames[0]);
            const nestPath = propertyNames.slice(1);
            const nestState = this.checkRemainState(nestPath, firstTypeName, firstNode);
            if (firstState?.length && nestState) {
                this.report({
                    node: errorNode,
                    message: this.messages.noVariablesChangeInBuild,
                })
            }
            if (!firstState?.length || !nestState) {
                this.report({
                    node: errorNode,
                    message: this.messages.noVariablesChangeInBuild,
                    level: 'warn'
                })
            }
        };
    }

    private checkFirstStateNode(node: arkts.StructDeclaration | undefined, memberName: string): arkts.AstNode | undefined {
        if (!node) {
            return undefined;
        }
        for (const member of node.definition.body) {
            if (arkts.isClassProperty(member) &&
                member.key &&
                arkts.isIdentifier(member.key) &&
                member.key.name === memberName) {
                return member;
            }
        }
        return undefined;
    }

    private checkRemainState(propertyPath: string[], currentTypeName: string | undefined, firstNode?: arkts.AstNode | undefined): boolean {
        if (!propertyPath || propertyPath.length === 0) {
            return true;
        }
        if (!currentTypeName) {
            return false;
        }
        if (this.shouldProcessUnionType(currentTypeName, firstNode)) {
            return this.handleUnionTypeProcessing(firstNode!, propertyPath);
        }
        const firstPropertyName = propertyPath[0];
        const remainingPath = propertyPath.slice(1);
        const classNode = this.collectNode.get(currentTypeName);
        if (!this.isValidClassNode(classNode)) {
            return false;
        }
        const matchedMemberResult = this.checkCurrentClassMembers(classNode!, firstPropertyName, remainingPath);
        if (matchedMemberResult !== null) {
            return matchedMemberResult;
        }
        return this.checkSuperClassInheritance(classNode!, propertyPath);
    }

    private shouldProcessUnionType(currentTypeName: string, firstNode?: arkts.AstNode): boolean | undefined {
        return currentTypeName === TypeFlags.Union &&
            firstNode &&
            arkts.isClassProperty(firstNode) &&
            firstNode.typeAnnotation &&
            arkts.isETSUnionType(firstNode.typeAnnotation);
    }

    private handleUnionTypeProcessing(firstNode: arkts.AstNode, remainingPath: string[]): boolean {
        if (!firstNode || !arkts.isClassProperty(firstNode) || !firstNode.typeAnnotation || !arkts.isETSUnionType(firstNode.typeAnnotation)) {
            return false;
        }
        const unionTypes = this.getUnionElementTypes(firstNode.typeAnnotation!, remainingPath);
        return unionTypes.every((type) => {
            return this.checkRemainState(remainingPath, type);
        });
    }

    private isValidClassNode(classNode: arkts.AstNode | undefined): boolean {
        return !!classNode && arkts.isClassDeclaration(classNode) && !!classNode.definition?.body;
    }

    private checkCurrentClassMembers(classNode: arkts.AstNode, firstPropertyName: string, remainingPath: string[]): boolean | null {
        if (!arkts.isClassDeclaration(classNode)) {
            return null;
        }
        for (const member of classNode.definition!.body) {
            if (!this.isMatchingMember(member, firstPropertyName)) {
                continue;
            }
            const annotationNames = this.getMemberAnnotationNames(member);
            if (annotationNames.length === 0) {
                return false;
            }
            if (arkts.isClassProperty(member)) {
                return this.handlePropertyType(member, firstPropertyName, remainingPath);
            }
            return remainingPath.length === 0;
        }
        return null;
    }

    private isMatchingMember(member: arkts.AstNode, propertyName: string): boolean {
        return (arkts.isClassProperty(member) || arkts.isMethodDefinition(member)) &&
            this.isPropertyNameMatch(member, propertyName);
    }

    private getMemberAnnotationNames(member: arkts.AstNode): string[] {
        let annotationNames: string[] = [];
        if (arkts.isClassProperty(member)) {
            annotationNames = getClassPropertyAnnotationNames(member) || [];
        } else if (arkts.isMethodDefinition(member) && member.scriptFunction?.annotations) {
            annotationNames = member.scriptFunction.annotations
                .map(annotation => {
                    if (annotation.expr && arkts.isIdentifier(annotation.expr)) {
                        return annotation.expr.name;
                    }
                    return '';
                })
                .filter(name => name !== '');
        }
        return annotationNames;
    }

    private handlePropertyType(member: arkts.ClassProperty, firstPropertyName: string, remainingPath: string[]): boolean {
        const propertyType = this.getTypeFromPropertyAnnotation(member.typeAnnotation);
        if (propertyType === TypeFlags.Union && member.typeAnnotation && arkts.isETSUnionType(member.typeAnnotation)) {
            return this.handleUnionPropertyType(member, remainingPath);
        }
        if (propertyType === TypeFlags.Array.toLocaleLowerCase()) {
            return this.handleArrayPropertyType(member, firstPropertyName, remainingPath);
        }
        if (this.isValidPropertyType(propertyType)) {
            return this.checkRemainState(remainingPath, propertyType!);
        }
        return remainingPath.length === 0;
    }

    private handleUnionPropertyType(member: arkts.ClassProperty, remainingPath: string[]): boolean {
        if (!member.typeAnnotation || !arkts.isETSUnionType(member.typeAnnotation)) {
            return false;
        }
        const unionTypes = this.getUnionElementTypes(member.typeAnnotation!, remainingPath);
        return unionTypes.every((type) => {
            return this.checkRemainState(remainingPath, type);
        });
    }

    private handleArrayPropertyType(member: arkts.ClassProperty, firstPropertyName: string, remainingPath: string[]): boolean {
        const arrayTypeName = this.getArrayElementTypeName(member, firstPropertyName);
        if (arrayTypeName) {
            return this.checkRemainState(remainingPath, arrayTypeName);
        }
        return remainingPath.length === 0;
    }

    private isValidPropertyType(propertyType: string | undefined): boolean {
        return !!(propertyType &&
            propertyType !== TypeFlags.Union &&
            propertyType !== TypeFlags.Array &&
            propertyType !== 'unknown');
    }

    private checkSuperClassInheritance(classNode: arkts.AstNode, propertyPath: string[]): boolean {
        if (!arkts.isClassDeclaration(classNode)) {
            return false;
        }
        if (!classNode.definition?.super || !arkts.isETSTypeReference(classNode.definition.super)) {
            return false;
        }
        const superPart = classNode.definition.super.part;
        if (superPart && arkts.isETSTypeReferencePart(superPart) && superPart.name && arkts.isIdentifier(superPart.name)) {
            const parentTypeName = superPart.name.name;
            return this.checkRemainState(propertyPath, parentTypeName);
        }
        return false;
    }

    private extractPropertyNames(node: arkts.AstNode): string[] {
        if (arkts.isIdentifier(node) && (node as arkts.Identifier).name) {
            return [(node as arkts.Identifier).name];
        }
        if (arkts.isMemberExpression(node)) {
            const memberExpr = node as arkts.MemberExpression;
            const objectParts = this.extractPropertyNames(memberExpr.object);
            const propertyParts = this.extractPropertyNames(memberExpr.property);
            return [...objectParts, ...propertyParts];
        }
        return [];
    };

    private firstSegmentTypeName(variableName: string, node: arkts.StructDeclaration | arkts.ClassDeclaration | undefined): string | undefined {
        if (!node) {
            return undefined;
        }
        if (!(arkts.isStructDeclaration(node) || arkts.isClassDeclaration(node)) || !node.definition?.body) {
            return arkts.isClassDeclaration(node) ? this.findVariableTypeInParentClass(variableName, node) : undefined;
        }
        for (const e of node.definition.body) {
            const typeFromProperty = this.getTypeFromClassProperty(e, variableName);
            if (typeFromProperty !== undefined) {
                if (typeFromProperty === TypeFlags.Array) {
                    const elementTypeName = this.getArrayElementTypeName(e, variableName);
                    return elementTypeName;
                }
                return typeFromProperty;
            }
        }
        return arkts.isClassDeclaration(node) ? this.findVariableTypeInParentClass(variableName, node) : undefined;
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

    private getArrayElementTypeName(member: arkts.AstNode, variableName: string): string | undefined {
        if (!arkts.isClassProperty(member)) {
            return undefined;
        }
        if (!this.isPropertyNameMatch(member, variableName) || !member.typeAnnotation) {
            return undefined;
        }
        const elementType = this.getArrayElementType(member.typeAnnotation as arkts.TypeNode);
        if (!elementType) {
            return undefined;
        }
        return this.getTypeFromPropertyAnnotation(elementType);
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

    private getTypeFromClassProperty(member: arkts.AstNode, variableName: string): string | undefined {
        if (!arkts.isClassProperty(member)) {
            return undefined;
        }
        if (!this.isPropertyNameMatch(member, variableName) || !member.typeAnnotation) {
            return undefined;
        }
        return this.getTypeFromPropertyAnnotation(member.typeAnnotation);
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

    private getUnionElementTypes(unionType: arkts.ETSUnionType, remainingPath: string[]): string[] {
        const membersWithRemainingPath: string[] = [];
        for (const memberType of unionType.types) {
            if (arkts.isETSTypeReference(memberType)) {
                this.addClassTypeMember(memberType, remainingPath, membersWithRemainingPath);
            } else if (this.isArrayType(memberType)) {
                this.addArrayTypeMember(memberType, remainingPath, membersWithRemainingPath);
            }
        }
        return membersWithRemainingPath;
    }

    private addClassTypeMember(memberType: arkts.ETSTypeReference, remainingPath: string[], membersWithRemainingPath: string[]): void {
        const typeName = memberType.part?.name;
        if (!typeName || !arkts.isIdentifier(typeName)) {
            return;
        }
        const typeNameStr = typeName.name;
        const classNode = this.collectNode.get(typeNameStr);
        if (!classNode) {
            return;
        }
        if (remainingPath.length === 0) {
            membersWithRemainingPath.push(typeNameStr);
            return;
        }
        const firstPropertyName = remainingPath[0];
        const nextRemainingPath = remainingPath.slice(1);
        if (this.hasPropertyInType(classNode, firstPropertyName, nextRemainingPath)) {
            membersWithRemainingPath.push(typeNameStr);
        }
    }

    private addArrayTypeMember(memberType: arkts.TypeNode, remainingPath: string[], membersWithRemainingPath: string[]): void {
        if (remainingPath.length === 0) {
            return;
        }
        const { elementType, pathIndex } = this.getArrayElementTypeAndDimension(memberType, remainingPath);
        const finalRemainingPath = remainingPath.slice(pathIndex);
        if (finalRemainingPath.length === 0) {
            return;
        }
        const elementTypeName = this.getTypeFromPropertyAnnotation(elementType);
        if (elementTypeName && elementTypeName !== TypeFlags.Union && elementTypeName !== TypeFlags.Array && elementTypeName !== 'unknown') {
            const firstPropertyName = finalRemainingPath[0];
            const nextRemainingPath = finalRemainingPath.slice(1);
            if (this.hasPropertyInTypeByName(elementTypeName, firstPropertyName, nextRemainingPath)) {
                membersWithRemainingPath.push(elementTypeName);
            }
        }
    }

    private getArrayElementTypeAndDimension(arrayType: arkts.TypeNode, remainingPath: string[]): { elementType: arkts.TypeNode; pathIndex: number } {
        let currentType: arkts.TypeNode = arrayType;
        let pathIndex = 0;
        while (this.isArrayType(currentType) && pathIndex < remainingPath.length && this.isArrayIndex(remainingPath[pathIndex])) {
            const elementType = this.getArrayElementType(currentType);
            if (!elementType) {
                break;
            }
            currentType = elementType;
            pathIndex++;
        }
        return { elementType: currentType, pathIndex };
    }

    private hasPropertyInType(typeNode: arkts.AstNode, propertyName: string, remainingPath: string[]): boolean {
        if (arkts.isClassDeclaration(typeNode) || arkts.isStructDeclaration(typeNode)) {
            const body = typeNode.definition?.body;
            if (!body) {
                return false;
            }
            for (const member of body) {
                if (!arkts.isClassProperty(member) ||
                    !this.isPropertyNameMatch(member, propertyName)) {
                    continue;
                }
                if (remainingPath.length === 0) {
                    return true;
                }
                const propertyType = this.getTypeFromPropertyAnnotation(member.typeAnnotation);
                if (propertyType && propertyType !== TypeFlags.Union && propertyType !== TypeFlags.Array && propertyType !== 'unknown') {
                    return this.checkRemainState(remainingPath, propertyType);
                }
            }
        }
        return false;
    }

    private hasPropertyInTypeByName(typeName: string, propertyName: string, remainingPath: string[]): boolean {
        const classNode = this.collectNode.get(typeName);
        if (!classNode) {
            return false;
        }
        return this.hasPropertyInType(classNode, propertyName, remainingPath);
    }

    private isArrayIndex(str: string): boolean {
        return /^[0-9]+$/.test(str) && !/^0\d/.test(str) && Number.isSafeInteger(Number(str));
    }

    private isInArrowFunction(node: arkts.AstNode): boolean {
        type AstNodeWithParent = arkts.AstNode & { parent?: arkts.AstNode };
        let current: AstNodeWithParent | undefined = node as AstNodeWithParent;
        while (current) {
            if (arkts.isArrowFunctionExpression(current)) {
                return true;
            }
            current = current.parent;
        }
        return false;
    }

    private validateMemberExpression(node: arkts.AstNode, variableCollect: Map<string, string[]>, veriableValue: string): void {
        if (variableCollect.get(veriableValue)) {
            this.report({
                node: node,
                message: this.messages.noVariablesChangeInBuild,
            })
        }
    }

    private validateStateModification(left: arkts.AstNode, errorNode: arkts.AstNode, variableCollect: Map<string, string[]>): void {
        if (!arkts.isMemberExpression(left) ||
            !arkts.isThisExpression(left.object) ||
            !arkts.isIdentifier(left.property)) {
            return;
        }
        const propName = getIdentifierName(left.property);
        const isStateVar = variableCollect.get(propName)
        if (isStateVar && isStateVar.length > 0) {
            this.report({
                node: errorNode,
                message: this.messages.noVariablesChangeInBuild,
            })
        } else {
            this.report({
                node: errorNode,
                message: this.messages.noVariablesChangeInBuild,
                level: 'warn'
            })
        }
    }
};

export default NoVariablesChangeInBuildRule;