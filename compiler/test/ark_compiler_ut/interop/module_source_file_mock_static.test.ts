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
import fs from 'fs';
import os from 'os';
import path from 'path';
import sinon from 'sinon';
import * as ts from 'typescript';

import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import { ModuleSourceFile } from '../../../lib/fast_build/ark_compiler/module/module_source_file';
import { FileManager } from '../../../lib/fast_build/ark_compiler/interop/interop_manager';
import { ARKTS_1_2 } from '../../../lib/fast_build/ark_compiler/interop/pre_define';
import { checkArkCompilerCacheInfo } from '../../../lib/fast_build/ark_compiler/cache';
import { IS_CACHE_INVALID } from '../../../lib/fast_build/ark_compiler/common/ark_define';
import { compilerOptions } from '../../../lib/ets_checker';
import {
  SubsystemCode,
  ArkTSErrorDescription,
  ErrorCode
} from '../../../lib/fast_build/ark_compiler/error_code';
import {
  CommonLogger,
  LogData,
  LogDataFactory
} from '../../../lib/fast_build/ark_compiler/logger';

const MOCK_CONFIG_NAME: string = 'mock-config.json5';
const MOCK_SOURCE_SOLUTION: string[] = ['Please replace the mock source with an ArkTS 1.1 (dynamic) file, ' +
'or remove the "use static" directive from it.'];

let tempDir: string = '';
let rollup: RollUpPluginMock;
let packageManagerTypeDescriptor: PropertyDescriptor | undefined;

function writeMockFile(relativePath: string, useStatic: boolean): string {
  const filePath: string = path.join(tempDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, useStatic ? '"use static";\nexport default {};\n' : 'export default {};\n');
  return filePath;
}

function setupTempMockProject(mockConfigContent: string, mockParamsExtra?: Object): void {
  rollup.build();
  rollup.share.projectConfig.isLocalTest = true;
  rollup.share.projectConfig.modulePath = tempDir;
  rollup.share.projectConfig.mockParams = Object.assign({
    decorator: '@MockSetup',
    packageName: '@ohos/hamock',
    etsSourceRootPath: 'src/main/ets',
    mockConfigPath: path.join(tempDir, MOCK_CONFIG_NAME)
  }, mockParamsExtra || {});
  fs.writeFileSync(path.join(tempDir, MOCK_CONFIG_NAME), mockConfigContent);
  CommonLogger.destroyInstance();
  ModuleSourceFile.cleanUpObjects();
  ModuleSourceFile.initPluginEnv(rollup);
}

function stubPrintErrorAndExit(): sinon.SinonStub {
  const hvigorConsoleLogger = rollup.share.getHvigorConsoleLogger(SubsystemCode.ETS2BUNDLE);
  return sinon.stub(hvigorConsoleLogger, 'printErrorAndExit');
}

function setupMockImport(importerPath: string, targetPath: string): ModuleSourceFile {
  rollup.share.projectConfig.useNormalizedOHMUrl = true;
  rollup.share.projectConfig.mixCompile = false;
  ModuleSourceFile.projectConfig.pkgContextInfo = {
    entry: { packageName: 'entry', bundleName: '', moduleName: '', version: '', isSO: false }
  };
  for (const id of [importerPath, targetPath, path.join(tempDir, 'src/mock/CalcMock.ts')]) {
    rollup.moduleInfos.push({ id, meta: { pkgName: 'entry', pkgPath: tempDir } });
  }
  ModuleSourceFile.setProcessMock(rollup);
  return new ModuleSourceFile(importerPath, '', undefined);
}

