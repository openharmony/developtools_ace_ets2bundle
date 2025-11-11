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
import { dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../../utils/simplify-dump';
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

const expectedScript: string = `
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
    if (({let gensym___231706081 = initializers;
    (((gensym___231706081) == (null)) ? undefined : gensym___231706081.__options_has_aaController)})) {
      this.__backing_aaController = initializers!.aaController
    } else {
      if (!(this.__backing_aaController)) {
        this.__backing_aaController = undefined
      }
    }
    this.__backing_text = STATE_MGMT_FACTORY.makeState<string>(this, "text", ((({let gensym___217676902 = initializers;
    (((gensym___217676902) == (null)) ? undefined : gensym___217676902.text)})) ?? ("text")));
    this.__backing_hh = STATE_MGMT_FACTORY.makeState<string>(this, "hh", ((({let gensym___112288773 = initializers;
    (((gensym___112288773) == (null)) ? undefined : gensym___112288773.hh)})) ?? ("nihao")));
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

  private __backing_hh?: IStateDecoratedVariable<string>;

  public get hh(): string {
    return this.__backing_hh!.get();
  }

  public set hh(value: string) {
    this.__backing_hh!.set(value);
  }
  
  @MemoIntrinsic() public static _invoke(initializers: ((()=> __Options_CustomDialogExample) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: ((()=> void) | undefined)): void {
    BaseCustomDialog._invokeImpl<CustomDialogExample, __Options_CustomDialogExample>(((): CustomDialogExample => {
      const instance = new CustomDialogExample(false, ({let gensym___17371929 = storage;
      (((gensym___17371929) == (null)) ? undefined : gensym___17371929())}));
      instance.__setDialogController__((controller as CustomDialogController));
      return instance;
    }), initializers, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_CustomDialogExample, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): CustomDialogExample {
    throw new Error("Declare interface");
  }
  
  @Memo() public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions("CustomDialog One", undefined).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  ${dumpConstructor()}
  
  public __setDialogController__(controller: CustomDialogController): void {
    this.__backing_aaController = controller;
  }
}

@Component() final struct CustomDialogUser extends CustomComponent<CustomDialogUser, __Options_CustomDialogUser> {
  public __initializeStruct(initializers: (__Options_CustomDialogUser | undefined), @Memo() content: ((()=> void) | undefined)): void {}

  public __updateStruct(initializers: (__Options_CustomDialogUser | undefined)): void {}

  @MemoIntrinsic() public static _invoke(style: @Memo() ((instance: CustomDialogUser)=> void), initializers: ((()=> __Options_CustomDialogUser) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<CustomDialogUser, __Options_CustomDialogUser>(style, ((): CustomDialogUser => {
      return new CustomDialogUser(false, ({let gensym___192738000 = storage;
      (((gensym___192738000) == (null)) ? undefined : gensym___192738000())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_CustomDialogUser, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): CustomDialogUser {
    throw new Error("Declare interface");
  }

  @Memo() public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("click me", undefined).onClick(((e: ClickEvent) => {
          let dialogController: (CustomDialogController | undefined) = ({let gensym___90667230: Any;
          gensym___90667230 = new CustomDialogController({
            builder: @Memo() (() => {
              CustomDialogExample._invoke((() => {
                return {};
              }), undefined, (gensym___90667230 as CustomDialogController), undefined);
            }),
            baseComponent: this,
          })
          (gensym___90667230 as CustomDialogController)});
        })).backgroundColor(0x317aff).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }

  ${dumpConstructor()}
}

@CustomDialog() export interface __Options_CustomDialogExample {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'aaController', '((CustomDialogController | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_aaController', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'text', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_text', '(IStateDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_text', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'hh', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_hh', '(IStateDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_hh', '(boolean | undefined)')}
  
}

@Component() export interface __Options_CustomDialogUser {

}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test CustomDialogController in build',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
