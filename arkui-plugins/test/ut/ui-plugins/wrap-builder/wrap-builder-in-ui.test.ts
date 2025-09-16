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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, WRAP_BUILDER_DIR_PATH, 'wrap-builder-in-ui.ets'),
];

const pluginTester = new PluginTester('test wrap builder used in UI', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed
};

const expectedUIScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Text as Text, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder, Builder as Builder, Column as Column, ForEach as ForEach } from "@kit.ArkUI";

const globalBuilderArr: Array<WrappedBuilder<MyBuilderFuncType>> = [wrapBuilder(myBuilder), wrapBuilder(yourBuilder)];

function main() {}


@memo() function myBuilder(value: string, size: number) {
  Text(@memo() ((instance: TextAttribute): void => {
    instance.fontSize(size);
    return;
  }), value, undefined, undefined);
}

@memo() function yourBuilder(value: string, size: number) {
  Text(@memo() ((instance: TextAttribute): void => {
    instance.fontSize(size);
    return;
  }), value, undefined, undefined);
}

globalBuilderArr = [wrapBuilder(myBuilder), wrapBuilder(yourBuilder)];

@memo() type MyBuilderFuncType = @Builder() ((value: string, size: number)=> void);

@Component() final struct ImportStruct extends CustomComponent<ImportStruct, __Options_ImportStruct> {
  public __initializeStruct(initializers: (__Options_ImportStruct | undefined), @memo() content: ((()=> void) | undefined)): void {}

  public __updateStruct(initializers: (__Options_ImportStruct | undefined)): void {}

  @memo() public testBuilder() {
    ForEach(((): Array<WrappedBuilder<MyBuilderFuncType>> => {
      return globalBuilderArr;
    }), ((item: WrappedBuilder<MyBuilderFuncType>) => {
      item.builder("hello world", 39);
    }));
  }

  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      this.testBuilder();
    }));
  }

  public constructor() {}

}

@Component() export interface __Options_ImportStruct {

}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";

import { memo as memo } from "arkui.stateManagement.runtime";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Text as Text, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder, Builder as Builder, Column as Column, ForEach as ForEach } from "@kit.ArkUI";

const globalBuilderArr: Array<WrappedBuilder<MyBuilderFuncType>> = [wrapBuilder(myBuilder), wrapBuilder(yourBuilder)];

function main() {}


@memo() function myBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number) {
  const __memo_scope = __memo_context.scope<void>(((__memo_id) + (52041161)), 2);
  const __memo_parameter_value = __memo_scope.param(0, value), __memo_parameter_size = __memo_scope.param(1, size);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  Text(__memo_context, ((__memo_id) + (175145513)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (47330804)), 1);
    const __memo_parameter_instance = __memo_scope.param(0, instance);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    __memo_parameter_instance.value.fontSize(__memo_parameter_size.value);
    {
      __memo_scope.recache();
      return;
    }
  }), __memo_parameter_value.value, undefined, undefined);
  {
    __memo_scope.recache();
    return;
  }
}

@memo() function yourBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number) {
  const __memo_scope = __memo_context.scope<void>(((__memo_id) + (151467670)), 2);
  const __memo_parameter_value = __memo_scope.param(0, value), __memo_parameter_size = __memo_scope.param(1, size);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  Text(__memo_context, ((__memo_id) + (211301233)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (137225318)), 1);
    const __memo_parameter_instance = __memo_scope.param(0, instance);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    __memo_parameter_instance.value.fontSize(__memo_parameter_size.value);
    {
      __memo_scope.recache();
      return;
    }
  }), __memo_parameter_value.value, undefined, undefined);
  {
    __memo_scope.recache();
    return;
  }
}

globalBuilderArr = [wrapBuilder(myBuilder), wrapBuilder(yourBuilder)];

@memo() type MyBuilderFuncType = @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void);

@Component() final struct ImportStruct extends CustomComponent<ImportStruct, __Options_ImportStruct> {
  public __initializeStruct(initializers: (__Options_ImportStruct | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}

  public __updateStruct(initializers: (__Options_ImportStruct | undefined)): void {}

  @memo() public testBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (194881372)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ForEach(__memo_context, ((__memo_id) + (218979098)), ((): Array<WrappedBuilder<MyBuilderFuncType>> => {
      return globalBuilderArr;
    }), ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, item: WrappedBuilder<MyBuilderFuncType>) => {
      const __memo_scope = __memo_context.scope<void>(((__memo_id) + (76711614)), 1);
      const __memo_parameter_item = __memo_scope.param(0, item);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      __memo_parameter_item.value.builder(__memo_context, ((__memo_id) + (46726221)), "hello world", 39);
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
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (142886843)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    Column(__memo_context, ((__memo_id) + (54078781)), undefined, undefined, @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<void>(((__memo_id) + (213687742)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      this.testBuilder(__memo_context, ((__memo_id) + (192802443)));
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

}

@Component() export interface __Options_ImportStruct {

}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test wrap builder in UI',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
