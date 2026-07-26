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
import { recheck, uiNoRecheck, collectNoRecheck, memoNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpAnnotation, dumpGetterSetter, GetSetDumper, ignoreNewLines, dumpConstructor } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/require';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'builder-require.ets'),
];

const pluginTester = new PluginTester('test @Require decorator capability with @Builder or @BuilderParam', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedCheckedUIScript: string = `
import { Memo } from "arkui.incremental.annotation";

import { ColumnImpl } from "arkui.component.column";

import { ColumnAttribute } from "arkui.component.column";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponent } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint } from "arkui.component.customComponent";

import { NavInterface } from "arkui.component.customComponent";

import { WrappedBuilder, wrapBuilder, Entry, Text, Column, Component, Button, ClickEvent, Builder, BuilderParam } from "@ohos.arkui.component";

import { State, Link, PropRef, Require } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/require/builder-require",
  pageFullPath: "test/demo/mock/decorators/require/builder-require",
  integratedHsp: "false",
} as NavInterface));
@Entry() @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_closer = ((({let gensym___38813563 = initializers;
    (((gensym___38813563) == (null)) ? undefined : gensym___38813563.closer)})) ?? (undefined));
    this.__backing_closer1 = ((((({let gensym___87324922 = initializers;
    (((gensym___87324922) == (null)) ? undefined : gensym___87324922!.closer1)})) ?? (content))) ?? (((({let gensym___87324922 = initializers;
    (((gensym___87324922) == (null)) ? undefined : gensym___87324922!.closer1)})) ?? (undefined))));
    this.__backing_closer2 = (initializers!.closer2 as @Builder() (()=> void));
  }

  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {}

  ${dumpAnnotation('MemoIntrinsic')}
  public static _invoke(style: (@Memo() ((instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }

  ${dumpAnnotation('ComponentBuilder')}
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }

  private __backing_closer?: ((()=> void) | undefined);
  public get closer(): @Memo() (()=> void) {
    return this.__backing_closer!;
  }

  public set closer(value: @Memo() (()=> void)) {
    this.__backing_closer = value;
  }

  private __backing_closer1?: ((()=> void) | undefined);
  public get closer1(): @Memo() (()=> void) {
    return this.__backing_closer1!;
  }

  public set closer1(value: @Memo() (()=> void)) {
    this.__backing_closer1 = value;
  }

  private __backing_closer2?: (@Builder() (()=> void) | undefined);
  public get closer2(): @Builder() (()=> void) {
    return (this.__backing_closer2! as @Builder() (()=> void));
  }

  public set closer2(value: @Builder() (()=> void)) {
    this.__backing_closer2 = value;
  }

  ${dumpAnnotation('Memo')}
  public build(): void {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
  }

  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

  static {

  }
}

class __EntryWrapper extends EntryPoint {
  ${dumpAnnotation('Memo')}
  public entry(): void {
    MyStateSample._invoke(undefined, undefined, undefined, undefined, undefined);
  }

  public static RegisterNamedRouter(routerName: string, instance: EntryPoint, param: NavInterface): void {
    EntryPoint.RegisterNamedRouter(routerName, instance, param);
  }

  public constructor() {}

}

@Entry() @Component() class __Options_MyStateSample {
  @Memo() public closer?: ((()=> void) | undefined);
  public __options_has_closer?: boolean;
  @Require() @Memo() public closer1?: (()=> void);
  public __options_has_closer1?: boolean;
  @Require() @Memo() public closer2?: @Builder() (()=> void);
  public __options_has_closer2?: boolean;
  public constructor() {}

}


`;

const expectedCheckedMemoScript: string = `
import { __memo_context_type, __memo_id_type } from "arkui.incremental.runtime.state";

import { Memo } from "arkui.incremental.annotation";

import { ColumnImpl } from "arkui.component.column";

import { ColumnAttribute } from "arkui.component.column";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponent } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint } from "arkui.component.customComponent";

import { NavInterface } from "arkui.component.customComponent";

import { WrappedBuilder, wrapBuilder, Entry, Text, Column, Component, Button, ClickEvent, Builder, BuilderParam } from "@ohos.arkui.component";

import { State, Link, PropRef, Require } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/require/builder-require",
  pageFullPath: "test/demo/mock/decorators/require/builder-require",
  integratedHsp: "false",
} as NavInterface));
@Entry() @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_closer = ((({let gensym___38813563 = initializers;
    (((gensym___38813563) == (null)) ? undefined : gensym___38813563.closer)})) ?? (undefined));
    this.__backing_closer1 = ((((({let gensym___87324922 = initializers;
    (((gensym___87324922) == (null)) ? undefined : gensym___87324922!.closer1)})) ?? (content))) ?? (((({let gensym___87324922 = initializers;
    (((gensym___87324922) == (null)) ? undefined : gensym___87324922!.closer1)})) ?? (undefined))));
    this.__backing_closer2 = (initializers!.closer2 as @Builder() (()=> void));
  }

  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {}

  @MemoIntrinsic 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(__memo_context, ((__memo_id) + (209113580)), style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }

  @ComponentBuilder 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): MyStateSample {
    throw new Error("Declare interface");
  }

  private __backing_closer?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
  public get closer(): @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) {
    return this.__backing_closer!;
  }

  public set closer(value: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) {
    this.__backing_closer = value;
  }

  private __backing_closer1?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
  public get closer1(): @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) {
    return this.__backing_closer1!;
  }

  public set closer1(value: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) {
    this.__backing_closer1 = value;
  }

  private __backing_closer2?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
  public get closer2(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) {
    return (this.__backing_closer2! as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void));
  }

  public set closer2(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) {
    this.__backing_closer2 = value;
  }

  @Memo 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (267547561)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (199838496)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (11562205)), 1);
      const __memo_parameter_instance = __memo_scope.param(0, instance);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      __memo_parameter_instance.value.setColumnOptions(undefined);
      __memo_parameter_instance.value.applyAttributesFinish();
      {
        __memo_scope.recache();
        return;
      }
    }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (170876182)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
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

  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

  static {

  }
}

class __EntryWrapper extends EntryPoint {
  @Memo 
  public entry(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (226419449)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    MyStateSample._invoke(__memo_context, ((__memo_id) + (90467045)), undefined, undefined, undefined, undefined, undefined);
    {
      __memo_scope.recache();
      return;
    }
  }

  public static RegisterNamedRouter(routerName: string, instance: EntryPoint, param: NavInterface): void {
    EntryPoint.RegisterNamedRouter(routerName, instance, param);
  }

  public constructor() {}

}

@Entry() @Component() class __Options_MyStateSample {
  @Memo() public closer?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
  public __options_has_closer?: boolean;
  @Require() @Memo() public closer1: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
  public __options_has_closer1?: boolean;
  @Require() @Memo() public closer2: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
  public __options_has_closer2?: boolean;
  public constructor() {}

}


`;

function testCheckedUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedUIScript));
}

function testCheckedMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedMemoScript));
}

pluginTester.run(
    'test @Require decorator capability with @Builder or @BuilderParam',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedUITransformer],
        'checked:memo-no-recheck': [testCheckedMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
