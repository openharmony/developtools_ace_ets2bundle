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

const PROPERTY_DIR_PATH: string = 'memo/properties';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, PROPERTY_DIR_PATH, 'interfaces.ets')];

const pluginTester = new PluginTester('test memo property', buildConfig);

const expectedScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.stateManagement.runtime\";
import { memo as memo } from \"arkui.stateManagement.runtime\";
function main() {}
@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    let a: A = {
        arg: (() => {}),
        memo_arg: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            {
                __memo_scope.recache();
                return;
            }
        }),
        memo_union_arg: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            {
                __memo_scope.recache();
                return;
            }
        }),
        arg_memo_type: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            {
                __memo_scope.recache();
                return;
            }
        }),
    };
    {
        __memo_scope.recache();
        return;
    }
});
interface A {
    set arg(arg: (()=> void))
    get arg(): (()=> void)
    @memo() set memo_arg(memo_arg: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void))
    @memo() get memo_arg(): ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)
    @memo() set memo_optional_arg(memo_optional_arg: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined))
    @memo() get memo_optional_arg(): (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)
    @memo() set memo_union_arg(memo_union_arg: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined))
    @memo() get memo_union_arg(): (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)
    set arg_memo_type(arg_memo_type: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void))
    get arg_memo_type(): @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform interface properties',
    [beforeMemoNoRecheck, memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
