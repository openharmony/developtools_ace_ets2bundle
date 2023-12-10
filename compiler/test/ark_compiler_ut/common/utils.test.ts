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
import fs from "fs";
import path from "path";
import MagicString from 'magic-string';

import {
  needAotCompiler,
  shouldETSOrTSFileTransformToJS,
  changeFileExtension,
  utUtils,
  updateSourceMap
} from '../../../lib/fast_build/ark_compiler/utils';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import {
  AOT_FULL,
  AOT_PARTIAL,
  AOT_TYPE
} from '../../../lib/pre_define';
import {
  ESMODULE,
  JSBUNDLE,
  RELEASE,
  EXTNAME_JS,
  EXTNAME_TS,
  EXTNAME_ETS
} from '../../../lib/fast_build/ark_compiler/common/ark_define';
import ModuleSourceFileMock from '../mock/class_mock/module_source_files_mock';
import {
  genTemporaryPath,
  toUnixPath
} from '../../../lib/utils';
import { ModuleSourceFile } from '../../../lib/fast_build/ark_compiler/module/module_source_file';
import { newSourceMaps } from '../../../lib/fast_build/ark_compiler/transform';
import {
  FILE,
  SOURCE,
  DYNAMICIMPORT_ETS,
  UPDATESOURCEMAP
} from '../mock/rollup_mock/common';
import {
  hasTsNoCheckOrTsIgnoreFiles,
  compilingEtsOrTsFiles
} from '../../../lib/process_ui_syntax';

