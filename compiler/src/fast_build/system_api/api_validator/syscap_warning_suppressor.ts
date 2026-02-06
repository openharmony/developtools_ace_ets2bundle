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
import { BaseWarningSuppressor } from './base_warning_suppressor';
import { SYSCAP_TAG_CHECK_NAME } from '../api_check_define';


/**
 * Suppressor for @syscap annotations.
 */
export class SyscapWarningSuppressor extends BaseWarningSuppressor {

  constructor() {
    super(SYSCAP_TAG_CHECK_NAME);
  }

  /**
   * Check whether the use of nodes is suppressed by the corresponding policy.
   *
   * @param node - The AST node to check
   * @returns True if the node is properly handled, false otherwise
   */
  public isApiVersionHandled(node: ts.Node): boolean {
    if (!node) {
      return false;
    }

    return this.validators.validate(node);
  }
}