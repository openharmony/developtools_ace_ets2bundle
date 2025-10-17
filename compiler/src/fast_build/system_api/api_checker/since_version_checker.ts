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
  SINCE_TAG_NAME
} from '../api_check_define';
import { BaseVersionChecker } from './base_version_checker';
import { 
  getValueChecker, 
  getFormatChecker,
  defaultFormatCheckerWithoutMSF,
  defaultValueChecker
} from '../api_check_utils';

/*
 * Checker for the @since JSDoc annotation.
 * 
 * This class extracts @since tags from JSDoc comments and validates whether
 * the current SDK version is compatible with the required minimum version.
 *
 * The @since tag is a standard JSDoc annotation used to document when an API
 */
export class SinceJSDocChecker extends BaseVersionChecker {
  private jsDocTags?: readonly ts.JSDocTag[];
  
  constructor(typeChecker?: ts.TypeChecker) {
    super(typeChecker);
    this.init();
  }

  /**
   * Initializes the checker by loading appropriate comparison and validation functions.
   * 
   * Plugin loading strategy for @since:
   * - CompatibilityCheck: Loads from external plugin (checkSinceValue) or uses default
   * - FormatValidation: NOT in config, always uses built-in default (defaultFormatCheckerWithoutMSF)
   * 
   * Process:
   * 1. Set SDK version from project config
   * 2. Load value checker (comparison function) from external plugins or use default
   * 3. Use default format checker (no plugin configured for @since format validation)
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

    // Load value checker (comparison function) for @since tag
    // Config: "apiCheckPlugin" → "type": "CompatibilityCheck" → "checkSinceValue"
    // This function compares two versions and returns VersionValidationResult
    const valueChecker = getValueChecker(SINCE_TAG_NAME);
    if (valueChecker) {
      this.versionCompareFunction = valueChecker;
    } else {
      this.versionCompareFunction = defaultValueChecker;
    }

    // Load format checker (validation function) for @since tag
    // NOTE: Config does NOT include FormatValidation for @since
    // Will always use default format checker (defaultFormatCheckerWithoutMSF)
    const formatChecker = getFormatChecker(SINCE_TAG_NAME);
    if (formatChecker) {
      this.versionValidFunction = formatChecker;
    } else {
      // Expected path: No FormatValidation plugin configured for @since
      this.versionValidFunction = defaultFormatCheckerWithoutMSF;
    }
  }

  /**
   * Public method to set JSDoc tags from outside.
   * 
   * This allows callers to provide pre-extracted JSDoc tags,
   * which is useful when the same tags need to be processed multiple times
   * or when tags are extracted in a different context.
   * 
   * @param jsDocTags - Array of JSDoc tags from the caller
   */
  public setJSDocTags(jsDocTags: readonly ts.JSDocTag[]): void {
    this.jsDocTags = jsDocTags;
  }

  /**
   * Extract @since version from JSDoc comments.
   * 
   * This method uses externally provided tags if available,
   * otherwise extracts from the node's JSDoc array.
   * 
   * IMPORTANT: Processes JSDoc blocks in order and returns the FIRST @since found.
   * 
   * Supported version formats:
   * - "21"
   * - "5.0.0"
   * - "5.0.3(22)"
   * - "OpenHarmony 5.0.3(22)"
   * 
   * @param node - AST node to inspect for @since JSDoc tag
   * @returns true if @since tag found, false otherwise
   */
  protected parseVersion(node: ts.Node): boolean {
    // Priority 1: Use externally provided tags if available
    if (this.jsDocTags && this.jsDocTags.length > 0) {
      return this._parseSinceFromTags(this.jsDocTags, node);
    }

    // Priority 2: Extract from node's JSDoc array (original behavior)
    const jsDocs = node.jsDoc as ts.JSDoc[] | undefined;
    
    if (!jsDocs || jsDocs.length === 0) {
      return false;
    }

    // Process JSDoc blocks in order, return first @since found
    for (const doc of jsDocs) {
      if (!doc.tags) {
        continue;
      }

      const found = this._parseSinceFromTags(doc.tags, node);
      if (found) {
        return true; // Stop at first @since found
      }
    }

    return false;
  }

  /**
   * Parse @since tag from an array of JSDoc tags.
   * This is the core parsing logic.
   * 
   * The method:
   * 1. Iterates through all tags
   * 2. Finds tags with name "since"
   * 3. Extracts and validates the version string
   * 4. Sets this.minApiVersion if valid
   * 
   * @param tags - Array of JSDoc tags
   * @param node - The node to extract context from (optional)
   * @returns true if @since tag found and parsed, false otherwise
   */
  private _parseSinceFromTags(tags: readonly ts.JSDocTag[], node?: ts.Node): boolean {
    if (!tags.length) {
      return false;
    }

    for (const tag of tags) {
      const tagName = tag.tagName.text || tag.tagName.escapedText?.toString();

      if (tagName === SINCE_TAG_NAME) {
        const versionString = tag.comment?.toString() || '';

        if (!versionString) {
          continue;
        }

        this.minApiVersion = versionString;
        return true; // Found valid @since, stop processing
      }
    }

    return false;
  }
}