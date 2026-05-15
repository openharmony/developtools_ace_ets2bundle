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
import { uiNoRecheck, recheck, memoNoRecheck, collectNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { dumpAnnotation, dumpConstructor, dumpGetterSetter, GetSetDumper } from '../../../utils/simplify-dump';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const WRAP_BUILDER_DIR_PATH: string = 'wrap-builder';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, WRAP_BUILDER_DIR_PATH, 'wrap-builder-in-struct.ets'),
];

const pluginTester = new PluginTester('test wrap builder in struct property', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed,
};

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { ILocalStoragePropRefDecoratedVariable as ILocalStoragePropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { ILocalStorageLinkDecoratedVariable as ILocalStorageLinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { IStoragePropRefDecoratedVariable as IStoragePropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { IStorageLinkDecoratedVariable as IStorageLinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { IConsumeDecoratedVariable as IConsumeDecoratedVariable } from "arkui.stateManagement.decorator";

import { IProvideDecoratedVariable as IProvideDecoratedVariable } from "arkui.stateManagement.decorator";

import { LinkSourceType as LinkSourceType } from "arkui.stateManagement.decorator";

import { ILinkDecoratedVariable as ILinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IConsumerDecoratedVariable as IConsumerDecoratedVariable } from "arkui.stateManagement.decorator";

import { IProviderDecoratedVariable as IProviderDecoratedVariable } from "arkui.stateManagement.decorator";

import { IParamOnceDecoratedVariable as IParamOnceDecoratedVariable } from "arkui.stateManagement.decorator";

import { IParamDecoratedVariable as IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { RowAttribute as RowAttribute } from "arkui.component.row";

import { ForEachAttribute as ForEachAttribute } from "arkui.component.forEach";

import { ForEachImpl as ForEachImpl } from "arkui.component.forEach";

import { RowImpl as RowImpl } from "arkui.component.row";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Builder as Builder, Text as Text, Color as Color, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder, Component as Component, ComponentV2 as ComponentV2, Row as Row, ForEach as ForEach } from "@ohos.arkui.component";

import { State as State, PropRef as PropRef, Link as Link, Provide as Provide, Consume as Consume, StorageLink as StorageLink, StoragePropRef as StoragePropRef, LocalStorageLink as LocalStorageLink, LocalStoragePropRef as LocalStoragePropRef } from "@ohos.arkui.stateManagement";

import { Local as Local, Param as Param, Provider as Provider, Once as Once, Consumer as Consumer } from "@ohos.arkui.stateManagement";

function main() {}

@Builder() 
@Memo() 
function MyBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() value: string, @MemoSkip() size: number) {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (93169018)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  {
    __memo_scope.recache();
    return;
  }
}

@Builder() 
@Memo() 
function YourBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() value: string, @MemoSkip() size: number) {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (258460786)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  {
    __memo_scope.recache();
    return;
  }
}


@ComponentV2() final struct Index2 extends CustomComponentV2<Index2, __Options_Index2> {
  public __initializeStruct(initializers: (__Options_Index2 | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_builderRegular = ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.builderRegular)})) ?? (MyBuilder));
    this.__backing_builderRegular2 = ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.builderRegular2)})) ?? (wrapBuilder(MyBuilder)));
    this.__backing_builderRegular3 = ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.builderRegular3)})) ?? ([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)]));
    this.__backing_builderLocal = STATE_MGMT_FACTORY.makeLocal<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(this, "builderLocal", MyBuilder);
    this.__backing_builderLocal2 = STATE_MGMT_FACTORY.makeLocal<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>(this, "builderLocal2", wrapBuilder(MyBuilder));
    this.__backing_builderLocal3 = STATE_MGMT_FACTORY.makeLocal<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>(this, "builderLocal3", [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)]);
    this.__backing_builderParam = STATE_MGMT_FACTORY.makeParam<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(this, "builderParam", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderParam)}) ? (initializers!.builderParam as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) : (MyBuilder as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void))));
    this.__backing_builderParam2 = STATE_MGMT_FACTORY.makeParam<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>(this, "builderParam2", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderParam2)}) ? (initializers!.builderParam2 as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) : (wrapBuilder(MyBuilder) as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>)));
    this.__backing_builderParam3 = STATE_MGMT_FACTORY.makeParam<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>(this, "builderParam3", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderParam3)}) ? (initializers!.builderParam3 as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) : ([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)] as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>)));
    this.__backing_builderOnceParam = STATE_MGMT_FACTORY.makeParamOnce<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(this, "builderOnceParam", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderOnceParam)}) ? (initializers!.builderOnceParam as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) : (MyBuilder as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void))));
    this.__backing_builderOnceParam2 = STATE_MGMT_FACTORY.makeParamOnce<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>(this, "builderOnceParam2", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderOnceParam2)}) ? (initializers!.builderOnceParam2 as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) : (wrapBuilder(MyBuilder) as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>)));
    this.__backing_builderOnceParam3 = STATE_MGMT_FACTORY.makeParamOnce<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>(this, "builderOnceParam3", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderOnceParam3)}) ? (initializers!.builderOnceParam3 as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) : ([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)] as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>)));
    this.__backing_builderProvider = STATE_MGMT_FACTORY.makeProvider<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(this, "builderProvider", "builderProvider", MyBuilder);
    this.__backing_builderProvider2 = STATE_MGMT_FACTORY.makeProvider<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>(this, "builderProvider2", "builderProvider2", wrapBuilder(MyBuilder));
    this.__backing_builderProvider3 = STATE_MGMT_FACTORY.makeProvider<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>(this, "builderProvider3", "builderProvider3", [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)]);
    this.__backing_builderConsumer = STATE_MGMT_FACTORY.makeConsumer<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(this, "builderConsumer", "builderConsumer", MyBuilder);
    this.__backing_builderConsumer2 = STATE_MGMT_FACTORY.makeConsumer<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>(this, "builderConsumer2", "builderConsumer2", wrapBuilder(MyBuilder));
    this.__backing_builderConsumer3 = STATE_MGMT_FACTORY.makeConsumer<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>(this, "builderConsumer3", "builderConsumer3", [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)]);
  }
  
  public __updateStruct(initializers: (__Options_Index2 | undefined)): void {
    if (({let gensym___235148474 = initializers;
    (((gensym___235148474) == (null)) ? undefined : gensym___235148474.__options_has_builderParam)})) {
      this.__backing_builderParam!.update((initializers!.builderParam as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)));
    }
    if (({let gensym___45147614 = initializers;
    (((gensym___45147614) == (null)) ? undefined : gensym___45147614.__options_has_builderParam2)})) {
      this.__backing_builderParam2!.update((initializers!.builderParam2 as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>));
    }
    if (({let gensym___258913879 = initializers;
    (((gensym___258913879) == (null)) ? undefined : gensym___258913879.__options_has_builderParam3)})) {
      this.__backing_builderParam3!.update((initializers!.builderParam3 as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>));
    }
  }

  public resetStateVarsOnReuse(initializers: (__Options_Index2 | undefined)): void {
    this.__backing_builderLocal!.resetOnReuse(MyBuilder);
    this.__backing_builderLocal2!.resetOnReuse(wrapBuilder(MyBuilder));
    this.__backing_builderLocal3!.resetOnReuse([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)]);
    this.__backing_builderParam!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderParam)}) ? (initializers!.builderParam as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) : (MyBuilder as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void))));
    this.__backing_builderParam2!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderParam2)}) ? (initializers!.builderParam2 as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) : (wrapBuilder(MyBuilder) as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>)));
    this.__backing_builderParam3!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderParam3)}) ? (initializers!.builderParam3 as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) : ([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)] as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>)));
    this.__backing_builderOnceParam!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderOnceParam)}) ? (initializers!.builderOnceParam as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) : (MyBuilder as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void))));
    this.__backing_builderOnceParam2!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderOnceParam2)}) ? (initializers!.builderOnceParam2 as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) : (wrapBuilder(MyBuilder) as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>)));
    this.__backing_builderOnceParam3!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderOnceParam3)}) ? (initializers!.builderOnceParam3 as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) : ([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)] as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>)));
    this.__backing_builderProvider!.resetOnReuse(MyBuilder);
    this.__backing_builderProvider2!.resetOnReuse(wrapBuilder(MyBuilder));
    this.__backing_builderProvider3!.resetOnReuse([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)]);
    this.__backing_builderConsumer!.resetOnReuse(MyBuilder);
    this.__backing_builderConsumer2!.resetOnReuse(wrapBuilder(MyBuilder));
    this.__backing_builderConsumer3!.resetOnReuse([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)]);
  }

  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Index2)=> void) | undefined), initializers: ((()=> __Options_Index2) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Index2, __Options_Index2>(__memo_context, ((__memo_id) + (<some_random_number>)), style, ((): Index2 => {
      return new Index2();
    }), initializers, reuseId, content, {
      sClass: Class.from<Index2>(),
    });
  }

  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index2, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): Index2 {
    throw new Error("Declare interface");
  }

  private __backing_builderRegular?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  public get builderRegular(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return (this.__backing_builderRegular as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void));
  }
  
  public set builderRegular(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderRegular = value;
  }
  
  private __backing_builderRegular2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderRegular2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return (this.__backing_builderRegular2 as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>);
  }
  
  public set builderRegular2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderRegular2 = value;
  }
  
  private __backing_builderRegular3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderRegular3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return (this.__backing_builderRegular3 as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>);
  }
  
  public set builderRegular3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderRegular3 = value;
  }
  
  private __backing_builderLocal?: ILocalDecoratedVariable<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderLocal(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return this.__backing_builderLocal!.get();
  }
  
  public set builderLocal(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderLocal!.set(value);
  }
  
  private __backing_builderLocal2?: ILocalDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderLocal2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return this.__backing_builderLocal2!.get();
  }
  
  public set builderLocal2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderLocal2!.set(value);
  }
  
  private __backing_builderLocal3?: ILocalDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public get builderLocal3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return this.__backing_builderLocal3!.get();
  }
  
  public set builderLocal3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderLocal3!.set(value);
  }
  
  private __backing_builderParam?: IParamDecoratedVariable<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderParam(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return this.__backing_builderParam!.get();
  }
  
  private __backing_builderParam2?: IParamDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderParam2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return this.__backing_builderParam2!.get();
  }
  
  private __backing_builderParam3?: IParamDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public get builderParam3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return this.__backing_builderParam3!.get();
  }
  
  private __backing_builderOnceParam?: IParamOnceDecoratedVariable<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderOnceParam(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return this.__backing_builderOnceParam!.get();
  }
  
  public set builderOnceParam(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderOnceParam!.set(value);
  }
  
  private __backing_builderOnceParam2?: IParamOnceDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderOnceParam2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return this.__backing_builderOnceParam2!.get();
  }
  
  public set builderOnceParam2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderOnceParam2!.set(value);
  }
  
  private __backing_builderOnceParam3?: IParamOnceDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public get builderOnceParam3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return this.__backing_builderOnceParam3!.get();
  }
  
  public set builderOnceParam3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderOnceParam3!.set(value);
  }
  
  private __backing_builderProvider?: IProviderDecoratedVariable<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderProvider(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return this.__backing_builderProvider!.get();
  }
  
  public set builderProvider(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderProvider!.set(value);
  }
  
  private __backing_builderProvider2?: IProviderDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderProvider2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return this.__backing_builderProvider2!.get();
  }
  
  public set builderProvider2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderProvider2!.set(value);
  }
  
  private __backing_builderProvider3?: IProviderDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public get builderProvider3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return this.__backing_builderProvider3!.get();
  }
  
  public set builderProvider3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderProvider3!.set(value);
  }
  
  private __backing_builderConsumer?: IConsumerDecoratedVariable<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderConsumer(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return this.__backing_builderConsumer!.get();
  }
  
  public set builderConsumer(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderConsumer!.set(value);
  }
  
  private __backing_builderConsumer2?: IConsumerDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderConsumer2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return this.__backing_builderConsumer2!.get();
  }
  
  public set builderConsumer2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderConsumer2!.set(value);
  }
  
  private __backing_builderConsumer3?: IConsumerDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public get builderConsumer3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return this.__backing_builderConsumer3!.get();
  }
  
  public set builderConsumer3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderConsumer3!.set(value);
  }

  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (75236795)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    RowImpl(__memo_context, ((__memo_id) + (173773669)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: RowAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (241913892)), 1);
      const __memo_parameter_instance = __memo_scope.param(0, instance);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      __memo_parameter_instance.value.setRowOptions(undefined);
      __memo_parameter_instance.value.applyAttributesFinish();
      {
        __memo_scope.recache();
        return;
      }
    }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (262314519)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      this.builderRegular(__memo_context, ((__memo_id) + (137225318)), "Hello World", 50);
      this.builderRegular2.builder(__memo_context, ((__memo_id) + (211301233)), "Hello World", 50);
      ForEachImpl(__memo_context, ((__memo_id) + (218979098)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ForEachAttribute): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (76711614)), 1);
        const __memo_parameter_instance = __memo_scope.param(0, instance);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        __memo_parameter_instance.value.setForEachOptions((() => {
          return this.builderRegular3;
        }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, item: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) => {
          const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (46726221)), 1);
          const __memo_parameter_item = __memo_scope.param(0, item);
          if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
          }
          __memo_parameter_item.value.builder(__memo_context, ((__memo_id) + (213104625)), "Hello World", 50);
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
      this.builderProvider(__memo_context, ((__memo_id) + (223657391)), "Hello World", 50);
      this.builderProvider2.builder(__memo_context, ((__memo_id) + (192802443)), "Hello World", 50);
      ForEachImpl(__memo_context, ((__memo_id) + (78055758)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ForEachAttribute): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (136716185)), 1);
        const __memo_parameter_instance = __memo_scope.param(0, instance);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        __memo_parameter_instance.value.setForEachOptions((() => {
          return this.builderProvider3;
        }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, item: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) => {
          const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (54078781)), 1);
          const __memo_parameter_item = __memo_scope.param(0, item);
          if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
          }
          __memo_parameter_item.value.builder(__memo_context, ((__memo_id) + (213687742)), "Hello World", 50);
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

  static {
  }
}

