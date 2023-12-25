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
  isAotMode,
  isDebug,
  isCommonJsPluginVirtualFile,
  isCurrentProjectFiles,
  isSpecifiedExt,
  isTsOrEtsSourceFile,
  isJsSourceFile,
  isJsonSourceFile,
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
  EXTNAME_JS,
  EXTNAME_TS,
  EXTNAME_ETS,
  EXTNAME_JSON,
  RELEASE,
  DEBUG
} from '../../../lib/fast_build/ark_compiler/common/ark_define';
import ModuleSourceFileMock from '../mock/class_mock/module_source_files_mock';
import {
  genTemporaryPath,
  toUnixPath
} from '../../../lib/utils';
import projectConfig from '../utils/processProjectConfig';
import {
  TEST_TS,
  TEST_JS,
  TEST_ETS,
  TEST_JSON
} from '../mock/rollup_mock/path_config';
import { scanFiles } from "../utils/utils";
import { newSourceMaps } from '../../../lib/fast_build/ark_compiler/transform';
import { ModuleSourceFile } from '../../../lib/fast_build/ark_compiler/module/module_source_file';
import {
  hasTsNoCheckOrTsIgnoreFiles,
  compilingEtsOrTsFiles
} from '../../../lib/process_kit_import';
import {
  FILE,
  SOURCE,
  DYNAMICIMPORT_ETS,
  UPDATESOURCEMAP
} from '../mock/rollup_mock/common';

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
    expect(returnInfo).to.be.false;
  });

  mocha.it('1-2: test needAotCompiler under build debug and anBuildMode is AOT_PARTIAL', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.compileMode = ESMODULE;
    this.rollup.share.projectConfig.anBuildMode = AOT_PARTIAL;
    const returnInfo = needAotCompiler(this.rollup.share.projectConfig);
    expect(returnInfo).to.be.true;
  });

  mocha.it('1-3: test needAotCompiler under build release', function () {
    this.rollup.build(RELEASE);
    this.rollup.share.projectConfig.compileMode = ESMODULE;
    this.rollup.share.projectConfig.anBuildMode = AOT_FULL;
    const returnInfo = needAotCompiler(this.rollup.share.projectConfig);
    expect(returnInfo).to.be.true;
  });

  mocha.it('1-4: test needAotCompiler under build release and compileMode is JSBUNDLE', function () {
    this.rollup.build(RELEASE);
    this.rollup.share.projectConfig.compileMode = JSBUNDLE;
    this.rollup.share.projectConfig.anBuildMode = AOT_FULL;
    const returnInfo = needAotCompiler(this.rollup.share.projectConfig);
    expect(returnInfo).to.be.false;
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
    newSourceMaps[relativeSourceFilePath] = await updateSourceMap(updatedMap);

    expect(newSourceMaps[relativeSourceFilePath] === updatedMap).to.be.true;
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });

  mocha.it('4-1-3: test updateSourceMap under build debug: originMap and newMap is not null', async function () {
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
    const arraylist = Array.from(this.rollup.share.allFiles);
    const syncCode: string = fs.readFileSync(arraylist[2].toString(), 'utf-8');
    const dynamicModuleSource = new ModuleSourceFile(dynamicImportpath, syncCode);
    const codeString: MagicString = new MagicString(<string>dynamicModuleSource.source);
    const sourceMap: object = codeString.generateMap({
      source: relativeSourceFilePath,
      file: `${path.basename(dynamicModuleSource.moduleId)}`,
      includeContent: false,
      hires: true
    });

    newSourceMaps[relativeSourceFilePath] = sourceMap;
    delete newSourceMaps[relativeSourceFilePath].sourcesContent;
    updatedMap[SOURCE] = [relativeSourceFilePath];
    updatedMap[FILE] = path.basename(relativeSourceFilePath);
    newSourceMaps[relativeSourceFilePath] =
      await updateSourceMap(newSourceMaps[relativeSourceFilePath], updatedMap);
    const readSourceMap =
      JSON.parse(fs.readFileSync(`${this.rollup.share.projectConfig.projectTopDir}/${UPDATESOURCEMAP}`, 'utf-8'));
    expect(newSourceMaps[relativeSourceFilePath].file === DYNAMICIMPORT_ETS).to.be.true;
    expect(newSourceMaps[relativeSourceFilePath].mappings === readSourceMap.mappings).to.be.true;
    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });

  mocha.it('4-2: test updateSourceMap under build release', async function () {
    this.rollup.build(RELEASE);
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

  mocha.it('4-3: test updateSourceMap under preview debug', async function () {
    this.rollup.preview();
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

  mocha.it('4-4: test updateSourceMap under hot reload debug', async function () {
    this.rollup.hotReload();
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

  mocha.it('5-1: test isAotMode under build debug', function () {
    this.rollup.build();
    const returnInfo = isAotMode(this.rollup.share.projectConfig);
    expect(returnInfo).to.be.false;
  });

  mocha.it('5-2: test isAotMode under build release', function () {
    this.rollup.build(RELEASE);
    this.rollup.share.projectConfig.compileMode = ESMODULE;
    this.rollup.share.projectConfig.anBuildMode = AOT_FULL;
    const returnInfo = isAotMode(this.rollup.share.projectConfig);
    expect(returnInfo).to.be.true;
  });

  mocha.it('5-3: test isAotMode under preview debug', function () {
    this.rollup.preview();
    this.rollup.share.projectConfig.compileMode = JSBUNDLE;
    this.rollup.share.projectConfig.anBuildMode = AOT_PARTIAL;
    const buildModeIsAotType = isAotMode(this.rollup.share.projectConfig);
    expect(buildModeIsAotType).to.be.false;
  });

  mocha.it('5-4: test isAotMode under hot reload debug', function () {
    this.rollup.hotReload();
    this.rollup.share.projectConfig.compileMode = ESMODULE;
    this.rollup.share.projectConfig.anBuildMode = AOT_TYPE;
    const buildModeIsAotType = isAotMode(this.rollup.share.projectConfig);
    expect(buildModeIsAotType).to.be.true;
  });

  mocha.it('5-5: test isAotMode under hot fix debug', function () {
    projectConfig.buildMode = DEBUG;
    projectConfig.compileMode = JSBUNDLE;
    projectConfig.anBuildMode = AOT_TYPE;
    const buildModeIsAotType = isAotMode(projectConfig);
    expect(buildModeIsAotType).to.be.false;
  });

  mocha.it('5-6: test isAotMode under hot fix release', function () {
    projectConfig.buildMode = RELEASE;
    projectConfig.compileMode = ESMODULE;
    projectConfig.anBuildMode = AOT_PARTIAL;
    const buildModeIsAotType = isAotMode(projectConfig);
    expect(buildModeIsAotType).to.be.true;
  });

  mocha.it('6-1: test isDebug under build debug', function () {
    this.rollup.build();
    const returnInfo = isDebug(this.rollup.share.projectConfig);
    expect(returnInfo).to.be.true;
  });

  mocha.it('6-2: test isDebug under build release', function () {
    this.rollup.build(RELEASE);
    const returnInfo = isDebug(this.rollup.share.projectConfig);
    expect(returnInfo).to.be.false;
  });

  mocha.it('6-3: test isDebug under preview debug', function () {
    this.rollup.preview();
    const returnInfo = isDebug(this.rollup.share.projectConfig);
    expect(returnInfo).to.be.true;
  });

  mocha.it('6-4: test isDebug under hot reload debug', function () {
    this.rollup.hotReload();
    const returnInfo = isDebug(this.rollup.share.projectConfig);
    expect(returnInfo).to.be.true;
  });

  mocha.it('6-5: test isDebug under hot fix debug', function () {
    projectConfig.buildMode = DEBUG;
    const returnInfo = isDebug(projectConfig);
    expect(returnInfo).to.be.true;
  });

  mocha.it('6-6: test isDebug under hot fix release', function () {
    projectConfig.buildMode = RELEASE;
    const returnInfo = isDebug(projectConfig);
    expect(returnInfo).to.be.false;
  });

  mocha.it('7-1: test changeFileExtension under build debug', function () {
    this.rollup.build();
    const targetExt = EXTNAME_TS;
    const originExt = '';
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS) || file.endsWith(EXTNAME_JS)) {
        const currentExt = originExt.length === 0 ? path.extname(file) : originExt;
        const fileWithoutExt = file.substring(0, file.lastIndexOf(currentExt));
        const returnInfo = changeFileExtension(file, targetExt, originExt);
        expect(returnInfo === fileWithoutExt + targetExt).to.be.true;
      }
    }
  });

  mocha.it('7-2: test changeFileExtension under build release', function () {
    this.rollup.build(RELEASE);
    const targetExt = EXTNAME_TS;
    const originExt = '';
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS) || file.endsWith(EXTNAME_JS)) {
        const currentExt = originExt.length === 0 ? path.extname(file) : originExt;
        const fileWithoutExt = file.substring(0, file.lastIndexOf(currentExt));
        const returnInfo = changeFileExtension(file, targetExt, originExt);
        expect(returnInfo === fileWithoutExt + targetExt).to.be.true;
      }
    }
  });

  mocha.it('7-3: test changeFileExtension under preview debug', function () {
    this.rollup.preview();
    const targetExt = EXTNAME_TS;
    const originExt = '';
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS) || file.endsWith(EXTNAME_JS)) {
        const currentExt = originExt.length === 0 ? path.extname(file) : originExt;
        const fileWithoutExt = file.substring(0, file.lastIndexOf(currentExt));
        const returnInfo = changeFileExtension(file, targetExt, originExt);
        expect(returnInfo === fileWithoutExt + targetExt).to.be.true;
      }
    }
  });

  mocha.it('7-4: test changeFileExtension under hot reload debug', function () {
    this.rollup.hotReload();
    const targetExt = EXTNAME_TS;
    const originExt = '';
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS) || file.endsWith(EXTNAME_JS)) {
        const currentExt = originExt.length === 0 ? path.extname(file) : originExt;
        const fileWithoutExt = file.substring(0, file.lastIndexOf(currentExt));
        const returnInfo = changeFileExtension(file, targetExt, originExt);
        expect(returnInfo === fileWithoutExt + targetExt).to.be.true;
      }
    }
  });

  mocha.it('7-5: test changeFileExtension under hot fix debug', function () {
    projectConfig.buildMode = DEBUG;
    const file = TEST_TS;
    const targetExt = EXTNAME_TS;
    const originExt = '';
    const currentExt = originExt.length === 0 ? path.extname(file) : originExt;
    const fileWithoutExt = file.substring(0, file.lastIndexOf(currentExt));
    const returnInfo = changeFileExtension(file, targetExt, originExt);
    expect(returnInfo === fileWithoutExt + targetExt).to.be.true;
  });

  mocha.it('7-6: test changeFileExtension under hot fix release', function () {
    projectConfig.buildMode = RELEASE;
    const file = TEST_TS;
    const targetExt = EXTNAME_TS;
    const originExt = '';
    const currentExt = originExt.length === 0 ? path.extname(file) : originExt;
    const fileWithoutExt = file.substring(0, file.lastIndexOf(currentExt));
    const returnInfo = changeFileExtension(file, targetExt, originExt);
    expect(returnInfo === fileWithoutExt + targetExt).to.be.true;
  });

  mocha.it('8-1: test isCommonJsPluginVirtualFile under build debug', function () {
    this.rollup.build();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const returnInfo = isCommonJsPluginVirtualFile(filePath);
        expect(returnInfo).to.be.false;
      }
    }
  });

  mocha.it('8-2: test isCommonJsPluginVirtualFile under build release', function () {
    this.rollup.build(RELEASE);
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const returnInfo = isCommonJsPluginVirtualFile(filePath);
        expect(returnInfo).to.be.false;
      }
    }
  });

  mocha.it('8-3: test isCommonJsPluginVirtualFile under preview debug', function () {
    this.rollup.preview();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const returnInfo = isCommonJsPluginVirtualFile(filePath);
        expect(returnInfo).to.be.false;
      }
    }
  });

  mocha.it('8-4: test isCommonJsPluginVirtualFile under hot reload debug', function () {
    this.rollup.hotReload();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const returnInfo = isCommonJsPluginVirtualFile(filePath);
        expect(returnInfo).to.be.false;
      }
    }
  });

  mocha.it('8-5: test isCommonJsPluginVirtualFile under hot fix debug', function () {
    projectConfig.buildMode = DEBUG;
    const filePath = TEST_TS;
    const returnInfo = isCommonJsPluginVirtualFile(filePath);
    expect(returnInfo).to.be.false;
  });

  mocha.it('8-6: test isCommonJsPluginVirtualFile under hot fix release', function () {
    projectConfig.buildMode = RELEASE;
    const filePath = TEST_TS;
    const returnInfo = isCommonJsPluginVirtualFile(filePath);
    expect(returnInfo).to.be.false;
  });

  mocha.it('9-1: test isCurrentProjectFiles under build debug', function () {
    this.rollup.build();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const returnInfo = isCurrentProjectFiles(filePath, this.rollup.share.projectConfig);
        expect(returnInfo).to.be.true;
      }
    }
  });

  mocha.it('9-2: test isCurrentProjectFiles under build release', function () {
    this.rollup.build(RELEASE);
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const returnInfo = isCurrentProjectFiles(filePath, this.rollup.share.projectConfig);
        expect(returnInfo).to.be.true;
      }
    }
  });

  mocha.it('9-3: test isCurrentProjectFiles under preview debug', function () {
    this.rollup.preview();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const returnInfo = isCurrentProjectFiles(filePath, this.rollup.share.projectConfig);
        expect(returnInfo).to.be.true;
      }
    }
  });

  mocha.it('9-4: test isCurrentProjectFiles under hot reload debug', function () {
    this.rollup.hotReload();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const returnInfo = isCurrentProjectFiles(filePath, this.rollup.share.projectConfig);
        expect(returnInfo).to.be.true;
      }
    }
  });

  mocha.it('9-5: test isCurrentProjectFiles under hot fix debug', function () {
    projectConfig.buildMode = DEBUG;
    const filePath = TEST_TS;
    const returnInfo = isCurrentProjectFiles(filePath, projectConfig);
    expect(returnInfo).to.be.false;
  });

  mocha.it('9-6: test isCurrentProjectFiles under hot fix release', function () {
    projectConfig.buildMode = RELEASE;
    const filePath = TEST_TS;
    const returnInfo = isCurrentProjectFiles(filePath, projectConfig);
    expect(returnInfo).to.be.false;
  });

  mocha.it('10-1: test isSpecifiedExt under build debug', function () {
    this.rollup.build();
    const fileExtendName = EXTNAME_ETS;
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        if (filePath.endsWith(EXTNAME_ETS)) {
          expect(isSpecifiedExt(filePath, fileExtendName)).to.be.true;
        } else {
          expect(isSpecifiedExt(filePath, fileExtendName)).to.be.false;
        }
      }
    }
  });

  mocha.it('10-2: test isSpecifiedExt under build release', function () {
    this.rollup.build(RELEASE);
    const fileExtendName = EXTNAME_JS;
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        if (filePath.endsWith(EXTNAME_JS)) {
          expect(isSpecifiedExt(filePath, fileExtendName)).to.be.true;
        } else {
          expect(isSpecifiedExt(filePath, fileExtendName)).to.be.false;
        }
      }
    }
  });

  mocha.it('10-3: test isSpecifiedExt under preview debug', function () {
    this.rollup.preview();
    const fileExtendName = EXTNAME_TS;
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        if (filePath.endsWith(EXTNAME_TS)) {
          expect(isSpecifiedExt(filePath, fileExtendName)).to.be.true;
        } else {
          expect(isSpecifiedExt(filePath, fileExtendName)).to.be.false;
        }
      }
    }
  });

  mocha.it('10-4: test isSpecifiedExt under hot reload debug', function () {
    this.rollup.hotReload();
    const fileExtendName = EXTNAME_JS;
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const filePath of this.mockfileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        if (filePath.endsWith(EXTNAME_JS)) {
          expect(isSpecifiedExt(filePath, fileExtendName)).to.be.true;
        } else {
          expect(isSpecifiedExt(filePath, fileExtendName)).to.be.false;
        }
      }
    }
  });

  mocha.it('10-5: test isSpecifiedExt under hot fix debug', function () {
    projectConfig.buildMode = DEBUG;
    const fileExtendName = EXTNAME_JS;
    const filePath = TEST_JS;
    const returnInfo = isSpecifiedExt(filePath, fileExtendName);
    expect(returnInfo).to.be.true;
  });

  mocha.it('10-6: test isSpecifiedExt under hot fix release', function () {
    projectConfig.buildMode = RELEASE;
    const fileExtendName = EXTNAME_JS;
    const filePath = TEST_TS;
    const returnInfo = isSpecifiedExt(filePath, fileExtendName);
    expect(returnInfo).to.be.false;
  });

  mocha.it('11-1: test isTsOrEtsSourceFile under build debug', function () {
    this.rollup.build();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS)) {
        const returnInfo = isTsOrEtsSourceFile(file);
        expect(returnInfo).to.be.true;
      }
      if (file.endsWith(EXTNAME_JS)) {
        const returnInfoJs = isTsOrEtsSourceFile(file);
        expect(returnInfoJs).to.be.false;
      }
    }
  });

  mocha.it('11-2: test isTsOrEtsSourceFile under build release', function () {
    this.rollup.build(RELEASE);
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS)) {
        const returnInfo = isTsOrEtsSourceFile(file);
        expect(returnInfo).to.be.true;
      }
      if (file.endsWith(EXTNAME_JS)) {
        const returnInfoJs = isTsOrEtsSourceFile(file);
        expect(returnInfoJs).to.be.false;
      }
    }
  });

  mocha.it('11-3: test isTsOrEtsSourceFile under preview debug', function () {
    this.rollup.preview();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS)) {
        const returnInfo = isTsOrEtsSourceFile(file);
        expect(returnInfo).to.be.true;
      }
      if (file.endsWith(EXTNAME_JS)) {
        const returnInfoJs = isTsOrEtsSourceFile(file);
        expect(returnInfoJs).to.be.false;
      }
    }
  });

  mocha.it('11-4: test isTsOrEtsSourceFile under hot reload debug', function () {
    this.rollup.hotReload();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS)) {
        const returnInfo = isTsOrEtsSourceFile(file);
        expect(returnInfo).to.be.true;
      }
      if (file.endsWith(EXTNAME_JS)) {
        const returnInfoJs = isTsOrEtsSourceFile(file);
        expect(returnInfoJs).to.be.false;
      }
    }
  });

  mocha.it('11-5: test isTsOrEtsSourceFile under hot fix debug', function () {
    projectConfig.buildMode = DEBUG;
    const file = TEST_TS;
    const returnInfo = isTsOrEtsSourceFile(file);
    expect(returnInfo).to.be.true;
    const fileEts = TEST_ETS;
    const returnInfoEts = isTsOrEtsSourceFile(fileEts);
    expect(returnInfoEts).to.be.true;

  });

  mocha.it('11-6: test isTsOrEtsSourceFile under hot fix release', function () {
    projectConfig.buildMode = RELEASE;
    const file = TEST_TS;
    const returnInfo = isTsOrEtsSourceFile(file);
    expect(returnInfo).to.be.true;
    const fileJs = TEST_JS;
    const returnInfoJs = isTsOrEtsSourceFile(fileJs);
    expect(returnInfoJs).to.be.false;
  });

  mocha.it('12-1: test isJsSourceFile under build debug', function () {
    this.rollup.build();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS)) {
        const returnInfo = isJsSourceFile(file);
        expect(returnInfo).to.be.false;
      }
      if (file.endsWith(EXTNAME_JS)) {
        const returnInfoJs = isJsSourceFile(file);
        expect(returnInfoJs).to.be.true;
      }
    }
  });

  mocha.it('12-2: test isJsSourceFile under build release', function () {
    this.rollup.build(RELEASE);
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS)) {
        const returnInfo = isJsSourceFile(file);
        expect(returnInfo).to.be.false;
      }
      if (file.endsWith(EXTNAME_JS)) {
        const returnInfoJs = isJsSourceFile(file);
        expect(returnInfoJs).to.be.true;
      }
    }
  });

  mocha.it('12-3: test isJsSourceFile under preview debug', function () {
    this.rollup.preview();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS)) {
        const returnInfo = isJsSourceFile(file);
        expect(returnInfo).to.be.false;
      }
      if (file.endsWith(EXTNAME_JS)) {
        const returnInfoJs = isJsSourceFile(file);
        expect(returnInfoJs).to.be.true;
      }
    }
  });

  mocha.it('12-4: test isJsSourceFile under hot reload debug', function () {
    this.rollup.hotReload();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS)) {
        const returnInfo = isJsSourceFile(file);
        expect(returnInfo).to.be.false;
      }
      if (file.endsWith(EXTNAME_JS)) {
        const returnInfoJs = isJsSourceFile(file);
        expect(returnInfoJs).to.be.true;
      }
    }
  });

  mocha.it('12-5: test isJsSourceFile under hot fix debug', function () {
    projectConfig.buildMode = DEBUG;
    const file = TEST_JS;
    const returnInfo = isJsSourceFile(file);
    expect(returnInfo).to.be.true;
    const fileTs = TEST_TS;
    const returnInfoTs = isJsSourceFile(fileTs);
    expect(returnInfoTs).to.be.false;
  });

  mocha.it('12-6: test isJsSourceFile under hot fix release', function () {
    projectConfig.buildMode = RELEASE;
    const file = TEST_JS;
    const returnInfo = isJsSourceFile(file);
    expect(returnInfo).to.be.true;
    const fileTs = TEST_TS;
    const returnInfoTs = isJsSourceFile(fileTs);
    expect(returnInfoTs).to.be.false;
  });

  mocha.it('13-1: test isJsonSourceFile under build debug', function () {
    this.rollup.build();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values(); for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS) || file.endsWith(EXTNAME_JS)) {
        const returnInfo = isJsonSourceFile(file);
        expect(returnInfo).to.be.false;
      }
      if (file.endsWith(EXTNAME_JSON)) {
        const returnInfoJson = isJsonSourceFile(file);
        expect(returnInfoJson).to.be.true;
      }
    }
  });

  mocha.it('13-2: test isJsonSourceFile under build release', function () {
    this.rollup.build(RELEASE);
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS) || file.endsWith(EXTNAME_JS)) {
        const returnInfo = isJsonSourceFile(file);
        expect(returnInfo).to.be.false;
      }
      if (file.endsWith(EXTNAME_JSON)) {
        const returnInfoJson = isJsonSourceFile(file);
        expect(returnInfoJson).to.be.true;
      }
    }
  });

  mocha.it('13-3: test isJsonSourceFile under preview debug', function () {
    this.rollup.preview();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS) || file.endsWith(EXTNAME_JS)) {
        const returnInfo = isJsonSourceFile(file);
        expect(returnInfo).to.be.false;
      }
      if (file.endsWith(EXTNAME_JSON)) {
        const returnInfoJson = isJsonSourceFile(file);
        expect(returnInfoJson).to.be.true;
      }
    }
  });

  mocha.it('13-4: test isJsonSourceFile under hot reload debug', function () {
    this.rollup.hotReload();
    const allFiles = new Set<string>();
    scanFiles(this.rollup.share.projectConfig.modulePath, allFiles);
    this.mockfileList = allFiles.values();
    for (const file of this.mockfileList) {
      if (file.endsWith(EXTNAME_TS) || file.endsWith(EXTNAME_ETS) || file.endsWith(EXTNAME_JS)) {
        const returnInfo = isJsonSourceFile(file);
        expect(returnInfo).to.be.false;
      }
      if (file.endsWith(EXTNAME_JSON)) {
        const returnInfoJson = isJsonSourceFile(file);
        expect(returnInfoJson).to.be.true;
      }
    }
  });

  mocha.it('13-5: test isJsonSourceFile under hot fix debug', function () {
    projectConfig.buildMode = DEBUG;
    const file = TEST_TS;
    const returnInfo = isJsonSourceFile(file);
    expect(returnInfo).to.be.false;
    const fileJson = TEST_JSON;
    const returnInfoJson = isJsonSourceFile(fileJson);
    expect(returnInfoJson).to.be.true;
  });

  mocha.it('13-6: test isJsonSourceFile under hot fix release', function () {
    projectConfig.buildMode = RELEASE;
    const file = TEST_TS;
    const returnInfo = isJsonSourceFile(file);
    expect(returnInfo).to.be.false;
    const fileJson = TEST_JS;
    const returnInfoJson = isJsonSourceFile(fileJson);
    expect(returnInfoJson).to.be.false;
  });
});