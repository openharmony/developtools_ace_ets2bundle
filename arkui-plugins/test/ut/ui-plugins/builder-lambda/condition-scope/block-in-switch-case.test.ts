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
import { memoNoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'builder-lambda/condition-scope';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'block-in-switch-case.ets'),
];

const pluginTester = new PluginTester('test block statement in switch case', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { ConditionScope as ConditionScope } from "arkui.component.builder";
import { ConditionBranch as ConditionBranch } from "arkui.component.builder";
import { memo as memo } from "arkui.stateManagement.runtime";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Text as Text, Column as Column, Component as Component } from "@ohos.arkui.component";

function main() {}

@Component() final struct SwitchCase extends CustomComponent<SwitchCase, __Options_SwitchCase> {
  public __initializeStruct(initializers: (__Options_SwitchCase | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_num = ((({let gensym___83257243 = initializers;
    (((gensym___83257243) == (null)) ? undefined : gensym___83257243.num)})) ?? (2));
  }
  
  public __updateStruct(initializers: (__Options_SwitchCase | undefined)): void {}
  
  private __backing_num?: int;
  
  public get num(): int {
    return (this.__backing_num as int);
  }
  
  public set num(value: int) {
    this.__backing_num = value;
  }
  
  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      ConditionScope(@memo() (() => {
        switch (this.num) {
          case 0: {
            break;
          }
          case 1: {
            break;
            Text(undefined, "111", undefined, undefined);
          }
          case 2: {
            break;
            Text(undefined, "111", undefined, undefined);
          }
          case 3: {
            ConditionBranch(@memo() (() => {
              {
                Text(undefined, "111", undefined, undefined);
              }
            }));
            break;
            Text(undefined, "111", undefined, undefined);
          }
          case 4: {
            ConditionBranch(@memo() (() => {
              {
                Text(undefined, "111", undefined, undefined);
                return;
              }
            }));
          }
          case 5: {
            ConditionBranch(@memo() (() => {
              {
                Text(undefined, "111", undefined, undefined);
              }
            }));
            break;
          }
          case 6: {
            ConditionBranch(@memo() (() => {
              {
                return;
              }
            }));
          }
          default: {
            break;
          }
        }
      }));
      Text(undefined, "hello world", undefined, undefined);
    }));
  }
  
  private constructor() {}
  
}

@Component() export interface __Options_SwitchCase {
  set num(num: (int | undefined))
  
  get num(): (int | undefined)
  
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";

import { ConditionScope as ConditionScope } from "arkui.component.builder";

import { ConditionBranch as ConditionBranch } from "arkui.component.builder";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Text as Text, Column as Column, Component as Component } from "@ohos.arkui.component";

function main() {}

@Component() final struct SwitchCase extends CustomComponent<SwitchCase, __Options_SwitchCase> {
  public __initializeStruct(initializers: (__Options_SwitchCase | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_num = ((({let gensym___83257243 = initializers;
    (((gensym___83257243) == (null)) ? undefined : gensym___83257243.num)})) ?? (2));
  }
  
  public __updateStruct(initializers: (__Options_SwitchCase | undefined)): void {}
  
  private __backing_num?: int;
  
  public get num(): int {
    return (this.__backing_num as int);
  }
  
  public set num(value: int) {
    this.__backing_num = value;
  }
  
  @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (10737008)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    Column(__memo_context, ((__memo_id) + (7513933)), undefined, undefined, @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<void>(((__memo_id) + (235688754)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      ConditionScope(__memo_context, ((__memo_id) + (10971338)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (220324446)), 0);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        switch (this.num) {
          case 0: {
            break;
          }
          case 1: {
            break;
            Text(__memo_context, ((__memo_id) + (9185155)), undefined, "111", undefined, undefined);
          }
          case 2: {
            break;
            Text(__memo_context, ((__memo_id) + (246501778)), undefined, "111", undefined, undefined);
          }
          case 3: {
            ConditionBranch(__memo_context, ((__memo_id) + (27357263)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
              const __memo_scope = __memo_context.scope<void>(((__memo_id) + (78642435)), 0);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              {
                Text(__memo_context, ((__memo_id) + (235279187)), undefined, "111", undefined, undefined);
              }
              {
                __memo_scope.recache();
                return;
              }
            }));
            break;
            Text(__memo_context, ((__memo_id) + (222088696)), undefined, "111", undefined, undefined);
          }
          case 4: {
            ConditionBranch(__memo_context, ((__memo_id) + (220977109)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
              const __memo_scope = __memo_context.scope<void>(((__memo_id) + (91459184)), 0);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              {
                Text(__memo_context, ((__memo_id) + (241855776)), undefined, "111", undefined, undefined);
                return;
              }
            }));
          }
          case 5: {
            ConditionBranch(__memo_context, ((__memo_id) + (214575380)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
              const __memo_scope = __memo_context.scope<void>(((__memo_id) + (225601197)), 0);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              {
                Text(__memo_context, ((__memo_id) + (240873793)), undefined, "111", undefined, undefined);
              }
              {
                __memo_scope.recache();
                return;
              }
            }));
            break;
          }
          case 6: {
            ConditionBranch(__memo_context, ((__memo_id) + (5873742)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
              const __memo_scope = __memo_context.scope<void>(((__memo_id) + (143235624)), 0);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              {
                return;
              }
            }));
          }
          default: {
            break;
          }
        }
        {
          __memo_scope.recache();
          return;
        }
      }));
      Text(__memo_context, ((__memo_id) + (72849900)), undefined, "hello world", undefined, undefined);
      {
        __memo_scope.recache();
        return;
      }
    }));
    {
      __memo_scope.recache();
      return;
    }
  }
  
  private constructor() {}
  
}

@Component() export interface __Options_SwitchCase {
  set num(num: (int | undefined))
  
  get num(): (int | undefined)
  
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test block statement in switch case',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
