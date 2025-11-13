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
import { beforeUINoRecheck, recheck, uiNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { ignoreNewLines } from '../../../utils/simplify-dump';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const COMPONENT_DIR_PATH: string = 'component';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, COMPONENT_DIR_PATH, 'namespace.ets'),
];

const pluginTester = new PluginTester('test ForEach component transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'namespace',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Column as Column, Text as Text } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

@Component() final struct Main extends CustomComponent<Main, __Options_Main> {
  public build() {
    Column(){
      Text("123");
    };
  }
  
  public constructor() {}
}

export namespace NS1 {
  let y1 = foo()
  export function foo() {
    return 1;
  }
  
  let x1 = foo()
  export class C {
    public static z1 = "z1";
    public constructor() {}
    
  }
  
  @Component() export final struct Child extends CustomComponent<Child, __Options_Child> {
    @State() public propVar: string = "Prop";
    public build() {
      Column(){
        Text("123");
      };
    }
    
    public constructor() {}

    public static _buildCompatibleNode(options: __Options_Child): void {
      return;
    }
  }
  
  export namespace NS2 {
    let s1 = "hello"
    @Component() final struct NS2_struct extends CustomComponent<NS2_struct, __Options_NS2_struct> {
      public build() {
        Column(){
          Text("123");
        };
      }
      
      public constructor() {}
    }
    
    @Component() export interface __Options_NS2_struct {
      
    }
    
  }
  export namespace NS3 {
    let s2 = "world"
  }
  @Component() export interface __Options_Child {
    ${ignoreNewLines(`
    @State() propVar?: string;
    @State() __backing_propVar?: string;
    __options_has_propVar?: boolean;

    `)}
  }
  
}
@Component() export interface __Options_Main {
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test namespace component transformation',
    [parsedTransform],
    {
        'parsed': [testParsedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
