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

const METHOD_DIR_PATH: string = 'memo/methods';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, METHOD_DIR_PATH, 'callable.ets')];

const pluginTester = new PluginTester('test memo method', buildConfig);

const expectedScript: string = `
import { memo as memo, __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"@ohos.arkui.stateManagement\";
function main() {}
@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    A.$_invoke(__memo_context, ((__memo_id) + (<some_random_number>)));
    B.$_invoke(((__memo_context: __memo_context_type, __memo_id: __memo_id_type): void => {
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
    let x: C | D = C.$_instantiate(__memo_context, ((__memo_id) + (<some_random_number>)), (() => {
        return new C();
    }));
    x = D.$_instantiate((() => {
        return new D();
    }));
    {
        __memo_scope.recache();
        return;
    }
});
class A {
    public static $_invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
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
    public constructor() {}
}
class B {
    @functions.OptionalParametersAnnotation({minArgCount:0}) public static $_invoke(@memo() p?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void {}
    public constructor() {}
}
class C {
    public static $_instantiate(__memo_context: __memo_context_type, __memo_id: __memo_id_type, factory: (()=> C)): C {
        const __memo_scope = __memo_context.scope<C>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_factory = __memo_scope.param(0, factory);
        if (__memo_scope.unchanged) {
            return __memo_scope.cached;
        }
        return __memo_scope.recache(__memo_parameter_factory.value());
    }
    public constructor() {}
}
class D {
    @functions.OptionalParametersAnnotation({minArgCount:1}) public static $_instantiate(factory: (()=> D), @memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): D {
        return factory();
    }
    public constructor() {}
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform callable class',
    [memoNoRecheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
