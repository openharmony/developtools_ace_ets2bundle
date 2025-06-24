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
  private componentv2WithConsumer: MultiMap<string, string> = new MultiMap();
  private componentv2WithProvider: MultiMap<string, string> = new MultiMap();

  public setup(): Record<string, string> {
    return {
      consumerOnlyOnMember: `'@{{decorator}}' can only decorate member property.`,
      multipleBuiltInDecorators: `The struct member variable can not be decorated by multiple built-in decorators.`,
      providerOnlyInStruct: `The '@{{decorator}}' decorator can only be used with 'struct'.`,
      forbiddenInitialization: `The '@{{decorator}}' property '{{value}}' in the custom component '{{structName}}' cannot be initialized here (forbidden to specify).`,
    };
  }

  public parsed(node: arkts.AstNode): void {
    this.collectStructsWithConsumerAndProvider(node);
    this.validateStructDecoratorsAndMembers(node);
    this.validateInClass(node);

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
      node?.definition?.annotations.forEach((anno) => {
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
        const comsumerDecorator = member?.annotations.some(annotation =>
          annotation.expr && arkts.isIdentifier(annotation.expr) &&
          annotation.expr.name === PresetDecorators.CONSUMER
        );
        const providerDecorator = member?.annotations.some(annotation =>
          annotation.expr && arkts.isIdentifier(annotation.expr) &&
          annotation.expr.name === PresetDecorators.PROVIDER
        );
        if (!member?.key) {
          return;
        }
        const memberName = getIdentifierName(member?.key);
        if (comsumerDecorator && structName && memberName) {
          this.componentv2WithConsumer.add(structName, memberName);
        }

        if (providerDecorator && structName && memberName) {
          this.componentv2WithProvider.add(structName, memberName);
        }
      }
    });
  }

  private validateStructDecoratorsAndMembers(node: arkts.AstNode): void {
    if (arkts.isStructDeclaration(node)) {
      node.definition.body.forEach(member => {
        if (arkts.isMethodDefinition(member)) {
          this.validateDecoratorOnMethod(member);
        }
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
        const startPosition = otherDecorators.startPosition;
        const endPosition = otherDecorators.endPosition;
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      }
    });
  }

  private findDecorator(member: arkts.ClassProperty, decoratorName: string): arkts.AnnotationUsage | undefined {
    return member.annotations?.find(annotation =>
      annotation.expr && arkts.isIdentifier(annotation.expr) &&
      annotation.expr.name === decoratorName
    );
  }

  private findOtherDecorator(member: arkts.ClassProperty, decoratorName: string): arkts.AnnotationUsage | undefined {
    return member.annotations?.find(annotation =>
      annotation.expr && arkts.isIdentifier(annotation.expr) &&
      annotation.expr.name !== decoratorName
    );
  }

  private findDecoratorInMethod(member: arkts.MethodDefinition, decoratorName: string): arkts.AnnotationUsage | undefined {
    return member.scriptFunction.annotations?.find(annotation =>
      annotation.expr && arkts.isIdentifier(annotation.expr) &&
      annotation.expr.name === decoratorName
    );
  }

  private validateDecoratorOnMethod(member: arkts.MethodDefinition): void {
    this.validateDecorator(member, PresetDecorators.CONSUMER);
    this.validateDecorator(member, PresetDecorators.PROVIDER);
  }

  private validateDecorator(member: arkts.MethodDefinition, decoratorName: string): void {
    const decorator = this.findDecoratorInMethod(member, decoratorName);
    if (!decorator) {
      return;
    }

    this.report({
      node: decorator,
      message: this.messages.consumerOnlyOnMember,
      data: {
        decorator: getAnnotationName(decorator),
      },
      fix: (decorator) => {
        const startPosition = decorator.startPosition;
        const endPosition = decorator.endPosition;
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      }
    });
  }

  private validateInClass(node: arkts.AstNode): void {
    if (arkts.isClassDeclaration(node)) {
      node.definition?.body.forEach(member => {
        if (arkts.isClassProperty(member)) {
          this.validateDecoratorInClass(member, PresetDecorators.CONSUMER);
          this.validateDecoratorInClass(member, PresetDecorators.PROVIDER);
        }
      });
    }
  }

  private validateDecoratorInClass(member: arkts.ClassProperty, decoratorName: string): void {
    const decorator = this.findDecorator(member, decoratorName);
    if (!decorator) {
      return;
    }
    this.report({
      node: decorator,
      message: this.messages.providerOnlyInStruct,
      data: {
        decorator: getAnnotationName(decorator),
      },
      fix: (providerDecorator) => {
        const startPosition = providerDecorator.startPosition;
        const endPosition = providerDecorator.endPosition;
        return {
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
    if (this.componentv2WithConsumer.has(callExpName)) {
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
    if (this.componentv2WithProvider.has(callExpName)) {
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
    if (parent && this.componentv2WithConsumer.get(callExpName).includes(getIdentifierName(currentNode))) {
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
            range: [startPosition, endPosition],
            code: '',
          };
        }
      });
    }
  }

  private checkInvalidProviderUsage(currentNode: arkts.Identifier, callExpName: string): void {
    const parent = currentNode.parent;
    if (parent && this.componentv2WithProvider.get(callExpName)?.includes(getIdentifierName(currentNode))) {
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
            range: [startPosition, endPosition],
            code: '',
          };
        }
      });
    }
  }
}

export default ConsumerProviderDecoratorCheckRule;