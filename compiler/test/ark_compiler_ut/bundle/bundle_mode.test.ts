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
import sinon from 'sinon';
import fs from 'fs';
import cluster from 'cluster';

import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import { BundleMode } from '../../../lib/fast_build/ark_compiler/bundle/bundle_mode';


mocha.describe('test bundle_mode file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test error message of executeCompiler', function () {
    this.rollup.build();
    const rollupBundleFileSet: Object = {
      'test.js': {
        'type': 'asset',
        'source': 'test'
      }
    };
    const bundleMode =  new BundleMode(this.rollup, rollupBundleFileSet);
    bundleMode.projectConfig.pandaMode = 'invalid value';
    const stub = sinon.stub(bundleMode, 'throwArkTsCompilerError');
    bundleMode.executeArkCompiler();
    expect(stub.calledWith('ArkTS:INTERNAL ERROR: Invalid compilation mode.')).to.be.true;
    stub.restore();
  });

  mocha.it('2-1: test the error message of executeEs2AbcCmd handler error', async function () {
    this.rollup.build();
    const rollupBundleFileSet: Object = {
      'test.js': {
        'type': 'asset',
        'source': 'test'
      }
    };
    const bundleMode =  new BundleMode(this.rollup, rollupBundleFileSet);
    const triggerAsyncStub = sinon.stub(bundleMode, 'triggerAsync').throws(new Error('Execution failed'));
    const stub = sinon.stub(bundleMode, 'throwArkTsCompilerError');
    try {
      bundleMode.executeEs2AbcCmd();
    } catch (e) {
    }
    expect(stub.calledWithMatch('ArkTS:ERROR failed to execute es2abc with async handler: ')).to.be.true;
    triggerAsyncStub.restore();
    stub.restore();
  });

  mocha.it('3-1: test the error message of collectBundleFileList(file.type is invalid value)', function () {
    this.rollup.build();
    const rollupBundleFileSet: Object = {
      'test.js': {
        'type': ''
      }
    };
    const stub = sinon.stub(this.rollup.share, 'throwArkTsCompilerError');
    new BundleMode(this.rollup, rollupBundleFileSet);
    expect(stub.calledWith('ArkTS:INTERNAL ERROR: Failed to retrieve source code ' +
      'for test.js from rollup file set.')).to.be.true;
    stub.restore();
  });

  mocha.it('3-2: test the error message of collectBundleFileList', function () {
    this.rollup.build();
    const rollupBundleFileSet: Object = {
      'test.js': {
          'type': 'asset',
          'source': 'test'
      }
    };
    const existsSyncStub = sinon.stub(fs, 'existsSync').callsFake((path) => {
      const pattern = /test\.temp\.js$/;
      if (pattern.test(path)) {
        return false;
      }
      return true;
    });
    const stub = sinon.stub(this.rollup.share, 'throwArkTsCompilerError');
    try {
      new BundleMode(this.rollup, rollupBundleFileSet);
    } catch (e) {
    }
    expect(stub.calledWith('ArkTS:INTERNAL ERROR: Failed to generate cached source file: test.js')).to.be.true;
    existsSyncStub.restore();
    stub.restore();
  });

  mocha.it('4-1: test the error message of filterBundleFileListWithHashJson', function () {
    this.rollup.build();
    const rollupBundleFileSet: Object = {
      'test.js': {
        'type': 'asset',
        'source': 'test'
      }
    };
    const bundleMode =  new BundleMode(this.rollup, rollupBundleFileSet);
    const jsonData = JSON.stringify(rollupBundleFileSet, null, 2);
    const stub = sinon.stub(bundleMode, 'throwArkTsCompilerError');
    for (const value of bundleMode.intermediateJsBundle.values()) {
      fs.unlinkSync(value.cacheFilePath);
    }
    fs.writeFileSync(bundleMode.hashJsonFilePath, jsonData)
    bundleMode.filterBundleFileListWithHashJson();
    expect(stub.calledWithMatch('ArkTS:INTERNAL ERROR: Failed to get bundle cached abc from ')).to.be.true;
    stub.restore();
  });

  mocha.it('5-1: test the error message of invokeTs2AbcWorkersToGenAbc(worker error)', function () {
    this.rollup.build();
    const rollupBundleFileSet: Object = {
      'test.js': {
        'type': 'asset',
        'source': 'test'
      }
    };
    const bundleMode =  new BundleMode(this.rollup, rollupBundleFileSet);
    const stub = sinon.stub(bundleMode, 'throwArkTsCompilerError');
    const clusterStub = sinon.stub(cluster, 'fork');
    const fakeWorker = {
      on: sinon.stub()
    };
    clusterStub.returns(fakeWorker);
    const splittedBundles = bundleMode.getSplittedBundles()
    try {
      fakeWorker.on.withArgs('message').callsFake((event, callback) => {
        callback({ data: 'error' });
      });
      bundleMode.invokeTs2AbcWorkersToGenAbc(splittedBundles)
    } catch (e) {
    }
    expect(stub.calledWith('ArkTS:ERROR Failed to execute ts2abc')).to.be.true;
    clusterStub.restore();
    stub.restore();
  });

  mocha.it('6-1: test the error message of writeHashJson', function () {
    this.rollup.build();
    const rollupBundleFileSet: Object = {
      'test.js': {
        'type': 'asset',
        'source': 'test'
      }
    };
    const bundleMode =  new BundleMode(this.rollup, rollupBundleFileSet);
    const stub = sinon.stub(bundleMode, 'throwArkTsCompilerError');
    try {
      bundleMode.writeHashJson();
    } catch (e) {
    }
    expect(stub.calledWithMatch('ArkTS:INTERNAL ERROR: During hash JSON file generation, ')).to.be.true;
    stub.restore();
  });

  mocha.it('7-1: test the error message of copyFileFromCachePathToOutputPath', function () {
    this.rollup.build();
    const rollupBundleFileSet: Object = {
      'test.js': {
        'type': 'asset',
        'source': 'test'
      }
    };
    const bundleMode =  new BundleMode(this.rollup, rollupBundleFileSet);
    const stub = sinon.stub(bundleMode, 'throwArkTsCompilerError');
    try {
      bundleMode.copyFileFromCachePathToOutputPath();
    } catch (e) {
    }
    expect(stub.calledWithMatch('not found during incremental build. ' +
      'Please try to rebuild the project')).to.be.true;
    stub.restore();
  });
});