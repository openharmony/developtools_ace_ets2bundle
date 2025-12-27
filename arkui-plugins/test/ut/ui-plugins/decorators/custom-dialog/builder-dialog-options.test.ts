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
import { dumpGetterSetter, GetSetDumper, ignoreNewLines, dumpConstructor } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const FUNCTION_DIR_PATH: string = 'decorators/custom-dialog';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'builder-dialog-options.ets'),
];

const pluginTester = new PluginTester('test CustomDialogControllerOptions with @Builder parameter', buildConfig);

const parsedTransform: Plugins = {
    name: 'builder-dialog-options',
    parsed: uiTransform().parsed,
};

const expectedParsedScript: string = `
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, Builder as Builder } from "@ohos.arkui.component";

import { CustomDialog as CustomDialog, CustomDialogController as CustomDialogController, CustomDialogControllerOptions as CustomDialogControllerOptions } from "@ohos.arkui.component";

import hilog from "@ohos.hilog";

@Builder() function builder1(str: string) {}

@Builder() function builder2() {}

@Component() final struct CustomDialogUser extends CustomComponent<CustomDialogUser, __Options_CustomDialogUser> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_CustomDialogUser, storage?: LocalStorage, @Builder() content?: (()=> void)): CustomDialogUser {
    throw new Error("Declare interface");
  }

  public dialogController: (CustomDialogController | null) = new CustomDialogController({
    builder: (() => {
      builder1("nihao");
    }),
  });

  public build() {
    Column(){};
  }

  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

}

@Component() final struct CustomDialogUser2 extends CustomComponent<CustomDialogUser2, __Options_CustomDialogUser2> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_CustomDialogUser2, storage?: LocalStorage, @Builder() content?: (()=> void)): CustomDialogUser2 {
    throw new Error("Declare interface");
  }
  
  public dialogController: (CustomDialogController | null) = new CustomDialogController({
    builder: builder2,
  });

  public build() {
    Column(){};
  }

  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

}

@Component() export interface __Options_CustomDialogUser {
  ${ignoreNewLines(`
  dialogController?: (CustomDialogController | null);
  __options_has_dialogController?: boolean;
  `)}
  
}

@Component() export interface __Options_CustomDialogUser2 {
  ${ignoreNewLines(`
  dialogController?: (CustomDialogController | null);
  __options_has_dialogController?: boolean;
  `)}
  
}
`;

const expectedCheckedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, Builder as Builder } from "@ohos.arkui.component";

import { CustomDialog as CustomDialog, CustomDialogController as CustomDialogController, CustomDialogControllerOptions as CustomDialogControllerOptions } from "@ohos.arkui.component";

import hilog from "@ohos.hilog";

function main() {}

@Memo() 
function builder1(@MemoSkip() str: string) {}

@Memo() 
function builder2() {}

@Component() final struct CustomDialogUser extends CustomComponent<CustomDialogUser, __Options_CustomDialogUser> {
  public __initializeStruct(initializers: (__Options_CustomDialogUser | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_dialogController = ((({let gensym___51459619 = initializers;
    (((gensym___51459619) == (null)) ? undefined : gensym___51459619.dialogController)})) ?? (({let gensym___203542966: Any;
    gensym___203542966 = new CustomDialogController({
      builder: @Memo() (() => {
        builder1("nihao");
      }),
      baseComponent: this,
    })
    (gensym___203542966 as CustomDialogController)})));
  }

  public __updateStruct(initializers: (__Options_CustomDialogUser | undefined)): void {}

  private __backing_dialogController?: (CustomDialogController | null);

  public get dialogController(): (CustomDialogController | null) {
    return (this.__backing_dialogController as (CustomDialogController | null));
  }

  public set dialogController(value: (CustomDialogController | null)) {
    this.__backing_dialogController = value;
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: CustomDialogUser)=> void), initializers: ((()=> __Options_CustomDialogUser) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<CustomDialogUser, __Options_CustomDialogUser>(style, ((): CustomDialogUser => {
      return new CustomDialogUser(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_CustomDialogUser, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): CustomDialogUser {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
  }
  
  ${dumpConstructor()}
  
}

@Component() final struct CustomDialogUser2 extends CustomComponent<CustomDialogUser2, __Options_CustomDialogUser2> {
  public __initializeStruct(initializers: (__Options_CustomDialogUser2 | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_dialogController = ((({let gensym___176924847 = initializers;
    (((gensym___176924847) == (null)) ? undefined : gensym___176924847.dialogController)})) ?? (({let gensym___46528967: Any;
    gensym___46528967 = new CustomDialogController({
      builder: builder2,
      baseComponent: this,
    })
    (gensym___46528967 as CustomDialogController)})));
  }

  public __updateStruct(initializers: (__Options_CustomDialogUser2 | undefined)): void {}

  private __backing_dialogController?: (CustomDialogController | null);

  public get dialogController(): (CustomDialogController | null) {
    return (this.__backing_dialogController as (CustomDialogController | null));
  }

  public set dialogController(value: (CustomDialogController | null)) {
    this.__backing_dialogController = value;
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: CustomDialogUser2)=> void), initializers: ((()=> __Options_CustomDialogUser2) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<CustomDialogUser2, __Options_CustomDialogUser2>(style, ((): CustomDialogUser2 => {
      return new CustomDialogUser2(false, ({let gensym___192738000 = storage;
      (((gensym___192738000) == (null)) ? undefined : gensym___192738000())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_CustomDialogUser2, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): CustomDialogUser2 {
    throw new Error("Declare interface");
  }

  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
  }

  ${dumpConstructor()}

}

@Component() export interface __Options_CustomDialogUser {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'dialogController', '((CustomDialogController | null) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_dialogController', '(boolean | undefined)')}
  
}

@Component() export interface __Options_CustomDialogUser2 {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'dialogController', '((CustomDialogController | null) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_dialogController', '(boolean | undefined)')}
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test CustomDialogControllerOptions with @Builder parameter',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
