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

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/prop';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'state-to-prop.ets'),
];

const pluginTester = new PluginTester('test @Prop decorated variables passing', buildConfig);

const parsedTransform: Plugins = {
    name: 'state-to-prop',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { StateDecoratedVariable as StateDecoratedVariable } from "@ohos.arkui.stateManagement";
import { PropDecoratedVariable as PropDecoratedVariable } from "@ohos.arkui.stateManagement";
import { memo as memo } from "arkui.stateManagement.runtime";
import { UIButtonAttribute as UIButtonAttribute } from "@ohos.arkui.component";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component, Text as Text, Button as Button, Column as Column, ClickEvent as ClickEvent } from "@ohos.arkui.component";
import { Prop as Prop, State as State } from "@ohos.arkui.stateManagement";

function main() {}

@Component({freezeWhenInactive:false}) final class CountDownComponent extends CustomComponent<CountDownComponent, __Options_CountDownComponent> {
  public __initializeStruct(initializers: __Options_CountDownComponent | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_count = new PropDecoratedVariable<number>("count", ((({let gensym___58710805 = initializers;
    (((gensym___58710805) == (null)) ? undefined : gensym___58710805.count)})) ?? (0)));
    this.__backing_costOfOneAttempt = ((({let gensym___88948111 = initializers;
    (((gensym___88948111) == (null)) ? undefined : gensym___88948111.costOfOneAttempt)})) ?? (1));
  }
  public __updateStruct(initializers: __Options_CountDownComponent | undefined): void {
    if (((({let gensym___188547633 = initializers;
    (((gensym___188547633) == (null)) ? undefined : gensym___188547633.count)})) !== (undefined))) {
      this.__backing_count!.update((initializers!.count as number));
    }
  }
  private __backing_count?: PropDecoratedVariable<number>;
  public get count(): number {
    return this.__backing_count!.get();
  }
  public set count(value: number) {
    this.__backing_count!.set(value);
  }
  private __backing_costOfOneAttempt?: number;
  public get costOfOneAttempt(): number {
    return (this.__backing_costOfOneAttempt as number);
  }
  public set costOfOneAttempt(value: number) {
    this.__backing_costOfOneAttempt = value;
  }
  
  @memo() public _build(@memo() style: ((instance: CountDownComponent)=> CountDownComponent) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_CountDownComponent | undefined): void {
    Column(undefined, (() => {
      if (((this.count) > (0))) {
        Text(undefined, (((("You have") + (this.count))) + ("Nuggets left")));
      } else {
        Text(undefined, "Game over!");
      }
      Button(@memo() ((instance: UIButtonAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          this.count -= this.costOfOneAttempt;
        }));
        return;
      }), "Try again");
    }));
  }
  private constructor() {}
}

@Component({freezeWhenInactive:false}) final class ParentComponent extends CustomComponent<ParentComponent, __Options_ParentComponent> {
  public __initializeStruct(initializers: __Options_ParentComponent | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_countDownStartValue = new StateDecoratedVariable<number>("countDownStartValue", ((({let gensym___249912438 = initializers;
    (((gensym___249912438) == (null)) ? undefined : gensym___249912438.countDownStartValue)})) ?? (10)));
  }
  public __updateStruct(initializers: __Options_ParentComponent | undefined): void {}
  private __backing_countDownStartValue?: StateDecoratedVariable<number>;
  public get countDownStartValue(): number {
    return this.__backing_countDownStartValue!.get();
  }
  public set countDownStartValue(value: number) {
    this.__backing_countDownStartValue!.set(value);
  }
  @memo() public _build(@memo() style: ((instance: ParentComponent)=> ParentComponent) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_ParentComponent | undefined): void {
    Column(undefined, (() => {
      Text(undefined, (((("Grant") + (this.countDownStartValue))) + ("nuggets to play.")));
      Button(@memo() ((instance: UIButtonAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          this.countDownStartValue += 1;
        }));
        return;
      }), "+1 - Nuggets in New Game");
      Button(@memo() ((instance: UIButtonAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          this.countDownStartValue -= 1;
        }));
        return;
      }), "-1 - Nuggets in New Game");
      CountDownComponent._instantiateImpl(undefined, (() => {
        return new CountDownComponent();
      }), ({
        count: this.countDownStartValue,
        costOfOneAttempt: 2,
      } as __Options_CountDownComponent));
    }));
  }
  private constructor() {}
}

@Component({freezeWhenInactive:false}) export interface __Options_CountDownComponent {
  set count(count: number | undefined)
  get count(): number | undefined
  set __backing_count(__backing_count: PropDecoratedVariable<number> | undefined)
  get __backing_count(): PropDecoratedVariable<number> | undefined
  set costOfOneAttempt(costOfOneAttempt: number | undefined)
  get costOfOneAttempt(): number | undefined
}

@Component({freezeWhenInactive:false}) export interface __Options_ParentComponent {
  set countDownStartValue(countDownStartValue: number | undefined)
  get countDownStartValue(): number | undefined
  set __backing_countDownStartValue(__backing_countDownStartValue: StateDecoratedVariable<number> | undefined)
  get __backing_countDownStartValue(): StateDecoratedVariable<number> | undefined
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Prop decorated variables passing',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
