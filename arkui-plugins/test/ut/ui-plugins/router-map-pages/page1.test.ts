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
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { recheck, uiNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const COMPONENT_DIR_PATH: string = 'router-map-pages';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, COMPONENT_DIR_PATH, 'page1.ets'),
];

const pluginTester = new PluginTester('test router map transform', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedCheckedScript: string = `
import { EntryPoint as EntryPoint } from "arkui.component.customComponent";
import { wrapBuilder as wrapBuilder } from "arkui.component.builder";
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";
import { RelativeContainerAttribute as RelativeContainerAttribute } from "arkui.component.relativeContainer";
import { RelativeContainerImpl as RelativeContainerImpl } from "arkui.component.relativeContainer";
import { memo as memo } from "arkui.stateManagement.runtime";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Builder as Builder } from "arkui.component.builder";
import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";
import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";
import { Component as Component, RelativeContainer as RelativeContainer, Builder as Builder, Column as Column, Text as Text } from "@ohos.arkui.component";

function main() {}

@memo() function builderOne() {
  TextImpl(@memo() ((instance: TextAttribute): void => {
    instance.setTextOptions("100", undefined).applyAttributesFinish();
    return;
  }), undefined);
}

@Component() final struct Page1 extends CustomComponent<Page1, __Options_Page1> {
  public __initializeStruct(initializers: (__Options_Page1 | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_message = ((({let gensym___117212394 = initializers;
    (((gensym___117212394) == (null)) ? undefined : gensym___117212394.message)})) ?? ("Hello World"));
  }
  
  public __updateStruct(initializers: (__Options_Page1 | undefined)): void {}
  
  private __backing_message?: string;
  public get message(): string {
    return (this.__backing_message as string);
  }
  
  public set message(value: string) {
    this.__backing_message = value;
  }
  
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Page1)=> void), initializers: ((()=> __Options_Page1) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Page1, __Options_Page1>(style, ((): Page1 => {
      return new Page1(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Page1, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Page1 {
    throw new Error("Declare interface");
  }
  
  @memo() public build() {
    RelativeContainerImpl(@memo() ((instance: RelativeContainerAttribute): void => {
      instance.setRelativeContainerOptions().height("100%").width("100%").applyAttributesFinish();
      return;
    }), @memo() (() => {
      TextImpl(@memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(this.message, undefined).applyAttributesFinish();
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

@Component() export interface __Options_Page1 {
  set message(message: (string | undefined))
  get message(): (string | undefined)
  set __options_has_message(__options_has_message: (boolean | undefined))
  get __options_has_message(): (boolean | undefined)
}

class __NavigationBuilderRegisterClass {
  public static staticBlockTriggerField: boolean = false;
  static {
    EntryPoint.NavigationBuilderRegister("pageOne", wrapBuilder(builderOne));
  }
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test router map transform',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);