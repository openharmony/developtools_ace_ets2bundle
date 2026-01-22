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
import { uiNoRecheck, recheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../utils/simplify-dump';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const DOUBLE_DOLLAR_DIR_PATH: string = 'double-dollar';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DOUBLE_DOLLAR_DIR_PATH, 'double-dollar-textpicker.ets'),
];

const pluginTester = new PluginTester('test Text and TextPicker bindable capability', buildConfig);

const parsedTransform: Plugins = {
    name: 'double-dollar-textpicker',
    parsed: uiTransform().parsed
};

const expectedScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { makeBindable as makeBindable } from "arkui.component.common";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { TextPickerAttribute as TextPickerAttribute } from "arkui.component.textPicker";

import { TextPickerImpl as TextPickerImpl } from "arkui.component.textPicker";

import { TextInputAttribute as TextInputAttribute } from "arkui.component.textInput";

import { TextInputImpl as TextInputImpl } from "arkui.component.textInput";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, TextInput as TextInput, $$ as $$, TextPicker as TextPicker, TextPickerOptions as TextPickerOptions } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

function main() {}


@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_tt = STATE_MGMT_FACTORY.makeState<string>(this, "tt", ((({let gensym___111800258 = initializers;
    (((gensym___111800258) == (null)) ? undefined : gensym___111800258.tt)})) ?? ("state var")));
    this.__backing_index = STATE_MGMT_FACTORY.makeState<int>(this, "index", ((({let gensym___91647805 = initializers;
    (((gensym___91647805) == (null)) ? undefined : gensym___91647805.index)})) ?? (1)));
    this.__backing_select = STATE_MGMT_FACTORY.makeState<int>(this, "select", ((({let gensym___90525328 = initializers;
    (((gensym___90525328) == (null)) ? undefined : gensym___90525328.select)})) ?? (0)));
    this.__backing_selectArr = STATE_MGMT_FACTORY.makeState<Array<int>>(this, "selectArr", ((({let gensym___264591166 = initializers;
    (((gensym___264591166) == (null)) ? undefined : gensym___264591166.selectArr)})) ?? ([0, 1, 2])));
    this.__backing_fruits = ((({let gensym___180713065 = initializers;
    (((gensym___180713065) == (null)) ? undefined : gensym___180713065.fruits)})) ?? (["apple1", "orange2", "peach3", "grape4"]));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  private __backing_tt?: IStateDecoratedVariable<string>;
  public get tt(): string {
    return this.__backing_tt!.get();
  }
  
  public set tt(value: string) {
    this.__backing_tt!.set(value);
  }
  
  private __backing_index?: IStateDecoratedVariable<int>;
  public get index(): int {
    return this.__backing_index!.get();
  }
  
  public set index(value: int) {
    this.__backing_index!.set(value);
  }
  
  private __backing_select?: IStateDecoratedVariable<int>;
  public get select(): int {
    return this.__backing_select!.get();
  }
  
  public set select(value: int) {
    this.__backing_select!.set(value);
  }
  
  private __backing_selectArr?: IStateDecoratedVariable<Array<int>>;
  public get selectArr(): Array<int> {
    return this.__backing_selectArr!.get();
  }
  
  public set selectArr(value: Array<int>) {
    this.__backing_selectArr!.set(value);
  }
  
  private __backing_fruits?: Array<string>;
  public get fruits(): Array<string> {
    return (this.__backing_fruits as Array<string>);
  }
  
  public set fruits(value: Array<string>) {
    this.__backing_fruits = value;
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: MyStateSample)=> void), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___192738000 = storage;
      (((gensym___192738000) == (null)) ? undefined : gensym___192738000())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).margin(10);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      TextInputImpl(@Memo() ((instance: TextInputAttribute): void => {
        instance.setTextInputOptions({
          text: makeBindable(this.tt, ((value) => {
            this.tt = value;
          })),
        });
        instance.applyAttributesFinish();
        return;
      }));
      TextPickerImpl(@Memo() ((instance: TextPickerAttribute): void => {
        instance.setTextPickerOptions(({
          range: this.fruits,
          selected: makeBindable(this.select, ((value) => {
            this.select = value;
          })),
          value: makeBindable(this.fruits[0], ((value) => {
            this.fruits[0] = value;
          })),
        } as TextPickerOptions));
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextPickerImpl(@Memo() ((instance: TextPickerAttribute): void => {
        instance.setTextPickerOptions(({
          range: this.fruits,
          selected: makeBindable(this.selectArr, ((value) => {
            this.selectArr = value;
          })),
          value: makeBindable(this.fruits, ((value) => {
            this.fruits = value;
          })),
        } as TextPickerOptions));
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextPickerImpl(@Memo() ((instance: TextPickerAttribute): void => {
        instance.setTextPickerOptions(({
          range: this.fruits,
          selected: makeBindable(this.selectArr, ((value) => {
            this.selectArr = value;
          })),
          value: makeBindable(this.fruits[this.index], ((value) => {
            this.fruits[this.index] = value;
          })),
        } as TextPickerOptions));
        instance.applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  ${dumpConstructor()}
  
}

@Component() export interface __Options_MyStateSample {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'tt', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_tt', '(IStateDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_tt', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, 'index', '(int | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_index', '(IStateDecoratedVariable<int> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_index', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, 'select', '(int | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_select', '(IStateDecoratedVariable<int> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_select', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, 'selectArr', '(Array<int> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_selectArr', '(IStateDecoratedVariable<Array<int>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_selectArr', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, 'fruits', '(Array<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_fruits', '(boolean | undefined)')}
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test Text and TextPicker bindable capability',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
