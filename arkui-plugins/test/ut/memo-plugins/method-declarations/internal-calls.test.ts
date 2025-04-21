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
import { PluginTestContext, PluginTester } from '../../../utils/plugin-tester';
import { BuildConfig, mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { memoNoRecheck } from '../../../utils/plugins';

const METHOD_DIR_PATH: string = 'memo/methods';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, METHOD_DIR_PATH, 'internal-calls.ets')];

const pluginTester = new PluginTester('test memo method', buildConfig);

const expectedScript: string = `
import { memo as memo, __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"@ohos.arkui.stateManagement\";
function main() {}
function __context(): __memo_context_type
function __id(): __memo_id_type
type MemoType = @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
class Test {
    public void_method(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        {
            __memo_scope.recache();
            return;
        }
    }
    public internal_call(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        (this).void_method(__memo_context, ((__memo_id) + (<some_random_number>)));
        {
            __memo_scope.recache();
            return;
        }
    }
    public method_with_internals(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        __context();
        __id();
        {
            __memo_scope.recache();
            return;
        }
    }
    public memo_lambda() {
        @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
            const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            {
                __memo_scope.recache();
                return;
            }
        });
    }
    public memo_variables(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        @memo() const f = ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): number => {
            const __memo_scope = __memo_context.scope<number>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                return __memo_scope.cached;
            }
            return __memo_scope.recache(123);
        }), g = ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, x: number): number => {
            const __memo_scope = __memo_context.scope<number>(((__memo_id) + (<some_random_number>)), 1);
            const __memo_parameter_x = __memo_scope.param(0, x);
            if (__memo_scope.unchanged) {
                return __memo_scope.cached;
            }
            return __memo_scope.recache(((123) + (x)));
        });
        const h = @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): number => {
            const __memo_scope = __memo_context.scope<number>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                return __memo_scope.cached;
            }
            return __memo_scope.recache(1);
        });
        f(__memo_context, ((__memo_id) + (<some_random_number>)));
        g(__memo_context, ((__memo_id) + (<some_random_number>)), 1);
        h(__memo_context, ((__memo_id) + (<some_random_number>)));
        {
            __memo_scope.recache();
            return;
        }
    }
    public args_with_default_values(__memo_context: __memo_context_type, __memo_id: __memo_id_type, gensym%%_1?: int, gensym%%_2?: (()=> int), gensym%%_3?: int, arg4?: int): void {
        let arg1: int = (((gensym%%_1) !== (undefined)) ? gensym%%_1 : (10 as int));
        let arg2: (()=> int) = (((gensym%%_2) !== (undefined)) ? gensym%%_2 : ((() => {
            return 20;
        }) as (()=> int)));
        let arg3: int = (((gensym%%_3) !== (undefined)) ? gensym%%_3 : (arg1 as int));
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 4);
        const __memo_parameter_arg1 = __memo_scope.param(0, arg1), __memo_parameter_arg2 = __memo_scope.param(1, arg2), __memo_parameter_arg3 = __memo_scope.param(2, arg3), __memo_parameter_arg4 = __memo_scope.param(3, arg4);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        console.log(__memo_parameter_arg1.value, __memo_parameter_arg2.value, __memo_parameter_arg3.value, __memo_parameter_arg4.value);
        console.log(__memo_parameter_arg2.value());
        {
            __memo_scope.recache();
            return;
        }
    }
    public optional_args(__memo_context: __memo_context_type, __memo_id: __memo_id_type, arg1?: int, arg2?: (()=> int)): void {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 2);
        const __memo_parameter_arg1 = __memo_scope.param(0, arg1), __memo_parameter_arg2 = __memo_scope.param(1, arg2);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        console.log(__memo_parameter_arg1.value);
        console.log(__memo_parameter_arg2.value);
        console.log(({let gensym%%_166 = __memo_parameter_arg2.value;
        (((gensym%%_166) == (null)) ? undefined : gensym%%_166())}));
        {
            __memo_scope.recache();
            return;
        }
    }
    public type_alias(__memo_context: __memo_context_type, __memo_id: __memo_id_type, arg: MemoType): void {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_arg = __memo_scope.param(0, arg);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        __memo_parameter_arg.value(__memo_context, ((__memo_id) + (<some_random_number>)));
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
    'transform inner calls in methods',
    [memoNoRecheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
