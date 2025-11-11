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
import { SdkComparisonHelper } from './api_validate_utils';
import {
  getValueChecker,
  getFormatChecker,
  isOpenHarmonyRuntime,
  defaultFormatCheckerWithoutMSF,
  defaultValueChecker,
  getAvailableDecoratorFromNode,
  extractMinApiFromDecorator,
  getVersionByValueChecker
} from '../api_check_utils';
import {
  AVAILABLE_TAG_NAME,
  ComparisonSenario,
  ValueCheckerFunction,
  FormatCheckerFunction,
  ParsedVersion,
  RUNTIME_OS_OH,
  VersionValidationResult
} from '../api_check_define';
import { fileDeviceCheckPlugin, fileAvailableCheckPlugin } from '../../../../main';
import fs from 'fs';

/**
 * Validator interface for node suppression checks.
 * Each validator implements a specific suppression strategy.
 */
export interface NodeValidator {
  /**
   * Validates if a node meets the suppression criteria.
   * 
   * @param node - The AST node to validate
   * @returns True if the node is properly suppressed, false otherwise
   */
  validate(node: ts.Node): boolean;
}

/**
 * Composite validator that combines multiple validators.
 * A node is considered valid if ANY of the validators pass.
 */
export class CompositeValidator implements NodeValidator {
  constructor(private validators: NodeValidator[]) { }

  /**
   * Validates node against all registered validators.
   * Returns true if at least one validator passes.
   * 
   * @param node - Node to validate
   * @returns True if any validator passes
   */
  validate(node: ts.Node): boolean {
    return this.validators.some(validator => validator.validate(node));
  }

  /**
   * Add a validator to the composite.
   * 
   * @param validator - Validator to add
   */
  addValidator(validator: NodeValidator): void {
    this.validators.push(validator);
  }

  /**
   * Get all registered validators.
   * 
   * @returns Array of validators
   */
  getValidators(): NodeValidator[] {
    return [...this.validators];
  }
}

/**
 * Shared constants for SDK version checking.
 */
export const SDK_CONSTANTS = {
  OTHER_SOURCE_DEVICE_INFO: 'distributionOSApiVersion',
  OPEN_SOURCE_DEVICE_INFO: 'sdkApiVersion',
  OPEN_SOURCE_RUNTIME: 'OpenHarmony',
  DEVICE_INFO_PACKAGE: '@ohos.deviceInfo.d.ts'
} as const;

/**
 * Base class providing common utility methods for validators.
 */
export abstract class BaseValidator {
  /**
   * Traverses upward in the AST to find the first parent matching the predicate.
   * 
   * @param node - Starting node
   * @param predicate - Condition to match
   * @returns Matching parent node or null
   */
  protected findParentNode(
    node: ts.Node,
    predicate: (parent: ts.Node) => boolean
  ): ts.Node | null {
    let currentNode = node.parent;

    while (currentNode) {
      if (predicate(currentNode)) {
        return currentNode;
      }
      currentNode = currentNode.parent;
    }
    return null;
  }

  /**
   * Extracts the primary identifier name from a node.
   * 
   * @param node - Node to extract name from
   * @returns Primary name or undefined
   */
  protected getPrimaryNameFromNode(node: ts.Node): string | undefined {
    if (ts.isIdentifier(node)) {
      return node.text;
    }
    if (ts.isCallExpression(node)) {
      return this.getPrimaryNameFromNode(node.expression);
    }
    if (ts.isPropertyAccessExpression(node)) {
      return node.name.text;
    }
    return undefined;
  }

  /**
   * Checks if a node is the literal "undefined" keyword.
   * 
   * @param node - Node to check
   * @returns True if undefined literal
   */
  protected isUndefinedNode(node: ts.Node): boolean {
    return ts.isIdentifier(node) && node.text === 'undefined';
  }

  /**
   * Checks if a node matches a target name and is a property access.
   * 
   * @param node - Node to check
   * @param name - Target name
   * @returns True if matches
   */
  protected isTargetNode(node: ts.Node, name: string): boolean {
    const nodePrimaryName = this.getPrimaryNameFromNode(node);
    return nodePrimaryName === name && (ts.isPropertyAccessExpression(node) || ts.isIdentifier(node));
  }

  /**
   * Checks if a node is within the then block of an if statement.
   * 
   * @param node - Node to check
   * @param ifStatement - The if statement
   * @returns True if in then block
   */
  protected isNodeInIfThenBlock(node: ts.Node, ifStatement: ts.IfStatement): boolean {
    if (!ifStatement.thenStatement) {
      return false;
    }

    const nodeStart = node.getStart();
    const nodeEnd = node.getEnd();
    const thenStart = ifStatement.thenStatement.getStart();
    const thenEnd = ifStatement.thenStatement.getEnd();
    return nodeStart >= thenStart && nodeEnd <= thenEnd;
  }

