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

import { newSourceMaps } from '../../../lib/fast_build/ark_compiler/transform';
import { EXPECT_SOURCEMAP_JSON } from "../mock/rollup_mock/path_config";
import {
  RELEASE,
  EXTNAME_TS,
  EXTNAME_JS,
  EXTNAME_ETS,
  OH_MODULES
} from '../../../lib/fast_build/ark_compiler/common/ark_define';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import ModuleModeMock from '../mock/class_mock/module_mode_mock';
import {
  ENTRYABILITY_TS_PATH_DEFAULT,
  ENTRYABILITY_JS_PATH_DEFAULT,
  INDEX_ETS_PATH_DEFAULT,
  ENTRYABILITY_TS_RECORDNAME,
  ENTRYABILITY_JS_RECORDNAME,
  INDEX_ETS_RECORDNAME,
  ENTRYABILITY_TS_DEBUG_ENTRY,
  ENTRYABILITY_JS_DEBUG_ENTRY,
  INDEX_ETS_DEBUG_ENTRY,
  ENTRYABILITY_TS_RELEASE_ENTRY,
  ENTRYABILITY_JS_RELEASE_ENTRY,
  INDEX_ETS_RELEASE_ENTRY,
  PKG_MODULES,
  ENTRY_MODULE_NAME_DEFAULT
} from '../mock/rollup_mock/common';

