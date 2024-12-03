/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
import * as ts from 'typescript';
import * as crypto from 'crypto';
const fse = require('fs-extra');

import {
  projectConfig,
  systemModules,
  globalProgram,
  sdkConfigs,
  sdkConfigPrefix,
  partialUpdateConfig,
  resetProjectConfig,
  resetGlobalProgram
} from '../main';
import {
  preprocessExtend,
  preprocessNewExtend
} from './validate_ui_syntax';
import {
  INNER_COMPONENT_MEMBER_DECORATORS,
  COMPONENT_DECORATORS_PARAMS,
  COMPONENT_BUILD_FUNCTION,
  STYLE_ADD_DOUBLE_DOLLAR,
  $$,
  PROPERTIES_ADD_DOUBLE_DOLLAR,
  DOLLAR_BLOCK_INTERFACE,
  COMPONENT_EXTEND_DECORATOR,
  COMPONENT_BUILDER_DECORATOR,
  ESMODULE,
  EXTNAME_D_ETS,
  EXTNAME_JS,
  FOREACH_LAZYFOREACH,
  COMPONENT_IF,
  TS_WATCH_END_MSG,
  TS_BUILD_INFO_SUFFIX,
  HOT_RELOAD_BUILD_INFO_SUFFIX,
  WATCH_COMPILER_BUILD_INFO_SUFFIX,
  COMPONENT_STYLES_DECORATOR
} from './pre_define';
import {
  INNER_COMPONENT_NAMES,
  JS_BIND_COMPONENTS,
  BUILDIN_STYLE_NAMES
} from './component_map';
import { logger } from './compile_info';
import {
  hasDecorator,
  isString,
  generateSourceFilesInHar,
  startTimeStatisticsLocation,
  stopTimeStatisticsLocation,
  resolveModuleNamesTime,
  CompilationTimeStatistics,
  storedFileInfo,
  toUnixPath,
  isWindows,
  isMac,
  tryToLowerCasePath,
  getRollupCache,
  setRollupCache
} from './utils';
import {
  isExtendFunction,
  isOriginalExtend
} from './process_ui_syntax';
import { visualTransform } from './process_visual';
import { tsWatchEmitter } from './fast_build/ets_ui/rollup-plugin-ets-checker';
import {
  doArkTSLinter,
  ArkTSLinterMode,
  ArkTSVersion,
} from './do_arkTS_linter';
import {
  getJsDocNodeCheckConfig,
  isCardFile,
  getRealModulePath,
  getJsDocNodeConditionCheckResult
} from './fast_build/system_api/api_check_utils';
import { sourceFileDependencies } from './fast_build/ark_compiler/common/ob_config_resolver';

export interface LanguageServiceCache {
  service?: ts.LanguageService;
  pkgJsonFileHash?: string;
  targetESVersion?: ts.ScriptTarget;
  preTsImportSendable?: boolean;
}

export const SOURCE_FILES: Map<string, ts.SourceFile> = new Map();
export let localPackageSet: Set<string> = new Set();

export function readDeaclareFiles(): string[] {
  const declarationsFileNames: string[] = [];
  fs.readdirSync(path.resolve(__dirname, '../declarations'))
    .forEach((fileName: string) => {
      if (/\.d\.ts$/.test(fileName)) {
        declarationsFileNames.push(path.resolve(__dirname, '../declarations', fileName));
      }
    });
  return declarationsFileNames;
}

const buildInfoWriteFile: ts.WriteFileCallback = (fileName: string, data: string) => {
  if (fileName.includes(TS_BUILD_INFO_SUFFIX)) {
    const fd: number = fs.openSync(fileName, 'w');
    fs.writeSync(fd, data, undefined, 'utf8');
    fs.closeSync(fd);
  }
};
// The collection records the file name and the corresponding version, where the version is the hash value of the text in last compilation.
const filesBuildInfo: Map<string, string> = new Map();

export const compilerOptions: ts.CompilerOptions = ts.readConfigFile(
  path.resolve(__dirname, '../tsconfig.json'), ts.sys.readFile).config.compilerOptions;
function setCompilerOptions(resolveModulePaths: string[]): void {
  const allPath: Array<string> = ['*'];
  const basePath: string = path.resolve(projectConfig.projectPath);
  if (process.env.compileTool === 'rollup' && resolveModulePaths && resolveModulePaths.length) {
    resolveModulePaths.forEach((item: string) => {
      if (!(/oh_modules$/.test(item) || /node_modules$/.test(item))) {
        allPath.push(path.join(path.relative(basePath, item), '*'));
      }
    });
  } else {
    if (!projectConfig.aceModuleJsonPath) {
      allPath.push('../../../../../*');
      allPath.push('../../*');
    } else {
      allPath.push('../../../../*');
      allPath.push('../*');
    }
  }
  const suffix: string = projectConfig.hotReload ? HOT_RELOAD_BUILD_INFO_SUFFIX : TS_BUILD_INFO_SUFFIX;
  const buildInfoPath: string = path.resolve(projectConfig.cachePath, '..', suffix);
  checkArkTSVersion();
  Object.assign(compilerOptions, {
    'allowJs': getArkTSLinterMode() !== ArkTSLinterMode.NOT_USE ? true : false,
    'checkJs': getArkTSLinterMode() !== ArkTSLinterMode.NOT_USE ? false : undefined,
    'emitNodeModulesFiles': true,
    'importsNotUsedAsValues': ts.ImportsNotUsedAsValues.Preserve,
    'module': ts.ModuleKind.CommonJS,
    'moduleResolution': ts.ModuleResolutionKind.NodeJs,
    'noEmit': true,
    'target': convertConfigTarget(getTargetESVersion()),
    'baseUrl': basePath,
    'paths': {
      '*': allPath
    },
    'lib': convertConfigLib(getTargetESVersionLib()),
    'types': projectConfig.compilerTypes,
    'etsAnnotationsEnable': projectConfig.allowEtsAnnotations,
    'etsLoaderPath': projectConfig.etsLoaderPath,
    'needDoArkTsLinter': getArkTSLinterMode() !== ArkTSLinterMode.NOT_USE,
    'isCompatibleVersion': getArkTSLinterMode() === ArkTSLinterMode.COMPATIBLE_MODE,
    'skipTscOhModuleCheck': partialUpdateConfig.skipTscOhModuleCheck,
    'skipArkTSStaticBlocksCheck': partialUpdateConfig.skipArkTSStaticBlocksCheck,
    // options incremental && tsBuildInfoFile are required for applying incremental ability of typescript
    'incremental': true,
    'tsBuildInfoFile': buildInfoPath,
    'tsImportSendableEnable': tsImportSendable,
    'skipPathsInKeyForCompilationSettings': reuseLanguageServiceForDepChange,
    'compatibleSdkVersionStage': projectConfig.compatibleSdkVersionStage,
    'compatibleSdkVersion': projectConfig.compatibleSdkVersion
  });
  if (projectConfig.compileMode === ESMODULE) {
    Object.assign(compilerOptions, {
      'importsNotUsedAsValues': ts.ImportsNotUsedAsValues.Remove,
      'module': ts.ModuleKind.ES2020
    });
  }
  if (projectConfig.packageDir === 'oh_modules') {
    Object.assign(compilerOptions, {'packageManagerType': 'ohpm'});
  }
  readTsBuildInfoFileInCrementalMode(buildInfoPath, projectConfig);
}

function checkArkTSVersion(): void {
  const etsCheckerLogger = fastBuildLogger || logger;
  if (getArkTSVersion() === ArkTSVersion.ArkTS_1_0 && tsImportSendable) {
    const logMessage: string = 'ArkTS: ArkTSVersion1.0 does not support tsImportSendable in any condition';
    etsCheckerLogger.error('\u001b[31m' + logMessage);
    tsImportSendable = false;
  }
}

// Change target to enum's value，e.g: "es2021" => ts.ScriptTarget.ES2021
function convertConfigTarget(target: number | string): number | string {
  if ((typeof target === 'number') && (target in ts.ScriptTarget)) {
    return target;
  }
  return ts.convertCompilerOptionsFromJson({ 'target': target }, '').options.target;
}

// Change lib to libMap's value，e.g: "es2021" => "lib.es2021.d.ts"
function convertConfigLib(libs: string[]): string[] {
  let converted: boolean = true;
  let libMapValues: string[] = Array.from(ts.libMap.values());
  for (let i = 0; i < libs.length; i++) {
    if (!libMapValues.includes(libs[i])) {
      converted = false;
      break;
    }
  }
  if (converted) {
    return libs;
  }
  return ts.convertCompilerOptionsFromJson({ 'lib': libs }, '').options.lib;
}

/**
 * Read the source code information in the project of the last compilation process, and then use it
 * to determine whether the file has been modified during this compilation process.
 */
