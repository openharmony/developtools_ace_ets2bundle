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

import fs from "fs";
import path from "path";
import {
  ApiExtractor,
  renamePropertyModule,
  getMapFromJson
} from "arkguard";
import { identifierCaches } from "../../../ark_utils";

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
  DISABLE_OBFUSCATION,
  ENABLE_PROPERTY_OBFUSCATION,
  ENABLE_TOPLEVEL_OBFUSCATION,
  COMPACT,
  REMOVE_LOG,
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
  enableToplevelObfuscation: boolean = false;
  compact: boolean = false;
  removeLog: boolean = false;
  printNameCache: string = '';
  applyNameCache: string = '';

  merge(other: ObOptions) {
    this.disableObfuscation = this.disableObfuscation || other.disableObfuscation;
    this.enablePropertyObfuscation = this.enablePropertyObfuscation || other.enablePropertyObfuscation;
    this.enableToplevelObfuscation = this.enableToplevelObfuscation || other.enableToplevelObfuscation;
    this.compact = this.compact || other.compact;
    this.removeLog = this.removeLog || other.removeLog;
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

  merge(other: MergedConfig) {
    this.options.merge(other.options);
    this.reservedPropertyNames.push(...other.reservedPropertyNames);
    this.reservedNames.push(...other.reservedNames);
  }

  sortAndDeduplicate() {
    this.reservedPropertyNames = sortAndDeduplicateStringArr(
      this.reservedPropertyNames
    );
    this.reservedNames = sortAndDeduplicateStringArr(this.reservedNames);
  }

  serializeMergedConfig(): string {
    let resultStr: string = "";
    const keys = Object.keys(this.options);
    for (const key of keys) {
      // skip printNameCache and applyNameCache
      if (this.options[key] === true && ObConfigResolver.optionsMap.has(String(key))) {
        resultStr += ObConfigResolver.optionsMap.get(String(key)) + "\n";
      }
    }

    if (this.reservedNames.length > 0) {
      resultStr += ObConfigResolver.KEEP_GLOBAL_NAME + "\n";
      this.reservedNames.forEach((item) => {
      resultStr += item + "\n";
      });
    }
    if (this.reservedPropertyNames.length > 0) {
      resultStr += ObConfigResolver.KEEP_PROPERTY_NAME + "\n";
      this.reservedPropertyNames.forEach((item) => {
      resultStr += item + "\n";
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

    if (enableObfuscation) {
      const systemApiCachePath: string = path.join(sourceObConfig.obfuscationCacheDir, "systemApiCache.json");
      if (isFileExist(systemApiCachePath)) {
        this.getSystemApiConfigsByCache(selfConfig, systemApiCachePath);
      } else {
        this.getSystemApiCache(selfConfig, systemApiCachePath);
      }
    }

    const mergedConfigs: MergedConfig = this.getMergedConfigs(selfConfig, dependencyConfigs);
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
    try {
      const fileContent = fs.readFileSync(path, 'utf-8');
      this.handleConfigContent(fileContent, configs);
    } catch (err) {
      this.logger.error(`Failed to open ${path}. Error message: ${err}`);
    }
  }

  // obfuscation options
  static readonly KEEP_DTS = "-keep-dts";
  static readonly KEEP_GLOBAL_NAME = "-keep-global-name";
  static readonly KEEP_PROPERTY_NAME = "-keep-property-name";
  static readonly DISABLE_OBFUSCATION = "-disable-obfuscation";
  static readonly ENABLE_PROPERTY_OBFUSCATION = "-enable-property-obfuscation";
  static readonly ENABLE_TOPLEVEL_OBFUSCATION = "-enable-toplevel-obfuscation";
  static readonly COMPACT = "-compact";
  static readonly REMOVE_LOG = "-remove-log";
  static readonly PRINT_NAMECACHE = "-print-namecache";
  static readonly APPLY_NAMECACHE = "-apply-namecache";

  static optionsMap: Map<string, string> = new Map([
    ["disableObfuscation", ObConfigResolver.KEEP_DTS],
    ["enablePropertyObfuscation", ObConfigResolver.ENABLE_PROPERTY_OBFUSCATION],
    ["enableToplevelObfuscation", ObConfigResolver.ENABLE_TOPLEVEL_OBFUSCATION],
    ["compact", ObConfigResolver.COMPACT],
    ["removeLog", ObConfigResolver.REMOVE_LOG],
  ]);

  private getTokenType(token: string): OptionType {
    switch (token) {
      case ObConfigResolver.KEEP_DTS:
        return OptionType.KEEP_DTS;
      case ObConfigResolver.KEEP_GLOBAL_NAME:
        return OptionType.KEEP_GLOBAL_NAME;
      case ObConfigResolver.KEEP_PROPERTY_NAME:
        return OptionType.KEEP_PROPERTY_NAME;
      case ObConfigResolver.DISABLE_OBFUSCATION:
        return OptionType.DISABLE_OBFUSCATION;
      case ObConfigResolver.ENABLE_PROPERTY_OBFUSCATION:
        return OptionType.ENABLE_PROPERTY_OBFUSCATION;
      case ObConfigResolver.ENABLE_TOPLEVEL_OBFUSCATION:
        return OptionType.ENABLE_TOPLEVEL_OBFUSCATION;
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

  private handleConfigContent(data: string, configs: MergedConfig) {
    data = this.removeComments(data);
    const tokens = data.split(/[',', '\t', ' ', '\n', '\r\n']/).filter((item) => {
      if (item != "") {
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
        case OptionType.ENABLE_TOPLEVEL_OBFUSCATION: {
          configs.options.enableToplevelObfuscation = true;
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
        case OptionType.PRINT_NAMECACHE: {
          configs.options.printNameCache = token;
          type = OptionType.NONE;
          continue;
        }
        case OptionType.APPLY_NAMECACHE: {
          configs.options.applyNameCache = token;
          type = OptionType.NONE;
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
    const commentStart = "#";
    const commentEnd = "\n";
    var tmpStr = "";
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
    let systemApiContent = JSON.parse(fs.readFileSync(systemApiCachePath, "utf-8"));
    if (systemApiContent["ReservedPropertyNames"]) {
      systemConfigs.reservedPropertyNames = systemApiContent["ReservedPropertyNames"];
    }
    if (systemApiContent["ReservedNames"]) {
      systemConfigs.reservedNames = systemApiContent["ReservedNames"];
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
}

export function readNameCache(nameCachePath: string, logger: any): any {
  try {
    const fileContent = fs.readFileSync(nameCachePath, 'utf-8');
    const nameCache: { IdentifierCache?: string, PropertyCache?: string } = JSON.parse(fileContent);
    if (nameCache.PropertyCache) {
      renamePropertyModule.historyMangledTable = getMapFromJson(nameCache.PropertyCache);
    }
    return nameCache.IdentifierCache;
  } catch (err) {
    logger.error(`Failed to open ${nameCachePath}. Error message: ${err}`);
  }
}

export function getArkguardNameCache(enablePropertyObfuscation: any) {
  let writeContent: string = "";
  const nameCacheCollection: Object = {};
  nameCacheCollection['IdentifierCache'] = identifierCaches;

  if (enablePropertyObfuscation) {
    nameCacheCollection['PropertyCache'] = Object.fromEntries(renamePropertyModule.globalMangledTable);
  }

  writeContent += JSON.stringify(nameCacheCollection, null, 2);
  return writeContent;

}

export function writeObfuscationNameCache(projectConfig:any, obfuscationCacheDir: string, printNameCache?: string) {
  let writeContent: string = '';
  if (projectConfig.arkObfuscator) {
    writeContent = getArkguardNameCache(projectConfig.obfuscationMergedObConfig.options.enablePropertyObfuscation)
  } else {
    writeContent = JSON.stringify(projectConfig.terserConfig.nameCache, null, 2);
  }
  const defaultNameCachePath: string = path.join(obfuscationCacheDir,"nameCache.json");
  fs.writeFileSync(defaultNameCachePath, writeContent);
  if (printNameCache && printNameCache.length > 0) {
    fs.writeFileSync(printNameCache, writeContent);
  }
}

export function generateConsumerObConfigFile(obfuscationOptions: any, logger: any) {
  const projectConfig = { obfuscationOptions, compileHar: true };
  const obConfig: ObConfigResolver =  new ObConfigResolver(projectConfig, logger);
  obConfig.resolveObfuscationConfigs();
}
