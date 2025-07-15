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

const COMPONENT_DIR_PATH: string = 'component';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, COMPONENT_DIR_PATH, 'for-each.ets'),
];

const pluginTester = new PluginTester('test ForEach component transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'for-each',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Text as Text, WrappedBuilder as WrappedBuilder, Column as Column, ForEach as ForEach } from "@kit.ArkUI";

function main() {}

interface Person {
  set name(name: string)
  
  get name(): string
  set age(age: number)
  
  get age(): number
  
}

class AB {
  public per: string = "hello";
  
  public bar: Array<string> = new Array<string>("xx", "yy", "zz");
  
  public constructor() {}
  
}

@Component() final struct ImportStruct extends CustomComponent<ImportStruct, __Options_ImportStruct> {
  public __initializeStruct(initializers: (__Options_ImportStruct | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_arr = ((({let gensym___244068973 = initializers;
    (((gensym___244068973) == (null)) ? undefined : gensym___244068973.arr)})) ?? (["a", "b", "c"]));
  }
  
  public __updateStruct(initializers: (__Options_ImportStruct | undefined)): void {}
  
  private __backing_arr?: Array<string>;
  
  public get arr(): Array<string> {
    return (this.__backing_arr as Array<string>);
  }
  
  public set arr(value: Array<string>) {
    this.__backing_arr = value;
  }
  
  public getArray() {
    return new Array<Person>(({
      name: "LiHua",
      age: 25,
    } as Person), ({
      name: "Amy",
      age: 18,
    } as Person));
  }
  
  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      ForEach(((): Array<string> => {
        return this.arr;
      }), ((item: string) => {
        Text(undefined, item, undefined, undefined);
      }));
      ForEach(((): Array<Person> => {
        return this.getArray();
      }), ((item: Person) => {
        Text(undefined, item.name, undefined, undefined);
      }));
      ForEach(((): Array<string> => {
        return new AB().bar;
      }), ((item: string) => {
        Text(undefined, item, undefined, undefined);
      }));
    }));
  }
  
  private constructor() {}
  
}

@Component() export interface __Options_ImportStruct {
  set arr(arr: (Array<string> | undefined))
  
  get arr(): (Array<string> | undefined)
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test ForEach component transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
