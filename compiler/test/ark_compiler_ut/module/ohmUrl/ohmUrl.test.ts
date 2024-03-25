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

import { getOhmUrlByFilepath, getOhmUrlBySystemApiOrLibRequest, getOhmUrlByHspName } from '../../../../lib/ark_utils';
import { PACKAGES } from '../../../../lib/pre_define';
import projectConfig from '../../utils/processProjectConfig';
import { projectConfig as mainProjectConfig } from '../../../../main';
import RollUpPluginMock from '../../mock/rollup_mock/rollup_plugin_mock';
import { GEN_ABC_PLUGIN_NAME } from '../../../../lib/fast_build/ark_compiler/common/ark_define';
import { ModuleSourceFile } from '../../../../lib/fast_build/ark_compiler/module/module_source_file';

mocha.describe('generate ohmUrl', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('nested src main ets|js in filePath', function () {
    const filePath = `${projectConfig.projectRootPath}/entry/src/main/ets/feature/src/main/js/`
      + `subfeature/src/main/ets/pages/test.ts`;
    const moduleName = 'entry';
    const moduleNamespace = 'library';
    let ohmUrl_1 = getOhmUrlByFilepath(filePath, projectConfig, undefined, moduleName);
    let ohmUrl_2 = getOhmUrlByFilepath(filePath, projectConfig, undefined, moduleNamespace);
    let expected_1 = 'UtTestApplication/entry/ets/feature/src/main/js/subfeature/src/main/ets/pages/test';
    let expected_2 = 'UtTestApplication/entry@library/ets/feature/src/main/js/subfeature/src/main/ets/pages/test';
    expect(ohmUrl_1 == expected_1).to.be.true;
    expect(ohmUrl_2 == expected_2).to.be.true;
  });

  mocha.it('nested src ohosTest ets|js in filePath', function () {
    const filePath = `${projectConfig.projectRootPath}/entry/src/ohosTest/ets/feature/src/main/js/`
      + `subfeature/src/main/ets/pages/test.ts`;
    const moduleName = 'entry';
    const moduleNamespace = 'library';
    let ohmUrl_1 = getOhmUrlByFilepath(filePath, projectConfig, undefined, moduleName);
    let ohmUrl_2 = getOhmUrlByFilepath(filePath, projectConfig, undefined, moduleNamespace);
    let expected_1 = 'UtTestApplication/entry/ets/feature/src/main/js/subfeature/src/main/ets/pages/test';
    let expected_2 = 'UtTestApplication/entry@library/ets/feature/src/main/js/subfeature/src/main/ets/pages/test';
    expect(ohmUrl_1 == expected_1).to.be.true;
    expect(ohmUrl_2 == expected_2).to.be.true;
  });

  mocha.it('system builtins & app builtins', function () {
    mainProjectConfig.bundleName = 'UtTestApplication';
    mainProjectConfig.moduleName = 'entry';
    const systemModuleRequest: string = '@system.app';
    const ohosModuleRequest: string = '@ohos.hilog';
    const appSoModuleRequest: string = 'libapplication.so';
    const systemOhmUrl: string = getOhmUrlBySystemApiOrLibRequest(systemModuleRequest);
    const ohosOhmUrl: string = getOhmUrlBySystemApiOrLibRequest(ohosModuleRequest);
    const appOhmUrl: string = getOhmUrlBySystemApiOrLibRequest(appSoModuleRequest);
    const expectedSystemOhmUrl: string = '@native:system.app';
    const expectedOhosOhmUrl: string = '@ohos:hilog';
    const expectedappOhmUrl: string = '@app:UtTestApplication/entry/application';
    expect(systemOhmUrl == expectedSystemOhmUrl).to.be.true;
    expect(ohosOhmUrl == expectedOhosOhmUrl).to.be.true;
    expect(appOhmUrl == expectedappOhmUrl).to.be.true;
  });

  mocha.it('shared library', function () {
    const sharedLibraryPackageName: string = "@ohos/sharedLibrary";
    const sharedLibraryPage: string = "@ohos/sharedLibrary/src/main/ets/pages/page1";
    const errorSharedLibrary: string = "@ohos/staticLibrary";
    const sharedLibraryPackageNameOhmUrl: string = getOhmUrlByHspName(sharedLibraryPackageName, projectConfig);
    const sharedLibraryPageOhmUrl: string = getOhmUrlByHspName(sharedLibraryPage, projectConfig);
    const errorSharedLibraryOhmUrl = getOhmUrlByHspName(errorSharedLibrary, projectConfig);
    const expectedSharedLibraryOhmUrl: string = "@bundle:UtTestApplication/sharedLibrary/ets/index";
    const expectedSharedLibraryPageOhmUrl: string = "@bundle:UtTestApplication/sharedLibrary/ets/pages/page1";
    const expectedErrorSharedLibraryOhmUrl = undefined;
    expect(sharedLibraryPackageNameOhmUrl == expectedSharedLibraryOhmUrl).to.be.true;
    expect(sharedLibraryPageOhmUrl == expectedSharedLibraryPageOhmUrl).to.be.true;
    expect(errorSharedLibraryOhmUrl == expectedErrorSharedLibraryOhmUrl).to.be.true;
  });

  mocha.it('project module', function () {
    const filePath = `${projectConfig.projectRootPath}/entry/src/main/ets/pages/test.ts`;
    const harFilePath = `${projectConfig.projectRootPath}/library/src/main/ets/pages/test.ts`;
    const moduleName = 'entry';
    const moduleNamespace = 'library';
    const ohmUrl = getOhmUrlByFilepath(filePath, projectConfig, undefined, moduleName);
    const harOhmUrl = getOhmUrlByFilepath(harFilePath, projectConfig, undefined, moduleNamespace);
    const expected = 'UtTestApplication/entry/ets/pages/test';
    const harOhmUrlExpected = 'UtTestApplication/entry@library/ets/pages/test';
    expect(ohmUrl == expected).to.be.true;
    expect(harOhmUrl == harOhmUrlExpected).to.be.true;
  });

  mocha.it('thirdParty module', function () {
    const moduleLevelPkgPath = `${projectConfig.projectRootPath}/entry/oh_modules/json5/dist/index.js`;
    const projectLevelPkgPath = `${projectConfig.projectRootPath}/oh_modules/json5/dist/index.js`;
    const moduleName = 'entry';
    const moduleLevelPkgOhmUrl = getOhmUrlByFilepath(moduleLevelPkgPath, projectConfig, undefined, undefined);
    const projectLevelPkgOhmUrl = getOhmUrlByFilepath(projectLevelPkgPath, projectConfig, undefined, undefined);
    const moduleLevelPkgOhmUrlExpected = `${PACKAGES}@${moduleName}/json5/dist/index`;
    const projectLevelPkgOhmUrlExpected = `${PACKAGES}/json5/dist/index`;
    expect(moduleLevelPkgOhmUrl == moduleLevelPkgOhmUrlExpected).to.be.true;
    expect(projectLevelPkgOhmUrl == projectLevelPkgOhmUrlExpected).to.be.true;
  });

  mocha.it('static library entry', function () {
    const staticLibraryEntry = `${projectConfig.projectRootPath}/library/index.ets`;
    const moduleNamespace = 'library';
    const staticLibraryEntryOhmUrl =
      getOhmUrlByFilepath(staticLibraryEntry, projectConfig, undefined, moduleNamespace);
    const staticLibraryEntryOhmUrlExpected = 'UtTestApplication/entry@library/index';
    expect(staticLibraryEntryOhmUrl == staticLibraryEntryOhmUrlExpected).to.be.true;
  });

  mocha.it('ohosTest module', function () {
    const ohosTestfilePath = `${projectConfig.projectRootPath}/entry/src/ohosTest/ets/pages/test.ts`;
    const moduleName = 'entry';
    const ohmUrl = getOhmUrlByFilepath(ohosTestfilePath, projectConfig, undefined, moduleName);
    const expected = 'UtTestApplication/entry/ets/pages/test';
    expect(ohmUrl == expected).to.be.true;
  });

  mocha.it('the error message of processPackageDir', function () {
    this.rollup.build();
    projectConfig.modulePathMap = {};
    const red: string = '\u001b[31m';
    const reset: string = '\u001b[39m';
    const filePath = `${projectConfig.projectRootPath}/entry/oh_modules/json5/dist/index.js`;
    const moduleName = 'entry';
    const importerFile = 'importTest.ts';
    const logger = this.rollup.share.getLogger(GEN_ABC_PLUGIN_NAME)
    const loggerStub = sinon.stub(logger, 'error');
    getOhmUrlByFilepath(filePath, projectConfig, logger, moduleName, importerFile);
    expect(loggerStub.calledWith(red,
      `ArkTS:ERROR Failed to get a resolved OhmUrl for "${filePath}" imported by "${importerFile}". ` +
    `Please check whether the module which ${filePath} belongs to is correctly configured` +
    `and the corresponding file name matches (case sensitive)`, reset)).to.be.true;
    loggerStub.restore();
  });

  mocha.it('the error message of processPackageDir(packageDir is invalid value)', function () {
    this.rollup.build();
    projectConfig.packageDir = undefined;
    projectConfig.modulePathMap = {};
    const red: string = '\u001b[31m';
    const reset: string = '\u001b[39m';
    const filePath = `${projectConfig.projectRootPath}/entry/oh_modules/json5/dist/index.js`;
    const moduleName = 'entry';
    const importerFile = 'importTest.ts';
    const logger = this.rollup.share.getLogger(GEN_ABC_PLUGIN_NAME)
    const loggerStub = sinon.stub(logger, 'error');
    getOhmUrlByFilepath(filePath, projectConfig, logger, moduleName, importerFile);
    expect(loggerStub.calledWith(red,
      `ArkTS:ERROR Failed to get a resolved OhmUrl for "${filePath}" imported by "${importerFile}". ` +
      `Please check whether the module which ${filePath} belongs to is correctly configured` +
      `and the corresponding file name matches (case sensitive)`, reset)).to.be.true;
    loggerStub.restore();
  });

  mocha.it('inter-app hsp self import', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'pkghsp': {
        'packageName': 'pkghsp',
        'bundleName': 'com.test.testHsp',
        'moduleName': '',
        'version': '',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    }
    const filePath = '/testHsp/hsp/src/main/ets/utils/Calc.ets';
    const moduleInfo = {
      id: filePath,
      meta: {
        pkgName: 'pkghsp',
        pkgPath: '/testHsp/hsp'
      }
    }
    this.rollup.moduleInfos.push(moduleInfo);
    const importerFile = '/testHsp/hsp/src/main/ets/pages/Index.ets'
    const relativePath = '../utils/Calc';
    const etsBasedAbsolutePath = 'ets/utils/Calc';
    const standardImportPath = 'pkghsp/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const relativePathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, relativePath, filePath, importerFile);
    const etsBasedAbsolutePathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, etsBasedAbsolutePath, filePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const expectedNormalizedOhmUrl = '@normalized:N&&com.test.testHsp&pkghsp/src/main/ets/utils/Calc&';
    expect(relativePathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
    expect(etsBasedAbsolutePathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
  });

  mocha.it('inter-app hsp others import', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'pkghsp': {
        'packageName': 'pkghsp',
        'bundleName': 'com.test.testHsp',
        'moduleName': 'hsp',
        'version': '',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    }
    this.rollup.share.projectConfig.harNameOhmMap ={
      'pkghsp': '@bundle:com.test.testHsp/src/main/ets/utils/Calc'
    }
    const filePath = 'pkghsp/src/main/ets/utils/Calc';
    const indexFilePath = 'pkghsp';
    const importerFile = '/testHap/entry/src/main/ets/pages/index.ets'
    const importByPkgName = 'pkghsp';
    const standardImportPath = 'pkghsp/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const importByPkgNameOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, importByPkgName, indexFilePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const importByPkgNameNormalizedOhmUrl = '@normalized:N&hsp&com.test.testHsp&pkghsp/Index&';
    const standardImportPathNormalizedOhmUrl = '@normalized:N&hsp&com.test.testHsp&pkghsp/src/main/ets/utils/Calc&';
    expect(importByPkgNameOhmUrl == importByPkgNameNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == standardImportPathNormalizedOhmUrl).to.be.true;
  });

  mocha.it('in-app hsp self import', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'pkghsp': {
        'packageName': 'pkghsp',
        'bundleName': '',
        'moduleName': '',
        'version': '',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    }
    const filePath = '/testHsp/hsp/src/main/ets/utils/Calc.ets';
    const moduleInfo = {
      id: filePath,
      meta: {
        pkgName: 'pkghsp',
        pkgPath: '/testHsp/hsp'
      }
    }
    this.rollup.moduleInfos.push(moduleInfo);
    const importerFile = '/testHsp/hsp/src/main/ets/pages/Index.ets'
    const relativePath = '../utils/Calc';
    const etsBasedAbsolutePath = 'ets/utils/Calc';
    const standardImportPath = 'pkghsp/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const relativePathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, relativePath, filePath, importerFile);
    const etsBasedAbsolutePathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, etsBasedAbsolutePath, filePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const expectedNormalizedOhmUrl = '@normalized:N&&&pkghsp/src/main/ets/utils/Calc&';
    expect(relativePathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
    expect(etsBasedAbsolutePathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
  });

  mocha.it('in-app hsp others import', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'pkghsp': {
        'packageName': 'pkghsp',
        'bundleName': '',
        'moduleName': 'hsp',
        'version': '',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    }
    this.rollup.share.projectConfig.harNameOhmMap ={
      'pkghsp': '@bundle:com.test.testHap/src/main/ets/utils/Calc'
    }
    const filePath = 'pkghsp/src/main/ets/utils/Calc';
    const indexFilePath = 'pkghsp';

    const importerFile = '/testHap/entry/src/main/ets/pages/index.ets'
    const importByPkgName = 'pkghsp';
    const standardImportPath = 'pkghsp/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const importByPkgNameOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, importByPkgName, indexFilePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const importByPkgNameNormalizedOhmUrl = '@normalized:N&hsp&&pkghsp/Index&';
    const standardImportPathNormalizedOhmUrl = '@normalized:N&hsp&&pkghsp/src/main/ets/utils/Calc&';
    expect(importByPkgNameOhmUrl == importByPkgNameNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == standardImportPathNormalizedOhmUrl).to.be.true;
  });

  mocha.it('hap self import', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'entry': {
        'packageName': 'entry',
        'bundleName': '',
        'moduleName': '',
        'version': '',
        'entryPath': '',
        'isSO': false
      }
    }
    const filePath = '/testHap/entry/src/main/ets/utils/Calc.ets';
    const moduleInfo = {
      id: filePath,
      meta: {
        pkgName: 'entry',
        pkgPath: '/testHap/entry'
      }
    }
    this.rollup.moduleInfos.push(moduleInfo);
    const importerFile = '/testHap/entry/src/main/ets/pages/index.ets'
    const relativePath = '../utils/Calc';
    const etsBasedAbsolutePath = 'ets/utils/Calc';
    const standardImportPath = 'entry/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const relativePathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, relativePath, filePath, importerFile);
    const etsBasedAbsolutePathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, etsBasedAbsolutePath, filePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const expectedNormalizedOhmUrl = '@normalized:N&&&entry/src/main/ets/utils/Calc&';
    expect(relativePathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
    expect(etsBasedAbsolutePathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
  });

  mocha.it('source code har self import (hap/in-app hsp)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'pkghar': {
        'packageName': 'pkghar',
        'bundleName': '',
        'moduleName': '',
        'version': '1.0.1',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    }
    const filePath = '/testHar/har/src/main/ets/utils/Calc.ets';
    const moduleInfo = {
      id: filePath,
      meta: {
        pkgName: 'pkghar',
        pkgPath: '/testHar/har'
      }
    }
    this.rollup.moduleInfos.push(moduleInfo);
    const importerFile = '/testHar/har/src/main/ets/pages/Index.ets'
    const relativePath = '../utils/Calc';
    const etsBasedAbsolutePath = 'ets/utils/Calc';
    const standardImportPath = 'pkghar/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup); 
    const relativePathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, relativePath, filePath, importerFile);
    const etsBasedAbsolutePathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, etsBasedAbsolutePath, filePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const expectedNormalizedOhmUrl = '@normalized:N&&&pkghar/src/main/ets/utils/Calc&1.0.1';
    expect(relativePathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
    expect(etsBasedAbsolutePathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
  });

  mocha.it('source code har others import (hap/in-app hsp)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'pkghar': {
        'packageName': 'pkghar',
        'bundleName': '',
        'moduleName': '',
        'version': '1.0.1',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    }
    const filePath = '/testHar/har/src/main/ets/utils/Calc.ets';
    const indexFilePath = '/testHar/har/Index.ets';
    for (let file of [filePath, indexFilePath]) {
      const moduleInfo = {
        id: file,
        meta: {
          pkgName: 'pkghar',
          pkgPath: '/testHar/har'
        }
      }
      this.rollup.moduleInfos.push(moduleInfo);
    }
    const importerFile = '/testHar/entry/src/main/ets/pages/Index.ets'
    const importByPkgName = 'pkghar';
    const standardImportPath = 'pkghar/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const importByPkgNameOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, importByPkgName, indexFilePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const importByPkgNameNormalizedOhmUrl = '@normalized:N&&&pkghar/Index&1.0.1';
    const standardImportPathNormalizedOhmUrl = '@normalized:N&&&pkghar/src/main/ets/utils/Calc&1.0.1';
    expect(importByPkgNameOhmUrl == importByPkgNameNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == standardImportPathNormalizedOhmUrl).to.be.true;
  });

  mocha.it('source code har self import (inter-app hsp)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'pkghar': {
        'packageName': 'pkghar',
        'bundleName': 'com.test.testHsp',
        'moduleName': '',
        'version': '1.0.1',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    }
    const filePath = '/testHsp/har/src/main/ets/utils/Calc.ets';
    const moduleInfo = {
      id: filePath,
      meta: {
        pkgName: 'pkghar',
        pkgPath: '/testHsp/har'
      }
    }
    this.rollup.moduleInfos.push(moduleInfo);
    const importerFile = '/testHsp/har/src/main/ets/pages/Index.ets'
    const relativePath = '../utils/Calc';
    const etsBasedAbsolutePath = 'ets/utils/Calc';
    const standardImportPath = 'pkghar/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup); 
    const relativePathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, relativePath, filePath, importerFile);
    const etsBasedAbsolutePathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, etsBasedAbsolutePath, filePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const expectedNormalizedOhmUrl = '@normalized:N&&com.test.testHsp&pkghar/src/main/ets/utils/Calc&1.0.1';
    expect(relativePathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
    expect(etsBasedAbsolutePathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
  });

  mocha.it('source code har others import (inter-app hsp)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'pkghar': {
        'packageName': 'pkghar',
        'bundleName': 'com.test.testHsp',
        'moduleName': '',
        'version': '1.0.1',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    }
    const filePath = '/testHsp/har/src/main/ets/utils/Calc.ets';
    const indexFilePath = '/testHsp/har/Index.ets';
    for (let file of [filePath, indexFilePath]) {
      const moduleInfo = {
        id: file,
        meta: {
          pkgName: 'pkghar',
          pkgPath: '/testHsp/har'
        }
      }
      this.rollup.moduleInfos.push(moduleInfo);
    }
    const importerFile = '/testHsp/hsp/src/main/ets/pages/Index.ets'
    const importByPkgName = 'pkghar';
    const standardImportPath = 'pkghar/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const importByPkgNameOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, importByPkgName, indexFilePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const importByPkgNameNormalizedOhmUrl = '@normalized:N&&com.test.testHsp&pkghar/Index&1.0.1';
    const standardImportPathNormalizedOhmUrl = '@normalized:N&&com.test.testHsp&pkghar/src/main/ets/utils/Calc&1.0.1';
    expect(importByPkgNameOhmUrl == importByPkgNameNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == standardImportPathNormalizedOhmUrl).to.be.true;
  });

  mocha.it('product har self import (hap/in-app hsp)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'pkghar': {
        'packageName': 'pkghar',
        'bundleName': '',
        'moduleName': '',
        'version': '1.0.1',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    }
    const filePath = '/testHar/har/src/main/ets/utils/Calc.ets';
    const moduleInfo = {
      id: filePath,
      meta: {
        pkgName: 'pkghar',
        pkgPath: '/testHar/har'
      }
    }
    this.rollup.moduleInfos.push(moduleInfo);
    const importerFile = '/testHar/har/src/main/ets/pages/Index.ets'
    const relativePath = '../utils/Calc';
    const etsBasedAbsolutePath = 'ets/utils/Calc';
    const standardImportPath = 'pkghar/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup); 
    const relativePathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, relativePath, filePath, importerFile);
    const etsBasedAbsolutePathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, etsBasedAbsolutePath, filePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const expectedNormalizedOhmUrl = '@normalized:N&&&pkghar/src/main/ets/utils/Calc&1.0.1';
    expect(relativePathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
    expect(etsBasedAbsolutePathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
  });

  mocha.it('product har others import (hap/in-app hsp)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'pkghar': {
        'packageName': 'pkghar',
        'bundleName': '',
        'moduleName': '',
        'version': '1.0.1',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    }
    const filePath = '/testHap/oh_modules/.ohpm/pkghar@test=/oh_modules/pkghar/src/main/ets/utils/Calc.ets';
    const indexFilePath = '/testHap/oh_modules/.ohpm/pkghar@test=/oh_modules/pkghar/Index.ets';
    for (let file of [filePath, indexFilePath]) {
      const moduleInfo = {
        id: file,
        meta: {
          pkgName: 'pkghar',
          pkgPath: '/testHap/oh_modules/.ohpm/pkghar@test=/oh_modules/pkghar'
        }
      }
      this.rollup.moduleInfos.push(moduleInfo);
    }
    const importerFile = '/testHar/entry/src/main/ets/pages/index.ets'
    const importByPkgName = 'pkghar';
    const standardImportPath = 'pkghar/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const importByPkgNameOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, importByPkgName, indexFilePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const importByPkgNameNormalizedOhmUrl = '@normalized:N&&&pkghar/Index&1.0.1';
    const standardImportPathNormalizedOhmUrl = '@normalized:N&&&pkghar/src/main/ets/utils/Calc&1.0.1';
    expect(importByPkgNameOhmUrl == importByPkgNameNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == standardImportPathNormalizedOhmUrl).to.be.true;
  });

  mocha.it('remote source code har self import (inter-app hsp)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'pkghar': {
        'packageName': 'pkghar',
        'bundleName': 'com.test.testHsp',
        'moduleName': '',
        'version': '1.0.1',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    }
    const filePath = '/testHsp/har/src/main/ets/utils/Calc.ets';
    const moduleInfo = {
      id: filePath,
      meta: {
        pkgName: 'pkghar',
        pkgPath: '/testHsp/har'
      }
    }
    this.rollup.moduleInfos.push(moduleInfo);
    const importerFile = '/testHsp/har/src/main/ets/pages/Index.ets'
    const relativePath = '../utils/Calc';
    const etsBasedAbsolutePath = 'ets/utils/Calc';
    const standardImportPath = 'pkghar/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup); 
    const relativePathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, relativePath, filePath, importerFile);
    const etsBasedAbsolutePathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, etsBasedAbsolutePath, filePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const expectedNormalizedOhmUrl = '@normalized:N&&com.test.testHsp&pkghar/src/main/ets/utils/Calc&1.0.1';
    expect(relativePathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
    expect(etsBasedAbsolutePathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == expectedNormalizedOhmUrl).to.be.true;
  });

  mocha.it('remote source code har others import (inter-app hsp)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'pkghar': {
        'packageName': 'pkghar',
        'bundleName': 'com.test.testHsp',
        'moduleName': '',
        'version': '1.0.1',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    }
    const filePath = '/testHsp/har/src/main/ets/utils/Calc.ets';
    const indexFilePath = '/testHsp/har/Index.ets';
    for (let file of [filePath, indexFilePath]) {
      const moduleInfo = {
        id: file,
        meta: {
          pkgName: 'pkghar',
          pkgPath: '/testHsp/har'
        }
      }
      this.rollup.moduleInfos.push(moduleInfo);
    }
    const importerFile = '/testHsp/hsp/src/main/ets/pages/Index.ets'
    const importByPkgName = 'pkghar';
    const standardImportPath = 'pkghar/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const importByPkgNameOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, importByPkgName, indexFilePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const importByPkgNameNormalizedOhmUrl = '@normalized:N&&com.test.testHsp&pkghar/Index&1.0.1';
    const standardImportPathNormalizedOhmUrl = '@normalized:N&&com.test.testHsp&pkghar/src/main/ets/utils/Calc&1.0.1';
    expect(importByPkgNameOhmUrl == importByPkgNameNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == standardImportPathNormalizedOhmUrl).to.be.true;
  });

  mocha.it('native so others import (hap/in-app hsp)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'libproduct.so': {
        'packageName': 'libproduct.so',
        'bundleName': '',
        'moduleName': '',
        'version': '',
        'entryPath': '',
        'isSO': true
      }
    }
    const importerFile = '/testHap/hsp/src/main/ets/pages/Index.ets'
    const moduleRequest = 'libproduct.so';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const moduleRequestOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, moduleRequest, undefined, importerFile);
    const expectedNormalizedOhmUrl = '@normalized:Y&&&libproduct.so&';
    expect(moduleRequestOhmUrl == expectedNormalizedOhmUrl).to.be.true;
  });

  mocha.it('native so others import (inter-app hsp)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'libproduct.so': {
        'packageName': 'libproduct.so',
        'bundleName': 'com.test.testHsp',
        'moduleName': '',
        'version': '',
        'entryPath': '',
        'isSO': true
      }
    }
    const importerFile = '/testHsp/hsp/src/main/ets/pages/Index.ets'
    const moduleRequest = 'libproduct.so';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const moduleRequestOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, moduleRequest, undefined, importerFile);
    const expectedNormalizedOhmUrl = '@normalized:Y&&com.test.testHsp&libproduct.so&';
    expect(moduleRequestOhmUrl == expectedNormalizedOhmUrl).to.be.true;
  });

  mocha.it('native so others import (source code har)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'libhar.so': {
        'packageName': 'libhar.so',
        'bundleName': '',
        'moduleName': '',
        'version': '',
        'entryPath': '',
        'isSO': true
      }
    }
    const importerFile = '/testHap/har/src/main/ets/pages/Index.ets'
    const moduleRequest = 'libhar.so';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const moduleRequestOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, moduleRequest, undefined, importerFile);
    const expectedNormalizedOhmUrl = '@normalized:Y&&&libhar.so&';
    expect(moduleRequestOhmUrl == expectedNormalizedOhmUrl).to.be.true;
  });

  mocha.it('native so others import (product har)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'libhar.so': {
        'packageName': 'libhar.so',
        'bundleName': '',
        'moduleName': '',
        'version': '',
        'entryPath': '',
        'isSO': true
      }
    }
    const importerFile = '/testHap/oh_modules/.ohpm/pkghar@test+har=/oh_modules/pkghar/src/main/ets/pages/Index.ets';
    const moduleRequest = 'libhar.so';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const moduleRequestOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, moduleRequest, undefined, importerFile);
    const expectedNormalizedOhmUrl = '@normalized:Y&&&libhar.so&';
    expect(moduleRequestOhmUrl == expectedNormalizedOhmUrl).to.be.true;
  });

  mocha.it('ohpm package others import (hap/in-app hsp)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      '@ohos/Test': {
        'packageName': '@ohos/Test',
        'bundleName': '',
        'moduleName': '',
        'version': '2.3.1',
        'entryPath': 'index.ets',
        'isSO': false
      }
    }
    const filePath = '/testHap/oh_modules/.ohpm/@ohos+test@2.3.1/oh_modules/@ohos/test/src/main/ets/utils/Calc.ets'
    const indexFilePath = '/testHap/oh_modules/.ohpm/@ohos+test@2.3.1/oh_modules/@ohos/test/index.ets';
    for (let file of [filePath, indexFilePath]) {
      const moduleInfo = {
        id: file,
        meta: {
          pkgName: '@ohos/Test',
          pkgPath: '/testHap/oh_modules/.ohpm/@ohos+test@2.3.1/oh_modules/@ohos/test'
        }
      }
      this.rollup.moduleInfos.push(moduleInfo);
    }
    const importerFile = '/testHap/entry/src/main/ets/pages/index.ets'
    const importByPkgName = '@ohos/Test';
    const standardImportPath = '@ohos/Test/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const importByPkgNameOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, importByPkgName, indexFilePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const importByPkgNameNormalizedOhmUrl = '@normalized:N&&&@ohos/Test/index&2.3.1';
    const standardImportPathNormalizedOhmUrl = '@normalized:N&&&@ohos/Test/src/main/ets/utils/Calc&2.3.1';
    expect(importByPkgNameOhmUrl == importByPkgNameNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == standardImportPathNormalizedOhmUrl).to.be.true;
  });

  mocha.it('ohpm package others import (inter-app hsp)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      '@ohos/Test': {
        'packageName': '@ohos/Test',
        'bundleName': 'com.test.testHsp',
        'moduleName': '',
        'version': '2.3.1',
        'entryPath': 'index.ets',
        'isSO': false
      }
    }
    const filePath = '/testHsp/oh_modules/.ohpm/@ohos+test@2.3.1/oh_modules/@ohos/test/src/main/ets/utils/Calc.ets'
    const indexFilePath = '/testHsp/oh_modules/.ohpm/@ohos+test@2.3.1/oh_modules/@ohos/test/index.ets';
    for (let file of [filePath, indexFilePath]) {
      const moduleInfo = {
        id: file,
        meta: {
          pkgName: '@ohos/Test',
          pkgPath: '/testHsp/oh_modules/.ohpm/@ohos+test@2.3.1/oh_modules/@ohos/test'
        }
      }
      this.rollup.moduleInfos.push(moduleInfo);
    }
    const importerFile = '/testHsp/entry/src/main/ets/pages/index.ets'
    const importByPkgName = '@ohos/Test';
    const standardImportPath = '@ohos/Test/src/main/ets/utils/Calc';
    const moduleSourceFile = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const importByPkgNameOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, importByPkgName, indexFilePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath, importerFile);
    const importByPkgNameNormalizedOhmUrl = '@normalized:N&&com.test.testHsp&@ohos/Test/index&2.3.1';
    const standardImportPathNormalizedOhmUrl = '@normalized:N&&com.test.testHsp&@ohos/Test/src/main/ets/utils/Calc&2.3.1';
    expect(importByPkgNameOhmUrl == importByPkgNameNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == standardImportPathNormalizedOhmUrl).to.be.true;
  });
});