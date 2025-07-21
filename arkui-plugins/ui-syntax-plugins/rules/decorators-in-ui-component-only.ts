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
import { PresetDecorators } from '../utils/index';

// Helper function to find the '@Component' decorator in a ClassDeclaration and report errors.
function findComponentDecorator(context: UISyntaxRuleContext, node: arkts.ClassDeclaration): void {
  const componentDecorator = node.definition?.annotations?.find(
    (annotation) =>
      annotation.expr &&
      arkts.isIdentifier(annotation.expr) &&
      annotation.expr.name === PresetDecorators.COMPONENT_V1
  );
  if (componentDecorator) {
    reportDecoratorError(context, componentDecorator, rule.messages.invalidComponentDecorator);
  }
}

// Helper function to find the '@Prop' decorator in a MethodDefinition or ClassProperty.
const findPropDecorator = (node: arkts.MethodDefinition | arkts.ClassProperty): arkts.AnnotationUsage | undefined => {
  const annotations = 'scriptFunction' in node ? node.scriptFunction.annotations : node.annotations;
  return annotations?.find(
    (annotation) =>
      annotation.expr && annotation.expr.dumpSrc() === PresetDecorators.PROP
  );
};

// Rule 2: Check for '@Prop' on MethodDefinition
function checkPropOnMethod(context: UISyntaxRuleContext, node: arkts.MethodDefinition): void {
  const propDecorator = findPropDecorator(node);
  if (propDecorator) {
    reportDecoratorError(context, propDecorator, rule.messages.propOnMethod);
  }
};

// Rule 3: Check for '@Prop' on ClassProperty within a ClassDeclaration
function checkPropOnClassProperty(context: UISyntaxRuleContext, node: arkts.ClassProperty, currentNode: arkts.AstNode)
  : void {
  const propDecorator = findPropDecorator(node);
  while (arkts.nodeType(currentNode) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    currentNode = currentNode.parent;
    if (propDecorator && arkts.isClassDeclaration(currentNode)) {
      reportDecoratorError(context, propDecorator, rule.messages.propOnMethod);
    }
  }
};

function reportDecoratorError(context: UISyntaxRuleContext, Decorator: arkts.AnnotationUsage, message: string
): void {
  context.report({
    node: Decorator,
    message: message,
    fix: () => {
      const startPosition = arkts.getStartPosition(Decorator);
      const endPosition = arkts.getEndPosition(Decorator);
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

const rule: UISyntaxRule = {
  name: 'no-prop-on-method',
  messages: {
    invalidComponentDecorator: `'@Component' can decorate only custom components.`,
    propOnMethod: `'@Prop' can decorate only member variables of custom components.`,
  },
  setup(context) {
    return {
      parsed: (node: arkts.AstNode): void => {
        if (arkts.isClassDeclaration(node)) {
          findComponentDecorator(context, node);
        }
        if (arkts.isMethodDefinition(node)) {
          checkPropOnMethod(context, node);
        }
        let currentNode = node;
        if (arkts.isClassProperty(node)) {
          checkPropOnClassProperty(context, node, currentNode);
        }
      },
    };
  },
};

export default rule;