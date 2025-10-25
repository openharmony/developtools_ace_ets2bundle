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
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { recheck, uiNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';
import { dumpConstructor } from '../../../utils/simplify-dump';

const IMPORT_DIR_PATH: string = 'imports';
const IMPORT_UTILS_DIR_PATH: string = 'imports/utils';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, IMPORT_DIR_PATH, 'import-struct.ets'),
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, IMPORT_UTILS_DIR_PATH, 'simple-struct.ets')
];

const importParsed: Plugins = {
    name: 'import-parsed',
    parsed: uiTransform().parsed,
};

const pluginTester = new PluginTester('test import transform', buildConfig);

const expectedParsedScript: string = `
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component, Text as Text } from "@ohos.arkui.component";

import { SimpleStruct as SimpleStruct } from "./utils/simple-struct";

@Component() final struct ImportStruct extends CustomComponent<ImportStruct, __Options_ImportStruct> {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_ImportStruct, storage?: LocalStorage, @Builder() content?: (()=> void)): ImportStruct {
    throw new Error("Declare interface");
  }

  public build() {
    SimpleStruct();
    SimpleStruct({
      message: "str1",
    });
    SimpleStruct(){
      Text("a");
    };
  }

  public constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

}

@Component() export interface __Options_ImportStruct {

}
`;

const expectedCheckedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component, Text as Text } from "@ohos.arkui.component";

import { SimpleStruct as SimpleStruct } from "./utils/simple-struct";

function main() {}

@Component() final struct ImportStruct extends CustomComponent<ImportStruct, __Options_ImportStruct> {
  public __initializeStruct(initializers: (__Options_ImportStruct | undefined), @memo() content: ((()=> void) | undefined)): void {}

  public __updateStruct(initializers: (__Options_ImportStruct | undefined)): void {}

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: ImportStruct)=> void), initializers: ((()=> __Options_ImportStruct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<ImportStruct, __Options_ImportStruct>(style, ((): ImportStruct => {
      return new ImportStruct(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_ImportStruct, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): ImportStruct {
    throw new Error("Declare interface");
  }
  
  @memo() public build() {
    SimpleStruct._invoke(@memo() ((instance: SimpleStruct): void => {
      instance.applyAttributesFinish();
      return;
    }), undefined, undefined, undefined, undefined);
    SimpleStruct._invoke(@memo() ((instance: SimpleStruct): void => {
      instance.applyAttributesFinish();
      return;
    }), (() => {
      return {
        message: "str1",
        __options_has_message: true,
      };
    }), undefined, undefined, undefined);
    SimpleStruct._invoke(@memo() ((instance: SimpleStruct): void => {
      instance.applyAttributesFinish();
      return;
    }), undefined, undefined, undefined, @memo() (() => {
      TextImpl(@memo() ((instance: TextAttribute): void => {
        instance.setTextOptions("a", undefined).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  ${dumpConstructor()}

}

@Component() export interface __Options_ImportStruct {

}
`;

function testImportParsed(this: PluginTestContext): void {
    expect(parseDumpSrc(this?.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testImportChecked(this: PluginTestContext): void {
    expect(parseDumpSrc(this?.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test import struct from another file',
    [importParsed, uiNoRecheck, recheck],
    {
        'parsed:import-struct': [testImportParsed],
        'checked:ui-no-recheck:import-struct': [testImportChecked],
    },
    {
        stopAfter: 'checked',
    }
);
