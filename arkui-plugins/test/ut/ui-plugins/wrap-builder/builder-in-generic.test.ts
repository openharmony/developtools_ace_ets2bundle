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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, WRAP_BUILDER_DIR_PATH, 'builder-in-generic.ets'),
];

const pluginTester = new PluginTester('test builder with generic builder type', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";
import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";
import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";
import { RowAttribute as RowAttribute } from "arkui.component.row";
import { ForEachAttribute as ForEachAttribute } from "arkui.component.forEach";
import { ForEachImpl as ForEachImpl } from "arkui.component.forEach";
import { RowImpl as RowImpl } from "arkui.component.row";
import { MemoSkip as MemoSkip } from "arkui.stateManagement.runtime";
import { memo as memo } from "arkui.stateManagement.runtime";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { NavInterface as NavInterface } from "arkui.component.customComponent";
import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";
import { EntryPoint as EntryPoint } from "arkui.component.customComponent";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Builder as Builder } from "arkui.component.builder";
import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";
import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";
import { Builder as Builder, Text as Text, Color as Color, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder, Entry as Entry, Component as Component, Row as Row, ForEach as ForEach } from "@ohos.arkui.component";
import { State as State } from "@ohos.arkui.stateManagement";
@memo() const globalBuilder: @Builder() ((value: string, size: number)=> void) = MyBuilder;
const builderArr: Array<@Builder() ((value: string, size: number)=> void)> = [MyBuilder, YourBuilder];
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
__EntryWrapper.RegisterNamedRouter(\"\", new __EntryWrapper(), ({
    bundleName: \"com.example.mock\",
    moduleName: \"entry\",
    pagePath: \"../../../wrap-builder/builder-in-generic\",
    pageFullPath: \"test/demo/mock/wrap-builder/builder-in-generic\",
    integratedHsp: \"false\",
} as NavInterface));
@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct Index extends CustomComponent<Index, __Options_Index> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_Index | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_message = STATE_MGMT_FACTORY.makeState<string>(this, "message", ((({let gensym___117212394 = initializers;
    (((gensym___117212394) == (null)) ? undefined : gensym___117212394.message)})) ?? ("Hello World")));
  }
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  private __backing_message?: IStateDecoratedVariable<string>;
  public get message(): string {
    return this.__backing_message!.get();
  }
  public set message(value: string) {
    this.__backing_message!.set(value);
  }
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Index)=> void), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  @memo() public build() {
    RowImpl(@memo() ((instance: RowAttribute): void => {
      instance.setRowOptions(undefined).height("100%").applyAttributesFinish();
      return;
    }), @memo() (() => {
      globalBuilder(this.message, 50);
      ForEachImpl(@memo() ((instance: ForEachAttribute): void => {
        instance.setForEachOptions(((): Array<@Builder() ((value: string, size: number)=> void)> => {
          return builderArr;
        }), @memo() ((item: @Builder() ((value: string, size: number)=> void)) => {
          item("Hello World", 30);
        }), undefined);
        return;
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
    Index._invoke(@memo() ((instance: Index): void => {
      instance.applyAttributesFinish();
      return;
    }), undefined, undefined, undefined, undefined);
  }
  public constructor() {}
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";
import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";
import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";
import { RowAttribute as RowAttribute } from "arkui.component.row";
import { ForEachAttribute as ForEachAttribute } from "arkui.component.forEach";
import { ForEachImpl as ForEachImpl } from "arkui.component.forEach";
import { RowImpl as RowImpl } from "arkui.component.row";
import { MemoSkip as MemoSkip } from "arkui.stateManagement.runtime";
import { memo as memo } from "arkui.stateManagement.runtime";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { NavInterface as NavInterface } from "arkui.component.customComponent";
import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";
import { EntryPoint as EntryPoint } from "arkui.component.customComponent";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Builder as Builder } from "arkui.component.builder";
import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";
import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";
import { Builder as Builder, Text as Text, Color as Color, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder, Entry as Entry, Component as Component, Row as Row, ForEach as ForEach } from "@ohos.arkui.component";
import { State as State } from "@ohos.arkui.stateManagement";
@memo() const globalBuilder: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) = MyBuilder;
const builderArr: Array<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> = [MyBuilder, YourBuilder];
function main() {}

@memo() function MyBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() value: string, @MemoSkip() size: number) {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (241300838)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  TextImpl(__memo_context, ((__memo_id) + (175145513)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (47330804)), 1);
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
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (160135018)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  TextImpl(__memo_context, ((__memo_id) + (211301233)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (137225318)), 1);
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
__EntryWrapper.RegisterNamedRouter(\"\", new __EntryWrapper(), ({
    bundleName: \"com.example.mock\",
    moduleName: \"entry\",
    pagePath: \"../../../wrap-builder/builder-in-generic\",
    pageFullPath: \"test/demo/mock/wrap-builder/builder-in-generic\",
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
    @MemoIntrinsic() public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Index)=> void), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
      CustomComponent._invokeImpl<Index, __Options_Index>(__memo_context, ((__memo_id) + (46726221)), style, ((): Index => {
        return new Index(false, ({let gensym___149025070 = storage;
        (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
      }), initializers, reuseId, content);
    }

    @ComponentBuilder() public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() @memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): Index {
      throw new Error("Declare interface");
    }
    @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        RowImpl(__memo_context, ((__memo_id) + (136716185)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: RowAttribute): void => {
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
        }), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
          const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (54078781)), 0);
          if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
          }
          globalBuilder(__memo_context, ((__memo_id) + (76711614)), this.message, 50);
          ForEachImpl(__memo_context, ((__memo_id) + (213687742)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ForEachAttribute): void => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (192802443)), 1);
            const __memo_parameter_instance = __memo_scope.param(0, instance);
            if (__memo_scope.unchanged) {
              __memo_scope.cached;
              return;
            }
            __memo_parameter_instance.value.setForEachOptions(((): Array<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> => {
              return builderArr;
            }), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, item: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) => {
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
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (81582415)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    Index._invoke(__memo_context, ((__memo_id) + (155886964)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Index): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (173773669)), 1);
      const __memo_parameter_instance = __memo_scope.param(0, instance);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      __memo_parameter_instance.value.applyAttributesFinish();
      {
        __memo_scope.recache();
        return;
      }
    }), undefined, undefined, undefined, undefined);
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
