/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const path = require('path');

const currentDirectory = process.cwd();
let workSpace = currentDirectory;
for (let i = 0; i < 4; i++) {
  workSpace = path.dirname(workSpace);
}

const jsonFilePath = path.join(__dirname, 'demo/localtest/build_decl_config_template.json');
const outJsonFilePath = path.join(__dirname, 'demo/localtest/build_decl_config.json');

try {
  const data = fs.readFileSync(jsonFilePath, 'utf8');
  const jsonData = JSON.parse(data);

  if (jsonData.buildSdkPath) {
      jsonData.buildSdkPath = jsonData.buildSdkPath.replace(/workspace/g, workSpace);
  }

  if (jsonData.plugins.interop_plugin) {
    jsonData.plugins.interop_plugin = jsonData.plugins.interop_plugin.replace(/workspace/g, workSpace);
  }

  if (jsonData.declgenV1OutPath) {
    jsonData.declgenV1OutPath = jsonData.declgenV1OutPath.replace(/workspace/g, workSpace);
  }

  if (jsonData.declgenBridgeCodePath) {
    jsonData.declgenBridgeCodePath = jsonData.declgenBridgeCodePath.replace(/workspace/g, workSpace);
  }

  fs.writeFileSync(outJsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
} catch (error) {
  console.error('writeFile error:', error);
}
