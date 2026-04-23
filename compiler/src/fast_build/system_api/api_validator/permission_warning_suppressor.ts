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
import { BaseWarningSuppressor } from './base_warning_suppressor';
import { PERMISSION_TAG_CHECK_NAME } from '../api_check_define';

/**
 * Suppressor for @permission annotations.
 * Supports annotation and comment based @SuppressWarnings suppression strategies.
 */
export class PermissionWarningSuppressor extends BaseWarningSuppressor {

  constructor() {
    super(PERMISSION_TAG_CHECK_NAME);
  }

  /**
   * Checks if a node's permission warning is suppressed.
   *
   * @param node - The AST node to check
   * @returns True if the warning is properly suppressed, false otherwise
   */
  public isApiVersionHandled(node: ts.Node): boolean {
    if (!node) {
      return false;
    }

    return this.validators.validate(node);
  }
}
