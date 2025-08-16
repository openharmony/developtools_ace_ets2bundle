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

import {
  API,
  COMPONENT,
  PROJECT_ROOT,
  SAMPLE,
  SAMPLE_BUILD,
  SAMPLE_RESULT,
} from './config';

const { transformFiles } = require(path.resolve(PROJECT_ROOT, '../../process_label_noninterop'));
const { processInteropUI } = require(path.resolve(PROJECT_ROOT, '../../process_global_import'));

const sourceFilePath: string = path.resolve(PROJECT_ROOT, SAMPLE);
const deleteNoninteropOutputPath: string = path.resolve(PROJECT_ROOT, SAMPLE_BUILD);
transformFiles(path.resolve(sourceFilePath, API),
  path.resolve(deleteNoninteropOutputPath, API), false);
transformFiles(path.resolve(sourceFilePath, COMPONENT),
  path.resolve(deleteNoninteropOutputPath, COMPONENT), true);

const addExportIntputDir: string = deleteNoninteropOutputPath;
const outPath: string = path.resolve(PROJECT_ROOT, SAMPLE_RESULT);
processInteropUI(addExportIntputDir, false, outPath);