  /**
   * Normalizes file paths for consistent comparison.
   * 
   * @param path - Path to normalize
   * @returns Normalized path
   */
  protected normalizePath(path: string): string {
    return path.replace(/\\/g, '/').toLowerCase();
  }
}

/**
 * Validator that checks if a node is wrapped in a try/catch block.
 * 
 * A node is considered valid if it appears within the try block of a try/catch statement.
 * This suppression strategy assumes that runtime errors are properly handled.
 * 
 * Example:
 * ```typescript
 * try {
 *   someNewApi(); // This would be considered valid
 * } catch (error) {
 *   console.log('API not available');
 * }
 * ```
 */
export class TryCatchValidator extends BaseValidator implements NodeValidator {
  /**
   * Validates if the node is within a try block.
   * 
   * @param node - Node to validate
   * @returns True if node is in a try block
   */
  validate(node: ts.Node): boolean {
    if (!node) {
      return false;
    }

    return this.isNodeWrappedInTryCatch(node);
  }

  /**
   * Checks if a node is wrapped in a try/catch block.
   * 
   * @param node - Node to check
   * @returns True if node is in try block
   */
  private isNodeWrappedInTryCatch(node: ts.Node): boolean {
    return this.findParentNode(node, (parent) => {
      if (ts.isTryStatement(parent)) {
        return node.getStart() >= parent.tryBlock.getStart();
      }
      return false;
    }) !== null;
  }
}

/**
 * Validator that checks if a node is wrapped in an undefined check.
 * 
 * A node is considered valid if it's used within an if statement that checks
 * whether the API is undefined before using it.
 * 
 * Example:
 * ```typescript
 * if (someApi !== undefined) {
 *   someApi.method(); // This would be considered valid
 * }
 * ```
 */
export class UndefinedCheckValidator extends BaseValidator implements NodeValidator {
  /**
   * Validates if the node is within an undefined check.
   * 
   * @param node - Node to validate
   * @returns True if node is in undefined check
   */
  validate(node: ts.Node): boolean {
    if (!node) {
      return false;
    }

    return this.isNodeWrappedInUndefinedCheck(node);
  }

  /**
   * Checks if a node is wrapped in an undefined check.
   * 
   * @param node - Node to check
   * @returns True if node is in undefined check condition
   */
  private isNodeWrappedInUndefinedCheck(node: ts.Node): boolean {
    const targetName = this.getPrimaryNameFromNode(node);
    if (!targetName) {
      return false;
    }

    return this.findParentNode(node, (parent) => {
      if (ts.isIfStatement(parent)) {
        return this.isUndefinedCheckHelper(parent.expression, targetName);
      }
      return false;
    }) !== null;
  }

  /**
   * Helper to check if an expression is an undefined check.
   * 
   * @param expression - Expression to check
   * @param name - Target name to match
   * @returns True if expression is undefined check for target
   */
  private isUndefinedCheckHelper(expression: ts.Expression, name: string): boolean {
    if (!ts.isBinaryExpression(expression)) {
      return false;
    }

    const isNotEqualOperator = [
      ts.SyntaxKind.ExclamationEqualsEqualsToken,
      ts.SyntaxKind.ExclamationEqualsToken
    ].includes(expression.operatorToken.kind);

    if (!isNotEqualOperator) {
      return false;
    }

    const { left, right } = expression;

    const isLeftUndefined = this.isUndefinedNode(left);
    const isRightUndefined = this.isUndefinedNode(right);

    const isLeftTarget = this.isTargetNode(left, name);
    const isRightTarget = this.isTargetNode(right, name);

    return (isLeftTarget && isRightUndefined) || (isLeftUndefined && isRightTarget);
  }
}

/**
* Validator that checks if a node is wrapped in an SDK version comparison.
* 
* A node is considered valid if it's used within an if statement that checks
* the SDK version before using the API.
* 
* Example:
* ```typescript
* if (deviceInfo.sdkApiVersion >= 21) {
*   someNewApi(); // This would be considered valid
* }
* ```
*/
export class SdkComparisonValidator extends BaseValidator implements NodeValidator {
  private sdkComparisonHelper: SdkComparisonHelper;
  private readonly deviceInfoChecker: Map<string, string[]>;

