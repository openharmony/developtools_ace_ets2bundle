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
import { uiNoRecheck, recheck, beforeUINoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { dumpAnnotation, dumpGetterSetter, GetSetDumper } from '../../../utils/simplify-dump';
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
import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { GridAttribute as GridAttribute } from "arkui.component.grid";

import { GridItemAttribute as GridItemAttribute } from "arkui.component.gridItem";

import { Memo as Memo } from "arkui.incremental.annotation";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { makeBindable as makeBindable } from "arkui.component.common";

import { GridItemImpl as GridItemImpl } from "arkui.component.gridItem";

import { GridImpl as GridImpl } from "arkui.component.grid";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Text as Text, Entry as Entry, Column as Column, Component as Component, $$ as $$, Grid as Grid, GridItem as GridItem } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

let c: boolean;

function main() {}

c = false;
__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../double-dollar/double-dollar-griditem",
  pageFullPath: "test/demo/mock/double-dollar/double-dollar-griditem",
  integratedHsp: "false",
  } as NavInterface));

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_boo = STATE_MGMT_FACTORY.makeState<boolean>(this, "boo", ((({let gensym___9142460 = initializers;
    (((gensym___9142460) == (null)) ? undefined : gensym___9142460.boo)})) ?? (true)));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  private __backing_boo?: IStateDecoratedVariable<boolean>;
  
  public get boo(): boolean {
    return this.__backing_boo!.get();
  }
  
  public set boo(value: boolean) {
    this.__backing_boo!.set(value);
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      GridImpl(@Memo() ((instance: GridAttribute): void => {
        instance.setGridOptions(undefined, undefined).applyAttributesFinish();
        return;
      }), @Memo() (() => {
        GridItemImpl(@Memo() ((instance: GridItemAttribute): void => {
          instance.setGridItemOptions(undefined).selected(makeBindable(this.boo, ((value) => {
            this.boo = value;
          }))).applyAttributesFinish();
          return;
        }), @Memo() (() => {
          TextImpl(@Memo() ((instance: TextAttribute): void => {
            instance.setTextOptions("nihao", undefined).applyAttributesFinish();
            return;
          }), undefined);
        }));
        GridItemImpl(@Memo() ((instance: GridItemAttribute): void => {
          instance.setGridItemOptions(undefined).selected(makeBindable(CC.c, ((value) => {
            CC.c = value;
          }))).applyAttributesFinish();
          return;
        }), @Memo() (() => {
          TextImpl(@Memo() ((instance: TextAttribute): void => {
            instance.setTextOptions("nihao", undefined).applyAttributesFinish();
            return;
          }), undefined);
        }));
      }));
    }));
  }
  
  public constructor() {}

  static {
  
  }
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    MyStateSample._instantiateImpl(undefined, (() => {
      return new MyStateSample();
    }), undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_MyStateSample {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'boo', '(boolean | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_boo', '(IStateDecoratedVariable<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_boo', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test griditem bindable capability',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
