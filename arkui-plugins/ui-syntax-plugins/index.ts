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
import { PluginContext, Plugins } from '../common/plugin-context';
import { ParsedUISyntaxLinterTransformer } from './transformers/parsed-ui-syntax-linter-transformer';
import { createUISyntaxRuleProcessor } from './processor';
import rules from './rules';

export function uiSyntaxLinterTransform(): Plugins {
  const processor = createUISyntaxRuleProcessor(rules);
  return {
    name: 'ui-syntax-plugin',
    parsed(this: PluginContext): arkts.EtsScript | undefined {
      const contextPtr = arkts.arktsGlobal.compilerContext?.peer ?? this.getContextPtr();
      if (!contextPtr) {
        return undefined;
      }
      let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
      const node = program.astNode;
      if (node) {
        const script = new ParsedUISyntaxLinterTransformer(processor).visitor(
          node,
        ) as arkts.EtsScript;
        arkts.setAllParents(script);
        this.setArkTSAst(script);
        return script;
      }
      return undefined;
    }
  };
}
