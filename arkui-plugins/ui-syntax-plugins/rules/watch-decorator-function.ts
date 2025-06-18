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
import { getIdentifierName, isPrivateClassProperty, PresetDecorators, getClassPropertyName } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

function getExpressionValue(parameters: arkts.Expression, privateNames: string[]): string {
  const type = arkts.nodeType(parameters);
  if (type === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_NUMBER_LITERAL) {
    return parameters.dumpSrc(); // Try extracting the string representation with dumpSrc
  } else if (type === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_BOOLEAN_LITERAL) {
    return parameters.dumpSrc();
  } else if (type === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_NULL_LITERAL) {
    return 'null';
  } else if (type === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_UNDEFINED_LITERAL) {
    return 'undefined';
  } else if (arkts.isMemberExpression(parameters)) {
    if (arkts.isIdentifier(parameters.property)) {
      if (privateNames.includes(parameters.property.name)) {
        return parameters.property.name;
      }
    }
  }
  return parameters.dumpSrc(); // By default, an empty string is returned
}

// Gets the names of all methods in the struct
function getMethodNames(node: arkts.StructDeclaration): string[] {
  const methodNames: string[] = [];
  node.definition.body.forEach((member) => {
    if (arkts.isMethodDefinition(member) && arkts.isIdentifier(member.name)) {
      const methodName = getIdentifierName(member.name);
      if (methodName) {
        methodNames.push(methodName);
      }
    }
  });
  return methodNames;
}

function getPrivateNames(node: arkts.StructDeclaration): string[] {
  const privateNames: string[] = [];
  node.definition.body.forEach((member) => {
    if (arkts.isClassProperty(member) && isPrivateClassProperty(member)) {
      const privateName = getClassPropertyName(member);
      if (privateName) {
        privateNames.push(privateName);
      }
    }
  });
  return privateNames;
}

// Invalid @Watch decorator bugs are reported
function reportInvalidWatch(
  member: arkts.ClassProperty,
  parameterName: string,
  watchDecorator: arkts.AnnotationUsage,
  context: UISyntaxRuleContext
): void {
  context.report({
    node: watchDecorator,
    message: rule.messages.invalidWatch,
    data: { parameterName },
    fix: () => {
      const startPosition = member.endPosition;
      const endPosition = member.endPosition;
      return {
        range: [startPosition, endPosition],
        code: `\n${parameterName}(){\n}`,
      };
    },
  });
}

function reportStringOnly(
  parameters: arkts.Expression | undefined,
  privateNames: string[],
  watchDecorator: arkts.AnnotationUsage,
  context: UISyntaxRuleContext
): void {
  if (!parameters) {
    return;
  }
  context.report({
    node: watchDecorator,
    message: rule.messages.stringOnly,
    data: { parameterName: getExpressionValue(parameters, privateNames) },
    fix: () => {
      const startPosition = parameters.startPosition;
      const endPosition = parameters.endPosition;
      return {
        range: [startPosition, endPosition],
        code: ``,
      };
    },
  });
}

function validateWatchDecorator(
  member: arkts.ClassProperty,
  methodNames: string[],
  privateNames: string[],
  watchDecorator: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  member.annotations.forEach((annotation) => {
    validateWatchProperty(annotation, member, methodNames, privateNames, watchDecorator, context);
  });
}

function validateWatchProperty(
  annotation: arkts.AnnotationUsage,
  member: arkts.ClassProperty,
  methodNames: string[],
  privateNames: string[],
  watchDecorator: arkts.AnnotationUsage | undefined,
  context: UISyntaxRuleContext
): void {
  if (
    !annotation.expr ||
    !arkts.isIdentifier(annotation.expr) ||
    annotation.expr.name !== PresetDecorators.WATCH
  ) {
    return;
  }
  annotation.properties.forEach((element) => {
    if (!arkts.isClassProperty(element)) {
      return;
    }
    if (!element.value) {
      return;
    }
    if (!arkts.isStringLiteral(element.value)) {
      if (!watchDecorator) {
        return;
      }
      reportStringOnly(element.value, privateNames, watchDecorator, context);
      return;
    }
    const parameterName = element.value.str;
    if (watchDecorator && parameterName && !methodNames.includes(parameterName)) {
      reportInvalidWatch(member, parameterName, watchDecorator, context);
    }
  });

}

function validateWatch(
  node: arkts.StructDeclaration,
  methodNames: string[],
  privateNames: string[],
  context: UISyntaxRuleContext
): void {
  node.definition.body.forEach(member => {
    if (!arkts.isClassProperty(member)) {
      return;
    }
    const watchDecorator = member.annotations?.find(annotation =>
      annotation.expr && arkts.isIdentifier(annotation.expr) &&
      annotation.expr.name === PresetDecorators.WATCH
    );
    // Determine whether it contains @watch decorators
    validateWatchDecorator(member, methodNames, privateNames, watchDecorator, context);
  });
}

const rule: UISyntaxRule = {
  name: 'watch-decorator-function',
  messages: {
    invalidWatch: `'@watch' cannot be used with '{{parameterName}}'. Apply it only to parameters that correspond to existing methods.`,
    stringOnly: `'@Watch' cannot be used with '{{parameterName}}'. Apply it only to 'string' parameters.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        // Get all method names
        const methodNames = getMethodNames(node);
        // Get a private variable
        const privateNames = getPrivateNames(node);
        validateWatch(node, methodNames, privateNames, context);
      },
    };
  },
};

export default rule;