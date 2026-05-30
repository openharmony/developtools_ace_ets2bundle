/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { collectNoRecheck, recheck, uiNoRecheck, memoNoRecheck, beforeMemoNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor, dumpAnnotation } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const FUNCTION_DIR_PATH: string = 'decorators/custom-dialog';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'custom-dialog-memo.ets'),
];

const pluginTester = new PluginTester('test memo transform of @CustomDialog', buildConfig);

const parsedTransform: Plugins = {
    name: 'base-custom-dialog',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { BaseCustomDialog as BaseCustomDialog } from "arkui.component.customComponent";

import { ReusePoolOwnership as ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, Entry as Entry, CustomDialogController as CustomDialogController, CustomDialog as CustomDialog } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/custom-dialog/custom-dialog-memo",
  pageFullPath: "test/demo/mock/decorators/custom-dialog/custom-dialog-memo",
  integratedHsp: "false",
} as NavInterface));
@Entry() @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_controller = STATE_MGMT_FACTORY.makeState<(CustomDialogController | null)>(this, "controller", ((({let gensym___93787132 = initializers;
    (((gensym___93787132) == (null)) ? undefined : gensym___93787132.controller)})) ?? (({let gensym___203542966: Any;
    gensym___203542966 = new CustomDialogController({
      builder: @Memo() (() => {
        customDialogExample._invoke((() => {
          return {};
        }), undefined, (gensym___203542966 as CustomDialogController), undefined);
      }),
      autoCancel: false,
      openAnimation: {
        duration: 5000,
        tempo: 0,
      },
      closeAnimation: {
        duration: 5000,
        tempo: 0,
      },
      baseComponent: this,
    })
    (gensym___203542966 as CustomDialogController)}))));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {
    this.__backing_controller!.resetOnReuse(((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.controller)})) ?? (({let gensym___<some_random_number>: Any;
    gensym___203542966 = new CustomDialogController({
      builder: @Memo() (() => {
        customDialogExample._invoke((() => {
          return {};
        }), undefined, (gensym___203542966 as CustomDialogController), undefined);
      }),
      autoCancel: false,
      openAnimation: {
        duration: 5000,
        tempo: 0,
      },
      closeAnimation: {
        duration: 5000,
        tempo: 0,
      },
      baseComponent: this,
    })
    (gensym___203542966 as CustomDialogController)}))));
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  private __backing_controller?: IStateDecoratedVariable<(CustomDialogController | null)>;
  public get controller(): (CustomDialogController | null) {
    return this.__backing_controller!.get();
  }
  
  public set controller(value: (CustomDialogController | null)) {
    this.__backing_controller!.set(value);
  }
  
  @Memo() 
  public build() {}
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
}

@CustomDialog() @Component() final struct customDialogExample extends BaseCustomDialog<customDialogExample, __Options_customDialogExample> {
  public __initializeStruct(initializers: (__Options_customDialogExample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___249436970 = initializers;
    (((gensym___249436970) == (null)) ? undefined : gensym___249436970.__options_has_controller)})) {
      this.__backing_controller = initializers!.controller;
    } else {
      if (!(this.__backing_controller)) {
        this.__backing_controller = ({let gensym___17371929: Any;
        gensym___17371929 = new CustomDialogController({
          builder: @Memo() (() => {}),
          autoCancel: false,
          openAnimation: {
            duration: 5000,
            tempo: 0,
          },
          closeAnimation: {
            duration: 5000,
            tempo: 0,
          },
          baseComponent: this,
        })
        (gensym___17371929 as CustomDialogController)})
      }
    }
  }
  
  public __updateStruct(initializers: (__Options_customDialogExample | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_customDialogExample | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(initializers: ((()=> __Options_customDialogExample) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: ((()=> void) | undefined)): void {
    BaseCustomDialog._invokeImpl<customDialogExample, __Options_customDialogExample>(((): customDialogExample => {
      const instance = new customDialogExample(false, ({let gensym___249621102 = storage;
      (((gensym___249621102) == (null)) ? undefined : gensym___249621102())}));
      if (controller) {
        instance.__setDialogController__((controller as CustomDialogController))
      }
      return instance;
    }), initializers, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_customDialogExample, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): customDialogExample {
    throw new Error("Declare interface");
  }
  
  private __backing_controller?: CustomDialogController;
  public get controller(): CustomDialogController {
    return (this.__backing_controller as CustomDialogController);
  }
  
  public set controller(value: CustomDialogController) {
    this.__backing_controller = value;
  }
  
  @Memo() 
  public build() {}
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
  public __setDialogController__(controller: CustomDialogController): void {
    this.__backing_controller = controller;
  }
  
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    MyStateSample._invoke(undefined, undefined, undefined, undefined, undefined);
  }
  
  public static RegisterNamedRouter(routerName: string, instance: EntryPoint, param: NavInterface): void {
    EntryPoint.RegisterNamedRouter(routerName, instance, param);
  }
  
  public constructor() {}
  
}

@Entry() @Component() class __Options_MyStateSample {
  @State() public controller?: (CustomDialogController | null);
  public __backing_controller?: IStateDecoratedVariable<(CustomDialogController | null)>;
  public __options_has_controller?: boolean;
  public constructor() {}
  
}

@CustomDialog() @Component() class __Options_customDialogExample {
  public controller?: CustomDialogController;
  public __options_has_controller?: boolean;
  public constructor() {}
  
}

`

const expectedMemoScript: string = `

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { BaseCustomDialog as BaseCustomDialog } from "arkui.component.customComponent";

import { ReusePoolOwnership as ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, Entry as Entry, CustomDialogController as CustomDialogController, CustomDialog as CustomDialog } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/custom-dialog/custom-dialog-memo",
  pageFullPath: "test/demo/mock/decorators/custom-dialog/custom-dialog-memo",
  integratedHsp: "false",
} as NavInterface));
@Entry() @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_controller = STATE_MGMT_FACTORY.makeState<(CustomDialogController | null)>(this, "controller", ((({let gensym___93787132 = initializers;
    (((gensym___93787132) == (null)) ? undefined : gensym___93787132.controller)})) ?? (({let gensym___203542966: Any;
    gensym___203542966 = new CustomDialogController({
      builder: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (175145513)), 0);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        customDialogExample._invoke(__memo_context, ((__memo_id) + (47330804)), (() => {
          return {};
        }), undefined, (gensym___203542966 as CustomDialogController), undefined);
        {
          __memo_scope.recache();
          return;
        }
      }),
      autoCancel: false,
      openAnimation: {
        duration: 5000,
        tempo: 0,
      },
      closeAnimation: {
        duration: 5000,
        tempo: 0,
      },
      baseComponent: this,
    })
    (gensym___203542966 as CustomDialogController)}))));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {
    this.__backing_controller!.resetOnReuse(((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.controller)})) ?? (({let gensym___<some_random_number>: Any;
    gensym___203542966 = new CustomDialogController({
      builder: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (137225318)), 0);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        customDialogExample._invoke(__memo_context, ((__memo_id) + (241913892)), (() => {
          return {};
        }), undefined, (gensym___203542966 as CustomDialogController), undefined);
        {
          __memo_scope.recache();
          return;
        }
      }),
      autoCancel: false,
      openAnimation: {
        duration: 5000,
        tempo: 0,
      },
      closeAnimation: {
        duration: 5000,
        tempo: 0,
      },
      baseComponent: this,
    })
    (gensym___203542966 as CustomDialogController)}))));
  }
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(__memo_context, ((__memo_id) + (211301233)), style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  private __backing_controller?: IStateDecoratedVariable<(CustomDialogController | null)>;
  public get controller(): (CustomDialogController | null) {
    return this.__backing_controller!.get();
  }
  
  public set controller(value: (CustomDialogController | null)) {
    this.__backing_controller!.set(value);
  }
  
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (262345387)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
}

