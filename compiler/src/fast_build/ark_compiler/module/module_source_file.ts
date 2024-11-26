/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use rollupObject file except in compliance with the License.
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

import * as ts from 'typescript';
import fs from 'fs';
import path from 'path';
import MagicString from 'magic-string';
import {
  GEN_ABC_PLUGIN_NAME,
  PACKAGES,
  red,
  reset
} from '../common/ark_define';
import {
  getNormalizedOhmUrlByFilepath,
  getOhmUrlByByteCodeHar,
  getOhmUrlByFilepath,
  getOhmUrlByExternalPackage,
  getOhmUrlBySystemApiOrLibRequest,
  mangleDeclarationFileName,
  compileToolIsRollUp
} from '../../../ark_utils';
import { writeFileSyncByNode } from '../../../process_module_files';
import {
  isDebug,
  isJsonSourceFile,
  isJsSourceFile,
  updateSourceMap,
  writeFileContentToTempDir
} from '../utils';
import { toUnixPath } from '../../../utils';
import {
  createAndStartEvent,
  stopEvent
} from '../../../ark_utils';
import { SourceMapGenerator } from '../generate_sourcemap';
import {
  MergedConfig,
  handleKeepFilesAndGetDependencies,
  writeObfuscationNameCache,
  writeUnobfuscationContent,
  handleUniversalPathInObf
} from '../common/ob_config_resolver';
import { ORIGIN_EXTENTION } from '../process_mock';
import {
  ESMODULE,
  TRANSFORMED_MOCK_CONFIG,
  USER_DEFINE_MOCK_CONFIG
} from '../../../pre_define';
import { readProjectAndLibsSource } from '../common/process_ark_config';
import {
  allSourceFilePaths,
  collectAllFiles,
  localPackageSet
} from '../../../ets_checker';
import { projectConfig } from '../../../../main';
import {
  EventList,
  endFilesEvent,
  performancePrinter,
  printTimeSumData,
  printTimeSumInfo,
  startFilesEvent
} from 'arkguard';
import { MemoryMonitor } from '../../meomry_monitor/rollup-plugin-memory-monitor';
import { ALL_FILES_OBFUSCATION, FILES_FOR_EACH, SOURCE_PROJECT_CONFIG } from '../../meomry_monitor/memory_define';
const ROLLUP_IMPORT_NODE: string = 'ImportDeclaration';
const ROLLUP_EXPORTNAME_NODE: string = 'ExportNamedDeclaration';
const ROLLUP_EXPORTALL_NODE: string = 'ExportAllDeclaration';
const ROLLUP_DYNAMICIMPORT_NODE: string = 'ImportExpression';
const ROLLUP_LITERAL_NODE: string = 'Literal';
export const sourceFileBelongProject = new Map<string, string>();

export class ModuleSourceFile {
  private static sourceFiles: ModuleSourceFile[] = [];
  private moduleId: string;
  private source: string | ts.SourceFile;
  private metaInfo: Object;
  private isSourceNode: boolean = false;
  private static projectConfig: Object;
  private static logger: Object;
  private static mockConfigInfo: Object = {};
  private static mockFiles: string[] = [];
  private static newMockConfigInfo: Object = {};
  private static transformedHarOrHspMockConfigInfo: Object = {};
  private static mockConfigKeyToModuleInfo: Object = {};
  private static needProcessMock: boolean = false;

  constructor(moduleId: string, source: string | ts.SourceFile, metaInfo: Object) {
    this.moduleId = moduleId;
    this.source = source;
    this.metaInfo = metaInfo;
    if (typeof this.source !== 'string') {
      this.isSourceNode = true;
    }
  }

  static setProcessMock(rollupObject: Object): void {
    // only processing mock-config.json5 in preview, OhosTest, or LocalTest mode
    if (!(rollupObject.share.projectConfig.isPreview || rollupObject.share.projectConfig.isOhosTest || rollupObject.share.projectConfig.isLocalTest)) {
      ModuleSourceFile.needProcessMock = false;
      return;
    }

    // mockParams is essential, and etsSourceRootPath && mockConfigPath need to be defined in mockParams
    // mockParams = {
    //   "decorator": "name of mock decorator",
    //   "packageName": "name of mock package",
    //   "etsSourceRootPath": "path of ets source root",
    //   "mockConfigPath": "path of mock configuration file"
    //   "mockConfigKey2ModuleInfo": "moduleInfo of mock-config key"
    // }
    ModuleSourceFile.needProcessMock = (rollupObject.share.projectConfig.mockParams &&
                                        rollupObject.share.projectConfig.mockParams.etsSourceRootPath &&
                                        rollupObject.share.projectConfig.mockParams.mockConfigPath) ? true : false;
  }

