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
import { projectConfig } from '../main';
import { RUNTIME_OS_OH } from './fast_build/system_api/api_check_define';

const MOCK_FUNCTION_NAME = '__mockApiAvailable';
const TARGET_FUNCTION_NAME = 'apiAvailable';

/**
 * Process API Available calls and references, converting them to mock function calls or closures.
 * @param node Node to process
 * @returns Transformed node if it's an API Available statement, undefined otherwise
 */
export function processAvailableStatement(node: ts.Node): ts.Node | undefined {
  if (ts.isCallExpression(node)) {
    return transformCallExpression(node);
  }
  if (ts.isPropertyAccessExpression(node) && node.name.text === TARGET_FUNCTION_NAME) {
    return transformReference(node);
  }
  return undefined;
}

function transformCallExpression(node: ts.CallExpression): ts.Node | undefined {
  if (!isApiAvailableExpression(node.expression)) {
    return undefined;
  }

  const chain = extractCallChain(node.expression);
  if (!chain) {
    return undefined;
  }

  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(MOCK_FUNCTION_NAME),
    undefined,
    [chain, ...node.arguments]
  );
}

function isUnderTypeOfExpression(node: ts.Node): boolean {
  let current = node.parent;
  while (current) {
    if (ts.isTypeOfExpression(current)) {
      return true;
    }
    if (ts.isParenthesizedExpression(current) || ts.isNonNullExpression(current) ||
      ts.isAsExpression(current) || ts.isTypeAssertionExpression(current)) {
      current = current.parent;
      continue;
    }
    break;
  }
  return false;
}

function isAssignmentTarget(node: ts.Node): boolean {
  let current: ts.Node = node;
  while (current.parent && (ts.isParenthesizedExpression(current.parent) || ts.isNonNullExpression(current.parent) ||
    ts.isAsExpression(current.parent) || ts.isTypeAssertionExpression(current.parent))) {
    current = current.parent;
  }
  return !!(current.parent && ts.isBinaryExpression(current.parent) && current.parent.left === current &&
    current.parent.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
    current.parent.operatorToken.kind <= ts.SyntaxKind.LastAssignment);
}

function transformReference(node: ts.Node): ts.Node | undefined {
  if (node.parent && ts.isCallExpression(node.parent) && node.parent.expression === node) {
    return undefined;
  }

  if (isAssignmentTarget(node)) {
    return undefined;
  }

  if (isUnderTypeOfExpression(node)) {
    return undefined;
  }

  const chain = extractCallChain(node);
  if (!chain) {
    return undefined;
  }

  return ts.factory.createParenthesizedExpression(createClosureArrowFunction(chain));
}

function isApiAvailableExpression(expr: ts.Expression): boolean {
  if (ts.isNonNullExpression(expr) || ts.isParenthesizedExpression(expr) ||
    ts.isAsExpression(expr) || ts.isTypeAssertionExpression(expr)) {
    return isApiAvailableExpression(expr.expression);
  }
  if (ts.isPropertyAccessExpression(expr)) {
    return expr.name.text === TARGET_FUNCTION_NAME;
  }
  return false;
}

function extractCallChain(node: ts.Node): ts.Expression | null {
  if (ts.isPropertyAccessExpression(node)) {
    if (node.name.text === TARGET_FUNCTION_NAME) {
      return cloneExpression(node.expression);
    }
    if (node.questionDotToken) {
      return ts.factory.createPropertyAccessChain(
        extractCallChain(node.expression),
        node.questionDotToken,
        node.name
      );
    }
    return ts.factory.createPropertyAccessExpression(
      extractCallChain(node.expression),
      node.name
    );
  }
  if (ts.isElementAccessExpression(node)) {
    if (ts.isStringLiteral(node.argumentExpression) && node.argumentExpression.text === TARGET_FUNCTION_NAME) {
      return cloneExpression(node.expression);
    }
    if (node.questionDotToken) {
      return ts.factory.createElementAccessChain(
        extractCallChain(node.expression),
        node.questionDotToken,
        node.argumentExpression
      );
    }
    return ts.factory.createElementAccessExpression(
      extractCallChain(node.expression),
      node.argumentExpression
    );
  }
  if (ts.isNonNullExpression(node)) {
    return extractCallChain(node.expression);
  }
  if (ts.isParenthesizedExpression(node)) {
    return ts.factory.createParenthesizedExpression(
      extractCallChain(node.expression)
    );
  }
  if (ts.isAsExpression(node)) {
    return ts.factory.createAsExpression(
      extractCallChain(node.expression),
      node.type
    );
  }
  if (ts.isTypeAssertionExpression(node)) {
    return ts.factory.createTypeAssertion(
      node.type,
      extractCallChain(node.expression)
    );
  }
  if (ts.isIdentifier(node)) {
    return ts.factory.createIdentifier(node.text);
  }
  return node as ts.Expression;
}

