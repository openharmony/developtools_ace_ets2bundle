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
import { recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const FUNCTION_DIR_PATH: string = 'entry/route-name';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'route-name-storage-shared.ets'),
];

const pluginTester = new PluginTester('test entry with only routeName', buildConfig);

const parsedTransform: Plugins = {
    name: 'entry with routeName, storage, and useSharedStorage',
    parsed: uiTransform().parsed,
};

const expectedScript: string = `
import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, Entry as Entry } from "@ohos.arkui.component";

import { LocalStorage as LocalStorage } from "@ohos.arkui.stateManagement";

const myStorage: (()=> LocalStorage) = (() => new LocalStorage())
@Entry({routeName:"MyPage",storage:"myStorage",useSharedStorage:true}) @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  public build() {}
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
}

class __EntryWrapper extends EntryPoint {
  public entry(): void {
    MyStateSample();
  }

  public constructor() {}

}

__EntryWrapper.RegisterNamedRouter("MyPage", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../entry/route-name/route-name-storage-shared",
  pageFullPath: "test/demo/mock/entry/route-name/route-name-storage-shared",
  integratedHsp: "false",
} as NavInterface))

@Entry({routeName:"MyPage",storage:"myStorage",useSharedStorage:true}) @Component() export interface __Options_MyStateSample {
}
`;

function testEntryTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test entry with only routeName',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'parsed': [testEntryTransformer],
    },
    {
        stopAfter: 'parsed',
    }
);
