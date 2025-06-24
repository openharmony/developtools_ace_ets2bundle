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
import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";
import { IStorageLinkDecoratedVariable as IStorageLinkDecoratedVariable } from "arkui.stateManagement.decorator";
import { memo as memo } from "arkui.stateManagement.runtime";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { NavInterface as NavInterface } from "arkui.UserView";
import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";
import { EntryPoint as EntryPoint } from "arkui.UserView";
import { LayoutCallback as LayoutCallback } from "arkui.component.customComponent";
import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component, Entry as Entry, Column as Column, Text as Text, ClickEvent as ClickEvent } from "@ohos.arkui.component";
import { StorageLink as StorageLink, AppStorage as AppStorage } from "@ohos.arkui.stateManagement";

function main() {}

AppStorage.setOrCreate("PropA", 47, Type.from<number>());
AppStorage.setOrCreate("PropB", new Data(50), Type.from<Data>());

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/storagelink/storagelink-appstorage",
  pageFullPath: "test/demo/mock/decorators/storagelink/storagelink-appstorage",
  integratedHsp: "false",
  } as NavInterface));

class Data {
  public code: number;
  public constructor(code: number) {
    this.code = code;
  }
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct Index extends CustomComponent<Index, __Options_Index> implements PageLifeCycle {
  public __initializeStruct(initializers: __Options_Index | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_storageLink = STATE_MGMT_FACTORY.makeStorageLink<number>(this, "PropA", "storageLink", 1, Type.from<number>())
    this.__backing_storageLinkObject = STATE_MGMT_FACTORY.makeStorageLink<Data>(this, "PropB", "storageLinkObject", new Data(1), Type.from<Data>())
  }
  
  public __updateStruct(initializers: __Options_Index | undefined): void {}
  
  private __backing_storageLink?: IStorageLinkDecoratedVariable<number>;
  
  public get storageLink(): number {
    return this.__backing_storageLink!.get();
  }
  
  public set storageLink(value: number) {
    this.__backing_storageLink!.set(value);
  }
  
  private __backing_storageLinkObject?: IStorageLinkDecoratedVariable<Data>;
  
  public get storageLinkObject(): Data {
    return this.__backing_storageLinkObject!.get();
  }
  
  public set storageLinkObject(value: Data) {
    this.__backing_storageLinkObject!.set(value);
  }
  
  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      Text(@memo() ((instance: TextAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          this.storageLink += 1;
        }));
        return;
      }), \`From AppStorage \${this.storageLink}\`, undefined, undefined);
      Text(@memo() ((instance: TextAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          this.storageLinkObject.code += 1;
        }));
        return;
      }), \`From AppStorage \${this.storageLinkObject.code}\`, undefined, undefined);
    }));
  }
  
  private constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_Index {
  set storageLink(storageLink: number | undefined)
  get storageLink(): number | undefined
  set __backing_storageLink(__backing_storageLink: IStorageLinkDecoratedVariable<number> | undefined)
  get __backing_storageLink(): IStorageLinkDecoratedVariable<number> | undefined
  set storageLinkObject(storageLinkObject: Data | undefined)
  get storageLinkObject(): Data | undefined
  set __backing_storageLinkObject(__backing_storageLinkObject: IStorageLinkDecoratedVariable<Data> | undefined)
  get __backing_storageLinkObject(): IStorageLinkDecoratedVariable<Data> | undefined
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
    [storageLinkTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testStorageLinkTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
