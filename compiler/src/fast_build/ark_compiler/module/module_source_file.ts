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
  PACKAGES
} from '../common/ark_define';
import {
  getOhmUrlByFilepath,
  getOhmUrlByHarName,
  getOhmUrlBySystemApiOrLibRequest,
  mangleDeclarationFileName,
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
import { newSourceMaps } from '../transform';
import { writeObfuscationNameCache } from '../common/ob_config_resolver';
import { ORIGIN_EXTENTION } from '../process_mock';
import {
  ESMODULE,
  TRANSFORMED_MOCK_CONFIG,
  USER_DEFINE_MOCK_CONFIG
} from '../../../pre_define';
import { readProjectAndLibsSource } from '../common/process_ark_config';
import { allSourceFilePaths, collectAllFiles } from '../../../ets_checker';
import { projectConfig } from '../../../../main';
const ROLLUP_IMPORT_NODE: string = 'ImportDeclaration';
const ROLLUP_EXPORTNAME_NODE: string = 'ExportNamedDeclaration';
const ROLLUP_EXPORTALL_NODE: string = 'ExportAllDeclaration';
const ROLLUP_DYNAMICIMPORT_NODE: string = 'ImportExpression';
const ROLLUP_LITERAL_NODE: string = 'Literal';

export class ModuleSourceFile {
  private static sourceFiles: ModuleSourceFile[] = [];
  private moduleId: string;
  private source: string | ts.SourceFile;
  private isSourceNode: boolean = false;
  private static projectConfig: Object;
  private static logger: Object;
  private static mockConfigInfo: Object = {};
  private static mockFiles: string[] = [];
  private static newMockConfigInfo: Object = {};
  private static needProcessMock: boolean = false;

  constructor(moduleId: string, source: string | ts.SourceFile) {
    this.moduleId = moduleId;
    this.source = source;
    if (typeof this.source !== 'string') {
      this.isSourceNode = true;
    }
  }

  static setProcessMock(rollupObject: Object): void {
    // only processing mock-config.json5 in preview or OhosTest mode
    if (!(rollupObject.share.projectConfig.isPreview || rollupObject.share.projectConfig.isOhosTest)) {
      ModuleSourceFile.needProcessMock = false;
      return;
    }

    // mockParams is essential, and etsSourceRootPath && mockConfigPath need to be defined in mockParams
    // mockParams = {
    //   "decorator": "name of mock decorator",
    //   "packageName": "name of mock package",
    //   "etsSourceRootPath": "path of ets source root",
    //   "mockConfigPath": "path of mock configuration file"
    // }
    ModuleSourceFile.needProcessMock = (rollupObject.share.projectConfig.mockParams &&
                                        rollupObject.share.projectConfig.mockParams.etsSourceRootPath &&
                                        rollupObject.share.projectConfig.mockParams.mockConfigPath) ? true : false;
  }

  static collectMockConfigInfo(rollupObject: Object): void {
    ModuleSourceFile.mockConfigInfo = require('json5').parse(
      fs.readFileSync(rollupObject.share.projectConfig.mockParams.mockConfigPath, 'utf-8'));
    for (let mockedTarget in ModuleSourceFile.mockConfigInfo) {
      if (ModuleSourceFile.mockConfigInfo[mockedTarget].source) {
        ModuleSourceFile.mockFiles.push(ModuleSourceFile.mockConfigInfo[mockedTarget].source);
      }
    }
  }

  static addNewMockConfig(key: string, src: string): void {
    if (ModuleSourceFile.newMockConfigInfo.hasOwnProperty(key)) {
      return;
    }

    ModuleSourceFile.newMockConfigInfo[key] = {'source': src};
  }

  static generateNewMockInfoByOrignMockConfig(originKey: string, transKey: string, rollupObject: Object): void {
    if (!ModuleSourceFile.mockConfigInfo.hasOwnProperty(originKey)) {
      return;
    }

    let mockFile: string = ModuleSourceFile.mockConfigInfo[originKey].source;
    let mockFilePath: string = `${toUnixPath(rollupObject.share.projectConfig.modulePath)}/${mockFile}`;
    let mockFileOhmUrl: string = getOhmUrlByFilepath(mockFilePath,
                                                     ModuleSourceFile.projectConfig,
                                                     ModuleSourceFile.logger,
                                                     rollupObject.share.projectConfig.entryModuleName);
    mockFileOhmUrl = mockFileOhmUrl.startsWith(PACKAGES) ? `@package:${mockFileOhmUrl}` : `@bundle:${mockFileOhmUrl}`;
    // record mock target mapping for incremental compilation
    ModuleSourceFile.addNewMockConfig(transKey, mockFileOhmUrl);
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
    // if mock-config.json5 is not modified, use the cached mock config mapping file
    fs.copyFileSync(transformedMockConfigCache, transformedMockConfig);
  }

  static removePotentialMockConfigCache(rollupObject: Object): void {
    const transformedMockConfigCache: string =
      path.resolve(rollupObject.share.projectConfig.cachePath, `./${TRANSFORMED_MOCK_CONFIG}`);
    const userDefinedMockConfigCache: string =
      path.resolve(rollupObject.share.projectConfig.cachePath, `./${USER_DEFINE_MOCK_CONFIG}`);
    if (fs.existsSync(transformedMockConfigCache)) {
      fs.rm(transformedMockConfigCache);
    }

    if (fs.existsSync(userDefinedMockConfigCache)) {
      fs.rm(userDefinedMockConfigCache);
    }
  }

  static newSourceFile(moduleId: string, source: string | ts.SourceFile) {
    ModuleSourceFile.sourceFiles.push(new ModuleSourceFile(moduleId, source));
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

    collectAllFiles(undefined, rollupObject.getModuleIds());
    readProjectAndLibsSource(allSourceFilePaths, ModuleSourceFile.projectConfig.obfuscationMergedObConfig,
      ModuleSourceFile.projectConfig.arkObfuscator);

    // Sort the collection by file name to ensure binary consistency.
    ModuleSourceFile.sortSourceFilesByModuleId();
    for (const source of ModuleSourceFile.sourceFiles) {
      if (!rollupObject.share.projectConfig.compileHar) {
        // compileHar: compile closed source har of project, which convert .ets to .d.ts and js, doesn't transform module request.
        const eventBuildModuleSourceFile = createAndStartEvent(parentEvent, 'build module source files');
        await source.processModuleRequest(rollupObject, eventBuildModuleSourceFile);
        stopEvent(eventBuildModuleSourceFile);
      }
      const eventWriteSourceFile = createAndStartEvent(parentEvent, 'write source file');
      await source.writeSourceFile(eventWriteSourceFile);
      stopEvent(eventWriteSourceFile);
    }

    if (rollupObject.share.arkProjectConfig.compileMode === ESMODULE) {
      await mangleDeclarationFileName(ModuleSourceFile.logger, rollupObject.share.arkProjectConfig);
    }

    const eventObfuscatedCode = createAndStartEvent(parentEvent, 'write obfuscation name cache');
    if ((ModuleSourceFile.projectConfig.arkObfuscator || ModuleSourceFile.projectConfig.terserConfig) &&
      ModuleSourceFile.projectConfig.obfuscationOptions) {
      writeObfuscationNameCache(ModuleSourceFile.projectConfig, ModuleSourceFile.projectConfig.obfuscationOptions.obfuscationCacheDir,
        ModuleSourceFile.projectConfig.obfuscationMergedObConfig.options?.printNameCache);
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
      await writeFileSyncByNode(<ts.SourceFile>this.source, ModuleSourceFile.projectConfig, parentEvent, ModuleSourceFile.logger);
    } else {
      await writeFileContentToTempDir(this.moduleId, <string>this.source, ModuleSourceFile.projectConfig, ModuleSourceFile.logger, parentEvent);
    }
  }

  private getOhmUrl(rollupObject: Object, moduleRequest: string, filePath: string | undefined): string | undefined {
    let systemOrLibOhmUrl: string | undefined = getOhmUrlBySystemApiOrLibRequest(moduleRequest);
    if (systemOrLibOhmUrl != undefined) {
      if (ModuleSourceFile.needProcessMock) {
        ModuleSourceFile.generateNewMockInfoByOrignMockConfig(moduleRequest, systemOrLibOhmUrl, rollupObject);
      }
      return systemOrLibOhmUrl;
    }
    const harOhmUrl: string | undefined = getOhmUrlByHarName(moduleRequest, ModuleSourceFile.projectConfig);
    if (harOhmUrl !== undefined) {
      if (ModuleSourceFile.needProcessMock) {
        ModuleSourceFile.generateNewMockInfoByOrignMockConfig(moduleRequest, harOhmUrl, rollupObject);
      }
      return harOhmUrl;
    }
    if (filePath) {
      const targetModuleInfo: Object = rollupObject.getModuleInfo(filePath);
      const namespace: string = targetModuleInfo['meta']['moduleName'];
      const ohmUrl: string =
        getOhmUrlByFilepath(filePath, ModuleSourceFile.projectConfig, ModuleSourceFile.logger, namespace);
      let res: string = ohmUrl.startsWith(PACKAGES) ? `@package:${ohmUrl}` : `@bundle:${ohmUrl}`;
      if (ModuleSourceFile.needProcessMock) {
        // processing cases of har or lib mock targets
        ModuleSourceFile.generateNewMockInfoByOrignMockConfig(moduleRequest, res, rollupObject);
        // processing cases of user-defined mock targets
        let mockedTarget: string = toUnixPath(filePath).
            replace(toUnixPath(rollupObject.share.projectConfig.modulePath), '').
            replace(`/${rollupObject.share.projectConfig.mockParams.etsSourceRootPath}/`, '');
        ModuleSourceFile.generateNewMockInfoByOrignMockConfig(mockedTarget, res, rollupObject);
      }
      return res;
    }
    return undefined;
  }

  private processJsModuleRequest(rollupObject: Object): void {
    const moduleInfo: Object = rollupObject.getModuleInfo(this.moduleId);
    const importMap: Object = moduleInfo.importedIdMaps;
    const REG_DEPENDENCY: RegExp = /(?:import|from)(?:\s*)['"]([^'"]+)['"]|(?:import)(?:\s*)\(['"]([^'"]+)['"]\)/g;
    this.source = (<string>this.source).replace(REG_DEPENDENCY, (item, staticModuleRequest, dynamicModuleRequest) => {
      const moduleRequest: string = staticModuleRequest || dynamicModuleRequest;
      const ohmUrl: string | undefined = this.getOhmUrl(rollupObject, moduleRequest, importMap[moduleRequest]);
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
      .replace(/\b__harDefaultBundleName__\b/gi, projectConfig.bundleName)
      .replace(/\b__harDefaultModuleName__\b/gi, projectConfig.moduleName);
  }

  private async processTransformedJsModuleRequest(rollupObject: Object): Promise<void> {
    const moduleInfo: Object = rollupObject.getModuleInfo(this.moduleId);
    const importMap: Object = moduleInfo.importedIdMaps;
    const code: MagicString = new MagicString(<string>this.source);
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
            this.getOhmUrl(rollupObject, node.source.value, importMap[node.source.value]);
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
                this.getOhmUrl(rollupObject, node.source.value, importMap[node.source.value]);
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
      const relativeSourceFilePath: string =
        toUnixPath(this.moduleId.replace(ModuleSourceFile.projectConfig.projectRootPath + path.sep, ''));
      const updatedMap: Object = code.generateMap({
        source: relativeSourceFilePath,
        file: `${path.basename(this.moduleId)}`,
        includeContent: false,
        hires: true
      });
      newSourceMaps[relativeSourceFilePath] = await updateSourceMap(newSourceMaps[relativeSourceFilePath], updatedMap);
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
          let ohmUrl: string | undefined = this.getOhmUrl(rollupObject, moduleRequest, importMap[moduleRequest]);
          if (ohmUrl !== undefined) {
            // the import module are added with ".origin" at the end of the ohm url in every mock file.
            const realOhmUrl: string = isMockFile ? `${ohmUrl}${ORIGIN_EXTENTION}` : ohmUrl;
            if (isMockFile) {
              ModuleSourceFile.addNewMockConfig(realOhmUrl, ohmUrl);
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
          const ohmUrl: string | undefined = this.getOhmUrl(rollupObject, moduleRequest, importMap[moduleRequest]);
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
      ts.transform(<ts.SourceFile>this.source!, [moduleNodeTransformer]);

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
    ModuleSourceFile.needProcessMock = false;
  }
}