function readTsBuildInfoFileInCrementalMode(buildInfoPath: string, projectConfig: Object): void {
  if (!fs.existsSync(buildInfoPath) || !(projectConfig.compileHar || projectConfig.compileShared)) {
    return;
  }

  type FileInfoType = {
    version: string;
    affectsGlobalScope: boolean;
  };
  type ProgramType = {
    fileNames: string[];
    fileInfos: (FileInfoType | string)[];
  };
  let buildInfoProgram: ProgramType;
  try {
    const content: {program: ProgramType} = JSON.parse(fs.readFileSync(buildInfoPath, 'utf-8'));
    buildInfoProgram = content.program;
    if (!buildInfoProgram || !buildInfoProgram.fileNames || !buildInfoProgram.fileInfos) {
      throw new Error('.tsbuildinfo content is invalid');
    }
  } catch (err) {
    fastBuildLogger.warn('\u001b[33m' + 'ArkTS: Failed to parse .tsbuildinfo file. Error message: ' + err.message.toString());
    return;
  }
  const buildInfoDirectory: string = path.dirname(buildInfoPath);
  /**
   * For the windos and mac platform, the file path in tsbuildinfo is in lowercase, while buildInfoDirectory is the original path (including uppercase).
   * Therefore, the path needs to be converted to lowercase, and then perform path comparison.
   */
  const isMacOrWin = isWindows() || isMac();
  const fileNames: string[] = buildInfoProgram.fileNames;
  const fileInfos: (FileInfoType | string)[] = buildInfoProgram.fileInfos;
  fileInfos.forEach((fileInfo, index) => {
    const version: string = typeof fileInfo === 'string' ? fileInfo : fileInfo.version;
    const absPath: string = path.resolve(buildInfoDirectory, fileNames[index]);
    filesBuildInfo.set(isMacOrWin ? tryToLowerCasePath(absPath) : absPath, version);
  });
}

interface extendInfo {
  start: number,
  end: number,
  compName: string
}

function createHash(str: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(str);
  return hash.digest('hex');
}

export const fileHashScriptVersion: (fileName: string) => string = (fileName: string) => {
  if (!fs.existsSync(fileName)) {
    return '0';
  }

  let fileContent: string = fs.readFileSync(fileName).toString();
  let cacheInfo: CacheFileName = cache[path.resolve(fileName)];

  // Error code corresponding to message `Cannot find module xx or its corresponding type declarations`
  const errorCodeRequireRecheck: number = 2307;

  if (cacheInfo && cacheInfo.error === true && cacheInfo.errorCodes && cacheInfo.errorCodes.includes(errorCodeRequireRecheck)) {
    // If this file had errors that require recheck in the last compilation,
    // mark the file as modified by modifying its hash value, thereby triggering tsc to recheck.
    fileContent += Date.now().toString();
  }
  return createHash(fileContent);
};

// Reuse the last language service when dependency in oh-package.json5 changes to enhance performance in incremental building.
// Setting this to false will create a new language service on dependency changes, like a full rebuild.
const reuseLanguageServiceForDepChange: boolean = true;
// When dependency changes and reusing the last language service, enable this flag to recheck code dependent on those dependencies.
export let needReCheckForChangedDepUsers: boolean = false;

export function createLanguageService(rootFileNames: string[], resolveModulePaths: string[],
  compilationTime: CompilationTimeStatistics = null, rollupShareObject?: any): ts.LanguageService {
  setCompilerOptions(resolveModulePaths);
  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => [...rootFileNames, ...readDeaclareFiles()],
    getScriptVersion: fileHashScriptVersion,
    getScriptSnapshot: function(fileName) {
      if (!fs.existsSync(fileName)) {
        return undefined;
      }
      if (/(?<!\.d)\.(ets|ts)$/.test(fileName)) {
        startTimeStatisticsLocation(compilationTime ? compilationTime.scriptSnapshotTime : undefined);
        appComponentCollection.set(path.join(fileName), new Set());
        let content: string = processContent(fs.readFileSync(fileName).toString(), fileName);
        const extendFunctionInfo: extendInfo[] = [];
        content = instanceInsteadThis(content, fileName, extendFunctionInfo, this.uiProps);
        stopTimeStatisticsLocation(compilationTime ? compilationTime.scriptSnapshotTime : undefined);
        return ts.ScriptSnapshot.fromString(content);
      }
      return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    resolveModuleNames: resolveModuleNames,
    resolveTypeReferenceDirectives: resolveTypeReferenceDirectives,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
    getJsDocNodeCheckedConfig: (fileCheckedInfo: ts.FileCheckModuleInfo, sourceFileName: string) => {
      return getJsDocNodeCheckConfig(fileCheckedInfo.currentFileName, sourceFileName);
    },
    getFileCheckedModuleInfo: (containFilePath: string) => {
      return {
        fileNeedCheck: true,
        checkPayload: undefined,
        currentFileName: containFilePath
      };
    },
    getJsDocNodeConditionCheckedResult: (jsDocFileCheckedInfo: ts.FileCheckModuleInfo, jsDocs: ts.JsDocTagInfo[]) => {
      return getJsDocNodeConditionCheckResult(jsDocFileCheckedInfo, jsDocs);
    },
    uiProps: [],
    clearProps: function() {
      dollarCollection.clear();
      extendCollection.clear();
      this.uiProps.length = 0;
    },
    // TSC will re-do resolution if this callback return true.
    hasInvalidatedResolutions: (filePath: string): boolean => {
      return reuseLanguageServiceForDepChange && needReCheckForChangedDepUsers;
    }
  };

  if (process.env.watchMode === 'true') {
    return ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
  }

  return getOrCreateLanguageService(servicesHost, rootFileNames, rollupShareObject);
}

export let targetESVersionChanged: boolean = false;

function getOrCreateLanguageService(servicesHost: ts.LanguageServiceHost, rootFileNames: string[],
  rollupShareObject?: any): ts.LanguageService {
  let cacheKey: string = 'service';
  let cache: LanguageServiceCache | undefined = getRollupCache(rollupShareObject, projectConfig, cacheKey);

  let service: ts.LanguageService | undefined = cache?.service;
  const currentHash: string | undefined = rollupShareObject?.projectConfig?.pkgJsonFileHash;
  const currentTargetESVersion: ts.ScriptTarget = compilerOptions.target;
  const lastHash: string | undefined = cache?.pkgJsonFileHash;
  const lastTargetESVersion: ts.ScriptTarget | undefined = cache?.targetESVersion;
  const hashDiffers: boolean | undefined = currentHash && lastHash && currentHash !== lastHash;
  const shouldRebuildForDepDiffers: boolean | undefined = reuseLanguageServiceForDepChange ?
    (hashDiffers && !rollupShareObject?.depInfo?.enableIncre) : hashDiffers;
  const targetESVersionDiffers: boolean | undefined = lastTargetESVersion && currentTargetESVersion && lastTargetESVersion !== currentTargetESVersion;
  const tsImportSendableDiff: boolean = (cache?.preTsImportSendable === undefined && !tsImportSendable) ?
    false :
    cache?.preTsImportSendable !== tsImportSendable;
  const shouldRebuild: boolean | undefined = shouldRebuildForDepDiffers || targetESVersionDiffers || tsImportSendableDiff;
  if (reuseLanguageServiceForDepChange && hashDiffers && rollupShareObject?.depInfo?.enableIncre) {
    needReCheckForChangedDepUsers = true;
  }

  if (!service || shouldRebuild) {
    rebuiuldProgram(targetESVersionDiffers, tsImportSendableDiff);
    service = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
  } else {
    // Found language service from cache, update root files
    const updateRootFileNames = [...rootFileNames, ...readDeaclareFiles()];
    service.updateRootFiles(updateRootFileNames);
  }

  const newCache: LanguageServiceCache = {
    service: service,
    pkgJsonFileHash: currentHash,
    targetESVersion: currentTargetESVersion,
    preTsImportSendable: tsImportSendable
  };
  setRollupCache(rollupShareObject, projectConfig, cacheKey, newCache);
  return service;
}

function rebuiuldProgram(targetESVersionDiffers: boolean | undefined, tsImportSendableDiff: boolean): void {
  if (targetESVersionDiffers) {
    // If the targetESVersion is changed, we need to delete the build info cahce files
    deleteBuildInfoCache(compilerOptions.tsBuildInfoFile);
    targetESVersionChanged = true;
  } else if (tsImportSendableDiff) {
    // When tsImportSendable is changed, we need to delete the build info cahce files
    deleteBuildInfoCache(compilerOptions.tsBuildInfoFile);
  }
}

function deleteBuildInfoCache(tsBuildInfoFilePath: string): void {
  // The file name of tsBuildInfoLinterFile is '.tsbuildinfo.linter', so we need to add '.linter' after tsBuildInfoFilePath
  const tsBuildInfoLinterFilePath: string = tsBuildInfoFilePath + '.linter';
  deleteFile(tsBuildInfoFilePath);
  deleteFile(tsBuildInfoLinterFilePath);
}

function deleteFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
  }
}