  static collectMockConfigInfo(rollupObject: Object): void {
    if (!!rollupObject.share.projectConfig.mockParams.mockConfigKey2ModuleInfo) {
      ModuleSourceFile.mockConfigKeyToModuleInfo = rollupObject.share.projectConfig.mockParams.mockConfigKey2ModuleInfo;
    }
    ModuleSourceFile.mockConfigInfo = require('json5').parse(
      fs.readFileSync(rollupObject.share.projectConfig.mockParams.mockConfigPath, 'utf-8'));
    for (let mockedTarget in ModuleSourceFile.mockConfigInfo) {
      if (ModuleSourceFile.mockConfigInfo[mockedTarget].source) {
        ModuleSourceFile.mockFiles.push(ModuleSourceFile.mockConfigInfo[mockedTarget].source);
        if (ModuleSourceFile.mockConfigKeyToModuleInfo && ModuleSourceFile.mockConfigKeyToModuleInfo[mockedTarget]) {
          ModuleSourceFile.generateTransformedMockInfo(ModuleSourceFile.mockConfigKeyToModuleInfo[mockedTarget],
            ModuleSourceFile.mockConfigInfo[mockedTarget].source, mockedTarget, rollupObject);
        }
      }
    }
  }

  static addMockConfig(mockConfigInfo: Object, key: string, src: string): void {
    if (Object.prototype.hasOwnProperty.call(mockConfigInfo, key)) {
      return;
    }

    mockConfigInfo[key] = {'source': src};
  }

  static generateTransformedMockInfo(mockModuleInfo: Object, src: string, originKey: string, rollupObject: Object): void {
    let useNormalizedOHMUrl: boolean = false;
    if (!!rollupObject.share.projectConfig.useNormalizedOHMUrl) {
      useNormalizedOHMUrl = rollupObject.share.projectConfig.useNormalizedOHMUrl;
    }
    let transformedMockTarget: string | undefined = getOhmUrlByExternalPackage(originKey, ModuleSourceFile.projectConfig,
                                                                       ModuleSourceFile.logger, useNormalizedOHMUrl);
    if (transformedMockTarget !== undefined) {
      ModuleSourceFile.addMockConfig(ModuleSourceFile.transformedHarOrHspMockConfigInfo, transformedMockTarget, src);
      return;
    }
    if (mockModuleInfo.filePath) {
      if (useNormalizedOHMUrl) {
        transformedMockTarget = ModuleSourceFile.spliceNormalizedOhmurl(mockModuleInfo, mockModuleInfo.filePath, undefined);
        ModuleSourceFile.addMockConfig(ModuleSourceFile.transformedHarOrHspMockConfigInfo, transformedMockTarget, src);
        return;
      }
      transformedMockTarget = getOhmUrlByFilepath(mockModuleInfo.filePath, ModuleSourceFile.projectConfig,
                                                  ModuleSourceFile.logger, originKey);
      transformedMockTarget = transformedMockTarget.startsWith(PACKAGES) ? `@package:${transformedMockTarget}` :
                              `@bundle:${transformedMockTarget}`;
      ModuleSourceFile.addMockConfig(ModuleSourceFile.transformedHarOrHspMockConfigInfo, transformedMockTarget, src);
      return;
    } else {
      ModuleSourceFile.logger.error(red, 'ArkTS:INTERNAL ERROR: Failed to convert the key in mock-config to ohmurl, ' +
                                    'because the file path corresponding to the key in mock-config is empty.', reset);
    }
  }

