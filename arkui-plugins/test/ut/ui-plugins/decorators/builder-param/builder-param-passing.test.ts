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

const FUNCTION_DIR_PATH: string = 'decorators/builder-param';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'builder-param-passing.ets'),
];

const pluginTester = new PluginTester('test builder param variable passing', buildConfig);

const parsedTransform: Plugins = {
    name: 'builder-param-passing',
    parsed: uiTransform().parsed,
};

const expectedAfterUIScript: string = `
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam, Column as Column, Text as Text } from "@ohos.arkui.component";

function main() {}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_customBuilderParam = ((((({let gensym___169376706 = initializers;
    (((gensym___169376706) == (null)) ? undefined : gensym___169376706.customBuilderParam)})) ?? (content))) ?? (this.customBuilder))
  }
  
  public __updateStruct(initializers: (__Options_Child | undefined)): void {}
  
  private __backing_customBuilderParam?: @memo() (()=> void);
  
  public get customBuilderParam(): @memo() (()=> void) {
    return this.__backing_customBuilderParam!;
  }
  
  public set customBuilderParam(value: @memo() (()=> void)) {
    this.__backing_customBuilderParam = value;
  }
  
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Child, __Options_Child>(style, ((): Child => {
      return new Child(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Child {
    throw new Error("Declare interface");
  }
  
  @memo() public customBuilder() {}
  
  @memo() public build() {
    this.customBuilderParam();
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

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}
  
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Parent)=> void), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Parent, __Options_Parent>(style, ((): Parent => {
      return new Parent(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }
  
  @memo() public componentBuilder() {
    TextImpl(@memo() ((instance: TextAttribute): void => {
      instance.setTextOptions("Parent builder", undefined).applyAttributesFinish();
      return;
    }), undefined);
  }
  
  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      Child._invoke(@memo() ((instance: Child): void => {
        instance.applyAttributesFinish();
        return;
      }), (() => {
        return {
          customBuilderParam: this.componentBuilder,
          __options_has_customBuilderParam: true,
        };
      }), undefined, undefined, undefined);
      Child._invoke(@memo() ((instance: Child): void => {
        instance.applyAttributesFinish();
        return;
      }), (() => {
        return {
          customBuilderParam: @memo() (() => {
            this.componentBuilder();
          }),
          __options_has_customBuilderParam: true,
        };
      }), undefined, undefined, undefined);
      Child._invoke(@memo() ((instance: Child): void => {
        instance.applyAttributesFinish();
        return;
      }), undefined, undefined, undefined, @memo() (() => {
        TextImpl(@memo() ((instance: TextAttribute): void => {
          instance.setTextOptions("Parent builder", undefined).applyAttributesFinish();
          return;
        }), undefined);
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

@Component() export interface __Options_Child {
  set customBuilderParam(customBuilderParam: (@memo() (()=> void) | undefined))

  get customBuilderParam(): (@memo() (()=> void) | undefined)
  set __options_has_customBuilderParam(__options_has_customBuilderParam: (boolean | undefined))
  
  get __options_has_customBuilderParam(): (boolean | undefined)
  
}

@Component() export interface __Options_Parent {

}
`;

const expectedAfterMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";
import { memo as memo } from "arkui.stateManagement.runtime";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Builder as Builder } from "arkui.component.builder";
import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";
import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";
import { Component as Component, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam, Column as Column, Text as Text } from "@ohos.arkui.component";

function main() {}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_customBuilderParam = ((((({let gensym___169376706 = initializers;
    (((gensym___169376706) == (null)) ? undefined : gensym___169376706.customBuilderParam)})) ?? (content))) ?? (this.customBuilder))
  }

  public __updateStruct(initializers: (__Options_Child | undefined)): void {}

  private __backing_customBuilderParam?: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);

  public get customBuilderParam(): @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) {
    return this.__backing_customBuilderParam!;
  }

  public set customBuilderParam(value: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) {
    this.__backing_customBuilderParam = value;
  }
  
  @MemoIntrinsic() public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<Child, __Options_Child>(__memo_context, ((__memo_id) + (47330804)), style, ((): Child => {
      return new Child(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): Child {
    throw new Error("Declare interface");
  }
  
  @memo() public customBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (252759234)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }

  @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (209256344)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    this.customBuilderParam(__memo_context, ((__memo_id) + (175145513)));
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

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}
  
  @MemoIntrinsic() public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Parent)=> void), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<Parent, __Options_Parent>(__memo_context, ((__memo_id) + (211301233)), style, ((): Parent => {
      return new Parent(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() @memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): Parent {
    throw new Error("Declare interface");
  }

  @memo() public componentBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (219399173)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    TextImpl(__memo_context, ((__memo_id) + (137225318)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
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

  @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (135515930)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (136716185)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
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
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (54078781)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      Child._invoke(__memo_context, ((__memo_id) + (192802443)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Child): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (223657391)), 1);
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
          customBuilderParam: this.componentBuilder,
          __options_has_customBuilderParam: true,
        };
      }), undefined, undefined, undefined);
      Child._invoke(__memo_context, ((__memo_id) + (78055758)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Child): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (213687742)), 1);
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
          customBuilderParam: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (136716185)), 0);
            if (__memo_scope.unchanged) {
              __memo_scope.cached;
              return;
            }
            this.componentBuilder(__memo_context, ((__memo_id) + (54078781)));
            {
              __memo_scope.recache();
              return;
            }
          }),
          __options_has_customBuilderParam: true,
        };
      }), undefined, undefined, undefined);
      Child._invoke(__memo_context, ((__memo_id) + (238360624)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Child): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (262314519)), 1);
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
      }), undefined, undefined, undefined, @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (151409217)), 0);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        TextImpl(__memo_context, ((__memo_id) + (223657391)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
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

@Component() export interface __Options_Child {
  set customBuilderParam(customBuilderParam: (@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined))

  get customBuilderParam(): (@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)
  set __options_has_customBuilderParam(__options_has_customBuilderParam: (boolean | undefined))
  
  get __options_has_customBuilderParam(): (boolean | undefined)
  
}

@Component() export interface __Options_Parent {

}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedAfterUIScript));
}

function testMemoCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedAfterMemoScript));
}

pluginTester.run(
    'test builder param variable passing',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
        'checked:memo-no-recheck': [testMemoCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
