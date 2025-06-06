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
import { getAnnotationUsage, getIdentifierName, MultiMap, PresetDecorators, getAnnotationName } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

// Traverse the member variables of the struct, recording the members of the @Consumer or @Provider modifications
function processStructMembers(
  node: arkts.StructDeclaration,
  structName: string,
  componentv2WithConsumer: MultiMap<string, string>,
  componentv2WithProvider: MultiMap<string, string>
): void {
  node.definition.body.forEach((member) => {
    // When a member variable is @consumer modified, it is stored to mark fields that cannot be initialized
    if (arkts.isClassProperty(member)) {
      const hasComsumerDecorator = member?.annotations.some(annotation =>
        annotation.expr && arkts.isIdentifier(annotation.expr) &&
        annotation.expr.name === PresetDecorators.CONSUMER
      );
      const hasProviderDecorator = member?.annotations.some(annotation =>
        annotation.expr && arkts.isIdentifier(annotation.expr) &&
        annotation.expr.name === PresetDecorators.PROVIDER
      );
      if (!member?.key) {
        return;
      }
      const memberName = getIdentifierName(member?.key);
      if (hasComsumerDecorator && structName && memberName) {
        componentv2WithConsumer.add(structName, memberName);
      }

      if (hasProviderDecorator && structName && memberName) {
        componentv2WithProvider.add(structName, memberName);
      }
    }
  });
}

function rememberStructName(
  node: arkts.AstNode,
  componentv2WithConsumer: MultiMap<string, string>,
  componentv2WithProvider: MultiMap<string, string>,
): void {
  // First it has to be of the struct type
  if (arkts.isStructDeclaration(node)) {
    node?.definition?.annotations.forEach((anno) => {
      if (!anno.expr) {
        return;
      }
      const annoName = getIdentifierName(anno.expr);
      // Second, it must be decorated with a @component v2 decorator
      if (annoName === PresetDecorators.COMPONENT_V2) {
        const structName = node.definition.ident?.name ?? '';
        processStructMembers(node, structName, componentv2WithConsumer, componentv2WithProvider);
      }
    });
  }
}

function findDecorator(member: arkts.ClassProperty, decorator: string): arkts.AnnotationUsage | undefined {
  return member.annotations?.find(annotation =>
    annotation.expr && arkts.isIdentifier(annotation.expr) &&
    annotation.expr.name === decorator
  );
}

function findOtherDecorator(member: arkts.ClassProperty, decorator: string): arkts.AnnotationUsage | undefined {
  return member.annotations?.find(annotation =>
    annotation.expr && arkts.isIdentifier(annotation.expr) &&
    annotation.expr.name !== decorator
  );
}

function findDecoratorInMethod(member: arkts.MethodDefinition, decorator: string): arkts.AnnotationUsage | undefined {
  return member.scriptFunction.annotations?.find(annotation =>
    annotation.expr && arkts.isIdentifier(annotation.expr) &&
    annotation.expr.name === decorator
  );
}

// Verify that the @Consumer decorator is used on the method
function validateDecoratorOnMethod(member: arkts.MethodDefinition, context: UISyntaxRuleContext): void {
  validateDecorator(member, PresetDecorators.CONSUMER, context);
  validateDecorator(member, PresetDecorators.PROVIDER, context);
}