  static generateNewMockInfo(originKey: string, transKey: string, rollupObject: Object, importerFile?: string): void {
    if (!Object.prototype.hasOwnProperty.call(ModuleSourceFile.transformedHarOrHspMockConfigInfo, transKey) &&
      !Object.prototype.hasOwnProperty.call(ModuleSourceFile.mockConfigInfo, originKey)) {
      return;
    }

    let useNormalizedOHMUrl = false;
    if (!!rollupObject.share.projectConfig.useNormalizedOHMUrl) {
      useNormalizedOHMUrl = rollupObject.share.projectConfig.useNormalizedOHMUrl;
    }
    let mockFile: string = ModuleSourceFile.transformedHarOrHspMockConfigInfo[transKey] ?
      ModuleSourceFile.transformedHarOrHspMockConfigInfo[transKey].source :
      ModuleSourceFile.mockConfigInfo[originKey].source;
    let mockFilePath: string = `${toUnixPath(rollupObject.share.projectConfig.modulePath)}/${mockFile}`;
    let mockFileOhmUrl: string = '';
    if (useNormalizedOHMUrl) {
      // For file A that imports file B, the mock file of file B will be located in the same package of file A. So the
      // moduleInfo for mock file should be the same with file A.
      const targetModuleInfo: Object = rollupObject.getModuleInfo(importerFile);
      mockFileOhmUrl = ModuleSourceFile.spliceNormalizedOhmurl(targetModuleInfo, mockFilePath, importerFile);
    } else {
      mockFileOhmUrl = getOhmUrlByFilepath(mockFilePath,
                                           ModuleSourceFile.projectConfig,
                                           ModuleSourceFile.logger,
                                           rollupObject.share.projectConfig.entryModuleName,
                                           importerFile);
      mockFileOhmUrl = mockFileOhmUrl.startsWith(PACKAGES) ? `@package:${mockFileOhmUrl}` : `@bundle:${mockFileOhmUrl}`;
    }

    // record mock target mapping for incremental compilation
    ModuleSourceFile.addMockConfig(ModuleSourceFile.newMockConfigInfo, transKey, mockFileOhmUrl);
  }

  static isMockFile(file: string, rollupObject: Object): boolean {
    if (!ModuleSourceFile.needProcessMock) {
      return false;
    }

    for (let mockFile of ModuleSourceFile.mockFiles) {
      let absoluteMockFilePath: string = `${toUnixPath(rollupObject.share.projectConfig.modulePath)}/${mockFile}`;
      if (toUnixPath(absoluteMockFilePath) === toUnixPath(file)) {
        return true;
      }
    }

    return false;
  }

  static generateMockConfigFile(rollupObject: Object): void {
    let transformedMockConfigCache: string =
      path.resolve(rollupObject.share.projectConfig.cachePath, `./${TRANSFORMED_MOCK_CONFIG}`);
    let transformedMockConfig: string =
      path.resolve(rollupObject.share.projectConfig.aceModuleJsonPath, `../${TRANSFORMED_MOCK_CONFIG}`);
    let userDefinedMockConfigCache: string =
      path.resolve(rollupObject.share.projectConfig.cachePath, `./${USER_DEFINE_MOCK_CONFIG}`);
    // full compilation
    if (!fs.existsSync(transformedMockConfigCache) || !fs.existsSync(userDefinedMockConfigCache)) {
      fs.writeFileSync(transformedMockConfig, JSON.stringify(ModuleSourceFile.newMockConfigInfo));
      fs.copyFileSync(transformedMockConfig, transformedMockConfigCache);
      fs.copyFileSync(rollupObject.share.projectConfig.mockParams.mockConfigPath, userDefinedMockConfigCache);
      return;
    }

    // incremental compilation
    const cachedMockConfigInfo: Object =
      require('json5').parse(fs.readFileSync(userDefinedMockConfigCache, 'utf-8'));
    // If mock-config.json5 is modified, incremental compilation will be disabled
    if (JSON.stringify(ModuleSourceFile.mockConfigInfo) !== JSON.stringify(cachedMockConfigInfo)) {
      fs.writeFileSync(transformedMockConfig, JSON.stringify(ModuleSourceFile.newMockConfigInfo));
      fs.copyFileSync(transformedMockConfig, transformedMockConfigCache);
      fs.copyFileSync(rollupObject.share.projectConfig.mockParams.mockConfigPath, userDefinedMockConfigCache);
      return;
    }
    // During incremental compilation, only at this point is the mocked file imported.
    // At this time, the newMockConfigInfo does not match the mockConfig in the cache,
    // so the mockConfig in the cache needs to be updated.
    const cachedTransformedMockConfigInfo: Object =
      require('json5').parse(fs.readFileSync(transformedMockConfigCache, 'utf-8'));
    if (JSON.stringify(ModuleSourceFile.newMockConfigInfo) !== JSON.stringify(cachedTransformedMockConfigInfo)) {
      ModuleSourceFile.updataCachedTransformedMockConfigInfo(ModuleSourceFile.newMockConfigInfo, cachedTransformedMockConfigInfo,
        transformedMockConfigCache, transformedMockConfig);
      return;
    }

    // if mock-config.json5 is not modified, use the cached mock config mapping file
    fs.copyFileSync(transformedMockConfigCache, transformedMockConfig);
  }

