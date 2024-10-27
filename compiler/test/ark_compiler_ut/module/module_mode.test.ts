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
import sinon from 'sinon';
import fs from 'fs';
import childProcess from 'child_process';
import cluster from 'cluster';

import { toUnixPath } from '../../../lib/utils';
import { SourceMapGenerator } from '../../../lib/fast_build/ark_compiler/generate_sourcemap';
import { shouldETSOrTSFileTransformToJS } from '../../../lib/fast_build/ark_compiler/utils';
import {
  RELEASE,
  DEBUG,
  MODULES_ABC,
  EXTNAME_TS,
  EXTNAME_JS,
  EXTNAME_ETS,
  OH_MODULES,
  GEN_ABC_PLUGIN_NAME
} from '../../../lib/fast_build/ark_compiler/common/ark_define';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import ModuleModeMock from '../mock/class_mock/module_mode_mock';
import { ModuleHotreloadMode } from '../../../lib/fast_build/ark_compiler/module/module_hotreload_mode';
import { ModuleMode } from '../../../lib/fast_build/ark_compiler/module/module_mode';
import {
  ENTRYABILITY_TS_PATH_DEFAULT,
  ENTRYABILITY_JS_PATH_DEFAULT,
  INDEX_ETS_PATH_DEFAULT,
  INDEX_JS_PATH_DEFAULT,
  ENTRYABILITY_TS_RECORDNAME,
  ENTRYABILITY_JS_RECORDNAME,
  INDEX_ETS_RECORDNAME,
  ENTRYABILITY_TS_NORMALIZED_RECORDNAME,
  ENTRYABILITY_JS_NORMALIZED_RECORDNAME,
  INDEX_ETS_NORMALIZED_RECORDNAME,
  PKG_MODULES,
  ENTRY_MODULE_NAME_DEFAULT,
  TEST,
  NEWFILE,
  ENTRY_MODULE_VERSION_DEFAULT
} from '../mock/rollup_mock/common';
import projectConfig from '../utils/processProjectConfig';
import {
  EXPECT_SOURCEMAP_JSON,
  PKG_MODULES_OHPM_HYPIUM,
  ES2ABC_PATH,
  DEBUG_INFO,
  BUILD_NPM,
  BUILD_INFO,
  PREVIEW_DEBUG_INFO,
  PREVIEW_DEBUG_NPM,
  DEFAULT_ETS,
  PREVIEW_MODULES_ABC,
  BUILD_CACHE,
  PREVIEW_DEBUG_CACHE,
  TEST_TS,
  ENTRY_LIST,
  OUTPUT,
  FILE_THREADS,
  MERGE_ABC,
  CACHE_FILE,
  TARGET_API_VERSION
} from '../mock/rollup_mock/path_config';
import {
  scanFiles,
  sleep,
  cpus
} from "../utils/utils";
import { AOT_FULL } from '../../../lib/pre_define';
import {
  ArkObfuscator
} from 'arkguard';

function checkGenerateEs2AbcCmdExpect(cmdArgs: Array<object>, compatibleSdkVersion: string, byteCodeHar: boolean): void {
  const fileThreads: number = cpus();

  expect(cmdArgs[0].indexOf(ES2ABC_PATH) > 0).to.be.true;
  if (!byteCodeHar) {
    expect(cmdArgs[1] === OUTPUT).to.be.true;
    expect(cmdArgs[2] === FILE_THREADS).to.be.true;
    expect(cmdArgs[3] === `\"${fileThreads}\"`).to.be.true;
    expect(cmdArgs[4] === MERGE_ABC).to.be.true;
    expect(cmdArgs[5].indexOf(compatibleSdkVersion) > 0).to.be.true;
  }
  expect(cmdArgs[1] === ENTRY_LIST).to.be.true;
  expect(cmdArgs[2] === OUTPUT).to.be.true;
  expect(cmdArgs[3] === FILE_THREADS).to.be.true;
  expect(cmdArgs[4] === `\"${fileThreads}\"`).to.be.true;
  expect(cmdArgs[5] === MERGE_ABC).to.be.true;
  expect(cmdArgs[6].indexOf(compatibleSdkVersion) > 0).to.be.true;
}

