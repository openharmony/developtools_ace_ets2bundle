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

const BUILDER_LAMBDA_DIR_PATH: string = 'builder-lambda';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'style-with-receiver.ets'),
];

const pluginTester = new PluginTester('test function with receiver style transformstion', buildConfig);

const parsedTransform: Plugins = {
    name: 'style-with-receiver',
    parsed: uiTransform().parsed,
};

const expectedScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";
import { UITextAttribute as UITextAttribute } from "arkui.component.text";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { memo as memo } from "@ohos.arkui.stateManagement";
import { Text as Text, UITextAttribute as UITextAttribute, Column as Column, Component as Component } from "@ohos.arkui.component";
import hilog from "@ohos.hilog";

function main() {}

@memo() function cardStyle(this: UITextAttribute, num: number, str: string): UITextAttribute {
  this.fontSize(num);
  this.backgroundColor(num);
  return this;
}

@memo() function style22(this: UITextAttribute): UITextAttribute {
  this.fontWeight(700);
  return this;
}

@Component({freezeWhenInactive:false}) final class MM extends CustomComponent<MM, __Options_MM> {
  public __initializeStruct(initializers: __Options_MM | undefined, @memo() content: (()=> void) | undefined): void {}
  
  public __updateStruct(initializers: __Options_MM | undefined): void {}
  
  @memo() public _build(@memo() style: ((instance: MM)=> MM) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_MM | undefined): void {
    Column(undefined, (() => {
      Text(@memo() ((instance: UITextAttribute): void => {
        style22(cardStyle(instance.height(200).fontColor("#000000"), 600, "#eeeeee").fontSize(60).fontWeight(400)).width(900);
        return;
      }), "hello world");
      Text(@memo() ((instance: UITextAttribute): void => {
        cardStyle(instance, 600, "#eeeeee");
        return;
      }), "hello world");
    }));
  }
  
  private constructor() {}
  
}

@Component({freezeWhenInactive:false}) export interface __Options_MM {
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test function with receiver style transformstion',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
