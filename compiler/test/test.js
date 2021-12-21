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

const {
  validateUISyntax,
  resetComponentCollection,
  sourceReplace,
  componentCollection
} = require('../lib/validate_ui_syntax');
const { processUISyntax } = require('../lib/process_ui_syntax');
const {
  componentInfo,
  readFile
} = require('../lib/utils');
const { BUILD_ON } = require('../lib/pre_define');

function expectActual(name, filePath) {
  const content = require(filePath);
  const source = content.source;
  process.env.compiler = BUILD_ON;
  const afterProcess = sourceReplace(source);
  validateUISyntax(source, afterProcess.content, `${name}.ts`);
  const result = ts.transpileModule(afterProcess.content, {
    compilerOptions: {
      "target": ts.ScriptTarget.ES2017
    },
    fileName: `${name}.ts`,
    transformers: { before: [processUISyntax(null, true)] }
  });
  componentInfo.id = 0;
  componentCollection.customComponents.clear();
  resetComponentCollection();
  expect(result.outputText).eql(content.expectResult);
}

mocha.describe('compiler', () => {
  const utPath = path.resolve(__dirname, './ut');
  const utFiles = [];
  readFile(utPath, utFiles);
  utFiles.forEach((item) => {
    const fileName = path.basename(item, '.ts');
    mocha.it(fileName, () => {
      expectActual(fileName, item);
    })
  })
})
