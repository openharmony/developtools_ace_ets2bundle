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

// Execute this file first to avoid circular dependency problems

import { expect } from 'chai';
import mocha from 'mocha';
import fs from "fs";
import path from "path";
import MagicString from 'magic-string';
import sinon from 'sinon';

import {
  getBuildModeInLowerCase,
  getPackageInfo,
  genSourceMapFileName,
  isOhModules,
  isEs2Abc,
  writeArkguardObfuscatedSourceCode,
  writeMinimizedSourceCode,
  writeTerserObfuscatedSourceCode
} from '../../lib/ark_utils';
import {
  DEBUG,
  RELEASE,
  OH_MODULES,
  EXTNAME_TS,
  EXTNAME_JS,
  EXTNAME_ETS,
  OBFUSCATION_TOOL
} from '../../lib/fast_build/ark_compiler/common/ark_define';
import RollUpPluginMock from './mock/rollup_mock/rollup_plugin_mock';
import {
  BUNDLE_NAME_DEFAULT,
  ENTRY_MODULE_NAME_DEFAULT,
  EXTNAME_MAP,
  ENTRYABILITY_JS
} from './mock/rollup_mock/common';
import projectConfig from './utils/processProjectConfig';
import {
  ES2ABC,
  TS2ABC
} from '../../lib/pre_define';
import { changeFileExtension } from '../../lib/fast_build/ark_compiler/utils';
import ModuleSourceFileMock from './mock/class_mock/module_source_files_mock';
import {
  genTemporaryPath,
  toUnixPath
} from '../../lib/utils';
import {
  ObConfigResolver,
  MergedConfig
} from '../../lib/fast_build/ark_compiler/common/ob_config_resolver';
import {
  utProcessArkConfig
} from '../../lib/fast_build/ark_compiler/common/process_ark_config';
import { ModuleSourceFile } from '../../lib/fast_build/ark_compiler/module/module_source_file';
import { newSourceMaps } from '../../lib/fast_build/ark_compiler/transform';
import { TERSER_PROCESSED_EXPECTED_CODE } from './mock/rollup_mock/path_config';
import { GEN_ABC_PLUGIN_NAME } from '../../lib/fast_build/ark_compiler/common/ark_define';