  constructor(
    private readonly compatibleSdkVersion: string,
    private readonly minRequiredVersion: string,
    private readonly typeChecker?: ts.TypeChecker,
    private readonly minAvailableVersion?: ParsedVersion
  ) {
    super();
    this.deviceInfoChecker = new Map([
      [SDK_CONSTANTS.OTHER_SOURCE_DEVICE_INFO, [SDK_CONSTANTS.DEVICE_INFO_PACKAGE]],
      [SDK_CONSTANTS.OPEN_SOURCE_DEVICE_INFO, [SDK_CONSTANTS.DEVICE_INFO_PACKAGE]]
    ]);
    this.sdkComparisonHelper = new SdkComparisonHelper(
      compatibleSdkVersion,
      minRequiredVersion,
      typeChecker,
      minAvailableVersion,
      this.deviceInfoChecker,
      SDK_CONSTANTS.OTHER_SOURCE_DEVICE_INFO,
      SDK_CONSTANTS.OPEN_SOURCE_DEVICE_INFO,
      SDK_CONSTANTS.OPEN_SOURCE_RUNTIME
    );
  }

  /**
   * Validates if the node is within an SDK version check.
   * 
   * @param node - Node to validate
   * @returns True if node is in SDK version check
   */
  validate(node: ts.Node): boolean {
    if (!node) {
      return false;
    }

    return this.isNodeWrappedInSdkComparison(node);
  }

  /**
   * Checks if a node is wrapped in an SDK version comparison.
   *
   * @param node - Node to check
   * @returns True if node is in SDK version check
   */
  private isNodeWrappedInSdkComparison(node: ts.Node): boolean {
    const nodeSourceFile = node.getSourceFile()?.fileName;
    if (!nodeSourceFile) {
      return false;
    }

    // Check device info cache
    if (fileDeviceCheckPlugin.has(nodeSourceFile)) {
      const hasDeviceInfo = fileDeviceCheckPlugin.get(nodeSourceFile)!;
      if (!hasDeviceInfo) {
        return false;
      }
    } else {
      try {
        const fileContent: string = fs.readFileSync(nodeSourceFile, { encoding: 'utf-8' });
        const deviceInfoContentChecker = /\bdeviceInfo\b/.test(fileContent);
        fileDeviceCheckPlugin.set(nodeSourceFile, deviceInfoContentChecker);
        if (!deviceInfoContentChecker) {
          return false;
        }
      } catch (error) {
        console.warn('Error reading device info: ' + nodeSourceFile);
        return false;
      }
    }

    if (this.compatibleSdkVersion === '' || !this.typeChecker) {
      return false;
    }

    return (
      this.findParentNode(node, (parent) => this.isParentIfSdkComparison(node, parent)) !== null
    );
  }

  /**
   * Checks if a parent if-statement contains a valid SDK comparison.
   *
   * @param node - Original node
   * @param parent - Parent node to check
   * @returns True if parent is valid SDK comparison if-statement
   */
  private isParentIfSdkComparison(node: ts.Node, parent: ts.Node): boolean {
    if (!ts.isIfStatement(parent)) {
      return false;
    }

    try {
      const isInThenBlock = this.isNodeInIfThenBlock(node, parent);
      if (!isInThenBlock) {
        return false;
      }

      return this.sdkComparisonHelper.isSdkComparisonHelper(parent.expression);
    } catch {
      return false;
    }
  }
}

