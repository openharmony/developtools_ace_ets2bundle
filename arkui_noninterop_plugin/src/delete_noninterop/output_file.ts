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

import { GLOBAL_ESVALUE_FILE } from './pre_define';
import {
  removeNonInteropDoc,
  removeComments,
  writeFile,
 } from './utils';

import { stmtReplacementMap } from './global_var';

export default function outputFile(url: string, exportFlag: boolean, inputDir: string,
  outputPath: string, node: ts.SourceFile, sourceFile: ts.SourceFile, referencesMessage: string,
  copyrightMessage: string, isCopyrightDeleted: boolean): void {
  const printer: ts.Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  let result: string = printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
  if (isCopyrightDeleted) {
    result = copyrightMessage + '\n' + result;
  }
  copyrightMessage = node.getFullText().replace(node.getText(), '');
  if (referencesMessage) {
    result = result.substring(0, copyrightMessage.length) + '\n' + referencesMessage +
      result.substring(copyrightMessage.length);
  }
  result = removeNonInteropDoc(result);
  result = postProcessContent(result);
  writeFile(url, result, inputDir, outputPath);
  // api in component need merge
  if (exportFlag) {
    writeGlobalESValueFile(removeComments(result), outputPath);
  }
}

function postProcessContent(content: string): string {
  for (const [originalStmt, transformedStmt] of stmtReplacementMap) {
    content = content.replace(transformedStmt, originalStmt);
  }
  return content.replace(/^(\s*)\/\*\*\@reserved (.*) \*\/$/mg, '$1$2');
}

function writeGlobalESValueFile(content: string, outputPath: string): void {
  content = content.replace("'use static';", '').replace(/\.\.\/api/g, '.');
  fs.appendFileSync(`${path.resolve(outputPath, '../api')}/${GLOBAL_ESVALUE_FILE}`, content);
}
