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


import { expect } from 'chai';
import mocha from 'mocha';
import path from 'path';
import fs from 'fs';
import ts from 'typescript';

import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import { ModuleSourceFile } from '../../../lib/fast_build/ark_compiler/module/module_source_file';
import { ModuleInfo } from '../../../lib/fast_build/ark_compiler/module/module_mode';
import ModuleModeMock from '../mock/class_mock/module_mode_mock';
import {
  EXPECT_ENTRY_TS,
  EXPECT_INDEX_ETS,
  MODULE_TEST_PATH,
  EXPECT_TO_JS
} from '../mock/rollup_mock/path_config';
import {
  RELEASE,
  EXTNAME_ETS,
  EXTNAME_TS,
  EXTNAME_JS
} from '../../../lib/fast_build/ark_compiler/common/ark_define';
import {
  META,
  ENTRYABILITY_TS_PATH_DEFAULT,
  INDEX_ETS_PATH_DEFAULT,
  OHURL_RES,
  ENTRYABILITY_TS,
  INDEX_ETS,
  OHURL_SHAREDLIBRARY,
  OH_UIABILITY,
  OH_HILOG
} from '../mock/rollup_mock/common';
import projectConfig from '../utils/processProjectConfig';
import { ModuleInfo as ModuleInfoMock } from '../mock/rollup_mock/module_info';
import { scanFiles } from "../utils/utils";
import { SourceMapGenerator } from '../../../lib/fast_build/ark_compiler/generate_sourcemap';
import {
  TRANSFORMED_MOCK_CONFIG,
  USER_DEFINE_MOCK_CONFIG
} from '../../../lib/pre_define';

const ROLLUP_IMPORT_NODE: string = 'ImportDeclaration';
const ROLLUP_EXPORTNAME_NODE: string = 'ExportNamedDeclaration';
const ROLLUP_EXPORTALL_NODE: string = 'ExportAllDeclaration';
const ROLLUP_DYNAMICIMPORT_NODE: string = 'ImportExpression';
const ROLLUP_LITERAL_NODE: string = 'Literal';

