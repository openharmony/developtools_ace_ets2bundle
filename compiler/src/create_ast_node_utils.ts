/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import ts from 'typescript';

import {
  ELMTID,
  FINALIZE_CONSTRUCTION
} from './pre_define';

function createParameterDeclaration(name: string): ts.ParameterDeclaration {
  let initializer: ts.Expression;
  if (name === ELMTID) {
    initializer = ts.factory.createPrefixUnaryExpression(
      ts.SyntaxKind.MinusToken, ts.factory.createNumericLiteral('1'));
  }
  return ts.factory.createParameterDeclaration(undefined, undefined,
    ts.factory.createIdentifier(name), undefined, undefined, initializer);
}

function createFinalizeConstruction(): ts.Statement {
  return ts.factory.createExpressionStatement(ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createThis(),
      ts.factory.createIdentifier(FINALIZE_CONSTRUCTION)
    ),
    undefined,
    []
  ));
}

export default {
  createParameterDeclaration: createParameterDeclaration,
  createFinalizeConstruction: createFinalizeConstruction
};
