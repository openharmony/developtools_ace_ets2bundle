/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { uiNoRecheck, recheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../utils/simplify-dump';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const DOUBLE_DOLLAR_DIR_PATH: string = 'double-dollar';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DOUBLE_DOLLAR_DIR_PATH, 'double-dollar-non-ui.ets'),
];

const pluginTester = new PluginTester('test the use of $$ in non ui', buildConfig);

const parsedTransform: Plugins = {
    name: 'double-dollar-non-ui',
    parsed: uiTransform().parsed
};

const expectedScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { TextInputAttribute as TextInputAttribute } from "arkui.component.textInput";

import { TextInputImpl as TextInputImpl } from "arkui.component.textInput";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { makeBindable as makeBindable } from "arkui.component.common";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Entry as Entry, Component as Component, Column as Column, Text as Text, TextInput as TextInput, Button as Button, $$ as $$, Bindable as Bindable } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../double-dollar/double-dollar-non-ui",
  pageFullPath: "test/demo/mock/double-dollar/double-dollar-non-ui",
  integratedHsp: "false",
} as NavInterface));
@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_str1 = STATE_MGMT_FACTORY.makeState<string>(this, "str1", ((({let gensym___147578113 = initializers;
    (((gensym___147578113) == (null)) ? undefined : gensym___147578113.str1)})) ?? ("Hello World")));
    this.__backing_str2 = STATE_MGMT_FACTORY.makeState<string>(this, "str2", ((({let gensym___220149772 = initializers;
    (((gensym___220149772) == (null)) ? undefined : gensym___220149772.str2)})) ?? ("Hello")));
    this.__backing_newStr = STATE_MGMT_FACTORY.makeState<Bindable<string>>(this, "newStr", ((({let gensym___85947701 = initializers;
    (((gensym___85947701) == (null)) ? undefined : gensym___85947701.newStr)})) ?? (makeBindable(this.str1, ((value) => {
      this.str1 = value;
    })))));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  private __backing_str1?: IStateDecoratedVariable<string>;
  public get str1(): string {
    return this.__backing_str1!.get();
  }
  
  public set str1(value: string) {
    this.__backing_str1!.set(value);
  }
  
  private __backing_str2?: IStateDecoratedVariable<string>;
  public get str2(): string {
    return this.__backing_str2!.get();
  }
  
  public set str2(value: string) {
    this.__backing_str2!.set(value);
  }
  
  private __backing_newStr?: IStateDecoratedVariable<Bindable<string>>;
  public get newStr(): Bindable<string> {
    return this.__backing_newStr!.get();
  }
  
  public set newStr(value: Bindable<string>) {
    this.__backing_newStr!.set(value);
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: MyStateSample)=> void), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___17371929 = storage;
      (((gensym___17371929) == (null)) ? undefined : gensym___17371929())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  public getBindableVar(): Bindable<string> {
    return makeBindable(this.str1, ((value) => {
      this.str1 = value;
    }));
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      TextInputImpl(@Memo() ((instance: TextInputAttribute): void => {
        instance.setTextInputOptions({
          text: this.newStr,
        });
        instance.applyAttributesFinish();
        return;
      }));
      TextInputImpl(@Memo() ((instance: TextInputAttribute): void => {
        instance.setTextInputOptions({
          text: this.getBindableVar(),
        });
        instance.applyAttributesFinish();
        return;
      }));
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("Test $$", undefined).onClick((() => {
          this.newStr = makeBindable(this.str2, ((value) => {
            this.str2 = value;
          }));
        }));
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
    MyStateSample._invoke(@Memo() ((instance: MyStateSample): void => {
      instance.applyAttributesFinish();
      return;
    }), undefined, undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_MyStateSample {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'str1', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_str1', '(IStateDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_str1', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, 'str2', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_str2', '(IStateDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_str2', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, 'newStr', '(Bindable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_newStr', '(IStateDecoratedVariable<Bindable<string>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_newStr', '(boolean | undefined)')}

}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test the use of $$ in non ui',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
