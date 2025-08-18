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
import path from "path";

import {
  FileManager,
  collectSDKInfo,
  isBridgeCode,
  getBrdigeCodeRootPath,
  isMixCompile,
  initConfigForInterop,
  destroyInterop,
  transformModuleNameToRelativePath
 } from '../../../lib/fast_build/ark_compiler/interop/interop_manager';
import { ARKTS_1_1, ARKTS_1_2, ARKTS_HYBRID } from '../../../lib/fast_build/ark_compiler/interop/pre_define';
import { sdkConfigs } from '../../../main';
import { toUnixPath } from '../../../lib/utils';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';

export interface ArkTSEvolutionModule {
  language: string;
  packageName: string;
  moduleName: string;
  modulePath: string;
  declgenV1OutPath?: string;
  declgenV2OutPath?: string;
  declgenBridgeCodePath?: string;
  declFilesPath?: string;
  dynamicFiles: string[];
  staticFiles: string[];
  cachePath: string;
  byteCodeHarInfo?: Object;
}

mocha.describe('test interop_manager file api', function () {
  mocha.before(function () {
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    const dynamicSDKPath: Set<string> = new Set([
      '/sdk/default/openharmony/ets/ets1.1/api',
      '/sdk/default/openharmony/ets/ets1.1/arkts',
      '/sdk/default/openharmony/ets/ets1.1/kits',
      '/sdk/default/openharmony/ets/ets1.1/build-tools/ets-loader/declarations',
      '/sdk/default/openharmony/ets/ets1.1/build-tools/ets-loader/component',
      '/sdk/default/openharmony/ets/ets1.1/build-tools/components'
    ]);
    const staticSDKDeclPath: Set<string> = new Set([
      '/sdk/default/openharmony/ets/ets1.2interop/declarations/kit',
      '/sdk/default/openharmony/ets/ets1.2interop/declarations/api',
      '/sdk/default/openharmony/ets/ets1.2interop/declarations/arkts'
    ]);
    const staticSDKGlueCodePath: Set<string> = new Set([
      '/sdk/default/openharmony/ets/ets1.2interop/bridge/kit',
      '/sdk/default/openharmony/ets/ets1.2interop/bridge/api',
      '/sdk/default/openharmony/ets/ets1.2interop/bridge/arkts'
    ]);
    dependentModuleMap.set('application', {
      language: ARKTS_1_1,
      packageName: 'application',
      moduleName: 'application',
      modulePath: '/MyApplication16/application',
      declgenV1OutPath: '/MyApplication16/application/build/default/intermediates/declgen/default/declgenV1',
      declgenV2OutPath: '/MyApplication16/application/build/default/intermediates/declgen/default/declgenV2',
      declgenBridgeCodePath: '/MyApplication16/application/build/default/intermediates/declgen/default/declgenBridgeCode',
      declFilesPath: '/MyApplication16/application/build/default/intermediates/declgen/default/decl-fileInfo.json',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/MyApplication16/application/build/cache',
      byteCodeHarInfo: {}
    });

    dependentModuleMap.set('harv2', {
      language: ARKTS_1_2,
      packageName: 'harv2',
      moduleName: 'harv2',
      modulePath: '/MyApplication16/harv2',
      declgenV1OutPath: '/MyApplication16/harv2/build/default/intermediates/declgen/default/declgenV1',
      declgenV2OutPath: '/MyApplication16/harv2/build/default/intermediates/declgen/default/declgenV2',
      declgenBridgeCodePath: '/MyApplication16/harv2/build/default/intermediates/declgen/default/declgenBridgeCode',
      declFilesPath: '/MyApplication16/harv2/build/default/intermediates/declgen/default/decl-fileInfo.json',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/MyApplication16/harv2/build/cache',
      byteCodeHarInfo: {}
    });

    dependentModuleMap.set('dynamic1', {
      language: ARKTS_1_1,
      packageName: 'dynamic1',
      moduleName: 'dynamic1',
      modulePath: '/MyApplication16/dynamic1',
      declgenV1OutPath: '/MyApplication16/dynamic1/build/default/intermediates/declgen/default/declgenV1',
      declgenV2OutPath: '/MyApplication16/dynamic1/build/default/intermediates/declgen/default/declgenV2',
      declgenBridgeCodePath: '/MyApplication16/dynamic1/build/default/intermediates/declgen/default/declgenBridgeCode',
      declFilesPath: '/MyApplication16/dynamic1/build/default/intermediates/declgen/default/decl-fileInfo.json',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/MyApplication16/dynamic1/build/cache',
      byteCodeHarInfo: {}
    });

    dependentModuleMap.set('hybrid', {
      language: ARKTS_HYBRID,
      packageName: 'hybrid',
      moduleName: 'hybrid',
      modulePath: '/MyApplication16/hybrid',
      declgenV1OutPath: '/MyApplication16/hybrid/build/default/intermediates/declgen/default/declgenV1',
      declgenV2OutPath: '/MyApplication16/hybrid/build/default/intermediates/declgen/default/declgenV2',
      declgenBridgeCodePath: '/MyApplication16/hybrid/build/default/intermediates/declgen/default/declgenBridgeCode',
      declFilesPath: '/MyApplication16/hybrid/build/default/intermediates/declgen/default/decl-fileInfo.json',
      dynamicFiles: ['/MyApplication16/hybrid/fileV1.ets'],
      staticFiles: ['/MyApplication16/hybrid/fileV2.ets'],
      cachePath: '/MyApplication16/hybrid/build/cache',
      byteCodeHarInfo: {}
    });
    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap,
      undefined,
      dynamicSDKPath,
      staticSDKDeclPath,
      staticSDKGlueCodePath);
  });

  mocha.after(() => {
    FileManager.cleanFileManagerObject();
  });

  mocha.it('1-1: test SDK path', function() {
    const filePath = '/sdk/default/openharmony/ets/ets1.1/api/TestAPI.ets';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_1);
    expect(result?.pkgName).to.equal('SDK');
  });

  mocha.it('1-2: test ets-loader/declarations path', function() {
    const filePath = '/sdk/default/openharmony/ets/ets1.1/build-tools/ets-loader/declarations/TestAPI.ets';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_1);
    expect(result?.pkgName).to.equal('SDK');
  });
  
  mocha.it('1-3: test ets-loader/component path', function() {
    const filePath = '/sdk/default/openharmony/ets/ets1.1/build-tools/ets-loader/component/TestAPI.d.ts';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_1);
    expect(result?.pkgName).to.equal('SDK');
  });
  
  mocha.it('1-4: test SDK glue code path', function() {
    const filePath = '/sdk/default/openharmony/ets/ets1.2interop/bridge/arkts/TestAPI.d.ts';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_2);
    expect(result?.pkgName).to.equal('SDK');
  });

  mocha.it('1-5: test SDK interop decl path', function() {
    const filePath = '/sdk/default/openharmony/ets/ets1.2interop/declarations/kit/TestAPI.d.ts';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_2);
    expect(result?.pkgName).to.equal('SDK');
  });

  mocha.it('1-6: test source code from 1.1 module', function() {
    const filePath = '/MyApplication16/application/sourceCode.ets';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_1);
    expect(result?.pkgName).to.equal('application');
  });

  mocha.it('1-7: test glue code file from 1.2 module', function() {
    const filePath = '/MyApplication16/harv2/build/default/intermediates/declgen/default/declgenBridgeCode/sourceCode.ets';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_2);
    expect(result?.pkgName).to.equal('harv2');
  });

  mocha.it('1-8: test decl file from 1.2 module', function() {
    const filePath = '/MyApplication16/harv2/build/default/intermediates/declgen/default/declgenV1/sourceCode.ets';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_2);
    expect(result?.pkgName).to.equal('harv2');
  });

  mocha.it('1-9: test source code file from hybrid module', function() {
    const filePath = '/MyApplication16/hybrid/fileV1.ets';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_1);
    expect(result?.pkgName).to.equal('hybrid');
  });

  mocha.it('1-10: test source code file from hybrid module', function() {
    const filePath = '/MyApplication16/hybrid/build/default/intermediates/declgen/default/declgenV1/file1';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_2);
    expect(result?.pkgName).to.equal('hybrid');
  });

  mocha.it('2-1: test matchModulePath api with 1.1 module', function() {
    const filePath = '/MyApplication16/dynamic1/sourceCode.ets';
    const moduleInfo = FileManager.matchModulePath(filePath);
    expect(moduleInfo.languageVersion).to.equal(ARKTS_1_1);
    expect(moduleInfo.pkgName).to.equal('dynamic1');
  })

  mocha.it('2-2: test matchModulePath api with 1.2 module', function() {
    const filePath = '/MyApplication16/harv2/sourceCode.ets';
    const moduleInfo = FileManager.matchModulePath(filePath);
    expect(moduleInfo.languageVersion).to.equal(ARKTS_1_2);
    expect(moduleInfo.pkgName).to.equal('harv2');
  })

  mocha.it('2-3: test matchModulePath api with isHybrid module', function() {
    const dymanicFilePath = '/MyApplication16/hybrid/fileV1.ets';
    const staticFilePath = '/MyApplication16/hybrid/fileV2.ets';

    const moduleInfoV1 = FileManager.matchModulePath(dymanicFilePath);
    expect(moduleInfoV1.languageVersion).to.equal(ARKTS_1_1);
    expect(moduleInfoV1.pkgName).to.equal('hybrid');

    const moduleInfoV2 = FileManager.matchModulePath(staticFilePath);
    expect(moduleInfoV2.languageVersion).to.equal(ARKTS_1_2);
    expect(moduleInfoV2.pkgName).to.equal('hybrid');
  })

  mocha.it('3-1: test init SDK', function () {
    const share = {
      projectConfig: {
        etsLoaderPath: '/mock/ets-loader',
      }
    };

    const result = collectSDKInfo(share);
    const expectedDynamicSDKPath = new Set([
      '/mock/ets-loader/declarations',
      '/mock/ets-loader/components',
      '/component',
      '/mock/ets-loader'
    ]);
    sdkConfigs.forEach(({ apiPath }) => {
      apiPath.forEach(path => {
        expectedDynamicSDKPath.add(toUnixPath(path));
      });
    });
    const expectedStaticInteropDecl = new Set([
      '/ets1.2/build-tools/interop/declarations/kits',
      '/ets1.2/build-tools/interop/declarations/api',
      '/ets1.2/build-tools/interop/declarations/arkts'
    ]);

    const expectedStaticGlueCode = new Set([
      '/ets1.2/build-tools/interop/bridge/kits',
      '/ets1.2/build-tools/interop/bridge/api',
      '/ets1.2/build-tools/interop/bridge/arkts'
    ]);
    expect([...result.dynamicSDKPath]).to.have.deep.members([...expectedDynamicSDKPath]);
    expect([...result.staticSDKInteropDecl]).to.have.deep.members([...expectedStaticInteropDecl]);
    expect([...result.staticSDKGlueCodePath]).to.have.deep.members([...expectedStaticGlueCode]);
  });
});

