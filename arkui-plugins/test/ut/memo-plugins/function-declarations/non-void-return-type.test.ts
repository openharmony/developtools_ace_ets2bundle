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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'non-void-return-type.ets'),
];

const pluginTester = new PluginTester('test memo function', buildConfig);

const expectedScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.incremental.runtime.state\";
import { Memo as Memo } from \"arkui.incremental.annotation\";
function main() {}
@Memo() function funcNum(__memo_context: __memo_context_type, __memo_id: __memo_id_type): number {
    const __memo_scope = __memo_context.scope<number>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        return __memo_scope.cached;
    }
    return __memo_scope.recache(1);
}
@Memo() function funcStr(__memo_context: __memo_context_type, __memo_id: __memo_id_type): string {
    const __memo_scope = __memo_context.scope<string>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        return __memo_scope.cached;
    }
    return __memo_scope.recache(\"1\");
}
@Memo() function funcBool(__memo_context: __memo_context_type, __memo_id: __memo_id_type): boolean {
    const __memo_scope = __memo_context.scope<boolean>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        return __memo_scope.cached;
    }
    return __memo_scope.recache(false);
}
@Memo() function funcA(__memo_context: __memo_context_type, __memo_id: __memo_id_type): A {
    const __memo_scope = __memo_context.scope<A>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        return __memo_scope.cached;
    }
    return __memo_scope.recache({
        str: \"1\",
    });
}
@Memo() function funcB(__memo_context: __memo_context_type, __memo_id: __memo_id_type): B {
    const __memo_scope = __memo_context.scope<B>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        return __memo_scope.cached;
    }
    return __memo_scope.recache(((str: string) => {}));
}
@Memo() function funcC(__memo_context: __memo_context_type, __memo_id: __memo_id_type): C {
    const __memo_scope = __memo_context.scope<C>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        return __memo_scope.cached;
    }
    return __memo_scope.recache(new C(\"1\"));
}
@Memo() function funcD(__memo_context: __memo_context_type, __memo_id: __memo_id_type): (()=> void) {
    const __memo_scope = __memo_context.scope<(()=> void)>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        return __memo_scope.cached;
    }
    return __memo_scope.recache((() => {}));
}
interface A {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'str', 'string', [], [], false)}
}
type B = ((str: string)=> void);
class C {
    public str: string;
    public constructor(str: string) {
        this.str = str;
    }
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform functions with non-void return type',
    [beforeMemoNoRecheck, memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
