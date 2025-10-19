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
  ComparisonSenario, FormatCheckerFunction, ValueCheckerFunction
} from '../api_check_define';
import { 
  defaultFormatCheckerWithoutMSF,
  defaultValueChecker
} from '../api_check_utils';

/**
 * Strategy interface for version comparison and extraction.
 * Defines the public API that all version checkers must implement.
 * 
 * Note: compare() is intentionally NOT part of this interface.
 * It is a protected method in the base class, shared by all implementations.
 */
export interface ComparisonStrategy {
  /**
   * Checks if a target version annotation is incompatible with the current SDK.
   * @param targetVersion - AST node that may contain version annotation
   * @returns true if incompatible, false if compatible or not found
   */
  checkTargetVersion(targetVersion: ts.Node): boolean;
  /**
   * Returns the minimum API version extracted from the annotation.
   * @returns Version string (e.g., "21", "5.0.0", "5.0.3(22)")
   */
  getMinApiVersion(): string;
}

/**
 * Parsed representation of a version string.
 * Supports both plain numbers and OS-prefixed versions.
 * 
 * Examples:
 * - { version: "21" }
 * - { version: "21.0.1" }
 * - { os: "OpenHarmony", version: "21" }
 */
export interface ParsedVersion {
  os?: string;       // Optional OS name (e.g., OpenHarmony and OtherOS)
  version: string;   // Version number (e.g., "21")
  raw: string;       // raw string (e.g., "21", "OpenHarmony 21")
}

/**
 * Abstract base class for version checkers.
 * 
 * This class provides common functionality for all version annotation checkers:
 * - Version string parsing (multiple formats)
 * - Version comparison logic (using versionCompareFunction)
 * - AST node traversal utilities
 * 
 * Subclasses must implement:
 * - parseVersion(node) - Extract version from specific annotation type
 * - init() - Load appropriate comparison functions
 * 
 * The compare() method is intentionally protected (not in the interface).
 * All subclasses use the same comparison logic via versionCompareFunction.
 */
export abstract class BaseVersionChecker implements ComparisonStrategy {
  protected readonly typeChecker?: ts.TypeChecker;
  protected minApiVersion: string = '';
  protected versionValidFunction: FormatCheckerFunction = defaultFormatCheckerWithoutMSF;
  protected versionCompareFunction: ValueCheckerFunction = defaultValueChecker;
  protected sdkVersion: string = projectConfig.originCompatibleSdkVersion?.toString() || 
                                 projectConfig.compatibleSdkVersion.toString();

  protected constructor(typeChecker?: ts.TypeChecker) {
    this.typeChecker = typeChecker;
  }

  // ============================================================================
  // ABSTRACT METHODS - Must be implemented by subclasses
  // ============================================================================

  /**
   * Abstract method that must be implemented by subclasses.
   * 
   * This method should:
   * 1. Extract the version annotation from the node
   * 2. Set this.minApiVersion (the version string)
   * 3. Return true if annotation found, false otherwise
   * 
   * @param node - TypeScript AST node to parse
   * @returns true if annotation found and parsed, false otherwise
   */
  protected abstract parseVersion(node: ts.Node | ts.Declaration): boolean;

  // ============================================================================
  // PROTECTED METHODS - Available only to subclasses
  // ============================================================================

  /**
   * Compare two version strings (SDK version vs. required version).
   * 
   * This method is protected (not in the public interface) because:
   * - All subclasses use the same implementation
   * - It's an internal detail, not part of the public API
   * - Only subclasses should call it
   * 
   * The comparison is delegated to versionCompareFunction,
   * which checks if the project's configured version is compatible with the target version.
   * 
   * Trigger scenario is 0 (generating warning).
   * 
   * @param sdkVersion - Current project SDK version
   * @param targetVersion - Required version extracted from the annotation
   * @returns true if incompatible (project version < target), false if compatible
   */
  protected compare(sdkVersion: string, targetVersion: string): boolean {
    const target = this._parseVersionString(targetVersion);

    if (!target) {
      return false;
    }

    // versionCompareFunction returns { result: boolean, message: string }
    // result is true if compatible (sdk >= target)
    // We negate it to return true for incompatibility
    // Trigger scenario: 0 = generating warning
    const compareResult = this.versionCompareFunction(target.version, sdkVersion, ComparisonSenario.Trigger);
    return !compareResult.result;
  }