mocha.describe('test module_mode file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test collectModuleFileList under build debug', function () {
    this.rollup.build();
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

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;
    })

    expect(moduleMode.pkgEntryInfos.size != 0).to.be.true;
  });

  mocha.it('1-2: test collectModuleFileList under build release', function () {
    this.rollup.build(RELEASE);
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

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;
    })

    expect(moduleMode.pkgEntryInfos.size != 0).to.be.true;
  });

  mocha.it('1-3: test collectModuleFileList under preview debug', function () {
    this.rollup.preview();
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

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;
    })

    expect(moduleMode.pkgEntryInfos.size != 0).to.be.true;
  });

  mocha.it('1-4: test collectModuleFileList under hot reload debug', function () {
    this.rollup.hotReload();
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

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;
    })
    expect(moduleMode.pkgEntryInfos.size != 0).to.be.true;
  });

  mocha.it('2-1-1: test addModuleInfoItem under build debug: isPackageModulesFile`s return is true', function () {
    this.rollup.share.projectConfig.modulePath = this.rollup.share.projectConfig.projectPath;
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.projectConfig.packageDir = ENTRY_MODULE_NAME_DEFAULT;
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.moduleInfos.forEach(value => {
      expect(value.packageName === PKG_MODULES).to.be.true;
    });
  })
  mocha.it('2-1-2: test addModuleInfoItem under build debug: isPackageModulesFile`s return is false', function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_TS_DEBUG_ENTRY) > 0 ||
        moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_JS_DEBUG_ENTRY) > 0 ||
        moduleInfo.cacheFilePath.indexOf(INDEX_ETS_DEBUG_ENTRY) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_RECORDNAME) > 0).to.be.true;

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;
    })
  });
  mocha.it('2-1-3: test addModuleInfoItem under build debug: extName is not null ', function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, EXTNAME_TS);
    moduleMode.moduleInfos.forEach(value => {
      expect(value.cacheFilePath.endsWith(EXTNAME_TS)).to.be.true
    });
  })

  mocha.it('2-2: test addModuleInfoItem under build release', function () {
    this.rollup.build(RELEASE);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_TS_RELEASE_ENTRY) > 0 ||
        moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_JS_RELEASE_ENTRY) > 0 ||
        moduleInfo.cacheFilePath.indexOf(INDEX_ETS_RELEASE_ENTRY) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_RECORDNAME) > 0).to.be.true;

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;
    })
  });

  mocha.it('2-3: test addModuleInfoItem under preview debug', function () {
    this.rollup.preview();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_TS_DEBUG_ENTRY) > 0 ||
        moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_JS_DEBUG_ENTRY) > 0 ||
        moduleInfo.cacheFilePath.indexOf(INDEX_ETS_DEBUG_ENTRY) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_RECORDNAME) > 0).to.be.true;

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;
    })
  });

  mocha.it('2-4: test addModuleInfoItem under hot reload debug', function () {
    this.rollup.hotReload();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.moduleInfos.forEach(moduleInfo => {
      expect(moduleInfo.filePath.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.filePath.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;

      expect(moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_TS_DEBUG_ENTRY) > 0 ||
        moduleInfo.cacheFilePath.indexOf(ENTRYABILITY_JS_DEBUG_ENTRY) > 0 ||
        moduleInfo.cacheFilePath.indexOf(INDEX_ETS_DEBUG_ENTRY) > 0).to.be.true;

      expect(moduleInfo.recordName.indexOf(ENTRYABILITY_TS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(ENTRYABILITY_JS_RECORDNAME) > 0 ||
        moduleInfo.recordName.indexOf(INDEX_ETS_RECORDNAME) > 0).to.be.true;

      expect(moduleInfo.sourceFile.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        moduleInfo.sourceFile.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;
    })
  });

  mocha.it('3-1-1: test updateCachedSourceMaps under build debug: cacheSourceMapPath not exist', function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.cacheSourceMapPath = '';
    newSourceMaps[ENTRYABILITY_TS_PATH_DEFAULT] = {};
    newSourceMaps[INDEX_ETS_PATH_DEFAULT] = {};
    moduleMode.updateCachedSourceMapsMock();
    for (const key in moduleMode.cacheSourceMapObject) {
      expect(newSourceMaps[key] === moduleMode.cacheSourceMapObject[key]).to.be.true;
    }
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });

  mocha.it('3-1-2: test updateCachedSourceMaps under build debug: compileFileList has not sourceFileAbsolutePath', function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.cacheSourceMapPath = EXPECT_SOURCEMAP_JSON;
    newSourceMaps[ENTRYABILITY_TS_PATH_DEFAULT] = { FILE: '' };
    newSourceMaps[INDEX_ETS_PATH_DEFAULT] = { FILE: '' };
    moduleMode.updateCachedSourceMapsMock();
    for (const key in moduleMode.cacheSourceMapObject) {
      expect(newSourceMaps[key] === moduleMode.cacheSourceMapObject[key]).to.be.true;
    }

    newSourceMaps[ENTRYABILITY_TS_PATH_DEFAULT] = { "file": 'test' };
    moduleMode.updateCachedSourceMapsMock();
    for (const key in moduleMode.cacheSourceMapObject) {
      expect(newSourceMaps[key] === moduleMode.cacheSourceMapObject[key]).to.be.true;
    }

    newSourceMaps[ENTRYABILITY_TS_PATH_DEFAULT] = { "file": 'test', "newFile": "newTest" };
    moduleMode.updateCachedSourceMapsMock();
    for (const key in moduleMode.cacheSourceMapObject) {
      expect(newSourceMaps[key] === moduleMode.cacheSourceMapObject[key]).to.be.true;
    }

    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });

  mocha.it('3-2: test updateCachedSourceMaps under build release', function () {
    this.rollup.build(RELEASE);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.cacheSourceMapPath = '';
    newSourceMaps[ENTRYABILITY_TS_PATH_DEFAULT] = {};
    newSourceMaps[INDEX_ETS_PATH_DEFAULT] = {};
    moduleMode.updateCachedSourceMapsMock();
    for (const key in moduleMode.cacheSourceMapObject) {
      expect(newSourceMaps[key] === moduleMode.cacheSourceMapObject[key]).to.be.true;
    }
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });

  mocha.it('3-3: test updateCachedSourceMaps under preview debug', function () {
    this.rollup.preview();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.cacheSourceMapPath = '';
    newSourceMaps[ENTRYABILITY_TS_PATH_DEFAULT] = {};
    newSourceMaps[INDEX_ETS_PATH_DEFAULT] = {};
    moduleMode.updateCachedSourceMapsMock();
    for (const key in moduleMode.cacheSourceMapObject) {
      expect(newSourceMaps[key] === moduleMode.cacheSourceMapObject[key]).to.be.true;
    }
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });

  mocha.it('3-4: test updateCachedSourceMaps under hot reload debug', function () {
    this.rollup.hotReload();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.cacheSourceMapPath = '';
    newSourceMaps[ENTRYABILITY_TS_PATH_DEFAULT] = {};
    newSourceMaps[INDEX_ETS_PATH_DEFAULT] = {};
    moduleMode.updateCachedSourceMapsMock();
    for (const key in moduleMode.cacheSourceMapObject) {
      expect(newSourceMaps[key] === moduleMode.cacheSourceMapObject[key]).to.be.true;
    }
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });

  mocha.it('4-1: test generateCompileFilesInfo under build debug', function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateCompileFilesInfoMock();
    expect(moduleMode.checkGenerateCompileFilesInfo() === true).to.be.true;
  });

  mocha.it('4-2: test generateCompileFilesInfo under build release', function () {
    this.rollup.build(RELEASE);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateCompileFilesInfoMock();
    expect(moduleMode.checkGenerateCompileFilesInfo() === true).to.be.true;
  });

  mocha.it('4-3: test generateCompileFilesInfo under preview debug', function () {
    this.rollup.preview();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateCompileFilesInfoMock();
    expect(moduleMode.checkGenerateCompileFilesInfo() === true).to.be.true;
  });

  mocha.it('4-4: test generateCompileFilesInfo under hot reload debug', function () {
    this.rollup.hotReload();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateCompileFilesInfoMock();
    expect(moduleMode.checkGenerateCompileFilesInfo() === true).to.be.true;
  });

  mocha.it('5-1: test generateNpmEntriesInfo under build debug', function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateNpmEntriesInfoMock();
    expect(moduleMode.checkGenerateNpmEntriesInfo() === true).to.be.true;
  });

  mocha.it('5-2: test generateNpmEntriesInfo under build release', function () {
    this.rollup.build(RELEASE);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateNpmEntriesInfoMock();
    expect(moduleMode.checkGenerateNpmEntriesInfo() === true).to.be.true;
  });

  mocha.it('5-3: test generateNpmEntriesInfo under preview debug', function () {
    this.rollup.preview();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateNpmEntriesInfoMock();
    expect(moduleMode.checkGenerateNpmEntriesInfo() === true).to.be.true;
  });

  mocha.it('5-4: test generateNpmEntriesInfo under hot reload debug', function () {
    this.rollup.hotReload();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateNpmEntriesInfoMock();
    expect(moduleMode.checkGenerateNpmEntriesInfo() === true).to.be.true;
  });

  mocha.it('6-1: test generateAbcCacheFilesInfo under build debug', function () {
    this.rollup.build();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateAbcCacheFilesInfoMock();
    expect(moduleMode.checkGenerateAbcCacheFilesInfo() === true).to.be.true;
  });

  mocha.it('6-2: test generateAbcCacheFilesInfo under build release', function () {
    this.rollup.build(RELEASE);
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateAbcCacheFilesInfoMock();
    expect(moduleMode.checkGenerateAbcCacheFilesInfo() === true).to.be.true;
  });

  mocha.it('6-3: test generateAbcCacheFilesInfo under preview debug', function () {
    this.rollup.preview();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateAbcCacheFilesInfoMock();
    expect(moduleMode.checkGenerateAbcCacheFilesInfo() === true).to.be.true;
  });

  mocha.it('6-4: test generateAbcCacheFilesInfo under hot reload debug', function () {
    this.rollup.hotReload();
    const moduleMode = new ModuleModeMock(this.rollup);
    moduleMode.addModuleInfoItemMock(this.rollup, false, '');
    moduleMode.generateAbcCacheFilesInfoMock();
    expect(moduleMode.checkGenerateAbcCacheFilesInfo() === true).to.be.true;
  });
});