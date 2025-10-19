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
import { projectConfig } from '../../../../main';
import { 
  getValueChecker,
  defaultValueChecker 
} from '../api_check_utils';
import { SINCE_TAG_NAME,
  ComparisonSenario,
  ValueCheckerFunction
} from '../api_check_define';

/**
 * Shared helper for SDK version comparison logic.
 * Encapsulates all version comparison and validation logic.
 * 
 * Uses centralized comparison functions system for runtime-specific validation.
 * Supports both OpenHarmony (simple integer comparison) and other runtimes (external plugins).
 */
export class SdkComparisonHelper {
  private readonly otherSourceDeviceInfo: string;
  private readonly openSourceDeviceInfo: string;
  private readonly openSourceRuntime: string;
  private readonly deviceInfoChecker: Map<string, string[]>;
  
  // Comparison function loaded from central system
  private valueChecker: ValueCheckerFunction = defaultValueChecker;

  constructor(
    private readonly compatibleSdkVersion: string,
    private readonly minRequiredVersion: string,
    private readonly typeChecker: ts.TypeChecker | undefined,
    deviceInfoMap: Map<string, string[]>,
    otherSourceDeviceInfo: string,
    openSourceDeviceInfo: string,
    openSourceRuntime: string
  ) {
    this.deviceInfoChecker = deviceInfoMap;
    this.otherSourceDeviceInfo = otherSourceDeviceInfo;
    this.openSourceDeviceInfo = openSourceDeviceInfo;
    this.openSourceRuntime = openSourceRuntime;
    
    // Initialize comparison function
    this.init();
  }
  
  /**
   * Initialize comparison function for SDK version validation.
   * 
   * Loads value checker from central system:
   * - Uses 'since' tag for SDK version comparisons
   * - Falls back to default checker if no external plugin available
   */
  private init(): void {
    // Load value checker for 'since' tag (used for SDK version comparisons)
    const valueChecker = getValueChecker(SINCE_TAG_NAME);
    this.valueChecker = valueChecker || defaultValueChecker;
  }

  /**
   * Checks if an expression contains a valid SDK version comparison.
   *
   * @param expression - The expression to analyze
   * @returns True if valid SDK comparison found
   */
  public isSdkComparisonHelper(expression: ts.Expression): boolean {
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

    const apiIdentifier = this.findValidImportApiIdentifier(expression, matchedApi);

    return apiIdentifier
      ? this.isValidSdkDeclaration(apiIdentifier, validPackagePath)
      : false;
  }

  /**
   * Extracts comparison parts from a binary expression and resolves declaration values.
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

    const resolvedValue = this.resolveDeclarationValue(valueExpression, targetValue);

    return { operator, value: resolvedValue, apiPosition };
  }

  /**
   * Resolves the declaration value of an expression if it exists.
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
      if (!ts.isIdentifier(expression)) {
        return fallbackValue;
      }

      const symbol = this.typeChecker.getSymbolAtLocation(expression);
      if (!symbol?.declarations?.length) {
        return fallbackValue;
      }

      const declaration = symbol.declarations[0];

      if (ts.isVariableDeclaration(declaration) && declaration.initializer) {
        return this.extractValueFromInitializer(declaration.initializer);
      }

      if (ts.isBindingElement(declaration) && declaration.initializer) {
        return this.extractValueFromInitializer(declaration.initializer);
      }

      return fallbackValue;
    } catch (error) {
      return fallbackValue;
    }
  }

  /**
   * Extracts the actual value from a variable initializer expression.
   *
   * @param initializer - The initializer expression
   * @returns The extracted value as string
   */
  private extractValueFromInitializer(initializer: ts.Expression): string {
    if (ts.isNumericLiteral(initializer)) {
      return initializer.text;
    }

    if (ts.isStringLiteral(initializer)) {
      return initializer.text;
    }

    if (initializer.kind === ts.SyntaxKind.TrueKeyword) {
      return 'true';
    }
    if (initializer.kind === ts.SyntaxKind.FalseKeyword) {
      return 'false';
    }

    return initializer.getText();
  }

  /**
   * Validates SDK version compatibility by comparing operator, value, and API type.
   *
   * Uses centralized comparison system with runtime-specific scenarios:
   * - OpenHarmony: Simple integer comparison
   * - Other runtimes: External value checker with scenario based on API type:
   *   - sdkApiVersion (openSourceDeviceInfo): SuppressWithoutMSF (1)
   *   - distributionOSApiVersion (otherSourceDeviceInfo): SuppressWithMSF (2)
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
    const numValue = Number(value);
    const comparisonValue = numValue % 1 === 0 ? numValue : Math.ceil(numValue);
    const assignedSdkVersion = this.calculateAssignedSdkVersion(operator, comparisonValue, apiPosition);
    
    // If we can't determine a specific SDK version (e.g., !=, !==, <, <=), don't suppress warning
    if (assignedSdkVersion === null) {
      return false;
    }
    
    // OpenHarmony runtime: Simple integer comparison
    if (runtimeType === this.openSourceRuntime) {
      return this.sdkOpenSourceComparison(assignedSdkVersion);
    }
    
    // Other runtimes: Use external value checker with appropriate scenario
    // Determine scenario based on which API is being checked:
    // - openSourceDeviceInfo (sdkApiVersion) → SuppressWithoutMSF (1)
    // - otherSourceDeviceInfo (distributionOSApiVersion) → SuppressWithMSF (2)
    const scenario = matchedApi === this.openSourceDeviceInfo 
      ? ComparisonSenario.SuppressWithoutMSF 
      : ComparisonSenario.SuppressWithMSF;
    
    // Use centralized value checker
    const validationResult = this.valueChecker(
      this.minRequiredVersion, 
      assignedSdkVersion.toString(), 
      scenario
    );
    
    return validationResult.result;
  }
  
  /**
   * Compares SDK version for OpenHarmony runtime.
   *
   * @param assignedSdkVersion - The value being compared against in the condition
   * @returns True if the assigned SDK version meets the minimum requirement
   */
  private sdkOpenSourceComparison(assignedSdkVersion: number): boolean {
    const minRequiredVersion = Number(this.minRequiredVersion);
    
    if (!Number.isInteger(minRequiredVersion)) {
      return false;
    }
    
    return assignedSdkVersion >= minRequiredVersion;
  }
  
  /**
   * Calculates what value the SDK version would have based on the comparison condition.
   * For '<' and '<=' operators, returns null because SDK version could be any value from 1 to comparisonValue.
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
    const effectiveOperator = apiPosition === 'right' ? this.flipOperator(operator) : operator;
    
    switch (effectiveOperator) {
      case '>':
        return comparisonValue + 1;
      case '>=':
        return comparisonValue;
      case '<':
      case '<=':
        // SDK version could be anywhere from 1 (or minimum) to comparisonValue
        // We cannot determine a specific version, so return null to trigger warning
        return null;
      case '==':
      case '===':
        return comparisonValue;
      case '!=':
      case '!==':
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
        return operator;
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

    return declarationFile.replace(/^.*sdk[\\/].*[\\/](?=@)/, '');
  }

  private isValidSdkDeclarationPath(filePath: string, validPackagePaths: string[]): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();
    return validPackagePaths.some(validPath =>
      normalizedPath.includes(validPath.replace(/\\/g, '/').toLowerCase())
    );
  }
}