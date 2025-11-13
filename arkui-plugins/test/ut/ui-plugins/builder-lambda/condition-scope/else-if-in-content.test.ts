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
import { collectNoRecheck, memoNoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
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
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";
import { ConditionScope as ConditionScope } from \"arkui.component.builder\";
import { ConditionBranch as ConditionBranch } from \"arkui.component.builder\";
import { Memo as Memo } from \"arkui.incremental.annotation\";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Text as Text, Column as Column, Component as Component } from \"@ohos.arkui.component\";
function main() {}
@Component() final struct ElseIf extends CustomComponent<ElseIf, __Options_ElseIf> {
    public __initializeStruct(initializers: (__Options_ElseIf | undefined), @Memo() content: ((()=> void) | undefined)): void {}
    public __updateStruct(initializers: (__Options_ElseIf | undefined)): void {}
    @Memo() public build() {
        ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
            instance.setColumnOptions(undefined).applyAttributesFinish();
            return;
        }), @Memo() (() => {
            ConditionScope(@Memo() (() => {
                if (true) {
                    ConditionBranch(@Memo() (() => {}));
                } else {
                    if (false) {
                        ConditionBranch(@Memo() (() => {
                            TextImpl(@Memo() ((instance: TextAttribute): void => {
                                instance.setTextOptions("elseIf 1", undefined).applyAttributesFinish();
                                return;
                            }), undefined);
                        }));
                    } else {
                        ConditionBranch(@Memo() (() => {
                            TextImpl(@Memo() ((instance: TextAttribute): void => {
                                instance.setTextOptions("else 1", undefined).applyAttributesFinish();
                                return;
                            }), undefined);
                        }));
                    }
                }
            }));
            ConditionScope(@Memo() (() => {
                if (false) {
                    ConditionBranch(@Memo() (() => {}));
                } else {
                    ConditionBranch(@Memo() (() => {
                        ConditionScope(@Memo() (() => {
                            if (false) {
                                ConditionBranch(@Memo() (() => {
                                    TextImpl(@Memo() ((instance: TextAttribute): void => {
                                        instance.setTextOptions("elseIf 2", undefined).applyAttributesFinish();
                                        return;
                                    }), undefined);
                                }));
                            } else {
                                ConditionBranch(@Memo() (() => {
                                    TextImpl(@Memo() ((instance: TextAttribute): void => {
                                        instance.setTextOptions("else 2", undefined).applyAttributesFinish();
                                        return;
                                    }), undefined);
                                }));
                            }
                        }));
                    }));
                }
            }));
        }));
    }
    public constructor() {}

    static {

    }
}
@Component() export interface __Options_ElseIf {
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.incremental.runtime.state\";
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";
import { ConditionScope as ConditionScope } from \"arkui.component.builder\";
import { ConditionBranch as ConditionBranch } from \"arkui.component.builder\";
import { Memo as Memo } from \"arkui.incremental.annotation\";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Text as Text, Column as Column, Component as Component } from \"@ohos.arkui.component\";
function main() {}
@Component() final struct ElseIf extends CustomComponent<ElseIf, __Options_ElseIf> {
    public __initializeStruct(initializers: (__Options_ElseIf | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}
    public __updateStruct(initializers: (__Options_ElseIf | undefined)): void {}
    @Memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        ColumnImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
            const __memo_parameter_instance = __memo_scope.param(0, instance);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            __memo_parameter_instance.value.setColumnOptions(undefined).applyAttributesFinish();
            {
                __memo_scope.recache();
                return;
            }
        }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                }
                if (true) {
                    ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
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
                        ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                            if (__memo_scope.unchanged) {
                                __memo_scope.cached;
                                return;
                            }
                            TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                                const __memo_parameter_instance = __memo_scope.param(0, instance);
                                if (__memo_scope.unchanged) {
                                    __memo_scope.cached;
                                    return;
                                }
                                __memo_parameter_instance.value.setTextOptions("elseIf 1", undefined).applyAttributesFinish();
                                {
                                    __memo_scope.recache();
                                    return;
                                }
                            }), undefined);
                            {
                                __memo_scope.recache();
                                return;
                            }
                        }));
                    } else {
                        ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                            if (__memo_scope.unchanged) {
                                __memo_scope.cached;
                                return;
                            }
                            TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                                const __memo_parameter_instance = __memo_scope.param(0, instance);
                                if (__memo_scope.unchanged) {
                                    __memo_scope.cached;
                                    return;
                                }
                                __memo_parameter_instance.value.setTextOptions("else 1", undefined).applyAttributesFinish();
                                {
                                    __memo_scope.recache();
                                    return;
                                }
                            }), undefined);
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
            ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                }
                if (false) {
                    ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
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
                    ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                        if (__memo_scope.unchanged) {
                            __memo_scope.cached;
                            return;
                        }
                        ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                            if (__memo_scope.unchanged) {
                                __memo_scope.cached;
                                return;
                            }
                            if (false) {
                                ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                                if (__memo_scope.unchanged) {
                                    __memo_scope.cached;
                                    return;
                                }
                                TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                                    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                                    const __memo_parameter_instance = __memo_scope.param(0, instance);
                                    if (__memo_scope.unchanged) {
                                        __memo_scope.cached;
                                        return;
                                    }
                                    __memo_parameter_instance.value.setTextOptions("elseIf 2", undefined).applyAttributesFinish();
                                    {
                                        __memo_scope.recache();
                                        return;
                                    }
                                }), undefined);
                                {
                                    __memo_scope.recache();
                                    return;
                                }
                                }));
                            } else {
                                ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                                    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                                    if (__memo_scope.unchanged) {
                                        __memo_scope.cached;
                                        return;
                                    }
                                    TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                                        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                                        const __memo_parameter_instance = __memo_scope.param(0, instance);
                                        if (__memo_scope.unchanged) {
                                            __memo_scope.cached;
                                            return;
                                        }
                                        __memo_parameter_instance.value.setTextOptions("else 2", undefined).applyAttributesFinish();
                                        {
                                            __memo_scope.recache();
                                            return;
                                        }
                                    }), undefined);
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
    public constructor() {}

    static {

    }
}
@Component() export interface __Options_ElseIf {
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test else-if condition branch',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
