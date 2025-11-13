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
import { collectNoRecheck, memoNoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
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
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";
import { ConditionScope as ConditionScope } from "arkui.component.builder";
import { ConditionBranch as ConditionBranch } from "arkui.component.builder";
import { Memo as Memo } from "arkui.incremental.annotation";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Text as Text, Column as Column, Component as Component } from "@ohos.arkui.component";

function main() {}

@Component() final struct SwitchCase extends CustomComponent<SwitchCase, __Options_SwitchCase> {
  public __initializeStruct(initializers: (__Options_SwitchCase | undefined), @Memo() content: ((()=> void) | undefined)): void {
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
  
  @Memo() public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ConditionScope(@Memo() (() => {
        switch (this.num) {
          case 0: {
            break;
          }
          case 1: {
            ConditionBranch(@Memo() (() => {
              TextImpl(@Memo() ((instance: TextAttribute): void => {
                instance.setTextOptions("111", undefined).applyAttributesFinish();
                return;
              }), undefined);
            }));
          }
          case 2: {
            ConditionBranch(@Memo() (() => {
              {
                TextImpl(@Memo() ((instance: TextAttribute): void => {
                  instance.setTextOptions("111", undefined).applyAttributesFinish();
                  return;
                }), undefined);
              }
            }));
          }
          case 3: {
            ConditionBranch(@Memo() (() => {
              {
                TextImpl(@Memo() ((instance: TextAttribute): void => {
                  instance.setTextOptions("111", undefined).applyAttributesFinish();
                  return;
                }), undefined);
              }
            }));
            break;
            TextImpl(@Memo() ((instance: TextAttribute): void => {
              instance.setTextOptions("111", undefined).applyAttributesFinish();
              return;
            }), undefined);
          }
          case 4: {
            ConditionBranch(@Memo() (() => {
              {
                TextImpl(@Memo() ((instance: TextAttribute): void => {
                  instance.setTextOptions("111", undefined).applyAttributesFinish();
                  return;
                }), undefined);
                return;
              }
            }));
            break;
          }
          case 5: {
            ConditionBranch(@Memo() (() => {
              {
                TextImpl(@Memo() ((instance: TextAttribute): void => {
                  instance.setTextOptions("111", undefined).applyAttributesFinish();
                  return;
                }), undefined);
              }
            }));
            break;
          }
          case 6: {
            ConditionBranch(@Memo() (() => {
              {
                return;
              }
            }));
            break;
          }
          case 7: {
            ConditionBranch(@Memo() (() => {
              {
                return;
                TextImpl(@Memo() ((instance: TextAttribute): void => {
                  instance.setTextOptions("111", undefined).applyAttributesFinish();
                  return;
                }), undefined);
              }
            }));
            break;
          }
          default: {
            break;
          }
        }
      }));
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions("hello world", undefined).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  public constructor() {}

  static {
  
  }
}

@Component() export interface __Options_SwitchCase {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'num', '(int | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_num', '(boolean | undefined)')}
  
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";
import { ConditionScope as ConditionScope } from "arkui.component.builder";
import { ConditionBranch as ConditionBranch } from "arkui.component.builder";
import { Memo as Memo } from "arkui.incremental.annotation";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Text as Text, Column as Column, Component as Component } from "@ohos.arkui.component";

function main() {}

