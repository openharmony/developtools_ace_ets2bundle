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
import JSON5 from 'json5';
import {
  ApiExtractor,
  renamePropertyModule,
  getMapFromJson,
  renameFileNameModule
} from 'arkguard';
import { identifierCaches } from '../../../ark_utils';

/* ObConfig's properties:
 *   ruleOptions: {
*     enable: boolean
 *    rules: string[]
 *   }
 *   consumerRules: string[]
 *
 * ObfuscationConfig's properties:
 *   selfConfig: ObConfig
 *   dependencies: { libraries: ObConfig[], hars: string[] }
 *   sdkApis: string[]
 *   obfuscationCacheDir: string
 *   exportRulePath: string
 */

enum OptionType {
  NONE,
  KEEP_DTS,
  KEEP_GLOBAL_NAME,
  KEEP_PROPERTY_NAME,
  KEEP_FILE_NAME,
  KEEP_COMMENTS,
  DISABLE_OBFUSCATION,
  ENABLE_PROPERTY_OBFUSCATION,
  ENABLE_STRING_PROPERTY_OBFUSCATION,
  ENABLE_TOPLEVEL_OBFUSCATION,
  ENABLE_FILENAME_OBFUSCATION,
  ENABLE_EXPORT_OBFUSCATION,
  COMPACT,
  REMOVE_LOG,
  REMOVE_COMMENTS,
  PRINT_NAMECACHE,
  APPLY_NAMECACHE,
}

function isFileExist(filePath: string): boolean {
  let exist = false;
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
  } catch (err) {
    exist = !err;
  }
  return exist;
}

function sortAndDeduplicateStringArr(arr: string[]) {
  if (arr.length == 0) {
    return arr;
  }

  arr.sort((a, b) => {
    return a.localeCompare(b);
  });

  let tmpArr: string[] = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] != arr[i - 1]) {
      tmpArr.push(arr[i]);
    }
  }
  return tmpArr;
}

class ObOptions {
  disableObfuscation: boolean = false;
  enablePropertyObfuscation: boolean = false;
  enableStringPropertyObfuscation: boolean = false;
  enableToplevelObfuscation: boolean = false;
  enableFileNameObfuscation: boolean = false;
  enableExportObfuscation: boolean = false;
  removeComments: boolean = false;
  compact: boolean = false;
  removeLog: boolean = false;
  printNameCache: string = '';
  applyNameCache: string = '';

  merge(other: ObOptions) {
    this.disableObfuscation = this.disableObfuscation || other.disableObfuscation;
    this.enablePropertyObfuscation = this.enablePropertyObfuscation || other.enablePropertyObfuscation;
    this.enableToplevelObfuscation = this.enableToplevelObfuscation || other.enableToplevelObfuscation;
    this.enableStringPropertyObfuscation = this.enableStringPropertyObfuscation || other.enableStringPropertyObfuscation;
    this.removeComments = this.removeComments || other.removeComments;
    this.compact = this.compact || other.compact;
    this.removeLog = this.removeLog || other.removeLog;
    this.enableFileNameObfuscation = this.enableFileNameObfuscation || other.enableFileNameObfuscation;
    this.enableExportObfuscation = this.enableExportObfuscation || other.enableExportObfuscation;
    if (other.printNameCache.length > 0) {
      this.printNameCache = other.printNameCache;
    }
    if (other.applyNameCache.length > 0) {
      this.applyNameCache = other.applyNameCache;
    }
  }
}

export class MergedConfig {
  options: ObOptions = new ObOptions();
  reservedPropertyNames: string[] = [];
  reservedNames: string[] = [];
  reservedFileNames: string[] = [];
  keepComments: string[] = [];

  merge(other: MergedConfig) {
    this.options.merge(other.options);
    this.reservedPropertyNames.push(...other.reservedPropertyNames);
    this.reservedNames.push(...other.reservedNames);
    this.reservedFileNames.push(...other.reservedFileNames);
    this.keepComments.push(...other.keepComments);
  }

