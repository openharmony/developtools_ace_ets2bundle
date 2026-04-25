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
import { dumpGetterSetter, GetSetDumper, dumpConstructor, dumpAnnotation } from '../../../utils/simplify-dump';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const WRAP_BUILDER_DIR_PATH: string = 'wrap-builder';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, WRAP_BUILDER_DIR_PATH, 'builder-in-component-arg.ets'),
];

const pluginTester = new PluginTester('test builder in component arguments', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ListItemGroupAttribute as ListItemGroupAttribute } from "arkui.component.listItemGroup";

import { ListItemGroupImpl as ListItemGroupImpl } from "arkui.component.listItemGroup";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, Builder as Builder, ListItemGroup as ListItemGroup, CustomBuilder as CustomBuilder } from "@ohos.arkui.component";

function main() {}

class TimeTable {
  public title: string = "";
  public projects: Array<string> = [];
  public constructor() {}
  
}

@Component() final struct ListItemGroupExample extends CustomComponent<ListItemGroupExample, __Options_ListItemGroupExample> {
  public __initializeStruct(initializers: (__Options_ListItemGroupExample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_timetable = ((({let gensym___122433430 = initializers;
    (((gensym___122433430) == (null)) ? undefined : gensym___122433430.timetable)})) ?? (new TimeTable()));
  }
  
  public __updateStruct(initializers: (__Options_ListItemGroupExample | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ListItemGroupExample)=> void) | undefined), initializers: ((()=> __Options_ListItemGroupExample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<ListItemGroupExample, __Options_ListItemGroupExample>(style, ((): ListItemGroupExample => {
      return new ListItemGroupExample(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ListItemGroupExample, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ListItemGroupExample {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public itemHead(@MemoSkip() text: string) {}
  
  @Memo() 
  public itemFoot(@MemoSkip() num: number) {}
  
  private __backing_timetable?: TimeTable;
  public get timetable(): TimeTable {
    return (this.__backing_timetable as TimeTable);
  }
  
  public set timetable(value: TimeTable) {
    this.__backing_timetable = value;
  }
  
  @Memo() 
  public build() {
    ListItemGroupImpl(@Memo() ((instance: ListItemGroupAttribute): void => {
      instance.setListItemGroupOptions({
        header: (@Memo() (() => {
          this.itemHead(this.timetable.title);
        }) as CustomBuilder),
        footer: (@Memo() (() => {
          this.itemFoot(this.timetable.projects.length);
        }) as CustomBuilder),
      });
      instance.applyAttributesFinish();
      return;
    }), undefined);
  }
  
  ${dumpConstructor()}
  
  static {
    
  }
}

@Component() export interface __Options_ListItemGroupExample {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'timetable', '(TimeTable | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_timetable', '(boolean | undefined)')}

}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ListItemGroupAttribute as ListItemGroupAttribute } from "arkui.component.listItemGroup";

import { ListItemGroupImpl as ListItemGroupImpl } from "arkui.component.listItemGroup";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, Builder as Builder, ListItemGroup as ListItemGroup, CustomBuilder as CustomBuilder } from "@ohos.arkui.component";

function main() {}

class TimeTable {
  public title: string = "";
  public projects: Array<string> = [];
  public constructor() {}
  
}

@Component() final struct ListItemGroupExample extends CustomComponent<ListItemGroupExample, __Options_ListItemGroupExample> {
  public __initializeStruct(initializers: (__Options_ListItemGroupExample | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_timetable = ((({let gensym___122433430 = initializers;
    (((gensym___122433430) == (null)) ? undefined : gensym___122433430.timetable)})) ?? (new TimeTable()));
  }
  
  public __updateStruct(initializers: (__Options_ListItemGroupExample | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ListItemGroupExample)=> void) | undefined), initializers: ((()=> __Options_ListItemGroupExample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<ListItemGroupExample, __Options_ListItemGroupExample>(__memo_context, ((__memo_id) + (47330804)), style, ((): ListItemGroupExample => {
      return new ListItemGroupExample(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ListItemGroupExample, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ListItemGroupExample {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public itemHead(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() text: string) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (72248556)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }
  
  @Memo() 
  public itemFoot(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() num: number) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (32111347)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }
  
  private __backing_timetable?: TimeTable;
  public get timetable(): TimeTable {
    return (this.__backing_timetable as TimeTable);
  }
  
  public set timetable(value: TimeTable) {
    this.__backing_timetable = value;
  }
  
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (69406103)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ListItemGroupImpl(__memo_context, ((__memo_id) + (218979098)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ListItemGroupAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (76711614)), 1);
      const __memo_parameter_instance = __memo_scope.param(0, instance);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      __memo_parameter_instance.value.setListItemGroupOptions({
        header: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
          const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (211301233)), 0);
          if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
          }
          this.itemHead(__memo_context, ((__memo_id) + (137225318)), this.timetable.title);
          {
            __memo_scope.recache();
            return;
          }
        }) as CustomBuilder),
        footer: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
          const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (46726221)), 0);
          if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
          }
          this.itemFoot(__memo_context, ((__memo_id) + (213104625)), this.timetable.projects.length);
          {
            __memo_scope.recache();
            return;
          }
        }) as CustomBuilder),
      });
      __memo_parameter_instance.value.applyAttributesFinish();
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
  
  ${dumpConstructor()}
  
  static {
    
  }
}

@Component() export interface __Options_ListItemGroupExample {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'timetable', '(TimeTable | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_timetable', '(boolean | undefined)')}
  
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test builder in component arguments',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
