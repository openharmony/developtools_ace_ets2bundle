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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'builder-param-passing.ets'),
];

const pluginTester = new PluginTester('test builder param variable passing', buildConfig);

const parsedTransform: Plugins = {
    name: 'builder-param-passing',
    parsed: uiTransform().parsed,
};

const expectedAfterUIScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam, Column as Column, Text as Text } from "@ohos.arkui.component";

function main() {}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_customBuilderParam = ((((({let gensym___169376706 = initializers;
    (((gensym___169376706) == (null)) ? undefined : gensym___169376706.customBuilderParam)})) ?? (content))) ?? (this.customBuilder))
  }
  
  public __updateStruct(initializers: (__Options_Child | undefined)): void {}
  
  private __backing_customBuilderParam?: @memo() (()=> void);
  
  public get customBuilderParam(): @memo() (()=> void) {
    return this.__backing_customBuilderParam!;
  }
  
  public set customBuilderParam(value: @memo() (()=> void)) {
    this.__backing_customBuilderParam = value;
  }
  
  @memo() public customBuilder() {}
  
  @memo() public build() {
    this.customBuilderParam();
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
        customBuilderParam: this.componentBuilder,
      }, undefined, undefined);
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), {
        customBuilderParam: @memo() (() => {
          this.componentBuilder();
        }),
      }, undefined, undefined);
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), undefined, undefined, @memo() (() => {
        Text(undefined, "Parent builder", undefined, undefined);
      }));
    }));
  }
  
  public constructor() {}
  
}

@Component() export interface __Options_Child {
  set customBuilderParam(customBuilderParam: (@memo() (()=> void) | undefined))
  
  get customBuilderParam(): (@memo() (()=> void) | undefined)
  
}

@Component() export interface __Options_Parent {
  
}
`;

const expectedAfterMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";
import { memo as memo } from "arkui.stateManagement.runtime";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam, Column as Column, Text as Text } from "@ohos.arkui.component";

function main() {}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_customBuilderParam = ((((({let gensym___169376706 = initializers;
    (((gensym___169376706) == (null)) ? undefined : gensym___169376706.customBuilderParam)})) ?? (content))) ?? (this.customBuilder))
  }
  
  public __updateStruct(initializers: (__Options_Child | undefined)): void {}
  
  private __backing_customBuilderParam?: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
  
  public get customBuilderParam(): @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) {
    return this.__backing_customBuilderParam!;
  }
  
  public set customBuilderParam(value: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) {
    this.__backing_customBuilderParam = value;
  }
  
  @memo() public customBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (252759234)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }
  
  @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (209256344)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    this.customBuilderParam(__memo_context, ((__memo_id) + (175145513)));
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
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (219399173)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    Text(__memo_context, ((__memo_id) + (137225318)), undefined, "Parent builder", undefined, undefined);
    {
      __memo_scope.recache();
      return;
    }
  }
  
  @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (135515930)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    Column(__memo_context, ((__memo_id) + (136716185)), undefined, undefined, @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<void>(((__memo_id) + (54078781)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      Child._instantiateImpl(__memo_context, ((__memo_id) + (213104625)), undefined, (() => {
        return new Child();
      }), {
        customBuilderParam: this.componentBuilder,
      }, undefined, undefined);
      Child._instantiateImpl(__memo_context, ((__memo_id) + (218979098)), undefined, (() => {
        return new Child();
      }), {
        customBuilderParam: @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
          const __memo_scope = __memo_context.scope<void>(((__memo_id) + (76711614)), 0);
          if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
          }
          this.componentBuilder(__memo_context, ((__memo_id) + (46726221)));
          {
            __memo_scope.recache();
            return;
          }
        }),
      }, undefined, undefined);
      Child._instantiateImpl(__memo_context, ((__memo_id) + (213687742)), undefined, (() => {
        return new Child();
      }), undefined, undefined, @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (192802443)), 0);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        Text(__memo_context, ((__memo_id) + (223657391)), undefined, "Parent builder", undefined, undefined);
        {
          __memo_scope.recache();
          return;
        }
      }));
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
  set customBuilderParam(customBuilderParam: (@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined))
  
  get customBuilderParam(): (@memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)
  
}

@Component() export interface __Options_Parent {
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedAfterUIScript));
}

function testMemoCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedAfterMemoScript));
}

pluginTester.run(
    'test builder param variable passing',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
        'checked:memo-no-recheck': [testMemoCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
