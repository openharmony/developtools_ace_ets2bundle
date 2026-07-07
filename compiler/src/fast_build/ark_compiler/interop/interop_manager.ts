/*
 * Copyright (c) 2025-2026 Huawei Device Co., Ltd.
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

import {
  globalModulePaths,
  initBuildInfo,
  loadEntryObj,
  loadModuleInfo,
  loadWorker,
  projectConfig,
  readAppResource,
  readPatchConfig,
  readWorkerFile,
  sdkConfigs
} from '../../../../main';
import { toUnixPath } from '../../../utils';
import {
  ArkTSEvolutionModule,
  FileInfo,
  AliasConfig,
  InteropConfig,
  InteropInfo
} from './type';
import {
  hasExistingPaths,
  isSubPathOf
} from '../utils';
import {
  CommonLogger,
  LogData,
  LogDataFactory
} from '../logger';
import {
  ArkTSErrorDescription,
  ArkTSInternalErrorDescription,
  ErrorCode
} from '../error_code';
import { EXTNAME_TS } from '../common/ark_define';
import {
  ARKTS_1_1,
  ARKTS_1_2,
  ARKTS_HYBRID
} from './pre_define';
import { readFirstLineSync } from './utils';
import { logger } from '../../../compile_info';

export const entryFileLanguageInfo = new Map();
export let workerFile = null;
export let mixCompile = undefined;

type LanguageVersionInfo = {
  languageVersion: string,
  pkgName: string
};

type SDKPathMatcher = {
  root: string,
  rootWithSlash: string,
  languageVersion: string
};

export function setEntryFileLanguage(filePath: string, language: string): void {
  entryFileLanguageInfo.set(filePath, language);
}

export class FileManager {
  private static instance: FileManager | undefined = undefined;

  static arkTSModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
  static aliasConfig: Map<string, Map<string, AliasConfig>> = new Map();
  static dynamicLibPath: Set<string> = new Set();
  static staticSDKDeclPath: Set<string> = new Set();
  static staticSDKGlueCodePath: Set<string> = new Set();
  static mixCompile: boolean = false;
  static glueCodeFileInfos: Map<string, FileInfo> = new Map();
  static isInteropSDKEnabled: boolean = false;
  static dynamicFileVersionMap: Map<string, string> = new Map();
  static staticFileVersionMap: Map<string, string> = new Map();
  private static sdkPathMatchers: SDKPathMatcher[] = [];
  private static sdkPathMatchCache: Map<string, LanguageVersionInfo | undefined> = new Map();
  private static modulePathMatchCache: Map<string, LanguageVersionInfo | undefined> = new Map();
  interopConfig: InteropConfig | undefined = undefined;

  private constructor() { }

  public static init(
    dependentModuleMap: Map<string, ArkTSEvolutionModule>,
    aliasPaths?: Map<string, string>,
    dynamicSDKPath?: Set<string>,
    staticSDKDeclPath?: Set<string>,
    staticSDKGlueCodePath?: Set<string>
  ): void {
    if (FileManager.instance === undefined) {
      FileManager.instance = new FileManager();
      FileManager.initLanguageVersionFromDependentModuleMap(dependentModuleMap);
      FileManager.initFileVersionMap();
      FileManager.initAliasConfig(aliasPaths);
      FileManager.initSDK(dynamicSDKPath, staticSDKDeclPath, staticSDKGlueCodePath);
    }
  }

  public static initForTest(
    dependentModuleMap: Map<string, ArkTSEvolutionModule>,
    aliasPaths: Map<string, string>,
    dynamicSDKPath?: Set<string>,
    staticSDKDeclPath?: Set<string>,
    staticSDKGlueCodePath?: Set<string>,
    projectTopDir?: string
  ): void {
    if (FileManager.instance === undefined) {
      FileManager.instance = new FileManager();
      if (FileManager.instance.interopConfig) {
        FileManager.instance.interopConfig.projectConfig['projectTopDir'] = projectTopDir;
      }
      else {
        FileManager.instance.interopConfig = {
          interopModuleInfo: new Map<string, InteropInfo>(),
          projectConfig: {
            projectTopDir: projectTopDir
          }
        }
      }
      FileManager.initLanguageVersionFromDependentModuleMap(dependentModuleMap);
      FileManager.initFileVersionMap();
      FileManager.initAliasConfig(aliasPaths);
      FileManager.initSDK(dynamicSDKPath, staticSDKDeclPath, staticSDKGlueCodePath, false);
    }
  }

  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  public static setMixCompile(mixCompile: boolean): void {
    FileManager.mixCompile = mixCompile;
  }

  public setInteropConfig(interopConfig: InteropConfig): void {
    this.interopConfig = interopConfig;
  }

  public getInteropConfig(): InteropConfig {
    return this.interopConfig;
  }

  private static initLanguageVersionFromDependentModuleMap(
    dependentModuleMap: Map<string, ArkTSEvolutionModule>
  ): void {
    const convertedMap = new Map<string, ArkTSEvolutionModule>();

    for (const [key, module] of dependentModuleMap) {
      module.dynamicFiles = module.dynamicFiles?.map(toUnixPath);
      module.staticFiles = module.staticFiles?.map(toUnixPath);
      const convertedModule: ArkTSEvolutionModule = {
        ...module,
        modulePath: toUnixPath(module.modulePath),
        declgenV1OutPath: module.declgenV1OutPath ? toUnixPath(module.declgenV1OutPath) : undefined,
        declgenV2OutPath: module.declgenV2OutPath ? toUnixPath(module.declgenV2OutPath) : undefined,
        declgenBridgeCodePath: module.declgenBridgeCodePath ? toUnixPath(module.declgenBridgeCodePath) : undefined,
        declFilesPath: module.declFilesPath ? toUnixPath(module.declFilesPath) : undefined,
      };
      convertedMap.set(key, convertedModule);
    }

    this.arkTSModuleMap = convertedMap;
  }

  private static initFileVersionMap(): void {
    FileManager.dynamicFileVersionMap.clear();
    FileManager.staticFileVersionMap.clear();
    for (const [, moduleInfo] of FileManager.arkTSModuleMap) {
      const pkgName = moduleInfo.packageName;
      for (const dynamicFile of moduleInfo.dynamicFiles ?? []) {
        FileManager.dynamicFileVersionMap.set(toUnixPath(dynamicFile), pkgName);
      }
      for (const staticFile of moduleInfo.staticFiles ?? []) {
        FileManager.staticFileVersionMap.set(toUnixPath(staticFile), pkgName);
      }
    }
  }

  private static initAliasConfig(aliasPaths: Map<string, string>): void {
    if (!aliasPaths) {
      return;
    }

    for (const [pkgName, filePath] of aliasPaths) {
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(rawContent);
      const pkgAliasMap = this.parseAliasJson(pkgName, jsonData);
      this.aliasConfig.set(pkgName, pkgAliasMap);
    }
  }

  private static parseAliasJson(pkgName: string, jsonData: Object): Map<string, AliasConfig> {
    const map = new Map<string, AliasConfig>();

    for (const [aliasKey, config] of Object.entries(jsonData)) {
      if (!this.isValidAliasConfig(config)) {
        const errInfo: LogData = LogDataFactory.newInstance(
          ErrorCode.ETS2BUNDLE_EXTERNAL_ALIAS_CONFIG_FORMAT_INVALID,
          ArkTSErrorDescription,
          'Invalid alias config format detected.',
          `Package: ${pkgName}`,
          ['Please ensure each alias entry contains "originalAPIName" and "isStatic" fields.']
        );

        FileManager.logError(errInfo);
      }

      map.set(aliasKey, {
        originalAPIName: config.originalAPIName,
        isStatic: config.isStatic
      });
    }

    return map;
  }

  private static isValidAliasConfig(config: Object): config is AliasConfig {
    return typeof config === 'object' &&
      config !== null &&
      'originalAPIName' in config &&
      'isStatic' in config;
  }

  private static initSDK(
    dynamicSDKPath?: Set<string>,
    staticSDKBaseUrl?: Set<string>,
    staticSDKGlueCodePaths?: Set<string>,
    checkFileExist: boolean = true
  ): void {
    if (dynamicSDKPath) {
      for (const path of dynamicSDKPath) {
        FileManager.dynamicLibPath.add(toUnixPath(path));
      }
    }
    const isStaticBaseValid = !staticSDKBaseUrl || hasExistingPaths(staticSDKBaseUrl);
    const isGlueCodeValid = !staticSDKGlueCodePaths || hasExistingPaths(staticSDKGlueCodePaths);
    FileManager.isInteropSDKEnabled = isStaticBaseValid && isGlueCodeValid;
    if (!FileManager.isInteropSDKEnabled && checkFileExist) {
      FileManager.buildSDKPathMatchers();
      return;
    }
    if (staticSDKBaseUrl) {
      for (const path of staticSDKBaseUrl) {
        FileManager.staticSDKDeclPath.add(toUnixPath(path));
      }
    }
    if (staticSDKGlueCodePaths) {
      for (const path of staticSDKGlueCodePaths) {
        FileManager.staticSDKGlueCodePath.add(toUnixPath(path));
      }
    }
    FileManager.buildSDKPathMatchers();
  }

  private static addSDKPathMatcher(rootPath: string, languageVersion: string): void {
    const root = toUnixPath(path.resolve(rootPath));
    FileManager.sdkPathMatchers.push({
      root,
      rootWithSlash: root + '/',
      languageVersion
    });
  }

  private static buildSDKPathMatchers(): void {
    for (const path of FileManager.dynamicLibPath) {
      FileManager.addSDKPathMatcher(path, ARKTS_1_1);
    }
    for (const path of FileManager.staticSDKDeclPath) {
      FileManager.addSDKPathMatcher(path, ARKTS_1_2);
    }
    for (const path of FileManager.staticSDKGlueCodePath) {
      FileManager.addSDKPathMatcher(path, ARKTS_1_2);
    }
  }

  public static cleanFileManagerObject(): void {
    if (this.instance) {
      this.instance = undefined;
    }

    FileManager.arkTSModuleMap?.clear();
    FileManager.dynamicLibPath?.clear();
    FileManager.staticSDKDeclPath?.clear();
    FileManager.staticSDKGlueCodePath?.clear();
    FileManager.glueCodeFileInfos?.clear();
    FileManager.aliasConfig?.clear();
    FileManager.dynamicFileVersionMap?.clear();
    FileManager.staticFileVersionMap?.clear();
    FileManager.sdkPathMatchers = [];
    FileManager.sdkPathMatchCache?.clear();
    FileManager.modulePathMatchCache?.clear();
    FileManager.mixCompile = false;
  }

  getLanguageVersionByFilePath(filePath: string): {
    languageVersion: string,
    pkgName: string
  } | undefined {
    const path = toUnixPath(filePath);

    const moduleMatch = FileManager.matchModulePath(path);
    if (moduleMatch) {
      return moduleMatch;
    }

    const firstLine = readFirstLineSync(filePath);
    if (firstLine.includes('use static')) {
      return {
        languageVersion: ARKTS_1_2,
        pkgName: ''
      };
    }
    return {
      languageVersion: ARKTS_1_1,
      pkgName: ''
    };
  }

  private static matchModulePathByDeclgenPath(contentPath: string): ArkTSEvolutionModule | undefined {
    const projectConfig = FileManager.getInstance().getInteropConfig()?.projectConfig;
    if (!projectConfig) {
      return undefined;
    }
    const sourcePath = toUnixPath(contentPath);

    for (const [, moduleInfo] of FileManager.arkTSModuleMap) {
      const declgenOutPaths = [
        moduleInfo.declgenV1OutPath,
        moduleInfo.declgenV2OutPath,
        moduleInfo.declgenBridgeCodePath
      ];
      if (declgenOutPaths.some(declgenOutPath => declgenOutPath && isSubPathOf(sourcePath, declgenOutPath))) {
        return moduleInfo;
      }
    }

    const projectRootDir = projectConfig.projectTopDir;
    const buildDir = projectConfig.buildDir;
    const legacyDeclgenPaths = [
      buildDir && toUnixPath(path.join(buildDir, 'declgen')),
      buildDir && toUnixPath(path.join(buildDir, '..', 'interop-declaration')),
      projectRootDir && toUnixPath(path.join(projectRootDir, 'build', 'declgen')),
      projectRootDir && toUnixPath(path.join(projectRootDir, 'interop-declaration'))
    ].filter(Boolean);
    for (const declgenPath of legacyDeclgenPaths) {
      if (!isSubPathOf(sourcePath, declgenPath)) {
        continue;
      }
      const relativePath = toUnixPath(path.relative(declgenPath, sourcePath));
      const harName = relativePath.split('/')[0];
      for (const [, moduleInfo] of FileManager.arkTSModuleMap) {
        if (harName === moduleInfo.packageName) {
          return moduleInfo;
        }
      }
    }

    return undefined;
  }

  private static matchModulePathByPrefix(contentPath: string): ArkTSEvolutionModule | undefined {
    for (const [, moduleInfo] of FileManager.arkTSModuleMap) {
      if (isSubPathOf(contentPath, moduleInfo.modulePath)) {
        return moduleInfo;
      }
    }
    return undefined;
  }

  private static cacheModulePathMatch(path: string, matchResult: LanguageVersionInfo | undefined):
    LanguageVersionInfo | undefined {
    FileManager.modulePathMatchCache.set(path, matchResult);
    return matchResult;
  }

  private static matchFileVersionMap(path: string): LanguageVersionInfo | undefined {
    const dynamicPkgName = FileManager.dynamicFileVersionMap.get(path);
    if (dynamicPkgName) {
      return {
        languageVersion: ARKTS_1_1,
        pkgName: dynamicPkgName
      };
    }

    const staticPkgName = FileManager.staticFileVersionMap.get(path);
    if (staticPkgName) {
      return {
        languageVersion: ARKTS_1_2,
        pkgName: staticPkgName
      };
    }
    return undefined;
  }

  private static getHybridModuleLanguageVersion(path: string, moduleInfo: ArkTSEvolutionModule): string | undefined {
    const isDynamic =
      moduleInfo.dynamicFiles.includes(path) ||
      (moduleInfo.declgenV2OutPath && isSubPathOf(path, moduleInfo.declgenV2OutPath));

    if (isDynamic) {
      return ARKTS_1_1;
    }

    const isStatic =
      moduleInfo.staticFiles.includes(path) ||
      (moduleInfo.declgenV1OutPath && isSubPathOf(path, moduleInfo.declgenV1OutPath)) ||
      (moduleInfo.declgenBridgeCodePath && isSubPathOf(path, moduleInfo.declgenBridgeCodePath));

    return isStatic ? ARKTS_1_2 : undefined;
  }

  private static matchModulePath(path: string): LanguageVersionInfo | undefined {
    const fileVersionMapMatch = FileManager.matchFileVersionMap(path);
    if (fileVersionMapMatch) {
      return fileVersionMapMatch;
    }

    const sdkMatch = FileManager.matchSDKPath(path);
    if (sdkMatch) {
      return sdkMatch;
    }

    if (FileManager.modulePathMatchCache.has(path)) {
      return FileManager.modulePathMatchCache.get(path);
    }

    const matchedModuleInfo = this.matchModulePathByPrefix(path) || this.matchModulePathByDeclgenPath(path);
    if (!matchedModuleInfo) {
      return FileManager.cacheModulePathMatch(path, undefined);
    }

    const languageVersion = matchedModuleInfo.language === ARKTS_HYBRID ?
      FileManager.getHybridModuleLanguageVersion(path, matchedModuleInfo) : matchedModuleInfo.language;
    const matchResult = languageVersion ?
      {
        languageVersion,
        pkgName: matchedModuleInfo.packageName
      } : undefined;

    return FileManager.cacheModulePathMatch(path, matchResult);
  }

  private static logError(error: LogData): void {
    console.error(error.toString());
  }

  private static matchSDKPath(filePath: string): {
    languageVersion: string,
    pkgName: string
  } | undefined {
    if (FileManager.sdkPathMatchCache.has(filePath)) {
      return FileManager.sdkPathMatchCache.get(filePath);
    }

    const resolvedPath = toUnixPath(path.resolve(filePath));
    for (const matcher of FileManager.sdkPathMatchers) {
      if (resolvedPath === matcher.root || resolvedPath.startsWith(matcher.rootWithSlash)) {
        const matchResult = {
          languageVersion: matcher.languageVersion,
          pkgName: 'SDK'
        };
        FileManager.sdkPathMatchCache.set(filePath, matchResult);
        return matchResult;
      }
    }
    return undefined;
  }

  queryOriginApiName(moduleName: string, containingFile: string): AliasConfig {
    if (!FileManager.mixCompile) {
      return undefined;
    }
    if (!FileManager.isInteropSDKEnabled) {
      return undefined;
    }
    if (moduleName.startsWith('static@')) {
      return this.parseStaticAlias(moduleName);
    }
    const result = this.getLanguageVersionByFilePath(containingFile);
    if (!result) {
      return undefined;
    }

    const alias = FileManager.aliasConfig.get(result.pkgName);
    if (!alias) {
      return undefined;
    }

    return alias.get(moduleName);
  }

  private parseStaticAlias(moduleName: string): AliasConfig | undefined {
    const STATIC_PREFIX = 'static';

    if (!moduleName.startsWith(STATIC_PREFIX)) {
      return undefined;
    }

    const originalAPIName = moduleName.substring(STATIC_PREFIX.length);

    if (!originalAPIName || originalAPIName.trim() === '') {
      return undefined;
    }

    return {
      originalAPIName: originalAPIName,
      isStatic: true
    };
  }

  getGlueCodePathByModuleRequest(moduleRequest: string): { fullPath: string, basePath: string } | undefined {
    const extensions = ['.ts', '.ets'];
    for (const basePath of FileManager.staticSDKGlueCodePath) {
      const fullPath = extensions
        .map(ext => path.resolve(basePath, moduleRequest + ext))
        .find(fs.existsSync);

      if (fullPath) {
        return {
          fullPath: toUnixPath(fullPath),
          basePath: toUnixPath(basePath)
        };
      }
    }

    return undefined;
  }
}

export function initFileManagerInRollup(InteropConfig: InteropConfig): void {
  if (!isMixCompile()) {
    return;
  }

  FileManager.mixCompile = true;
  const sdkInfo = collectSDKInfo(InteropConfig);

  FileManager.init(
    InteropConfig.projectConfig.dependentModuleMap,
    InteropConfig.projectConfig.sdkAliasMap,
    sdkInfo.dynamicSDKPath,
    sdkInfo.staticSDKInteropDecl,
    sdkInfo.staticSDKGlueCodePath
  );
  FileManager.getInstance().setInteropConfig(InteropConfig);
}

export function collectSDKInfo(share: Object): {
  dynamicSDKPath: Set<string>,
  staticSDKInteropDecl: Set<string>,
  staticSDKGlueCodePath: Set<string>
} {
  const dynamicSDKPath: Set<string> = new Set();
  const staticInteroSDKBasePath = process.env.staticInteroSDKBasePath ||
    path.resolve(share.projectConfig.etsLoaderPath, '../../../static/build-tools/interop');
  const staticSDKInteropDecl: Set<string> = new Set([
    path.resolve(staticInteroSDKBasePath, './declaration/kits'),
    path.resolve(staticInteroSDKBasePath, './declaration/api'),
    path.resolve(staticInteroSDKBasePath, './declaration/arkts')
  ].map(toUnixPath));

  const staticSDKGlueCodePath: Set<string> = new Set([
    path.resolve(staticInteroSDKBasePath, './bridge/kits'),
    path.resolve(staticInteroSDKBasePath, './bridge/api'),
    path.resolve(staticInteroSDKBasePath, './bridge/arkts')
  ].map(toUnixPath));

  const declarationsPath: string = path.resolve(share.projectConfig.etsLoaderPath, './declarations').replace(/\\/g, '/');
  const componentPath: string = path.resolve(share.projectConfig.etsLoaderPath, './components').replace(/\\/g, '/');
  const etsComponentPath: string = path.resolve(share.projectConfig.etsLoaderPath, '../../component').replace(/\\/g, '/');

  if (process.env.externalApiPaths) {
    const externalApiPaths = path.resolve(process.env.externalApiPaths, '../');
    staticSDKGlueCodePath.add(path.resolve(externalApiPaths, './static/build-tools/interop/bridge/api'));
    staticSDKInteropDecl.add(path.resolve(externalApiPaths, './static/build-tools/interop/declaration/api'));
  }

  dynamicSDKPath.add(declarationsPath);
  dynamicSDKPath.add(componentPath);
  dynamicSDKPath.add(etsComponentPath);
  dynamicSDKPath.add(toUnixPath(share.projectConfig.etsLoaderPath));
  sdkConfigs.forEach(({ apiPath }) => {
    apiPath.forEach(path => {
      dynamicSDKPath.add(toUnixPath(path));
    });
  });
  return {
    dynamicSDKPath: dynamicSDKPath,
    staticSDKInteropDecl: staticSDKInteropDecl,
    staticSDKGlueCodePath: staticSDKGlueCodePath
  };
}

export function isBridgeCode(filePath: string, projectConfig: Object): boolean {
  if (!projectConfig?.mixCompile) {
    return false;
  }
  for (const [pkgName, dependentModuleInfo] of projectConfig.dependentModuleMap) {
    if (isSubPathOf(filePath, dependentModuleInfo.declgenBridgeCodePath)) {
      return true;
    }
  }
  return false;
}

export function isMixCompile(): boolean {
  if (typeof mixCompile === 'boolean') {
    return mixCompile;
  }
  return process.env.mixCompile === 'true';
}

/**
 * Delete the 1.2 part in abilityPagesFullPath. This array will be used in transform.
 * The 1.2 source files will not participate in the 1.1 compilation process.
 */
