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

import { BuildConfig, PluginTestContext } from "../../../../utils/shared-types";
import { mockBuildConfig } from "../../../../utils/artkts-config";
import { Plugins } from "../../../../../common/plugin-context";
import { uiSyntaxLinterTransform } from "../../../../../ui-syntax-plugins";
import { CompileFilePath, TestJsonPath, unitTestParsedTransformer } from "../index";
import { PluginTester } from "../../../../utils/plugin-tester";

const buildConfig: BuildConfig = mockBuildConfig();

const REUSE_ATTRIBUTE_CHECK_DIR_PATH = "unit/reuse_attribute_check";
const REUSE_ATTRIBUTE_CHECK_ETS_NAME = "reuse_attribute_check_3";

const testJson = new TestJsonPath(
  REUSE_ATTRIBUTE_CHECK_DIR_PATH,
);

const compileFile = new CompileFilePath(
  REUSE_ATTRIBUTE_CHECK_DIR_PATH,
  REUSE_ATTRIBUTE_CHECK_ETS_NAME
);

const reuseAttributeCheckTransform: Plugins = {
  name: "ui-syntax-plugin",
  parsed: uiSyntaxLinterTransform().parsed,
};

async function testParsedTransformer(this: PluginTestContext): Promise<void> {
  const testData = JSON.parse(fs.readFileSync(testJson.testJsonPath, "utf8"));
  const currentTest = testData[REUSE_ATTRIBUTE_CHECK_ETS_NAME].messages;
  const missing = unitTestParsedTransformer(this, currentTest, REUSE_ATTRIBUTE_CHECK_ETS_NAME);
  expect(missing).toEqual([]);
}

buildConfig.compileFiles = [compileFile.value];

const pluginTester = new PluginTester("reuse attribute check test", buildConfig);

pluginTester.run(
  REUSE_ATTRIBUTE_CHECK_ETS_NAME,
  [reuseAttributeCheckTransform],
  { parsed: [testParsedTransformer] },
  { stopAfter: 'parsed' }
);
