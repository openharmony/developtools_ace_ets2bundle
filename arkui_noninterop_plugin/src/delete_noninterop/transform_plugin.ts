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

import { GLOBAL_ESVALUE_FILE } from './pre_define';
import { readFile } from './utils';

import { tsTransform } from './process_label_noninterop';
import { deleteNonInteropApi } from './delete_noninterop_api';

export function transformFiles(inputDir: string, outputPath: string, exportFlag: boolean): void {
  try {
    if (exportFlag) {
      initGlobalESValueFile(outputPath);
    }
    const utFiles: string[] = [];
    readFile(inputDir, utFiles);
    tsTransform(utFiles, deleteNonInteropApi, exportFlag, inputDir, outputPath);
  } catch (error) {
    // ignore
  }
}

function initGlobalESValueFile(outputPath: string): void {
  const filePath: string = `${path.resolve(outputPath, '../api')}/${GLOBAL_ESVALUE_FILE}`;
  const dir: string = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, '');
}
