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

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/event';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'event-initialize.ets'),
];

const pluginTester = new PluginTester('test @Event decorator transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedParsedScript: string = `
import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { ComponentV2 as ComponentV2, Column as Column, Text as Text } from "@ohos.arkui.component";

import { Event as Event, Param as Param, Local as Local } from "@ohos.arkui.stateManagement";

@ComponentV2() final struct Child extends CustomComponentV2<Child, __Options_Child> {
  @Param() public index: number = 0;
  
  @Event() public changeIndex!: ((val: number)=> void);
  
  @Event() public testEvent!: ((val: number)=> number);
  
  @Event() public testEvent2: ((val: number)=> number) = ((val: number) => {
    return val;
  });
  
  public build() {
    Column(){
      Text(\`Child index: \${this.index}\`).onClick(((e) => {
        this.changeIndex(20);
        console.log(\`after changeIndex \${this.index}\`);
      }));
    };
  }
  
  public constructor() {}
  
}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  @Local() public index: number = 0;
  
  public build() {
    Column(){
      Child({
        index: this.index,
        changeIndex: ((val: number) => {
          this.index = val;
          console.log(\`in changeIndex \${this.index}\`);
        }),
      });
    };
  }
  
  public constructor() {}
  
}

@ComponentV2() export interface __Options_Child {
  index?: number;
  @Param() __backing_index?: number;
  changeIndex?: ((val: number)=> void);
  testEvent?: ((val: number)=> number);
  testEvent2?: ((val: number)=> number);
  
}

@ComponentV2() export interface __Options_Index {
  index?: number;
  @Local() __backing_index?: number;
  
}
`;

const expectedCheckedScript: string = `
import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IParamDecoratedVariable as IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { ComponentV2 as ComponentV2, Column as Column, Text as Text } from "@ohos.arkui.component";

import { Event as Event, Param as Param, Local as Local } from "@ohos.arkui.stateManagement";

function main() {}

@ComponentV2() final struct Child extends CustomComponentV2<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_index = STATE_MGMT_FACTORY.makeParam<number>(this, "index", ((({let gensym___23942905 = initializers;
    (((gensym___23942905) == (null)) ? undefined : gensym___23942905.index)})) ?? (0)));
    this.__backing_changeIndex = ((({let gensym___204042774 = initializers;
    (((gensym___204042774) == (null)) ? undefined : gensym___204042774.changeIndex)})) ?? (undefined));
    this.__backing_testEvent = ((({let gensym___124585092 = initializers;
    (((gensym___124585092) == (null)) ? undefined : gensym___124585092.testEvent)})) ?? (undefined));
    this.__backing_testEvent2 = ((({let gensym___189097286 = initializers;
    (((gensym___189097286) == (null)) ? undefined : gensym___189097286.testEvent2)})) ?? (((val: number) => {
      return val;
    })));
  }
  
  public __updateStruct(initializers: (__Options_Child | undefined)): void {
    if (((({let gensym___91647805 = initializers;
    (((gensym___91647805) == (null)) ? undefined : gensym___91647805.index)})) !== (undefined))) {
      this.__backing_index!.update((initializers!.index as number));
    }
  }
  
  private __backing_index?: IParamDecoratedVariable<number>;
  
  public get index(): number {
    return this.__backing_index!.get();
  }
  
  private __backing_changeIndex?: ((val: number)=> void);
  
  public get changeIndex(): ((val: number)=> void) {
    return (this.__backing_changeIndex as ((val: number)=> void));
  }
  
  public set changeIndex(value: ((val: number)=> void)) {
    this.__backing_changeIndex = value;
  }
  
  private __backing_testEvent?: ((val: number)=> number);
  
  public get testEvent(): ((val: number)=> number) {
    return (this.__backing_testEvent as ((val: number)=> number));
  }
  
  public set testEvent(value: ((val: number)=> number)) {
    this.__backing_testEvent = value;
  }
  
  private __backing_testEvent2?: ((val: number)=> number);
  
  public get testEvent2(): ((val: number)=> number) {
    return (this.__backing_testEvent2 as ((val: number)=> number));
  }
  
  public set testEvent2(value: ((val: number)=> number)) {
    this.__backing_testEvent2 = value;
  }
  
  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      Text(@memo() ((instance: TextAttribute): void => {
        instance.onClick(((e) => {
          this.changeIndex(20);
          console.log(\`after changeIndex \${this.index}\`);
        }));
        return;
      }), \`Child index: \${this.index}\`, undefined, undefined);
    }));
  }
  
  public constructor() {}
  
}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_index = STATE_MGMT_FACTORY.makeLocal<number>(this, "index", 0);
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  private __backing_index?: ILocalDecoratedVariable<number>;
  
  public get index(): number {
    return this.__backing_index!.get();
  }
  
  public set index(value: number) {
    this.__backing_index!.set(value);
  }
  
  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), {
        index: this.index,
        changeIndex: ((val: number) => {
          this.index = val;
          console.log(\`in changeIndex \${this.index}\`);
        }),
      }, undefined, undefined);
    }));
  }
  
  public constructor() {}
  
}

@ComponentV2() export interface __Options_Child {
  set index(index: (number | undefined))
  
  get index(): (number | undefined)
  set __backing_index(__backing_index: (IParamDecoratedVariable<number> | undefined))
  
  get __backing_index(): (IParamDecoratedVariable<number> | undefined)
  set changeIndex(changeIndex: (((val: number)=> void) | undefined))
  
  get changeIndex(): (((val: number)=> void) | undefined)
  set testEvent(testEvent: (((val: number)=> number) | undefined))
  
  get testEvent(): (((val: number)=> number) | undefined)
  set testEvent2(testEvent2: (((val: number)=> number) | undefined))
  
  get testEvent2(): (((val: number)=> number) | undefined)
  
}

@ComponentV2() export interface __Options_Index {
  set index(index: (number | undefined))
  
  get index(): (number | undefined)
  set __backing_index(__backing_index: (ILocalDecoratedVariable<number> | undefined))
  
  get __backing_index(): (ILocalDecoratedVariable<number> | undefined)
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test @Event decorator transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
