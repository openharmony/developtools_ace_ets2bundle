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
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const FUNCTION_DIR_PATH: string = 'decorators/builder-param';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'init-with-local-builder.ets'),
];

const pluginTester = new PluginTester('test builder param init with local builder', buildConfig);

const parsedTransform: Plugins = {
    name: 'init-with-local-builder',
    parsed: uiTransform().parsed
};

const expectedAfterUIScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";
import { MemoSkip as MemoSkip } from "arkui.stateManagement.runtime";
import { memo as memo } from "arkui.stateManagement.runtime";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Builder as Builder } from "arkui.component.builder";
import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";
import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";
import { Component as Component, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";
function main() {}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_customBuilderParam = ((((({let gensym___169376706 = initializers;
    (((gensym___169376706) == (null)) ? undefined : gensym___169376706.customBuilderParam)})) ?? (content))) ?? (this.doNothingBuilder))
    this.__backing_customBuilderParam2 = ((((({let gensym___14041256 = initializers;
    (((gensym___14041256) == (null)) ? undefined : gensym___14041256.customBuilderParam2)})) ?? (content))) ?? (this.doNothingBuilder2))
  }

  public __updateStruct(initializers: (__Options_Child | undefined)): void {}

  private __backing_customBuilderParam?: @memo() (()=> void);

  public get customBuilderParam(): @memo() (()=> void) {
    return this.__backing_customBuilderParam!;
  }

  public set customBuilderParam(value: @memo() (()=> void)) {
    this.__backing_customBuilderParam = value;
  }

  private __backing_customBuilderParam2?: @memo() ((str: string)=> void);

  public get customBuilderParam2(): @memo() ((str: string)=> void) {
    return this.__backing_customBuilderParam2!;
  }

  public set customBuilderParam2(value: @memo() ((str: string)=> void)) {
    this.__backing_customBuilderParam2 = value;
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
  
  @memo() public doNothingBuilder() {}
  
  @memo() public doNothingBuilder2(@MemoSkip() str: string) {}
  
  @memo() public build() {
    this.customBuilderParam();
    this.customBuilderParam2("hello");
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
  ${dumpGetterSetter(GetSetDumper.BOTH, 'customBuilderParam', '(@memo() (()=> void) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_customBuilderParam', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'customBuilderParam2', '(@memo() ((str: string)=> void) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_customBuilderParam2', '(boolean | undefined)')}
  
}
`;

const expectedAfterMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";
import { MemoSkip as MemoSkip } from "arkui.stateManagement.runtime";
import { memo as memo } from "arkui.stateManagement.runtime";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Builder as Builder } from "arkui.component.builder";
import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";
import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";
import { Component as Component, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";

function main() {}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_customBuilderParam = ((((({let gensym___169376706 = initializers;
    (((gensym___169376706) == (null)) ? undefined : gensym___169376706.customBuilderParam)})) ?? (content))) ?? (this.doNothingBuilder))
    this.__backing_customBuilderParam2 = ((((({let gensym___14041256 = initializers;
    (((gensym___14041256) == (null)) ? undefined : gensym___14041256.customBuilderParam2)})) ?? (content))) ?? (this.doNothingBuilder2))
  }

  public __updateStruct(initializers: (__Options_Child | undefined)): void {}

  private __backing_customBuilderParam?: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);

  public get customBuilderParam(): @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) {
    return this.__backing_customBuilderParam!;
  }

  public set customBuilderParam(value: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) {
    this.__backing_customBuilderParam = value;
  }

  private __backing_customBuilderParam2?: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, str: string)=> void);

  public get customBuilderParam2(): @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, str: string)=> void) {
    return this.__backing_customBuilderParam2!;
  }

  public set customBuilderParam2(value: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, str: string)=> void)) {
    this.__backing_customBuilderParam2 = value;
  }

  @MemoIntrinsic() public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<Child, __Options_Child>(__memo_context, ((__memo_id) + (47330804)), style, ((): Child => {
      return new Child(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): Child {
    throw new Error("Declare interface");
  }
  
  @memo() public doNothingBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (174403279)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }
  
  @memo() public doNothingBuilder2(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() str: string) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (76253767)), 0);
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
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (179390036)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    this.customBuilderParam(__memo_context, ((__memo_id) + (241913892)));
    this.customBuilderParam2(__memo_context, ((__memo_id) + (137225318)), "hello");
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
  ${dumpGetterSetter(GetSetDumper.BOTH, 'customBuilderParam', '(@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_customBuilderParam', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'customBuilderParam2', '(@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, str: string)=> void) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_customBuilderParam2', '(boolean | undefined)')}
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedAfterUIScript));
}

function testAfterMemoCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedAfterMemoScript));
}

pluginTester.run(
    'test builder param init with local builder',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
        'checked:memo-no-recheck': [testAfterMemoCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
