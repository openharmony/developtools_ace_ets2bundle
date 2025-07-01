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

import {
  getPackageJsonEntryPath,
  projectConfig,
  setIntentEntryPages
} from '../../../../main';
import { compilerOptions, readDeaclareFiles, resolveModuleNames } from '../../../ets_checker';
import { toUnixPath } from '../../../utils';
import {
  RunnerParms,
  generateInteropDecls
} from 'declgen/build/src/generateInteropDecls';


export function isMixCompile(): boolean {
  return process.env.mixCompile === 'true';
}

export function isRemoteModule(): boolean {
  return isMixCompile() && process.env.isRemoteModule === 'true';
}

export function generateDeclarationFileForSTS(rootFileNames: string[]): void {
  if (!(projectConfig.compileHar || projectConfig.compileShared)) {
    return;
  }
  const unixRootFileNames = rootFileNames.map(path => {
    return toUnixPath(path);
  });

  const uniqueFiles = Array.from(new Set([
    ...unixRootFileNames,
    /**
     * arkui lacks explicit import statements and needs to be manually added to the global rootfile,
     * otherwise an error will be reported during the tsc compilation of declgen
     */
    ...readDeaclareFiles()
  ]));

  const config: RunnerParms = {
    inputDirs: [],
    inputFiles: uniqueFiles,
    outDir: projectConfig.dependentModuleMap.get(projectConfig.entryPackageName).declgenV2OutPath,
    // use package name as folder name
    rootDir: projectConfig.modulePath,
    customResolveModuleNames: resolveModuleNames,
    customCompilerOptions: compilerOptions,
    includePaths: [projectConfig.modulePath]
  };
  if (fs.existsSync(config.outDir)) {
    fs.rmSync(config.outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(config.outDir, { recursive: true });
  generateInteropDecls(config);
}

/**
 * due to some oh_modules is different with the original arkTs module.
 * Some branches were not reached, causing some information to be uninitialized.
 */
export function initMixCompileHar(projectConfig): void {
  if (isMixCompile() && isRemoteModule()) {
    projectConfig.compileHar = true;
    process.env.compileMode = 'moduleJson';
    getPackageJsonEntryPath();
    /**
     * ets-loader will generate decl file from projectConfig.intentEntry which init in setIntentEntryPages.
     * aceModuleJsonPath->ark_modules.json
     * when compile oh_module with ets-loader, aceModuleJsonPath will be undefined.
     * so projectConfig.intentEntry is empty.
     */
    setIntentEntryPages(projectConfig);
  }
}