mocha.describe('isBridgeCode', function () {
  const mockConfig = {
    mixCompile: true,
    dependentModuleMap: new Map([
      ['pkgA', { declgenBridgeCodePath: path.resolve('project/bridge/pkgA') }],
      ['pkgB', { declgenBridgeCodePath: path.resolve('project/bridge/pkgB') }],
    ]),
  };

  mocha.it('1-1: should return true when filePath is inside a declgenBridgeCodePath', function () {
    const filePath = path.resolve('project/bridge/pkgA/utils/helper.ts');
    expect(isBridgeCode(filePath, mockConfig)).to.be.true;
  });

  mocha.it('1-2: should return false when filePath is outside all bridge code paths', function () {
    const filePath = path.resolve('project/otherpkg/index.ts');
    expect(isBridgeCode(filePath, mockConfig)).to.be.false;
  });

  mocha.it('1-3: should return false when mixCompile is false', function () {
    const config = { ...mockConfig, mixCompile: false };
    const filePath = path.resolve('project/bridge/pkgA/utils/helper.ts');
    expect(isBridgeCode(filePath, config)).to.be.false;
  });

  mocha.it('1-4: should return false when dependentModuleMap is empty', function () {
    const config = { mixCompile: true, dependentModuleMap: new Map() };
    const filePath = path.resolve('project/bridge/pkgA/file.ts');
    expect(isBridgeCode(filePath, config)).to.be.false;
  });

  mocha.it('1-5: should return true for multiple matches, stop at first match', function () {
    const config = {
      mixCompile: true,
      dependentModuleMap: new Map([
        ['pkg1', { declgenBridgeCodePath: path.resolve('path/one') }],
        ['pkg2', { declgenBridgeCodePath: path.resolve('path/two') }],
      ]),
    };
    const filePath = path.resolve('path/one/module.ts');
    expect(isBridgeCode(filePath, config)).to.be.true;
  });
});