@Component() final struct Index extends CustomComponent<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_builderRegular = (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderRegular)}) ? (initializers!.builderRegular as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) : (MyBuilder as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)));
    this.__backing_builderRegular2 = (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderRegular2)}) ? (initializers!.builderRegular2 as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) : (wrapBuilder(MyBuilder) as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>));
    this.__backing_builderRegular3 = (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderRegular3)}) ? (initializers!.builderRegular3 as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) : ([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)] as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>));
    this.__backing_builderState = STATE_MGMT_FACTORY.makeState<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(this, "builderState", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderState)}) ? (initializers!.builderState as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) : (MyBuilder as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void))));
    this.__backing_builderState2 = STATE_MGMT_FACTORY.makeState<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>(this, "builderState2", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderState2)}) ? (initializers!.builderState2 as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) : (wrapBuilder(MyBuilder) as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>)));
    this.__backing_builderState3 = STATE_MGMT_FACTORY.makeState<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>(this, "builderState3", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderState3)}) ? (initializers!.builderState3 as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) : ([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)] as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>)));
    this.__backing_builderPropRef = STATE_MGMT_FACTORY.makePropRef<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(this, "builderPropRef", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderPropRef)}) ? (initializers!.builderPropRef as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) : (MyBuilder as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void))));
    this.__backing_builderPropRef2 = STATE_MGMT_FACTORY.makePropRef<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>(this, "builderPropRef2", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderPropRef2)}) ? (initializers!.builderPropRef2 as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) : (wrapBuilder(MyBuilder) as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>)));
    this.__backing_builderPropRef3 = STATE_MGMT_FACTORY.makePropRef<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>(this, "builderPropRef3", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderPropRef3)}) ? (initializers!.builderPropRef3 as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) : ([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)] as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>)));
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderLink)})) {
      this.__backing_builderLink = STATE_MGMT_FACTORY.makeLink<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(this, "builderLink", initializers!.__backing_builderLink!);
    }
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderLink2)})) {
      this.__backing_builderLink2 = STATE_MGMT_FACTORY.makeLink<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>(this, "builderLink2", initializers!.__backing_builderLink2!);
    }
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderLink3)})) {
      this.__backing_builderLink3 = STATE_MGMT_FACTORY.makeLink<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>(this, "builderLink3", initializers!.__backing_builderLink3!);
    }
    this.__backing_builderProvide = STATE_MGMT_FACTORY.makeProvide<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(this, "builderProvide", "builderProvide", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderProvide)}) ? (initializers!.builderProvide as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) : (MyBuilder as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void))), false);
    this.__backing_builderProvide2 = STATE_MGMT_FACTORY.makeProvide<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>(this, "builderProvide2", "builderProvide2", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderProvide2)}) ? (initializers!.builderProvide2 as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) : (wrapBuilder(MyBuilder) as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>)), false);
    this.__backing_builderProvide3 = STATE_MGMT_FACTORY.makeProvide<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>(this, "builderProvide3", "builderProvide3", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_builderProvide3)}) ? (initializers!.builderProvide3 as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) : ([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)] as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>)), false);
    this.__backing_builderConsume = STATE_MGMT_FACTORY.makeConsume<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(this, "builderConsume", "builderConsume");
    this.__backing_builderConsume2 = STATE_MGMT_FACTORY.makeConsume<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>(this, "builderConsume2", "builderConsume2");
    this.__backing_builderConsume3 = STATE_MGMT_FACTORY.makeConsume<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>(this, "builderConsume3", "builderConsume3");
    this.__backing_builderStorageLink = STATE_MGMT_FACTORY.makeStorageLink<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(this, "aa", "builderStorageLink", MyBuilder);
    this.__backing_builderStorageLink2 = STATE_MGMT_FACTORY.makeStorageLink<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>(this, "aa", "builderStorageLink2", wrapBuilder(MyBuilder));
    this.__backing_builderStorageLink3 = STATE_MGMT_FACTORY.makeStorageLink<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>(this, "aa", "builderStorageLink3", [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)]);
    this.__backing_builderStoragePropRef = STATE_MGMT_FACTORY.makeStoragePropRef<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(this, "aa", "builderStoragePropRef", MyBuilder);
    this.__backing_builderStoragePropRef2 = STATE_MGMT_FACTORY.makeStoragePropRef<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>(this, "aa", "builderStoragePropRef2", wrapBuilder(MyBuilder));
    this.__backing_builderStoragePropRef3 = STATE_MGMT_FACTORY.makeStoragePropRef<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>(this, "aa", "builderStoragePropRef3", [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)]);
    this.__backing_builderLocalStorageLink = STATE_MGMT_FACTORY.makeLocalStorageLink<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(this, "aa", "builderLocalStorageLink", MyBuilder);
    this.__backing_builderLocalStorageLink2 = STATE_MGMT_FACTORY.makeLocalStorageLink<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>(this, "aa", "builderLocalStorageLink2", wrapBuilder(MyBuilder));
    this.__backing_builderLocalStorageLink3 = STATE_MGMT_FACTORY.makeLocalStorageLink<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>(this, "aa", "builderLocalStorageLink3", [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)]);
    this.__backing_builderLocalStoragePropRef = STATE_MGMT_FACTORY.makeLocalStoragePropRef<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>(this, "aa", "builderLocalStoragePropRef", MyBuilder);
    this.__backing_builderLocalStoragePropRef2 = STATE_MGMT_FACTORY.makeLocalStoragePropRef<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>(this, "aa", "builderLocalStoragePropRef2", wrapBuilder(MyBuilder));
    this.__backing_builderLocalStoragePropRef3 = STATE_MGMT_FACTORY.makeLocalStoragePropRef<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>(this, "aa", "builderLocalStoragePropRef3", [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)]);
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {
    if (({let gensym___199420334 = initializers;
    (((gensym___199420334) == (null)) ? undefined : gensym___199420334.__options_has_builderPropRef)})) {
      this.__backing_builderPropRef!.update((initializers!.builderPropRef as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)));
    }
    if (({let gensym___51763161 = initializers;
    (((gensym___51763161) == (null)) ? undefined : gensym___51763161.__options_has_builderPropRef2)})) {
      this.__backing_builderPropRef2!.update((initializers!.builderPropRef2 as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>));
    }
    if (({let gensym___31031044 = initializers;
    (((gensym___31031044) == (null)) ? undefined : gensym___31031044.__options_has_builderPropRef3)})) {
      this.__backing_builderPropRef3!.update((initializers!.builderPropRef3 as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>));
    }
  }

  public resetStateVarsOnReuse(initializers: (__Options_Index | undefined)): void {
    this.__backing_builderState!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.builderState)})) ?? (MyBuilder)) as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)));
    this.__backing_builderState2!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.builderState2)})) ?? (wrapBuilder(MyBuilder))) as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>));
    this.__backing_builderState3!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.builderState3)})) ?? ([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)])) as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>));
    this.__backing_builderPropRef!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.builderPropRef)})) ?? (MyBuilder)) as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)));
    this.__backing_builderPropRef2!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.builderPropRef2)})) ?? (wrapBuilder(MyBuilder))) as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>));
    this.__backing_builderPropRef3!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.builderPropRef3)})) ?? ([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)])) as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>));
    this.__backing_builderLink!.resetOnReuse(initializers!.__backing_builderLink!);
    this.__backing_builderLink2!.resetOnReuse(initializers!.__backing_builderLink2!);
    this.__backing_builderLink3!.resetOnReuse(initializers!.__backing_builderLink3!);
    this.__backing_builderProvide!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.builderProvide)})) ?? (MyBuilder)) as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)));
    this.__backing_builderProvide2!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.builderProvide2)})) ?? (wrapBuilder(MyBuilder))) as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>));
    this.__backing_builderProvide3!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.builderProvide3)})) ?? ([wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)])) as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>));
    this.__backing_builderConsume!.resetOnReuse("builderConsume");
    this.__backing_builderConsume2!.resetOnReuse("builderConsume2");
    this.__backing_builderConsume3!.resetOnReuse("builderConsume3");
    this.__backing_builderStoragePropRef!.resetOnReuse();
    this.__backing_builderStoragePropRef2!.resetOnReuse();
    this.__backing_builderStoragePropRef3!.resetOnReuse();
    this.__backing_builderLocalStoragePropRef!.resetOnReuse();
    this.__backing_builderLocalStoragePropRef2!.resetOnReuse();
    this.__backing_builderLocalStoragePropRef3!.resetOnReuse();
  }

  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Index)=> void) | undefined), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<Index, __Options_Index>(__memo_context, ((__memo_id) + (<some_random_number>)), style, ((): Index => {
      return new Index(false, ({let gensym___<some_random_number> = storage;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
    }), initializers, reuseId, content);
  }

  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): Index {
    throw new Error("Declare interface");
  }

  private __backing_builderRegular?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  public get builderRegular(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return (this.__backing_builderRegular as @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void));
  }
  
  public set builderRegular(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderRegular = value;
  }
  
  private __backing_builderRegular2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderRegular2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return (this.__backing_builderRegular2 as WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>);
  }
  
  public set builderRegular2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderRegular2 = value;
  }
  
  private __backing_builderRegular3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderRegular3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return (this.__backing_builderRegular3 as Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>);
  }
  
  public set builderRegular3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderRegular3 = value;
  }
  
  private __backing_builderState?: IStateDecoratedVariable<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderState(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return this.__backing_builderState!.get();
  }
  
  public set builderState(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderState!.set(value);
  }
  
  private __backing_builderState2?: IStateDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderState2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return this.__backing_builderState2!.get();
  }
  
  public set builderState2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderState2!.set(value);
  }
  
  private __backing_builderState3?: IStateDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public get builderState3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return this.__backing_builderState3!.get();
  }
  
  public set builderState3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderState3!.set(value);
  }
  
  private __backing_builderPropRef?: IPropRefDecoratedVariable<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderPropRef(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return this.__backing_builderPropRef!.get();
  }
  
  public set builderPropRef(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderPropRef!.set(value);
  }
  
  private __backing_builderPropRef2?: IPropRefDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderPropRef2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return this.__backing_builderPropRef2!.get();
  }
  
  public set builderPropRef2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderPropRef2!.set(value);
  }
  
  private __backing_builderPropRef3?: IPropRefDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public get builderPropRef3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return this.__backing_builderPropRef3!.get();
  }
  
  public set builderPropRef3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderPropRef3!.set(value);
  }
  
  private __backing_builderLink?: ILinkDecoratedVariable<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderLink(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return this.__backing_builderLink!.get();
  }
  
  public set builderLink(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderLink!.set(value);
  }
  
  private __backing_builderLink2?: ILinkDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderLink2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return this.__backing_builderLink2!.get();
  }
  
  public set builderLink2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderLink2!.set(value);
  }
  
  private __backing_builderLink3?: ILinkDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public get builderLink3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return this.__backing_builderLink3!.get();
  }
  
  public set builderLink3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderLink3!.set(value);
  }
  
  private __backing_builderProvide?: IProvideDecoratedVariable<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderProvide(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return this.__backing_builderProvide!.get();
  }
  
  public set builderProvide(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderProvide!.set(value);
  }
  
  private __backing_builderProvide2?: IProvideDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderProvide2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return this.__backing_builderProvide2!.get();
  }
  
  public set builderProvide2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderProvide2!.set(value);
  }
  
  private __backing_builderProvide3?: IProvideDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public get builderProvide3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return this.__backing_builderProvide3!.get();
  }
  
  public set builderProvide3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderProvide3!.set(value);
  }
  
  private __backing_builderConsume?: IConsumeDecoratedVariable<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderConsume(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return this.__backing_builderConsume!.get();
  }
  
  public set builderConsume(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderConsume!.set(value);
  }
  
  private __backing_builderConsume2?: IConsumeDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderConsume2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return this.__backing_builderConsume2!.get();
  }
  
  public set builderConsume2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderConsume2!.set(value);
  }
  
  private __backing_builderConsume3?: IConsumeDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public get builderConsume3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return this.__backing_builderConsume3!.get();
  }
  
  public set builderConsume3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderConsume3!.set(value);
  }
  
  private __backing_builderStorageLink?: IStorageLinkDecoratedVariable<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderStorageLink(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return this.__backing_builderStorageLink!.get();
  }
  
  public set builderStorageLink(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderStorageLink!.set(value);
  }
  
  private __backing_builderStorageLink2?: IStorageLinkDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderStorageLink2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return this.__backing_builderStorageLink2!.get();
  }
  
  public set builderStorageLink2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderStorageLink2!.set(value);
  }
  
  private __backing_builderStorageLink3?: IStorageLinkDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public get builderStorageLink3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return this.__backing_builderStorageLink3!.get();
  }
  
  public set builderStorageLink3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderStorageLink3!.set(value);
  }
  
  private __backing_builderStoragePropRef?: IStoragePropRefDecoratedVariable<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderStoragePropRef(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return this.__backing_builderStoragePropRef!.get();
  }
  
  public set builderStoragePropRef(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderStoragePropRef!.set(value);
  }
  
  private __backing_builderStoragePropRef2?: IStoragePropRefDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderStoragePropRef2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return this.__backing_builderStoragePropRef2!.get();
  }
  
  public set builderStoragePropRef2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderStoragePropRef2!.set(value);
  }
  
  private __backing_builderStoragePropRef3?: IStoragePropRefDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public get builderStoragePropRef3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return this.__backing_builderStoragePropRef3!.get();
  }
  
  public set builderStoragePropRef3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderStoragePropRef3!.set(value);
  }
  
  private __backing_builderLocalStorageLink?: ILocalStorageLinkDecoratedVariable<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderLocalStorageLink(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return this.__backing_builderLocalStorageLink!.get();
  }
  
  public set builderLocalStorageLink(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderLocalStorageLink!.set(value);
  }
  
  private __backing_builderLocalStorageLink2?: ILocalStorageLinkDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderLocalStorageLink2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return this.__backing_builderLocalStorageLink2!.get();
  }
  
  public set builderLocalStorageLink2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderLocalStorageLink2!.set(value);
  }
  
  private __backing_builderLocalStorageLink3?: ILocalStorageLinkDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public get builderLocalStorageLink3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return this.__backing_builderLocalStorageLink3!.get();
  }
  
  public set builderLocalStorageLink3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderLocalStorageLink3!.set(value);
  }
  
  private __backing_builderLocalStoragePropRef?: ILocalStoragePropRefDecoratedVariable<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public get builderLocalStoragePropRef(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) {
    return this.__backing_builderLocalStoragePropRef!.get();
  }
  
  public set builderLocalStoragePropRef(value: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)) {
    this.__backing_builderLocalStoragePropRef!.set(value);
  }
  
  private __backing_builderLocalStoragePropRef2?: ILocalStoragePropRefDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public get builderLocalStoragePropRef2(): WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> {
    return this.__backing_builderLocalStoragePropRef2!.get();
  }
  
  public set builderLocalStoragePropRef2(value: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) {
    this.__backing_builderLocalStoragePropRef2!.set(value);
  }
  
  private __backing_builderLocalStoragePropRef3?: ILocalStoragePropRefDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public get builderLocalStoragePropRef3(): Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>> {
    return this.__backing_builderLocalStoragePropRef3!.get();
  }
  
  public set builderLocalStoragePropRef3(value: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>) {
    this.__backing_builderLocalStoragePropRef3!.set(value);
  }

  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (187581126)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    RowImpl(__memo_context, ((__memo_id) + (136286509)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: RowAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (151409217)), 1);
      const __memo_parameter_instance = __memo_scope.param(0, instance);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      __memo_parameter_instance.value.setRowOptions(undefined);
      __memo_parameter_instance.value.applyAttributesFinish();
      {
        __memo_scope.recache();
        return;
      }
    }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (225484108)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      this.builderRegular(__memo_context, ((__memo_id) + (238360624)), "Hello World", 50);
      this.builderRegular2.builder(__memo_context, ((__memo_id) + (234157464)), "Hello World", 50);
      ForEachImpl(__memo_context, ((__memo_id) + (72614054)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ForEachAttribute): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (204012763)), 1);
        const __memo_parameter_instance = __memo_scope.param(0, instance);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        __memo_parameter_instance.value.setForEachOptions((() => {
          return this.builderRegular3;
        }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, item: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) => {
          const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (18973066)), 1);
          const __memo_parameter_item = __memo_scope.param(0, item);
          if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
          }
          __memo_parameter_item.value.builder(__memo_context, ((__memo_id) + (75321118)), "Hello World", 50);
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
      this.builderLocalStorageLink(__memo_context, ((__memo_id) + (172290133)), "Hello World", 50);
      this.builderLocalStorageLink2.builder(__memo_context, ((__memo_id) + (5605714)), "Hello World", 50);
      ForEachImpl(__memo_context, ((__memo_id) + (157355641)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ForEachAttribute): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (27183850)), 1);
        const __memo_parameter_instance = __memo_scope.param(0, instance);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        __memo_parameter_instance.value.setForEachOptions((() => {
          return this.builderLocalStorageLink3;
        }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, item: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>) => {
          const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (139295044)), 1);
          const __memo_parameter_item = __memo_scope.param(0, item);
          if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
          }
          __memo_parameter_item.value.builder(__memo_context, ((__memo_id) + (257873411)), "Hello World", 50);
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
  
  ${dumpConstructor()}
  static {
  }
}