@Component() final struct SwitchCase extends CustomComponent<SwitchCase, __Options_SwitchCase> {
  public __initializeStruct(initializers: (__Options_SwitchCase | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
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
  
  @Memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (261239291)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
      const __memo_parameter_instance = __memo_scope.param(0, instance);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      __memo_parameter_instance.value.setColumnOptions(undefined).applyAttributesFinish();
      {
        __memo_scope.recache();
        return;
      }
    }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (147868395)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      ConditionScope(__memo_context, ((__memo_id) + (186113)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (186336799)), 0);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        switch (this.num) {
          case 0: {
            break;
          }
          case 1: {
            ConditionBranch(__memo_context, ((__memo_id) + (27357263)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
              const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (78642435)), 0);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                const __memo_parameter_instance = __memo_scope.param(0, instance);
                if (__memo_scope.unchanged) {
                  __memo_scope.cached;
                  return;
                }
                __memo_parameter_instance.value.setTextOptions("111", undefined).applyAttributesFinish();
                {
                  __memo_scope.recache();
                  return;
                }
              }), undefined);
              {
                __memo_scope.recache();
                return;
              }
            }));
          }
          case 2: {
            ConditionBranch(__memo_context, ((__memo_id) + (220977109)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
              const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (91459184)), 0);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              {
                TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                  const __memo_parameter_instance = __memo_scope.param(0, instance);
                  if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                  }
                  __memo_parameter_instance.value.setTextOptions("111", undefined).applyAttributesFinish();
                  {
                    __memo_scope.recache();
                    return;
                  }
                }), undefined);
              }
              {
                __memo_scope.recache();
                return;
              }
            }));
          }
          case 3: {
            ConditionBranch(__memo_context, ((__memo_id) + (143235624)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
              const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (214575380)), 0);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              {
                TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                  const __memo_parameter_instance = __memo_scope.param(0, instance);
                  if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                  }
                  __memo_parameter_instance.value.setTextOptions("111", undefined).applyAttributesFinish();
                  {
                    __memo_scope.recache();
                    return;
                  }
                }), undefined);
              }
              {
                __memo_scope.recache();
                return;
              }
            }));
            break;
            TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
              const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
              const __memo_parameter_instance = __memo_scope.param(0, instance);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              __memo_parameter_instance.value.setTextOptions("111", undefined).applyAttributesFinish();
              {
                __memo_scope.recache();
                return;
              }
            }), undefined);
          }
          case 4: {
            ConditionBranch(__memo_context, ((__memo_id) + (7513933)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
              const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (235688754)), 0);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              {
                TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                  const __memo_parameter_instance = __memo_scope.param(0, instance);
                  if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                  }
                  __memo_parameter_instance.value.setTextOptions("111", undefined).applyAttributesFinish();
                  {
                    __memo_scope.recache();
                    return;
                  }
                }), undefined);
                return;
              }
            }));
            break;
          }
          case 5: {
            ConditionBranch(__memo_context, ((__memo_id) + (58475451)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
              const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (257250368)), 0);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              {
                TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                  const __memo_parameter_instance = __memo_scope.param(0, instance);
                  if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                  }
                  __memo_parameter_instance.value.setTextOptions("111", undefined).applyAttributesFinish();
                  {
                    __memo_scope.recache();
                    return;
                  }
                }), undefined);
              }
              {
                __memo_scope.recache();
                return;
              }
            }));
            break;
          }
          case 6: {
            ConditionBranch(__memo_context, ((__memo_id) + (60292460)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
              const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (21099142)), 0);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              {
                return;
              }
            }));
            break;
          }
          case 7: {
            ConditionBranch(__memo_context, ((__memo_id) + (34940192)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
              const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (15961624)), 0);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              {
                return;
                TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                  const __memo_parameter_instance = __memo_scope.param(0, instance);
                  if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                  }
                  __memo_parameter_instance.value.setTextOptions("111", undefined).applyAttributesFinish();
                  {
                    __memo_scope.recache();
                    return;
                  }
                }), undefined);
              }
              {
                __memo_scope.recache();
                return;
              }
            }));
            break;
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
      TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_instance = __memo_scope.param(0, instance);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        __memo_parameter_instance.value.setTextOptions("hello world", undefined).applyAttributesFinish();
        {
          __memo_scope.recache();
          return;
        }
      }), undefined);
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
  
  public constructor() {}

  static {
  
  }
}

@Component() export interface __Options_SwitchCase {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'num', '(int | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_num', '(boolean | undefined)')}
  
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test block statement in switch case',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
