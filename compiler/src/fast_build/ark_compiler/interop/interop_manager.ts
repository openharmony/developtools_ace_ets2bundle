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

import { sdkConfigs } from '../../../../main';
import { toUnixPath } from '../../../utils';
import {
  ARKTS_1_1,
  ArkTSEvolutionModule,
  ARKTS_1_2,
  HYBRID,
  FileInfo,
  AliasConfig
} from './type';
import { hasExistingPaths } from '../utils';
import {
  CommonLogger,
  LogData,
  LogDataFactory
} from '../logger';
import {
  ArkTSErrorDescription,
  ErrorCode
} from '../error_code';

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
    const isDynamicValid = !dynamicSDKPath || hasExistingPaths(dynamicSDKPath);
    const isStaticBaseValid = !staticSDKBaseUrl || hasExistingPaths(staticSDKBaseUrl);
    const isGlueCodeValid = !staticSDKGlueCodePaths || hasExistingPaths(staticSDKGlueCodePaths);
    FileManager.isInteropSDKEnabled = isDynamicValid && isStaticBaseValid && isGlueCodeValid;
    if (!FileManager.isInteropSDKEnabled && checkFileExist) {
      return;
    }

    if (dynamicSDKPath) {
      for (const path of dynamicSDKPath) {
        FileManager.dynamicLibPath.add(toUnixPath(path));
      }
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

    FileManager.arkTSModuleMap.clear();
    FileManager.dynamicLibPath.clear();
    FileManager.staticSDKDeclPath.clear();
    FileManager.staticSDKGlueCodePath.clear();
    FileManager.glueCodeFileInfos.clear();
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

    const sdkMatch = FileManager.matchSDKPath(path);
    if (sdkMatch) {
      return sdkMatch;
    }

    return undefined;
  }

  private static matchModulePath(path: string): {
    languageVersion: string,
    pkgName: string
  } | undefined {
    for (const [_, moduleInfo] of FileManager.arkTSModuleMap) {
      if (!path.startsWith(moduleInfo.modulePath)) {
        continue;
      }

      const isHybrid = moduleInfo.language === HYBRID;
      const pkgName = moduleInfo.packageName;

      if (!isHybrid) {
        return {
          languageVersion: moduleInfo.language,
          pkgName
        };
      }

      const isDynamic =
        moduleInfo.dynamicFiles.includes(path) ||
        (moduleInfo.declgenV2OutPath && path.startsWith(moduleInfo.declgenV2OutPath));

      if (isDynamic) {
        return {
          languageVersion: ARKTS_1_1,
          pkgName
        };
      }

      const isStatic =
        moduleInfo.staticFiles.includes(path) ||
        (moduleInfo.declgenV1OutPath && path.startsWith(moduleInfo.declgenV1OutPath)) ||
        (moduleInfo.declgenBridgeCodePath && path.startsWith(moduleInfo.declgenBridgeCodePath));

      if (isStatic) {
        return {
          languageVersion: ARKTS_1_2,
          pkgName
        };
      }
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
        p => p && (path.startsWith(p + '/') || path === p)
      );
      if (isMatch) {
        return { languageVersion: version, pkgName: 'SDK' };
      }
    }
    return undefined;
  }

  queryOriginApiName(moduleName: string, containingFile: string): AliasConfig {
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

function collectSDKInfo(share: Object): {
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