mocha.describe('test getBrdigeCodeRootPath api', function () {
  mocha.it('1-1: should return bridgeCodePath from interopConfig when filePath matches moduleRootPath', function () {
    const filePath = '/a/b/c/file.ts';
    const mockConfig: InteropConfig = {
      mixCompile: false,
      interopModuleInfo: new Map([
        ['/a/b', {
          declgenBridgeCodePath: '/bridge/a/b',
          declgenV1OutPath: '/v1'
        }]
      ])
    };

    const result = getBrdigeCodeRootPath(filePath, mockConfig);
    expect(result).to.equal('/bridge/a/b');
  });

  mocha.it('1-2: should return undefined when filePath does not match any moduleRootPath', function () {
    const filePath = '/x/y/z/file.ts';
    const mockConfig: InteropConfig = {
      mixCompile: false,
      interopModuleInfo: new Map([
        ['/a/b', {
          declgenBridgeCodePath: '/bridge/a/b',
          declgenV1OutPath: '/v1'
        }]
      ])
    };

    const result = getBrdigeCodeRootPath(filePath, mockConfig);
    expect(result).to.be.undefined;
  });

  mocha.it('1-3: should return process.env.entryBridgeCodePath when interopConfig is null', function () {
    process.env.entryBridgeCodePath = '/default/bridge/path';
    const filePath = '/any/file.ts';

    const result = getBrdigeCodeRootPath(filePath, undefined as any);
    expect(result).to.equal('/default/bridge/path');
  });
});

