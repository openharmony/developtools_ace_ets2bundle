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

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/resource';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'resource-in-build.ets'),
];

const pluginTester = new PluginTester('test resource transform in build method', buildConfig);

const parsedTransform: Plugins = {
    name: 'resource-in-build',
    parsed: uiTransform().parsed,
};

const expectedScript: string = `

import { memo as memo } from "arkui.stateManagement.runtime";

import { _rawfile as _rawfile } from "arkui.component.resources";

import { _r as _r } from "arkui.component.resources";

import { ImageAnimatorAttribute as ImageAnimatorAttribute } from "arkui.component.imageAnimator";

import { ImageAttribute as ImageAttribute } from "arkui.component.image";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, $r as $r, $rawfile as $rawfile, Column as Column, Text as Text, Image as Image, TextInput as TextInput, Select as Select, SelectOption as SelectOption, Margin as Margin, ImageAnimator as ImageAnimator } from "@ohos.arkui.component";

function main() {}



@Component({freezeWhenInactive:false}) final struct ResourceComponent extends CustomComponent<ResourceComponent, __Options_ResourceComponent> {
  public __initializeStruct(initializers: __Options_ResourceComponent | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_str1 = ((({let gensym___147578113 = initializers;
    (((gensym___147578113) == (null)) ? undefined : gensym___147578113.str1)})) ?? ("app.media.ri"));
    this.__backing_str2 = ((({let gensym___220149772 = initializers;
    (((gensym___220149772) == (null)) ? undefined : gensym___220149772.str2)})) ?? ("app.photo2.png"));
  }
  
  public __updateStruct(initializers: __Options_ResourceComponent | undefined): void {}
  
  private __backing_str1?: string;
  
  public get str1(): string {
    return (this.__backing_str1 as string);
  }
  
  public set str1(value: string) {
    this.__backing_str1 = value;
  }
  
  private __backing_str2?: string;
  
  public get str2(): string {
    return (this.__backing_str2 as string);
  }
  
  public set str2(value: string) {
    this.__backing_str2 = value;
  }
  
  @memo() public _build(@memo() style: ((instance: ResourceComponent)=> ResourceComponent) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_ResourceComponent | undefined): void {
    Column(undefined, (() => {
      Text(undefined, _r("", "", "app.string.app_name"));
      Image(undefined, _rawfile("", "", "app.photo.png"));
      TextInput(undefined, {
        text: _r("", "", "app.string.input_content"),
      });
      Text(undefined, _r("", "", this.str1));
      Text(undefined, _r("", "", this.str2));
      Select(undefined, new Array<SelectOption>({
        value: "aaa",
        icon: _r("", "", "app.media.selection"),
      }, {
        value: "bbb",
        icon: _r("", "", "app.media.selection"),
      }, {
        value: "ccc",
        icon: _r("", "", "app.media.selection"),
      }, {
        value: "ddd",
        icon: _r("", "", "app.media.selection"),
      }));
      Image(((instance: ImageAttribute): void => {
        instance.margin(({
          top: _r("", "", "app.float.elements_margin_horizontal_m"),
          bottom: _r("", "", "app.float.elements_margin_horizontal_l"),
        } as Margin));
        return;
      }), _r("", "", "app.media.app_icon"));
      ImageAnimator(((instance: ImageAnimatorAttribute): void => {
        instance.images([{
          src: _r("", "", "app.media.aaa"),
        }, {
          src: _r("", "", "app.media.bbb"),
        }]);
        return;
      }));
    }));
  }
  
  private constructor() {}
  
}

@Component({freezeWhenInactive:false}) export interface __Options_ResourceComponent {
  set str1(str1: string | undefined)
  
  get str1(): string | undefined
  set str2(str2: string | undefined)
  
  get str2(): string | undefined
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test resource transform in build method',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