  static updataCachedTransformedMockConfigInfo(newMockConfig: Object, cachedTransMockConfigInfo: Object,
    transMockConfigCachePath: string, transMockConfigPath: string): void {
    for (const key in newMockConfig) {
      if (!Object.prototype.hasOwnProperty.call(cachedTransMockConfigInfo, key)) {
        cachedTransMockConfigInfo[key] = newMockConfig[key];
      }
    }
    fs.writeFileSync(transMockConfigPath, JSON.stringify(cachedTransMockConfigInfo));
    fs.copyFileSync(transMockConfigPath, transMockConfigCachePath);
  }

  static removePotentialMockConfigCache(rollupObject: Object): void {
    const transformedMockConfigCache: string =
      path.resolve(rollupObject.share.projectConfig.cachePath, `./${TRANSFORMED_MOCK_CONFIG}`);
    const userDefinedMockConfigCache: string =
      path.resolve(rollupObject.share.projectConfig.cachePath, `./${USER_DEFINE_MOCK_CONFIG}`);
    if (fs.existsSync(transformedMockConfigCache)) {
      fs.rmSync(transformedMockConfigCache);
    }

    if (fs.existsSync(userDefinedMockConfigCache)) {
      fs.rmSync(userDefinedMockConfigCache);
    }
  }

  static newSourceFile(moduleId: string, source: string | ts.SourceFile, metaInfo: Object): void {
    ModuleSourceFile.sourceFiles.push(new ModuleSourceFile(moduleId, source, metaInfo));
  }

  static getSourceFiles(): ModuleSourceFile[] {
    return ModuleSourceFile.sourceFiles;
  }

