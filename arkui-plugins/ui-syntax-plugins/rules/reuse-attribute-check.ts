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
import { PresetDecorators, getAnnotationUsage, ReuseConstants } from '../utils';

function findStructsWithReusableAndComponentV2(node: arkts.AstNode, reusableV2ComponentV2Struct: string[]): void {
  //Go through all the children of Program
  for (const childNode of node.getChildren()) {
    // Check whether the type is struct
    if (!arkts.isStructDeclaration(childNode)) {
      continue;
    }
    // Check that the current component has @ComponentV2 and @ReusableV2 decorators
    const hasReusableV2Decorator = getAnnotationUsage(childNode, PresetDecorators.REUSABLE_V2);
    const hasComponentV2Decorator = getAnnotationUsage(childNode, PresetDecorators.COMPONENT_V2);
    if (hasReusableV2Decorator && hasComponentV2Decorator) {
      const struceName = childNode.definition?.ident?.name ?? '';
      reusableV2ComponentV2Struct.push(struceName);
    }
  }
}

function validateReuseOrReuseIdUsage(context: UISyntaxRuleContext, node: arkts.MemberExpression,
  reusableV2ComponentV2Struct: string[]): void {
  const structNode = node.object;
  // Gets the reuse or reuseId attribute
  const decoratedNode = node.property;
  if (arkts.isCallExpression(structNode)) {
    const Node = structNode.expression;
    if (arkts.isIdentifier(Node) && arkts.isIdentifier(decoratedNode)) {
      if (decoratedNode.name === ReuseConstants.REUSE && !reusableV2ComponentV2Struct.includes(Node.name)) {
        reportInvalidReuseUsage(context, node, decoratedNode, rule);
      }
      else if (decoratedNode.name === ReuseConstants.REUSE_ID && reusableV2ComponentV2Struct.includes(Node.name)) {
        reportInvalidReuseIdUsage(context, node, decoratedNode, rule);
      }
    }
  }
}

function reportInvalidReuseUsage(context: UISyntaxRuleContext, node: arkts.AstNode, structNode: arkts.AstNode,
  rule: any): void {
  context.report({
    node: node,
    message: rule.messages.invalidReuseUsage,
    fix: () => {
      const startPosition = structNode.startPosition;
      const endPosition = structNode.endPosition;
      return {
        range: [startPosition, endPosition],
        code: ReuseConstants.REUSE_ID,
      };
    },
  });
}

function reportInvalidReuseIdUsage(context: UISyntaxRuleContext, node: arkts.AstNode, structNode: arkts.AstNode,
  rule: any): void {
  context.report({
    node: node,
    message: rule.messages.invalidReuseIdUsage,
    fix: () => {
      const startPosition = structNode.startPosition;
      const endPosition = structNode.endPosition;
      return {
        range: [startPosition, endPosition],
        code: ReuseConstants.REUSE,
      };
    },
  });
}

const rule: UISyntaxRule = {
  name: 'reuse-attribute-check',
  messages: {
    invalidReuseUsage: `The reuse attribute is only applicable to custom components decorated with both @ComponentV2 and @ReusableV2.`,
    invalidReuseIdUsage: `The reuseId attribute is not applicable to custom components decorated with both @ComponentV2 and @ReusableV2.`,
  },
  setup(context) {
    const reusableV2ComponentV2Struct: string[] = [];
    return {
      parsed: (node): void => {
        // Check whether the type is "Program"
        if (arkts.nodeType(node) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
          findStructsWithReusableAndComponentV2(node, reusableV2ComponentV2Struct);
        }
        if (arkts.isMemberExpression(node)) {
          validateReuseOrReuseIdUsage(context, node, reusableV2ComponentV2Struct);
        }
      },
    };
  },
};

export default rule;