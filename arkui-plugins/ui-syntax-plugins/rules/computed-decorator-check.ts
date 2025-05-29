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
import { getIdentifierName, PresetDecorators, getAnnotationName, getAnnotationUsage } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

const BUILD_NAME: string = 'build';

function validateStructBody(
  node: arkts.StructDeclaration,
  computedGetters: Map<string, arkts.MethodDefinition>,
  computedSetters: Map<string, arkts.MethodDefinition>,
  context: UISyntaxRuleContext
): void {
  let hasComputed: arkts.AnnotationUsage | undefined;
  node.definition.body.forEach((member) => {
    if (arkts.isClassProperty(member)) {
      validateComputedOnClassProperty(member, context);
      return;
    }
    if (arkts.isMethodDefinition(member)) {
      const methodName = getIdentifierName(member.name);
      hasComputed = member.scriptFunction.annotations?.find(annotation =>
        annotation.expr && arkts.isIdentifier(annotation.expr) &&
        annotation.expr.name === PresetDecorators.COMPUTED
      );
      validateComputedMethodKind(member, hasComputed, methodName, computedGetters, context);
      const isSetter = member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET;
      if (isSetter) {
        computedSetters.set(methodName, member);
      }
      if (methodName === BUILD_NAME) {
        validateBuildMethod(member, computedGetters, context);
      }
    }
  });
  validateGetterSetterConflict(computedGetters, computedSetters, context);
}

function validateComputedOnClassProperty(member: arkts.ClassProperty, context: UISyntaxRuleContext): void {
  const hasComputed = member.annotations?.find(annotation =>
    annotation.expr && arkts.isIdentifier(annotation.expr) &&
    annotation.expr.name === PresetDecorators.COMPUTED
  );
  if (hasComputed) {
    context.report({
      node: hasComputed,
      message: rule.messages.onlyOnGetter,
      fix: (hasComputed) => {
        const startPosition = hasComputed.startPosition;
        const endPosition = hasComputed.endPosition;
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      },
    });
  }
}

function validateComputedMethodKind(
  member: arkts.MethodDefinition,
  hasComputed: arkts.AnnotationUsage | undefined,
  methodName: string,
  computedGetters: Map<string, arkts.MethodDefinition>,
  context: UISyntaxRuleContext
): void {
  if (hasComputed) {
    const isGetter = member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET;
    if (!isGetter) {
      reportValidateComputedMethodKind(hasComputed, context);
    } else {
      computedGetters.set(methodName, member);
    }
  }
}