mocha.describe('test mock config static file validation in module_source_file', function () {
  mocha.before(function () {
    rollup = new RollUpPluginMock();
  });

  mocha.after(function () {
    ModuleSourceFile.cleanUpObjects();
    FileManager.cleanFileManagerObject();
    CommonLogger.destroyInstance();
  });

  mocha.beforeEach(function () {
    // Isolate fixtures from the checker's cached file/directory existence results.
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mock-static-ut-'));
    packageManagerTypeDescriptor = Object.getOwnPropertyDescriptor(compilerOptions, 'packageManagerType');
    // The real checker converts the tsconfig string to the enum before genAbc runs.
    sinon.stub(compilerOptions, 'moduleResolution').value(ts.ModuleResolutionKind.NodeJs);
    compilerOptions.packageManagerType = 'ohpm';
  });

  mocha.afterEach(function () {
    sinon.restore();
    fs.rmSync(tempDir, { recursive: true, force: true });
    if (packageManagerTypeDescriptor) {
      Object.defineProperty(compilerOptions, 'packageManagerType', packageManagerTypeDescriptor);
    } else {
      delete compilerOptions.packageManagerType;
    }
  });

  mocha.it('1: report error when mock source file is static', function () {
    writeMockFile('src/mock/I18nMock.ts', true);
    writeMockFile('src/mock/calc.mock.ts', false);
    setupTempMockProject(JSON.stringify({
      '@ohos.i18n': { source: 'src/mock/I18nMock.ts' },
      './src/main/ets/calc': { source: 'src/mock/calc.mock.ts' }
    }));
    const stub = stubPrintErrorAndExit();
    ModuleSourceFile.collectMockConfigInfo(rollup);
    const expectedError: LogData = LogDataFactory.newInstance(
      ErrorCode.ETS2BUNDLE_EXTERNAL_MOCK_SOURCE_IS_STATIC_FILE,
      ArkTSErrorDescription,
      `The source file 'src/mock/I18nMock.ts' of the mock target '@ohos.i18n' in mock-config.json5 ` +
      'is a static (ArkTS 1.2) file.',
      '',
      MOCK_SOURCE_SOLUTION
    );
    expect(stub.calledOnce).to.be.true;
    expect(stub.calledWith(expectedError)).to.be.true;
    expect(ModuleSourceFile.mockFiles).to.deep.equal(['src/mock/I18nMock.ts', 'src/mock/calc.mock.ts']);
    stub.restore();
  });

  mocha.it('2: no error when all mock files are dynamic', function () {
    writeMockFile('src/mock/I18nMock.ts', false);
    writeMockFile('src/mock/calc.mock.ts', false);
    setupTempMockProject(JSON.stringify({
      '@ohos.i18n': { source: 'src/mock/I18nMock.ts' },
      './src/main/ets/calc': { source: 'src/mock/calc.mock.ts' }
    }));
    const stub = stubPrintErrorAndExit();
    ModuleSourceFile.collectMockConfigInfo(rollup);
    expect(stub.notCalled).to.be.true;
    expect(ModuleSourceFile.mockFiles).to.deep.equal(['src/mock/I18nMock.ts', 'src/mock/calc.mock.ts']);
    stub.restore();
  });

  mocha.it('3: skip validation without crash when mock source file does not exist', function () {
    writeMockFile('src/mock/calc.mock.ts', false);
    setupTempMockProject(JSON.stringify({
      '@ohos.i18n': { source: 'src/mock/not-exist/I18nMock.ts' },
      './src/main/ets/calc': { source: 'src/mock/calc.mock.ts' }
    }));
    const stub = stubPrintErrorAndExit();
    ModuleSourceFile.collectMockConfigInfo(rollup);
    expect(stub.notCalled).to.be.true;
    expect(ModuleSourceFile.mockFiles).to.deep.equal(['src/mock/not-exist/I18nMock.ts', 'src/mock/calc.mock.ts']);
    stub.restore();
  });

  mocha.it('4: report error and stop processing when mocked target file is static', function () {
    // mockConfigKey2ModuleInfo only carries entries for hsp mock
    // targets, so the key here uses a package name form like a real hsp dependency.
    const mockedTargetPath: string = writeMockFile('src/main/ets/calc.ets', true);
    writeMockFile('src/mock/calc.mock.ts', false);
    setupTempMockProject(JSON.stringify({
      'library': { source: 'src/mock/calc.mock.ts' }
    }), {
      mockConfigKey2ModuleInfo: {
        'library': { filePath: mockedTargetPath }
      }
    });
    const expectedError: LogData = LogDataFactory.newInstance(
      ErrorCode.ETS2BUNDLE_EXTERNAL_MOCK_TARGET_IS_STATIC_FILE,
      ArkTSErrorDescription,
      `The mocked target 'library' in mock-config.json5 is a static (ArkTS 1.2) file: ` +
      `'${mockedTargetPath}'.`,
      '',
      ['Please mock an ArkTS 1.1 (dynamic) module instead, or remove the "use static" directive from the mocked file.']
    );
    const stub = stubPrintErrorAndExit().throws(expectedError);
    let caught: unknown = undefined;
    try {
      ModuleSourceFile.collectMockConfigInfo(rollup);
    } catch (err) {
      caught = err;
    }
    expect(caught).to.equal(expectedError);
    expect(stub.calledOnce).to.be.true;
    expect(ModuleSourceFile.mockFiles).to.be.empty;
    stub.restore();
  });

  mocha.it('5: report error when mocked target is a static SDK request', function () {
    writeMockFile('src/mock/staticApi.mock.ts', false);
    setupTempMockProject(JSON.stringify({
      'static@hilog': { source: 'src/mock/staticApi.mock.ts' }
    }));
    const stub = stubPrintErrorAndExit();
    ModuleSourceFile.collectMockConfigInfo(rollup);
    const expectedError: LogData = LogDataFactory.newInstance(
      ErrorCode.ETS2BUNDLE_EXTERNAL_MOCK_TARGET_IS_STATIC_FILE,
      ArkTSErrorDescription,
      `The mocked target 'static@hilog' in mock-config.json5 is a static (ArkTS 1.2) module.`,
      '',
      ['Please mock an ArkTS 1.1 (dynamic) module instead of a static one.']
    );
    expect(stub.calledOnce).to.be.true;
    expect(stub.calledWith(expectedError)).to.be.true;
    stub.restore();
  });

  mocha.it('6: skip target validation for absent keys, empty or missing target files', function () {
    const dynamicTargetPath: string = writeMockFile('src/main/ets/dynamic.ets', false);
    setupTempMockProject(JSON.stringify({
      '@ohos.i18n': { source: 'src/mock/I18nMock.ts' }
    }));
    // mockConfigKey2ModuleInfo only carries hsp entries; use package name forms.
    ModuleSourceFile.mockConfigKeyToModuleInfo = {
      'empty-hsp': { filePath: '' },
      'missing-hsp': { filePath: path.join(tempDir, 'not-exist/lib.ets') },
      'dynamic-hsp': { filePath: dynamicTargetPath }
    };
    const stub = stubPrintErrorAndExit();
    ModuleSourceFile.validateMockTargetIsNotStaticFile('empty-hsp', rollup);
    ModuleSourceFile.validateMockTargetIsNotStaticFile('missing-hsp', rollup);
    ModuleSourceFile.validateMockTargetIsNotStaticFile('dynamic-hsp', rollup);
    ModuleSourceFile.validateMockTargetIsNotStaticFile('@ohos.bluetooth', rollup);
    expect(stub.notCalled).to.be.true;
    stub.restore();
  });

  mocha.it('7: resolve mock source path through source2ModuleIdMap', function () {
    writeMockFile('src/mock/I18nMock.ts', false);
    const aliasedStaticPath: string = writeMockFile('src/mock/aliased/StaticMock.ts', true);
    writeMockFile('src/mock/calc.mock.ts', false);
    setupTempMockProject(JSON.stringify({
      '@ohos.i18n': { source: 'src/mock/I18nMock.ts' },
      './src/main/ets/calc': { source: 'src/mock/calc.mock.ts' }
    }), {
      source2ModuleIdMap: new Map([['src/mock/I18nMock.ts', aliasedStaticPath]])
    });
    const stub = stubPrintErrorAndExit();
    ModuleSourceFile.collectMockConfigInfo(rollup);
    const expectedError: LogData = LogDataFactory.newInstance(
      ErrorCode.ETS2BUNDLE_EXTERNAL_MOCK_SOURCE_IS_STATIC_FILE,
      ArkTSErrorDescription,
      `The source file 'src/mock/I18nMock.ts' of the mock target '@ohos.i18n' in mock-config.json5 ` +
      'is a static (ArkTS 1.2) file.',
      '',
      MOCK_SOURCE_SOLUTION
    );
    expect(stub.calledOnce).to.be.true;
    expect(stub.calledWith(expectedError)).to.be.true;
    stub.restore();

    setupTempMockProject(JSON.stringify({
      '@ohos.i18n': { source: 'src/mock/I18nMock.ts' }
    }), {
      source2ModuleIdMap: new Map([['src/mock/unrelated.ts', path.join(tempDir, 'src/mock/I18nMock.ts')]])
    });
    const missingKeyStub = stubPrintErrorAndExit();
    ModuleSourceFile.collectMockConfigInfo(rollup);
    expect(missingKeyStub.notCalled).to.be.true;
    missingKeyStub.restore();
  });

  mocha.it('8: detect static mock source by language version from FileManager', function () {
    writeMockFile('src/mock/I18nMock.ts', false);
    setupTempMockProject(JSON.stringify({
      '@ohos.i18n': { source: 'src/mock/I18nMock.ts' }
    }));
    const fileManager = FileManager.getInstance();
    const languageStub = sinon.stub(fileManager, 'getLanguageVersionByFilePath')
      .returns({ languageVersion: ARKTS_1_2, pkgName: 'entry' });
    const stub = stubPrintErrorAndExit();
    ModuleSourceFile.collectMockConfigInfo(rollup);
    expect(stub.calledOnce).to.be.true;
    expect(stub.firstCall.args[0].code).to.equal(ErrorCode.ETS2BUNDLE_EXTERNAL_MOCK_SOURCE_IS_STATIC_FILE);
    languageStub.restore();
    stub.restore();
  });

  mocha.it('9: report error when mock-config.json5 does not exist', function () {
    const notExistConfigPath: string = path.join(tempDir, 'not-exist-mock-config.json5');
    setupTempMockProject('{}', {
      mockConfigPath: notExistConfigPath
    });
    const stub = stubPrintErrorAndExit();
    ModuleSourceFile.collectMockConfigInfo(rollup);
    expect(stub.calledOnce).to.be.true;
    const reportedError: LogData = stub.firstCall.args[0];
    expect(reportedError.code).to.equal(ErrorCode.ETS2BUNDLE_EXTERNAL_MOCK_CONFIG_READ_FAILED);
    expect(reportedError.cause).to.include(notExistConfigPath);
    expect(ModuleSourceFile.mockFiles).to.be.empty;
    stub.restore();
  });

  mocha.it('10: report error when mock-config.json5 contains invalid JSON5', function () {
    setupTempMockProject('{ this is not valid json5 content');
    const stub = stubPrintErrorAndExit();
    ModuleSourceFile.collectMockConfigInfo(rollup);
    expect(stub.calledOnce).to.be.true;
    const reportedError: LogData = stub.firstCall.args[0];
    expect(reportedError.code).to.equal(ErrorCode.ETS2BUNDLE_EXTERNAL_MOCK_CONFIG_READ_FAILED);
    expect(reportedError.cause).to.include(path.join(tempDir, MOCK_CONFIG_NAME));
    expect(ModuleSourceFile.mockFiles).to.be.empty;
    stub.restore();
  });

  mocha.it('12: keep cache valid when mock config is readable and unchanged', function () {
    writeMockFile('src/mock/I18nMock.ts', false);
    const mockConfigContent: string = JSON.stringify({
      '@ohos.i18n': { source: 'src/mock/I18nMock.ts' }
    });
    rollup.build();
    rollup.share.projectConfig.isPreview = true;
    rollup.share.projectConfig.isOhosTest = true;
    const cachePath: string = path.join(tempDir, 'cache');
    fs.mkdirSync(cachePath, { recursive: true });
    fs.writeFileSync(path.join(cachePath, 'mock-config.json'), '{}');
    fs.writeFileSync(path.join(cachePath, 'mock-config.json5'), mockConfigContent);
    rollup.share.projectConfig.cachePath = cachePath;
    rollup.share.projectConfig.mockParams = {
      decorator: '@MockSetup',
      packageName: '@ohos/hamock',
      etsSourceRootPath: 'src/main',
      mockConfigPath: path.join(tempDir, MOCK_CONFIG_NAME)
    };
    fs.writeFileSync(path.join(tempDir, MOCK_CONFIG_NAME), mockConfigContent);
    checkArkCompilerCacheInfo(rollup);
    rollup.cache.set(IS_CACHE_INVALID, false);
    checkArkCompilerCacheInfo(rollup);
    expect(rollup.cache.get(IS_CACHE_INVALID)).to.be.false;
  });

  mocha.it('14: generateNewMockInfo falls back to modulePath when map misses the source', function () {
    writeMockFile('src/mock/I18nMock.ts', false);
    setupTempMockProject(JSON.stringify({
      '@ohos.i18n': { source: 'src/mock/I18nMock.ts' }
    }), {
      source2ModuleIdMap: new Map([['src/mock/unrelated.ts', path.join(tempDir, 'src/mock/unrelated.ts')]])
    });
    rollup.share.projectConfig.useNormalizedOHMUrl = true;
    ModuleSourceFile.projectConfig.pkgContextInfo = {
      entry: {
        packageName: 'entry',
        bundleName: '',
        moduleName: '',
        version: '',
        entryPath: 'Index.ets',
        isSO: false
      }
    };
    const mockFilePath: string = path.join(tempDir, 'src/mock/I18nMock.ts');
    rollup.moduleInfos.push({ id: mockFilePath, meta: { pkgName: 'entry', pkgPath: tempDir } });
    ModuleSourceFile.mockConfigInfo = {
      '@ohos.i18n': { source: 'src/mock/I18nMock.ts' }
    };
    let threw: unknown = undefined;
    try {
      ModuleSourceFile.generateNewMockInfo('@ohos.i18n', '@ohos:i18n', rollup, '');
    } catch (err) {
      threw = err;
    }
    expect(threw).to.be.undefined;
    expect(ModuleSourceFile.newMockConfigInfo).to.have.property('@ohos:i18n');
    rollup.share.projectConfig.useNormalizedOHMUrl = false;
    ModuleSourceFile.projectConfig.pkgContextInfo = {};
  });

  mocha.it('15: isMockFile recognizes mock files outside modulePath via source2ModuleIdMap', function () {
    const externalMockPath: string = path.join(tempDir, 'external-module', 'ExtMock.ts');
    fs.mkdirSync(path.dirname(externalMockPath), { recursive: true });
    fs.writeFileSync(externalMockPath, 'export default {};\n');
    setupTempMockProject(JSON.stringify({
      '@ohos.i18n': { source: 'src/mock/I18nMock.ts' }
    }), {
      source2ModuleIdMap: new Map([['src/mock/I18nMock.ts', externalMockPath]])
    });
    ModuleSourceFile.needProcessMock = true;
    ModuleSourceFile.mockFiles = ['src/mock/I18nMock.ts'];
    // The real mock file resolved through the map must be recognized.
    expect(ModuleSourceFile.isMockFile(externalMockPath, rollup)).to.be.true;
    // The stale modulePath concatenation is no longer the mock file identity once the map resolves it.
    expect(ModuleSourceFile.isMockFile(path.join(tempDir, 'src/mock/I18nMock.ts'), rollup)).to.be.false;
    expect(ModuleSourceFile.isMockFile(path.join(tempDir, 'src/mock/other.ts'), rollup)).to.be.false;
    ModuleSourceFile.needProcessMock = false;
  });

  mocha.it('16: validate mock source via modulePath fallback when map misses the source', function () {
    writeMockFile('src/mock/I18nMock.ts', true);
    setupTempMockProject(JSON.stringify({
      '@ohos.i18n': { source: 'src/mock/I18nMock.ts' }
    }), {
      source2ModuleIdMap: new Map([['src/mock/unrelated.ts', path.join(tempDir, 'src/mock/unrelated.ts')]])
    });
    const stub = stubPrintErrorAndExit();
    ModuleSourceFile.collectMockConfigInfo(rollup);
    expect(stub.calledOnce).to.be.true;
    expect(stub.firstCall.args[0].code).to.equal(ErrorCode.ETS2BUNDLE_EXTERNAL_MOCK_SOURCE_IS_STATIC_FILE);
    stub.restore();
  });

  mocha.it('17: invalidate cache when mock config content changes between builds', function () {
    writeMockFile('src/mock/I18nMock.ts', false);
    const firstMockConfigContent: string = JSON.stringify({
      '@ohos.i18n': { source: 'src/mock/I18nMock.ts' }
    });
    rollup.build();
    rollup.share.projectConfig.isPreview = true;
    rollup.share.projectConfig.isOhosTest = true;
    const cachePath: string = path.join(tempDir, 'cache');
    fs.mkdirSync(cachePath, { recursive: true });
    fs.writeFileSync(path.join(cachePath, 'mock-config.json'), '{}');
    fs.writeFileSync(path.join(cachePath, 'mock-config.json5'), firstMockConfigContent);
    rollup.share.projectConfig.cachePath = cachePath;
    rollup.share.projectConfig.mockParams = {
      decorator: '@MockSetup',
      packageName: '@ohos/hamock',
      etsSourceRootPath: 'src/main',
      mockConfigPath: path.join(tempDir, MOCK_CONFIG_NAME)
    };
    fs.writeFileSync(path.join(tempDir, MOCK_CONFIG_NAME), firstMockConfigContent);
    // The first call stores the current meta info; the second one has matching meta info,
    // so the invalidation must come from the mock config content comparison.
    checkArkCompilerCacheInfo(rollup);
    rollup.cache.set(IS_CACHE_INVALID, false);
    // Simulate the user editing mock-config.json5 between two incremental builds.
    const secondMockConfigContent: string = JSON.stringify({
      '@ohos.i18n': { source: 'src/mock/anotherMock.ts' }
    });
    fs.writeFileSync(path.join(tempDir, MOCK_CONFIG_NAME), secondMockConfigContent);
    checkArkCompilerCacheInfo(rollup);
    expect(rollup.cache.get(IS_CACHE_INVALID)).to.be.true;
  });

  mocha.it('18: generateNewMockInfo resolves the ohmurl through source2ModuleIdMap when map hits the source', function () {
    const externalMockPath: string = path.join(tempDir, 'external-module', 'ExtMock.ts');
    fs.mkdirSync(path.dirname(externalMockPath), { recursive: true });
    fs.writeFileSync(externalMockPath, 'export default {};\n');
    setupTempMockProject(JSON.stringify({
      '@ohos.i18n': { source: 'src/mock/I18nMock.ts' }
    }), {
      source2ModuleIdMap: new Map([['src/mock/I18nMock.ts', externalMockPath]])
    });
    rollup.share.projectConfig.useNormalizedOHMUrl = true;
    ModuleSourceFile.projectConfig.pkgContextInfo = {
      entry: {
        packageName: 'entry',
        bundleName: '',
        moduleName: '',
        version: '',
        entryPath: 'Index.ets',
        isSO: false
      }
    };
    rollup.moduleInfos.push({ id: externalMockPath, meta: { pkgName: 'entry', pkgPath: tempDir } });
    ModuleSourceFile.mockConfigInfo = {
      '@ohos.i18n': { source: 'src/mock/I18nMock.ts' }
    };
    ModuleSourceFile.generateNewMockInfo('@ohos.i18n', '@ohos:i18n', rollup, '');
    // The ohmurl must be derived from the external mock file resolved through the map,
    // not from the modulePath concatenation of the source key.
    const expectedOhmUrl: string = '@normalized:N&entry&&entry/external-module/ExtMock&';
    expect(ModuleSourceFile.newMockConfigInfo['@ohos:i18n'].source).to.equal(expectedOhmUrl);
    // The module info of the external mock file must be marked as a mock file.
    expect(rollup.moduleInfos.find((item): boolean => item.id === externalMockPath).meta.isMockFile).to.be.true;
    rollup.share.projectConfig.useNormalizedOHMUrl = false;
    ModuleSourceFile.projectConfig.pkgContextInfo = {};
  });
  for (const packageName of ['static-har', '@scope/static-har']) {
    mocha.it(`reject static HAR target ${packageName} without HSP metadata`, function () {
      const targetPath = writeMockFile(`oh_modules/${packageName}/Index.ets`, true);
      fs.writeFileSync(path.join(path.dirname(targetPath), 'oh-package.json5'), JSON.stringify({
        name: packageName, version: '1.0.0', main: 'Index.ets'
      }));
      writeMockFile('src/mock/HarMock.ts', false);
      setupTempMockProject(JSON.stringify({ [packageName]: { source: 'src/mock/HarMock.ts' } }));
      const stub = stubPrintErrorAndExit().throws(new Error('static mock target'));
      expect(() => ModuleSourceFile.collectMockConfigInfo(rollup)).to.throw('static mock target');
      expect(stub.firstCall.args[0].code).to.equal(ErrorCode.ETS2BUNDLE_EXTERNAL_MOCK_TARGET_IS_STATIC_FILE);
      expect(stub.firstCall.args[0].cause).to.include(targetPath);
      expect(ModuleSourceFile.mockFiles).to.be.empty;
    });
  }

  for (const target of ['common/StaticCalc.ets', 'common/StaticCalc.ts']) {
    mocha.it(`reject static single-file target ${target} without HSP metadata`, function () {
      const targetPath = writeMockFile(`src/main/ets/${target}`, true);
      writeMockFile('src/mock/CalcMock.ts', false);
      setupTempMockProject(JSON.stringify({ [target]: { source: 'src/mock/CalcMock.ts' } }));
      const stub = stubPrintErrorAndExit().throws(new Error('static mock target'));
      expect(() => ModuleSourceFile.collectMockConfigInfo(rollup)).to.throw('static mock target');
      expect(stub.firstCall.args[0].code).to.equal(ErrorCode.ETS2BUNDLE_EXTERNAL_MOCK_TARGET_IS_STATIC_FILE);
      expect(stub.firstCall.args[0].cause).to.include(targetPath);
      expect(ModuleSourceFile.mockFiles).to.be.empty;
    });
  }

  mocha.it('accept dynamic HAR and single-file targets without HSP metadata', function () {
    const harPath = writeMockFile('oh_modules/dynamic-har/Index.ets', false);
    fs.writeFileSync(path.join(path.dirname(harPath), 'oh-package.json5'), JSON.stringify({
      name: 'dynamic-har', version: '1.0.0', main: 'Index.ets'
    }));
    writeMockFile('src/main/ets/DynamicCalc.ets', false);
    writeMockFile('src/mock/DynamicMock.ts', false);
    const targets = ['dynamic-har', './src/main/ets/DynamicCalc', './src/main/ets/DynamicCalc.ets', 'DynamicCalc.ets'];
    const config = {};
    for (const target of targets) {
      config[target] = { source: 'src/mock/DynamicMock.ts' };
    }
    setupTempMockProject(JSON.stringify(config));
    const stub = stubPrintErrorAndExit();
    ModuleSourceFile.collectMockConfigInfo(rollup);
    expect(stub.notCalled).to.be.true;
    expect(ModuleSourceFile.mockFiles).to.have.lengthOf(targets.length);
  });

  mocha.it('detect HAR language from module metadata even without use static in the entry', function () {
    const targetPath = writeMockFile('oh_modules/metadata-har/Index.ets', false);
    fs.writeFileSync(path.join(path.dirname(targetPath), 'oh-package.json5'), JSON.stringify({
      name: 'metadata-har', version: '1.0.0', main: 'Index.ets'
    }));
    writeMockFile('src/mock/MetadataMock.ts', false);
    setupTempMockProject(JSON.stringify({ 'metadata-har': { source: 'src/mock/MetadataMock.ts' } }));
    sinon.stub(FileManager.getInstance(), 'getLanguageVersionByFilePath').callThrough()
      .withArgs(targetPath).returns({ languageVersion: ARKTS_1_2, pkgName: 'metadata-har' });
    const stub = stubPrintErrorAndExit().throws(new Error('static mock target'));
    expect(() => ModuleSourceFile.collectMockConfigInfo(rollup)).to.throw('static mock target');
    expect(stub.firstCall.args[0].code).to.equal(ErrorCode.ETS2BUNDLE_EXTERNAL_MOCK_TARGET_IS_STATIC_FILE);
    expect(stub.firstCall.args[0].cause).to.include(targetPath);
  });

  for (const request of ['../common/calc', '../common/calc.ets', './calc', './calc.ets']) {
    mocha.it(`reject static moduleRequest ${request} relative to its importer`, function () {
      const importerPath = writeMockFile('src/main/ets/pages/Index.ets', false);
      const relativeTarget = request.startsWith('../') ? 'common/calc.ets' : 'pages/calc.ets';
      const targetPath = writeMockFile(`src/main/ets/${relativeTarget}`, true);
      writeMockFile('src/mock/CalcMock.ts', false);
      setupTempMockProject(JSON.stringify({ [request]: { source: 'src/mock/CalcMock.ts' } }));
      const source = setupMockImport(importerPath, targetPath);
      const stub = stubPrintErrorAndExit().throws(new Error('static mock target'));
      ModuleSourceFile.collectMockConfigInfo(rollup);
      expect(stub.notCalled).to.be.true;
      expect(() => source.getOhmUrl(rollup, request, targetPath)).to.throw('static mock target');
      expect(stub.firstCall.args[0].code).to.equal(ErrorCode.ETS2BUNDLE_EXTERNAL_MOCK_TARGET_IS_STATIC_FILE);
      expect(stub.firstCall.args[0].cause).to.include(targetPath);
      expect(ModuleSourceFile.newMockConfigInfo).to.deep.equal({});
    });
  }

  mocha.it('use each importer for identical requests and ignore a static file at the module root', function () {
    const request = './calc';
    writeMockFile('calc.ets', true);
    const dynamicPath = writeMockFile('src/main/ets/dynamic/calc.ets', false);
    const staticPath = writeMockFile('src/main/ets/static/calc.ets', true);
    const dynamicImporter = writeMockFile('src/main/ets/dynamic/Index.ets', false);
    const staticImporter = writeMockFile('src/main/ets/static/Index.ets', false);
    writeMockFile('src/mock/CalcMock.ts', false);
    setupTempMockProject(JSON.stringify({ [request]: { source: 'src/mock/CalcMock.ts' } }));
    const dynamicSource = setupMockImport(dynamicImporter, dynamicPath);
    const staticSource = setupMockImport(staticImporter, staticPath);
    const stub = stubPrintErrorAndExit().throws(new Error('static mock target'));
    ModuleSourceFile.collectMockConfigInfo(rollup);
    const ohmUrl = dynamicSource.getOhmUrl(rollup, request, dynamicPath);
    expect(stub.notCalled).to.be.true;
    expect(ModuleSourceFile.newMockConfigInfo[ohmUrl].source).to.equal(
      '@normalized:N&entry&&entry/src/mock/CalcMock&');
    expect(() => staticSource.getOhmUrl(rollup, request, staticPath)).to.throw('static mock target');
    expect(stub.firstCall.args[0].cause).to.include(staticPath);
  });

  for (const request of ['../common/calc', '../common/calc.ets']) {
    mocha.it(`validate original static source when ${request} resolves to an interop declaration`, function () {
      const importerPath = writeMockFile('src/main/ets/pages/Index.ets', false);
      const targetPath = writeMockFile('src/main/ets/common/calc.ets', true);
      const declarationPath = writeMockFile('generated/calc.d.ets', false);
      writeMockFile('src/mock/CalcMock.ts', false);
      setupTempMockProject(JSON.stringify({ [request]: { source: 'src/mock/CalcMock.ts' } }));
      const source = setupMockImport(importerPath, declarationPath);
      // A static interop branch must not return before validating the matching mock key.
      rollup.share.projectConfig.mixCompile = true;
      const staticOhmUrl = sinon.stub(source, 'tryBuildStaticOhmUrl').returns('@normalized:static');
      const stub = stubPrintErrorAndExit().throws(new Error('static mock target'));
      ModuleSourceFile.collectMockConfigInfo(rollup);
      expect(() => source.getOhmUrl(rollup, request, declarationPath)).to.throw('static mock target');
      expect(stub.firstCall.args[0].cause).to.include(targetPath);
      expect(staticOhmUrl.notCalled).to.be.true;
    });
  }

  mocha.it('do not reject static imports when the request has no matching mock key or mock is disabled', function () {
    const importerPath = writeMockFile('src/main/ets/pages/Index.ets', false);
    const targetPath = writeMockFile('src/main/ets/common/calc.ets', true);
    writeMockFile('src/mock/CalcMock.ts', false);
    setupTempMockProject(JSON.stringify({ './other': { source: 'src/mock/CalcMock.ts' } }));
    const source = setupMockImport(importerPath, targetPath);
    const stub = stubPrintErrorAndExit().throws(new Error('static mock target'));
    ModuleSourceFile.collectMockConfigInfo(rollup);
    expect(() => source.getOhmUrl(rollup, '../common/calc', targetPath)).not.to.throw();
    ModuleSourceFile.mockConfigInfo = { '../common/calc': { source: 'src/mock/CalcMock.ts' } };
    ModuleSourceFile.needProcessMock = false;
    expect(() => source.getOhmUrl(rollup, '../common/calc', targetPath)).not.to.throw();
    expect(stub.notCalled).to.be.true;
    expect(ModuleSourceFile.newMockConfigInfo).to.deep.equal({});
  });
});
