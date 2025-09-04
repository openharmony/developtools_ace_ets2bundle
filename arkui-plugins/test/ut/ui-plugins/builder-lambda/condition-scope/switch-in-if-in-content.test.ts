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
import { PluginTester } from '../../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { memoNoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'builder-lambda/condition-scope';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'switch-in-if-in-content.ets'),
];

const pluginTester = new PluginTester('test switch-statement in if conditions in builder lambda call', buildConfig);

const parsedTransform: Plugins = {
    name: 'switch-case',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { ConditionScope as ConditionScope } from \"arkui.component.builder\";
import { ConditionBranch as ConditionBranch } from \"arkui.component.builder\";
import { memo as memo } from \"arkui.stateManagement.runtime\";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Text as Text, Column as Column, Component as Component } from \"@ohos.arkui.component\";
function main() {}
@Component() final struct SwitchInIf extends CustomComponent<SwitchInIf, __Options_SwitchInIf> {
    public __initializeStruct(initializers: (__Options_SwitchInIf | undefined), @memo() content: ((()=> void) | undefined)): void {
        this.__backing_num = ((({let gensym___<some_random_number> = initializers;
        (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.num)})) ?? (\"1\"));
    }
    public __updateStruct(initializers: (__Options_SwitchInIf | undefined)): void {}
    private __backing_num?: string;
    public get num(): string {
        return (this.__backing_num as string);
    }
    public set num(value: string) {
        this.__backing_num = value;
    }
    @memo() public build() {
        Column(undefined, undefined, @memo() (() => {
            ConditionScope(@memo() (() => {
                if (true) {
                    ConditionBranch(@memo() (() => {
                        ConditionScope(@memo() (() => {
                            switch (this.num) {
                                case \"0\": {
                                    ConditionBranch(@memo() (() => {
                                        Text(undefined, \"case 0\", undefined, undefined);
                                    }));
                                }
                            }
                        }));
                    }));
                }
            }));
        }));
    }
    public constructor() {}
}
@Component() export interface __Options_SwitchInIf {
  set num(num: (string | undefined))
  
  get num(): (string | undefined)
  set __options_has_num(__options_has_num: (boolean | undefined))
  
  get __options_has_num(): (boolean | undefined)
  
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.stateManagement.runtime\";
import { ConditionScope as ConditionScope } from \"arkui.component.builder\";
import { ConditionBranch as ConditionBranch } from \"arkui.component.builder\";
import { memo as memo } from \"arkui.stateManagement.runtime\";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Text as Text, Column as Column, Component as Component } from \"@ohos.arkui.component\";
function main() {}
@Component() final struct SwitchInIf extends CustomComponent<SwitchInIf, __Options_SwitchInIf> {
    public __initializeStruct(initializers: (__Options_SwitchInIf | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
        this.__backing_num = ((({let gensym___<some_random_number> = initializers;
        (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.num)})) ?? (\"1\"));
    }
    public __updateStruct(initializers: (__Options_SwitchInIf | undefined)): void {}
    private __backing_num?: string;
    public get num(): string {
        return (this.__backing_num as string);
    }
    public set num(value: string) {
        this.__backing_num = value;
    }
    @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        Column(__memo_context, ((__memo_id) + (<some_random_number>)), undefined, undefined, @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
                if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                }
                if (true) {
                    ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
                        if (__memo_scope.unchanged) {
                            __memo_scope.cached;
                            return;
                        }
                        ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                            const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
                            if (__memo_scope.unchanged) {
                                __memo_scope.cached;
                                return;
                            }
                            switch (this.num) {
                                case \"0\": {
                                    ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                                        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
                                        if (__memo_scope.unchanged) {
                                            __memo_scope.cached;
                                            return;
                                        }
                                        Text(__memo_context, ((__memo_id) + (<some_random_number>)), undefined, \"case 0\", undefined, undefined);
                                        {
                                            __memo_scope.recache();
                                            return;
                                        }
                                    }));
                                }
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
                    }));
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
        }));
        {
            __memo_scope.recache();
            return;
        }
    }
    public constructor() {}
}
@Component() export interface __Options_SwitchInIf {
  set num(num: (string | undefined))
  
  get num(): (string | undefined)
  set __options_has_num(__options_has_num: (boolean | undefined))
  
  get __options_has_num(): (boolean | undefined)
  
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test switch-statement in if',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
