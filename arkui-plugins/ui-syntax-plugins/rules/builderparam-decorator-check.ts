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
import { getIdentifierName, PresetDecorators, BUILD_NAME, findDecorator } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';
import { FileManager } from '../../common/file-manager';
import { LANGUAGE_VERSION } from '../../common/predefines';

class BuilderParamDecoratorCheckRule extends AbstractUISyntaxRule {

    public setup(): Record<string, string> {
        return {
            onlyOneBuilderParamProperty: `In the trailing lambda case, '{{structName}}' must have one and only one property decorated with @BuilderParam, and its @BuilderParam expects no parameter.`,
            atLeastOneBuilderParamProperty: `In the trailing lambda case, '{{structName}}' must have at least one property decorated with @BuilderParam, and its last @BuilderParam expects no parameter.`,
            builderParamWithParamCannotHaveTrailingClosure: `The @BuilderParam decorated parameter '{{paramName}}' cannot be passed as both a parameter and a trailing closure simultaneously.`,
            builderParamAsTrailingClosureCannotHaveParam: `@BuilderParam decorated parameter '{{paramName}}' is used as a trailing closure so the function cannot have any parameters.`,        
        };
    }

    public checked(node: arkts.AstNode): void {
        if (arkts.isCallExpression(node)) {
            this.checkComponentInitializeForMultiFile(node);
        }
    }

