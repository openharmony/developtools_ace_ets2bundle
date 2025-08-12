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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'else-if-in-content.ets'),
];

const pluginTester = new PluginTester('test else-if conditions in builder lambda call', buildConfig);

const parsedTransform: Plugins = {
    name: 'else-if',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { ConditionScope as ConditionScope } from \"arkui.component.builder\";
import { ConditionBranch as ConditionBranch } from \"arkui.component.builder\";
import { memo as memo } from \"arkui.stateManagement.runtime\";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Text as Text, Column as Column, Component as Component } from \"@ohos.arkui.component\";
function main() {}
@Component() final struct ElseIf extends CustomComponent<ElseIf, __Options_ElseIf> {
    public __initializeStruct(initializers: (__Options_ElseIf | undefined), @memo() content: ((()=> void) | undefined)): void {}
    public __updateStruct(initializers: (__Options_ElseIf | undefined)): void {}
    @memo() public build() {
        Column(undefined, undefined, @memo() (() => {
            ConditionScope(@memo() (() => {
                if (true) {
                    ConditionBranch(@memo() (() => {}));
                } else {
                    if (false) {
                        ConditionBranch(@memo() (() => {
                            Text(undefined, \"elseIf 1\", undefined, undefined);
                        }));
                    } else {
                        ConditionBranch(@memo() (() => {
                            Text(undefined, \"else 1\", undefined, undefined);
                        }));
                    }
                }
            }));
            ConditionScope(@memo() (() => {
                if (false) {
                    ConditionBranch(@memo() (() => {}));
                } else {
                    ConditionBranch(@memo() (() => {
                        ConditionScope(@memo() (() => {
                            if (false) {
                                ConditionBranch(@memo() (() => {
                                    Text(undefined, \"elseIf 2\", undefined, undefined);
                                }));
                            } else {
                                ConditionBranch(@memo() (() => {
                                    Text(undefined, \"else 2\", undefined, undefined);
                                }));
                            }
                        }));
                    }));
                }
            }));
        }));
    }
    private constructor() {}
}
@Component() export interface __Options_ElseIf {
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
@Component() final struct ElseIf extends CustomComponent<ElseIf, __Options_ElseIf> {
    public __initializeStruct(initializers: (__Options_ElseIf | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}
    public __updateStruct(initializers: (__Options_ElseIf | undefined)): void {}
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
                        {
                            __memo_scope.recache();
                            return;
                        }
                    }));
                } else {
                    if (false) {
                        ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                            const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
                            if (__memo_scope.unchanged) {
                                __memo_scope.cached;
                                return;
                            }
                            Text(__memo_context, ((__memo_id) + (<some_random_number>)), undefined, \"elseIf 1\", undefined, undefined);
                            {
                                __memo_scope.recache();
                                return;
                            }
                        }));
                    } else {
                        ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                            const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
                            if (__memo_scope.unchanged) {
                                __memo_scope.cached;
                                return;
                            }
                            Text(__memo_context, ((__memo_id) + (<some_random_number>)), undefined, \"else 1\", undefined, undefined);
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
            ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
                if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                }
                if (false) {
                    ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
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
                } else {
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
                            if (false) {
                                ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                                const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
                                if (__memo_scope.unchanged) {
                                    __memo_scope.cached;
                                    return;
                                }
                                Text(__memo_context, ((__memo_id) + (<some_random_number>)), undefined, \"elseIf 2\", undefined, undefined);
                                {
                                    __memo_scope.recache();
                                    return;
                                }
                                }));
                            } else {
                                ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                                    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
                                    if (__memo_scope.unchanged) {
                                        __memo_scope.cached;
                                        return;
                                    }
                                    Text(__memo_context, ((__memo_id) + (<some_random_number>)), undefined, \"else 2\", undefined, undefined);
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
    private constructor() {}
}
@Component() export interface __Options_ElseIf {
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test else-if condition branch',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
