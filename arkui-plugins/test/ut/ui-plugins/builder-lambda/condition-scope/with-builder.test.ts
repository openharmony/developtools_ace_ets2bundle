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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'with-builder.ets'),
];

const pluginTester = new PluginTester('test conditionScope within @Builder or @BuilderParam', buildConfig);

const parsedTransform: Plugins = {
    name: 'with-builder',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, Builder as Builder, BuilderParam as BuilderParam, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder } from "@ohos.arkui.component";

const wBuilder = wrapBuilder(ParamBuilder);
function main() {}

@Memo() 
function MyBuilder(): void {
  if (true) {
    TextImpl(@Memo() ((instance: TextAttribute): void => {
      instance.setTextOptions("within Builder function", undefined).applyAttributesFinish();
      return;
    }), undefined);
  }
}

@Memo() 
function ParamBuilder(@Builder() @Memo() @MemoSkip() gensym%%_1?: (()=> void)): void {
  let param: (()=> void) = (((gensym%%_1) !== (undefined)) ? gensym%%_1 : (() => {
    if (true) {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions("within Builder parameter", undefined).applyAttributesFinish();
        return;
      }), undefined);
    }
  }));
  param();
}


@Component() final struct MyStruct extends CustomComponent<MyStruct, __Options_MyStruct> {
  public __initializeStruct(initializers: (__Options_MyStruct | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_MyStruct | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: MyStruct)=> void), initializers: ((()=> __Options_MyStruct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStruct, __Options_MyStruct>(style, ((): MyStruct => {
      return new MyStruct(false, ({let gensym___249621102 = storage;
      (((gensym___249621102) == (null)) ? undefined : gensym___249621102())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStruct, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): MyStruct {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public myBuilderMethod() {
    if (true) {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions("within Builder method", undefined).applyAttributesFinish();
        return;
      }), undefined);
    }
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      wBuilder.builder(@Builder() (() => {
        if (true) {
          TextImpl(@Memo() ((instance: TextAttribute): void => {
            instance.setTextOptions("with Builder lambda", undefined).applyAttributesFinish();
            return;
          }), undefined);
        }
      }));
      Child._invoke(@Memo() ((instance: Child): void => {
        instance.applyAttributesFinish();
        return;
      }), (() => {
        return {
          myBuilderParam: @Memo() (() => {
            if (true) {
              TextImpl(@Memo() ((instance: TextAttribute): void => {
                instance.setTextOptions("within Builder property", undefined).applyAttributesFinish();
                return;
              }), undefined);
            }
            this.myBuilderMethod();
          }),
          __options_has_myBuilderParam: true,
        };
      }), undefined, undefined, undefined);
    }));
  }
  
  ${dumpConstructor()}
  
}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_myBuilderParam = ((((({let gensym___76154828 = initializers;
    (((gensym___76154828) == (null)) ? undefined : gensym___76154828.myBuilderParam)})) ?? (content))) ?? ((() => {
      if (true) {
        TextImpl(@Memo() ((instance: TextAttribute): void => {
          instance.setTextOptions("within BuilderParam property", undefined).applyAttributesFinish();
          return;
        }), undefined);
      }
    })))
  }
  
  public __updateStruct(initializers: (__Options_Child | undefined)): void {}
  
  private __backing_myBuilderParam?: @Memo() (()=> void);
  public get myBuilderParam(): @Memo() (()=> void) {
    return this.__backing_myBuilderParam!;
  }
  
