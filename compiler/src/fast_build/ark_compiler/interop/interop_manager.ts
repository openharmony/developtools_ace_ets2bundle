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

import {
  projectConfig,
  sdkConfigs
} from '../../../../main';
import { toUnixPath } from '../../../utils';
import {
  ArkTSEvolutionModule,
  FileInfo,
  AliasConfig
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

export let entryFileLanguageInfo = new Map();

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
  static sharedObj: Object | undefined = undefined;

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
      FileManager.initAliasConfig(aliasPaths);
      FileManager.initSDK(dynamicSDKPath, staticSDKDeclPath, staticSDKGlueCodePath);
    }
  }

  public static initForTest(
    dependentModuleMap: Map<string, ArkTSEvolutionModule>,
    aliasPaths: Map<string, string>,
    dynamicSDKPath?: Set<string>,
    staticSDKDeclPath?: Set<string>,
    staticSDKGlueCodePath?: Set<string>
  ): void {
    if (FileManager.instance === undefined) {
      FileManager.instance = new FileManager();
      FileManager.initLanguageVersionFromDependentModuleMap(dependentModuleMap);
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

  public static setRollUpObj(shared: Object): void {
    FileManager.sharedObj = shared;
  }

  public static setMixCompile(mixCompile: boolean): void {
    FileManager.mixCompile = mixCompile;
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

  private static parseAliasJson(pkgName: string, jsonData: any): Map<string, AliasConfig> {
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

  private static isValidAliasConfig(config: any): config is AliasConfig {
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
    FileManager.mixCompile = false;
    entryFileLanguageInfo.clear();
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

    const sdkMatch = FileManager.matchSDKPath(path);
    if (sdkMatch) {
      return sdkMatch;
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

  private static matchModulePath(path: string): {
    languageVersion: string,
    pkgName: string
  } | undefined {
    let matchedModuleInfo: ArkTSEvolutionModule;

    for (const [, moduleInfo] of FileManager.arkTSModuleMap) {
      if (isSubPathOf(path, moduleInfo.modulePath)) {
        matchedModuleInfo = moduleInfo;
        break;
      }
    }

    if (!matchedModuleInfo) {
      return undefined;
    }

    const isHybrid = matchedModuleInfo.language === ARKTS_HYBRID;
    const pkgName = matchedModuleInfo.packageName;

    if (!isHybrid) {
      return {
        languageVersion: matchedModuleInfo.language,
        pkgName
      };
    }

    const isDynamic =
      matchedModuleInfo.dynamicFiles.includes(path) ||
      (matchedModuleInfo.declgenV2OutPath && isSubPathOf(path, matchedModuleInfo.declgenV2OutPath));

    if (isDynamic) {
      return {
        languageVersion: ARKTS_1_1,
        pkgName
      };
    }

    const isStatic =
      matchedModuleInfo.staticFiles.includes(path) ||
      (matchedModuleInfo.declgenV1OutPath && isSubPathOf(path, matchedModuleInfo.declgenV1OutPath)) ||
      (matchedModuleInfo.declgenBridgeCodePath && isSubPathOf(path, matchedModuleInfo.declgenBridgeCodePath));

    if (isStatic) {
      return {
        languageVersion: ARKTS_1_2,
        pkgName
      };
    }

    return undefined;
  }

  private static logError(error: LogData): void {
    if (FileManager.sharedObj) {
      CommonLogger.getInstance(FileManager.sharedObj).printErrorAndExit(error);
    } else {
      console.error(error.toString());
    }
  }

  private static matchSDKPath(path: string): {
    languageVersion: string,
    pkgName: string
  } | undefined {
    const sdkMatches: [Set<string> | undefined, string][] = [
      [FileManager.dynamicLibPath, ARKTS_1_1],
      [FileManager.staticSDKDeclPath, ARKTS_1_2],
      [FileManager.staticSDKGlueCodePath, ARKTS_1_2],
    ];

    for (const [paths, version] of sdkMatches) {
      const isMatch = paths && Array.from(paths).some(
        p => p && (isSubPathOf(path, p))
      );
      if (isMatch) {
        return { languageVersion: version, pkgName: 'SDK' };
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

export function initFileManagerInRollup(share: Object): void {
  if (!share.projectConfig.mixCompile) {
    return;
  }

  FileManager.mixCompile = true;
  const sdkInfo = collectSDKInfo(share);

  FileManager.init(
    share.projectConfig.dependentModuleMap,
    share.projectConfig.aliasPaths,
    sdkInfo.dynamicSDKPath,
    sdkInfo.staticSDKInteropDecl,
    sdkInfo.staticSDKGlueCodePath
  );
  FileManager.setRollUpObj(share);
}

export function collectSDKInfo(share: Object): {
  dynamicSDKPath: Set<string>,
  staticSDKInteropDecl: Set<string>,
  staticSDKGlueCodePath: Set<string>
} {
  const dynamicSDKPath: Set<string> = new Set();
  const staticInteroSDKBasePath = process.env.staticInteroSDKBasePath ||
    path.resolve(share.projectConfig.etsLoaderPath, '../../../ets1.2/build-tools/interop');
  const staticSDKInteropDecl: Set<string> = new Set([
    path.resolve(staticInteroSDKBasePath, './declarations/kits'),
    path.resolve(staticInteroSDKBasePath, './declarations/api'),
    path.resolve(staticInteroSDKBasePath, './declarations/arkts'),
  ].map(toUnixPath));

  const staticSDKGlueCodePath: Set<string> = new Set([
    path.resolve(staticInteroSDKBasePath, './bridge/kits'),
    path.resolve(staticInteroSDKBasePath, './bridge/api'),
    path.resolve(staticInteroSDKBasePath, './bridge/arkts'),
  ].map(toUnixPath));

  const declarationsPath: string = path.resolve(share.projectConfig.etsLoaderPath, './declarations').replace(/\\/g, '/');
  const componentPath: string = path.resolve(share.projectConfig.etsLoaderPath, './components').replace(/\\/g, '/');
  const etsComponentPath: string = path.resolve(share.projectConfig.etsLoaderPath, '../../component').replace(/\\/g, '/');

  if (process.env.externalApiPaths) {
    const externalApiPaths = path.resolve(process.env.externalApiPaths, '../');
    staticSDKGlueCodePath.add(path.resolve(externalApiPaths, './ets1.2/interop/bridge'));
    staticSDKInteropDecl.add(path.resolve(externalApiPaths, './ets1.2/interop/declarations'));
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

function readFirstLineSync(filePath: string): string {
  const buffer = fs.readFileSync(filePath, 'utf-8');
  const newlineIndex = buffer.indexOf('\n');
  if (newlineIndex === -1) {
    return buffer.trim();
  }
  return buffer.substring(0, newlineIndex).trim();
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


export function transformAbilityPages(abilityPath: string): boolean {
  const entryBridgeCodePath = process.env.entryBridgeCodePath;
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
  const bridgeCodePath = path.join(entryBridgeCodePath, abilityPath + EXTNAME_TS);
  if (fs.existsSync(bridgeCodePath)) {
    projectConfig.entryObj[transformModuleNameToRelativePath(abilityPath)] = bridgeCodePath;
    return true;
  }
  return false;
}

function transformModuleNameToRelativePath(moduleName): string {
  let defaultSourceRoot = 'src/main';
  const normalizedModuleName = moduleName.replace(/\\/g, '/');
  const normalizedRoot = defaultSourceRoot.replace(/\\/g, '/');

  const rootIndex = normalizedModuleName.indexOf(`/${normalizedRoot}/`);
  if (rootIndex === -1) {
    const errInfo = LogDataFactory.newInstance(
      ErrorCode.ETS2BUNDLE_INTERNAL_WRONG_MODULE_NAME_FROM_ACEMODULEJSON,
      ArkTSInternalErrorDescription,
      `defaultSourceRoot '${defaultSourceRoot}' not found ` +
      `when process moduleName '${moduleName}'`
    );
    throw Error(errInfo.toString());
  }

  const relativePath = normalizedModuleName.slice(rootIndex + normalizedRoot.length + 1);
  return './' + relativePath;
}

export function getApiPathForInterop(apiDirs: string[], languageVersion: string): void {
  if (languageVersion !== ARKTS_1_2) {
    return;
  }

  const staticPaths = [...FileManager.staticSDKDeclPath];
  apiDirs.unshift(...staticPaths);
}

