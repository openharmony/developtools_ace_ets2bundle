/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

const { src, dest, ignore } = parseArgs();
copyJsonFiles(src, dest, ignore);

function parseArgs() {
  //argv 2: srcDir 3: destDir 4: --ignore 5: ignoreDir
  const result = { src: process.argv[2], dest: process.argv[3], ignore: null};
  if (process.argv.length === 6 && process.argv[4] === '--ignore') {
    result.ignore = path.join(process.argv[5]);
  }
  return result;
}

function copyJsonFiles(src, dest, ignore) {
  if (src === ignore) {
    return;
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);

    const stats = fs.statSync(srcFile);
    if (stats.isDirectory()) {
      copyJsonFiles(srcFile, destFile, ignore);
    } else if (stats.isFile() && file.endsWith('.json')) {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}