  public set myBuilderParam(value: @Memo() (()=> void)) {
    this.__backing_myBuilderParam = value;
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Child, __Options_Child>(style, ((): Child => {
      return new Child(false, ({let gensym___29142858 = storage;
      (((gensym___29142858) == (null)) ? undefined : gensym___29142858())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Child {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {
    if (true) {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions("within struct build", undefined).applyAttributesFinish();
        return;
      }), undefined);
    }
  }

  ${dumpConstructor()}
  
}

@Component() export interface __Options_MyStruct {
  
}
@Component() export interface __Options_Child {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'myBuilderParam', '(@Memo() (()=> void) | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_myBuilderParam', '(boolean | undefined)')}
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, Builder as Builder, BuilderParam as BuilderParam, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder } from "@ohos.arkui.component";

const wBuilder = wrapBuilder(ParamBuilder);
function main() {}

@Memo() 
function MyBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (86315751)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  if (true) {
    TextImpl(__memo_context, ((__memo_id) + (136286509)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (225484108)), 1);
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
  }
  {
    __memo_scope.recache();
    return;
  }
}

@Memo() 
function ParamBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @Builder() @Memo() @MemoSkip() gensym%%_1?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void {
  let param: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) = (((gensym%%_1) !== (undefined)) ? gensym%%_1 : ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (120719913)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    if (true) {
      TextImpl(__memo_context, ((__memo_id) + (163744638)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (215219604)), 1);
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
    }
    {
      __memo_scope.recache();
      return;
    }
  }));
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (132835883)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  param(__memo_context, ((__memo_id) + (55686085)));
  {
    __memo_scope.recache();
    return;
  }
}


@Component() final struct MyStruct extends CustomComponent<MyStruct, __Options_MyStruct> {
  public __initializeStruct(initializers: (__Options_MyStruct | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_MyStruct | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: MyStruct)=> void), initializers: ((()=> __Options_MyStruct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStruct, __Options_MyStruct>(__memo_context, ((__memo_id) + (219763513)), style, ((): MyStruct => {
      return new MyStruct(false, ({let gensym___249621102 = storage;
      (((gensym___249621102) == (null)) ? undefined : gensym___249621102())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStruct, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): MyStruct {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public myBuilderMethod(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (88797279)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    if (true) {
      TextImpl(__memo_context, ((__memo_id) + (34887364)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (226403822)), 1);
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
    }
    {
      __memo_scope.recache();
      return;
    }
  }
  
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (141304730)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (121412859)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (125892063)), 1);
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
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (254080160)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      wBuilder.builder(__memo_context, ((__memo_id) + (126575967)), @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (230292968)), 0);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        if (true) {
          TextImpl(__memo_context, ((__memo_id) + (36476765)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (77657771)), 1);
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
        }
        {
          __memo_scope.recache();
          return;
        }
      }));
      Child._invoke(__memo_context, ((__memo_id) + (6301141)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Child): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (23694753)), 1);
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
          myBuilderParam: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (231953030)), 0);
            if (__memo_scope.unchanged) {
              __memo_scope.cached;
              return;
            }
            if (true) {
              TextImpl(__memo_context, ((__memo_id) + (125764031)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (106228909)), 1);
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
            }
            this.myBuilderMethod(__memo_context, ((__memo_id) + (160289527)));
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
  
  ${dumpConstructor()}
  
}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_myBuilderParam = ((((({let gensym___76154828 = initializers;
    (((gensym___76154828) == (null)) ? undefined : gensym___76154828.myBuilderParam)})) ?? (content))) ?? (((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (167252533)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      if (true) {
        TextImpl(__memo_context, ((__memo_id) + (128234023)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
          const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (162765000)), 1);
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
      }
      {
        __memo_scope.recache();
        return;
      }
    })))
  }
  
  public __updateStruct(initializers: (__Options_Child | undefined)): void {}
  
  private __backing_myBuilderParam?: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
  public get myBuilderParam(): @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) {
    return this.__backing_myBuilderParam!;
  }
  
  public set myBuilderParam(value: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) {
    this.__backing_myBuilderParam = value;
  }
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<Child, __Options_Child>(__memo_context, ((__memo_id) + (97753005)), style, ((): Child => {
      return new Child(false, ({let gensym___29142858 = storage;
      (((gensym___29142858) == (null)) ? undefined : gensym___29142858())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): Child {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (240349951)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    if (true) {
      TextImpl(__memo_context, ((__memo_id) + (44384010)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (192635173)), 1);
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
    }
    {
      __memo_scope.recache();
      return;
    }
  }
  
  ${dumpConstructor()}
  
}

@Component() export interface __Options_MyStruct {
  
}

@Component() export interface __Options_Child {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'myBuilderParam', '(@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_myBuilderParam', '(boolean | undefined)')}
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