  static async processModuleSourceFiles(rollupObject: Object, parentEvent: Object): Promise<void> {
    this.initPluginEnv(rollupObject);

    // collect mockConfigInfo
    ModuleSourceFile.setProcessMock(rollupObject);
    if (ModuleSourceFile.needProcessMock) {
      ModuleSourceFile.collectMockConfigInfo(rollupObject);
    } else {
      ModuleSourceFile.removePotentialMockConfigCache(rollupObject);
    }

    collectAllFiles(undefined, rollupObject.getModuleIds(), rollupObject);
    startFilesEvent(EventList.SCAN_SOURCEFILES, performancePrinter.timeSumPrinter);
    MemoryMonitor.getInstance().recordStage(SOURCE_PROJECT_CONFIG);
    let sourceProjectConfig: Object = ModuleSourceFile.projectConfig;
    // obfuscation initialization, include collect file, resolve denpendency, read source
    if (compileToolIsRollUp()) {
      const obfuscationConfig: MergedConfig = sourceProjectConfig.obfuscationMergedObConfig;
      handleUniversalPathInObf(obfuscationConfig, allSourceFilePaths);
      const keepFilesAndDependencies = handleKeepFilesAndGetDependencies(obfuscationConfig,
        sourceProjectConfig.arkObfuscator, sourceProjectConfig);
      readProjectAndLibsSource(allSourceFilePaths, obfuscationConfig, sourceProjectConfig.arkObfuscator,
        sourceProjectConfig.compileHar, keepFilesAndDependencies);
    }
    MemoryMonitor.getInstance().stopRecordStage(SOURCE_PROJECT_CONFIG);
    endFilesEvent(EventList.SCAN_SOURCEFILES, performancePrinter.timeSumPrinter);

    startFilesEvent(EventList.ALL_FILES_OBFUSCATION);
    let byteCodeHar = false;
    if (Object.prototype.hasOwnProperty.call(sourceProjectConfig, 'byteCodeHar')) {
      byteCodeHar = sourceProjectConfig.byteCodeHar;
    }
    // Sort the collection by file name to ensure binary consistency.
    MemoryMonitor.getInstance().recordStage(ALL_FILES_OBFUSCATION);
    ModuleSourceFile.sortSourceFilesByModuleId();
    sourceProjectConfig.localPackageSet = localPackageSet;
    for (const source of ModuleSourceFile.sourceFiles) {
      MemoryMonitor.getInstance().recordStage(FILES_FOR_EACH, ALL_FILES_OBFUSCATION);
      sourceFileBelongProject.set(toUnixPath(source.moduleId), source.metaInfo?.belongProjectPath);
      if (!rollupObject.share.projectConfig.compileHar || byteCodeHar) {
        // compileHar: compile closed source har of project, which convert .ets to .d.ts and js, doesn't transform module request.
        const eventBuildModuleSourceFile = createAndStartEvent(parentEvent, 'build module source files');
        await source.processModuleRequest(rollupObject, eventBuildModuleSourceFile);
        stopEvent(eventBuildModuleSourceFile);
      }
      const eventWriteSourceFile = createAndStartEvent(parentEvent, 'write source file');
      await source.writeSourceFile(eventWriteSourceFile);
      stopEvent(eventWriteSourceFile);
      MemoryMonitor.getInstance().stopRecordStage(FILES_FOR_EACH, ALL_FILES_OBFUSCATION);
    }
    if (compileToolIsRollUp() && rollupObject.share.arkProjectConfig.compileMode === ESMODULE) {
      await mangleDeclarationFileName(ModuleSourceFile.logger, rollupObject.share.arkProjectConfig, sourceFileBelongProject);
    }
    printTimeSumInfo('All files obfuscation:');
    printTimeSumData();
    endFilesEvent(EventList.ALL_FILES_OBFUSCATION);
    MemoryMonitor.getInstance().stopRecordStage(ALL_FILES_OBFUSCATION);

    const eventObfuscatedCode = createAndStartEvent(parentEvent, 'write obfuscation name cache');
    const needToWriteCache = compileToolIsRollUp() && sourceProjectConfig.arkObfuscator && sourceProjectConfig.obfuscationOptions;
    const isWidgetCompile = sourceProjectConfig.widgetCompile;
    if (needToWriteCache) {
      writeObfuscationNameCache(sourceProjectConfig, sourceProjectConfig.entryPackageInfo, sourceProjectConfig.obfuscationOptions.obfuscationCacheDir,
        sourceProjectConfig.obfuscationMergedObConfig.options?.printNameCache);
    }
    if (needToWriteCache && !isWidgetCompile) {
      // Do not print unobfuscation names and whitelists when widget compiles
      writeUnobfuscationContent(sourceProjectConfig);
    }
    stopEvent(eventObfuscatedCode);

    const eventGenerateMockConfigFile = createAndStartEvent(parentEvent, 'generate mock config file');
    if (ModuleSourceFile.needProcessMock) {
      ModuleSourceFile.generateMockConfigFile(rollupObject);
    }
    stopEvent(eventGenerateMockConfigFile);

    ModuleSourceFile.sourceFiles = [];
  }

  getModuleId(): string {
    return this.moduleId;
  }

  private async writeSourceFile(parentEvent: Object): Promise<void> {
    if (this.isSourceNode && !isJsSourceFile(this.moduleId)) {
      await writeFileSyncByNode(<ts.SourceFile> this.source, ModuleSourceFile.projectConfig, this.metaInfo,
        this.moduleId, parentEvent, ModuleSourceFile.logger);
    } else {
      await writeFileContentToTempDir(this.moduleId, <string> this.source, ModuleSourceFile.projectConfig,
        ModuleSourceFile.logger, parentEvent, this.metaInfo);
    }
  }

