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

import * as ts from 'typescript';

import {
  processFileName,
  writeFile,
 } from './utils';
import { stmtReplacementMap } from './global_var';
import {
  isSpecialFile,
  processSpecialFileContext,
} from './process_special_file';

export function tsTransform(utFiles: string[], callback: Function, exportFlag: boolean,
  inputDir: string, outputPath: string): void {
  utFiles.forEach((url) => {
    const apiBaseName = path.basename(url);
    let content = fs.readFileSync(url, 'utf-8');
    let isTransformer = /\.d\.ts/.test(apiBaseName) || /\.d\.ets/.test(apiBaseName);
    if (/\.json/.test(url)) {
      isTransformer = false;
    }
    if (!isTransformer) {
      writeFile(url, content, inputDir, outputPath);
      return;
    }
    const fileName = processFileName(url);
    ts.transpileModule(preprocessContent(fileName, content), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2017,
      },
      fileName: fileName,
      transformers: { before: [callback(url, exportFlag, inputDir, outputPath)] },
    });
  });
}

function preprocessContent(fileName: string, content: string): string {
  stmtReplacementMap.clear();
  let result = content.replace(/^(\s*)(\@Retention\(\{[^\(\)\{\}]*\}\)$)/mg,
    '$1/**@reserved $2 */');
  const matches = result.match(/(^[^\*]*\s+\@interface\s+.*$)/mg);
  if (matches) {
    for (const match of matches) {
      const transformedStmt: string = match.replace(/(?<=\s+)\@interface(\s+\w+)\s*\{\}/g, 'const$1');
      result = result.replace(match, transformedStmt);
      stmtReplacementMap.set(match, transformedStmt);
    }
  }

  if (isSpecialFile(fileName)) {
    result = processSpecialFileContext(fileName, result);
  }
  return result;
}