  sortAndDeduplicate() {
    this.reservedPropertyNames = sortAndDeduplicateStringArr(
      this.reservedPropertyNames
    );
    this.reservedNames = sortAndDeduplicateStringArr(this.reservedNames);
    this.reservedFileNames = sortAndDeduplicateStringArr(this.reservedFileNames);
    this.keepComments = sortAndDeduplicateStringArr(this.keepComments);
  }

  serializeMergedConfig(): string {
    let resultStr: string = '';
    const keys = Object.keys(this.options);
    for (const key of keys) {
      // skip the export of some switches.
      if (this.options[key] === true && ObConfigResolver.exportedSwitchMap.has(String(key))) {
        resultStr += ObConfigResolver.exportedSwitchMap.get(String(key)) + '\n';
      }
    }

    if (this.reservedNames.length > 0) {
      resultStr += ObConfigResolver.KEEP_GLOBAL_NAME + '\n';
      this.reservedNames.forEach((item) => {
        resultStr += item + '\n';
      });
    }
    if (this.reservedPropertyNames.length > 0) {
      resultStr += ObConfigResolver.KEEP_PROPERTY_NAME + '\n';
      this.reservedPropertyNames.forEach((item) => {
        resultStr += item + '\n';
      });
    }
    return resultStr;
  }
}


export class ObConfigResolver {
  sourceObConfig: any;
  logger: any;
  isHarCompiled: boolean | undefined;
  isTerser: boolean;

  constructor(projectConfig: any, logger: any, isTerser?: boolean) {
    this.sourceObConfig = projectConfig.obfuscationOptions;
    this.logger = logger;
    this.isHarCompiled = projectConfig.compileHar;
    this.isTerser = isTerser;
  }

  public resolveObfuscationConfigs(): MergedConfig {
    let sourceObConfig = this.sourceObConfig;
    if (!sourceObConfig) {
      return new MergedConfig();
    }
    let enableObfuscation: boolean = sourceObConfig.selfConfig.ruleOptions.enable;

    let selfConfig: MergedConfig = new MergedConfig();
    if (enableObfuscation) {
      this.getSelfConfigs(selfConfig);
      enableObfuscation = !selfConfig.options.disableObfuscation;
    } else {
      selfConfig.options.disableObfuscation = true;
    }

    let needConsumerConfigs: boolean = this.isHarCompiled && sourceObConfig.selfConfig.consumerRules &&
      sourceObConfig.selfConfig.consumerRules.length > 0;
    let needDependencyConfigs: boolean = enableObfuscation || needConsumerConfigs;

    let dependencyConfigs: MergedConfig = new MergedConfig();
    const dependencyMaxLength: number = Math.max(sourceObConfig.dependencies.libraries.length, sourceObConfig.dependencies.hars.length)
    if (needDependencyConfigs && dependencyMaxLength > 0) {
      dependencyConfigs = new MergedConfig();
      this.getDependencyConfigs(sourceObConfig, dependencyConfigs);
      enableObfuscation = enableObfuscation && !dependencyConfigs.options.disableObfuscation;
    }
    const mergedConfigs: MergedConfig = this.getMergedConfigs(selfConfig, dependencyConfigs);

    if (enableObfuscation && mergedConfigs.options.enablePropertyObfuscation) {
      const systemApiCachePath: string = path.join(sourceObConfig.obfuscationCacheDir, 'systemApiCache.json');
      if (isFileExist(systemApiCachePath)) {
        this.getSystemApiConfigsByCache(selfConfig, systemApiCachePath);
      } else {
        this.getSystemApiCache(selfConfig, systemApiCachePath);
      }
    }

    if (needConsumerConfigs) {
      let selfConsumerConfig = new MergedConfig();
      this.getSelfConsumerConfig(selfConsumerConfig);
      this.genConsumerConfigFiles(sourceObConfig, selfConsumerConfig, dependencyConfigs);
    }

    return mergedConfigs;
  }

