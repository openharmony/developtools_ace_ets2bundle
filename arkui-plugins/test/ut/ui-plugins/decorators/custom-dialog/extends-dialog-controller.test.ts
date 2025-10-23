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
import { recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const FUNCTION_DIR_PATH: string = 'decorators/custom-dialog';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'extends-dialog-controller.ets'),
];

const pluginTester = new PluginTester('test extends class of CutomDialogController', buildConfig);

const parsedTransform: Plugins = {
    name: 'extends-dialog-controller',
    parsed: uiTransform().parsed,
};

const expectedScript: string = `
import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { BaseCustomDialog as BaseCustomDialog } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Text as Text, Column as Column, Component as Component, Entry as Entry, Button as Button, ClickEvent as ClickEvent } from "@ohos.arkui.component";

import { CustomDialog as CustomDialog, CustomDialogController as CustomDialogController, CustomDialogControllerOptions as CustomDialogControllerOptions } from "@ohos.arkui.component";

function main() {}

@CustomDialog() final struct CustomDialogExample extends BaseCustomDialog<CustomDialogExample, __Options_CustomDialogExample> {
  public __initializeStruct(initializers: (__Options_CustomDialogExample | undefined), @memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___45519047 = initializers;
    (((gensym___45519047) == (null)) ? undefined : gensym___45519047.aaController)})) {
      this.__backing_aaController = ((({let gensym___180078470 = initializers;
      (((gensym___180078470) == (null)) ? undefined : gensym___180078470.aaController)})) ?? (undefined));
    }
  }

  public __updateStruct(initializers: (__Options_CustomDialogExample | undefined)): void {}

  private __backing_aaController?: (CustomDialogController | undefined);

  public get aaController(): (CustomDialogController | undefined) {
    return (this.__backing_aaController as (CustomDialogController | undefined));
  }

  public set aaController(value: (CustomDialogController | undefined)) {
    this.__backing_aaController = value;
  }
  
  @MemoIntrinsic() public static _invoke(initializers: ((()=> __Options_CustomDialogExample) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @memo() content: ((()=> void) | undefined)): void {
    BaseCustomDialog._invokeImpl<CustomDialogExample, __Options_CustomDialogExample>(((): CustomDialogExample => {
      const instance = new CustomDialogExample(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
      instance.__setDialogController__((controller as CustomDialogController));
      return instance;
    }), initializers, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_CustomDialogExample, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): CustomDialogExample {
    throw new Error("Declare interface");
  }

  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {}));
  }
  
  constructor(useSharedStorage: (boolean | undefined)) {
    this(useSharedStorage, undefined);
  }
  
  constructor() {
    this(undefined, undefined);
  }
  
  public constructor(useSharedStorage: (boolean | undefined), storage: (LocalStorage | undefined)) {
    super(useSharedStorage, storage);
  }
  
  public __setDialogController__(controller: CustomDialogController): void {
    this.__backing_aaController = controller;
  }
}

class DialogControllerV2 extends CustomDialogController {
  public options: CustomDialogControllerOptions;

  public constructor(options: CustomDialogControllerOptions) {
    super(options);
    this.options = options;
  }

}

class DialogControllerV3 extends DialogControllerV2 {
  public options: CustomDialogControllerOptions;

  public constructor(options: CustomDialogControllerOptions) {
    super(options);
    this.options = options;
  }

}

@Component() final struct CustomDialogUser extends CustomComponent<CustomDialogUser, __Options_CustomDialogUser> {
  public __initializeStruct(initializers: (__Options_CustomDialogUser | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_dialogController = ((({let gensym___220374545 = initializers;
    (((gensym___220374545) == (null)) ? undefined : gensym___220374545.dialogController)})) ?? ((({let gensym___17371929: Any;
    gensym___17371929 = new CustomDialogController(({
      gridCount: 4,
      showInSubWindow: true,
      builder: @memo() (() => {
        CustomDialogExample._invoke(undefined, undefined, (gensym___17371929 as CustomDialogController), undefined);
      }),
      baseComponent: this,
    } as CustomDialogControllerOptions))
    (gensym___17371929 as CustomDialogController)}) as DialogControllerV3)));
  }

  public __updateStruct(initializers: (__Options_CustomDialogUser | undefined)): void {}

  private __backing_dialogController?: (CustomDialogController | null);

  public get dialogController(): (CustomDialogController | null) {
    return (this.__backing_dialogController as (CustomDialogController | null));
  }

  public set dialogController(value: (CustomDialogController | null)) {
    this.__backing_dialogController = value;
  }
  
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: CustomDialogUser)=> void), initializers: ((()=> __Options_CustomDialogUser) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<CustomDialogUser, __Options_CustomDialogUser>(style, ((): CustomDialogUser => {
      return new CustomDialogUser(false, ({let gensym___192738000 = storage;
      (((gensym___192738000) == (null)) ? undefined : gensym___192738000())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_CustomDialogUser, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): CustomDialogUser {
    throw new Error("Declare interface");
  }

  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      ButtonImpl(@memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("click me", undefined).onClick(((e: ClickEvent) => {
          if (((this.dialogController) != (null))) {
            this.dialogController!.open();
          }
        })).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }

  constructor(useSharedStorage: (boolean | undefined)) {
    this(useSharedStorage, undefined);
  }

  constructor() {
    this(undefined, undefined);
  }

  public constructor(useSharedStorage: (boolean | undefined), storage: (LocalStorage | undefined)) {
    super(useSharedStorage, storage);
  }

}

@CustomDialog() export interface __Options_CustomDialogExample {
  set aaController(aaController: ((CustomDialogController | undefined) | undefined))

  get aaController(): ((CustomDialogController | undefined) | undefined)
  set __options_has_aaController(__options_has_aaController: (boolean | undefined))
  
  get __options_has_aaController(): (boolean | undefined)
  
}

@Component() export interface __Options_CustomDialogUser {
  set dialogController(dialogController: ((CustomDialogController | null) | undefined))

  get dialogController(): ((CustomDialogController | null) | undefined)
  set __options_has_dialogController(__options_has_dialogController: (boolean | undefined))
  
  get __options_has_dialogController(): (boolean | undefined)
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test extends class of CutomDialogController',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
