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

const util = require('util');
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec);
const fs = require('fs');
const path = require('path');

function generatePeg(inputFile) {
  const readDirPath = path.resolve(__dirname, './peg_parser/src/');
  const readDirSubFiles = fs.readdirSync(readDirPath);
  const catalogPath = path.resolve(inputFile, '..');
  const catalogSubFiles = fs.readdirSync(catalogPath)
  
  if (catalogSubFiles.includes('dist')) {
    exec('rm -rf ' + catalogPath + '/dist/*.js');
  } else {
    exec('mkdir ' + catalogPath + '/dist');
  }

  (async function pegTransJs () {
    if (readDirSubFiles.length) {
      for (let item of readDirSubFiles) {
        let name = path.basename(item, '.peg');
        await exec('pegjs -o ' + catalogPath + '/dist/' + name + '.js ' + readDirPath + '/' + item);
      }
    }
  })()
}

generatePeg(process.argv[2]);