  private getSelfConfigs(selfConfigs: MergedConfig) {
    if (this.sourceObConfig.selfConfig.ruleOptions.rules) {
      const configPaths: string[] = this.sourceObConfig.selfConfig.ruleOptions.rules;
      for (const path of configPaths) {
        this.getConfigByPath(path, selfConfigs);
      }
    }
  }

  private getConfigByPath(path: string, configs: MergedConfig) {
    let fileContent = undefined;
    try {
      fileContent = fs.readFileSync(path, 'utf-8');
    } catch (err) {
      this.logger.error(`Failed to open ${path}. Error message: ${err}`);
      throw err;
    }
    this.handleConfigContent(fileContent, configs, path);
  }

  // obfuscation options
  static readonly KEEP_DTS = '-keep-dts';
  static readonly KEEP_GLOBAL_NAME = '-keep-global-name';
  static readonly KEEP_PROPERTY_NAME = '-keep-property-name';
  static readonly KEPP_FILE_NAME = '-keep-file-name';
  static readonly KEEP_COMMENTS = '-keep-comments';
  static readonly DISABLE_OBFUSCATION = '-disable-obfuscation';
  static readonly ENABLE_PROPERTY_OBFUSCATION = '-enable-property-obfuscation';
  static readonly ENABLE_STRING_PROPERTY_OBFUSCATION = '-enable-string-property-obfuscation';
  static readonly ENABLE_TOPLEVEL_OBFUSCATION = '-enable-toplevel-obfuscation';
  static readonly ENABLE_FILENAME_OBFUSCATION = '-enable-filename-obfuscation';
  static readonly ENABLE_EXPORT_OBFUSCATION = '-enable-export-obfuscation';
  static readonly REMOVE_COMMENTS = '-remove-comments';
  static readonly COMPACT = '-compact';
  static readonly REMOVE_LOG = '-remove-log';
  static readonly PRINT_NAMECACHE = '-print-namecache';
  static readonly APPLY_NAMECACHE = '-apply-namecache';

  // renameFileName, printNameCache, applyNameCache, removeComments and keepComments won't be reserved in obfuscation.txt file.
  static exportedSwitchMap: Map<string, string> = new Map([
    ['disableObfuscation', ObConfigResolver.KEEP_DTS],
    ['enablePropertyObfuscation', ObConfigResolver.ENABLE_PROPERTY_OBFUSCATION],
    ['enableStringPropertyObfuscation', ObConfigResolver.ENABLE_STRING_PROPERTY_OBFUSCATION],
    ['enableToplevelObfuscation', ObConfigResolver.ENABLE_TOPLEVEL_OBFUSCATION],
    ['compact', ObConfigResolver.COMPACT],
    ['removeLog', ObConfigResolver.REMOVE_LOG],
  ]);

