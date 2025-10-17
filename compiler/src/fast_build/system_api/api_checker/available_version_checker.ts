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
import {
  projectConfig
} from '../../../../main';
import {
  RUNTIME_OS_OH,
  AVAILABLE_TAG_NAME,
  FormatCheckerFunction
} from '../api_check_define';
import { 
  getValueChecker, 
  getFormatChecker,
  isOpenHarmonyRuntime,
  defaultFormatCheckerWithoutMSF 
} from '../api_check_utils';
import { BaseVersionChecker, ParsedVersion } from './base_version_checker';

/**
 * Checker for the @Available annotation.
 * 
 * This class extracts `@Available` decorators from TypeScript AST nodes and
 * validates whether the current SDK version is compatible with the required minimum version.
 * 
 * The @Available decorator is used to mark APIs that require
 */
export class AvailableAnnotationChecker extends BaseVersionChecker {
  private formatChecker: FormatCheckerFunction;

  constructor(typeChecker?: ts.TypeChecker) {
    super(typeChecker);
    this.init();
  }

  /**
   * Initializes the checker by loading appropriate comparison and validation functions.
   * 
   * Process:
   * 1. Set SDK version from project config
   * 2. Load value checker (comparison function) from external plugins or use default
   * 3. Load format checker (validation function) from external plugins or use default
   * 
   * The functions are loaded via getValueChecker() and getFormatChecker() which:
   * - Try to load external plugins first
   * - Fall back to built-in implementations if plugins unavailable
   * - Cache results for performance
   */
  private init(): void {
    // Set SDK version - use original compatible version if available
    this.sdkVersion = projectConfig.originCompatibleSdkVersion?.toString() || 
                      projectConfig.compatibleSdkVersion.toString();

    // Load value checker (comparison function) for @Available tag
    // This function compares two versions and returns VersionValidationResult
    const valueChecker = getValueChecker(AVAILABLE_TAG_NAME);
    if (valueChecker) {
      this.versionCompareFunction = valueChecker;
    }

    // Load format checker (validation function) for @Available tag
    // This function validates version string format (e.g., "21", "21.1", etc.)
    const formatChecker = getFormatChecker(AVAILABLE_TAG_NAME);
    if (formatChecker) {
      this.formatChecker = formatChecker;
      this.versionValidFunction = formatChecker;
    } else {
      // Fallback to default format checker
      this.formatChecker = defaultFormatCheckerWithoutMSF;
      this.versionValidFunction = defaultFormatCheckerWithoutMSF;
    }
  }

  /**
   * Recursively search for decorators named @Available in the node and its parent node.
   * @param node declaration
   * @returns The array of @Available decorators found; if none exist, return an empty array.
   */
  getAvailableDecoratorFromNode(node: ts.Node | ts.Declaration): ts.Decorator[] {
    const isAvailableDecorator = (decorator: ts.Decorator): boolean => {
      if (ts.isCallExpression(decorator.expression)) {
        return ts.isIdentifier(decorator.expression.expression) &&
          decorator.expression.expression.text === 'Available';
      } else if (ts.isIdentifier(decorator.expression)) {
        return decorator.expression.text === 'Available';
      }
      return false;
    };
    
    const decoratorArray = [];
    if (ts.canHaveDecorators(node)) {
      decoratorArray.push(...(ts.getAnnotations(node)) || []);
    }
    if (ts.canHaveIllegalDecorators(node)) {
      decoratorArray.push(...(ts.getAnnotationsFromIllegalDecorators(node)) || []);
    }
    
    if (decoratorArray.length > 0) {
      // filter @Available decorator
      const availableDecorators = decoratorArray.filter(isAvailableDecorator);
      if (availableDecorators.length > 0) {
        return availableDecorators;
      }
    }

    // findParent
    const parentNode = node.parent;
    return parentNode ? this.getAvailableDecoratorFromNode(parentNode) : [];
  }

