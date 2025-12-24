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
import { AbstractUISyntaxRule, UISyntaxRuleLevel } from './ui-syntax-rule';
import {
    getClassPropertyAnnotationNames, getClassPropertyName, getIdentifierName, PresetDecorators,
    CheckObjectLinkUseLiteralKeyword, getClassPropertyType
} from '../utils';

class CheckObjectLinkUseLiteralRule extends AbstractUISyntaxRule {
    // Record all @ObjectLink attributes
    private objectLinkMap: Map<string, Map<string, string>> = new Map();
    // Record all variables
    private propertyMap: Map<string, Map<string, arkts.ClassProperty | arkts.VariableDeclarator>> = new Map();
    private classMap: Map<string, arkts.ClassDeclaration> = new Map();
    private functionMap: Map<string, Map<string, arkts.FunctionDeclaration | arkts.MethodDefinition>> = new Map();
    private currentStructName: string = '';
    private reportLevel: UISyntaxRuleLevel  = 'none';

    public setup(): Record<string, string> {
        return {
            initializerIsLiteral: `The '@Observed' class object must be instantiated with the 'new' keyword; initialization with an object literal is not allowed.`,
        };
    }

    public beforeTransform(): void {
        this.objectLinkMap = new Map();
        this.propertyMap = new Map();
        this.classMap = new Map();
        this.functionMap = new Map();
        this.currentStructName = '';
    }

    public parsed(node: arkts.StructDeclaration): void {
        this.initMap(node);
        this.checkInitializeWithLiteral(node);
    }

    private initMap(node: arkts.AstNode): void {
        // Check if the current node is the root node
        if (!arkts.isEtsScript(node) || node.isNamespace) {
            return;
        }
        node.statements.forEach((member: arkts.AstNode) => {
            if (arkts.isFunctionDeclaration(member)) {
                this.handleFunctionDeclaration(member);
            }
            if (arkts.isVariableDeclaration(member)) {
                this.handleVariableDeclaration(member);
            }
            if (arkts.isClassDeclaration(member)) {
                this.handleClassDeclaration(member, undefined);
            }
            if ((arkts.isStructDeclaration(member))) {
                this.handleStructDeclaration(member);
            }
        });
    }

    private handleFunctionDeclaration(functionDeclaration: arkts.FunctionDeclaration): void {
        if (!functionDeclaration.scriptFunction ||
            !functionDeclaration.scriptFunction.id ||
            !arkts.isIdentifier(functionDeclaration.scriptFunction.id) ||
            !functionDeclaration.scriptFunction.id.name) {
            return;
        }
        const functionName: string = functionDeclaration.scriptFunction.id.name;
        if (functionName === '') {
            return;
        }
        this.addFunctions(CheckObjectLinkUseLiteralKeyword.GLOBAL, functionName, functionDeclaration);
    }

    private addFunctions(
        categoryName: string,
        funcName: string,
        node: arkts.FunctionDeclaration | arkts.MethodDefinition
    ): void {
        if (!this.functionMap.has(categoryName)) {
            this.functionMap.set(categoryName, new Map());
        }
        const funcMap = this.functionMap.get(categoryName);
        if (!funcMap) {
            return;
        }
        funcMap.set(funcName, node);
    }

    private handleVariableDeclaration(variable: arkts.VariableDeclaration): void {
        if (!variable.declarators) {
            return;
        }
        variable.declarators?.forEach((node: arkts.AstNode) => {
            if (!arkts.isVariableDeclarator(node) || !node.name) {
                return;
            }
            const globalPropertyName = node.name.name;
            // add all global variables
            this.addProperties(CheckObjectLinkUseLiteralKeyword.GLOBAL, globalPropertyName, node);
        });
    }

    private addProperties(
        categoryName: string,
        propertyName: string,
        node: arkts.ClassProperty | arkts.VariableDeclarator
    ): void {
        if (!this.propertyMap.has(categoryName)) {
            this.propertyMap.set(categoryName, new Map());
        }
        const propertyMap = this.propertyMap.get(categoryName);
        if (!propertyMap) {
            return;
        }
        propertyMap.set(propertyName, node);
    }