  private getOhmUrl(rollupObject: Object, moduleRequest: string, filePath: string | undefined,
    importerFile?: string): string | undefined {
    let useNormalizedOHMUrl = false;
    if (!!rollupObject.share.projectConfig.useNormalizedOHMUrl) {
      useNormalizedOHMUrl = rollupObject.share.projectConfig.useNormalizedOHMUrl;
    }
    let systemOrLibOhmUrl = getOhmUrlBySystemApiOrLibRequest(moduleRequest, ModuleSourceFile.projectConfig,
      ModuleSourceFile.logger, importerFile, useNormalizedOHMUrl);
    if (systemOrLibOhmUrl !== undefined) {
      if (ModuleSourceFile.needProcessMock) {
        ModuleSourceFile.generateNewMockInfo(moduleRequest, systemOrLibOhmUrl, rollupObject, importerFile);
      }
      return systemOrLibOhmUrl;
    }
    const externalPkgOhmurl: string | undefined = getOhmUrlByExternalPackage(moduleRequest,
      ModuleSourceFile.projectConfig, ModuleSourceFile.logger, useNormalizedOHMUrl);
    if (externalPkgOhmurl !== undefined) {
      if (ModuleSourceFile.needProcessMock) {
        ModuleSourceFile.generateNewMockInfo(moduleRequest, externalPkgOhmurl, rollupObject, importerFile);
      }
      return externalPkgOhmurl;
    }
    const byteCodeHarOhmurl: string | undefined = getOhmUrlByByteCodeHar(moduleRequest, ModuleSourceFile.projectConfig,
      ModuleSourceFile.logger);
    if (byteCodeHarOhmurl !== undefined) {
      if (ModuleSourceFile.needProcessMock) {
        ModuleSourceFile.generateNewMockInfo(moduleRequest, byteCodeHarOhmurl, rollupObject, importerFile);
      }
      return byteCodeHarOhmurl;
    }
    if (filePath) {
      const targetModuleInfo: Object = rollupObject.getModuleInfo(filePath);
      if (!targetModuleInfo) {
        ModuleSourceFile.logger.error(red,
          `ArkTS:INTERNAL ERROR: Failed to get module info of file '${filePath}'`, reset);
        return undefined;
      }
      if (!targetModuleInfo.meta) {
        ModuleSourceFile.logger.error(red,
          `ArkTS:INTERNAL ERROR: Failed to get meta info of file '${filePath}'`, reset);
          return undefined;
      }
      let res: string = '';
      if (useNormalizedOHMUrl) {
        res = ModuleSourceFile.spliceNormalizedOhmurl(targetModuleInfo, filePath, importerFile);
      } else {
        const moduleName: string = targetModuleInfo.meta.moduleName;
        const ohmUrl: string =
          getOhmUrlByFilepath(filePath, ModuleSourceFile.projectConfig, ModuleSourceFile.logger, moduleName, importerFile);
        res = ohmUrl.startsWith(PACKAGES) ? `@package:${ohmUrl}` : `@bundle:${ohmUrl}`;
      }
      if (ModuleSourceFile.needProcessMock) {
        // processing cases of har or lib mock targets
        ModuleSourceFile.generateNewMockInfo(moduleRequest, res, rollupObject, importerFile);
        // processing cases of user-defined mock targets
        let mockedTarget: string = toUnixPath(filePath).
            replace(toUnixPath(rollupObject.share.projectConfig.modulePath), '').
            replace(`/${rollupObject.share.projectConfig.mockParams.etsSourceRootPath}/`, '');
        ModuleSourceFile.generateNewMockInfo(mockedTarget, res, rollupObject, importerFile);
      }
      return res;
    }
    return undefined;
  }

  private static spliceNormalizedOhmurl(moduleInfo: Object, filePath: string, importerFile?: string): string {
    const pkgParams = {
      pkgName: moduleInfo.meta.pkgName,
      pkgPath: moduleInfo.meta.pkgPath,
      isRecordName: false
    };
    const ohmUrl: string =
      getNormalizedOhmUrlByFilepath(filePath, ModuleSourceFile.projectConfig, ModuleSourceFile.logger, pkgParams,
        importerFile);
    return `@normalized:${ohmUrl}`;
  }