/**
* Validates @Available decorator usage by comparing target (declaration) vs context (call site).
* 
* Uses regex-based decorator extraction - NO strategy dependency!
* 
* Example:
* ```typescript
* // foo.ets
* @Available({minApiVersion: '24'})
* export function testFunc1(){}
* 
* // main.ets (SDK = 21)
* @Available({minApiVersion: '26'})
* export class testClassExample {
*   @Available({minApiVersion: '26'})
*   public gaveName1(){
*     testFunc1(); // TARGET: 24, PARENT: 26 → Valid ✓
*   }
* }
* 
* const foo = new testClassExample(); // TARGET: 26, PARENT: 21 → Invalid ✗
* foo.gaveName1(); // TARGET: 26, PARENT: 21 → Invalid ✗
* 
* @Available({minApiVersion: '27'})
* function aa() {
*   foo.gaveName1(); // TARGET: 26, PARENT: 27 → Valid ✓
* }
* ```
*/
export class AvailableComparisonValidator extends BaseValidator implements NodeValidator {
  // Instance-level flag to prevent ANY nested validation
  private readonly MIN_API_VERSION: string = 'minApiVersion';
  private readonly MIN_API_VERSION_REGEX: RegExp = /minApiVersion:\s*(['"])[^'"]+\1/i;
  private readonly VERSION_MATCH_REGEX: RegExp = /(['"])([^'"]+)\1/;

  // Comparison functions loaded from central system
  private formatChecker: FormatCheckerFunction = defaultFormatCheckerWithoutMSF;
  private valueChecker: ValueCheckerFunction = defaultValueChecker;

  constructor(
    private readonly compatibleSdkVersion: string,
    private readonly minRequiredVersion: string,
    private readonly typeChecker: ts.TypeChecker,
    private readonly minAvailbleVersion?: ParsedVersion
  ) {
    super();
    this.init();
  }

  /**
   * Initialize comparison functions for suppression checking.
   * 
   * Loads both format and value checkers for the 'available' tag.
   * Runtime-specific behavior:
   * - OpenHarmony: Uses default format checker (integer only)
   * - Other runtimes: Uses external format checker from plugins
   */
  private init(): void {
    // Load format checker for 'available' tag
    const formatChecker = getFormatChecker(AVAILABLE_TAG_NAME);
    this.formatChecker = formatChecker || defaultFormatCheckerWithoutMSF;

    // Load value checker for 'available' tag
    // Used for version comparison with runtime-specific logic
    const valueChecker = getValueChecker(AVAILABLE_TAG_NAME);
    if (valueChecker) {
      this.valueChecker = valueChecker;
    }
  }

  /**
   * Validates if a node's API version requirement is satisfied by parent context.
   * Returns true if validation should suppress warning, false if warning should be shown.
   *
   * @param node - The AST node to validate
   * @returns true to suppress warning, false to show warning
   */
  validate(node: ts.Node): boolean {
    if (!node || (!this.minAvailbleVersion && !this.minRequiredVersion)) {
      return false;
    }
    const nodeSourceFile = node.getSourceFile()?.fileName;
    if (!nodeSourceFile) {
      return false;
    }
    // Check device info cache
    if (fileAvailableCheckPlugin.has(nodeSourceFile)) {
      const hasAvailale = fileAvailableCheckPlugin.get(nodeSourceFile)!;
      if (!hasAvailale) {
        return false;
      }
    } else {
      try {
        const fileContent: string = fs.readFileSync(nodeSourceFile, { encoding: 'utf-8' });
        const availableContentChecker = /Available/.test(fileContent);
        fileAvailableCheckPlugin.set(nodeSourceFile, availableContentChecker);
        if (!availableContentChecker) {
          return false;
        }
      } catch (error) {
        return false;
      }
    }

    try {
      const curAvailableVersion = this.checkParentVersion(node);

      // Version requirement exists but no parent wrapper → show warning
      if (curAvailableVersion) {
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Finds the target version from the declaration.
   * Goes to where the symbol is declared and extracts @Available
   *
   * @param node - The usage node to find target version for
   * @returns The highest version requirement, or undefined if none found
   */
  private checkParentVersion(node: ts.Node): ParsedVersion | null {
    if (!node) {
      return null;
    }
    const decorators: ts.Decorator[] = getAvailableDecoratorFromNode(node, 1);

    // Extract minApiVersion from @Available decorators
    for (const dec of decorators) {
      const availableVersion = extractMinApiFromDecorator(dec);
      if (!availableVersion) {
        continue;
      }

      // Validate version format using loaded format checker
      // For OpenHarmony: uses integer-only format (e.g., "21")
      // For other OS: uses format checker from external plugin or default
      const isValidFormat = availableVersion.os === RUNTIME_OS_OH
        ? defaultFormatCheckerWithoutMSF(availableVersion.version)
        : this.formatChecker(availableVersion.formatVersion);

      if (!isValidFormat || !isValidFormat.result) {
        continue;
      }
      if (this.compareVersions(availableVersion, this.minAvailbleVersion ? this.minAvailbleVersion : this.minRequiredVersion)) {
        return availableVersion;
      }
    }

    return null; // No valid @Available decorator found
  }

  /**
   * Compares two version using runtime-specific logic.
   *
   * @param curAvailableVersion 
   * @param minRequiredVersion - Second version
   * @returns positive if curAvailableVersion > minRequiredVersion, negative if  curAvailableVersion < minRequiredVersion, 0 if equal
   */
  private compareVersions(curAvailableVersion: ParsedVersion, minRequiredVersion: ParsedVersion | string): boolean {
    // Other runtimes: Use external value checker
    try {
      // Determine scenario based on version format
      if (!curAvailableVersion) {
        return false;
      }
      const scenario = curAvailableVersion.os === RUNTIME_OS_OH ? ComparisonSenario.SuppressByOHVersion : ComparisonSenario.SuppressByOtherOSVersion;

      let result: VersionValidationResult;
      if (typeof minRequiredVersion === 'string') {
        result = this.valueChecker(minRequiredVersion, getVersionByValueChecker(curAvailableVersion, this.valueChecker), scenario);
      } else {
        result = this.valueChecker(getVersionByValueChecker(minRequiredVersion, this.valueChecker),
         getVersionByValueChecker(curAvailableVersion, this.valueChecker), scenario);
      }

      if (result) {
        return result.result;
      }

      return false;
    } catch (error) {
      return false;
    }
  }
}