  private getTokenType(token: string): OptionType {
    switch (token) {
      case ObConfigResolver.KEEP_DTS:
        return OptionType.KEEP_DTS;
      case ObConfigResolver.KEEP_GLOBAL_NAME:
        return OptionType.KEEP_GLOBAL_NAME;
      case ObConfigResolver.KEEP_PROPERTY_NAME:
        return OptionType.KEEP_PROPERTY_NAME;
      case ObConfigResolver.KEPP_FILE_NAME:
        return OptionType.KEEP_FILE_NAME;
      case ObConfigResolver.KEEP_COMMENTS:
        return OptionType.KEEP_COMMENTS;
      case ObConfigResolver.DISABLE_OBFUSCATION:
        return OptionType.DISABLE_OBFUSCATION;
      case ObConfigResolver.ENABLE_PROPERTY_OBFUSCATION:
        return OptionType.ENABLE_PROPERTY_OBFUSCATION;
      case ObConfigResolver.ENABLE_STRING_PROPERTY_OBFUSCATION:
        return OptionType.ENABLE_STRING_PROPERTY_OBFUSCATION;
      case ObConfigResolver.ENABLE_TOPLEVEL_OBFUSCATION:
        return OptionType.ENABLE_TOPLEVEL_OBFUSCATION;
      case ObConfigResolver.ENABLE_FILENAME_OBFUSCATION:
        return OptionType.ENABLE_FILENAME_OBFUSCATION;
      case ObConfigResolver.ENABLE_EXPORT_OBFUSCATION:
        return OptionType.ENABLE_EXPORT_OBFUSCATION;
      case ObConfigResolver.REMOVE_COMMENTS:
        return OptionType.REMOVE_COMMENTS;
      case ObConfigResolver.COMPACT:
        return OptionType.COMPACT;
      case ObConfigResolver.REMOVE_LOG:
        return OptionType.REMOVE_LOG;
      case ObConfigResolver.PRINT_NAMECACHE:
        return OptionType.PRINT_NAMECACHE;
      case ObConfigResolver.APPLY_NAMECACHE:
        return OptionType.APPLY_NAMECACHE;
      default:
        return OptionType.NONE;
    }
  }

  private handleConfigContent(data: string, configs: MergedConfig, configPath: string) {
    data = this.removeComments(data);
    const tokens = data.split(/[',', '\t', ' ', '\n', '\r\n']/).filter((item) => {
      if (item !== '') {
        return item;
      }
    });

    let type: OptionType = OptionType.NONE;
    let tokenType: OptionType;
    let dtsFilePaths: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      tokenType = this.getTokenType(token);
      // handle switches cases
      switch (tokenType) {
        case OptionType.DISABLE_OBFUSCATION: {
          configs.options.disableObfuscation = true;
          continue;
        }
        case OptionType.ENABLE_PROPERTY_OBFUSCATION: {
          configs.options.enablePropertyObfuscation = true;
          continue;
        }
        case OptionType.ENABLE_STRING_PROPERTY_OBFUSCATION: {
          configs.options.enableStringPropertyObfuscation = true;
        }
        case OptionType.ENABLE_TOPLEVEL_OBFUSCATION: {
          configs.options.enableToplevelObfuscation = true;
          continue;
        }
        case OptionType.REMOVE_COMMENTS: {
          configs.options.removeComments = true;
          continue;
        }
        case OptionType.ENABLE_FILENAME_OBFUSCATION: {
          configs.options.enableFileNameObfuscation = true;
          continue;
        }
        case OptionType.ENABLE_EXPORT_OBFUSCATION: {
          configs.options.enableExportObfuscation = true;
          continue;
        }
        case OptionType.COMPACT: {
          configs.options.compact = true;
          continue;
        }
        case OptionType.REMOVE_LOG: {
          configs.options.removeLog = true;
          continue;
        }
        case OptionType.KEEP_DTS:
        case OptionType.KEEP_GLOBAL_NAME:
        case OptionType.KEEP_PROPERTY_NAME:
        case OptionType.KEEP_FILE_NAME:
        case OptionType.KEEP_COMMENTS:
        case OptionType.PRINT_NAMECACHE:
        case OptionType.APPLY_NAMECACHE:
          type = tokenType;
          continue;
        default: {
          // fall-through
        }
      }
      // handle 'keep' options and 'namecache' options
      switch (type) {
        case OptionType.KEEP_DTS: {
          dtsFilePaths.push(token);
          continue;
        }
        case OptionType.KEEP_GLOBAL_NAME: {
          configs.reservedNames.push(token);
          continue;
        }
        case OptionType.KEEP_PROPERTY_NAME: {
          configs.reservedPropertyNames.push(token);
          continue;
        }
        case OptionType.KEEP_FILE_NAME: {
          configs.reservedFileNames.push(token);
          continue;
        }
        case OptionType.KEEP_COMMENTS: {
          configs.keepComments.push(token);
          continue;
        }
        case OptionType.PRINT_NAMECACHE: {
          configs.options.printNameCache = token;
          type = OptionType.NONE;
          continue;
        }
        case OptionType.APPLY_NAMECACHE: {
          configs.options.applyNameCache = token;
          type = OptionType.NONE;
          this.determineNameCachePath(token, configPath);
          continue;
        }
        default:
          continue;
      }
    }

