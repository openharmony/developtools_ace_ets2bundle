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
import { dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const FUNCTION_DIR_PATH: string = 'decorators/custom-dialog';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'declare-custom-dialog.ets'),
];

const pluginTester = new PluginTester('test declared struct @CustomDialog transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed,
};

const expectedCheckedScript: string = `
import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { memo as memo } from "arkui.stateManagement.runtime";

import { BaseCustomDialog as BaseCustomDialog } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { State as State } from "@ohos.arkui.stateManagement";

import { CustomDialog as CustomDialog, CustomDialogController as CustomDialogController, ComponentV2 as ComponentV2, Component as Component, Builder as Builder } from "@ohos.arkui.component";

function main() {}

@CustomDialog() export declare final struct CustomDialogExample extends BaseCustomDialog<CustomDialogExample, __Options_CustomDialogExample> {
  @MemoIntrinsic() public static _invoke(initializers: ((()=> __Options_CustomDialogExample) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @memo() content: ((()=> void) | undefined)): void
  @ComponentBuilder() public static $_invoke(initializers?: __Options_CustomDialogExample, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): CustomDialogExample
  public aaController?: (CustomDialogController | undefined);
  @State() public text: string;
  public hh: string;
  @memo() public build(): void
  constructor(useSharedStorage: (boolean | undefined))
  constructor()
  public constructor(useSharedStorage: (boolean | undefined), storage: (LocalStorage | undefined))
  public static _buildCompatibleNode(options: __Options_CustomDialogExample): void
  public __setDialogController__(controller: CustomDialogController): void

}

@Component() final struct CustomDialogUserV1 extends CustomComponent<CustomDialogUserV1, __Options_CustomDialogUserV1> {
  public __initializeStruct(initializers: (__Options_CustomDialogUserV1 | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_dialogController = ((({let gensym___145518823 = initializers;
    (((gensym___145518823) == (null)) ? undefined : gensym___145518823.dialogController)})) ?? (({let gensym___149025070: Any;
    gensym___149025070 = new CustomDialogController({
      builder: @memo() (() => {
        CustomDialogExample._invoke(undefined, undefined, (gensym___149025070 as CustomDialogController), undefined);
      }),
      baseComponent: this,
    })
    (gensym___149025070 as CustomDialogController)})));
  }

  public __updateStruct(initializers: (__Options_CustomDialogUserV1 | undefined)): void {}

  private __backing_dialogController?: (CustomDialogController | null);

  public get dialogController(): (CustomDialogController | null) {
    return (this.__backing_dialogController as (CustomDialogController | null));
  }

  public set dialogController(value: (CustomDialogController | null)) {
    this.__backing_dialogController = value;
  }
  
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: CustomDialogUserV1)=> void), initializers: ((()=> __Options_CustomDialogUserV1) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<CustomDialogUserV1, __Options_CustomDialogUserV1>(style, ((): CustomDialogUserV1 => {
      return new CustomDialogUserV1(false, ({let gensym___17371929 = storage;
      (((gensym___17371929) == (null)) ? undefined : gensym___17371929())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_CustomDialogUserV1, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): CustomDialogUserV1 {
    throw new Error("Declare interface");
  }

  @memo() public build() {}

  ${dumpConstructor()}

}

@ComponentV2() final struct CustomDialogUserV2 extends CustomComponentV2<CustomDialogUserV2, __Options_CustomDialogUserV2> {
  public __initializeStruct(initializers: (__Options_CustomDialogUserV2 | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_dialogController = ((({let gensym___95501822 = initializers;
    (((gensym___95501822) == (null)) ? undefined : gensym___95501822.dialogController)})) ?? (({let gensym___90667230: Any;
    gensym___90667230 = new CustomDialogController({
      builder: @memo() (() => {
        CustomDialogExample._invoke(undefined, undefined, (gensym___90667230 as CustomDialogController), undefined);
      }),
      baseComponent: this,
    })
    (gensym___90667230 as CustomDialogController)})));
  }

  public __updateStruct(initializers: (__Options_CustomDialogUserV2 | undefined)): void {}

  private __backing_dialogController?: (CustomDialogController | null);

  public get dialogController(): (CustomDialogController | null) {
    return (this.__backing_dialogController as (CustomDialogController | null));
  }

  public set dialogController(value: (CustomDialogController | null)) {
    this.__backing_dialogController = value;
  }
  
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: CustomDialogUserV2)=> void), initializers: ((()=> __Options_CustomDialogUserV2) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<CustomDialogUserV2, __Options_CustomDialogUserV2>(style, ((): CustomDialogUserV2 => {
      return new CustomDialogUserV2();
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_CustomDialogUserV2, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): CustomDialogUserV2 {
    throw new Error("Declare interface");
  }

  @memo() public build() {}

  public constructor() {}

}

@CustomDialog() export declare interface __Options_CustomDialogExample {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'aaController', '((CustomDialogController | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_aaController', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'text', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_text', '(IStateDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_text', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'hh', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_hh', '(boolean | undefined)')}
  
}

@Component() export interface __Options_CustomDialogUserV1 {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'dialogController', '((CustomDialogController | null) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_dialogController', '(boolean | undefined)')}
  
}

@ComponentV2() export interface __Options_CustomDialogUserV2 {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'dialogController', '((CustomDialogController | null) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_dialogController', '(boolean | undefined)')}
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test declared struct @CustomDialog transformation',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);