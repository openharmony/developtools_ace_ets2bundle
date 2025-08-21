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
    traceInObservedV2Error: `The '@Trace' decorator can only be used in a 'class' decorated with '@ObservedV2'.`,
    traceMemberVariableError: `The '@Trace' decorator can only decorate member variables within a 'class' decorated with '@ObservedV2'.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        validateTraceDecoratorUsage(node, context);
      },
    };
  },
};

function reportObservedV2DecoratorError(context: UISyntaxRuleContext, hasObservedV2Decorator: arkts.AnnotationUsage)
  : void {
  context.report({
    node: hasObservedV2Decorator,
    message: rule.messages.observedV2DecoratorError,
    fix: (hasObservedV2Decorator) => {
      const startPosition = arkts.getStartPosition(hasObservedV2Decorator);
      const endPosition = arkts.getEndPosition(hasObservedV2Decorator);
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

function reportTraceMemberVariableError(context: UISyntaxRuleContext, hasTraceDecorator: arkts.AnnotationUsage)
  : void {
  context.report({
    node: hasTraceDecorator,
    message: rule.messages.traceMemberVariableError,
    fix: (hasTraceDecorator) => {
      const startPosition = arkts.getStartPosition(hasTraceDecorator);
      const endPosition = arkts.getEndPosition(hasTraceDecorator);
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
    hasTraceDecorator: arkts.AnnotationUsage
): void {
    if (arkts.isStructDeclaration(currentNode)) {
        reportTraceDecoratorError(context, hasTraceDecorator);
    } else if (arkts.isClassDeclaration(currentNode)) {
        // The '@Trace' decorator can only be used in a 'class' decorated with '@ObservedV2'
        if (
            !currentNode.definition?.annotations?.some((annotation: arkts.AnnotationUsage) => {
                return (
                    !!annotation.expr &&
                    arkts.isIdentifier(annotation.expr) &&
                    annotation.expr.name === PresetDecorators.OBSERVED_V2
                );
            })
        ) {
            reportTraceInObservedV2Error(context, hasTraceDecorator, currentNode);
        }
    }
}

function reportTraceDecoratorError(context: UISyntaxRuleContext, hasTraceDecorator: arkts.AnnotationUsage)
  : void {
  context.report({
    node: hasTraceDecorator,
    message: rule.messages.traceDecoratorError,
    fix: (hasTraceDecorator) => {
      const startPosition = arkts.getStartPosition(hasTraceDecorator);
      const endPosition = arkts.getEndPosition(hasTraceDecorator);
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

function reportTraceInObservedV2Error(context: UISyntaxRuleContext, hasTraceDecorator: arkts.AnnotationUsage,
  currentNode: arkts.ClassDeclaration): void {
  context.report({
    node: hasTraceDecorator,
    message: rule.messages.traceInObservedV2Error,
    fix: () => {
      const startPosition = arkts.getStartPosition(currentNode);
      return {
        range: [startPosition, startPosition],
        code: `@${PresetDecorators.OBSERVED_V2}\n`,
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
    const hasTraceDecorator = node.annotations?.find(annotation =>
      annotation.expr && annotation.expr.dumpSrc() === PresetDecorators.TRACE);
    if (hasTraceDecorator) {
      // Iterate up the parent node to check whether it is a class or a custom component
      while (!arkts.isStructDeclaration(currentNode) && !arkts.isClassDeclaration(currentNode)) {
        currentNode = currentNode.parent;
      }
      // The '@Trace' decorator can only be used in 'class'
      tracePerportyRule(context, currentNode, hasTraceDecorator);
    }
  }
  if (arkts.isMethodDefinition(node)) {
    // Check that @Trace is in the correct location
    const hasTraceDecorator = node.scriptFunction.annotations?.find(annotation =>
      annotation.expr && annotation.expr.dumpSrc() === PresetDecorators.TRACE);
    if (hasTraceDecorator) {
      reportTraceMemberVariableError(context, hasTraceDecorator);
    }
  }
}

export default rule;