mocha.describe('test utils file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test needAotCompiler under build debug', function () {
    this.rollup.build();
    const returnInfo = needAotCompiler(this.rollup.share.projectConfig);
    expect(returnInfo === false).to.be.true;
  });

  mocha.it('1-2: test needAotCompiler under build debug and anBuildMode is AOT_PARTIAL', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.compileMode = ESMODULE;
    this.rollup.share.projectConfig.anBuildMode = AOT_PARTIAL;
    const returnInfo = needAotCompiler(this.rollup.share.projectConfig);
    expect(returnInfo === true).to.be.true;
  });

  mocha.it('1-3: test needAotCompiler under build release', function () {
    this.rollup.build(RELEASE);
    this.rollup.share.projectConfig.compileMode = ESMODULE;
    this.rollup.share.projectConfig.anBuildMode = AOT_FULL;
    const returnInfo = needAotCompiler(this.rollup.share.projectConfig);
    expect(returnInfo === true).to.be.true;
  });

  mocha.it('1-4: test needAotCompiler under build release and compileMode is JSBUNDLE', function () {
    this.rollup.build(RELEASE);
    this.rollup.share.projectConfig.compileMode = JSBUNDLE;
    this.rollup.share.projectConfig.anBuildMode = AOT_FULL;
    const returnInfo = needAotCompiler(this.rollup.share.projectConfig);
    expect(returnInfo === false).to.be.true;
  });

  mocha.it('1-5: test needAotCompiler under preview debug', function () {
    this.rollup.preview();
    this.rollup.share.projectConfig.compileMode = JSBUNDLE;
    this.rollup.share.projectConfig.anBuildMode = AOT_PARTIAL;
    const buildModeIsAotFull = needAotCompiler(this.rollup.share.projectConfig);
    expect(buildModeIsAotFull === false).to.be.true;
  });

  mocha.it('1-6: test needAotCompiler under preview debug and anBuildMode is AOT_TYPE', function () {
    this.rollup.preview();
    this.rollup.share.projectConfig.compileMode = JSBUNDLE;
    this.rollup.share.projectConfig.anBuildMode = AOT_TYPE;
    const buildModeIsAotFull = needAotCompiler(this.rollup.share.projectConfig);
    expect(buildModeIsAotFull === false).to.be.true;
  });

  mocha.it('1-7: test needAotCompiler under hot reload debug', function () {
    this.rollup.hotReload();
    this.rollup.share.projectConfig.compileMode = ESMODULE;
    this.rollup.share.projectConfig.anBuildMode = AOT_TYPE;
    const buildModeIsAotType = needAotCompiler(this.rollup.share.projectConfig);
    expect(buildModeIsAotType === false).to.be.true;
  });

  mocha.it('2-1-1: test shouldETSOrTSFileTransformToJS under build debug: arkProjectConfig.processTs is false', function () {
    this.rollup.build();
    this.mockfileList = this.rollup.getModuleIds();
    this.rollup.share.arkProjectConfig.cachePath = this.rollup.share.projectConfig.cachePath;
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        expect(shouldETSOrTSFileTransformToJS(filePath, this.rollup.share.arkProjectConfig) === true).to.be.true;
      }
    }
  });

  mocha.it('2-1-2: test shouldETSOrTSFileTransformToJS under build debug: arkProjectConfig.processTs is true', function () {
    this.rollup.build();
    this.mockfileList = this.rollup.getModuleIds();
    this.rollup.share.arkProjectConfig.cachePath = this.rollup.share.projectConfig.cachePath;
    this.rollup.share.arkProjectConfig.processTs = true;
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        compilingEtsOrTsFiles.push(filePath);
        hasTsNoCheckOrTsIgnoreFiles.push(filePath);
        expect(shouldETSOrTSFileTransformToJS(filePath, this.rollup.share.arkProjectConfig) === true).to.be.true;
      }
    }
  });

  mocha.it('2-2: test shouldETSOrTSFileTransformToJS under build release', function () {
    this.rollup.build(RELEASE);
    this.mockfileList = this.rollup.getModuleIds();
    this.rollup.share.arkProjectConfig.cachePath = this.rollup.share.projectConfig.cachePath;
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        expect(shouldETSOrTSFileTransformToJS(filePath, this.rollup.share.arkProjectConfig) === true).to.be.true;
      }
    }
  });

  mocha.it('2-3: test shouldETSOrTSFileTransformToJS under preview debug', function () {
    this.rollup.preview();
    this.mockfileList = this.rollup.getModuleIds();
    this.rollup.share.arkProjectConfig.cachePath = this.rollup.share.projectConfig.cachePath;
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        expect(shouldETSOrTSFileTransformToJS(filePath, this.rollup.share.arkProjectConfig) === true).to.be.true;
      }
    }
  });

  mocha.it('2-4: test shouldETSOrTSFileTransformToJS under hot reload debug', function () {
    this.rollup.hotReload();
    this.mockfileList = this.rollup.getModuleIds();
    this.rollup.share.arkProjectConfig.cachePath = this.rollup.share.projectConfig.cachePath;
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        expect(shouldETSOrTSFileTransformToJS(filePath, this.rollup.share.arkProjectConfig) === true).to.be.true;
      }
    }
  });

  mocha.it('3-1: test writeFileContent under build debug', function () {
    this.rollup.build();
    const mockFileList: object = this.rollup.getModuleIds();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS) || moduleId.endsWith(EXTNAME_JS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFileMock(moduleId, code);
        moduleSource.initPluginEnvMock(this.rollup);
        const filePath = genTemporaryPath(moduleSource.moduleId, moduleSource.projectConfig.projectPath,
          moduleSource.projectConfig.cachePath, moduleSource.projectConfig);
        utUtils.writeFileContent(moduleSource.moduleId, filePath, moduleSource.source,
          moduleSource.projectConfig, moduleSource.logger);
        const newFilePath = changeFileExtension(filePath, EXTNAME_JS);
        const readFilecontent = fs.readFileSync(newFilePath, 'utf-8');
        expect(readFilecontent === moduleSource.source).to.be.true;
      }
    }
  });

  mocha.it('3-2: test writeFileContent under build release', function () {
    this.rollup.build(RELEASE);
    const mockFileList: object = this.rollup.getModuleIds();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS) || moduleId.endsWith(EXTNAME_JS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFileMock(moduleId, code);
        moduleSource.initPluginEnvMock(this.rollup);
        const filePath = genTemporaryPath(moduleSource.moduleId, moduleSource.projectConfig.projectPath,
          moduleSource.projectConfig.cachePath, moduleSource.projectConfig);
        utUtils.writeFileContent(moduleSource.moduleId, filePath, moduleSource.source,
          moduleSource.projectConfig, moduleSource.logger);
        const newFilePath = changeFileExtension(filePath, EXTNAME_JS);
        const readFilecontent = fs.readFileSync(newFilePath, 'utf-8');
        expect(readFilecontent === moduleSource.source).to.be.true;
      }
    }
  });

  mocha.it('3-3: test writeFileContent under preview debug', function () {
    this.rollup.preview();
    const mockFileList: object = this.rollup.getModuleIds();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS) || moduleId.endsWith(EXTNAME_JS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFileMock(moduleId, code);
        moduleSource.initPluginEnvMock(this.rollup);
        const filePath = genTemporaryPath(moduleSource.moduleId, moduleSource.projectConfig.projectPath,
          moduleSource.projectConfig.cachePath, moduleSource.projectConfig);
        utUtils.writeFileContent(moduleSource.moduleId, filePath, moduleSource.source,
          moduleSource.projectConfig, moduleSource.logger);
        const newFilePath = changeFileExtension(filePath, EXTNAME_JS);
        const readFilecontent = fs.readFileSync(newFilePath, 'utf-8');
        expect(readFilecontent === moduleSource.source).to.be.true;
      }
    }
  });

  mocha.it('3-4: test writeFileContent under hot reload debug', function () {
    this.rollup.hotReload();
    const mockFileList: object = this.rollup.getModuleIds();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS) || moduleId.endsWith(EXTNAME_ETS) || moduleId.endsWith(EXTNAME_JS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFileMock(moduleId, code);
        moduleSource.initPluginEnvMock(this.rollup);
        const filePath = genTemporaryPath(moduleSource.moduleId, moduleSource.projectConfig.projectPath,
          moduleSource.projectConfig.cachePath, moduleSource.projectConfig);
        utUtils.writeFileContent(moduleSource.moduleId, filePath, moduleSource.source,
          moduleSource.projectConfig, moduleSource.logger);
        const newFilePath = changeFileExtension(filePath, EXTNAME_JS);
        const readFilecontent = fs.readFileSync(newFilePath, 'utf-8');
        expect(readFilecontent === moduleSource.source).to.be.true;
      }
    }
  });

  mocha.it('4-1-1: test updateSourceMap under build debug: originMap is null', async function () {
    this.rollup.build();
    const dynamicImportpath = this.rollup.share.projectConfig.DynamicImportpath;
    const relativeSourceFilePath =
      toUnixPath(dynamicImportpath.replace(this.rollup.share.projectConfig.projectTopDir + path.sep, ''));
    const code: string = fs.readFileSync(dynamicImportpath, 'utf-8');
    const moduleSource = new ModuleSourceFile(dynamicImportpath, code);
    const sourceCode: MagicString = new MagicString(<string>moduleSource.source);
    const updatedMap: object = sourceCode.generateMap({
      source: relativeSourceFilePath,
      file: `${path.basename(moduleSource.moduleId)}`,
      includeContent: false,
      hires: true
    });

    updatedMap[SOURCE] = [relativeSourceFilePath];
    updatedMap[FILE] = path.basename(relativeSourceFilePath);
    newSourceMaps[relativeSourceFilePath] =
      await updateSourceMap(newSourceMaps[relativeSourceFilePath], updatedMap);
    expect(newSourceMaps[relativeSourceFilePath] === updatedMap).to.be.true;
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });

  mocha.it('4-1-2: test updateSourceMap under build debug: newMap is null', async function () {
    this.rollup.build();
    const dynamicImportpath = this.rollup.share.projectConfig.DynamicImportpath
    const relativeSourceFilePath =
      toUnixPath(dynamicImportpath.replace(this.rollup.share.projectConfig.projectTopDir + path.sep, ''));
    const code: string = fs.readFileSync(dynamicImportpath, 'utf-8');
    const moduleSource = new ModuleSourceFile(dynamicImportpath, code);
    const sourceCode: MagicString = new MagicString(<string>moduleSource.source);
    const updatedMap: object = sourceCode.generateMap({
      source: relativeSourceFilePath,
      file: `${path.basename(moduleSource.moduleId)}`,
      includeContent: false,
      hires: true
    });

    updatedMap[SOURCE] = [relativeSourceFilePath];
    updatedMap[FILE] = path.basename(relativeSourceFilePath);
    newSourceMaps[relativeSourceFilePath] = await updateSourceMap(updatedMap);
    expect(newSourceMaps[relativeSourceFilePath] === updatedMap).to.be.true;
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });

  mocha.it('4-1-3: test updateSourceMap under build debug: originMap and newMap is not null', async function () {
    this.rollup.build();
    const dynamicImportpath = this.rollup.share.projectConfig.DynamicImportpath
    const relativeSourceFilePath =
      toUnixPath(dynamicImportpath.replace(this.rollup.share.projectConfig.projectTopDir + path.sep, ''));
    const code: string = fs.readFileSync(dynamicImportpath, 'utf-8');
    const moduleSource = new ModuleSourceFile(dynamicImportpath, code);
    const sourceCode: MagicString = new MagicString(<string>moduleSource.source);
    const updatedMap: object = sourceCode.generateMap({
      source: relativeSourceFilePath,
      file: `${path.basename(moduleSource.moduleId)}`,
      includeContent: false,
      hires: true
    });
    const arraylist = Array.from(this.rollup.share.allFiles)
    const syncCode: string = fs.readFileSync(arraylist[2].toString(), 'utf-8');
    const dynamicModuleSource = new ModuleSourceFile(dynamicImportpath, syncCode);
    const codeString: MagicString = new MagicString(<string>dynamicModuleSource.source);
    const sourceMap: object = codeString.generateMap({
      source: relativeSourceFilePath,
      file: `${path.basename(dynamicModuleSource.moduleId)}`,
      includeContent: false,
      hires: true
    });

    newSourceMaps[relativeSourceFilePath] = sourceMap
    delete newSourceMaps[relativeSourceFilePath].sourcesContent;
    updatedMap[SOURCE] = [relativeSourceFilePath];
    updatedMap[FILE] = path.basename(relativeSourceFilePath);
    newSourceMaps[relativeSourceFilePath] = await updateSourceMap(newSourceMaps[relativeSourceFilePath], updatedMap);
    const readSourceMap = JSON.parse(fs.readFileSync(`${this.rollup.share.projectConfig.projectTopDir}/${UPDATESOURCEMAP}`, 'utf-8'))
    expect(newSourceMaps[relativeSourceFilePath].file === DYNAMICIMPORT_ETS).to.be.true;
    expect(newSourceMaps[relativeSourceFilePath].mappings === readSourceMap.mappings).to.be.true;
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });

  mocha.it('4-2: test updateSourceMap under build release', async function () {
    this.rollup.build(RELEASE);
    const dynamicImportpath = this.rollup.share.projectConfig.DynamicImportpath
    const relativeSourceFilePath =
      toUnixPath(dynamicImportpath.replace(this.rollup.share.projectConfig.projectTopDir + path.sep, ''));
    const code: string = fs.readFileSync(dynamicImportpath, 'utf-8');
    const moduleSource = new ModuleSourceFile(dynamicImportpath, code);
    const sourceCode: MagicString = new MagicString(<string>moduleSource.source);
    const updatedMap: object = sourceCode.generateMap({
      source: relativeSourceFilePath,
      file: `${path.basename(moduleSource.moduleId)}`,
      includeContent: false,
      hires: true
    });

    updatedMap[SOURCE] = [relativeSourceFilePath];
    updatedMap[FILE] = path.basename(relativeSourceFilePath);
    newSourceMaps[relativeSourceFilePath] =
      await updateSourceMap(newSourceMaps[relativeSourceFilePath], updatedMap);
    expect(newSourceMaps[relativeSourceFilePath] === updatedMap).to.be.true;
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });

  mocha.it('4-3: test updateSourceMap under preview debug', async function () {
    this.rollup.preview();
    const dynamicImportpath = this.rollup.share.projectConfig.DynamicImportpath
    const relativeSourceFilePath =
      toUnixPath(dynamicImportpath.replace(this.rollup.share.projectConfig.projectTopDir + path.sep, ''));
    const code: string = fs.readFileSync(dynamicImportpath, 'utf-8');
    const moduleSource = new ModuleSourceFile(dynamicImportpath, code);
    const sourceCode: MagicString = new MagicString(<string>moduleSource.source);
    const updatedMap: object = sourceCode.generateMap({
      source: relativeSourceFilePath,
      file: `${path.basename(moduleSource.moduleId)}`,
      includeContent: false,
      hires: true
    });

    updatedMap[SOURCE] = [relativeSourceFilePath];
    updatedMap[FILE] = path.basename(relativeSourceFilePath);
    newSourceMaps[relativeSourceFilePath] =
      await updateSourceMap(newSourceMaps[relativeSourceFilePath], updatedMap);
    expect(newSourceMaps[relativeSourceFilePath] === updatedMap).to.be.true;
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });

  mocha.it('4-4: test updateSourceMap under hot reload debug', async function () {
    this.rollup.hotReload();
    const dynamicImportpath = this.rollup.share.projectConfig.DynamicImportpath
    const relativeSourceFilePath =
      toUnixPath(dynamicImportpath.replace(this.rollup.share.projectConfig.projectTopDir + path.sep, ''));
    const code: string = fs.readFileSync(dynamicImportpath, 'utf-8');
    const moduleSource = new ModuleSourceFile(dynamicImportpath, code);
    const sourceCode: MagicString = new MagicString(<string>moduleSource.source);
    const updatedMap: object = sourceCode.generateMap({
      source: relativeSourceFilePath,
      file: `${path.basename(moduleSource.moduleId)}`,
      includeContent: false,
      hires: true
    });

    updatedMap[SOURCE] = [relativeSourceFilePath];
    updatedMap[FILE] = path.basename(relativeSourceFilePath);
    newSourceMaps[relativeSourceFilePath] =
      await updateSourceMap(newSourceMaps[relativeSourceFilePath], updatedMap);
    expect(newSourceMaps[relativeSourceFilePath] === updatedMap).to.be.true;
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });
});