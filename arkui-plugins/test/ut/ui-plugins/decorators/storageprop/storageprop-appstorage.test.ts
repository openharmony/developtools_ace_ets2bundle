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
import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStoragePropRefDecoratedVariable as IStoragePropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { NavInterface as NavInterface } from "arkui.UserView";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.UserView";

import { LayoutCallback as LayoutCallback } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Entry as Entry, Column as Column, Text as Text, ClickEvent as ClickEvent } from "@ohos.arkui.component";

import { StorageProp as StorageProp, AppStorage as AppStorage } from "@ohos.arkui.stateManagement";

function main() {}

AppStorage.setOrCreate("PropA", 47, Type.from<number>());
AppStorage.setOrCreate("PropB", new Data(50), Type.from<Data>());

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/storageprop/storageprop-appstorage",
  pageFullPath: "test/demo/mock/decorators/storageprop/storageprop-appstorage",
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
    this.__backing_storageProp = STATE_MGMT_FACTORY.makeStoragePropRef<number>(this, "PropA", "storageProp", 1, Type.from<number>())
    this.__backing_storagePropObject = STATE_MGMT_FACTORY.makeStoragePropRef<Data>(this, "PropB", "storagePropObject", new Data(1), Type.from<Data>())
  }
  
  public __updateStruct(initializers: __Options_Index | undefined): void {}
  
  private __backing_storageProp?: IStoragePropRefDecoratedVariable<number>;
  
  public get storageProp(): number {
    return this.__backing_storageProp!.get();
  }
  
  public set storageProp(value: number) {
    this.__backing_storageProp!.set(value);
  }
  
  private __backing_storagePropObject?: IStoragePropRefDecoratedVariable<Data>;
  
  public get storagePropObject(): Data {
    return this.__backing_storagePropObject!.get();
  }
  
  public set storagePropObject(value: Data) {
    this.__backing_storagePropObject!.set(value);
  }
  
  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      Text(@memo() ((instance: TextAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          this.storageProp += 1;
        }));
        return;
      }), \`From AppStorage \${this.storageProp}\`, undefined, undefined);
      Text(@memo() ((instance: TextAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          this.storagePropObject.code += 1;
        }));
        return;
      }), \`From AppStorage \${this.storagePropObject.code}\`, undefined, undefined);
    }));
  }
  
  private constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_Index {
  set storageProp(storageProp: number | undefined)
  
  get storageProp(): number | undefined
  set __backing_storageProp(__backing_storageProp: IStoragePropRefDecoratedVariable<number> | undefined)
  
  get __backing_storageProp(): IStoragePropRefDecoratedVariable<number> | undefined
  set storagePropObject(storagePropObject: Data | undefined)
  
  get storagePropObject(): Data | undefined
  set __backing_storagePropObject(__backing_storagePropObject: IStoragePropRefDecoratedVariable<Data> | undefined)
  
  get __backing_storagePropObject(): IStoragePropRefDecoratedVariable<Data> | undefined
  
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
    [storagePropTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testStoragePropTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
