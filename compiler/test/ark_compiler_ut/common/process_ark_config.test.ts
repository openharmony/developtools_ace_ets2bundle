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
import { NODE } from '../mock/rollup_mock/common';
import {
  ES2ABC_PATH,
  TS2ABC_PATH,
  MERGERABC_PATH,
  JS2ABC_PATH,
  AOTCOMPILER_PATH,
  ARKROOT_PATH
} from '../mock/rollup_mock/path_config';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import { initArkConfig } from '../../../lib/fast_build/ark_compiler/common/process_ark_config';

mocha.describe('test process_ark_config file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test initArkConfig under build debug', function () {
    this.rollup.build();
    const arkConfig = initArkConfig(this.rollup.share.projectConfig);

    expect(arkConfig.nodePath === NODE).to.be.true;
    expect(arkConfig.es2abcPath.indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(TS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.mergeAbcPath.indexOf(MERGERABC_PATH) > 0).to.be.true;
    expect(arkConfig.js2abcPath.indexOf(JS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.aotCompilerPath.indexOf(AOTCOMPILER_PATH) > 0).to.be.true;
    expect(arkConfig.isDebug === true).to.be.true;
    expect(arkConfig.arkRootPath.indexOf(ARKROOT_PATH) > 0).to.be.true;
  });

  mocha.it('1-2: test initArkConfig under build release', function () {
    this.rollup.build(RELEASE);
    const arkConfig = initArkConfig(this.rollup.share.projectConfig);

    expect(arkConfig.nodePath === NODE).to.be.true;
    expect(arkConfig.es2abcPath.indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(TS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.mergeAbcPath.indexOf(MERGERABC_PATH) > 0).to.be.true;
    expect(arkConfig.js2abcPath.indexOf(JS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.aotCompilerPath.indexOf(AOTCOMPILER_PATH) > 0).to.be.true;
    expect(arkConfig.isDebug === false).to.be.true;
    expect(arkConfig.arkRootPath.indexOf(ARKROOT_PATH) > 0).to.be.true;
  });

  mocha.it('1-3: test initArkConfig under preview debug', function () {
    this.rollup.preview();
    const arkConfig = initArkConfig(this.rollup.share.projectConfig);

    expect(arkConfig.nodePath === NODE).to.be.true;
    expect(arkConfig.es2abcPath.indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(TS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.mergeAbcPath.indexOf(MERGERABC_PATH) > 0).to.be.true;
    expect(arkConfig.js2abcPath.indexOf(JS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.aotCompilerPath.indexOf(AOTCOMPILER_PATH) > 0).to.be.true;
    expect(arkConfig.isDebug === true).to.be.true;
    expect(arkConfig.arkRootPath.indexOf(ARKROOT_PATH) > 0).to.be.true;
  });

  mocha.it('1-4: test initArkConfig under hot reload debug', function () {
    this.rollup.hotReload();
    const arkConfig = initArkConfig(this.rollup.share.projectConfig);

    expect(arkConfig.nodePath === NODE).to.be.true;
    expect(arkConfig.es2abcPath.indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(TS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.mergeAbcPath.indexOf(MERGERABC_PATH) > 0).to.be.true;
    expect(arkConfig.js2abcPath.indexOf(JS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.aotCompilerPath.indexOf(AOTCOMPILER_PATH) > 0).to.be.true;
    expect(arkConfig.isDebug === true).to.be.true;
    expect(arkConfig.arkRootPath.indexOf(ARKROOT_PATH) > 0).to.be.true;
  });
})