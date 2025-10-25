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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DOUBLE_DOLLAR_DIR_PATH, 'double-dollar-griditem.ets'),
];

const pluginTester = new PluginTester('test griditem bindable capability', buildConfig);

const parsedTransform: Plugins = {
    name: 'double-dollar-griditem',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { GridAttribute as GridAttribute } from "arkui.component.grid";

import { GridItemAttribute as GridItemAttribute } from "arkui.component.gridItem";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { Bindable as Bindable } from "arkui.component.common";

import { GridItemImpl as GridItemImpl } from "arkui.component.gridItem";

import { GridImpl as GridImpl } from "arkui.component.grid";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Text as Text, Entry as Entry, Column as Column, Component as Component, $$ as $$, Grid as Grid, GridItem as GridItem } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../double-dollar/double-dollar-griditem",
  pageFullPath: "test/demo/mock/double-dollar/double-dollar-griditem",
  integratedHsp: "false",
  } as NavInterface));
class CC {
  public static c: boolean = true;
  
  public constructor() {}
  
  static {
    
  }
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @memo() content: ((()=> void) | undefined)): void {
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
  
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: MyStateSample)=> void), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }

  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      GridImpl(@memo() ((instance: GridAttribute): void => {
        instance.setGridOptions(undefined, undefined).applyAttributesFinish();
        return;
      }), @memo() (() => {
        GridItemImpl(@memo() ((instance: GridItemAttribute): void => {
          instance.setGridItemOptions(undefined).selected(({
            value: this.boo,
            onChange: ((value: boolean) => {
              this.boo = value;
            }),
          } as Bindable<boolean>)).applyAttributesFinish();
          return;
        }), @memo() (() => {
          TextImpl(@memo() ((instance: TextAttribute): void => {
            instance.setTextOptions("nihao", undefined).applyAttributesFinish();
            return;
          }), undefined);
        }));
        GridItemImpl(@memo() ((instance: GridItemAttribute): void => {
          instance.setGridItemOptions(undefined).selected(({
            value: CC.c,
            onChange: ((value: boolean) => {
              CC.c = value;
            }),
          } as Bindable<boolean>)).applyAttributesFinish();
          return;
        }), @memo() (() => {
          TextImpl(@memo() ((instance: TextAttribute): void => {
            instance.setTextOptions("nihao", undefined).applyAttributesFinish();
            return;
          }), undefined);
        }));
      }));
    }));
  }
  
  ${dumpConstructor()}

}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_MyStateSample {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'boo', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_boo', '(IStateDecoratedVariable<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_boo', '(boolean | undefined)')}
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    MyStateSample._invoke(@memo() ((instance: MyStateSample): void => {
      instance.applyAttributesFinish();
      return;
    }), undefined, undefined, undefined, undefined);
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