@CustomDialog() @Component() final struct customDialogExample extends BaseCustomDialog<customDialogExample, __Options_customDialogExample> {
  public __initializeStruct(initializers: (__Options_customDialogExample | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    if (({let gensym___249436970 = initializers;
    (((gensym___249436970) == (null)) ? undefined : gensym___249436970.__options_has_controller)})) {
      this.__backing_controller = initializers!.controller;
    } else {
      if (!(this.__backing_controller)) {
        this.__backing_controller = ({let gensym___17371929: Any;
        gensym___17371929 = new CustomDialogController({
          builder: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (46726221)), 0);
            if (__memo_scope.unchanged) {
              __memo_scope.cached;
              return;
            }
            {
              __memo_scope.recache();
              return;
            }
          }),
          autoCancel: false,
          openAnimation: {
            duration: 5000,
            tempo: 0,
          },
          closeAnimation: {
            duration: 5000,
            tempo: 0,
          },
          baseComponent: this,
        })
        (gensym___17371929 as CustomDialogController)})
      }
    }
  }
  
  public __updateStruct(initializers: (__Options_customDialogExample | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_customDialogExample | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, initializers: ((()=> __Options_customDialogExample) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    BaseCustomDialog._invokeImpl<customDialogExample, __Options_customDialogExample>(__memo_context, ((__memo_id) + (76711614)), ((): customDialogExample => {
      const instance = new customDialogExample(false, ({let gensym___249621102 = storage;
      (((gensym___249621102) == (null)) ? undefined : gensym___249621102())}));
      if (controller) {
        instance.__setDialogController__((controller as CustomDialogController))
      }
      return instance;
    }), initializers, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_customDialogExample, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): customDialogExample {
    throw new Error("Declare interface");
  }
  
  private __backing_controller?: CustomDialogController;
  public get controller(): CustomDialogController {
    return (this.__backing_controller as CustomDialogController);
  }
  
  public set controller(value: CustomDialogController) {
    this.__backing_controller = value;
  }
  
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (141017619)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
  public __setDialogController__(controller: CustomDialogController): void {
    this.__backing_controller = controller;
  }
  
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (97618858)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    MyStateSample._invoke(__memo_context, ((__memo_id) + (223657391)), undefined, undefined, undefined, undefined, undefined);
    {
      __memo_scope.recache();
      return;
    }
  }
  
  public static RegisterNamedRouter(routerName: string, instance: EntryPoint, param: NavInterface): void {
    EntryPoint.RegisterNamedRouter(routerName, instance, param);
  }
  
  public constructor() {}
  
}

@Entry() @Component() class __Options_MyStateSample {
  @State() public controller?: (CustomDialogController | null);
  public __backing_controller?: IStateDecoratedVariable<(CustomDialogController | null)>;
  public __options_has_controller?: boolean;
  public constructor() {}
  
}

@CustomDialog() @Component() class __Options_customDialogExample {
  public controller?: CustomDialogController;
  public __options_has_controller?: boolean;
  public constructor() {}
  
}

`;

function testUICheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}


function testMemoCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test memo transform of @CustomDialog',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUICheckedTransformer],
        'checked:memo-no-recheck': [testMemoCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
