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
import { beforeUINoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../../utils/simplify-dump';
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
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { BaseCustomDialog as BaseCustomDialog } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, CustomDialog as CustomDialog, CustomDialogController as CustomDialogController } from "@ohos.arkui.component";

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
  public static $_invoke(initializers?: __Options_CustomDialogExample, storage?: LocalStorage, @Builder() content?: (()=> void)): CustomDialogExample {
    throw new Error("Declare interface");
  }

  private __backing_aaController?: (CustomDialogController | undefined);

  public get aaController(): (CustomDialogController | undefined) {
    return (this.__backing_aaController as (CustomDialogController | undefined));
  }

  public set aaController(value: (CustomDialogController | undefined)) {
    this.__backing_aaController = value;
  }

  @Memo() 
  public build() {}

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
  public __initializeStruct(initializers: (__Options_CustomDialogUser | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_dialogController = ((({let gensym___95501822 = initializers;
    (((gensym___95501822) == (null)) ? undefined : gensym___95501822.dialogController)})) ?? (({let gensym___46528967: Any;
    gensym___46528967 = new CustomDialogController({
      builder: @Memo() (() => {
        CustomDialogExample._invoke((() => {
          return {};
        }), undefined, (gensym___46528967 as CustomDialogController), undefined);
      }),
      baseComponent: this,
    })
    (gensym___46528967 as CustomDialogController)})));
  }

  public __updateStruct(initializers: (__Options_CustomDialogUser | undefined)): void {}

  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: CustomDialogUser)=> void) | undefined), initializers: ((()=> __Options_CustomDialogUser) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<CustomDialogUser, __Options_CustomDialogUser>(style, ((): CustomDialogUser => {
      return new CustomDialogUser(false, ({let gensym___<some_random_number> = storage;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
    }), initializers, reuseId, content);
  }

  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_CustomDialogUser, storage?: LocalStorage, @Builder() content?: (()=> void)): CustomDialogUser {
    throw new Error("Declare interface");
  }

  private __backing_dialogController?: (CustomDialogController | null);

  public get dialogController(): (CustomDialogController | null) {
    return (this.__backing_dialogController as (CustomDialogController | null));
  }

  public set dialogController(value: (CustomDialogController | null)) {
    this.__backing_dialogController = value;
  }

  public updateController1() {
    this.dialogController = ({let gensym___<some_random_number>: Any;
    gensym___<some_random_number> = new CustomDialogController({
      builder: @Memo() (() => {
        CustomDialogExample._invoke((() => {
          return {};
        }), undefined, (gensym___<some_random_number> as CustomDialogController), undefined);
      }),
      autoCancel: true,
      baseComponent: this,
    })
    (gensym___<some_random_number> as CustomDialogController)});
  }

  public updateController2() {
    let temp = ({let gensym___<some_random_number>: Any;
    gensym___<some_random_number> = new CustomDialogController({
      builder: @Memo() (() => {
        CustomDialogExample._invoke((() => {
          return {};
        }), undefined, (gensym___<some_random_number> as CustomDialogController), undefined);
      }),
      autoCancel: true,
      baseComponent: this,
    })
    (gensym___<some_random_number> as CustomDialogController)});
    this.dialogController = temp;
  }

  @Memo() 
  public build() {}

  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  static {
  }

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
    'test CutomDialogController assignment in method',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
