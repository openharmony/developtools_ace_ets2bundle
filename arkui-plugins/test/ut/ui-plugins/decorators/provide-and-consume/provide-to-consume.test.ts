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
import { recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/provide-and-consume';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'provide-to-consume.ets'),
];

const pluginTester = new PluginTester('test usage of @Provide and @Consume decorator', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedParsedScript: string = `
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Column as Column, Text as Text } from "@ohos.arkui.component";

import { Consume as Consume, Provide as Provide } from "@ohos.arkui.stateManagement";

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  @Consume() public num!: number;
  
  @Consume({value:"ss"}) public str!: string;
  
  public build() {
    Column(){
      Text(\`Child num: \${this.num}\`);
      Text(\`Child str: \${this.str}\`);
    };
  }
  
  public constructor() {}
  
}

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  @Provide({alias:"num"}) public num: number = 10;
  
  @Provide({alias:"ss"}) public str: string = "hello";
  
  public build() {
    Column(){
      Text(\`Parent num: \${this.num}\`);
      Text(\`Parent str: \${this.str}\`);
      Child();
    };
  }
  
  public constructor() {}
  
}

@Component() export interface __Options_Child {
  num?: number;
  @Consume() __backing_num?: number;
  str?: string;
  @Consume({value:"ss"}) __backing_str?: string;
  
}

@Component() export interface __Options_Parent {
  num?: number;
  @Provide({alias:"num"}) __backing_num?: number;
  str?: string;
  @Provide({alias:"ss"}) __backing_str?: string;
  
}
`;

const expectedCheckedScript: string = `
import { IProvideDecoratedVariable as IProvideDecoratedVariable } from "arkui.stateManagement.decorator";

import { IConsumeDecoratedVariable as IConsumeDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Column as Column, Text as Text } from "@ohos.arkui.component";

import { Consume as Consume, Provide as Provide } from "@ohos.arkui.stateManagement";

function main() {}



@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_num = STATE_MGMT_FACTORY.makeConsume<number>(this, "num", "num");
    this.__backing_str = STATE_MGMT_FACTORY.makeConsume<string>(this, "str", "ss");
  }
  
  public __updateStruct(initializers: (__Options_Child | undefined)): void {}
  
  private __backing_num?: IConsumeDecoratedVariable<number>;
  
  public get num(): number {
    return this.__backing_num!.get();
  }
  
  public set num(value: number) {
    this.__backing_num!.set(value);
  }
  
  private __backing_str?: IConsumeDecoratedVariable<string>;
  
  public get str(): string {
    return this.__backing_str!.get();
  }
  
  public set str(value: string) {
    this.__backing_str!.set(value);
  }
  
  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      Text(undefined, \`Child num: \${this.num}\`, undefined, undefined);
      Text(undefined, \`Child str: \${this.str}\`, undefined, undefined);
    }));
  }
  
  public constructor() {}
  
}

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_num = STATE_MGMT_FACTORY.makeProvide<number>(this, "num", "num", ((({let gensym___83257243 = initializers;
    (((gensym___83257243) == (null)) ? undefined : gensym___83257243.num)})) ?? (10)), false);
    this.__backing_str = STATE_MGMT_FACTORY.makeProvide<string>(this, "str", "ss", ((({let gensym___249074315 = initializers;
    (((gensym___249074315) == (null)) ? undefined : gensym___249074315.str)})) ?? ("hello")), false);
  }
  
  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}
  
  private __backing_num?: IProvideDecoratedVariable<number>;
  
  public get num(): number {
    return this.__backing_num!.get();
  }
  
  public set num(value: number) {
    this.__backing_num!.set(value);
  }
  
  private __backing_str?: IProvideDecoratedVariable<string>;
  
  public get str(): string {
    return this.__backing_str!.get();
  }
  
  public set str(value: string) {
    this.__backing_str!.set(value);
  }
  
  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      Text(undefined, \`Parent num: \${this.num}\`, undefined, undefined);
      Text(undefined, \`Parent str: \${this.str}\`, undefined, undefined);
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), undefined, undefined, undefined);
    }));
  }
  
  public constructor() {}
  
}

@Component() export interface __Options_Child {
  set num(num: (number | undefined))
  
  get num(): (number | undefined)
  set __backing_num(__backing_num: (IConsumeDecoratedVariable<number> | undefined))
  
  get __backing_num(): (IConsumeDecoratedVariable<number> | undefined)
  set str(str: (string | undefined))
  
  get str(): (string | undefined)
  set __backing_str(__backing_str: (IConsumeDecoratedVariable<string> | undefined))
  
  get __backing_str(): (IConsumeDecoratedVariable<string> | undefined)
  
}

@Component() export interface __Options_Parent {
  set num(num: (number | undefined))
  
  get num(): (number | undefined)
  set __backing_num(__backing_num: (IProvideDecoratedVariable<number> | undefined))
  
  get __backing_num(): (IProvideDecoratedVariable<number> | undefined)
  set str(str: (string | undefined))
  
  get str(): (string | undefined)
  set __backing_str(__backing_str: (IProvideDecoratedVariable<string> | undefined))
  
  get __backing_str(): (IProvideDecoratedVariable<string> | undefined)
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test usage of @Provide and @Consume decorator',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
