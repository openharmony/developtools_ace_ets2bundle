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
import { getIdentifierName, PresetDecorators } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

// Gets the names of all methods in the struct
function getMethodNames(node: arkts.StructDeclaration): string[] {
  const methodNames: string[] = [];
  node.definition.body.forEach((member) => {
    if (arkts.isMethodDefinition(member)) {
      const methodName = getIdentifierName(member.name);
      if (methodName) {
        methodNames.push(methodName);
      }
    }
  });
  return methodNames;
}

// Invalid @Watch decorator bugs are reported
function reportInvalidWatch(
  member: arkts.ClassProperty,
  methodName: string,
  hasWatchDecorator: arkts.AnnotationUsage,
  context: UISyntaxRuleContext
): void {
  context.report({
    node: hasWatchDecorator,
    message: rule.messages.invalidWatch,
    data: { methodName },
    fix: () => {
      const startPosition = arkts.getEndPosition(member);
      const endPosition = arkts.getEndPosition(member);
      return {
        range: [startPosition, endPosition],
        code: `\n${methodName}(){\n}`,
      };
    },
  });
}

function validateWatchDecorator(
  member: arkts.ClassProperty,
  methodNames: string[],
  hasWatchDecorator: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  member.annotations.forEach((annotation) => {
    validateWatchProperty(annotation, member, methodNames, hasWatchDecorator, context);
  });
}

function validateWatchProperty(
  annotation: arkts.AnnotationUsage,
  member: arkts.ClassProperty,
  methodNames: string[],
  hasWatchDecorator: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  if (
    annotation.expr &&
    annotation.expr.dumpSrc() === PresetDecorators.WATCH
  ) {
    annotation.properties.forEach((element) => {
      if (!arkts.isClassProperty(element)) {
        return;
      }
      const methodName = element.value?.dumpSrc().slice(1, -1);
      if (hasWatchDecorator && methodName && !methodNames.includes(methodName)) {
        reportInvalidWatch(member, methodName, hasWatchDecorator, context);
      }
    });
  }

}

function validateWatch(
  node: arkts.StructDeclaration,
  methodNames: string[],
  context: UISyntaxRuleContext
): void {
  node.definition.body.forEach(member => {
    if (!arkts.isClassProperty(member)) {
      return;
    }
    const hasWatchDecorator = member.annotations?.find(annotation =>
      annotation.expr &&
      annotation.expr.dumpSrc() === PresetDecorators.WATCH
    );
    // Determine whether it contains @watch decorators
    validateWatchDecorator(member, methodNames, hasWatchDecorator, context);
  });
}

const rule: UISyntaxRule = {
  name: 'watch-decorator-function',
  messages: {
    invalidWatch: `The '@Watch' decorated parameter must be a callback '{{methodName}}' of a function in a custom component.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        // Get all method names
        const methodNames = getMethodNames(node);
        validateWatch(node, methodNames, context);
      },
    };
  },
};

export default rule;