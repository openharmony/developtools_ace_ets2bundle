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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'builder-param-passing.ets'),
];

const pluginTester = new PluginTester('test builder param variable passing', buildConfig);

const parsedTransform: Plugins = {
    name: 'builder-param-passing',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { __memo_id_type as __memo_id_type } from "@ohos.arkui.stateManagement";
import { __memo_context_type as __memo_context_type } from "@ohos.arkui.stateManagement";
import { memo as memo } from "@ohos.arkui.stateManagement";
import { UITextAttribute as UITextAttribute } from "@ohos.arkui.component";
import { UIColumnAttribute as UIColumnAttribute } from "@ohos.arkui.component";
import { CustomComponent as CustomComponent } from "@ohos.arkui.component";
import { Component as Component, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam, Column as Column, Text as Text } from "@ohos.arkui.component";

function main() {}

@Component({freezeWhenInactive:false}) final class Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: __Options_Child | undefined, @memo() content: (()=> void) | undefined): void {
    (this).__backing_customBuilderParam = ((((({let gensym___169376706 = initializers;
    (((gensym___169376706) == (null)) ? undefined : gensym___169376706.customBuilderParam)})) ?? (content))) ?? ((this).customBuilder))
  }
  
  public __updateStruct(initializers: __Options_Child | undefined): void {}
  
  private __backing_customBuilderParam?: @memo() (()=> void);
  
  public get customBuilderParam(): @memo() (()=> void) {
    return (this).__backing_customBuilderParam!;
  }
  
  public set customBuilderParam(@memo() value: (()=> void)) {
    (this).__backing_customBuilderParam = value;
  }
  
  @memo() public customBuilder() {}
  
  @memo() public _build(@memo() style: ((instance: Child)=> Child) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Child | undefined): void {
    (this).customBuilderParam();
  }
  
  public constructor() {}
  
}

@Component({freezeWhenInactive:false}) final class Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: __Options_Parent | undefined, @memo() content: (()=> void) | undefined): void {}
  
  public __updateStruct(initializers: __Options_Parent | undefined): void {}
  
  @memo() public componentBuilder() {
    Text(undefined, "Parent builder", undefined, undefined);
  }
  
  @memo() public _build(@memo() style: ((instance: Parent)=> Parent) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Parent | undefined): void {
    Column(undefined, undefined, (() => {
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), ({
        customBuilderParam: (this).componentBuilder,
      } as __Options_Child), undefined, undefined);
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), ({
        customBuilderParam: @memo() (() => {
          (this).componentBuilder();
        }),
      } as __Options_Child), undefined, undefined);
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), undefined, (() => {
        Text(undefined, "Parent builder", undefined, undefined);
      }), undefined);
    }));
  }
  public constructor() {}
}

interface __Options_Child {
  set customBuilderParam(customBuilderParam: @memo() (()=> void) | undefined)
  get customBuilderParam(): @memo() (()=> void) | undefined
}

interface __Options_Parent {
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test builder param variable passing',
    [parsedTransform, uiNoRecheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
