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
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ConditionScope as ConditionScope } from "arkui.component.builder";

import { ConditionBranch as ConditionBranch } from "arkui.component.builder";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Text as Text, Column as Column, Component as Component } from "@ohos.arkui.component";

function main() {}
@Component() final struct ElseIf extends CustomComponent<ElseIf, __Options_ElseIf> {
    public __initializeStruct(initializers: (__Options_ElseIf | undefined), @memo() content: ((()=> void) | undefined)): void {}
    public __updateStruct(initializers: (__Options_ElseIf | undefined)): void {}
    @MemoIntrinsic() public static _invoke(style: @memo() ((instance: ElseIf)=> void), initializers: ((()=> __Options_ElseIf) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
      CustomComponent._invokeImpl<ElseIf, __Options_ElseIf>(style, ((): ElseIf => {
        return new ElseIf(false, ({let gensym___149025070 = storage;
        (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
      }), initializers, reuseId, content);
    }
    
    @ComponentBuilder() public static $_invoke(initializers?: __Options_ElseIf, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): ElseIf {
      throw new Error("Declare interface");
    }
    @memo() public build() {
        ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
            instance.setColumnOptions(undefined).applyAttributesFinish();
            return;
        }), @memo() (() => {
            ConditionScope(@memo() (() => {
                if (true) {
                    ConditionBranch(@memo() (() => {}));
                } else {
                    if (false) {
                        ConditionBranch(@memo() (() => {
                            TextImpl(@memo() ((instance: TextAttribute): void => {
                                instance.setTextOptions("elseIf 1", undefined).applyAttributesFinish();
                                return;
                            }), undefined);
                        }));
                    } else {
                        ConditionBranch(@memo() (() => {
                            TextImpl(@memo() ((instance: TextAttribute): void => {
                                instance.setTextOptions("else 1", undefined).applyAttributesFinish();
                                return;
                            }), undefined);
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
                                    TextImpl(@memo() ((instance: TextAttribute): void => {
                                        instance.setTextOptions("elseIf 2", undefined).applyAttributesFinish();
                                        return;
                                    }), undefined);
                                }));
                            } else {
                                ConditionBranch(@memo() (() => {
                                    TextImpl(@memo() ((instance: TextAttribute): void => {
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
    constructor(useSharedStorage: (boolean | undefined)) {
      this(useSharedStorage, undefined);
    }
    
    constructor() {
      this(undefined, undefined);
    }
    
    public constructor(useSharedStorage: (boolean | undefined), storage: (LocalStorage | undefined)) {
      super(useSharedStorage, storage);
    }
}
@Component() export interface __Options_ElseIf {
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ConditionScope as ConditionScope } from "arkui.component.builder";

import { ConditionBranch as ConditionBranch } from "arkui.component.builder";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Text as Text, Column as Column, Component as Component } from "@ohos.arkui.component";

function main() {}

@Component() final struct ElseIf extends CustomComponent<ElseIf, __Options_ElseIf> {
    public __initializeStruct(initializers: (__Options_ElseIf | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}
    public __updateStruct(initializers: (__Options_ElseIf | undefined)): void {}
    @MemoIntrinsic() public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ElseIf)=> void), initializers: ((()=> __Options_ElseIf) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
      CustomComponent._invokeImpl<ElseIf, __Options_ElseIf>(__memo_context, ((__memo_id) + (47330804)), style, ((): ElseIf => {
        return new ElseIf(false, ({let gensym___203542966 = storage;
        (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
      }), initializers, reuseId, content);
    }
    
    @ComponentBuilder() public static $_invoke(initializers?: __Options_ElseIf, storage?: LocalStorage, @Builder() @memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ElseIf {
      throw new Error("Declare interface");
    }
    @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        ColumnImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
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
        }), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                }
                if (true) {
                    ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
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
                        ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                            if (__memo_scope.unchanged) {
                                __memo_scope.cached;
                                return;
                            }
                            TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
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
                        ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                            if (__memo_scope.unchanged) {
                                __memo_scope.cached;
                                return;
                            }
                            TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
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
            ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                }
                if (false) {
                    ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
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
                    ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                        if (__memo_scope.unchanged) {
                            __memo_scope.cached;
                            return;
                        }
                        ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                            if (__memo_scope.unchanged) {
                                __memo_scope.cached;
                                return;
                            }
                            if (false) {
                                ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                                if (__memo_scope.unchanged) {
                                    __memo_scope.cached;
                                    return;
                                }
                                TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
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
                                ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                                    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                                    if (__memo_scope.unchanged) {
                                        __memo_scope.cached;
                                        return;
                                    }
                                    TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
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
    constructor(useSharedStorage: (boolean | undefined)) {
      this(useSharedStorage, undefined);
    }
    
    constructor() {
      this(undefined, undefined);
    }
    
    public constructor(useSharedStorage: (boolean | undefined), storage: (LocalStorage | undefined)) {
      super(useSharedStorage, storage);
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
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
