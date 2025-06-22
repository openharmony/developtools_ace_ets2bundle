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

const FUNCTION_DIR_PATH: string = 'entry/localstorage';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'storage.ets'),
];

const pluginTester = new PluginTester('test entry with only storage', buildConfig);

const parsedTransform: Plugins = {
    name: 'entry with storage',
    parsed: uiTransform().parsed,
};

const expectedScript: string = `

import { NavInterface as NavInterface } from "arkui.UserView";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.UserView";

import { LayoutCallback as LayoutCallback } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Entry as Entry } from "@ohos.arkui.component";

import { LocalStorage as LocalStorage } from "@ohos.arkui.stateManagement";

const myStorage: (()=> LocalStorage) = (() => new LocalStorage())
@Entry({storage:"myStorage"}) @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public build() {}
  
  public constructor() {
    super(false, myStorage());
  }
  
}

@Entry({storage:"myStorage"}) @Component() export interface __Options_MyStateSample {
  
}

class __EntryWrapper extends EntryPoint {
  public entry(): void {
    MyStateSample();
  }
  
  public constructor() {}
  
}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../entry/localstorage/storage",
  pageFullPath: "test/demo/mock/entry/localstorage/storage",
  integratedHsp: "false",
} as NavInterface))
`;

function testEntryStorageTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test entry with only storage',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'parsed': [testEntryStorageTransformer],
    },
    {
        stopAfter: 'parsed',
    }
);
