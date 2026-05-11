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
 * Transform expression by replacing 'available' method with version property
 * This method recursively traverses the expression tree and creates new nodes
 * @param expression The expression to transform
 * @param apiVersionFunctionName The target version property name (sdkApiVersion or distributionOSApiVersion)
 * @return Transformed expression
 */
function transformExpression(
  expression: ts.Expression,
  apiVersionFunctionName: string
): ts.Expression | null {
  if (ts.isNonNullExpression(expression)) {
    // Handle non-null assertion - preserve and apply to transformed expression
    const transformed = transformExpression(expression.expression, apiVersionFunctionName);
    if (!transformed) {
      return null;
    }
    return ts.factory.createNonNullExpression(transformed);
  } else if (ts.isParenthesizedExpression(expression)) {
    // Handle parenthesized expression - preserve and apply to transformed expression
    const transformed = transformExpression(expression.expression, apiVersionFunctionName);
    if (!transformed) {
      return null;
    }
    return ts.factory.createParenthesizedExpression(transformed);
  } else if (ts.isPropertyAccessExpression(expression)) {
    // Handle property access expression
    return transformPropertyAccessExpression(expression, apiVersionFunctionName);
  } else if (ts.isElementAccessExpression(expression)) {
    // Handle element access expression
    return transformElementAccessExpression(expression, apiVersionFunctionName);
  } else {
    // Other expression types are not handled
    return null;
  }
}

/**
 * Transform property access expression by replacing 'available' with version property name
 * Supports both regular property access and optional chaining
 * @param expression The property access expression to transform
 * @param apiVersionFunctionName The target version property name
 * @return Transformed property access expression or null if transformation fails
 */
function transformPropertyAccessExpression(
  expression: ts.PropertyAccessExpression,
  apiVersionFunctionName: string
): ts.Expression | null {
  if (ts.isPropertyAccessChain(expression)) {
    return ts.factory.createPropertyAccessChain(
      expression.expression,
      expression.questionDotToken,
      apiVersionFunctionName
    );
  }
  return ts.factory.createPropertyAccessExpression(
    expression.expression,
    apiVersionFunctionName
  );
}

/**
 * Transform element access expression by replacing 'available' with version property name
 * Supports both regular element access and optional chaining
 * @param expression The element access expression to transform
 * @param apiVersionFunctionName The target version property name
 * @return Transformed element access expression or null if transformation fails
 */
function transformElementAccessExpression(
  expression: ts.ElementAccessExpression,
  apiVersionFunctionName: string
): ts.Expression | null {
  if (ts.isElementAccessChain(expression)) {
    return ts.factory.createElementAccessChain(
      expression.expression,
      expression.questionDotToken,
      ts.factory.createStringLiteral(apiVersionFunctionName)
    );
  }
  return ts.factory.createElementAccessExpression(
    expression.expression,
    ts.factory.createStringLiteral(apiVersionFunctionName)
  );
}

/**
 * Validate numeric version value
 *
 * @param text Numeric text to validate
 * @return true if valid (1-25), false otherwise
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
  const convertVersion: number = Number(convertToDistributeVersion(versionText));
  if (isNaN(convertVersion)) {
    return null;
  }
  return ts.factory.createNumericLiteral(convertVersion);
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

  const transformedExpr: ts.Expression | null = transformExpression(node.expression, apiVersionFunctionName);
  if (!transformedExpr) {
    return node;
  }

  // Create binary comparison expression
  const binaryExpr = ts.factory.createBinaryExpression(
    transformedExpr,
    ts.factory.createToken(ts.SyntaxKind.GreaterThanEqualsToken),
    processedArg
  );

  return binaryExpr;
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
  const REG_MSF = /^\'?(?:2[6-9]|[3-9][0-9])\.(?:[0-9]|[1-9][0-9]?)\.(?:[0-9]|[1-9][0-9]?)(\(\d+\))?\'?$/;
  return REG_MSF.test(version);
}
