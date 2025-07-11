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

const FUNCTION_DIR_PATH: string = 'memo/functions';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'argument-call.ets')];

const pluginTester = new PluginTester('test memo function', buildConfig);

const expectedScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.stateManagement.runtime\";
import { memo as memo } from \"arkui.stateManagement.runtime\";
function main() {}
@memo() function memo_arg_call(__memo_context: __memo_context_type, __memo_id: __memo_id_type, arg1: number, arg2: ((x: number)=> number), @memo() arg3: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, x: number)=> number), arg4?: ((x: number)=> number), @memo() arg5?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, x: number)=> number)) {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 5);
    const __memo_parameter_arg1 = __memo_scope.param(0, arg1), __memo_parameter_arg2 = __memo_scope.param(1, arg2), __memo_parameter_arg3 = __memo_scope.param(2, arg3), __memo_parameter_arg4 = __memo_scope.param(3, arg4), __memo_parameter_arg5 = __memo_scope.param(4, arg5);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    __memo_parameter_arg2.value(__memo_parameter_arg1.value);
    __memo_parameter_arg3.value(__memo_context, ((__memo_id) + (<some_random_number>)), __memo_parameter_arg1.value);
    ({let gensym%%_<some_random_number> = __memo_parameter_arg4.value;
        (((gensym%%_<some_random_number>) == (null)) ? undefined : gensym%%_<some_random_number>(__memo_parameter_arg1.value))});
    ({let gensym%%_<some_random_number> = __memo_parameter_arg5.value;
        (((gensym%%_<some_random_number>) == (null)) ? undefined : gensym%%_<some_random_number>(__memo_context, ((__memo_id) + (<some_random_number>)), __memo_parameter_arg1.value))});
    {
        __memo_scope.recache();
        return;
    }
}
@memo() function memo_arg_call_with_lowering(__memo_context: __memo_context_type, __memo_id: __memo_id_type, arg1: number, arg4?: ((x: number)=> number), @memo() arg5?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, x: number)=> number)) {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 3);
    const __memo_parameter_arg1 = __memo_scope.param(0, arg1), __memo_parameter_arg4 = __memo_scope.param(1, arg4), __memo_parameter_arg5 = __memo_scope.param(2, arg5);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    {
        let gensym___<some_random_number> = __memo_parameter_arg4.value;
            (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>(__memo_parameter_arg1.value));
    }
    {
        let gensym___<some_random_number> = __memo_parameter_arg5.value;
            (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>(__memo_context, ((__memo_id) + (<some_random_number>)), __memo_parameter_arg1.value));
    }
    {
        __memo_scope.recache();
        return;
    }
}
@memo() function args_with_default_values(__memo_context: __memo_context_type, __memo_id: __memo_id_type, gensym%%_<some_random_number>?: int, @memo() gensym%%_<some_random_number>?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> int), gensym%%_<some_random_number>?: int, arg4?: int): void {
    let arg1: int = (((gensym%%_<some_random_number>) !== (undefined)) ? gensym%%_<some_random_number> : (10 as int));
    let arg2: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> int) = (((gensym%%_<some_random_number>) !== (undefined)) ? gensym%%_<some_random_number> : (((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<int>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            return __memo_scope.cached;
        }
        return __memo_scope.recache(20);
    }) as ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> int)));
    let arg3: int = (((gensym%%_<some_random_number>) !== (undefined)) ? gensym%%_<some_random_number> : (arg1 as int));
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 4);
    const __memo_parameter_arg1 = __memo_scope.param(0, arg1), __memo_parameter_arg2 = __memo_scope.param(1, arg2), __memo_parameter_arg3 = __memo_scope.param(2, arg3), __memo_parameter_arg4 = __memo_scope.param(3, arg4);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    console.log(__memo_parameter_arg1.value, __memo_parameter_arg2.value, __memo_parameter_arg3.value, __memo_parameter_arg4.value);
    console.log(__memo_parameter_arg2.value(__memo_context, ((__memo_id) + (<some_random_number>))));
    {
        __memo_scope.recache();
        return;
    }
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform argument calls in functions',
    [beforeMemoNoRecheck, memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
