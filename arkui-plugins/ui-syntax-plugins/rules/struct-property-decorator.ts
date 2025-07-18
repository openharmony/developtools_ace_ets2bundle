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
import { getClassPropertyAnnotationNames } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function checkInvalidStaticPropertyDecorations(context: UISyntaxRuleContext, node: arkts.StructDeclaration): void {
  node.definition.body.forEach((member) => {
    // Errors are reported when the node type is ClassProperty,
    if (arkts.isClassProperty(member)) {
      const propertyNameNode = member.key;
      if ((member.isStatic && getClassPropertyAnnotationNames(member).length > 0) && propertyNameNode) {
        context.report({
          node: propertyNameNode,
          message: rule.messages.invalidStaticUsage
        });
      }
    }
  });
}

const rule: UISyntaxRule = {
  name: 'struct-property-decorator',
  messages: {
    invalidStaticUsage: `Static variables in custom components cannot be decorated by built-in variable decorators.`
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        checkInvalidStaticPropertyDecorations(context, node);
      },
    };
  },
};

export default rule;