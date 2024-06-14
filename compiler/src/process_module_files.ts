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

import { SourceMapGenerator } from './fast_build/ark_compiler/generate_sourcemap';
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
  writeObfuscatedSourceCode,
  createAndStartEvent,
  stopEvent
} from './ark_utils';
import { processSystemApi } from './validate_ui_syntax';
import { isAotMode, isDebug } from './fast_build/ark_compiler/utils';

export const SRC_MAIN: string = 'src/main';

export async function writeFileSyncByNode(node: ts.SourceFile, projectConfig: Object, moduleId?: string,
  parentEvent?: Object, logger?: Object): Promise<void> {
  const eventWriteFileSyncByNode = createAndStartEvent(parentEvent, 'write file sync by node');
  const eventGenContentAndSourceMapInfo = createAndStartEvent(eventWriteFileSyncByNode, 'generate content and source map information');
  const mixedInfo: { content: string, sourceMapJson: ts.RawSourceMap } = genContentAndSourceMapInfo(node, moduleId, projectConfig);
  const sourceMapGenerator = SourceMapGenerator.getInstance();
  stopEvent(eventGenContentAndSourceMapInfo);
  let temporaryFile: string = genTemporaryPath(moduleId ? moduleId : node.fileName, projectConfig.projectPath, process.env.cachePath,
    projectConfig);
  if (temporaryFile.length === 0) {
    return;
  }
  if (temporaryFile.endsWith(EXTNAME_ETS)) {
    temporaryFile = temporaryFile.replace(/\.ets$/, EXTNAME_TS);
  }
  let relativeSourceFilePath = toUnixPath(moduleId ? moduleId : node.fileName).replace(toUnixPath(projectConfig.projectRootPath) + '/', '');
  let sourceMaps: Object;
  if (process.env.compileTool === 'rollup') {
    const key = sourceMapGenerator.isNewSourceMaps() ? moduleId! : relativeSourceFilePath;
    sourceMapGenerator.fillSourceMapPackageInfo(moduleId!, mixedInfo.sourceMapJson);
    sourceMapGenerator.updateSourceMap(key, mixedInfo.sourceMapJson);
    sourceMaps = sourceMapGenerator.getSourceMaps();
  } else {
    webpackNewSourceMaps[relativeSourceFilePath] = mixedInfo.sourceMapJson;
    sourceMaps = webpackNewSourceMaps;
  }
  if (projectConfig.compileHar || (!isDebug(projectConfig) && isAotMode(projectConfig))) {
    const eventWriteObfuscatedSourceCode = createAndStartEvent(eventWriteFileSyncByNode, 'write obfuscated source code');
    await writeObfuscatedSourceCode({
        content: mixedInfo.content,
        buildFilePath: temporaryFile,
        relativeSourceFilePath: relativeSourceFilePath,
        originSourceFilePath: node.fileName,
        rollupModuleId: moduleId ? moduleId : undefined
      }, logger, projectConfig, sourceMaps);
    stopEvent(eventWriteObfuscatedSourceCode);
    return;
  }
  mkdirsSync(path.dirname(temporaryFile));
  fs.writeFileSync(temporaryFile, mixedInfo.content);
  stopEvent(eventWriteFileSyncByNode);
}

function genContentAndSourceMapInfo(node: ts.SourceFile, moduleId: string | undefined, projectConfig: Object): Object {
  const printer: ts.Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const options: ts.CompilerOptions = {
    sourceMap: true
  };
  const mapOpions: Object = {
    sourceMap: true,
    inlineSourceMap: false,
    inlineSources: false,
    sourceRoot: '',
    mapRoot: '',
    extendedDiagnostics: false
  };
  const host: ts.CompilerHost = ts.createCompilerHost(options);
  const fileName: string = moduleId ? moduleId : node.fileName;
  // @ts-ignore
  const sourceMapGenerator: ts.SourceMapGenerator = ts.createSourceMapGenerator(
    host,
    // @ts-ignore
    ts.getBaseFileName(fileName),
    '',
    '',
    mapOpions
  );
  // @ts-ignore
  const writer: ts.EmitTextWriter = ts.createTextWriter(
    // @ts-ignore
    ts.getNewLineCharacter({ newLine: ts.NewLineKind.LineFeed, removeComments: false }));
  printer['writeFile'](node, writer, sourceMapGenerator);
  const sourceMapJson: ts.RawSourceMap = sourceMapGenerator.toJSON();
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
