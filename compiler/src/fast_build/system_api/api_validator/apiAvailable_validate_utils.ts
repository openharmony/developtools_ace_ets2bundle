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
import {
  ApiAvailableResult,
  APIAVAILABLE_CHECK_ERROR,
  APIAVAILABLE_NUMBER_FORMAT_ERROR,
  APIAVAILABLE_OPENHARMONY_CONTENT_ERROR,
  MSF_INTEGER_VERSION,
  APIAVAILABLE_STRING_DISTRIBUTIONOS_FORMAT_ERROR,
  ERROR_CODE_INFO,
  APIAVAILABLE_STRING_OPENHARMONY_FORMAT_ERROR,
  APIAVAILABLE_DISTRIBUTIONOS_CONTENT_ERROR,
  DistributionOSApiAvailableVersionResult,
  SINCE_TAG_NAME,
  APIAVAILABLE_NULLORUNDEFINED_FORMAT_ERROR
} from '../api_check_define';

function buildApiAvailableMessage(base: string, suffix?: string): string {
  const code: string = ERROR_CODE_INFO.get(base)?.code ?? '';
  return `${code}#${base}${suffix ?? ''}`;
}

function isDecimalInteger(since: string): boolean {
  return /^[+-]?[0-9]+$/.test(since);
}

function isCanonicalDecimalInteger(since: string): boolean {
  return /^[+-]?(0|[1-9][0-9]*)$/.test(since);
}

function isNumericLiteral(node: ts.Node): boolean {
  if (ts.isNumericLiteral(node)) {
    return true;
  }

  if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) {
    return node.operator === ts.SyntaxKind.MinusToken ||
      node.operator === ts.SyntaxKind.PlusToken;
  }

  return false;
}

function isNullOrUndefinedScene(node: ts.Node, typeOfNodeFunc: Function): boolean {
  if (typeOfNodeFunc) {
    const type: ts.Type | ts.Type[] = typeOfNodeFunc(node);
    if (type && !Array.isArray(type) && (type.flags & ts.TypeFlags.Nullable)) {
      return true;
    }
  }
  return node.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(node) && node.text === 'undefined');
}

function parseMSFVersion(since: string): { major: number; hasParentheses: boolean } | null {
  const match: RegExpMatchArray | null = since.match(/^([1-9]\d?)\.(0|[1-9]\d?)\.(0|[1-9]\d?)(?:\((\d+)\))?$/);
  if (!match) {
    return null;
  }
  return { major: parseInt(match[1]), hasParentheses: match[4] !== undefined };
}

function checkStringOpenHarmony(content: string): ApiAvailableResult {
  if (!/^[0-9.]+$/.test(content)) {
    return {
      valid: false,
      message: buildApiAvailableMessage(APIAVAILABLE_STRING_OPENHARMONY_FORMAT_ERROR),
      type: ts.DiagnosticCategory.Error
    };
  }
  const msf = parseMSFVersion(content);
  if (!msf || msf.major < MSF_INTEGER_VERSION) {
    return {
      valid: false,
      message: buildApiAvailableMessage(APIAVAILABLE_OPENHARMONY_CONTENT_ERROR),
      type: ts.DiagnosticCategory.Error
    };
  }
  return {
    valid: true,
    message: APIAVAILABLE_CHECK_ERROR,
    type: ts.DiagnosticCategory.Error
  };
}

function checkStringDistributionOS(
  content: string,
  isCheckDistributionOSVersion: (tag: string, version: string) => DistributionOSApiAvailableVersionResult
): ApiAvailableResult {
  if (!/^[0-9.()]+$/.test(content)) {
    return {
      valid: false,
      message: buildApiAvailableMessage(APIAVAILABLE_STRING_DISTRIBUTIONOS_FORMAT_ERROR),
      type: ts.DiagnosticCategory.Error
    };
  }
  const msf = parseMSFVersion(content);
  if (!msf) {
    return {
      valid: false,
      message: buildApiAvailableMessage(APIAVAILABLE_OPENHARMONY_CONTENT_ERROR),
      type: ts.DiagnosticCategory.Error
    };
  }
  if (msf.major >= MSF_INTEGER_VERSION) {
    if (msf.hasParentheses) {
      return { 
        valid: false,
        message: buildApiAvailableMessage(APIAVAILABLE_OPENHARMONY_CONTENT_ERROR),
        type: ts.DiagnosticCategory.Error
      };
    }
    return {
      valid: true,
      message: APIAVAILABLE_CHECK_ERROR,
      type: ts.DiagnosticCategory.Error
    };
  }
  const distributionOSCheck: DistributionOSApiAvailableVersionResult = isCheckDistributionOSVersion(SINCE_TAG_NAME, content);
  if (!distributionOSCheck.valid) {
    const distCode: string = ERROR_CODE_INFO.get(APIAVAILABLE_DISTRIBUTIONOS_CONTENT_ERROR)?.code ?? '';
    return {
      valid: false,
      message: `${distCode}#${distributionOSCheck.message}`,
      type: ts.DiagnosticCategory.Error
    };
  }
  return {
    valid: true,
    message: APIAVAILABLE_CHECK_ERROR,
    type: ts.DiagnosticCategory.Error
  };
}

export type TypeOfNodeFunc = (node: ts.Node) => ts.Type | ts.Type[];

export interface ValidateApiAvailableArgumentOptions {
  node: ts.CallExpression;
  typeOfNodeFunc: TypeOfNodeFunc;
  isOpenHarmonyRuntime: () => boolean;
  isCheckDistributionOSVersion: (tag: string, version: string) => DistributionOSApiAvailableVersionResult;
}

export function validateApiAvailableArgument(options: ValidateApiAvailableArgumentOptions): ApiAvailableResult {
  const { node, typeOfNodeFunc, isOpenHarmonyRuntime, isCheckDistributionOSVersion } = options;

  const result: ApiAvailableResult = {
    valid: true,
    message: APIAVAILABLE_CHECK_ERROR,
    type: ts.DiagnosticCategory.Error
  };

  const arg: ts.Node = node.arguments[0];
  const isNumber: boolean = isNumericLiteral(arg);
  const isStringLiteralNode: boolean = ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg);
  const isNullish: boolean = isNullOrUndefinedScene(arg, typeOfNodeFunc);

  if (!(isNumber || isStringLiteralNode || isNullish)) {
    return result;
  }

  if (isNullish) {
    result.valid = false;
    result.message = buildApiAvailableMessage(APIAVAILABLE_NULLORUNDEFINED_FORMAT_ERROR);
    return result;
  }

  if (isNumber) {
    const numText: string = arg.getText().trim();
    if (!isDecimalInteger(numText)) {
      result.valid = false;
      result.message = buildApiAvailableMessage(APIAVAILABLE_NUMBER_FORMAT_ERROR);
    } else if (!isCanonicalDecimalInteger(numText) || Number(numText) < 1 || Number(numText) >= MSF_INTEGER_VERSION) {
      result.valid = false;
      result.message = buildApiAvailableMessage(APIAVAILABLE_OPENHARMONY_CONTENT_ERROR);
    }
    return result;
  }

  const content: string = (arg as ts.StringLiteral).text;
  return isOpenHarmonyRuntime() ?
    checkStringOpenHarmony(content) :
    checkStringDistributionOS(content, isCheckDistributionOSVersion);
}
