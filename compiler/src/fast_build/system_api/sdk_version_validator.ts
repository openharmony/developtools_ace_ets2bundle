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
  projectConfig,
  fileDeviceCheckPlugin
} from '../../../main';
import {
  getVersionValidationFunction
} from './api_check_utils';
import fs from 'fs';

/**
 * The node is considered **valid** if it satisfies **at least one** of the following:
 * 1. It is wrapped in a `try/catch` block.
 * 2. It is wrapped in an `undefined` check.
 * 3. It is wrapped in an SDK version comparison.
 */
export class SdkVersionValidator {
  private readonly compatibleSdkVersion: string;
  private readonly minSinceVersion: string;
  private readonly otherSourceDeviceInfo: string = 'distributionOSApiVersion';
  private readonly openSourceDeviceInfo: string = 'sdkApiVersion';
  private readonly openSourceRuntime: string = 'OpenHarmony';
  private readonly deviceInfoChecker: Map<string, string[]> = new Map([
  [this.otherSourceDeviceInfo, ['@ohos.deviceInfo.d.ts']],
  [this.openSourceDeviceInfo, ['@ohos.deviceInfo.d.ts']]
]);
  private readonly typeChecker?: ts.TypeChecker;


  constructor(projectCompatibleSdkVersion: string, minSinceValue: string, typeChecker?: ts.TypeChecker) {
    this.compatibleSdkVersion = projectCompatibleSdkVersion;
    this.minSinceVersion = minSinceValue;
    this.typeChecker = typeChecker;
  }

  /**
   * Checks whether a given node is valid for at least one condition.
   * @param node - The AST node to check.
   * @returns `true` if the node meets any of the handling rules, otherwise `false`.
   */
  public isSdkApiVersionHandled(node: ts.Node): boolean {
    if (!node) {
      return false;
    }

    return (
        this.isNodeWrappedInTryCatch(node) ||
        this.isNodeWrappedInUndefinedCheck(node) ||
        this.isNodeWrappedInSdkComparison(node)
    );
  }

  private isNodeWrappedInTryCatch(node: ts.Node): boolean {
    return this.findParentNode(node, (parent) => {
      if (ts.isTryStatement(parent)) {
        return node.getStart() >= parent.tryBlock.getStart();
      }
      return false;
    }) !== null;
  }

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
  
  private isUndefinedCheckHelper(expression: ts.Expression, name: string): boolean {
    if (!ts.isBinaryExpression(expression)) {
      return false;
    }
  
    // Check if the operator is a "not equal" comparison (!== or !=)
    const isNotEqualOperator = [
      ts.SyntaxKind.ExclamationEqualsEqualsToken,
      ts.SyntaxKind.ExclamationEqualsToken
    ].includes(expression.operatorToken.kind);
  
    if (!isNotEqualOperator) {
      return false;
    }
  
    const { left, right } = expression;
  
    // Determine if either side is the literal "undefined"
    const isLeftUndefined = this.isUndefinedNode(left);
    const isRightUndefined = this.isUndefinedNode(right);
  
    const isLeftTarget = this.isTargetNode(left, name);
    const isRightTarget = this.isTargetNode(right, name);
    return (isLeftTarget && isRightUndefined) || (isLeftUndefined && isRightTarget);
  }

  private isUndefinedNode(node: ts.Node): boolean {
    return ts.isIdentifier(node) && node.text === 'undefined';
  }
  
  private isNodeWrappedInSdkComparison(node: ts.Node): boolean {
    const nodeSourceFile = node.getSourceFile()?.fileName;
    if (!nodeSourceFile) {
      return false;
    }

    // First check cache
    if (fileDeviceCheckPlugin.has(nodeSourceFile)) {
      const hasDeviceInfo = fileDeviceCheckPlugin.get(nodeSourceFile)!;
      if (!hasDeviceInfo) {
        return false;
      }
    } else {
      // File not in cache, read and cache the result
      try {
        const fileContent: string = fs.readFileSync(nodeSourceFile, { encoding: 'utf-8' });
        const deviceInfoContentChecker = /\bdeviceInfo\b/.test(fileContent);
        fileDeviceCheckPlugin.set(nodeSourceFile, deviceInfoContentChecker);
        if (!deviceInfoContentChecker) {
          return false;
        }
      } catch (error) {
        console.warn('Error reading device info: ' + nodeSourceFile);
      }
    }

    if (this.compatibleSdkVersion === '' || !this.typeChecker) {
      return false;
    }
  
    return (
      this.findParentNode(node, (parent) => this.isParentIfSdkComparison(node, parent)) !== null
    );
  }

