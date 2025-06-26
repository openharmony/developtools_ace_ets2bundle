
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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, ANIMATION_DIR_PATH, 'animatable-extend-basic.ets'),
];

const animatableExtendTransform: Plugins = {
    name: 'animatable-extend',
    parsed: uiTransform().parsed,
};

const pluginTester = new PluginTester('test basic animatableExtend transform', buildConfig);

const expectedScript: string = `

import { memo as memo } from "arkui.stateManagement.runtime";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { NavInterface as NavInterface } from "arkui.UserView";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.UserView";


import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Text as Text, Column as Column, Component as Component, Color as Color, Curve as Curve } from "@ohos.arkui.component";

import { Entry as Entry } from "@ohos.arkui.component";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../animation/animatable-extend-basic",
  pageFullPath: "test/demo/mock/animation/animatable-extend-basic",
  integratedHsp: "false",
  } as NavInterface));

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct AnimatablePropertyExample extends CustomComponent<AnimatablePropertyExample, __Options_AnimatablePropertyExample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_AnimatablePropertyExample | undefined), @memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_AnimatablePropertyExample | undefined)): void {}
  
  @memo() public build() {
    Column(undefined, undefined, (() => {
      Text(@memo() ((instance: TextAttribute): void => {
        instance.animationStart({
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
        }).width("100%");
        return;
      }), "AnimatableProperty", undefined, undefined);
    }));
  }
  
  private constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_AnimatablePropertyExample {
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    AnimatablePropertyExample._instantiateImpl(undefined, (() => {
      return new AnimatablePropertyExample();
    }), undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}
`;

const expectedHeader =
    `
    __createOrSetAnimatableProperty<T>(functionName: string, value: number | AnimatableArithmetic<T>, callback: ((value: number | AnimatableArithmetic<T>)=> void)): void
    `;

function testAnimatableExtendTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic animation transform',
    [animatableExtendTransform, uiNoRecheck, recheck],
    {
        checked: [testAnimatableExtendTransformer],
    },
    {
        stopAfter: 'checked',
        tracing: { externalSourceNames: ['arkui.component.common'] },
    }
);
