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
import fs from 'fs';

import {
  TS2ABC,
  ESMODULE,
  AOT_FULL,
  AOT_PARTIAL,
  AOT_TYPE,
  AOT_PROFILE_SUFFIX,
  NODE_MODULES,
  OH_MODULES,
  FAIL
} from './ark_define';
import { isDebug } from '../utils';
import {
  isLinux,
  isMac,
  isWindows
} from '../../../utils';
import { getArkBuildDir } from '../../../ark_utils';
import { checkAotConfig } from '../../../gen_aot';
import { projectConfig as mainProjectConfig } from '../../../../main';

type ArkConfig = {
  arkRootPath: string;
  ts2abcPath: string;
  js2abcPath: string;
  mergeAbcPath: string;
  es2abcPath: string;
  aotCompilerPath: string;
  nodePath: string;
  isDebug: boolean;
};

let arkConfig: ArkConfig = {};

export function initArkConfig(projectConfig: any) {
  let arkRootPath: string = path.join(__dirname, '..', '..', '..', '..', 'bin', 'ark');
  if (projectConfig.arkFrontendDir) {
    arkRootPath = projectConfig.arkFrontendDir;
  }
  arkConfig.nodePath = 'node';
  if (projectConfig.nodeJs) {
    arkConfig.nodePath = projectConfig.nodePath;
  }
  processPlatformInfo(arkRootPath);
  processCompatibleVersion(projectConfig, arkRootPath);
  arkConfig.isDebug = isDebug(projectConfig);
  arkConfig.arkRootPath = arkRootPath;

  return arkConfig;
}

export function initArkProjectConfig(share: any) {
  let projectConfig: any = share.projectConfig;
  let arkProjectConfig: any = {};
  if (projectConfig.aceBuildJson && fs.existsSync(projectConfig.aceBuildJson)) {
    const buildJsonInfo = JSON.parse(fs.readFileSync(projectConfig.aceBuildJson).toString());
    arkProjectConfig.projectRootPath = buildJsonInfo.projectRootPath;
    arkProjectConfig.modulePathMap = buildJsonInfo.modulePathMap;
    arkProjectConfig.isOhosTest = buildJsonInfo.isOhosTest;
    if (buildJsonInfo.patchConfig) {
      arkProjectConfig.oldMapFilePath = buildJsonInfo.patchConfig.oldMapFilePath;
    }
    if (checkAotConfig(projectConfig.compileMode, buildJsonInfo,
      (error: string) => { share.throwArkTsCompilerError(error) })) {
      arkProjectConfig.processTs = true;
      arkProjectConfig.pandaMode = TS2ABC;
      arkProjectConfig.anBuildOutPut = buildJsonInfo.anBuildOutPut;
      arkProjectConfig.anBuildMode = buildJsonInfo.anBuildMode;
      arkProjectConfig.apPath = buildJsonInfo.apPath;
    } else {
      arkProjectConfig.processTs = false;
      arkProjectConfig.pandaMode = buildJsonInfo.pandaMode;
    }

    if (projectConfig.compileMode === ESMODULE) {
      arkProjectConfig.nodeModulesPath = buildJsonInfo.nodeModulesPath;
      arkProjectConfig.harNameOhmMap = buildJsonInfo.harNameOhmMap;
      projectConfig.packageDir = buildJsonInfo.packageManagerType === 'ohpm' ? OH_MODULES : NODE_MODULES;
    }
  }
  if (projectConfig.aceManifestPath && fs.existsSync(projectConfig.aceManifestPath)) {
    const manifestJsonInfo = JSON.parse(fs.readFileSync(projectConfig.aceManifestPath).toString());
    if (manifestJsonInfo.minPlatformVersion) {
      arkProjectConfig.minPlatformVersion = manifestJsonInfo.minPlatformVersion;
    }
  }
  if (projectConfig.aceModuleJsonPath && fs.existsSync(projectConfig.aceModuleJsonPath)) {
    const moduleJsonInfo = JSON.parse(fs.readFileSync(projectConfig.aceModuleJsonPath).toString());
    if (moduleJsonInfo.app.minAPIVersion) {
      arkProjectConfig.minPlatformVersion = moduleJsonInfo.app.minAPIVersion;
    }
    if (moduleJsonInfo.module) {
      arkProjectConfig.moduleName = moduleJsonInfo.module.name;
    }
    if (moduleJsonInfo.app) {
      arkProjectConfig.bundleName = moduleJsonInfo.app.bundleName;
    }
  }

  // Hotreload attributes are initialized by arkui in main.js, just copy them.
  arkProjectConfig.hotReload = mainProjectConfig.hotReload;
  arkProjectConfig.patchAbcPath = mainProjectConfig.patchAbcPath;
  arkProjectConfig.changedFileList = mainProjectConfig.changedFileList;

  return arkProjectConfig;
}

function processPlatformInfo(arkRootPath: string): void {
  const arkPlatformPath: string = getArkBuildDir(arkRootPath);
  if (isWindows()) {
    arkConfig.es2abcPath = path.join(arkPlatformPath, 'bin', 'es2abc.exe');
    arkConfig.ts2abcPath = path.join(arkPlatformPath, 'src', 'index.js');
    arkConfig.mergeAbcPath = path.join(arkPlatformPath, 'bin', 'merge_abc.exe');
    arkConfig.js2abcPath = path.join(arkPlatformPath, 'bin', 'js2abc.exe');
    arkConfig.aotCompilerPath = path.join(arkPlatformPath, 'bin', 'ark_aot_compiler.exe');
    return;
  }
  if (isLinux() || isMac()) {
    arkConfig.es2abcPath = path.join(arkPlatformPath, 'bin', 'es2abc');
    arkConfig.ts2abcPath = path.join(arkPlatformPath, 'src', 'index.js');
    arkConfig.mergeAbcPath = path.join(arkPlatformPath, 'bin', 'merge_abc');
    arkConfig.js2abcPath = path.join(arkPlatformPath, 'bin', 'js2abc');
    arkConfig.aotCompilerPath = path.join(arkPlatformPath, 'bin', 'ark_aot_compiler');
    return;
  }
}

function processCompatibleVersion(projectConfig: any, arkRootPath: string) {
  const platformPath: string = getArkBuildDir(arkRootPath);
  if (projectConfig.minPlatformVersion && projectConfig.minPlatformVersion.toString() === '8') {
    // use ts2abc to compile apps with 'CompatibleSdkVersion' set to 8
    arkConfig.ts2abcPath = path.join(platformPath, 'legacy_api8', 'src', 'index.js');
    projectConfig.pandaMode = TS2ABC;
  }
}