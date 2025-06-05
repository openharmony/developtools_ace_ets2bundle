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
import { getIdentifierName, getAnnotationName, PresetDecorators, WRAP_BUILDER } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

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
      if (!functionName || functionName === '' || builderFunctionNames.includes(functionName)) {
        return;
      }
      builderFunctionNames.push(functionName);
    });
  });
}

function validateWrapBuilderInIdentifier(
  node: arkts.AstNode,
  builderFunctionNames: string[],
  context: UISyntaxRuleContext
): void {
  // If the current node is not a wrap builder, return
  if (!arkts.isIdentifier(node) || getIdentifierName(node) !== WRAP_BUILDER) {
    return;
  }
  const parentNode = node.parent;
  if (!arkts.isCallExpression(parentNode)) {
    return;
  }
  let functionName: string = '';
  // Get the parameters of the wrap builder
  parentNode.arguments.forEach(argument => {
    if (arkts.isIdentifier(argument)) {
      functionName = argument.name;
    }
  });
  // If the function name is not empty and not decorated by the @builder, an error is reported
  if (functionName === '' || !builderFunctionNames.includes(functionName)) {
    const errorNode = parentNode.arguments[0];
    context.report({
      node: errorNode,
      message: rule.messages.invalidWrapBuilderCheck,
    });
  }
}

function validateWrapBuilderInReturnStatement(
  node: arkts.AstNode,
  builderFunctionNames: string[],
  context: UISyntaxRuleContext
): void {
  if (!arkts.isReturnStatement(node)) {
    return;
  }
  if (!node.argument || !arkts.isCallExpression(node.argument)) {
    return;
  }
  if (!node.argument.expression || !arkts.isIdentifier(node.argument.expression) ||
    node.argument.expression.name !== WRAP_BUILDER) {
    return;
  }
  let functionName: string = '';
  // Get the parameters of the wrap builder
  node.argument.arguments.forEach(argument => {
    if (arkts.isIdentifier(argument)) {
      functionName = argument.name;
    }
  });
  // If the function name is not empty and not decorated by the @builder, an error is reported
  if (functionName === '' || !builderFunctionNames.includes(functionName)) {
    const errorNode = node.argument.arguments[0];
    context.report({
      node: errorNode,
      message: rule.messages.invalidWrapBuilderCheck,
    });
  }
}

const rule: UISyntaxRule = {
  name: 'wrap-builder-check',
  messages: {
    invalidWrapBuilderCheck: 'The wrapBuilder\'s parameter should be @Builder function.',
  },
  setup(context) {
    let builderFunctionNames: string[] = [];
    return {
      parsed: (node): void => {
        if (arkts.isEtsScript(node)) {
          collectBuilderFunctions(node, builderFunctionNames);
        }
        validateWrapBuilderInIdentifier(node, builderFunctionNames, context);
        validateWrapBuilderInReturnStatement(node, builderFunctionNames, context);
      },
    };
  },
};

export default rule;