mocha.describe('test mixCompile', function () {
  mocha.it('1-1 test mixCompile is false', function () {
    expect(isMixCompile()).to.be.false;
  })

  mocha.it('1-2 test mixCompile is true', function () {
    this.rollup = new RollUpPluginMock();
    this.rollup.build();
    this.rollup.share.projectConfig.mixCompile = true;
    initConfigForInterop(this.rollup.share);
    expect(isMixCompile()).to.be.true;
  })

  mocha.it('1-3 test mixCompile is false when destroy interop', function () {
    this.rollup = new RollUpPluginMock();
    this.rollup.build();
    this.rollup.share.projectConfig.mixCompile = true;
    initConfigForInterop(this.rollup.share);
    destroyInterop()
    expect(isMixCompile()).to.be.false;
  })
})

mocha.describe('test transformModuleNameToRelativePath api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
    this.rollup.build();
    this.rollup.share.projectConfig.mixCompile = true;
    initConfigForInterop(this.rollup.share);
  });

  mocha.it('1-1 test transformModuleNameToRelativePath when compile common module', function () {
    this.rollup.share.projectConfig.isOhosTest = false;

    const moduleName = '/a/b/c/src/main/ets/module/file.ets';
    const result = transformModuleNameToRelativePath(moduleName);

    expect(result).to.equal('./ets/module/file.ets');
  });

  mocha.it('1-2 test transformModuleNameToRelativePath when compile ohostest', function () {
    this.rollup.share.projectConfig.isOhosTest = true;
    initConfigForInterop(this.rollup.share);
    const moduleName = '/a/b/c/src/ohosTest/ets/module/testfile.ets';
    const result = transformModuleNameToRelativePath(moduleName);

    expect(result).to.equal('./ets/module/testfile.ets');
  });

  mocha.it('1-3 test transformModuleNameToRelativePath throws when sourceRoot not in path', function () {
    this.rollup.share.projectConfig.isOhosTest = false;

    const invalidModuleName = '/a/b/c/invalidroot/ets/module/file.ets';

    expect(() => transformModuleNameToRelativePath(invalidModuleName)).to.throw(Error);
  });

  mocha.after(() => {
    delete this.rollup;
  });
})
