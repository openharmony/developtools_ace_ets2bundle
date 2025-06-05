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
import { PresetDecorators } from '../utils';

// A list of decorators that needs to be initialized locally
const mustInitializeDecorators = [
  PresetDecorators.STATE,
  PresetDecorators.STORAGE_LINK,
  PresetDecorators.STORAGE_PROP,
  PresetDecorators.LOCAL_STORAGE_LINK,
  PresetDecorators.LOCAL_STORAGE_PROP,
  PresetDecorators.PROVIDE,
];
// Disables a list of decorators that are initialized locally
const prohibitInitializeDecorators = [
  PresetDecorators.LINK,
  PresetDecorators.CONSUME,
  PresetDecorators.OBJECT_LINK,
];

// When used with @require, non-initialization is allowed
const requireCanReleaseMandatoryDecorators = [
  PresetDecorators.STATE,
  PresetDecorators.PROVIDE,
];

function reportVariablesInitializationError(context: UISyntaxRuleContext, node: arkts.ClassProperty): void {
  // Check whether the value field exists and whether it has been initialized
  const valueExists = !!node.value;
  // Check for the presence of require decorator
  const hasRequire = node.annotations.some(annotation => {
    annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === PresetDecorators.REQUIRE;
  });
  node.annotations.some(annotation => {
    if (annotation.expr && arkts.isIdentifier(annotation.expr) &&
      mustInitializeDecorators.includes(annotation.expr.name)) {
      const decoratorName = annotation.expr.name;
      reportInitializeError(context, decoratorName, valueExists, annotation, hasRequire);
      return true;
    } else if (annotation.expr && arkts.isIdentifier(annotation.expr) &&
      prohibitInitializeDecorators.includes(annotation.expr.name)) {
      const decoratorName = annotation.expr.name;
      reportProHibitInitializeError(context, decoratorName, valueExists, annotation);
      return true;
    }
    return false;
  });
}

function reportInitializeError(context: UISyntaxRuleContext, decoratorName: string, valueExists: boolean,
  annotation: arkts.AnnotationUsage, hasRequire: boolean): void {
  // Used with @require allows non-initialization
  if (hasRequire && requireCanReleaseMandatoryDecorators.includes(decoratorName)) {
    return;
  }
  // If it is a decorator that needs to be initialized
  if (!valueExists) {
    // If there is no initialization expression and there is no @Require, an error is reported
    context.report({
      node: annotation,
      message: rule.messages.mustBeInitializedLocally,
      data: { decoratorName },
    });
  }
}

function reportProHibitInitializeError(context: UISyntaxRuleContext, decoratorName: string, valueExists: boolean,
  annotation: arkts.AnnotationUsage): void {
  // If it is a decorator that prohibits initialization
  if (valueExists) {
    // If an initialization expression exists, an error is reported
    context.report({
      node: annotation,
      message: rule.messages.prohibitLocalInitialization,
      data: { decoratorName },
    });
  }
}

const rule: UISyntaxRule = {
  name: 'struct-variable-initialization',
  messages: {
    mustBeInitializedLocally: `The '{{decoratorName}}' property must be specified a default value.`,
    prohibitLocalInitialization: `The '{{decoratorName}}' property cannot be specified a default value.`
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