    this.resolveDts(dtsFilePaths, configs);
  }

  // get names in .d.ts files and add them into reserved list
  private resolveDts(dtsFilePaths: string[], configs: MergedConfig) {
    ApiExtractor.mPropertySet.clear();
    dtsFilePaths.forEach((token) => {
      ApiExtractor.traverseApiFiles(token, ApiExtractor.ApiType.PROJECT);
    });
    configs.reservedNames = configs.reservedNames.concat(
      [...ApiExtractor.mPropertySet]
    );
    configs.reservedPropertyNames = configs.reservedPropertyNames.concat(
      [...ApiExtractor.mPropertySet]
    );
    ApiExtractor.mPropertySet.clear();
  }

  // the content from '#' to '\n' are comments
  private removeComments(data: string) {
    const commentStart = '#';
    const commentEnd = '\n';
    let tmpStr = '';
    var isInComments = false;
    for (let i = 0; i < data.length; i++) {
      if (isInComments) {
        isInComments = data[i] != commentEnd;
      } else if (data[i] != commentStart) {
        tmpStr += data[i];
      } else {
        isInComments = true;
      }
    }
    return tmpStr;
  }

  /**
   * systemConfigs includes the API directorys.
   * component directory and pre_define.js file path needs to be concatenated
   * @param systemConfigs
   */
  private getSystemApiCache(systemConfigs: MergedConfig, systemApiCachePath: string) {
    ApiExtractor.mPropertySet.clear();
    const sdkApis: string[] = sortAndDeduplicateStringArr(this.sourceObConfig.sdkApis);
    for (let apiPath of sdkApis) {
      this.getSdkApiCache(apiPath);
      const UIPath: string =  path.join(apiPath,'../build-tools/ets-loader/lib/pre_define.js');
      if (fs.existsSync(UIPath)) {
        this.getUIApiCache(UIPath);
      }
    }
    const savedNameAndPropertyList: string[] = sortAndDeduplicateStringArr([...ApiExtractor.mPropertySet])
    const systemApiContent = {
      ReservedNames: savedNameAndPropertyList,
      ReservedPropertyNames: savedNameAndPropertyList,
    };
    systemConfigs.reservedPropertyNames.push(...savedNameAndPropertyList);
    systemConfigs.reservedNames.push(...savedNameAndPropertyList);
    if (!fs.existsSync(path.dirname(systemApiCachePath))) {
      fs.mkdirSync(path.dirname(systemApiCachePath), {recursive: true});
    }
    fs.writeFileSync(systemApiCachePath, JSON.stringify(systemApiContent, null, 2));
    ApiExtractor.mPropertySet.clear();
  }

  private getSdkApiCache(sdkApiPath: string) {
    ApiExtractor.traverseApiFiles(sdkApiPath, ApiExtractor.ApiType.API);
    const componentPath: string =  path.join(sdkApiPath,'../component');
    if (fs.existsSync(componentPath)) {
      ApiExtractor.traverseApiFiles(componentPath, ApiExtractor.ApiType.COMPONENT);
    }
  }

  private getUIApiCache(uiApiPath: string) {
    ApiExtractor.extractStringsFromFile(uiApiPath);
  }

  private getDependencyConfigs(sourceObConfig: any, dependencyConfigs: MergedConfig): void {
    for (const lib of sourceObConfig.dependencies.libraries || []) {
      if(lib.consumerRules && lib.consumerRules.length > 0) {
        for (const path of lib.consumerRules) {
          const thisLibConfigs = new MergedConfig();
          this.getConfigByPath(path, dependencyConfigs);
          dependencyConfigs.merge(thisLibConfigs);
        }
      }
    }

    if (sourceObConfig.dependencies && sourceObConfig.dependencies.hars && sourceObConfig.dependencies.hars.length > 0) {
      for (const path of sourceObConfig.dependencies.hars) {
        const thisHarConfigs = new MergedConfig();
        this.getConfigByPath(path, dependencyConfigs);
        dependencyConfigs.merge(thisHarConfigs);
      }
    }
  }

  private getSystemApiConfigsByCache(systemConfigs: MergedConfig, systemApiCachePath: string) {
    let systemApiContent: { ReservedPropertyNames?: string[], ReservedNames?: string[] } = JSON.parse(fs.readFileSync(systemApiCachePath, 'utf-8'));
    if (systemApiContent.ReservedPropertyNames) {
      systemConfigs.reservedPropertyNames = systemApiContent.ReservedPropertyNames;
    }
    if (systemApiContent.ReservedNames) {
      systemConfigs.reservedNames = systemApiContent.ReservedNames;
    }
  }

  private getSelfConsumerConfig(selfConsumerConfig: MergedConfig) {
    for (const path of this.sourceObConfig.selfConfig.consumerRules) {
      this.getConfigByPath(path, selfConsumerConfig);
    }
  }

  private getMergedConfigs(selfConfigs: MergedConfig, dependencyConfigs: MergedConfig): MergedConfig {
    if (dependencyConfigs) {
        selfConfigs.merge(dependencyConfigs);
    }
    selfConfigs.sortAndDeduplicate();
    return selfConfigs;
  }

  private genConsumerConfigFiles(sourceObConfig: any, selfConsumerConfig: MergedConfig, dependencyConfigs: MergedConfig) {
    selfConsumerConfig.merge(dependencyConfigs);
    selfConsumerConfig.sortAndDeduplicate();
    this.writeConsumerConfigFile(selfConsumerConfig, sourceObConfig.exportRulePath);
  }

  public writeConsumerConfigFile(selfConsumerConfig: MergedConfig, outpath: string) {
    const configContent: string = selfConsumerConfig.serializeMergedConfig();
    fs.writeFileSync(outpath, configContent);
  }

  private determineNameCachePath(nameCachePath: string, configPath: string): void {
    if (!fs.existsSync(nameCachePath)) {
      throw new Error(`The applied namecache file '${nameCachePath}' configured by '${configPath}' does not exist.`);
    }
  }
}

