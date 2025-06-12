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

function initStructName(node: arkts.AstNode, reusableStructName: string[]): void {
  if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    return;
  }
  //Go through all the children of Program
  for (const childNode of node.getChildren()) {
    // Check whether the type is struct
    if (!arkts.isStructDeclaration(childNode)) {
      return;
    }
    // Get a list of annotations
    const annotationsList = childNode.definition.annotations;
    // Check that the current component has @Reusable decorators
    if (annotationsList?.some((annotation: any) => annotation.expr.name === PresetDecorators.REUSABLE_V1)) {
      const struceName = childNode.definition?.ident?.name || '';
      reusableStructName.push(struceName);
    }
  }
}

function reportNoReusableV1InComponentV2(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  context.report({
    node: node,
    message: rule.messages.noReusableV1InComponentV2,
    fix: (node) => {
      return {
        range: [node.startPosition, node.endPosition],
        code: '',
      };
    }
  });
}

function checkNoReusableV1InComponentV2(
  node: arkts.AstNode,
  context: UISyntaxRuleContext,
  reusableStructName: string[]
): void {
  if (!arkts.isCallExpression(node) || !arkts.isIdentifier(node.expression)) {
    return;
  }
  if (reusableStructName.includes(node.expression.name)) {
    // Traverse upwards to find the custom component.
    let struceNode: arkts.AstNode = node;
    while (!arkts.isStructDeclaration(struceNode)) {
      struceNode = struceNode.parent;
    }
    const annotationsList = struceNode.definition.annotations;
    // Check that the current component is decorated by the @ComponentV2 decorator
    if (annotationsList?.some((annotation: any) => annotation.expr.name === PresetDecorators.COMPONENT_V2)) {
      reportNoReusableV1InComponentV2(node, context);
    }
  }
}

const rule: UISyntaxRule = {
  name: 'reusable-component-in-V2-check',
  messages: {
    noReusableV1InComponentV2: `When a custom component is decorated with @ComponentV2 and contains a child component decorated with @Reusable, the child component will not create.`,
  },
  setup(context) {
    // Create an array to store custom components that are modified using the @Reusable decorator
    const reusableStructName: string[] = [];
    return {
      parsed: (node): void => {
        initStructName(node, reusableStructName);
        checkNoReusableV1InComponentV2(node, context, reusableStructName);
      },
    };
  },
};

export default rule;
