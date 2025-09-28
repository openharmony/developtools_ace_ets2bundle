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
import { dumpGetterSetter, GetSetDumper } from '../../../utils/simplify-dump';

const FUNCTION_DIR_PATH: string = 'memo/functions';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'type-reference.ets'),
];

const pluginTester = new PluginTester('test memo function', buildConfig);

const expectedScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.incremental.runtime.state\";
import { memo as memo } from \"arkui.stateManagement.runtime\";
function main() {}
@memo() export function A<T>(__memo_context: __memo_context_type, __memo_id: __memo_id_type): Attribute<T>
@memo() function func<T>(__memo_context: __memo_context_type, __memo_id: __memo_id_type): ItemBuilder<T> {
    const __memo_scope = __memo_context.scope<ItemBuilder<T>>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        return __memo_scope.cached;
    }
    return __memo_scope.recache(((__memo_context: __memo_context_type, __memo_id: __memo_id_type, item: Item<T>): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_item = __memo_scope.param(0, item);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        {
            __memo_scope.recache();
            return;
        }
    }));
}
@memo() type ItemBuilder<T> = ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, item: Item<T>)=> void);
interface Item<T> {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'item', 'T', [], [], false)}
}
interface Attribute<T> {
    @memo() each<T>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @memo() itemGenerator: ItemBuilder<T>): Attribute<T>
}
class B {
    @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        A<string>(__memo_context, ((__memo_id) + (<some_random_number>))).each(__memo_context, ((__memo_id) + (<some_random_number>)), ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, ri: Item<string>) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
            const __memo_parameter_ri = __memo_scope.param(0, ri);
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

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform functions with type reference',
    [beforeMemoNoRecheck, memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
