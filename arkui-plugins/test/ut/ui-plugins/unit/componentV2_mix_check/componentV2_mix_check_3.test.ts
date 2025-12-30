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

const fs = require('fs');

import {BuildConfig, PluginTestContext} from "../../../../utils/shared-types";
import {mockBuildConfig} from "../../../../utils/artkts-config";
import {Plugins} from "../../../../../common/plugin-context";
import {uiSyntaxLinterTransform} from "../../../../../ui-syntax-plugins";
import {CompileFilePath, TestJsonPath, unitTestParsedTransformer} from "../index";
import {PluginTester} from "../../../../utils/plugin-tester";

const buildConfig: BuildConfig = mockBuildConfig();
const COMPONENT_V2_MIX_DIR_PATH = "unit/componentV2_mix_check";
const COMPONENT_V2_MIX_ETS_NAME = "componentV2_mix_check_3";

const testJson = new TestJsonPath(
    COMPONENT_V2_MIX_DIR_PATH,
);

const compileFile = new CompileFilePath(
    COMPONENT_V2_MIX_DIR_PATH,
    COMPONENT_V2_MIX_ETS_NAME
);

const componentV2MixTransform: Plugins = {
    name: "ui-syntax-plugin",
    parsed: uiSyntaxLinterTransform().parsed,
};

function testParsedTransformer(this: PluginTestContext): void {
    const testData = JSON.parse(fs.readFileSync(testJson.testJsonPath, "utf8"));
    const currentTest = testData[COMPONENT_V2_MIX_ETS_NAME].messages;
    const missing = unitTestParsedTransformer(this, currentTest, COMPONENT_V2_MIX_ETS_NAME);
    expect(missing).toEqual([]);
}

buildConfig.compileFiles = [compileFile.value];
const pluginTester = new PluginTester("ComponentV2 Mix Check", buildConfig);

pluginTester.run(
    COMPONENT_V2_MIX_ETS_NAME,
    [componentV2MixTransform],
    { parsed: [testParsedTransformer] },
    { stopAfter: 'parsed' }

);
