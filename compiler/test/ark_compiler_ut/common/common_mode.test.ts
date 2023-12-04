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

import { RELEASE } from '../../../lib/fast_build/ark_compiler/common/ark_define';
import CommonModeMock from '../mock/class_mock/common_mode_mock';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import { ES2ABC_PATH } from '../mock/rollup_mock/path_config';
import { CMD_DEBUG_INFO } from '../mock/rollup_mock/common';

mocha.describe('test common_mode file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test initCmdEnv under build debug', function () {
    this.rollup.build();
    const ModeMock = new CommonModeMock(this.rollup);
    const args: string[] = ModeMock.checkInitCmdEnv();
    expect(args.length === 2).to.be.true;
    expect(args[0].indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(args[1] === CMD_DEBUG_INFO).to.be.true;
  });

  mocha.it('1-2: test initCmdEnv under build release', function () {
    this.rollup.build(RELEASE);
    const ModeMock = new CommonModeMock(this.rollup);
    const args: string[] = ModeMock.checkInitCmdEnv();
    expect(args.length === 1).to.be.true;
    expect(args[0].indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(args[0] === CMD_DEBUG_INFO).to.be.false;
  });

  mocha.it('1-3: test initCmdEnv under preview debug', function () {
    this.rollup.preview();
    const ModeMock = new CommonModeMock(this.rollup);
    const args: string[] = ModeMock.checkInitCmdEnv();
    expect(args.length === 2).to.be.true;
    expect(args[0].indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(args[1] === CMD_DEBUG_INFO).to.be.true;
  });

  mocha.it('1-4: test initCmdEnv under hot reload debug', function () {
    this.rollup.hotReload();
    const ModeMock = new CommonModeMock(this.rollup);
    const args: string[] = ModeMock.checkInitCmdEnv();
    expect(args.length === 2).to.be.true;
    expect(args[0].indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(args[1] === CMD_DEBUG_INFO).to.be.true;
  });
});