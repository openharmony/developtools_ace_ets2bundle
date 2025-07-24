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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'controller-in-method.ets'),
];

const pluginTester = new PluginTester('test CutomDialogController assignment in method', buildConfig);

const parsedTransform: Plugins = {
    name: 'controller-in-method',
    parsed: uiTransform().parsed,
};

const expectedScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";
import { BaseCustomDialog as BaseCustomDialog } from "arkui.component.customComponent";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component, CustomDialog as CustomDialog, CustomDialogController as CustomDialogController } from "@ohos.arkui.component";
import hilog from "@ohos.hilog";

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
  
  public __setDialogController__(controller: CustomDialogController): void {
    this.__backing_aaController = controller;
  }
  
  @memo() public build() {}
  
  private constructor() {}
  
}

@Component() final struct CustomDialogUser extends CustomComponent<CustomDialogUser, __Options_CustomDialogUser> {
  public __initializeStruct(initializers: (__Options_CustomDialogUser | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_dialogController = ((({let gensym___95501822 = initializers;
    (((gensym___95501822) == (null)) ? undefined : gensym___95501822.dialogController)})) ?? (({let gensym___46528967: Any;
    gensym___46528967 = new CustomDialogController({
      builder: @memo() (() => {
        CustomDialogExample._instantiateImpl(undefined, (() => {
          const instance = new CustomDialogExample();
          instance.__setDialogController__((gensym___46528967 as CustomDialogController));
          return instance;
        }), {}, undefined);
      }),
      baseComponent: this,
    })
    (gensym___46528967 as CustomDialogController)})));
  }
  
  public __updateStruct(initializers: (__Options_CustomDialogUser | undefined)): void {}
  
  private __backing_dialogController?: (CustomDialogController | null);
  
  public get dialogController(): (CustomDialogController | null) {
    return (this.__backing_dialogController as (CustomDialogController | null));
  }
  
  public set dialogController(value: (CustomDialogController | null)) {
    this.__backing_dialogController = value;
  }
  
  public updateController1() {
    this.dialogController = ({let gensym___17371929: Any;
    gensym___17371929 = new CustomDialogController({
      builder: @memo() (() => {
        CustomDialogExample._instantiateImpl(undefined, (() => {
          const instance = new CustomDialogExample();
          instance.__setDialogController__((gensym___17371929 as CustomDialogController));
          return instance;
        }), {}, undefined);
      }),
      autoCancel: true,
      baseComponent: this,
    })
    (gensym___17371929 as CustomDialogController)});
  }
  
  public updateController2() {
    let temp = ({let gensym___90667230: Any;
    gensym___90667230 = new CustomDialogController({
      builder: @memo() (() => {
        CustomDialogExample._instantiateImpl(undefined, (() => {
          const instance = new CustomDialogExample();
          instance.__setDialogController__((gensym___90667230 as CustomDialogController));
          return instance;
        }), {}, undefined);
      }),
      autoCancel: true,
      baseComponent: this,
    })
    (gensym___90667230 as CustomDialogController)});
    this.dialogController = temp;
  }
  
  @memo() public build() {}
  
  private constructor() {}
  
}

@CustomDialog() export interface __Options_CustomDialogExample {
  set aaController(aaController: ((CustomDialogController | undefined) | undefined))
  
  get aaController(): ((CustomDialogController | undefined) | undefined)
  
}

@Component() export interface __Options_CustomDialogUser {
  set dialogController(dialogController: ((CustomDialogController | null) | undefined))
  
  get dialogController(): ((CustomDialogController | null) | undefined)
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test CutomDialogController assignment in method',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