interface CacheFileName {
  mtimeMs: number,
  children: string[],
  parent: string[],
  error: boolean,
  errorCodes?: number[]
}
interface NeedUpdateFlag {
  flag: boolean;
}
interface CheckerResult {
  count: number
}

interface WarnCheckerResult {
  count: number
}

interface WholeCache {
  runtimeOS: string,
  sdkInfo: string,
  fileList: Cache
}
type Cache = Record<string, CacheFileName>;
export let cache: Cache = {};
export const hotReloadSupportFiles: Set<string> = new Set();
export const shouldResolvedFiles: Set<string> = new Set();
export const appComponentCollection: Map<string, Set<string>> = new Map();
const allResolvedModules: Set<string> = new Set();
// all files of tsc and rollup for obfuscation scanning.
export const allSourceFilePaths: Set<string> = new Set();
// Used to collect file paths that have not been converted toUnixPath.
export const allModuleIds: Set<string> = new Set();
export let props: string[] = [];

export let fastBuildLogger = null;

export const checkerResult: CheckerResult = { count: 0 };
export const warnCheckerResult: WarnCheckerResult = { count: 0 };
export let languageService: ts.LanguageService = null;
let tsImportSendable: boolean = false;
export function serviceChecker(rootFileNames: string[], newLogger: Object = null, resolveModulePaths: string[] = null,
  compilationTime: CompilationTimeStatistics = null, rollupShareObject?: Object): void {
  fastBuildLogger = newLogger;
  let cacheFile: string = null;
  tsImportSendable = rollupShareObject?.projectConfig.tsImportSendable;
  if (projectConfig.xtsMode || process.env.watchMode === 'true') {
    if (projectConfig.hotReload) {
      rootFileNames.forEach(fileName => {
        hotReloadSupportFiles.add(fileName);
      });
    }
    languageService = createLanguageService(rootFileNames, resolveModulePaths, compilationTime);
    props = languageService.getProps();
  } else {
    cacheFile = path.resolve(projectConfig.cachePath, '../.ts_checker_cache');
    const [isJsonObject, cacheJsonObject]: [boolean, WholeCache | undefined] = isJsonString(cacheFile);
    const wholeCache: WholeCache = isJsonObject ? cacheJsonObject : { 'runtimeOS': projectConfig.runtimeOS, 'sdkInfo': projectConfig.sdkInfo, 'fileList': {} };
    if (wholeCache.runtimeOS === projectConfig.runtimeOS && wholeCache.sdkInfo === projectConfig.sdkInfo) {
      cache = wholeCache.fileList;
    } else {
      cache = {};
    }
    languageService = createLanguageService(rootFileNames, resolveModulePaths, compilationTime, rollupShareObject);
  }

  const timePrinterInstance = ts.ArkTSLinterTimePrinter.getInstance();
  timePrinterInstance.setArkTSTimePrintSwitch(false);
  timePrinterInstance.appendTime(ts.TimePhase.START);
  startTimeStatisticsLocation(compilationTime ? compilationTime.createProgramTime : undefined);

  globalProgram.builderProgram = languageService.getBuilderProgram(/*withLinterProgram*/ true);
  globalProgram.program = globalProgram.builderProgram.getProgram();
  props = languageService.getProps();
  timePrinterInstance.appendTime(ts.TimePhase.GET_PROGRAM);
  stopTimeStatisticsLocation(compilationTime ? compilationTime.createProgramTime : undefined);

  collectAllFiles(globalProgram.program, undefined, undefined, rollupShareObject);
  collectFileToIgnoreDiagnostics(rootFileNames);
  startTimeStatisticsLocation(compilationTime ? compilationTime.runArkTSLinterTime : undefined);
  runArkTSLinter();
  stopTimeStatisticsLocation(compilationTime ? compilationTime.runArkTSLinterTime : undefined);

  if (process.env.watchMode !== 'true') {
    processBuildHap(cacheFile, rootFileNames, compilationTime, rollupShareObject);
  }

  if (globalProgram.program &&
    (process.env.watchMode !== 'true' && !projectConfig.isPreview &&
      !projectConfig.hotReload && !projectConfig.coldReload)) {
        globalProgram.program.releaseTypeChecker();
        const allowGC: boolean = global && global.gc && typeof global.gc === 'function';
        if (allowGC) {
          global.gc();
        }
  }
}

function isJsonString(cacheFile: string): [boolean, WholeCache | undefined] {
  if (fs.existsSync(cacheFile)) {
    try {
      return [true, JSON.parse(fs.readFileSync(cacheFile).toString())];
    } catch (e) {
      return [false, undefined];
    }
  } else {
    return [false, undefined];
  }
}

// collect the compiled files of tsc and rollup for obfuscation scanning.
export function collectAllFiles(program?: ts.Program, rollupFileList?: IterableIterator<string>,
  rollupObject?: Object, rollupShareObject: Object = null): void {
  if (program) {
    collectTscFiles(program, rollupShareObject);
    return;
  }
  mergeRollUpFiles(rollupFileList, rollupObject);
}

export function collectTscFiles(program: ts.Program, rollupShareObject: Object = null): void {
  const programAllFiles: readonly ts.SourceFile[] = program.getSourceFiles();
  let projectRootPath: string = projectConfig.projectRootPath;
  if (!projectRootPath) {
    return;
  }
  projectRootPath = toUnixPath(projectRootPath);
  const isMacOrWin = isWindows() || isMac();
  programAllFiles.forEach(sourceFile => {
    const fileName = toUnixPath(sourceFile.fileName);
    // @ts-ignore
    sourceFileDependencies.set(fileName, sourceFile.resolvedModules);
    if (!(fileName.startsWith(projectRootPath + '/') || isOtherProjectResolvedModulesFilePaths(rollupShareObject, fileName))) {
      return;
    }
    allSourceFilePaths.add(fileName);
    allModuleIds.add(sourceFile.fileName);
    // For the windos and mac platform, the file path in filesBuildInfo is in lowercase,
    // while fileName of sourceFile is the original path (including uppercase).
    if (filesBuildInfo.size > 0 &&
      Reflect.get(sourceFile, 'version') !== filesBuildInfo.get(isMacOrWin ? tryToLowerCasePath(fileName) : fileName)) {
      allResolvedModules.add(fileName);
    }
  });
}

function isOtherProjectResolvedModulesFilePaths(rollupShareObject: Object, fileName: string): boolean {
  if (!!rollupShareObject && rollupShareObject.projectConfig && !!rollupShareObject.projectConfig.rootPathSet) {
    const rootPathSet: string[] | Set<string> = rollupShareObject.projectConfig.rootPathSet;
    if (Array.isArray(rootPathSet)) {
      for (let i = 0; i < rootPathSet.length; i++) {
        const pathNormalization: string = toUnixPath(rootPathSet[i]) + '/';
        if (fileName.startsWith(pathNormalization)) {
          return true;
        }
      }
    } else {
      return false;
    }
  }
  return false;
}

export function mergeRollUpFiles(rollupFileList: IterableIterator<string>, rollupObject: Object) {
  for (const moduleId of rollupFileList) {
    if (fs.existsSync(moduleId)) {
      allSourceFilePaths.add(toUnixPath(moduleId));
      allModuleIds.add(moduleId);
      addLocalPackageSet(moduleId, rollupObject);
    }
  }
}

// collect the modulename or pkgname of all local modules.
export function addLocalPackageSet(moduleId: string, rollupObject: Object): void {
  const moduleInfo: Object = rollupObject.getModuleInfo(moduleId);
  const metaInfo: Object = moduleInfo.meta;
  if (metaInfo.isLocalDependency) {
    if (projectConfig.useNormalizedOHMUrl && metaInfo.pkgName) {
      localPackageSet.add(metaInfo.pkgName);
    }
    if (!projectConfig.useNormalizedOHMUrl && metaInfo.moduleName) {
      localPackageSet.add(metaInfo.moduleName);
    }
  }
}

export function emitBuildInfo(): void {
  globalProgram.builderProgram.emitBuildInfo(buildInfoWriteFile);
}

