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
import { newSourceMaps } from '../../../lib/fast_build/ark_compiler/transform';

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
  });

  mocha.it('1-1-2: test getOhmUrl under build debug: filePath exist', function () {
    this.rollup.build();
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
  });

  mocha.it('1-1-3: test getOhmUrl under build debug: harOhmUrl is not undefined', function () {
    this.rollup.build();
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
  });

  mocha.it('1-2: test getOhmUrl under build release', function () {
    this.rollup.build(RELEASE);
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
  });

  mocha.it('1-3: test getOhmUrl under preview debug', function () {
    this.rollup.preview();
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
  });

  mocha.it('1-4: test getOhmUrl under hot reload debug', function () {
    this.rollup.hotReload();
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
  });

  mocha.it('2-1: test processJsModuleRequest under build debug', function () {
    this.rollup.build();
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
  });

  mocha.it('2-2: test processJsModuleRequest under build release', function () {
    this.rollup.build(RELEASE);
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
  });

  mocha.it('2-3: test processJsModuleRequest under preview debug', function () {
    this.rollup.preview();
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
  });

  mocha.it('2-4: test processJsModuleRequest under hot reload debug', function () {
    this.rollup.hotReload();
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
  });

  mocha.it('3-1-1: test processTransformedJsModuleRequest under build debug: hasDynamicImport is false', function () {
    this.rollup.build();
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
  });

  mocha.it('3-1-2: test processTransformedJsModuleRequest under build debug: hasDynamicImport is true', async function () {
    this.rollup.build();
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
  });

  mocha.it('3-2: test processTransformedJsModuleRequest under build release', function () {
    this.rollup.build(RELEASE);
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
  });

  mocha.it('3-3: test processTransformedJsModuleRequest under preview debug', function () {
    this.rollup.preview();
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
  });

  mocha.it('3-4: test processTransformedJsModuleRequest under hot reload debug', function () {
    this.rollup.hotReload();
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
  });

  mocha.it('4-1: test processTransformedTsModuleRequest under build debug', function () {
    this.rollup.build();
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
      }
    }
  });
});