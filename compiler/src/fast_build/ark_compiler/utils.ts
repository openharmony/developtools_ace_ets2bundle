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

import cluster from 'cluster';
import fs from 'fs';
import path from 'path';
import os from 'os';
import sourceMap from "source-map";

import {
  DEBUG,
  ESMODULE,
  EXTNAME_ETS,
  EXTNAME_JS,
  EXTNAME_TS,
  EXTNAME_JSON,
  EXTNAME_CJS,
  EXTNAME_MJS,
  TEMPORARY
} from './common/ark_define';
import {
  nodeLargeOrEqualTargetVersion,
  genTemporaryPath,
  mkdirsSync,
  validateFilePathLength,
  toUnixPath,
  createAndStartEvent,
  stopEvent,
  harFilesRecord
} from '../../utils';
import type { GeneratedFileInHar } from '../../utils';
import {
  tryMangleFileNameAndWriteFile,
  writeObfuscatedSourceCode
} from '../../ark_utils';
import { AOT_FULL, AOT_PARTIAL, AOT_TYPE } from '../../pre_define';
import { newSourceMaps } from './transform';
import { hasTsNoCheckOrTsIgnoreFiles, compilingEtsOrTsFiles } from '../../process_ui_syntax';

export function needAotCompiler(projectConfig: any): boolean {
  return projectConfig.compileMode === ESMODULE && (projectConfig.anBuildMode === AOT_FULL ||
    projectConfig.anBuildMode === AOT_PARTIAL);
}

export function isAotMode(projectConfig: any): boolean {
  return projectConfig.compileMode === ESMODULE && (projectConfig.anBuildMode === AOT_FULL ||
    projectConfig.anBuildMode === AOT_PARTIAL || projectConfig.anBuildMode === AOT_TYPE);
}

export function isDebug(projectConfig: any): boolean {
  return projectConfig.buildMode.toLowerCase() === DEBUG;
}

export function isMasterOrPrimary() {
  return ((nodeLargeOrEqualTargetVersion(16) && cluster.isPrimary) ||
    (!nodeLargeOrEqualTargetVersion(16) && cluster.isMaster));
}

export function changeFileExtension(file: string, targetExt: string, originExt = ''): string {
  let currentExt = originExt.length === 0 ? path.extname(file) : originExt;
  let fileWithoutExt = file.substring(0, file.lastIndexOf(currentExt));
  return fileWithoutExt + targetExt;
}

function removeCacheFile(cacheFilePath: string, ext: string): void {
  let filePath = toUnixPath(changeFileExtension(cacheFilePath, ext));
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath);
  }
}

export function shouldETSOrTSFileTransformToJS(filePath: string, projectConfig: any): boolean {
  const sufStr: string = toUnixPath(filePath).replace(toUnixPath(projectConfig.projectRootPath), '');
  let cacheFilePath: string = path.join(projectConfig.cachePath, sufStr);

  if (!projectConfig.processTs) {
    removeCacheFile(cacheFilePath, EXTNAME_TS);
    return true;
  }

  if (compilingEtsOrTsFiles.indexOf(filePath) !== -1) {  // file involves in compilation
    const hasTsNoCheckOrTsIgnore = hasTsNoCheckOrTsIgnoreFiles.indexOf(filePath) !== -1;
    // Remove cacheFile whose extension is different the target file
    removeCacheFile(cacheFilePath, hasTsNoCheckOrTsIgnore ? EXTNAME_TS : EXTNAME_JS);
    return hasTsNoCheckOrTsIgnore;
  }

  cacheFilePath = toUnixPath(changeFileExtension(cacheFilePath, EXTNAME_JS));
  return fs.existsSync(cacheFilePath);
}

export async function writeFileContentToTempDir(id: string, content: string, projectConfig: any, logger: any, parentEvent: any) {
  if (isCommonJsPluginVirtualFile(id)) {
    return;
  }

  if (!isCurrentProjectFiles(id, projectConfig)) {
    return;
  }

  let filePath: string;
  if (projectConfig.compileHar) {
    // compileShared: compile shared har of project
    filePath = genTemporaryPath(id,
      projectConfig.compileShared ? projectConfig.projectRootPath : projectConfig.moduleRootPath,
      projectConfig.compileShared ? path.resolve(projectConfig.aceModuleBuild, '../etsFortgz'): projectConfig.cachePath,
      projectConfig, projectConfig.compileShared);
  } else {
    filePath = genTemporaryPath(id, projectConfig.projectPath, projectConfig.cachePath, projectConfig);
  }

  const eventWriteFileContent = createAndStartEvent(parentEvent, 'write file content');
  switch (path.extname(id)) {
    case EXTNAME_ETS:
    case EXTNAME_TS:
    case EXTNAME_JS:
    case EXTNAME_MJS:
    case EXTNAME_CJS:
      await writeFileContent(id, filePath, content, projectConfig, logger);
      break;
    case EXTNAME_JSON:
      tryMangleFileNameAndWriteFile(filePath, content, projectConfig, id);
      break;
    default:
      break;
  }
  stopEvent(eventWriteFileContent);
}