@ComponentV2() class __Options_Index2 {
  @Memo() public builderRegular?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  public __options_has_builderRegular?: boolean;
  public builderRegular2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __options_has_builderRegular2?: boolean;
  public builderRegular3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderRegular3?: boolean;
  @Local() @Memo() public builderLocal?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  @Memo() public __backing_builderLocal?: ILocalDecoratedVariable<(@Builder() ((value: string, size: number)=> void) | undefined)>;
  public __options_has_builderLocal?: boolean;
  @Local() public builderLocal2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __backing_builderLocal2?: ILocalDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderLocal2?: boolean;
  @Local() public builderLocal3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __backing_builderLocal3?: ILocalDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public __options_has_builderLocal3?: boolean;
  @Param() @Memo() public builderParam?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  @Memo() public __backing_builderParam?: IParamDecoratedVariable<(@Builder() ((value: string, size: number)=> void) | undefined)>;
  public __options_has_builderParam?: boolean;
  @Param() public builderParam2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __backing_builderParam2?: IParamDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderParam2?: boolean;
  @Param() public builderParam3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __backing_builderParam3?: IParamDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public __options_has_builderParam3?: boolean;
  @Once() @Param() @Memo() public builderOnceParam?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  @Param() @Memo() public __backing_builderOnceParam?: IParamOnceDecoratedVariable<(@Builder() ((value: string, size: number)=> void) | undefined)>;
  public __options_has_builderOnceParam?: boolean;
  @Once() @Param() public builderOnceParam2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  @Param() public __backing_builderOnceParam2?: IParamOnceDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderOnceParam2?: boolean;
  @Once() @Param() public builderOnceParam3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  @Param() public __backing_builderOnceParam3?: IParamOnceDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public __options_has_builderOnceParam3?: boolean;
  @Provider() @Memo() public builderProvider?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  @Memo() public __backing_builderProvider?: IProviderDecoratedVariable<(@Builder() ((value: string, size: number)=> void) | undefined)>;
  public __options_has_builderProvider?: boolean;
  @Provider() public builderProvider2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __backing_builderProvider2?: IProviderDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderProvider2?: boolean;
  @Provider() public builderProvider3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __backing_builderProvider3?: IProviderDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public __options_has_builderProvider3?: boolean;
  @Consumer() @Memo() public builderConsumer?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  @Memo() public __backing_builderConsumer?: IConsumerDecoratedVariable<(@Builder() ((value: string, size: number)=> void) | undefined)>;
  public __options_has_builderConsumer?: boolean;
  @Consumer() public builderConsumer2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __backing_builderConsumer2?: IConsumerDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderConsumer2?: boolean;
  @Consumer() public builderConsumer3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __backing_builderConsumer3?: IConsumerDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public __options_has_builderConsumer3?: boolean;
  public constructor() {}
}

