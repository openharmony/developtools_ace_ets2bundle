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
import { PluginTester } from '../../utils/plugin-tester';
import { mockBuildConfig } from '../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../utils/path-config';
import { parseDumpSrc } from '../../utils/parse-string';
import { uiNoRecheck, recheck } from '../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../utils/shared-types';
import { dumpConstructor } from '../../utils/simplify-dump';
import { uiTransform } from '../../../ui-plugins';
import { Plugins } from '../../../common/plugin-context';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, 'use-namespace.ets'),
];

const pluginTester = new PluginTester('test namespace usage', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTransform',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { RowAttribute as RowAttribute } from "arkui.component.row";

import { RowImpl as RowImpl } from "arkui.component.row";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, Row as Row } from "@ohos.arkui.component";

import { ns as ns } from "./export-namespace";

function main() {}

ns.ns_num;
@Component() final struct Index extends CustomComponent<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: Index)=> void), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {
    RowImpl(@Memo() ((instance: RowAttribute): void => {
      instance.setRowOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
  }
  
  ${dumpConstructor()}
  
}

@Component() export interface __Options_Index {
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test namespace usage',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