  private processJsModuleRequest(rollupObject: Object): void {
    const moduleInfo: Object = rollupObject.getModuleInfo(this.moduleId);
    const importMap: Object = moduleInfo.importedIdMaps;
    const REG_DEPENDENCY: RegExp = /(?:import|from)(?:\s*)['"]([^'"]+)['"]|(?:import)(?:\s*)\(['"]([^'"]+)['"]\)/g;
    this.source = (<string> this.source).replace(REG_DEPENDENCY, (item, staticModuleRequest, dynamicModuleRequest) => {
      const moduleRequest: string = staticModuleRequest || dynamicModuleRequest;
      const ohmUrl: string | undefined = this.getOhmUrl(rollupObject, moduleRequest, importMap[moduleRequest], this.moduleId);
      if (ohmUrl !== undefined) {
        item = item.replace(/(['"])(?:\S+)['"]/, (_, quotation) => {
          return quotation + ohmUrl + quotation;
        });
      }
      return item;
    });
    this.processJsResourceRequest();
  }

  private processJsResourceRequest(): void {
    this.source = (this.source as string)
      .replace(/\b__harDefaultBundleName__\b/gi, projectConfig.integratedHsp ? '' : projectConfig.bundleName)
      .replace(/\b__harDefaultModuleName__\b/gi, projectConfig.moduleName)
      .replace(/\b__harDefaultIntegratedHspType__\b/gi, projectConfig.integratedHsp ? 'true' : 'false')
      .replace(/\b__harDefaultPagePath__\b/gi, path.relative(projectConfig.projectPath || '', this.moduleId).replace(/\\/g, '/').replace(/\.js$/, ''));
  }

  private async processTransformedJsModuleRequest(rollupObject: Object): Promise<void> {
    const moduleInfo: Object = rollupObject.getModuleInfo(this.moduleId);
    const importMap: Object = moduleInfo.importedIdMaps;
    const code: MagicString = new MagicString(<string> this.source);
    // The data collected by moduleNodeMap represents the node dataset of related types.
    // The data is processed based on the AST collected during the transform stage.
    const moduleNodeMap: Map<string, any> =
      moduleInfo.getNodeByType(ROLLUP_IMPORT_NODE, ROLLUP_EXPORTNAME_NODE, ROLLUP_EXPORTALL_NODE,
        ROLLUP_DYNAMICIMPORT_NODE);

    let hasDynamicImport: boolean = false;
    if (rollupObject.share.projectConfig.needCoverageInsert && moduleInfo.ast.program) {
      // In coverage instrumentation scenario,
      // ast from rollup because the data of ast and moduleNodeMap are inconsistent.
      moduleInfo.ast.program.body.forEach((node) => {
        if (!hasDynamicImport && node.type === ROLLUP_DYNAMICIMPORT_NODE) {
          hasDynamicImport = true;
        }
        if ((node.type === ROLLUP_IMPORT_NODE || node.type === ROLLUP_EXPORTNAME_NODE ||
        node.type === ROLLUP_EXPORTALL_NODE) && node.source) {
          const ohmUrl: string | undefined =
            this.getOhmUrl(rollupObject, node.source.value, importMap[node.source.value], this.moduleId);
          if (ohmUrl !== undefined) {
            code.update(node.source.start, node.source.end, `'${ohmUrl}'`);
          }
        }
      });
    } else {
      for (let nodeSet of moduleNodeMap.values()) {
        nodeSet.forEach(node => {
          if (!hasDynamicImport && node.type === ROLLUP_DYNAMICIMPORT_NODE) {
            hasDynamicImport = true;
          }
          if (node.source) {
            if (node.source.type === ROLLUP_LITERAL_NODE) {
              const ohmUrl: string | undefined =
                this.getOhmUrl(rollupObject, node.source.value, importMap[node.source.value], this.moduleId);
              if (ohmUrl !== undefined) {
                code.update(node.source.start, node.source.end, `'${ohmUrl}'`);
              }
            }
          }
        });
      }
    }

    if (hasDynamicImport) {
      // update sourceMap
      const relativeSourceFilePath: string = this.moduleId.startsWith(ModuleSourceFile.projectConfig.projectRootPath) ?
        toUnixPath(this.moduleId.replace(ModuleSourceFile.projectConfig.projectRootPath + path.sep, '')) :
        toUnixPath(this.moduleId.replace(this.metaInfo.belongProjectPath, ''));
      const updatedMap: Object = code.generateMap({
        source: relativeSourceFilePath,
        file: `${path.basename(this.moduleId)}`,
        includeContent: false,
        hires: true
      });
      const sourceMapGenerator = SourceMapGenerator.getInstance();
      const key = sourceMapGenerator.isNewSourceMaps() ? this.moduleId : relativeSourceFilePath;
      const sourcemap = await updateSourceMap(sourceMapGenerator.getSourceMap(key), updatedMap);
      sourceMapGenerator.fillSourceMapPackageInfo(this.moduleId, sourcemap);
      sourceMapGenerator.updateSourceMap(key, sourcemap);
    }

    this.source = code.toString();
  }

  private processTransformedTsModuleRequest(rollupObject: Object): void {
    const moduleInfo: Object = rollupObject.getModuleInfo(this.moduleId);
    const importMap: Object = moduleInfo.importedIdMaps;
    let isMockFile: boolean = ModuleSourceFile.isMockFile(this.moduleId, rollupObject);

    const moduleNodeTransformer: ts.TransformerFactory<ts.SourceFile> = context => {
      const visitor: ts.Visitor = node => {
        node = ts.visitEachChild(node, visitor, context);
        // staticImport node
        if (ts.isImportDeclaration(node) || (ts.isExportDeclaration(node) && node.moduleSpecifier)) {
          // moduleSpecifier.getText() returns string carrying on quotation marks which the importMap's key does not,
          // so we need to remove the quotation marks from moduleRequest.
          const moduleRequest: string = (node.moduleSpecifier! as ts.StringLiteral).text.replace(/'|"/g, '');
          let ohmUrl: string | undefined = this.getOhmUrl(rollupObject, moduleRequest, importMap[moduleRequest], this.moduleId);
          if (ohmUrl !== undefined) {
            // the import module are added with ".origin" at the end of the ohm url in every mock file.
            const realOhmUrl: string = isMockFile ? `${ohmUrl}${ORIGIN_EXTENTION}` : ohmUrl;
            if (isMockFile) {
              ModuleSourceFile.addMockConfig(ModuleSourceFile.newMockConfigInfo, realOhmUrl, ohmUrl);
            }
            const modifiers: readonly ts.Modifier[] = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
            if (ts.isImportDeclaration(node)) {
              return ts.factory.createImportDeclaration(modifiers,
                node.importClause, ts.factory.createStringLiteral(realOhmUrl));
            } else {
              return ts.factory.createExportDeclaration(modifiers,
                node.isTypeOnly, node.exportClause, ts.factory.createStringLiteral(realOhmUrl));
            }
          }
        }
        // dynamicImport node
        if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
          const moduleRequest: string = node.arguments[0].getText().replace(/'|"/g, '');
          const ohmUrl: string | undefined = this.getOhmUrl(rollupObject, moduleRequest, importMap[moduleRequest], this.moduleId);
          if (ohmUrl !== undefined) {
            const args: ts.Expression[] = [...node.arguments];
            args[0] = ts.factory.createStringLiteral(ohmUrl);
            return ts.factory.createCallExpression(node.expression, node.typeArguments, args);
          }
        }
        return node;
      };
      return node => ts.visitNode(node, visitor);
    };

    const result: ts.TransformationResult<ts.SourceFile> =
      ts.transform(<ts.SourceFile> this.source!, [moduleNodeTransformer]);

    this.source = result.transformed[0];
  }

  // Replace each module request in source file to a unique representation which is called 'ohmUrl'.
  // This 'ohmUrl' will be the same as the record name for each file, to make sure runtime can find the corresponding
  // record based on each module request.
  async processModuleRequest(rollupObject: Object, parentEvent: Object): Promise<void> {
    if (isJsonSourceFile(this.moduleId)) {
      return;
    }
    if (isJsSourceFile(this.moduleId)) {
      const eventProcessJsModuleRequest = createAndStartEvent(parentEvent, 'process Js module request');
      this.processJsModuleRequest(rollupObject);
      stopEvent(eventProcessJsModuleRequest);
      return;
    }


    // Only when files were transformed to ts, the corresponding ModuleSourceFile were initialized with sourceFile node,
    // if files were transformed to js, ModuleSourceFile were initialized with srouce string.
    if (this.isSourceNode) {
      const eventProcessTransformedTsModuleRequest = createAndStartEvent(parentEvent, 'process transformed Ts module request');
      this.processTransformedTsModuleRequest(rollupObject);
      stopEvent(eventProcessTransformedTsModuleRequest);
    } else {
      const eventProcessTransformedJsModuleRequest = createAndStartEvent(parentEvent, 'process transformed Js module request');
      await this.processTransformedJsModuleRequest(rollupObject);
      stopEvent(eventProcessTransformedJsModuleRequest);
    }
  }

  private static initPluginEnv(rollupObject: Object): void {
    this.projectConfig = Object.assign(rollupObject.share.arkProjectConfig, rollupObject.share.projectConfig);
    this.logger = rollupObject.share.getLogger(GEN_ABC_PLUGIN_NAME);
  }

  public static sortSourceFilesByModuleId(): void {
    ModuleSourceFile.sourceFiles.sort((a, b) => a.moduleId.localeCompare(b.moduleId));
  }

  public static cleanUpObjects(): void {
    ModuleSourceFile.sourceFiles = [];
    ModuleSourceFile.projectConfig = undefined;
    ModuleSourceFile.logger = undefined;
    ModuleSourceFile.mockConfigInfo = {};
    ModuleSourceFile.mockFiles = [];
    ModuleSourceFile.newMockConfigInfo = {};
    ModuleSourceFile.transformedHarOrHspMockConfigInfo = {};
    ModuleSourceFile.mockConfigKeyToModuleInfo = {};
    ModuleSourceFile.needProcessMock = false;
  }
}
