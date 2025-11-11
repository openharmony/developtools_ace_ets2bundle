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
import { dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'builder-lambda/condition-scope';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'switch-case-in-content.ets'),
];

const pluginTester = new PluginTester('test switch-case conditions in builder lambda call', buildConfig);

const parsedTransform: Plugins = {
    name: 'switch-case',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ConditionScope as ConditionScope } from "arkui.component.builder";

import { ConditionBranch as ConditionBranch } from "arkui.component.builder";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component } from "@ohos.arkui.component";

function main() {}
@Component() final struct SwitchCase extends CustomComponent<SwitchCase, __Options_SwitchCase> {
    public __initializeStruct(initializers: (__Options_SwitchCase | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_num = ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.num)})) ?? (\"1\"));
    }
    public __updateStruct(initializers: (__Options_SwitchCase | undefined)): void {}
    private __backing_num?: string;
    public get num(): string {
    return (this.__backing_num as string);
    }
    public set num(value: string) {
    this.__backing_num = value;
    }
    @MemoIntrinsic() public static _invoke(style: @Memo() ((instance: SwitchCase)=> void), initializers: ((()=> __Options_SwitchCase) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
      CustomComponent._invokeImpl<SwitchCase, __Options_SwitchCase>(style, ((): SwitchCase => {
        return new SwitchCase(false, ({let gensym___149025070 = storage;
        (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
      }), initializers, reuseId, content);
    }
    
    @ComponentBuilder() public static $_invoke(initializers?: __Options_SwitchCase, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): SwitchCase {
      throw new Error("Declare interface");
    }
    @Memo() public build() {
        ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
            instance.setColumnOptions(undefined).applyAttributesFinish();
            return;
        }), @Memo() (() => {
            ConditionScope(@Memo() (() => {
                switch (this.num) {
                    case \"0\": {
                        ConditionBranch(@Memo() (() => {
                            TextImpl(@Memo() ((instance: TextAttribute): void => {
                                instance.setTextOptions("case 0", undefined).applyAttributesFinish();
                                return;
                            }), undefined);
                        }));
                    }
                    case \"1\": {
                        ConditionBranch(@Memo() (() => {
                            TextImpl(@Memo() ((instance: TextAttribute): void => {
                                instance.setTextOptions("case 1", undefined).applyAttributesFinish();
                                return;
                            }), undefined);
                        }));
                        break;
                        TextImpl(@Memo() ((instance: TextAttribute): void => {
                            instance.setTextOptions("after break", undefined).applyAttributesFinish();
                            return;
                        }), undefined);
                    }
                    case \"2\": {
                        ConditionBranch(@Memo() (() => {
                            TextImpl(@Memo() ((instance: TextAttribute): void => {
                                instance.setTextOptions("case 2", undefined).applyAttributesFinish();
                                return;
                            }), undefined);
                        }));
                        return;
                        TextImpl(@Memo() ((instance: TextAttribute): void => {
                            instance.setTextOptions("after return", undefined).applyAttributesFinish();
                            return;
                        }), undefined);
                    }
                    default: {
                        ConditionBranch(@Memo() (() => {
                            TextImpl(@Memo() ((instance: TextAttribute): void => {
                                instance.setTextOptions("default", undefined).applyAttributesFinish();
                                return;
                            }), undefined);
                        }));
                    }
                }
            }));
            TextImpl(@Memo() ((instance: TextAttribute): void => {
                instance.setTextOptions("hello world", undefined).applyAttributesFinish();
                return;
            }), undefined);
        }));
    }
    ${dumpConstructor()}
}
@Component() export interface __Options_SwitchCase {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'num', '(string | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_num', '(boolean | undefined)')}
  
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ConditionScope as ConditionScope } from "arkui.component.builder";

import { ConditionBranch as ConditionBranch } from "arkui.component.builder";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component } from "@ohos.arkui.component";

function main() {}
@Component() final struct SwitchCase extends CustomComponent<SwitchCase, __Options_SwitchCase> {
    public __initializeStruct(initializers: (__Options_SwitchCase | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
        this.__backing_num = ((({let gensym___<some_random_number> = initializers;
        (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.num)})) ?? (\"1\"));
    }
    public __updateStruct(initializers: (__Options_SwitchCase | undefined)): void {}
    private __backing_num?: string;
    public get num(): string {
        return (this.__backing_num as string);
    }
    public set num(value: string) {
        this.__backing_num = value;
    }
    @MemoIntrinsic() public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: SwitchCase)=> void), initializers: ((()=> __Options_SwitchCase) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
      CustomComponent._invokeImpl<SwitchCase, __Options_SwitchCase>(__memo_context, ((__memo_id) + (47330804)), style, ((): SwitchCase => {
        return new SwitchCase(false, ({let gensym___149025070 = storage;
        (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
      }), initializers, reuseId, content);
    }
    
    @ComponentBuilder() public static $_invoke(initializers?: __Options_SwitchCase, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): SwitchCase {
      throw new Error("Declare interface");
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
                    case \"0\": {
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
                                __memo_parameter_instance.value.setTextOptions("case 0", undefined).applyAttributesFinish();
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
                    case \"1\": {
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
                        break;
                        TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                        const __memo_parameter_instance = __memo_scope.param(0, instance);
                        if (__memo_scope.unchanged) {
                            __memo_scope.cached;
                            return;
                        }
                        __memo_parameter_instance.value.setTextOptions("after break", undefined).applyAttributesFinish();
                        {
                            __memo_scope.recache();
                            return;
                        }
                        }), undefined);
                    }
                    case \"2\": {
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
                        return;
                        TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                            const __memo_parameter_instance = __memo_scope.param(0, instance);
                            if (__memo_scope.unchanged) {
                                __memo_scope.cached;
                                return;
                            }
                            __memo_parameter_instance.value.setTextOptions("after return", undefined).applyAttributesFinish();
                            {
                                __memo_scope.recache();
                                return;
                            }
                        }), undefined);
                    }
                    default: {
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
                                __memo_parameter_instance.value.setTextOptions("default", undefined).applyAttributesFinish();
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
            TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                const __memo_parameter_instance = __memo_scope.param(0, instance);
                if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                }
                __memo_parameter_instance.value.setTextOptions("hello world", undefined).applyAttributesFinish();
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
        {
            __memo_scope.recache();
            return;
        }
    }
    ${dumpConstructor()}
}
@Component() export interface __Options_SwitchCase {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'num', '(string | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_num', '(boolean | undefined)')}
  
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test switch-case',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
