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
import { PresetDecorators, getAnnotationUsage } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

const rule: UISyntaxRule = {
  name: 'observedV2-trace-usage-validation',
  messages: {
    observedV2DecoratorError: `The '@ObservedV2' decorator can only be used in 'class'.`,
    traceDecoratorError: `The '@Trace' decorator can only be used in 'class'.`,
    traceMemberVariableError: `The '@Trace' decorator can only decorate member variables within a 'class' decorated with '@ObservedV2'.`,
    //The repair logic is different, if there is v1, update to v2
    traceMustUsedWithObservedV2: `The '@Trace' decorator can only be used within a 'class' decorated with 'ObservedV2'.`,
    traceMustUsedWithObservedV2Update: `The '@Trace' decorator can only be used within a 'class' decorated with 'ObservedV2'.`,


  },
  setup(context) {
    return {
      parsed: (node): void => {
        validateTraceDecoratorUsage(node, context);
      },
    };
  },
};

function getObservedDecorator(node: arkts.ClassDeclaration): arkts.AnnotationUsage | undefined {
  return node.definition?.annotations.find(annotation =>
    annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === PresetDecorators.OBSERVED_V1);
}

function reportObservedV2DecoratorError(context: UISyntaxRuleContext, hasObservedV2Decorator: arkts.AnnotationUsage)
  : void {
  context.report({
    node: hasObservedV2Decorator,
    message: rule.messages.observedV2DecoratorError,
    fix: (hasObservedV2Decorator) => {
      const startPosition = hasObservedV2Decorator.startPosition;
      const endPosition = hasObservedV2Decorator.endPosition;
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

function reportTraceMemberVariableError(context: UISyntaxRuleContext, traceDecorator: arkts.AnnotationUsage)
  : void {
  context.report({
    node: traceDecorator,
    message: rule.messages.traceMemberVariableError,
    fix: (traceDecorator) => {
      const startPosition = traceDecorator.startPosition;
      const endPosition = traceDecorator.endPosition;
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

function tracePerportyRule(
  context: UISyntaxRuleContext,
  currentNode: arkts.AstNode,
  traceDecorator: arkts.AnnotationUsage): void {
  if (arkts.isStructDeclaration(currentNode)) {
    reportTraceDecoratorError(context, traceDecorator);
  } else if (arkts.isClassDeclaration(currentNode) && currentNode.definition) {
    const observedDecorator = getObservedDecorator(currentNode);
    const observedV2 = currentNode.definition.annotations.some(annotation =>
      annotation.expr &&
      arkts.isIdentifier(annotation.expr) &&
      annotation.expr.name === PresetDecorators.OBSERVED_V2
    );
    if (!observedV2 && !observedDecorator) {
      reportTraceMustUsedWithObservedV2(context, traceDecorator, currentNode);
    } else if (!observedV2 && observedDecorator) {
      reportTraceMustUsedWithObservedV2Update(context, traceDecorator, observedDecorator);
    }
  }
}

function reportTraceDecoratorError(context: UISyntaxRuleContext, traceDecorator: arkts.AnnotationUsage)
  : void {
  context.report({
    node: traceDecorator,
    message: rule.messages.traceDecoratorError,
    fix: (traceDecorator) => {
      const startPosition = traceDecorator.startPosition;
      const endPosition = traceDecorator.endPosition;
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

function reportTraceMustUsedWithObservedV2(context: UISyntaxRuleContext, traceDecorator: arkts.AnnotationUsage,
  currentNode: arkts.ClassDeclaration): void {
  context.report({
    node: traceDecorator,
    message: rule.messages.traceMustUsedWithObservedV2,
    fix: () => {
      const startPosition = currentNode.startPosition;
      return {
        range: [startPosition, startPosition],
        code: `@${PresetDecorators.OBSERVED_V2}\n`,
      };
    },
  });
}

function reportTraceMustUsedWithObservedV2Update(context: UISyntaxRuleContext, traceDecorator: arkts.AnnotationUsage,
  observedDecorator: arkts.AnnotationUsage): void {
  context.report({
    node: traceDecorator,
    message: rule.messages.traceMustUsedWithObservedV2Update,
    fix: () => {
      const startPosition = observedDecorator.startPosition;
      const endPosition = observedDecorator.endPosition;
      return {
        range: [startPosition, endPosition],
        code: `@${PresetDecorators.OBSERVED_V2}`,
      };
    },
  });
}

function validateTraceDecoratorUsage(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  let currentNode = node;
  if (arkts.isStructDeclaration(node)) {
    // Check whether the current custom component is decorated by the @ObservedV2 decorator
    const hasObservedV2Decorator = getAnnotationUsage(node, PresetDecorators.OBSERVED_V2);
    if (hasObservedV2Decorator) {
      reportObservedV2DecoratorError(context, hasObservedV2Decorator);
    }
  }
  if (arkts.isClassProperty(node)) {
    checkTraceDecoratorUsageInClassProperty(context, node, currentNode);
  }
  if (arkts.isMethodDefinition(node)) {
    // Check that @Trace is in the correct location
    const traceDecorator = node.scriptFunction.annotations?.find(annotation =>
      annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === PresetDecorators.TRACE);
    if (traceDecorator) {
      reportTraceMemberVariableError(context, traceDecorator);
    }
  }
}

function checkTraceDecoratorUsageInClassProperty(
  context: UISyntaxRuleContext,
  node: arkts.ClassProperty,
  currentNode: arkts.AstNode,): void {
  const traceDecorator = node.annotations?.find(annotation =>
    annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === PresetDecorators.TRACE);
  if (traceDecorator) {
    // Iterate up the parent node to check whether it is a class or a custom component
    while (!arkts.isStructDeclaration(currentNode) && !arkts.isClassDeclaration(currentNode)) {
      if (!currentNode.parent) {
        return;
      }
      currentNode = currentNode.parent;
    }
    // The '@Trace' decorator can only be used in 'class'
    tracePerportyRule(context, currentNode, traceDecorator);
  }
}

export default rule;
