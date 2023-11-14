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

import { getBuildModeInLowerCase, getPackageInfo } from '../../../lib/ark_utils';
import { DEBUG, RELEASE } from '../../../lib/fast_build/ark_compiler/common/ark_define';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import { BUNDLE_NAME_DEFAULT, ENTRY_MODULE_NAME_DEFAULT } from '../mock/rollup_mock/common';

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
});

