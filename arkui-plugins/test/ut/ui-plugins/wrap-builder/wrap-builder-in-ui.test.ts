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
import { uiNoRecheck, recheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const WRAP_BUILDER_DIR_PATH: string = 'wrap-builder';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, WRAP_BUILDER_DIR_PATH, 'wrap-builder-in-ui.ets'),
];

const pluginTester = new PluginTester('test wrap builder used in UI', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { LayoutCallback as LayoutCallback } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Text as Text, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder, Builder as Builder, Column as Column, ForEach as ForEach } from "@kit.ArkUI";

const globalBuilderArr: Array<WrappedBuilder<MyBuilderFuncType>> = [wrapBuilder(myBuilder), wrapBuilder(yourBuilder)];

function main() {}


@memo() function myBuilder(value: string, size: number) {
  Text(@memo() ((instance: TextAttribute): void => {
    instance.fontSize(size);
    return;
  }), value, undefined, undefined);
}

@memo() function yourBuilder(value: string, size: number) {
  Text(@memo() ((instance: TextAttribute): void => {
    instance.fontSize(size);
    return;
  }), value, undefined, undefined);
}


@memo() type MyBuilderFuncType = @Builder() ((value: string, size: number)=> void);

@Component() final struct ImportStruct extends CustomComponent<ImportStruct, __Options_ImportStruct> {
  public __initializeStruct(initializers: (__Options_ImportStruct | undefined), @memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_ImportStruct | undefined)): void {}
  
  @memo() public testBuilder() {
    ForEach(((): Array<WrappedBuilder<MyBuilderFuncType>> => {
      return globalBuilderArr;
    }), ((item: WrappedBuilder<MyBuilderFuncType>) => {
      item.builder("hello world", 39);
    }));
  }
  
  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      this.testBuilder();
    }));
  }
  
  private constructor() {}
  
}

@Component() export interface __Options_ImportStruct {
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test wrap builder init with @Builder function',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
