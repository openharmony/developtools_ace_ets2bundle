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
import { dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../../utils/simplify-dump';
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
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";
import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";
import { IStorageLinkDecoratedVariable as IStorageLinkDecoratedVariable } from "arkui.stateManagement.decorator";
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { Memo as Memo } from "arkui.incremental.annotation";
import { NavInterface as NavInterface } from "arkui.component.customComponent";
import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";
import { EntryPoint as EntryPoint } from "arkui.component.customComponent";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Builder as Builder } from "arkui.component.builder";
import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";
import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";
import { Component as Component, Entry as Entry, Column as Column, Text as Text, ClickEvent as ClickEvent } from "@ohos.arkui.component";
import { StorageLink as StorageLink, AppStorage as AppStorage } from "@ohos.arkui.stateManagement";

function main() {}

AppStorage.setOrCreate("PropA", 47);
AppStorage.setOrCreate("PropB", new Data(50));

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
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_storageLink = STATE_MGMT_FACTORY.makeStorageLink<number>(this, "PropA", "storageLink", 1)
    this.__backing_storageLinkObject = STATE_MGMT_FACTORY.makeStorageLink<Data>(this, "PropB", "storageLinkObject", new Data(1))
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
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

  @MemoIntrinsic() public static _invoke(style: @Memo() ((instance: Index)=> void), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  
  @Memo() public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`From AppStorage \${this.storageLink}\`, undefined).onClick(((e: ClickEvent) => {
          this.storageLink += 1;
        })).applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`From AppStorage \${this.storageLinkObject.code}\`, undefined).onClick(((e: ClickEvent) => {
          this.storageLinkObject.code += 1;
        })).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  ${dumpConstructor()}
  
}

class __EntryWrapper extends EntryPoint {
  @Memo() public entry(): void {
    Index._invoke(@Memo() ((instance: Index): void => {
      instance.applyAttributesFinish();
      return;
    }), undefined, undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_Index {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'storageLink', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_storageLink', '(IStorageLinkDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_storageLink', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'storageLinkObject', '(Data | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_storageLinkObject', '(IStorageLinkDecoratedVariable<Data> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_storageLinkObject', '(boolean | undefined)')}
  
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
