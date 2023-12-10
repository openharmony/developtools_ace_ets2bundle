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
import { ArkObfuscator } from "arkguard";

import {
  getBuildModeInLowerCase,
  getPackageInfo,
  genSourceMapFileName,
  writeArkguardObfuscatedSourceCode
} from '../../../lib/ark_utils';
import {
  DEBUG,
  RELEASE,
  EXTNAME_JS,
  EXTNAME_TS,
  EXTNAME_ETS
} from '../../../lib/fast_build/ark_compiler/common/ark_define';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import {
  BUNDLE_NAME_DEFAULT,
  ENTRY_MODULE_NAME_DEFAULT,
  EXTNAME_MAP,
  JSONSTRING
} from '../mock/rollup_mock/common';
import { changeFileExtension } from '../../../lib/fast_build/ark_compiler/utils';
import ModuleSourceFileMock from '../mock/class_mock/module_source_files_mock';
import {
  genTemporaryPath,
  toUnixPath
} from '../../../lib/utils';

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

  mocha.it('4-1: test writeArkguardObfuscatedSourceCode under build release', async function () {
    this.rollup.build(RELEASE);
    const mockFileList: object = this.rollup.getModuleIds();
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_TS)) {
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        const moduleSource = new ModuleSourceFileMock(moduleId, code);
        moduleSource.initPluginEnvMock(this.rollup);
        const filePath =
          genTemporaryPath(moduleSource.moduleId, moduleSource.projectConfig.projectPath,
            moduleSource.projectConfig.cachePath, moduleSource.projectConfig);
        const newFilePath = changeFileExtension(filePath, EXTNAME_JS);
        const relativeSourceFilePath: string =
          toUnixPath(moduleSource.moduleId).replace(toUnixPath(moduleSource.projectConfig.projectRootPath) + '/', '');
        moduleSource.projectConfig.arkObfuscator = new ArkObfuscator();
        const jsonString: string = JSONSTRING;
        const arkguardConfig = JSON.parse(jsonString);
        moduleSource.projectConfig.arkObfuscator.init(arkguardConfig);
        await writeArkguardObfuscatedSourceCode(moduleSource.source, newFilePath, moduleSource.logger,
          moduleSource.projectConfig, relativeSourceFilePath);
        const readfilecontent = fs.readFileSync(newFilePath, 'utf-8');
        let mixedInfo: { content: string, sourceMap?: any, nameCache?: any };
        try {
          mixedInfo =
            await moduleSource.projectConfig.arkObfuscator.obfuscate(moduleSource.source, filePath, undefined, undefined);
        } catch {
          const red: string = '\u001b[31m';
          moduleSource.logger.error(red, `ArkTS:ERROR Failed to obfuscate file: ${relativeSourceFilePath}`);
        }
        expect(readfilecontent === mixedInfo.content).to.be.true;
      }
    }
  });
});