    private handleClassDeclaration(classDeclaration: arkts.ClassDeclaration, rootClassName: string | undefined): void {
        if (!classDeclaration.definition || !classDeclaration.definition.ident ||
            !arkts.isIdentifier(classDeclaration.definition.ident)) {
            return;
        }
        let className: string = classDeclaration.definition.ident.name;
        if (rootClassName) {
            className = rootClassName;
        }
        if (className === '') {
            return;
        }
        if (!this.classMap.has(className)) {
            this.classMap.set(className, classDeclaration);
        }
        if (classDeclaration.definition.super && arkts.isExpression(classDeclaration.definition.super)) {
            const superNode: arkts.Expression = classDeclaration.definition.super;
            this.handleSuperClass(superNode, className);
        }
        classDeclaration.definition?.body?.forEach((item: arkts.AstNode) => {
            this.handleProperties(item, className);
        });
    }

    private handleSuperClass(superNode: arkts.Expression, className: string): void {
        if (
            arkts.isETSTypeReference(superNode) &&
            superNode.part &&
            arkts.isETSTypeReferencePart(superNode.part) &&
            superNode.part.name &&
            arkts.isIdentifier(superNode.part.name)
        ) {
            const superClassName: string = superNode.part.name.name;
            if (this.classMap.has(superClassName)) {
                const classDeclaration: arkts.ClassDeclaration | undefined = this.classMap.get(superClassName);
                if (classDeclaration) {
                    this.handleClassDeclaration(classDeclaration, className);
                }
            }
        }
    }

    private handleProperties(item: arkts.AstNode, categoryName: string): void {
        if (!arkts.isClassProperty(item)) {
            return;
        }
        const classPropertyAnnotations = getClassPropertyAnnotationNames(item);
        const classPropertyName = getClassPropertyName(item);
        const classPropertyType = getClassPropertyType(item)
        if (!classPropertyName || !classPropertyType) {
            return;
        }
        if (classPropertyAnnotations.includes(PresetDecorators.OBJECT_LINK)) {
            this.addObjectLinkProperty(categoryName, classPropertyName, classPropertyType);
        }
        this.addProperties(categoryName, classPropertyName, item);
    }

    private handleStructDeclaration(member: arkts.StructDeclaration): void {
        if (!member.definition || !member.definition.ident || !arkts.isIdentifier(member.definition.ident)) {
            return;
        }
        const structName: string = member.definition.ident.name;
        if (structName === '') {
            return;
        }
        member.definition?.body?.forEach((item: arkts.AstNode) => {
            this.handleProperties(item, structName);
            this.handleFunctionsInStruct(item, structName);
        });
    }

    private addObjectLinkProperty(
        structName: string,
        propertyName: string,
        annotationName: string
    ): void {
        if (!this.objectLinkMap.has(structName)) {
            this.objectLinkMap.set(structName, new Map());
        }
        const objectLinkPropertiesMap = this.objectLinkMap.get(structName);
        if (!objectLinkPropertiesMap) {
            return;
        }
        objectLinkPropertiesMap.set(propertyName, annotationName);
    }

    private handleFunctionsInStruct(item: arkts.AstNode, categoryName: string): void {
        if (!arkts.isMethodDefinition(item) || !item.name || !arkts.isIdentifier(item.name) || !item.name.name) {
            return;
        }
        const funcName: string = item.name.name;
        if (funcName === '') {
            return;
        }
        if (funcName === CheckObjectLinkUseLiteralKeyword.CONSTRUCTOR ||
            funcName === CheckObjectLinkUseLiteralKeyword.BUILD) {
            return;
        }
        this.addFunctions(categoryName, funcName, item);
    }

