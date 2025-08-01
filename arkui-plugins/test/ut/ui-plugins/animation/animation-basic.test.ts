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
import { PluginTestContext, PluginTester } from '../../../utils/plugin-tester';
import { BuildConfig, mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { uiNoRecheck } from '../../../utils/plugins';
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
}

const pluginTester = new PluginTester('test basic animation transform', buildConfig);

const expectedScript: string = `
import { __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";

import { __memo_context_type as __memo_context_type } from "arkui.stateManagement.runtime";

import { memo as memo } from "arkui.stateManagement.runtime";

import { UIColumnAttribute as UIColumnAttribute } from "@ohos.arkui.component";

import { UITextAttribute as UITextAttribute } from "@ohos.arkui.component";

import { EntryPoint as EntryPoint } from "arkui.UserView";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Text as Text, Column as Column, Component as Component, Color as Color, Curve as Curve } from "@ohos.arkui.component";

import { Entry as Entry } from "@ohos.arkui.component";

function main() {}



@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final class AnimatablePropertyExample extends CustomComponent<AnimatablePropertyExample, __Options_AnimatablePropertyExample> {
  public __initializeStruct(initializers: __Options_AnimatablePropertyExample | undefined, @memo() content: (()=> void) | undefined): void {}
  
  public __updateStruct(initializers: __Options_AnimatablePropertyExample | undefined): void {}
  
  @memo() public _build(@memo() style: ((instance: AnimatablePropertyExample)=> AnimatablePropertyExample) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_AnimatablePropertyExample | undefined): void {
    Column(undefined, undefined, (() => {
      Text(@memo() ((instance: UITextAttribute): void => {
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
  
  public constructor() {}
  
}

interface __Options_AnimatablePropertyExample {
  
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

function testAnimationTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic animation transform',
    [animationTransform, uiNoRecheck],
    {
        checked: [testAnimationTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
