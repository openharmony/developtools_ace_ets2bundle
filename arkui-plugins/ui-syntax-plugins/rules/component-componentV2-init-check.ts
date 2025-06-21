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
import { getAnnotationUsage, getIdentifierName, hasAnnotation, PresetDecorators } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function initComponentV1WithLinkList(node: arkts.AstNode, componentV1WithLinkList: string[]): void {
  if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    return;
  }
  node.getChildren().forEach((member) => {
    if (!arkts.isStructDeclaration(member) || !member.definition.ident ||
      !hasAnnotation(member?.definition.annotations, PresetDecorators.COMPONENT_V1)) {
      return;
    }
    let structName: string = member.definition.ident?.name ?? '';
    member.definition?.body?.forEach((item) => {
      if (!arkts.isClassProperty(item) || !item.key) {
        return;
      }
      if (item.annotations.some(annotation => annotation.expr &&
        getIdentifierName(annotation.expr) === PresetDecorators.LINK)) {
        componentV1WithLinkList.push(structName);
      }
    });
  });
}

function checkComponentInitLink(
  node: arkts.AstNode,
  context: UISyntaxRuleContext,
  componentV1WithLinkList: string[]
): void {
  if (!arkts.isIdentifier(node) || !componentV1WithLinkList.includes(getIdentifierName(node))) {
    return;
  }
  if (!node.parent) {
    return;
  }
  let structNode = node.parent;
  while (!arkts.isStructDeclaration(structNode)) {
    if (!structNode.parent) {
      return;
    }
    structNode = structNode.parent;
  }
  if (getAnnotationUsage(structNode, PresetDecorators.COMPONENT_V2) !== undefined) {
    if (!node.parent) {
      return;
    }
    const parentNode = node.parent;
    context.report({
      node: parentNode,
      message: rule.messages.componentInitLinkCheck,
      fix: () => {
        return {
          range: [parentNode.startPosition, parentNode.endPosition],
          code: '',
        };
      }
    });
  }
}

const rule: UISyntaxRule = {
  name: 'component-componentV2-init-check',
  messages: {
    componentInitLinkCheck: `A V2 component cannot be used with any member property decorated by '@Link' in a V1 component.`,
  },
  setup(context) {
    // Decorated by component v1 and uses the link attribute
    let componentV1WithLinkList: string[] = [];
    return {
      parsed: (node): void => {
        initComponentV1WithLinkList(node, componentV1WithLinkList);
        checkComponentInitLink(node, context, componentV1WithLinkList);
      },
    };
  },
};

export default rule;