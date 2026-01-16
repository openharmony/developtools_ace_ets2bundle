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
import { uiNoRecheck, recheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../../utils/simplify-dump';
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
import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { ReuseOptions as ReuseOptions } from "arkui.component.common";

import { Component as Component, Entry as Entry, Reusable as Reusable, Column as Column, Text as Text, Button as Button, ClickEvent as ClickEvent, FontWeight as FontWeight } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/reusable/reusable-complex",
  pageFullPath: "test/demo/mock/decorators/reusable/reusable-complex",
  integratedHsp: "false",
  } as NavInterface));

class Message {
  public value: (string | undefined);
  
  public constructor(value: string) {
    this.value = value;
  }
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct Index extends CustomComponent<Index, __Options_Index> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_display = STATE_MGMT_FACTORY.makeState<boolean>(this, "display", ((({let gensym___83835842 = initializers;
    (((gensym___83835842) == (null)) ? undefined : gensym___83835842.display)})) ?? (true)));
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  private __backing_display?: IStateDecoratedVariable<boolean>;
  
  public get display(): boolean {
    return this.__backing_display!.get();
  }
  
  public set display(value: boolean) {
    this.__backing_display!.set(value);
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: Index)=> void), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).height("100%").width("100%");
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("Hello", undefined).fontSize(30).fontWeight(FontWeight.Bold).onClick(((e: ClickEvent) => {
          this.display = !(this.display);
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
      Child._invoke(@Memo() ((instance: Child): void => {
        instance.reuseId("res");
        instance.applyAttributesFinish();
        return;
      }), (() => {
        return {
          message: new Message("Child"),
          __options_has_message: true,
        };
      }), undefined, "res", undefined);
      if (this.display) {
        Child._invoke(@Memo() ((instance: Child): void => {
          instance.applyAttributesFinish();
          return;
        }), (() => {
          return {
            message: new Message("Child"),
            __options_has_message: true,
          };
        }), undefined, "Child", undefined);
      }
    }));
  }
  
  ${dumpConstructor()}
  
}

@Reusable() @Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_message = STATE_MGMT_FACTORY.makeState<Message>(this, "message", ((({let gensym___91869411 = initializers;
    (((gensym___91869411) == (null)) ? undefined : gensym___91869411.message)})) ?? (new Message("AboutToReuse"))));
  }
  
  public __updateStruct(initializers: (__Options_Child | undefined)): void {}
  
  public override constructor __toRecord(params: Object): Record<string, Object> {
    const paramsCasted = (params as __Options_Child);
    return {
      "message": ((paramsCasted.message) ?? (new Object())),
    };
  }
  
  private __backing_message?: IStateDecoratedVariable<Message>;
  
  public get message(): Message {
    return this.__backing_message!.get();
  }
  
  public set message(value: Message) {
    this.__backing_message!.set(value);
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Child, __Options_Child>(style, ((): Child => {
      return new Child(false, ({let gensym___17371929 = storage;
      (((gensym___17371929) == (null)) ? undefined : gensym___17371929())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Child {
    throw new Error("Declare interface");
  }
  
  public aboutToReuse(params: Record<string, ESObject>) {}
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).borderWidth(1).height(100);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(this.message.value, undefined).fontSize(30);
        instance.applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
 ${dumpConstructor()}
  
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    Index._invoke(@Memo() ((instance: Index): void => {
    instance.applyAttributesFinish();
    return;
    }), undefined, undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_Index {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'display', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_display', '(IStateDecoratedVariable<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_display', '(boolean | undefined)')}
  
}

@Reusable() @Component() export interface __Options_Child {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'message', '(Message | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_message', '(IStateDecoratedVariable<Message> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_message', '(boolean | undefined)')}
  
}
`;

function testReusableTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test complex reusable',
    [reusableTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testReusableTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
