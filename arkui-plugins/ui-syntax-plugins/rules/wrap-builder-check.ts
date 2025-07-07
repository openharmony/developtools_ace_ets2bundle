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
import { getIdentifierName, getAnnotationName, PresetDecorators } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

const WRAPBUILDER_NAME: string = 'wrapBuilder';
// Collect all the function names that are decorated with @Builder
function collectBuilderFunctions(node: arkts.EtsScript, builderFunctionNames: string[]): void {
  node.statements.forEach((statement) => {
    if (!arkts.isFunctionDeclaration(statement)) {
      return;
    }
    const annotations = statement.annotations;
    if (!annotations) {
      return;
    }
    annotations.forEach((annotation) => {
      const decoratorName = getAnnotationName(annotation);
      // Find all the functions that are decorated with @Builder and note their names
      if (!decoratorName.includes(PresetDecorators.BUILDER)) {
        return;
      }
      const functionName = statement.scriptFunction.id?.name;
      if (!functionName || builderFunctionNames.includes(functionName)) {
        return;
      }
      builderFunctionNames.push(functionName);
    });
  });
}

// Verify that the wrapBuilder's arguments are decorated with @Builder
function validateWrapBuilderArguments(
  member: arkts.ClassProperty,
  context: UISyntaxRuleContext,
  builderFunctionNames: string[]
): void {
  member.getChildren().forEach((child) => {
    if (!arkts.isCallExpression(child) || child.expression.dumpSrc() !== WRAPBUILDER_NAME) {
      return;
    }
    let functionName: string | undefined;
    child.arguments.forEach(firstArgument => {
      if (arkts.isMemberExpression(firstArgument)) {
        functionName = getIdentifierName(firstArgument.property);
      } else if (arkts.isIdentifier(firstArgument)) {
        functionName = firstArgument.name;
      }
      // Verify that wrapBuilder's arguments are decorated with @Builder
      // rule1: The wrapBuilder accepts only a function decorated by '@Builder'
      if (functionName && !builderFunctionNames.includes(functionName)) {
        context.report({
          node: firstArgument,
          message: rule.messages.invalidBuilderCheck,
        });
      }
    });
  });
}

function validateWrapBuilder(
  node: arkts.StructDeclaration,
  builderFunctionNames: string[],
  context: UISyntaxRuleContext
): void {
  node.definition.body.forEach(member => {
    if (!arkts.isClassProperty(member)) {
      return;
    }
    validateWrapBuilderArguments(member, context, builderFunctionNames);
  });
}

const rule: UISyntaxRule = {
  name: 'wrap-builder-check',
  messages: {
    invalidBuilderCheck: 'The wrapBuilder accepts only a function decorated by @Builder.',
  },
  setup(context) {
    let builderFunctionNames: string[] = [];
    return {
      parsed: (node): void => {
        if (arkts.isEtsScript(node)) {
          collectBuilderFunctions(node, builderFunctionNames);
        }
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        validateWrapBuilder(node, builderFunctionNames, context);
      },
    };
  },
};

export default rule;
