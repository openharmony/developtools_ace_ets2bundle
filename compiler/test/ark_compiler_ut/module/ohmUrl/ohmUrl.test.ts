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

import { getOhmUrlByFilepath, getOhmUrlBySystemApiOrLibRequest, getOhmUrlByHarName } from '../../../../lib/ark_utils';
import { PACKAGES } from '../../../../lib/pre_define';
import projectConfig from '../../utils/processProjectConfig';
import { projectConfig as mainProjectConfig } from '../../../../main';
import RollUpPluginMock from '../../mock/rollup_mock/rollup_plugin_mock';
import { GEN_ABC_PLUGIN_NAME } from '../../../../lib/fast_build/ark_compiler/common/ark_define';

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
    const sharedLibraryPackageNameOhmUrl: string = getOhmUrlByHarName(sharedLibraryPackageName, projectConfig);
    const sharedLibraryPageOhmUrl: string = getOhmUrlByHarName(sharedLibraryPage, projectConfig);
    const errorSharedLibraryOhmUrl = getOhmUrlByHarName(errorSharedLibrary, projectConfig);
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
});