mocha.describe('test module_mode file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test collectModuleFileList under build debug', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    const fileList = this.rollup.getModuleIds();
    for (const filePath of fileList) {
      if (filePath.endsWith(EXTNAME_JS) || filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS)) {
        const moduleInfo = this.rollup.getModuleInfo(filePath);
        moduleInfo.setIsNodeEntryFile(true);
        moduleInfo.setIsLocalDependency(false);
      }
    }
    moduleMode.projectConfig.packageDir = OH_MODULES;
    moduleMode.collectModuleFileListMock(this.rollup);
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_RECORDNAME) > 0).to.be.true;

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT.substring(1)) > 0).to.be.true;
    });
    expect(moduleMode.pkgEntryInfos.size != 0).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-2: test collectModuleFileList under build release', function () {
    this.rollup.build(RELEASE);
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    const fileList = this.rollup.getModuleIds();
    for (const filePath of fileList) {
      if (filePath.endsWith(EXTNAME_JS) || filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS)) {
        const moduleInfo = this.rollup.getModuleInfo(filePath);
        moduleInfo.setIsNodeEntryFile(true);
        moduleInfo.setIsLocalDependency(false);
      }
    }
    moduleMode.projectConfig.packageDir = OH_MODULES;
    moduleMode.collectModuleFileListMock(this.rollup);
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_RECORDNAME) > 0).to.be.true;

        expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT.substring(1)) > 0).to.be.true;
    });
    expect(moduleMode.pkgEntryInfos.size != 0).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-3: test collectModuleFileList under preview debug', function () {
    this.rollup.preview();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    const fileList = this.rollup.getModuleIds();
    for (const filePath of fileList) {
      if (filePath.endsWith(EXTNAME_JS) || filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS)) {
        const moduleInfo = this.rollup.getModuleInfo(filePath);
        moduleInfo.setIsNodeEntryFile(true);
        moduleInfo.setIsLocalDependency(false);
      }
    }
    moduleMode.projectConfig.packageDir = OH_MODULES;
    moduleMode.collectModuleFileListMock(this.rollup);
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_RECORDNAME) > 0).to.be.true;

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT.substring(1)) > 0).to.be.true;
    });
    expect(moduleMode.pkgEntryInfos.size != 0).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-4: test collectModuleFileList under hot reload debug', function () {
    this.rollup.hotReload();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    const fileList = this.rollup.getModuleIds();
    for (const filePath of fileList) {
      if (filePath.endsWith(EXTNAME_JS) || filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS)) {
        const moduleInfo = this.rollup.getModuleInfo(filePath);
        moduleInfo.setIsNodeEntryFile(true);
        moduleInfo.setIsLocalDependency(false);
      }
    }
    moduleMode.projectConfig.packageDir = OH_MODULES;
    moduleMode.collectModuleFileListMock(this.rollup);
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_RECORDNAME) > 0).to.be.true;

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT.substring(1)) > 0).to.be.true;
    });
    expect(moduleMode.pkgEntryInfos.size != 0).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-5: test collectModuleFileList useNormalizedOHMUrl under build debug', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.useNormalizedOHMUrl();
    this.rollup.share.projectConfig.pkgContextInfo = {
      'entry': {
        'packageName': 'entry',
        'bundleName': '',
        'moduleName': '',
        'version': '',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    };
    const moduleMode = new ModuleModeMock(this.rollup);
    const fileList = this.rollup.getModuleIds();
    for (const filePath of fileList) {
      if (filePath.endsWith(EXTNAME_JS) || filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS)) {
        const moduleInfo = this.rollup.getModuleInfo(filePath);
        moduleInfo.setIsNodeEntryFile(true);
        moduleInfo.setIsLocalDependency(false);
        moduleInfo.meta.pkgName = 'entry';
      }
    }
    moduleMode.projectConfig.packageDir = OH_MODULES;
    moduleMode.collectModuleFileListMock(this.rollup);
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_NORMALIZED_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_NORMALIZED_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_NORMALIZED_RECORDNAME) > 0).to.be.true;

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT.substring(1)) > 0).to.be.true;
    });
    expect(moduleMode.pkgEntryInfos.size == 7).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-6: test collectModuleFileList useNormalizedOHMUrl under build release', function () {
    this.rollup.build(RELEASE);
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.useNormalizedOHMUrl();
    this.rollup.share.projectConfig.pkgContextInfo = {
      'entry': {
        'packageName': 'entry',
        'bundleName': '',
        'moduleName': '',
        'version': '',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    };
    const moduleMode = new ModuleModeMock(this.rollup);
    const fileList = this.rollup.getModuleIds();
    for (const filePath of fileList) {
      if (filePath.endsWith(EXTNAME_JS) || filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS)) {
        const moduleInfo = this.rollup.getModuleInfo(filePath);
        moduleInfo.setIsNodeEntryFile(true);
        moduleInfo.setIsLocalDependency(false);
        moduleInfo.meta.pkgName = 'entry';
      }
    }
    moduleMode.projectConfig.packageDir = OH_MODULES;
    moduleMode.collectModuleFileListMock(this.rollup);
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_NORMALIZED_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_NORMALIZED_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_NORMALIZED_RECORDNAME) > 0).to.be.true;

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT.substring(1)) > 0).to.be.true;
    });
    expect(moduleMode.pkgEntryInfos.size == 7).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-7: test collectModuleFileList useNormalizedOHMUrl under preview debug', function () {
    this.rollup.preview();
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.useNormalizedOHMUrl();
    this.rollup.share.projectConfig.pkgContextInfo = {
      'entry': {
        'packageName': 'entry',
        'bundleName': '',
        'moduleName': '',
        'version': '',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    };
    const moduleMode = new ModuleModeMock(this.rollup);
    const fileList = this.rollup.getModuleIds();
    for (const filePath of fileList) {
      if (filePath.endsWith(EXTNAME_JS) || filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS)) {
        const moduleInfo = this.rollup.getModuleInfo(filePath);
        moduleInfo.setIsNodeEntryFile(true);
        moduleInfo.setIsLocalDependency(false);
        moduleInfo.meta.pkgName = 'entry';
      }
    }
    moduleMode.projectConfig.packageDir = OH_MODULES;
    moduleMode.collectModuleFileListMock(this.rollup);
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_NORMALIZED_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_NORMALIZED_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_NORMALIZED_RECORDNAME) > 0).to.be.true;

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT.substring(1)) > 0).to.be.true;
    });
    expect(moduleMode.pkgEntryInfos.size == 7).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-8: test collectModuleFileList useNormalizedOHMUrl under hot reload debug', function () {
    this.rollup.hotReload();
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.useNormalizedOHMUrl();
    this.rollup.share.projectConfig.pkgContextInfo = {
      'entry': {
        'packageName': 'entry',
        'bundleName': '',
        'moduleName': '',
        'version': '',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    };
    const moduleMode = new ModuleModeMock(this.rollup);
    const fileList = this.rollup.getModuleIds();
    for (const filePath of fileList) {
      if (filePath.endsWith(EXTNAME_JS) || filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS)) {
        const moduleInfo = this.rollup.getModuleInfo(filePath);
        moduleInfo.setIsNodeEntryFile(true);
        moduleInfo.setIsLocalDependency(false);
        moduleInfo.meta.pkgName = 'entry';
      }
    }
    moduleMode.projectConfig.packageDir = OH_MODULES;
    moduleMode.collectModuleFileListMock(this.rollup);
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_NORMALIZED_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_NORMALIZED_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_NORMALIZED_RECORDNAME) > 0).to.be.true;

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT.substring(1)) > 0).to.be.true;
    });
    expect(moduleMode.pkgEntryInfos.size == 7).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-1-1: test addModuleInfoItem under build debug: isPackageModulesFile`s return is true', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.share.projectConfig.modulePath = this.rollup.share.projectConfig.projectPath;
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.projectConfig.packageDir = ENTRY_MODULE_NAME_DEFAULT;
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.moduleInfos.forEach(value => {
      expect(value.packageName === PKG_MODULES).to.be.true;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-1-2: test addModuleInfoItem under build debug: isPackageModulesFile`s return is false', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.cacheFilePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_RECORDNAME) > 0).to.be.true;

        expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT.substring(1)) > 0).to.be.true;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-1-3: test addModuleInfoItem under build debug: extName is not null', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, EXTNAME_TS);
    moduleMode.moduleInfos.forEach(value => {
      expect(value.cacheFilePath.endsWith(EXTNAME_TS)).to.be.true;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-2: test addModuleInfoItem under build release', function () {
    this.rollup.build(RELEASE);
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.cacheFilePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_RECORDNAME) > 0).to.be.true;

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT.substring(1)) > 0).to.be.true;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-3: test addModuleInfoItem under preview debug', function () {
    this.rollup.preview();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.cacheFilePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_RECORDNAME) > 0).to.be.true;

        expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT.substring(1)) > 0).to.be.true;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-4: test addModuleInfoItem under hot reload debug', function () {
    this.rollup.hotReload();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.cacheFilePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_RECORDNAME) > 0).to.be.true;

        expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_JS_PATH_DEFAULT.substring(1)) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT.substring(1)) > 0).to.be.true;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-5-1: test addModuleInfoItem under build debug: sourceFile equals sourcemap new key', function () {
    this.rollup.build();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    const moduleInfosAndSourceMap= ModuleModeMock.getModuleInfosAndSourceMapMock(this.rollup, sourceMapGenerator);
    moduleInfosAndSourceMap.moduleInfos.forEach(value => {
      expect(moduleInfosAndSourceMap.sourceMap[value.sourceFile]).to.exist;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-5-2: test addModuleInfoItem under build release: sourceFile equals sourcemap new key', function () {
    this.rollup.build(RELEASE);
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    const moduleInfosAndSourceMap= ModuleModeMock.getModuleInfosAndSourceMapMock(this.rollup, sourceMapGenerator);
    moduleInfosAndSourceMap.moduleInfos.forEach(value => {
      expect(moduleInfosAndSourceMap.sourceMap[value.sourceFile]).to.exist;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-5-3: test addModuleInfoItem under preview debug: sourceFile equals sourcemap new key', function () {
    this.rollup.preview();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    const moduleInfosAndSourceMap= ModuleModeMock.getModuleInfosAndSourceMapMock(this.rollup, sourceMapGenerator);
    moduleInfosAndSourceMap.moduleInfos.forEach(value => {
      expect(moduleInfosAndSourceMap.sourceMap[value.sourceFile]).to.exist;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-5-4: test addModuleInfoItem under hot reload debug: sourceFile equals sourcemap new key', function () {
    this.rollup.hotReload();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    const moduleInfosAndSourceMap = ModuleModeMock.getModuleInfosAndSourceMapMock(this.rollup, sourceMapGenerator);
    moduleInfosAndSourceMap.moduleInfos.forEach(value => {
      expect(moduleInfosAndSourceMap.sourceMap[value.sourceFile]).to.exist;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-6-1: test addModuleInfoItem under build debug: sourceFile equals sourcemap old key', function () {
    this.rollup.build();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    sourceMapGenerator.setNewSoureMaps(false);
    const moduleInfosAndSourceMap= ModuleModeMock.getModuleInfosAndSourceMapMock(this.rollup, sourceMapGenerator);
    moduleInfosAndSourceMap.moduleInfos.forEach(value => {
      expect(moduleInfosAndSourceMap.sourceMap[value.sourceFile]).to.exist;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-6-2: test addModuleInfoItem under build release: sourceFile equals sourcemap old key', function () {
    this.rollup.build(RELEASE);
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    sourceMapGenerator.setNewSoureMaps(false);
    const moduleInfosAndSourceMap= ModuleModeMock.getModuleInfosAndSourceMapMock(this.rollup, sourceMapGenerator);
    moduleInfosAndSourceMap.moduleInfos.forEach(value => {
      expect(moduleInfosAndSourceMap.sourceMap[value.sourceFile]).to.exist;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-6-3: test addModuleInfoItem under preview debug: sourceFile equals sourcemap old key', function () {
    this.rollup.preview();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    sourceMapGenerator.setNewSoureMaps(false);
    const moduleInfosAndSourceMap= ModuleModeMock.getModuleInfosAndSourceMapMock(this.rollup, sourceMapGenerator);
    moduleInfosAndSourceMap.moduleInfos.forEach(value => {
      expect(moduleInfosAndSourceMap.sourceMap[value.sourceFile]).to.exist;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-6-4: test addModuleInfoItem under hot reload debug: sourceFile equals sourcemap old key', function () {
    this.rollup.hotReload();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    sourceMapGenerator.setNewSoureMaps(false);
    const moduleInfosAndSourceMap= ModuleModeMock.getModuleInfosAndSourceMapMock(this.rollup, sourceMapGenerator);
    moduleInfosAndSourceMap.moduleInfos.forEach(value => {
      expect(moduleInfosAndSourceMap.sourceMap[value.sourceFile]).to.exist;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-7-1: test addModuleInfoItem under build release with obfuscatedEnabled and isPackageModulesFile`s return is true', function () {
    this.rollup.build(RELEASE);
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    sourceMapGenerator.setNewSoureMaps(true);

    this.rollup.share.projectConfig = {
      buildMode: 'Release'
    }
    this.rollup.share.projectConfig.obfuscationMergedObConfig = {
      options: {
        enableFileNameObfuscation: true
      }
    };
    this.rollup.share.projectConfig.modulePath = this.rollup.share.projectConfig.projectPath;
    
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.projectConfig.packageDir = ENTRY_MODULE_NAME_DEFAULT;
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');

    let index = 0;
    moduleMode.moduleInfos.forEach(moduleInfo => {
      if (index === 1) {
        expect(moduleInfo.sourceFile == 'entry|entry|1.0.0|src/main/entryability/EntryAbility.js').to.be.true;
        expect(moduleInfo.recordName == 'pkg_modules/src/main/pkg_modulesability/EntryAbility').to.be.true;
        expect(moduleInfo.packageName === PKG_MODULES).to.be.true;
        expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0).to.be.true;
        expect(moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0).to.be.true;
      }
      if (index === 2) {
        expect(moduleInfo.sourceFile == 'entry|entry|1.0.0|src/main/pages/Index.js').to.be.true;
        expect(moduleInfo.recordName == 'pkg_modules/src/main/pages/Index').to.be.true;
        expect(moduleInfo.packageName === PKG_MODULES).to.be.true;
        expect(moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;
        expect(moduleInfo.cacheFilePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;
      }
      index++;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-7-2: test addModuleInfoItem under build release with obfuscatedEnabled and isPackageModulesFile`s return is true and old key', function () {
    this.rollup.build(RELEASE);
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    sourceMapGenerator.setNewSoureMaps(false);

    this.rollup.share.projectConfig = {
      buildMode: 'Release'
    }
    this.rollup.share.projectConfig.obfuscationMergedObConfig = {
      options: {
        enableFileNameObfuscation: true
      }
    };
    this.rollup.share.projectConfig.modulePath = this.rollup.share.projectConfig.projectPath;

    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.projectConfig.packageDir = ENTRY_MODULE_NAME_DEFAULT;
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');

    let index = 0;
    moduleMode.moduleInfos.forEach(moduleInfo => {
      if (index === 1) {
        expect(moduleInfo.sourceFile == 'entry/build/entry/src/main/entryability/EntryAbility.ts').to.be.true;
        expect(moduleInfo.recordName == 'pkg_modules/src/main/pkg_modulesability/EntryAbility').to.be.true;
        expect(moduleInfo.packageName === PKG_MODULES).to.be.true;
        expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0).to.be.true;
        expect(moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0).to.be.true;
      }
      if (index === 2) {
        expect(moduleInfo.sourceFile == 'entry/build/entry/src/main/pages/Index.ets').to.be.true;
        expect(moduleInfo.recordName == 'pkg_modules/src/main/pages/Index').to.be.true;
        expect(moduleInfo.packageName === PKG_MODULES).to.be.true;
        expect(moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;
        expect(moduleInfo.cacheFilePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;
      }
      index++;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-7-3: test addModuleInfoItem under build release with obfuscatedEnabled and isPackageModulesFile`s return is false', function () {
    this.rollup.build(RELEASE);
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    sourceMapGenerator.setNewSoureMaps(true);

    this.rollup.share.projectConfig = {
      buildMode: 'Release'
    }
    this.rollup.share.projectConfig.obfuscationMergedObConfig = {
      options: {
        enableFileNameObfuscation: true
      }
    };

    const arkguardConfig = {
      mRenameFileName: {
        mEnable: true,
        mNameGeneratorType: 1,
        mReservedFileNames: [
          "entry",
          "src",
          "main"
        ]
      },
      mPerformancePrinter: []
    }

    let arkObfuscator: ArkObfuscator = new ArkObfuscator();
    arkObfuscator.init(arkguardConfig);

    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');

    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.packageName === 'entry').to.be.true;
      expect(/.*entry\|entry\|1\.0\.0\|src\/main\/[a-z]\/[a-z]\.(js|ts|ets).*/.test(moduleInfo.sourceFile)).to.be.true;
      expect(/.*\/entry\/src\/main\/[a-z]\/[a-z].*/.test(moduleInfo.recordName)).to.be.true;
      expect(/.*\/src\/main\/[a-z]\/[a-z]\.(js|ts|ets).*/.test(moduleInfo.filePath)).to.be.true;
      expect(/.*\/src\/main\/[a-z]\/[a-z]\.(js|ts|ets).*/.test(moduleInfo.cacheFilePath)).to.be.true;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-7-4: test addModuleInfoItem under build release with obfuscatedEnabled and isPackageModulesFile`s return is false and old key', function () {
    this.rollup.build(RELEASE);
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    sourceMapGenerator.setNewSoureMaps(false);

    this.rollup.share.projectConfig = {
      buildMode: 'Release'
    }
    this.rollup.share.projectConfig.obfuscationMergedObConfig = {
      options: {
        enableFileNameObfuscation: true
      }
    };

    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');

    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.packageName === 'entry').to.be.true;
      expect(/.*\/src\/main\/[a-z]\/[a-z]\.(js|ts|ets).*/.test(moduleInfo.sourceFile)).to.be.true;
      expect(/.*\/entry\/src\/main\/[a-z]\/[a-z].*/.test(moduleInfo.recordName)).to.be.true;
      expect(/.*\/src\/main\/[a-z]\/[a-z]\.(js|ts|ets).*/.test(moduleInfo.filePath)).to.be.true;
      expect(/.*\/src\/main\/[a-z]\/[a-z]\.(js|ts|ets).*/.test(moduleInfo.cacheFilePath)).to.be.true;
    });
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-1-1: test updateCachedSourceMaps under build debug: cacheSourceMapPath not exist', function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.cacheSourceMapPath = '';

    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    sourceMapGenerator.updateSourceMap(path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT), {});
    sourceMapGenerator.updateSourceMap(path.join(this.rollup.share.projectConfig.modulePath, INDEX_ETS_PATH_DEFAULT), {});

    let cacheSourceMapObject = sourceMapGenerator.updateCachedSourceMaps();
    sourceMapGenerator.setNewSoureMaps(false);
    for (const key in cacheSourceMapObject) {
      expect(sourceMapGenerator.getSourceMap(key) === cacheSourceMapObject[key]).to.be.true;
    }

    let newSourceMaps = sourceMapGenerator.getSourceMaps();
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-1-2: test updateCachedSourceMaps under build debug: compileFileList has not sourceFileAbsolutePath', function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.cacheSourceMapPath = EXPECT_SOURCEMAP_JSON;

    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    sourceMapGenerator.updateSourceMap(path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT), { FILE: '' });
    sourceMapGenerator.updateSourceMap(path.join(this.rollup.share.projectConfig.modulePath, INDEX_ETS_PATH_DEFAULT), { FILE: '' });

    let cacheSourceMapObject = sourceMapGenerator.updateCachedSourceMaps();
    sourceMapGenerator.setNewSoureMaps(false);
    for (const key in cacheSourceMapObject) {
      expect(sourceMapGenerator.getSourceMap(key) === cacheSourceMapObject[key]).to.be.true;
    }

    sourceMapGenerator.updateSourceMap(path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT), { FILE: TEST });
    cacheSourceMapObject = sourceMapGenerator.updateCachedSourceMaps();
    sourceMapGenerator.setNewSoureMaps(false);
    for (const key in cacheSourceMapObject) {
      expect(sourceMapGenerator.getSourceMap(key) === cacheSourceMapObject[key]).to.be.true;
    }

    sourceMapGenerator.updateSourceMap(path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT), { FILE: TEST, NEWFILE: NEWFILE });
    cacheSourceMapObject = sourceMapGenerator.updateCachedSourceMaps();
    sourceMapGenerator.setNewSoureMaps(false);
    for (const key in cacheSourceMapObject) {
      expect(sourceMapGenerator.getSourceMap(key) === cacheSourceMapObject[key]).to.be.true;
    }

    let newSourceMaps = sourceMapGenerator.getSourceMaps();
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-2: test updateCachedSourceMaps under build release', function () {
    this.rollup.build(RELEASE);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.cacheSourceMapPath = '';

    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    sourceMapGenerator.updateSourceMap(path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT), {});
    sourceMapGenerator.updateSourceMap(path.join(this.rollup.share.projectConfig.modulePath, INDEX_ETS_PATH_DEFAULT), {});

    let cacheSourceMapObject = sourceMapGenerator.updateCachedSourceMaps();
    sourceMapGenerator.setNewSoureMaps(false);
    for (const key in cacheSourceMapObject) {
      expect(sourceMapGenerator.getSourceMap(key) === cacheSourceMapObject[key]).to.be.true;
    }

    let newSourceMaps = sourceMapGenerator.getSourceMaps();
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-3: test updateCachedSourceMaps under preview debug', function () {
    this.rollup.preview();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.cacheSourceMapPath = '';

    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    sourceMapGenerator.updateSourceMap(path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT), {});
    sourceMapGenerator.updateSourceMap(path.join(this.rollup.share.projectConfig.modulePath, INDEX_ETS_PATH_DEFAULT), {});

    let cacheSourceMapObject = sourceMapGenerator.updateCachedSourceMaps();
    sourceMapGenerator.setNewSoureMaps(false);
    for (const key in cacheSourceMapObject) {
      expect(sourceMapGenerator.getSourceMap(key) === cacheSourceMapObject[key]).to.be.true;
    }

    let newSourceMaps = sourceMapGenerator.getSourceMaps();
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-4: test updateCachedSourceMaps under hot reload debug', function () {
    this.rollup.hotReload();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.cacheSourceMapPath = '';
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    sourceMapGenerator.updateSourceMap(path.join(this.rollup.share.projectConfig.modulePath, INDEX_ETS_PATH_DEFAULT), {});
    sourceMapGenerator.updateSourceMap(path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT), {});

    let cacheSourceMapObject = sourceMapGenerator.updateCachedSourceMaps();
    sourceMapGenerator.setNewSoureMaps(false);
    for (const key in cacheSourceMapObject) {
      expect(sourceMapGenerator.getSourceMap(key) === cacheSourceMapObject[key]).to.be.true;
    }

    let newSourceMaps = sourceMapGenerator.getSourceMaps();
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-5: test updateCachedSourceMaps when ets(ts) file is transformed to js file', function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.cacheSourceMapPath = '';

    let prefix = `${ENTRY_MODULE_NAME_DEFAULT}|${ENTRY_MODULE_NAME_DEFAULT}|${ENTRY_MODULE_VERSION_DEFAULT}|`;
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId: string = path.join(this.rollup.share.projectConfig.modulePath, INDEX_ETS_PATH_DEFAULT);
    sourceMapGenerator.updateSourceMap(moduleId, {});

    let cacheSourceMapObject = sourceMapGenerator.updateCachedSourceMaps();
    if (shouldETSOrTSFileTransformToJS(moduleId, moduleMode.projectConfig)) {
      expect(prefix + INDEX_JS_PATH_DEFAULT.substring(1) in cacheSourceMapObject).to.be.true;
    } else {
      expect(prefix + INDEX_ETS_PATH_DEFAULT.substring(1) in cacheSourceMapObject).to.be.true;
    }

    moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    sourceMapGenerator.updateSourceMap(moduleId, {});
    cacheSourceMapObject = sourceMapGenerator.updateCachedSourceMaps();
    if (shouldETSOrTSFileTransformToJS(moduleId, moduleMode.projectConfig)) {
      expect(prefix + ENTRYABILITY_JS_PATH_DEFAULT.substring(1) in cacheSourceMapObject).to.be.true;
    } else {
      expect(prefix + ENTRYABILITY_JS_PATH_DEFAULT.substring(1) in cacheSourceMapObject).to.be.true;
    }

    let newSourceMaps = sourceMapGenerator.getSourceMaps();
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
    SourceMapGenerator.cleanSourceMapObject();
  })

  mocha.it('4-1: test generateCompileFilesInfo under build debug', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateCompileFilesInfoMock(false);
    expect(moduleMode.checkGenerateCompileFilesInfo(false) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('4-2: test generateCompileFilesInfo under build release', function () {
    this.rollup.build(RELEASE);
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateCompileFilesInfoMock(false);
    expect(moduleMode.checkGenerateCompileFilesInfo(false) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('4-3: test generateCompileFilesInfo under preview debug', function () {
    this.rollup.preview();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateCompileFilesInfoMock(false);
    expect(moduleMode.checkGenerateCompileFilesInfo(false) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('4-4: test generateCompileFilesInfo under hot reload debug', function () {
    this.rollup.hotReload();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateCompileFilesInfoMock(false);
    expect(moduleMode.checkGenerateCompileFilesInfo(false) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('4-5: test generateCompileFilesInfo under exist abcPaths', function () {
    this.rollup.hotReload();
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.share.projectConfig.byteCodeHarInfo = {
      'har': {
        'abcPath': 'module.abc'
      }
    };
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateCompileFilesInfoMock(true);
    expect(moduleMode.checkGenerateCompileFilesInfo(true) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('4-6: test generateCompileFilesInfo under hot reload debug incremental', function () {
    this.rollup.hotReload();
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.share.projectConfig.byteCodeHarInfo = {
      'har': {
        'abcPath': 'module.abc'
      }
    };
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateCompileFilesInfoMock(false);
    expect(moduleMode.checkGenerateCompileFilesInfo(false) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('5-1: test generateNpmEntriesInfo under build debug', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateNpmEntriesInfoMock();
    expect(moduleMode.checkGenerateNpmEntriesInfo() === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('5-2: test generateNpmEntriesInfo under build release', function () {
    this.rollup.build(RELEASE);
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateNpmEntriesInfoMock();
    expect(moduleMode.checkGenerateNpmEntriesInfo() === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('5-3: test generateNpmEntriesInfo under preview debug', function () {
    this.rollup.preview();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateNpmEntriesInfoMock();
    expect(moduleMode.checkGenerateNpmEntriesInfo() === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('5-4: test generateNpmEntriesInfo under hot reload debug', function () {
    this.rollup.hotReload();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateNpmEntriesInfoMock();
    expect(moduleMode.checkGenerateNpmEntriesInfo() === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('6-1: test generateAbcCacheFilesInfo under build debug', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateAbcCacheFilesInfoMock();
    expect(moduleMode.checkGenerateAbcCacheFilesInfo() === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('6-2: test generateAbcCacheFilesInfo under build release', function () {
    this.rollup.build(RELEASE);
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateAbcCacheFilesInfoMock();
    expect(moduleMode.checkGenerateAbcCacheFilesInfo() === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('6-3: test generateAbcCacheFilesInfo under preview debug', function () {
    this.rollup.preview();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateAbcCacheFilesInfoMock();
    expect(moduleMode.checkGenerateAbcCacheFilesInfo() === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('6-4: test generateAbcCacheFilesInfo under hot reload debug', function () {
    this.rollup.hotReload();
    SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateAbcCacheFilesInfoMock();
    expect(moduleMode.checkGenerateAbcCacheFilesInfo() === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
 });

  mocha.it('7-1: test getPackageEntryInfo under build debug', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.checkGetPackageEntryInfo(this.rollup);
    expect(moduleMode.pkgEntryInfos.size !== 0).to.be.true;
  });

  mocha.it('7-2: test getPackageEntryInfo under build release', function () {
    this.rollup.build(RELEASE);
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.checkGetPackageEntryInfo(this.rollup);
    expect(moduleMode.pkgEntryInfos.size !== 0).to.be.true;
  });

  mocha.it('7-3: test getPackageEntryInfo under preview debug', function () {
    this.rollup.preview();
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.checkGetPackageEntryInfo(this.rollup);
    expect(moduleMode.pkgEntryInfos.size !== 0).to.be.true;
  });

  mocha.it('7-4: test getPackageEntryInfo under hot reload debug', function () {
    this.rollup.hotReload();
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.checkGetPackageEntryInfo(this.rollup);
    expect(moduleMode.pkgEntryInfos.size !== 0).to.be.true;
  });

  mocha.it('7-5: test the error message of getPackageEntryInfo under build debug', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const moduleMode = new ModuleModeMock(this.rollup);
    const stub = sinon.stub(this.rollup.share.getLogger(GEN_ABC_PLUGIN_NAME), 'debug');
    const isTestErrorLog = true;
    try {
      moduleMode.checkGetPackageEntryInfo(this.rollup, isTestErrorLog);
    } catch (e) {
    }
    expect(stub.calledWith("ArkTS:INTERNAL ERROR: Failed to get 'pkgPath' from metaInfo. File: ")).to.be.true;
    stub.restore();
  });

  mocha.it('7-6: test the error message of getPackageEntryInfo under build release', function () {
    this.rollup.build(RELEASE);
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const moduleMode = new ModuleModeMock(this.rollup);
    const stub = sinon.stub(this.rollup.share.getLogger(GEN_ABC_PLUGIN_NAME), 'debug');
    const isTestErrorLog = true;
    try {
      moduleMode.checkGetPackageEntryInfo(this.rollup, isTestErrorLog);
    } catch (e) {
    }
    expect(stub.calledWith("ArkTS:INTERNAL ERROR: Failed to get 'pkgPath' from metaInfo. File: ")).to.be.true;
    stub.restore();
  });

  mocha.it('7-7: test the error message of getPackageEntryInfo under preview debug', function () {
    this.rollup.preview();
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const moduleMode = new ModuleModeMock(this.rollup);
    const stub = sinon.stub(this.rollup.share.getLogger(GEN_ABC_PLUGIN_NAME), 'debug');
    const isTestErrorLog = true;
    try {
      moduleMode.checkGetPackageEntryInfo(this.rollup, isTestErrorLog);
    } catch (e) {
    }
    expect(stub.calledWith("ArkTS:INTERNAL ERROR: Failed to get 'pkgPath' from metaInfo. File: ")).to.be.true;
    stub.restore();
  });

  mocha.it('7-8: test the error message of getPackageEntryInfo under hot reload debug', function () {
    this.rollup.hotReload();
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const moduleMode = new ModuleModeMock(this.rollup);
    const stub = sinon.stub(this.rollup.share.getLogger(GEN_ABC_PLUGIN_NAME), 'debug');
    const isTestErrorLog = true;
    try {
      moduleMode.checkGetPackageEntryInfo(this.rollup, isTestErrorLog);
    } catch (e) {
    }
    expect(stub.calledWith("ArkTS:INTERNAL ERROR: Failed to get 'pkgPath' from metaInfo. File: ")).to.be.true;
    stub.restore();
  });

  mocha.it('8-1: test buildModuleSourceMapInfo under build debug', async function () {
    this.rollup.build();
    const sourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.buildModuleSourceMapInfoMock(sourceMapGenerator);
    await sleep(1000);
    expect(moduleMode.checkModuleSourceMapInfoMock() === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('8-2: test buildModuleSourceMapInfo under build release', async function () {
    this.rollup.build(RELEASE);
    const sourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.buildModuleSourceMapInfoMock(sourceMapGenerator);
    await sleep(1000);
    expect(moduleMode.checkModuleSourceMapInfoMock() === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('8-3: test buildModuleSourceMapInfo under preview debug', async function () {
    this.rollup.preview();
    const sourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.buildModuleSourceMapInfoMock(sourceMapGenerator);
    await sleep(1000);
    expect(moduleMode.checkModuleSourceMapInfoMock() === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('8-4: test buildModuleSourceMapInfo under hot reload debug', async function () {
    this.rollup.hotReload();
    const sourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.buildModuleSourceMapInfoMock(sourceMapGenerator);
    await sleep(1000);
    expect(moduleMode.checkModuleSourceMapInfoMock() === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('8-5: test the error message of buildModuleSourceMapInfo under build debug', async function () {
    this.rollup.build();
    const sourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    const stub = sinon.stub(sourceMapGenerator, 'throwArkTsCompilerError');
    const copyFileSyncStub = sinon.stub(fs, 'copyFileSync').returns(undefined);
    sourceMapGenerator.setSourceMapPath('');
    moduleMode.buildModuleSourceMapInfoMock(sourceMapGenerator);
    await sleep(100);
    expect(stub.calledWithMatch('ArkTS:INTERNAL ERROR: Failed to write sourceMaps.')).to.be.true;
    stub.restore();
    copyFileSyncStub.restore();
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('8-6: test the error message of buildModuleSourceMapInfo under build release', async function () {
    this.rollup.build(RELEASE);
    const sourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    const stub = sinon.stub(sourceMapGenerator, 'throwArkTsCompilerError');
    const copyFileSyncStub = sinon.stub(fs, 'copyFileSync').returns(undefined);
    sourceMapGenerator.setSourceMapPath('');
    moduleMode.buildModuleSourceMapInfoMock(sourceMapGenerator);
    await sleep(100);
    expect(stub.calledWithMatch('ArkTS:INTERNAL ERROR: Failed to write sourceMaps.')).to.be.true;
    stub.restore();
    copyFileSyncStub.restore();
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('8-7: test the error message of buildModuleSourceMapInfo under preview debug', async function () {
    this.rollup.preview();
    const sourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    const stub = sinon.stub(sourceMapGenerator, 'throwArkTsCompilerError');
    const copyFileSyncStub = sinon.stub(fs, 'copyFileSync').returns(undefined);
    sourceMapGenerator.setSourceMapPath('');
    moduleMode.buildModuleSourceMapInfoMock(sourceMapGenerator);
    await sleep(100);
    expect(stub.calledWithMatch('ArkTS:INTERNAL ERROR: Failed to write sourceMaps.')).to.be.true;
    stub.restore();
    copyFileSyncStub.restore();
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('8-8: test the error message of buildModuleSourceMapInfo under hot reload debug', async function () {
    this.rollup.hotReload();
    const sourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    const stub = sinon.stub(sourceMapGenerator, 'throwArkTsCompilerError');
    const copyFileSyncStub = sinon.stub(fs, 'copyFileSync').returns(undefined);
    sourceMapGenerator.setSourceMapPath('');
    moduleMode.buildModuleSourceMapInfoMock(sourceMapGenerator);
    await sleep(100);
    expect(stub.calledWithMatch('ArkTS:INTERNAL ERROR: Failed to write sourceMaps.')).to.be.true;
    stub.restore();
    copyFileSyncStub.restore();
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('8-9: test merge bytecode source map of buildModuleSourceMapInfo under build debug', async function () {
    this.rollup.build();
    this.rollup.share.projectConfig.mockBytecodeHarInfo();
    const sourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.buildModuleSourceMapInfoMock(sourceMapGenerator);
    await sleep(1000);
    expect(moduleMode.checkModuleSourceMapInfoMock() === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('9-1: test getPkgModulesFilePkgName under build debug', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const moduleMode = new ModuleModeMock(this.rollup);
    const keys = Object.keys(moduleMode.symlinkMap);
    for (const key of keys) {
      const pkgname = moduleMode.getPkgModulesFilePkgName(key).toString();
      expect(pkgname === PKG_MODULES_OHPM_HYPIUM).to.be.true;
    }
  });

  mocha.it('9-2: test getPkgModulesFilePkgName under build release', function () {
    this.rollup.build(RELEASE);
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const moduleMode = new ModuleModeMock(this.rollup);
    const keys = Object.keys(moduleMode.symlinkMap);
    for (const key of keys) {
      const pkgname = moduleMode.getPkgModulesFilePkgName(key).toString();
      expect(pkgname === PKG_MODULES_OHPM_HYPIUM).to.be.true;
    }
  });

  mocha.it('9-3: test getPkgModulesFilePkgName under preview debug', function () {
    this.rollup.preview();
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const moduleMode = new ModuleModeMock(this.rollup);
    const keys = Object.keys(moduleMode.symlinkMap);
    for (const key of keys) {
      const pkgname = moduleMode.getPkgModulesFilePkgName(key).toString();
      expect(pkgname === PKG_MODULES_OHPM_HYPIUM).to.be.true;
    }
  });

  mocha.it('9-4: test getPkgModulesFilePkgName under hot reload debug', function () {
    this.rollup.hotReload();
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const moduleMode = new ModuleModeMock(this.rollup);
    const keys = Object.keys(moduleMode.symlinkMap);
    for (const key of keys) {
      const pkgname = moduleMode.getPkgModulesFilePkgName(key).toString();
      expect(pkgname === PKG_MODULES_OHPM_HYPIUM).to.be.true;
    }
  });

  mocha.it('10-1: test generateEs2AbcCmd under build debug', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.oldMapFilePath = DEFAULT_ETS;
    const moduleMode = new ModuleHotreloadMode(this.rollup);
    const compatibleSdkVersion = `${TARGET_API_VERSION}${this.rollup.share.projectConfig.compatibleSdkVersion}`;
    moduleMode.projectConfig.anBuildMode = AOT_FULL;
    moduleMode.generateEs2AbcCmd();
    moduleMode.byteCodeHar = true;

    expect(moduleMode.cmdArgs[1] === DEBUG_INFO).to.be.true;
    moduleMode.cmdArgs.splice(1, 1);
    expect(moduleMode.cmdArgs[1].indexOf(BUILD_INFO) > 0).to.be.true;
    moduleMode.cmdArgs.splice(1, 1);
    expect(moduleMode.cmdArgs[2].indexOf(BUILD_NPM) > 0).to.be.true;
    moduleMode.cmdArgs.splice(2, 1);
    expect(moduleMode.cmdArgs[3].indexOf(MODULES_ABC) > 0).to.be.true;
    moduleMode.cmdArgs.splice(3, 1);
    checkGenerateEs2AbcCmdExpect(moduleMode.cmdArgs, compatibleSdkVersion, moduleMode.byteCodeHar);
  });

  mocha.it('10-2: test generateEs2AbcCmd under build release', function () {
    this.rollup.build(RELEASE);
    this.rollup.share.projectConfig.oldMapFilePath = DEFAULT_ETS;
    const moduleMode = new ModuleHotreloadMode(this.rollup);
    const compatibleSdkVersion = `${TARGET_API_VERSION}${this.rollup.share.projectConfig.compatibleSdkVersion}`;
    moduleMode.generateEs2AbcCmd();
    moduleMode.byteCodeHar = true;

    expect(moduleMode.cmdArgs[1] === DEBUG_INFO).to.be.false;
    expect(moduleMode.cmdArgs[1].indexOf(BUILD_INFO) > 0).to.be.true;
    moduleMode.cmdArgs.splice(1, 1);
    expect(moduleMode.cmdArgs[2].indexOf(BUILD_NPM) > 0).to.be.true;
    moduleMode.cmdArgs.splice(2, 1);
    expect(moduleMode.cmdArgs[3].indexOf(MODULES_ABC) > 0).to.be.true;
    moduleMode.cmdArgs.splice(3, 1);
    checkGenerateEs2AbcCmdExpect(moduleMode.cmdArgs, compatibleSdkVersion, moduleMode.byteCodeHar);
  });

  mocha.it('10-3: test generateEs2AbcCmd under preview debug', function () {
    this.rollup.preview();
    this.rollup.share.projectConfig.oldMapFilePath = DEFAULT_ETS;
    const moduleMode = new ModuleHotreloadMode(this.rollup);
    const compatibleSdkVersion = `${TARGET_API_VERSION}${this.rollup.share.projectConfig.compatibleSdkVersion}`;
    moduleMode.generateEs2AbcCmd();
    moduleMode.byteCodeHar = true;

    expect(moduleMode.cmdArgs[1] === DEBUG_INFO).to.be.true;
    moduleMode.cmdArgs.splice(1, 1);
    expect(moduleMode.cmdArgs[1].indexOf(PREVIEW_DEBUG_INFO) > 0).to.be.true;
    moduleMode.cmdArgs.splice(1, 1);
    expect(moduleMode.cmdArgs[2].indexOf(PREVIEW_DEBUG_NPM) > 0).to.be.true;
    moduleMode.cmdArgs.splice(2, 1);
    expect(moduleMode.cmdArgs[3].indexOf(PREVIEW_MODULES_ABC) > 0).to.be.true;
    moduleMode.cmdArgs.splice(3, 1);
    checkGenerateEs2AbcCmdExpect(moduleMode.cmdArgs, compatibleSdkVersion, moduleMode.byteCodeHar);
  });

  mocha.it('11-1: test addCacheFileArgs under build debug', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.oldMapFilePath = DEFAULT_ETS;
    const moduleMode = new ModuleHotreloadMode(this.rollup);
    moduleMode.addCacheFileArgs();

    expect(moduleMode.cmdArgs[0].indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(moduleMode.cmdArgs[1] === DEBUG_INFO).to.be.true;
    expect(moduleMode.cmdArgs[2] === CACHE_FILE).to.be.true;
    expect(moduleMode.cmdArgs[3].indexOf(BUILD_CACHE) > 0).to.be.true;
  });

  mocha.it('11-2: test addCacheFileArgs under build release', function () {
    this.rollup.build(RELEASE);
    this.rollup.share.projectConfig.oldMapFilePath = DEFAULT_ETS;
    const moduleMode = new ModuleHotreloadMode(this.rollup);
    moduleMode.addCacheFileArgs();

    expect(moduleMode.cmdArgs[0].indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(moduleMode.cmdArgs[1] === DEBUG_INFO).to.be.false;
    expect(moduleMode.cmdArgs[1] === CACHE_FILE).to.be.true;
    expect(moduleMode.cmdArgs[2].indexOf(BUILD_CACHE) > 0).to.be.true;
  });

  mocha.it('11-3: test addCacheFileArgs under preview debug', function () {
    this.rollup.preview();
    this.rollup.share.projectConfig.oldMapFilePath = DEFAULT_ETS;
    const moduleMode = new ModuleHotreloadMode(this.rollup);
    moduleMode.addCacheFileArgs();

    expect(moduleMode.cmdArgs[0].indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(moduleMode.cmdArgs[1] === DEBUG_INFO).to.be.true;
    expect(moduleMode.cmdArgs[2] === CACHE_FILE).to.be.true;
    expect(moduleMode.cmdArgs[3].indexOf(PREVIEW_DEBUG_CACHE) > 0).to.be.true;
  });

  mocha.it('11-4: test addCacheFileArgs under hot reload debug', function () {
    this.rollup.hotReload();
    this.rollup.share.projectConfig.oldMapFilePath = DEFAULT_ETS;
    const moduleMode = new ModuleHotreloadMode(this.rollup);
    moduleMode.addCacheFileArgs();

    expect(moduleMode.cmdArgs[0].indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(moduleMode.cmdArgs[1] === DEBUG_INFO).to.be.true;
    expect(moduleMode.cmdArgs[2] === CACHE_FILE).to.be.true;
    expect(moduleMode.cmdArgs[3].indexOf(BUILD_CACHE) > 0).to.be.true;
  });

  mocha.it('12-1: test genFileCachePath under build debug', function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const sufStr =
          toUnixPath(filePath).replace(toUnixPath(this.rollup.share.projectConfig.projectRootPath), '');
        const returnInfo =
          moduleMode.genFileCachePath(filePath, this.rollup.share.projectConfig.projectRootPath,
            this.rollup.share.projectConfig.cachePath);
        expect(returnInfo === path.join(this.rollup.share.projectConfig.cachePath, sufStr)).to.be.true;
      }
    }
  });

  mocha.it('12-2: test genFileCachePath under build release', function () {
    this.rollup.build(RELEASE);
    const moduleMode = new ModuleModeMock(this.rollup);
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const sufStr =
          toUnixPath(filePath).replace(toUnixPath(this.rollup.share.projectConfig.projectRootPath), '');
        const returnInfo =
          moduleMode.genFileCachePath(filePath, this.rollup.share.projectConfig.projectRootPath,
            this.rollup.share.projectConfig.cachePath);
        expect(returnInfo === path.join(this.rollup.share.projectConfig.cachePath, sufStr)).to.be.true;
      }
    }
  });

  mocha.it('12-3: test genFileCachePath under preview debug', function () {
    this.rollup.preview();
    const moduleMode = new ModuleModeMock(this.rollup);
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const sufStr =
          toUnixPath(filePath).replace(toUnixPath(this.rollup.share.projectConfig.projectRootPath), '');
        const returnInfo =
          moduleMode.genFileCachePath(filePath, this.rollup.share.projectConfig.projectRootPath,
            this.rollup.share.projectConfig.cachePath);
        expect(returnInfo === path.join(this.rollup.share.projectConfig.cachePath, sufStr)).to.be.true;
      }
    }
  });

  mocha.it('12-4: test genFileCachePath under hot reload debug', function () {
    this.rollup.hotReload();
    const moduleMode = new ModuleModeMock(this.rollup);
    this.mockfileList = this.rollup.getModuleIds();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const sufStr =
          toUnixPath(filePath).replace(toUnixPath(this.rollup.share.projectConfig.projectRootPath), '');
        const returnInfo =
          moduleMode.genFileCachePath(filePath, this.rollup.share.projectConfig.projectRootPath,
            this.rollup.share.projectConfig.cachePath);
        expect(returnInfo === path.join(this.rollup.share.projectConfig.cachePath, sufStr)).to.be.true;
      }
    }
  });

  mocha.it('12-5: test genFileCachePath under hot fix debug', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.oldMapFilePath = DEFAULT_ETS;
    const cachePath = projectConfig.cachePath + DEBUG;
    const moduleMode = new ModuleModeMock(this.rollup);
    const filePath = `${projectConfig.projectRootPath}/${TEST_TS}`;
    const sufStr = toUnixPath(filePath).replace(toUnixPath(projectConfig.projectRootPath), '');
    const returnInfo = moduleMode.genFileCachePath(filePath, projectConfig.projectRootPath, cachePath);
    expect(returnInfo === path.join(cachePath, sufStr)).to.be.true;
  });

  mocha.it('12-6: test genFileCachePath under hot fix release', function () {
    this.rollup.build(RELEASE);
    this.rollup.share.projectConfig.oldMapFilePath = DEFAULT_ETS;
    const cachePath = projectConfig.cachePath + RELEASE;
    const moduleMode = new ModuleModeMock(this.rollup);
    const filePath = `${projectConfig.projectRootPath}/${TEST_TS}`;
    const sufStr = toUnixPath(filePath).replace(toUnixPath(projectConfig.projectRootPath), '');
    const returnInfo = moduleMode.genFileCachePath(filePath, projectConfig.projectRootPath, cachePath);
    expect(returnInfo === path.join(cachePath, sufStr)).to.be.true;
  });

  mocha.it('13-1: test the error message of generateMergedAbcOfEs2Abc throw error on failed code', async function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    const child = childProcess.exec('false', { windowsHide: true });
    const triggerAsyncStub = sinon.stub(moduleMode, 'triggerAsync').returns(child);
    const stub = sinon.stub(moduleMode, 'throwArkTsCompilerError');
    let parentEvent = undefined;
    moduleMode.generateMergedAbcOfEs2AbcMock(parentEvent);
    await sleep(1000);
    expect(stub.calledWithMatch('ArkTS:ERROR Failed to execute es2abc.\nError Message: ')).to.be.true;
    triggerAsyncStub.restore();
    stub.restore();
  });

  mocha.it('13-2: test the error message of generateMergedAbcOfEs2Abc throw error(Failed to startup es2abc)', async function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    const child = {
      on: sinon.stub(),
      stderr: {
        on: sinon.stub(),
      },
    };
    const triggerAsyncStub = sinon.stub(moduleMode, 'triggerAsync').callsFake((callback) => {
      callback();
      return child;
    });
    const stub = sinon.stub(moduleMode, 'throwArkTsCompilerError');
    let errorEventCallback;
    child.on.callsFake((event, callback) => {
      if (event === 'error') {
        errorEventCallback = callback;
      }
    });
    let parentEvent = undefined;
    moduleMode.generateMergedAbcOfEs2AbcMock(parentEvent);
    if (errorEventCallback) {
      errorEventCallback(new Error('test error'));
    }
    await sleep(100);
    expect(stub.calledWith('Error: test error')).to.be.true;
    triggerAsyncStub.restore();
    stub.restore();
  });

  mocha.it('13-3: test the error message of generateMergedAbcOfEs2Abc handle error', function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    const triggerAsyncStub = sinon.stub(moduleMode, 'triggerAsync').throws(new Error('Execution failed'));
    const stub = sinon.stub(moduleMode, 'throwArkTsCompilerError');
    try {
      let parentEvent = undefined;
      moduleMode.generateMergedAbcOfEs2AbcMock(parentEvent);
    } catch (e) {
    }
    expect(stub.calledWith('ArkTS:ERROR Failed to execute es2abc.\nError message: Error: Execution failed\n')).to.be.true;
    triggerAsyncStub.restore();
    stub.restore();
  });

  mocha.it('14-1: test the error message of filterModulesByHashJson', function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    let existsSyncStub = sinon.stub(fs, 'existsSync');
    let readFileSyncStub = sinon.stub(fs, 'readFileSync');
    let stub = sinon.stub(moduleMode, 'throwArkTsCompilerError');
    moduleMode.moduleInfos = new Map([
      ['moduleKey', { cacheFilePath: 'test' }]
    ]);
    existsSyncStub.callsFake((path) => {
      if (path === moduleMode.hashJsonFilePath) {
        return true;
      }
      return false;
    });
    readFileSyncStub.withArgs(moduleMode.hashJsonFilePath).returns(JSON.stringify({}));
    try {
      moduleMode.filterModulesByHashJsonMock();
    } catch (e) {
    }
    expect(stub.calledWithMatch(
      `ArkTS:INTERNAL ERROR: Failed to get module cache abc from test in incremental build.` +
      `Please try to rebuild the project.`)).to.be.true;
    existsSyncStub.restore();
    readFileSyncStub.restore();
    stub.restore();
  });

  mocha.it('15-1: test the error message of mergeProtoToAbc', function () {
    this.rollup.build();
    const moduleMode = new ModuleMode(this.rollup);
    const execSyncStub = sinon.stub(childProcess, 'execSync').throws(new Error('Execution failed'));
    const stub = sinon.stub(moduleMode, 'throwArkTsCompilerError');
    moduleMode.mergeProtoToAbc();
    expect(stub.calledWithMatch('ArkTS:INTERNAL ERROR: Failed to merge proto file to abc.')).to.be.true;
    execSyncStub.restore();
    stub.restore();
  });

  mocha.it('16-1: test the error message of invokeTs2AbcWorkersToGenProto', function () {
    this.rollup.build();
    const moduleMode = new ModuleMode(this.rollup);
    const stub = sinon.stub(moduleMode, 'throwArkTsCompilerError');
    const clusterStub = sinon.stub(cluster, 'fork');
    const fakeWorker = {
      on: sinon.stub()
    };
    clusterStub.returns(fakeWorker);
    const splittedModules = [{
      'test': ''
    }]
    try {
      fakeWorker.on.withArgs('message').callsFake((event, callback) => {
        callback({ data: 'error' });
      });
      moduleMode.invokeTs2AbcWorkersToGenProto(splittedModules)
    } catch (e) {
    }
    expect(stub.calledWith('ArkTS:ERROR Failed to execute ts2abc.')).to.be.true;
    clusterStub.restore();
    stub.restore();
  });

  mocha.it('17-1: test the error message of processTs2abcWorkersToGenAbc', function () {
    this.rollup.build();
    const moduleMode = new ModuleMode(this.rollup);
    const stub = sinon.stub(moduleMode, 'throwArkTsCompilerError');
    const clusterStub = sinon.stub(cluster, 'on');
    const fakeWorker = {
      on: sinon.stub()
    };
    clusterStub.returns(fakeWorker);
    try {
      clusterStub.withArgs('exit').callsFake((event, callback) => {
        callback(fakeWorker, 1, null);
      });
      moduleMode.processTs2abcWorkersToGenAbc()
    } catch (e) {
    }
    expect(stub.calledWith('ArkTS:ERROR Failed to execute ts2abc')).to.be.true;
    clusterStub.restore();
    stub.restore();
  });

  mocha.it('18-1: test generateCompileContext under build debug', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.mockCompileContextInfo();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.generateCompileContextInfoMock(this.rollup);
    expect(moduleMode.checkGenerateCompileContextInfo(this.rollup) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('18-2: test generateCompileContext under build release', function () {
    this.rollup.build(RELEASE);
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.mockCompileContextInfo();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.generateCompileContextInfoMock(this.rollup);
    expect(moduleMode.checkGenerateCompileContextInfo(this.rollup) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('18-3: test generateCompileContext under build preview', function () {
    this.rollup.preview();
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.mockCompileContextInfo();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.generateCompileContextInfoMock(this.rollup);
    expect(moduleMode.checkGenerateCompileContextInfo(this.rollup) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('18-4: test generateCompileContext under build hotReload', function () {
    this.rollup.hotReload();
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.mockCompileContextInfo();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.generateCompileContextInfoMock(this.rollup);
    expect(moduleMode.checkGenerateCompileContextInfo(this.rollup) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });
  mocha.it('18-5: test generateCompileContext widget compile under build debug', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.widgetCompile = true;
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.mockCompileContextInfo();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.generateCompileContextInfoMock(this.rollup);
    expect(moduleMode.checkGenerateCompileContextInfo(this.rollup) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('18-6: test generateCompileContext widget compile under build release', function () {
    this.rollup.build(RELEASE);
    this.rollup.share.projectConfig.widgetCompile = true;
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.mockCompileContextInfo();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.generateCompileContextInfoMock(this.rollup);
    expect(moduleMode.checkGenerateCompileContextInfo(this.rollup) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('18-7: test generateCompileContext widget compile under build preview', function () {
    this.rollup.preview();
    this.rollup.share.projectConfig.widgetCompile = true;
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.mockCompileContextInfo();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.generateCompileContextInfoMock(this.rollup);
    expect(moduleMode.checkGenerateCompileContextInfo(this.rollup) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('18-8: test generateCompileContext widget compile under build hotReload', function () {
    this.rollup.hotReload();
    this.rollup.share.projectConfig.widgetCompile = true;
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.mockCompileContextInfo();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.generateCompileContextInfoMock(this.rollup);
    expect(moduleMode.checkGenerateCompileContextInfo(this.rollup) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('18-9: test generateCompileContext has router map entries', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.mockCompileContextInfo();
    this.rollup.share.projectConfig.arkRouterMap = [
      {
        'ohmurl': '@normalized:N&&&har/src/main/ets/calc&'
      },
      {
        'ohmurl': '@normalized:N&&com.har.test&har/src/main/ets/test&1.0.0'
      }
    ];
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.generateCompileContextInfoMock(this.rollup);
    expect(moduleMode.checkGenerateCompileContextInfo(this.rollup) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('18-10: test generateCompileContext has declaration entries', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.mockCompileContextInfo();
    this.rollup.share.projectConfig.declarationEntry = [
        '@normalized:N&&&har/src/main/ets/MyWorker&',
        '@normalized:N&&com.har.test&har/src/main/ets/test&1.0.0'
    ];
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.generateCompileContextInfoMock(this.rollup);
    expect(moduleMode.checkGenerateCompileContextInfo(this.rollup) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('18-11: test generateCompileContext has not exist moduleId', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.mockCompileContextInfo();
    const moduleMode = new ModuleModeMock(this.rollup);
    const stub = sinon.stub(moduleMode, 'throwArkTsCompilerError');
    const red: string = '\u001b[31m';
    const reset: string = '\u001b[39m';
    const entryObjName:string = 'test';
    const moduleId:string = 'd:/test.ets';
    try {
      moduleMode.projectConfig.entryObj[entryObjName]=moduleId;
      moduleMode.projectConfig.cardEntryObj[entryObjName]=moduleId;
      moduleMode.generateCompileContextInfoMock(this.rollup);
    } catch (e) {
    }

    expect(stub.calledWithMatch(`ArkTS:INTERNAL ERROR: Failed to find module info.\n` +
      `Error Message: Failed to find module info with '${moduleId}' from the context information.`)).to.be.true;

    stub.restore();
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('18-12: test generateCompileContext accurate update version', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.mockCompileContextInfo();
    this.rollup.share.projectConfig.declarationEntry = [
        '@normalized:N&&&har/src/main/ets/MyWorker&',
        '@normalized:N&&com.har.test&har/src/main/ets/test&1.0.0'
    ];
    this.rollup.share.projectConfig.updateVersionInfo = {
      "bytecodeHar": {
        "har1": "1.0.1",
        "har2": "2.0.0"
      }
    };
    const moduleMode: ModuleModeMock = new ModuleModeMock(this.rollup);
    moduleMode.generateCompileContextInfoMock(this.rollup);
    expect(moduleMode.checkGenerateCompileContextInfo(this.rollup) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('18-13: test generateCompileContext has not exist meta info', function () {
    this.rollup.build();
    this.rollup.mockCompileContextInfo();
    const moduleMode = new ModuleModeMock(this.rollup);
    const stub = sinon.stub(moduleMode, 'throwArkTsCompilerError');
    const entryObjName:string = 'noMetaInfo';
    const moduleId:string = 'd:/test.ets';
    moduleMode.projectConfig.entryObj[entryObjName]=moduleId;
    moduleMode.projectConfig.cardEntryObj[entryObjName]=moduleId;
    const moduleInfo = {
      id: moduleId,
      meta: null
    }
    this.rollup.moduleInfos.push(moduleInfo);
    try {
      moduleMode.generateCompileContextInfoMock(this.rollup);
    } catch (e) {
    }
    expect(stub.calledWithMatch(`ArkTS:INTERNAL ERROR: Failed to find meta info.\n` +
      `Error Message: Failed to find meta info with '${moduleId}' from the module info.`)).to.be.true;
    stub.restore();
  });

  mocha.it('18-14: test generateCompileContext inter—app hsp deps bytecode har', function () {
    this.rollup.build();
    SourceMapGenerator.initInstance(this.rollup);
    this.rollup.mockCompileContextInfo();
    this.rollup.share.projectConfig.bundleType = 'shared';
    this.rollup.share.projectConfig.bundleName = 'com.inter-app.hsp';
    const moduleMode: ModuleModeMock = new ModuleModeMock(this.rollup);
    moduleMode.generateCompileContextInfoMock(this.rollup);
    expect(moduleMode.checkGenerateCompileContextInfo(this.rollup) === true).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });
});
