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

const LAMBDA_DIR_PATH: string = 'memo/lambdas';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, LAMBDA_DIR_PATH, 'argument-call.ets')];

const pluginTester = new PluginTester('test memo lambda', buildConfig);

const expectedScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.incremental.runtime.state\";
import { Memo as Memo } from \"arkui.incremental.annotation\";
function main() {}
((arg: (()=> void)) => {})((() => {}));

((arg: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) => {})(@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
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

((gensym%%_1?: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) => {
    let arg: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) = (((gensym%%_1) !== (undefined)) ? gensym%%_1 : ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (201676739)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    {
        __memo_scope.recache();
        return;
    }
    }));
})(@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (209782503)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    {
        __memo_scope.recache();
        return;
    }
}));

@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, gensym%%_<some_random_number>?: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) => {
        let arg: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) = (((gensym%%_<some_random_number>) !== (undefined)) ? gensym%%_<some_random_number> : ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
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
    })(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
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
    {
        __memo_scope.recache();
        return;
    }
});

@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    let goo = @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, gensym%%_<some_random_number>?: string) => {
        let name: string = (((gensym%%_<some_random_number>) !== (undefined)) ? gensym%%_<some_random_number> : \"old\");
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_name = __memo_scope.param(0, name);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        {
            __memo_scope.recache();
            return;
        }
    });
    goo(__memo_context, ((__memo_id) + (<some_random_number>)));
    {
        __memo_scope.recache();
        return;
    }
});

(() => {
    let foo = ((gensym%%_<some_random_number>?: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) => {
        let arg: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) = (((gensym%%_<some_random_number>) !== (undefined)) ? gensym%%_<some_random_number> : ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
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
    });
    foo(@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
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
});
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform argument calls in lambdas',
    [beforeMemoNoRecheck, memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
