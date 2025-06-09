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
import { beforeMemoNoRecheck, builderLambdaNoRecheck, memoNoRecheck, recheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';

const BUILDER_LAMBDA_DIR_PATH: string = 'builder-lambda';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'simple-component.ets'),
];

const pluginTester = new PluginTester('test builder-lambda simple component', buildConfig);

function testBuilderLambdaTransformer(this: PluginTestContext): void {
    const expectedScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";
import { memo as memo } from \"@ohos.arkui.stateManagement\";
import { Column as Column, ColumnAttribute as ColumnAttribute } from \"arkui.component.column\";
function main() {}
class MyStateSample {
    @memo() public build() {
        Column(undefined, undefined, @memo() (() => {}));
    }
    public constructor() {}
}
`;
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

function testMemoTransformer(this: PluginTestContext): void {
    const expectedScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.stateManagement.runtime\";
import { memo as memo } from "arkui.stateManagement.runtime";
import { memo as memo } from \"@ohos.arkui.stateManagement\";
import { Column as Column, ColumnAttribute as ColumnAttribute } from \"arkui.component.column\";
function main() {}
class MyStateSample {
    @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (263357132)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        Column(__memo_context, ((__memo_id) + (65509320)), undefined, undefined, @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<void>(((__memo_id) + (147296800)), 0);
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
    }
    public constructor() {}
}
`;
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform simple component',
    [builderLambdaNoRecheck, beforeMemoNoRecheck, memoNoRecheck, recheck],
    {
        'checked:builder-lambda-no-recheck': [testBuilderLambdaTransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
