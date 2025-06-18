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

interface IdInfo {
  value: string;
  node: arkts.AstNode;
}

const ID_NAME: string = 'id';

function getIdValue(expression: arkts.CallExpression): string | undefined {
  let value: string | undefined;
  for (const argument of expression.arguments) {
    if (arkts.isStringLiteral(argument)) {
      value = argument.str;
      break;
    }
  }
  return value;
}

function getIdInfo(expression: arkts.CallExpression): IdInfo | undefined {

  if (!arkts.isMemberExpression(expression.expression)) {
    return undefined;
  }
  const member = expression.expression;
  if (!arkts.isIdentifier(member.property)) {
    return undefined;
  }
  const propertyName = getIdentifierName(member.property);
  if (propertyName !== ID_NAME) {
    return undefined;
  }
  let value: string | undefined = getIdValue(expression);
  if (!value) {
    return undefined;
  }
  const currentIdInfo: IdInfo = {
    value,
    node: member.property
  };
  return currentIdInfo;
}

function validateDuplicateId(
  currentIdInfo: IdInfo,
  usedIds: Map<string, IdInfo>,
  context: UISyntaxRuleContext,
): void {

  if (usedIds.has(currentIdInfo.value)) {
    context.report({
      node: currentIdInfo.node,
      message: rule.messages.duplicateId,
      data: {
        id: currentIdInfo.value,
        path: getPath() ?? '',
        line: currentIdInfo.node.startPosition.line().toString(),
        index: currentIdInfo.node.startPosition.index().toString()
      }
    });
  } else {
    // Otherwise, record it
    usedIds.set(currentIdInfo.value, currentIdInfo);
  }
}

function getPath(): string | undefined {
  const contextPtr = arkts.arktsGlobal.compilerContext?.peer;
  if (!!contextPtr) {
    let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
    return program.globalAbsName;
  }
  return undefined;
}

function findAndValidateIds(
  node: arkts.BlockStatement,
  usedIds: Map<string, IdInfo>,
  context: UISyntaxRuleContext
): void {
  node.statements.forEach((statement) => {
    if (
      arkts.isExpressionStatement(statement) &&
      arkts.isCallExpression(statement.expression)
    ) {
      const idInfo = getIdInfo(statement.expression);
      if (idInfo) {
        validateDuplicateId(idInfo, usedIds, context);
      }
    }
  });
}

const rule: UISyntaxRule = {
  name: 'no-duplicate-id',
  messages: {
    duplicateId: `The current component id "{{id}}" is duplicate with {{path}}:{{line}}:{{index}}.`,
  },
  setup(context) {
    const usedIds = new Map<string, IdInfo>();
    return {
      parsed(node): void {
        if (arkts.isBlockStatement(node)) {
          findAndValidateIds(node, usedIds, context);
        }
      }
    };
  },
};

export default rule;