function processBuildHap(cacheFile: string, rootFileNames: string[], compilationTime: CompilationTimeStatistics,
  rollupShareObject: Object): void {
  startTimeStatisticsLocation(compilationTime ? compilationTime.diagnosticTime : undefined);
  const allDiagnostics: ts.Diagnostic[] = globalProgram.builderProgram
    .getSyntacticDiagnostics()
    .concat(globalProgram.builderProgram.getSemanticDiagnostics());
  stopTimeStatisticsLocation(compilationTime ? compilationTime.diagnosticTime : undefined);
  emitBuildInfo();
  allDiagnostics.forEach((diagnostic: ts.Diagnostic) => {
    printDiagnostic(diagnostic);
  });
  if (!projectConfig.xtsMode) {
    fse.ensureDirSync(projectConfig.cachePath);
    fs.writeFileSync(cacheFile, JSON.stringify({
      'runtimeOS': projectConfig.runtimeOS,
      'sdkInfo': projectConfig.sdkInfo,
      'fileList': cache
    }, null, 2));
  }
  if (projectConfig.compileHar || projectConfig.compileShared) {
    let emit: string | undefined = undefined;
    let writeFile = (fileName: string, text: string, writeByteOrderMark: boolean): void => {
      emit = text;
    };
    [...allResolvedModules, ...rootFileNames].forEach(moduleFile => {
      if (!(moduleFile.match(new RegExp(projectConfig.packageDir)) && projectConfig.compileHar)) {
        try {
          if ((/\.d\.e?ts$/).test(moduleFile)) {
            generateSourceFilesInHar(moduleFile, fs.readFileSync(moduleFile, 'utf-8'), path.extname(moduleFile),
              projectConfig, projectConfig.modulePathMap);
          } else if ((/\.e?ts$/).test(moduleFile)) {
            emit = undefined;
            let sourcefile = globalProgram.program.getSourceFile(moduleFile);
            if (sourcefile) {
              globalProgram.program.emit(sourcefile, writeFile, undefined, true, undefined, true);
            }
            if (emit) {
              generateSourceFilesInHar(moduleFile, emit, '.d' + path.extname(moduleFile), projectConfig, projectConfig.modulePathMap);
            }
          }
        } catch (err) { }
      }
    });
    printDeclarationDiagnostics();
  }
}

function printDeclarationDiagnostics(): void {
  globalProgram.builderProgram.getDeclarationDiagnostics().forEach((diagnostic: ts.Diagnostic) => {
    printDiagnostic(diagnostic);
  });
}

function containFormError(message: string): boolean {
  if (/can't support form application./.test(message)) {
    return true;
  }
  return false;
}

let fileToIgnoreDiagnostics: Set<string> | undefined = undefined;

function collectFileToThrowDiagnostics(file: string, fileToThrowDiagnostics: Set<string>): void {
  const normalizedFilePath: string = path.resolve(file);
  const unixFilePath: string = toUnixPath(file);
  if (fileToThrowDiagnostics.has(unixFilePath)) {
    return;
  }

  fileToThrowDiagnostics.add(unixFilePath);
  // Although the cache object filters JavaScript files when collecting dependency relationships, we still include the
  // filtering of JavaScript files here to avoid potential omissions.
  if ((/\.(c|m)?js$/).test(file) ||
    !cache[normalizedFilePath] || cache[normalizedFilePath].children.length === 0) {
    return;
  }
  cache[normalizedFilePath].children.forEach(file => {
    collectFileToThrowDiagnostics(file, fileToThrowDiagnostics);
  });
}

export function collectFileToIgnoreDiagnostics(rootFileNames: string[]): void {
  if (getArkTSLinterMode() === ArkTSLinterMode.NOT_USE) {
    return;
  }

  // In watch mode, the `beforeBuild` phase will clear the parent and children fields in the cache. For files that have
  // not been modified, the information needs to be restored using the `resolvedModuleNames` variable.
  if (process.env.watchMode === 'true') {
    for (let [file, resolvedModules] of resolvedModulesCache) {
      createOrUpdateCache(resolvedModules, file);
    }
  }

  // With arkts linter enabled, `allowJs` option is set to true, resulting JavaScript files themselves and
  // JavaScript-referenced files are included in the tsc program and checking process,
  // potentially introducing new errors. For instance, in scenarios where an ets file imports js file imports ts file,
  // it’s necessary to filter out errors from ts files.
  let fileToThrowDiagnostics: Set<string> = new Set<string>();
  rootFileNames.forEach(file => {
    if (!(/\.(c|m)?js$/).test(file)) {
      collectFileToThrowDiagnostics(file, fileToThrowDiagnostics);
    }
  });

  let resolvedTypeReferenceDirectivesFiles: Set<string> = new Set<string>();
  globalProgram.program.getResolvedTypeReferenceDirectives().forEach(
    (elem: ts.ResolvedTypeReferenceDirective | undefined) => {
      elem && elem.resolvedFileName && resolvedTypeReferenceDirectivesFiles.add(elem.resolvedFileName);
  });

  fileToIgnoreDiagnostics = new Set<string>();
  globalProgram.program.getSourceFiles().forEach(sourceFile => {
    // Previous projects had js libraries that were available through SDK, so need to filter js-file in SDK,
    // like: hypium library
    sourceFile.fileName &&
    (!isInSDK(sourceFile.fileName) || (/\.(c|m)?js$/).test(sourceFile.fileName)) &&
    !resolvedTypeReferenceDirectivesFiles.has(sourceFile.fileName) &&
    fileToIgnoreDiagnostics.add(toUnixPath(sourceFile.fileName));
  });

  fileToThrowDiagnostics.forEach(file => {
    fileToIgnoreDiagnostics.delete(file);
  });
}

export function printDiagnostic(diagnostic: ts.Diagnostic): void {
  if (projectConfig.ignoreWarning) {
    return;
  }

  if (fileToIgnoreDiagnostics && diagnostic.file && diagnostic.file.fileName &&
    fileToIgnoreDiagnostics.has(toUnixPath(diagnostic.file.fileName))) {
    return;
  }

  const message: string = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  if (validateError(message)) {
    if (process.env.watchMode !== 'true' && !projectConfig.xtsMode) {
      updateErrorFileCache(diagnostic);
    }

    if (containFormError(message) && !isCardFile(diagnostic.file.fileName)) {
      return;
    }

    const logPrefix: string = diagnostic.category === ts.DiagnosticCategory.Error ? 'ERROR' : 'WARN';
    const etsCheckerLogger = fastBuildLogger || logger;
    let logMessage: string;
    if (logPrefix === 'ERROR') {
      checkerResult.count += 1;
    } else {
      warnCheckerResult.count += 1;
    }
    if (diagnostic.file) {
      const { line, character }: ts.LineAndCharacter =
        diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      logMessage = `ArkTS:${logPrefix} File: ${diagnostic.file.fileName}:${line + 1}:${character + 1}\n ${message}\n`;
    } else {
      logMessage = `ArkTS:${logPrefix}: ${message}`;
    }

    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      etsCheckerLogger.error('\u001b[31m' + logMessage);
    } else {
      etsCheckerLogger.warn('\u001b[33m' + logMessage);
    }
  }
}

function validateError(message: string): boolean {
  const propInfoReg: RegExp = /Cannot find name\s*'(\$?\$?[_a-zA-Z0-9]+)'/;
  const stateInfoReg: RegExp = /Property\s*'(\$?[_a-zA-Z0-9]+)' does not exist on type/;
  if (matchMessage(message, props, propInfoReg) ||
    matchMessage(message, props, stateInfoReg)) {
    return false;
  }
  return true;
}
function matchMessage(message: string, nameArr: any, reg: RegExp): boolean {
  if (reg.test(message)) {
    const match: string[] = message.match(reg);
    if (match[1] && nameArr.includes(match[1])) {
      return true;
    }
  }
  return false;
}

function updateErrorFileCache(diagnostic: ts.Diagnostic): void {
  if (!diagnostic.file) {
    return;
  }

  let cacheInfo: CacheFileName = cache[path.resolve(diagnostic.file.fileName)];
  if (cacheInfo) {
    cacheInfo.error = true;
    if (!cacheInfo.errorCodes) {
      cacheInfo.errorCodes = [];
    }
    cacheInfo.errorCodes.includes(diagnostic.code) || cacheInfo.errorCodes.push(diagnostic.code);
  }
}

function filterInput(rootFileNames: string[]): string[] {
  return rootFileNames.filter((file: string) => {
    const needUpdate: NeedUpdateFlag = { flag: false };
    const alreadyCheckedFiles: Set<string> = new Set();
    checkNeedUpdateFiles(path.resolve(file), needUpdate, alreadyCheckedFiles);
    if (!needUpdate.flag) {
      storedFileInfo.changeFiles.push(path.resolve(file));
    }
    return needUpdate.flag;
  });
}

function checkNeedUpdateFiles(file: string, needUpdate: NeedUpdateFlag, alreadyCheckedFiles: Set<string>): void {
  if (alreadyCheckedFiles.has(file)) {
    return;
  } else {
    alreadyCheckedFiles.add(file);
  }

  if (needUpdate.flag) {
    return;
  }

  const value: CacheFileName = cache[file];
  const mtimeMs: number = fs.statSync(file).mtimeMs;
  if (value) {
    if (value.error || value.mtimeMs !== mtimeMs) {
      needUpdate.flag = true;
      return;
    }
    for (let i = 0; i < value.children.length; ++i) {
      if (fs.existsSync(value.children[i])) {
        checkNeedUpdateFiles(value.children[i], needUpdate, alreadyCheckedFiles);
      } else {
        needUpdate.flag = true;
      }
    }
  } else {
    cache[file] = { mtimeMs, children: [], parent: [], error: false };
    needUpdate.flag = true;
  }
}