export function processAbilityPagesFullPath(abilityPagesFullPath: Set<string>): void {
  if (!isMixCompile()) {
    return;
  }

  const extensions = ['.ts', '.ets'];

  for (const filePath of Array.from(abilityPagesFullPath)) {
    let realPath: string | null = null;

    for (const ext of extensions) {
      const candidate = filePath.endsWith(ext) ? filePath : filePath + ext;
      if (fs.existsSync(candidate)) {
        realPath = candidate;
        break;
      }
    }

    if (!realPath) {
      continue;
    }

    const firstLine = readFirstLineSync(realPath);
    if (firstLine.includes('use static')) {
      abilityPagesFullPath.delete(filePath);
    }
  }
}

export function transformAbilityPages(projectConfig: Object, abilityPath: string): boolean {
  const moduleJson = JSON.parse(fs.readFileSync(projectConfig?.aceModuleJsonPath).toString());
  const entryBridgeCodePath = getBrdigeCodeRootPath(moduleJson?.module?.name, FileManager.getInstance().getInteropConfig());
  if (!entryBridgeCodePath) {
    const errInfo = LogDataFactory.newInstance(
      ErrorCode.ETS2BUNDLE_INTERNAL_MISSING_BRIDGECODE_PATH_INFO,
      ArkTSInternalErrorDescription,
      `Missing entryBridgeCodePath`
    );
    throw Error(errInfo.toString());
  }
  if (!entryFileLanguageInfo?.get(abilityPath)) {
    return false;
  }
  if (abilityPath.includes(':')) {
    abilityPath = abilityPath.substring(0, abilityPath.lastIndexOf(':'));
  }
  const bridgeCodePath = path.join(entryBridgeCodePath.declgenBridgeCodePath, abilityPath + EXTNAME_TS);
  if (fs.existsSync(bridgeCodePath)) {
    projectConfig.entryObj[transformModuleNameToRelativePath(abilityPath)] = bridgeCodePath;
    return true;
  }
  return false;
}

