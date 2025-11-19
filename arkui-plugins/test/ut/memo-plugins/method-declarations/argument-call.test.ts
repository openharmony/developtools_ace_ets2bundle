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

const METHOD_DIR_PATH: string = 'memo/methods';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, METHOD_DIR_PATH, 'argument-call.ets')];

const pluginTester = new PluginTester('test memo method', buildConfig);

const expectedScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.incremental.runtime.state\";
import { memo as memo } from \"arkui.stateManagement.runtime\";
function main() {}
class Test {
    @Memo() 
    public lambda_arg(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @Memo() arg: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_arg = __memo_scope.param(0, arg);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        {
            __memo_scope.recache();
            return;
        }
    }
    @Memo() 
    public lambda_arg_with_arg(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @Memo() arg: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string)=> string)) {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_arg = __memo_scope.param(0, arg);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        {
            __memo_scope.recache();
            return;
        }
    }
    @Memo() 
    public memo_content(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @Memo() content: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_content = __memo_scope.param(0, content);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        __memo_parameter_content.value(__memo_context, ((__memo_id) + (<some_random_number>)));
        {
            __memo_scope.recache();
            return;
        }
    }
    @Memo() 
    public compute_test(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @Memo() arg1: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined), arg2: ((()=> void) | undefined), content: ((()=> void) | undefined)): void {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 3);
        const __memo_parameter_arg1 = __memo_scope.param(0, arg1), __memo_parameter_arg2 = __memo_scope.param(1, arg2), __memo_parameter_content = __memo_scope.param(2, content);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        {
            __memo_scope.recache();
            return;
        }
    }
    public constructor() {}
}
class Use {
    @Memo() 
    public test(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        const test = new Test();
        test.lambda_arg(__memo_context, ((__memo_id) + (<some_random_number>)), ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            {
                __memo_scope.recache();
                return;
            }
        }));
        test.lambda_arg_with_arg(__memo_context, ((__memo_id) + (<some_random_number>)), ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string): string => {
            const __memo_scope = __memo_context.scope<string>(((__memo_id) + (<some_random_number>)), 1);
            const __memo_parameter_value = __memo_scope.param(0, value);
            if (__memo_scope.unchanged) {
                return __memo_scope.cached;
            }
            return __memo_scope.recache(__memo_parameter_value.value);
        }));
        test.compute_test(__memo_context, ((__memo_id) + (<some_random_number>)), ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            {
                __memo_scope.recache();
                return;
            }
        }), (() => {}), (() => {}));
        {
            __memo_scope.recache();
            return;
        }
    }
    public constructor() {}
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform argument calls in methods',
    [beforeMemoNoRecheck, memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
