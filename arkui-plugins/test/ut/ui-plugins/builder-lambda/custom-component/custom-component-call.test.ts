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
import { dumpGetterSetter, GetSetDumper, ignoreNewLines, dumpConstructor } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'builder-lambda';
const CUSTOM_COMPONENT_DIR_PATH: string = 'custom-component';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(
        getRootPath(),
        MOCK_ENTRY_DIR_PATH,
        BUILDER_LAMBDA_DIR_PATH,
        CUSTOM_COMPONENT_DIR_PATH,
        'custom-component-call.ets'
    ),
];

const pluginTester = new PluginTester('test custom component call transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'custom-component-call',
    parsed: uiTransform().parsed,
};

const expectedParsedScript: string = `
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";

@Component() final struct CustomContainer extends CustomComponent<CustomContainer, __Options_CustomContainer> {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_CustomContainer, storage?: LocalStorage, @Builder() content?: (()=> void)): CustomContainer {
    throw new Error("Declare interface");
  }
  
  @Builder() public closerBuilder() {}

  @BuilderParam() public closer: (()=> void) = this.closerBuilder;

  public build() {}

  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

}

@Component() final struct CustomContainerUser extends CustomComponent<CustomContainerUser, __Options_CustomContainerUser> {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_CustomContainerUser, storage?: LocalStorage, @Builder() content?: (()=> void)): CustomContainerUser {
    throw new Error("Declare interface");
  }

  public build() {
    Column(){
      CustomContainer(){
        Column(){
          Text("hello");
        };
      };
      CustomContainer({}){
        Column(){};
      };
      CustomContainer(undefined){};
      CustomContainer();
    };
  }

  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

}

@Component() export interface __Options_CustomContainer {
  ${ignoreNewLines(`
  @BuilderParam() closer?: (()=> void);
  __options_has_closer?: boolean;
  `)}
  
}

@Component() export interface __Options_CustomContainerUser {

}
`;

function testParedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

const expectedBuilderLambdaScript: string = `
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";

function main() {}


@Component() final struct CustomContainer extends CustomComponent<CustomContainer, __Options_CustomContainer> {
  public __initializeStruct(initializers: (__Options_CustomContainer | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_closer = ((((({let gensym___38813563 = initializers;
    (((gensym___38813563) == (null)) ? undefined : gensym___38813563.closer)})) ?? (content))) ?? (this.closerBuilder))
  }

  public __updateStruct(initializers: (__Options_CustomContainer | undefined)): void {}

  private __backing_closer?: @Memo() (()=> void);

  public get closer(): @Memo() (()=> void) {
    return this.__backing_closer!;
  }

  public set closer(value: @Memo() (()=> void)) {
    this.__backing_closer = value;
  }
  
  @MemoIntrinsic() public static _invoke(style: @Memo() ((instance: CustomContainer)=> void), initializers: ((()=> __Options_CustomContainer) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<CustomContainer, __Options_CustomContainer>(style, ((): CustomContainer => {
      return new CustomContainer(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_CustomContainer, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): CustomContainer {
    throw new Error("Declare interface");
  }

  @Memo() public closerBuilder() {}

  @Memo() public build() {}

  ${dumpConstructor()}

}

@Component() final struct CustomContainerUser extends CustomComponent<CustomContainerUser, __Options_CustomContainerUser> {
  public __initializeStruct(initializers: (__Options_CustomContainerUser | undefined), @Memo() content: ((()=> void) | undefined)): void {}

  public __updateStruct(initializers: (__Options_CustomContainerUser | undefined)): void {}
  
  @MemoIntrinsic() public static _invoke(style: @Memo() ((instance: CustomContainerUser)=> void), initializers: ((()=> __Options_CustomContainerUser) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<CustomContainerUser, __Options_CustomContainerUser>(style, ((): CustomContainerUser => {
      return new CustomContainerUser(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }

  @ComponentBuilder() public static $_invoke(initializers?: __Options_CustomContainerUser, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): CustomContainerUser {
    throw new Error("Declare interface");
  }

  @Memo() public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      CustomContainer._invoke(@Memo() ((instance: CustomContainer): void => {
        instance.applyAttributesFinish();
        return;
      }), undefined, undefined, undefined, @Memo() (() => {
        ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
          instance.setColumnOptions(undefined).applyAttributesFinish();
          return;
        }), @Memo() (() => {
          TextImpl(@Memo() ((instance: TextAttribute): void => {
            instance.setTextOptions("hello", undefined).applyAttributesFinish();
            return;
          }), undefined);
        }));
      }));
      CustomContainer._invoke(@Memo() ((instance: CustomContainer): void => {
        instance.applyAttributesFinish();
        return;
      }), (() => {
        return {};
      }), undefined, undefined, @Memo() (() => {
        ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
          instance.setColumnOptions(undefined).applyAttributesFinish();
          return;
        }), @Memo() (() => {}));
      }));
      CustomContainer._invoke(@Memo() ((instance: CustomContainer): void => {
        instance.applyAttributesFinish();
        return;
      }), undefined, undefined, undefined, @Memo() (() => {}));
      CustomContainer._invoke(@Memo() ((instance: CustomContainer): void => {
        instance.applyAttributesFinish();
        return;
      }), undefined, undefined, undefined, undefined);
    }));
  }

  ${dumpConstructor()}

}

@Component() export interface __Options_CustomContainer {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'closer', '(@Memo() (()=> void) | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_closer', '(boolean | undefined)')}
  
}

@Component() export interface __Options_CustomContainerUser {

}
`;

function testCustomComponentTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedBuilderLambdaScript));
}

pluginTester.run(
    'test custom component call transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        parsed: [testParedTransformer],
        checked: [testCustomComponentTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