async function writeFileContent(sourceFilePath: string, filePath: string, content: string, projectConfig: any, logger: any) {
  if (!isSpecifiedExt(sourceFilePath, EXTNAME_JS)) {
    filePath = changeFileExtension(filePath, EXTNAME_JS);
  }

  // In compile har mode, the code needs to be obfuscated and compressed.
  if (projectConfig.compileHar || !isDebug(projectConfig)) {
    const relativeSourceFilePath: string = toUnixPath(sourceFilePath).replace(toUnixPath(projectConfig.projectRootPath)
      + '/', '');
    await writeObfuscatedSourceCode(content, filePath, logger, projectConfig, relativeSourceFilePath, newSourceMaps, sourceFilePath);
    return;
  }
  mkdirsSync(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function getEs2abcFileThreadNumber(): number {
  const fileThreads : number = os.cpus().length < 16 ? os.cpus().length : 16;
  return fileThreads;
}

export function isCommonJsPluginVirtualFile(filePath: string): boolean {
  // rollup uses commonjs plugin to handle commonjs files,
  // which will automatic generate files like 'jsfile.js?commonjs-exports'
  return filePath.includes('\x00');
}

export function isCurrentProjectFiles(filePath: string, projectConfig: any): boolean {
  return filePath.indexOf(projectConfig.projectRootPath) >= 0;
}

export function genTemporaryModuleCacheDirectoryForBundle(projectConfig: any) {
  const buildDirArr: string[] = projectConfig.aceModuleBuild.split(path.sep);
  const abilityDir: string = buildDirArr[buildDirArr.length - 1];
  const temporaryModuleCacheDirPath: string = path.join(projectConfig.cachePath, TEMPORARY, abilityDir);
  mkdirsSync(temporaryModuleCacheDirPath);

  return temporaryModuleCacheDirPath;
}

export function isSpecifiedExt(filePath: string, fileExtendName: string) {
  return path.extname(filePath) === fileExtendName;
}

export function genCachePath(tailName: string, projectConfig: any, logger: any): string {
  const pathName: string = projectConfig.cachePath !== undefined ?
    path.join(projectConfig.cachePath, TEMPORARY, tailName) : path.join(projectConfig.aceModuleBuild, tailName);
  mkdirsSync(path.dirname(pathName));

  validateFilePathLength(pathName, logger);
  return pathName;
}

export function isTsOrEtsSourceFile(file: string): boolean {
  return /(?<!\.d)\.[e]?ts$/.test(file);
}

export function isJsSourceFile(file: string): boolean {
  return /\.[cm]?js$/.test(file);
}

export function isJsonSourceFile(file: string): boolean {
  return /\.json$/.test(file);
}

export async function updateSourceMap(originMap: sourceMap.RawSourceMap, newMap: sourceMap.RawSourceMap): Promise<any> {
  if (!originMap) {
    return newMap;
  }
  if (!newMap) {
    return originMap;
  }
  const originConsumer: sourceMap.SourceMapConsumer = await new sourceMap.SourceMapConsumer(originMap);
  const newConsumer: sourceMap.SourceMapConsumer = await new sourceMap.SourceMapConsumer(newMap);
  const newMappingList: sourceMap.MappingItem[] = [];
  newConsumer.eachMapping((mapping: sourceMap.MappingItem) => {
    if (mapping.originalLine == null) {
      return;
    }
    const originalPos =
      originConsumer.originalPositionFor({line: mapping.originalLine, column: mapping.originalColumn});
    if (originalPos.source == null) {
      return;
    }
    mapping.originalLine = originalPos.line;
    mapping.originalColumn = originalPos.column;
    newMappingList.push(mapping);
  });
  const updatedGenerator: sourceMap.SourceMapGenerator = sourceMap.SourceMapGenerator.fromSourceMap(newConsumer);
  updatedGenerator['_file'] = originMap.file;
  updatedGenerator['_mappings']['_array'] = newMappingList;
  return JSON.parse(updatedGenerator.toString());
}