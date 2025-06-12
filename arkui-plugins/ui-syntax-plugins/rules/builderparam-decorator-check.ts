/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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
import { getIdentifierName, PresetDecorators, BUILD_NAME } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function getStructNameWithMultiplyBuilderParam(
  context: UISyntaxRuleContext,
  node: arkts.AstNode,
  structNameWithMultiplyBuilderParam: string[],
): void {
  if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    return;
  }
  node.getChildren().forEach((member) => {
    if (!arkts.isStructDeclaration(member) || !member.definition.ident) {
      return;
    }
    let count: number = 0;
    let structName: string = member.definition.ident?.name ?? '';
    member.definition?.body?.forEach((item) => {
      if (!arkts.isClassProperty(item) || !item.key) {
        return;
      }
      const hasBuilderParam = item.annotations.find(annotation =>
        annotation.expr && arkts.isIdentifier(annotation.expr) &&
        annotation.expr.name === PresetDecorators.BUILDER_PARAM
      );

      if (hasBuilderParam) {
        count++;
      }
    });
    if (count > 1) {
      structNameWithMultiplyBuilderParam.push(structName);
    }
  });
}

function isInBuild(node: arkts.AstNode): boolean {
  let structNode = node.parent;
  arkts.isMethodDefinition(structNode);
  while (!arkts.isMethodDefinition(structNode) || getIdentifierName(structNode.name) !== BUILD_NAME) {
    if (!structNode.parent) {
      return false;
    }
    structNode = structNode.parent;
  }
  return true;
}

function hasBlockStatement(node: arkts.AstNode): boolean {
  let parentNode = node.parent;
  const siblings = parentNode.getChildren();
  if (!Array.isArray(siblings) || siblings.length < 2) {
    return false;
  } else if (arkts.isStringLiteral(siblings[1]) && arkts.isBlockStatement(siblings[2])) {
    return true;
  } else if (arkts.isBlockStatement(siblings[1])) {
    return true;
  }
  return false;
}

function checkComponentInitialize(
  node: arkts.AstNode,
  context: UISyntaxRuleContext,
  structNameWithMultiplyBuilderParam: string[],
): void {
  if (!arkts.isIdentifier(node) || !structNameWithMultiplyBuilderParam.includes(getIdentifierName(node))) {
    return;
  }
  if (!hasBlockStatement(node)) {
    return;
  }
  let structName: string = getIdentifierName(node);
  let parentNode: arkts.AstNode = node.parent;
  if (!arkts.isCallExpression(parentNode)) {
    return;
  }
  let structNode = node.parent;
  while (!arkts.isStructDeclaration(structNode)) {
    if (!structNode.parent) {
      return;
    }
    structNode = structNode.parent;
  }
  if (!isInBuild(node)) {
    return;
  }
  context.report({
    node: node,
    message: rule.messages.onlyOneBuilderParamProperty,
    data: { structName },
  });
}



const rule: UISyntaxRule = {
  name: 'builderparam-decorator-check',
  messages: {
    onlyOneBuilderParamProperty: `In the trailing lambda case, '{{structName}}' must have one and only one property decorated with @BuilderParam, and its @BuilderParam expects no parameter.`,
  },
  setup(context) {
    let structNameWithMultiplyBuilderParam: string[] = [];

    return {
      parsed: (node): void => {
        getStructNameWithMultiplyBuilderParam(context, node, structNameWithMultiplyBuilderParam,);
        checkComponentInitialize(node, context, structNameWithMultiplyBuilderParam);
      },
    };
  },
};

export default rule;
