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
import { memoNoRecheck, recheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';

const LAMBDA_DIR_PATH: string = 'memo/lambdas';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, LAMBDA_DIR_PATH, 'trailing-lambdas.ets'),
];

const pluginTester = new PluginTester('test memo lambda', buildConfig);

const expectedScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.stateManagement.runtime\";
import { memo as memo } from \"arkui.stateManagement.runtime\";
function main() {}
@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    let a = new A();
    a.foo(__memo_context, ((__memo_id) + (<some_random_number>)), (() => {
        console.log();
    }));
    a.goo(((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        console.log();
        {
            __memo_scope.recache();
            return;
        }
    }));
    a.koo(__memo_context, ((__memo_id) + (<some_random_number>)), ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        console.log();
        {
            __memo_scope.recache();
            return;
        }
    }));
    bar(__memo_context, ((__memo_id) + (<some_random_number>)), (() => {
        console.log();
    }));
    par(((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        console.log();
        {
            __memo_scope.recache();
            return;
        }
    }));
    kar(__memo_context, ((__memo_id) + (<some_random_number>)), ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        console.log();
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
@functions.OptionalParametersAnnotation({minArgCount:0}) function bar(__memo_context: __memo_context_type, __memo_id: __memo_id_type, f?: (()=> void)): void {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 1);
    const __memo_parameter_f = __memo_scope.param(0, f);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    {
        __memo_scope.recache();
        return;
    }
}
@functions.OptionalParametersAnnotation({minArgCount:0}) function par(f?: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void {}
@functions.OptionalParametersAnnotation({minArgCount:0}) function kar(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @memo() f?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 1);
    const __memo_parameter_f = __memo_scope.param(0, f);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    {
        __memo_scope.recache();
        return;
    }
}
class A {
    @functions.OptionalParametersAnnotation({minArgCount:0}) public foo(__memo_context: __memo_context_type, __memo_id: __memo_id_type, p?: (()=> void)): void {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_p = __memo_scope.param(0, p);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        {
            __memo_scope.recache();
            return;
        }
    }
    @functions.OptionalParametersAnnotation({minArgCount:0}) public goo(@memo() p?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void {}
    @functions.OptionalParametersAnnotation({minArgCount:0}) public koo(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @memo() p?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_p = __memo_scope.param(0, p);
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
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform trailing lambdas',
    [memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