function reportValidateComputedMethodKind(
  hasComputed: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  if (!hasComputed) {
    return;
  }
  context.report({
    node: hasComputed,
    message: rule.messages.onlyOnGetter,
    fix: (hasComputed) => {
      const startPosition = hasComputed.startPosition;
      const endPosition = hasComputed.endPosition;
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

function validateBuildMethod(
  member: arkts.MethodDefinition,
  computedGetters: Map<string, arkts.MethodDefinition>,
  context: UISyntaxRuleContext
): void {
  member.scriptFunction.body?.getChildren().forEach((childNode) => {
    if (!arkts.isExpressionStatement(childNode)) {
      return;
    }
    const queue: Array<arkts.AstNode> = [childNode];
    while (queue.length > 0) {
      const currentNode: arkts.AstNode = queue.shift() as arkts.AstNode;
      // Check if it's a CallExpression (function call)
      if (arkts.isCallExpression(currentNode)) {
        // Check if it's a $$(...) call
        validateCallExpression(currentNode, computedGetters, context);
      }
      // Continue traversing the child nodes
      const children = currentNode.getChildren();
      for (const child of children) {
        queue.push(child);
      }
    }
  });
}

function validateCallExpression(
  currentNode: arkts.CallExpression,
  computedGetters: Map<string, arkts.MethodDefinition>,
  context: UISyntaxRuleContext
): void {
  // Check if it's a $$(...) call
  if (!arkts.isIdentifier(currentNode.expression)) {
    return;
  }
  if (getIdentifierName(currentNode.expression) === '$$') {
    currentNode.arguments.forEach(argument => {
      if (arkts.isMemberExpression(argument)) {
        const getterName = getIdentifierName(argument.property);
        reportValidateCallExpression(currentNode, getterName, computedGetters, context);
      }
    });
  }
}

function reportValidateCallExpression(
  currentNode: arkts.CallExpression,
  getterName: string,
  computedGetters: Map<string, arkts.MethodDefinition>,
  context: UISyntaxRuleContext
): void {
  if (computedGetters.has(getterName)) {
    context.report({
      node: currentNode,
      message: rule.messages.noTwoWayBinding,
      fix: (currentNode) => {
        const startPosition = currentNode.startPosition;
        const endPosition = currentNode.endPosition;
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      },
    });
  }
}

// Check for the presence of a @Computed property that defines both a getter and a setter
function validateGetterSetterConflict(
  computedGetters: Map<string, arkts.MethodDefinition>,
  computedSetters: Map<string, arkts.MethodDefinition>,
  context: UISyntaxRuleContext
): void {
  for (const [name] of computedGetters) {
    if (computedSetters.has(name)) {
      reportValidateGetterSetterConflict(computedSetters, name, context);
    }
  }
}

function reportValidateGetterSetterConflict(
  computedSetters: Map<string, arkts.MethodDefinition>,
  name: string,
  context: UISyntaxRuleContext
): void {
  context.report({
    node: computedSetters.get(name)!,
    message: rule.messages.computedMethodDefineSet,
    fix: (node) => {
      const startPosition = node.startPosition;
      const endPosition = node.endPosition;
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

function validateClassBody(
  node: arkts.ClassDeclaration,
  computedGetters: Map<string, arkts.MethodDefinition>,
  context: UISyntaxRuleContext
): void {
  const hasObservedV2 = node.definition?.annotations.find(annotation =>
    getAnnotationName(annotation) === PresetDecorators.OBSERVED_V2
  );
  node.definition?.body.forEach((member) => {
    if (arkts.isMethodDefinition(member)) {
      validateComputedInClass(node, member, hasObservedV2, context);
      if (!arkts.isIdentifier(member.name)) {
        return;
      }
      const methodName = getIdentifierName(member.name);
      const hasComputed = member.scriptFunction.annotations?.find(annotation =>
        annotation.expr && arkts.isIdentifier(annotation.expr) &&
        annotation.expr.name === PresetDecorators.COMPUTED
      );
      validateComputedMethodKind(member, hasComputed, methodName, computedGetters, context);
    }
  });
}

function validateComponentV2InStruct(
  node: arkts.StructDeclaration,
  context: UISyntaxRuleContext
): void {
  const hasComponentV2 = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
  const hasComponent = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);
  node.definition?.body.forEach((member) => {
    if (arkts.isMethodDefinition(member)) {
      reportComponentV2InStruct(node, member, hasComponentV2, hasComponent, context);
    }
  });
}

function reportComponentV2InStruct(
  node: arkts.StructDeclaration | arkts.ClassDeclaration,
  member: arkts.MethodDefinition,
  hasComponentV2: arkts.AnnotationUsage | undefined,
  hasComponent: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  const hasComputed = member.scriptFunction.annotations?.find(annotation =>
    annotation.expr && arkts.isIdentifier(annotation.expr) &&
    annotation.expr.name === PresetDecorators.COMPUTED
  );
  if (hasComputed && !hasComponentV2 && !hasComponent) {
    context.report({
      node: hasComputed,
      message: rule.messages.componentV2InStruct,
      fix: () => {
        const startPosition = node.startPosition;
        const endPosition = node.startPosition;
        return {
          range: [startPosition, endPosition],
          code: `@${PresetDecorators.COMPONENT_V2}\n`,
        };
      },
    });
  }
  if (hasComputed && !hasComponentV2 && hasComponent) {
    context.report({
      node: hasComputed,
      message: rule.messages.componentV2InStruct,
      fix: () => {
        const startPosition = hasComponent.startPosition;
        const endPosition = hasComponent.endPosition;
        return {
          range: [startPosition, endPosition],
          code: `@${PresetDecorators.COMPONENT_V2}`,
        };
      },
    });
  }
}

function validateComputedInClass(
  node: arkts.AstNode,
  member: arkts.MethodDefinition,
  hasObservedV2: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  const hasComputed = member.scriptFunction.annotations?.find(annotation =>
    annotation.expr && arkts.isIdentifier(annotation.expr) &&
    annotation.expr.name === PresetDecorators.COMPUTED
  );
  if (hasComputed && !hasObservedV2 &&
    arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET === member.kind) {
    context.report({
      node: hasComputed,
      message: rule.messages.onlyInObservedV2,
      fix: () => {
        const startPosition = node.startPosition;
        return {
          range: [startPosition, startPosition],
          code: `@${PresetDecorators.OBSERVED_V2}\n`,
        };
      },
    });
  }
}

const rule: UISyntaxRule = {
  name: 'computed-decorator-check',
  messages: {
    onlyOnGetter: `@Computed can only decorate 'GetAccessor'.`,
    onlyInObservedV2: `The '@Computed' can decorate only member method within a 'class' decorated with ObservedV2.`,
    componentV2InStruct: `The '@Computed' decorator can only be used in a 'struct' decorated with ComponentV2.`,
    noTwoWayBinding: `A property decorated by '@Computed' cannot be used with two-way bind syntax.`,
    computedMethodDefineSet: `A property decorated by '@Computed' cannot define a set method.`
  },
  setup(context) {
    const computedGetters = new Map<string, arkts.MethodDefinition>();
    const computedSetters = new Map<string, arkts.MethodDefinition>();
    return {
      parsed: (node): void => {
        if (arkts.isStructDeclaration(node)) {
          validateComponentV2InStruct(node, context);
          validateStructBody(node, computedGetters, computedSetters, context);
        }
        if (arkts.isClassDeclaration(node)) {
          validateClassBody(node, computedGetters, context);
        }
      },
    };
  },
};

export default rule;
