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
  FormatCheckerFunction,
  ParsedVersion
} from '../api_check_define';
import { 
  getValueChecker, 
  getFormatChecker,
  defaultFormatCheckerWithoutMSF,
  defaultValueChecker,
  getAvailableDecoratorFromNode,
  extractMinApiFromDecorator
} from '../api_check_utils';
import { BaseVersionChecker } from './base_version_checker';

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
  private availableVersion: ParsedVersion;
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
    this.versionCompareFunction = valueChecker;
    if (this.versionCompareFunction === defaultValueChecker) {
      this.sdkVersion = projectConfig.compatibleSdkVersion.toString();
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

    const decorators: ts.Decorator[] = getAvailableDecoratorFromNode(node);

    // Extract minApiVersion from @Available decorators
    for (const dec of decorators) {
      const minApi = extractMinApiFromDecorator(dec);
      if (!minApi) {
        continue;
      }

      // Validate version format using loaded format checker
      // For OpenHarmony: uses integer-only format (e.g., "21")
      // For other OS: uses format checker from external plugin or default
      const isValidFormat = minApi.os === RUNTIME_OS_OH
        ? defaultFormatCheckerWithoutMSF(minApi.version)
        : this.formatChecker(minApi.raw);

      if (isValidFormat) {
        // Set instance variable for later retrieval
        this.minApiVersion = minApi.version;
        this.availableVersion = minApi;
        return true; // Found valid @Available decorator
      }
    }

    return false; // No valid @Available decorator found
  }
  /**
   * 
   * @returns AvailableMinApi
   */
  public getAvailableVersion(): ParsedVersion {
    return this.availableVersion;
  }
}