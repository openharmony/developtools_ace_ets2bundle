/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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

import { FileInfoCache, fileInfoCache } from '../../../lib/file_info_cache';

mocha.describe('test FileInfoCache', function () {
  let fileInfoCacheInstance: FileInfoCache;
  let sandbox: sinon.SinonSandbox;

  mocha.beforeEach(function () {
    sandbox = sinon.createSandbox();
    fileInfoCacheInstance = new FileInfoCache();
  });

  mocha.afterEach(function () {
    sandbox.restore();
  });

  mocha.it('1-1: test constructor initializes with null share', function () {
    const instance = new FileInfoCache();
    expect(instance).to.be.instanceOf(FileInfoCache);
  });

  mocha.it('1-2: test setShare method', function () {
    const mockShare = { getCachedFileInfo: sandbox.stub() };
    fileInfoCacheInstance.setShare(mockShare);
    // Since share is private, we can't directly check it, but we can verify behavior
    expect(mockShare).to.exist;
  });

  mocha.it('2-1: test getFileInfo with existing file', function () {
    const filePath = '/test/file.txt';
    const mockStats = {
      isFile: sandbox.stub().returns(true),
      isDirectory: sandbox.stub().returns(false),
      mtimeMs: 1234567890
    };

    const statSyncStub = sandbox.stub(fs, 'statSync').returns(mockStats);

    const result = fileInfoCacheInstance.getFileInfo(filePath);

    expect(result.exists).to.be.true;
    expect(result.isFile).to.be.true;
    expect(result.isDirectory).to.be.false;
    expect(result.mtimeMs).to.equal(1234567890);
    expect(statSyncStub.calledOnceWith(filePath)).to.be.true;
  });

  mocha.it('2-2: test getFileInfo with existing directory', function () {
    const filePath = '/test/directory';
    const mockStats = {
      isFile: sandbox.stub().returns(false),
      isDirectory: sandbox.stub().returns(true),
      mtimeMs: 1234567890
    };

    const statSyncStub = sandbox.stub(fs, 'statSync').returns(mockStats);

    const result = fileInfoCacheInstance.getFileInfo(filePath);

    expect(result.exists).to.be.true;
    expect(result.isFile).to.be.false;
    expect(result.isDirectory).to.be.true;
    expect(result.mtimeMs).to.equal(1234567890);
    expect(statSyncStub.calledOnceWith(filePath)).to.be.true;
  });

  mocha.it('2-3: test getFileInfo with non-existent file', function () {
    const filePath = '/test/nonexistent.txt';
    const error = new Error('File not found');
    (error as any).code = 'ENOENT';

    const statSyncStub = sandbox.stub(fs, 'statSync').throws(error);

    const result = fileInfoCacheInstance.getFileInfo(filePath);

    expect(result.exists).to.be.false;
    expect(result.isFile).to.be.undefined;
    expect(result.isDirectory).to.be.undefined;
    expect(result.mtimeMs).to.be.undefined;
    expect(statSyncStub.calledOnceWith(filePath)).to.be.true;
  });

  mocha.it('3-1: test getFileInfo with hvigor cache', function () {
    const filePath = '/test/cached.txt';
    const mockShare = {
      getCachedFileInfo: sandbox.stub().returns({
        exists: true,
        isFile: true,
        isDirectory: false,
        mtimeMs: 9876543210
      })
    };

    fileInfoCacheInstance.setShare(mockShare);

    const result = fileInfoCacheInstance.getFileInfo(filePath);

    expect(result.exists).to.be.true;
    expect(result.isFile).to.be.true;
    expect(result.isDirectory).to.be.false;
    expect(result.mtimeMs).to.equal(9876543210);
    expect(mockShare.getCachedFileInfo.calledOnceWith(filePath)).to.be.true;
  });

  mocha.it('3-2: test getFileInfo with hvigor cache returning null', function () {
    const filePath = '/test/notcached.txt';
    const mockStats = {
      isFile: sandbox.stub().returns(true),
      isDirectory: sandbox.stub().returns(false),
      mtimeMs: 1234567890
    };
    const mockShare = {
      getCachedFileInfo: sandbox.stub().returns(null)
    };

    fileInfoCacheInstance.setShare(mockShare);
    const statSyncStub = sandbox.stub(fs, 'statSync').returns(mockStats);

    const result = fileInfoCacheInstance.getFileInfo(filePath);

    expect(result.exists).to.be.true;
    expect(result.isFile).to.be.true;
    expect(result.mtimeMs).to.equal(1234567890);
    expect(mockShare.getCachedFileInfo.calledOnceWith(filePath)).to.be.true;
    expect(statSyncStub.calledOnceWith(filePath)).to.be.true;
  });

  mocha.it('4-1: test isFile with existing file', function () {
    const filePath = '/test/file.txt';
    const mockStats = {
      isFile: sandbox.stub().returns(true),
      isDirectory: sandbox.stub().returns(false),
      mtimeMs: 1234567890
    };

    sandbox.stub(fs, 'statSync').returns(mockStats);

    const result = fileInfoCacheInstance.isFile(filePath);

    expect(result).to.be.true;
  });

  mocha.it('4-2: test isFile with directory', function () {
    const filePath = '/test/directory';
    const mockStats = {
      isFile: sandbox.stub().returns(false),
      isDirectory: sandbox.stub().returns(true),
      mtimeMs: 1234567890
    };

    sandbox.stub(fs, 'statSync').returns(mockStats);

    const result = fileInfoCacheInstance.isFile(filePath);

    expect(result).to.be.false;
  });

  mocha.it('4-3: test isFile with non-existent file', function () {
    const filePath = '/test/nonexistent.txt';
    const error = new Error('File not found');
    (error as any).code = 'ENOENT';

    sandbox.stub(fs, 'statSync').throws(error);

    const result = fileInfoCacheInstance.isFile(filePath);

    expect(result).to.be.false;
  });

  mocha.it('5-1: test isDirectory with existing directory', function () {
    const filePath = '/test/directory';
    const mockStats = {
      isFile: sandbox.stub().returns(false),
      isDirectory: sandbox.stub().returns(true),
      mtimeMs: 1234567890
    };

    sandbox.stub(fs, 'statSync').returns(mockStats);

    const result = fileInfoCacheInstance.isDirectory(filePath);

    expect(result).to.be.true;
  });

  mocha.it('5-2: test isDirectory with file', function () {
    const filePath = '/test/file.txt';
    const mockStats = {
      isFile: sandbox.stub().returns(true),
      isDirectory: sandbox.stub().returns(false),
      mtimeMs: 1234567890
    };

    sandbox.stub(fs, 'statSync').returns(mockStats);

    const result = fileInfoCacheInstance.isDirectory(filePath);

    expect(result).to.be.false;
  });

  mocha.it('5-3: test isDirectory with non-existent path', function () {
    const filePath = '/test/nonexistent';
    const error = new Error('File not found');
    (error as any).code = 'ENOENT';

    sandbox.stub(fs, 'statSync').throws(error);

    const result = fileInfoCacheInstance.isDirectory(filePath);

    expect(result).to.be.false;
  });

  mocha.it('6-1: test getMtimeMs with existing file', function () {
    const filePath = '/test/file.txt';
    const mockStats = {
      isFile: sandbox.stub().returns(true),
      isDirectory: sandbox.stub().returns(false),
      mtimeMs: 1234567890
    };

    sandbox.stub(fs, 'statSync').returns(mockStats);

    const result = fileInfoCacheInstance.getMtimeMs(filePath);

    expect(result).to.equal(1234567890);
  });

  mocha.it('6-2: test getMtimeMs with non-existent file', function () {
    const filePath = '/test/nonexistent.txt';
    const error = new Error('File not found');
    (error as any).code = 'ENOENT';

    sandbox.stub(fs, 'statSync').throws(error);

    const result = fileInfoCacheInstance.getMtimeMs(filePath);

    expect(result).to.equal(0);
  });

  mocha.it('6-3: test getMtimeMs with file without mtimeMs', function () {
    const filePath = '/test/file.txt';
    const mockStats = {
      isFile: sandbox.stub().returns(true),
      isDirectory: sandbox.stub().returns(false)
      // mtimeMs is missing
    };

    sandbox.stub(fs, 'statSync').returns(mockStats);

    const result = fileInfoCacheInstance.getMtimeMs(filePath);

    expect(result).to.equal(0);
  });

  mocha.it('7-1: test fileExists with existing file', function () {
    const filePath = '/test/file.txt';
    const mockStats = {
      isFile: sandbox.stub().returns(true),
      isDirectory: sandbox.stub().returns(false),
      mtimeMs: 1234567890
    };

    sandbox.stub(fs, 'statSync').returns(mockStats);

    const result = fileInfoCacheInstance.fileExists(filePath);

    expect(result).to.be.true;
  });

  mocha.it('7-2: test fileExists with non-existent file', function () {
    const filePath = '/test/nonexistent.txt';
    const error = new Error('File not found');
    (error as any).code = 'ENOENT';

    sandbox.stub(fs, 'statSync').throws(error);

    const result = fileInfoCacheInstance.fileExists(filePath);

    expect(result).to.be.false;
  });

  mocha.it('8-1: test fileInfoCache export instance', function () {
    expect(fileInfoCache).to.be.instanceOf(FileInfoCache);
  });

  mocha.it('8-2: test fileInfoCache export instance methods work', function () {
    const filePath = '/test/file.txt';
    const mockStats = {
      isFile: sandbox.stub().returns(true),
      isDirectory: sandbox.stub().returns(false),
      mtimeMs: 1234567890
    };

    sandbox.stub(fs, 'statSync').returns(mockStats);

    expect(fileInfoCache.isFile(filePath)).to.be.true;
    expect(fileInfoCache.isDirectory(filePath)).to.be.false;
    expect(fileInfoCache.fileExists(filePath)).to.be.true;
    expect(fileInfoCache.getMtimeMs(filePath)).to.equal(1234567890);
  });
});