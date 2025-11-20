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
import { uiNoRecheck, recheck, memoNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor, dumpAnnotation } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/regular';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'builder-array.ets'),
];

const pluginTester = new PluginTester('test builder array regular property', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTransform',
    parsed: uiTransform().parsed,
};

const expectedScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, Builder as Builder } from "@ohos.arkui.component";

function main() {}


@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_builderArr = ((({let gensym___170891173 = initializers;
    (((gensym___170891173) == (null)) ? undefined : gensym___170891173.builderArr)})) ?? (new Array<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, p1: string, p2: number)=> void)>()));
  }
  
  public __updateStruct(initializers: (__Options_Child | undefined)): void {}
  
  private __backing_builderArr?: Array<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, p1: string, p2: number)=> void)>;
  public get builderArr(): Array<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, p1: string, p2: number)=> void)> {
    return (this.__backing_builderArr as Array<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, p1: string, p2: number)=> void)>);
  }
  
  public set builderArr(value: Array<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, p1: string, p2: number)=> void)>) {
    this.__backing_builderArr = value;
  }
  
  @MemoIntrinsic() public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<Child, __Options_Child>(__memo_context, ((__memo_id) + (47330804)), style, ((): Child => {
      return new Child(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): Child {
    throw new Error("Declare interface");
  }
  
  @Memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (145095936)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }
  
  ${dumpConstructor()}
  
}

@Component() export interface __Options_Child {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'builderArr', '(Array<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, p1: string, p2: number)=> void)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_builderArr', '(boolean | undefined)')}
}`;

function testMemoCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test resource transform in build method',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