    private checkInitializeWithLiteral(node: arkts.AstNode): void {
        this.handleCurrentStructName(node);
        if (!arkts.isCallExpression(node) || !arkts.isIdentifier(node.expression)) {
            return;
        }
        const componentName = node.expression.name;
        // Only assignments to properties decorated with ObjectLink trigger rule checks
        if (!this.objectLinkMap.has(componentName)) {
            return;
        }
        const structObjectLinkMap = this.objectLinkMap.get(componentName);
        if (!structObjectLinkMap) {
            return;
        }
        if (!node.arguments) {
            return;
        }
        node.arguments.forEach((member: arkts.AstNode) => {
            if (!arkts.isObjectExpression(member)) {
                return;
            }
            member.properties.forEach((property: arkts.AstNode) => {
                if (!arkts.isProperty(property) || !property.key || !property.value) {
                    return;
                }
                const objectLinkReceiverPropertyName: string = getIdentifierName(property.key);
                if (objectLinkReceiverPropertyName === '' ||
                    !structObjectLinkMap.has(objectLinkReceiverPropertyName)) {
                    return;
                }
                this.reportLevel = 'none';
                this.handleParamsChain(property);
                if (this.reportLevel === 'none') {
                    return;
                }
                this.report({
                    node: property,
                    message: this.messages.initializerIsLiteral,
                    level: this.reportLevel
                });
            });
        });
    }

    private handleCurrentStructName(node: arkts.AstNode): void {
        if (arkts.isStructDeclaration(node)) {
            if (node.definition && node.definition.ident && node.definition.ident.name !== '') {
                this.currentStructName = node.definition.ident.name;
            }
        }
    }

    private handleParamsChain(property: arkts.Property): void {
        if (!property.value) {
            return;
        }
        let subPropertyNode: arkts.AstNode = property.value;
        subPropertyNode = this.handleAsChainNonNullExpression(subPropertyNode);
        if (arkts.isObjectExpression(subPropertyNode)) {
            this.reportLevel = 'error';
            return;
        }
        if (arkts.isETSNewClassInstanceExpression(subPropertyNode)) {
            return;
        }
        let isFunction: boolean = false;
        const chainArray: string[] = [];
        if (arkts.isIdentifier(subPropertyNode)) {
            chainArray.unshift(subPropertyNode.name);
        }
        if (arkts.isCallExpression(subPropertyNode) && subPropertyNode.expression) {
            isFunction = true;
            if (arkts.isIdentifier(subPropertyNode.expression)) {
                chainArray.unshift(subPropertyNode.expression.name);
            } else {
                subPropertyNode = this.handleAsChainNonNullExpression(subPropertyNode.expression);
                this.handleParamsWithCallee(subPropertyNode);
            }
        }
        this.handleNodeByWhile(subPropertyNode, chainArray,isFunction);
    }

    private handleNodeByWhile(subPropertyNode: arkts.AstNode, chainArray: string[], isFunction:boolean):void {
        while (arkts.isMemberExpression(subPropertyNode)) {
            if (subPropertyNode.property) {
                if (arkts.isIdentifier(subPropertyNode.property)) {
                    chainArray.unshift(subPropertyNode.property.name);
                }
                if (arkts.isNumberLiteral(subPropertyNode.property)) {
                    this.reportLevel = 'warn';
                    return;
                }
            }
            if (subPropertyNode.object) {
                subPropertyNode = this.handleAsChainNonNullExpression(subPropertyNode.object);
            }
            if (subPropertyNode && arkts.isIdentifier(subPropertyNode)) {
                chainArray.unshift(subPropertyNode.name);
            }
            if (subPropertyNode && arkts.isCallExpression(subPropertyNode)) {
                isFunction = true;
                subPropertyNode = this.handleAsChainNonNullExpression(subPropertyNode.expression);
                if (arkts.isIdentifier(subPropertyNode)) {
                    chainArray.unshift(subPropertyNode.name);
                }
                this.handleParamsWithCallee(subPropertyNode);
            }
        }
        const isInStruct: boolean = arkts.isThisExpression(subPropertyNode);
        this.filterChainArray(chainArray, isFunction, isInStruct);
    }

    private handleParamsWithCallee(subPropertyNode: arkts.AstNode): void {
        if (arkts.isMemberExpression(subPropertyNode) &&
            subPropertyNode.object &&
            arkts.isIdentifier(subPropertyNode.object) &&
            subPropertyNode.property &&
            arkts.isIdentifier(subPropertyNode.property)) {
            const objectName: string = subPropertyNode.object.name;
            const propertyName: string = subPropertyNode.property.name;
            if (objectName === CheckObjectLinkUseLiteralKeyword.ARRAY &&
                propertyName === CheckObjectLinkUseLiteralKeyword.FROM) {
                this.reportLevel = 'warn';
                return;
            }
        }
        if (arkts.isMemberExpression(subPropertyNode) &&
            subPropertyNode.property &&
            arkts.isIdentifier(subPropertyNode.property) &&
            subPropertyNode.property.name === CheckObjectLinkUseLiteralKeyword.GET) {
            this.reportLevel = 'warn';
            return;
        }
    }