const fileExistsCache: Map<string, boolean> = new Map<string, boolean>();
const dirExistsCache: Map<string, boolean> = new Map<string, boolean>();
const moduleResolutionHost: ts.ModuleResolutionHost = {
  fileExists: (fileName: string): boolean => {
    let exists = fileExistsCache.get(fileName);
    if (exists === undefined) {
      exists = ts.sys.fileExists(fileName);
      fileExistsCache.set(fileName, exists);
    }
    return exists;
  },
  directoryExists: (directoryName: string): boolean => {
    let exists = dirExistsCache.get(directoryName);
    if (exists === undefined) {
      exists = ts.sys.directoryExists(directoryName);
      dirExistsCache.set(directoryName, exists);
    }
    return exists;
  },
  readFile(fileName: string): string | undefined {
    return ts.sys.readFile(fileName);
  },
  realpath(path: string): string {
    return ts.sys.realpath(path);
  },
  trace(s: string): void {
    console.info(s);
  }
};

//This is only for test
export const moduleResolutionHostTest = moduleResolutionHost;

export function resolveTypeReferenceDirectives(typeDirectiveNames: string[] | ts.FileReference[]): ts.ResolvedTypeReferenceDirective[] {
  if (typeDirectiveNames.length === 0) {
    return [];
  }

  const resolvedTypeReferenceCache: ts.ResolvedTypeReferenceDirective[] = [];
  const cache: Map<string, ts.ResolvedTypeReferenceDirective> = new Map<string, ts.ResolvedTypeReferenceDirective>();
  const containingFile: string = path.join(projectConfig.modulePath, 'build-profile.json5');

  for (const entry of typeDirectiveNames) {
    const typeName = isString(entry) ? entry : entry.fileName.toLowerCase();
    if (!cache.has(typeName)) {
      const resolvedFile = ts.resolveTypeReferenceDirective(typeName, containingFile, compilerOptions, moduleResolutionHost);
      if (!resolvedFile || !resolvedFile.resolvedTypeReferenceDirective) {
        logger.error('\u001b[31m', `ArkTS:Cannot find type definition file for: ${typeName}\n`);
      }
      const result: ts.ResolvedTypeReferenceDirective = resolvedFile.resolvedTypeReferenceDirective;
      cache.set(typeName, result);
      resolvedTypeReferenceCache.push(result);
    }
  }
  return resolvedTypeReferenceCache;
}

// resolvedModulesCache records the files and their dependencies of program.
export const resolvedModulesCache: Map<string, ts.ResolvedModuleFull[]> = new Map();

export function resolveModuleNames(moduleNames: string[], containingFile: string): ts.ResolvedModuleFull[] {
  startTimeStatisticsLocation(resolveModuleNamesTime);
  const resolvedModules: ts.ResolvedModuleFull[] = [];
  const cacheFileContent: ts.ResolvedModuleFull[] = resolvedModulesCache.get(path.resolve(containingFile));
  if (![...shouldResolvedFiles].length || shouldResolvedFiles.has(path.resolve(containingFile)) ||
    !(cacheFileContent && cacheFileContent.length === moduleNames.length)) {
    for (const moduleName of moduleNames) {
      const result = ts.resolveModuleName(moduleName, containingFile, compilerOptions, moduleResolutionHost);
      if (result.resolvedModule) {
        if (result.resolvedModule.resolvedFileName &&
          path.extname(result.resolvedModule.resolvedFileName) === EXTNAME_JS) {
          const resultDETSPath: string =
            result.resolvedModule.resolvedFileName.replace(EXTNAME_JS, EXTNAME_D_ETS);
          if (ts.sys.fileExists(resultDETSPath)) {
            resolvedModules.push(getResolveModule(resultDETSPath, EXTNAME_D_ETS));
          } else {
            resolvedModules.push(result.resolvedModule);
          }
        } else {
          resolvedModules.push(result.resolvedModule);
        }
      } else if (new RegExp(`^@(${sdkConfigPrefix})\\.`, 'i').test(moduleName.trim())) {
        let apiFileExist: boolean = false;
        for (let i = 0; i < sdkConfigs.length; i++) {
          const sdkConfig = sdkConfigs[i];
          const resolveModuleInfo: ResolveModuleInfo = getRealModulePath(sdkConfig.apiPath, moduleName, ['.d.ts', '.d.ets']);
          const modulePath: string = resolveModuleInfo.modulePath;
          const isDETS: boolean = resolveModuleInfo.isEts;
          if (systemModules.includes(moduleName + (isDETS ? '.d.ets' : '.d.ts')) && ts.sys.fileExists(modulePath)) {
            resolvedModules.push(getResolveModule(modulePath, isDETS ? '.d.ets' : '.d.ts'));
            apiFileExist = true;
            break;
          }
        }
        if (!apiFileExist) {
          resolvedModules.push(null);
        }
      } else if (/\.ets$/.test(moduleName) && !/\.d\.ets$/.test(moduleName)) {
        const modulePath: string = path.resolve(path.dirname(containingFile), moduleName);
        if (ts.sys.fileExists(modulePath)) {
          resolvedModules.push(getResolveModule(modulePath, '.ets'));
        } else {
          resolvedModules.push(null);
        }
      } else if (/\.ts$/.test(moduleName)) {
        const modulePath: string = path.resolve(path.dirname(containingFile), moduleName);
        if (ts.sys.fileExists(modulePath)) {
          resolvedModules.push(getResolveModule(modulePath, '.ts'));
        } else {
          resolvedModules.push(null);
        }
      } else {
        const modulePath: string = path.resolve(__dirname, '../../../api', moduleName + '.d.ts');
        const systemDETSModulePath: string = path.resolve(__dirname, '../../../api', moduleName + '.d.ets');
        const kitModulePath: string = path.resolve(__dirname, '../../../kits', moduleName + '.d.ts');
        const kitSystemDETSModulePath: string = path.resolve(__dirname, '../../../kits', moduleName + '.d.ets');
        const suffix: string = /\.js$/.test(moduleName) ? '' : '.js';
        const jsModulePath: string = path.resolve(__dirname, '../node_modules', moduleName + suffix);
        const fileModulePath: string =
          path.resolve(__dirname, '../node_modules', moduleName + '/index.js');
        const DETSModulePath: string = path.resolve(path.dirname(containingFile),
          /\.d\.ets$/.test(moduleName) ? moduleName : moduleName + EXTNAME_D_ETS);
        if (ts.sys.fileExists(modulePath)) {
          resolvedModules.push(getResolveModule(modulePath, '.d.ts'));
        } else if (ts.sys.fileExists(systemDETSModulePath)) {
          resolvedModules.push(getResolveModule(systemDETSModulePath, '.d.ets'));
        } else if (ts.sys.fileExists(kitModulePath)) {
          resolvedModules.push(getResolveModule(kitModulePath, '.d.ts'));
        } else if (ts.sys.fileExists(kitSystemDETSModulePath)) {
          resolvedModules.push(getResolveModule(kitSystemDETSModulePath, '.d.ets'));
        } else if (ts.sys.fileExists(jsModulePath)) {
          resolvedModules.push(getResolveModule(jsModulePath, '.js'));
        } else if (ts.sys.fileExists(fileModulePath)) {
          resolvedModules.push(getResolveModule(fileModulePath, '.js'));
        } else if (ts.sys.fileExists(DETSModulePath)) {
          resolvedModules.push(getResolveModule(DETSModulePath, '.d.ets'));
        } else {
          const srcIndex: number = projectConfig.projectPath.indexOf('src' + path.sep + 'main');
          let DETSModulePathFromModule: string;
          if (srcIndex > 0) {
            DETSModulePathFromModule = path.resolve(
              projectConfig.projectPath.substring(0, srcIndex), moduleName + path.sep + 'index' + EXTNAME_D_ETS);
            if (DETSModulePathFromModule && ts.sys.fileExists(DETSModulePathFromModule)) {
              resolvedModules.push(getResolveModule(DETSModulePathFromModule, '.d.ets'));
            } else {
              resolvedModules.push(null);
            }
          } else {
            resolvedModules.push(null);
          }
        }
      }
      if (projectConfig.hotReload && resolvedModules.length &&
        resolvedModules[resolvedModules.length - 1]) {
        hotReloadSupportFiles.add(path.resolve(resolvedModules[resolvedModules.length - 1].resolvedFileName));
      }
      if (collectShouldPackedFiles(resolvedModules)) {
        allResolvedModules.add(resolvedModules[resolvedModules.length - 1].resolvedFileName);
      }
    }
    if (!projectConfig.xtsMode) {
      createOrUpdateCache(resolvedModules, path.resolve(containingFile));
    }
    resolvedModulesCache.set(path.resolve(containingFile), resolvedModules);
    stopTimeStatisticsLocation(resolveModuleNamesTime);
    return resolvedModules;
  }
  stopTimeStatisticsLocation(resolveModuleNamesTime);
  return resolvedModulesCache.get(path.resolve(containingFile));
}

