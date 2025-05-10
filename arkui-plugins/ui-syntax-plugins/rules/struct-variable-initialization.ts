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
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

// A list of decorators that needs to be initialized locally
const mustInitializeDecorators = ['State', 'StorageLink', 'StorageProp', 'LocalStorageLink', 'LocalStorageProp',
  'Provide'];
// Disables a list of decorators that are initialized locally
const prohibitInitializeDecorators = ['Link', 'Consume', 'ObjectLink'];

function reportVariablesInitializationError(context: UISyntaxRuleContext, node: arkts.ClassProperty): void {
  // Check whether the value field exists and whether it has been initialized
  const valueExists = !!node.value;
  // Iterate through each decorator and verify the initialization rules
  node.annotations.forEach(annotation => {
    const decoratorName = annotation.expr?.dumpSrc() ?? '';
    if (mustInitializeDecorators.includes(decoratorName)) {
      // If it is a decorator that needs to be initialized
      if (!valueExists) {
        // If there is no initialization expression and there is no @Require, an error is reported
        context.report({
          node: annotation,
          message: rule.messages.mustBeInitializedLocally,
        });
      }
    } else if (prohibitInitializeDecorators.includes(decoratorName)) {
      // If it is a decorator that prohibits initialization
      if (valueExists) {
        // If an initialization expression exists, an error is reported
        context.report({
          node: annotation,
          message: rule.messages.prohibitLocalInitialization,
        });
      }
    }
  });
}

const rule: UISyntaxRule = {
  name: 'struct-variable-initialization',
  messages: {
    mustBeInitializedLocally: `Variables decorated by '@State', '@StorageLink', '@StorageProp', '@LocalStorageLink', '@LocalStorageProp' and '@Provide' must be initialized locally.`,
    prohibitLocalInitialization: `Variables decorated by '@Link', '@Consume', and '@ObjectLink' cannot be initialized locally.`
  },
  setup(context) {
    return {
      parsed: (node): void => {
        // Check if the current node is a class attribute
        if (!arkts.isClassProperty(node)) {
          return;
        }
        reportVariablesInitializationError(context, node);
      }
    };
  }
};

export default rule;