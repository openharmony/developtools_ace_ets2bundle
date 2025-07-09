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

import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
import {
  COMPILE_CONTEXT_INFO_JSON,
  FILESINFO_TXT,
  MODULES_ABC,
  MODULES_CACHE,
  NPMENTRIES_TXT,
  SOURCEMAPS,
  SOURCEMAPS_JSON,
} from '../common/ark_define';
import { GEN_ABC_CMD_FILE_PATH } from './pre_define';

/**
 * A script is called by hvigor in a mixed compilation scenario which 1.0 module is not main module,np
 * such as module1.2-> module1.0-> module1.2 -> module1.0, compile all 1.0 modules
 * and has nothing to do with the ace_ets2bundle process.
 */

/**
 * 
 * @param cachePathList projectConfig.cachePath of the modules to be merged
 * @param targetCachePath The merged target cache directory
 * @param aceModuleBuild The aceModuleBuild path of the target module is used to write the abc file to the disk
 * @returns erro.toString()
 */
export function run(cachePathList: string[], targetCachePath: string, aceModuleBuild: string): void {
  if (!cachePathList || cachePathList.length === 0) {
    return;
  }
  mergeCacheData(cachePathList, targetCachePath, FILESINFO_TXT);
  mergeCacheData(cachePathList, targetCachePath, MODULES_CACHE);
  mergeCacheData(cachePathList, targetCachePath, NPMENTRIES_TXT);
  mergeCompileContextInfo(cachePathList, targetCachePath);
  mergeSourceMap(cachePathList, targetCachePath);
  const cmd: string[] = JSON.parse(fs.readFileSync(path.join(cachePathList[0], GEN_ABC_CMD_FILE_PATH), 'utf-8'));
  updateCmd(cmd, targetCachePath, aceModuleBuild);
  execCmd(cmd);
}

export function mergeCacheData(cachePathList: string[], targetCachePath: string, fileName: string): void {
  const dataSet: Set<string> = new Set<string>();
  cachePathList.forEach(cachePath => {
    processCachePath(cachePath, fileName, dataSet);
  });

  const outputFilePath: string = path.join(targetCachePath, fileName);
  fs.writeFileSync(outputFilePath, Array.from(dataSet).join('\n'));
}

function processCachePath(cachePath: string, fileName: string, dataSet: Set<string>): void {
  const inputFilePath = path.join(cachePath, fileName);
  if (!fs.existsSync(inputFilePath)) {
    return;
  }

  const fileData = fs.readFileSync(inputFilePath).toString();
  const lines = fileData.split('\n');

  for (const data of lines) {
    if (data) {
      dataSet.add(data);
    }
  }
}

function execCmd(cmd: string[]): string {
  try {
    const result = childProcess.execSync(cmd.join(' '), {
      windowsHide: true,
      encoding: 'utf-8'
    });
    return result;
  } catch (error) {
    return error.toString();
  }
}

export function updateCmd(cmd: string[], targetCachePath: string, aceModuleBuild: string): void {
  for (let i = 0; i < cmd.length; i++) {
    if (cmd[i].indexOf('filesInfo.txt') !== -1) {
      const filesInfoPath: string = path.join(targetCachePath, FILESINFO_TXT);
      cmd[i] = `"@${filesInfoPath}"`;
      continue;
    }
    if (cmd[i] === ('--output')) {
      const moduleAbcPath = path.join(aceModuleBuild, MODULES_ABC);
      cmd[++i] = `"${moduleAbcPath}"`;
      continue;
    }
    if (cmd[i] === ('--cache-file')) {
      const cacheFilePath = path.join(targetCachePath, MODULES_CACHE);
      cmd[++i] = `"@${cacheFilePath}"`;
      continue;
    }
    if (cmd[i] === ('--npm-module-entry-list')) {
      const npmEntriesInfoPath = path.join(targetCachePath, NPMENTRIES_TXT);
      cmd[++i] = `"@${npmEntriesInfoPath}"`;
      continue;
    }
    if (cmd[i] === (`--compile-context-info`)) {
      const compileContextInfoPath = path.join(targetCachePath, COMPILE_CONTEXT_INFO_JSON);
      cmd[++i] = `"${compileContextInfoPath}"`;
      continue;
    }
  }
}

function deepMerge(target: Object, source: Object): Object {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

export function mergeCompileContextInfo(cachePathList: string[], targetCachePath: string): void {
  const mergedData = {
    hspPkgNames: [],
    compileEntries: [],
    updateVersionInfo: {}
  };

  cachePathList.forEach(cachePath => {
    const compileContextPath = path.join(cachePath, COMPILE_CONTEXT_INFO_JSON);

    if (fs.existsSync(compileContextPath)) {
      const data = JSON.parse(fs.readFileSync(compileContextPath, 'utf-8'));

      mergedData.hspPkgNames = [...mergedData.hspPkgNames, ...data.hspPkgNames];
      mergedData.compileEntries = [...mergedData.compileEntries, ...data.compileEntries];

      mergedData.updateVersionInfo = deepMerge(mergedData.updateVersionInfo, data.updateVersionInfo);
    }
  });

  const targetPath = path.join(targetCachePath, COMPILE_CONTEXT_INFO_JSON);
  fs.writeFileSync(targetPath, JSON.stringify(mergedData, null, 2));
}

export function mergeSourceMap(cachePathList: string[], targetCachePath: string): void {
  const mergedMap: Record<string, any> = {};
  cachePathList.forEach((item) => {
    /**
     * Prevent sourcemap.json file from not being generated.
     * Some bug scenarios only have one file written to disk.
     */
    const possiblePaths = [
      path.join(item, SOURCEMAPS),
      path.join(item, SOURCEMAPS_JSON),
    ];
  
    const sourceMapPath = possiblePaths.find(fs.existsSync);
    if (!sourceMapPath) {
      return;
    }
    const sourceMap = JSON.parse(fs.readFileSync(sourceMapPath, 'utf-8'));
    Object.assign(mergedMap, sourceMap);
  });
  
  const outputPath = path.join(targetCachePath, SOURCEMAPS);
  fs.writeFileSync(outputPath, JSON.stringify(mergedMap, null, 2), 'utf-8');
}
