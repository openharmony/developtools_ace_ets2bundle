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
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'builder-lambda/condition-scope';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'if-in-switch-in-content.ets'),
];

const pluginTester = new PluginTester('test if conditions in switch-case in builder lambda call', buildConfig);

const parsedTransform: Plugins = {
    name: 'if-in-switch',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";
import { ConditionScope as ConditionScope } from \"arkui.component.builder\";
import { ConditionBranch as ConditionBranch } from \"arkui.component.builder\";
import { Memo as Memo } from \"arkui.incremenal.annotation\";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Text as Text, Column as Column, Component as Component } from \"@ohos.arkui.component\";
function main() {}
@Component() final struct IfInSwitch extends CustomComponent<IfInSwitch, __Options_IfInSwitch> {
    public __initializeStruct(initializers: (__Options_IfInSwitch | undefined), @Memo() content: ((()=> void) | undefined)): void {
        this.__backing_num = ((({let gensym___<some_random_number> = initializers;
        (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.num)})) ?? (\"1\"));
    }
    public __updateStruct(initializers: (__Options_IfInSwitch | undefined)): void {}
    private __backing_num?: string;
    public get num(): string {
        return (this.__backing_num as string);
    }
    public set num(value: string) {
        this.__backing_num = value;
    }
    @Memo() public build() {
        ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
            instance.setColumnOptions(undefined).applyAttributesFinish();
            return;
        }), @Memo() (() => {
            ConditionScope(@Memo() (() => {
                switch (this.num) {
                    case \"-1\": {
                        ConditionBranch(@Memo() (() => {
                            {
                                ConditionScope(@Memo() (() => {
                                    if (true) {
                                        ConditionBranch(@Memo() (() => {
                                            TextImpl(@Memo() ((instance: TextAttribute): void => {
                                                instance.setTextOptions("case 1", undefined).applyAttributesFinish();
                                                return;
                                            }), undefined);
                                        }));
                                    } else {
                                        if (false) {
                                            ConditionBranch(@Memo() (() => {
                                                TextImpl(@Memo() ((instance: TextAttribute): void => {
                                                    instance.setTextOptions("case 2", undefined).applyAttributesFinish();
                                                    return;
                                                }), undefined);
                                            }));
                                        } else {
                                            ConditionBranch(@Memo() (() => {
                                                TextImpl(@Memo() ((instance: TextAttribute): void => {
                                                    instance.setTextOptions("case 3", undefined).applyAttributesFinish();
                                                    return;
                                                }), undefined);
                                            }));
                                        }
                                    }
                                }));
                            }
                        }));
                    }
                    case \"2\": {
                        ConditionBranch(@Memo() (() => {
                            ConditionScope(@Memo() (() => {
                                if (true) {
                                    ConditionBranch(@Memo() (() => {
                                        TextImpl(@Memo() ((instance: TextAttribute): void => {
                                            instance.setTextOptions("case 4", undefined).applyAttributesFinish();
                                            return;
                                        }), undefined);
                                    }));
                                }
                            }));
                        }));
                    }
                }
            }));
        }));
    }
    public constructor() {}
}
@Component() export interface __Options_IfInSwitch {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'num', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_num', '(boolean | undefined)')}
  
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
import { Memo as Memo } from \"arkui.incremenal.annotation\";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Text as Text, Column as Column, Component as Component } from \"@ohos.arkui.component\";
function main() {}
@Component() final struct IfInSwitch extends CustomComponent<IfInSwitch, __Options_IfInSwitch> {
    public __initializeStruct(initializers: (__Options_IfInSwitch | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
        this.__backing_num = ((({let gensym___<some_random_number> = initializers;
        (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.num)})) ?? (\"1\"));
    }
    public __updateStruct(initializers: (__Options_IfInSwitch | undefined)): void {}
    private __backing_num?: string;
    public get num(): string {
        return (this.__backing_num as string);
    }
    public set num(value: string) {
        this.__backing_num = value;
    }
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
                switch (this.num) {
                    case \"-1\": {
                        ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                            if (__memo_scope.unchanged) {
                                __memo_scope.cached;
                                return;
                            }
                            {
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
                                            TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                                                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                                                const __memo_parameter_instance = __memo_scope.param(0, instance);
                                                if (__memo_scope.unchanged) {
                                                    __memo_scope.cached;
                                                    return;
                                                }
                                                __memo_parameter_instance.value.setTextOptions("case 1", undefined).applyAttributesFinish();
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
                                                    __memo_parameter_instance.value.setTextOptions("case 2", undefined).applyAttributesFinish();
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
                                                    __memo_parameter_instance.value.setTextOptions("case 3", undefined).applyAttributesFinish();
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
                            }
                            {
                                __memo_scope.recache();
                                return;
                            }
                        }));
                    }
                    case \"2\": {
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
                                if (true) {
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
                                            __memo_parameter_instance.value.setTextOptions("case 4", undefined).applyAttributesFinish();
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
@Component() export interface __Options_IfInSwitch {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'num', '(string | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_num', '(boolean | undefined)')}
  
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test if conditions in switch-case',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