export function transformModuleNameToRelativePath(filePath: string): string {
  let defaultSourceRoot = 'src/main';
  if (FileManager.getInstance().getInteropConfig()?.projectConfig?.isOhosTest) {
    defaultSourceRoot = 'src/ohosTest';
  }
  const normalizedModuleName = filePath.replace(/\\/g, '/');
  const normalizedRoot = defaultSourceRoot.replace(/\\/g, '/');

  const rootIndex = normalizedModuleName.indexOf(`/${normalizedRoot}/`);
  if (rootIndex === -1) {
    const errInfo = LogDataFactory.newInstance(
      ErrorCode.ETS2BUNDLE_INTERNAL_WRONG_MODULE_NAME_FROM_ACEMODULEJSON,
      ArkTSInternalErrorDescription,
      `defaultSourceRoot '${defaultSourceRoot}' not found ` +
      `when process moduleName '${filePath}'`
    );
    throw Error(errInfo.toString());
  }

  const relativePath = normalizedModuleName.slice(rootIndex + normalizedRoot.length + 1).replace(/^\/+/, '');
  return './' + relativePath;
}

export function getApiPathForInterop(apiDirs: string[], languageVersion: string): void {
  if (languageVersion !== ARKTS_1_2) {
    return;
  }

  const staticPaths = [...FileManager.staticSDKDeclPath];
  apiDirs.unshift(...staticPaths);
}

