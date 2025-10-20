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
  EXTNAME_D_TS,
  EXTNAME_D_ETS,
  EXTNAME_TS,
  EXTNAME_ETS,
} from './pre_define';

function readFile(dir: string, utFiles: string[]): void {
  try {
    const files = fs.readdirSync(dir);
    files.forEach((element: string): void => {
      const filePath = path.join(dir, element);
      const status = fs.statSync(filePath);
      if (status.isDirectory()) {
        readFile(filePath, utFiles);
      } else {
        utFiles.push(filePath);
      }
    });
  } catch (e) {
    // ignore
  }
}

function processFileName(filePath: string): string {
  return path.basename(filePath)
    .replace(/\.d\.ts$/g, EXTNAME_TS)
    .replace(/\.d\.ets$/g, EXTNAME_ETS);
}

function processFileNameWithoutExt(filePath: string): string {
  return path.basename(filePath)
    .replace(/\.d\.ts$/g, '')
    .replace(/\.d\.ets$/g, '')
    .replace(/\.ts$/g, '')
    .replace(/\.ets$/g, '');
}

function getPureName(name: string): string {
  return path.basename(name)
    .replace(EXTNAME_D_TS, '')
    .replace(EXTNAME_D_ETS, '')
    .replace(/_/g, '')
    .toLowerCase();
}

function isExistImportFile(fileDir: string, importPath: string): boolean {
  return [EXTNAME_D_TS, EXTNAME_D_ETS].some(ext => {
    return fs.existsSync(path.resolve(fileDir, `${importPath}${ext}`));
  });
}

function getCoreFilename(fileName: string): string {
  if (fileName.endsWith(EXTNAME_TS)) {
    return fileName.slice(0, -EXTNAME_TS.length);
  }
  return fileName;
}

function getFileAndKitComment(fileFullText: string): string {
  let fileAndKitComment: string = '';
  let pattern: RegExp = /\/\*\*\s*\*\s*@file[\s\S]*?@kit[\s\S]*?\*\//;
  let comment: RegExpMatchArray | null = fileFullText.match(pattern);
  if (comment) {
    fileAndKitComment = comment[0];
  }
  return fileAndKitComment;
}

function removeNonInteropDoc(result: string): string {
  return result.replace(/\/\*\*[\s\S]*?\*\//g, (substring: string): string => {
    return /@noninterop/g.test(substring) ? '' : substring;
  });
}

function writeFile(url: string, data: string, inputDir: string, outputPath: string): void {
  const newFilePath: string = path.resolve(outputPath, path.relative(inputDir, url));
  fs.mkdirSync(path.dirname(newFilePath), { recursive: true });
  fs.writeFileSync(newFilePath, data);
}

function removeComments(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/^\s*[\r\n]/gm, '');
}

function isNonInterop(node: ts.Node): boolean {
  const notesContent: string = node.getFullText().replace(node.getText(), '').replace(/[\s]/g, '');
  const notesArr: string[] = notesContent.split(/\/\*\*/);
  for (const note of notesArr) {
    if (note.length !== 0 && /@noninterop/g.test(note)) {
      return true;
    }
  }
  return false;
}

export {
  getCoreFilename,
  getFileAndKitComment,
  getPureName,
  isExistImportFile,
  isNonInterop,
  processFileName,
  processFileNameWithoutExt,
  readFile,
  removeNonInteropDoc,
  removeComments,
  writeFile,
};
