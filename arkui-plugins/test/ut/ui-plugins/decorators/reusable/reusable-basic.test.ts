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

const REUSABLE_DIR_PATH: string = 'decorators/reusable';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, REUSABLE_DIR_PATH, 'reusable-basic.ets'),
];

const reusableTransform: Plugins = {
    name: 'reusable',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test basic reusable', buildConfig);

const expectedScript: string = `
import { StateDecoratedVariable as StateDecoratedVariable } from "@ohos.arkui.stateManagement";
import { PropDecoratedVariable as PropDecoratedVariable } from "@ohos.arkui.stateManagement";
import { memo as memo } from "arkui.stateManagement.runtime";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component, Reusable as Reusable } from "@ohos.arkui.component";
import { State as State, Prop as Prop } from "@ohos.arkui.stateManagement";

function main() {}



@Component({freezeWhenInactive:false}) final class MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo() content: (()=> void) | undefined): void {}
  
  public __updateStruct(initializers: __Options_MyStateSample | undefined): void {}
  
  @memo() public _build(@memo() style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {
    Child._instantiateImpl(undefined, (() => {
      return new Child();
    }), ({
      num: 5,
    } as __Options_Child), "Child", undefined);
  }
  
  private constructor() {}
  
}

@Component({freezeWhenInactive:false}) @Reusable() final class Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: __Options_Child | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_num = new PropDecoratedVariable<number>("num", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.num)})) ?? (1)));
    this.__backing_num1 = new StateDecoratedVariable<number>("num1", ((({let gensym___33833641 = initializers;
    (((gensym___33833641) == (null)) ? undefined : gensym___33833641.num1)})) ?? (2)));
  }
  
  public __updateStruct(initializers: __Options_Child | undefined): void {
    if (((({let gensym___108716469 = initializers;
    (((gensym___108716469) == (null)) ? undefined : gensym___108716469.num)})) !== (undefined))) {
      this.__backing_num!.update((initializers!.num as number));
    }
  }
  
  public override __toRecord(params: Object): Record<string, Object> {
    const paramsCasted = (params as __Options_Child);
    return {
      "num": ((paramsCasted.num) ?? (new Object())),
      "num1": ((paramsCasted.num1) ?? (new Object())),
    };
  }
  
  private __backing_num?: PropDecoratedVariable<number>;
  
  public get num(): number {
    return this.__backing_num!.get();
  }
  
  public set num(value: number) {
    this.__backing_num!.set(value);
  }
  
  private __backing_num1?: StateDecoratedVariable<number>;
  
  public get num1(): number {
    return this.__backing_num1!.get();
  }
  
  public set num1(value: number) {
    this.__backing_num1!.set(value);
  }
  
  @memo() public _build(@memo() style: ((instance: Child)=> Child) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Child | undefined): void {}
  
  private constructor() {}
  
}

@Component({freezeWhenInactive:false}) export interface __Options_MyStateSample {
  
}

@Component({freezeWhenInactive:false}) @Reusable() export interface __Options_Child {
  set num(num: number | undefined)
  
  get num(): number | undefined
  set __backing_num(__backing_num: PropDecoratedVariable<number> | undefined)
  
  get __backing_num(): PropDecoratedVariable<number> | undefined
  set num1(num1: number | undefined)
  
  get num1(): number | undefined
  set __backing_num1(__backing_num1: StateDecoratedVariable<number> | undefined)
  
  get __backing_num1(): StateDecoratedVariable<number> | undefined
  
}
`;

function testReusableTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic reusable',
    [reusableTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testReusableTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
