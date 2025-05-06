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

const LAMBDA_DIR_PATH: string = 'memo/lambdas';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, LAMBDA_DIR_PATH, 'with-receiver.ets'),
];

const pluginTester = new PluginTester('test memo lambda', buildConfig);

const expectedScript: string = `
import { memo as memo, __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"@ohos.arkui.stateManagement\";
function main() {}
@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    let x = new Person();
    fullName(x, ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
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
    f1 = goo;
    let f2: F2 = goo;
    f2 = foo;
    f1 = f2;
    let a = new A();
    f1(a, ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        {
            __memo_scope.recache();
            return;
        }
    }));
    f1(a, ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        {
            __memo_scope.recache();
            return;
        }
    }));
    f2(a, ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
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
function fullName(this: Person, @memo() arg?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void {
    return;
}
function foo(this: A, @memo() arg?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void {}
function goo(a: A, @memo() arg?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void {}
class Person {
    public constructor() {}
}
class A {
    public constructor() {}
}
type F1 = ((this: A, @memo() arg?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void))=> void);
type F2 = ((a: A, @memo() arg?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void))=> void);
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform lambdas with receiver',
    [memoNoRecheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
