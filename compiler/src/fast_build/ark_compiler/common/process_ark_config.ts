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
  ArkObfuscator,
  readProjectProperties
} from "arkguard"

import {
  TS2ABC,
  ESMODULE,
  NODE_MODULES,
  OH_MODULES,
  OBFUSCATION_TOOL
} from './ark_define';
import { isAotMode, isDebug } from '../utils';
import {
  isLinux,
  isMac,
  isWindows
} from '../../../utils';
import { getArkBuildDir } from '../../../ark_utils';
import { checkAotConfig } from '../../../gen_aot';
import { projectConfig as mainProjectConfig } from '../../../../main';
import {
  ObConfigResolver,
  collectResevedFileNameInIDEConfig,
  readNameCache,
} from './ob_config_resolver';
import type { MergedConfig } from './ob_config_resolver';

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

export function initArkConfig(projectConfig: any) {
  let arkRootPath: string = path.join(__dirname, '..', '..', '..', '..', 'bin', 'ark');
  if (projectConfig.arkFrontendDir) {
    arkRootPath = projectConfig.arkFrontendDir;
  }
  let arkConfig: ArkConfig = {
    arkRootPath: '',
    ts2abcPath: '',
    js2abcPath: '',
    mergeAbcPath: '',
    es2abcPath: '',
    aotCompilerPath: '',
    nodePath: '',
    isDebug: false
  };
  arkConfig.nodePath = 'node';
  if (projectConfig.nodeJs) {
    arkConfig.nodePath = projectConfig.nodePath;
  }
  arkConfig.isDebug = isDebug(projectConfig);
  arkConfig.arkRootPath = arkRootPath;
  processPlatformInfo(arkConfig);
  processCompatibleVersion(projectConfig, arkConfig);
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
    if (buildJsonInfo.dynamicImportLibInfo) {
      arkProjectConfig.dynamicImportLibInfo = buildJsonInfo.dynamicImportLibInfo;
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

  if(mainProjectConfig.es2abcCompileTsInAotMode || mainProjectConfig.es2abcCompileTsInNonAotMode) {
    arkProjectConfig.pandaMode = mainProjectConfig.pandaMode;
    arkProjectConfig.processTs = mainProjectConfig.processTs;
  }
  arkProjectConfig.compileMode = projectConfig.compileMode;

  if (projectConfig.compileHar || !isDebug(projectConfig))  {
    const logger: any = share.getLogger(OBFUSCATION_TOOL);
    initObfuscationConfig(projectConfig, arkProjectConfig, logger);
  }
  return arkProjectConfig;
}

function initObfuscationConfig(projectConfig: any, arkProjectConfig: any, logger: any): void {
  const obConfig: ObConfigResolver =  new ObConfigResolver(projectConfig, logger, true);
  const mergedObConfig: MergedConfig = obConfig.resolveObfuscationConfigs();
  const isHarCompiled: boolean = projectConfig.compileHar;
  if (mergedObConfig.options.disableObfuscation) {
    return;
  }
  let projectAndLibs: {projectAndLibsReservedProperties: string[]; libExportNames: string[]};
  if (mergedObConfig.options.enablePropertyObfuscation || mergedObConfig.options.enableExportObfuscation) {
    projectAndLibs = readProjectProperties([projectConfig.modulePath],
      {
        mNameObfuscation: {mReservedProperties: [], mKeepStringProperty: !mergedObConfig.options.enableStringPropertyObfuscation},
        mExportObfuscation: mergedObConfig.options.enableExportObfuscation
      }, true);
    if (mergedObConfig.options.enablePropertyObfuscation && projectAndLibs.projectAndLibsReservedProperties) {
      mergedObConfig.reservedPropertyNames.push(...(projectAndLibs.projectAndLibsReservedProperties));
    }
    if (mergedObConfig.options.enableExportObfuscation && projectAndLibs.libExportNames) {
      mergedObConfig.reservedNames.push(...(projectAndLibs.libExportNames));
    }
  }

  if (!isHarCompiled) {
    mergedObConfig.options.enableFileNameObfuscation = false;
    mergedObConfig.reservedFileNames = [];
  }

  if (mergedObConfig.options.enableFileNameObfuscation) {
    const ohPackagePath = path.join(projectConfig.modulePath, 'oh-package.json5');
    const reservedFileNamesInIDEconfig = collectResevedFileNameInIDEConfig(ohPackagePath, projectConfig.aceModuleJsonPath,
      projectConfig.projectPath, projectConfig.cachePath);
    mergedObConfig.reservedFileNames.push(...reservedFileNamesInIDEconfig);
  }
  arkProjectConfig.obfuscationMergedObConfig = mergedObConfig;

  if (isAotMode(arkProjectConfig) || isHarCompiled) {
    arkProjectConfig.arkObfuscator = initArkGuardConfig(projectConfig.obfuscationOptions?.obfuscationCacheDir, logger, mergedObConfig, isHarCompiled);
    return;
  }
  arkProjectConfig.terserConfig = initTerserConfig(projectConfig, logger, mergedObConfig, isHarCompiled);
}

function initTerserConfig(projectConfig: any, logger: any, mergedObConfig: MergedConfig, isHarCompiled: boolean): any {
  const isCompact = projectConfig.obfuscationOptions ? mergedObConfig.options.compact : isHarCompiled;
  const minifyOptions = {
    format: {
      beautify: !isCompact,
      indent_level: 2
    },
    compress: {
      join_vars: false,
      sequences: 0,
      directives: false,
      drop_console: mergedObConfig.options.removeLog
    },
    mangle: {
      reserved: mergedObConfig.reservedNames,
      toplevel: mergedObConfig.options.enableToplevelObfuscation
    }
  }
  const applyNameCache: string | undefined = mergedObConfig.options.applyNameCache;
  if (applyNameCache &&  applyNameCache.length > 0) {
    if (fs.existsSync(applyNameCache)) {
      minifyOptions.nameCache = JSON.parse(fs.readFileSync(applyNameCache, 'utf-8'));
    } else {
      logger.error(`ArkTS:ERROR Namecache file ${applyNameCache} does not exist`);
    }
  } else {
    if (projectConfig.obfuscationOptions && projectConfig.obfuscationOptions.obfuscationCacheDir) {
      const defaultNameCachePath: string = path.join(projectConfig.obfuscationOptions.obfuscationCacheDir,"nameCache.json");
      if (fs.existsSync(defaultNameCachePath)) {
        minifyOptions.nameCache = JSON.parse(fs.readFileSync(defaultNameCachePath, 'utf-8'));
      } else {
        minifyOptions.nameCache = {};
      }
    }
  }

  if (mergedObConfig.options.enablePropertyObfuscation) {
    minifyOptions.mangle.properties = {
      reserved: mergedObConfig.reservedPropertyNames,
      keep_quoted: !mergedObConfig.options.enableStringPropertyObfuscation
    };
  }
  return minifyOptions;
}

function initArkGuardConfig(obfuscationCacheDir: string | undefined, logger: any, mergedObConfig: MergedConfig, isHarCompiled: boolean): ArkObfuscator {
  const arkguardConfig = {
    mCompact: mergedObConfig.options.compact,
    mDisableHilog: false,
    mDisableConsole: mergedObConfig.options.removeLog,
    mSimplify: false,
    mRemoveComments: true,
    mTopLevel: mergedObConfig.options.enableToplevelObfuscation,
    mNameObfuscation: {
      mEnable: true,
      mNameGeneratorType: 1,
      mReservedNames: mergedObConfig.reservedNames,
      mRenameProperties: mergedObConfig.options.enablePropertyObfuscation,
      mReservedProperties: mergedObConfig.reservedPropertyNames,
      mKeepStringProperty: !mergedObConfig.options.enableStringPropertyObfuscation
    },
    mRemoveDeclarationComments: {
      mEnable: true,
      mReservedComments: mergedObConfig.keepComments
    },
    mEnableSourceMap: true,
    mEnableNameCache: true,
    mRenameFileName: undefined,
    mExportObfuscation: mergedObConfig.options.enableExportObfuscation
  }

  if (isHarCompiled) {
    arkguardConfig.mRenameFileName = {
      mEnable: mergedObConfig.options.enableFileNameObfuscation,
      mNameGeneratorType: 1,
      mReservedFileNames: mergedObConfig.reservedFileNames,
    }
  }

  const arkObfuscator: ArkObfuscator = new ArkObfuscator();
  arkObfuscator.init(arkguardConfig);
  if (mergedObConfig.options.applyNameCache && mergedObConfig.options.applyNameCache.length > 0) {
    readNameCache(mergedObConfig.options.applyNameCache, logger);
  } else {
    if (obfuscationCacheDir) {
      const defaultNameCachePath: string = path.join(obfuscationCacheDir,"nameCache.json");
      if (fs.existsSync(defaultNameCachePath)) {
        readNameCache(defaultNameCachePath, logger);
      }
    }
  }
  return arkObfuscator;
}

function processPlatformInfo(arkConfig: ArkConfig): void {
  const arkPlatformPath: string = getArkBuildDir(arkConfig.arkRootPath);
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

function processCompatibleVersion(projectConfig: object, arkConfig: ArkConfig): void {
  const platformPath: string = getArkBuildDir(arkConfig.arkRootPath);
  if (projectConfig.minPlatformVersion && projectConfig.minPlatformVersion.toString() === '8') {
    // use ts2abc to compile apps with 'CompatibleSdkVersion' set to 8
    arkConfig.ts2abcPath = path.join(platformPath, 'legacy_api8', 'src', 'index.js');
    projectConfig.pandaMode = TS2ABC;
  }
}

export const utProcessArkConfig = {
  processCompatibleVersion,
  initTerserConfig
};
