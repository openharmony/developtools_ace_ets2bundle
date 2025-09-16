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
import { getIdentifierName, MultiMap, PresetDecorators, getAnnotationName } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class ConsumerProviderDecoratorCheckRule extends AbstractUISyntaxRule {
    private componentV2WithConsumer: MultiMap<string, string> = new MultiMap();
    private componentV2WithProvider: MultiMap<string, string> = new MultiMap();

    public setup(): Record<string, string> {
        return {
            providerAndConsumerOnlyOnProperty: `'@{{decorator}}' can only decorate member property.`,
            multipleBuiltInDecorators: `The struct member variable can not be decorated by multiple built-in annotations.`,
            providerAndConsumerOnlyInStruct: `The '@{{decorator}}' annotation can only be used with 'struct'.`,
            forbiddenInitialization: `The '@{{decorator}}' property '{{value}}' in the custom component '{{structName}}' cannot be initialized here (forbidden to specify).`,
        };
    }

    public beforeTransform(): void {
        this.componentV2WithConsumer = new MultiMap();
        this.componentV2WithProvider = new MultiMap();
    }

    public parsed(node: arkts.AstNode): void {
        this.collectStructsWithConsumerAndProvider(node);
        this.validateDecoratorsOnMember(node);
        this.validateOnlyInStruct(node);

        if (arkts.isCallExpression(node)) {
            this.validateConsumerInitialization(node);
            this.validateProviderInitialization(node);
        }
    }

    private collectStructsWithConsumerAndProvider(node: arkts.AstNode): void {
        if (arkts.nodeType(node) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
            // Breadth traversal is done through while and queues
            const queue: Array<arkts.AstNode> = [node];
            while (queue.length > 0) {
                const currentNode: arkts.AstNode = queue.shift() as arkts.AstNode;
                // Filter and record the nodes of the tree
                this.rememberStructName(currentNode);
                const children = currentNode.getChildren();
                for (const child of children) {
                    queue.push(child);
                }
            }
        }
    }

    private rememberStructName(node: arkts.AstNode): void {
        if (arkts.isStructDeclaration(node)) {
            node.definition.annotations.forEach((anno) => {
                if (!anno.expr) {
                    return;
                }
                const annoName = getIdentifierName(anno.expr);
                // Second, it must be decorated with a @component v2 decorator
                if (annoName === PresetDecorators.COMPONENT_V2) {
                    const structName = node.definition.ident?.name ?? '';
                    this.processStructMembers(node, structName);
                }
            });
        }
    }

    private processStructMembers(node: arkts.StructDeclaration, structName: string): void {
        node.definition.body.forEach((member) => {
            // When a member variable is @consumer modified, it is stored to mark fields that cannot be initialized
            if (arkts.isClassProperty(member)) {
                const consumerDecorator = member.annotations.some(annotation =>
                    annotation.expr && arkts.isIdentifier(annotation.expr) &&
                    annotation.expr.name === PresetDecorators.CONSUMER
                );
                const providerDecorator = member.annotations.some(annotation =>
                    annotation.expr && arkts.isIdentifier(annotation.expr) &&
                    annotation.expr.name === PresetDecorators.PROVIDER
                );
                if (!member.key) {
                    return;
                }
                const memberName = getIdentifierName(member.key);
                if (consumerDecorator && structName && memberName) {
                    this.componentV2WithConsumer.add(structName, memberName);
                }

                if (providerDecorator && structName && memberName) {
                    this.componentV2WithProvider.add(structName, memberName);
                }
            }
        });
    }

    private validateDecoratorsOnMember(node: arkts.AstNode): void {
        if (arkts.isScriptFunction(node) || arkts.isVariableDeclaration(node) || arkts.isTSInterfaceDeclaration(node) ||
            arkts.isTSTypeAliasDeclaration(node)) {
            this.validateDecorator(node, this.messages.providerAndConsumerOnlyOnProperty, PresetDecorators.CONSUMER);
            this.validateDecorator(node, this.messages.providerAndConsumerOnlyOnProperty, PresetDecorators.PROVIDER);
        }

        if (arkts.isStructDeclaration(node)) {
            node.definition.body.forEach(member => {
                if (arkts.isClassProperty(member)) {
                    this.validateMemberDecorators(member);
                }
            });
        }
    }

    private validateMemberDecorators(
        member: arkts.ClassProperty,
    ): void {
        // Check that the @Consumer is not mixed with other decorators
        this.validateMultipleBuiltInDecorators(member, PresetDecorators.CONSUMER);

        // Check that the @Provider is mixed with other decorators
        this.validateMultipleBuiltInDecorators(member, PresetDecorators.PROVIDER);
    }

    private validateMultipleBuiltInDecorators(member: arkts.ClassProperty, decoratorName: string): void {
        const decorator = this.findDecorator(member, decoratorName);
        const otherDecorators = this.findOtherDecorator(member, decoratorName);
        if (!decorator || !otherDecorators) {
            return;
        }
        this.report({
            node: decorator,
            message: this.messages.multipleBuiltInDecorators,
            data: {
                decorator: getAnnotationName(decorator)
            },
            fix: () => {
                let startPosition = otherDecorators.startPosition;
                startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                const endPosition = otherDecorators.endPosition;
                return {
                    title: 'Remove other annotations',
                    range: [startPosition, endPosition],
                    code: '',
                };
            }
        });
    }

    private findDecorator(
        member: arkts.ClassProperty | arkts.VariableDeclaration | arkts.FunctionDeclaration |
            arkts.ScriptFunction | arkts.TSInterfaceDeclaration | arkts.TSTypeAliasDeclaration,
        decoratorName: string
    ): arkts.AnnotationUsage | undefined {
        return member.annotations.find(annotation =>
            annotation.expr && arkts.isIdentifier(annotation.expr) &&
            annotation.expr.name === decoratorName
        );
    }

    private findOtherDecorator(member: arkts.ClassProperty, decoratorName: string): arkts.AnnotationUsage | undefined {
        return member.annotations.find(annotation =>
            annotation.expr && arkts.isIdentifier(annotation.expr) &&
            annotation.expr.name !== decoratorName
        );
    }

    private validateOnlyInStruct(node: arkts.AstNode): void {
        if (arkts.isClassDeclaration(node)) {
            node.definition?.body.forEach(member => {
                if (arkts.isClassProperty(member)) {
                    this.validateDecorator(member, this.messages.providerAndConsumerOnlyInStruct, PresetDecorators.CONSUMER);
                    this.validateDecorator(member, this.messages.providerAndConsumerOnlyInStruct, PresetDecorators.PROVIDER);
                }
                if (arkts.isMethodDefinition(member)) {
                    this.validateDecorator(
                        member.scriptFunction, this.messages.providerAndConsumerOnlyInStruct, PresetDecorators.CONSUMER);
                    this.validateDecorator(
                        member.scriptFunction, this.messages.providerAndConsumerOnlyInStruct, PresetDecorators.PROVIDER);
                }
            });
            return;
        }

        // function/ variable/ interface/ type alias declaration
        if (arkts.isFunctionDeclaration(node) ||
            arkts.isVariableDeclaration(node) ||
            arkts.isTSInterfaceDeclaration(node) ||
            arkts.isTSTypeAliasDeclaration(node)
        ) {
            this.validateDecorator(node, this.messages.providerAndConsumerOnlyInStruct, PresetDecorators.CONSUMER);
            this.validateDecorator(node, this.messages.providerAndConsumerOnlyInStruct, PresetDecorators.PROVIDER);
            return;
        }
    }

    private validateDecorator(
        node: arkts.ClassProperty | arkts.VariableDeclaration | arkts.FunctionDeclaration |
            arkts.ScriptFunction | arkts.TSInterfaceDeclaration | arkts.TSTypeAliasDeclaration,
        message: string,
        decoratorName: string
    ): void {
        const decorator = this.findDecorator(node, decoratorName);
        if (!decorator) {
            return;
        }

        this.report({
            node: decorator,
            message: message,
            data: {
                decorator: getAnnotationName(decorator),
            },
            fix: (decorator) => {
                let startPosition = decorator.startPosition;
                startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                const endPosition = decorator.endPosition;
                return {
                    title: 'Remove the annotation',
                    range: [startPosition, endPosition],
                    code: '',
                };
            }
        });
    }

    private validateConsumerInitialization(node: arkts.CallExpression): void {
        if (!arkts.isIdentifier(node.expression)) {
            return;
        }
        const callExpName: string = node.expression.name;
        if (this.componentV2WithConsumer.has(callExpName)) {
            const queue: Array<arkts.AstNode> = [node];
            while (queue.length > 0) {
                const currentNode: arkts.AstNode = queue.shift() as arkts.AstNode;
                if (arkts.isIdentifier(currentNode)) {
                    this.checkInvalidConsumerUsage(currentNode, callExpName);
                }
                const children = currentNode.getChildren();
                for (const child of children) {
                    queue.push(child);
                }
            }
        }
    }

    private validateProviderInitialization(node: arkts.CallExpression): void {
        if (!arkts.isIdentifier(node.expression)) {
            return;
        }
        const callExpName: string = node.expression.name;
        if (this.componentV2WithProvider.has(callExpName)) {
            const queue: Array<arkts.AstNode> = [node];
            while (queue.length > 0) {
                const currentNode: arkts.AstNode = queue.shift() as arkts.AstNode;
                if (arkts.isIdentifier(currentNode)) {
                    this.checkInvalidProviderUsage(currentNode, callExpName);
                }
                const children = currentNode.getChildren();
                for (const child of children) {
                    queue.push(child);
                }
            }
        }
    }

    private checkInvalidConsumerUsage(currentNode: arkts.Identifier, callExpName: string): void {
        const parent = currentNode.parent;
        if (parent && this.componentV2WithConsumer.get(callExpName).includes(getIdentifierName(currentNode))) {
            this.report({
                node: parent,
                message: this.messages.forbiddenInitialization,
                data: {
                    decorator: PresetDecorators.CONSUMER,
                    value: getIdentifierName(currentNode),
                    structName: callExpName
                },
                fix: () => {
                    const startPosition = parent.startPosition;
                    const endPosition = parent.endPosition;
                    return {
                        title: 'Remove the property',
                        range: [startPosition, endPosition],
                        code: '',
                    };
                }
            });
        }
    }

    private checkInvalidProviderUsage(currentNode: arkts.Identifier, callExpName: string): void {
        const parent = currentNode.parent;
        if (parent && this.componentV2WithProvider.get(callExpName)?.includes(getIdentifierName(currentNode))) {
            this.report({
                node: parent,
                message: this.messages.forbiddenInitialization,
                data: {
                    decorator: PresetDecorators.PROVIDER,
                    value: getIdentifierName(currentNode),
                    structName: callExpName
                },
                fix: () => {
                    const startPosition = parent.startPosition;
                    const endPosition = parent.endPosition;
                    return {
                        title: 'Remove the property',
                        range: [startPosition, endPosition],
                        code: '',
                    };
                }
            });
        }
    }
}

export default ConsumerProviderDecoratorCheckRule;