export function readNameCache(nameCachePath: string, logger: any): void {
  try {
    const fileContent = fs.readFileSync(nameCachePath, 'utf-8');
    const nameCache: { IdentifierCache?: Object, PropertyCache?: Object, FileNameCache?: Object } = JSON.parse(fileContent);
    if (nameCache.PropertyCache) {
      renamePropertyModule.historyMangledTable = getMapFromJson(nameCache.PropertyCache);
    }
    if (nameCache.FileNameCache) {
      renameFileNameModule.historyFileNameMangledTable = getMapFromJson(nameCache.FileNameCache);
    }

    Object.assign(identifierCaches, nameCache.IdentifierCache);
  } catch (err) {
    logger.error(`Failed to open ${nameCachePath}. Error message: ${err}`);
  }
}

export function getArkguardNameCache(enablePropertyObfuscation: boolean, enableFileNameObfuscation: boolean): string {
  let writeContent: string = '';
  const nameCacheCollection: { IdentifierCache?: Object, PropertyCache?: Object, FileNameCache?: Object } = {};
  nameCacheCollection.IdentifierCache = identifierCaches;

  if (enablePropertyObfuscation) {
    const mergedPropertyNameCache: Map<string, string> = new Map();
    fillNameCache(renamePropertyModule.historyMangledTable, mergedPropertyNameCache);
    fillNameCache(renamePropertyModule.globalMangledTable, mergedPropertyNameCache);
    nameCacheCollection.PropertyCache = Object.fromEntries(mergedPropertyNameCache);
  }

  if (enableFileNameObfuscation) {
    const mergedFileNameCache: Map<string, string> = new Map();
    fillNameCache(renameFileNameModule.historyFileNameMangledTable, mergedFileNameCache);
    fillNameCache(renameFileNameModule.globalFileNameMangledTable, mergedFileNameCache);
    nameCacheCollection.FileNameCache = Object.fromEntries(mergedFileNameCache);
  }

  writeContent += JSON.stringify(nameCacheCollection, null, 2);
  return writeContent;
}

