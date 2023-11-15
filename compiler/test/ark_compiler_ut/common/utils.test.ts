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

import { needAotCompiler } from '../../../lib/fast_build/ark_compiler/utils';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import {
  AOT_FULL,
  AOT_PARTIAL,
  AOT_TYPE
} from '../../../lib/pre_define';
import {
  ESMODULE,
  JSBUNDLE,
  RELEASE
} from '../../../lib/fast_build/ark_compiler/common/ark_define';

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
});