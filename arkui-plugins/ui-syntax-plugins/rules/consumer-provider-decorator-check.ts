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
import { getAnnotationUsage, MultiMap, PresetDecorators } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';
// Traverse the member variables of the struct, recording the members of the @Consumer modifications
function processStructMembers(
  node: arkts.StructDeclaration,
  structName: string,
  componentv2WithConsumer: MultiMap<string, string>
): void {
  node.definition.body.forEach((member) => {
    // When a member variable is @consumer modified, it is stored to mark fields that cannot be initialized
    if (arkts.isClassProperty(member)) {
      const memberName = member?.key?.dumpSrc();
      structName && memberName ? componentv2WithConsumer.add(structName, memberName) : null;
    }
  });
}
function rememberStructName(node: arkts.AstNode, componentv2WithConsumer: MultiMap<string, string>): void {
  // First it has to be of the struct type
  if (arkts.isStructDeclaration(node)) {
    node?.definition?.annotations.forEach((anno) => {
      // Second, it must be decorated with a @component v2 decorator
      if (anno.expr?.dumpSrc() === PresetDecorators.COMPONENT_V2) {
        const structName = node.definition.ident?.name ?? '';
        processStructMembers(node, structName, componentv2WithConsumer);
      }
    });
  }
}
function findDecorator(member: arkts.ClassProperty, decorator: string): arkts.AnnotationUsage | undefined {
  return member.annotations?.find(annotation =>
    annotation.expr &&
    annotation.expr.dumpSrc() === decorator
  );
}
// Verify that the @Consumer decorator is used on the method
function validateConsumerOnMethod(member: arkts.MethodDefinition, context: UISyntaxRuleContext): void {
  const annotationNode = member.scriptFunction.annotations?.find(annotation =>
    annotation.expr && annotation.expr.dumpSrc() === PresetDecorators.CONSUMER
  );
  if (annotationNode) {
    context.report({
      node: annotationNode,
      message: rule.messages.consumerOnlyOnMember,
      fix: (annotationNode) => {
        const startPosition = arkts.getStartPosition(annotationNode);
        const endPosition = arkts.getEndPosition(annotationNode);
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      }
    });
  }
}
// @Consumer Bugs that conflict with other decorators
function reportMultipleBuiltInDecorators(
  hasConsumeDecorator: arkts.AnnotationUsage,
  otherDecorators: arkts.AnnotationUsage,
  context: UISyntaxRuleContext,
): void {
  context.report({
    node: hasConsumeDecorator,
    message: rule.messages.multipleBuiltInDecorators,
    fix: (hasConsumeDecorator) => {
      const startPosition = arkts.getStartPosition(otherDecorators);
      const endPosition = arkts.getEndPosition(otherDecorators);
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    }
  });
}
// Report a bug where @Provider is missing @ComponentV2
function reportProviderRequiresComponentV2(
  hasProviderDecorator: arkts.AnnotationUsage,
  hasComponent: arkts.AnnotationUsage | undefined,
  node: arkts.AstNode,
  context: UISyntaxRuleContext,
): void {
  if (hasComponent) {
    context.report({
      node: hasProviderDecorator,
      message: rule.messages.providerRequiresComponentV2,
      fix: (hasProviderDecorator) => {
        const startPosition = arkts.getStartPosition(hasComponent);
        const endPosition = arkts.getEndPosition(hasComponent);
        return {
          range: [startPosition, endPosition],
          code: `@${PresetDecorators.COMPONENT_V2}`,
        };
      }
    });
  } else {
    context.report({
      node: hasProviderDecorator,
      message: rule.messages.providerRequiresComponentV2,
      fix: (hasProviderDecorator) => {
        const startPosition = arkts.getStartPosition(node);
        const endPosition = startPosition;
        return {
          range: [startPosition, endPosition],
          code: `@${PresetDecorators.COMPONENT_V2}\n`,
        };
      }
    });
  }
}
// Verify decorator conflicts on member variables
function validateMemberDecorators(member: arkts.ClassProperty,
  hasComponentV2: arkts.AnnotationUsage | undefined,
  hasComponent: arkts.AnnotationUsage | undefined,
  node: arkts.AstNode,
  context: UISyntaxRuleContext
): void {
  const hasConsumeDecorator = findDecorator(member, PresetDecorators.CONSUMER);
  const hasProviderDecorator = findDecorator(member, PresetDecorators.PROVIDER);
  const otherDecorators = member.annotations?.find(annotation =>
    annotation.expr &&
    annotation.expr.dumpSrc() !== PresetDecorators.CONSUMER
  );
  if (hasConsumeDecorator && otherDecorators) {
    reportMultipleBuiltInDecorators(hasConsumeDecorator, otherDecorators, context);
  }
  if (hasProviderDecorator && !hasComponentV2) {
    reportProviderRequiresComponentV2(hasProviderDecorator, hasComponent, node, context);
  }
}
// Verify that @Provider is being used in the class
function validateProviderInClass(member: arkts.ClassProperty, context: UISyntaxRuleContext): void {
  const hasProviderDecorator = findDecorator(member, PresetDecorators.PROVIDER);
  if (hasProviderDecorator) {
    context.report({
      node: hasProviderDecorator,
      message: rule.messages.providerOnlyInStruct,
      fix: (hasProviderDecorator) => {
        const startPosition = arkts.getStartPosition(hasProviderDecorator);
        const endPosition = arkts.getEndPosition(hasProviderDecorator);
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      }
    });
  }
}
// Verify that the current identifier is an illegally initialized @Consumer member variable
function reportValidateConsumer(
  currentNode: arkts.Identifier,
  callExpName: string,
  componentv2WithConsumer: MultiMap<string, string>,
  context: UISyntaxRuleContext
): void {
  if (componentv2WithConsumer.get(callExpName).includes(currentNode.dumpSrc())) {
    context.report({
      node: currentNode.parent,
      message: rule.messages.forbiddenInitialization,
      data: {
        value: currentNode.dumpSrc(),
        structName: callExpName
      },
      fix: () => {
        const startPosition = arkts.getStartPosition(currentNode.parent);
        const endPosition = arkts.getEndPosition(currentNode.parent);
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
  const callExpName: string = node.expression.dumpSrc();
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
function collectStructsWithConsumer(node: arkts.AstNode, componentv2WithConsumer: MultiMap<string, string>): void {
  // Used to document all V2 structs that use '@Consumer'
  if (arkts.nodeType(node) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    // Breadth traversal is done through while and queues
    const queue: Array<arkts.AstNode> = [node];
    while (queue.length > 0) {
      const currentNode: arkts.AstNode = queue.shift() as arkts.AstNode;
      // Filter and record the nodes of the tree
      rememberStructName(currentNode, componentv2WithConsumer);
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
        validateConsumerOnMethod(member, context);
      }
      if (arkts.isClassProperty(member)) {
        validateMemberDecorators(member, hasComponentV2, hasComponent, node, context);
      }
    });
  }
}
function validateProviderInClasses(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  if (arkts.isClassDeclaration(node)) {
    node.definition?.body.forEach(member => {
      if (arkts.isClassProperty(member)) {
        validateProviderInClass(member, context);
      }
    });
  }
}
const rule: UISyntaxRule = {
  name: 'consumer-provider-decorator-check',
  messages: {
    consumerOnlyOnMember: `'@Consumer' can only decorate member property.`,
    multipleBuiltInDecorators: `The struct member variable can not be decorated by multiple built-in decorators.`,
    providerRequiresComponentV2: `The '@Provider' decorator can only be used in a 'struct' decorated with '@ComponentV2'.`,
    providerOnlyInStruct: `The '@Provider' decorator can only be used with 'struct'.`,
    forbiddenInitialization: `Property '{{value}}' in the custom component '{{structName}}' cannot be initialized here (forbidden to specify).`,
  },
  setup(context) {
    // Used to record the names of the corresponding structs and member variables that are @consumer modified
    let componentv2WithConsumer: MultiMap<string, string> = new MultiMap();
    return {
      parsed: (node): void => {
        collectStructsWithConsumer(node, componentv2WithConsumer);
        validateStructDecoratorsAndMembers(node, context);
        validateProviderInClasses(node, context);
        if (arkts.isCallExpression(node)) {
          validateConsumerInitialization(node, componentv2WithConsumer, context);
        }
      },
    };
  },
};

export default rule;
