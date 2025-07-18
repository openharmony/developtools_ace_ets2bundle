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

const PROPERTY_DIR_PATH: string = 'memo/properties';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, PROPERTY_DIR_PATH, 'class-constructor.ets'),
];

const pluginTester = new PluginTester('test memo property', buildConfig);

const expectedScript: string = `
import { memo as memo, __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"@ohos.arkui.stateManagement\";
function main() {}
@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    let a = new AA({
        a: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
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
    });
    {
        __memo_scope.recache();
        return;
    }
});
interface A {
    @memo() set a(a: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void
    @memo() get a(): ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)
}
class AA {
    @memo() public a: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined;
    constructor() {
        this(undefined);
    }
    public constructor(arg: A | undefined) {
        this.a = ({let gensym%%_<some_random_number> = arg;
        (((gensym%%_<some_random_number>) == (null)) ? undefined : gensym%%_<some_random_number>.a)});
    }
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        ({let gensym%%_<some_random_number> = this.a;
        (((gensym%%_<some_random_number>) == (null)) ? undefined : gensym%%_<some_random_number>(__memo_context, ((__memo_id) + (<some_random_number>))))});
        {
            __memo_scope.recache();
            return;
        }
    }
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform properties in class constructor',
    [memoNoRecheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
