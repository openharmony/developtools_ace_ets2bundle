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
import { __memo_id_type as __memo_id_type } from "@ohos.arkui.stateManagement";

import { __memo_context_type as __memo_context_type } from "@ohos.arkui.stateManagement";

import { memo as memo } from "@ohos.arkui.stateManagement";

import { StoragePropDecoratedVariable as StoragePropDecoratedVariable } from "@ohos.arkui.stateManagement";

import { EntryPoint as EntryPoint } from "@ohos.arkui.component";

import { CustomComponent as CustomComponent } from "@ohos.arkui.component";

import { Component as Component, Entry as Entry } from "@ohos.arkui.component";

import { StorageProp as StorageProp } from "@ohos.arkui.stateManagement";

function main() {}



@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final class MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo() content: (()=> void) | undefined): void {
    (this).__backing_numB = new StoragePropDecoratedVariable<number>("Prop1", "numB", 43)
    (this).__backing_stringB = new StoragePropDecoratedVariable<string>("Prop2", "stringB", "BB")
    (this).__backing_booleanB = new StoragePropDecoratedVariable<boolean>("Prop3", "booleanB", false)
  }
  
  public __updateStruct(initializers: __Options_MyStateSample | undefined): void {}
  
  private __backing_numB?: StoragePropDecoratedVariable<number>;
  
  public get numB(): number {
    return (this).__backing_numB!.get();
  }
  
  public set numB(value: number) {
    (this).__backing_numB!.set(value);
  }
  
  private __backing_stringB?: StoragePropDecoratedVariable<string>;
  
  public get stringB(): string {
    return (this).__backing_stringB!.get();
  }
  
  public set stringB(value: string) {
    (this).__backing_stringB!.set(value);
  }
  
  private __backing_booleanB?: StoragePropDecoratedVariable<boolean>;
  
  public get booleanB(): boolean {
    return (this).__backing_booleanB!.get();
  }
  
  public set booleanB(value: boolean) {
    (this).__backing_booleanB!.set(value);
  }
  
  @memo() public _build(@memo() style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {}
  
  public constructor() {}
  
}

interface __Options_MyStateSample {
  set numB(numB: number | undefined)
  
  get numB(): number | undefined
  set __backing_numB(__backing_numB: StoragePropDecoratedVariable<number> | undefined)
  
  get __backing_numB(): StoragePropDecoratedVariable<number> | undefined
  set stringB(stringB: string | undefined)
  
  get stringB(): string | undefined
  set __backing_stringB(__backing_stringB: StoragePropDecoratedVariable<string> | undefined)
  
  get __backing_stringB(): StoragePropDecoratedVariable<string> | undefined
  set booleanB(booleanB: boolean | undefined)
  
  get booleanB(): boolean | undefined
  set __backing_booleanB(__backing_booleanB: StoragePropDecoratedVariable<boolean> | undefined)
  
  get __backing_booleanB(): StoragePropDecoratedVariable<boolean> | undefined
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    MyStateSample._instantiateImpl(undefined, (() => {
      return new MyStateSample();
    }), undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}
`;

function testStoragePropTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test storageprop primitive type transform',
    [storagePropTransform, uiNoRecheck],
    {
        checked: [testStoragePropTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