    private handleFunctionReturnValue(categoryName: string, functionName: string): arkts.AstNode | undefined {
        if (!this.functionMap.has(categoryName)) {
            return undefined;
        }
        const functionNodeMap: Map<string, arkts.FunctionDeclaration | arkts.MethodDefinition> | undefined =
            this.functionMap.get(categoryName);
        if (!functionNodeMap || !functionNodeMap.has(functionName)) {
            return undefined;
        }
        let funcNode: arkts.FunctionDeclaration | arkts.MethodDefinition | undefined =
            functionNodeMap.get(functionName);
        let node: arkts.AstNode | undefined = undefined;
        if (funcNode &&
            (arkts.isFunctionDeclaration(funcNode) || arkts.isMethodDefinition(funcNode)) &&
            funcNode.scriptFunction &&
            funcNode.scriptFunction.body &&
            arkts.isBlockStatement(funcNode.scriptFunction.body) &&
            funcNode.scriptFunction.body.statements) {
            funcNode.scriptFunction.body.statements.forEach((item: arkts.AstNode) => {
                if (arkts.isReturnStatement(item) && item.argument) {
                    node = item.argument;
                }
            });
        }
        return node;
    }

    private getClassNameWithNewExpression(node: arkts.ETSNewClassInstanceExpression): string {
        if (
            node.getTypeRef &&
            arkts.isETSTypeReference(node.getTypeRef) &&
            node.getTypeRef.part &&
            arkts.isETSTypeReferencePart(node.getTypeRef.part) &&
            node.getTypeRef.part.name &&
            arkts.isIdentifier(node.getTypeRef.part.name) &&
            node.getTypeRef.part.name.name
        ) {
            const className: string = node.getTypeRef.part.name.name;
            return className;
        }
        return '';
    }

    private handleAsChainNonNullExpression(node: arkts.AstNode): arkts.AstNode {
        if (!arkts.isTSAsExpression(node) &&
            !arkts.isTSNonNullExpression(node) &&
            !arkts.isChainExpression(node)) {
            return node;
        }
        // ChainExpression
        if (arkts.isChainExpression(node)) {
            if (node.getExpression) {
                return this.handleAsChainNonNullExpression(node.getExpression);
            }
            return node;
        }
        // TSAsExpression and TSNonNullExpression
        if (node.expr) {
            return this.handleAsChainNonNullExpression(node.expr);
        }
        return node;
    }

    private filterChainArray(chainArray: string[], isFunction: boolean, isInStruct: boolean): void {
        const arrayLength: number = chainArray.length;
        if (arrayLength === 0) {
            return;
        }
        let categoryName: string = isInStruct ? this.currentStructName : CheckObjectLinkUseLiteralKeyword.GLOBAL;
        let rootNode: arkts.ClassProperty | arkts.VariableDeclarator | undefined = undefined;
        let currentNode: arkts.AstNode | undefined = undefined;
        const firstName: string = chainArray[0];
        if (!isFunction) {
            rootNode = this.getRootNode(categoryName, firstName);
            if (!rootNode) {
                this.reportLevel = 'warn';
                return;
            }
        }
        if (arrayLength === 1 && !isFunction) {
            this.reportLevel = this.handleSingleTierProperty(rootNode) ? 'error': 'none';
            return;
        }
        if (isFunction) {
            const funcNode = this.handleFunctionReturnValue(categoryName, firstName);
            if (!funcNode) {
                return;
            }
            currentNode = this.handleAsChainNonNullExpression(funcNode);
            if (!currentNode) {
                return;
            }
        }
        let isReport: boolean = this.getIsReport(chainArray, currentNode, rootNode, categoryName);
        this.reportLevel = isReport ? 'error' : 'none';
    }

    private handleSingleTierProperty(rootNode: arkts.ClassProperty | arkts.VariableDeclarator | undefined): boolean {
        if (rootNode && arkts.isVariableDeclarator(rootNode) && rootNode.initializer) {
            const globalResultNode: arkts.AstNode = this.handleAsChainNonNullExpression(rootNode.initializer);
            if (arkts.isObjectExpression(globalResultNode)) {
                return true;
            }
        }
        return false;
    }

