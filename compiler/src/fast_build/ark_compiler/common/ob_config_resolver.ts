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

import fs from 'fs';
import path from 'path';
import type * as ts from 'typescript';
import {
  ApiExtractor,
  clearGlobalCaches,
  performancePrinter
} from 'arkguard';
import type {
  ArkObfuscator,
} from 'arkguard';

import { toUnixPath } from '../../../utils';
import { allSourceFilePaths, localPackageSet } from '../../../ets_checker';
import { isCurrentProjectFiles } from '../utils';
import { sourceFileBelongProject } from '../module/module_source_file';

export {
  collectResevedFileNameInIDEConfig, // For running unit test.
  enableObfuscatedFilePathConfig,
  enableObfuscateFileName,
  generateConsumerObConfigFile,
  getRelativeSourcePath,
  handleObfuscatedFilePath,
  handleUniversalPathInObf,
  mangleFilePath,
  MergedConfig,
  nameCacheMap,
  ObConfigResolver,
  writeObfuscationNameCache,
  writeUnobfuscationContent,
  collectReservedNameForObf
} from 'arkguard';

export function resetObfuscation(): void {
  clearGlobalCaches();
  sourceFileBelongProject.clear();
  ApiExtractor.mPropertySet?.clear();
  ApiExtractor.mSystemExportSet?.clear();
  localPackageSet?.clear();
}

/**
 * dependencies of sourceFiles
 */
export const sourceFileDependencies: Map<string, ts.ModeAwareCache<ts.ResolvedModuleFull | undefined>> = new Map();

// Collect all keep files. If the path configured by the developer is a folder, all files in the compilation will be used to match this folder.
function collectAllKeepFiles(startPaths: string[], excludePathSet: Set<string>): Set<string> {
  const allKeepFiles: Set<string> = new Set();
  const keepFolders: string[] = [];
  startPaths.forEach(filePath => {
    if (excludePathSet.has(filePath)) {
      return;
    }
    if (fs.statSync(filePath).isDirectory()) {
      keepFolders.push(filePath);
    } else {
      allKeepFiles.add(filePath);
    }
  });
  if (keepFolders.length === 0) {
    return allKeepFiles;
  }

  allSourceFilePaths.forEach(filePath => {
    if (keepFolders.some(folderPath => filePath.startsWith(folderPath)) && !excludePathSet.has(filePath)) {
      allKeepFiles.add(filePath);
    }
  });
  return allKeepFiles;
}

// Collect all keep files and then collect their dependency files.
export function handleKeepFilesAndGetDependencies(mergedObConfig: MergedConfig, arkObfuscator: ArkObfuscator,
  projectConfig: Object): Set<string> {
  if (mergedObConfig === undefined || mergedObConfig.keepSourceOfPaths.length === 0) {
    sourceFileDependencies.clear();
    return new Set<string>();
  }
  const keepPaths = mergedObConfig.keepSourceOfPaths;
  const excludePaths = mergedObConfig.excludePathSet;
  let allKeepFiles: Set<string> = collectAllKeepFiles(keepPaths, excludePaths);
  arkObfuscator.setKeepSourceOfPaths(allKeepFiles);
  const keepFilesAndDependencies: Set<string> = getFileNamesForScanningWhitelist(mergedObConfig, allKeepFiles, projectConfig);
  sourceFileDependencies.clear();
  return keepFilesAndDependencies;
}

/**
 * Use tsc's dependency collection to collect the dependency files of the keep files.
 * Risk: The files resolved by typescript are different from the files resolved by rollup. For example, the two entry files have different priorities.
 * Tsc looks for files in the types field in oh-packagek.json5 first, and rollup looks for files in the main field.
 */
function getFileNamesForScanningWhitelist(mergedObConfig: MergedConfig, allKeepFiles: Set<string>,
  projectConfig: Object): Set<string> {
  const keepFilesAndDependencies: Set<string> = new Set<string>();
  if (!mergedObConfig.options.enableExportObfuscation) {
    return keepFilesAndDependencies;
  }
  let stack: string[] = Array.from(allKeepFiles);
  while (stack.length > 0) {
    const filePath: string = toUnixPath(stack.pop());
    if (keepFilesAndDependencies.has(filePath)) {
      continue;
    }

    keepFilesAndDependencies.add(filePath);
    const dependentModules: ts.ModeAwareCache<ts.ResolvedModuleFull | undefined> = sourceFileDependencies.get(filePath);
    dependentModules?.forEach(resolvedModule => {
      if (!resolvedModule) {
        // For `import moduleName form 'xx.so'`, when the xx.so cannot be resolved, dependentModules is [null]
        return;
      }
      let curDependencyPath: string = toUnixPath(resolvedModule.resolvedFileName);
      // resolvedModule can record system Api declaration files and ignore them
      if (isCurrentProjectFiles(curDependencyPath, projectConfig)) {
        stack.push(curDependencyPath);
      }
    });
  }
  return keepFilesAndDependencies;
}

/**
 * Disable performance printer when the build mode is debug
 */
export function disablePerformancePrinter(): void {
  if (performancePrinter !== undefined) {
    performancePrinter.filesPrinter = undefined;
    performancePrinter.singleFilePrinter = undefined;
    performancePrinter.timeSumPrinter = undefined
  }
}