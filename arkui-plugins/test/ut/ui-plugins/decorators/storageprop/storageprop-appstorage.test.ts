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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STORAGEPROP_DIR_PATH, 'storageprop-appstorage.ets'),
];

const storagePropTransform: Plugins = {
    name: 'storageprop',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test storageprop with appstorage', buildConfig);

const expectedScript: string = `
import { __memo_id_type as __memo_id_type } from "@ohos.arkui.stateManagement";

import { __memo_context_type as __memo_context_type } from "@ohos.arkui.stateManagement";

import { memo as memo } from "@ohos.arkui.stateManagement";

import { StoragePropDecoratedVariable as StoragePropDecoratedVariable } from "@ohos.arkui.stateManagement";

import { UITextAttribute as UITextAttribute } from "@ohos.arkui.component";

import { UIColumnAttribute as UIColumnAttribute } from "@ohos.arkui.component";

import { EntryPoint as EntryPoint } from "@ohos.arkui.component";

import { CustomComponent as CustomComponent } from "@ohos.arkui.component";

import { Component as Component, Entry as Entry, Column as Column, Text as Text, ClickEvent as ClickEvent } from "@ohos.arkui.component";

import { StorageProp as StorageProp, AppStorage as AppStorage } from "@ohos.arkui.stateManagement";

function main() {}

AppStorage.setOrCreate("PropA", 47);
AppStorage.setOrCreate("PropB", new Data(50));

class Data {
  public code: number;
  
  public constructor(code: number) {
    (this).code = code;
  }
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final class Index extends CustomComponent<Index, __Options_Index> {
  public __initializeStruct(initializers: __Options_Index | undefined, @memo() content: (()=> void) | undefined): void {
    (this).__backing_storageProp = new StoragePropDecoratedVariable<number>("PropA", "storageProp", 1)
    (this).__backing_storagePropObject = new StoragePropDecoratedVariable<Data>("PropB", "storagePropObject", new Data(1))
  }
  
  public __updateStruct(initializers: __Options_Index | undefined): void {}
  
  private __backing_storageProp?: StoragePropDecoratedVariable<number>;
  
  public get storageProp(): number {
    return (this).__backing_storageProp!.get();
  }
  
  public set storageProp(value: number) {
    (this).__backing_storageProp!.set(value);
  }
  
  private __backing_storagePropObject?: StoragePropDecoratedVariable<Data>;
  
  public get storagePropObject(): Data {
    return (this).__backing_storagePropObject!.get();
  }
  
  public set storagePropObject(value: Data) {
    (this).__backing_storagePropObject!.set(value);
  }
  
  @memo() public _build(@memo() style: ((instance: Index)=> Index) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Index | undefined): void {
    Column(undefined, undefined, (() => {
      Text(@memo() ((instance: UITextAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          (this).storageProp += 1;
        }));
        return;
      }), \`From AppStorage \${(this).storageProp}\`, undefined, undefined);
      Text(@memo() ((instance: UITextAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          (this).storagePropObject.code += 1;
        }));
        return;
      }), \`From AppStorage \${(this).storagePropObject.code}\`, undefined, undefined);
    }));
  }
  
  public constructor() {}
  
}

interface __Options_Index {
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
    }), undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

`;

function testStoragePropTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test storageprop with appstorage',
    [storagePropTransform, uiNoRecheck],
    {
        checked: [testStoragePropTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
