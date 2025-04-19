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
import { getClassPropertyName, isPrivateClassProperty } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

let privateMap: Map<string, string[]> = new Map();

function addProperty(item: arkts.AstNode, structName: string): void {
  if (!arkts.isClassProperty(item) || !isPrivateClassProperty(item)) {
    return;
  }
  // Check if structName already exists in privateMap
  if (privateMap.has(structName)) {
    // If it exists, retrieve the current string[] and append the new content
    privateMap.get(structName)?.push(getClassPropertyName(item));
  } else {
    // If it doesn't exist, create a new string[] and add the content
    privateMap.set(structName, [getClassPropertyName(item)]);
  }
}

function checkPrivateVariables(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  // Check if the current node is the root node
  if (arkts.nodeType(node) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    node.getChildren().forEach((member) => {
      if (!arkts.isStructDeclaration(member)) {
        return;
      }
      const structName: string = member.definition.ident?.name ?? '';
      member.definition?.body?.forEach((item) => {
        addProperty(item, structName);
      });
    });
  }
  if (!arkts.isCallExpression(node)) {
    return;
  }
  const componentName = node.expression.dumpSrc();
  // If the initialization is for a component with private properties
  if (!privateMap.has(componentName)) {
    return;
  }
  node.arguments?.forEach((member) => {
    member.getChildren().forEach((property) => {
      if (!arkts.isProperty(property)) {
        return;
      }
      const propertyName: string = property.key?.dumpSrc() ?? '';
      if (privateMap.get(componentName)!.includes(propertyName)) {
        context.report({
          node: property,
          message: rule.messages.cannotInitializePrivateVariables,
          data: {
            propertyName: propertyName,
          },
        });
      }
    });
  });
}

const rule: UISyntaxRule = {
  name: 'check-construct-private-parameter',
  messages: {
    cannotInitializePrivateVariables: `Property '{{propertyName}}' is private and can not be initialized through the component constructor.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        checkPrivateVariables(node, context);
      },
    };
  },
};

export default rule;