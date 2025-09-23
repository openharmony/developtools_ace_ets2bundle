/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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
const path = require('path');

function changePathToAbsPath(p) {
  return path.resolve(p);
}

function replaceWorkspace(p, workspace) {
  return p.replace(/workspace/g, workspace);
}

// 获取当前目录
const currentDirectory = process.cwd();
let workspace = currentDirectory;
for (let i = 0; i < 4; i++) {
  workspace = path.dirname(workspace);
}
// JSON 文件路径
const jsonFilePath = path.join(__dirname, 'demo/localtest/build_config_template.json');
const outJsonFilePath = path.join(__dirname, 'demo/localtest/build_config.json');

try {
  // 读取 JSON 文件内容
  const data = fs.readFileSync(jsonFilePath, 'utf8');
  const jsonData = JSON.parse(data);
  console.log(jsonData)
  // 处理 baseUrl 字段
  if (jsonData.buildSdkPath) {
    jsonData.buildSdkPath = replaceWorkspace(jsonData.buildSdkPath, workspace);
  }

  // 处理 plugins 字段
  if (jsonData.plugins.ui_syntax_plugin) {
    jsonData.plugins.ui_syntax_plugin = replaceWorkspace(jsonData.plugins.ui_syntax_plugin, workspace);
  }
  if (jsonData.plugins.ui_plugin) {
    jsonData.plugins.ui_plugin = replaceWorkspace(jsonData.plugins.ui_plugin, workspace);
  }
  if (jsonData.plugins.memo_plugin) {
    jsonData.plugins.memo_plugin = replaceWorkspace(jsonData.plugins.memo_plugin, workspace);
  }

  // compileFiles
  if (jsonData.compileFiles) {
    jsonData.compileFiles = jsonData.compileFiles.map((file) => changePathToAbsPath(file));
  }

  // entryFiles
  if (jsonData.entryFiles) {
    jsonData.entryFiles = jsonData.entryFiles.map((file) => changePathToAbsPath(file));
  }

  // moduleRootPath
  if (jsonData.moduleRootPath) {
    jsonData.moduleRootPath = changePathToAbsPath(jsonData.moduleRootPath);
  }

  // sourceRoots
  if (jsonData.sourceRoots) {
    jsonData.sourceRoots = jsonData.sourceRoots.map((file) => changePathToAbsPath(file));
  }

  // loaderOutPath
  if (jsonData.loaderOutPath) {
    jsonData.loaderOutPath = changePathToAbsPath(jsonData.loaderOutPath);
  }

  // cachePath
  if (jsonData.cachePath) {
    jsonData.cachePath = changePathToAbsPath(jsonData.cachePath);
  }

  // appModuleJsonPath
  if (jsonData.aceModuleJsonPath) {
    jsonData.aceModuleJsonPath = changePathToAbsPath(jsonData.aceModuleJsonPath);
  }

  // externalApiPaths
  if (jsonData.externalApiPaths) {
    jsonData.externalApiPaths = jsonData.externalApiPaths.map((p) => replaceWorkspace(p, workspace));
  }

  // externalApiPaths
  if (jsonData.codeRootPath) {
    jsonData.codeRootPath = changePathToAbsPath(jsonData.codeRootPath);
  }

  // abcLinkerPath
  if (jsonData.pandaSdkPath) {
    jsonData.pandaSdkPath = replaceWorkspace(jsonData.pandaSdkPath, workspace);
  }

  // abcLinkerPath
  if (jsonData.abcLinkerPath) {
    jsonData.abcLinkerPath = replaceWorkspace(jsonData.abcLinkerPath, workspace);
  }

  // dependencyAnalyzerPath
  if (jsonData.dependencyAnalyzerPath) {
    jsonData.dependencyAnalyzerPath = replaceWorkspace(jsonData.dependencyAnalyzerPath, workspace);
  }

  // 将修改后的内容写回 JSON 文件
  fs.writeFileSync(outJsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
} catch (error) {
  console.error('处理 JSON 文件时出错:', error);
}