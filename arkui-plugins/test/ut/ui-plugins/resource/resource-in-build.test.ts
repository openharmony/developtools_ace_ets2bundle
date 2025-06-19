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

import { ImageAnimatorAttribute as ImageAnimatorAttribute } from "arkui.component.imageAnimator";

import { ImageAttribute as ImageAttribute } from "arkui.component.image";

import { _r as _r } from "arkui.component.resources";

import { LayoutCallback as LayoutCallback } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, $r as $r, $rawfile as $rawfile, Column as Column, Text as Text, Image as Image, TextInput as TextInput, Select as Select, SelectOption as SelectOption, Margin as Margin, ImageAnimator as ImageAnimator, Resource as Resource } from "@kit.ArkUI";

function main() {}



@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_str1 = ((({let gensym___147578113 = initializers;
    (((gensym___147578113) == (null)) ? undefined : gensym___147578113.str1)})) ?? ("app.media.ri"));
    this.__backing_str2 = ((({let gensym___220149772 = initializers;
    (((gensym___220149772) == (null)) ? undefined : gensym___220149772.str2)})) ?? ("app.photo2.png"));
    this.__backing_raw = ((({let gensym___241810043 = initializers;
    (((gensym___241810043) == (null)) ? undefined : gensym___241810043.raw)})) ?? ("app.photo.png"));
    this.__backing_tt = ((({let gensym___198287964 = initializers;
    (((gensym___198287964) == (null)) ? undefined : gensym___198287964.tt)})) ?? (["0", "1", "3", "5", "8"]));
  }
  
  public __updateStruct(initializers: __Options_MyStateSample | undefined): void {}
  
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
  
  private __backing_raw?: string;
  
  public get raw(): string {
    return (this.__backing_raw as string);
  }
  
  public set raw(value: string) {
    this.__backing_raw = value;
  }
  
  private __backing_tt?: Array<string>;
  
  public get tt(): Array<string> {
    return (this.__backing_tt as Array<string>);
  }
  
  public set tt(value: Array<string>) {
    this.__backing_tt = value;
  }
  
  public aboutToAppear() {
    let arr: Array<Resource> = new Array<Resource>();
    for (let i = 0;((i) < (5));(i++)) {
      arr.push(_r(125829791, 10003, "com.example.myapplication", "entry"));
    }
    for (let item of this.tt) {
      arr.push(_r(125829775, 10003, "com.example.myapplication", "entry"));
    }
  }
  
  @memo() public build() {
    Column(undefined, (() => {
      Text(undefined, $r("app.string.ohos_lab_microphone"));
      Column(undefined, (() => {
        Text(undefined, _r(125829694, 10003, "com.example.myapplication", "entry"));
        Text(undefined, _r(-1, -1, "com.example.myapplication", "entry", "sys.string".concat(".ohos_id_text_font_family_regular")));
        Image(undefined, _rawfile(-1, 30000, "com.example.myapplication", "entry", this.raw));
        TextInput(undefined, {
          text: _r(125829826, 10003, "com.example.myapplication", "entry"),
        });
        Text(undefined, _r(-1, -1, "com.example.myapplication", "entry", this.str1));
        Text(undefined, _r(-1, -1, "com.example.myapplication", "entry", this.str2));
        Select(undefined, new Array<SelectOption>({
          value: "aaa",
          icon: _r(125830397, 20000, "com.example.myapplication", "entry"),
        }, {
          value: "bbb",
          icon: _r(125830397, 20000, "com.example.myapplication", "entry"),
        }, {
          value: "ccc",
          icon: _r(125830397, 20000, "com.example.myapplication", "entry"),
        }, {
          value: "ddd",
          icon: _r(125830397, 20000, "com.example.myapplication", "entry"),
        }));
        Image(((instance: ImageAttribute): void => {
          instance.margin(({
            top: _r(125829369, 10002, "com.example.myapplication", "entry"),
            bottom: _r(125829370, 10002, "com.example.myapplication", "entry"),
          } as Margin));
          return;
        }), _r(125830087, 20000, "com.example.myapplication", "entry"));
        ImageAnimator(((instance: ImageAnimatorAttribute): void => {
          instance.images([{
            src: _r(125830087, 20000, "com.example.myapplication", "entry"),
          }, {
            src: _r(125830087, 20000, "com.example.myapplication", "entry"),
          }]);
          return;
        }));
      }));
    }));
  }
  
  private constructor() {}
  
}

@Component() export interface __Options_MyStateSample {
  set str1(str1: string | undefined)
  
  get str1(): string | undefined
  set str2(str2: string | undefined)
  
  get str2(): string | undefined
  set raw(raw: string | undefined)
  
  get raw(): string | undefined
  set tt(tt: Array<string> | undefined)
  
  get tt(): Array<string> | undefined
  
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
