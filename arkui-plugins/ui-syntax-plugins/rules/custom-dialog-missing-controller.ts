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
import { getClassPropertyType, PresetDecorators, getAnnotationUsage } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

const CUSTOM_DIALOG_CONTROLLER: string = 'CustomDialogController';

function missingController(
  node: arkts.StructDeclaration,
  context: UISyntaxRuleContext
): void {
  // Check for the @CustomDialog decorator
  const hasCustomDialogDecorator = getAnnotationUsage(node, PresetDecorators.CUSTOM_DIALOG);
  const structName = node.definition.ident;
  if (!structName) {
    return;
  }
  // Check if there is an attribute of type CustomDialogController in the class
  let hasControllerProperty = false;
  node.definition.body.forEach((property) => {
    if (arkts.isClassProperty(property)) {
      const propertyType = getClassPropertyType(property);
      if (propertyType === CUSTOM_DIALOG_CONTROLLER) {
        hasControllerProperty = true;
      }
    }
  });
  if (!hasControllerProperty && hasCustomDialogDecorator) {
    context.report({
      node: structName,
      message: rule.messages.missingController,
    });
  }
}

const rule: UISyntaxRule = {
  name: 'custom-dialog-missing-controller',
  messages: {
    missingController: `The @CustomDialog decorated custom component must contain a property of the CustomDialogController type.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        missingController(node, context);
      },
    };
  },
};

export default rule;

