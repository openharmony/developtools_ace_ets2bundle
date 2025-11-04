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
import { dumpConstructor } from '../../../../utils/simplify-dump';

const BUILDER_LAMBDA_DIR_PATH: string = 'builder-lambda';
const INNER_COMPONENT_DIR_PATH: string = 'inner-component';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(
        getRootPath(),
        MOCK_ENTRY_DIR_PATH,
        BUILDER_LAMBDA_DIR_PATH,
        INNER_COMPONENT_DIR_PATH,
        'custom-builder.ets'
    ),
];

const pluginTester = new PluginTester('test passing CustomBuilder to component', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTransform',
    parsed: uiTransform().parsed,
};

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ListItemGroupAttribute as ListItemGroupAttribute } from "arkui.component.listItemGroup";

import { ListItemGroupImpl as ListItemGroupImpl } from "arkui.component.listItemGroup";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, ListItemGroup as ListItemGroup, CustomBuilder as CustomBuilder } from "@ohos.arkui.component";

function main() {}


@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  @MemoIntrinsic() public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: MyStateSample)=> void), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(__memo_context, ((__memo_id) + (47330804)), style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  @Memo() public itemHead(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() text: string) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (30080009)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    TextImpl(__memo_context, ((__memo_id) + (241913892)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (175145513)), 1);
      const __memo_parameter_instance = __memo_scope.param(0, instance);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      __memo_parameter_instance.value.setTextOptions(text, undefined).fontSize(20).backgroundColor(0xAABBCC).applyAttributesFinish();
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
  
  @Memo() public itemFoot(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() num: number) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (143004952)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    TextImpl(__memo_context, ((__memo_id) + (213104625)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (211301233)), 1);
      const __memo_parameter_instance = __memo_scope.param(0, instance);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      __memo_parameter_instance.value.setTextOptions("Foot", undefined).fontSize(16).backgroundColor(0xAABBCC).applyAttributesFinish();
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
  
  @Memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (75236795)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (173773669)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (76711614)), 1);
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
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (262314519)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      ListItemGroupImpl(__memo_context, ((__memo_id) + (78055758)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ListItemGroupAttribute): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (54078781)), 1);
        const __memo_parameter_instance = __memo_scope.param(0, instance);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        __memo_parameter_instance.value.setListItemGroupOptions({
          header: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (223657391)), 0);
            if (__memo_scope.unchanged) {
              __memo_scope.cached;
              return;
            }
            this.itemHead(__memo_context, ((__memo_id) + (218979098)), "Head");
            {
              __memo_scope.recache();
              return;
            }
          }),
          footer: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (213687742)), 0);
            if (__memo_scope.unchanged) {
              __memo_scope.cached;
              return;
            }
            this.itemFoot(__memo_context, ((__memo_id) + (192802443)), 100);
            {
              __memo_scope.recache();
              return;
            }
          }) as CustomBuilder),
        }).applyAttributesFinish();
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
  
}

@Component() export interface __Options_MyStateSample {
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test passing CustomBuilder to component',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
