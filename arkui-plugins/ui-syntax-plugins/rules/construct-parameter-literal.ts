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
import { getIdentifierName, PresetDecorators } from '../utils';

function recordStructWithLinkDecorators(item: arkts.AstNode, structName: string, linkMap: Map<string, string>): void {
  if (!arkts.isClassProperty(item)) {
    return;
  }
  item.annotations?.forEach((annotation) => {
    if (!annotation.expr) {
      return;
    }
    const annotationName: string = getIdentifierName(annotation.expr);
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
    if (!(arkts.isStructDeclaration(member))) {
      return;
    }
    if (!member.definition || !member.definition.ident || !arkts.isIdentifier(member.definition.ident)) {
      return;
    }
    const structName: string = member.definition.ident.name;
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
  if (!arkts.isCallExpression(node) || !arkts.isIdentifier(node.expression)) {
    return;
  }
  const componentName = node.expression.name;
  // Only assignments to properties decorated with Link or ObjectLink trigger rule checks
  if (!linkMap.has(componentName)) {
    return;
  }
  node.arguments.forEach((member) => {
    member.getChildren().forEach((property) => {
      if (!arkts.isProperty(property) || !property.key || !property.value) {
        return;
      }
      const key: string = getIdentifierName(property.key);
      if (key === '') {
        return;
      }
      // If the assignment statement is of type MemberExpression or Identifier, it is not judged
      if (arkts.isMemberExpression(property.value) && arkts.isThisExpression(property.value.object)) {
        return;
      }
      if (arkts.isIdentifier(property.value)) {
        return;
      }
      const initializerName = property.value.dumpSrc().replace(/\(this\)/g, 'this');
      const parameter: string = linkMap.get(componentName)!;
      context.report({
        node: property,
        message: rule.messages.initializerIsLiteral,
        data: {
          initializerName: initializerName,
          parameter: `@${parameter}`,
          parameterName: key,
        },
      });
    });
  });
}

const rule: UISyntaxRule = {
  name: 'construct-parameter-literal',
  messages: {
    initializerIsLiteral: `The 'regular' property '{{initializerName}}' cannot be assigned to the '{{parameter}}' property '{{parameterName}}'.`,
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