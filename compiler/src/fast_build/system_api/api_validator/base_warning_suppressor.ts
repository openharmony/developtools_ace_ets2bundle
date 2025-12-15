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

import { AnnotateSuppressWarningsValidator, CommentSuppressWarningsValidator, CompositeValidator, NodeValidator } from './api_validate_node';
import { SUPPRESSWARNINGS_RULE_INFO } from '../api_check_define';

/**
 * Composite validator that combines multiple foundation validators.
 * 
 * Only verify the alarm prompts that need to be suppressed
 * SUPPRESSWARNINGS_RULE_INFO
 * 
 * The basic verifier includes:
 * AnnotateSuppressWarningsValidator ---annotate validator
 * CommentSuppressWarningsValidator ---comment validator
 * 
 * A node is considered valid if ANY of the validators pass.
 */
export abstract class BaseWarningSuppressor {
  public validators: NodeValidator;
  constructor(tagName: string) {
    if (!SUPPRESSWARNINGS_RULE_INFO.has(tagName)) {
      this.validators = new CompositeValidator([]);
      return;
    }
    this.validators = new CompositeValidator([
      new AnnotateSuppressWarningsValidator(),
      new CommentSuppressWarningsValidator()
    ])
  }

}
