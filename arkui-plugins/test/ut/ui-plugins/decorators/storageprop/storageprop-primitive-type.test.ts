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
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STORAGEPROP_DIR_PATH: string = 'decorators/storageprop';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STORAGEPROP_DIR_PATH, 'storageprop-primitive-type.ets'),
];

const storagePropTransform: Plugins = {
    name: 'storageprop',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test storageprop primitive type transform', buildConfig);

const expectedScript: string = `

import { memo as memo } from "arkui.stateManagement.runtime";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStoragePropDecoratedVariable as IStoragePropDecoratedVariable } from "arkui.stateManagement.decorator";

import { NavInterface as NavInterface } from "arkui.UserView";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.UserView";

import { LayoutCallback as LayoutCallback } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Entry as Entry } from "@ohos.arkui.component";

import { StorageProp as StorageProp } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/storageprop/storageprop-primitive-type",
  pageFullPath: "test/demo/mock/decorators/storageprop/storageprop-primitive-type",
  integratedHsp: "false",
  } as NavInterface));

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_numB = STATE_MGMT_FACTORY.makeStorageProp<number>(this, "Prop1", "numB", 43)
    this.__backing_stringB = STATE_MGMT_FACTORY.makeStorageProp<string>(this, "Prop2", "stringB", "BB")
    this.__backing_booleanB = STATE_MGMT_FACTORY.makeStorageProp<boolean>(this, "Prop3", "booleanB", false)
  }
  
  public __updateStruct(initializers: __Options_MyStateSample | undefined): void {}
  
  private __backing_numB?: IStoragePropDecoratedVariable<number>;
  
  public get numB(): number {
    return this.__backing_numB!.get();
  }
  
  public set numB(value: number) {
    this.__backing_numB!.set(value);
  }
  
  private __backing_stringB?: IStoragePropDecoratedVariable<string>;
  
  public get stringB(): string {
    return this.__backing_stringB!.get();
  }
  
  public set stringB(value: string) {
    this.__backing_stringB!.set(value);
  }
  
  private __backing_booleanB?: IStoragePropDecoratedVariable<boolean>;
  
  public get booleanB(): boolean {
    return this.__backing_booleanB!.get();
  }
  
  public set booleanB(value: boolean) {
    this.__backing_booleanB!.set(value);
  }
  
  @memo() public build() {}
  
  private constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_MyStateSample {
  set numB(numB: number | undefined)
  
  get numB(): number | undefined
  set __backing_numB(__backing_numB: IStoragePropDecoratedVariable<number> | undefined)
  
  get __backing_numB(): IStoragePropDecoratedVariable<number> | undefined
  set stringB(stringB: string | undefined)
  
  get stringB(): string | undefined
  set __backing_stringB(__backing_stringB: IStoragePropDecoratedVariable<string> | undefined)
  
  get __backing_stringB(): IStoragePropDecoratedVariable<string> | undefined
  set booleanB(booleanB: boolean | undefined)
  
  get booleanB(): boolean | undefined
  set __backing_booleanB(__backing_booleanB: IStoragePropDecoratedVariable<boolean> | undefined)
  
  get __backing_booleanB(): IStoragePropDecoratedVariable<boolean> | undefined
  
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

function testStoragePropTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test storageprop primitive type transform',
    [storagePropTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testStoragePropTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
