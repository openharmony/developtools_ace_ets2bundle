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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STORAGEPROP_DIR_PATH, 'storageprop-appstorage.ets'),
];

const storagePropTransform: Plugins = {
    name: 'storageprop',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test storageprop with appstorage', buildConfig);

const expectedScript: string = `
import { StoragePropDecoratedVariable as StoragePropDecoratedVariable } from "arkui.stateManagement.decorators.decoratorStorageProp";
import { memo as memo } from "arkui.stateManagement.runtime";
import { UITextAttribute as UITextAttribute } from "arkui.component.text";
import { EntryPoint as EntryPoint } from "arkui.UserView";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component, Entry as Entry, Column as Column, Text as Text, ClickEvent as ClickEvent } from "@ohos.arkui.component";
import { StorageProp as StorageProp, AppStorage as AppStorage } from "@ohos.arkui.stateManagement";

function main() {}

AppStorage.setOrCreate("PropA", 47);
AppStorage.setOrCreate("PropB", new Data(50));

class Data {
  public code: number;
  
  public constructor(code: number) {
    this.code = code;
  }
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final class Index extends CustomComponent<Index, __Options_Index> {
  public __initializeStruct(initializers: __Options_Index | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_storageProp = new StoragePropDecoratedVariable<number>("PropA", "storageProp", 1)
    this.__backing_storagePropObject = new StoragePropDecoratedVariable<Data>("PropB", "storagePropObject", new Data(1))
  }
  
  public __updateStruct(initializers: __Options_Index | undefined): void {}
  
  private __backing_storageProp?: StoragePropDecoratedVariable<number>;
  
  public get storageProp(): number {
    return this.__backing_storageProp!.get();
  }
  
  public set storageProp(value: number) {
    this.__backing_storageProp!.set(value);
  }
  
  private __backing_storagePropObject?: StoragePropDecoratedVariable<Data>;
  
  public get storagePropObject(): Data {
    return this.__backing_storagePropObject!.get();
  }
  
  public set storagePropObject(value: Data) {
    this.__backing_storagePropObject!.set(value);
  }
  
  @memo() public _build(@memo() style: ((instance: Index)=> Index) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Index | undefined): void {
    Column(undefined, (() => {
      Text(@memo() ((instance: UITextAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          this.storageProp += 1;
        }));
        return;
      }), \`From AppStorage \${this.storageProp}\`);
      Text(@memo() ((instance: UITextAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          this.storagePropObject.code += 1;
        }));
        return;
      }), \`From AppStorage \${this.storagePropObject.code}\`);
    }));
  }
  
  private constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) export interface __Options_Index {
  set storageProp(storageProp: number | undefined)
  
  get storageProp(): number | undefined
  set __backing_storageProp(__backing_storageProp: StoragePropDecoratedVariable<number> | undefined)
  
  get __backing_storageProp(): StoragePropDecoratedVariable<number> | undefined
  set storagePropObject(storagePropObject: Data | undefined)
  
  get storagePropObject(): Data | undefined
  set __backing_storagePropObject(__backing_storagePropObject: StoragePropDecoratedVariable<Data> | undefined)
  
  get __backing_storagePropObject(): StoragePropDecoratedVariable<Data> | undefined
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    Index._instantiateImpl(undefined, (() => {
      return new Index();
    }));
  }
  
  public constructor() {}
  
}

`;

function testStoragePropTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test storageprop with appstorage',
    [storagePropTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testStoragePropTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
