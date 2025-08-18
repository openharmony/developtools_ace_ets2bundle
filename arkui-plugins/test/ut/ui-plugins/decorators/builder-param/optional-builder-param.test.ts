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

const FUNCTION_DIR_PATH: string = 'decorators/builder-param';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'optional-builder-param.ets'),
];

const pluginTester = new PluginTester('test optional builder param', buildConfig);

const parsedTransform: Plugins = {
    name: 'optional-builder-param',
    parsed: uiTransform().parsed
};

const expectedUIScript: string = `
import { ConditionScope as ConditionScope } from "arkui.component.builder";
import { ConditionBranch as ConditionBranch } from "arkui.component.builder";
import { memo as memo } from "arkui.stateManagement.runtime";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam, Column as Column, Text as Text, Row as Row } from "@kit.ArkUI";

function main() {}

@memo() function showTextBuilder() {
  Text(undefined, "Hello World", undefined, undefined);
}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_customBuilderParam2 = ((((({let gensym___103851375 = initializers;
    (((gensym___103851375) == (null)) ? undefined : gensym___103851375.customBuilderParam2)})) ?? (content))) ?? (undefined))
    this.__backing_customBuilderParam1 = ((((({let gensym___20169645 = initializers;
    (((gensym___20169645) == (null)) ? undefined : gensym___20169645.customBuilderParam1)})) ?? (content))) ?? (showTextBuilder))
  }
  
  public __updateStruct(initializers: (__Options_Child | undefined)): void {}
  
  private __backing_customBuilderParam2?: ((()=> void) | undefined);
  
  public get customBuilderParam2(): (@memo() (()=> void) | undefined) {
    return this.__backing_customBuilderParam2;
  }
  
  public set customBuilderParam2(value: (@memo() (()=> void) | undefined)) {
    this.__backing_customBuilderParam2 = value;
  }
  
  private __backing_customBuilderParam1?: @memo() (()=> void);
  
  public get customBuilderParam1(): @memo() (()=> void) {
    return this.__backing_customBuilderParam1!;
  }
  
  public set customBuilderParam1(value: @memo() (()=> void)) {
    this.__backing_customBuilderParam1 = value;
  }
  
  @memo() public build() {
    Row(undefined, undefined, @memo() (() => {
      ConditionScope(@memo() (() => {
        if (this.customBuilderParam2) {
          ConditionBranch(@memo() (() => {
            (this.customBuilderParam2 as (()=> void))();
          }));
        }
      }));
      ConditionScope(@memo() (() => {
        if (this.customBuilderParam2) {
          ConditionBranch(@memo() (() => {
            this.customBuilderParam2!();
          }));
        }
      }));
      this.customBuilderParam1();
    }));
  }
  
  public constructor() {}
  
}

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}
  
  @memo() public componentBuilder() {
    Text(undefined, "Parent builder", undefined, undefined);
  }
  
  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), {
        customBuilderParam2: @memo() (() => {
          this.componentBuilder();
        }),
      }, undefined, undefined);
    }));
  }
  
  public constructor() {}
  
}

@Component() export interface __Options_Child {
  set customBuilderParam2(customBuilderParam2: (((()=> void) | undefined) | undefined))
  
  get customBuilderParam2(): (((()=> void) | undefined) | undefined)
  set customBuilderParam1(customBuilderParam1: (@memo() (()=> void) | undefined))
  
  get customBuilderParam1(): (@memo() (()=> void) | undefined)
  
}

@Component() export interface __Options_Parent {
  
}
`;

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";
import { ConditionScope as ConditionScope } from "arkui.component.builder";
import { ConditionBranch as ConditionBranch } from "arkui.component.builder";
import { memo as memo } from "arkui.stateManagement.runtime";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam, Column as Column, Text as Text, Row as Row } from "@kit.ArkUI";

function main() {}

@memo() function showTextBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
  const __memo_scope = __memo_context.scope<void>(((__memo_id) + (183537441)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  Text(__memo_context, ((__memo_id) + (47330804)), undefined, "Hello World", undefined, undefined);
  {
    __memo_scope.recache();
    return;
  }
}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_customBuilderParam2 = ((((({let gensym___103851375 = initializers;
    (((gensym___103851375) == (null)) ? undefined : gensym___103851375.customBuilderParam2)})) ?? (content))) ?? (undefined))
    this.__backing_customBuilderParam1 = ((((({let gensym___20169645 = initializers;
    (((gensym___20169645) == (null)) ? undefined : gensym___20169645.customBuilderParam1)})) ?? (content))) ?? (showTextBuilder))
  }
  
  public __updateStruct(initializers: (__Options_Child | undefined)): void {}
  
  private __backing_customBuilderParam2?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
  
  public get customBuilderParam2(): (@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined) {
    return this.__backing_customBuilderParam2;
  }
  
  public set customBuilderParam2(value: (@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)) {
    this.__backing_customBuilderParam2 = value;
  }
  
  private __backing_customBuilderParam1?: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
  
  public get customBuilderParam1(): @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) {
    return this.__backing_customBuilderParam1!;
  }
  
  public set customBuilderParam1(value: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) {
    this.__backing_customBuilderParam1 = value;
  }
  
  @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (234402485)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    Row(__memo_context, ((__memo_id) + (46726221)), undefined, undefined, @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<void>(((__memo_id) + (213104625)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        if (this.customBuilderParam2) {
          ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
              __memo_scope.cached;
              return;
            }
            (this.customBuilderParam2 as ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void))(__memo_context, ((__memo_id) + (<some_random_number>)));
            {
              __memo_scope.recache();
              return;
            }
          }));
        }
        {
          __memo_scope.recache();
          return;
        }
      }));
      ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        if (this.customBuilderParam2) {
          ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<void>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
              __memo_scope.cached;
              return;
            }
            this.customBuilderParam2!(__memo_context, ((__memo_id) + (<some_random_number>)));
            {
              __memo_scope.recache();
              return;
            }
          }));
        }
        {
          __memo_scope.recache();
          return;
        }
      }));
      this.customBuilderParam1(__memo_context, ((__memo_id) + (211301233)));
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
  
}

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}
  
  @memo() public componentBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (179117969)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    Text(__memo_context, ((__memo_id) + (218979098)), undefined, "Parent builder", undefined, undefined);
    {
      __memo_scope.recache();
      return;
    }
  }
  
  @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (245938697)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    Column(__memo_context, ((__memo_id) + (78055758)), undefined, undefined, @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<void>(((__memo_id) + (136716185)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      Child._instantiateImpl(__memo_context, ((__memo_id) + (54078781)), undefined, (() => {
        return new Child();
      }), {
        customBuilderParam2: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
          const __memo_scope = __memo_context.scope<void>(((__memo_id) + (213687742)), 0);
          if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
          }
          this.componentBuilder(__memo_context, ((__memo_id) + (192802443)));
          {
            __memo_scope.recache();
            return;
          }
        }),
      }, undefined, undefined);
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
  
}

@Component() export interface __Options_Child {
  set customBuilderParam2(customBuilderParam2: ((((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined) | undefined))
  
  get customBuilderParam2(): ((((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined) | undefined)
  set customBuilderParam1(customBuilderParam1: (@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined))
  
  get customBuilderParam1(): (@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)
  
}

@Component() export interface __Options_Parent {
  
}
`;

function testUICheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

function testMemoCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test optional builder param',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUICheckedTransformer],
        'checked:memo-no-recheck': [testMemoCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
