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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DOUBLE_DOLLAR_DIR_PATH, 'double-dollar-toggle.ets'),
];

const pluginTester = new PluginTester('test toggle bindable capability', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ToggleAttribute as ToggleAttribute } from "arkui.component.toggle";

import { makeBindable as makeBindable } from "arkui.component.common";

import { ToggleImpl as ToggleImpl } from "arkui.component.toggle";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, $$ as $$, Toggle as Toggle, ToggleType as ToggleType } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

const c: Array<boolean> = [true, false, true];

function main() {}

class BooleanClass {
  public isOn: boolean = true;

  public constructor() {}

}

@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_boo = STATE_MGMT_FACTORY.makeState<Array<boolean>>(this, "boo", ((({let gensym___9142460 = initializers;
    (((gensym___9142460) == (null)) ? undefined : gensym___9142460.boo)})) ?? ([true, false, true])));
    this.__backing_booClass = STATE_MGMT_FACTORY.makeState<BooleanClass>(this, "booClass", ((({let gensym___145381365 = initializers;
    (((gensym___145381365) == (null)) ? undefined : gensym___145381365.booClass)})) ?? (new BooleanClass())));
  }

  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}

  private __backing_boo?: IStateDecoratedVariable<Array<boolean>>;

  public get boo(): Array<boolean> {
    return this.__backing_boo!.get();
  }

  public set boo(value: Array<boolean>) {
    this.__backing_boo!.set(value);
  }

  private __backing_booClass?: IStateDecoratedVariable<BooleanClass>;

  public get booClass(): BooleanClass {
    return this.__backing_booClass!.get();
  }

  public set booClass(value: BooleanClass) {
    this.__backing_booClass!.set(value);
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: MyStateSample)=> void), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ToggleImpl(@Memo() ((instance: ToggleAttribute): void => {
        instance.setToggleOptions({
          type: ToggleType.Checkbox,
          isOn: makeBindable(this.boo[0], ((value) => {
            this.boo[0] = value;
          })),
        });
        instance.applyAttributesFinish();
        return;
      }), undefined);
      ToggleImpl(@Memo() ((instance: ToggleAttribute): void => {
        instance.setToggleOptions({
          type: ToggleType.Checkbox,
          isOn: makeBindable(this.booClass.isOn, ((value) => {
            this.booClass.isOn = value;
          })),
        });
        instance.applyAttributesFinish();
        return;
      }), undefined);
      ToggleImpl(@Memo() ((instance: ToggleAttribute): void => {
        instance.setToggleOptions({
          type: ToggleType.Checkbox,
          isOn: makeBindable(c[1], ((value) => {
            c[1] = value;
          })),
        });
        instance.applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  ${dumpConstructor()}
  
}

@Component() export interface __Options_MyStateSample {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'boo', '(Array<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_boo', '(IStateDecoratedVariable<Array<boolean>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_boo', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'booClass', '(BooleanClass | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_booClass', '(IStateDecoratedVariable<BooleanClass> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_booClass', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test toggle bindable capability',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
