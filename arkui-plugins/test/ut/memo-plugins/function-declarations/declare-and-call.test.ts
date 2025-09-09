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
import { dumpAnnotation, dumpGetterSetter, GetSetDumper } from '../../../utils/simplify-dump';

const FUNCTION_DIR_PATH: string = 'memo/functions';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'declare-and-call.ets'),
];

const pluginTester = new PluginTester('test memo function', buildConfig);

const expectedScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.stateManagement.runtime\";
import { memo as memo } from \"arkui.stateManagement.runtime\";
function main() {}
@memo() function funcA(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void
@memo() function funcB(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    funcA(__memo_context, ((__memo_id) + (<some_random_number>)));
    {
        __memo_scope.recache();
        return;
    }
}
@memo() function funcWithMemoBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @memo() memo_arg: MemoBuilder): void {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 1);
    const __memo_parameter_memo_arg = __memo_scope.param(0, memo_arg);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    {
        __memo_scope.recache();
        return;
    }
}
function funcWithArg(arg: (()=> void)): void {}
function func(): void {}
@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    funcA(__memo_context, ((__memo_id) + (<some_random_number>)));
    funcWithMemoBuilder(__memo_context, ((__memo_id) + (<some_random_number>)), {
        builder: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            funcWithArg((() => {
                func();
                return;
            }));
            {
                __memo_scope.recache();
                return;
            }
        }),
    });
    {
        __memo_scope.recache();
        return;
    }
});
class A {
    @memo() public foo(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        funcA(__memo_context, ((__memo_id) + (<some_random_number>)));
        {
            __memo_scope.recache();
            return;
        }
    }
    public constructor() {}
}
interface MemoBuilder {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'builder', '((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)', [dumpAnnotation('memo')])}

}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform declare functions and calls',
    [beforeMemoNoRecheck, memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
