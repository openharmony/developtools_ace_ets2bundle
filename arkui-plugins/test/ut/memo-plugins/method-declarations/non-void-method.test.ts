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

const METHOD_DIR_PATH: string = 'memo/methods';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, METHOD_DIR_PATH, 'non-void-method.ets')];

const pluginTester = new PluginTester('test memo method', buildConfig);

const expectedScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.stateManagement.runtime\";
import { memo as memo, __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.stateManagement.runtime\";
function main() {}
function __context(): __memo_context_type
function __id(): __memo_id_type
@Retention({policy:"SOURCE"}) @interface memo_intrinsic {}
@Retention({policy:"SOURCE"}) @interface memo_entry {}
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
    public string_method_with_return(__memo_context: __memo_context_type, __memo_id: __memo_id_type, arg: string): string {
        const __memo_scope = __memo_context.scope<string>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_arg = __memo_scope.param(0, arg);
        if (__memo_scope.unchanged) {
            return __memo_scope.cached;
        }
        return __memo_scope.recache(__memo_parameter_arg.value);
    }
    public method_with_type_parameter<T>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, arg: T): T {
        const __memo_scope = __memo_context.scope<T>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_arg = __memo_scope.param(0, arg);
        if (__memo_scope.unchanged) {
            return __memo_scope.cached;
        }
        return __memo_scope.recache(__memo_parameter_arg.value);
    }
    @memo_intrinsic() public intrinsic_method(__memo_context: __memo_context_type, __memo_id: __memo_id_type): int {
        return 0;
    }
    @memo_intrinsic() public intrinsic_method_with_this(__memo_context: __memo_context_type, __memo_id: __memo_id_type): int {
        this.void_method(__memo_context, ((__memo_id) + (<some_random_number>)));
        return 0;
    }
    @memo_entry() public memoEntry<R>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @memo() entry: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> R)): R {
        const getContext = (() => {
            return __context();
        });
        const getId = (() => {
            return __id();
        });
        {
            const __memo_context = getContext();
            const __memo_id = getId();
            return entry(__memo_context, ((__memo_id) + (<some_random_number>)));
        }
    }
    public constructor() {}
}
class Use {
    public test(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        const test = new Test();
        test.string_method_with_return(__memo_context, ((__memo_id) + (<some_random_number>)), "a string");
        test.method_with_type_parameter(__memo_context, ((__memo_id) + (<some_random_number>)), "I'm string");
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
    'transform methods with non-void return type',
    [memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