    private getIsReport(
      chainArray: string[],
      currentNode: arkts.AstNode | undefined,
      rootNode: arkts.ClassProperty | arkts.VariableDeclarator | undefined,
      categoryName: string,
    ): boolean {
        let isReport: boolean = false;
        const arrayLength: number = chainArray.length;
        for (let i = 0; i < arrayLength; i++) {
            const propertyName = chainArray[i];
            if (!currentNode) {
                if (!rootNode) {
                    rootNode = this.getRootNode(categoryName, propertyName);
                }
                if (rootNode && arkts.isClassProperty(rootNode) && rootNode.value) {
                    currentNode = this.handleAsChainNonNullExpression(rootNode.value);
                }
                if (rootNode && arkts.isVariableDeclarator(rootNode) && rootNode.initializer) {
                    currentNode = this.handleAsChainNonNullExpression(rootNode.initializer);
                }
            }
            if (!currentNode) {
                break;
            }
            if (arkts.isETSNewClassInstanceExpression(currentNode)) {
                if (i === arrayLength - 1) {
                    isReport = false;
                    break;
                }
                categoryName = this.getClassNameWithNewExpression(currentNode);
                rootNode = undefined;
                currentNode = undefined;
            }
            if (currentNode && arkts.isObjectExpression(currentNode)) {
                if (i === arrayLength - 1) {
                    isReport = true;
                    break;
                }
                if (i + 1 >= arrayLength) {
                    break;
                }
                currentNode = this.getCurrentNode(currentNode, chainArray[i + 1]);
                if (currentNode && arkts.isProperty(currentNode) && currentNode.value) {
                    currentNode = this.handleAsChainNonNullExpression(currentNode.value);
                }
            }
            isReport = this.finalCheck(currentNode, (i === arrayLength - 1));
        }
        return isReport;
    }

    private getRootNode(
        categoryName: string,
        propertyName: string
    ): arkts.ClassProperty | arkts.VariableDeclarator | undefined {
        if (!this.propertyMap.has(categoryName)) {
            return undefined;
        }
        let rootNode: arkts.ClassProperty | arkts.VariableDeclarator | undefined = undefined;
        let propertiesInCategoryMap: Map<string, arkts.ClassProperty | arkts.VariableDeclarator> | undefined =
            undefined;
        propertiesInCategoryMap = this.propertyMap.get(categoryName);
        if (!propertiesInCategoryMap) {
            return undefined;
        }
        rootNode = propertiesInCategoryMap.get(propertyName);
        if (!rootNode) {
            propertiesInCategoryMap = this.propertyMap.get(CheckObjectLinkUseLiteralKeyword.GLOBAL);
            if (!propertiesInCategoryMap) {
                return undefined;
            }
            rootNode = propertiesInCategoryMap.get(propertyName);
        }
        return rootNode;
    }

    private getCurrentNode(
        currentNode: arkts.AstNode,
        nodeName: string
    ): arkts.AstNode | undefined {
        let nextNode: arkts.AstNode | undefined = undefined;
        const nextNodeName: string = nodeName;
        if (!arkts.isObjectExpression(currentNode)) {
            return undefined;
        }
        for (const item of currentNode.properties) {
            if (
                arkts.isProperty(item) &&
                item.key &&
                arkts.isIdentifier(item.key) &&
                item.key.name === nextNodeName
            ) {
                nextNode = item;
            }
        }
        return nextNode;
    }

    private finalCheck(currentNode: arkts.AstNode | undefined, isLastIndex: boolean): boolean {
        if (currentNode && arkts.isProperty(currentNode) && isLastIndex) {
            if (currentNode.value) {
                currentNode = this.handleAsChainNonNullExpression(currentNode.value);
            }
            if (!currentNode) {
                return false;
            }
            if (arkts.isObjectExpression(currentNode)) {
                return true;
            }
            if (arkts.isETSNewClassInstanceExpression(currentNode)) {
                return false;
            }
        }
        return false;
    }
}

export default CheckObjectLinkUseLiteralRule;