export interface ResolveModuleInfo {
  modulePath: string;
  isEts: boolean;
}

function collectShouldPackedFiles(resolvedModules: ts.ResolvedModuleFull[]): boolean | RegExpMatchArray {
  return (projectConfig.compileHar || projectConfig.compileShared) && resolvedModules[resolvedModules.length - 1] &&
    resolvedModules[resolvedModules.length - 1].resolvedFileName &&
    (path.resolve(resolvedModules[resolvedModules.length - 1].resolvedFileName).match(/(\.[^d]|[^\.]d|[^\.][^d])\.e?ts$/) ||
      path.resolve(resolvedModules[resolvedModules.length - 1].resolvedFileName).match(/\.d\.e?ts$/) &&
      path.resolve(resolvedModules[resolvedModules.length - 1].resolvedFileName).match(
        new RegExp('\\' + path.sep + 'src' + '\\' + path.sep + 'main' + '\\' + path.sep)));
}

function createOrUpdateCache(resolvedModules: ts.ResolvedModuleFull[], containingFile: string): void {
  const children: string[] = [];
  const error: boolean = false;
  resolvedModules.forEach(moduleObj => {
    if (moduleObj && moduleObj.resolvedFileName && /\.(ets|ts)$/.test(moduleObj.resolvedFileName)) {
      const file: string = path.resolve(moduleObj.resolvedFileName);
      const mtimeMs: number = fs.statSync(file).mtimeMs;
      children.push(file);
      const value: CacheFileName = cache[file];
      if (value) {
        value.mtimeMs = mtimeMs;
        value.error = error;
        value.parent = value.parent || [];
        value.parent.push(path.resolve(containingFile));
        value.parent = [...new Set(value.parent)];
      } else {
        cache[file] = { mtimeMs, children: [], parent: [containingFile], error };
      }
    }
  });
  cache[path.resolve(containingFile)] = {
    mtimeMs: fs.statSync(containingFile).mtimeMs, children,
    parent: cache[path.resolve(containingFile)] && cache[path.resolve(containingFile)].parent ?
      cache[path.resolve(containingFile)].parent : [], error
  };
}

export function createWatchCompilerHost(rootFileNames: string[],
  reportDiagnostic: ts.DiagnosticReporter, delayPrintLogCount: Function, resetErrorCount: Function,
  isPipe: boolean = false, resolveModulePaths: string[] = null): ts.WatchCompilerHostOfFilesAndCompilerOptions<ts.BuilderProgram> {
  if (projectConfig.hotReload) {
    rootFileNames.forEach(fileName => {
      hotReloadSupportFiles.add(fileName);
    });
  }
  if (!(isPipe && process.env.compileTool === 'rollup')) {
    setCompilerOptions(resolveModulePaths);
  }
  // Change the buildInfo file path, or it will cover the buildInfo file created before.
  const buildInfoPath: string = path.resolve(projectConfig.cachePath, '..', WATCH_COMPILER_BUILD_INFO_SUFFIX);
  const watchCompilerOptions = {...compilerOptions, tsBuildInfoFile: buildInfoPath};
  const createProgram = ts.createSemanticDiagnosticsBuilderProgram;
  const host = ts.createWatchCompilerHost(
    [...rootFileNames, ...readDeaclareFiles()], watchCompilerOptions,
    ts.sys, createProgram, reportDiagnostic,
    (diagnostic: ts.Diagnostic) => {
      if ([6031, 6032].includes(diagnostic.code)) {
        if (!isPipe) {
          process.env.watchTs = 'start';
          resetErrorCount();
        }
      }
      // End of compilation in watch mode flag.
      if ([6193, 6194].includes(diagnostic.code)) {
        if (!isPipe) {
          process.env.watchTs = 'end';
          if (fastBuildLogger) {
            fastBuildLogger.debug(TS_WATCH_END_MSG);
            tsWatchEmitter.emit(TS_WATCH_END_MSG);
          }
        }
        delayPrintLogCount();
      }
    });
  host.readFile = (fileName: string) => {
    if (!fs.existsSync(fileName)) {
      return undefined;
    }
    if (/(?<!\.d)\.(ets|ts)$/.test(fileName)) {
      let content: string = processContent(fs.readFileSync(fileName).toString(), fileName);
      const extendFunctionInfo: extendInfo[] = [];
      content = instanceInsteadThis(content, fileName, extendFunctionInfo, props);
      return content;
    }
    return fs.readFileSync(fileName).toString();
  };
  host.resolveModuleNames = resolveModuleNames;
  host.resolveTypeReferenceDirectives = resolveTypeReferenceDirectives;
  return host;
}

export function watchChecker(rootFileNames: string[], newLogger: any = null, resolveModulePaths: string[] = null): void {
  fastBuildLogger = newLogger;
  globalProgram.watchProgram = ts.createWatchProgram(
    createWatchCompilerHost(rootFileNames, printDiagnostic, () => { }, () => { }, false, resolveModulePaths));
}

export function instanceInsteadThis(content: string, fileName: string, extendFunctionInfo: extendInfo[],
  props: string[]): string {
  checkUISyntax(content, fileName, extendFunctionInfo, props);
  extendFunctionInfo.reverse().forEach((item) => {
    const subStr: string = content.substring(item.start, item.end);
    const insert: string = subStr.replace(/(\s)\$(\.)/g, (origin, item1, item2) => {
      return item1 + item.compName + 'Instance' + item2;
    });
    content = content.slice(0, item.start) + insert + content.slice(item.end);
  });
  return content;
}

function getResolveModule(modulePath: string, type): ts.ResolvedModuleFull {
  return {
    resolvedFileName: modulePath,
    isExternalLibraryImport: false,
    extension: type
  };
}

export const dollarCollection: Set<string> = new Set();
export const extendCollection: Set<string> = new Set();
export const importModuleCollection: Set<string> = new Set();

function checkUISyntax(source: string, fileName: string, extendFunctionInfo: extendInfo[], props: string[]): void {
  if (/\.ets$/.test(fileName)) {
    if (process.env.compileMode === 'moduleJson' ||
      path.resolve(fileName) !== path.resolve(projectConfig.projectPath, 'app.ets')) {
      const sourceFile: ts.SourceFile = ts.createSourceFile(fileName, source,
        ts.ScriptTarget.Latest, true, ts.ScriptKind.ETS, compilerOptions);
      collectComponents(sourceFile);
      collectionCustomizeStyles(sourceFile);
      parseAllNode(sourceFile, sourceFile, extendFunctionInfo);
      props.push(...dollarCollection, ...extendCollection);
    }
  }
}

function collectionCustomizeStyles(node: ts.Node): void {
  if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) &&
    (isUIDecorator(node, COMPONENT_STYLES_DECORATOR) || isUIDecorator(node, COMPONENT_EXTEND_DECORATOR)) &&
    node.name && ts.isIdentifier(node.name)) {
    BUILDIN_STYLE_NAMES.add(node.name.escapedText.toString());
  }
  if (ts.isSourceFile(node)) {
    node.statements.forEach((item: ts.Node) => {
      return collectionCustomizeStyles(item);
    });
  } else if (ts.isStructDeclaration(node)) {
    node.members.forEach((item: ts.Node) => {
      return collectionCustomizeStyles(item);
    });
  }
}

function isUIDecorator(node: ts.MethodDeclaration | ts.FunctionDeclaration |
  ts.StructDeclaration | ts.ClassDeclaration, decortorName: string): boolean {
  const decorators: readonly ts.Decorator[] = ts.getAllDecorators(node);
  if (decorators && decorators.length) {
    for (let i = 0; i < decorators.length; i++) {
      const originalDecortor: string = decorators[i].getText().replace(/\(.*\)$/, '').trim();
      if (originalDecortor === decortorName) {
        return true;
      } else {
        return false;
      }
    }
  }
  return false;
}
function collectComponents(node: ts.SourceFile): void {
  // @ts-ignore
  if (process.env.watchMode !== 'true' && node.identifiers && node.identifiers.size) {
    // @ts-ignore
    for (const key of node.identifiers.keys()) {
      if (JS_BIND_COMPONENTS.has(key)) {
        appComponentCollection.get(path.join(node.fileName)).add(key);
      }
    }
  }
}

