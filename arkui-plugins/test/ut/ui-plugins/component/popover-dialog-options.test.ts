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
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { beforeUINoRecheck, collectNoRecheck, memoNoRecheck, recheck, uiNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const COMPONENT_DIR_PATH: string = 'component';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, COMPONENT_DIR_PATH, 'popover-dialog-options.ets'),
];

const pluginTester = new PluginTester('test PopoverDialogOptions with builder property', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedCheckedScript: string = `

import { ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY } from "arkui.component.customComponent";

import { Memo } from "arkui.incremental.annotation";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponentV2 } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { Entry, Builder, ComponentV2 } from "@ohos.arkui.component";

import { Local } from "@ohos.arkui.stateManagement";

import { PopoverDialogV2Options } from "./utils/mock-popover-dialog";

function main() {}


@ComponentV2() final struct PopoverDialogV2Create extends CustomComponentV2<PopoverDialogV2Create, __Options_PopoverDialogV2Create> {
  public __initializeStruct(initializers: (__Options_PopoverDialogV2Create | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_popoverOptions = STATE_MGMT_FACTORY.makeLocal<PopoverDialogV2Options>(this, "popoverOptions", {
      builder: @Memo() (() => {
        this.dialogBuilder();
      }),
    });
  }
  
  public __updateStruct(initializers: (__Options_PopoverDialogV2Create | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_PopoverDialogV2Create | undefined)): void {
    this.__backing_popoverOptions!.resetOnReuse({
      builder: @Memo() (() => {
        this.dialogBuilder();
      }),
    });
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: PopoverDialogV2Create)=> void) | undefined), initializers: ((()=> __Options_PopoverDialogV2Create) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<PopoverDialogV2Create, __Options_PopoverDialogV2Create>(style, ((): PopoverDialogV2Create => {
      return new PopoverDialogV2Create();
    }), initializers, reuseId, content, {
      sClass: Class.from<PopoverDialogV2Create>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_PopoverDialogV2Create, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): PopoverDialogV2Create {
    throw new Error("Declare interface");
  }
  
  private __backing_popoverOptions?: ILocalDecoratedVariable<PopoverDialogV2Options>;
  public get popoverOptions(): PopoverDialogV2Options {
    return this.__backing_popoverOptions!.get();
  }
  
  public set popoverOptions(value: PopoverDialogV2Options) {
    this.__backing_popoverOptions!.set(value);
  }
  
  @Memo() 
  public dialogBuilder() {}
  
  @Memo() 
  public build() {}
  
  public constructor() {}
  
  static {
    
  }
}

@ComponentV2() class __Options_PopoverDialogV2Create {
  @Local() public popoverOptions?: PopoverDialogV2Options;
  public __backing_popoverOptions?: ILocalDecoratedVariable<PopoverDialogV2Options>;
  public __options_has_popoverOptions?: boolean;
  public constructor() {}
  
}


`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

const expectedMemoScript: string = `

import { __memo_context_type, __memo_id_type } from "arkui.incremental.runtime.state";

import { ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY } from "arkui.component.customComponent";

import { Memo } from "arkui.incremental.annotation";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponentV2 } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { Entry, Builder, ComponentV2 } from "@ohos.arkui.component";

import { Local } from "@ohos.arkui.stateManagement";

import { PopoverDialogV2Options } from "./utils/mock-popover-dialog";

function main() {}


@ComponentV2() final struct PopoverDialogV2Create extends CustomComponentV2<PopoverDialogV2Create, __Options_PopoverDialogV2Create> {
  public __initializeStruct(initializers: (__Options_PopoverDialogV2Create | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_popoverOptions = STATE_MGMT_FACTORY.makeLocal<PopoverDialogV2Options>(this, "popoverOptions", {
      builder: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (11562205)), 0);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        this.dialogBuilder(__memo_context, ((__memo_id) + (209113580)));
        {
          __memo_scope.recache();
          return;
        }
      }),
    });
  }
  
  public __updateStruct(initializers: (__Options_PopoverDialogV2Create | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_PopoverDialogV2Create | undefined)): void {
    this.__backing_popoverOptions!.resetOnReuse({
      builder: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (199838496)), 0);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        this.dialogBuilder(__memo_context, ((__memo_id) + (170876182)));
        {
          __memo_scope.recache();
          return;
        }
      }),
    });
  }
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: PopoverDialogV2Create)=> void) | undefined), initializers: ((()=> __Options_PopoverDialogV2Create) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<PopoverDialogV2Create, __Options_PopoverDialogV2Create>(__memo_context, ((__memo_id) + (74316801)), style, ((): PopoverDialogV2Create => {
      return new PopoverDialogV2Create();
    }), initializers, reuseId, content, {
      sClass: Class.from<PopoverDialogV2Create>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_PopoverDialogV2Create, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): PopoverDialogV2Create {
    throw new Error("Declare interface");
  }
  
  private __backing_popoverOptions?: ILocalDecoratedVariable<PopoverDialogV2Options>;
  public get popoverOptions(): PopoverDialogV2Options {
    return this.__backing_popoverOptions!.get();
  }
  
  public set popoverOptions(value: PopoverDialogV2Options) {
    this.__backing_popoverOptions!.set(value);
  }
  
  @Memo() 
  public dialogBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (93676414)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }
  
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (243391609)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }
  
  public constructor() {}
  
  static {
    
  }
}

@ComponentV2() class __Options_PopoverDialogV2Create {
  @Local() public popoverOptions?: PopoverDialogV2Options;
  public __backing_popoverOptions?: ILocalDecoratedVariable<PopoverDialogV2Options>;
  public __options_has_popoverOptions?: boolean;
  public constructor() {}
  
}


`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}


pluginTester.run(
    'test PopoverDialogOptions with builder property',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
        'checked:memo-no-recheck': [testMemoTransformer]
    },
    {
        stopAfter: 'checked',
    }
);