mocha.describe('test module_source_file file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1-1: test getOhmUrl under build debug: systemOrLibOhmUrl is not undefined', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();

    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS) || moduleId.endsWith(EXTNAME_JS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFile(moduleId, code);
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps();
        moduleInfo.setNodeImportDeclaration();
        const importMap: object = moduleInfo.importedIdMaps;
        const moduleNodeMap: Map<string, any> =
          moduleInfo.getNodeByType(ROLLUP_IMPORT_NODE, ROLLUP_EXPORTNAME_NODE,
            ROLLUP_EXPORTALL_NODE, ROLLUP_DYNAMICIMPORT_NODE);
        let hasDynamicImport: boolean = false;
        for (const nodeSet of moduleNodeMap.values()) {
          nodeSet.forEach(node => {
            if (!hasDynamicImport && node.type === ROLLUP_DYNAMICIMPORT_NODE) {
              hasDynamicImport = true;
            }
            if (node.source) {
              if (node.source.type === ROLLUP_LITERAL_NODE) {
                const ohmUrl: string | undefined =
                  moduleSource.getOhmUrl(this.rollup, node.source.value, importMap[node.source.value]);
                expect(ohmUrl === OH_UIABILITY || ohmUrl === OH_HILOG).to.be.true;
              } else {
                const errorMsg: string = `ArkTS:ERROR ArkTS:ERROR File: ${this.moduleId}\n`
                  + `DynamicImport only accept stringLiteral as argument currently.\n`;
                console.log(errorMsg);
              }
            }
          });
        }
      }
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-1-2: test getOhmUrl under build debug: filePath exist', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();

    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_ETS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFile(moduleId, code);
        ModuleSourceFile.projectConfig = modeMock.projectConfig;
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps(moduleId);
        moduleInfo.setNodeImportExpression();
        const importMap: object = moduleInfo.importedIdMaps;
        const moduleNodeMap: Map<string, any> =
          moduleInfo.getNodeByType(ROLLUP_IMPORT_NODE, ROLLUP_EXPORTNAME_NODE,
            ROLLUP_EXPORTALL_NODE, ROLLUP_DYNAMICIMPORT_NODE);
        let hasDynamicImport: boolean = false;
        for (const nodeSet of moduleNodeMap.values()) {
          nodeSet.forEach(node => {
            if (!hasDynamicImport && node.type === ROLLUP_DYNAMICIMPORT_NODE) {
              hasDynamicImport = true;
            }
            if (node.source) {
              if (node.source.type === ROLLUP_LITERAL_NODE) {
                const ohmUrl: string | undefined =
                  moduleSource.getOhmUrl(this.rollup, node.source.value, importMap['requestFile']);
                expect(ohmUrl === OHURL_RES).to.be.true;
              } else {
                const errorMsg: string = `ArkTS:ERROR ArkTS:ERROR File: ${this.moduleId}\n`
                  + `DynamicImport only accept stringLiteral as argument currently.\n`;
                console.log(errorMsg);
              }
            }
          });
        }
      }
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-1-3: test getOhmUrl under build debug: harOhmUrl is not undefined', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();

    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_ETS) || moduleId.endsWith(EXTNAME_JS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFile(moduleId, code);
        ModuleSourceFile.projectConfig = modeMock.projectConfig;
        ModuleSourceFile.projectConfig.harNameOhmMap = projectConfig.harNameOhmMap;
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps(moduleId);
        moduleInfo.setNodeImportExpression();
        const importMap: object = moduleInfo.importedIdMaps;
        const moduleNodeMap: Map<string, any> =
          moduleInfo.getNodeByType(ROLLUP_IMPORT_NODE, ROLLUP_EXPORTNAME_NODE,
            ROLLUP_EXPORTALL_NODE, ROLLUP_DYNAMICIMPORT_NODE);
        let hasDynamicImport: boolean = false;
        for (const nodeSet of moduleNodeMap.values()) {
          nodeSet.forEach(node => {
            if (!hasDynamicImport && node.type === ROLLUP_DYNAMICIMPORT_NODE) {
              hasDynamicImport = true;
            }
            if (node.source) {
              if (node.source.type === ROLLUP_LITERAL_NODE) {
                const ohmUrl: string | undefined =
                  moduleSource.getOhmUrl(this.rollup, node.source.value, importMap['requestFile']);
                expect(ohmUrl === OHURL_SHAREDLIBRARY).to.be.true;
              } else {
                const errorMsg: string = `ArkTS:ERROR ArkTS:ERROR File: ${this.moduleId}\n`
                  + `DynamicImport only accept stringLiteral as argument currently.\n`;
                console.log(errorMsg);
              }
            }
          });
        }
      }
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-2: test getOhmUrl under build release', function () {
    this.rollup.build(RELEASE);
    SourceMapGenerator.initInstance(this.rollup);
    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS) || moduleId.endsWith(EXTNAME_JS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFile(moduleId, code);
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps();
        moduleInfo.setNodeImportDeclaration();
        const importMap: object = moduleInfo.importedIdMaps;
        const moduleNodeMap: Map<string, any> =
          moduleInfo.getNodeByType(ROLLUP_IMPORT_NODE, ROLLUP_EXPORTNAME_NODE,
            ROLLUP_EXPORTALL_NODE, ROLLUP_DYNAMICIMPORT_NODE);
        let hasDynamicImport: boolean = false;
        for (const nodeSet of moduleNodeMap.values()) {
          nodeSet.forEach(node => {
            if (!hasDynamicImport && node.type === ROLLUP_DYNAMICIMPORT_NODE) {
              hasDynamicImport = true;
            }
            if (node.source) {
              if (node.source.type === ROLLUP_LITERAL_NODE) {
                const ohmUrl: string | undefined =
                  moduleSource.getOhmUrl(this.rollup, node.source.value, importMap[node.source.value]);
                expect(ohmUrl === OH_UIABILITY || ohmUrl === OH_HILOG).to.be.true;
              } else {
                const errorMsg: string = `ArkTS:ERROR ArkTS:ERROR File: ${this.moduleId}\n`
                  + `DynamicImport only accept stringLiteral as argument currently.\n`;
                console.log(errorMsg);
              }
            }
          });
        }
      }
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-3: test getOhmUrl under preview debug', function () {
    this.rollup.preview();
    SourceMapGenerator.initInstance(this.rollup);
    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS) || moduleId.endsWith(EXTNAME_JS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFile(moduleId, code);
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps();
        moduleInfo.setNodeImportDeclaration();
        const importMap: object = moduleInfo.importedIdMaps;
        const moduleNodeMap: Map<string, any> =
          moduleInfo.getNodeByType(ROLLUP_IMPORT_NODE, ROLLUP_EXPORTNAME_NODE,
            ROLLUP_EXPORTALL_NODE, ROLLUP_DYNAMICIMPORT_NODE);
        let hasDynamicImport: boolean = false;
        for (const nodeSet of moduleNodeMap.values()) {
          nodeSet.forEach(node => {
            if (!hasDynamicImport && node.type === ROLLUP_DYNAMICIMPORT_NODE) {
              hasDynamicImport = true;
            }
            if (node.source) {
              if (node.source.type === ROLLUP_LITERAL_NODE) {
                const ohmUrl: string | undefined =
                  moduleSource.getOhmUrl(this.rollup, node.source.value, importMap[node.source.value]);
                expect(ohmUrl === OH_UIABILITY || ohmUrl === OH_HILOG).to.be.true;
              } else {
                const errorMsg: string = `ArkTS:ERROR ArkTS:ERROR File: ${this.moduleId}\n`
                  + `DynamicImport only accept stringLiteral as argument currently.\n`;
                console.log(errorMsg);
              }
            }
          });
        }
      }
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-4: test getOhmUrl under hot reload debug', function () {
    this.rollup.hotReload();
    SourceMapGenerator.initInstance(this.rollup);
    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS) || moduleId.endsWith(EXTNAME_JS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFile(moduleId, code);
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps();
        moduleInfo.setNodeImportDeclaration();
        const importMap: object = moduleInfo.importedIdMaps;
        const moduleNodeMap: Map<string, any> =
          moduleInfo.getNodeByType(ROLLUP_IMPORT_NODE, ROLLUP_EXPORTNAME_NODE,
            ROLLUP_EXPORTALL_NODE, ROLLUP_DYNAMICIMPORT_NODE);
        let hasDynamicImport: boolean = false;
        for (const nodeSet of moduleNodeMap.values()) {
          nodeSet.forEach(node => {
            if (!hasDynamicImport && node.type === ROLLUP_DYNAMICIMPORT_NODE) {
              hasDynamicImport = true;
            }
            if (node.source) {
              if (node.source.type === ROLLUP_LITERAL_NODE) {
                const ohmUrl: string | undefined =
                  moduleSource.getOhmUrl(this.rollup, node.source.value, importMap[node.source.value]);
                expect(ohmUrl === OH_UIABILITY || ohmUrl === OH_HILOG).to.be.true;
              } else {
                const errorMsg: string = `ArkTS:ERROR ArkTS:ERROR File: ${this.moduleId}\n`
                  + `DynamicImport only accept stringLiteral as argument currently.\n`;
                console.log(errorMsg);
              }
            }
          });
        }
      }
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-1: test processJsModuleRequest under build debug', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFile(moduleId, code);
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps();
        moduleSource.processJsModuleRequest(this.rollup);
        const EntryAbility_ts = fs.readFileSync(EXPECT_ENTRY_TS).toString();
        const Index_ets = fs.readFileSync(EXPECT_INDEX_ETS).toString();
        expect(moduleSource.source === EntryAbility_ts || moduleSource.source === Index_ets).to.be.true;
      }
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-2: test processJsModuleRequest under build release', function () {
    this.rollup.build(RELEASE);
    SourceMapGenerator.initInstance(this.rollup);
    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFile(moduleId, code);
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps();
        moduleSource.processJsModuleRequest(this.rollup);
        const EntryAbility_ts = fs.readFileSync(EXPECT_ENTRY_TS).toString();
        const Index_ets = fs.readFileSync(EXPECT_INDEX_ETS).toString();
        expect(moduleSource.source === EntryAbility_ts || moduleSource.source === Index_ets).to.be.true;
      }
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-3: test processJsModuleRequest under preview debug', function () {
    this.rollup.preview();
    SourceMapGenerator.initInstance(this.rollup);
    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFile(moduleId, code);
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps();
        moduleSource.processJsModuleRequest(this.rollup);
        const EntryAbility_ts = fs.readFileSync(EXPECT_ENTRY_TS).toString();
        const Index_ets = fs.readFileSync(EXPECT_INDEX_ETS).toString();
        expect(moduleSource.source === EntryAbility_ts || moduleSource.source === Index_ets).to.be.true;
      }
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-4: test processJsModuleRequest under hot reload debug', function () {
    this.rollup.hotReload();
    SourceMapGenerator.initInstance(this.rollup);
    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFile(moduleId, code);
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps();
        moduleSource.processJsModuleRequest(this.rollup);
        const EntryAbility_ts = fs.readFileSync(EXPECT_ENTRY_TS).toString();
        const Index_ets = fs.readFileSync(EXPECT_INDEX_ETS).toString();
        expect(moduleSource.source === EntryAbility_ts || moduleSource.source === Index_ets).to.be.true;
      }
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-1-1: test processTransformedJsModuleRequest under build debug: hasDynamicImport is false', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS)) {
        const code: string = JSON.stringify(fs.readFileSync(moduleId, 'utf-8'));
        const moduleSource = new ModuleSourceFile(moduleId, code);
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps();
        moduleInfo.setNodeImportDeclaration();
        moduleSource.processTransformedJsModuleRequest(this.rollup);
        const json = fs.readFileSync(EXPECT_TO_JS, 'utf-8');
        const etsToJs = JSON.parse(json).expect_index_ets_to_js;
        const tsToJs = JSON.parse(json).expect_entryability_ts_to_js;
        expect(moduleSource.source === etsToJs || moduleSource.source === tsToJs).to.be.true;
      }
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-1-2: test processTransformedJsModuleRequest under build debug: hasDynamicImport is true', async function () {
    this.rollup.build();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let newSourceMaps = sourceMapGenerator.getSourceMaps();

    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS)) {
        const code: string = JSON.stringify(fs.readFileSync(moduleId, 'utf-8'));
        const moduleSource = new ModuleSourceFile(moduleId, code);
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps();
        moduleInfo.setNodeImportExpression();
        ModuleSourceFile.projectConfig = modeMock.projectConfig;
        await moduleSource.processTransformedJsModuleRequest(this.rollup);
        for (const key in newSourceMaps) {
          expect(newSourceMaps[key].mappings.length > 0).to.be.true;
          expect(newSourceMaps[key].file.includes(ENTRYABILITY_TS) !== -1
            || newSourceMaps[key].file.includes(INDEX_ETS) !== -1).to.be.true;
          expect(newSourceMaps[key].sources.includes(ENTRYABILITY_TS_PATH_DEFAULT) !== -1
            || newSourceMaps[key].sources.includes(INDEX_ETS_PATH_DEFAULT) !== -1).to.be.true;
        }
      }
    }

    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-2: test processTransformedJsModuleRequest under build release', function () {
    this.rollup.build(RELEASE);
    SourceMapGenerator.initInstance(this.rollup);
    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS)) {
        const code: string = JSON.stringify(fs.readFileSync(moduleId, 'utf-8'));
        const moduleSource = new ModuleSourceFile(moduleId, code);
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps();
        moduleInfo.setNodeImportDeclaration();
        moduleSource.processTransformedJsModuleRequest(this.rollup);
        const json = fs.readFileSync(EXPECT_TO_JS, 'utf-8');
        const etsToJs = JSON.parse(json).expect_index_ets_to_js;
        const tsToJs = JSON.parse(json).expect_entryability_ts_to_js;
        expect(moduleSource.source === etsToJs || moduleSource.source === tsToJs).to.be.true;
      }
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-3: test processTransformedJsModuleRequest under preview debug', function () {
    this.rollup.preview();
    SourceMapGenerator.initInstance(this.rollup);
    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS)) {
        const code: string = JSON.stringify(fs.readFileSync(moduleId, 'utf-8'));
        const moduleSource = new ModuleSourceFile(moduleId, code);
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps();
        moduleInfo.setNodeImportDeclaration();
        moduleSource.processTransformedJsModuleRequest(this.rollup);
        const json = fs.readFileSync(EXPECT_TO_JS, 'utf-8');
        const etsToJs = JSON.parse(json).expect_index_ets_to_js;
        const tsToJs = JSON.parse(json).expect_entryability_ts_to_js;
        expect(moduleSource.source === etsToJs || moduleSource.source === tsToJs).to.be.true;
      }
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-4: test processTransformedJsModuleRequest under hot reload debug', function () {
    this.rollup.hotReload();
    SourceMapGenerator.initInstance(this.rollup);
    const modeMock = new ModuleModeMock(this.rollup);
    const mockFileList: object = this.rollup.getModuleIds();
    this.moduleInfos = new Map<String, ModuleInfo>();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS)) {
        const code: string = JSON.stringify(fs.readFileSync(moduleId, 'utf-8'));
        const moduleSource = new ModuleSourceFile(moduleId, code);
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        const metaInfo: object = moduleInfo[META];
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        moduleInfo.setImportedIdMaps();
        moduleInfo.setNodeImportDeclaration();
        moduleSource.processTransformedJsModuleRequest(this.rollup);
        const json = fs.readFileSync(EXPECT_TO_JS, 'utf-8');
        const etsToJs = JSON.parse(json).expect_index_ets_to_js;
        const tsToJs = JSON.parse(json).expect_entryability_ts_to_js;
        expect(moduleSource.source === etsToJs || moduleSource.source === tsToJs).to.be.true;
      }
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('4-1: test processTransformedTsModuleRequest under build debug', function () {
    this.rollup.build();
    const modeMock = new ModuleModeMock(this.rollup);
    const allFiles = new Set<string>();
    this.moduleInfos = new Map<String, ModuleInfo>();
    scanFiles(MODULE_TEST_PATH, allFiles);
    for (const moduleId of allFiles.values()) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleInfo = new ModuleInfoMock(moduleId,
          this.rollup.share.projectConfig.entryModuleName,
          this.rollup.share.projectConfig.modulePath);
        moduleInfo.setImportedIdMaps();
        this.rollup.moduleInfos.push(moduleInfo);
        const metaInfo: object = moduleInfo[META];
        SourceMapGenerator.initInstance(this.rollup);
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        const sourceFile = ts.createSourceFile(moduleId, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        const moduleSource = new ModuleSourceFile(moduleId, sourceFile);
        ModuleSourceFile.processModuleSourceFiles(this.rollup);
        moduleSource.processTransformedTsModuleRequest(this.rollup);
        expect(moduleSource.source.fileName === moduleId).to.be.true;
        expect(moduleSource.source.text === code).to.be.true;
        expect(moduleSource.source.languageVariant === ts.LanguageVariant.Standard).to.be.true;
        expect(moduleSource.source.isDeclarationFile === false).to.be.true;
        expect(moduleSource.source.hasNoDefaultLib === false).to.be.true;
        expect(moduleSource.source.languageVersion === ts.ScriptTarget.Latest).to.be.true;
        SourceMapGenerator.cleanSourceMapObject();
      }
    }
  });

  mocha.it('4-2: test processTransformedTsModuleRequest under build release', function () {
    this.rollup.build(RELEASE);
    const modeMock = new ModuleModeMock(this.rollup);
    const allFiles = new Set<string>();
    scanFiles(MODULE_TEST_PATH, allFiles);
    for (const moduleId of allFiles.values()) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleInfo = new ModuleInfoMock(moduleId,
          this.rollup.share.projectConfig.entryModuleName,
          this.rollup.share.projectConfig.modulePath);
        moduleInfo.setImportedIdMaps();
        this.rollup.moduleInfos.push(moduleInfo);
        const metaInfo: object = moduleInfo[META];
        SourceMapGenerator.initInstance(this.rollup);
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        const sourceFile = ts.createSourceFile(moduleId, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        const moduleSource = new ModuleSourceFile(moduleId, sourceFile);
        ModuleSourceFile.processModuleSourceFiles(this.rollup);
        moduleSource.processTransformedTsModuleRequest(this.rollup);
        expect(moduleSource.source.fileName === moduleId).to.be.true;
        expect(moduleSource.source.text === code).to.be.true;
        expect(moduleSource.source.languageVariant === ts.LanguageVariant.Standard).to.be.true;
        expect(moduleSource.source.isDeclarationFile === false).to.be.true;
        expect(moduleSource.source.hasNoDefaultLib === false).to.be.true;
        expect(moduleSource.source.languageVersion === ts.ScriptTarget.Latest).to.be.true;
        SourceMapGenerator.cleanSourceMapObject();
      }
    }
  });

  mocha.it('4-3: test processTransformedTsModuleRequest under preview debug', function () {
    this.rollup.preview();
    const modeMock = new ModuleModeMock(this.rollup);
    const allFiles = new Set<string>();
    scanFiles(MODULE_TEST_PATH, allFiles);
    for (const moduleId of allFiles.values()) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleInfo = new ModuleInfoMock(moduleId,
          this.rollup.share.projectConfig.entryModuleName,
          this.rollup.share.projectConfig.modulePath);
        moduleInfo.setImportedIdMaps();
        this.rollup.moduleInfos.push(moduleInfo);
        const metaInfo: object = moduleInfo[META];
        SourceMapGenerator.initInstance(this.rollup);
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        const sourceFile = ts.createSourceFile(moduleId, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        const moduleSource = new ModuleSourceFile(moduleId, sourceFile);
        ModuleSourceFile.processModuleSourceFiles(this.rollup);
        moduleSource.processTransformedTsModuleRequest(this.rollup);
        expect(moduleSource.source.fileName === moduleId).to.be.true;
        expect(moduleSource.source.text === code).to.be.true;
        expect(moduleSource.source.languageVariant === ts.LanguageVariant.Standard).to.be.true;
        expect(moduleSource.source.isDeclarationFile === false).to.be.true;
        expect(moduleSource.source.hasNoDefaultLib === false).to.be.true;
        expect(moduleSource.source.languageVersion === ts.ScriptTarget.Latest).to.be.true;
        SourceMapGenerator.cleanSourceMapObject();
      }
    }
  });

  mocha.it('4-4: test processTransformedTsModuleRequest under reload debug', function () {
    this.rollup.hotReload();
    const modeMock = new ModuleModeMock(this.rollup);
    const allFiles = new Set<string>();
    scanFiles(MODULE_TEST_PATH, allFiles);
    for (const moduleId of allFiles.values()) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleInfo = new ModuleInfoMock(moduleId,
          this.rollup.share.projectConfig.entryModuleName,
          this.rollup.share.projectConfig.modulePath);
        moduleInfo.setImportedIdMaps();
        this.rollup.moduleInfos.push(moduleInfo);
        const metaInfo: object = moduleInfo[META];
        SourceMapGenerator.initInstance(this.rollup);
        modeMock.addModuleInfoItem(moduleId, false, '', metaInfo, this.moduleInfos);
        const sourceFile = ts.createSourceFile(moduleId, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        const moduleSource = new ModuleSourceFile(moduleId, sourceFile);
        ModuleSourceFile.processModuleSourceFiles(this.rollup);
        moduleSource.processTransformedTsModuleRequest(this.rollup);
        expect(moduleSource.source.fileName === moduleId).to.be.true;
        expect(moduleSource.source.text === code).to.be.true;
        expect(moduleSource.source.languageVariant === ts.LanguageVariant.Standard).to.be.true;
        expect(moduleSource.source.isDeclarationFile === false).to.be.true;
        expect(moduleSource.source.hasNoDefaultLib === false).to.be.true;
        expect(moduleSource.source.languageVersion === ts.ScriptTarget.Latest).to.be.true;
        SourceMapGenerator.cleanSourceMapObject();
      }
    }
  });

  mocha.it('5-1: test setProcessMock under LocalTest mode', function () {
    this.rollup.share.projectConfig.isPreview = true;
    this.rollup.share.projectConfig.isOhosTest = true;
    this.rollup.share.projectConfig.isLocalTest = true;
    this.rollup.share.projectConfig.mockParams = {
      decorator: "@MockSetup",
      packageName: "@ohos/hamock",
      etsSourceRootPath: "src/main",
      mockConfigPath: this.rollup.share.projectConfig.aceModuleRoot + '/mock/mock-config.json5',
    }
    ModuleSourceFile.setProcessMock(this.rollup);
    expect(ModuleSourceFile.needProcessMock).to.be.true;
  });

  mocha.it('5-2: test collectMockConfigInfo under LocalTest mode', function () {
    this.rollup.share.projectConfig.isLocalTest = true;
    this.rollup.share.projectConfig.mockParams = {
      decorator: "@MockSetup",
      packageName: "@ohos/hamock",
      etsSourceRootPath: "src/main",
      mockConfigPath: this.rollup.share.projectConfig.aceModuleRoot + '/mock/mock-config.json5',
    }
    ModuleSourceFile.collectMockConfigInfo(this.rollup);
    let EXPECT_MOCKFILES = [
      "src/mock/ohos/I18nMock.ts",
      "src/mock/ohos/bluetooth.mock.ts",
      "src/mock/module/calc.mock.ts",
      "src/mock/module/bigInt.mock.ts",
      "src/mock/native/libentry.mock.ts"
    ];
    expect(ModuleSourceFile.mockFiles).to.deep.equal(EXPECT_MOCKFILES);
  });

  mocha.it('5-3: test addMockConfig under LocalTest mode', function () {
    ModuleSourceFile.newMockConfigInfo = {
      "@ohos:i18n": {
        "source": "@bundle:com.example.demo/entry/src/mock/ohos/I18nMock"
      },
      "@ohos:bluetooth": {
        "source": "@bundle:com.example.demo/entry/src/mock/ohos/bluetooth.mock"
      },
      "@bundle:com.example.demo/entry/ets/calc": {
        "source": "@bundle:com.example.demo/entry/src/mock/module/calc.mock"
      },
      "@bundle:/testProjectRootPath/oh_modules/lib/dist/index.js": {
        "source": "@bundle:com.example.demo/entry/src/mock/module/bigInt.mock"
      },
      "@app:UtTestApplication/entry/entry": {
        "source": "@bundle:com.example.demo/entry/src/mock/native/libentry.mock"
      }
    };

    ModuleSourceFile.addMockConfig(ModuleSourceFile.newMockConfigInfo, "@ohos:i18n", "@bundle:com.example.demo/entry/src/mock/I18nMock");
    expect(ModuleSourceFile.newMockConfigInfo).to.deep.equal(ModuleSourceFile.newMockConfigInfo);
  });

  mocha.it('5-4: test generateNewMockInfo under LocalTest mode', function () {
    this.rollup.share.projectConfig.isLocalTest = true;
    ModuleSourceFile.mockConfigInfo = {
      "@ohos:i18n": {
        "source": "src/mock/ohos/I18nMock.ts"
      },
    }
    let originKey = "@ohos.i18n";
    let transKey = "@ohos:i18n";
    let importerFile = this.rollup.share.projectConfig.aceModuleRoot + '/mock/ohos/I18nMock.ts';
    ModuleSourceFile.generateNewMockInfo(originKey, transKey, this.rollup, importerFile);
    let EXPECT_NEW_MOCK_INFO = {
      "@ohos:i18n": {
        "source": "@bundle:com.example.demo/entry/src/mock/ohos/I18nMock"
      },
      "@ohos:bluetooth": {
        "source": "@bundle:com.example.demo/entry/src/mock/ohos/bluetooth.mock"
      },
      "@bundle:com.example.demo/entry/ets/calc": {
        "source": "@bundle:com.example.demo/entry/src/mock/module/calc.mock"
      },
      "@bundle:/testProjectRootPath/oh_modules/lib/dist/index.js": {
        "source": "@bundle:com.example.demo/entry/src/mock/module/bigInt.mock"
      },
      "@app:UtTestApplication/entry/entry": {
        "source": "@bundle:com.example.demo/entry/src/mock/native/libentry.mock"
      }
    };
    expect(ModuleSourceFile.newMockConfigInfo).to.deep.equal(EXPECT_NEW_MOCK_INFO);
  });


  mocha.it('5-5: test isMockFile under LocalTest mode', function () {
    ModuleSourceFile.needProcessMock = true;
    ModuleSourceFile.mockFiles = ["src/mock/ohos/I18nMock.ts"];
    let file = this.rollup.share.projectConfig.aceModuleRoot +'/mock/ohos/I18nMock.ts';
    expect(ModuleSourceFile.isMockFile(file, this.rollup)).to.be.true;
    ModuleSourceFile.needProcessMock = false;
  });

  mocha.it('5-6: test generateMockConfigFile under LocalTest mode', function () {
    this.rollup.share.projectConfig.isLocalTest = true;
    ModuleSourceFile.newMockConfigInfo = {
      "@ohos:i18n": {
        "source": "@bundle:com.example.demo/entry/src/mock/I18nMock"
      },
      "@ohos:bluetooth": {
        "source": "@bundle:com.example.demo/entry/src/mock/ohos/bluetooth.mock"
      },
      "@bundle:com.example.demo/entry/ets/calc": {
        "source": "@bundle:com.example.demo/entry/src/mock/module/calc.mock"
      },
      "@bundle:/testProjectRootPath/oh_modules/lib/dist/index.js": {
        "source": "@bundle:com.example.demo/entry/src/mock/module/bigInt.mock"
      },
      "@app:UtTestApplication/entry/entry": {
        "source": "@bundle:com.example.demo/entry/src/mock/native/libentry.mock"
      }
    }
    this.rollup.share.projectConfig.mockParams = {
      decorator: "@MockSetup",
      packageName: "@ohos/hamock",
      etsSourceRootPath: "src/main",
      mockConfigPath: this.rollup.share.projectConfig.aceModuleRoot + '/mock/mock-config.json5',
    }
    ModuleSourceFile.generateMockConfigFile(this.rollup);
    let EXPECT_MOCK_CONFIG_FILE = path.resolve(this.rollup.share.projectConfig.aceModuleJsonPath, `../mock-config.json`);
    expect(fs.existsSync(EXPECT_MOCK_CONFIG_FILE)).to.be.true;
    let EXPECT_MOCK_CONFIG_CONTENT = JSON.stringify(ModuleSourceFile.newMockConfigInfo);
    let ACTUAL_MOCK_CONFIG_CONTENT = JSON.stringify(require(EXPECT_MOCK_CONFIG_FILE));
    expect(EXPECT_MOCK_CONFIG_CONTENT).to.equal(ACTUAL_MOCK_CONFIG_CONTENT);
    fs.unlinkSync(this.rollup.share.projectConfig.cachePath + '/mock-config.json');
    fs.unlinkSync(this.rollup.share.projectConfig.cachePath + '/mock-config.json5');
  });

  mocha.it('6-1: test removePotentialMockConfigCache delete mock-config', function () {
    const transformedMockConfigCache: string =
      path.resolve(this.rollup.share.projectConfig.cachePath, `./${TRANSFORMED_MOCK_CONFIG}`);
    const userDefinedMockConfigCache: string =
      path.resolve(this.rollup.share.projectConfig.cachePath, `./${USER_DEFINE_MOCK_CONFIG}`);
    fs.writeFileSync(transformedMockConfigCache, '{}');
    fs.writeFileSync(userDefinedMockConfigCache, '{}');
    ModuleSourceFile.removePotentialMockConfigCache(this.rollup);
    expect(!fs.existsSync(transformedMockConfigCache)).to.be.true;
    expect(!fs.existsSync(userDefinedMockConfigCache)).to.be.true;
  });
});