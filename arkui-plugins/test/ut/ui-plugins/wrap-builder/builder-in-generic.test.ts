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
import { dumpGetterSetter, GetSetDumper } from '../../../utils/simplify-dump';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const WRAP_BUILDER_DIR_PATH: string = 'wrap-builder';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, WRAP_BUILDER_DIR_PATH, 'builder-in-generic.ets'),
];

const pluginTester = new PluginTester('test builder with generic builder type', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";
import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";
import { RowAttribute as RowAttribute } from "arkui.component.row";
import { ForEachAttribute as ForEachAttribute } from "arkui.component.forEach";
import { ForEachImpl as ForEachImpl } from "arkui.component.forEach";
import { RowImpl as RowImpl } from "arkui.component.row";
import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";
import { Memo as Memo } from "arkui.incremental.annotation";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { NavInterface as NavInterface } from "arkui.component.customComponent";
import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";
import { EntryPoint as EntryPoint } from "arkui.component.customComponent";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Builder as Builder, Text as Text, Color as Color, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder, Entry as Entry, Component as Component, Row as Row, ForEach as ForEach } from "@ohos.arkui.component";
import { State as State } from "@ohos.arkui.stateManagement";
@Memo() let globalBuilder: @Builder() ((value: string, size: number)=> void);
let builderArr: Array<@Builder() ((value: string, size: number)=> void)>;
function main() {}
@Memo() function MyBuilder(@MemoSkip() value: string, @MemoSkip() size: number) {
    TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(value, undefined).fontSize(size).applyAttributesFinish();
        return;
    }), undefined);
}
@Memo() function YourBuilder(@MemoSkip() value: string, @MemoSkip() size: number) {
    TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(value, undefined).fontSize(size).fontColor(Color.Pink).applyAttributesFinish();
        return;
    }), undefined);
}
globalBuilder = MyBuilder;
builderArr = [MyBuilder, YourBuilder];
__EntryWrapper.RegisterNamedRouter(\"\", new __EntryWrapper(), ({
    bundleName: \"com.example.mock\",
    moduleName: \"entry\",
    pagePath: \"../../../wrap-builder/builder-in-generic\",
    pageFullPath: \"test/demo/mock/wrap-builder/builder-in-generic\",
    integratedHsp: \"false\",
} as NavInterface));
@Entry({useSharedStorage:false,storage:\"\",routeName:\"\"}) @Component() final struct Index extends CustomComponent<Index, __Options_Index> implements PageLifeCycle {
    public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
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
    @Memo() public build() {
        RowImpl(@Memo() ((instance: RowAttribute): void => {
          instance.setRowOptions(undefined).height("100%").applyAttributesFinish();
          return;
        }), @Memo() (() => {
          globalBuilder(this.message, 50);
          ForEachImpl(@Memo() ((instance: ForEachAttribute): void => {
            instance.setForEachOptions((() => {
              return builderArr;
            }), @Memo() ((item: @Builder() ((value: string, size: number)=> void)) => {
              item("Hello World", 30);
            }), undefined);
            return;
          }));
        }));
    }
    public constructor() {}
}

class __EntryWrapper extends EntryPoint {
    @Memo() public entry(): void {
        Index._instantiateImpl(undefined, (() => {
            return new Index();
        }), undefined, undefined, undefined);
    }
    public constructor() {}
}

@Entry({useSharedStorage:false,storage:\"\",routeName:\"\"}) @Component() export interface __Options_Index {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'message', '(string | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_message', '(IStateDecoratedVariable<string> | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_message', '(boolean | undefined)')}
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.incremental.runtime.state\";
import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from \"arkui.stateManagement.decorator\";
import { IStateDecoratedVariable as IStateDecoratedVariable } from \"arkui.stateManagement.decorator\";
import { RowAttribute as RowAttribute } from \"arkui.component.row\";
import { ForEachAttribute as ForEachAttribute } from "arkui.component.forEach";
import { ForEachImpl as ForEachImpl } from "arkui.component.forEach";
import { RowImpl as RowImpl } from "arkui.component.row";
import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";
import { Memo as Memo } from \"arkui.incremenal.annotation\";
import { TextAttribute as TextAttribute } from \"arkui.component.text\";
import { TextImpl as TextImpl } from "arkui.component.text";
import { NavInterface as NavInterface } from \"arkui.component.customComponent\";
import { PageLifeCycle as PageLifeCycle } from \"arkui.component.customComponent\";
import { EntryPoint as EntryPoint } from \"arkui.component.customComponent\";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Builder as Builder, Text as Text, Color as Color, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder, Entry as Entry, Component as Component, Row as Row, ForEach as ForEach } from \"@ohos.arkui.component\";
import { State as State } from \"@ohos.arkui.stateManagement\";
@Memo() let globalBuilder: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void);
let builderArr: Array<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
function main() {}
@Memo() function MyBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() value: string, @MemoSkip() size: number) {
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
@Memo() function YourBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() value: string, @MemoSkip() size: number) {
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
globalBuilder = MyBuilder;
builderArr = [MyBuilder, YourBuilder];
__EntryWrapper.RegisterNamedRouter(\"\", new __EntryWrapper(), ({
    bundleName: \"com.example.mock\",
    moduleName: \"entry\",
    pagePath: \"../../../wrap-builder/builder-in-generic\",
    pageFullPath: \"test/demo/mock/wrap-builder/builder-in-generic\",
    integratedHsp: \"false\",
} as NavInterface));
@Entry({useSharedStorage:false,storage:\"\",routeName:\"\"}) @Component() final struct Index extends CustomComponent<Index, __Options_Index> implements PageLifeCycle {
    public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
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
    @Memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        RowImpl(__memo_context, ((__memo_id) + (136716185)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: RowAttribute): void => {
          const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (46726221)), 1);
          const __memo_parameter_instance = __memo_scope.param(0, instance);
          if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
          }
          __memo_parameter_instance.value.setRowOptions(undefined).height("100%").applyAttributesFinish();
          {
            __memo_scope.recache();
            return;
          }
        }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
          const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (54078781)), 0);
          if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
          }
          globalBuilder(__memo_context, ((__memo_id) + (76711614)), this.message, 50);
          ForEachImpl(__memo_context, ((__memo_id) + (213687742)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ForEachAttribute): void => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (192802443)), 1);
            const __memo_parameter_instance = __memo_scope.param(0, instance);
            if (__memo_scope.unchanged) {
              __memo_scope.cached;
              return;
            }
            __memo_parameter_instance.value.setForEachOptions((() => {
              return builderArr;
            }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, item: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) => {
              const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (223657391)), 1);
              const __memo_parameter_item = __memo_scope.param(0, item);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              item(__memo_context, ((__memo_id) + (218979098)), "Hello World", 30);
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
    }));
        {
            __memo_scope.recache();
            return;
        }
    }
    public constructor() {}
}
    
class __EntryWrapper extends EntryPoint {
    @Memo() public entry(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
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

@Entry({useSharedStorage:false,storage:\"\",routeName:\"\"}) @Component() export interface __Options_Index {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'message', '(string | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_message', '(IStateDecoratedVariable<string> | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_message', '(boolean | undefined)')}
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test builder with generic builder type',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
