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
import { beforeUINoRecheck, collectNoRecheck, memoNoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor, dumpAnnotation } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const FUNCTION_DIR_PATH: string = 'decorators/custom-dialog';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'controller-in-build.ets'),
];

const pluginTester = new PluginTester('test CustomDialogController in build', buildConfig);

const parsedTransform: Plugins = {
    name: 'controller-in-build',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { BaseCustomDialog as BaseCustomDialog } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, Button as Button, ClickEvent as ClickEvent } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

import { CustomDialog as CustomDialog, CustomDialogController as CustomDialogController, CustomDialogControllerOptions as CustomDialogControllerOptions } from "@ohos.arkui.component";

import hilog from "@ohos.hilog";

function main() {}

@CustomDialog() final struct CustomDialogExample extends BaseCustomDialog<CustomDialogExample, __Options_CustomDialogExample> {
  public __initializeStruct(initializers: (__Options_CustomDialogExample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_aaController)})) {
      this.__backing_aaController = initializers!.aaController;
    } else {
      if (!(this.__backing_aaController)) {
        this.__backing_aaController = undefined
      }
    }
    this.__backing_text = STATE_MGMT_FACTORY.makeState<string>(this, "text", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_text)}) ? (initializers!.text as string) : ("text" as string)));
    this.__backing_hh = STATE_MGMT_FACTORY.makeState<string>(this, "hh", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_hh)}) ? (initializers!.hh as string) : ("nihao" as string)));
  }
  public __updateStruct(initializers: (__Options_CustomDialogExample | undefined)): void {}
  @MemoIntrinsic() 
  public static _invoke(initializers: ((()=> __Options_CustomDialogExample) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: ((()=> void) | undefined)): void {
    BaseCustomDialog._invokeImpl<CustomDialogExample, __Options_CustomDialogExample>(((): CustomDialogExample => {
      const instance = new CustomDialogExample(false, ({let gensym___<some_random_number> = storage;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
      if (controller) {
        instance.__setDialogController__((controller as CustomDialogController))
      }
      return instance;
    }), initializers, content);
  }
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_CustomDialogExample, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): CustomDialogExample {
    throw new Error("Declare interface");
  }
  private __backing_aaController?: (CustomDialogController | undefined | undefined);
  public get aaController(): (CustomDialogController | undefined) {
    return (this.__backing_aaController as (CustomDialogController | undefined));
  }
  public set aaController(value: (CustomDialogController | undefined)) {
    this.__backing_aaController = value;
  }
  private __backing_text?: IStateDecoratedVariable<string>;
  public get text(): string {
    return this.__backing_text!.get();
  }
  public set text(value: string) {
    this.__backing_text!.set(value);
  }
  private __backing_hh?: IStateDecoratedVariable<string>;
  public get hh(): string {
    return this.__backing_hh!.get();
  }
  public set hh(value: string) {
    this.__backing_hh!.set(value);
  }
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions("CustomDialog One", undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  static {
  }
  public __setDialogController__(controller: CustomDialogController): void {
    this.__backing_aaController = controller;
  }
  }
  @Component() final struct CustomDialogUser extends CustomComponent<CustomDialogUser, __Options_CustomDialogUser> {
  public __initializeStruct(initializers: (__Options_CustomDialogUser | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  public __updateStruct(initializers: (__Options_CustomDialogUser | undefined)): void {}
  public resetStateVarsOnReuse(initializers: (__Options_CustomDialogUser | undefined)): void {}
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: CustomDialogUser)=> void) | undefined), initializers: ((()=> __Options_CustomDialogUser) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<CustomDialogUser, __Options_CustomDialogUser>(style, ((): CustomDialogUser => {
      return new CustomDialogUser(false, ({let gensym___<some_random_number> = storage;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
    }), initializers, reuseId, content);
  }
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_CustomDialogUser, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): CustomDialogUser {
    throw new Error("Declare interface");
  }
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("click me", undefined).onClick(((e: ClickEvent) => {
          let dialogController: (CustomDialogController | undefined) = ({let gensym___<some_random_number>: Any;
          gensym___<some_random_number> = new CustomDialogController({
            builder: @Memo() (() => {
              CustomDialogExample._invoke((() => {
                return {};
              }), undefined, (gensym___<some_random_number> as CustomDialogController), undefined);
            }),
            baseComponent: this,
          })
          (gensym___<some_random_number> as CustomDialogController)});
        })).backgroundColor(0x317aff);
        instance.applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  static {
  }
}
@CustomDialog() class __Options_CustomDialogExample {
  public aaController?: (CustomDialogController | undefined);
  public __options_has_aaController?: boolean;
  @State() public text?: string;
  public __backing_text?: IStateDecoratedVariable<string>;
  public __options_has_text?: boolean;
  @State() public hh?: string;
  public __backing_hh?: IStateDecoratedVariable<string>;
  public __options_has_hh?: boolean;
  public constructor() {}
}
@Component() class __Options_CustomDialogUser {
  public constructor() {}
}
`;

function testUICheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
function main() {}
@CustomDialog() final struct CustomDialogExample extends BaseCustomDialog<CustomDialogExample, __Options_CustomDialogExample> {
  public __initializeStruct(initializers: (__Options_CustomDialogExample | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_aaController)})) {
      this.__backing_aaController = initializers!.aaController;
    } else {
      if (!(this.__backing_aaController)) {
        this.__backing_aaController = undefined
      }
    }
    this.__backing_text = STATE_MGMT_FACTORY.makeState<string>(this, "text", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_text)}) ? (initializers!.text as string) : ("text" as string)));
    this.__backing_hh = STATE_MGMT_FACTORY.makeState<string>(this, "hh", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_hh)}) ? (initializers!.hh as string) : ("nihao" as string)));
  }

  public __updateStruct(initializers: (__Options_CustomDialogExample | undefined)): void {}

  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, initializers: ((()=> __Options_CustomDialogExample) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    BaseCustomDialog._invokeImpl<CustomDialogExample, __Options_CustomDialogExample>(__memo_context, ((__memo_id) + (<some_random_number>)), ((): CustomDialogExample => {
      const instance = new CustomDialogExample(false, ({let gensym___<some_random_number> = storage;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
      if (controller) {
        instance.__setDialogController__((controller as CustomDialogController))
      }
      return instance;
    }), initializers, content);
  }

  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_CustomDialogExample, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): CustomDialogExample {
    throw new Error("Declare interface");
  }

  private __backing_aaController?: (CustomDialogController | undefined | undefined);

  public get aaController(): (CustomDialogController | undefined) {
    return (this.__backing_aaController as (CustomDialogController | undefined));
  }

  public set aaController(value: (CustomDialogController | undefined)) {
    this.__backing_aaController = value;
  }

  private __backing_text?: IStateDecoratedVariable<string>;

  public get text(): string {
    return this.__backing_text!.get();
  }

  public set text(value: string) {
    this.__backing_text!.set(value);
  }

  private __backing_hh?: IStateDecoratedVariable<string>;

  public get hh(): string {
    return this.__backing_hh!.get();
  }

  public set hh(value: string) {
    this.__backing_hh!.set(value);
  }

  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
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
      __memo_parameter_instance.value.setColumnOptions(undefined);
      __memo_parameter_instance.value.applyAttributesFinish();
      {
        __memo_scope.recache();
        return;
      }
    }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
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
        __memo_parameter_instance.value.setTextOptions("CustomDialog One", undefined);
        __memo_parameter_instance.value.applyAttributesFinish();
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

  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

  static {
  }

  public __setDialogController__(controller: CustomDialogController): void {
    this.__backing_aaController = controller;
  }
  }

  @Component() final struct CustomDialogUser extends CustomComponent<CustomDialogUser, __Options_CustomDialogUser> {
  public __initializeStruct(initializers: (__Options_CustomDialogUser | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}

  public __updateStruct(initializers: (__Options_CustomDialogUser | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_CustomDialogUser | undefined)): void {}

  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: CustomDialogUser)=> void) | undefined), initializers: ((()=> __Options_CustomDialogUser) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<CustomDialogUser, __Options_CustomDialogUser>(__memo_context, ((__memo_id) + (<some_random_number>)), style, ((): CustomDialogUser => {
      return new CustomDialogUser(false, ({let gensym___<some_random_number> = storage;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
    }), initializers, reuseId, content);
  }

  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_CustomDialogUser, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): CustomDialogUser {
    throw new Error("Declare interface");
  }

  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
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
      __memo_parameter_instance.value.setColumnOptions(undefined);
      __memo_parameter_instance.value.applyAttributesFinish();
      {
        __memo_scope.recache();
        return;
      }
    }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      ButtonImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ButtonAttribute): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
        const __memo_parameter_instance = __memo_scope.param(0, instance);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        __memo_parameter_instance.value.setButtonOptions("click me", undefined).onClick(((e: ClickEvent) => {
          let dialogController: (CustomDialogController | undefined) = ({let gensym___<some_random_number>: Any;
          gensym___<some_random_number> = new CustomDialogController({
            builder: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
              const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
              if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
              }
              CustomDialogExample._invoke(__memo_context, ((__memo_id) + (<some_random_number>)), (() => {
                return {};
              }), undefined, (gensym___<some_random_number> as CustomDialogController), undefined);
              {
                __memo_scope.recache();
                return;
              }
            }),
            baseComponent: this,
          })
          (gensym___<some_random_number> as CustomDialogController)});
        })).backgroundColor(0x317aff);
        __memo_parameter_instance.value.applyAttributesFinish();
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

  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

  static {
  }
}

@CustomDialog() class __Options_CustomDialogExample {
  public aaController?: (CustomDialogController | undefined);
  public __options_has_aaController?: boolean;
  @State() public text?: string;
  public __backing_text?: IStateDecoratedVariable<string>;
  public __options_has_text?: boolean;
  @State() public hh?: string;
  public __backing_hh?: IStateDecoratedVariable<string>;
  public __options_has_hh?: boolean;
  public constructor() {}

}

@Component() class __Options_CustomDialogUser {
  public constructor() {}
}
`;

function testMemoCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}
pluginTester.run(
    'test CustomDialogController in build',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUICheckedTransformer],
        'checked:memo-no-recheck': [testMemoCheckedTransformer]
    },
    {
        stopAfter: 'checked',
    }
);