export function rebuildEntryObj(projectConfig: Object, interopConfig: InteropConfig): void {
  const entryObj = projectConfig.entryObj;

  const removeExt = (p: string): string => p.replace(/\.[^/.]+$/, '');

  projectConfig.entryObj = Object.keys(entryObj).reduce((newEntry, key) => {
    const newKey = key.replace(/^\.\//, '');
    const rawPath = entryObj[key]?.replace('?entry', '');
    if (!rawPath || !fs.existsSync(rawPath)) {
      return newEntry;
    }

    const firstLine = fs.readFileSync(rawPath, 'utf-8').split('\n')[0];

    if (!firstLine.includes('use static')) {
      newEntry[newKey] = rawPath;
    } else if (rawPath.startsWith(projectConfig.projectRootPath)) {
      const interopInfo = getBrdigeCodeRootPath(rawPath, interopConfig);
      if (!interopInfo) {
        const errInfo = LogDataFactory.newInstance(
          ErrorCode.ETS2BUNDLE_INTERNAL_MISSING_BRIDGECODE_PATH_INFO,
          ArkTSInternalErrorDescription,
          `Missing entryBridgeCodePath`
        );
        throw Error(errInfo.toString());
      }

      const relativePath = path.relative(interopInfo.moduleRootPath, rawPath);
      const withoutExt = removeExt(relativePath);
      const bridgeCodePath = path.join(interopInfo.declgenBridgeCodePath, interopInfo.packageName, withoutExt + '.ts');
      if (!fs.existsSync(bridgeCodePath)) {
        const errInfo = LogDataFactory.newInstance(
          ErrorCode.ETS2BUNDLE_INTERNAL_FAILED_TO_FIND_GLUD_CODE,
          ArkTSErrorDescription,
          `failed to find bridge code '${toUnixPath(bridgeCodePath)}' for entry '${toUnixPath(rawPath)}'. ` +
          `To compile an interop project with static entry, please generate interop declarations and bridge code.`
        );
        throw Error(errInfo.toString());
      }
      newEntry[newKey] = bridgeCodePath;
    }

    return newEntry;
  }, {} as Record<string, string>);
}

/**
 * corresponds to compiler/src/fast_build/common/init_config.ts - initConfig()
 * As the entry  for mix compile,so mixCompile status will be set true
 */
export function initConfigForInterop(interopConfig: InteropConfig): Object {
  mixCompile = true;
  initFileManagerInRollup(interopConfig);

  function getEntryObj(): void {
    loadEntryObj(projectConfig);
    initBuildInfo();
    readPatchConfig();
    loadModuleInfo(projectConfig);
    workerFile = readWorkerFile();
    if (!projectConfig.isPreview) {
      loadWorker(projectConfig, workerFile);
    }
    if (isMixCompile()) {
      rebuildEntryObj(projectConfig, interopConfig);
      return;
    }
    projectConfig.entryObj = Object.keys(projectConfig.entryObj).reduce((newEntry, key) => {
      const newKey: string = key.replace(/^\.\//, '');
      newEntry[newKey] = projectConfig.entryObj[key].replace('?entry', '');
      return newEntry;
    }, {});
  }
  getEntryObj();
  if (process.env.appResource) {
    readAppResource(process.env.appResource);
  }
  return {
    entryObj: Object.assign({}, projectConfig.entryObj, projectConfig.otherCompileFiles),
    cardEntryObj: projectConfig.cardEntryObj,
    workerFile: workerFile,
    globalModulePaths: globalModulePaths
  };
}

export function getBrdigeCodeRootPath(moduleName: string, interopConfig: InteropConfig): InteropInfo | undefined {
  for (const [moduleRootPath, interopInfo] of interopConfig.interopModuleInfo) {
    if (moduleName === interopInfo.moduleName || isSubPathOf(moduleName, moduleRootPath)) {
      interopInfo.moduleRootPath = moduleRootPath;
      return interopInfo;
    }
  }

  return undefined;
}

export function destroyInterop(): void {
  FileManager.cleanFileManagerObject();
  entryFileLanguageInfo.clear();
  mixCompile = undefined;
}
