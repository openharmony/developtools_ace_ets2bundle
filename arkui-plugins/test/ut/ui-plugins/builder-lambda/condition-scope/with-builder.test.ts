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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'with-builder.ets'),
];

const pluginTester = new PluginTester('test conditionScope within @Builder or @BuilderParam', buildConfig);

const parsedTransform: Plugins = {
    name: 'with-builder',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { MemoSkip as MemoSkip } from "arkui.stateManagement.runtime";
import { ConditionScope as ConditionScope } from "arkui.component.builder";
import { ConditionBranch as ConditionBranch } from "arkui.component.builder";
import { memo as memo } from "arkui.stateManagement.runtime";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Builder as Builder } from "arkui.component.builder";
import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";
import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";
import { Text as Text, Column as Column, Component as Component, Builder as Builder, BuilderParam as BuilderParam, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder } from "@ohos.arkui.component";
const wBuilder = wrapBuilder(ParamBuilder);
function main() {}
@memo() function MyBuilder(): void {
    ConditionScope(@memo() (() => {
        if (true) {
            ConditionBranch(@memo() (() => {
                TextImpl(@memo() ((instance: TextAttribute): void => {
                    instance.setTextOptions("within Builder function", undefined).applyAttributesFinish();
                    return;
                }), undefined);
            }));
        }
    }));
}
@memo() function ParamBuilder(@Builder() @memo() @MemoSkip() gensym%%_<some_random_number>?: (()=> void)): void {
    let param: (()=> void) = (((gensym%%_<some_random_number>) !== (undefined)) ? gensym%%_<some_random_number> : ((() => {
        ConditionScope(@memo() (() => {
            if (true) {
                ConditionBranch(@memo() (() => {
                    TextImpl(@memo() ((instance: TextAttribute): void => {
                        instance.setTextOptions("within Builder parameter", undefined).applyAttributesFinish();
                        return;
                    }), undefined);
                }));
            }
        }));
    }) as (()=> void)));
    param();
}
@Component() final struct MyStruct extends CustomComponent<MyStruct, __Options_MyStruct> {
    public __initializeStruct(initializers: (__Options_MyStruct | undefined), @memo() content: ((()=> void) | undefined)): void {}
    public __updateStruct(initializers: (__Options_MyStruct | undefined)): void {}
    @MemoIntrinsic() public static _invoke(style: @memo() ((instance: MyStruct)=> void), initializers: ((()=> __Options_MyStruct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
      CustomComponent._invokeImpl<MyStruct, __Options_MyStruct>(style, ((): MyStruct => {
        return new MyStruct(false, ({let gensym___203542966 = storage;
        (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
      }), initializers, reuseId, content);
    }
    
    @ComponentBuilder() public static $_invoke(initializers?: __Options_MyStruct, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): MyStruct {
      throw new Error("Declare interface");
    }
    @memo() public myBuilderMethod() {
        ConditionScope(@memo() (() => {
            if (true) {
                ConditionBranch(@memo() (() => {
                    TextImpl(@memo() ((instance: TextAttribute): void => {
                        instance.setTextOptions("within Builder method", undefined).applyAttributesFinish();
                        return;
                    }), undefined);
                }));
            }
        }));
    }
    @memo() public build() {
      ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
        instance.setColumnOptions(undefined).applyAttributesFinish();
        return;
      }), @memo() (() => {
        wBuilder.builder(@Builder() (() => {
          ConditionScope(@memo() (() => {
            if (true) {
              ConditionBranch(@memo() (() => {
                TextImpl(@memo() ((instance: TextAttribute): void => {
                  instance.setTextOptions("with Builder lambda", undefined).applyAttributesFinish();
                  return;
                }), undefined);
              }));
            }
          }));
        }));
        Child._invoke(@memo() ((instance: Child): void => {
          instance.applyAttributesFinish();
          return;
        }), (() => {
          return {
            myBuilderParam: @memo() (() => {
              ConditionScope(@memo() (() => {
                if (true) {
                  ConditionBranch(@memo() (() => {
                    TextImpl(@memo() ((instance: TextAttribute): void => {
                      instance.setTextOptions("within Builder property", undefined).applyAttributesFinish();
                      return;
                    }), undefined);
                  }));
                }
              }));
              this.myBuilderMethod();
            }),
            __options_has_myBuilderParam: true,
          };
        }), undefined, undefined, undefined);
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
@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
    public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
        this.__backing_myBuilderParam = ((((({let gensym___<some_random_number> = initializers;
            (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.myBuilderParam)})) ?? (content))) ?? ((() => {
                ConditionScope(@memo() (() => {
                    if (true) {
                    ConditionBranch(@memo() (() => {
                        TextImpl(@memo() ((instance: TextAttribute): void => {
                            instance.setTextOptions("within BuilderParam property", undefined).applyAttributesFinish();
                            return;
                        }), undefined);
                    }));
                }
            }));
        })))
    }
    public __updateStruct(initializers: (__Options_Child | undefined)): void {}
    private __backing_myBuilderParam?: @memo() (()=> void);
    public get myBuilderParam(): @memo() (()=> void) {
        return this.__backing_myBuilderParam!;
    }
    public set myBuilderParam(value: @memo() (()=> void)) {
        this.__backing_myBuilderParam = value;
    }
    @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
      CustomComponent._invokeImpl<Child, __Options_Child>(style, ((): Child => {
        return new Child(false, ({let gensym___46528967 = storage;
        (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
      }), initializers, reuseId, content);
    }
    
    @ComponentBuilder() public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Child {
      throw new Error("Declare interface");
    }
    @memo() public build() {
        ConditionScope(@memo() (() => {
            if (true) {
                ConditionBranch(@memo() (() => {
                    TextImpl(@memo() ((instance: TextAttribute): void => {
                        instance.setTextOptions("within struct build", undefined).applyAttributesFinish();
                        return;
                    }), undefined);
                }));
            }
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
@Component() export interface __Options_MyStruct {
}
@Component() export interface __Options_Child {
  set myBuilderParam(myBuilderParam: (@memo() (()=> void) | undefined))
  get myBuilderParam(): (@memo() (()=> void) | undefined)
  set __options_has_myBuilderParam(__options_has_myBuilderParam: (boolean | undefined))
  get __options_has_myBuilderParam(): (boolean | undefined)
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { MemoSkip as MemoSkip } from "arkui.stateManagement.runtime";
import { ConditionScope as ConditionScope } from "arkui.component.builder";
import { ConditionBranch as ConditionBranch } from "arkui.component.builder";
import { memo as memo } from "arkui.stateManagement.runtime";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Builder as Builder } from "arkui.component.builder";
import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";
import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";
import { Text as Text, Column as Column, Component as Component, Builder as Builder, BuilderParam as BuilderParam, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder } from "@ohos.arkui.component";
const wBuilder = wrapBuilder(ParamBuilder);
function main() {}
@memo() function MyBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
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
                TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                    const __memo_parameter_instance = __memo_scope.param(0, instance);
                    if (__memo_scope.unchanged) {
                        __memo_scope.cached;
                        return;
                    }
                    __memo_parameter_instance.value.setTextOptions("within Builder function", undefined).applyAttributesFinish();
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
}
@memo() function ParamBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @Builder() @memo() @MemoSkip() gensym%%_<some_random_number>?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void {
    let param: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) = (((gensym%%_<some_random_number>) !== (undefined)) ? gensym%%_<some_random_number> : (((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
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
                    TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                        const __memo_parameter_instance = __memo_scope.param(0, instance);
                        if (__memo_scope.unchanged) {
                            __memo_scope.cached;
                            return;
                        }
                        __memo_parameter_instance.value.setTextOptions("within Builder parameter", undefined).applyAttributesFinish();
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
    }) as ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)));
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    param(__memo_context, ((__memo_id) + (<some_random_number>)));
    {
        __memo_scope.recache();
        return;
    }
}
@Component() final struct MyStruct extends CustomComponent<MyStruct, __Options_MyStruct> {
    public __initializeStruct(initializers: (__Options_MyStruct | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}
    public __updateStruct(initializers: (__Options_MyStruct | undefined)): void {}
    @MemoIntrinsic() public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: MyStruct)=> void), initializers: ((()=> __Options_MyStruct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
      CustomComponent._invokeImpl<MyStruct, __Options_MyStruct>(__memo_context, ((__memo_id) + (173773669)), style, ((): MyStruct => {
        return new MyStruct(false, ({let gensym___203542966 = storage;
        (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
      }), initializers, reuseId, content);
    }
    
    @ComponentBuilder() public static $_invoke(initializers?: __Options_MyStruct, storage?: LocalStorage, @Builder() @memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): MyStruct {
      throw new Error("Declare interface");
    }
    @memo() public myBuilderMethod(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
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
                    TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                        const __memo_parameter_instance = __memo_scope.param(0, instance);
                        if (__memo_scope.unchanged) {
                            __memo_scope.cached;
                            return;
                        }
                        __memo_parameter_instance.value.setTextOptions("within Builder method", undefined).applyAttributesFinish();
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
    }
    @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (54808714)), 0);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        ColumnImpl(__memo_context, ((__memo_id) + (77657771)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
          const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (72614054)), 1);
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
          const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (125892063)), 0);
          if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
          }
          wBuilder.builder(__memo_context, ((__memo_id) + (136286509)), @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (225484108)), 0);
            if (__memo_scope.unchanged) {
              __memo_scope.cached;
              return;
            }
            ConditionScope(__memo_context, ((__memo_id) + (157355641)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
              const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (27183850)), 0);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
            if (true) {
              ConditionBranch(__memo_context, ((__memo_id) + (139295044)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (257873411)), 0);
                if (__memo_scope.unchanged) {
                  __memo_scope.cached;
                  return;
                }
                TextImpl(__memo_context, ((__memo_id) + (5605714)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (172290133)), 1);
                  const __memo_parameter_instance = __memo_scope.param(0, instance);
                  if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                  }
                  __memo_parameter_instance.value.setTextOptions("with Builder lambda", undefined).applyAttributesFinish();
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
        Child._invoke(__memo_context, ((__memo_id) + (79161746)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Child): void => {
          const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (203810821)), 1);
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
        }), (() => {
          return {
            myBuilderParam: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
              const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (34887364)), 0);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              ConditionScope(__memo_context, ((__memo_id) + (219763513)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (53444768)), 0);
                if (__memo_scope.unchanged) {
                  __memo_scope.cached;
                  return;
                }
                if (true) {
                  ConditionBranch(__memo_context, ((__memo_id) + (55686085)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (120719913)), 0);
                    if (__memo_scope.unchanged) {
                      __memo_scope.cached;
                      return;
                    }
                    TextImpl(__memo_context, ((__memo_id) + (163744638)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (215219604)), 1);
                      const __memo_parameter_instance = __memo_scope.param(0, instance);
                      if (__memo_scope.unchanged) {
                        __memo_scope.cached;
                        return;
                      }
                      __memo_parameter_instance.value.setTextOptions("within Builder property", undefined).applyAttributesFinish();
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
              this.myBuilderMethod(__memo_context, ((__memo_id) + (226403822)));
              {
                __memo_scope.recache();
                return;
              }
            }),
            __options_has_myBuilderParam: true,
          };
        }), undefined, undefined, undefined);
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
@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
    public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
        this.__backing_myBuilderParam = ((((({let gensym___<some_random_number> = initializers;
            (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.myBuilderParam)})) ?? (content))) ?? (((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
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
                            TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                                const __memo_parameter_instance = __memo_scope.param(0, instance);
                                if (__memo_scope.unchanged) {
                                    __memo_scope.cached;
                                    return;
                                }
                                __memo_parameter_instance.value.setTextOptions("within BuilderParam property", undefined).applyAttributesFinish();
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
            })))
    }
    public __updateStruct(initializers: (__Options_Child | undefined)): void {}
    private __backing_myBuilderParam?: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
    public get myBuilderParam(): @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) {
        return this.__backing_myBuilderParam!;
    }
    public set myBuilderParam(value: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) {
        this.__backing_myBuilderParam = value;
    }
    @MemoIntrinsic() public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
      CustomComponent._invokeImpl<Child, __Options_Child>(__memo_context, ((__memo_id) + (6301141)), style, ((): Child => {
        return new Child(false, ({let gensym___46528967 = storage;
        (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
      }), initializers, reuseId, content);
    }
    
    @ComponentBuilder() public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): Child {
      throw new Error("Declare interface");
    }
    @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
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
                    TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                        const __memo_parameter_instance = __memo_scope.param(0, instance);
                        if (__memo_scope.unchanged) {
                            __memo_scope.cached;
                            return;
                        }
                        __memo_parameter_instance.value.setTextOptions("within struct build", undefined).applyAttributesFinish();
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
@Component() export interface __Options_MyStruct {
}
@Component() export interface __Options_Child {
  set myBuilderParam(myBuilderParam: (@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined))
  get myBuilderParam(): (@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)
  set __options_has_myBuilderParam(__options_has_myBuilderParam: (boolean | undefined))
  get __options_has_myBuilderParam(): (boolean | undefined)
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test conditionScope within @Builder or @BuilderParam',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