function validateDecorator(
  member: arkts.MethodDefinition,
  decoratorName: string,
  context: UISyntaxRuleContext,
): void {
  const decorator = findDecoratorInMethod(member, decoratorName);
  if (!decorator) {
    return;
  }

  context.report({
    node: decorator,
    message: rule.messages.consumerOnlyOnMember,
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

// @Consumer Bugs that conflict with other decorators
function validateMultipleBuiltInDecorators(
  member: arkts.ClassProperty,
  decorateName: string,
  context: UISyntaxRuleContext,
): void {

  const hasDecorator = findDecorator(member, decorateName);
  const otherDecorators = findOtherDecorator(member, decorateName);
  if (!hasDecorator || !otherDecorators) {
    return;
  }
  context.report({
    node: hasDecorator,
    message: rule.messages.multipleBuiltInDecorators,
    data: {
      decorator: getAnnotationName(hasDecorator)
    },
    fix: (decorator) => {
      const startPosition = otherDecorators.startPosition;
      const endPosition = otherDecorators.endPosition;
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    }
  });
}

// Report a bug where @Provider is missing @ComponentV2
function reportProviderRequiresComponentV2(
  decorator: arkts.AnnotationUsage,
  hasComponent: arkts.AnnotationUsage | undefined,
  node: arkts.AstNode,
  context: UISyntaxRuleContext,
): void {
  if (hasComponent) {
    context.report({
      node: decorator,
      message: rule.messages.providerRequiresComponentV2,
      data: {
        decorator: getAnnotationName(decorator),
      },
      fix: (hasProviderDecorator) => {
        const startPosition = hasComponent.startPosition;
        const endPosition = hasComponent.endPosition;
        return {
          range: [startPosition, endPosition],
          code: `@${PresetDecorators.COMPONENT_V2}`,
        };
      }
    });
  } else {
    context.report({
      node: decorator,
      message: rule.messages.providerRequiresComponentV2,
      data: {
        decorator: getAnnotationName(decorator),
      },
      fix: (hasProviderDecorator) => {
        const startPosition = node.startPosition;
        const endPosition = startPosition;
        return {
          range: [startPosition, endPosition],
          code: `@${PresetDecorators.COMPONENT_V2}\n`,
        };
      }
    });
  }
}

function validateDecoratorWithComponentV2Requirement(
  member: arkts.ClassProperty,
  hasComponentV2: arkts.AnnotationUsage | undefined,
  hasComponent: arkts.AnnotationUsage | undefined,
  node: arkts.AstNode,
  context: UISyntaxRuleContext,
  decoratorName: string
): void {
  const decorator = findDecorator(member, decoratorName);
  if (decorator && !hasComponentV2) {
    reportProviderRequiresComponentV2(decorator, hasComponent, node, context);
  }
}

// Verify decorator conflicts on member variables
function validateMemberDecorators(
  member: arkts.ClassProperty,
  hasComponentV2: arkts.AnnotationUsage | undefined,
  hasComponent: arkts.AnnotationUsage | undefined,
  node: arkts.AstNode,
  context: UISyntaxRuleContext
): void {
  // Check that the @Consumer is not mixed with other decorators
  validateMultipleBuiltInDecorators(member, PresetDecorators.CONSUMER, context);

  // Check that the @Provider is mixed with other decorators
  validateMultipleBuiltInDecorators(member, PresetDecorators.PROVIDER, context);

  // Check if the @Consumer is in a @ComponentV2-modified structure
  validateDecoratorWithComponentV2Requirement(
    member, hasComponentV2, hasComponent, node, context, PresetDecorators.CONSUMER
  );
  // Check if the @Provider is in a @ComponentV2-modified structure
  validateDecoratorWithComponentV2Requirement(
    member, hasComponentV2, hasComponent, node, context, PresetDecorators.PROVIDER
  );
}

// Verify that @Provider is being used in the class
function validateDecoratorInClass(
  member: arkts.ClassProperty,
  decoratorName: string,
  context: UISyntaxRuleContext
): void {
  const decorator = findDecorator(member, decoratorName);
  if (!decorator) {
    return;
  }
  context.report({
    node: decorator,
    message: rule.messages.providerOnlyInStruct,
    data: {
      decorator: getAnnotationName(decorator),
    },
    fix: (hasProviderDecorator) => {
      const startPosition = hasProviderDecorator.startPosition;
      const endPosition = hasProviderDecorator.endPosition;
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    }
  });
}

// Verify that the current identifier is an illegally initialized @Consumer member variable
function reportValidateConsumer(
  currentNode: arkts.Identifier,
  callExpName: string,
  componentv2WithConsumer: MultiMap<string, string>,
  context: UISyntaxRuleContext
): void {
  if (componentv2WithConsumer.get(callExpName).includes(getIdentifierName(currentNode))) {
    context.report({
      node: currentNode.parent,
      message: rule.messages.forbiddenInitialization,
      data: {
        decorator: PresetDecorators.CONSUMER,
        value: getIdentifierName(currentNode),
        structName: callExpName
      },
      fix: () => {
        const startPosition = currentNode.parent.startPosition;
        const endPosition = currentNode.parent.endPosition;
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      }
    });
  }
}

function reportValidateProvider(
  currentNode: arkts.Identifier,
  callExpName: string,
  componentv2WithProvider: MultiMap<string, string>,
  context: UISyntaxRuleContext
): void {
  if (componentv2WithProvider.get(callExpName).includes(getIdentifierName(currentNode))) {
    context.report({
      node: currentNode.parent,
      message: rule.messages.forbiddenInitialization,
      data: {
        decorator: PresetDecorators.PROVIDER,
        value: getIdentifierName(currentNode),
        structName: callExpName
      },
      fix: () => {
        const startPosition = currentNode.parent.startPosition;
        const endPosition = currentNode.parent.endPosition;
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      }
    });
  }
}

// Verify that the @Consumer-decorated property is initialized
function validateConsumerInitialization(node: arkts.CallExpression, componentv2WithConsumer: MultiMap<string, string>,
  context: UISyntaxRuleContext): void {
  if (!arkts.isIdentifier(node.expression)) {
    return;
  }
  const callExpName: string = node.expression.name;
  if (componentv2WithConsumer.has(callExpName)) {
    const queue: Array<arkts.AstNode> = [node];
    while (queue.length > 0) {
      const currentNode: arkts.AstNode = queue.shift() as arkts.AstNode;
      if (arkts.isIdentifier(currentNode)) {
        reportValidateConsumer(currentNode, callExpName, componentv2WithConsumer, context);
      }
      const children = currentNode.getChildren();
      for (const child of children) {
        queue.push(child);
      }
    }
  }
}

function validateProviderInitialization(node: arkts.CallExpression, componentv2WithProvider: MultiMap<string, string>,
  context: UISyntaxRuleContext): void {
  if (!arkts.isIdentifier(node.expression)) {
    return;
  }
  const callExpName: string = node.expression.name;
  if (componentv2WithProvider.has(callExpName)) {
    const queue: Array<arkts.AstNode> = [node];
    while (queue.length > 0) {
      const currentNode: arkts.AstNode = queue.shift() as arkts.AstNode;
      if (arkts.isIdentifier(currentNode)) {
        reportValidateProvider(currentNode, callExpName, componentv2WithProvider, context);
      }
      const children = currentNode.getChildren();
      for (const child of children) {
        queue.push(child);
      }
    }
  }
}

function collectStructsWithConsumerAndProvider(
  node: arkts.AstNode,
  componentv2WithConsumer: MultiMap<string, string>,
  componentv2WithProvider: MultiMap<string, string>,
): void {
  // Used to document all V2 structs that use '@Consumer'
  if (arkts.nodeType(node) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    // Breadth traversal is done through while and queues
    const queue: Array<arkts.AstNode> = [node];
    while (queue.length > 0) {
      const currentNode: arkts.AstNode = queue.shift() as arkts.AstNode;
      // Filter and record the nodes of the tree
      rememberStructName(currentNode, componentv2WithConsumer, componentv2WithProvider);
      const children = currentNode.getChildren();
      for (const child of children) {
        queue.push(child);
      }
    }
  }
}

function validateStructDecoratorsAndMembers(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  if (arkts.isStructDeclaration(node)) {
    const hasComponentV2 = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
    const hasComponent = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);
    node.definition.body.forEach(member => {
      if (arkts.isMethodDefinition(member)) {
        validateDecoratorOnMethod(member, context);
      }
      if (arkts.isClassProperty(member)) {
        validateMemberDecorators(member, hasComponentV2, hasComponent, node, context);
      }
    });
  }
}

function validateInClass(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  if (arkts.isClassDeclaration(node)) {
    node.definition?.body.forEach(member => {
      if (arkts.isClassProperty(member)) {
        validateDecoratorInClass(member, PresetDecorators.CONSUMER, context);
        validateDecoratorInClass(member, PresetDecorators.PROVIDER, context);
      }
    });
  }
}

const rule: UISyntaxRule = {
  name: 'consumer-provider-decorator-check',
  messages: {
    consumerOnlyOnMember: `'@{{decorator}}' can only decorate member property.`,
    multipleBuiltInDecorators: `The struct member variable can not be decorated by multiple built-in decorators.`,
    providerRequiresComponentV2: `The '@{{decorator}}' decorator can only be used in a 'struct' decorated with '@ComponentV2'.`,
    providerOnlyInStruct: `The '@{{decorator}}' decorator can only be used with 'struct'.`,
    forbiddenInitialization: `The '@{{decorator}}' property '{{value}}' in the custom component '{{structName}}' cannot be initialized here (forbidden to specify).`,
  },
  setup(context) {
    // Used to record the names of the corresponding structs and member variables that are @consumer modified
    let componentv2WithConsumer: MultiMap<string, string> = new MultiMap();
    let componentv2WithProvider: MultiMap<string, string> = new MultiMap();
    return {
      parsed: (node): void => {
        collectStructsWithConsumerAndProvider(node, componentv2WithConsumer, componentv2WithProvider);
        validateStructDecoratorsAndMembers(node, context);
        validateInClass(node, context);
        if (arkts.isCallExpression(node)) {
          validateConsumerInitialization(node, componentv2WithConsumer, context);
          validateProviderInitialization(node, componentv2WithProvider, context);
        }
      },
    };
  },
};

export default rule;