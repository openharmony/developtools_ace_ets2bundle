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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DOUBLE_DOLLAR_DIR_PATH, 'double-dollar-griditem.ets'),
];

const pluginTester = new PluginTester('test griditem bindable capability', buildConfig);

const parsedTransform: Plugins = {
    name: 'double-dollar-griditem',
    parsed: uiTransform().parsed
};

const expectedScript: string = `

import { memo as memo } from "arkui.stateManagement.runtime";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { GridItemAttribute as GridItemAttribute } from "arkui.component.gridItem";

import { Bindable as Bindable } from "arkui.component.common";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.UserView";

import { LayoutCallback as LayoutCallback } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Text as Text, Entry as Entry, Column as Column, Component as Component, $$ as $$, Grid as Grid, GridItem as GridItem } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

let c: boolean;

function main() {}

c = false;

@Entry({shared:false,storage:"",routeName:""}) @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_boo = STATE_MGMT_FACTORY.makeState<boolean>(this, "boo", ((({let gensym___9142460 = initializers;
    (((gensym___9142460) == (null)) ? undefined : gensym___9142460.boo)})) ?? (true)));
  }
  
  public __updateStruct(initializers: __Options_MyStateSample | undefined): void {}
  
  private __backing_boo?: IStateDecoratedVariable<boolean>;
  
  public get boo(): boolean {
    return this.__backing_boo!.get();
  }
  
  public set boo(value: boolean) {
    this.__backing_boo!.set(value);
  }
  
  @memo() public build() {
    Column(undefined, (() => {
      Grid(undefined, (() => {
        GridItem(((instance: GridItemAttribute): void => {
          instance.selected(({
            value: this.boo,
            onChange: ((value: boolean) => {
              this.boo = value;
            }),
          } as Bindable<boolean>));
          return;
        }), (() => {
          Text(undefined, "nihao");
        }));
        GridItem(((instance: GridItemAttribute): void => {
          instance.selected(({
            value: c,
            onChange: ((value: boolean) => {
              c = value;
            }),
          } as Bindable<boolean>));
          return;
        }), (() => {
          Text(undefined, "nihao");
        }));
      }));
    }));
  }
  
  private constructor() {}
  
}

@Entry({shared:false,storage:"",routeName:""}) @Component() export interface __Options_MyStateSample {
  set boo(boo: boolean | undefined)
  
  get boo(): boolean | undefined
  set __backing_boo(__backing_boo: IStateDecoratedVariable<boolean> | undefined)
  
  get __backing_boo(): IStateDecoratedVariable<boolean> | undefined
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    MyStateSample._instantiateImpl(undefined, (() => {
      return new MyStateSample();
    }));
  }
  
  public constructor() {}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test griditem bindable capability',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
