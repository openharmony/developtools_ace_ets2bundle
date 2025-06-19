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

const BUILDER_LAMBDA_DIR_PATH: string = 'resource';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'resource-in-property.ets'),
];

const pluginTester = new PluginTester('test resource transform in property', buildConfig);

const parsedTransform: Plugins = {
    name: 'resource-in-property',
    parsed: uiTransform().parsed
};

const expectedScript: string = `

import { memo as memo } from "arkui.stateManagement.runtime";

import { _rawfile as _rawfile } from "arkui.component.resources";

import { _r as _r } from "arkui.component.resources";

import { LayoutCallback as LayoutCallback } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, $r as $r, $rawfile as $rawfile, Column as Column, Text as Text, Image as Image, Resource as Resource } from "@ohos.arkui.component";

let i: Resource;

function main() {}

i = _r(125830645, 40000, "com.example.myapplication", "entry");

@Component() final struct ResourceComponent extends CustomComponent<ResourceComponent, __Options_ResourceComponent> {
  public __initializeStruct(initializers: __Options_ResourceComponent | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_aa = ((({let gensym___248008024 = initializers;
    (((gensym___248008024) == (null)) ? undefined : gensym___248008024.aa)})) ?? ("app.photo.png"));
    this.__backing_str = ((({let gensym___249074315 = initializers;
    (((gensym___249074315) == (null)) ? undefined : gensym___249074315.str)})) ?? (_r(125829844, 10003, "com.example.myapplication", "entry")));
    this.__backing_icon = ((({let gensym___193492277 = initializers;
    (((gensym___193492277) == (null)) ? undefined : gensym___193492277.icon)})) ?? (_rawfile(-1, 30000, "com.example.myapplication", "entry", this.aa)));
  }
  
  public __updateStruct(initializers: __Options_ResourceComponent | undefined): void {}
  
  private __backing_aa?: string;
  
  public get aa(): string {
    return (this.__backing_aa as string);
  }
  
  public set aa(value: string) {
    this.__backing_aa = value;
  }
  
  private __backing_str?: Resource;
  
  public get str(): Resource {
    return (this.__backing_str as Resource);
  }
  
  public set str(value: Resource) {
    this.__backing_str = value;
  }
  
  private __backing_icon?: Resource;
  
  public get icon(): Resource {
    return (this.__backing_icon as Resource);
  }
  
  public set icon(value: Resource) {
    this.__backing_icon = value;
  }
  
  @memo() public build() {
    Column(undefined, (() => {
      Text(undefined, this.str);
      Text(undefined, i);
      Image(undefined, this.icon);
    }));
  }
  
  private constructor() {}
  
}

@Component() export interface __Options_ResourceComponent {
  set aa(aa: string | undefined)
  
  get aa(): string | undefined
  set str(str: Resource | undefined)
  
  get str(): Resource | undefined
  set icon(icon: Resource | undefined)
  
  get icon(): Resource | undefined
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test resource transform in property',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
