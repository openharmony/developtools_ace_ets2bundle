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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, PROPERTY_DIR_PATH, 'class-properties.ets'),
];

const pluginTester = new PluginTester('test memo property', buildConfig);

const expectedScript: string = `
import { memo as memo, __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "@ohos.arkui.stateManagement";
function main() {}
class A {
    public arg: (()=> void);
    @memo() public memo_arg: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
    @memo() public memo_optional_arg?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined;
    @memo() public memo_union_arg: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined = ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
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
    public arg_memo_type: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
    public constructor() {
        this.arg = (() => {});
        this.memo_arg = ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
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
        this.arg_memo_type = ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
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
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        this.arg();
        this.memo_arg(__memo_context, ((__memo_id) + (<some_random_number>)));
        this.arg_memo_type(__memo_context, ((__memo_id) + (<some_random_number>)));
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
    'transform properties in class',
    [memoNoRecheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
