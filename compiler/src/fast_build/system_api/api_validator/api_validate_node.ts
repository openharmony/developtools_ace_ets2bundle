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
  defaultFormatCheckerWithoutMSF, defaultValueChecker,
} from '../api_check_utils';
import { AVAILABLE_TAG_NAME,
  ComparisonSenario,
  ValueCheckerFunction,
  FormatCheckerFunction
} from '../api_check_define';
import {fileDeviceCheckPlugin, fileAvailableCheckPlugin} from '../../../../main';
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
  constructor(private validators: NodeValidator[]) {}

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
    return nodePrimaryName === name && ts.isPropertyAccessExpression(node);
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
      private readonly typeChecker?: ts.TypeChecker
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
    private isValidating: boolean = false;
    private readonly MIN_API_VERSION: string = 'minApiVersion';
    private readonly MIN_API_VERSION_REGEX: RegExp = /minApiVersion:\s*(['"])[^'"]+\1/i;
    private readonly VERSION_MATCH_REGEX: RegExp = /(['"])([^'"]+)\1/;
    
    // Comparison functions loaded from central system
    private formatChecker: FormatCheckerFunction = defaultFormatCheckerWithoutMSF;
    private valueChecker: ValueCheckerFunction = defaultValueChecker;
    
    constructor(
      private readonly compatibleSdkVersion: string,
      private readonly minRequiredVersion: string,
      private readonly typeChecker: ts.TypeChecker
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
      if (!node) {
        return false;
      }
      
      // If already validating, return true immediately
      // This prevents type checker from triggering nested validations
      if (this.isValidating) {
        return true;
      }
      const nodeSourceFile = node.getSourceFile()?.fileName;
      if (!nodeSourceFile) {
        return false;
      }
      // Check device info cache
      if (fileAvailableCheckPlugin.has(nodeSourceFile)) {
        const hasDeviceInfo = fileAvailableCheckPlugin.get(nodeSourceFile)!;
        if (!hasDeviceInfo) {
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
      // Set flag BEFORE any type checker calls
      this.isValidating = true;
      
      try {
        // Skip property declarations to avoid type annotation validation
        if (ts.isPropertyDeclaration(node)) {
          return true;
        }
        
        const targetSdkVersion = this.findTargetVersion(node);
        const parentSdkVersion = this.findParentVersion(node);
        
        // No version requirement on target → suppress warning
        if (!targetSdkVersion) {
          return true;
        }
        
        // Version requirement exists but no parent wrapper → show warning
        if (!parentSdkVersion) {
          return false;
        }
        
        // Compare versions: parent must be >= target to suppress warning
        return this.compareVersions(parentSdkVersion, targetSdkVersion) >= 0;
      } catch (error) {
        // On error, suppress warning to avoid false positives
        return true;
      } finally {
        this.isValidating = false;
      }
    }
    
    /**
     * Finds the target version from the declaration.
     * Goes to where the symbol is declared and extracts @Available or @since.
     *
     * @param node - The usage node to find target version for
     * @returns The highest version requirement, or undefined if none found
     */
    private findTargetVersion(node: ts.Node): string | undefined {
      const declarations = this.getDeclarationsFromNode(node);
      
      if (declarations.length === 0) {
        return undefined;
      }
      
      const versions = this.collectVersionsFromDeclarations(declarations);
      
      if (versions.length === 0) {
        return undefined;
      }
      
      return this.getHighestVersion(versions);
    }
    
    /**
     * Collects all version requirements from multiple declarations.
     * Handles member fallback: if a method/property/enum member has no version, check its parent.
     * 
     * @param declarations - Array of declaration nodes
     * @returns Array of version strings found
     */
    private collectVersionsFromDeclarations(declarations: ts.Declaration[]): string[] {
      const versions: string[] = [];
      
      for (const decl of declarations) {
        const declVersions = this.extractVersionsFromDecorators(decl);
        
        // Methods, properties, and enum members can inherit version from their parent
        if (this.isMethodOrProperty(decl)) {
          this.addMethodOrPropertyVersions(decl, declVersions, versions);
        } else if (ts.isEnumMember(decl)) {
          // EnumMember fallback: if no version on member, check parent enum
          this.addEnumMemberVersions(decl, declVersions, versions);
        } else {
          versions.push(...declVersions);
        }
      }
      
      return versions;
    }
    
    /**
     * Adds versions for an enum member, with fallback to parent enum.
     * If member has its own version, use it. Otherwise, inherit from parent enum.
     * 
     * @param decl - Enum member declaration
     * @param declVersions - Versions found on the member itself
     * @param versions - Output array to add versions to
     */
    private addEnumMemberVersions(
      decl: ts.EnumMember,
      declVersions: string[],
      versions: string[]
    ): void {
      // If member has explicit version, use it
      if (declVersions.length > 0) {
        versions.push(...declVersions);
        return;
      }
      
      // Otherwise, fallback to parent enum version
      const parent = decl.parent;
      if (parent && ts.isEnumDeclaration(parent)) {
        const parentVersions = this.extractVersionsFromDecorators(parent);
        versions.push(...parentVersions);
      }
    }
    
    /**
     * Extracts version requirements from both @Available decorators and @since JSDoc tags.
     *
     * @param decl - The declaration node to extract versions from
     * @returns Array of version strings found
     */
    private extractVersionsFromDecorators(decl: ts.Declaration): string[] {
      const nodeToCheck = this.getNodeWithDecorator(decl);
      const versions: string[] = [];
      
      // 1. Extract from @Available decorators
      const decorators = this.getAvailableFromDeclaration(nodeToCheck);
      for (const dec of decorators) {
        const version = this.extractMinApiFromDecorator(dec);
        if (version) {
          versions.push(version);
        }
      }
      
      // 2. Extract from @since JSDoc tags
      const sinceVersions = this.extractSinceFromJSDoc(nodeToCheck);
      versions.push(...sinceVersions);
      
      return versions;
    }
    
    /**
     * Extract @since value from JSDoc comments.
     * Example: @since 20 → "20"
     *
     * @param decl - Node to extract JSDoc from
     * @returns Array of version strings from @since tags
     */
    private extractSinceFromJSDoc(decl: ts.Node): string[] {
      const versions: string[] = [];
      
      // Get JSDoc tags
      const jsDocTags = ts.getJSDocTags(decl);
      
      for (const tag of jsDocTags) {
        if (tag.tagName.text === 'since' && tag.comment) {
          // Handle both string and composite comment formats
          const sinceValue = typeof tag.comment === 'string'
            ? tag.comment
            : tag.comment.map(part => part.text).join('');
          
          const version = this.parseVersionString(sinceValue.trim());
          if (version) {
            versions.push(version);
          }
        }
      }
      
      return versions;
    }
    
    /**
     * Gets the correct node to check for decorators.
     * Variable declarations need special handling: decorators are on parent VariableStatement.
     *
     * @param decl - Declaration node
     * @returns Node to check for decorators
     */
    private getNodeWithDecorator(decl: ts.Declaration): ts.Node {
      // Variable declarations: decorators are on parent VariableStatement
      // @Available const x = 5; → decorator is on VariableStatement, not VariableDeclaration
      if (ts.isVariableDeclaration(decl)) {
        const varList = decl.parent;
        if (varList && ts.isVariableDeclarationList(varList)) {
          const varStatement = varList.parent;
          if (varStatement && ts.isVariableStatement(varStatement)) {
            return varStatement;
          }
        }
      }
      
      // All other types: decorators are directly on the declaration
      return decl;
    }
    
    /**
     * Checks if a declaration is a method or property (including interface signatures).
     *
     * @param decl - Declaration to check
     * @returns true if method or property
     */
    private isMethodOrProperty(decl: ts.Declaration): boolean {
      return ts.isMethodDeclaration(decl) ||
        ts.isPropertyDeclaration(decl) ||
        ts.isPropertySignature(decl) ||
        ts.isMethodSignature(decl);
    }
    
    /**
     * Adds versions for a method/property, with fallback to parent class/interface.
     * If member has its own version, use it. Otherwise, inherit from parent.
     *
     * @param decl - Method or property declaration
     * @param declVersions - Versions found on the member itself
     * @param versions - Output array to add versions to
     */
    private addMethodOrPropertyVersions(
      decl: ts.Declaration,
      declVersions: string[],
      versions: string[]
    ): void {
      // If member has explicit version, use it
      if (declVersions.length > 0) {
        versions.push(...declVersions);
        return;
      }
      
      // Otherwise, fallback to parent class/interface version
      const parentVersions = this.getParentVersions(decl);
      versions.push(...parentVersions);
    }
    
    /**
     * Gets version requirements from parent class or interface.
     *
     * @param decl - Child member declaration
     * @returns Array of versions from parent
     */
    private getParentVersions(decl: ts.Declaration): string[] {
      const parent = decl.parent;
      
      if (!parent){
        return [];
      }
      
      // Check if parent is a class or interface
      if (ts.isClassDeclaration(parent) ||
        ts.isClassExpression(parent) ||
        ts.isInterfaceDeclaration(parent)) {
        return this.extractVersionsFromDecorators(parent);
      }
      
      return [];
    }
    
    /**
     * Gets declaration nodes for a given usage node.
     * Handles: function calls, method calls, class instantiation, property access, decorators.
     *
     * @param node - The usage node to find declarations for
     * @returns Array of declaration nodes
     */
    private getDeclarationsFromNode(node: ts.Node): ts.Declaration[] {
      const symbolNode = this.findSymbolNode(node);
      if (!symbolNode) {
        return [];
      }
      
      const symbol = this.resolveSymbol(symbolNode);
      if (!symbol) {
        return [];
      }
      
      return this.getDeclarationsFromSymbol(symbol);
    }
    
    /**
     * Finds the appropriate node to get symbol from, based on node type and context.
     *
     * @param node - Input node
     * @returns Node to use for symbol lookup
     */
    private findSymbolNode(node: ts.Node): ts.Node | undefined {
      // Decorator: @test_Anno1({prop1: "1"}) → get identifier
      if (ts.isDecorator(node)) {
        return this.extractIdentifierFromDecorator(node);
      }
      
      // Identifier in various contexts
      if (ts.isIdentifier(node)) {
        return this.handleIdentifierNode(node);
      }
      
      // Call expression: foo() → get foo
      if (ts.isCallExpression(node)) {
        return node.expression;
      }
      
      // New expression: new Foo() → get Foo
      if (ts.isNewExpression(node)) {
        return node.expression;
      }
      
      return node;
    }
    
    /**
     * Extracts identifier from decorator expression.
     * Handles both @Foo and @Foo() formats.
     *
     * @param decorator - Decorator node
     * @returns Identifier node
     */
    private extractIdentifierFromDecorator(decorator: ts.Decorator): ts.Node {
      if (ts.isCallExpression(decorator.expression)) {
        return decorator.expression.expression;
      }
      return decorator.expression;
    }
    
    /**
     * Handles identifier node in different contexts (decorators, property access, etc).
     *
     * @param node - Identifier node
     * @returns Node to use for symbol lookup
     */
    private handleIdentifierNode(node: ts.Identifier): ts.Node {
      if (!node.parent) {
        return node;
      }
      
      // Inside decorator: @Foo or @Foo()
      if (this.isIdentifierInDecorator(node)) {
        return node;
      }
      
      // Property access: obj.prop → always use the name part
      if (ts.isPropertyAccessExpression(node.parent)) {
        if (node.parent.name === node || node.parent.expression === node) {
          return node.parent.name;
        }
      }
      
      return node;
    }
    
    /**
     * Checks if identifier is used inside a decorator.
     *
     * @param node - Identifier node
     * @returns true if inside decorator
     */
    private isIdentifierInDecorator(node: ts.Identifier): boolean {
      const parent = node.parent;
      
      // Direct decorator: @Foo
      if (ts.isDecorator(parent)) {
        return true;
      }
      
      // Call in decorator: @Foo()
      if (ts.isCallExpression(parent) && parent.parent && ts.isDecorator(parent.parent)) {
        return true;
      }
      
      return false;
    }
    
    /**
     * Resolves symbol from node, handling aliases (imports).
     *
     * @param node - Node to get symbol from
     * @returns Resolved symbol, or undefined
     */
    private resolveSymbol(node: ts.Node): ts.Symbol | undefined {
      let symbol = this.typeChecker.getSymbolAtLocation(node);
      
      if (!symbol) {
        return undefined;
      }
      
      // Resolve aliased symbols (imports): import {Foo} from '...' → get original Foo
      if (symbol.flags & ts.SymbolFlags.Alias) {
        const aliasedSymbol = this.typeChecker.getAliasedSymbol(symbol);
        if (aliasedSymbol) {
          symbol = aliasedSymbol;
        }
      }
      
      return symbol;
    }
    
    /**
     * Gets declarations from symbol, handling variable declarations specially.
     * For variables, tries to get the actual type's declaration instead of variable itself.
     *
     * @param symbol - Symbol to get declarations from
     * @returns Array of declarations
     */
    private getDeclarationsFromSymbol(symbol: ts.Symbol): ts.Declaration[] {
      let declarations = Array.from(symbol.declarations || []);
      
      if (declarations.length === 0) {
        return [];
      }
      
      // For variables, try to get the actual type's declaration
      // const foo: Bar = new Bar() → get Bar's declaration, not the variable declaration
      const firstDecl = declarations[0];
      if (ts.isVariableDeclaration(firstDecl)) {
        const typeDeclarations = this.getTypeDeclarations(firstDecl);
        if (typeDeclarations.length > 0) {
          return typeDeclarations;
        }
      }
      
      return declarations;
    }
    
    /**
     * Gets type declarations from variable declaration.
     *
     * @param varDecl - Variable declaration
     * @returns Array of type's declarations
     */
    private getTypeDeclarations(varDecl: ts.VariableDeclaration): ts.Declaration[] {
      const type = this.typeChecker.getTypeAtLocation(varDecl);
      
      if (type?.symbol?.declarations) {
        return Array.from(type.symbol.declarations);
      }
      
      return [];
    }
    
    /**
     * Finds the highest @Available version in parent nodes of the CALL SITE.
     * Walks up the AST tree to find wrapping @Available decorators.
     *
     * @param node - The usage node
     * @returns Highest version found in parents, or undefined
     */
    private findParentVersion(node: ts.Node): string | undefined {
      const versions: string[] = [];
      let current: ts.Node | undefined = node.parent;
      let depth = 0;
      
      // Walk up the AST tree
      while (current) {
        depth++;
        
        // Check for @Available decorators on this parent node
        const decorators = this.getAvailableFromDeclaration(current);
        for (const dec of decorators) {
          const version = this.extractMinApiFromDecorator(dec);
          if (version) {
            versions.push(version);
          }
        }
        
        current = current.parent;
        
        // Safety limit to prevent infinite loops
        if (depth > 50) {
          break;
        }
      }
      
      if (versions.length === 0) {
        return undefined;
      }
      
      return this.getHighestVersion(versions);
    }
    
    /**
     * Extract @Available decorator from a node using both AST API and regex fallback.
     *
     * Strategy:
     * 1. Try ts.getDecorators() first (AST API)
     * 2. If fails, use regex fallback for special types
     *
     * @param decl - Node to extract decorators from
     * @returns Array of @Available decorators found
     */
    private getAvailableFromDeclaration(decl: ts.Node): ts.Decorator[] {
      // Try AST API first
      if (ts.canHaveDecorators(decl)) {
        const decorators = ts.getDecorators(decl) ?? [];
        const available = decorators.filter(dec =>
          ts.isCallExpression(dec.expression) &&
          ts.isIdentifier(dec.expression.expression) &&
          dec.expression.expression.text === 'Available'
        );
        if (available.length > 0) {
          return available;
        }
      }
      
      // Regex fallback for nodes that can have decorators but AST API doesn't work
      // This handles types like AnnotationDeclaration and StructDeclaration
      const canHaveOwnDecorator =
        ts.isFunctionDeclaration(decl) ||
        ts.isClassDeclaration(decl) ||
        ts.isMethodDeclaration(decl) ||
        ts.isPropertyDeclaration(decl) ||
        ts.isInterfaceDeclaration(decl) ||
        ts.isEnumDeclaration(decl) ||
        ts.isTypeAliasDeclaration(decl) ||
        ts.isVariableStatement(decl) ||
        ts.isModuleDeclaration(decl) ||
        // Special types (not in standard TypeScript)
        ts.SyntaxKind[decl.kind] === 'AnnotationDeclaration' ||
        ts.SyntaxKind[decl.kind] === 'StructDeclaration';
      
      if (!canHaveOwnDecorator) {
        return [];
      }
      
      // Regex fallback: extract @Available decorators from text
      const text = decl.getText();
      const regex = /@\s*Available\s*\(\s*\{[\s\S]*?\}\s*\)/g;
      const matches = Array.from(text.matchAll(regex));
      
      if (matches.length === 0) {
        return [];
      }
      
      const result: ts.Decorator[] = [];
      
      // Parse each matched decorator text and create decorator nodes
      for (const match of matches) {
        const decoratorText = match[0].replace('@', '');
        const tempSource = ts.createSourceFile(
          'temp.ts',
          decoratorText,
          ts.ScriptTarget.ESNext,
          true,
          ts.ScriptKind.TS
        );
        
        ts.forEachChild(tempSource, (stmt) => {
          if (ts.isExpressionStatement(stmt) && ts.isCallExpression(stmt.expression)) {
            result.push(ts.factory.createDecorator(stmt.expression));
          }
        });
      }
      
      return result;
    }
    
    /**
     * Extract minApiVersion from an @Available decorator.
     *
     * @param dec - Decorator node
     * @returns Version string, or undefined
     */
    private extractMinApiFromDecorator(dec: ts.Decorator): string | undefined {
      const callExpr = this.getAvailableCallExpression(dec);
      if (!callExpr){
        return undefined;
      }
      
      const arg = this.getFirstArgument(callExpr);
      if (!arg || !ts.isObjectLiteralExpression(arg)){
        return undefined;
      }
      
      // Edge case: empty properties array (malformed AST)
      if (arg.properties.length === 0) {
        return this.extractVersionFromEmptyObject(arg);
      }
      
      // Normal case: parse properties
      return this.findMinApiVersionProperty(arg);
    }
    
    /**
     * Validates and extracts the call expression from @Available decorator.
     *
     * @param dec - Decorator node
     * @returns Call expression if valid, undefined otherwise
     */
    private getAvailableCallExpression(dec: ts.Decorator): ts.CallExpression | undefined {
      if (!ts.isCallExpression(dec.expression)){
        return undefined;
      }
      
      const callExpr = dec.expression;
      if (!ts.isIdentifier(callExpr.expression)){
        return undefined;
      }
      if (callExpr.expression.text !== 'Available'){
        return undefined;
      }
      
      return callExpr;
    }
    
    /**
     * Gets the first argument from a call expression.
     *
     * @param callExpr - Call expression
     * @returns First argument, or undefined
     */
    private getFirstArgument(callExpr: ts.CallExpression): ts.Expression | undefined {
      if (callExpr.arguments.length === 0){
        return undefined;
      }
      return callExpr.arguments[0];
    }
    
    /**
     * Extracts version from object literal when AST properties array is empty.
     * Fallback to regex parsing of the text.
     *
     * @param arg - Object literal expression
     * @returns Version string, or undefined
     */
    private extractVersionFromEmptyObject(arg: ts.ObjectLiteralExpression): string | undefined {
      const text = arg.getText();
      const match = this.MIN_API_VERSION_REGEX.exec(text);
      
      if (!match){
        return undefined;
      }
      
      const versionMatch = this.VERSION_MATCH_REGEX.exec(match[0]);
      return versionMatch ? this.parseVersionString(versionMatch[2]) : undefined;
    }
    
    /**
     * Finds and extracts minApiVersion property from object literal.
     *
     * @param arg - Object literal expression
     * @returns Version string, or undefined
     */
    private findMinApiVersionProperty(arg: ts.ObjectLiteralExpression): string | undefined {
      for (const prop of arg.properties) {
        if (!ts.isPropertyAssignment(prop)) {
          continue;
        }
        
        const propName = this.getPropertyName(prop);
        if (propName !== this.MIN_API_VERSION) {
          continue;
        }
        
        return this.extractVersionFromValue(prop.initializer);
      }
      
      return undefined;
    }
    
    /**
     * Gets property name from property assignment, handling various name types.
     *
     * @param prop - Property assignment node
     * @returns Property name as string
     */
    private getPropertyName(prop: ts.PropertyAssignment): string {
      if (ts.isIdentifier(prop.name)) {
        return prop.name.text;
      }
      
      if (ts.isStringLiteral(prop.name)) {
        return prop.name.text;
      }
      
      // Computed property names
      return prop.name.getText().replace(/['"]/g, '');
    }
    
    /**
     * Extracts version value from property initializer expression.
     *
     * @param value - Expression node
     * @returns Version string, or undefined
     */
    private extractVersionFromValue(value: ts.Expression): string | undefined {
      if (ts.isStringLiteral(value)) {
        return this.parseVersionString(value.text);
      }
      
      if (ts.isNumericLiteral(value)) {
        return this.parseVersionString(value.text.toString());
      }
      
      return undefined;
    }
    
    /**
     * Parse version string to extract the API level.
     * Uses runtime-specific format validation.
     *
     * Runtime behavior:
     * - OpenHarmony: Integer only (1-999), validated with defaultFormatCheckerWithoutMSF
     * - Other runtimes: External format checker allows more flexible formats
     *
     * Supported formats (OpenHarmony):
     * - "21" → "21" 
     * - "5.0.3(22)" → "22" (extracts from parentheses)
     * - "OpenHarmony 21" → "21"
     *
     * Invalid formats (OpenHarmony):
     * - "21.1" → undefined ❌ (not an integer)
     * - "0" → undefined ❌ (must be 1-999)
     * - "01" → undefined ❌ (no leading zeros)
     * - "1000" → undefined ❌ (max 999)
     *
     * @param versionStr - Version string to parse
     * @returns Valid version string, or undefined if invalid
     */
    private parseVersionString(versionStr: string): string | undefined {
      // Extract API level from parentheses: "5.0.3(22)" → "22"
      const parenMatch = /\((\d+)\)/.exec(versionStr);
      if (parenMatch) {
        const extracted = parenMatch[1];
        // Runtime-specific validation
        const isValid = isOpenHarmonyRuntime() 
          ? defaultFormatCheckerWithoutMSF(extracted)
          : this.formatChecker(extracted);
        return isValid ? extracted : undefined;
      }
      
      // Remove OS prefix: "OpenHarmony 21" → "21"
      const cleanVersion = versionStr
        .replace(/^(OpenHarmony)\s+/i, '')
        .trim();
      
      // Runtime-specific validation
      // OpenHarmony: Use default checker for integer-only validation
      // Other runtimes: Use external checker for flexible format
      const isValid = isOpenHarmonyRuntime() 
        ? defaultFormatCheckerWithoutMSF(cleanVersion)
        : this.formatChecker(cleanVersion);
      
      if (!isValid) {
        return undefined;
      }
      
      return cleanVersion;
    }
    
    /**
     * Gets the highest version from a list of version strings.
     *
     * @param versions - Array of version strings
     * @returns Highest version string
     */
    private getHighestVersion(versions: string[]): string {
      return versions.reduce((highest, current) => {
        return this.compareVersions(current, highest) > 0 ? current : highest;
      });
    }
    
    /**
     * Compares two version strings using runtime-specific logic.
     *
     * Runtime behavior:
     * - OpenHarmony: Simple integer comparison (1-99)
     * - Other runtimes: Uses external value checker with scenario based on version format:
     *   - 1-99 range: SuppressWithoutMSF (1) - for sdkApiVersion
     *   - 5+ digits (e.g., 60000): SuppressWithMSF (2) - for distributionOSApiVersion
     *
     * @param v1 - First version string
     * @param v2 - Second version string
     * @returns positive if v1 > v2, negative if v1 < v2, 0 if equal
     */
    private compareVersions(v1: string, v2: string): number {
      // OpenHarmony: Simple integer comparison
      if (isOpenHarmonyRuntime()) {
        return this.compareVersionsAsInteger(v1, v2);
      }
      
      // Other runtimes: Use external value checker
      if (this.valueChecker) {
        try {
          // Determine scenario based on version format
          const scenario = this.determineComparisonScenario(v1, v2);
          
          // Check if v1 >= v2
          const result = this.valueChecker(v2, v1, scenario);
          
          // result.result is true if v1 >= v2 (compatible)
          if (result.result) {
            // Check reverse to determine equality
            const reverseResult = this.valueChecker(v1, v2, scenario);
            return reverseResult.result ? 0 : 1; // 0 if equal, 1 if v1 > v2
          }
          
          return -1; // v1 < v2
        } catch (error) {
          console.warn('Version comparison failed, using fallback:', error);
          return this.compareVersionsWithLocale(v1, v2);
        }
      }
      
      // Fallback: No valueChecker available
      return this.compareVersionsWithLocale(v1, v2);
    }
    
    /**
     * Compares two version strings as integers.
     * Used for OpenHarmony runtime where versions are guaranteed to be integers (1-99).
     *
     * @param v1 - First version string
     * @param v2 - Second version string
     * @returns positive if v1 > v2, negative if v1 < v2, 0 if equal
     */
    private compareVersionsAsInteger(v1: string, v2: string): number {
      const num1 = parseInt(v1, 10);
      const num2 = parseInt(v2, 10);
      
      if (isNaN(num1) || isNaN(num2)) {
        return 0;
      }
      
      return num1 - num2;
    }
    
    /**
     * Compares two version strings using locale-aware numeric comparison.
     * Fallback method when other comparison strategies are not available.
     *
     * @param v1 - First version string
     * @param v2 - Second version string
     * @returns positive if v1 > v2, negative if v1 < v2, 0 if equal
     */
    private compareVersionsWithLocale(v1: string, v2: string): number {
      return v1.localeCompare(v2, undefined, { numeric: true });
    }
    
    /**
     * Determines the appropriate comparison scenario based on version format.
     *
     * Logic:
     * - If any version is 5+ digits (e.g., 60000): Use SuppressWithMSF (2)
     *   → This is for distributionOSApiVersion checks
     * - If both versions are 1-99 range: Use SuppressWithoutMSF (1)
     *   → This is for sdkApiVersion checks
     *
     * Examples:
     * - if (sdkApiVersion > 20) → 20 is in 1-99 range → Scenario 1
     * - if (distributionOSApiVersion > 60000) → 60000 is 5 digits → Scenario 2
     *
     * @param v1 - First version string
     * @param v2 - Second version string
     * @returns Comparison scenario (1 or 2)
     */
    private determineComparisonScenario(v1: string, v2: string): ComparisonSenario {
      const num1 = parseInt(v1, 10);
      const num2 = parseInt(v2, 10);
      
      // If parsing fails, default to SuppressWithoutMSF
      if (isNaN(num1) || isNaN(num2)) {
        return ComparisonSenario.SuppressWithoutMSF;
      }
      
      // Check if any version is 5+ digits (e.g., 60000+)
      // This indicates distributionOSApiVersion usage
      if (num1 >= 10000 || num2 >= 10000) {
        return ComparisonSenario.SuppressWithMSF; // Scenario 2
      }
      
      // Both versions are in normal range (1-99)
      // This indicates sdkApiVersion usage
      return ComparisonSenario.SuppressWithoutMSF; // Scenario 1
    }
  }