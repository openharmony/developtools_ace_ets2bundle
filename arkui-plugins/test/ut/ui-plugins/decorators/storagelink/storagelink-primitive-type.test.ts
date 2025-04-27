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

const STORAGELINK_DIR_PATH: string = 'decorators/storagelink';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STORAGELINK_DIR_PATH, 'storagelink-primitive-type.ets'),
];

const storageLinkTransform: Plugins = {
    name: 'storageLink',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test storagelink primitive type transform', buildConfig);

const expectedScript: string = `
import { __memo_id_type as __memo_id_type } from "@ohos.arkui.stateManagement";

import { __memo_context_type as __memo_context_type } from "@ohos.arkui.stateManagement";

import { memo as memo } from "@ohos.arkui.stateManagement";

import { StorageLinkDecoratedVariable as StorageLinkDecoratedVariable } from "@ohos.arkui.stateManagement";

import { EntryPoint as EntryPoint } from "@ohos.arkui.component";

import { CustomComponent as CustomComponent } from "@ohos.arkui.component";

import { Component as Component, Entry as Entry } from "@ohos.arkui.component";

import { StorageLink as StorageLink } from "@ohos.arkui.stateManagement";

function main() {}



@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final class MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo() content: (()=> void) | undefined): void {
    (this).__backing_numA = new StorageLinkDecoratedVariable<number>("Prop1", "numA", 33)
    (this).__backing_stringA = new StorageLinkDecoratedVariable<string>("Prop2", "stringA", "AA")
    (this).__backing_booleanA = new StorageLinkDecoratedVariable<boolean>("Prop3", "booleanA", true)
  }
  
  public __updateStruct(initializers: __Options_MyStateSample | undefined): void {}
  
  private __backing_numA?: StorageLinkDecoratedVariable<number>;
  
  public get numA(): number {
    return (this).__backing_numA!.get();
  }
  
  public set numA(value: number) {
    (this).__backing_numA!.set(value);
  }
  
  private __backing_stringA?: StorageLinkDecoratedVariable<string>;
  
  public get stringA(): string {
    return (this).__backing_stringA!.get();
  }
  
  public set stringA(value: string) {
    (this).__backing_stringA!.set(value);
  }
  
  private __backing_booleanA?: StorageLinkDecoratedVariable<boolean>;
  
  public get booleanA(): boolean {
    return (this).__backing_booleanA!.get();
  }
  
  public set booleanA(value: boolean) {
    (this).__backing_booleanA!.set(value);
  }
  
  @memo() public _build(@memo() style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {}
  
  public constructor() {}
  
}

interface __Options_MyStateSample {
  set numA(numA: number | undefined)
  
  get numA(): number | undefined
  set __backing_numA(__backing_numA: StorageLinkDecoratedVariable<number> | undefined)
  
  get __backing_numA(): StorageLinkDecoratedVariable<number> | undefined
  set stringA(stringA: string | undefined)
  
  get stringA(): string | undefined
  set __backing_stringA(__backing_stringA: StorageLinkDecoratedVariable<string> | undefined)
  
  get __backing_stringA(): StorageLinkDecoratedVariable<string> | undefined
  set booleanA(booleanA: boolean | undefined)
  
  get booleanA(): boolean | undefined
  set __backing_booleanA(__backing_booleanA: StorageLinkDecoratedVariable<boolean> | undefined)
  
  get __backing_booleanA(): StorageLinkDecoratedVariable<boolean> | undefined
  
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

function testStorageLinkTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test storagelink primitive type transform',
    [storageLinkTransform, uiNoRecheck],
    {
        checked: [testStorageLinkTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
