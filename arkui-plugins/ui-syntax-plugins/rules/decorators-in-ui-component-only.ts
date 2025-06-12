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

// Constants for allowed decorators on struct and within struct using PresetDecorators
const DECORATORS_ALLOWED_ON_STRUCT = [
  PresetDecorators.COMPONENT_V1,
  PresetDecorators.ENTRY,
  PresetDecorators.PREVIEW,
  PresetDecorators.CUSTOM_DIALOG,
  PresetDecorators.REUSABLE_V2,
];

const DECORATORS_ALLOWED_IN_STRUCT = [
  PresetDecorators.STATE,
  PresetDecorators.PROP,
  PresetDecorators.LINK,
  PresetDecorators.PROVIDE,
  PresetDecorators.CONSUME,
  PresetDecorators.OBJECT_LINK,
  PresetDecorators.STORAGE_LINK,
  PresetDecorators.STORAGE_PROP,
  PresetDecorators.LOCAL_STORAGE_LINK,
  PresetDecorators.LOCAL_STORAGE_PROP,
  PresetDecorators.WATCH,
  PresetDecorators.BUILDER_PARAM,
];

// Helper function to find the decorator in a ClassDeclaration and report errors.
function findInvalidDecorator(context: UISyntaxRuleContext, node: arkts.ClassDeclaration): void {
  node.definition!.annotations?.forEach(annotation => {
    if (annotation.expr && arkts.isIdentifier(annotation.expr) &&
      DECORATORS_ALLOWED_ON_STRUCT.includes(annotation.expr.name)) {
      reportDecoratorError(context, annotation, rule.messages.invalidDecoratorOnStruct);
    }
  });
}

// Rule 2: Check for 'decorator' on MethodDefinition
function checkinvalidDecoratorInStruct(context: UISyntaxRuleContext, node: arkts.MethodDefinition): void {
  node.scriptFunction.annotations?.forEach(annotation => {
    if (annotation.expr && arkts.isIdentifier(annotation.expr) &&
      DECORATORS_ALLOWED_IN_STRUCT.includes(annotation.expr.name)) {
      reportDecoratorError(context, annotation, rule.messages.invalidDecoratorInStruct);
    }
  });
};

// Rule 3: Check for 'decorator' on ClassProperty within a ClassDeclaration
function checkDecoratorOnClassProperty(context: UISyntaxRuleContext, node: arkts.ClassProperty,
  currentNode: arkts.AstNode): void {
  node.annotations?.forEach(annotation => {
    if (annotation.expr && arkts.isIdentifier(annotation.expr) &&
      DECORATORS_ALLOWED_IN_STRUCT.includes(annotation.expr.name)) {
      reportIfDecoratorInClassDeclaration(context, annotation, currentNode);
    }
  });
};

function reportIfDecoratorInClassDeclaration(context: UISyntaxRuleContext, annotation: arkts.AnnotationUsage,
  currentNode: arkts.AstNode): void {
  while (arkts.nodeType(currentNode) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    currentNode = currentNode.parent;
    if (annotation && arkts.isClassDeclaration(currentNode)) {
      reportDecoratorError(context, annotation, rule.messages.invalidDecoratorInStruct);
    }
  }
}

function reportDecoratorError(context: UISyntaxRuleContext, decorator: arkts.AnnotationUsage, message: string
): void {
  if (!decorator.expr || !arkts.isIdentifier(decorator.expr)) {
    return;
  }
  const decoratorName = decorator.expr.name;
  context.report({
    node: decorator,
    message: message,
    data: { decoratorName },
    fix: () => {
      const startPosition = decorator.startPosition;
      const endPosition = decorator.endPosition;
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

function checkDecoratorWithFunctionDeclaration(node: arkts.FunctionDeclaration, context: UISyntaxRuleContext): void {
  node.annotations?.forEach(annotation => {
    if (annotation.expr && arkts.isIdentifier(annotation.expr) &&
      DECORATORS_ALLOWED_ON_STRUCT.includes(annotation.expr.name)) {
      reportDecoratorError(context, annotation, rule.messages.invalidDecoratorOnStruct);
    }
    if (annotation.expr && arkts.isIdentifier(annotation.expr) &&
      DECORATORS_ALLOWED_IN_STRUCT.includes(annotation.expr.name)) {
      reportDecoratorError(context, annotation, rule.messages.invalidDecoratorInStruct);
    }
  });
}

const rule: UISyntaxRule = {
  name: 'decorators-in-ui-component-only',
  messages: {
    invalidDecoratorOnStruct: `The '@{{decoratorName}}' decorator can only be used with 'struct'.`,
    invalidDecoratorInStruct: `'@{{decoratorName}}' can not decorate the method.`,
  },
  setup(context) {
    return {
      parsed: (node: arkts.AstNode): void => {
        if (arkts.isFunctionDeclaration(node)) {
          checkDecoratorWithFunctionDeclaration(node, context);
        }
        if (arkts.isClassDeclaration(node)) {
          findInvalidDecorator(context, node);
        }
        if (arkts.isMethodDefinition(node)) {
          checkinvalidDecoratorInStruct(context, node);
        }
        let currentNode = node;
        if (arkts.isClassProperty(node)) {
          checkDecoratorOnClassProperty(context, node, currentNode);
        }
      },
    };
  },
};

export default rule;