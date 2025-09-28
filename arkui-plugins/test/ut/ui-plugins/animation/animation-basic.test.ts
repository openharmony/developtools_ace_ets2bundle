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

const ANIMATION_DIR_PATH: string = 'animation';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, ANIMATION_DIR_PATH, 'animation-basic.ets'),
];

const animationTransform: Plugins = {
    name: 'animation',
    parsed: uiTransform().parsed,
};

const pluginTester = new PluginTester('test basic animation transform', buildConfig);

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Text as Text, Column as Column, Component as Component, Color as Color, Curve as Curve } from "@ohos.arkui.component";

import { Entry as Entry } from "@ohos.arkui.component";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../animation/animation-basic",
  pageFullPath: "test/demo/mock/animation/animation-basic",
  integratedHsp: "false",
  } as NavInterface));

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct AnimatablePropertyExample extends CustomComponent<AnimatablePropertyExample, __Options_AnimatablePropertyExample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_AnimatablePropertyExample | undefined), @memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_AnimatablePropertyExample | undefined)): void {}
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: AnimatablePropertyExample)=> void), initializers: ((()=> __Options_AnimatablePropertyExample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<AnimatablePropertyExample, __Options_AnimatablePropertyExample>(style, ((): AnimatablePropertyExample => {
      return new AnimatablePropertyExample(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_AnimatablePropertyExample, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): AnimatablePropertyExample {
    throw new Error("Declare interface");
  }
  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      TextImpl(@memo() ((instance: TextAttribute): void => {
        instance.setTextOptions("AnimatableProperty", undefined).animationStart({
          duration: 2000,
          curve: Curve.Ease,
        }).backgroundColor(Color.Red).animationStop({
          duration: 2000,
          curve: Curve.Ease,
        }).animationStart({
          duration: 2000,
          curve: Curve.Ease,
        }).fontSize(20).animationStop({
          duration: 2000,
          curve: Curve.Ease,
        }).width("100%").applyAttributesFinish();
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

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_AnimatablePropertyExample {
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    AnimatablePropertyExample._invoke(@memo() ((instance: AnimatablePropertyExample): void => {
      instance.applyAttributesFinish();
      return;
    }), undefined, undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}
`;

const expectedHeader =
    `
    animationStart(value: AnimateParam | undefined): this
    animationStop(value: AnimateParam | undefined): this
    `;

function testAnimationTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic animation transform',
    [animationTransform, uiNoRecheck, recheck],
    {
        checked: [testAnimationTransformer],
    },
    {
        stopAfter: 'checked',
        tracing: { externalSourceNames: ['arkui.component.common'] },
    }
);
