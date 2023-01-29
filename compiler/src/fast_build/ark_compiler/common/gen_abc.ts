/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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

import childProcess from 'child_process';
import cluster from 'cluster';
import fs from 'fs';
import path from 'path';
import process from 'process';

import {
  COMMONJS,
  ESM,
  ESMODULE,
  EXTNAME_ABC,
  JSBUNDLE
} from './ark_define';
import { changeFileExtension} from '../utils';
import { FAIL, SUCCESS } from '../../common/common_define';

function genAbcByWorkersOfBundleMode(jsonInput: string, cmd: string): Promise<void> {
  const inputPaths: any = JSON.parse(jsonInput);
  for (let i = 0; i < inputPaths.length; ++i) {
    const cacheFilePath: string = inputPaths[i].cacheFilePath;
    const cacheAbcFilePath: string = changeFileExtension(cacheFilePath, EXTNAME_ABC);
    const sourceFile: string = inputPaths[i].sourceFile;
    const singleCmd: any = `${cmd} "${cacheFilePath}" -o "${cacheAbcFilePath}" --source-file "${sourceFile}"`;
    try {
      // TODO: check syntax error？
      childProcess.execSync(singleCmd);
    } catch (e) {
      process.exit(FAIL);
    }
  }

  return;
}

function genAbcByWorkersOfModuleMode(jsonInput: string, cmd: string, workerFileName: string,
  cachePath: string): Promise<void> {
  const inputPaths: any = JSON.parse(jsonInput);
  const filePath: string = path.join(cachePath, workerFileName);
  let content: string = '';
  for (let i = 0; i < inputPaths.length; ++i) {
    const info: any = inputPaths[i];
    const moduleType: string = info.isCommonJs ? COMMONJS : ESM;
    content += `${info.cacheFilePath};${info.recordName};${moduleType};${info.sourceFile};${info.packageName}`;
    if (i < inputPaths.length - 1) {
      content += '\n';
    }
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  // cmd `${cmd} --input-file xx --output-proto --merge-abc`
  const singleCmd: any = `${cmd} "${filePath}"`;
  try {
    childProcess.execSync(singleCmd);
  } catch (e) {
    process.exit(FAIL);
  }

  return;
}

if (cluster.isWorker && process.env['inputs'] !== undefined && process.env['cmd'] !== undefined &&
  process.env['mode'] !== undefined) {
  if (process.env['mode'] === JSBUNDLE) {
    genAbcByWorkersOfBundleMode(process.env['inputs'], process.env['cmd']);
    process.exit(SUCCESS);
  } else if (process.env['mode'] === ESMODULE && process.env['workerFileName'] && process.env['cachePath']) {
    genAbcByWorkersOfModuleMode(process.env['inputs'], process.env['cmd'], process.env['workerFileName'],
      process.env['cachePath']);
    process.exit(SUCCESS);
  } else {
    process.exit(FAIL);
  }
}
