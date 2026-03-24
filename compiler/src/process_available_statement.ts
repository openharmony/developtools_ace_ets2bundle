/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { CurrentProcessFile, findNonNullType } from './utils';
import { API_AVAILABLE_FUNCTION_NAME, DEVICE_INFO_API_FILE_NAME, DISTRIBUTE_API_VERSION_FUNCTION_NAME, SDK_API_VERSION_FUNCTION_NAME } from './pre_define';

enum TransfromType {
  // 字符串格式
  STRING = 0,
  // 数值格式
  NUMBER = 1
}

/**
 * 点分版本保护接口转换入口
 * @param node 
 * @returns 
 */
export function processAvailableStatement(node: ts.CallExpression): ts.CallExpression | ts.BinaryExpression {
  if (ts.isCallExpression(node)) {
    const args: ts.NodeArray<ts.Expression> = node.arguments;
    if (!args || args.length !== 1) {
      return node;
    }
    const arg = args[0];
    if (ts.isNumericLiteral(arg)) {
      return transformAvailableStatement(node, arg, TransfromType.NUMBER);
    } else if (ts.isStringLiteral(arg)) {
      return transformAvailableStatement(node, arg, TransfromType.STRING);
    }
  }
  return node;
}

/**
 * 转换接口定义
 * @param node 
 * @param arg 
 * @param type 
 * @returns 
 */
function transformAvailableStatement(node: ts.CallExpression, arg: ts.Expression, type: TransfromType):
  ts.CallExpression | ts.BinaryExpression {
  if (!ts.isCallExpression(node)) {
    return node;
  }
  let expression: ts.CallExpression | ts.BinaryExpression = node;
  switch (type) {
    case TransfromType.NUMBER:
      expression = ts.factory.createBinaryExpression(
        ts.factory.createPropertyAccessExpression(
          node.expression.expression,
          ts.factory.createIdentifier(SDK_API_VERSION_FUNCTION_NAME)
        ),
        ts.factory.createToken(ts.SyntaxKind.GreaterThanEqualsToken),
        arg
      );
      break;
    case TransfromType.STRING:
      expression = ts.factory.createBinaryExpression(
        ts.factory.createPropertyAccessExpression(
          node.expression.expression,
          ts.factory.createIdentifier(DISTRIBUTE_API_VERSION_FUNCTION_NAME)
        ),
        ts.factory.createToken(ts.SyntaxKind.GreaterThanEqualsToken),
        ts.factory.createNumericLiteral(convertToXYZ(arg.getText()))
      );
      break;
  }
  return expression;
}

function convertToXYZ(version: string) {
  return version.replace(/\'/g, '').replace(/^(\d+)\.(\d+)\.(\d+)$/, (match, x, y, z) => {
    return x + y.padStart(2, '0') + z.padStart(2, '0');
  });
}

/**
 * 判断是否调用了apiAvailable判断接口
 * @param node 
 * @returns 
 */
export function isApiAvailableStatement(node: ts.CallExpression): boolean {
  const checker: ts.TypeChecker | undefined = CurrentProcessFile.getChecker();
  if (checker) {
    const type: ts.Type | ts.Type[] = findNonNullType(checker.getTypeAtLocation(node.expression));
    if (Array.isArray(type)) {
      return false;
    }
    if (type.symbol && type.symbol.valueDeclaration) {
      const symbolFileName: string = type.symbol.valueDeclaration.getSourceFile().fileName;
      // @ts-ignore
      const symbolName: string = type.symbol.valueDeclaration.name.escapedText.toString();
      if (symbolFileName.endsWith(DEVICE_INFO_API_FILE_NAME) && symbolName === API_AVAILABLE_FUNCTION_NAME) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 判断版本号是否为点分格式
 * @param version 版本号字符串
 */
export function isPointVersion(version: string): boolean {
  // MSF M位大于等于26
  const REG_MSF = /^\'?(?:2[6-9]|[3-9][0-9]|[1-9][0-9]{2})\.(?:[0-9]|[1-9][0-9]?)\.(?:[0-9]|[1-9][0-9]?)\'?$/;
  return REG_MSF.test(version);
}