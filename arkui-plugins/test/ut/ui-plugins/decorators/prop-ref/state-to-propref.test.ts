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
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/prop-ref';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'state-to-prop-ref.ets'),
];

const pluginTester = new PluginTester('test @PropRef decorated variables passing', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { ConditionScope as ConditionScope } from "arkui.component.builder";

import { ConditionBranch as ConditionBranch } from "arkui.component.builder";

import { Memo as Memo } from "arkui.incremental.annotation";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Text as Text, Button as Button, Column as Column, ClickEvent as ClickEvent } from "@ohos.arkui.component";

import { PropRef as PropRef, State as State } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct CountDownComponent extends CustomComponent<CountDownComponent, __Options_CountDownComponent> {
  public __initializeStruct(initializers: (__Options_CountDownComponent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_count = STATE_MGMT_FACTORY.makePropRef<number>(this, "count", ((({let gensym___58710805 = initializers;
    (((gensym___58710805) == (null)) ? undefined : gensym___58710805.count)})) ?? (0)));
    this.__backing_costOfOneAttempt = ((({let gensym___88948111 = initializers;
    (((gensym___88948111) == (null)) ? undefined : gensym___88948111.costOfOneAttempt)})) ?? (1));
  }
  
  public __updateStruct(initializers: (__Options_CountDownComponent | undefined)): void {
    if (({let gensym___142908272 = initializers;
    (((gensym___142908272) == (null)) ? undefined : gensym___142908272.__options_has_count)})) {
      this.__backing_count!.update((initializers!.count as number));
    }
  }
  
  private __backing_count?: IPropRefDecoratedVariable<number>;
  
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
  
  @Memo() public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ConditionScope(@Memo() (() => {
        if (((this.count) > (0))) {
          ConditionBranch(@Memo() (() => {
            TextImpl(@Memo() ((instance: TextAttribute): void => {
              instance.setTextOptions((((("You have") + (this.count))) + ("Nuggets left")), undefined).applyAttributesFinish();
              return;
            }), undefined);
          }));
        } else {
          ConditionBranch(@Memo() (() => {
            TextImpl(@Memo() ((instance: TextAttribute): void => {
              instance.setTextOptions("Game over!", undefined).applyAttributesFinish();
              return;
            }), undefined);
          }));
        }
      }));
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("Try again", undefined).onClick(((e: ClickEvent) => {
          this.count -= this.costOfOneAttempt;
        })).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  public constructor() {}
  
}

@Component() final struct ParentComponent extends CustomComponent<ParentComponent, __Options_ParentComponent> {
  public __initializeStruct(initializers: (__Options_ParentComponent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_countDownStartValue = STATE_MGMT_FACTORY.makeState<number>(this, "countDownStartValue", ((({let gensym___249912438 = initializers;
    (((gensym___249912438) == (null)) ? undefined : gensym___249912438.countDownStartValue)})) ?? (10)));
  }
  
  public __updateStruct(initializers: (__Options_ParentComponent | undefined)): void {}
  
  private __backing_countDownStartValue?: IStateDecoratedVariable<number>;
  
  public get countDownStartValue(): number {
    return this.__backing_countDownStartValue!.get();
  }
  
  public set countDownStartValue(value: number) {
    this.__backing_countDownStartValue!.set(value);
  }
  
  @Memo() public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions((((("Grant") + (this.countDownStartValue))) + ("nuggets to play.")), undefined).applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("+1 - Nuggets in New Game", undefined).onClick(((e: ClickEvent) => {
          this.countDownStartValue += 1;
        })).applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("-1 - Nuggets in New Game", undefined).onClick(((e: ClickEvent) => {
          this.countDownStartValue -= 1;
        })).applyAttributesFinish();
        return;
      }), undefined);
      CountDownComponent._instantiateImpl(undefined, (() => {
        return new CountDownComponent();
      }), {
        count: this.countDownStartValue,
        __options_has_count: true,
        costOfOneAttempt: 2,
        __options_has_costOfOneAttempt: true,
      }, undefined, undefined);
    }));
  }
  
  public constructor() {}
  
}

@Component() export interface __Options_CountDownComponent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'count', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_count', '(IPropRefDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_count', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'costOfOneAttempt', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_costOfOneAttempt', '(boolean | undefined)')}
  
}

@Component() export interface __Options_ParentComponent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'countDownStartValue', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_countDownStartValue', '(IStateDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_countDownStartValue', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @PropRef decorated variables passing',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