function fillNameCache(table: Map<string, string>, nameCache: Map<string, string>): void {
  if (table) {
    for (const [key, value] of table.entries()) {
      nameCache.set(key, value);
    }
  }
  return;
}

export function writeObfuscationNameCache(projectConfig:any, obfuscationCacheDir?: string, printNameCache?: string): void {
  let writeContent: string = '';
  if (projectConfig.arkObfuscator) {
    writeContent = getArkguardNameCache(projectConfig.obfuscationMergedObConfig.options.enablePropertyObfuscation,
      projectConfig.obfuscationMergedObConfig.options.enableFileNameObfuscation);
  } else if (projectConfig.terserConfig) {
    writeContent = JSON.stringify(projectConfig.terserConfig.nameCache, null, 2);
  } else {
    return;
  }
  if (obfuscationCacheDir && obfuscationCacheDir.length > 0) {
    const defaultNameCachePath: string = path.join(obfuscationCacheDir, 'nameCache.json');
    if (!fs.existsSync(path.dirname(defaultNameCachePath))) {
      fs.mkdirSync(path.dirname(defaultNameCachePath), {recursive: true});
    }
    fs.writeFileSync(defaultNameCachePath, writeContent);
  }
  if (printNameCache && printNameCache.length > 0) {
    fs.writeFileSync(printNameCache, writeContent);
  }
}

export function generateConsumerObConfigFile(obfuscationOptions: any, logger: any) {
  const projectConfig = { obfuscationOptions, compileHar: true };
  const obConfig: ObConfigResolver =  new ObConfigResolver(projectConfig, logger);
  obConfig.resolveObfuscationConfigs();
}

/**
 * Collect reserved file name configured in oh-package.json5 and module.json5.
 * @param ohPackagePath The 'main' and 'types' fileds in oh-package.json5 need to be reserved.
 * @param moduleJsonPath The 'srcEntry' filed in module.json5 needs to be reserved.
 * @returns reservedFileNames
 */
export function collectResevedFileNameInIDEConfig(ohPackagePath: string, moduleJsonPath: string, projectPath: string, cachePath: string): string[] {
  const reservedFileNames: string[] = [];
  if (fs.existsSync(ohPackagePath)) {
    const ohPackageContent = JSON5.parse(fs.readFileSync(ohPackagePath, 'utf-8'));
    ohPackageContent.main && reservedFileNames.push(ohPackageContent.main);
    ohPackageContent.types && reservedFileNames.push(ohPackageContent.types);
  }

  if (fs.existsSync(moduleJsonPath)) {
    const moduleJsonContent = JSON5.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));
    moduleJsonContent.module?.srcEntry && reservedFileNames.push(moduleJsonContent.module?.srcEntry);
  }

  /* Get the reserved file name
   * projectPath: /library/src/main/ets 
   * cachePath: /library/build/default/cache/default/default@HarCompileArkTs/esmodules/release
   * target reserved path: /library/build/default/cache/default/default@HarCompileArkTs/esmodules/release/src/main/ets
   */
  reservedFileNames.push(projectPath);
  reservedFileNames.push(cachePath);
  return reservedFileNames;
}

export function mangleFilePath(originalPath: string): string {
  const mangledFilePath = renameFileNameModule.getMangleCompletePath(originalPath);
  return mangledFilePath;
}