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
import { COMPONENT_REPEAT, getIdentifierName, PresetDecorators, TEMPLATE } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function initStructName(node: arkts.AstNode, reusableV2StructName: string[], reusableStructName: string[]): void {
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
    // Check that the current component has @Reusable and @ReusableV2 decorators
    if (annotationsList?.some((annotation: any) => annotation.expr.name === PresetDecorators.REUSABLE_V2)) {
      const struceName = childNode.definition?.ident?.name || '';
      reusableV2StructName.push(struceName);
    } else if (annotationsList?.some((annotation: any) => annotation.expr.name === PresetDecorators.REUSABLE_V1)) {
      const struceName = childNode.definition?.ident?.name || '';
      reusableStructName.push(struceName);
    }
  }
}

function reportNoReusableV2InRepeatTemplate(errorNode: arkts.AstNode, context: UISyntaxRuleContext): void {
  context.report({
    node: errorNode,
    message: rule.messages.noReusableV2InRepeatTemplate,
    fix: (errorNode) => {
      return {
        range: [errorNode.startPosition, errorNode.endPosition],
        code: '',
      };
    }
  });
}

function checkHasRepeatOrTemplate(node: arkts.CallExpression): { hasRepeat: boolean, hasTemplate: boolean } {
  let hasRepeat: boolean = false;
  let hasTemplate: boolean = false;
  while (arkts.isCallExpression(node) &&
    node.expression && arkts.isMemberExpression(node.expression) &&
    node.expression.object && arkts.isCallExpression(node.expression.object)) {
    if (arkts.isIdentifier(node.expression.property) && getIdentifierName(node.expression.property) === TEMPLATE) {
      hasTemplate = true;
    }
    node = node.expression.object;
  }
  if (arkts.isCallExpression(node) && arkts.isIdentifier(node.expression)) {
    hasRepeat = getIdentifierName(node.expression) === COMPONENT_REPEAT;
  }
  return { hasRepeat, hasTemplate };
}

function checkNoReusableV2InRepeatTemplate(
  node: arkts.AstNode,
  errorNode: arkts.AstNode,
  context: UISyntaxRuleContext
): boolean {
  if (!arkts.isCallExpression(node)) {
    return false;
  }
  const flag = checkHasRepeatOrTemplate(node);
  if (!flag.hasRepeat || !flag.hasTemplate) {
    return false;
  }
  reportNoReusableV2InRepeatTemplate(errorNode, context);
  return true;
}

function reportNoReusableV1InReusableV2(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  context.report({
    node: node,
    message: rule.messages.noReusableV1InReusableV2,
    fix: (node) => {
      return {
        range: [node.startPosition, node.endPosition],
        code: '',
      };
    }
  });
}

function checkNoReusableV1InReusableV2(
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
    if (annotationsList.some((annotation: any) => annotation.expr.name === PresetDecorators.REUSABLE_V2)) {
      reportNoReusableV1InReusableV2(node, context);
    }
  }
}

function reportNoReusableV2InReusableV1(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  context.report({
    node: node,
    message: rule.messages.noReusableV2InReusableV1,
    fix: (node) => {
      return {
        range: [node.startPosition, node.endPosition],
        code: '',
      };
    }
  });
}

function reportNoReusableV2InComponentV1(node: arkts.AstNode, context: UISyntaxRuleContext): void {
  context.report({
    node: node,
    message: rule.messages.noReusableV2InComponentV1,
    fix: (node) => {
      return {
        range: [node.startPosition, node.endPosition],
        code: '',
      };
    }
  });
}

function checkNestedReuseComponent(
  node: arkts.AstNode,
  context: UISyntaxRuleContext,
  reusableV2StructName: string[],
): void {
  if (!arkts.isCallExpression(node) || !arkts.isIdentifier(node.expression)) {
    return;
  }
  if (reusableV2StructName.includes(node.expression.name)) {
    // Traverse upwards to find the custom component.
    let struceNode: arkts.AstNode = node;
    let hasReportedError = false;
    while (!arkts.isStructDeclaration(struceNode)) {
      struceNode = struceNode.parent;
      if (!hasReportedError) {
        hasReportedError = checkNoReusableV2InRepeatTemplate(struceNode, node, context);
      }
    }
    // Gets a list of decorators for the current Struct
    const annotationsList = struceNode.definition.annotations;
    if (annotationsList?.some((annotation: any) => annotation.expr.name === PresetDecorators.REUSABLE_V1)) {
      reportNoReusableV2InReusableV1(node, context);
    } else if (annotationsList?.some((annotation: any) => annotation.expr.name === PresetDecorators.COMPONENT_V1)) {
      reportNoReusableV2InComponentV1(node, context);
    }
  }
}

const rule: UISyntaxRule = {
  name: 'nested-reuse-component-check',
  messages: {
    noReusableV2InComponentV1: `A custom component decorated with @Component cannot contain child components decorated with @ReusableV2.`,
    noReusableV2InReusableV1: `A custom component decorated with @Reusable cannot contain child components decorated with @ReusableV2.`,
    noReusableV1InReusableV2: `A custom component decorated with @ReusableV2 cannot contain child components decorated with @Reusable.`,
    noReusableV2InRepeatTemplate: `The template attribute of the Repeat component cannot contain any custom component decorated with @ReusableV2.`,
  },
  setup(context) {
    // Create arrays to store the components decorated with @ReusableV2 and @Reusable
    let reusableV2StructName: string[] = [];
    let reusableStructName: string[] = [];
    return {
      parsed: (node): void => {
        initStructName(node, reusableV2StructName, reusableStructName);
        checkNestedReuseComponent(node, context, reusableV2StructName);
        checkNoReusableV1InReusableV2(node, context, reusableStructName);
      },
    };
  },
};

export default rule;