function parseAllNode(node: ts.Node, sourceFileNode: ts.SourceFile, extendFunctionInfo: extendInfo[]): void {
  if (ts.isStructDeclaration(node)) {
    if (node.members) {
      node.members.forEach(item => {
        if (ts.isPropertyDeclaration(item) && ts.isIdentifier(item.name)) {
          const propertyName: string = item.name.getText();
          const decorators: readonly ts.Decorator[] = ts.getAllDecorators(item);
          if (decorators && decorators.length) {
            for (let i = 0; i < decorators.length; i++) {
              const decoratorName: string = decorators[i].getText().replace(/\(.*\)$/, '').trim();
              if (INNER_COMPONENT_MEMBER_DECORATORS.has(decoratorName)) {
                dollarCollection.add('$' + propertyName);
              }
            }
          }
        }
      });
    }
  }
  if (process.env.watchMode !== 'true' && ts.isIfStatement(node)) {
    appComponentCollection.get(path.join(sourceFileNode.fileName)).add(COMPONENT_IF);
  }
  if (ts.isMethodDeclaration(node) && node.name.getText() === COMPONENT_BUILD_FUNCTION ||
    (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) &&
    hasDecorator(node, COMPONENT_BUILDER_DECORATOR)) {
    if (node.body && node.body.statements && node.body.statements.length) {
      const checkProp: ts.NodeArray<ts.Statement> = node.body.statements;
      checkProp.forEach((item, index) => {
        traverseBuild(item, index);
      });
    }
  }
  if (ts.isFunctionDeclaration(node) && hasDecorator(node, COMPONENT_EXTEND_DECORATOR)) {
    if (node.body && node.body.statements && node.body.statements.length &&
      !isOriginalExtend(node.body)) {
      extendFunctionInfo.push({
        start: node.pos,
        end: node.end,
        compName: isExtendFunction(node, { decoratorName: '', componentName: '' })
      });
    }
  }
  ts.forEachChild(node, (child: ts.Node) => parseAllNode(child, sourceFileNode, extendFunctionInfo));
}

function isForeachAndLzayForEach(node: ts.Node): boolean {
  return ts.isCallExpression(node) && node.expression && ts.isIdentifier(node.expression) &&
    FOREACH_LAZYFOREACH.has(node.expression.escapedText.toString()) && node.arguments && node.arguments[1] &&
    ts.isArrowFunction(node.arguments[1]) && node.arguments[1].body && ts.isBlock(node.arguments[1].body);
}

function getComponentName(node: ts.Node): string {
  let temp = node.expression;
  let name: string;
  while (temp) {
    if (ts.isIdentifier(temp) && temp.parent && (ts.isCallExpression(temp.parent) ||
      ts.isEtsComponentExpression(temp.parent))) {
      name = temp.escapedText.toString();
      break;
    }
    temp = temp.expression;
  }
  return name;
}

function traverseBuild(node: ts.Node, index: number): void {
  if (ts.isExpressionStatement(node)) {
    const parentComponentName: string = getComponentName(node);
    node = node.expression;
    while (node) {
      if (ts.isEtsComponentExpression(node) && node.body && ts.isBlock(node.body) &&
        ts.isIdentifier(node.expression) && !DOLLAR_BLOCK_INTERFACE.has(node.expression.escapedText.toString())) {
        node.body.statements.forEach((item: ts.Statement, indexBlock: number) => {
          traverseBuild(item, indexBlock);
        });
        break;
      } else if (isForeachAndLzayForEach(node)) {
        node.arguments[1].body.statements.forEach((item: ts.Statement, indexBlock: number) => {
          traverseBuild(item, indexBlock);
        });
        break;
      } else {
        loopNodeFindDoubleDollar(node, parentComponentName);
        if (ts.isEtsComponentExpression(node) && node.body && ts.isBlock(node.body) &&
          ts.isIdentifier(node.expression)) {
          node.body.statements.forEach((item: ts.Statement, indexBlock: number) => {
            traverseBuild(item, indexBlock);
          });
          break;
        }
      }
      node = node.expression;
    }
  } else if (ts.isIfStatement(node)) {
    ifInnerDollarAttribute(node);
  }
}

function ifInnerDollarAttribute(node: ts.IfStatement): void {
  if (node.thenStatement && ts.isBlock(node.thenStatement) && node.thenStatement.statements) {
    node.thenStatement.statements.forEach((item, indexIfBlock) => {
      traverseBuild(item, indexIfBlock);
    });
  }
  if (node.elseStatement) {
    elseInnerDollarAttribute(node);
  }
}

function elseInnerDollarAttribute(node: ts.IfStatement): void {
  if (ts.isIfStatement(node.elseStatement) && node.elseStatement.thenStatement && ts.isBlock(node.elseStatement.thenStatement)) {
    traverseBuild(node.elseStatement, 0);
  } else if (ts.isBlock(node.elseStatement) && node.elseStatement.statements) {
    node.elseStatement.statements.forEach((item, indexElseBlock) => {
      traverseBuild(item, indexElseBlock);
    });
  }
}

function isPropertiesAddDoubleDollar(node: ts.Node): boolean {
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.arguments && node.arguments.length) {
    return true;
  } else if (ts.isEtsComponentExpression(node) && ts.isIdentifier(node.expression) &&
    DOLLAR_BLOCK_INTERFACE.has(node.expression.escapedText.toString())) {
    return true;
  } else {
    return false;
  }
}
function loopNodeFindDoubleDollar(node: ts.Node, parentComponentName: string): void {
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
    const argument: ts.NodeArray<ts.Node> = node.arguments;
    const propertyName: ts.Identifier | ts.PrivateIdentifier = node.expression.name;
    if (isCanAddDoubleDollar(propertyName.getText(), parentComponentName)) {
      argument.forEach((item: ts.Node) => {
        doubleDollarCollection(item);
      });
    }
  } else if (isPropertiesAddDoubleDollar(node)) {
    node.arguments.forEach((item: ts.Node) => {
      if (ts.isObjectLiteralExpression(item) && item.properties && item.properties.length) {
        item.properties.forEach((param: ts.Node) => {
          if (isObjectPram(param, parentComponentName)) {
            doubleDollarCollection(param.initializer);
          }
        });
      } else if (ts.isPropertyAccessExpression(item) && (handleComponentDollarBlock(node as ts.CallExpression, parentComponentName) ||
        STYLE_ADD_DOUBLE_DOLLAR.has(node.expression.getText()))) {
        doubleDollarCollection(item);
      }
    });
  }
}

function handleComponentDollarBlock(node: ts.CallExpression, parentComponentName: string): boolean {
  return ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
    DOLLAR_BLOCK_INTERFACE.has(parentComponentName) && PROPERTIES_ADD_DOUBLE_DOLLAR.has(parentComponentName) &&
    PROPERTIES_ADD_DOUBLE_DOLLAR.get(parentComponentName).has(node.expression.escapedText.toString());
}

function doubleDollarCollection(item: ts.Node): void {
  if (item.getText().startsWith($$)) {
    while (item.expression) {
      item = item.expression;
    }
    dollarCollection.add(item.getText());
  }
}

function isObjectPram(param: ts.Node, parentComponentName: string): boolean {
  return ts.isPropertyAssignment(param) && param.name && ts.isIdentifier(param.name) &&
    param.initializer && PROPERTIES_ADD_DOUBLE_DOLLAR.has(parentComponentName) &&
    PROPERTIES_ADD_DOUBLE_DOLLAR.get(parentComponentName).has(param.name.getText());
}

function isCanAddDoubleDollar(propertyName: string, parentComponentName: string): boolean {
  return PROPERTIES_ADD_DOUBLE_DOLLAR.has(parentComponentName) &&
    PROPERTIES_ADD_DOUBLE_DOLLAR.get(parentComponentName).has(propertyName) ||
    STYLE_ADD_DOUBLE_DOLLAR.has(propertyName);
}

function processContent(source: string, id: string): string {
  if (fastBuildLogger) {
    source = visualTransform(source, id, fastBuildLogger);
  }
  source = preprocessExtend(source, extendCollection);
  source = preprocessNewExtend(source, extendCollection);
  return source;
}

function judgeFileShouldResolved(file: string, shouldResolvedFiles: Set<string>): void {
  if (shouldResolvedFiles.has(file)) {
    return;
  }
  shouldResolvedFiles.add(file);
  if (cache && cache[file] && cache[file].parent) {
    cache[file].parent.forEach((item) => {
      judgeFileShouldResolved(item, shouldResolvedFiles);
    });
    cache[file].parent = [];
  }
  if (cache && cache[file] && cache[file].children) {
    cache[file].children.forEach((item) => {
      judgeFileShouldResolved(item, shouldResolvedFiles);
    });
    cache[file].children = [];
  }
}

export function incrementWatchFile(watchModifiedFiles: string[],
  watchRemovedFiles: string[]): void {
  const changedFiles: string[] = [...watchModifiedFiles, ...watchRemovedFiles];
  if (changedFiles.length) {
    shouldResolvedFiles.clear();
  }
  changedFiles.forEach((file) => {
    judgeFileShouldResolved(file, shouldResolvedFiles);
  });
}

export function runArkTSLinter(): void {
  const originProgram: ts.BuilderProgram = globalProgram.builderProgram;

  const timePrinterInstance = ts.ArkTSLinterTimePrinter.getInstance();

  const arkTSLinterDiagnostics = doArkTSLinter(getArkTSVersion(),
    getArkTSLinterMode(),
    originProgram,
    printArkTSLinterDiagnostic,
    !projectConfig.xtsMode,
    buildInfoWriteFile);

  if (process.env.watchMode !== 'true' && !projectConfig.xtsMode) {
    arkTSLinterDiagnostics.forEach((diagnostic: ts.Diagnostic) => {
      updateErrorFileCache(diagnostic);
    });
    timePrinterInstance.appendTime(ts.TimePhase.UPDATE_ERROR_FILE);
  }
  timePrinterInstance.printTimes();
  ts.ArkTSLinterTimePrinter.destroyInstance();
}

