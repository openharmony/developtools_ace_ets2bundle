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

const BUILDER_LAMBDA_DIR_PATH: string = 'builder-lambda/condition-scope';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'non-builder-within-builder.ets'),
];

const pluginTester = new PluginTester(
    'test no conditionScope in non-@Builder function within @Builder function',
    buildConfig
);

const parsedTransform: Plugins = {
    name: 'with-no-condition',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { MemoSkip as MemoSkip } from "arkui.stateManagement.runtime";
import { memo as memo } from \"arkui.stateManagement.runtime\";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Component as Component, Builder as Builder } from \"@ohos.arkui.component\";
function main() {}
@memo() function TestComponent(@MemoSkip() init: TestInitCallback, @MemoSkip() update: TestUpdateCallback): void {}
type TestInitCallback = (()=> void);
type TestUpdateCallback = (()=> void);
@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @memo() content: ((()=> void) | undefined)): void {}
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  @memo() public build() {
    TestComponent((() => {
      if (true) {
      }
    }), (() => {
      if (false) {
      }
    }));
  }
  public constructor() {}
}
@Component() export interface __Options_MyStateSample {
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

pluginTester.run(
    'test no conditionScope in non-@Builder function',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
    },
    {
        stopAfter: 'checked',
    }
);