mocha.describe('test ark_utils file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test getBuildModeInLowerCase under build debug', function () {
    this.rollup.build();
    const buildMode = getBuildModeInLowerCase(this.rollup.share.projectConfig);
    expect(buildMode === DEBUG).to.be.true;
  });

  mocha.it('1-2: test getBuildModeInLowerCase under build release', function () {
    this.rollup.build(RELEASE);
    const buildMode = getBuildModeInLowerCase(this.rollup.share.projectConfig);
    expect(buildMode === RELEASE).to.be.true;
  });

  mocha.it('1-3: test getBuildModeInLowerCase under preview debug', function () {
    this.rollup.preview();
    const buildMode = getBuildModeInLowerCase(this.rollup.share.projectConfig);
    expect(buildMode === DEBUG).to.be.true;
  });

  mocha.it('1-4: test getBuildModeInLowerCase under hot reload debug', function () {
    this.rollup.hotReload();
    const buildMode = getBuildModeInLowerCase(this.rollup.share.projectConfig);
    expect(buildMode === DEBUG).to.be.true;
  });

  mocha.it('2-1: test getPackageInfo under build debug', function () {
    this.rollup.build();
    const returnInfo = getPackageInfo(this.rollup.share.projectConfig.aceModuleJsonPath);
    expect(returnInfo[0] === BUNDLE_NAME_DEFAULT).to.be.true;
    expect(returnInfo[1] === ENTRY_MODULE_NAME_DEFAULT).to.be.true;
  });

  mocha.it('2-2: test getPackageInfo under build release', function () {
    this.rollup.build(RELEASE);
    const returnInfo = getPackageInfo(this.rollup.share.projectConfig.aceModuleJsonPath);
    expect(returnInfo[0] === BUNDLE_NAME_DEFAULT).to.be.true;
    expect(returnInfo[1] === ENTRY_MODULE_NAME_DEFAULT).to.be.true;
  });

  mocha.it('2-3: test getPackageInfo under preview debug', function () {
    this.rollup.preview();
    const returnInfo = getPackageInfo(this.rollup.share.projectConfig.aceModuleJsonPath);
    expect(returnInfo[0] === BUNDLE_NAME_DEFAULT).to.be.true;
    expect(returnInfo[1] === ENTRY_MODULE_NAME_DEFAULT).to.be.true;
  });

  mocha.it('2-4: test getPackageInfo under hot reload debug', function () {
    this.rollup.hotReload();
    const returnInfo = getPackageInfo(this.rollup.share.projectConfig.aceModuleJsonPath);
    expect(returnInfo[0] === BUNDLE_NAME_DEFAULT).to.be.true;
    expect(returnInfo[1] === ENTRY_MODULE_NAME_DEFAULT).to.be.true;
  });

  mocha.it('3-1: test genSourceMapFileName under build debug', function () {
    this.rollup.build();
    for (const filePath of this.rollup.share.allFiles) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_JS)) {
        const originPath = genSourceMapFileName(filePath);
        const expectedPath = `${filePath}${EXTNAME_MAP}`;
        expect(originPath === expectedPath).to.be.true;
      } else if (filePath.endsWith(EXTNAME_ETS)) {
        const originPath = genSourceMapFileName(filePath);
        expect(originPath === filePath).to.be.true;
      }
    }
  });

  mocha.it('3-2: test genSourceMapFileName under build release', function () {
    this.rollup.build(RELEASE);
    for (const filePath of this.rollup.share.allFiles) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_JS)) {
        const originPath = genSourceMapFileName(filePath);
        const expectedPath = `${filePath}${EXTNAME_MAP}`;
        expect(originPath === expectedPath).to.be.true;
      }
    }
  });

  mocha.it('3-3: test genSourceMapFileName under preview debug', function () {
    this.rollup.preview();
    for (const filePath of this.rollup.share.allFiles) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_JS)) {
        const originPath = genSourceMapFileName(filePath);
        const expectedPath = `${filePath}${EXTNAME_MAP}`;
        expect(originPath === expectedPath).to.be.true;
      }
    }
  });

  mocha.it('3-4: test genSourceMapFileName under hot reload debug', function () {
    this.rollup.hotReload();
    for (const filePath of this.rollup.share.allFiles) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_JS)) {
        const originPath = genSourceMapFileName(filePath);
        const expectedPath = `${filePath}${EXTNAME_MAP}`;
        expect(originPath === expectedPath).to.be.true;
      }
    }
  });

  mocha.it('4-1: test isOhModules under build debug', function () {
    this.rollup.build();
    const returnInfo = isOhModules(this.rollup.share.projectConfig);
    expect(returnInfo === false).to.be.true;
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const returnInfoOh = isOhModules(this.rollup.share.projectConfig);
    expect(returnInfoOh).to.be.true;
  });

  mocha.it('4-2: test isOhModules under build release', function () {
    this.rollup.build(RELEASE);
    const returnInfo = isOhModules(this.rollup.share.projectConfig);
    expect(returnInfo === false).to.be.true;
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const returnInfoOh = isOhModules(this.rollup.share.projectConfig);
    expect(returnInfoOh).to.be.true;
  });

  mocha.it('4-3: test isOhModules under preview debug', function () {
    this.rollup.preview();
    const returnInfo = isOhModules(this.rollup.share.projectConfig);
    expect(returnInfo === false).to.be.true;
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const returnInfoOh = isOhModules(this.rollup.share.projectConfig);
    expect(returnInfoOh).to.be.true;
  });

  mocha.it('4-4: test isOhModules under hot reload debug', function () {
    this.rollup.hotReload();
    const returnInfo = isOhModules(this.rollup.share.projectConfig);
    expect(returnInfo === false).to.be.true;
    this.rollup.share.projectConfig.packageDir = OH_MODULES;
    const returnInfoOh = isOhModules(this.rollup.share.projectConfig);
    expect(returnInfoOh).to.be.true;
  });

  mocha.it('4-5: test isOhModules under hot fix debug', function () {
    projectConfig.buildMode = DEBUG;
    const returnInfo = isOhModules(projectConfig);
    expect(returnInfo).to.be.true;
  });

  mocha.it('4-6: test isOhModules under hot fix release', function () {
    projectConfig.buildMode = RELEASE;
    const returnInfo = isOhModules(projectConfig);
    expect(returnInfo).to.be.true;
  });

  mocha.it('5-1: test isEs2Abc under build debug', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.pandaMode = ES2ABC;
    const returnInfo = isEs2Abc(this.rollup.share.projectConfig);
    expect(returnInfo).to.be.true;

    this.rollup.share.projectConfig.pandaMode = TS2ABC;
    const returnInfoTS2ABC = isEs2Abc(this.rollup.share.projectConfig);
    expect(returnInfoTS2ABC === false).to.be.true;

    this.rollup.share.projectConfig.pandaMode = "undefined";
    const returnInfoUndef = isEs2Abc(this.rollup.share.projectConfig);
    expect(returnInfoUndef).to.be.true;

    this.rollup.share.projectConfig.pandaMode = undefined;
    const returnInfoUndefined = isEs2Abc(this.rollup.share.projectConfig);
    expect(returnInfoUndefined).to.be.true;
  });

  mocha.it('5-2: test isEs2Abc under build release', function () {
    this.rollup.build(RELEASE);
    this.rollup.share.projectConfig.pandaMode = ES2ABC;
    const returnInfo = isEs2Abc(this.rollup.share.projectConfig);
    expect(returnInfo).to.be.true;

    this.rollup.share.projectConfig.pandaMode = TS2ABC;
    const returnInfoTS2ABC = isEs2Abc(this.rollup.share.projectConfig);
    expect(returnInfoTS2ABC).to.be.false;
  });

  mocha.it('5-3: test isEs2Abc under preview debug', function () {
    this.rollup.preview();
    this.rollup.share.projectConfig.pandaMode = ES2ABC;
    const returnInfo = isEs2Abc(this.rollup.share.projectConfig);
    expect(returnInfo).to.be.true;

    this.rollup.share.projectConfig.pandaMode = TS2ABC;
    const returnInfoTS2ABC = isEs2Abc(this.rollup.share.projectConfig);
    expect(returnInfoTS2ABC).to.be.false;
  });

  mocha.it('5-4: test isEs2Abc under hot reload debug', function () {
    this.rollup.hotReload();
    this.rollup.share.projectConfig.pandaMode = ES2ABC;
    const returnInfo = isEs2Abc(this.rollup.share.projectConfig);
    expect(returnInfo).to.be.true;

    this.rollup.share.projectConfig.pandaMode = TS2ABC;
    const returnInfoTS2ABC = isEs2Abc(this.rollup.share.projectConfig);
    expect(returnInfoTS2ABC).to.be.false;
  });

  mocha.it('5-5: test isEs2Abc under hot fix debug', function () {
    projectConfig.buildMode = DEBUG;
    projectConfig.pandaMode = ES2ABC;
    const returnInfo = isEs2Abc(projectConfig);
    expect(returnInfo).to.be.true;

    projectConfig.pandaMode = TS2ABC;
    const returnInfoTS2ABC = isEs2Abc(projectConfig);
    expect(returnInfoTS2ABC).to.be.false;
  });

  mocha.it('5-6: test isEs2Abc under hot fix release', function () {
    projectConfig.buildMode = RELEASE;
    projectConfig.pandaMode = ES2ABC;
    const returnInfo = isEs2Abc(projectConfig);
    expect(returnInfo).to.be.true;

    projectConfig.pandaMode = TS2ABC;
    const returnInfoTS2ABC = isEs2Abc(projectConfig);
    expect(returnInfoTS2ABC).to.be.false;
  });

  mocha.it('6-1: test writeTerserObfuscatedSourceCode under build release', async function () {
    this.rollup.build(RELEASE);
    const mockFileList: object = this.rollup.getModuleIds();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS)) {
        const code: string =
          fs.readFileSync(`${this.rollup.share.projectConfig.projectTopDir}/${ENTRYABILITY_JS}`, 'utf-8');
        const moduleSource = new ModuleSourceFileMock(moduleId, code);
        moduleSource.initPluginEnvMock(this.rollup);
        const filePath =
          genTemporaryPath(moduleSource.moduleId, moduleSource.projectConfig.projectPath,
            moduleSource.projectConfig.cachePath, moduleSource.projectConfig);
        const newFilePath = changeFileExtension(filePath, EXTNAME_JS);
        const relativeSourceFilePath: string =
          toUnixPath(moduleSource.moduleId).replace(toUnixPath(moduleSource.projectConfig.projectRootPath) + '/', '');
        const logger: object = this.rollup.share.getLogger(OBFUSCATION_TOOL);
        const obConfig: ObConfigResolver = new ObConfigResolver(this.rollup.share.projectConfig, logger, true);
        const mergedObConfig: MergedConfig = obConfig.resolveObfuscationConfigs();
        const isHarCompiled: boolean = this.rollup.share.projectConfig.compileHar;
        moduleSource.projectConfig.terserConfig =
          utProcessArkConfig.initTerserConfig(this.rollup.share.projectConfig, logger, mergedObConfig, isHarCompiled);
        const Code: string = fs.readFileSync(moduleId, 'utf-8');
        const ModuleSource = new ModuleSourceFile(relativeSourceFilePath, Code);
        const codeString: MagicString = new MagicString(<string>ModuleSource.source);
        const sourceMap: object = codeString.generateMap({
          source: relativeSourceFilePath,
          file: `${path.basename(ModuleSource.moduleId)}`,
          includeContent: false,
          hires: true
        });
        newSourceMaps[relativeSourceFilePath] = sourceMap;
        delete newSourceMaps[relativeSourceFilePath].sourcesContent;

        await writeTerserObfuscatedSourceCode(moduleSource.source, newFilePath, moduleSource.logger,
          moduleSource.projectConfig.terserConfig, relativeSourceFilePath, newSourceMaps);
        const readFilecontent = fs.readFileSync(newFilePath, 'utf-8');
        const expectResult = fs.readFileSync(TERSER_PROCESSED_EXPECTED_CODE, 'utf-8');
        expect(readFilecontent === expectResult).to.be.true;
      }
    }

    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });

  mocha.it('6-2: test the error message of writeTerserObfuscatedSourceCode', async function () {
    this.rollup.build(RELEASE);
    const logger = this.rollup.share.getLogger(GEN_ABC_PLUGIN_NAME);
    const stub = sinon.stub(logger, 'error');
    const red: string = '\x1B[31m';
    try {
      await writeTerserObfuscatedSourceCode(undefined, '', logger, undefined);
    } catch (e) {
    }
    expect(stub.calledWith(red,
      'ArkTS:INTERNAL ERROR: Failed to obfuscate file with terser: '
    )).to.be.true;
    stub.restore();
  });

  mocha.it('7-1: test the error message of writeArkguardObfuscatedSourceCode', async function () {
    this.rollup.build(RELEASE);
    const logger = this.rollup.share.getLogger(GEN_ABC_PLUGIN_NAME);
    const stub = sinon.stub(logger, 'error');
    const red: string = '\x1B[31m';
    try {
      await writeArkguardObfuscatedSourceCode(undefined, '', logger, this.rollup.share.projectConfig, '', {}, '');
    } catch (e) {
    }
    expect(stub.calledWith(red,
      'ArkTS:INTERNAL ERROR: Failed to obfuscate file with arkguard: '
    )).to.be.true;
    stub.restore();
  });

  mocha.it('8-1: test the error message of writeMinimizedSourceCode', async function () {
    this.rollup.build(RELEASE);
    const logger = this.rollup.share.getLogger(GEN_ABC_PLUGIN_NAME);
    const stub = sinon.stub(logger, 'error');
    const red: string = '\x1B[31m';
    const reset: string = '\x1B[39m';
    try {
      await writeMinimizedSourceCode(undefined, '', logger);
    } catch (e) {
    }
    expect(stub.calledWith(red,
      'ArkTS:INTERNAL ERROR: Failed to obfuscate source code for ', reset
    )).to.be.true;
    stub.restore();
  });
});