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
import { collectNoRecheck, memoNoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpAnnotation, dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
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
import { Memo as Memo } from "arkui.incremental.annotation";
import { BaseCustomDialog as BaseCustomDialog } from "arkui.component.customComponent";
import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { State as State } from "@ohos.arkui.stateManagement";
import { CustomDialog as CustomDialog, CustomDialogController as CustomDialogController, ComponentV2 as ComponentV2, Component as Component, Builder as Builder } from "@ohos.arkui.component";

function main() {}

@CustomDialog() export declare final struct CustomDialogExample extends BaseCustomDialog<CustomDialogExample, __Options_CustomDialogExample> {
  public aaController?: (CustomDialogController | undefined);
  
  @State() public text: string;
  
  public hh: string;
  
  @Memo() public build(): void
  
  public constructor() {}
  
  public static _buildCompatibleNode(options: __Options_CustomDialogExample): void
}

@Component() final struct CustomDialogUserV1 extends CustomComponent<CustomDialogUserV1, __Options_CustomDialogUserV1> {
  public __initializeStruct(initializers: (__Options_CustomDialogUserV1 | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_dialogController = ((({let gensym___51459619 = initializers;
    (((gensym___51459619) == (null)) ? undefined : gensym___51459619.dialogController)})) ?? (({let gensym___203542966: Any;
    gensym___203542966 = new CustomDialogController({
      builder: @Memo() (() => {
        CustomDialogExample._instantiateImpl(undefined, (() => {
          const instance = new CustomDialogExample();
          instance.__setDialogController__((gensym___203542966 as CustomDialogController));
          return instance;
        }), undefined, undefined);
      }),
      baseComponent: this,
    })
    (gensym___203542966 as CustomDialogController)})));
  }
  
  public __updateStruct(initializers: (__Options_CustomDialogUserV1 | undefined)): void {}
  
  private __backing_dialogController?: (CustomDialogController | null);
  
  public get dialogController(): (CustomDialogController | null) {
    return (this.__backing_dialogController as (CustomDialogController | null));
  }
  
  public set dialogController(value: (CustomDialogController | null)) {
    this.__backing_dialogController = value;
  }
  
  @Memo() public build() {}
  
  public constructor() {}

  static {

  }
}

@ComponentV2() final struct CustomDialogUserV2 extends CustomComponentV2<CustomDialogUserV2, __Options_CustomDialogUserV2> {
  public __initializeStruct(initializers: (__Options_CustomDialogUserV2 | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_dialogController = ((({let gensym___176924847 = initializers;
    (((gensym___176924847) == (null)) ? undefined : gensym___176924847.dialogController)})) ?? (({let gensym___46528967: Any;
    gensym___46528967 = new CustomDialogController({
      builder: @Memo() (() => {
        CustomDialogExample._instantiateImpl(undefined, (() => {
          const instance = new CustomDialogExample();
          instance.__setDialogController__((gensym___46528967 as CustomDialogController));
          return instance;
        }), undefined, undefined);
      }),
      baseComponent: this,
    })
    (gensym___46528967 as CustomDialogController)})));
  }
  
  public __updateStruct(initializers: (__Options_CustomDialogUserV2 | undefined)): void {}
  
  private __backing_dialogController?: (CustomDialogController | null);
  
  public get dialogController(): (CustomDialogController | null) {
    return (this.__backing_dialogController as (CustomDialogController | null));
  }
  
  public set dialogController(value: (CustomDialogController | null)) {
    this.__backing_dialogController = value;
  }
  
  @Memo() public build() {}
  
  public constructor() {}

  static {

  }
}

@CustomDialog() export declare interface __Options_CustomDialogExample {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'aaController', '((CustomDialogController | undefined) | undefined)', [], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_aaController', '(boolean | undefined)', [], [], false)}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'text', '(string | undefined)', [dumpAnnotation('State')], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_text', '(IStateDecoratedVariable<string> | undefined)', [], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_text', '(boolean | undefined)', [], [], false)}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'hh', '(string | undefined)', [], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_hh', '(boolean | undefined)', [], [], false)}
  
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
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);