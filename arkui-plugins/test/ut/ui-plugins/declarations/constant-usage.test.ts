/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
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
import { dumpGetterSetter, GetSetDumper, dumpConstructor, dumpAnnotation } from '../../../utils/simplify-dump';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const DECL_DIR_PATH: string = 'declarations';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DECL_DIR_PATH, 'constant-usage.ets'),
];

const pluginTester = new PluginTester('test declarations in constants', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { _rawfile as _rawfile } from "arkui.component.resources";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ReusePoolOwnership as ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, Resource as Resource, $r as $r, $rawfile as $rawfile } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

import { EXPORT_RESOURCE as EXPORT_RESOURCE, EXPORT_RAWFILE as EXPORT_RAWFILE, EXPORT_WRAPPED_BUILDER as EXPORT_WRAPPED_BUILDER } from "./utils/constant";

function main() {}

EXPORT_RAWFILE = _rawfile(0, 30000, "com.example.mock", "entry", "app.mock.txt");
@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_stateVar = STATE_MGMT_FACTORY.makeState<Resource>(this, "stateVar", ((({let gensym___115611008 = initializers;
    (((gensym___115611008) == (null)) ? undefined : gensym___115611008.stateVar)})) ?? (EXPORT_RESOURCE)));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {
    this.__backing_stateVar!.resetOnReuse(((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar)})) ?? (EXPORT_RESOURCE)));
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  private __backing_stateVar?: IStateDecoratedVariable<Resource>;
  public get stateVar(): Resource {
    return this.__backing_stateVar!.get();
  }
  
  public set stateVar(value: Resource) {
    this.__backing_stateVar!.set(value);
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).margin(10);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(this.stateVar, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(EXPORT_RESOURCE, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      EXPORT_WRAPPED_BUILDER.builder("name", 1);
    }));
  }
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
}

@Component() class __Options_MyStateSample {
  @State() public stateVar?: Resource;
  public __backing_stateVar?: IStateDecoratedVariable<Resource>;
  public __options_has_stateVar?: boolean;
  public constructor() {}
  
}


`;

const expectDeclarationAfterUIScript: string = `
import { Resource as Resource, WrappedBuilder as WrappedBuilder, Builder as Builder } from "@ohos.arkui.component";

export const EXPORT_RESOURCE: Resource;
export const EXPORT_RAWFILE: Resource;
export const EXPORT_WRAPPED_BUILDER: WrappedBuilder<@Builder() ((value: string, size: number)=> void)>;


`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.constant']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationAfterUIScript));
}

const expectedMemoScript: string = `

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { _rawfile as _rawfile } from "arkui.component.resources";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ReusePoolOwnership as ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, Resource as Resource, $r as $r, $rawfile as $rawfile } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

import { EXPORT_RESOURCE as EXPORT_RESOURCE, EXPORT_RAWFILE as EXPORT_RAWFILE, EXPORT_WRAPPED_BUILDER as EXPORT_WRAPPED_BUILDER } from "./utils/constant";

function main() {}

EXPORT_RAWFILE = _rawfile(0, 30000, "com.example.mock", "entry", "app.mock.txt");
@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_stateVar = STATE_MGMT_FACTORY.makeState<Resource>(this, "stateVar", ((({let gensym___115611008 = initializers;
    (((gensym___115611008) == (null)) ? undefined : gensym___115611008.stateVar)})) ?? (EXPORT_RESOURCE)));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {
    this.__backing_stateVar!.resetOnReuse(((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar)})) ?? (EXPORT_RESOURCE)));
  }
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(__memo_context, ((__memo_id) + (47330804)), style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  private __backing_stateVar?: IStateDecoratedVariable<Resource>;
  public get stateVar(): Resource {
    return this.__backing_stateVar!.get();
  }
  
  public set stateVar(value: Resource) {
    this.__backing_stateVar!.set(value);
  }
  
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (69406103)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (218979098)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (175145513)), 1);
      const __memo_parameter_instance = __memo_scope.param(0, instance);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      __memo_parameter_instance.value.setColumnOptions(undefined).margin(10);
      __memo_parameter_instance.value.applyAttributesFinish();
      {
        __memo_scope.recache();
        return;
      }
    }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (76711614)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      TextImpl(__memo_context, ((__memo_id) + (137225318)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (241913892)), 1);
        const __memo_parameter_instance = __memo_scope.param(0, instance);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        __memo_parameter_instance.value.setTextOptions(this.stateVar, undefined);
        __memo_parameter_instance.value.applyAttributesFinish();
        {
          __memo_scope.recache();
          return;
        }
      }), undefined);
      TextImpl(__memo_context, ((__memo_id) + (213104625)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (211301233)), 1);
        const __memo_parameter_instance = __memo_scope.param(0, instance);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        __memo_parameter_instance.value.setTextOptions(EXPORT_RESOURCE, undefined);
        __memo_parameter_instance.value.applyAttributesFinish();
        {
          __memo_scope.recache();
          return;
        }
      }), undefined);
      EXPORT_WRAPPED_BUILDER.builder(__memo_context, ((__memo_id) + (46726221)), "name", 1);
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

@Component() class __Options_MyStateSample {
  @State() public stateVar?: Resource;
  public __backing_stateVar?: IStateDecoratedVariable<Resource>;
  public __options_has_stateVar?: boolean;
  public constructor() {}
  
}


`;

const expectDeclarationScript: string = `

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { Resource as Resource, WrappedBuilder as WrappedBuilder, Builder as Builder } from "@ohos.arkui.component";

export const EXPORT_RESOURCE: Resource;
export const EXPORT_RAWFILE: Resource;
export const EXPORT_WRAPPED_BUILDER: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;


`

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.constant']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationScript));
}

pluginTester.run(
    'test declarations in constants',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
        tracing: { externalSourceNames: ['mock.demo.mock.declarations.utils.constant'] }
    }
);