  /**
   * Extract @Available decorator from a TypeScript node.
   * 
   * This method implements the abstract parseVersion() from BaseVersionChecker.
   * 
   * The extraction process:
   * 1. Find all @Available decorators on the node
   * 2. Extract minApiVersion from @Available decorators
   * 3. Validate version format using formatChecker
   * 4. Set this.minApiVersion if found
   * 
   * @param node - AST node to inspect for @Available decorator
   * @returns true if @Available decorator found, false otherwise
   */
  protected parseVersion(node: ts.Node): boolean {
    if (!node) {
      return false;
    }

    const decorators: ts.Decorator[] = this.getAvailableDecoratorFromNode(node);

    // Extract minApiVersion from @Available decorators
    for (const dec of decorators) {
      const minApi = this._extractMinApiFromDecorator(dec);
      if (!minApi) {
        continue;
      }

      // Validate version format using loaded format checker
      // For OpenHarmony: uses integer-only format (e.g., "21")
      // For other OS: uses format checker from external plugin or default
      const isValidFormat = (isOpenHarmonyRuntime() && minApi.os === RUNTIME_OS_OH)
        ? defaultFormatCheckerWithoutMSF(minApi.version)
        : this.formatChecker(minApi.raw);

      if (isValidFormat) {
        // Set instance variable for later retrieval
        this.minApiVersion = minApi.version;
        return true; // Found valid @Available decorator
      }
    }

    return false; // No valid @Available decorator found
  }

  /**
   * Extract the minApiVersion property from an @Available decorator.
   * 
   * This method parses the decorator's object literal to find the minApiVersion property.
   * 
   * Supported decorator formats:
   * ```typescript
   * @Available({ minApiVersion: "21" })
   * @Available({ minApiVersion: "5.0.0" })
   * @Available({ minApiVersion: "5.0.3(22)" })
   * @Available({ minApiVersion: "OpenHarmony 5.0.3(22)" })
   * ```
   * 
   * The method handles edge cases:
   * - Empty properties array (tries parsing raw text)
   * - String literal property names vs identifiers
   * - Numeric literals vs string literals for version values
   * 
   * @param dec - The decorator node to extract from
   * @returns Parsed version object, or null if not an @Available decorator
   */
  private _extractMinApiFromDecorator(dec: ts.Decorator): ParsedVersion | null {
    // Verify it's a call expression: @Available({ ... })
    if (!ts.isCallExpression(dec.expression)) {
      return null;
    }

    const callExpr = dec.expression;

    // Verify the decorator name is an identifier
    if (!ts.isIdentifier(callExpr.expression)) {
      return null;
    }

    // Check if it's specifically @Available
    if (callExpr.expression.text !== 'Available') {
      return null;
    }

    // Verify there's at least one argument (the config object)
    if (callExpr.arguments.length === 0) {
      return null;
    }

    const arg = callExpr.arguments[0];

    // The argument must be an object literal expression
    if (!ts.isObjectLiteralExpression(arg)) {
      return null;
    }

    // Edge case: If properties array is empty (malformed AST), try parsing raw text
    // This can happen with certain TypeScript compiler configurations
    if (arg.properties.length === 0) {
      const text = arg.getText();
      const match = /minApiVersion:\s*['"]([^'"]+)['"]/i.exec(text);
      if (match) {
        return this._parseVersionString(match[1]);
      }
      return null;
    }

    // Normal case: Parse properties from the object literal
    for (const prop of arg.properties) {
      const res = this.processProp(prop);
      if (res) {
        return res;
      }
    }

    return null; // minApiVersion property not found
  }

  private processProp(prop: ts.ObjectLiteralElementLike): ParsedVersion | null {
    // Only process property assignments (key: value)
    if (ts.isPropertyAssignment(prop)) {
      // Extract property name - handle both identifier and string literal names
      const propName = ts.isIdentifier(prop.name)
        ? prop.name.text
        : ts.isStringLiteral(prop.name)
          ? prop.name.text
          : prop.name.getText().replace(/['"]/g, '');

      // Check if this is the minApiVersion property
      if (propName === 'minApiVersion') {
        const value = prop.initializer;

        // Handle string literal: "21", "5.0.0", etc.
        if (ts.isStringLiteral(value)) {
          return this._parseVersionString(value.text);
        }

        // Handle numeric literal: 21 (converted to string)
        if (ts.isNumericLiteral(value)) {
          return this._parseVersionString(value.text.toString());
        }
      }
    }

    return null;
  }
}