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

const JSON5 = require('json5');

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
import { mkdirsSync, toUnixPath } from '../../../utils';
import {
  ArkTSEvolutionModule,
  DeclFilesConfig,
  FileInfo,
  AliasConfig,
  InteropConfig,
  InteropInfo,
  StaticInteropFileMetadata,
  StaticInteropMetadata,
  StaticInteropSymbol
} from './type';
import {
  hasExistingPaths,
  isSubPathOf
} from '../utils';
import { LogData, LogDataFactory } from '../logger';
import { logger } from '../../../compile_info';
import {
  ArkTSErrorDescription,
  ArkTSInternalErrorDescription,
  ErrorCode
} from '../error_code';
import {
  ARKTS_1_1,
  ARKTS_1_2,
  ARKTS_HYBRID
} from './pre_define';
import { readFirstLineSync } from './utils';

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

export function addEntryForInterop(entryKey: string, filePath: string): void {
  projectConfig.entryObj[entryKey] = filePath;
  FileManager.interopDynamicEntryFileCache.set(path.resolve(filePath), entryKey);
}

export function shouldSkipInteropEntryValidation(filePath: string): boolean {
  return FileManager.interopDynamicEntryFileCache.has(path.resolve(filePath));
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
  static interopDynamicEntryFileCache: Map<string, string> = new Map<string, string>();
  private static staticInteropDynamicImportFileCache: Set<string> = new Set<string>();
  private static staticInteropConcurrentImportFileCache: Set<string> = new Set<string>();
  private static byteCodeHarDeclarationEntryCache: Set<string> = new Set();
  private static glueCodeFileInfosPath: string = '';
  private static sdkPathMatchers: SDKPathMatcher[] = [];
  private static sdkPathMatchCache: Map<string, LanguageVersionInfo | undefined> = new Map();
  private static modulePathMatchCache: Map<string, LanguageVersionInfo | undefined> = new Map();
  private static staticInteropMetadata: StaticInteropMetadata | undefined = undefined;
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

  public static setGlueCodeFileInfo(originalAPIName: string, fileInfo: FileInfo): void {
    FileManager.glueCodeFileInfos.set(originalAPIName, fileInfo);
  }

  public static getGlueCodeFileInfos(): Map<string, FileInfo> {
    return FileManager.glueCodeFileInfos;
  }

  public static setStaticInteropDynamicImport(filePath: string): void {
    FileManager.staticInteropDynamicImportFileCache.add(path.resolve(filePath));
  }

  public static hasStaticInteropDynamicImport(filePath: string): boolean {
    return FileManager.staticInteropDynamicImportFileCache.has(path.resolve(filePath));
  }

  public static setStaticInteropConcurrentImport(filePath: string): void {
    FileManager.staticInteropConcurrentImportFileCache.add(path.resolve(filePath));
  }

  public static hasStaticInteropConcurrentImport(filePath: string): boolean {
    return FileManager.staticInteropConcurrentImportFileCache.has(path.resolve(filePath));
  }

  public static initStaticInteropMetadata(interopConfig: InteropConfig): void {
    const metadataFilePath: string | undefined = interopConfig?.projectConfig?.declgenBridgeConfigPath;

    FileManager.staticInteropMetadata = undefined;
    if (!metadataFilePath) {
      logger.debug('skip metadata initialization because declgenBridgeConfigPath was not found');
      return;
    }
    if (!fs.existsSync(metadataFilePath)) {
      logger.debug('skip metadata initialization because metadata file does not exist', {
        metadataFilePath
      });
      return;
    }

    try {
      const metadata: StaticInteropMetadata = JSON.parse(fs.readFileSync(metadataFilePath, 'utf-8'));
      if (!metadata || typeof metadata.files !== 'object' || metadata.files === null) {
        return;
      }
      logger.debug('metadata initialized successfully', {
        metadataFilePath,
        entryCount: Object.keys(metadata.files).length
      });
      FileManager.staticInteropMetadata = metadata;
    } catch (e) {
      logger.debug('failed to parse metadata', {
        metadataFilePath,
        error: String(e)
      });
    }
  }

  public setInteropConfig(interopConfig: InteropConfig): void {
    this.interopConfig = interopConfig;
  }

  public getInteropConfig(): InteropConfig {
    return this.interopConfig;
  }

  public addByteCodeHarDeclarationEntries(declarationEntries: Iterable<string>): void {
    for (const declarationEntry of declarationEntries) {
      FileManager.byteCodeHarDeclarationEntryCache.add(declarationEntry);
    }
  }

  public getByteCodeHarDeclarationEntries(): string[] {
    return Array.from(FileManager.byteCodeHarDeclarationEntryCache);
  }

  public getStaticInteropSymbols(targetFilePath: string): Record<string, StaticInteropSymbol> | undefined {
    const normalizedTargetFilePath: string = toUnixPath(path.resolve(targetFilePath));
    const metadata: StaticInteropMetadata | undefined = FileManager.staticInteropMetadata;
    if (!metadata) {
      logger.debug('skip symbol lookup because metadata is unavailable', {
        targetFilePath: normalizedTargetFilePath
      });
      return undefined;
    }

    const fileMetadata: StaticInteropFileMetadata | undefined = metadata.files[normalizedTargetFilePath];
    const entry: Record<string, StaticInteropSymbol> | undefined = fileMetadata &&
      typeof fileMetadata.root === 'object' && fileMetadata.root !== null ? fileMetadata.root : undefined;
    if (!entry) {
      logger.debug('skip symbol lookup because target entry was not found', {
        targetFilePath: normalizedTargetFilePath
      });
      return undefined;
    }
    return entry;
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
        declFilesPath: module.declFilesPath ? toUnixPath(module.declFilesPath) : undefined
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
    FileManager.byteCodeHarDeclarationEntryCache?.clear();
    FileManager.sdkPathMatchers = [];
    FileManager.sdkPathMatchCache?.clear();
    FileManager.modulePathMatchCache?.clear();
    FileManager.interopDynamicEntryFileCache.clear();
    FileManager.staticInteropDynamicImportFileCache.clear();
    FileManager.staticInteropConcurrentImportFileCache.clear();
    FileManager.staticInteropMetadata = undefined;
    FileManager.mixCompile = false;
    FileManager.glueCodeFileInfosPath = '';
  }

  public static initGlueCodeFileInfos(cachePath: string): void {
    FileManager.glueCodeFileInfos.clear();
    if (!cachePath) {
      FileManager.glueCodeFileInfosPath = '';
      return;
    }
    FileManager.glueCodeFileInfosPath = path.join(cachePath, 'gluesdk_filesinfo.json');
    if (!fs.existsSync(FileManager.glueCodeFileInfosPath)) {
      return;
    }
    const content: string = fs.readFileSync(FileManager.glueCodeFileInfosPath, 'utf-8');
    if (!content.trim()) {
      return;
    }
    const parsed: Record<string, FileInfo> = JSON.parse(content);
    Object.entries(parsed).forEach(([originalAPIName, fileInfo]) => {
      if (fileInfo && typeof fileInfo === 'object') {
        FileManager.glueCodeFileInfos.set(originalAPIName, fileInfo as FileInfo);
      }
    });
  }

  public static persistGlueCodeFileInfos(): void {
    if (!FileManager.glueCodeFileInfosPath) {
      return;
    }
    mkdirsSync(path.dirname(FileManager.glueCodeFileInfosPath));
    const content = JSON.stringify(Object.fromEntries(FileManager.glueCodeFileInfos), null, 2);
    fs.writeFileSync(FileManager.glueCodeFileInfosPath, content, 'utf-8');
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
        moduleInfo.declgenV2OutPath
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
      (moduleInfo.declgenV1OutPath && isSubPathOf(path, moduleInfo.declgenV1OutPath));

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
  FileManager.initGlueCodeFileInfos(toUnixPath(InteropConfig.projectConfig?.cachePath ?? ''));
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

export function rebuildEntryObj(projectConfig: Object): void {
  const entryObj = projectConfig.entryObj;

  projectConfig.entryObj = Object.keys(entryObj).reduce((newEntry, key) => {
    const newKey = key.replace(/^\.\//, '');
    const rawPath = entryObj[key]?.replace('?entry', '');
    if (!rawPath || !fs.existsSync(rawPath)) {
      return newEntry;
    }

    newEntry[newKey] = rawPath;

    return newEntry;
  }, {} as Record<string, string>);
}

export function removeArkTS12EntriesFromEntryObj(projectConfig: Object): void {
  const entryObj = projectConfig.entryObj as Record<string, string>;
  const newEntryObj: Record<string, string> = {};
  for (const [entryKey, entryPath] of Object.entries(entryObj)) {
    const languageInfo = FileManager.getInstance().getLanguageVersionByFilePath(entryPath);
    if (languageInfo?.languageVersion === ARKTS_1_2) {
      logger.debug('remove ArkTS 1.2 entry from dynamic entry object', {
        entryKey,
        entryPath
      });
      continue;
    }
    newEntryObj[entryKey] = entryPath;
  }
  projectConfig.entryObj = newEntryObj;
}

type InteropEntriesConfig = {
  dynamic?: string[];
  dependency?: {
    source?: Record<string, {
      dynamic?: string[];
    }>;
    package?: string[];
  };
};

function getInteropEntryKey(filePath: string, moduleName?: string): string {
  const normalizedPath = toUnixPath(filePath).replace(/^\.\//, '');
  const relativePath = normalizedPath.replace(/^src\/(?:main|ohosTest)\/ets\//, '');
  const entryKey = relativePath.replace(/\.[^/.]+$/, '');
  return moduleName ? `${moduleName}/${entryKey}` : entryKey;
}

function getInteropDependentModuleMap(): Map<string, ArkTSEvolutionModule> {
  const interopConfig = FileManager.getInstance().getInteropConfig();
  const interopProjectConfig = interopConfig && interopConfig.projectConfig;
  if (interopProjectConfig && interopProjectConfig.dependentModuleMap) {
    return interopProjectConfig.dependentModuleMap;
  }
  if (projectConfig.dependentModuleMap) {
    return projectConfig.dependentModuleMap;
  }
  return FileManager.arkTSModuleMap;
}

function resolveInteropEntryPath(moduleRoot: string, entry: string): string {
  if (path.isAbsolute(entry)) {
    return path.resolve(entry);
  }
  return path.resolve(moduleRoot, entry);
}

function getRelativePathInModule(filePath: string, moduleRoot: string): string {
  const normalizedFilePath = toUnixPath(filePath);
  const normalizedModuleRoot = toUnixPath(moduleRoot);
  if (normalizedFilePath.startsWith(`${normalizedModuleRoot}/`)) {
    return normalizedFilePath.slice(normalizedModuleRoot.length + 1);
  }
  return normalizedFilePath;
}

function isSharedModule(moduleInfo: ArkTSEvolutionModule | undefined): boolean {
  const interopProjectConfig = FileManager.getInstance().getInteropConfig()?.projectConfig;
  const entryPackageName = interopProjectConfig?.entryPackageName;
  return moduleInfo?.moduleType === 'shared' && moduleInfo.packageName !== entryPackageName;
}

function shouldCompilePackage(packageName: string, pkgContextInfo: Object | undefined): boolean {
  return !!pkgContextInfo && !!pkgContextInfo[packageName];
}

function addDynamicEntryFromModule(dependentModuleMap: Map<string, ArkTSEvolutionModule>, packageName: string,
  dynamicEntry: string, currentModuleName: string): void {
  const moduleInfo = dependentModuleMap.get(packageName);
  if (!moduleInfo?.modulePath) {
    logger.debug('skip dependency dynamic entry because module is not present', {
      packageName,
      currentModuleName
    });
    return;
  }

  if (isSharedModule(moduleInfo)) {
    logger.debug('skip dependency dynamic entry because moduleType is shared', {
      packageName,
      currentModuleName
    });
    return;
  }

  const entryPath = resolveInteropEntryPath(moduleInfo.modulePath, dynamicEntry);
  const relativeEntry = getRelativePathInModule(entryPath, moduleInfo.modulePath);
  const entryKey = getInteropEntryKey(relativeEntry, moduleInfo.moduleName || packageName);
  logger.debug('add dependency dynamic entry', {
    entryKey,
    currentModuleName,
    entryPath
  });
  addEntryForInterop(
    entryKey,
    entryPath
  );
}

function addConfigDynamicEntries(currentPackageName: string, currentModuleName: string, currentModuleRoot: string,
  dynamicEntries: string[]): void {
  for (const dynamicEntry of dynamicEntries) {
    const entryKey = getInteropEntryKey(dynamicEntry, currentModuleName);
    const entryPath = resolveInteropEntryPath(currentModuleRoot, dynamicEntry);
    logger.debug('add dynamic entry', {
      entryKey,
      currentPackageName,
      entryPath
    });
    addEntryForInterop(
      entryKey,
      entryPath
    );
  }
}

function addDependencySourceEntries(dependentModuleMap: Map<string, ArkTSEvolutionModule>, currentPackageName: string,
  sourceEntries: Record<string, { dynamic?: string[] }>, pkgContextInfo: Object | undefined): void {
  for (const [dependencyPackageName, dependencyEntries] of Object.entries(sourceEntries)) {
    if (!shouldCompilePackage(dependencyPackageName, pkgContextInfo)) {
      logger.debug('skip dependency source because package does not participate in compilation', {
        dependencyPackageName,
        currentPackageName
      });
      continue;
    }
    for (const dynamicEntry of dependencyEntries.dynamic ?? []) {
      addDynamicEntryFromModule(dependentModuleMap, dependencyPackageName, dynamicEntry, currentPackageName);
    }
  }
}

function addDependencyPackageEntries(dependentModuleMap: Map<string, ArkTSEvolutionModule>, currentPackageName: string,
  dependencyPackages: string[], pkgContextInfo: Object | undefined): void {
  for (const dependencyPackageName of dependencyPackages) {
    if (!shouldCompilePackage(dependencyPackageName, pkgContextInfo)) {
      logger.debug('skip dependency package because package does not participate in compilation', {
        dependencyPackageName,
        currentPackageName
      });
      continue;
    }
    const dependencyModuleInfo = dependentModuleMap.get(dependencyPackageName);
    if (!dependencyModuleInfo) {
      logger.debug('skip dependency package because module is not present', {
        dependencyPackageName,
        currentPackageName
      });
      continue;
    }
    if (isSharedModule(dependencyModuleInfo)) {
      logger.debug('skip dependency package because moduleType is shared', {
        dependencyPackageName,
        currentPackageName
      });
      continue;
    }
    if (dependencyModuleInfo.byteCodeHar) {
      addByteCodeHarDeclarationEntries(dependencyPackageName, dependencyModuleInfo);
      logger.debug('skip dependency package because module is byteCodeHar', {
        dependencyPackageName,
        currentPackageName
      });
      continue;
    }
    for (const dynamicEntry of dependencyModuleInfo.dynamicFiles ?? []) {
      if (dynamicEntry.endsWith('.d') || dynamicEntry.endsWith('.d.ets')) {
        continue;
      }
      addDynamicEntryFromModule(dependentModuleMap, dependencyPackageName, dynamicEntry, currentPackageName);
    }
  }
}

function writeByteCodeHarInteropEntryFile(interopConfig: InteropConfig): void {
  const interopProjectConfig = interopConfig.projectConfig;
  if (!interopProjectConfig.byteCodeHar) {
    return;
  }

  const currentPackageName = interopProjectConfig.entryPackageName;
  const currentModuleInfo = currentPackageName ? getInteropDependentModuleMap().get(currentPackageName) : undefined;
  const configPath = currentModuleInfo?.interopConfigPath;
  if (!configPath || !fs.existsSync(configPath)) {
    logger.debug('skip writing byteCodeHar interop entry file because config path is unavailable', {
      configPath
    });
    return;
  }
  const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
  const interopEntries: InteropEntriesConfig | undefined = config?.interopEntries;
  const interopEntryFileContent = { declarationEntry: interopEntries?.dynamic ?? [] };
  logger.debug('byteCodeHar interop entry file content prepared', interopEntryFileContent);
  if (!interopProjectConfig.bytecodeInteropEntryFileJson) {
    return;
  }
  const interopEntryFilePath = interopProjectConfig.bytecodeInteropEntryFileJson;
  fs.mkdirSync(path.dirname(interopEntryFilePath), { recursive: true });
  fs.writeFileSync(
    interopEntryFilePath,
    JSON.stringify(interopEntryFileContent, null, 2),
    'utf-8'
  );
}

function addByteCodeHarDeclarationEntries(currentPackageName: string, currentModuleInfo: ArkTSEvolutionModule): void {
  const declFilesPath = currentModuleInfo.declFilesPath;
  logger.debug('start adding byteCodeHar declaration entries', { currentPackageName });
  if (!declFilesPath) {
    logger.debug('skip byteCodeHar declaration entries because declFilesPath is not configured', {
      currentPackageName
    });
    return;
  }
  if (!fs.existsSync(declFilesPath)) {
    logger.debug('skip byteCodeHar declaration entries because declFilesPath does not exist', {
      currentPackageName,
      declFilesPath
    });
    return;
  }

  logger.debug('read byteCodeHar declaration file config', { currentPackageName, declFilesPath });
  const declFilesConfig: DeclFilesConfig = JSON5.parse(fs.readFileSync(declFilesPath, 'utf-8'));
  const declFiles = declFilesConfig?.files ?? {};
  const declFileInfos = Object.values(declFiles);
  logger.debug('loaded byteCodeHar declaration file config', {
    currentPackageName,
    declarationFileCount: declFileInfos.length,
    packageName: declFilesConfig?.packageName
  });
  const declarationEntrySet: Set<string> = new Set();
  for (const declFileInfo of declFileInfos) {
    if (!declFileInfo?.ohmUrl) {
      logger.debug('skip declaration entry because ohmUrl is not configured', {
        currentPackageName,
        filePath: declFileInfo?.declPath || declFileInfo?.filePath
      });
      continue;
    }
    const declarationEntry = `${declFileInfo.ohmUrl}1.0.0`;
    if (declarationEntrySet.has(declarationEntry)) {
      logger.debug('skip duplicate declaration entry', { currentPackageName, declarationEntry });
      continue;
    }
    declarationEntrySet.add(declarationEntry);
    logger.debug('add declaration entry', { currentPackageName, declarationEntry });
  }
  FileManager.getInstance().addByteCodeHarDeclarationEntries(declarationEntrySet);
  logger.debug('complete byteCodeHar declaration entries', {
    currentPackageName,
    addedDeclarationEntryCount: declarationEntrySet.size,
    cachedDeclarationEntryCount: FileManager.getInstance().getByteCodeHarDeclarationEntries().length
  });
}

export function addEntriesFromInteropConfig(): void {
  const dependentModuleMap = getInteropDependentModuleMap();
  const interopProjectConfig = FileManager.getInstance().getInteropConfig()?.projectConfig;
  const pkgContextInfo = interopProjectConfig?.pkgContextInfo;
  logger.debug('start scanning interop entry config', { moduleCount: dependentModuleMap.size });

  for (const [currentPackageName, currentModuleInfo] of dependentModuleMap) {
    if (!shouldCompilePackage(currentPackageName, pkgContextInfo)) {
      logger.debug('skip module because package does not participate in compilation', { currentPackageName });
      continue;
    }
    if (currentModuleInfo.byteCodeHar) {
      logger.debug('skip module because module is byteCodeHar', { currentPackageName });
      continue;
    }
    if (isSharedModule(currentModuleInfo)) {
      logger.debug('skip module because moduleType is shared', { currentPackageName });
      continue;
    }
    const currentModuleName = currentModuleInfo.moduleName || currentPackageName;
    const currentModuleRoot = currentModuleInfo.modulePath;
    const configPath = currentModuleInfo.interopConfigPath;
    if (!configPath) {
      logger.debug('skip module because interopConfigPath is not configured', { currentPackageName });
      continue;
    }
    if (!fs.existsSync(configPath)) {
      logger.debug('skip module because interop config file does not exist', {
        currentPackageName,
        configPath
      });
      continue;
    }

    logger.debug('read interop entry config', { currentPackageName, configPath });
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    const interopEntries: InteropEntriesConfig | undefined = config?.interopEntries;

    addConfigDynamicEntries(currentPackageName, currentModuleName, currentModuleRoot, interopEntries?.dynamic ?? []);
    addDependencySourceEntries(
      dependentModuleMap,
      currentPackageName,
      interopEntries?.dependency?.source ?? {},
      pkgContextInfo
    );
    addDependencyPackageEntries(
      dependentModuleMap,
      currentPackageName,
      interopEntries?.dependency?.package ?? [],
      pkgContextInfo
    );
  }
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
      rebuildEntryObj(projectConfig);
      writeByteCodeHarInteropEntryFile(interopConfig);
      addEntriesFromInteropConfig();
      removeArkTS12EntriesFromEntryObj(projectConfig);
      FileManager.initStaticInteropMetadata(interopConfig);
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

export function destroyInterop(): void {
  FileManager.cleanFileManagerObject();
  entryFileLanguageInfo.clear();
  mixCompile = undefined;
}
