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

function recordStructWithLinkDecorators(item: arkts.AstNode, structName: string, linkMap: Map<string, string>): void {
  if (!arkts.isClassProperty(item)) {
    return;
  }
  item.annotations?.forEach((annotation) => {
    const annotationName: string = annotation.expr?.dumpSrc() ?? '';
    if (annotationName === '') {
      return;
    }
    // If the node has properties decorated with Link or ObjectLink, record this structure node
    if (annotationName === PresetDecorators.LINK || annotationName === PresetDecorators.OBJECT_LINK) {
      linkMap.set(structName, annotationName);
    }
  });
}

function initMap(node: arkts.AstNode, linkMap: Map<string, string>): void {
  // Check if the current node is the root node
  if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    return;
  }
  node.getChildren().forEach((member) => {
    if (!arkts.isStructDeclaration(member)) {
      return;
    }
    const structName: string = member.definition.ident?.name ?? '';
    if (structName === '') {
      return;
    }
    member.definition?.body?.forEach((item) => {
      recordStructWithLinkDecorators(item, structName, linkMap);
    });
  });
}

function checkInitializeWithLiteral(node: arkts.AstNode, context: UISyntaxRuleContext,
  linkMap: Map<string, string>
): void {
  if (!arkts.isCallExpression(node)) {
    return;
  }
  const componentName = node.expression.dumpSrc();
  // Only assignments to properties decorated with Link or ObjectLink trigger rule checks
  if (!linkMap.has(componentName)) {
    return;
  }
  node.arguments.forEach((member) => {
    member.getChildren().forEach((property) => {
      if (!arkts.isProperty(property)) {
        return;
      }
      if (property.value === undefined) {
        return;
      }
      const propertyType: arkts.Es2pandaAstNodeType = arkts.nodeType(property.value);
      const key: string = property.key?.dumpSrc() ?? '';
      if (key === '') {
        return;
      }
      const value = property.value?.dumpSrc() ? property.value.dumpSrc() : '';
      // If the assignment statement is not of type MemberExpression, throw an error
      if (propertyType !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_MEMBER_EXPRESSION) {
        context.report({
          node: property,
          message: rule.messages.cannotInitializeWithLiteral,
          data: {
            value: value,
            annotationName: linkMap.get(componentName)!,
            key: key,
          },
        });
      }
    });
  });
}

const rule: UISyntaxRule = {
  name: 'construct-parameter-literal',
  messages: {
    cannotInitializeWithLiteral: `Assigning the attribute'{{value}}' to the '@{{annotationName}}' decorated attribute '{{key}}' is not allowed.`,
  },
  setup(context) {
    let linkMap: Map<string, string> = new Map();
    return {
      parsed: (node): void => {
        initMap(node, linkMap);
        checkInitializeWithLiteral(node, context, linkMap);
      },
    };
  },
};

export default rule;