  /**
   * Build a dotted path string from AST nodes.
   * 
   * This is used to generate context names like:
   * - "myFunction"
   * - "MyClass.myMethod"
   * - "obj.prop.method"
   * - "obj[key]"
   * 
   * @param node - AST node to traverse
   * @returns Dotted path string representing the context
   */
  protected _getFullAccessPath(node: ts.Node): string {
    if (ts.isIdentifier(node)) {
      return node.text;
    }
    if (ts.isPropertyAccessExpression(node)) {
      return `${this._getFullAccessPath(node.expression)}.${node.name.text}`;
    }
    if (ts.isElementAccessExpression(node)) {
      return `${this._getFullAccessPath(node.expression)}[${this._getFullAccessPath(node.argumentExpression)}]`;
    }
    if (ts.isThis(node)) {
      return 'this';
    }
    return 'unknown';
  }

  /**
   * Parse a version string into structured format.
   * 
   * Supported formats:
   * - Plain number: "21" → { version: "21" }
   * - Dotted: "5.0.0" → { version: "5.0.0" }
   * - With parentheses: "5.0.3(22)" → { version: "5.0.3(22)" }
   * - OS-prefixed: "OpenHarmony 21" → { os: "OpenHarmony", version: "21" }
   * - Combined: "OpenHarmony 22.0.0" → { os: "OpenHarmony", version: "22.0.0" }
   * 
   * @param raw - Raw version string to parse
   * @returns Parsed version object, or null if format is invalid
   */
  protected _parseVersionString(raw: string): ParsedVersion | null {
    const trimmed = raw.trim();
  
    // Format: "21", "5.0.0", "5.0.3(22)"
    if (/^\d+(\.\d+)*(\(\d+\))?$/.test(trimmed)) {
      return { os: RUNTIME_OS_OH, version: trimmed, raw: raw };
    }
  
    // Format: "OpenHarmony 22.0.0" or "OpenHarmony 22" or "OpenHarmony 5.0.3(22)"
    const match = /^(?<os>[A-Za-z]+(?:\s?[A-Za-z]+)*)\s+(?<version>\d+(?:\.\d+)*(?:\(\d+\))?)$/.exec(trimmed);
    if (match?.groups) {
      return {
        os: match.groups.os,
        version: match.groups.version,
        raw: raw
      };
    }
  
    return null;
  }

  /**
   * Traverse upwards in the AST to find the closest CallExpression node.
   * 
   * This is useful for finding the call expression that contains a decorator
   * or other annotation. The traversal stops when a CallExpression is found
   * or when we've visited all parent nodes.
   * 
   * @param node - Starting node for traversal
   * @returns Closest CallExpression ancestor, or null if not found
   */
  protected _getCallExpressionNode(node: ts.Node): ts.CallExpression | null {
    const visited = new Set<ts.Node>();
    let current: ts.Node | undefined = node;
    while (current && !visited.has(current)) {
      visited.add(current);
      if (ts.isCallExpression(current)) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  // ============================================================================
  // PUBLIC API METHODS - Defined by ComparisonStrategy interface
  // ============================================================================

  /**
   * Main entry point for checking version compatibility.
   * 
   * This method:
   * 1. Extracts version annotation from the node (via parseVersion)
   * 2. Compares it with the current SDK version (via compare)
   * 3. Returns true if there's an incompatibility
   * 
   * After calling this method, if it returns true, you can use:
   * - getMinApiVersion() to get the required version
   * 
   * @param targetVersion - AST node that may contain version annotation
   * @returns true if incompatible, false if compatible or not found
   */
  public checkTargetVersion(targetVersion?: ts.Node): boolean {
    if (!targetVersion) {
      return false;
    }
    
    // Step 1: Extract version annotation and set minApiVersion
    const parsedVersion = this.parseVersion(targetVersion);
    if (!parsedVersion) {
      return false;
    }

    // Step 2: Compare with SDK version
    return this.compare(this.sdkVersion, this.getMinApiVersion());
  }

  /**
   * Returns the minimum API version extracted from the annotation.
   * 
   * This is set by parseVersion() when an annotation is found.
   * Examples: "21", "5.0.0", "5.0.3(22)"
   * 
   * @returns Version string
   */
  public getMinApiVersion(): string {
    return this.minApiVersion;
  }

  /**
   * Returns the SDK version this checker was initialized with.
   * 
   * @returns SDK version string
   */
  public getSdkVersion(): string {
    return this.sdkVersion;
  }
}