  private isParentIfSdkComparison(node: ts.Node, parent: ts.Node): boolean {
    if (!ts.isIfStatement(parent)) {
      return false;
    }

    try {
      const isInThenBlock = this.isNodeInIfThenBlock(node, parent);
      if (!isInThenBlock) {
        return false;
      }
      return this.isSdkComparisonHelper(parent.expression);
    } catch {
      return false;
    }
  }

  private isSdkComparisonHelper(expression: ts.Expression): boolean {
    const expressionText = expression.getText();
  
    const runtimeType = projectConfig.runtimeOS;
    const matchedEntry = Array.from(this.deviceInfoChecker.entries())
      .find(([api]) => expressionText.includes(api));
    if (!matchedEntry) {
      return false;
    }
  
    const [matchedApi, validPackagePath] = matchedEntry;
    if (runtimeType === this.openSourceRuntime && matchedApi === this.otherSourceDeviceInfo) {
      return false;
    }
  
    const parts = this.extractComparisonParts(expression, matchedApi);
    if (!parts) {
      return false;
    }
  
    if (!this.validateSdkVersionCompatibility(parts.operator, parts.value, matchedApi, runtimeType, parts.apiPosition)) {
      return false;
    }
  
    // Try to resolve the actual identifier used for this API in the expression
    const apiIdentifier = this.findValidImportApiIdentifier(expression, matchedApi);
  
    // Validate that the identifier comes from the allowed SDK package path
    return apiIdentifier
      ? this.isValidSdkDeclaration(apiIdentifier, validPackagePath)
      : false;
  }
  
  /**
   * Extracts comparison parts from a binary expression and resolves declaration values.
   * Also determines which side of the comparison contains the API.
   *
   * @param expression - The binary expression to analyze
   * @param matchedApi - The API identifier to match against
   * @returns Object with operator, resolved value, and API position, or undefined if invalid
   */
  private extractComparisonParts(
    expression: ts.Expression,
    matchedApi: string
  ): { operator: string; value: string; apiPosition: 'left' | 'right' } | undefined {
    if (!ts.isBinaryExpression(expression)) {
      return undefined;
    }
  
    const operator = expression.operatorToken.getText();
    const left = expression.left.getText();
    const right = expression.right.getText();
  
    let targetValue: string;
    let valueExpression: ts.Expression;
    let apiPosition: 'left' | 'right';
  
    // Determine which side contains the API and get the comparison value
    if (left.includes(matchedApi)) {
      targetValue = right;
      valueExpression = expression.right;
      apiPosition = 'left';
    } else if (right.includes(matchedApi)) {
      targetValue = left;
      valueExpression = expression.left;
      apiPosition = 'right';
    } else {
      return undefined;
    }
  
    // Try to resolve declaration value if it exists
    const resolvedValue = this.resolveDeclarationValue(valueExpression, targetValue);
  
    return { operator, value: resolvedValue, apiPosition };
  }
  
  /**
   * Resolves the declaration value of an expression if it exists.
   * If the expression is a variable/constant reference, returns its declared value.
   * Otherwise, returns the original text value.
   *
   * @param expression - The expression to resolve
   * @param fallbackValue - The fallback text value if resolution fails
   * @returns The resolved declaration value or fallback value
   */
  private resolveDeclarationValue(expression: ts.Expression, fallbackValue: string): string {
    if (!this.typeChecker) {
      return fallbackValue;
    }
  
    try {
      // Only resolve if the expression is an identifier (variable/constant reference)
      if (!ts.isIdentifier(expression)) {
        return fallbackValue;
      }
  
      const symbol = this.typeChecker.getSymbolAtLocation(expression);
      if (!symbol?.declarations?.length) {
        return fallbackValue;
      }
  
      const declaration = symbol.declarations[0];
      
      // Handle variable declarations with initializers
      if (ts.isVariableDeclaration(declaration) && declaration.initializer) {
        return this.extractValueFromInitializer(declaration.initializer);
      }
  
      // Handle const assertions and other declaration types
      if (ts.isBindingElement(declaration) && declaration.initializer) {
        return this.extractValueFromInitializer(declaration.initializer);
      }
  
      return fallbackValue;
    } catch (error) {
      // If resolution fails, return the original value
      return fallbackValue;
    }
  }
  
