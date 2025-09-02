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
import { uiNoRecheck, recheck, memoNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const WRAP_BUILDER_DIR_PATH: string = 'wrap-builder';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, WRAP_BUILDER_DIR_PATH, 'wrap-builder-in-generic.ets'),
];

const pluginTester = new PluginTester('test wrap builder with generic builder type', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from \"arkui.stateManagement.decorator\";
import { IStateDecoratedVariable as IStateDecoratedVariable } from \"arkui.stateManagement.decorator\";
import { RowAttribute as RowAttribute } from \"arkui.component.row\";
import { RowImpl as RowImpl } from "arkui.component.row";
import { MemoSkip as MemoSkip } from "arkui.stateManagement.runtime";
import { memo as memo } from \"arkui.stateManagement.runtime\";
import { TextAttribute as TextAttribute } from \"arkui.component.text\";
import { TextImpl as TextImpl } from "arkui.component.text";
import { NavInterface as NavInterface } from \"arkui.UserView\";
import { PageLifeCycle as PageLifeCycle } from \"arkui.component.customComponent\";
import { EntryPoint as EntryPoint } from \"arkui.UserView\";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Builder as Builder, Text as Text, Color as Color, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder, Entry as Entry, Component as Component, Row as Row, ForEach as ForEach } from \"@ohos.arkui.component\";
import { State as State } from \"@ohos.arkui.stateManagement\";
let globalBuilder: WrappedBuilder<@Builder() ((value: string, size: number)=> void)>;
let builderArr: Array<WrappedBuilder<@Builder() ((value: string, size: number)=> void)>>;
let wrappedBuilder1: WrappedBuilder<@Builder() ((value: string, size: number)=> void)>;
let wrappedBuilder2: WrappedBuilder<@Builder() ((value: string, size: number)=> void)>;
function main() {}
@memo() function MyBuilder(@MemoSkip() value: string, @MemoSkip() size: number) {
    TextImpl(@memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(value, undefined).fontSize(size).applyAttributesFinish();
        return;
    }), undefined);
}
@memo() function YourBuilder(@MemoSkip() value: string, @MemoSkip() size: number) {
    TextImpl(@memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(value, undefined).fontSize(size).fontColor(Color.Pink).applyAttributesFinish();
        return;
    }), undefined);
}
globalBuilder = wrapBuilder(MyBuilder);
builderArr = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];
wrappedBuilder1 = wrapBuilder<@Builder() ((value: string, size: number)=> void)>(MyBuilder);
wrappedBuilder2 = new WrappedBuilder<@Builder() ((value: string, size: number)=> void)>(MyBuilder);
__EntryWrapper.RegisterNamedRouter(\"\", new __EntryWrapper(), ({
    bundleName: \"com.example.mock\",
    moduleName: \"entry\",
    pagePath: \"../../../wrap-builder/wrap-builder-in-generic\",
    pageFullPath: \"test/demo/mock/wrap-builder/wrap-builder-in-generic\",
    integratedHsp: \"false\",
} as NavInterface));
@Entry({useSharedStorage:false,storage:\"\",routeName:\"\"}) @Component() final struct Index extends CustomComponent<Index, __Options_Index> implements PageLifeCycle {
    public __initializeStruct(initializers: (__Options_Index | undefined), @memo() content: ((()=> void) | undefined)): void {
        this.__backing_message = STATE_MGMT_FACTORY.makeState<string>(this, \"message\", ((({let gensym___<some_random_number> = initializers;
        (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.message)})) ?? (\"Hello World\")));
    }
    public __updateStruct(initializers: (__Options_Index | undefined)): void {}
    private __backing_message?: IStateDecoratedVariable<string>;
    public get message(): string {
        return this.__backing_message!.get();
    }
    public set message(value: string) {
        this.__backing_message!.set(value);
    }
    @memo() public build() {
        RowImpl(@memo() ((instance: RowAttribute): void => {
            instance.setRowOptions(undefined).height(\"100%\").applyAttributesFinish();
            return;
        }), @memo() (() => {
            globalBuilder.builder(this.message, 50);
            ForEach(((): Array<WrappedBuilder<@Builder() ((value: string, size: number)=> void)>> => {
                return builderArr;
            }), ((item: WrappedBuilder<@Builder() ((value: string, size: number)=> void)>) => {
                item.builder(\"Hello World\", 30);
            }));
        }));
    }
    public constructor() {}
}
@Entry({useSharedStorage:false,storage:\"\",routeName:\"\"}) @Component() export interface __Options_Index {
  set message(message: (string | undefined))
  
  get message(): (string | undefined)
  set __backing_message(__backing_message: (IStateDecoratedVariable<string> | undefined))
  
  get __backing_message(): (IStateDecoratedVariable<string> | undefined)
  set __options_has_message(__options_has_message: (boolean | undefined))
  
  get __options_has_message(): (boolean | undefined)
  
}
class __EntryWrapper extends EntryPoint {
    @memo() public entry(): void {
        Index._instantiateImpl(undefined, (() => {
            return new Index();
        }), undefined, undefined, undefined);
    }
    public constructor() {}
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.stateManagement.runtime\";
import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from \"arkui.stateManagement.decorator\";
import { IStateDecoratedVariable as IStateDecoratedVariable } from \"arkui.stateManagement.decorator\";
import { RowAttribute as RowAttribute } from \"arkui.component.row\";
import { RowImpl as RowImpl } from "arkui.component.row";
import { MemoSkip as MemoSkip } from "arkui.stateManagement.runtime";
import { memo as memo } from \"arkui.stateManagement.runtime\";
import { TextAttribute as TextAttribute } from \"arkui.component.text\";
import { TextImpl as TextImpl } from "arkui.component.text";
import { NavInterface as NavInterface } from \"arkui.UserView\";
import { PageLifeCycle as PageLifeCycle } from \"arkui.component.customComponent\";
import { EntryPoint as EntryPoint } from \"arkui.UserView\";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Builder as Builder, Text as Text, Color as Color, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder, Entry as Entry, Component as Component, Row as Row, ForEach as ForEach } from \"@ohos.arkui.component\";
import { State as State } from \"@ohos.arkui.stateManagement\";
let globalBuilder: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
let builderArr: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
let wrappedBuilder1: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
let wrappedBuilder2: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
function main() {}
@memo() function MyBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() value: string, @MemoSkip() size: number) {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_instance = __memo_scope.param(0, instance);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        __memo_parameter_instance.value.setTextOptions(value, undefined).fontSize(size).applyAttributesFinish();
        {
            __memo_scope.recache();
            return;
        }
    }), undefined);
    {
        __memo_scope.recache();
        return;
    }
}
@memo() function YourBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() value: string, @MemoSkip() size: number) {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_instance = __memo_scope.param(0, instance);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        __memo_parameter_instance.value.setTextOptions(value, undefined).fontSize(size).fontColor(Color.Pink).applyAttributesFinish();
        {
            __memo_scope.recache();
            return;
        }
    }), undefined);
    {
        __memo_scope.recache();
        return;
    }
}
globalBuilder = wrapBuilder(MyBuilder);
builderArr = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];
wrappedBuilder1 = wrapBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(MyBuilder);
wrappedBuilder2 = new WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(MyBuilder);
__EntryWrapper.RegisterNamedRouter(\"\", new __EntryWrapper(), ({
    bundleName: \"com.example.mock\",
    moduleName: \"entry\",
    pagePath: \"../../../wrap-builder/wrap-builder-in-generic\",
    pageFullPath: \"test/demo/mock/wrap-builder/wrap-builder-in-generic\",
    integratedHsp: \"false\",
} as NavInterface));
@Entry({useSharedStorage:false,storage:\"\",routeName:\"\"}) @Component() final struct Index extends CustomComponent<Index, __Options_Index> implements PageLifeCycle {
    public __initializeStruct(initializers: (__Options_Index | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
        this.__backing_message = STATE_MGMT_FACTORY.makeState<string>(this, \"message\", ((({let gensym___<some_random_number> = initializers;
        (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.message)})) ?? (\"Hello World\")));
    }
    public __updateStruct(initializers: (__Options_Index | undefined)): void {}
    private __backing_message?: IStateDecoratedVariable<string>;
    public get message(): string {
        return this.__backing_message!.get();
    }
    public set message(value: string) {
        this.__backing_message!.set(value);
    }
    @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        RowImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: RowAttribute): void => {
            const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 1);
            const __memo_parameter_instance = __memo_scope.param(0, instance);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            __memo_parameter_instance.value.setRowOptions(undefined).height(\"100%\").applyAttributesFinish();
            {
                __memo_scope.recache();
                return;
            }
        }), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            globalBuilder.builder(__memo_context, ((__memo_id) + (<some_random_number>)), this.message, 50);
            ForEach(__memo_context, ((__memo_id) + (<some_random_number>)), ((): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> => {
                return builderArr;
            }), ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, item: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) => {
                const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 1);
                const __memo_parameter_item = __memo_scope.param(0, item);
                if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                }
                __memo_parameter_item.value.builder(__memo_context, ((__memo_id) + (<some_random_number>)), \"Hello World\", 30);
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
@Entry({useSharedStorage:false,storage:\"\",routeName:\"\"}) @Component() export interface __Options_Index {
  set message(message: (string | undefined))
  
  get message(): (string | undefined)
  set __backing_message(__backing_message: (IStateDecoratedVariable<string> | undefined))
  
  get __backing_message(): (IStateDecoratedVariable<string> | undefined)
  set __options_has_message(__options_has_message: (boolean | undefined))
  
  get __options_has_message(): (boolean | undefined)
  
}
class __EntryWrapper extends EntryPoint {
    @memo() public entry(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        Index._instantiateImpl(__memo_context, ((__memo_id) + (<some_random_number>)), undefined, (() => {
            return new Index();
        }), undefined, undefined, undefined);
        {
            __memo_scope.recache();
            return;
        }
    }
    public constructor() {}
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test wrap builder with generic builder type',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
