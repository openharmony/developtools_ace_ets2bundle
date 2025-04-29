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
import { __memo_id_type as __memo_id_type } from "@ohos.arkui.stateManagement";

import { __memo_context_type as __memo_context_type } from "@ohos.arkui.stateManagement";

import { memo as memo } from "@ohos.arkui.stateManagement";

import { DecoratedV1VariableBase as DecoratedV1VariableBase } from "@ohos.arkui.stateManagement";

import { LinkDecoratedVariable as LinkDecoratedVariable } from "@ohos.arkui.stateManagement";

import { StateDecoratedVariable as StateDecoratedVariable } from "@ohos.arkui.stateManagement";

import { CustomComponent as CustomComponent } from "@ohos.arkui.component";

import { Component as Component, Reusable as Reusable } from "@ohos.arkui.component";

import { State as State, Link as Link } from "@ohos.arkui.stateManagement";

function main() {}



@Component({freezeWhenInactive:false}) final class MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo() content: (()=> void) | undefined): void {}
  
  public __updateStruct(initializers: __Options_MyStateSample | undefined): void {}
  
  @memo() public _build(@memo() style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {
    Child._instantiateImpl(undefined, (() => {
      return new Child();
    }), ({
      num: 5,
    } as __Options_Child), undefined, "Child");
  }
  
  public constructor() {}
  
}

@Component({freezeWhenInactive:false}) @Reusable() final class Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: __Options_Child | undefined, @memo() content: (()=> void) | undefined): void {
    if (({let gensym___98468840 = initializers;
    (((gensym___98468840) == (null)) ? undefined : gensym___98468840.__backing_num)})) {
      (this).__backing_num = new LinkDecoratedVariable<number>("num", initializers!.__backing_num!);
    };
    (this).__backing_num1 = new StateDecoratedVariable<number>("num1", ((({let gensym___33833641 = initializers;
    (((gensym___33833641) == (null)) ? undefined : gensym___33833641.num1)})) ?? (2)));
  }
  
  public __updateStruct(initializers: __Options_Child | undefined): void {}
  
  public override __toRecord(params: Object): Record<string, Object> {
    const paramsCasted = (params as __Options_Child);
    return {
      "num": ((paramsCasted.num) ?? (new Object())),
      "num1": ((paramsCasted.num1) ?? (new Object())),
    };
  }
  
  private __backing_num?: LinkDecoratedVariable<number>;
  
  public get num(): number {
    return (this).__backing_num!.get();
  }
  
  public set num(value: number) {
    (this).__backing_num!.set(value);
  }
  
  private __backing_num1?: StateDecoratedVariable<number>;
  
  public get num1(): number {
    return (this).__backing_num1!.get();
  }
  
  public set num1(value: number) {
    (this).__backing_num1!.set(value);
  }
  
  @memo() public _build(@memo() style: ((instance: Child)=> Child) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Child | undefined): void {}
  
  public constructor() {}
  
}

interface __Options_MyStateSample {
  
}

interface __Options_Child {
  set num(num: number | undefined)
  
  get num(): number | undefined
  set __backing_num(__backing_num: DecoratedV1VariableBase<number> | undefined)
  
  get __backing_num(): DecoratedV1VariableBase<number> | undefined
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
    [reusableTransform, uiNoRecheck],
    {
        checked: [testReusableTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
