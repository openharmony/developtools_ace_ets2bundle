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
import { PluginTestContext, PluginTester } from '../../../../utils/plugin-tester';
import { BuildConfig, mockBuildConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { uiNoRecheck } from '../../../../utils/plugins';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const REUSABLE_DIR_PATH: string = 'decorators/reusable';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, REUSABLE_DIR_PATH, 'reusable-complex.ets'),
];

const reusableTransform: Plugins = {
    name: 'reusable',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test complex reusable', buildConfig);

const expectedScript: string = `
import { __memo_id_type as __memo_id_type } from "@ohos.arkui.stateManagement";

import { __memo_context_type as __memo_context_type } from "@ohos.arkui.stateManagement";

import { memo as memo } from "@ohos.arkui.stateManagement";

import { StateDecoratedVariable as StateDecoratedVariable } from "@ohos.arkui.stateManagement";

import { UIButtonAttribute as UIButtonAttribute } from "@ohos.arkui.component";

import { UITextAttribute as UITextAttribute } from "@ohos.arkui.component";

import { UIColumnAttribute as UIColumnAttribute } from "@ohos.arkui.component";

import { EntryPoint as EntryPoint } from "@ohos.arkui.component";

import { CustomComponent as CustomComponent } from "@ohos.arkui.component";

import { Component as Component, Entry as Entry, Reusable as Reusable, Column as Column, Text as Text, Button as Button, ClickEvent as ClickEvent, FontWeight as FontWeight } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

function main() {}



class Message {
  public value: string | undefined;
  
  public constructor(value: string) {
    (this).value = value;
  }
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final class Index extends CustomComponent<Index, __Options_Index> {
  public __initializeStruct(initializers: __Options_Index | undefined, @memo() content: (()=> void) | undefined): void {
    (this).__backing_display = new StateDecoratedVariable<boolean>("display", ((({let gensym___83835842 = initializers;
    (((gensym___83835842) == (null)) ? undefined : gensym___83835842.display)})) ?? (true)));
  }
  
  public __updateStruct(initializers: __Options_Index | undefined): void {}
  
  private __backing_display?: StateDecoratedVariable<boolean>;
  
  public get display(): boolean {
    return (this).__backing_display!.get();
  }
  
  public set display(value: boolean) {
    (this).__backing_display!.set(value);
  }
  
  @memo() public _build(@memo() style: ((instance: Index)=> Index) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Index | undefined): void {
    Column(@memo() ((instance: UIColumnAttribute): void => {
      instance.height("100%").width("100%");
      return;
    }), undefined, (() => {
      Button(@memo() ((instance: UIButtonAttribute): void => {
        instance.fontSize(30).fontWeight(FontWeight.Bold).onClick(((e: ClickEvent) => {
          (this).display = !((this).display);
        }));
        return;
      }), "Hello", undefined, undefined);
      if ((this).display) {
        Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), ({
        message: new Message("Child"),
      } as __Options_Child), undefined, "Child");
      }
    }));
  }
  
  public constructor() {}
  
}

@Reusable() @Component({freezeWhenInactive:false}) final class Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: __Options_Child | undefined, @memo() content: (()=> void) | undefined): void {
    (this).__backing_message = new StateDecoratedVariable<Message>("message", ((({let gensym___91869411 = initializers;
    (((gensym___91869411) == (null)) ? undefined : gensym___91869411.message)})) ?? (new Message("AboutToReuse"))));
  }
  
  public __updateStruct(initializers: __Options_Child | undefined): void {}
  
  public override __toRecord(params: Object): Record<string, Object> {
    const paramsCasted = (params as __Options_Child);
    return {
      "message": ((paramsCasted.message) ?? (new Object())),
    };
  }
  
  private __backing_message?: StateDecoratedVariable<Message>;
  
  public get message(): Message {
    return (this).__backing_message!.get();
  }
  
  public set message(value: Message) {
    (this).__backing_message!.set(value);
  }
  
  public aboutToReuse(params: Record<string, ESObject>) {
    console.info("Recycle ====Child==");
  }
  
  @memo() public _build(@memo() style: ((instance: Child)=> Child) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Child | undefined): void {
    Column(@memo() ((instance: UIColumnAttribute): void => {
      instance.borderWidth(1).height(100);
      return;
    }), undefined, (() => {
      Text(@memo() ((instance: UITextAttribute): void => {
        instance.fontSize(30);
        return;
      }), (this).message.value, undefined, undefined);
    }));
  }
  
  public constructor() {}
  
}

interface __Options_Index {
  set display(display: boolean | undefined)
  
  get display(): boolean | undefined
  set __backing_display(__backing_display: StateDecoratedVariable<boolean> | undefined)
  
  get __backing_display(): StateDecoratedVariable<boolean> | undefined
  
}

interface __Options_Child {
  set message(message: Message | undefined)
  
  get message(): Message | undefined
  set __backing_message(__backing_message: StateDecoratedVariable<Message> | undefined)
  
  get __backing_message(): StateDecoratedVariable<Message> | undefined
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    Index._instantiateImpl(undefined, (() => {
      return new Index();
    }), undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

`;

function testReusableTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test complex reusable',
    [reusableTransform, uiNoRecheck],
    {
        checked: [testReusableTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
