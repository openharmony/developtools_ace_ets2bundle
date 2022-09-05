/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

const ts = require('typescript');
const path = require('path');
const chai = require('chai');
const mocha = require('mocha');
const expect = chai.expect;
const { processUISyntax } = require('../lib/process_ui_syntax');
const {
  validateUISyntax,
  preprocessExtend,
  resetComponentCollection,
  componentCollection
} = require('../lib/validate_ui_syntax');
const {
  componentInfo,
  readFile
} = require('../lib/utils');
const { 
  BUILD_ON,
  OHOS_PLUGIN,
  NATIVE_MODULE,
  SYSTEM_PLUGIN
} = require('../lib/pre_define');
const {
  partialUpdateConfig
} = require('../main');

function expectActual(name, filePath) {
  const content = require(filePath);
  const source = content.source;
  process.env.compiler = BUILD_ON;
  const afterProcess = sourceReplace(source);
  validateUISyntax(source, afterProcess.content, `${name}.ts`);
  const compilerOptions = ts.readConfigFile(
    path.resolve(__dirname, '../tsconfig.json'), ts.sys.readFile).config.compilerOptions;
    Object.assign(compilerOptions, {
      "sourceMap": false,
    });
  const result = ts.transpileModule(afterProcess.content, {
    compilerOptions: compilerOptions,
    fileName: `${name}.ets`,
    transformers: { before: [processUISyntax(null, true)] }
  });
  componentInfo.id = 0;
  componentCollection.customComponents.clear();
  resetComponentCollection();
  expect(result.outputText).eql(content.expectResult);
}

mocha.describe('compiler', () => {
  let utPath = path.resolve(__dirname, './ut');
  if (process.argv.includes('--partialUpdate')) {
    partialUpdateConfig.partialUpdateMode = true;
    utPath = path.resolve(__dirname, './utForPartialUpdate');
  }
  const utFiles = [];
  readFile(utPath, utFiles);
  utFiles.forEach((item) => {
    const fileName = path.basename(item, '.ts');
    mocha.it(fileName, () => {
      expectActual(fileName, item);
    })
  })
})

function sourceReplace(source) {
  let content = source;
  const log = [];
  content = preprocessExtend(content);
  content = processSystemApi(content);
  return {
    content: content,
    log: log
  };
}

function processSystemApi(content) {
  const REG_SYSTEM = 
    /import\s+(.+)\s+from\s+['"]@(system|ohos)\.(\S+)['"]|import\s+(.+)\s*=\s*require\(\s*['"]@(system|ohos)\.(\S+)['"]\s*\)/g;
  const REG_LIB_SO =
    /import\s+(.+)\s+from\s+['"]lib(\S+)\.so['"]|import\s+(.+)\s*=\s*require\(\s*['"]lib(\S+)\.so['"]\s*\)/g;
  const newContent = content.replace(REG_LIB_SO, (_, item1, item2, item3, item4) => {
    const libSoValue = item1 || item3;
    const libSoKey = item2 || item4;
    return `var ${libSoValue} = globalThis.requireNapi("${libSoKey}", true);`;
  }).replace(REG_SYSTEM, (item, item1, item2, item3, item4, item5, item6, item7) => {
    let moduleType = item2 || item5;
    let systemKey = item3 || item6;
    let systemValue = item1 || item4;
    if (NATIVE_MODULE.has(`${moduleType}.${systemKey}`)) {
      item = `var ${systemValue} = globalThis.requireNativeModule('${moduleType}.${systemKey}')`;
    } else if (moduleType === SYSTEM_PLUGIN) {
      item = `var ${systemValue} = isSystemplugin('${systemKey}', '${SYSTEM_PLUGIN}') ? ` +
        `globalThis.systemplugin.${systemKey} : globalThis.requireNapi('${systemKey}')`;
    } else if (moduleType === OHOS_PLUGIN) {
      item = `var ${systemValue} = globalThis.requireNapi('${systemKey}') || ` +
        `(isSystemplugin('${systemKey}', '${OHOS_PLUGIN}') ? ` +
        `globalThis.ohosplugin.${systemKey} : isSystemplugin('${systemKey}', '${SYSTEM_PLUGIN}') ` +
        `? globalThis.systemplugin.${systemKey} : undefined)`;
    }
    return item;
  });
  return newContent;
}