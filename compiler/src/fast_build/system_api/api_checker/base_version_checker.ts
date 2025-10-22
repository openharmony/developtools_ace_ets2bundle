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
  ComparisonSenario,
  FormatCheckerFunction,
  ValueCheckerFunction
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
   * @returns true if incompatible (project version < target), false if compatible
   */
  protected abstract compare(): boolean

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
    return this.compare();
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