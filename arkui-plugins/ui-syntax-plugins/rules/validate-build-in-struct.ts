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
import { getIdentifierName } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

const NOT_PARAM_LENGTH: number = 0;
const BUILD_NAME: string = 'build';
const BUILD_FUNCTION_COUNT_INI: number = 0;
const BUILD_FUNCTION_COUNT: number = 1;
const NOT_STATEMENT_LENGTH: number = 0;

// rule1: Check if the build function contains arguments and report an error
function validateBuildFunctionParameters(buildFunction: arkts.MethodDefinition, context: UISyntaxRuleContext): void {
  const paramsNodes = buildFunction.scriptFunction.params;
  if (paramsNodes.length > NOT_PARAM_LENGTH) {
    paramsNodes.forEach((param) => {
      if (arkts.isEtsParameterExpression(param)) {
        reportBuildParamNotAllowed(param, context);
      }
    });
  }
}

// Report an error with an unallowed parameter in the build function
function reportBuildParamNotAllowed(
  param: arkts.ETSParameterExpression,
  context: UISyntaxRuleContext
): void {
  context.report({
    node: param,
    message: rule.messages.invalidComponet,
    fix: (param) => {
      const startPosition = arkts.getStartPosition(param);
      const endPosition = arkts.getEndPosition(param);
      return {
        range: [startPosition, endPosition],
        code: ''
      };
    }
  });
}

function validateConstructorForBuildFunction(
  node: arkts.StructDeclaration,
  member: arkts.MethodDefinition,
  buildFunctionCount: number,
  context: UISyntaxRuleContext
): void {
  const blockStatement = member.scriptFunction.body;
  if (!blockStatement || !arkts.isBlockStatement(blockStatement)) {
    return;
  }
  const statements = blockStatement.statements;
  const structName = node.definition.ident;
  if (buildFunctionCount !== BUILD_FUNCTION_COUNT &&
    statements.length === NOT_STATEMENT_LENGTH) {
    reportMissingBuildInStruct(structName, blockStatement, context);
  }
}

function reportMissingBuildInStruct(
  structName: arkts.Identifier | undefined,
  blockStatement: arkts.BlockStatement,
  context: UISyntaxRuleContext
): void {
  if (!structName) {
    return;
  }
  context.report({
    node: structName,
    message: rule.messages.invalidBuild,
    fix: (structName) => {
      const startPosition = arkts.getStartPosition(blockStatement);
      const endPosition = startPosition;
      return {
        range: [startPosition, endPosition],
        code: '{\nbuild {\n}'
      };
    }
  });
}

function validateBuild(
  node: arkts.StructDeclaration,
  buildFunctionCount: number,
  context: UISyntaxRuleContext,
): void {
  node.definition.body.forEach((member) => {
    // Check if the member is defined for the method and the method name is 'build'
    if (arkts.isMethodDefinition(member) && getIdentifierName(member.name) === BUILD_NAME) {
      buildFunctionCount++;
      validateBuildFunctionParameters(member, context);
    }
    // rule2: This rule validates the use of the 'build' function
    if (arkts.isMethodDefinition(member) &&
      arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR === member.kind) {
      validateConstructorForBuildFunction(node, member, buildFunctionCount, context);
    }
  });
}

const rule: UISyntaxRule = {
  name: 'validate-build-in-struct',
  messages: {
    invalidComponet: `A custom component can have only one 'build' function, which does not require parameters.`,
    invalidBuild: `This rule validates the use of the 'build' function`,
  },
  setup(context) {
    return {
      parsed: (node: arkts.AstNode): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        let buildFunctionCount: number = BUILD_FUNCTION_COUNT_INI;
        validateBuild(node, buildFunctionCount, context);
      },
    };
  },
};

export default rule;