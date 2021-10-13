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

const readDir = fs.readdirSync('./peg_parser/src/');
const catalog = fs.readdirSync('./peg_parser/');

if (catalog.includes('dist')) {
  exec('rm -rf peg_parser/dist');
}

exec('mkdir peg_parser/dist');

(async function pegTransJs () {
  if (readDir.length) {
    for (let item of readDir) {
      let name = path.basename(item, '.peg');
      await exec('pegjs -o peg_parser/dist/' + name + '.js peg_parser/src/' + item);
    }
  }
})()