    private hasBlockStatementForMultiFile(node: arkts.AstNode): boolean {
        if (!node.parent) {
            return false;
        }
        if (arkts.isCallExpression(node)) {
            const siblings = node.parent.getChildren();
            const nodeIndex = siblings.indexOf(node);
            if (nodeIndex >= 0 && nodeIndex < siblings.length - 1) {
                const nextSibling = siblings[nodeIndex + 1];
                if (arkts.nodeType(nextSibling) === 0) {
                    return true;
                }
                if (arkts.isBlockStatement(nextSibling)) {
                    return true;
                }
            }
            if (node.arguments && node.arguments.length > 0) {
                const lastArg = node.arguments[node.arguments.length - 1];
                if (arkts.nodeType(lastArg) === 0) {
                    return true;
                }
                if (arkts.isBlockStatement(lastArg)) {
                    return true;
                }
            }
            const children = node.getChildren();
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (arkts.isBlockStatement(child)) {
                    return true;
                }
                if (arkts.nodeType(child) === 0) {
                    return true;
                }
            }
        }
        return false;
    }

    private getBuilderParamProperties(structNode: arkts.StructDeclaration): Array<{name: string, hasParams: boolean}> {
        const properties: Array<{name: string, hasParams: boolean}> = [];
        if (!structNode.definition || !structNode.definition.body) {
            return properties;
        }
        structNode.definition.body.forEach((item) => {
            if (!arkts.isClassProperty(item) || !item.key) {
                return;
            }
            const builderParam = findDecorator(item, PresetDecorators.BUILDER_PARAM);
            if (builderParam) {
                const paramName = getIdentifierName(item.key);
                const hasParams = this.hasFunctionTypeParams(item.typeAnnotation);
                properties.push({ name: paramName, hasParams });
            }
        });
        return properties;
    }
    
    private hasFunctionTypeParams(typeAnnotation: arkts.TypeNode | undefined): boolean {
        if (!typeAnnotation) {
            return false;
        }
        if (!arkts.isETSFunctionType(typeAnnotation)) {
            return false;
        }
        if (typeof typeAnnotation !== 'object' || typeAnnotation === null) {
            return false;
        }
        if (!typeAnnotation.params || typeAnnotation.params.length === 0) {
            return false;
        }
        for (const param of typeAnnotation.params) {
            if (param && typeof param === 'object' && 'optional' in param && !param.optional) {
                return true;
            }
        }
        return false;
    }
    
    private checkComponentInitializeForMultiFile(
        node: arkts.CallExpression,
    ): void {
        if (!node.expression) {
            return;
        }
        let structName: string | null = null;
        let targetNode = node.expression;
        if (arkts.isIdentifier(node.expression)) {
            structName = getIdentifierName(node.expression);
        } else if (arkts.isMemberExpression(node.expression) && arkts.isIdentifier(node.expression.object)) {
            structName = getIdentifierName(node.expression.object);
            targetNode = node.expression.object;
        } else {
            return;
        }
        if (!structName) {
            return;
        }
        const builtInComponents = ['Text', 'Button', 'Column', 'Row', 'Image', 'Stack'];
        if (builtInComponents.includes(structName)) {
            return;
        }
        const hasTrailingClosure = this.hasBlockStatementForMultiFile(node);
        if (!hasTrailingClosure) {
            return;
        }
        const structDecl = arkts.getDecl(targetNode);

        if (structDecl) {
            if (arkts.isClassDefinition(structDecl)) {
                this.tryValidateFromClassDefinition(node, structDecl, structName);
                return;
            }
            if (arkts.isStructDeclaration(structDecl)) {
                this.performBuilderParamValidation(node, structDecl, structName);
                return;
            }
        }
    }
    
    private tryValidateFromClassDefinition(
        node: arkts.CallExpression,
        classDef: arkts.ClassDefinition,
        structName: string
    ): void {
        if (!classDef.body) {
            return;
        }
        const builderParamProperties: Array<{name: string, hasParams: boolean}> = [];
        classDef.body.forEach((item) => {
            if (arkts.isClassProperty(item)) {
                const builderParam = findDecorator(item, PresetDecorators.BUILDER_PARAM);
                if (builderParam) {
                    const paramName = item.key && arkts.isIdentifier(item.key) ? getIdentifierName(item.key) : '';
                    const hasParams = this.hasFunctionTypeParams(item.typeAnnotation);
                    builderParamProperties.push({ name: paramName, hasParams });
                }
            }
        });
        if (builderParamProperties.length > 0) {
            this.performBuilderParamValidationWithProperties(node, builderParamProperties, structName);
        } else {
            this.report({
                node: node,
                message: this.messages.atLeastOneBuilderParamProperty,
                data: { structName },
            });
        }
    }
    
    private performBuilderParamValidation(
        node: arkts.CallExpression,
        structNode: arkts.StructDeclaration,
        structName: string
    ): void {
        const builderParamProperties = this.getBuilderParamProperties(structNode);
        let hasTrailingClosure = false;
        if (node.parent) {
            const siblings = node.parent.getChildren();
            const nodeIndex = siblings.indexOf(node);
            if (nodeIndex >= 0 && nodeIndex < siblings.length - 1) {
                const nextSibling = siblings[nodeIndex + 1];
                if (arkts.isBlockStatement(nextSibling)) {
                    hasTrailingClosure = true;
                }
            }
        }
        if (!hasTrailingClosure && node.arguments && node.arguments.length > 0) {
            const lastArg = node.arguments[node.arguments.length - 1];
            if (arkts.isBlockStatement(lastArg)) {
                hasTrailingClosure = true;
            }
        }
        if (hasTrailingClosure) {
            if (builderParamProperties.length === 0) {
                this.report({
                    node: node,
                    message: this.messages.atLeastOneBuilderParamProperty,
                    data: { structName },
                });
            } else {
                const isFrom1_1 = this.isFrom1_1(structNode);
                if (isFrom1_1 && builderParamProperties.length !== 1) {
                    this.report({
                        node: node,
                        message: this.messages.onlyOneBuilderParamProperty,
                        data: { structName },
                    });
                    return;
                }
                
                const lastBuilderParam = builderParamProperties[builderParamProperties.length - 1];
                if (lastBuilderParam.hasParams) {
                    this.report({
                        node: node,
                        message: this.messages.builderParamAsTrailingClosureCannotHaveParam,
                        data: { paramName: lastBuilderParam.name },
                    });
                }
                this.checkBuilderParamArgsConflict(node, builderParamProperties, lastBuilderParam);
            }
        }
    }

    private performBuilderParamValidationWithProperties(
        node: arkts.CallExpression,
        builderParamProperties: Array<{name: string, hasParams: boolean}>,
        structName: string
    ): void {
        if (builderParamProperties.length === 0) {
            this.report({
                node: node,
                message: this.messages.atLeastOneBuilderParamProperty,
                data: { structName },
            });
        } else {
            const program = arkts.getProgramFromAstNode(node);
            const fileManager = FileManager.getInstance();
            const isFrom1_1 = fileManager.getLanguageVersionByFilePath(program.absName) === LANGUAGE_VERSION.ARKTS_1_1;
            
            if (isFrom1_1 && builderParamProperties.length !== 1) {
                this.report({
                    node: node,
                    message: this.messages.onlyOneBuilderParamProperty,
                    data: { structName },
                });
                return;
            }
            
            const lastBuilderParam = builderParamProperties[builderParamProperties.length - 1];
            if (lastBuilderParam.hasParams) {
                this.report({
                    node: node,
                    message: this.messages.builderParamAsTrailingClosureCannotHaveParam,
                    data: { paramName: lastBuilderParam.name },
                });
            }
            this.checkBuilderParamArgsConflict(node, builderParamProperties, lastBuilderParam);
        }
    }
    
    private checkBuilderParamArgsConflict(
        node: arkts.CallExpression,
        builderParamProperties: Array<{name: string, hasParams: boolean}>,
        lastBuilderParam: {name: string, hasParams: boolean}
    ): void {
        const builderParamNames = this.extractBuilderParamArgNames(node, builderParamProperties);
        if (builderParamNames.length > 0 && builderParamNames.includes(lastBuilderParam.name)) {
            this.report({
                node: node,
                message: this.messages.builderParamWithParamCannotHaveTrailingClosure,
                data: { paramName: lastBuilderParam.name },
            });
        }
    }
    
    private extractBuilderParamArgNames(
        node: arkts.CallExpression,
        builderParamProperties: Array<{name: string, hasParams: boolean}>
    ): string[] {
        const builderParamNames: string[] = [];
        if (!node.arguments || node.arguments.length === 0) {
            return builderParamNames;
        }
        const firstArg = node.arguments[0];
        if (!arkts.isObjectExpression(firstArg) || !firstArg.properties) {
            return builderParamNames;
        }
        firstArg.properties.forEach((prop) => {
            if (!this.isValidProperty(prop)) {
                return;
            }
            const property = prop as arkts.Property;
            if (!property.key) {
                return;
            }
            const paramName = getIdentifierName(property.key);
            const isBuilderParam = builderParamProperties.some(p => p.name === paramName);
            if (isBuilderParam) {
                builderParamNames.push(paramName);
            }
        });
        return builderParamNames;
    }
    
    private isValidProperty(prop: arkts.AstNode): boolean {
        return !!(prop && arkts.isProperty(prop) && prop.key);
    }

    private isFrom1_1(structDecl: arkts.StructDeclaration): boolean {
        const program = arkts.getProgramFromAstNode(structDecl);
        const fileManager = FileManager.getInstance();
        return fileManager.getLanguageVersionByFilePath(program.absName) === LANGUAGE_VERSION.ARKTS_1_1;
    }
}

export default BuilderParamDecoratorCheckRule;