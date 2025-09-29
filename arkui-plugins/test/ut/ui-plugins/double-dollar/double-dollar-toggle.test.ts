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
import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";
import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";
import { memo as memo } from "arkui.stateManagement.runtime";
import { ToggleAttribute as ToggleAttribute } from "arkui.component.toggle";
import { Bindable as Bindable } from "arkui.component.common";
import { ToggleImpl as ToggleImpl } from "arkui.component.toggle";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Text as Text, Column as Column, Component as Component, $$ as $$, Toggle as Toggle, ToggleType as ToggleType } from "@ohos.arkui.component";
import { State as State } from "@ohos.arkui.stateManagement";

let c: Array<boolean>;

function main() {}

c = [true, false, true];

class BooleanClass {
  public isOn: boolean = true;

  public constructor() {}

}

@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @memo() content: ((()=> void) | undefined)): void {
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

  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      ToggleImpl(@memo() ((instance: ToggleAttribute): void => {
        instance.setToggleOptions({
          type: ToggleType.Checkbox,
          isOn: ({
            value: this.boo[0],
            onChange: ((value: boolean) => {
              this.boo[0] = value;
            }),
          } as Bindable<boolean>),
        }).applyAttributesFinish();
        return;
      }), undefined);
      ToggleImpl(@memo() ((instance: ToggleAttribute): void => {
        instance.setToggleOptions({
          type: ToggleType.Checkbox,
          isOn: ({
            value: this.booClass.isOn,
            onChange: ((value: boolean) => {
              this.booClass.isOn = value;
            }),
          } as Bindable<boolean>),
        }).applyAttributesFinish();
        return;
      }), undefined);
      ToggleImpl(@memo() ((instance: ToggleAttribute): void => {
        instance.setToggleOptions({
          type: ToggleType.Checkbox,
          isOn: ({
            value: c[1],
            onChange: ((value: boolean) => {
              c[1] = value;
            }),
          } as Bindable<boolean>),
        }).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }

  public constructor() {}

}

@Component() export interface __Options_MyStateSample {
  set boo(boo: (Array<boolean> | undefined))

  get boo(): (Array<boolean> | undefined)
  set __backing_boo(__backing_boo: (IStateDecoratedVariable<Array<boolean>> | undefined))

  get __backing_boo(): (IStateDecoratedVariable<Array<boolean>> | undefined)
  set __options_has_boo(__options_has_boo: (boolean | undefined))
  
  get __options_has_boo(): (boolean | undefined)
  set booClass(booClass: (BooleanClass | undefined))

  get booClass(): (BooleanClass | undefined)
  set __backing_booClass(__backing_booClass: (IStateDecoratedVariable<BooleanClass> | undefined))

  get __backing_booClass(): (IStateDecoratedVariable<BooleanClass> | undefined)
  set __options_has_booClass(__options_has_booClass: (boolean | undefined))
  
  get __options_has_booClass(): (boolean | undefined)
  
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
