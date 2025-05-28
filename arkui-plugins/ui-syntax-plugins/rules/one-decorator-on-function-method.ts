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
import { getAnnotationName } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

const allowedDecorators = new Set(['Extend', 'Builder', 'Styles']);

function validateFunctionDecorator(node: arkts.EtsScript, context: UISyntaxRuleContext): void {
  node.statements.forEach((statement) => {
    // If the node is not a function declaration, it is returned
    if (!arkts.isFunctionDeclaration(statement)) {
      return;
    }
    const annotations = statement.annotations;
    // If there is no annotation, go straight back
    if (!annotations) {
      return;
    }
    // Check that each annotation is in the list of allowed decorators
    annotations.forEach((annotation) => {
      const decoratorName = getAnnotationName(annotation);
      // rule1: misuse of decorator, only '@Extend', '@Builder' , '@Styles' decorators allowed on global functions
      if (!allowedDecorators.has(decoratorName)) {
        context.report({
          node: annotation,
          message: rule.messages.invalidDecorator,
          data: {
            decoratorName,
          },
        });
      }
    });
  });
}

const rule: UISyntaxRule = {
  name: 'one-decorator-on-function-method',
  messages: {
    invalidDecorator: `misuse of '@{{decoratorName}}' decorator, only '@Extend', '@Builder' and '@Styles' decorators allowed on global functions.`,
  },
  setup(context) {
    return {
      parsed: (node: arkts.AstNode): void => {
        // If the node is not an ETS script, it is returned directly
        if (!arkts.isEtsScript(node)) {
          return;
        }
        validateFunctionDecorator(node, context);
      },
    };
  },
};

export default rule;
