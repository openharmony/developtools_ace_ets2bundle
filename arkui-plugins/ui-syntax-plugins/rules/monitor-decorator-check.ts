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
import { PresetDecorators } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

// Function declarations moved to the top with explicit return types
function getLocalMonitorUsed(body: arkts.MethodDefinition): arkts.AnnotationUsage | undefined {
  const localMonitorUsed = body.scriptFunction.annotations?.find(
    annotation => annotation.expr &&
      annotation.expr.dumpSrc() === PresetDecorators.MONITOR
  );
  return localMonitorUsed;
}

function checkConflictingDecorators(context: UISyntaxRuleContext, body: arkts.MethodDefinition,
  localMonitorUsed: arkts.AnnotationUsage): boolean {
  const conflictingDecorators = body.scriptFunction.annotations?.filter(
    annotation => annotation.expr &&
      annotation.expr.dumpSrc() !== PresetDecorators.MONITOR
  );
  if (conflictingDecorators?.length > 0) {
    reportConflictingDecorators(context, localMonitorUsed, conflictingDecorators);
    return true;
  }
  return false;
}

function reportConflictingDecorators(context: UISyntaxRuleContext, localMonitorUsed: arkts.AstNode,
  conflictingDecorators: arkts.AnnotationUsage[]): void {
  context.report({
    node: localMonitorUsed,
    message: rule.messages.invalidUsage1,
    fix: () => {
      const startPositions = conflictingDecorators.map(annotation =>
        arkts.getStartPosition(annotation));
      const endPositions = conflictingDecorators.map(annotation => arkts.getEndPosition(annotation));
      const startPosition = startPositions[0];
      const endPosition = endPositions[endPositions.length - 1];
      return {
        range: [startPosition, endPosition],
        code: ''
      };
    }
  });
}

function checkIfClassIsObservedV2(node: arkts.ClassDeclaration): boolean {
  return node.definition?.annotations?.some(
    observedV2 => observedV2.expr?.dumpSrc() === PresetDecorators.OBSERVED_V2
  ) ?? false;
}

function checkIfStructIsComponentV2(node: arkts.StructDeclaration): boolean {
  return node.definition?.annotations?.some(
    componentV2 => componentV2.expr?.dumpSrc() === PresetDecorators.COMPONENT_V2
  ) ?? false;
}

function reportInvalidUsage(context: UISyntaxRuleContext, node: arkts.AstNode, message: string, fixCode: string)
  : void {
  const startPosition = arkts.getStartPosition(node);
  context.report({
    node,
    message,
    fix: () => ({
      range: [startPosition, startPosition],
      code: fixCode,
    }),
  });
}

function checkMultipleDecorators(
  node: arkts.ClassDeclaration | arkts.StructDeclaration,
  context: UISyntaxRuleContext
): boolean {
  // Traverse body of the class to check for @Monitor usage
  let monitorUsed: boolean = false;
  node.definition?.body.forEach(body => {
    if (arkts.isMethodDefinition(body)) {
      const localMonitorUsed = getLocalMonitorUsed(body);
      if (localMonitorUsed) {
        monitorUsed = true;
        checkConflictingDecorators(context, body, localMonitorUsed);
        return; // Stop further checks for this method
      }
    }
  });
  return monitorUsed;
}

function checkDecorateMethod(
  node: arkts.ClassDeclaration | arkts.StructDeclaration,
  context: UISyntaxRuleContext
): void {
  // Check if @Monitor is used on a property (which is not allowed)
  node.definition?.body.forEach(body => {
    if (!arkts.isClassProperty(body)) {
      return;
    }
    const monitorDecorator = body.annotations?.find(
      annotation => annotation.expr?.dumpSrc() === PresetDecorators.MONITOR);
    if (monitorDecorator === undefined) {
      return;
    }
    context.report({
      node: monitorDecorator,
      message: rule.messages.invalidUsage4,
      fix: () => {
        const startPosition = arkts.getStartPosition(monitorDecorator);
        const endPosition = arkts.getEndPosition(monitorDecorator);
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      },
    });
  });
}

// The rule object with its setup method
const rule: UISyntaxRule = {
  name: 'monitor-decorator-check',
  messages: {
    invalidUsage1:
      `The member property or method can not be decorated by multiple built-in decorators.`,
    invalidUsage2:
      `The '@Monitor' can decorate only member method within a 'class' decorated with @ObservedV2.`,
    invalidUsage3:
      `The '@Monitor' decorator can only be used in a 'struct' decorated with '@ComponentV2'.`,
    invalidUsage4:
      `@Monitor can only decorate method`,
  },
  setup(context) {
    return {
      parsed: (node: arkts.AstNode): void => {
        if (!arkts.isClassDeclaration(node) && !arkts.isStructDeclaration(node)) {
          return;
        }
        let monitorUsed = false;

        const isObservedV2 = arkts.isClassDeclaration(node) && checkIfClassIsObservedV2(node);
        const isComponentV2 = arkts.isStructDeclaration(node) && checkIfStructIsComponentV2(node);

        monitorUsed = checkMultipleDecorators(node, context);

        // Check for errors related to @Monitor usage
        if (monitorUsed && !isObservedV2 && arkts.isClassDeclaration(node)) {
          reportInvalidUsage(context, node, rule.messages.invalidUsage2, `@${PresetDecorators.OBSERVED_V2}\n`);
        }
        if (monitorUsed && !isComponentV2 && arkts.isStructDeclaration(node)) {
          reportInvalidUsage(context, node, rule.messages.invalidUsage3, `@${PresetDecorators.COMPONENT_V2}\n`);
        }

        checkDecorateMethod(node, context);
      },
    };
  },
};

export default rule;
