/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
import sinon from 'sinon';

import {
  collectArkTSEvolutionModuleInfo,
  addDeclFilesConfig,
  pkgDeclFilesConfig,
  arkTSModuleMap
} from '../../../lib/fast_build/ark_compiler/interop/process_arkts_evolution';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import {
  BUNDLE_NAME_DEFAULT,
  HAR_DECLGENV2OUTPATH
} from '../mock/rollup_mock/common';
import { CommonLogger } from '../../../lib/fast_build/ark_compiler/logger';
import { ErrorCode } from '../../../lib/fast_build/ark_compiler/error_code';

mocha.describe('process arkts evolution tests', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test error message of collectArkTSEvolutionModuleInfo (useNormalizedOHMUrl is false)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = false;
    this.rollup.share.projectConfig.dependentModuleMap.set('evohar', { language: '1.2' });
    const throwArkTsCompilerErrorStub = sinon.stub(CommonLogger.getInstance(this.rollup.share), 'printErrorAndExit');
    try {
      collectArkTSEvolutionModuleInfo(this.rollup.share);
    } catch (e) {
    }
    expect(throwArkTsCompilerErrorStub.getCall(0).args[0].code === ErrorCode.ETS2BUNDLE_EXTERNAL_COLLECT_INTEROP_INFO_FAILED).to.be.true;
    throwArkTsCompilerErrorStub.restore();
  });

  mocha.it('1-2: test error message of collectArkTSEvolutionModuleInfo (1.2 module information is incorrect)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.dependentModuleMap.set('evohar', { language: '1.2' });
    const throwArkTsCompilerErrorStub = sinon.stub(this.rollup.share, 'throwArkTsCompilerError');
    try {
      collectArkTSEvolutionModuleInfo(this.rollup.share);
    } catch(e) {
    }
    const errMsg: string = 'ArkTS:INTERNAL ERROR: Failed to collect arkTs evolution module info.\n' +
      `Error Message: Failed to collect arkTs evolution module "evohar" info from rollup.`;
    expect(throwArkTsCompilerErrorStub.getCall(0).args[1] === errMsg).to.be.true;
    throwArkTsCompilerErrorStub.restore();
  });

  mocha.it('1-3: test error message of collectArkTSEvolutionModuleInfo (1.1 module information is incorrect)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.dependentModuleMap.set('har', { language: '1.1' });
    const throwArkTsCompilerErrorStub = sinon.stub(this.rollup.share, 'throwArkTsCompilerError');
    try {
      collectArkTSEvolutionModuleInfo(this.rollup.share);
    } catch(e) {
    }
    const errMsg: string = 'ArkTS:INTERNAL ERROR: Failed to collect arkTs evolution module info.\n' +
      `Error Message: Failed to collect arkTs evolution module "har" info from rollup.`;
    expect(throwArkTsCompilerErrorStub.getCall(0).args[1] === errMsg).to.be.true;
    throwArkTsCompilerErrorStub.restore();
  });

  mocha.it('2-1: test generate declFilesInfo in mixed compilation', function () {
    pkgDeclFilesConfig['har'] = {
      packageName: 'har',
      files: {}
    };
    const filePath = '/har/Index.ets'
    const projectConfig = {
      mainModuleName: 'entry',
      bundleName: BUNDLE_NAME_DEFAULT,
      pkgContextInfo: {
        'har': {
          packageName: 'har',
          version: '1.0.0',
          isSO: false
        }
      }
    }
    arkTSModuleMap.set('har', {
      language: '1.1',
      pkgName: 'har',
      declgenV2OutPath: HAR_DECLGENV2OUTPATH
    })
    addDeclFilesConfig(filePath, projectConfig, undefined, '/har', 'har');
    const expectDeclPath: string = `${HAR_DECLGENV2OUTPATH}/Index.d.ets`;
    const expectOhmUrl: string = `@normalized:N&entry&${BUNDLE_NAME_DEFAULT}&har/Index&1.0.0`;
    expect(pkgDeclFilesConfig['har'].files.length !== 0).to.be.true;
    expect(pkgDeclFilesConfig['har'].files['Index'].length !== 0).to.be.true;
    expect(pkgDeclFilesConfig['har'].files['Index'].declPath === expectDeclPath).to.be.true;
    expect(pkgDeclFilesConfig['har'].files['Index'].ohmUrl === expectOhmUrl).to.be.true;
    arkTSModuleMap.clear();
  });
});