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
import { dumpConstructor } from '../../../utils/simplify-dump';

const WRAP_BUILDER_DIR_PATH: string = 'wrap-builder';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, WRAP_BUILDER_DIR_PATH, 'init-with-builder.ets'),
];

const pluginTester = new PluginTester('test wrap builder init with @Builder function', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed
};

const expectedUIScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from \"arkui.incremental.annotation\";
import { ColumnAttribute as ColumnAttribute } from \"arkui.component.column\";
import { ColumnImpl as ColumnImpl } from \"arkui.component.column\";
import { MemoSkip as MemoSkip } from \"arkui.incremental.annotation\";
import { memo as memo } from \"arkui.stateManagement.runtime\";
import { TextAttribute as TextAttribute } from \"arkui.component.text\";
import { TextImpl as TextImpl } from \"arkui.component.text\";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Builder as Builder } from \"arkui.component.builder\";
import { LocalStorage as LocalStorage } from \"arkui.stateManagement.storage.localStorage\";
import { ComponentBuilder as ComponentBuilder } from \"arkui.stateManagement.runtime\";
import { Component as Component, Text as Text, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder, Builder as Builder, Column as Column } from \"@kit.ArkUI\";

let globalBuilder: WrappedBuilder<MyBuilderFuncType>;

function main() {}

@memo() function myBuilder(@MemoSkip() value: string, @MemoSkip() size: number) {
  TextImpl(@memo() ((instance: TextAttribute): void => {
    instance.setTextOptions(value, undefined).fontSize(size).applyAttributesFinish();
    return;
  }), undefined);
}

@memo() type MyBuilderFuncType = @Builder() ((value: string, size: number)=> void);

@Component() final struct ImportStruct extends CustomComponent<ImportStruct, __Options_ImportStruct> {
  public __initializeStruct(initializers: (__Options_ImportStruct | undefined), @memo() content: ((()=> void) | undefined)): void {}

  public __updateStruct(initializers: (__Options_ImportStruct | undefined)): void {}

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: ImportStruct)=> void), initializers: ((()=> __Options_ImportStruct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<ImportStruct, __Options_ImportStruct>(style, ((): ImportStruct => {
      return new ImportStruct(false, ({let gensym___<some_random_number> = storage;
        (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
    }), initializers, reuseId, content);
  }

  @ComponentBuilder() public static $_invoke(initializers?: __Options_ImportStruct, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): ImportStruct {
    throw new Error(\"Declare interface\");
  }

  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      globalBuilder.builder(\"hello\", 50);
    }));
  }

  ${dumpConstructor()}
}

@Component() export interface __Options_ImportStruct {
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.incremental.runtime.state\";
import { MemoIntrinsic as MemoIntrinsic } from \"arkui.incremental.annotation\";
import { ColumnAttribute as ColumnAttribute } from \"arkui.component.column\";
import { ColumnImpl as ColumnImpl } from \"arkui.component.column\";
import { MemoSkip as MemoSkip } from \"arkui.incremental.annotation\";
import { memo as memo } from \"arkui.stateManagement.runtime\";
import { TextAttribute as TextAttribute } from \"arkui.component.text\";
import { TextImpl as TextImpl } from \"arkui.component.text\";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Builder as Builder } from \"arkui.component.builder\";
import { LocalStorage as LocalStorage } from \"arkui.stateManagement.storage.localStorage\";
import { ComponentBuilder as ComponentBuilder } from \"arkui.stateManagement.runtime\";
import { Component as Component, Text as Text, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder, Builder as Builder, Column as Column } from \"@kit.ArkUI\";

let globalBuilder: WrappedBuilder<MyBuilderFuncType>;

function main() {}

@memo() function myBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() value: string, @MemoSkip() size: number) {
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
    __memo_parameter_instance.value.setTextOptions(value, undefined).fontSize(size).applyAttributesFinish();
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

@memo() type MyBuilderFuncType = @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void);
@Component() final struct ImportStruct extends CustomComponent<ImportStruct, __Options_ImportStruct> {
  public __initializeStruct(initializers: (__Options_ImportStruct | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}

  public __updateStruct(initializers: (__Options_ImportStruct | undefined)): void {}

  @MemoIntrinsic() public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ImportStruct)=> void), initializers: ((()=> __Options_ImportStruct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<ImportStruct, __Options_ImportStruct>(__memo_context, ((__memo_id) + (<some_random_number>)), style, ((): ImportStruct => {
      return new ImportStruct(false, ({let gensym___<some_random_number> = storage;
        (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
    }), initializers, reuseId, content);
  }

  @ComponentBuilder() public static $_invoke(initializers?: __Options_ImportStruct, storage?: LocalStorage, @Builder() @memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ImportStruct {
    throw new Error(\"Declare interface\");
  }

  @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
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
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      globalBuilder.builder(__memo_context, ((__memo_id) + (<some_random_number>)), \"hello\", 50);
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
@Component() export interface __Options_ImportStruct {
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test wrap builder init with @Builder function',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
