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
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
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

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { BaseCustomDialog as BaseCustomDialog } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Text as Text, Column as Column, Component as Component, Entry as Entry, Button as Button, ClickEvent as ClickEvent } from "@ohos.arkui.component";

import { CustomDialog as CustomDialog, CustomDialogController as CustomDialogController, CustomDialogControllerOptions as CustomDialogControllerOptions } from "@kit.ArkUI";

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
  
  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {}));
  }
  
  public constructor() {}
  
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
    this.__backing_dialogController = ((({let gensym___176924847 = initializers;
    (((gensym___176924847) == (null)) ? undefined : gensym___176924847.dialogController)})) ?? ((({let gensym___46528967: Any;
    gensym___46528967 = new CustomDialogController(({
      gridCount: 4,
      showInSubWindow: true,
      builder: @memo() (() => {
        CustomDialogExample._instantiateImpl(undefined, (() => {
          const instance = new CustomDialogExample();
          instance.__setDialogController__((gensym___46528967 as CustomDialogController));
          return instance;
        }), undefined, undefined);
      }),
      baseComponent: this,
    } as CustomDialogControllerOptions))
    (gensym___46528967 as CustomDialogController)}) as DialogControllerV3)));
  }
  
  public __updateStruct(initializers: (__Options_CustomDialogUser | undefined)): void {}
  
  private __backing_dialogController?: (CustomDialogController | null);
  
  public get dialogController(): (CustomDialogController | null) {
    return (this.__backing_dialogController as (CustomDialogController | null));
  }
  
  public set dialogController(value: (CustomDialogController | null)) {
    this.__backing_dialogController = value;
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
  
  public constructor() {}
  
}

@CustomDialog() export interface __Options_CustomDialogExample {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'aaController', '((CustomDialogController | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_aaController', '(boolean | undefined)')}
  
}

@Component() export interface __Options_CustomDialogUser {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'dialogController', '((CustomDialogController | null) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_dialogController', '(boolean | undefined)')}
  
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