function printArkTSLinterDiagnostic(diagnostic: ts.Diagnostic): void {
  if (diagnostic.category === ts.DiagnosticCategory.Error && (isInOhModuleFile(diagnostic) || isEtsDeclFileInSdk(diagnostic))) {
    const originalCategory = diagnostic.category;
    diagnostic.category = ts.DiagnosticCategory.Warning;
    printDiagnostic(diagnostic);
    diagnostic.category = originalCategory;
    return;
  }
  printDiagnostic(diagnostic);
}

function isEtsDeclFileInSdk(diagnostics: ts.Diagnostic): boolean {
  if (diagnostics.file?.fileName === undefined) {
    return false;
  }
  return isInSDK(diagnostics.file.fileName) && diagnostics.file.fileName.endsWith('.ets');
}

function isInOhModuleFile(diagnostics: ts.Diagnostic): boolean {
  return (diagnostics.file !== undefined) &&
    ((diagnostics.file.fileName.indexOf('/oh_modules/') !== -1) || diagnostics.file.fileName.indexOf('\\oh_modules\\') !== -1);
}

function isInSDK(fileName: string | undefined): boolean {
  if (projectConfig.etsLoaderPath === undefined || fileName === undefined) {
    return false;
  }
  const sdkPath = path.resolve(projectConfig.etsLoaderPath, '../../../');
  return path.resolve(fileName).startsWith(sdkPath);
}

export function getArkTSLinterMode(): ArkTSLinterMode {
  if (!partialUpdateConfig.executeArkTSLinter) {
    return ArkTSLinterMode.NOT_USE;
  }

  if (!partialUpdateConfig.standardArkTSLinter) {
    return ArkTSLinterMode.COMPATIBLE_MODE;
  }

  if (isStandardMode()) {
    return ArkTSLinterMode.STANDARD_MODE;
  }
  return ArkTSLinterMode.COMPATIBLE_MODE;
}

export function isStandardMode(): boolean {
  const STANDARD_MODE_COMPATIBLE_SDK_VERSION = 10;
  if (projectConfig &&
    projectConfig.compatibleSdkVersion &&
    projectConfig.compatibleSdkVersion >= STANDARD_MODE_COMPATIBLE_SDK_VERSION) {
    return true;
  }
  return false;
}

function getArkTSVersion(): ArkTSVersion {
  if (projectConfig.arkTSVersion === '1.0') {
    return ArkTSVersion.ArkTS_1_0;
  } else if (projectConfig.arkTSVersion === '1.1') {
    return ArkTSVersion.ArkTS_1_1;
  } else if (projectConfig.arkTSVersion !== undefined) {
    const arkTSVersionLogger = fastBuildLogger || logger;
    arkTSVersionLogger.warn('\u001b[33m' + 'ArkTS: Invalid ArkTS version\n');
  }

  if (partialUpdateConfig.arkTSVersion === '1.0') {
    return ArkTSVersion.ArkTS_1_0;
  } else if (partialUpdateConfig.arkTSVersion === '1.1') {
    return ArkTSVersion.ArkTS_1_1;
  } else if (partialUpdateConfig.arkTSVersion !== undefined) {
    const arkTSVersionLogger = fastBuildLogger || logger;
    arkTSVersionLogger.warn('\u001b[33m' + 'ArkTS: Invalid ArkTS version in metadata\n');
  }

  return ArkTSVersion.ArkTS_1_1;
}

enum TargetESVersion {
  ES2017 = 'ES2017',
  ES2021 = 'ES2021',
}

function getTargetESVersion(): TargetESVersion {
  const targetESVersion = projectConfig?.projectArkOption?.tscConfig?.targetESVersion;
  if (targetESVersion === 'ES2017') {
    return TargetESVersion.ES2017;
  } else if (targetESVersion === 'ES2021') {
    return TargetESVersion.ES2021;
  } else if (targetESVersion !== undefined) {
    const targetESVersionLogger = fastBuildLogger || logger;
    targetESVersionLogger.warn('\u001b[33m' + 'ArkTS: Invalid Target ES version\n');
  }
  return TargetESVersion.ES2021;
}

interface TargetESVersionLib {
  ES2017: string[],
  ES2021: string[],
}

const targetESVersionLib: TargetESVersionLib = {
  // When target is es2017, the lib is es2020.
  ES2017: ['ES2020'],
  ES2021: ['ES2021'],
};

function getTargetESVersionLib(): string[] {
  const targetESVersion = projectConfig?.projectArkOption?.tscConfig?.targetESVersion;
  if (targetESVersion === 'ES2017') {
    return targetESVersionLib.ES2017;
  } else if (targetESVersion === 'ES2021') {
    return targetESVersionLib.ES2021;
  } else if (targetESVersion !== undefined) {
    const targetESVersionLogger = fastBuildLogger || logger;
    targetESVersionLogger.warn('\u001b[33m' + 'ArkTS: Invalid Target ES version\n');
  }
  return targetESVersionLib.ES2021;
}

function initEtsStandaloneCheckerConfig(logger, config): void {
  fastBuildLogger = logger;
  if (config.packageManagerType === 'ohpm') {
    config.packageDir = 'oh_modules';
    config.packageJson = 'oh-package.json5';
  } else {
    config.packageDir = 'node_modules';
    config.packageJson = 'package.json';
  }
  if (config.aceModuleJsonPath && fs.existsSync(config.aceModuleJsonPath)) {
    process.env.compileMode = 'moduleJson';
  }
  Object.assign(projectConfig, config);
}

function resetEtsStandaloneCheckerConfig(beforeInitFastBuildLogger, beforeInitCompileMode: string): void {
  resetProjectConfig();
  resetEtsCheck();
  fastBuildLogger = beforeInitFastBuildLogger;
  process.env.compileMode = beforeInitCompileMode;
}

export function etsStandaloneChecker(entryObj, logger, projectConfig): void {
  const beforeInitFastBuildLogger = fastBuildLogger;
  const beforeInitCompileMode = process.env.compileMode;
  initEtsStandaloneCheckerConfig(logger, projectConfig);
  const rootFileNames: string[] = [];
  const resolveModulePaths: string[] = [];
  Object.values(entryObj).forEach((fileName: string) => {
    rootFileNames.push(path.resolve(fileName));
  });
  if (projectConfig.resolveModulePaths && Array.isArray(projectConfig.resolveModulePaths)) {
    resolveModulePaths.push(...projectConfig.resolveModulePaths);
  }
  const filterFiles: string[] = filterInput(rootFileNames);
  languageService = createLanguageService(filterFiles, resolveModulePaths);
  const timePrinterInstance = ts.ArkTSLinterTimePrinter.getInstance();
  timePrinterInstance.setArkTSTimePrintSwitch(false);
  timePrinterInstance.appendTime(ts.TimePhase.START);
  globalProgram.builderProgram = languageService.getBuilderProgram(/*withLinterProgram*/ true);
  globalProgram.program = globalProgram.builderProgram.getProgram();
  props = languageService.getProps();
  timePrinterInstance.appendTime(ts.TimePhase.GET_PROGRAM);
  collectFileToIgnoreDiagnostics(filterFiles);
  runArkTSLinter();
  const allDiagnostics: ts.Diagnostic[] = globalProgram.builderProgram
    .getSyntacticDiagnostics()
    .concat(globalProgram.builderProgram.getSemanticDiagnostics());
  globalProgram.builderProgram.emitBuildInfo(buildInfoWriteFile);

  allDiagnostics.forEach((diagnostic: ts.Diagnostic) => {
    printDiagnostic(diagnostic);
  });
  resetEtsStandaloneCheckerConfig(beforeInitFastBuildLogger, beforeInitCompileMode);
}

export function resetEtsCheckTypeScript(): void {
  if (globalProgram.program) {
    globalProgram.program.releaseTypeChecker();
  } else if (languageService) {
    languageService.getProgram().releaseTypeChecker();
  }
  resetGlobalProgram();
  languageService = null;
}

export function resetEtsCheck(): void {
  cache = {};
  props = [];
  needReCheckForChangedDepUsers = false;
  resetEtsCheckTypeScript();
  allResolvedModules.clear();
  checkerResult.count = 0;
  warnCheckerResult.count = 0;
  resolvedModulesCache.clear();
  dollarCollection.clear();
  extendCollection.clear();
  allSourceFilePaths.clear();
  allModuleIds.clear();
  filesBuildInfo.clear();
  fileExistsCache.clear();
  dirExistsCache.clear();
  targetESVersionChanged = false;
  fileToIgnoreDiagnostics = undefined;
}
