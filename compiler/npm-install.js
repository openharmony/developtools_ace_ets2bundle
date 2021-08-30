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

'use strict';
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;

if (!fs.existsSync(path.resolve(__dirname, 'bin', 'ark'))) {
  return;
}

let isWin = !1;
let isMac = !1;

if (fs.existsSync(path.resolve(__dirname, 'bin', 'ark/build-win'))) {
  isWin = !0;
} else if (fs.existsSync(path.resolve(__dirname, 'bin', 'ark/build-mac'))) {
  isMac = !0;
} else if (!fs.existsSync(path.resolve(__dirname, 'bin', 'ark/build'))) {
  console.error('[31m', 'find build fail', '[39m');
  return;
}

let cwd;
if (isWin) {
  cwd = path.join(__dirname, 'bin', 'ark', 'build-win');
} else if (isMac) {
  cwd = path.join(__dirname, 'bin', 'ark', 'build-mac');
} else {
  cwd = path.join(__dirname, 'bin', 'ark', 'build');
}

exec('npm install', { cwd: cwd }, function(err, stdout, stderr) {
  console.log('[31m', stdout, '[39m');
  if (err !== null) {
    console.error('[31m', `npm install filed: ${err}`, '[39m');
  }
});
