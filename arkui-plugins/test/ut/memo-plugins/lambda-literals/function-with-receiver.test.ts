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

import * as path from 'path';
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { beforeMemoNoRecheck, memoNoRecheck, recheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { Plugins } from '../../../../common/plugin-context';
import { uiTransform } from '../../../../ui-plugins';

const LAMBDA_DIR_PATH: string = 'memo/lambdas';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, LAMBDA_DIR_PATH, 'function-with-receiver.ets'),
];

const parsedTransform: Plugins = {
    name: 'state-complex-type',
    parsed: uiTransform().parsed,
};

const pluginTester = new PluginTester('test memo lambda', buildConfig);

const expectedScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";
import { memo as memo } from "arkui.stateManagement.runtime";

function main() {}

@memo() function foo1(this: B, __memo_context: __memo_context_type, __memo_id: __memo_id_type, str: string): void {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (38567515)), 2);
  const __memo_parameter_this = __memo_scope.param(0, this), __memo_parameter_str = __memo_scope.param(1, str);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
  return;
  }
  console.log("Good", __memo_parameter_str.value);
  {
    __memo_scope.recache();
    return;
  }
}

@memo() function foo2(this: B, __memo_context: __memo_context_type, __memo_id: __memo_id_type, str: string): B {
  const __memo_scope = __memo_context.scope<B>(((__memo_id) + (167482260)), 2);
  const __memo_parameter_this = __memo_scope.param(0, this), __memo_parameter_str = __memo_scope.param(1, str);
  if (__memo_scope.unchanged) {
    return __memo_scope.cached;
  }
  console.log("Good", __memo_parameter_str.value);
  return __memo_scope.recache(this);
}

class B {
  @memo() public internal_call(__memo_context: __memo_context_type, __memo_id: __memo_id_type): B {
    const __memo_scope = __memo_context.scope<B>(((__memo_id) + (146437675)), 0);
    if (__memo_scope.unchanged) {
      return __memo_scope.cached;
    }
    foo1(this, __memo_context, ((__memo_id) + (119664703)), "morning");
    return __memo_scope.recache(foo2(this, __memo_context, ((__memo_id) + (181969214)), "afternoon"));
  }
  
  public constructor() {}
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform lambdas about function with receiver feature',
    [parsedTransform, beforeMemoNoRecheck, memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
