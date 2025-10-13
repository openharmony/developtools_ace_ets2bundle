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
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, LAMBDA_DIR_PATH, 'with-receiver.ets'),
];

const pluginTester = new PluginTester('test memo lambda', buildConfig);

const expectedScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.stateManagement.runtime\";
import { memo as memo } from \"arkui.stateManagement.runtime\";

function main() {}

@memo() function fullName(this: Person, __memo_context: __memo_context_type, __memo_id: __memo_id_type, @memo() arg?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 2);
    const __memo_parameter_this = __memo_scope.param(0, this), __memo_parameter_arg = __memo_scope.param(1, arg);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    {
        __memo_scope.recache();
        return;
    }
}

@memo() function foo(this: A, __memo_context: __memo_context_type, __memo_id: __memo_id_type, @memo() arg?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 2);
    const __memo_parameter_this = __memo_scope.param(0, this), __memo_parameter_arg = __memo_scope.param(1, arg);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    {
        __memo_scope.recache();
        return;
    }
}

@memo() function goo(__memo_context: __memo_context_type, __memo_id: __memo_id_type, a: A, @memo() arg?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 2);
    const __memo_parameter_a = __memo_scope.param(0, a), __memo_parameter_arg = __memo_scope.param(1, arg);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    {
        __memo_scope.recache();
        return;
    }
}

@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    let x = new Person();
    fullName(x, __memo_context, ((__memo_id) + (<some_random_number>)), ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
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
    let f1: F1 = foo;
    let f2: F2 = goo;
    let a = new A();
    f1(a, __memo_context, ((__memo_id) + (<some_random_number>)), ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
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
    f1(a, __memo_context, ((__memo_id) + (<some_random_number>)), ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
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
    f2(__memo_context, ((__memo_id) + (<some_random_number>)), a, ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
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

class Person {
    public constructor() {}
}

class A {
    public constructor() {}
}

@memo() type F1 = ((this: A, __memo_context: __memo_context_type, __memo_id: __memo_id_type, @memo() arg?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void))=> void);
@memo() type F2 = ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, a: A, @memo() arg?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void))=> void);
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform lambdas with receiver',
    [beforeMemoNoRecheck, memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
