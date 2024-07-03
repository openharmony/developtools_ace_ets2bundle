/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

import {
  RELEASE
} from '../../../lib/fast_build/ark_compiler/common/ark_define';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import { SourceMapGenerator } from '../../../lib/fast_build/ark_compiler/generate_sourcemap';
import {
  ENTRYABILITY_JS_PATH_DEFAULT,
  ENTRYABILITY_TS_PATH_DEFAULT,
  ENTRY_PACKAGE_NAME_DEFAULT,
  ENTRY_MODULE_VERSION_DEFAULT
} from '../mock/rollup_mock/common';
import {
  compilingEtsOrTsFiles,
  hasTsNoCheckOrTsIgnoreFiles,
  cleanUpFilesList
} from '../../../lib/fast_build/ark_compiler/utils';

const prefix = `${ENTRY_PACKAGE_NAME_DEFAULT}|${ENTRY_PACKAGE_NAME_DEFAULT}|${ENTRY_MODULE_VERSION_DEFAULT}|`;
let entryPkgInfo = `${ENTRY_PACKAGE_NAME_DEFAULT}|${ENTRY_MODULE_VERSION_DEFAULT}`;

mocha.describe('test generate_sourcemap api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test getPkgInfoByModuleId under build debug', function () {
    this.rollup.build();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let pkgInfo = sourceMapGenerator.getPkgInfoByModuleId(moduleId);

    expect(pkgInfo && pkgInfo.entry && pkgInfo.modulePath && pkgInfo.entry.name && pkgInfo.entry.version !== '' && pkgInfo.entry.version != undefined).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-2: test getPkgInfoByModuleId under build release', function () {
    this.rollup.build(RELEASE);
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let pkgInfo = sourceMapGenerator.getPkgInfoByModuleId(moduleId);

    expect(pkgInfo && pkgInfo.entry && pkgInfo.modulePath && pkgInfo.entry.name && pkgInfo.entry.version !== '' && pkgInfo.entry.version != undefined).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-3: test getPkgInfoByModuleId under preview', function () {
    this.rollup.preview();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let pkgInfo = sourceMapGenerator.getPkgInfoByModuleId(moduleId);

    expect(pkgInfo && pkgInfo.entry && pkgInfo.modulePath && pkgInfo.entry.name && pkgInfo.entry.version !== '' && pkgInfo.entry.version != undefined).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-4: test getPkgInfoByModuleId under hotReload', function () {
    this.rollup.hotReload();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let pkgInfo = sourceMapGenerator.getPkgInfoByModuleId(moduleId);

    expect(pkgInfo && pkgInfo.entry && pkgInfo.modulePath && pkgInfo.entry.name && pkgInfo.entry.version !== '' && pkgInfo.entry.version != undefined).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('1-5: test getPkgInfoByModuleId with file name obfuscate', function () {
    this.rollup.build();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let pkgInfo = sourceMapGenerator.getPkgInfoByModuleId(moduleId, true);
    expect(pkgInfo && pkgInfo.entry && pkgInfo.modulePath && pkgInfo.entry.name && pkgInfo.entry.version !== '' && pkgInfo.entry.version != undefined).to.be.true;
    expect(pkgInfo.modulePath == 'src/main/a/b.js').to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-1: test genKey under build debug', function () {
    this.rollup.build();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let genKey = sourceMapGenerator.genKey(moduleId);
    let expectKey = prefix + ENTRYABILITY_JS_PATH_DEFAULT.substring(1);

    expect(genKey === expectKey).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-2: test genKey under build release', function () {
    this.rollup.build(RELEASE);
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let genKey = sourceMapGenerator.genKey(moduleId);
    let expectKey = prefix + ENTRYABILITY_JS_PATH_DEFAULT.substring(1);

    expect(genKey === expectKey).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-3: test genKey under preview', function () {
    this.rollup.preview();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let genKey = sourceMapGenerator.genKey(moduleId);
    let expectKey = prefix + ENTRYABILITY_JS_PATH_DEFAULT.substring(1);

    expect(genKey === expectKey).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-4: test genKey under hotReload', function () {
    this.rollup.hotReload();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let genKey = sourceMapGenerator.genKey(moduleId);
    let expectKey = prefix + ENTRYABILITY_JS_PATH_DEFAULT.substring(1);

    expect(genKey === expectKey).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('2-5: test genKey with file name obfuscate', function () {
    this.rollup.build();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let genKey = sourceMapGenerator.genKey(moduleId, true);
    let expectKey = 'entry|entry|1.0.0|src/main/a/b.js';
    expect(genKey === expectKey).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-1: test updateSourceMap under build debug', function () {
    this.rollup.build();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let sourceMapData = { version: '1.0.0' };
    sourceMapGenerator.updateSourceMap(moduleId, sourceMapData);
    let sourceMapDataGet = sourceMapGenerator.getSourceMap(moduleId);
    expect(sourceMapData === sourceMapDataGet).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-2: test updateSourceMap under build release', function () {
    this.rollup.build(RELEASE);
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let sourceMapData = { version: '1.0.0' };
    sourceMapGenerator.updateSourceMap(moduleId, sourceMapData);
    let sourceMapDataGet = sourceMapGenerator.getSourceMap(moduleId);
    expect(sourceMapData === sourceMapDataGet).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-3: test updateSourceMap under preview', function () {
    this.rollup.preview();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let sourceMapData = { version: '1.0.0' };
    sourceMapGenerator.updateSourceMap(moduleId, sourceMapData);
    let sourceMapDataGet = sourceMapGenerator.getSourceMap(moduleId);
    expect(sourceMapData === sourceMapDataGet).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('3-4: test updateSourceMap under hotReload', function () {
    this.rollup.hotReload();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let sourceMapData = { version: '1.0.0' };
    sourceMapGenerator.updateSourceMap(moduleId, sourceMapData);
    let sourceMapDataGet = sourceMapGenerator.getSourceMap(moduleId);
    expect(sourceMapData === sourceMapDataGet).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('4-1: test fillSourceMapPackageInfo under build debug', function () {
    this.rollup.build();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);

    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let sourceMapData = {};
    sourceMapGenerator.fillSourceMapPackageInfo(moduleId, sourceMapData);
    expect(sourceMapData['entry-package-info'] && sourceMapData['entry-package-info'] === entryPkgInfo).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('4-2: test fillSourceMapPackageInfo under build release', function () {
    this.rollup.build(RELEASE);
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);

    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let sourceMapData = {};
    sourceMapGenerator.fillSourceMapPackageInfo(moduleId, sourceMapData);
    expect(sourceMapData['entry-package-info'] && sourceMapData['entry-package-info'] === entryPkgInfo).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('4-3: test fillSourceMapPackageInfo under preview', function () {
    this.rollup.preview();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);

    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let sourceMapData = {};
    sourceMapGenerator.fillSourceMapPackageInfo(moduleId, sourceMapData);
    expect(sourceMapData['entry-package-info'] && sourceMapData['entry-package-info'] === entryPkgInfo).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('4-4: test fillSourceMapPackageInfo under hotReload', function () {
    this.rollup.hotReload();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);

    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    let sourceMapData = {};
    sourceMapGenerator.fillSourceMapPackageInfo(moduleId, sourceMapData);
    expect(sourceMapData['entry-package-info'] && sourceMapData['entry-package-info'] === entryPkgInfo).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('5-1: test genKey under build debug: arkProjectConfig.processTs is true', function () {
    this.rollup.build();
    this.rollup.share.arkProjectConfig.processTs = true;
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    compilingEtsOrTsFiles.push(moduleId);
    hasTsNoCheckOrTsIgnoreFiles.push(moduleId);
    let genKey = sourceMapGenerator.genKey(moduleId);
    cleanUpFilesList();
    let expectKey = prefix + ENTRYABILITY_JS_PATH_DEFAULT.substring(1);
    expect(genKey === expectKey).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('5-2: test genKey under build release: arkProjectConfig.processTs is true', function () {
    this.rollup.build(RELEASE);
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    compilingEtsOrTsFiles.push(moduleId);
    hasTsNoCheckOrTsIgnoreFiles.push(moduleId);
    let genKey = sourceMapGenerator.genKey(moduleId);
    cleanUpFilesList();
    let expectKey = prefix + ENTRYABILITY_JS_PATH_DEFAULT.substring(1);
    expect(genKey === expectKey).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('5-3: test genKey under preview: arkProjectConfig.processTs is true', function () {
    this.rollup.preview();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    compilingEtsOrTsFiles.push(moduleId);
    hasTsNoCheckOrTsIgnoreFiles.push(moduleId);
    let genKey = sourceMapGenerator.genKey(moduleId);
    cleanUpFilesList();
    let expectKey = prefix + ENTRYABILITY_JS_PATH_DEFAULT.substring(1);
    expect(genKey === expectKey).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

  mocha.it('5-4: test genKey under hotReload: arkProjectConfig.processTs is true', function () {
    this.rollup.hotReload();
    const sourceMapGenerator: SourceMapGenerator = SourceMapGenerator.initInstance(this.rollup);
    let moduleId = path.join(this.rollup.share.projectConfig.modulePath, ENTRYABILITY_TS_PATH_DEFAULT);
    compilingEtsOrTsFiles.push(moduleId);
    hasTsNoCheckOrTsIgnoreFiles.push(moduleId);
    let genKey = sourceMapGenerator.genKey(moduleId);
    cleanUpFilesList();
    let expectKey = prefix + ENTRYABILITY_JS_PATH_DEFAULT.substring(1);
    expect(genKey === expectKey).to.be.true;
    SourceMapGenerator.cleanSourceMapObject();
  });

});