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

const FUNCTION_DIR_PATH: string = 'decorators/builder-param';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'optional-builder-param.ets'),
];

const pluginTester = new PluginTester('test optional builder param', buildConfig);

const parsedTransform: Plugins = {
    name: 'optional-builder-param',
    parsed: uiTransform().parsed
};

const expectedUIScript: string = `
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";
import { RowAttribute as RowAttribute } from "arkui.component.row";
import { RowImpl as RowImpl } from "arkui.component.row";
import { Memo as Memo } from "arkui.incremental.annotation";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Builder as Builder } from "arkui.component.builder";
import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";
import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";
import { Component as Component, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam, Column as Column, Text as Text, Row as Row } from "@ohos.arkui.component";

function main() {}

@Memo() 
function showTextBuilder() {
  TextImpl(@Memo() ((instance: TextAttribute): void => {
    instance.setTextOptions("Hello World", undefined).applyAttributesFinish();
    return;
  }), undefined);
}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_customBuilderParam2 = ((((({let gensym___103851375 = initializers;
    (((gensym___103851375) == (null)) ? undefined : gensym___103851375.customBuilderParam2)})) ?? (content))) ?? (undefined))
    this.__backing_customBuilderParam1 = ((((({let gensym___20169645 = initializers;
    (((gensym___20169645) == (null)) ? undefined : gensym___20169645.customBuilderParam1)})) ?? (content))) ?? (showTextBuilder))
  }

  public __updateStruct(initializers: (__Options_Child | undefined)): void {}

  private __backing_customBuilderParam2?: ((()=> void) | undefined);

  public get customBuilderParam2(): (@Memo() (()=> void) | undefined) {
    return this.__backing_customBuilderParam2;
  }

  public set customBuilderParam2(value: (@Memo() (()=> void) | undefined)) {
    this.__backing_customBuilderParam2 = value;
  }

  private __backing_customBuilderParam1?: @Memo() (()=> void);

  public get customBuilderParam1(): @Memo() (()=> void) {
    return this.__backing_customBuilderParam1!;
  }

  public set customBuilderParam1(value: @Memo() (()=> void)) {
    this.__backing_customBuilderParam1 = value;
  }

  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Child, __Options_Child>(style, ((): Child => {
      return new Child(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Child {
    throw new Error("Declare interface");
  }

  @Memo() 
  public build() {
    RowImpl(@Memo() ((instance: RowAttribute): void => {
      instance.setRowOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
        if (this.customBuilderParam2) {
            (this.customBuilderParam2 as (()=> void))();
        }
        if (this.customBuilderParam2) {
            this.customBuilderParam2!();
        }
      this.customBuilderParam1();
    }));
  }

  ${dumpConstructor()}

}

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @Memo() content: ((()=> void) | undefined)): void {}

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: Parent)=> void), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Parent, __Options_Parent>(style, ((): Parent => {
      return new Parent(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }

  @Memo() 
  public componentBuilder() {
    TextImpl(@Memo() ((instance: TextAttribute): void => {
      instance.setTextOptions("Parent builder", undefined).applyAttributesFinish();
      return;
    }), undefined);
  }

  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      Child._invoke(@Memo() ((instance: Child): void => {
        instance.applyAttributesFinish();
        return;
      }), (() => {
        return {
          customBuilderParam2: @Memo() (() => {
            this.componentBuilder();
          }),
          __options_has_customBuilderParam2: true,
        };
      }), undefined, undefined, undefined);
    }));
  }

  ${dumpConstructor()}

}

@Component() export interface __Options_Child {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'customBuilderParam2', '(((()=> void) | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_customBuilderParam2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'customBuilderParam1', '(@Memo() (()=> void) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_customBuilderParam1', '(boolean | undefined)')}
  
}

@Component() export interface __Options_Parent {

}
`;

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";
import { RowAttribute as RowAttribute } from "arkui.component.row";
import { RowImpl as RowImpl } from "arkui.component.row";
import { Memo as Memo } from "arkui.incremental.annotation";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Builder as Builder } from "arkui.component.builder";
import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";
import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";
import { Component as Component, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam, Column as Column, Text as Text, Row as Row } from "@ohos.arkui.component";

function main() {}

@Memo() 
function showTextBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (183537441)), 0);
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
    __memo_parameter_instance.value.setTextOptions("Hello World", undefined).applyAttributesFinish();
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

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_customBuilderParam2 = ((((({let gensym___103851375 = initializers;
    (((gensym___103851375) == (null)) ? undefined : gensym___103851375.customBuilderParam2)})) ?? (content))) ?? (undefined))
    this.__backing_customBuilderParam1 = ((((({let gensym___20169645 = initializers;
    (((gensym___20169645) == (null)) ? undefined : gensym___20169645.customBuilderParam1)})) ?? (content))) ?? (showTextBuilder))
  }

  public __updateStruct(initializers: (__Options_Child | undefined)): void {}

  private __backing_customBuilderParam2?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);

  public get customBuilderParam2(): (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined) {
    return this.__backing_customBuilderParam2;
  }

  public set customBuilderParam2(value: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)) {
    this.__backing_customBuilderParam2 = value;
  }

  private __backing_customBuilderParam1?: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);

  public get customBuilderParam1(): @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) {
    return this.__backing_customBuilderParam1!;
  }

  public set customBuilderParam1(value: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) {
    this.__backing_customBuilderParam1 = value;
  }

  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<Child, __Options_Child>(__memo_context, ((__memo_id) + (137225318)), style, ((): Child => {
      return new Child(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): Child {
    throw new Error("Declare interface");
  }

  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (124051006)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    RowImpl(__memo_context, ((__memo_id) + (226403822)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: RowAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (163744638)), 1);
      const __memo_parameter_instance = __memo_scope.param(0, instance);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      __memo_parameter_instance.value.setRowOptions(undefined).applyAttributesFinish();
      {
        __memo_scope.recache();
        return;
      }
    }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (219763513)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      if (this.customBuilderParam2) {
        (this.customBuilderParam2 as ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void))(__memo_context, ((__memo_id) + (120719913)));
      }
      if (this.customBuilderParam2) {
        this.customBuilderParam2!(__memo_context, ((__memo_id) + (55686085)));
      }
      this.customBuilderParam1(__memo_context, ((__memo_id) + (53444768)));
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

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Parent)=> void), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<Parent, __Options_Parent>(__memo_context, ((__memo_id) + (211301233)), style, ((): Parent => {
      return new Parent(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): Parent {
    throw new Error("Declare interface");
  }

  @Memo() 
  public componentBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (179117969)), 0);
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
      __memo_parameter_instance.value.setTextOptions("Parent builder", undefined).applyAttributesFinish();
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

  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (245938697)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (78055758)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
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
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (136716185)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      Child._invoke(__memo_context, ((__memo_id) + (257873411)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Child): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (72614054)), 1);
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
          customBuilderParam2: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (5605714)), 0);
            if (__memo_scope.unchanged) {
              __memo_scope.cached;
              return;
            }
            this.componentBuilder(__memo_context, ((__memo_id) + (172290133)));
            {
              __memo_scope.recache();
              return;
            }
          }),
          __options_has_customBuilderParam2: true,
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

@Component() export interface __Options_Child {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'customBuilderParam2', '((((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_customBuilderParam2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'customBuilderParam1', '(@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_customBuilderParam1', '(boolean | undefined)')}
  
}

@Component() export interface __Options_Parent {

}
`;

function testUICheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

function testMemoCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test optional builder param',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUICheckedTransformer],
        'checked:memo-no-recheck': [testMemoCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