  /**
   * Extracts the actual value from a variable initializer expression.
   * Handles literals, numeric values, and string values.
   *
   * @param initializer - The initializer expression
   * @returns The extracted value as string
   */
  private extractValueFromInitializer(initializer: ts.Expression): string {
    // Handle numeric literals
    if (ts.isNumericLiteral(initializer)) {
      return initializer.text;
    }
  
    // Handle string literals (remove quotes)
    if (ts.isStringLiteral(initializer)) {
      return initializer.text;
    }
  
    // Handle boolean literals
    if (initializer.kind === ts.SyntaxKind.TrueKeyword) {
      return 'true';
    }
    if (initializer.kind === ts.SyntaxKind.FalseKeyword) {
      return 'false';
    }
  
    // Handle other expression types by returning their text
    return initializer.getText();
  }
  
  /**
   * Validates SDK version compatibility by comparing operator, value, and API type.
   *
   * @param operator - Comparison operator from the expression
   * @param value - Version value to compare against
   * @param matchedApi - The matched API identifier
   * @param runtimeType - Runtime environment type (OpenHarmony or Other)
   * @param apiPosition - Position of API in comparison: 'left' or 'right'
   * @returns True if SDK version is compatible, false otherwise
   */
  private validateSdkVersionCompatibility(
    operator: string,
    value: string,
    matchedApi: string,
    runtimeType: string,
    apiPosition: 'left' | 'right'
  ): boolean {
    const comparisonValue = Number(value);
    // comparisonValue should conform to the integer format.
    if (!Number.isInteger(comparisonValue)) {
      return false;
    }
    // Adjust comparison values based on operators
    const assignedSdkVersion = this.calculateAssignedSdkVersion(operator, comparisonValue, apiPosition);

    // Handle OpenHarmony runtime with direct comparison

    if (runtimeType === this.openSourceRuntime) {
      return this.sdkOpenSourceComparison(assignedSdkVersion);
    }
  
    // Handle other runtime with version validation function
    const versionChecker = getVersionValidationFunction();
    const triggerScene = matchedApi === this.openSourceDeviceInfo ? 1 : 2;
    
    const validationResult = versionChecker(this.minSinceVersion, assignedSdkVersion.toString(), triggerScene);
    return validationResult.result;
  }
  
  /**
   * Compares SDK version using value assignment logic to determine if version check is valid.
   *
   * Logic: Determines what value the SDK version would have based on the condition,
   * then compares that assigned value with the minimum required version.
   *
   * Examples:
   * - sdkVersion > 15: SDK gets value 16, compare 16 >= minSince
   * - sdkVersion >= 16: SDK gets value 16, compare 16 >= minSince
   * - sdkVersion < 16: SDK gets value 15, compare 15 >= minSince
   * - 16 < sdkVersion: SDK gets value 17, compare 17 >= minSince (flipped logic)
   *
   * @param assignedSdkVersion - The value being compared against in the condition
   * @returns True if the assigned SDK version meets the minimum requirement
   */
  private sdkOpenSourceComparison(
    assignedSdkVersion: number
  ): boolean {
    const minRequiredVersion = Number(this.minSinceVersion);
    
    if (!Number.isInteger(minRequiredVersion) || assignedSdkVersion === null) {
      return false;
    }
  
    // Compare the assigned SDK version with minimum requirement
    return assignedSdkVersion >= minRequiredVersion;
  }
  
  /**
   * Calculates what value the SDK version would have based on the comparison condition.
   *
   * @param operator - Comparison operator
   * @param comparisonValue - Value being compared against
   * @param apiPosition - Whether API is on left or right side
   * @returns Assigned SDK version value, or null if indeterminate
   */
  private calculateAssignedSdkVersion(
    operator: string,
    comparisonValue: number,
    apiPosition: 'left' | 'right'
  ): number | null {
    // Flip operator if API is on the right side
    const effectiveOperator = apiPosition === 'right' ? this.flipOperator(operator) : operator;
  
    switch (effectiveOperator) {
      case '>':
        // sdkVersion > 15 → SDK version would be at least 16
        return comparisonValue + 1;
  
      case '>=':
        // sdkVersion >= 16 → SDK version would be at least 16
        return comparisonValue;
  
      case '<':
        // sdkVersion < 16 → SDK version would be at most 15
        return comparisonValue - 1;
  
      case '<=':
        // sdkVersion <= 15 → SDK version would be at most 15
        return comparisonValue;
  
      case '==':
      case '===':
        // sdkVersion === 16 → SDK version would be exactly 16
        return comparisonValue;
  
      case '!=':
      case '!==':
        // sdkVersion !== 15 → Cannot determine specific value
        return null;
  
      default:
        return null;
    }
  }
  
