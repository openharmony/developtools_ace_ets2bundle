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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'base-custom-dialog.ets'),
];

const pluginTester = new PluginTester('test basic capability of @CustomDialog', buildConfig);

const parsedTransform: Plugins = {
    name: 'base-custom-dialog',
    parsed: uiTransform().parsed,
};

const expectedScript: string = `
import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { memo as memo } from "arkui.stateManagement.runtime";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { BaseCustomDialog as BaseCustomDialog } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Text as Text, Column as Column, Component as Component, Entry as Entry, Button as Button, ClickEvent as ClickEvent } from "@ohos.arkui.component";

import { State as State, Link as Link, Prop as Prop } from "@ohos.arkui.stateManagement";

import { CustomDialog as CustomDialog, CustomDialogController as CustomDialogController, DismissDialogAction as DismissDialogAction, DismissReason as DismissReason, DialogAlignment as DialogAlignment, CustomDialogControllerOptions as CustomDialogControllerOptions } from "@ohos.arkui.component";

import hilog from "@ohos.hilog";

function main() {}

@CustomDialog() final struct CustomDialogExample extends BaseCustomDialog<CustomDialogExample, __Options_CustomDialogExample> {
  public __initializeStruct(initializers: (__Options_CustomDialogExample | undefined), @memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___45519047 = initializers;
    (((gensym___45519047) == (null)) ? undefined : gensym___45519047.aaController)})) {
      this.__backing_aaController = ((({let gensym___180078470 = initializers;
      (((gensym___180078470) == (null)) ? undefined : gensym___180078470.aaController)})) ?? (undefined));
    }
    this.__backing_text = STATE_MGMT_FACTORY.makeState<string>(this, "text", ((({let gensym___217676902 = initializers;
    (((gensym___217676902) == (null)) ? undefined : gensym___217676902.text)})) ?? ("text")));
    this.__backing_cancel = ((({let gensym___25471281 = initializers;
    (((gensym___25471281) == (null)) ? undefined : gensym___25471281.cancel)})) ?? ((() => {})));
    this.__backing_confirm = ((({let gensym___213253394 = initializers;
    (((gensym___213253394) == (null)) ? undefined : gensym___213253394.confirm)})) ?? ((() => {})));
    this.__backing_hh = STATE_MGMT_FACTORY.makeState<string>(this, "hh", ((({let gensym___210200872 = initializers;
    (((gensym___210200872) == (null)) ? undefined : gensym___210200872.hh)})) ?? ("nihao")));
  }

  public __updateStruct(initializers: (__Options_CustomDialogExample | undefined)): void {}

  private __backing_aaController?: (CustomDialogController | undefined);

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

  private __backing_cancel?: (()=> void);

  public get cancel(): (()=> void) {
    return (this.__backing_cancel as (()=> void));
  }

  public set cancel(value: (()=> void)) {
    this.__backing_cancel = value;
  }

  private __backing_confirm?: (()=> void);

  public get confirm(): (()=> void) {
    return (this.__backing_confirm as (()=> void));
  }

  public set confirm(value: (()=> void)) {
    this.__backing_confirm = value;
  }

  private __backing_hh?: IStateDecoratedVariable<string>;

  public get hh(): string {
    return this.__backing_hh!.get();
  }

  public set hh(value: string) {
    this.__backing_hh!.set(value);
  }

  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      TextImpl(@memo() ((instance: TextAttribute): void => {
        instance.setTextOptions("CustomDialog One", undefined).fontSize(30).height(100).applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("Close", undefined).onClick(((e: ClickEvent) => {
          if (((this.aaController) != (undefined))) {
            this.aaController!.close();
          }
        })).margin(20).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }

  public constructor() {}

  public __setDialogController__(controller: CustomDialogController): void {
    this.__backing_aaController = controller;
  }
}

@Component() final struct CustomDialogUser extends CustomComponent<CustomDialogUser, __Options_CustomDialogUser> {
  public __initializeStruct(initializers: (__Options_CustomDialogUser | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_dialogController = ((({let gensym___56650533 = initializers;
    (((gensym___56650533) == (null)) ? undefined : gensym___56650533.dialogController)})) ?? (({let gensym___249621102: Any;
    gensym___249621102 = new CustomDialogController({
      builder: @memo() (() => {
        CustomDialogExample._instantiateImpl(undefined, (() => {
          const instance = new CustomDialogExample();
          instance.__setDialogController__((gensym___249621102 as CustomDialogController));
          return instance;
        }), {
          cancel: (() => {
            this.onCancel();
          }),
          __options_has_cancel: true,
          confirm: (() => {
            this.onAccept();
          }),
          __options_has_confirm: true,
        }, undefined);
      }),
      cancel: this.existApp,
      autoCancel: true,
      alignment: DialogAlignment.Center,
      offset: {
        dx: 0,
        dy: -20,
      },
      gridCount: 4,
      showInSubWindow: true,
      isModal: true,
      customStyle: false,
      cornerRadius: 10,
      focusable: true,
      baseComponent: this,
    })
    (gensym___249621102 as CustomDialogController)})));
  }

  public __updateStruct(initializers: (__Options_CustomDialogUser | undefined)): void {}

  private __backing_dialogController?: (CustomDialogController | null);

  public get dialogController(): (CustomDialogController | null) {
    return (this.__backing_dialogController as (CustomDialogController | null));
  }

  public set dialogController(value: (CustomDialogController | null)) {
    this.__backing_dialogController = value;
  }

  public aboutToDisappear() {
    this.dialogController = null;
  }

  public onCancel() {
    console.info("Callback when the first button is clicked");
  }

  public onAccept() {
    console.info("Callback when the second button is clicked");
  }

  public existApp() {
    console.info("Click the callback in the blank area");
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
        })).backgroundColor(0x317aff).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }

  public constructor() {}

}

@CustomDialog() export interface __Options_CustomDialogExample {
  set aaController(aaController: ((CustomDialogController | undefined) | undefined))

  get aaController(): ((CustomDialogController | undefined) | undefined)
  set __options_has_aaController(__options_has_aaController: (boolean | undefined))
  
  get __options_has_aaController(): (boolean | undefined)
  set text(text: (string | undefined))

  get text(): (string | undefined)
  set __backing_text(__backing_text: (IStateDecoratedVariable<string> | undefined))

  get __backing_text(): (IStateDecoratedVariable<string> | undefined)
  set __options_has_text(__options_has_text: (boolean | undefined))
  
  get __options_has_text(): (boolean | undefined)
  set cancel(cancel: ((()=> void) | undefined))

  get cancel(): ((()=> void) | undefined)
  set __options_has_cancel(__options_has_cancel: (boolean | undefined))
  
  get __options_has_cancel(): (boolean | undefined)
  set confirm(confirm: ((()=> void) | undefined))

  get confirm(): ((()=> void) | undefined)
  set __options_has_confirm(__options_has_confirm: (boolean | undefined))
  
  get __options_has_confirm(): (boolean | undefined)
  set hh(hh: (string | undefined))

  get hh(): (string | undefined)
  set __backing_hh(__backing_hh: (IStateDecoratedVariable<string> | undefined))

  get __backing_hh(): (IStateDecoratedVariable<string> | undefined)
  set __options_has_hh(__options_has_hh: (boolean | undefined))
  
  get __options_has_hh(): (boolean | undefined)
  
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
    'test basic capability of @CustomDialog',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
