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
import * as fs from 'fs';
import * as mocha from 'mocha';
import { expect } from 'chai';

import * as ts from 'typescript';

import {
  ADD_IMPORT_OUTPUTS_PATH,
  ADD_IMPORT_SOURCE_PATH,
  ADD_IMPORT_TARGET_PATH,
  API,
  BUILD,
  COMPONENT,
  GLOBAL_ESVALUE_FILE,
  PROJECT_ROOT,
  SOURCE,
  UT,
  UTF_8,
} from './config';
import { getFiles, parseCode } from './utils';

import { transformFiles } from '../src/delete_noninterop/transform_plugin';
import processInteropUI from '../src/add_import/process_interop_ui';

mocha.describe('add import for 1.1 interop sdk', () => {
  const deleteNoninteropOutputPath: string = path.resolve(PROJECT_ROOT, BUILD);
  const sourceFilePath: string = path.resolve(PROJECT_ROOT, SOURCE);

  transformFiles(path.resolve(sourceFilePath, API),
    path.resolve(deleteNoninteropOutputPath, API), false);
  transformFiles(path.resolve(sourceFilePath, COMPONENT),
    path.resolve(deleteNoninteropOutputPath, COMPONENT), true);

  const utFiles: string[] = [];
  getFiles(sourceFilePath, utFiles);
  utFiles.push(path.resolve(sourceFilePath, API, GLOBAL_ESVALUE_FILE));

  utFiles.forEach((filePath: string, index: number) => {
    const buildFilePath: string = path.resolve(filePath.replace(`/${SOURCE}/`, `/${BUILD}/`));
    const targetFilePath: string = path.resolve(filePath.replace(`/${SOURCE}/`, `/${UT}/`));

    if (fs.existsSync(buildFilePath) && fs.existsSync(targetFilePath)) {
      mocha.it(`${index + 1}: test delete noninterop ${path.basename(filePath)}`, function (done) {
        const buildCode: string = fs.readFileSync(buildFilePath, UTF_8);
        const targetCode: string = fs.readFileSync(targetFilePath, UTF_8);
        expect(parseCode(buildCode)).eql(parseCode(targetCode));
        done();
      });
    }
  });

  const intputDir: string = ADD_IMPORT_SOURCE_PATH;
  const outputDir: string = ADD_IMPORT_OUTPUTS_PATH;
  const targetDir: string = ADD_IMPORT_TARGET_PATH;
  const res: ts.TransformationResult<ts.SourceFile> = processInteropUI(intputDir, false, outputDir);

  res.transformed.map((sourcefile:ts.SourceFile, index: number) => {
    const buildFilePath: string = path.resolve(sourcefile.fileName.replace(intputDir, outputDir));
    const targetFilePath: string = path.resolve(sourcefile.fileName.replace(intputDir, targetDir));

    if (fs.existsSync(targetFilePath) && !targetFilePath.includes(`/${COMPONENT}/`)) {
      mocha.it(`${index + 1}: test add import ${sourcefile.fileName.replace(intputDir, '')}`,
      function (done) {
        const buildCode: string = fs.readFileSync(buildFilePath, UTF_8);
        const targetCode: string = fs.readFileSync(targetFilePath, UTF_8);
        expect(parseCode(buildCode)).eql(parseCode(targetCode));
        done();
      });
    }
  });
});
