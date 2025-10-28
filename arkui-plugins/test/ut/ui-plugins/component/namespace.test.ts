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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, COMPONENT_DIR_PATH, 'namespace.ets'),
];

const pluginTester = new PluginTester('test ForEach component transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'namespace',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";
import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";
import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";
import { Component as Component, Column as Column, Text as Text } from "@ohos.arkui.component";
import { State as State } from "@ohos.arkui.stateManagement";
@Component() final struct Main extends CustomComponent<Main, __Options_Main> {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Main, storage?: LocalStorage, @Builder() content?: (()=> void)): Main {
    throw new Error("Declare interface");
  }
  public build() {
    Column(){
      Text("123");
    };
    }
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
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
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() content?: (()=> void)): Child {
    throw new Error("Declare interface");
  }
    @State() public propVar: string = "Prop";
    public build() {
      Column(){
        Text("123");
      };
    }
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
      super(useSharedStorage, storage);
    }
    
    public static _buildCompatibleNode(options: __Options_Child): void {
      return;
    }
    
  }
  
  export namespace NS2 {
    let s1 = "hello"
    @Component() final struct NS2_struct extends CustomComponent<NS2_struct, __Options_NS2_struct> {
      @ComponentBuilder() public static $_invoke(initializers?: __Options_NS2_struct, storage?: LocalStorage, @Builder() content?: (()=> void)): NS2_struct {
        throw new Error("Declare interface");
      }
      public build() {
      Column(){
        Text("123");
      };
      }
      public constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
      super(useSharedStorage, storage);
      }
    }
    
    @Component() export interface __Options_NS2_struct {
      
    }
    
  }
  export namespace NS3 {
    let s2 = "world"
  }
  @Component() export interface __Options_Child {
    propVar?: string;@State() __backing_propVar?: string;__options_has_propVar?: boolean;
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
    [parsedTransform, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
    },
    {
        stopAfter: 'parsed',
        tracing: { externalSourceNames: ['arkui.component.namespace'] }
    }
);
