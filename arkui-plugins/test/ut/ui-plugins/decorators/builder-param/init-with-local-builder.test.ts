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

const FUNCTION_DIR_PATH: string = 'decorators/builder-param';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'init-with-local-builder.ets'),
];

const pluginTester = new PluginTester('test builder param init with local builder', buildConfig);

const parsedTransform: Plugins = {
    name: 'init-with-local-builder',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { __memo_id_type as __memo_id_type } from "@ohos.arkui.stateManagement";
import { __memo_context_type as __memo_context_type } from "@ohos.arkui.stateManagement";
import { memo as memo } from "@ohos.arkui.stateManagement";
import { CustomComponent as CustomComponent } from "@ohos.arkui.component";
import { Component as Component, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";

function main() {}

@Component({freezeWhenInactive:false}) final class Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: __Options_Child | undefined, @memo() content: (()=> void) | undefined): void {
    (this).__backing_customBuilderParam = ((((({let gensym___169376706 = initializers;
    (((gensym___169376706) == (null)) ? undefined : gensym___169376706.customBuilderParam)})) ?? (content))) ?? ((this).doNothingBuilder))
    (this).__backing_customBuilderParam2 = ((((({let gensym___14041256 = initializers;
    (((gensym___14041256) == (null)) ? undefined : gensym___14041256.customBuilderParam2)})) ?? (content))) ?? ((this).doNothingBuilder2))
  }
  public __updateStruct(initializers: __Options_Child | undefined): void {}
  private __backing_customBuilderParam?: @memo() (()=> void);
  public get customBuilderParam(): @memo() (()=> void) {
    return (this).__backing_customBuilderParam!;
  }
  public set customBuilderParam(@memo() value: (()=> void)) {
    (this).__backing_customBuilderParam = value;
  }
  private __backing_customBuilderParam2?: @memo() ((str: string)=> void);
  public get customBuilderParam2(): @memo() ((str: string)=> void) {
    return (this).__backing_customBuilderParam2!;
  }
  public set customBuilderParam2(@memo() value: ((str: string)=> void)) {
    (this).__backing_customBuilderParam2 = value;
  }
  @memo() public doNothingBuilder() {}
  @memo() public doNothingBuilder2(str: string) {}
  @memo() public _build(@memo() style: ((instance: Child)=> Child) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Child | undefined): void {
    (this).customBuilderParam();
    (this).customBuilderParam2("hello");
  }
  public constructor() {}
}

interface __Options_Child {
  set customBuilderParam(customBuilderParam: @memo() (()=> void) | undefined)
  get customBuilderParam(): @memo() (()=> void) | undefined
  set customBuilderParam2(customBuilderParam2: @memo() ((str: string)=> void) | undefined)
  get customBuilderParam2(): @memo() ((str: string)=> void) | undefined
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test builder param init with local builder',
    [parsedTransform, uiNoRecheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
