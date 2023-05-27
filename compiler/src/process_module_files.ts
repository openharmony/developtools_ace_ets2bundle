/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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

import path from 'path';
import ts from 'typescript';
import fs from 'fs';

import { newSourceMaps as rollupNewSourceMaps } from './fast_build/ark_compiler/transform';
import {
  EXTNAME_TS,
  EXTNAME_ETS,
} from './pre_define';
import {
  genTemporaryPath,
  mkdirsSync,
  toUnixPath,
} from './utils';
import {
  genSourceMapFileName,
  newSourceMaps as webpackNewSourceMaps,
  transformModuleSpecifier,
  writeObfuscatedSourceCode
} from './ark_utils';
import { processSystemApi } from './validate_ui_syntax';
import { isAotMode, isDebug } from './fast_build/ark_compiler/utils';

export const SRC_MAIN: string = 'src/main';

export async function writeFileSyncByNode(node: ts.SourceFile, projectConfig: any, logger?: any): Promise<void> {
  const mixedInfo: {content: string, sourceMapJson: any} = genContentAndSourceMapInfo(node, projectConfig);
  let temporaryFile: string = genTemporaryPath(node.fileName, projectConfig.projectPath, process.env.cachePath,
    projectConfig);
  if (temporaryFile.length === 0) {
    return;
  }
  let temporarySourceMapFile: string = '';
  if (temporaryFile.endsWith(EXTNAME_ETS)) {
    temporaryFile = temporaryFile.replace(/\.ets$/, EXTNAME_TS);
  }
  temporarySourceMapFile = genSourceMapFileName(temporaryFile);
  mkdirsSync(path.dirname(temporaryFile));
  let relativeSourceFilePath = toUnixPath(node.fileName).replace(toUnixPath(projectConfig.projectRootPath) + '/', '');
  let sourceMaps: Object;
  if (process.env.compileTool === 'rollup') {
    rollupNewSourceMaps[relativeSourceFilePath] = mixedInfo.sourceMapJson;
    sourceMaps = rollupNewSourceMaps;
  } else {
    webpackNewSourceMaps[relativeSourceFilePath] = mixedInfo.sourceMapJson;
    sourceMaps = webpackNewSourceMaps;
  }
  if (projectConfig.compileHar || (!isDebug(projectConfig) && isAotMode(projectConfig))) {
    await writeObfuscatedSourceCode(mixedInfo.content, temporaryFile, logger, projectConfig, relativeSourceFilePath, sourceMaps);
    return;
  }
  fs.writeFileSync(temporaryFile, mixedInfo.content);
}

function genContentAndSourceMapInfo(node: ts.SourceFile, projectConfig: any): any {
  const printer: ts.Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const options: ts.CompilerOptions = {
    sourceMap: true
  };
  const mapOpions: any = {
    sourceMap: true,
    inlineSourceMap: false,
    inlineSources: false,
    sourceRoot: '',
    mapRoot: '',
    extendedDiagnostics: false
  };
  const host: ts.CompilerHost = ts.createCompilerHost(options);
  const fileName: string = node.fileName;
  // @ts-ignore
  const sourceMapGenerator: any = ts.createSourceMapGenerator(
    host,
    // @ts-ignore
    ts.getBaseFileName(fileName),
    '',
    '',
    mapOpions
  );
  // @ts-ignore
  const writer: any = ts.createTextWriter(
    // @ts-ignore
    ts.getNewLineCharacter({newLine: ts.NewLineKind.LineFeed, removeComments: false}));
  printer['writeFile'](node, writer, sourceMapGenerator);
  const sourceMapJson: any = sourceMapGenerator.toJSON();
  sourceMapJson['sources'] = [toUnixPath(fileName).replace(toUnixPath(projectConfig.projectRootPath) + '/', '')];
  let content: string = writer.getText();
  if (process.env.compileTool !== 'rollup') {
    content = transformModuleSpecifier(fileName, processSystemApi(content, true), projectConfig);
  }

  return {
    content: content,
    sourceMapJson: sourceMapJson
  };
}