@Component() class __Options_Index {
  @Memo() public builderRegular?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  public __options_has_builderRegular?: boolean;
  public builderRegular2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __options_has_builderRegular2?: boolean;
  public builderRegular3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderRegular3?: boolean;
  @State() @Memo() public builderState?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  @Memo() public __backing_builderState?: IStateDecoratedVariable<(@Builder() ((value: string, size: number)=> void) | undefined)>;
  public __options_has_builderState?: boolean;
  @State() public builderState2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __backing_builderState2?: IStateDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderState2?: boolean;
  @State() public builderState3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __backing_builderState3?: IStateDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public __options_has_builderState3?: boolean;
  @PropRef() @Memo() public builderPropRef?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  @Memo() public __backing_builderPropRef?: IPropRefDecoratedVariable<(@Builder() ((value: string, size: number)=> void) | undefined)>;
  public __options_has_builderPropRef?: boolean;
  @PropRef() public builderPropRef2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __backing_builderPropRef2?: IPropRefDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderPropRef2?: boolean;
  @PropRef() public builderPropRef3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __backing_builderPropRef3?: IPropRefDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public __options_has_builderPropRef3?: boolean;
  @Link() @Memo() public builderLink: @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void);
  @Memo() public __backing_builderLink?: LinkSourceType<(@Builder() ((value: string, size: number)=> void) | undefined)>;
  public __options_has_builderLink?: boolean;
  @Link() public builderLink2: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __backing_builderLink2?: LinkSourceType<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderLink2?: boolean;
  @Link() public builderLink3: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __backing_builderLink3?: LinkSourceType<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public __options_has_builderLink3?: boolean;
  @Provide() @Memo() public builderProvide?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  @Memo() public __backing_builderProvide?: IProvideDecoratedVariable<(@Builder() ((value: string, size: number)=> void) | undefined)>;
  public __options_has_builderProvide?: boolean;
  @Provide() public builderProvide2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __backing_builderProvide2?: IProvideDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderProvide2?: boolean;
  @Provide() public builderProvide3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __backing_builderProvide3?: IProvideDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public __options_has_builderProvide3?: boolean;
  @Consume() @Memo() public builderConsume?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  @Memo() public __backing_builderConsume?: IConsumeDecoratedVariable<(@Builder() ((value: string, size: number)=> void) | undefined)>;
  public __options_has_builderConsume?: boolean;
  @Consume() public builderConsume2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __backing_builderConsume2?: IConsumeDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderConsume2?: boolean;
  @Consume() public builderConsume3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __backing_builderConsume3?: IConsumeDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public __options_has_builderConsume3?: boolean;
  @StorageLink({value:"aa"}) @Memo() public builderStorageLink?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  @Memo() public __backing_builderStorageLink?: IStorageLinkDecoratedVariable<(@Builder() ((value: string, size: number)=> void) | undefined)>;
  public __options_has_builderStorageLink?: boolean;
  @StorageLink({value:"aa"}) public builderStorageLink2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __backing_builderStorageLink2?: IStorageLinkDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderStorageLink2?: boolean;
  @StorageLink({value:"aa"}) public builderStorageLink3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __backing_builderStorageLink3?: IStorageLinkDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public __options_has_builderStorageLink3?: boolean;
  @StoragePropRef({value:"aa"}) @Memo() public builderStoragePropRef?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  @Memo() public __backing_builderStoragePropRef?: IStoragePropRefDecoratedVariable<(@Builder() ((value: string, size: number)=> void) | undefined)>;
  public __options_has_builderStoragePropRef?: boolean;
  @StoragePropRef({value:"aa"}) public builderStoragePropRef2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __backing_builderStoragePropRef2?: IStoragePropRefDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderStoragePropRef2?: boolean;
  @StoragePropRef({value:"aa"}) public builderStoragePropRef3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __backing_builderStoragePropRef3?: IStoragePropRefDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public __options_has_builderStoragePropRef3?: boolean;
  @LocalStorageLink({value:"aa"}) @Memo() public builderLocalStorageLink?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  @Memo() public __backing_builderLocalStorageLink?: ILocalStorageLinkDecoratedVariable<(@Builder() ((value: string, size: number)=> void) | undefined)>;
  public __options_has_builderLocalStorageLink?: boolean;
  @LocalStorageLink({value:"aa"}) public builderLocalStorageLink2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __backing_builderLocalStorageLink2?: ILocalStorageLinkDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderLocalStorageLink2?: boolean;
  @LocalStorageLink({value:"aa"}) public builderLocalStorageLink3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __backing_builderLocalStorageLink3?: ILocalStorageLinkDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public __options_has_builderLocalStorageLink3?: boolean;
  @LocalStoragePropRef({value:"aa"}) @Memo() public builderLocalStoragePropRef?: (@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void) | undefined);
  @Memo() public __backing_builderLocalStoragePropRef?: ILocalStoragePropRefDecoratedVariable<(@Builder() ((value: string, size: number)=> void) | undefined)>;
  public __options_has_builderLocalStoragePropRef?: boolean;
  @LocalStoragePropRef({value:"aa"}) public builderLocalStoragePropRef2?: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public __backing_builderLocalStoragePropRef2?: ILocalStoragePropRefDecoratedVariable<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __options_has_builderLocalStoragePropRef2?: boolean;
  @LocalStoragePropRef({value:"aa"}) public builderLocalStoragePropRef3?: Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>;
  public __backing_builderLocalStoragePropRef3?: ILocalStoragePropRefDecoratedVariable<Array<WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>>>;
  public __options_has_builderLocalStoragePropRef3?: boolean;
  public constructor() {}
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test wrap builder in struct property',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
