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
import { DISTRIBUTE_API_VERSION_FUNCTION_NAME, SDK_API_VERSION_FUNCTION_NAME } from './pre_define';

/**
 * Process API Available calls and convert them into version comparison expressions
 * @param node Call Expression Node to process
 * @returns Transformed expression if it's an API Available statement, otherwise returns the original node
 */
export function processAvailableStatement(node: ts.CallExpression): ts.CallExpression | ts.BinaryExpression {
  if (ts.isCallExpression(node)) {
    const args: ts.NodeArray<ts.Expression> = node.arguments;
    if (!args || args.length !== 1) {
      return node;
    }
    const arg: ts.Expression = args[0];
    if (ts.isNumericLiteral(arg) || ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) {
      return transformAvailableStatement(node, arg);
    }
  }
  return node;
}

/**
 * Extract and validate the base expression from a call expression
 * Handles nested parenthesized expressions recursively
 * @param expression The expression to extract from
 * @return Extracted base expression or null if invalid
 */
function extractBaseExpression(expression: ts.Expression): ts.Identifier | null {
  let currentExpr: ts.Expression = expression;

  if (ts.isParenthesizedExpression(currentExpr) ||
    ts.isElementAccessExpression(currentExpr) ||
    ts.isNonNullExpression(currentExpr)) {
    currentExpr = extractBaseExpression(currentExpr.expression);
  } else if (ts.isPropertyAccessExpression(currentExpr)) {
    currentExpr = currentExpr.expression;
  }
  if (ts.isIdentifier(currentExpr)) {
    return currentExpr;
  }

  return null;
}

/**
 * Validate numeric version value
 * @param text Numeric text to validate
 * @return true if valid, false otherwise
 */
function isValidNumericVersion(text: string): boolean {
  if (!/^(?:[1-9]\d?)$/.test(text)) {
    return false;
  }
  const numValue: number = parseInt(text, 10);
  return !isNaN(numValue) && numValue > 0 && numValue < 26;
}

/**
 * Process and validate string version argument
 * @param arg String or template literal argument
 * @return Numeric literal or null if invalid
 */
function processStringVersionArg(arg: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral): ts.NumericLiteral | null {
  const versionText: string = arg.text;
  if (!versionText || versionText.trim() === '') {
    return null;
  }
  if (!isPointVersion(versionText)) {
    return null;
  }
  return ts.factory.createNumericLiteral(convertToDistributeVersion(versionText));
}

/**
 * Transform API Available call into a version comparison expression
 * @param node Call Expression Node
 * @param arg Version argument
 * @return Transformed expression
 */
function transformAvailableStatement(node: ts.CallExpression, arg: ts.Expression):
  ts.CallExpression | ts.BinaryExpression {
  if (!ts.isCallExpression(node)) {
    return node;
  }

  let apiVersionFunctionName: string = '';
  let processedArg: ts.Expression;

  if (ts.isNumericLiteral(arg)) {
    apiVersionFunctionName = SDK_API_VERSION_FUNCTION_NAME;
    if (!isValidNumericVersion(arg.getText())) {
      return node;
    }
    processedArg = arg;
  } else if (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) {
    apiVersionFunctionName = DISTRIBUTE_API_VERSION_FUNCTION_NAME;
    const numericLiteral: ts.NumericLiteral | null = processStringVersionArg(arg);
    if (!numericLiteral) {
      return node;
    }
    processedArg = numericLiteral;
  } else {
    return node;
  }

  const baseExpr: ts.Identifier | null = extractBaseExpression(node.expression);
  if (!baseExpr) {
    return node;
  }

  return ts.factory.createBinaryExpression(
    ts.factory.createPropertyAccessExpression(
      baseExpr,
      ts.factory.createIdentifier(apiVersionFunctionName)
    ),
    ts.factory.createToken(ts.SyntaxKind.GreaterThanEqualsToken),
    processedArg
  );
}

/**
 * Convert point based versions to numerical versions
 * @param version Pointwise Version String
 * @returns numerical version string
 */
function convertToDistributeVersion(version: string): string {
  return version.replace(/\'/g, '').replace(/^(\d+)\.(\d+)\.(\d+)(\(\d+\))?$/, (match, x, y, z) => {
    return x + y.padStart(2, '0') + z.padStart(2, '0');
  });
}

/**
 * Check if the version string is a point-based version (e.g., '26.0.0')
 * The first version number is greater than 26
 * @param version Version string to check
 * @return true if it's a point-based version, false otherwise
 */
export function isPointVersion(version: string): boolean {
  const REG_MSF = /^\'?(?:2[6-9]|[3-9][0-9]|[1-9][0-9]{2})\.(?:[0-9]|[1-9][0-9]?)\.(?:[0-9]|[1-9][0-9]?)(\(\d+\))?\'?$/;
  return REG_MSF.test(version);
}
