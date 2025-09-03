/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
import { BUILDER_PARAM_PROXY_INTEROP } from './pre_define';

function processObjectLiteral(properties: ts.ObjectLiteralElementLike[], node: ts.ParenthesizedExpression): void {
  const list = (node.expression as ts.CommaListExpression).elements;
  list.forEach(node => {
    if (ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left)) {
      const keyName = node.left.name.text;
      if (ts.isPropertyAccessExpression(node.right) && node.right.expression.kind === ts.SyntaxKind.ThisKeyword) {
        const name = node.right.name.text;
        properties.push(ts.factory.createPropertyAssignment(
          keyName,
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createParenthesizedExpression(ts.factory.createConditionalExpression(
              ts.factory.createElementAccessExpression(
                ts.factory.createThis(),
                ts.factory.createStringLiteral('__' + name)
              ),
              ts.factory.createToken(ts.SyntaxKind.QuestionToken),
              ts.factory.createElementAccessExpression(
                ts.factory.createThis(),
                ts.factory.createStringLiteral('__' + name)
              ),
              ts.factory.createToken(ts.SyntaxKind.ColonToken),
              ts.factory.createElementAccessExpression(
                ts.factory.createThis(),
                ts.factory.createStringLiteral(name)
              )
            ))
          )
        ));
      } else {
        properties.push(ts.factory.createPropertyAssignment(
          keyName,
          node.right
        ));
      }
    }
  });
}

export function updateInteropObjectLiteralxpression(origin: ts.CallExpression, newNode:ts.Expression, name: string): ts.ExpressionStatement {
  const properties: ts.ObjectLiteralElementLike[] = [];
  processObjectLiteral(properties, origin.arguments[0] as ts.ParenthesizedExpression);
  return ts.factory.createExpressionStatement(ts.factory.updateCallExpression(
    origin,
    newNode,
    undefined,
    [ts.factory.createCallExpression(
      ts.factory.createIdentifier(BUILDER_PARAM_PROXY_INTEROP),
      undefined,
      [
        ts.factory.createStringLiteral(name),
        ts.factory.createObjectLiteralExpression(properties),
        makeArrow(origin.arguments[0] as ts.ParenthesizedExpression)
      ]
    )]
  ));
}

function makeArrow(node: ts.ParenthesizedExpression): ts.ArrowFunction {
  return ts.factory.createArrowFunction(
    undefined,
    undefined,
    [],
    undefined,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    node
  );
}