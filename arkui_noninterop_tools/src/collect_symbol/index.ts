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
  input,
  output,
} from './config';

function readTsFile(filePath: string): string {
  const absolutePath = path.resolve(filePath);
  return fs.readFileSync(absolutePath, 'utf8');
}

function traverseAst(node: ts.Node, result: Set<string>): void {
  if (ts.isClassDeclaration(node) && node.name) {
    result.add(node.name.text);
  }

  if (ts.isEnumDeclaration(node) && node.name) {
    result.add(node.name.text);
  }

  ts.forEachChild(node, child => traverseAst(child, result));
}

function generateExportFile(identifiers: Array<string>, outputPath: string): void {
  if (identifiers.length === 0) {
    return;
  }

  const exportContent = `export { ${identifiers.join(', ')} };\n`;
  fs.writeFileSync(outputPath, exportContent, 'utf8');
}

function main(inputFilePath: string, outputFilePath: string): void {
  const fileContent = readTsFile(inputFilePath);

  const sourceFile = ts.createSourceFile(
    inputFilePath,
    fileContent,
    ts.ScriptTarget.ESNext,
    true
  );

  const identifiers: Set<string> = new Set();
  traverseAst(sourceFile, identifiers);

  generateExportFile(Array.from(identifiers).sort(), outputFilePath);
}

main(input, output);
