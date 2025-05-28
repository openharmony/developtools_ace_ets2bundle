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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STORAGELINK_DIR_PATH, 'storagelink-appstorage.ets'),
];

const storageLinkTransform: Plugins = {
    name: 'storageLink',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test storagelink with appstorage', buildConfig);

const expectedScript: string = `
import { __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";

import { __memo_context_type as __memo_context_type } from "arkui.stateManagement.runtime";

import { memo as memo } from "arkui.stateManagement.runtime";

import { StorageLinkDecoratedVariable as StorageLinkDecoratedVariable } from "@ohos.arkui.stateManagement";

import { UITextAttribute as UITextAttribute } from "@ohos.arkui.component";

import { UIColumnAttribute as UIColumnAttribute } from "@ohos.arkui.component";

import { EntryPoint as EntryPoint } from "arkui.UserView";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Entry as Entry, Column as Column, Text as Text, ClickEvent as ClickEvent } from "@ohos.arkui.component";

import { StorageLink as StorageLink, AppStorage as AppStorage } from "@ohos.arkui.stateManagement";

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
    (this).__backing_storageLink = new StorageLinkDecoratedVariable<number>("PropA", "storageLink", 1)
    (this).__backing_storageLinkObject = new StorageLinkDecoratedVariable<Data>("PropB", "storageLinkObject", new Data(1))
  }
  
  public __updateStruct(initializers: __Options_Index | undefined): void {}
  
  private __backing_storageLink?: StorageLinkDecoratedVariable<number>;
  
  public get storageLink(): number {
    return (this).__backing_storageLink!.get();
  }
  
  public set storageLink(value: number) {
    (this).__backing_storageLink!.set(value);
  }
  
  private __backing_storageLinkObject?: StorageLinkDecoratedVariable<Data>;
  
  public get storageLinkObject(): Data {
    return (this).__backing_storageLinkObject!.get();
  }
  
  public set storageLinkObject(value: Data) {
    (this).__backing_storageLinkObject!.set(value);
  }
  
  @memo() public _build(@memo() style: ((instance: Index)=> Index) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Index | undefined): void {
    Column(undefined, undefined, (() => {
      Text(@memo() ((instance: UITextAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          (this).storageLink += 1;
        }));
        return;
      }), \`From AppStorage \${(this).storageLink}\`, undefined, undefined);
      Text(@memo() ((instance: UITextAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          (this).storageLinkObject.code += 1;
        }));
        return;
      }), \`From AppStorage \${(this).storageLinkObject.code}\`, undefined, undefined);
    }));
  }
  
  public constructor() {}
  
}

interface __Options_Index {
  set storageLink(storageLink: number | undefined)
  
  get storageLink(): number | undefined
  set __backing_storageLink(__backing_storageLink: StorageLinkDecoratedVariable<number> | undefined)
  
  get __backing_storageLink(): StorageLinkDecoratedVariable<number> | undefined
  set storageLinkObject(storageLinkObject: Data | undefined)
  
  get storageLinkObject(): Data | undefined
  set __backing_storageLinkObject(__backing_storageLinkObject: StorageLinkDecoratedVariable<Data> | undefined)
  
  get __backing_storageLinkObject(): StorageLinkDecoratedVariable<Data> | undefined
  
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

function testStorageLinkTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test storagelink with appstorage',
    [storageLinkTransform, uiNoRecheck],
    {
        checked: [testStorageLinkTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