function cloneExpression(node: ts.Expression): ts.Expression {
  if (ts.isPropertyAccessExpression(node)) {
    if (node.questionDotToken) {
      return ts.factory.createPropertyAccessChain(
        cloneExpression(node.expression),
        node.questionDotToken,
        node.name
      );
    }
    return ts.factory.createPropertyAccessExpression(
      cloneExpression(node.expression),
      node.name
    );
  }
  if (ts.isElementAccessExpression(node)) {
    if (node.questionDotToken) {
      return ts.factory.createElementAccessChain(
        cloneExpression(node.expression),
        node.questionDotToken,
        node.argumentExpression
      );
    }
    return ts.factory.createElementAccessExpression(
      cloneExpression(node.expression),
      node.argumentExpression
    );
  }
  if (ts.isNonNullExpression(node)) {
    return ts.factory.createNonNullExpression(
      cloneExpression(node.expression)
    );
  }
  if (ts.isParenthesizedExpression(node)) {
    return ts.factory.createParenthesizedExpression(
      cloneExpression(node.expression)
    );
  }
  if (ts.isAsExpression(node)) {
    return ts.factory.createAsExpression(
      cloneExpression(node.expression),
      node.type
    );
  }
  if (ts.isTypeAssertionExpression(node)) {
    return ts.factory.createTypeAssertion(
      node.type,
      cloneExpression(node.expression)
    );
  }
  if (ts.isIdentifier(node)) {
    return ts.factory.createIdentifier(node.text);
  }
  return node;
}

function createClosureArrowFunction(chain: ts.Expression): ts.ArrowFunction {
  const paramName = generateUniqueParamName(chain);
  const versionParam = ts.factory.createIdentifier(paramName);
  const mockCall = ts.factory.createCallExpression(
    ts.factory.createIdentifier(MOCK_FUNCTION_NAME),
    undefined,
    [cloneExpression(chain), versionParam]
  );

  return ts.factory.createArrowFunction(
    undefined,
    undefined,
    [ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      versionParam
    )],
    undefined,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    mockCall
  );
}

function generateUniqueParamName(chain: ts.Expression): string {
  const usedNames = new Set<string>();
  collectIdentifiers(chain, usedNames);
  if (!usedNames.has('v')) {
    return 'v';
  }
  let i = 0;
  while (usedNames.has('v' + i)) {
    i++;
  }
  return 'v' + i;
}

function collectIdentifiers(node: ts.Node, names: Set<string>): void {
  if (ts.isIdentifier(node)) {
    names.add(node.text);
  }
  ts.forEachChild(node, child => collectIdentifiers(child, names));
}

