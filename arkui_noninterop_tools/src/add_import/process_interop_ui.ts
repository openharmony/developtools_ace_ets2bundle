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

import HandleUIImports from './handle_ui_imports';
import writeAnnotationFile from './annotation';
import { EXTNAME_D_ETS, EXTNAME_D_TS } from './pre_define';

export default function processInteropUI(inputPath: string, exportFlag: boolean,
  outputPath = ''): ts.TransformationResult<ts.SourceFile> {
  const filePaths = getDeclgenFiles(inputPath);

  const program = ts.createProgram(filePaths, defaultCompilerOptions());
  const sourceFiles = getSourceFiles(program, filePaths);

  const createTransformer = (ctx: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      const handleUIImports = new HandleUIImports(program, ctx, outputPath, inputPath, exportFlag);
      return handleUIImports.createCustomTransformer(sourceFile);
    };
  };
  const res = ts.transform(sourceFiles, [createTransformer]);

  writeAnnotationFile(inputPath, outputPath);
  return res;
}

function getDeclgenFiles(dir: string, filePaths: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath: string = path.join(dir, file);
    const stat: fs.Stats = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getDeclgenFiles(filePath, filePaths);
    } else if (stat.isFile() && (file.endsWith(EXTNAME_D_ETS) || file.endsWith(EXTNAME_D_TS))) {
      filePaths.push(filePath);
    }
  });

  return filePaths;
}

function defaultCompilerOptions(): ts.CompilerOptions {
  return {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.CommonJS,
    allowJs: true,
    checkJs: true,
    declaration: true,
    emitDeclarationOnly: true,
    noEmit: false
  };
}

function getSourceFiles(program: ts.Program, filePaths: string[]): ts.SourceFile[] {
  const sourceFiles: ts.SourceFile[] = [];

  filePaths.forEach(filePath => {
    sourceFiles.push(program.getSourceFile(filePath)!);
  });

  return sourceFiles;
}
