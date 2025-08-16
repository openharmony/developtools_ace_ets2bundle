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

function parseCode(code: string): string {
  return normalizeFileContent(cleanCopyRight(code));
}

function normalizeFileContent(content: string): string {
  // Replace all types of line endings with a single newline character
  const normalizedLineEndings = content.replace(/\r\n|\r/g, '\n');

  // Remove leading and trailing whitespace from each line
  const normalizedWhitespace = normalizedLineEndings.split('\n').map(line => line.trim()).join('\n');

  // Remove empty lines
  const normalizedEmptyLines = normalizedWhitespace.split('\n').filter(line => line !== '').join('\n');

  return normalizedEmptyLines;
}

function cleanCopyRight(str: string): string {
  const copyrightBlockRegex = /(?:\/\*.*Copyright \([c|C]\) [- \d]+ [\w ]+\., Ltd\..*\*\/)/gs;

  return str.replace(copyrightBlockRegex, '');
}

function getFiles(dir: string, allFiles: string[] = []): void {
  const files: string[] = fs.readdirSync(dir);
  files.forEach((element) => {
    const filePath = path.join(dir, element);
    const status = fs.statSync(filePath);
    if (status.isDirectory()) {
      getFiles(filePath, allFiles);
    } else {
      allFiles.push(filePath);
    }
  });
}

export {
  getFiles,
  parseCode,
}