/**
 * Create the __mockApiAvailable helper function declaration.
 *
 * param e - sdkModule, must be truthy otherwise return false
 * param t - version, supports number or string format
 *
 * Number version:
 *   - Range: [1, 25], must be integer
 *   - Compare: e.sdkApiVersion >= t
 *
 * String version (semantic versioning "major.minor.patch" or "major.minor.patch(OHVersion)"):
 *   - When isOH = true (OpenHarmony):
 *     * Major version must be >= 26
 *     * OHVersion number is not allowed
 *     * Regex: /^(2[6-9]|[3-9]\d)\.(0|[1-9]\d{0,1})\.(0|[1-9]\d{0,1})$/
 *   - When isOH = false (non-OpenHarmony):
 *     * Major version: [1, 99]
 *     * OHVersion number is optional, but rejected when major >= 26
 *     * Regex: /^([1-9]\d{0,1})\.(0|[1-9]\d{0,1})\.(0|[1-9]\d{0,1})(\(([1-9]\d{0,1})\))?$/
 *   - Parsed as numeric version: 10000 * major + 100 * minor + patch
 *   - Compare: e.distributionOSApiVersion >= parsed version
 * Generates:
 * (isOH = true )
 *  function __mockApiAvailable(sdkModule, version) {
 *    if (!sdkModule) {
 *        return false;
 *    }
 *    if (typeof version === 'number') {
 *        if (version < 1 || version > 25 || !Number.isInteger(version)) {
 *            return false;
 *        }
 *        return sdkModule.sdkApiVersion >= version;
 *    }
 *    if (typeof version === 'string') {
 *        var match = version.match(/^(2[6-9]|[3-9]\d)\.(0|[1-9]\d{0,1})\.(0|[1-9]\d{0,1})$/);
 *        if (!match) {
 *            return false;
 *        }
 *        var major = Number(match[1]);
 *        var minor = Number(match[2]);
 *        var patch = Number(match[3]);
 *        var build = 10000 * major + 100 * minor + patch;
 *        return sdkModule.distributionOSApiVersion >= build;
 *    }
 *    return false;
 *  }
 *
 * (isOH = false )
 *  function __mockApiAvailable(sdkModule, version) {
 *    if (!sdkModule) {
 *        return false;
 *    }
 *    if (typeof version === 'number') {
 *        if (version < 1 || version > 25 || !Number.isInteger(version)) {
 *            return false;
 *        }
 *        return sdkModule.sdkApiVersion >= version;
 *    }
 *    if (typeof version === 'string') {
 *        var match = version.match(/^([1-9]\d{0,1})\.(0|[1-9]\d{0,1})\.(0|[1-9]\d{0,1})(\(([1-9]\d{0,1})\))?$/);
 *        if (!match) {
 *            return false;
 *        }
 *        var major = Number(match[1]);
 *        var minor = Number(match[2]);
 *        var patch = Number(match[3]);
 *        // 主版本号 >= 26 时不允许带构建号
 *        if (major >= 26 && match[4]) {
 *            return false;
 *        }
 *        var build = 10000 * major + 100 * minor + patch;
 *        return sdkModule.distributionOSApiVersion >= build;
 *    }
 *    return false;
 *  }
 */
export function createHelperFunctionDeclaration(): ts.FunctionDeclaration {
  const isOH = projectConfig.runtimeOS === RUNTIME_OS_OH;
  const varDecl = isOH ? 'r, s' : 'r, s, i';
  const regexOH = isOH ?
    '^(2[6-9]|[3-9]\\d)\\.(0|[1-9]\\d{0,1})\\.(0|[1-9]\\d{0,1})$' :
    '^([1-9]\\d{0,1})\\.(0|[1-9]\\d{0,1})\\.(0|[1-9]\\d{0,1})(\\(([1-9]\\d{0,1})\\))?$';
  const postMatch = isOH ?
    '!!(t = t.match(/' + regexOH + '/)) && ((r = Number(t[1])), (s = Number(t[2])), (t = Number(t[3])),' +
    ' e.distributionOSApiVersion >= 1e4 * r + 100 * s + t)' :
    '!!(t = t.match(/' + regexOH + '/)) && ((r = Number(t[1])), (s = Number(t[2])), (i = Number(t[3])),' +
    ' (r < 26 || !t[4])) && e.distributionOSApiVersion >= 1e4 * r + 100 * s + i';
  const content = `function ${MOCK_FUNCTION_NAME}(e, t) {
    var ${varDecl};
    return (!!e && ('number' == typeof t ? !(t < 1 || 25 < t || !Number.isInteger(t)) && e.sdkApiVersion >= t
        : 'string' == typeof t && ${postMatch}));
  }`;
  const sourceFile = ts.createSourceFile('', content, ts.ScriptTarget.Latest, true);
  stripRanges(sourceFile);
  return sourceFile.statements[0] as ts.FunctionDeclaration;
}

function stripRanges(node: ts.Node): void {
  node.pos = -1;
  node.end = -1;
  ts.forEachChild(node, stripRanges);
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
