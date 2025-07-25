/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';

export type FixSuggestion = {
  range: [start: arkts.SourcePosition, end: arkts.SourcePosition];
  code: string;
};

export type ReportOptions = {
  node: arkts.AstNode;
  message: string;
  data?: Record<string, string>;
  fix?: (node: arkts.AstNode) => FixSuggestion;
};

export type UISyntaxRuleContext = {
  report(options: ReportOptions): void;
  containerComponents?: Set<string> | undefined;
};

export type UISyntaxRuleHandler = (node: arkts.AstNode) => void;

export type UISyntaxRule = {
  name: string;
  messages: Record<string, string>;
  setup(context: UISyntaxRuleContext): {
    parsed?: UISyntaxRuleHandler;
  };
};
