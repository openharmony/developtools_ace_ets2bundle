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
import sinon from 'sinon';

import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import { ModulePreviewMode } from '../../../lib/fast_build/ark_compiler/module/module_preview_mode';

mocha.describe('test module_mode file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });
  
  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test the error message of ModulePreviewMode executeArkCompiler', function () {
    this.rollup.preview();
    const modulePreviewMode = new ModulePreviewMode(this.rollup);
    modulePreviewMode.projectConfig.pandaMode = 'invalid value'
    const stub = sinon.stub(modulePreviewMode, 'throwArkTsCompilerError');
    modulePreviewMode.executeArkCompiler();
    expect(stub.calledWith('ArkTS:INTERNAL ERROR: Invalid compilation mode.')).to.be.true;
    stub.restore();
  });
});