  /**
   * Flips comparison operators for when API is on the right side of comparison.
   *
   * @param operator - Original operator
   * @returns Flipped operator
   */
  private flipOperator(operator: string): string {
    switch (operator) {
      case '>': return '<';
      case '<': return '>';
      case '>=': return '<=';
      case '<=': return '>=';
      case '==':
      case '===':
      case '!=':
      case '!==':
        return operator; // These don't need flipping
      default:
        return operator;
    }
  }

  private findValidImportApiIdentifier(expression: ts.Expression, api: string): ts.Identifier | undefined {
    if (ts.isBinaryExpression(expression)) {
      return this.extractApiIdentifierFromExpression(expression.left, api) ||
          this.extractApiIdentifierFromExpression(expression.right, api);
    }
    return this.extractApiIdentifierFromExpression(expression, api);
  }

  private extractApiIdentifierFromExpression(
      expression: ts.Expression,
      targetProperty: string
  ): ts.Identifier | undefined {
    if (!ts.isPropertyAccessExpression(expression)) {
      return undefined;
    }
    if (expression.name.text !== targetProperty) {
      return undefined;
    }
    return this.getRootIdentifier(expression.expression);
  }

  private getRootIdentifier(expression: ts.Expression): ts.Identifier | undefined {
    let current: ts.Expression = expression;
    while (ts.isPropertyAccessExpression(current)) {
      current = current.expression;
    }
    return ts.isIdentifier(current) ? current : undefined;
  }

  private isValidSdkDeclaration(identifier: ts.Identifier, validPackagePaths: string[]): boolean {
    if (!this.typeChecker) {
      return false;
    }
    const symbol = this.typeChecker.getSymbolAtLocation(identifier);
    if (!symbol) {
      return false;
    }
    const declarationFile = this.getActualDeclarationFile(symbol);
    return declarationFile ?
        this.isValidSdkDeclarationPath(declarationFile, validPackagePaths) :
        false;
  }

  private getActualDeclarationFile(symbol: ts.Symbol): string | undefined {
    if (!this.typeChecker) {
      return undefined;
    }
    const targetSymbol = this.typeChecker.getAliasedSymbol(symbol);
    const actualSymbol = targetSymbol !== symbol ? targetSymbol : symbol;
    if (!actualSymbol.declarations?.length) {
      return undefined;
    }
    const declarationFile = actualSymbol.declarations[0].getSourceFile().fileName;

    // This regex removes the leading path up to and including the last "sdk/<something>/" or "sdk\<something>\"
    // before the "@", leaving only the part starting from the package name.
    return declarationFile.replace(/^.*sdk[\\/].*[\\/](?=@)/, '');
  }

  private isValidSdkDeclarationPath(filePath: string, validPackagePaths: string[]): boolean {
    const normalizedPath = this.normalizePath(filePath);
    return validPackagePaths.some(validPath =>
        normalizedPath.includes(this.normalizePath(validPath))
    );
  }

  private normalizePath(path: string): string {
    return path.replace(/\\/g, '/').toLowerCase();
  }

  private isNodeInIfThenBlock(node: ts.Node, ifStatement: ts.IfStatement): boolean {
    if (!ifStatement.thenStatement) {
      return false;
    }
  
    const nodeStart = node.getStart();
    const nodeEnd = node.getEnd();
    const thenStart = ifStatement.thenStatement.getStart();
    const thenEnd = ifStatement.thenStatement.getEnd();
    const isInRange = nodeStart >= thenStart && nodeEnd <= thenEnd;
    return isInRange;
  }

  /**
   * Traverses upward in the AST from the given node to find the first parent
   * that satisfies the provided predicate function.
   *
   * @param node - The starting AST node.
   * @param predicate - A function that returns `true` for the desired parent node.
   * @returns The first matching parent node, or `null` if none is found.
   */
  private findParentNode(
      node: ts.Node,
      predicate: (parent: ts.Node) => boolean
  ): ts.Node | null {
    let currentNode = node.parent;

    // Walk up the AST until we reach the root or find a match
    while (currentNode) {
      if (predicate(currentNode)) {
        return currentNode;
      }
      currentNode = currentNode.parent;
    }
    return null;
  }

  private getPrimaryNameFromNode(node: ts.Node): string | undefined {
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

  private isTargetNode(node: ts.Node, name: string): boolean {
    const nodePrimaryName = this.getPrimaryNameFromNode(node);
    return nodePrimaryName === name;
  }
}
