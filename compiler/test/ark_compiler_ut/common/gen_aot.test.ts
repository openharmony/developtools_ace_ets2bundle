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
import path from "path";
import fs from "fs";
import sinon from 'sinon';
import childProcess from 'child_process';

import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import {
  generateAot,
  generateBuiltinAbc
} from '../../../lib/gen_aot';
import { ModuleMode } from '../../../lib/fast_build/ark_compiler/module/module_mode';
import { TEMPORARY } from '../../../lib/pre_define';

mocha.describe('test gen_aot file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test the error message of generateAot (full)', function () {
    this.rollup.build();
    const moduleMode = new ModuleMode(this.rollup);
    const loggerStub = sinon.stub(moduleMode.logger, 'debug');
    const stub = sinon.stub(moduleMode, 'throwArkTsCompilerError');
    const faultHandler = ((error: string) => { moduleMode.throwArkTsCompilerError(error); })
    const builtinAbcPath = path.join(moduleMode.projectConfig.cachePath, TEMPORARY, 'aot', 'lib_ark_builtins.d.abc');
    try {
      generateAot(moduleMode.arkConfig.arkRootPath, builtinAbcPath, moduleMode.moduleAbcPath,
        moduleMode.projectConfig, moduleMode.logger, faultHandler);
    } catch (e) {
    }
    expect(stub.calledWithMatch('ArkTS:ERROR GenerateAot failed. AppAbc not found in ')).to.be.true;
    expect(stub.calledWithMatch('ArkTS:ERROR GenerateAot failed. unknown anBuildMode: ')).to.be.true;
    loggerStub.restore();
    stub.restore();
  });

  mocha.it('1-2: test the error message of generateAot (partial)', function () {
    this.rollup.build();
    const moduleMode = new ModuleMode(this.rollup);
    const loggerStub = sinon.stub(moduleMode.logger, 'debug');
    const stub = sinon.stub(moduleMode, 'throwArkTsCompilerError');
    const faultHandler = ((error: string) => { moduleMode.throwArkTsCompilerError(error); });
    const builtinAbcPath = path.join(moduleMode.projectConfig.cachePath, TEMPORARY, 'aot', 'lib_ark_builtins.d.abc');
    moduleMode.projectConfig.anBuildMode = 'partial';
    moduleMode.projectConfig.apPath = '';
    try {
      generateAot(moduleMode.arkConfig.arkRootPath, builtinAbcPath, moduleMode.moduleAbcPath,
        moduleMode.projectConfig, moduleMode.logger, faultHandler);
    } catch (e) {
    }
    expect(stub.calledWith('ArkTS:ERROR GenerateAot failed. Invalid profile file path.')).to.be.true;
    expect(stub.calledWithMatch('ArkTS:ERROR GenerateAot failed. Partial mode lost profile in "')).to.be.true;
    loggerStub.restore();
    stub.restore();
  });

  mocha.it('2-1: test the error message of generateBuiltinAbc', function () {
    this.rollup.build();
    const moduleMode = new ModuleMode(this.rollup);
    const loggerStub = sinon.stub(moduleMode.logger, 'debug');
    const execSyncStub = sinon.stub(childProcess, 'execSync');
    const stub = sinon.stub(moduleMode, 'throwArkTsCompilerError');
    const faultHandler = ((error: string) => { moduleMode.throwArkTsCompilerError(error); })
    try {
      generateBuiltinAbc(moduleMode.arkConfig.arkRootPath, moduleMode.initCmdEnv(),
        moduleMode.projectConfig.cachePath, moduleMode.logger, faultHandler, moduleMode.projectConfig.pandaMode);
    } catch (e) {
    }
    expect(stub.calledWithMatch('ArkTS:ERROR Failed to generate builtin to abc.\n')).to.be.true;
    loggerStub.restore();
    execSyncStub.restore();
    stub.restore();
  });
});