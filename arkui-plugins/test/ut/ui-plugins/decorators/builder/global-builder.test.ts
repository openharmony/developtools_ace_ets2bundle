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
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const FUNCTION_DIR_PATH: string = 'decorators/builder';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'global-builder.ets')];

const pluginTester = new PluginTester('test global builder', buildConfig);

const parsedTransform: Plugins = {
    name: 'global-builder',
    parsed: uiTransform().parsed,
};

const expectedScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component, Row as Row, Builder as Builder, Text as Text } from "@ohos.arkui.component";

function main() {}

@memo() function showTextBuilder() {
  Text(undefined, "Hello World");
}

@memo() function overBuilder(params: Tmp) {
  Row(undefined, (() => {
    Text(undefined, (("UseStateVarByReference: ") + (params.paramA1)));
  }));
}

class Tmp {
  public paramA1: string = "";
  public constructor() {}
}

@Component({freezeWhenInactive:false}) final class BuilderDemo extends CustomComponent<BuilderDemo, __Options_BuilderDemo> {
  public __initializeStruct(initializers: __Options_BuilderDemo | undefined, @memo() content: (()=> void) | undefined): void {}
  public __updateStruct(initializers: __Options_BuilderDemo | undefined): void {}
  @memo() public _build(@memo() style: ((instance: BuilderDemo)=> BuilderDemo) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_BuilderDemo | undefined): void {
    Row(undefined, @memo() (() => {
      showTextBuilder();
      overBuilder({
        paramA1: "Hello",
      });
    }));
  }
  private constructor() {}
}

@Component({freezeWhenInactive:false}) export interface __Options_BuilderDemo {
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'global builder',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
