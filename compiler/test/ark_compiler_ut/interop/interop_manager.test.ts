/*
 * Copyright (c) 2025-2026 Huawei Device Co., Ltd.
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

import fs from 'fs';
import os from 'os';

import {
  FileManager,
  collectSDKInfo,
  isBridgeCode,
  getBrdigeCodeRootPath,
  isMixCompile,
  initConfigForInterop,
  destroyInterop,
  transformModuleNameToRelativePath,
  getApiPathForInterop,
  processAbilityPagesFullPath
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
    process.env.externalApiPaths = '/hms/ets';
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    const dynamicSDKPath: Set<string> = new Set([
      '/sdk/default/openharmony/ets/dynamic/api',
      '/sdk/default/openharmony/ets/dynamic/arkts',
      '/sdk/default/openharmony/ets/dynamic/kits',
      '/sdk/default/openharmony/ets/dynamic/build-tools/ets-loader/declarations',
      '/sdk/default/openharmony/ets/dynamic/build-tools/ets-loader/component',
      '/sdk/default/openharmony/ets/dynamic/build-tools/components'
    ]);
    const staticSDKDeclPath: Set<string> = new Set([
      '/sdk/default/openharmony/ets/static-interop/declarations/kit',
      '/sdk/default/openharmony/ets/static-interop/declarations/api',
      '/sdk/default/openharmony/ets/static-interop/declarations/arkts'
    ]);
    const staticSDKGlueCodePath: Set<string> = new Set([
      '/sdk/default/openharmony/ets/static-interop/bridge/kit',
      '/sdk/default/openharmony/ets/static-interop/bridge/api',
      '/sdk/default/openharmony/ets/static-interop/bridge/arkts'
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

    dependentModuleMap.set('remoteHar', {
      language: ARKTS_1_2,
      packageName: 'remoteHar',
      moduleName: 'remoteHar',
      modulePath: '/MyApplication16/oh_modules/.ohpm/har2@asdf==/oh_modules/remoteHar',
      declgenV1OutPath: '/MyApplication16/build/declgen/remoteHar/declgenV1',
      declgenV2OutPath: '/MyApplication16/build/declgen/remoteHar/declgenV2',
      declgenBridgeCodePath: '/MyApplication16/build/declgen/remoteHar/declgenBridgeCode',
      declFilesPath: undefined,
      dynamicFiles: [],
      staticFiles: ['/MyApplication16/oh_modules/.ohpm/har2@asdf==/oh_modules/remoteHar/Index.d.ets'],
      cachePath: '/MyApplication16/build/declgen/remoteHar/cache',
      byteCodeHarInfo: {}
    });

    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap,
      undefined,
      dynamicSDKPath,
      staticSDKDeclPath,
      staticSDKGlueCodePath,
      '/MyApplication16'
    );
  });

  mocha.after(() => {
    process.env.externalApiPaths = undefined;
    FileManager.cleanFileManagerObject();
  });

  mocha.it('1-1: test SDK path', function() {
    const filePath = '/sdk/default/openharmony/ets/dynamic/api/TestAPI.ets';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_1);
    expect(result?.pkgName).to.equal('SDK');
  });

  mocha.it('1-2: test ets-loader/declarations path', function() {
    const filePath = '/sdk/default/openharmony/ets/dynamic/build-tools/ets-loader/declarations/TestAPI.ets';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_1);
    expect(result?.pkgName).to.equal('SDK');
  });
  
  mocha.it('1-3: test ets-loader/component path', function() {
    const filePath = '/sdk/default/openharmony/ets/dynamic/build-tools/ets-loader/component/TestAPI.d.ts';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_1);
    expect(result?.pkgName).to.equal('SDK');
  });
  
  mocha.it('1-4: test SDK glue code path', function() {
    const filePath = '/sdk/default/openharmony/ets/static-interop/bridge/arkts/TestAPI.d.ts';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_2);
    expect(result?.pkgName).to.equal('SDK');
  });

  mocha.it('1-5: test SDK interop decl path', function() {
    const filePath = '/sdk/default/openharmony/ets/static-interop/declarations/kit/TestAPI.d.ts';
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

  mocha.it('1-11: test remote har declaration file from remoteHar module', function() {
    const filePath = '/MyApplication16/build/declgen/remoteHar/declgenV1/remoteHar/Index.d.ets';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_2);
    expect(result?.pkgName).to.equal('remoteHar');
  });

  mocha.it('2-1: test matchModulePath api with 1.1 module', function() {
    const filePath = '/MyApplication16/dynamic1/sourceCode.ets';
    const moduleInfo = FileManager.matchModulePath(filePath);
    expect(moduleInfo?.languageVersion).to.equal(ARKTS_1_1);
    expect(moduleInfo?.pkgName).to.equal('dynamic1');
  })

  mocha.it('2-2: test matchModulePath api with 1.2 module', function() {
    const filePath = '/MyApplication16/harv2/sourceCode.ets';
    const moduleInfo = FileManager.matchModulePath(filePath);
    expect(moduleInfo?.languageVersion).to.equal(ARKTS_1_2);
    expect(moduleInfo?.pkgName).to.equal('harv2');
  })

  mocha.it('2-3: test matchModulePath api with isHybrid module', function() {
    const dymanicFilePath = '/MyApplication16/hybrid/fileV1.ets';
    const staticFilePath = '/MyApplication16/hybrid/fileV2.ets';

    const moduleInfoV1 = FileManager.matchModulePath(dymanicFilePath);
    expect(moduleInfoV1?.languageVersion).to.equal(ARKTS_1_1);
    expect(moduleInfoV1?.pkgName).to.equal('hybrid');

    const moduleInfoV2 = FileManager.matchModulePath(staticFilePath);
    expect(moduleInfoV2?.languageVersion).to.equal(ARKTS_1_2);
    expect(moduleInfoV2?.pkgName).to.equal('hybrid');
  })

  mocha.it('2-4: test matchModulePath api with remote har module', function() {
    const filePath = '/MyApplication16/build/declgen/remoteHar/declgenV1/remoteHar/Index.d.ets';
    const moduleInfo = FileManager.matchModulePath(filePath);
    expect(moduleInfo?.pkgName).to.equal('remoteHar');
    expect(moduleInfo?.languageVersion).to.equal(ARKTS_1_2);
  });

  mocha.it('2-4-1: test matchModulePathByDeclenPath api with remote har module', function() {
    const filePath = '/MyApplication16/build/declgen/remoteHar/declgenV1/remoteHar/Index.d.ets';
    const moduleInfo = FileManager.matchModulePathByDeclenPath(filePath);
    expect(moduleInfo?.language).to.equal(ARKTS_1_2);
    expect(moduleInfo?.packageName).to.equal('remoteHar');
  });

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
      '/static/build-tools/interop/declaration/kits',
      '/static/build-tools/interop/declaration/api',
      '/static/build-tools/interop/declaration/arkts'
    ]);

    const expectedStaticGlueCode = new Set([
      '/static/build-tools/interop/bridge/kits',
      '/static/build-tools/interop/bridge/api',
      '/static/build-tools/interop/bridge/arkts'
    ]);

    if (process.env.externalApiPaths) {
      expectedStaticGlueCode.add('/hms/static/build-tools/interop/bridge/api');
      expectedStaticInteropDecl.add('/hms/static/build-tools/interop/declaration/api');
    }

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
  mocha.it('1-1: should return bridgeCodePath from interopConfig when moduleName matches the moduleName in interopModuleInfo', function () {
      const moduleName = 'name';
      const mockConfig: InteropConfig = {
        mixCompile: false,
        interopModuleInfo: new Map([
          ['/a/b', {
            declgenBridgeCodePath: '/bridge/a/b',
            declgenV1OutPath: '/v1',
            moduleName: 'name'
          }]
        ])
      };
  
      const result = getBrdigeCodeRootPath(moduleName, mockConfig);
      expect(result.moduleName).to.equal(moduleName);
    });
  
    mocha.it('1-2: should return undefined when moduleName does not match any moduleNames in interopModuleInfo', function () {
      const moduleName = 'name';
      const mockConfig: InteropConfig = {
        mixCompile: false,
        interopModuleInfo: new Map([
          ['/a/b', {
            declgenBridgeCodePath: '/bridge/a/b',
            declgenV1OutPath: '/v1',
            moduleName: 'another_name'
          }]
        ])
      };
  
      const result = getBrdigeCodeRootPath(moduleName, mockConfig);
      expect(result).to.be.undefined;
    });
  
    mocha.it('1-3: should return declgenBridgeCodePath when interopConfig is provided', function () {
    const moduleName = 'name';
    this.rollup = new RollUpPluginMock();
    this.rollup.build();
    this.rollup.share.projectConfig.mixCompile = true;

    initConfigForInterop(this.rollup.share);

    const interopInfo = {
      declgenBridgeCodePath: '/some/bridge/path',
      declgenV1OutPath: '/some/v1/out/path',
      packageName: 'test-package',
      moduleName: 'name',
      moduleRootPath: ''
    };
    const fakeConfig = {
      interopModuleInfo: new Map<string, typeof interopInfo>([
        ['/any', { ...interopInfo }]
      ]),
      projectConfig: {}
    };

    const result = getBrdigeCodeRootPath(moduleName, fakeConfig as any);
    destroyInterop();

    expect(result?.moduleName).to.equal(moduleName);
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

mocha.describe('test queryOriginApiName api', function () {
  mocha.before(function () {
    let baseUrl;
    this.rollup = new RollUpPluginMock();
    this.rollup.build();
    baseUrl = path.join(this.rollup.share.projectConfig.projectRootPath, './interop_sdk');
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    const aliasConfig: Map<string, string> = new Map();
    aliasConfig.set('application', path.join(baseUrl, './configs/alias.json'));
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
    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap,
      aliasConfig,
      undefined,
      undefined,
      undefined);
    FileManager.setMixCompile(true);
  });

  mocha.after(() => {
    FileManager.cleanFileManagerObject();
  });

  mocha.it('1-1: should return alias config from alias.json', function () {
    const result = FileManager.getInstance().queryOriginApiName(
      'static.@ohos.util.HashSet', 
      '/MyApplication16/application/src/main/ets/test.ets'
    );
    console.log(result);
    expect(result).to.not.be.undefined;
    expect(result?.originalAPIName).to.equal('@ohos.util.HashSet');
    expect(result?.isStatic).to.be.true;
  });

  mocha.it('1-2: should parse static@ prefix directly', function () {
    const result = FileManager.getInstance().queryOriginApiName(
      'static@ohos.util.HashSet', 
      '/MyApplication16/application/src/main/ets/test.ets'
    );
    console.log(result);
    expect(result).to.not.be.undefined;
    expect(result?.originalAPIName).to.equal('@ohos.util.HashSet');
    expect(result?.isStatic).to.be.true;
  });

  mocha.it('1-3: should return undefined when mixCompile is false', function () {
    FileManager.setMixCompile(false);
    const result = FileManager.getInstance().queryOriginApiName(
      'static.@ohos.util.HashSet', 
      '/MyApplication16/application/src/main/ets/test.ets'
    );
    expect(result).to.be.undefined;
  });

  mocha.it('1-4: should return undefined for non-existent alias', function () {
    const result = FileManager.getInstance().queryOriginApiName(
      'static.@ohos.nonexistent', 
      '/MyApplication16/application/src/main/ets/test.ets'
    );
    expect(result).to.be.undefined;
  });

  mocha.it('1-5: should return undefined when containing file is not in any module', function () {
    const result = FileManager.getInstance().queryOriginApiName(
      'static.@ohos.util.HashSet',
      '/unknown/path/file.ets'
    );
    expect(result).to.be.undefined;
  });
});

mocha.describe('test queryOriginApiName api - isInteropSDKEnabled disabled', function () {
  mocha.before(function () {
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap.set('application', {
      language: ARKTS_1_1,
      packageName: 'application',
      moduleName: 'application',
      modulePath: '/MyApplication16/application',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/MyApplication16/application/build/cache',
      byteCodeHarInfo: {}
    });
    FileManager.cleanFileManagerObject();
    // Provide non-existent static SDK paths so hasExistingPaths returns false,
    // making isInteropSDKEnabled=false.
    // initForTest passes checkFileExist=false so it won't early-return.
    const nonExistentStaticSDKDeclPath: Set<string> = new Set(['/nonexistent/static-decl']);
    const nonExistentStaticSDKGlueCodePath: Set<string> = new Set(['/nonexistent/static-glue']);
    FileManager.initForTest(
      dependentModuleMap,
      undefined,
      undefined,
      nonExistentStaticSDKDeclPath,
      nonExistentStaticSDKGlueCodePath,
      '/MyApplication16'
    );
    FileManager.setMixCompile(true);
  });

  mocha.after(() => {
    FileManager.cleanFileManagerObject();
  });

  mocha.it('2-1: should return undefined when isInteropSDKEnabled is false', function () {
    expect(FileManager.isInteropSDKEnabled).to.be.false;
    const result = FileManager.getInstance().queryOriginApiName(
      'static@ohos.util.HashSet',
      '/MyApplication16/application/src/main/ets/test.ets'
    );
    expect(result).to.be.undefined;
  });
});

mocha.describe('test queryOriginApiName api - no alias for package', function () {
  mocha.before(function () {
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap.set('application', {
      language: ARKTS_1_1,
      packageName: 'application',
      moduleName: 'application',
      modulePath: '/MyApplication16/application',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/MyApplication16/application/build/cache',
      byteCodeHarInfo: {}
    });
    FileManager.cleanFileManagerObject();
    // Provide empty aliasConfig so the alias map is initialized but has no entries for 'application'
    const aliasConfig: Map<string, string> = new Map();
    FileManager.initForTest(
      dependentModuleMap,
      aliasConfig,
      undefined,
      undefined,
      undefined,
      '/MyApplication16'
    );
    FileManager.setMixCompile(true);
  });

  mocha.after(() => {
    FileManager.cleanFileManagerObject();
  });

  mocha.it('3-1: should return undefined when aliasConfig has no entry for the package', function () {
    const result = FileManager.getInstance().queryOriginApiName(
      'some.module.name',
      '/MyApplication16/application/src/main/ets/test.ets'
    );
    expect(result).to.be.undefined;
  });
});

mocha.describe('test parseStaticAlias edge cases via queryOriginApiName', function () {
  let tempDir: string;

  mocha.before(function () {
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap.set('application', {
      language: ARKTS_1_1,
      packageName: 'application',
      moduleName: 'application',
      modulePath: '/MyApplication16/application',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/MyApplication16/application/build/cache',
      byteCodeHarInfo: {}
    });

    // Create real temp dirs so hasExistingPaths returns true -> isInteropSDKEnabled=true
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'parse-static-test-'));
    const declDir = path.join(tempDir, 'decl');
    const glueDir = path.join(tempDir, 'glue');
    fs.mkdirSync(declDir, { recursive: true });
    fs.mkdirSync(glueDir, { recursive: true });

    FileManager.cleanFileManagerObject();
    const dynamicSDKPath: Set<string> = new Set([path.join(tempDir, 'dynamic')]);
    fs.mkdirSync(path.join(tempDir, 'dynamic'), { recursive: true });
    const staticSDKDeclPath: Set<string> = new Set([declDir]);
    const staticSDKGlueCodePath: Set<string> = new Set([glueDir]);
    FileManager.initForTest(
      dependentModuleMap,
      undefined,
      dynamicSDKPath,
      staticSDKDeclPath,
      staticSDKGlueCodePath,
      '/MyApplication16'
    );
    FileManager.setMixCompile(true);
  });

  mocha.after(() => {
    FileManager.cleanFileManagerObject();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  mocha.it('4-1: should parse static@ with @ prefix correctly', function () {
    const result = FileManager.getInstance().queryOriginApiName(
      'static@ohos.util.HashSet',
      '/MyApplication16/application/src/main/ets/test.ets'
    );
    expect(result).to.not.be.undefined;
    expect(result?.originalAPIName).to.equal('@ohos.util.HashSet');
    expect(result?.isStatic).to.be.true;
  });

  mocha.it('4-2: should return alias with @ for static@ with only @ suffix', function () {
    const result = FileManager.getInstance().queryOriginApiName(
      'static@',
      '/MyApplication16/application/src/main/ets/test.ets'
    );
    expect(result).to.not.be.undefined;
    expect(result?.originalAPIName).to.equal('@');
    expect(result?.isStatic).to.be.true;
  });

  mocha.it('4-3: should return alias for static@ with whitespace after @', function () {
    const result = FileManager.getInstance().queryOriginApiName(
      'static@   ',
      '/MyApplication16/application/src/main/ets/test.ets'
    );
    expect(result).to.not.be.undefined;
    expect(result?.originalAPIName).to.equal('@   ');
    expect(result?.isStatic).to.be.true;
  });

  mocha.it('4-4: should parse static@ with slash path', function () {
    const result = FileManager.getInstance().queryOriginApiName(
      'static@ohos/util/HashSet',
      '/MyApplication16/application/src/main/ets/test.ets'
    );
    expect(result).to.not.be.undefined;
    expect(result?.originalAPIName).to.equal('@ohos/util/HashSet');
    expect(result?.isStatic).to.be.true;
  });
});

mocha.describe('test getGlueCodePathByModuleRequest api', function () {
  let tempDir: string;

  mocha.before(function () {
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap.set('application', {
      language: ARKTS_1_1,
      packageName: 'application',
      moduleName: 'application',
      modulePath: '/MyApplication16/application',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/MyApplication16/application/build/cache',
      byteCodeHarInfo: {}
    });

    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gluecode-test-'));
    const bridgeDir = path.join(tempDir, 'bridge');
    fs.mkdirSync(bridgeDir, { recursive: true });
    // Create a .ts glue code file
    fs.writeFileSync(path.join(bridgeDir, '@ohos.util.HashSet.ts'), '// glue code', 'utf-8');

    const staticSDKGlueCodePath: Set<string> = new Set([bridgeDir]);

    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap,
      undefined,
      undefined,
      undefined,
      staticSDKGlueCodePath,
      '/MyApplication16'
    );
  });

  mocha.after(() => {
    FileManager.cleanFileManagerObject();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  mocha.it('5-1: should return path when glue code .ts file exists', function () {
    const result = FileManager.getInstance().getGlueCodePathByModuleRequest('@ohos.util.HashSet');
    expect(result).to.not.be.undefined;
    expect(result?.fullPath).to.include('@ohos.util.HashSet.ts');
    expect(result?.basePath).to.include('bridge');
  });

  mocha.it('5-2: should return undefined when no glue code file exists', function () {
    const result = FileManager.getInstance().getGlueCodePathByModuleRequest('@ohos.nonexistent.Module');
    expect(result).to.be.undefined;
  });
});

mocha.describe('test getGlueCodePathByModuleRequest with .ets extension', function () {
  let tempDir: string;

  mocha.before(function () {
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap.set('application', {
      language: ARKTS_1_1,
      packageName: 'application',
      moduleName: 'application',
      modulePath: '/MyApplication16/application',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/MyApplication16/application/build/cache',
      byteCodeHarInfo: {}
    });

    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gluecode-ets-test-'));
    const bridgeDir = path.join(tempDir, 'bridge');
    fs.mkdirSync(bridgeDir, { recursive: true });
    // Create a .ets glue code file
    fs.writeFileSync(path.join(bridgeDir, '@ohos.util.List.ets'), '// glue code ets', 'utf-8');

    const staticSDKGlueCodePath: Set<string> = new Set([bridgeDir]);

    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap,
      undefined,
      undefined,
      undefined,
      staticSDKGlueCodePath,
      '/MyApplication16'
    );
  });

  mocha.after(() => {
    FileManager.cleanFileManagerObject();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  mocha.it('6-1: should return path when glue code .ets file exists', function () {
    const result = FileManager.getInstance().getGlueCodePathByModuleRequest('@ohos.util.List');
    expect(result).to.not.be.undefined;
    expect(result?.fullPath).to.include('@ohos.util.List.ets');
    expect(result?.basePath).to.include('bridge');
  });
});

mocha.describe('test getApiPathForInterop api', function () {
  mocha.before(function () {
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap.set('application', {
      language: ARKTS_1_1,
      packageName: 'application',
      moduleName: 'application',
      modulePath: '/MyApplication16/application',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/MyApplication16/application/build/cache',
      byteCodeHarInfo: {}
    });
    const staticSDKDeclPath: Set<string> = new Set([
      '/sdk/static/declarations/kit',
      '/sdk/static/declarations/api'
    ]);
    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap,
      undefined,
      undefined,
      staticSDKDeclPath,
      undefined,
      '/MyApplication16'
    );
  });

  mocha.after(() => {
    FileManager.cleanFileManagerObject();
  });

  mocha.it('7-1: should not modify apiDirs when languageVersion is not ARKTS_1_2', function () {
    const apiDirs: string[] = ['/original/api'];
    getApiPathForInterop(apiDirs, ARKTS_1_1);
    expect(apiDirs).to.deep.equal(['/original/api']);
  });

  mocha.it('7-2: should prepend static SDK paths when languageVersion is ARKTS_1_2', function () {
    const apiDirs: string[] = ['/original/api'];
    getApiPathForInterop(apiDirs, ARKTS_1_2);
    expect(apiDirs.length).to.equal(3);
    expect(apiDirs[0]).to.equal('/sdk/static/declarations/kit');
    expect(apiDirs[1]).to.equal('/sdk/static/declarations/api');
    expect(apiDirs[2]).to.equal('/original/api');
  });
});

mocha.describe('test processAbilityPagesFullPath api', function () {
  let tempDir: string;

  mocha.before(function () {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ability-pages-test-'));
  });

  mocha.after(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    destroyInterop();
  });

  mocha.it('8-1: should not modify set when mixCompile is false', function () {
    destroyInterop();
    const pages = new Set<string>(['/some/page.ets']);
    processAbilityPagesFullPath(pages);
    expect(pages.size).to.equal(1);
    expect(pages.has('/some/page.ets')).to.be.true;
  });

  mocha.it('8-2: should remove page with use static directive', function () {
    const rollup = new RollUpPluginMock();
    rollup.build();
    rollup.share.projectConfig.mixCompile = true;
    initConfigForInterop(rollup.share);

    const staticPagePath = path.join(tempDir, 'StaticPage.ets');
    fs.writeFileSync(staticPagePath, '"use static";\n// rest of code', 'utf-8');

    const pages = new Set<string>([staticPagePath]);
    processAbilityPagesFullPath(pages);
    expect(pages.size).to.equal(0);

    destroyInterop();
  });

  mocha.it('8-3: should keep page without use static directive', function () {
    const rollup = new RollUpPluginMock();
    rollup.build();
    rollup.share.projectConfig.mixCompile = true;
    initConfigForInterop(rollup.share);

    const normalPagePath = path.join(tempDir, 'NormalPageKeep.ets');
    fs.writeFileSync(normalPagePath, 'import something from "module";\n// normal code', 'utf-8');

    const pages = new Set<string>([normalPagePath]);
    processAbilityPagesFullPath(pages);
    expect(pages.size).to.equal(1);
    expect(pages.has(normalPagePath)).to.be.true;

    destroyInterop();
  });

  mocha.it('8-4: should skip page when file does not exist', function () {
    const rollup = new RollUpPluginMock();
    rollup.build();
    rollup.share.projectConfig.mixCompile = true;
    initConfigForInterop(rollup.share);

    const nonExistentPath = path.join(tempDir, 'NonExistentPage.ets');
    const pages = new Set<string>([nonExistentPath]);
    processAbilityPagesFullPath(pages);
    // File doesn't exist, so it stays in the set (can't read first line)
    expect(pages.size).to.equal(1);
    expect(pages.has(nonExistentPath)).to.be.true;

    destroyInterop();
  });

  mocha.it('8-5: should handle file without extension by appending .ets', function () {
    const rollup = new RollUpPluginMock();
    rollup.build();
    rollup.share.projectConfig.mixCompile = true;
    initConfigForInterop(rollup.share);

    const pagePathNoExt = path.join(tempDir, 'PageNoExt');
    fs.writeFileSync(pagePathNoExt + '.ets', '"use static";\n// static page', 'utf-8');

    const pages = new Set<string>([pagePathNoExt]);
    processAbilityPagesFullPath(pages);
    expect(pages.size).to.equal(0);

    destroyInterop();
  });

  mocha.it('8-6: should handle file without extension by appending .ts', function () {
    const rollup = new RollUpPluginMock();
    rollup.build();
    rollup.share.projectConfig.mixCompile = true;
    initConfigForInterop(rollup.share);

    const pagePathNoExt = path.join(tempDir, 'TsPageNoExt');
    fs.writeFileSync(pagePathNoExt + '.ts', '"use static";\n// static ts page', 'utf-8');

    const pages = new Set<string>([pagePathNoExt]);
    processAbilityPagesFullPath(pages);
    expect(pages.size).to.equal(0);

    destroyInterop();
  });
});

mocha.describe('test initSDK with checkFileExist=false', function () {
  mocha.it('9-1: should set paths even when files do not exist if checkFileExist is false', function () {
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap.set('test', {
      language: ARKTS_1_1,
      packageName: 'test',
      moduleName: 'test',
      modulePath: '/test',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/test/cache',
      byteCodeHarInfo: {}
    });
    // These paths don't exist on disk, but checkFileExist=false via initForTest
    const dynamicSDKPath = new Set(['/nonexistent/dynamic']);
    const staticSDKDeclPath = new Set(['/nonexistent/static-decl']);
    const staticSDKGlueCodePath = new Set(['/nonexistent/static-glue']);

    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap,
      undefined,
      dynamicSDKPath,
      staticSDKDeclPath,
      staticSDKGlueCodePath,
      '/test'
    );

    expect(FileManager.dynamicLibPath.has('/nonexistent/dynamic')).to.be.true;
    expect(FileManager.staticSDKDeclPath.has('/nonexistent/static-decl')).to.be.true;
    expect(FileManager.staticSDKGlueCodePath.has('/nonexistent/static-glue')).to.be.true;
    // isInteropSDKEnabled should be false since paths don't exist
    expect(FileManager.isInteropSDKEnabled).to.be.false;

    FileManager.cleanFileManagerObject();
  });
});

mocha.describe('test FileManager init and clean lifecycle', function () {
  mocha.it('10-1: should only init once (singleton pattern)', function () {
    const dependentModuleMap1: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap1.set('first', {
      language: ARKTS_1_1,
      packageName: 'first',
      moduleName: 'first',
      modulePath: '/first',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/first/cache',
      byteCodeHarInfo: {}
    });
    const dependentModuleMap2: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap2.set('second', {
      language: ARKTS_1_2,
      packageName: 'second',
      moduleName: 'second',
      modulePath: '/second',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/second/cache',
      byteCodeHarInfo: {}
    });

    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap1,
      undefined,
      undefined,
      undefined,
      undefined,
      '/test'
    );

    // Second init should be ignored since instance is already set
    FileManager.initForTest(
      dependentModuleMap2,
      undefined,
      undefined,
      undefined,
      undefined,
      '/test'
    );

    // Should still have 'first' module
    expect(FileManager.arkTSModuleMap.has('first')).to.be.true;
    // Should NOT have 'second' module
    expect(FileManager.arkTSModuleMap.has('second')).to.be.false;

    FileManager.cleanFileManagerObject();
  });

  mocha.it('10-2: cleanFileManagerObject should reset all static members', function () {
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap.set('test', {
      language: ARKTS_1_1,
      packageName: 'test',
      moduleName: 'test',
      modulePath: '/test',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/test/cache',
      byteCodeHarInfo: {}
    });

    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap,
      undefined,
      new Set(['/dynamic']),
      new Set(['/static-decl']),
      new Set(['/static-glue']),
      '/test'
    );
    FileManager.setMixCompile(true);

    expect(FileManager.arkTSModuleMap.size).to.be.greaterThan(0);
    expect(FileManager.mixCompile).to.be.true;

    FileManager.cleanFileManagerObject();

    expect(FileManager.arkTSModuleMap.size).to.equal(0);
    expect(FileManager.dynamicLibPath.size).to.equal(0);
    expect(FileManager.staticSDKDeclPath.size).to.equal(0);
    expect(FileManager.staticSDKGlueCodePath.size).to.equal(0);
    expect(FileManager.aliasConfig.size).to.equal(0);
    expect(FileManager.mixCompile).to.be.false;
  });
});

mocha.describe('test getLanguageVersionByFilePath edge cases', function () {
  mocha.before(function () {
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
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
    const dynamicSDKPath: Set<string> = new Set(['/sdk/dynamic/api']);
    const staticSDKDeclPath: Set<string> = new Set(['/sdk/static/decl']);
    const staticSDKGlueCodePath: Set<string> = new Set(['/sdk/static/bridge']);

    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap,
      undefined,
      dynamicSDKPath,
      staticSDKDeclPath,
      staticSDKGlueCodePath,
      '/MyApplication16'
    );
  });

  mocha.after(() => {
    FileManager.cleanFileManagerObject();
  });

  mocha.it('11-1: should match dynamic SDK path', function () {
    const filePath = '/sdk/dynamic/api/some/API.ets';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_1);
    expect(result?.pkgName).to.equal('SDK');
  });

  mocha.it('11-2: should match static SDK declaration path', function () {
    const filePath = '/sdk/static/decl/some/API.d.ts';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_2);
    expect(result?.pkgName).to.equal('SDK');
  });

  mocha.it('11-3: should match static SDK glue code path', function () {
    const filePath = '/sdk/static/bridge/some/API.ts';
    const result = FileManager.getInstance().getLanguageVersionByFilePath(filePath);
    expect(result?.languageVersion).to.equal(ARKTS_1_2);
    expect(result?.pkgName).to.equal('SDK');
  });

  mocha.it('11-4: should return undefined for file not in any module or SDK path when hybrid has no match', function () {
    // File in a hybrid module but not in dynamicFiles or staticFiles
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap.set('hybridTest', {
      language: ARKTS_HYBRID,
      packageName: 'hybridTest',
      moduleName: 'hybridTest',
      modulePath: '/hybridTest',
      dynamicFiles: ['/hybridTest/knownDynamic.ets'],
      staticFiles: ['/hybridTest/knownStatic.ets'],
      cachePath: '/hybridTest/cache',
      byteCodeHarInfo: {}
    });
    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap,
      undefined,
      undefined,
      undefined,
      undefined,
      '/test'
    );

    // File is under hybridTest modulePath but not in dynamicFiles or staticFiles
    // matchModulePathByPrefix matches but isHybrid=true, and file not in dynamic/static lists
    const result = FileManager.matchModulePath('/hybridTest/unknown.ets');
    expect(result).to.be.undefined;

    FileManager.cleanFileManagerObject();
  });
});

mocha.describe('test matchModulePathByDeclenPath edge cases', function () {
  mocha.it('12-1: should return undefined when interopConfig is not set', function () {
    FileManager.cleanFileManagerObject();
    // getInstance creates new instance without interopConfig
    const result = FileManager.matchModulePathByDeclenPath('/some/path');
    expect(result).to.be.undefined;
    FileManager.cleanFileManagerObject();
  });

  mocha.it('12-2: should return undefined when path is not under declgen directory', function () {
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap.set('testpkg', {
      language: ARKTS_1_2,
      packageName: 'testpkg',
      moduleName: 'testpkg',
      modulePath: '/testpkg',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/testpkg/cache',
      byteCodeHarInfo: {}
    });
    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap,
      undefined,
      undefined,
      undefined,
      undefined,
      '/project'
    );

    // Path is not under /project/build/declgen
    const result = FileManager.matchModulePathByDeclenPath('/other/path/file.ets');
    expect(result).to.be.undefined;
    FileManager.cleanFileManagerObject();
  });

  mocha.it('12-3: should return undefined when harName does not match any module', function () {
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap.set('testpkg', {
      language: ARKTS_1_2,
      packageName: 'testpkg',
      moduleName: 'testpkg',
      modulePath: '/testpkg',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/testpkg/cache',
      byteCodeHarInfo: {}
    });
    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap,
      undefined,
      undefined,
      undefined,
      undefined,
      '/project'
    );

    // Path under /project/build/declgen but with unknown package name
    const result = FileManager.matchModulePathByDeclenPath('/project/build/declgen/unknownPkg/declgenV1/file.ets');
    expect(result).to.be.undefined;
    FileManager.cleanFileManagerObject();
  });
});

mocha.describe('test queryOriginApiName - non-static alias via aliasConfig', function () {
  let tempDir: string;

  mocha.before(function () {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'alias-test-'));
    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap.set('application', {
      language: ARKTS_1_1,
      packageName: 'application',
      moduleName: 'application',
      modulePath: '/MyApplication16/application',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/MyApplication16/application/build/cache',
      byteCodeHarInfo: {}
    });

    // Create alias config with a non-static entry
    const aliasJson = {
      'ohos.util.List': {
        originalAPIName: '@ohos.util.List',
        isStatic: false
      }
    };
    const aliasFilePath = path.join(tempDir, 'alias.json');
    fs.writeFileSync(aliasFilePath, JSON.stringify(aliasJson), 'utf-8');

    const aliasConfig: Map<string, string> = new Map();
    aliasConfig.set('application', aliasFilePath);

    // Create real temp dirs so hasExistingPaths returns true -> isInteropSDKEnabled=true
    const dynamicSDKPath: Set<string> = new Set([path.join(tempDir, 'dynamic')]);
    const staticSDKDeclPath: Set<string> = new Set([path.join(tempDir, 'static-decl')]);
    const staticSDKGlueCodePath: Set<string> = new Set([path.join(tempDir, 'static-glue')]);
    fs.mkdirSync(path.join(tempDir, 'dynamic'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'static-decl'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'static-glue'), { recursive: true });

    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap,
      aliasConfig,
      dynamicSDKPath,
      staticSDKDeclPath,
      staticSDKGlueCodePath,
      '/MyApplication16'
    );
    FileManager.setMixCompile(true);
  });

  mocha.after(() => {
    FileManager.cleanFileManagerObject();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  mocha.it('13-1: should return non-static alias config from alias.json', function () {
    const result = FileManager.getInstance().queryOriginApiName(
      'ohos.util.List',
      '/MyApplication16/application/src/main/ets/test.ets'
    );
    expect(result).to.not.be.undefined;
    expect(result?.originalAPIName).to.equal('@ohos.util.List');
    expect(result?.isStatic).to.be.false;
  });

  mocha.it('13-2: should return undefined for module not in alias map', function () {
    const result = FileManager.getInstance().queryOriginApiName(
      'ohos.util.NonExistent',
      '/MyApplication16/application/src/main/ets/test.ets'
    );
    expect(result).to.be.undefined;
  });
});

mocha.describe('test parseAliasJson with invalid config', function () {
  let tempDir: string;
  let originalConsoleError: typeof console.error;
  let errorOutput: string[];

  mocha.before(function () {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'invalid-alias-test-'));
    originalConsoleError = console.error;
    errorOutput = [];
    console.error = (...args: any[]) => {
      errorOutput.push(args.join(' '));
    };
  });

  mocha.after(() => {
    console.error = originalConsoleError;
    FileManager.cleanFileManagerObject();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  mocha.it('14-1: should log error for invalid alias config and still create map', function () {
    const aliasJson = {
      'invalid.alias': {
        // Missing originalAPIName and isStatic
        wrongField: 'value'
      },
      'valid.alias': {
        originalAPIName: '@ohos.Valid',
        isStatic: true
      }
    };
    const aliasFilePath = path.join(tempDir, 'invalid_alias.json');
    fs.writeFileSync(aliasFilePath, JSON.stringify(aliasJson), 'utf-8');

    const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
    dependentModuleMap.set('testpkg', {
      language: ARKTS_1_1,
      packageName: 'testpkg',
      moduleName: 'testpkg',
      modulePath: '/testpkg',
      dynamicFiles: [],
      staticFiles: [],
      cachePath: '/testpkg/cache',
      byteCodeHarInfo: {}
    });

    const aliasConfig: Map<string, string> = new Map();
    aliasConfig.set('testpkg', aliasFilePath);

    FileManager.cleanFileManagerObject();
    FileManager.initForTest(
      dependentModuleMap,
      aliasConfig,
      undefined,
      undefined,
      undefined,
      '/test'
    );

    // Should have logged an error for the invalid config
    expect(errorOutput.length).to.be.greaterThan(0);

    // But the valid entry should still work
    FileManager.getInstance().queryOriginApiName(
      'valid.alias',
      '/testpkg/src/main/ets/test.ets'
    );
    FileManager.setMixCompile(true);
    const resultWithMix = FileManager.getInstance().queryOriginApiName(
      'valid.alias',
      '/testpkg/src/main/ets/test.ets'
    );
    expect(resultWithMix).to.not.be.undefined;
    expect(resultWithMix?.originalAPIName).to.equal('@ohos.Valid');
    expect(resultWithMix?.isStatic).to.be.true;
  });
});
